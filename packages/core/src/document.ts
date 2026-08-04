/**
 * Document-viewer maths — the pure half of DocumentViewer.
 *
 * What kind of thing a source is, and the zoom/rotation/fit arithmetic around
 * it. It lives in core so all four renderers agree; the behaviour is pinned by
 * scripts/check-document.ts.
 *
 * Everything here takes a STRING source. A `Blob` never reaches this file: the
 * component reads its `.type` and hands that over as the explicit type, which
 * keeps this module free of DOM types and testable in a plain Bun process.
 */

/** What the viewer knows how to draw. `unknown` gets the download fallback, not a guess. */
export type DocumentKind = "image" | "pdf" | "unknown";

export const DOCUMENT_ZOOM_MIN = 0.25;
export const DOCUMENT_ZOOM_MAX = 8;

/**
 * One press of the zoom buttons. Out is DIVISION by the same factor rather
 * than multiplication by 0.8, so in-then-out returns to exactly where it
 * started instead of drifting a little smaller on every round trip.
 */
const ZOOM_FACTOR = 1.25;

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "bmp",
  "svg",
  "tif",
  "tiff",
  "ico",
]);

/** `application/pdf; charset=binary` and `APPLICATION/PDF` are the same type. */
const kindFromMime = (mime: string): DocumentKind => {
  const type = mime.split(";")[0]!.trim().toLowerCase();
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("image/")) return "image";
  return "unknown";
};

/**
 * What to render for a source.
 *
 * An explicit `type` always wins. It is the only thing that works for a `blob:`
 * or object URL, which carries no extension at all, and it is what a server's
 * `Content-Type` gives you for a signed URL whose path is a UUID.
 *
 * Falling back to the extension means stripping the query and the hash FIRST.
 * A signed document URL ends `...invoice.pdf?X-Amz-Signature=…`, and an
 * extension check that skips that step reads the whole tail as the extension,
 * matches nothing, and quietly renders every document in the app as a broken
 * image.
 */
export const inferDocumentKind = (src: string, type?: string): DocumentKind => {
  if (type) return kindFromMime(type);
  if (!src) return "unknown";

  if (src.startsWith("data:")) {
    /* data:<mime>[;base64],<data> — the mime ends at whichever of ; or , comes first. */
    const header = src.slice(5);
    const end = Math.min(
      ...[header.indexOf(";"), header.indexOf(",")].filter((i) => i >= 0).concat(header.length),
    );
    return kindFromMime(header.slice(0, end));
  }

  const path = src.split("#")[0]!.split("?")[0]!;
  const file = path.slice(path.lastIndexOf("/") + 1);
  const dot = file.lastIndexOf(".");
  if (dot <= 0) return "unknown";

  const ext = file.slice(dot + 1).toLowerCase();
  if (ext === "pdf") return "pdf";
  return IMAGE_EXTENSIONS.has(ext) ? "image" : "unknown";
};

/**
 * Hold a zoom inside the supported range.
 *
 * `NaN` becomes 1 rather than clamping to an end: it means a measurement has
 * not arrived yet, and a NaN reaching a CSS transform silently blanks the
 * element instead of erroring.
 */
export const clampZoom = (zoom: number): number => {
  if (Number.isNaN(zoom)) return 1;
  return Math.min(DOCUMENT_ZOOM_MAX, Math.max(DOCUMENT_ZOOM_MIN, zoom));
};

/** One step of the zoom control. `direction` is `1` to zoom in, `-1` to zoom out. */
export const zoomStep = (zoom: number, direction: number): number => {
  const next = direction >= 0 ? zoom * ZOOM_FACTOR : zoom / ZOOM_FACTOR;
  /* Rounded so a long run of steps cannot accumulate float dust into the
     transform, and so the percentage a caller displays stays a whole number. */
  return clampZoom(Math.round(next * 1e4) / 1e4);
};

/** The four quarter turns. Anything else snaps DOWN to one — a tilted page is never what was meant. */
export const normalizeRotation = (degrees: number): 0 | 90 | 180 | 270 => {
  if (!Number.isFinite(degrees)) return 0;
  const quarters = Math.floor(degrees / 90) * 90;
  return (((quarters % 360) + 360) % 360) as 0 | 90 | 180 | 270;
};

export interface DocumentSize {
  width: number;
  height: number;
}

export type DocumentFit = "contain" | "width";

/**
 * The scale that fits a page inside its scroller.
 *
 * It never returns more than 1. Blowing a 200px scan up to fill a 1400px pane
 * shows the reader nothing but interpolation, and "fit" meaning "enlarge" is
 * the surprise that makes people reach for the zoom control immediately.
 *
 * An unmeasured page or container yields 1 rather than 0 or Infinity — both of
 * those reach a CSS transform and blank the element, which reads as a failed
 * load rather than a pending measurement.
 */
export const fitScale = (
  page: DocumentSize,
  container: DocumentSize,
  fit: DocumentFit,
  rotation = 0,
): number => {
  /* A quarter turn swaps which of the page's axes faces which of the
     container's, so the fit has to be computed against the rotated box. */
  const turned = normalizeRotation(rotation) % 180 !== 0;
  const w = turned ? page.height : page.width;
  const h = turned ? page.width : page.height;

  if (w <= 0 || h <= 0 || container.width <= 0 || container.height <= 0) return 1;

  const byWidth = container.width / w;
  const scale = fit === "width" ? byWidth : Math.min(byWidth, container.height / h);
  return Math.min(1, scale);
};
