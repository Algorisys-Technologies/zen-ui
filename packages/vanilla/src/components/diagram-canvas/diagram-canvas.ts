import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";

/**
 * DiagramCanvas — an embedded diagram editor, for a system-design answer.
 *
 *   DiagramCanvas({ value: xml, onChange: setXml, onSave: persist }).el
 *
 * Vanilla port; see the React binding for the reasoning. Same protocol, same
 * props, same sandbox.
 *
 * It embeds a diagram editor in an iframe and speaks its postMessage protocol.
 * There is no npm diagram package here and that is the point: the editor is a
 * whole application — shape libraries, routing, a format — and vendoring one
 * would be the largest dependency in zen-ui by an order of magnitude, to serve
 * one screen in one product.
 *
 * The trade is explicit, because it is a real one. An embed means the editor is
 * loaded from someone's origin and is unavailable offline. `src` is a prop so a
 * consumer can point it at a self-hosted build.
 */

/**
 * Which editor is embedded.
 *
 * - `"drawio"` — diagrams.net. Third-party, hosted, draw.io XML.
 * - `"yappydraw"` — YappyDraw, Algorisys's own editor. Client-side, free and
 *   self-hostable, which is what makes it the better answer for an exam that
 *   must not depend on someone else's uptime. Its document format is JSON.
 *
 * They speak different protocols, so this is not merely a URL swap — see the two
 * branches in the message handler.
 */
export type DiagramProvider = "drawio" | "yappydraw";

/** The public diagrams.net embed. Point `src` at your own build to self-host. */
export const DEFAULT_DIAGRAM_EMBED_URL =
  "https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=min&libraries=1";

/** The hosted YappyDraw. Point `src` at your own build to self-host. */
export const DEFAULT_YAPPYDRAW_EMBED_URL = "https://www.yappydraw.com/";

/**
 * YappyDraw's marker. Both directions carry it so the bridge never clashes with
 * unrelated postMessage traffic — an OAuth popup, an analytics frame.
 */
const YAPPY_MARKER = "__yappy";

/** Yappy documents are JSON; a caller holding a string should not have to parse it. */
const safeParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

/**
 * YappyDraw refuses cross-origin control unless its OPERATOR allowlists the
 * framing origin at deploy time (`VITE_EMBED_ALLOWED_ORIGINS`, or
 * `window.YAPPY_EMBED_ALLOWED_ORIGINS` in its own index.html). A framing page
 * cannot opt itself in, which is the right way round — but it does mean a correct
 * integration looks broken until the Yappy deployment is configured. Hence
 * `onError`: silence there is indistinguishable from a bug.
 */

export interface DiagramCanvasProps extends BaseProps {
  /** Which editor to embed. Default `"drawio"`. */
  provider?: DiagramProvider;
  /** draw.io XML, or a YappyDraw JSON document. Empty starts a blank diagram. */
  value?: string;
  /** Every edit. */
  onChange?: (xml: string) => void;
  /** The user pressed save inside the editor — persist this. */
  onSave?: (xml: string) => void;
  /** The editor is ready and has been given the initial value. */
  onReady?: () => void;
  /** Editor origin. Replace to self-host; the origin is also what messages are checked against. */
  src?: string;
  /** The bridge failed — most often an origin the Yappy deployment has not allowlisted. */
  onError?: (message: string) => void;
  /**
   * The frame's `sandbox`. Overriding it is an explicit security decision — read
   * the note beside the default before narrowing it, because dropping
   * `allow-same-origin` stops most editors loading their own assets.
   */
  sandbox?: string;
  /** CSS height. Default `"32rem"`. */
  height?: string;
  /** Accessible name for the frame. */
  title?: string;
}

