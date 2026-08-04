import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * DiagramCanvas — an embedded diagram editor, for a system-design answer.
 *
 *   <DiagramCanvas value={xml} onChange={setXml} onSave={persist} />
 *
 * It embeds diagrams.net (draw.io) in an iframe and speaks its `postMessage`
 * protocol. There is no npm diagram package here and that is the point: the
 * editor is a whole application — shape libraries, routing, a format — and
 * vendoring one would be the largest dependency in zen-ui by an order of
 * magnitude, to serve one screen in one product.
 *
 * The trade is explicit, because it is a real one. An embed means the editor is
 * a third party's, loaded from their origin by default, and unavailable offline.
 * `src` is a prop so a consumer can point it at a self-hosted build, which is
 * the answer for an exam that must not depend on someone else's uptime.
 *
 * The format is draw.io XML, in and out. `onChange` fires on every edit;
 * `onSave` fires when the user presses save inside the editor, which is the
 * point worth persisting.
 */

/**
 * Which editor is embedded.
 *
 * - `"drawio"` — diagrams.net. Third-party, hosted, draw.io XML.
 * - `"yappydraw"` — YappyDraw, Algorisys's own editor. Client-side, free, and
 *   self-hostable, which is what makes it the better answer for an exam that
 *   must not depend on someone else's uptime. Its document format is JSON.
 *
 * They speak different protocols, so this is not merely a URL swap — see the
 * two branches in the message handler.
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
 * cannot opt itself in, which is the right way round — but it does mean a
 * correct integration looks broken until the Yappy deployment is configured.
 * Hence `onError`: silence there is indistinguishable from a bug.
 */

export interface DiagramCanvasProps {
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
   * The frame's `sandbox`. Overriding it is an explicit security decision —
   * read the note beside the default before narrowing it, because dropping
   * `allow-same-origin` stops most editors loading their own assets.
   */
  sandbox?: string;
  /** CSS height. Default `"32rem"`. */
  height?: string;
  /** Accessible name for the frame. */
  title?: string;
  className?: string;
}

