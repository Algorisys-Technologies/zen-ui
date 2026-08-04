/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  inferDocumentKind,
  normalizeRotation,
  fitScale,
  DOCUMENT_ZOOM_MIN,
  DOCUMENT_ZOOM_MAX,
  type DocumentFit,
  type DocumentKind,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";

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

const PERCENT = (z: number) => `${Math.round(z * 100)}%`;

/* Local inline SVGs, as FileUpload already does: the shared Icon set is 16 names
   and none of these are in it. */
const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const MinusIcon = () => (
  <svg width="16" height="16" {...stroke}>
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" {...stroke}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const RotateIcon = () => (
  <svg width="16" height="16" {...stroke}>
    <polyline points="21 4 21 10 15 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L21 10" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="16" height="16" {...stroke}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const FileIcon = () => (
  <svg width="32" height="32" {...stroke} strokeWidth={1.5} className="zen-text-zen-muted-fg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const DocumentViewer = ({
  src: srcProp,
  type: typeProp,
  name,
  zoom: zoomProp,
  defaultZoom,
  onZoomChange,
  minZoom = DOCUMENT_ZOOM_MIN,
  maxZoom = DOCUMENT_ZOOM_MAX,
  zoomStep = 1.25,
  page: pageProp,
  defaultPage,
  onPageChange,
  rotation: rotationProp,
  defaultRotation,
  onRotationChange,
  resetOnSrcChange = true,
  fit = "contain",
  onDownload,
  toolbar = true,
  height = "32rem",
  workerSrc,
  unsupportedMessage,
  className,
}: DocumentViewerProps) => {
  const [zoomState, setZoomState] = React.useState(defaultZoom ?? 1);
  const [pageState, setPageState] = React.useState(Math.max(1, Math.floor(defaultPage ?? 1)));
  const [rotationState, setRotationState] = React.useState(defaultRotation ?? 0);
  const [pageCount, setPageCount] = React.useState(1);
  const [status, setStatus] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = React.useState("");
  const [naturalSize, setNaturalSize] = React.useState<{ width: number; height: number }>();

  const bound = (z: number) => (Number.isNaN(z) ? 1 : Math.min(maxZoom, Math.max(minZoom, z)));
  const zoom = bound(zoomProp ?? zoomState);
  const page = Math.max(1, Math.floor(pageProp ?? pageState));
  const rotation = normalizeRotation(rotationProp ?? rotationState);

  /* A Blob has to become a URL, and that URL has to be revoked or every document
     the user opens leaks its bytes for the life of the page. */
  const objectUrl = React.useMemo(
    () => (srcProp instanceof Blob ? URL.createObjectURL(srcProp) : ""),
    [srcProp],
  );
  React.useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  const src = srcProp instanceof Blob ? objectUrl : srcProp;
  const type = typeProp ?? (srcProp instanceof Blob ? srcProp.type : undefined);
  const kind = React.useMemo<DocumentKind>(() => inferDocumentKind(src, type), [src, type]);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const pdfRef = React.useRef<any>(null);
  const renderTask = React.useRef<any>(null);
  const renderChain = React.useRef<Promise<void>>(Promise.resolve());
  const renderQueued = React.useRef(false);
  /* Bumped on every load, and compared before anything is written to state or
     the canvas. Without it a slow first document finishes after a fast second
     one and paints over it. */
  const token = React.useRef(0);

  const setZoomTo = (next: number) => {
    const z = bound(next);
    setZoomState(z);
    onZoomChange?.(z);
  };
  const stepZoom = (dir: number) =>
    setZoomTo(Math.round((dir >= 0 ? zoom * zoomStep : zoom / zoomStep) * 1e4) / 1e4);
  const setPageTo = (next: number) => {
    const p = Math.min(pageCount, Math.max(1, next));
    setPageState(p);
    onPageChange?.(p);
  };
  const rotate = () => {
    const r = normalizeRotation(rotation + 90);
    setRotationState(r);
    onRotationChange?.(r);
  };

  const fitNow = () => {
    const box = scrollerRef.current;
    if (!box || !naturalSize) return;
    setZoomTo(
      fitScale(naturalSize, { width: box.clientWidth - 32, height: box.clientHeight - 32 }, fit, rotation),
    );
  };

  const drawPage = React.useCallback(async () => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    const mine = token.current;
    const pdfPage = await pdf.getPage(page);
    if (mine !== token.current) return;

    const viewport = pdfPage.getViewport({ scale: zoom, rotation });
    /* Render at device resolution and scale back with CSS, or a 2x display shows
       an interpolated blur of a document someone needs to READ. */
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * ratio);
    canvas.height = Math.floor(viewport.height * ratio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
    renderTask.current = task;
    try {
      await task.promise;
    } catch (e: any) {
      /* Cancelling is how the previous render is meant to end. */
      if (e?.name !== "RenderingCancelledException") throw e;
      return;
    } finally {
      if (renderTask.current === task) renderTask.current = null;
    }

    setNaturalSize((prev) => {
      if (prev) return prev;
      const base = pdfPage.getViewport({ scale: 1, rotation: 0 });
      return { width: base.width, height: base.height };
    });
  }, [page, zoom, rotation]);

  /*
   * One canvas takes one render() at a time — pdf.js throws rather than queueing,
   * and `cancel()` does NOT free it synchronously, so cancelling alone is not
   * enough: two calls can both pass the cancel while awaiting `getPage`.
   * Measured in the Solid binding: five collisions from six rapid zoom presses.
   * Renders are serialised and coalesced.
   */
  const renderPdfPage = React.useCallback(() => {
    if (renderQueued.current) return renderChain.current;
    renderQueued.current = true;
    renderTask.current?.cancel();
    renderChain.current = renderChain.current
      .catch(() => {})
      .then(() => {
        renderQueued.current = false;
        return drawPage();
      });
    return renderChain.current;
  }, [drawPage]);

  React.useEffect(() => {
    setNaturalSize(undefined);
    if (resetOnSrcChange) {
      if (zoomProp === undefined) setZoomState(defaultZoom ?? 1);
      if (pageProp === undefined) setPageState(1);
      if (rotationProp === undefined) setRotationState(defaultRotation ?? 0);
    }
    if (!src) return;

    if (kind !== "pdf") {
      token.current++;
      pdfRef.current = null;
      setPageCount(1);
      setStatus(kind === "image" ? "loading" : "error");
      setError("");
      return;
    }

    let cancelled = false;
    const load = async () => {
      const mine = ++token.current;
      setStatus("loading");
      let mod: any;
      try {
        mod = await import("pdfjs-dist");
      } catch {
        if (mine !== token.current || cancelled) return;
        setStatus("error");
        setError("This is a PDF, and pdfjs-dist is not installed. Add it to render PDFs.");
        return;
      }
      if (mine !== token.current || cancelled) return;

      const globals = mod.GlobalWorkerOptions;
      if (workerSrc && globals) globals.workerSrc = workerSrc;
      /* Caught here rather than left to pdf.js, whose own message names a global
         the caller of this component never set. */
      if (globals && !globals.workerSrc) {
        setStatus("error");
        setError(
          'PDFs need a pdf.js worker. Pass workerSrc — in Vite: import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url".',
        );
        return;
      }

      try {
        /* An object, not a bare string: pdf.js dropped the string overload. */
        pdfRef.current = await mod.getDocument({ url: src }).promise;
        if (mine !== token.current || cancelled) return;
        setPageCount(pdfRef.current.numPages);
        if (page > pdfRef.current.numPages) setPageTo(1);
        /* No explicit render here: setting "ready" is what the render effect
           waits on, and calling it as well put two render() calls on one canvas. */
        setStatus("ready");
      } catch (e) {
        if (mine !== token.current || cancelled) return;
        setStatus("error");
        setError(e instanceof Error ? e.message : "Could not open this PDF.");
      }
    };
    void load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, kind, workerSrc]);

  React.useEffect(() => {
    if (kind === "pdf" && status === "ready") void renderPdfPage();
  }, [kind, status, page, zoom, rotation, renderPdfPage]);

  const isPdf = kind === "pdf";

  return (
    <div
      className={cn(
        "zen-flex zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        className,
      )}
    >
      {toolbar && (
        <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-border-b zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1.5">
          {name && (
            <span className="zen-me-2 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
              {name}
            </span>
          )}
          <Button variant="ghost" size="sm" aria-label="Zoom out" disabled={zoom <= minZoom} onClick={() => stepZoom(-1)}>
            <MinusIcon />
          </Button>
          {/* A live region: the percentage is the only feedback a zoom press
              gives, and a sighted user gets it for free. */}
          <span aria-live="polite" className="zen-min-w-12 zen-text-center zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
            {PERCENT(zoom)}
          </span>
          <Button variant="ghost" size="sm" aria-label="Zoom in" disabled={zoom >= maxZoom} onClick={() => stepZoom(1)}>
            <PlusIcon />
          </Button>
          <Button variant="ghost" size="sm" onClick={fitNow}>
            Fit
          </Button>
          <Button variant="ghost" size="sm" aria-label="Rotate 90 degrees" onClick={rotate}>
            <RotateIcon />
          </Button>

          {isPdf && pageCount > 1 && (
            <>
              <span className="zen-mx-1 zen-h-4 zen-w-px zen-bg-zen-border" aria-hidden />
              <Button variant="ghost" size="sm" aria-label="Previous page" disabled={page <= 1} onClick={() => setPageTo(page - 1)}>
                <Icon name="chevron-left" size={16} className="rtl:zen-rotate-180" />
              </Button>
              <span className="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
                {page} / {pageCount}
              </span>
              <Button variant="ghost" size="sm" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPageTo(page + 1)}>
                <Icon name="chevron-right" size={16} className="rtl:zen-rotate-180" />
              </Button>
            </>
          )}

          {onDownload && (
            <>
              <span className="zen-ms-auto" />
              <Button variant="ghost" size="sm" aria-label="Download" onClick={() => onDownload(src, name)}>
                <DownloadIcon />
              </Button>
            </>
          )}
        </div>
      )}

      <div
        ref={scrollerRef}
        style={{ height }}
        className="zen-flex zen-w-full zen-justify-center zen-overflow-auto zen-bg-zen-muted zen-p-4"
      >
        {kind === "image" && (
          <img
            src={src}
            alt={name ?? "Document"}
            onLoad={(e) => {
              setNaturalSize({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              });
              setStatus("ready");
            }}
            onError={() => {
              setStatus("error");
              setError("Could not load this image.");
            }}
            /* Sized rather than transformed: a CSS scale() leaves the element's
               layout box at its old size, so the scroller never learns the
               content grew and zooming past the frame just clips. */
            style={{
              width: naturalSize ? `${naturalSize.width * zoom}px` : "auto",
              height: "auto",
              maxWidth: "none",
              transform: `rotate(${rotation}deg)`,
              alignSelf: "flex-start",
            }}
          />
        )}

        {kind === "pdf" && <canvas ref={canvasRef} className="zen-self-start zen-shadow-zen-sm" />}

        {kind === "unknown" && (
          <div className="zen-m-auto zen-flex zen-flex-col zen-items-center zen-gap-2 zen-text-center">
            <FileIcon />
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
              {unsupportedMessage ?? "No preview for this file type."}
            </p>
            {onDownload && (
              <Button variant="outline" size="sm" onClick={() => onDownload(src, name)}>
                Download
              </Button>
            )}
          </div>
        )}

        {status === "error" && error && (
          <p className="zen-m-auto zen-text-sm zen-text-zen-error">{error}</p>
        )}
      </div>
    </div>
  );
};
