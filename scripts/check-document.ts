/**
 * Document-viewer contract.
 *
 *   bun run check:document
 *
 * The pure half of DocumentViewer: what kind of thing a `src` is, and the zoom
 * and rotation arithmetic. It lives in core so all four renderers agree, and it
 * is worth pinning because every one of these has a plausible wrong answer.
 *
 * The URL cases are the ones that bite. A scanned invoice arrives as a signed
 * URL — `.../invoice.pdf?X-Amz-Signature=…` — and an extension check that
 * forgets to strip the query sees ".pdf?x-amz-signature=…" and falls through to
 * the image branch, which renders a broken <img> for every document in the app.
 * A `blob:` URL has no extension at all, which is why an explicit type has to
 * win over anything inferred.
 */
import {
  inferDocumentKind,
  clampZoom,
  zoomStep,
  normalizeRotation,
  fitScale,
  DOCUMENT_ZOOM_MIN,
  DOCUMENT_ZOOM_MAX,
} from "../packages/core/src/document";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(56)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

console.log("\ninferDocumentKind — from an explicit MIME type");
t(inferDocumentKind("anything", "application/pdf"), "pdf", "explicit pdf");
t(inferDocumentKind("anything", "image/png"), "image", "explicit image/*");
t(inferDocumentKind("anything", "image/svg+xml"), "image", "svg is an image");
t(inferDocumentKind("doc.pdf", "image/png"), "image", "an explicit type BEATS the extension");
t(inferDocumentKind("anything", "text/plain"), "unknown", "a type we cannot render");
t(inferDocumentKind("anything", "APPLICATION/PDF"), "pdf", "MIME is case-insensitive");
t(
  inferDocumentKind("anything", "application/pdf; charset=binary"),
  "pdf",
  "a MIME with parameters still matches",
);

console.log("\ninferDocumentKind — from a URL, when no type was given");
t(inferDocumentKind("/files/invoice.pdf"), "pdf", "plain .pdf path");
t(inferDocumentKind("/files/scan.PNG"), "image", "extension is case-insensitive");
t(inferDocumentKind("https://x.test/a/b/c.jpeg"), "image", "absolute URL");
t(
  inferDocumentKind("https://s3.test/invoice.pdf?X-Amz-Signature=abc&e=1"),
  "pdf",
  "a signed URL's query is stripped",
);
t(inferDocumentKind("/doc.pdf#page=2"), "pdf", "a hash is stripped");
t(inferDocumentKind("/doc.pdf?v=1#page=2"), "pdf", "query AND hash");
t(inferDocumentKind("/archive.pdf.zip"), "unknown", "only the LAST extension counts");
t(inferDocumentKind("/no-extension"), "unknown", "no extension is unknown, not a guess");
t(inferDocumentKind("blob:http://x.test/9f2c-uuid"), "unknown", "a blob: URL carries no extension");
t(inferDocumentKind(""), "unknown", "empty src");

console.log("\ninferDocumentKind — data: URIs carry their own type");
t(inferDocumentKind("data:application/pdf;base64,JVBERi0="), "pdf", "data: pdf");
t(inferDocumentKind("data:image/png;base64,iVBOR"), "image", "data: image");
t(inferDocumentKind("data:text/csv,a,b"), "unknown", "data: something else");

console.log("\nclampZoom");
t(clampZoom(1), 1, "1 is the identity");
t(clampZoom(0.001), DOCUMENT_ZOOM_MIN, "clamps up to the floor");
t(clampZoom(99), DOCUMENT_ZOOM_MAX, "clamps down to the ceiling");
t(clampZoom(Number.NaN), 1, "NaN falls back to 1 rather than poisoning the transform");
t(clampZoom(Number.POSITIVE_INFINITY), DOCUMENT_ZOOM_MAX, "Infinity clamps");
t(clampZoom(-2), DOCUMENT_ZOOM_MIN, "a negative zoom is not a mirror");

console.log("\nzoomStep — the buttons");
t(zoomStep(1, 1), 1.25, "in from 1");
t(zoomStep(1, -1), 0.8, "out from 1 is the reciprocal, so in-then-out returns");
t(zoomStep(zoomStep(1, 1), -1), 1, "in then out round trips exactly");
t(zoomStep(DOCUMENT_ZOOM_MAX, 1), DOCUMENT_ZOOM_MAX, "cannot step past the ceiling");
t(zoomStep(DOCUMENT_ZOOM_MIN, -1), DOCUMENT_ZOOM_MIN, "cannot step past the floor");

console.log("\nnormalizeRotation — always one of four quarter turns");
t(normalizeRotation(0), 0, "0");
t(normalizeRotation(90), 90, "90");
t(normalizeRotation(360), 0, "a full turn is 0");
t(normalizeRotation(450), 90, "wraps past 360");
t(normalizeRotation(-90), 270, "negative wraps forward, never negative");
t(normalizeRotation(-450), 270, "large negative wraps");
t(normalizeRotation(45), 0, "a non-quarter angle snaps down, it does not tilt the page");
t(normalizeRotation(Number.NaN), 0, "NaN is 0");

console.log("\nfitScale");
t(fitScale({ width: 1000, height: 500 }, { width: 500, height: 500 }, "width"), 0.5, "fit width");
t(fitScale({ width: 1000, height: 500 }, { width: 500, height: 500 }, "contain"), 0.5, "contain uses the tighter axis");
t(fitScale({ width: 500, height: 1000 }, { width: 500, height: 500 }, "contain"), 0.5, "…on either axis");
t(fitScale({ width: 100, height: 100 }, { width: 500, height: 500 }, "contain"), 1, "never enlarges past 1:1 on fit");
t(fitScale({ width: 0, height: 0 }, { width: 500, height: 500 }, "contain"), 1, "an unmeasured page is 1, not Infinity");
t(fitScale({ width: 1000, height: 500 }, { width: 0, height: 0 }, "contain"), 1, "an unmeasured container is 1, not 0");
t(
  fitScale({ width: 1000, height: 500 }, { width: 500, height: 500 }, "contain", 90),
  0.5,
  "a quarter turn swaps the page's axes before fitting",
);

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
