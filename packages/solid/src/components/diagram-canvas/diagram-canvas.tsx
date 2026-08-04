import { createEffect, createMemo, onCleanup, Show, type JSX } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * DiagramCanvas — an embedded diagram editor, for a system-design answer.
 *
 *   <DiagramCanvas value={xml()} onChange={setXml} onSave={persist} />
 *   <DiagramCanvas provider="yappydraw" onChange={setJson} onError={setErr} />
 *
 * It embeds an editor in an iframe and speaks its `postMessage` protocol. There
 * is no npm diagram package here and that is the point: the editor is a whole
 * application, and vendoring one would be the largest dependency in zen-ui by an
 * order of magnitude to serve one screen.
 */

/**
 * Which editor is embedded.
 *
 * - `"drawio"` — diagrams.net. Third-party, hosted, draw.io XML.
 * - `"yappydraw"` — YappyDraw, Algorisys's own. Client-side, free and
 *   self-hostable, which is the better answer for an exam that must not depend
 *   on someone else's uptime. Its documents are JSON.
 *
 * They speak different protocols, so this is not a URL swap.
 */
export type DiagramProvider = "drawio" | "yappydraw";

export const DEFAULT_DIAGRAM_EMBED_URL =
  "https://embed.diagrams.net/?embed=1&proto=json&spin=1&ui=min&libraries=1";

/** The hosted YappyDraw. Point `src` at your own build to self-host. */
export const DEFAULT_YAPPYDRAW_EMBED_URL = "https://www.yappydraw.com/";

const YAPPY_MARKER = "__yappy";

/** Yappy documents are JSON; a caller holding a string should not have to parse it. */
const safeParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export interface DiagramCanvasProps {
  /** Which editor to embed. Default `"drawio"`. */
  provider?: DiagramProvider;
  /** draw.io XML, or a YappyDraw JSON document. */
  value?: string;
  /** Every edit. */
  onChange?: (value: string) => void;
  /** The user pressed save inside the editor — persist this. */
  onSave?: (value: string) => void;
  onReady?: () => void;
  /** The bridge failed — most often an origin the Yappy deployment has not allowlisted. */
  onError?: (message: string) => void;
  /** Editor origin. Replace to self-host; also what incoming messages are checked against. */
  src?: string;
  /**
   * The frame's `sandbox`. Narrowing it is an explicit security decision —
   * dropping `allow-same-origin` stops most editors loading their own assets.
   */
  sandbox?: string;
  /** CSS height. Default `"32rem"`. */
  height?: string;
  title?: string;
  class?: string;
}

