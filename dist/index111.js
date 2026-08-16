import { jsx as u, jsxs as h } from "react/jsx-runtime";
import * as s from "react";
import { cn as N } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { planChunks as _, DEFAULT_CHUNK_SIZE as j, shouldRetry as K, DEFAULT_MAX_ATTEMPTS as L, nextAttemptDelay as G, uploadProgress as U } from "./index112.js";
import { Button as D } from "./index65.js";
import { Progress as H } from "./index60.js";
const A = (e) => {
  if (e < 1024) return `${e} B`;
  const i = ["KB", "MB", "GB"];
  let a = e / 1024, c = 0;
  for (; a >= 1024 && c < i.length - 1; )
    a /= 1024, c++;
  return `${a.toFixed(a >= 10 ? 0 : 1)} ${i[c]}`;
}, V = ({
  file: e,
  uploadChunk: i,
  chunkSize: a = j,
  maxAttempts: c = L,
  autoStart: f = !0,
  onProgress: v,
  onComplete: k,
  onError: E,
  showProgress: F = !0,
  className: $
}) => {
  const [t, l] = s.useState("idle"), [g, b] = s.useState(0), [B, x] = s.useState(""), r = s.useMemo(
    () => e ? _(e.size, a) : [],
    [e, a]
  ), m = s.useRef(!1), y = s.useRef(!1), o = s.useRef(0), p = s.useRef({ uploadChunk: i, onProgress: v, onComplete: k, onError: E });
  p.current = { uploadChunk: i, onProgress: v, onComplete: k, onError: E };
  const M = (n) => new Promise((d) => setTimeout(d, n)), R = s.useCallback(async () => {
    if (!(y.current || !e || r.length === 0)) {
      y.current = !0, m.current = !1, l("uploading"), x("");
      try {
        for (; o.current < r.length; ) {
          if (m.current) {
            l("paused");
            return;
          }
          const n = r[o.current], d = e.slice(n.start, n.end);
          let z = 0, P = !1;
          for (; !P; ) {
            z++;
            try {
              await p.current.uploadChunk(d, {
                index: n.index,
                total: r.length,
                start: n.start,
                end: n.end,
                attempt: z,
                file: e
              }), P = !0;
            } catch (w) {
              const T = w instanceof Error ? w : new Error(String(w));
              if (!K(z, c)) {
                l("error"), x(T.message), p.current.onError?.(T, {
                  index: n.index,
                  total: r.length,
                  start: n.start,
                  end: n.end,
                  attempt: z,
                  file: e
                });
                return;
              }
              if (await M(G(z)), m.current) {
                l("paused");
                return;
              }
            }
          }
          o.current++, b(o.current), p.current.onProgress?.(
            U(o.current, r.length),
            o.current,
            r.length
          );
        }
        l("complete"), p.current.onComplete?.(e);
      } finally {
        y.current = !1;
      }
    }
  }, [e, r, c]);
  s.useEffect(() => {
    o.current = 0, m.current = !1, b(0), x(""), l("idle"), e && f && R();
  }, [e, f, R]);
  const C = U(g, r.length), S = r.slice(0, g).reduce((n, d) => n + (d.end - d.start), 0);
  return e ? /* @__PURE__ */ h("div", { className: N("zen-flex zen-w-full zen-flex-col zen-gap-2", $), children: [
    /* @__PURE__ */ h("div", { className: "zen-flex zen-items-baseline zen-justify-between zen-gap-3", children: [
      /* @__PURE__ */ u("span", { className: "zen-min-w-0 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: e.name }),
      /* @__PURE__ */ h("span", { className: "zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: [
        A(S),
        " / ",
        A(e.size),
        " · ",
        g,
        "/",
        r.length,
        " chunks"
      ] })
    ] }),
    F ? /* @__PURE__ */ u(
      H,
      {
        value: C,
        color: t === "error" ? "error" : t === "complete" ? "success" : "primary"
      }
    ) : null,
    /* @__PURE__ */ h("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
      /* @__PURE__ */ u(
        "span",
        {
          "data-status": t,
          className: N(
            "zen-text-xs",
            t === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"
          ),
          children: t === "complete" ? "Uploaded" : t === "error" ? `Failed: ${B}` : t === "paused" ? "Paused" : t === "uploading" ? `${C}%` : "Ready"
        }
      ),
      /* @__PURE__ */ h("span", { className: "zen-ms-auto zen-flex zen-gap-2", children: [
        t === "uploading" ? /* @__PURE__ */ u(
          D,
          {
            size: "sm",
            variant: "outline",
            onClick: () => {
              m.current = !0;
            },
            children: "Pause"
          }
        ) : null,
        t === "paused" || t === "error" || t === "idle" && !f ? (
          /* Resume, not restart: the cursor sits on the chunk that failed. */
          /* @__PURE__ */ u(D, { size: "sm", onClick: () => {
            R();
          }, children: t === "error" ? "Retry" : t === "paused" ? "Resume" : "Upload" })
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ u("span", { className: "zen-sr-only", "aria-live": "polite", children: t === "complete" ? `${e.name} uploaded` : t === "error" ? `${e.name} failed to upload: ${B}` : "" })
  ] }) : /* @__PURE__ */ u("p", { className: N("zen-m-0 zen-text-sm zen-text-zen-muted-fg", $), children: "No file selected." });
};
export {
  V as ChunkUploader
};
//# sourceMappingURL=index111.js.map