export function DiagramCanvas(props: DiagramCanvasProps): ZenComponent<DiagramCanvasProps, HTMLIFrameElement> {
  let current: DiagramCanvasProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const el = document.createElement("iframe");

  const urlOf = () =>
    current.src ??
    (current.provider === "yappydraw" ? DEFAULT_YAPPYDRAW_EMBED_URL : DEFAULT_DIAGRAM_EMBED_URL);

  /* The editor's origin, so a message from any other frame is ignored. An
     unchecked `message` listener is a cross-origin write into your app. */
  const originOf = (url: string) => {
    try {
      return new URL(url, window.location.href).origin;
    } catch {
      return "";
    }
  };

  let url = urlOf();
  let origin = originOf(url);
  let teardown: (() => void) | undefined;

  const target = () => el.contentWindow;

  const connect = () => {
    teardown?.();

    const provider = current.provider ?? "drawio";
    const boundOrigin = origin;

    /* ---- draw.io: JSON strings, event-driven ---------------------------- */
    const drawio = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let msg: { event?: string; xml?: string };
      try {
        msg = JSON.parse(event.data);
      } catch {
        /* draw.io also emits non-JSON frames; they are not ours to read. */
        return;
      }
      const post = (m: unknown) => target()?.postMessage(JSON.stringify(m), boundOrigin || "*");

      if (msg.event === "init") {
        post({ action: "load", xml: current.value ?? "", autosave: 1 });
        current.onReady?.();
      } else if (msg.event === "autosave" && typeof msg.xml === "string") {
        current.onChange?.(msg.xml);
      } else if (msg.event === "save" && typeof msg.xml === "string") {
        current.onSave?.(msg.xml);
        /* Without this the editor sits on a spinner after save, waiting to be
           told the host finished. */
        post({ action: "status", modified: false });
      }
    };

    /* ---- YappyDraw: structured RPC over its __yappy bridge -------------- */
    let seq = 0;
    const pending = new Map<number, (r: { ok: boolean; result?: unknown; error?: string }) => void>();
    let pollId = 0;
    let lastSent = "";
    let stopped = false;

    const call = (method: string, args: unknown[] = []) =>
      new Promise<{ ok: boolean; result?: unknown; error?: string }>((resolve) => {
        const id = ++seq;
        pending.set(id, resolve);
        target()?.postMessage({ [YAPPY_MARKER]: true, id, method, args }, boundOrigin || "*");
        /* A bridge that never answers is the normal failure when the origin is
           not allowlisted, so it must time out rather than hang forever. */
        setTimeout(() => {
          if (pending.delete(id)) resolve({ ok: false, error: `Yappy.${method} timed out` });
        }, 4000);
      });

    const yappy = (event: MessageEvent) => {
      const data = event.data as Record<string, unknown> | null;
      if (!data || typeof data !== "object" || data[YAPPY_MARKER] !== true) return;
      if (!("ok" in data)) return; // a request echoed back, not a response
      const resolve = pending.get(data.id as number);
      if (!resolve) return;
      pending.delete(data.id as number);
      resolve(data as { ok: boolean; result?: unknown; error?: string });
    };

    const startYappy = async () => {
      /* Probe until it answers: an iframe's load event fires before its app has
         installed the bridge, so posting immediately is posting into a void. */
      for (let i = 0; i < 20; i++) {
        if (stopped) return;
        const pong = await call("__ping");
        if (pong.ok) break;
        if (i === 19) {
          current.onError?.(
            "YappyDraw did not answer. Its deployment must allowlist this origin — see VITE_EMBED_ALLOWED_ORIGINS.",
          );
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      if (stopped) return;

      if (current.value) {
        const loaded = await call("loadDocument", [safeParse(current.value)]);
        if (!loaded.ok && loaded.error) current.onError?.(loaded.error);
      }
      current.onReady?.();
      lastSent = current.value ?? "";

      /* Yappy has no change EVENT over the bridge, so the document is polled.
         Only a real difference is reported, so a caller's onChange does not fire
         once a second forever. */
      pollId = window.setInterval(async () => {
        const doc = await call("getDocument");
        if (!doc.ok) return;
        const next = typeof doc.result === "string" ? doc.result : JSON.stringify(doc.result);
        if (next && next !== lastSent) {
          lastSent = next;
          current.onChange?.(next);
        }
      }, 1500);
    };

    const onMessage = (event: MessageEvent) => {
      if (boundOrigin && event.origin !== boundOrigin) return;
      if (event.source !== target()) return;
      if (provider === "drawio") drawio(event);
      else yappy(event);
    };

    /*
     * Wait for the frame to NAVIGATE before probing.
     *
     * A fresh iframe holds an initial about:blank that inherits the parent's
     * origin, so posting with the editor's origin as targetOrigin is rejected —
     * "target origin ... does not match the recipient window's origin". The ping
     * loop retried past it, but every attempt logged, so a working integration
     * looked broken.
     */
    const onLoad = () => {
      if (provider === "yappydraw") void startYappy();
    };

    window.addEventListener("message", onMessage);
    el.addEventListener("load", onLoad);

    teardown = () => {
      stopped = true;
      el.removeEventListener("load", onLoad);
      window.removeEventListener("message", onMessage);
      if (pollId) clearInterval(pollId);
      pending.clear();
    };
  };

  const render = () => {
    const nextUrl = urlOf();
    const changed = nextUrl !== url;
    url = nextUrl;
    origin = originOf(url);

    if (el.getAttribute("src") !== url) el.src = url;
    el.title = current.title ?? "Diagram editor";
    el.style.height = current.height ?? "32rem";
    /*
     * `allow-same-origin` is required, and it is safe HERE — but only because
     * `src` is a different origin from the host.
     *
     * Without it the frame gets an OPAQUE origin, so every asset it fetches from
     * its own server counts as cross-origin and needs CORS headers most apps do
     * not send. Measured against yappydraw.com: the document loaded and then all
     * four of its own bundles were blocked, leaving a blank frame with no error
     * the component could see. draw.io survives the omission only because
     * diagrams.net serves its assets with CORS.
     *
     * What it grants is the frame's OWN origin back — its cookies, its storage.
     * It does NOT let the frame reach this document. The one configuration to
     * avoid is a SAME-ORIGIN `src` together with this: a frame on your own origin
     * can then reach in and remove its own sandbox attribute.
     */
    el.setAttribute(
      "sandbox",
      current.sandbox ?? "allow-scripts allow-same-origin allow-popups allow-forms allow-downloads",
    );
    el.className = cn(
      "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
      current.class,
    );

    if (changed) connect();

    const {
      provider: _p, value: _v, onChange: _oc, onSave: _os, onReady: _orr, src: _s,
      onError: _oe, sandbox: _sb, height: _h, title: _t, class: _c, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el as unknown as HTMLElement, rest as Record<string, unknown>);
  };

  render();
  connect();
  disposer.add(() => removeProps?.());
  disposer.add(() => teardown?.());

  return {
    el,
    update(next) {
      const beforeProvider = current.provider;
      current = { ...current, ...next };
      /* A provider swap is a different protocol on the same element, so the
         bridge has to be torn down and rebuilt even when the URL is unchanged. */
      if (current.provider !== beforeProvider) {
        render();
        connect();
      } else {
        render();
      }
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface ArchitectureDrawProps extends DiagramCanvasProps {
  /** Shown above the canvas. */
  label?: Child;
  /** Rendered beside the label — a save button, a reset. */
  actions?: Child;
}

/**
 * ArchitectureDraw — DiagramCanvas with a heading row.
 *
 * The composition an assessment actually renders: a labelled canvas with its own
 * actions, rather than a bare frame the caller has to wrap every time.
 */
export function ArchitectureDraw(props: ArchitectureDrawProps): ZenComponent<ArchitectureDrawProps> {
  let current: ArchitectureDrawProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const el = document.createElement("div");
  const head = document.createElement("div");
  const labelEl = document.createElement("span");
  const actionsEl = document.createElement("span");

  const canvasOf = (p: ArchitectureDrawProps): DiagramCanvasProps => {
    const { label: _l, actions: _a, class: _c, children: _ch, ...canvas } = p;
    return canvas;
  };

  const canvas = DiagramCanvas(canvasOf(current));
  disposer.add(() => canvas.destroy());

  const render = () => {
    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-2", current.class);
    head.className = "zen-flex zen-items-center zen-gap-2";
    labelEl.className = "zen-text-sm zen-font-medium zen-text-zen-foreground";
    setChildren(labelEl, current.label ?? "System design");

    head.replaceChildren(labelEl);
    if (current.actions !== undefined && current.actions !== null && current.actions !== false) {
      actionsEl.className = "zen-ms-auto zen-flex zen-gap-2";
      setChildren(actionsEl, current.actions);
      head.append(actionsEl);
    }

    el.replaceChildren(head, canvas.el);

    const {
      label: _l, actions: _a, provider: _p, value: _v, onChange: _oc, onSave: _os,
      onReady: _orr, src: _s, onError: _oe, sandbox: _sb, height: _h, title: _t,
      class: _c, children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      canvas.update(canvasOf(current));
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
