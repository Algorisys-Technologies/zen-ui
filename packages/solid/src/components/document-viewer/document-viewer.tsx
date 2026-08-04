/* eslint-disable @typescript-eslint/no-explicit-any */
import { Show, Switch, Match, createEffect, createMemo, createSignal, onCleanup, type JSX } from "solid-js";
import {
  inferDocumentKind,
  normalizeRotation,
  DOCUMENT_ZOOM_MIN,
  DOCUMENT_ZOOM_MAX,
  fitScale,
  type DocumentFit,
  type DocumentKind,
} from "@algorisys/zen-ui-core/document";
import { Icon } from "../icon/icon";
import { Button } from "../button/button";
import { cn } from "../../lib/cn";

/**
 * DocumentViewer — show a scanned document.
 *
 *   <DocumentViewer src={signedUrl} name="invoice-8842.pdf" />
 *
 * The other half of FileUpload and Camera: those get a document IN, this one
 * puts it on screen. Images render directly; PDFs render through `pdfjs-dist`,
 * an OPTIONAL peer dependency that is imported lazily, so an app that only ever
 * shows images never downloads it.
 *
 * It does NOT fetch. `src` is a URL you already have the right to read or a
 * `Blob` you already hold — there is no `method`, no headers, no retry policy,
 * for the same reason UploadCollection has none: a component that owned the
 * transport would have to guess at your auth refresh, and every real app would
 * then fight it. A signed URL is the normal case and it works untouched.
 *
 * PDFs are rendered to a CANVAS rather than dropped in an `<iframe>`. An iframe
 * hands the browser's own viewer a frame box and lets it lay out inside, which
 * means the page count is unreadable, rotation is impossible, and zoom crops
 * instead of magnifying unless you inflate the frame by 1/zoom and scale it
 * back — a workaround that behaves differently in all three engines. Rendering
 * the page ourselves makes zoom a render parameter and rotation a number.
 *
 * Zoom, page and rotation are controlled-or-uncontrolled, per knob. Leave them
 * alone and the component owns them; pass `zoom` and it does not. The
 * controlled form is not decoration: a window-level `+`/`-`/`0` shortcut —
 * which is a normal expectation of a document viewer, and a shipped feature in
 * the app this was built against — has no way to drive an uncontrolled one.
 */

export type { DocumentKind, DocumentFit };

/**
 * pdf.js needs a worker, and it will not start without one — since v4 an unset
 * `workerSrc` throws `No "GlobalWorkerOptions.workerSrc" specified` rather than
 * quietly falling back to the main thread. Only your bundler knows where its
 * copy landed, so the URL has to come from you. In a Vite app:
 *
 *   import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
 *   <DocumentViewer src={url} workerSrc={workerSrc} />
 *
 * If your app already sets `GlobalWorkerOptions.workerSrc` once at startup —
 * the other common arrangement — leave the prop off and that is used. This
 * component never writes the global unless you hand it a value, because a
 * library that clobbers `GlobalWorkerOptions` on import fights every other
 * pdf.js user in the page.
 *
 * Images need none of this. The worker is only touched when a PDF appears.
 */
export interface DocumentViewerProps {
  src: string | Blob;
  /** MIME type. Inferred from a Blob's `.type` or the URL's extension when omitted. */
  type?: string;
  /** Shown in the toolbar and used as the download filename. */
  name?: string;
  /**
   * Controlled zoom. Pass it and the component stops owning the value — which
   * is what lets an app drive zoom from outside the toolbar. A window-level
   * `+`/`-`/`0` shortcut is the case this exists for, and it is impossible
   * against an uncontrolled component.
   */
  zoom?: number;
  /** Starting zoom when uncontrolled. `1` is 1:1. */
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;
  /** Bounds and step for the zoom control. The buttons disable at the bounds. */
  minZoom?: number;
  maxZoom?: number;
  /** A multiplier per press, not an addend. Default 1.25. */
  zoomStep?: number;
  /** Controlled page, 1-based. Ignored for images. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Controlled rotation in degrees; snapped to a quarter turn. */
  rotation?: number;
  defaultRotation?: number;
  onRotationChange?: (rotation: number) => void;
  /**
   * Reset zoom, page and rotation whenever `src` changes. Default `true` —
   * switching documents in place while holding 400% zoom from the last one is
   * never what was meant.
   */
  resetOnSrcChange?: boolean;
  /** What the fit button computes. Default `"contain"`. */
  fit?: DocumentFit;
  /** Presence adds the download button — an absent control beats a dead one. */
  onDownload?: (src: string, name?: string) => void;
  /** Hide the toolbar for a thumbnail-sized preview. */
  toolbar?: boolean;
  /** CSS height for the scroller. Default `"32rem"`. */
  height?: string;
  /** See `workerSrc` on the interface docs above. */
  workerSrc?: string;
  /** Shown for a type neither branch can draw. */
  unsupportedMessage?: JSX.Element;
  class?: string;
}

