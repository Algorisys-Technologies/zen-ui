import * as React from "react";
import { type DocumentFit, type DocumentKind } from "../../_core/index";
/**
 * DocumentViewer — show a scanned document.
 *
 *   <DocumentViewer src={signedUrl} name="invoice-8842.pdf" />
 *
 * The other half of FileUpload and Camera. Images render directly; PDFs render
 * through `pdfjs-dist`, an OPTIONAL peer dependency imported lazily, so an app
 * that only ever shows images never downloads it.
 *
 * It does NOT fetch. `src` is a URL you already have the right to read or a
 * `Blob` you already hold — no `method`, no headers, no retry policy, the same
 * rule UploadCollection follows. A signed URL works untouched.
 *
 * PDFs are rendered to a CANVAS rather than an `<iframe>`. An iframe hands the
 * browser's viewer a frame box and lets it lay out inside, so the page count is
 * unreadable, rotation is impossible, and zoom crops instead of magnifying
 * unless you inflate by 1/zoom and scale back — which behaves differently in
 * every engine.
 *
 * Zoom, page and rotation are controlled-or-uncontrolled per knob. The
 * controlled form is not decoration: a window-level `+`/`-`/`0` shortcut has no
 * way to drive an uncontrolled one.
 *
 * pdf.js needs a worker and will not start without one. Only your bundler knows
 * where its copy landed, so pass `workerSrc`; in Vite:
 *
 *   import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
 */
export type { DocumentKind, DocumentFit };
export interface DocumentViewerProps {
    src: string | Blob;
    /** MIME type. Inferred from a Blob's `.type` or the URL's extension when omitted. */
    type?: string;
    /** Shown in the toolbar and used as the download filename. */
    name?: string;
    /** Controlled zoom. */
    zoom?: number;
    defaultZoom?: number;
    onZoomChange?: (zoom: number) => void;
    minZoom?: number;
    maxZoom?: number;
    /** A multiplier per press, not an addend. Default 1.25. */
    zoomStep?: number;
    /** Controlled page, 1-based. Ignored for images. */
    page?: number;
    defaultPage?: number;
    onPageChange?: (page: number) => void;
    rotation?: number;
    defaultRotation?: number;
    onRotationChange?: (rotation: number) => void;
    /** Reset zoom, page and rotation when `src` changes. Default `true`. */
    resetOnSrcChange?: boolean;
    /** What the fit button computes. Default `"contain"`. */
    fit?: DocumentFit;
    /** Presence adds the download button — an absent control beats a dead one. */
    onDownload?: (src: string, name?: string) => void;
    toolbar?: boolean;
    /** CSS height for the scroller. Default `"32rem"`. */
    height?: string;
    workerSrc?: string;
    unsupportedMessage?: React.ReactNode;
    className?: string;
}
export declare const DocumentViewer: ({ src: srcProp, type: typeProp, name, zoom: zoomProp, defaultZoom, onZoomChange, minZoom, maxZoom, zoomStep, page: pageProp, defaultPage, onPageChange, rotation: rotationProp, defaultRotation, onRotationChange, resetOnSrcChange, fit, onDownload, toolbar, height, workerSrc, unsupportedMessage, className, }: DocumentViewerProps) => React.JSX.Element;
//# sourceMappingURL=document-viewer.d.ts.map