export const DiagramCanvas = ({
  provider = "drawio",
  value = "",
  onChange,
  onSave,
  onReady,
  onError,
  src,
  sandbox = "allow-scripts allow-same-origin allow-popups allow-forms allow-downloads",
  height = "32rem",
  title = "Diagram editor",
  className,
}: DiagramCanvasProps) => {
  const url = src ?? (provider === "yappydraw" ? DEFAULT_YAPPYDRAW_EMBED_URL : DEFAULT_DIAGRAM_EMBED_URL);
  const frameRef = React.useRef<HTMLIFrameElement>(null);

  /* Refs so a caller passing inline arrows does not re-subscribe the listener
     on every render and miss a message mid-flight. */
  const handlers = React.useRef({ onChange, onSave, onReady, onError });
  handlers.current = { onChange, onSave, onReady, onError };
  const valueRef = React.useRef(value);
  valueRef.current = value;

  /* The editor's origin, so a message from any other frame is ignored. An
     unchecked `message` listener is a cross-origin write into your app. */
  const origin = React.useMemo(() => {
    try {
      return new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.href)
        .origin;
    } catch {
      return "";
    }
  }, [url]);

  React.useEffect(() => {
    const target = () => frameRef.current?.contentWindow;

    /* ---- draw.io: JSON strings, event-driven --------------------------- */
    const drawio = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      let msg: { event?: string; xml?: string };
      try {
        msg = JSON.parse(event.data);
      } catch {
        /* draw.io also emits non-JSON frames; they are not ours to read. */
        return;
      }
      const post = (m: unknown) => target()?.postMessage(JSON.stringify(m), origin || "*");

      if (msg.event === "init") {
        post({ action: "load", xml: valueRef.current, autosave: 1 });
        handlers.current.onReady?.();
      } else if (msg.event === "autosave" && typeof msg.xml === "string") {
        handlers.current.onChange?.(msg.xml);
      } else if (msg.event === "save" && typeof msg.xml === "string") {
        handlers.current.onSave?.(msg.xml);
        /* Without this the editor sits on a spinner after save, waiting to be
           told the host finished. */
        post({ action: "status", modified: false });
      }
    };

    /* ---- YappyDraw: structured RPC over its __yappy bridge ------------- */
    let seq = 0;
    const pending = new Map<number, (r: { ok: boolean; result?: unknown; error?: string }) => void>();
    let pollId = 0;
    let lastSent = "";

    const call = (method: string, args: unknown[] = []) =>
      new Promise<{ ok: boolean; result?: unknown; error?: string }>((resolve) => {
        const id = ++seq;
        pending.set(id, resolve);
        target()?.postMessage({ [YAPPY_MARKER]: true, id, method, args }, origin || "*");
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
        const pong = await call("__ping");
        if (pong.ok) break;
        if (i === 19) {
          handlers.current.onError?.(
            "YappyDraw did not answer. Its deployment must allowlist this origin — see VITE_EMBED_ALLOWED_ORIGINS.",
          );
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      if (valueRef.current) {
        const loaded = await call("loadDocument", [safeParse(valueRef.current)]);
        if (!loaded.ok && loaded.error) handlers.current.onError?.(loaded.error);
      }
      handlers.current.onReady?.();
      lastSent = valueRef.current;

      /* Yappy has no change EVENT over the bridge, so the document is polled.
         Only a real difference is reported, so a caller's onChange does not fire
         once a second forever. */
      pollId = window.setInterval(async () => {
        const doc = await call("getDocument");
        if (!doc.ok) return;
        const next = typeof doc.result === "string" ? doc.result : JSON.stringify(doc.result);
        if (next && next !== lastSent) {
          lastSent = next;
          handlers.current.onChange?.(next);
        }
      }, 1500);
    };

    const onMessage = (event: MessageEvent) => {
      if (origin && event.origin !== origin) return;
      if (event.source !== target()) return;
      if (provider === "drawio") drawio(event);
      else yappy(event);
    };

    window.addEventListener("message", onMessage);
    /*
     * Wait for the frame to NAVIGATE before probing.
     *
     * A fresh iframe holds an initial about:blank that inherits the parent's
     * origin, so posting with the editor's origin as targetOrigin is rejected —
     * "target origin ... does not match the recipient window's origin
     * (http://localhost:5170)". The ping loop retried past it, but every attempt
     * logged, so a working integration looked broken.
     */
    const onLoad = () => {
      if (provider === "yappydraw") void startYappy();
    };
    const frame = frameRef.current;
    frame?.addEventListener("load", onLoad);

    return () => {
      frame?.removeEventListener("load", onLoad);
      window.removeEventListener("message", onMessage);
      if (pollId) clearInterval(pollId);
      pending.clear();
    };
  }, [origin, provider, url]);

  return (
    <iframe
      ref={frameRef}
      src={url}
      title={title}
      style={{ height }}
      /*
       * `allow-same-origin` is required, and it is safe HERE — but only because
       * `src` is a different origin from the host.
       *
       * Without it the frame gets an OPAQUE origin, so every asset it fetches
       * from its own server counts as cross-origin and needs CORS headers most
       * apps do not send. Measured against yappydraw.com: the document loaded
       * and then all four of its own bundles were blocked, leaving a blank
       * frame with no error the component could see. draw.io survives the
       * omission only because diagrams.net serves its assets with CORS.
       *
       * What it grants is the frame's OWN origin back — its cookies, its
       * storage. It does NOT let the frame reach this document; the same-origin
       * policy between two different origins still does that, and the sandbox
       * is not what was holding the line.
       *
       * The one configuration to avoid is a SAME-ORIGIN `src` together with
       * this: a frame on your own origin can then reach in and remove its own
       * sandbox attribute. Host the editor somewhere else, which is the normal
       * arrangement anyway.
       */
      sandbox={sandbox}
      className={cn(
        "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        className,
      )}
    />
  );
};

export interface ArchitectureDrawProps extends DiagramCanvasProps {
  /** Shown above the canvas. */
  label?: React.ReactNode;
  /** Rendered beside the label — a save button, a reset. */
  actions?: React.ReactNode;
}

/**
 * ArchitectureDraw — DiagramCanvas with a heading row.
 *
 * The composition an assessment actually renders: a labelled canvas with its
 * own actions, rather than a bare frame the caller has to wrap every time.
 */
export const ArchitectureDraw = ({
  label = "System design",
  actions,
  className,
  ...canvas
}: ArchitectureDrawProps) => (
  <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className)}>
    <div className="zen-flex zen-items-center zen-gap-2">
      <span className="zen-text-sm zen-font-medium zen-text-zen-foreground">{label}</span>
      {actions ? <span className="zen-ms-auto zen-flex zen-gap-2">{actions}</span> : null}
    </div>
    <DiagramCanvas {...canvas} />
  </div>
);