export const DiagramCanvas = (props: DiagramCanvasProps) => {
  let frame: HTMLIFrameElement | undefined;

  const provider = () => props.provider ?? "drawio";
  const url = () =>
    props.src ??
    (provider() === "yappydraw" ? DEFAULT_YAPPYDRAW_EMBED_URL : DEFAULT_DIAGRAM_EMBED_URL);

  /* The editor's origin, so a message from any other frame is ignored. An
     unchecked `message` listener is a cross-origin write into your app. */
  const origin = createMemo(() => {
    try {
      return new URL(url(), typeof window === "undefined" ? "http://localhost" : location.href)
        .origin;
    } catch {
      return "";
    }
  });

  createEffect(() => {
    const editorOrigin = origin();
    const kind = provider();
    const target = () => frame?.contentWindow;

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
      const post = (m: unknown) => target()?.postMessage(JSON.stringify(m), editorOrigin || "*");

      if (msg.event === "init") {
        post({ action: "load", xml: props.value ?? "", autosave: 1 });
        props.onReady?.();
      } else if (msg.event === "autosave" && typeof msg.xml === "string") {
        props.onChange?.(msg.xml);
      } else if (msg.event === "save" && typeof msg.xml === "string") {
        props.onSave?.(msg.xml);
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
        target()?.postMessage({ [YAPPY_MARKER]: true, id, method, args }, editorOrigin || "*");
        /* A bridge that never answers is the normal failure when the origin is
           not allowlisted, so it must time out rather than hang forever. */
        setTimeout(() => {
          if (pending.delete(id)) resolve({ ok: false, error: `Yappy.${method} timed out` });
        }, 4000);
      });

    const yappy = (event: MessageEvent) => {
      const data = event.data as Record<string, unknown> | null;
      if (!data || typeof data !== "object" || data[YAPPY_MARKER] !== true) return;
      if (!("ok" in data)) return;
      const resolve = pending.get(data.id as number);
      if (!resolve) return;
      pending.delete(data.id as number);
      resolve(data as { ok: boolean; result?: unknown; error?: string });
    };

    const startYappy = async () => {
      /* Probe until it answers: an iframe's load event fires before its app has
         installed the bridge. */
      for (let i = 0; i < 20; i++) {
        const pong = await call("__ping");
        if (pong.ok) break;
        if (i === 19) {
          props.onError?.(
            "YappyDraw did not answer. Its deployment must allowlist this origin — see VITE_EMBED_ALLOWED_ORIGINS.",
          );
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }

      if (props.value) {
        const loaded = await call("loadDocument", [safeParse(props.value)]);
        if (!loaded.ok && loaded.error) props.onError?.(loaded.error);
      }
      props.onReady?.();
      lastSent = props.value ?? "";

      /* Yappy has no change EVENT over the bridge, so the document is polled.
         Only a real difference is reported, so onChange does not fire forever.
         The handler is read when the interval FIRES, which is what keeps a
         caller's latest onChange in play rather than one captured at start. */
      // eslint-disable-next-line solid/reactivity
      pollId = window.setInterval(async () => {
        const doc = await call("getDocument");
        if (!doc.ok) return;
        const next = typeof doc.result === "string" ? doc.result : JSON.stringify(doc.result);
        if (next && next !== lastSent) {
          lastSent = next;
          props.onChange?.(next);
        }
      }, 1500);
    };

    const onMessage = (event: MessageEvent) => {
      if (editorOrigin && event.origin !== editorOrigin) return;
      if (event.source !== target()) return;
      if (kind === "drawio") drawio(event);
      else yappy(event);
    };

    window.addEventListener("message", onMessage);
    /*
     * Wait for the frame to NAVIGATE before probing. A fresh iframe holds an
     * initial about:blank that inherits the parent's origin, so posting with the
     * editor's origin as targetOrigin is rejected — the retry loop got past it,
     * but every attempt logged, and a console full of origin errors reads as
     * broken.
     */
    const onLoad = () => {
      if (kind === "yappydraw") void startYappy();
    };
    frame?.addEventListener("load", onLoad);

    onCleanup(() => {
      window.removeEventListener("message", onMessage);
      frame?.removeEventListener("load", onLoad);
      if (pollId) clearInterval(pollId);
      pending.clear();
    });
  });

  return (
    <iframe
      ref={frame}
      src={url()}
      title={props.title ?? "Diagram editor"}
      style={{ height: props.height ?? "32rem" }}
      /*
       * `allow-same-origin` is required, and it is safe HERE — but only because
       * `src` is a different origin from the host.
       *
       * Without it the frame gets an OPAQUE origin, so every asset it fetches
       * from its own server counts as cross-origin and needs CORS headers most
       * apps do not send. Measured against yappydraw.com: the document loaded
       * and then all four of its own bundles were blocked, leaving a blank
       * frame. draw.io survives the omission only because diagrams.net serves
       * its assets with CORS.
       *
       * What it grants is the frame's OWN origin back. It does NOT let the frame
       * reach this document; the same-origin policy between two different
       * origins does that. The one arrangement to avoid is a SAME-ORIGIN `src`
       * with this, where the frame can remove its own sandbox attribute.
       */
      sandbox={
        props.sandbox ??
        "allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
      }
      class={cn(
        "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
        props.class,
      )}
    />
  );
};

export interface ArchitectureDrawProps extends DiagramCanvasProps {
  /** Shown above the canvas. */
  label?: JSX.Element;
  /** Rendered beside the label — a save button, a reset. */
  actions?: JSX.Element;
}

/**
 * ArchitectureDraw — DiagramCanvas with a heading row.
 *
 * The composition an assessment actually renders, rather than a bare frame the
 * caller has to wrap every time.
 */
export const ArchitectureDraw = (props: ArchitectureDrawProps) => (
  <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", props.class)}>
    <div class="zen-flex zen-items-center zen-gap-2">
      <span class="zen-text-sm zen-font-medium zen-text-zen-foreground">
        {props.label ?? "System design"}
      </span>
      <Show when={props.actions}>
        <span class="zen-ms-auto zen-flex zen-gap-2">{props.actions}</span>
      </Show>
    </div>
    <DiagramCanvas {...props} class="" />
  </div>
);
