/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { applyProps, Disposer, toNodes, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * DocumentViewer — show a scanned document.
 *
 *   DocumentViewer({ src: signedUrl, name: "invoice-8842.pdf" }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * The other half of FileUpload and Camera. Images render directly; PDFs render
 * through `pdfjs-dist`, an OPTIONAL peer dependency imported lazily, so an app
 * that only ever shows images never downloads it.
 *
 * It does NOT fetch. `src` is a URL you already have the right to read or a Blob
 * you already hold — no method, no headers, no retry policy. A signed URL works
 * untouched, because the query string is stripped before the extension is read.
 *
 * PDFs go to a CANVAS rather than an <iframe>, which is what makes zoom a render
 * parameter and rotation a number rather than a per-engine iframe trick.
 *
 * pdf.js needs a worker and will not start without one. Only your bundler knows
 * where its copy landed, so pass `workerSrc`; in Vite:
 *
 *   import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
 */

export type { DocumentKind, DocumentFit };

export interface DocumentViewerProps extends BaseProps {
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
  unsupportedMessage?: Child;
}

const PERCENT = (z: number) => `${Math.round(z * 100)}%`;

/* Local inline SVGs, as FileUpload already does: the shared Icon set is 16 names
   and none of these are in it. */
const STROKE =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';

const svg = (body: string, size = 16, extra = "") =>
  `<svg width="${size}" height="${size}" ${STROKE} ${extra}>${body}</svg>`;

const MINUS = svg('<line x1="5" y1="12" x2="19" y2="12"/>');
const PLUS = svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>');
const ROTATE = svg('<polyline points="21 4 21 10 15 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L21 10"/>');
const DOWNLOAD = svg(
  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
);
const FILE = svg(
  '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  32,
  'stroke-width="1.5" class="zen-text-zen-muted-fg"',
);

export function DocumentViewer(props: DocumentViewerProps): ZenComponent<DocumentViewerProps> {
  let current: DocumentViewerProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  /* Uncontrolled state, shadowed by the props of the same name when passed. */
  let zoomState = current.defaultZoom ?? 1;
  let pageState = Math.max(1, Math.floor(current.defaultPage ?? 1));
  let rotationState = current.defaultRotation ?? 0;
  let pageCount = 1;
  let status: "idle" | "loading" | "ready" | "error" = "idle";
  let errorText = "";
  let naturalSize: { width: number; height: number } | undefined;

  let objectUrl = "";
  let pdf: any = null;
  let renderTask: any = null;
  let renderChain: Promise<void> = Promise.resolve();
  let renderQueued = false;
  /* Bumped on every load and compared before anything is written to the canvas.
     Without it a slow first document finishes after a fast second one and paints
     over it. */
  let token = 0;
  /** What the last load ran for, so a re-render does not reload the same file. */
  let loadedFor = "";

  const el = document.createElement("div");
  const bar = document.createElement("div");
  const scroller = document.createElement("div");
  const canvas = document.createElement("canvas");
  canvas.className = "zen-self-start zen-shadow-zen-sm";
  const img = document.createElement("img");
  el.append(bar, scroller);

  const minZoom = () => current.minZoom ?? DOCUMENT_ZOOM_MIN;
  const maxZoom = () => current.maxZoom ?? DOCUMENT_ZOOM_MAX;
  const bound = (z: number) => (Number.isNaN(z) ? 1 : Math.min(maxZoom(), Math.max(minZoom(), z)));

  const zoom = () => bound(current.zoom ?? zoomState);
  const page = () => Math.max(1, Math.floor(current.page ?? pageState));
  const rotation = () => normalizeRotation(current.rotation ?? rotationState);

  const srcUrl = () => (current.src instanceof Blob ? objectUrl : current.src);
  const mime = () => current.type ?? (current.src instanceof Blob ? current.src.type : undefined);
  const kind = (): DocumentKind => inferDocumentKind(srcUrl(), mime());

  const setZoomTo = (next: number) => {
    const z = bound(next);
    zoomState = z;
    current.onZoomChange?.(z);
    render();
  };
  const stepZoom = (dir: number) =>
    setZoomTo(Math.round((dir >= 0 ? zoom() * (current.zoomStep ?? 1.25) : zoom() / (current.zoomStep ?? 1.25)) * 1e4) / 1e4);
  const setPageTo = (next: number) => {
    const p = Math.min(pageCount, Math.max(1, next));
    pageState = p;
    current.onPageChange?.(p);
    render();
  };
  const rotate = () => {
    const r = normalizeRotation(rotation() + 90);
    rotationState = r;
    current.onRotationChange?.(r);
    render();
  };
  const fitNow = () => {
    if (!naturalSize) return;
    setZoomTo(
      fitScale(
        naturalSize,
        { width: scroller.clientWidth - 32, height: scroller.clientHeight - 32 },
        current.fit ?? "contain",
        rotation(),
      ),
    );
  };

  const drawPage = async () => {
    if (!pdf) return;
    const mine = token;
    const pdfPage = await pdf.getPage(page());
    if (mine !== token) return;

    const viewport = pdfPage.getViewport({ scale: zoom(), rotation: rotation() });
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
    renderTask = task;
    try {
      await task.promise;
    } catch (e: any) {
      /* Cancelling is how the previous render is meant to end. */
      if (e?.name !== "RenderingCancelledException") throw e;
      return;
    } finally {
      if (renderTask === task) renderTask = null;
    }

    if (!naturalSize) {
      const base = pdfPage.getViewport({ scale: 1, rotation: 0 });
      naturalSize = { width: base.width, height: base.height };
    }
  };

  /*
   * One canvas takes one render() at a time — pdf.js throws rather than queueing,
   * and cancel() does NOT free it synchronously, so cancelling alone is not
   * enough: two calls can both pass the cancel while awaiting getPage. Measured
   * in the Solid binding: five collisions from six rapid zoom presses. Renders
   * are serialised and coalesced.
   */
  const renderPdfPage = () => {
    if (renderQueued) return renderChain;
    renderQueued = true;
    renderTask?.cancel();
    renderChain = renderChain
      .catch(() => {})
      .then(() => {
        renderQueued = false;
        return drawPage();
      });
    return renderChain;
  };

  const fail = (message: string) => {
    status = "error";
    errorText = message;
    render();
  };

  const load = async () => {
    const url = srcUrl();
    const k = kind();
    naturalSize = undefined;

    if (current.resetOnSrcChange ?? true) {
      if (current.zoom === undefined) zoomState = current.defaultZoom ?? 1;
      if (current.page === undefined) pageState = 1;
      if (current.rotation === undefined) rotationState = current.defaultRotation ?? 0;
    }
    if (!url) return;

    if (k !== "pdf") {
      token++;
      pdf = null;
      pageCount = 1;
      status = k === "image" ? "loading" : "error";
      errorText = "";
      render();
      return;
    }

    const mine = ++token;
    status = "loading";
    render();

    let mod: any;
    try {
      mod = await import("pdfjs-dist");
    } catch {
      if (mine !== token) return;
      fail("This is a PDF, and pdfjs-dist is not installed. Add it to render PDFs.");
      return;
    }
    if (mine !== token) return;

    const globals = mod.GlobalWorkerOptions;
    if (current.workerSrc && globals) globals.workerSrc = current.workerSrc;
    /* Caught here rather than left to pdf.js, whose own message names a global
       the caller of this component never set. */
    if (globals && !globals.workerSrc) {
      fail('PDFs need a pdf.js worker. Pass workerSrc — in Vite: import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url".');
      return;
    }

    try {
      /* An object, not a bare string: pdf.js dropped the string overload. */
      pdf = await mod.getDocument({ url }).promise;
      if (mine !== token) return;
      pageCount = pdf.numPages;
      if (page() > pdf.numPages) pageState = 1;
      status = "ready";
      render();
      void renderPdfPage();
    } catch (e) {
      if (mine !== token) return;
      fail(e instanceof Error ? e.message : "Could not open this PDF.");
    }
  };

  /** Toolbar buttons are rebuilt per render; each owns its own component handle. */
  let barParts: Array<{ destroy(): void }> = [];

  const renderToolbar = () => {
    for (const p of barParts) p.destroy();
    barParts = [];
    bar.replaceChildren();

    if (!(current.toolbar ?? true)) {
      bar.className = "";
      return;
    }
    bar.className =
      "zen-flex zen-flex-wrap zen-items-center zen-gap-1 zen-border-b zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1.5";

    const z = zoom();
    const k = kind();

    if (current.name) {
      const label = document.createElement("span");
      label.className = "zen-me-2 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground";
      label.textContent = current.name;
      bar.append(label);
    }

    const iconButton = (html: string, label: string, onClick: () => void, disabled = false) => {
      const holder = document.createElement("span");
      holder.innerHTML = html;
      const b = Button({
        variant: "ghost",
        size: "sm",
        "aria-label": label,
        disabled,
        onClick,
        children: Array.from(holder.childNodes),
      });
      barParts.push(b);
      return b.el;
    };

    bar.append(iconButton(MINUS, "Zoom out", () => stepZoom(-1), z <= minZoom()));

    /* A live region: the percentage is the only feedback a zoom press gives, and
       a sighted user gets it for free. */
    const pct = document.createElement("span");
    pct.setAttribute("aria-live", "polite");
    pct.className = "zen-min-w-12 zen-text-center zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";
    pct.textContent = PERCENT(z);
    bar.append(pct);

    bar.append(iconButton(PLUS, "Zoom in", () => stepZoom(1), z >= maxZoom()));

    const fitBtn = Button({ variant: "ghost", size: "sm", onClick: fitNow, children: "Fit" });
    barParts.push(fitBtn);
    bar.append(fitBtn.el);

    bar.append(iconButton(ROTATE, "Rotate 90 degrees", rotate));

    if (k === "pdf" && pageCount > 1) {
      const sep = document.createElement("span");
      sep.className = "zen-mx-1 zen-h-4 zen-w-px zen-bg-zen-border";
      sep.setAttribute("aria-hidden", "true");
      bar.append(sep);

      const prev = Button({
        variant: "ghost",
        size: "sm",
        "aria-label": "Previous page",
        disabled: page() <= 1,
        onClick: () => setPageTo(page() - 1),
        children: Icon({ name: "chevron-left", size: 16, class: "rtl:zen-rotate-180" }),
      });
      barParts.push(prev);
      bar.append(prev.el);

      const counter = document.createElement("span");
      counter.className = "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";
      counter.textContent = `${page()} / ${pageCount}`;
      bar.append(counter);

      const next = Button({
        variant: "ghost",
        size: "sm",
        "aria-label": "Next page",
        disabled: page() >= pageCount,
        onClick: () => setPageTo(page() + 1),
        children: Icon({ name: "chevron-right", size: 16, class: "rtl:zen-rotate-180" }),
      });
      barParts.push(next);
      bar.append(next.el);
    }

    if (current.onDownload) {
      const spacer = document.createElement("span");
      spacer.className = "zen-ms-auto";
      bar.append(spacer);
      bar.append(iconButton(DOWNLOAD, "Download", () => current.onDownload?.(srcUrl(), current.name)));
    }
  };

  const render = () => {
    const k = kind();

    el.className = cn(
      "zen-flex zen-w-full zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
      current.class,
    );

    renderToolbar();

    scroller.style.height = current.height ?? "32rem";
    scroller.className = "zen-flex zen-w-full zen-justify-center zen-overflow-auto zen-bg-zen-muted zen-p-4";
    scroller.replaceChildren();

    if (k === "image") {
      img.src = srcUrl();
      img.alt = current.name ?? "Document";
      /* Sized rather than transformed: a CSS scale() leaves the element's layout
         box at its old size, so the scroller never learns the content grew and
         zooming past the frame just clips. */
      img.style.width = naturalSize ? `${naturalSize.width * zoom()}px` : "auto";
      img.style.height = "auto";
      img.style.maxWidth = "none";
      img.style.transform = `rotate(${rotation()}deg)`;
      img.style.alignSelf = "flex-start";
      scroller.append(img);
    } else if (k === "pdf") {
      scroller.append(canvas);
    } else {
      const box = document.createElement("div");
      box.className = "zen-m-auto zen-flex zen-flex-col zen-items-center zen-gap-2 zen-text-center";
      const icon = document.createElement("span");
      icon.innerHTML = FILE;
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
      p.append(...toNodes(current.unsupportedMessage ?? "No preview for this file type."));
      box.append(icon, p);
      if (current.onDownload) {
        const dl = Button({
          variant: "outline",
          size: "sm",
          onClick: () => current.onDownload?.(srcUrl(), current.name),
          children: "Download",
        });
        barParts.push(dl);
        box.append(dl.el);
      }
      scroller.append(box);
    }

    if (status === "error" && errorText) {
      const p = document.createElement("p");
      p.className = "zen-m-auto zen-text-sm zen-text-zen-error";
      p.textContent = errorText;
      scroller.append(p);
    }

    const {
      src: _s, type: _t, name: _n, zoom: _z, defaultZoom: _dz, onZoomChange: _oz,
      minZoom: _mn, maxZoom: _mx, zoomStep: _zs, page: _p, defaultPage: _dp, onPageChange: _op,
      rotation: _r, defaultRotation: _dr, onRotationChange: _or, resetOnSrcChange: _rs,
      fit: _f, onDownload: _od, toolbar: _tb, height: _h, workerSrc: _ws,
      unsupportedMessage: _um, class: _c, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  const onImgLoad = () => {
    naturalSize = { width: img.naturalWidth, height: img.naturalHeight };
    status = "ready";
    render();
  };
  const onImgError = () => fail("Could not load this image.");
  img.addEventListener("load", onImgLoad);
  img.addEventListener("error", onImgError);
  disposer.add(() => {
    img.removeEventListener("load", onImgLoad);
    img.removeEventListener("error", onImgError);
  });

  /** A Blob has to become a URL, and that URL has to be revoked or every document
      the user opens leaks its bytes for the life of the page. */
  const syncSrc = () => {
    if (current.src instanceof Blob && !objectUrl) objectUrl = URL.createObjectURL(current.src);
    const now = current.src instanceof Blob ? objectUrl : String(current.src);
    if (now === loadedFor) return false;
    loadedFor = now;
    return true;
  };

  syncSrc();
  render();
  void load();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const p of barParts) p.destroy();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });

  return {
    el,
    update(next) {
      const previousBlob = current.src;
      current = { ...current, ...next };
      /* A new Blob is a new object URL, and the old one has to go now rather than
         at destroy() — otherwise flipping between documents leaks one per swap. */
      if (current.src !== previousBlob && objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = "";
      }
      const changed = syncSrc();
      render();
      if (changed) void load();
      else if (kind() === "pdf" && status === "ready") void renderPdfPage();
    },
    destroy() {
      token++;
      renderTask?.cancel();
      disposer.dispose();
      el.remove();
    },
  };
}
