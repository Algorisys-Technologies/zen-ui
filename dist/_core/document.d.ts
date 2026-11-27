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
export declare const DOCUMENT_ZOOM_MIN = 0.25;
export declare const DOCUMENT_ZOOM_MAX = 8;
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
export declare const inferDocumentKind: (src: string, type?: string) => DocumentKind;
/**
 * Hold a zoom inside the supported range.
 *
 * `NaN` becomes 1 rather than clamping to an end: it means a measurement has
 * not arrived yet, and a NaN reaching a CSS transform silently blanks the
 * element instead of erroring.
 */
export declare const clampZoom: (zoom: number) => number;
/** One step of the zoom control. `direction` is `1` to zoom in, `-1` to zoom out. */
export declare const zoomStep: (zoom: number, direction: number) => number;
/** The four quarter turns. Anything else snaps DOWN to one — a tilted page is never what was meant. */
export declare const normalizeRotation: (degrees: number) => 0 | 90 | 180 | 270;
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
export declare const fitScale: (page: DocumentSize, container: DocumentSize, fit: DocumentFit, rotation?: number) => number;