const PERCENT = (z: number) => `${Math.round(z * 100)}%`;

/*
 * Local inline SVGs, as FileUpload and Banner already do: the shared Icon set
 * is 16 names and none of these five are in it. Each is a component rather than
 * a const, because in Solid a JSX const is one DOM node and a node lives in one
 * parent — a shared const silently renders in only the last place it is used.
 */
const stroke = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": 2,
  "stroke-linecap": "round" as const,
  "stroke-linejoin": "round" as const,
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
  <svg width="32" height="32" {...stroke} stroke-width="1.5" class="zen-text-zen-muted-fg">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

export const DocumentViewer = (props: DocumentViewerProps) => {
  /*
   * Controlled-or-uncontrolled, per knob. The internal signal is the fallback;
   * when the matching prop is supplied it wins and the setter only reports out.
   * Reading `props.zoom !== undefined` per access is what lets a caller start
   * uncontrolled and take over later without remounting.
   */
  const [zoomState, setZoomState] = createSignal(props.defaultZoom ?? 1);
  const [pageState, setPageState] = createSignal(Math.max(1, Math.floor(props.defaultPage ?? 1)));
  const [rotationState, setRotationState] = createSignal(props.defaultRotation ?? 0);

  const minZoom = () => props.minZoom ?? DOCUMENT_ZOOM_MIN;
  const maxZoom = () => props.maxZoom ?? DOCUMENT_ZOOM_MAX;
  const bound = (z: number) =>
    Number.isNaN(z) ? 1 : Math.min(maxZoom(), Math.max(minZoom(), z));

  const zoom = () => bound(props.zoom ?? zoomState());
  const page = () => Math.max(1, Math.floor(props.page ?? pageState()));
  const rotation = () => normalizeRotation(props.rotation ?? rotationState());

  const setZoom = (z: number) => setZoomState(z);
  const setPage = (p: number) => setPageState(p);
  const setRotation = (r: number) => setRotationState(r);
  const [pageCount, setPageCount] = createSignal(1);
  const [status, setStatus] = createSignal<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = createSignal<string>("");

  let scroller: HTMLDivElement | undefined;
  let canvas: HTMLCanvasElement | undefined;
  let pdf: any = null;
  let renderTask: any = null;
  let renderChain: Promise<void> = Promise.resolve();
  let renderQueued = false;
  /* Bumped on every load and every render, and compared before anything is
     written to state or to the canvas. Without it a slow first document
     finishes after a fast second one and paints over it. */
  let token = 0;

  /*
   * A Blob has to become a URL, and that URL has to be revoked or every
   * document the user opens leaks its bytes for the life of the page.
   */
  const objectUrl = createMemo<string>((prev) => {
    if (prev) URL.revokeObjectURL(prev);
    return props.src instanceof Blob ? URL.createObjectURL(props.src) : "";
  });
  onCleanup(() => {
    const url = objectUrl();
    if (url) URL.revokeObjectURL(url);
  });

  const src = () => (props.src instanceof Blob ? objectUrl() : props.src);
  const type = () => props.type ?? (props.src instanceof Blob ? props.src.type : undefined);
  const kind = createMemo<DocumentKind>(() => inferDocumentKind(src(), type()));

  const setZoomTo = (next: number) => {
    const z = bound(next);
    setZoom(z);
    props.onZoomChange?.(z);
  };

  /** One press of the zoom control, respecting a caller's bounds and step. */
  const stepZoom = (direction: number) => {
    const factor = props.zoomStep ?? 1.25;
    const raw = direction >= 0 ? zoom() * factor : zoom() / factor;
    setZoomTo(Math.round(raw * 1e4) / 1e4);
  };
  const setPageTo = (next: number) => {
    const p = Math.min(pageCount(), Math.max(1, next));
    setPage(p);
    props.onPageChange?.(p);
  };
  const rotate = () => {
    const r = normalizeRotation(rotation() + 90);
    setRotation(r);
    props.onRotationChange?.(r);
  };

  /** The document's own pixel size, once something has loaded enough to report it. */
  const [naturalSize, setNaturalSize] = createSignal<{ width: number; height: number } | undefined>();

  /** Fit needs a measured page and a measured scroller, so it runs on demand. */
  const fitNow = () => {
    if (!scroller) return;
    const box = { width: scroller.clientWidth - 32, height: scroller.clientHeight - 32 };
    const natural = naturalSize();
    if (!natural) return;
    setZoomTo(fitScale(natural, box, props.fit ?? "contain", rotation()));
  };

  /* ---- PDF ------------------------------------------------------------- */

  const loadPdf = async () => {
    const mine = ++token;
    setStatus("loading");
    let mod: any;
    try {
      mod = await import("pdfjs-dist");
    } catch {
      if (mine !== token) return;
      setStatus("error");
      setError("This is a PDF, and pdfjs-dist is not installed. Add it to render PDFs.");
      return;
    }
    if (mine !== token) return;

    const globals = mod.GlobalWorkerOptions;
    if (props.workerSrc && globals) globals.workerSrc = props.workerSrc;
    /* Caught here rather than left to pdf.js, whose own message names a global
       the caller of this component never set and gives no way to fix it. */
    if (globals && !globals.workerSrc) {
      setStatus("error");
      setError(
        'PDFs need a pdf.js worker. Pass workerSrc — in Vite: import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url".',
      );
      return;
    }

    try {
      /* An object, not a bare string: pdf.js dropped the string overload, and
         the error it throws instead names three parameters rather than saying
         the argument shape changed. */
      pdf = await mod.getDocument({ url: src() }).promise;
      if (mine !== token) return;
      setPageCount(pdf.numPages);
      /* A new document may be shorter than wherever the last one was left. */
      if (page() > pdf.numPages) setPageTo(1);
      /* No explicit render here: setting "ready" is what the render effect
         waits on, and calling it as well put two render() calls on one canvas,
         which pdf.js rejects outright. */
      setStatus("ready");
    } catch (e) {
      if (mine !== token) return;
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not open this PDF.");
    }
  };

  /*
   * One canvas takes one render() at a time — pdf.js throws rather than
   * queueing, and `cancel()` does NOT free the canvas synchronously, so
   * cancelling alone is not enough: two calls can both get past the cancel
   * while awaiting `getPage`, and both then try to draw. Measured, holding the
   * zoom button produced five such collisions.
   *
   * So renders are serialised through a promise chain, and coalesced: while one
   * is queued there is no point queueing another, because the queued one reads
   * the signals when it RUNS and will already draw the latest state. Six rapid
   * clicks become one render of the final zoom rather than six of it.
   */
  const drawPage = async () => {
    if (!pdf || !canvas) return;
    const mine = token;
    const pdfPage = await pdf.getPage(page());
    if (mine !== token) return;

    const viewport = pdfPage.getViewport({ scale: zoom(), rotation: rotation() });
    /* Render at device resolution and scale back with CSS, or a 2x display
       shows an interpolated blur of a document someone needs to READ. */
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * ratio);
    canvas.height = Math.floor(viewport.height * ratio);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const task = pdfPage.render({ canvasContext: ctx, viewport, canvas });
    renderTask = task;
    try {
      await task.promise;
    } catch (e: any) {
      /* Cancelling is how the previous render is meant to end, so it is not a
         failure to report — anything else is. */
      if (e?.name !== "RenderingCancelledException") throw e;
      return;
    } finally {
      if (renderTask === task) renderTask = null;
    }

    if (!naturalSize()) {
      const base = pdfPage.getViewport({ scale: 1, rotation: 0 });
      setNaturalSize({ width: base.width, height: base.height });
    }
  };

  const renderPdfPage = () => {
    if (renderQueued) return renderChain;
    renderQueued = true;
    /* Cut the in-flight render short so a held button stays responsive; the
       chain is what guarantees the canvas is actually free before the next
       one starts. */
    renderTask?.cancel();
    renderChain = renderChain
      .catch(() => {})
      /* Untracked on purpose, and it is the whole coalescing mechanism:
         drawPage must read page/zoom/rotation when it RUNS, not when it is
         queued, so a queued render draws the latest state rather than the state
         at the moment of the click. The tracked scope is the effect below. */
      // eslint-disable-next-line solid/reactivity
      .then(() => {
        renderQueued = false;
        return drawPage();
      });
    return renderChain;
  };

  createEffect(() => {
    /* Tracked: a new source is a new document, whatever kind it is. */
    const s = src();
    const k = kind();
    setNaturalSize(undefined);
    /*
     * A viewer that swaps documents in place would otherwise open the next one
     * at whatever zoom, page and angle the last one was left at. Only the
     * uncontrolled knobs are touched — a caller holding `zoom` owns it, and
     * writing over their value would be the component fighting them.
     */
    if (props.resetOnSrcChange !== false) {
      if (props.zoom === undefined) setZoom(props.defaultZoom ?? 1);
      if (props.page === undefined) setPage(1);
      if (props.rotation === undefined) setRotation(props.defaultRotation ?? 0);
    }
    if (!s) return;
    if (k === "pdf") {
      void loadPdf();
    } else {
      token++;
      pdf = null;
      setPageCount(1);
      setStatus(k === "image" ? "loading" : "error");
      if (k !== "image") setError("");
    }
  });

  createEffect(() => {
    /* Re-render on any of the three knobs, but only once a document is open. */
    page();
    zoom();
    rotation();
    if (kind() === "pdf" && status() === "ready") void renderPdfPage();
  });

  /* ---- toolbar --------------------------------------------------------- */

  const showToolbar = () => props.toolbar !== false;
  const isPdf = () => kind() === "pdf";

  return (
    <div
      class={cn(
        "zen-flex zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        props.class,
      )}
    >
      <Show when={showToolbar()}>
        <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-border-b zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1.5">
          <Show when={props.name}>
            <span class="zen-me-2 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground">
              {props.name}
            </span>
          </Show>

          <Button
            variant="ghost"
            size="sm"
            aria-label="Zoom out"
            disabled={zoom() <= minZoom()}
            onClick={() => stepZoom(-1)}
          >
            <MinusIcon />
          </Button>
          {/* A live region: the percentage is the only feedback a zoom press
              gives, and a sighted user gets it for free. */}
          <span
            aria-live="polite"
            class="zen-min-w-12 zen-text-center zen-text-xs zen-tabular-nums zen-text-zen-muted-fg"
          >
            {PERCENT(zoom())}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Zoom in"
            disabled={zoom() >= maxZoom()}
            onClick={() => stepZoom(1)}
          >
            <PlusIcon />
          </Button>
          <Button variant="ghost" size="sm" onClick={fitNow}>
            Fit
          </Button>
          <Button variant="ghost" size="sm" aria-label="Rotate 90 degrees" onClick={rotate}>
            <RotateIcon />
          </Button>

          <Show when={isPdf() && pageCount() > 1}>
            <span class="zen-mx-1 zen-h-4 zen-w-px zen-bg-zen-border" aria-hidden="true" />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Previous page"
              disabled={page() <= 1}
              onClick={() => setPageTo(page() - 1)}
            >
              <Icon name="chevron-left" size={16} class="rtl:zen-rotate-180" />
            </Button>
            <span class="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">
              {page()} / {pageCount()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Next page"
              disabled={page() >= pageCount()}
              onClick={() => setPageTo(page() + 1)}
            >
              <Icon name="chevron-right" size={16} class="rtl:zen-rotate-180" />
            </Button>
          </Show>

          <Show when={props.onDownload}>
            <span class="zen-ms-auto" />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Download"
              onClick={() => props.onDownload?.(src(), props.name)}
            >
              <DownloadIcon />
            </Button>
          </Show>
        </div>
      </Show>

      <div
        ref={scroller}
        class="zen-flex zen-w-full zen-justify-center zen-overflow-auto zen-bg-zen-muted zen-p-4"
        style={{ height: props.height ?? "32rem" }}
      >
        <Switch>
          <Match when={kind() === "image"}>
            <img
              src={src()}
              alt={props.name ?? "Document"}
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
              /* Sized rather than transformed: a CSS scale() leaves the
                 element's layout box at its old size, so the scroller never
                 learns the content grew and zooming past the frame just clips. */
              style={{
                width: naturalSize() ? `${naturalSize()!.width * zoom()}px` : "auto",
                height: "auto",
                "max-width": "none",
                transform: `rotate(${rotation()}deg)`,
                "align-self": "flex-start",
              }}
            />
          </Match>

          <Match when={kind() === "pdf"}>
            <canvas ref={canvas} class="zen-self-start zen-shadow-zen-sm" />
          </Match>

          <Match when={kind() === "unknown"}>
            <div class="zen-m-auto zen-flex zen-flex-col zen-items-center zen-gap-2 zen-text-center">
              <FileIcon />
              <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
                {props.unsupportedMessage ?? "No preview for this file type."}
              </p>
              <Show when={props.onDownload}>
                <Button variant="outline" size="sm" onClick={() => props.onDownload?.(src(), props.name)}>
                  Download
                </Button>
              </Show>
            </div>
          </Match>
        </Switch>

        <Show when={status() === "error" && error()}>
          <p class="zen-m-auto zen-text-sm zen-text-zen-error">{error()}</p>
        </Show>
      </div>
    </div>
  );
};
