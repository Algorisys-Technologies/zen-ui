import { DocumentViewer, type DocumentViewerProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-document-viewer src="/grn-2026-0431.png" name="grn-2026-0431.png">
 *
 * `src` takes a URL as an attribute; a Blob is a property (`el.src = blob`),
 * because a Blob has no string form that survives markup.
 *
 * PDFs additionally need `worker-src` — only the consumer's bundler knows where
 * its copy of pdf.js landed, so there is no default that could work:
 *
 *   <zen-document-viewer src="/invoice.pdf" worker-src="/assets/pdf.worker.min.mjs">
 *
 * `toolbar` and `reset-on-src-change` are json rather than boolean because both
 * default to TRUE; see the note in sortable-list.ts.
 *
 * No slot: the document comes from `src`.
 */
defineZenElement<DocumentViewerProps>({
  tag: "zen-document-viewer",
  factory: DocumentViewer,
  attrs: {
    src: "string",
    type: "string",
    name: "string",
    zoom: "number",
    "default-zoom": "number",
    "min-zoom": "number",
    "max-zoom": "number",
    "zoom-step": "number",
    page: "number",
    "default-page": "number",
    rotation: "number",
    "default-rotation": "number",
    fit: "string",
    height: "string",
    "worker-src": "string",
    "unsupported-message": "string",
    // Both default to TRUE — json, so absent means "unset" rather than false.
    toolbar: "json",
    "reset-on-src-change": "json",
  },
  props: ["src", "onZoomChange", "onPageChange", "onRotationChange", "onDownload", "unsupportedMessage"],
  events: {
    onZoomChange: "zen-zoom-change",
    onPageChange: "zen-page-change",
    onRotationChange: "zen-rotation-change",
    onDownload: "zen-download",
  },
  childrenProp: false,
});
