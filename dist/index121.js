import { jsx as o, jsxs as f } from "react/jsx-runtime";
import * as a from "react";
import { cn as v } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { planChunks as j, DEFAULT_CHUNK_SIZE as L, shouldRetry as K, DEFAULT_MAX_ATTEMPTS as G, nextAttemptDelay as H, uploadProgress as S } from "./index122.js";
import { Button as A } from "./index71.js";
import { Progress as I } from "./index66.js";
import { useLocale as X } from "./index90.js";
const M = (e) => {
  if (e < 1024) return `${e} B`;
  const p = ["KB", "MB", "GB"];
  let u = e / 1024, l = 0;
  for (; u >= 1024 && l < p.length - 1; )
    u /= 1024, l++;
  return `${u.toFixed(u >= 10 ? 0 : 1)} ${p[l]}`;
}, ee = ({
  file: e,
  uploadChunk: p,
  chunkSize: u = L,
  maxAttempts: l = G,
  autoStart: g = !0,
  onProgress: N,
  onComplete: R,
  onError: E,
  showProgress: P = !0,
  className: b
}) => {
  const n = X(), [r, d] = a.useState("idle"), [x, B] = a.useState(0), [C, k] = a.useState(""), s = a.useMemo(
    () => e ? j(e.size, u) : [],
    [e, u]
  ), m = a.useRef(!1), U = a.useRef(!1), c = a.useRef(0), h = a.useRef({ uploadChunk: p, onProgress: N, onComplete: R, onError: E });
  h.current = { uploadChunk: p, onProgress: N, onComplete: R, onError: E };
  const _ = (t) => new Promise((i) => setTimeout(i, t)), y = a.useCallback(async () => {
    if (!(U.current || !e || s.length === 0)) {
      U.current = !0, m.current = !1, d("uploading"), k("");
      try {
        for (; c.current < s.length; ) {
          if (m.current) {
            d("paused");
            return;
          }
          const t = s[c.current], i = e.slice(t.start, t.end);
          let z = 0, D = !1;
          for (; !D; ) {
            z++;
            try {
              await h.current.uploadChunk(i, {
                index: t.index,
                total: s.length,
                start: t.start,
                end: t.end,
                attempt: z,
                file: e
              }), D = !0;
            } catch (w) {
              const F = w instanceof Error ? w : new Error(String(w));
              if (!K(z, l)) {
                d("error"), k(F.message), h.current.onError?.(F, {
                  index: t.index,
                  total: s.length,
                  start: t.start,
                  end: t.end,
                  attempt: z,
                  file: e
                });
                return;
              }
              if (await _(H(z)), m.current) {
                d("paused");
                return;
              }
            }
          }
          c.current++, B(c.current), h.current.onProgress?.(
            S(c.current, s.length),
            c.current,
            s.length
          );
        }
        d("complete"), h.current.onComplete?.(e);
      } finally {
        U.current = !1;
      }
    }
  }, [e, s, l]);
  a.useEffect(() => {
    c.current = 0, m.current = !1, B(0), k(""), d("idle"), e && g && y();
  }, [e, g, y]);
  const T = S(x, s.length), $ = s.slice(0, x).reduce((t, i) => t + (i.end - i.start), 0);
  return e ? /* @__PURE__ */ f("div", { className: v("zen-flex zen-w-full zen-flex-col zen-gap-2", b), children: [
    /* @__PURE__ */ f("div", { className: "zen-flex zen-items-baseline zen-justify-between zen-gap-3", children: [
      /* @__PURE__ */ o("span", { className: "zen-min-w-0 zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: e.name }),
      /* @__PURE__ */ o("span", { className: "zen-shrink-0 zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", children: n.t("chunkUploader.progress", {
        done: M($),
        size: M(e.size),
        chunk: x,
        count: s.length
      }) })
    ] }),
    P ? /* @__PURE__ */ o(
      I,
      {
        value: T,
        color: r === "error" ? "error" : r === "complete" ? "success" : "primary"
      }
    ) : null,
    /* @__PURE__ */ f("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
      /* @__PURE__ */ o(
        "span",
        {
          "data-status": r,
          className: v(
            "zen-text-xs",
            r === "error" ? "zen-text-zen-error" : "zen-text-zen-muted-fg"
          ),
          children: r === "complete" ? n.t("chunkUploader.uploaded") : r === "error" ? n.t("chunkUploader.failed", { error: C }) : r === "paused" ? n.t("chunkUploader.paused") : r === "uploading" ? `${T}%` : n.t("chunkUploader.ready")
        }
      ),
      /* @__PURE__ */ f("span", { className: "zen-ms-auto zen-flex zen-gap-2", children: [
        r === "uploading" ? /* @__PURE__ */ o(
          A,
          {
            size: "sm",
            variant: "outline",
            onClick: () => {
              m.current = !0;
            },
            children: n.t("chunkUploader.pause")
          }
        ) : null,
        r === "paused" || r === "error" || r === "idle" && !g ? (
          /* Resume, not restart: the cursor sits on the chunk that failed. */
          /* @__PURE__ */ o(A, { size: "sm", onClick: () => {
            y();
          }, children: r === "error" ? n.t("chunkUploader.retry") : r === "paused" ? n.t("chunkUploader.resume") : n.t("chunkUploader.upload") })
        ) : null
      ] })
    ] }),
    /* @__PURE__ */ o("span", { className: "zen-sr-only", "aria-live": "polite", children: r === "complete" ? n.t("chunkUploader.fileUploaded", { name: e.name }) : r === "error" ? n.t("chunkUploader.fileFailed", { name: e.name, error: C }) : "" })
  ] }) : /* @__PURE__ */ o("p", { className: v("zen-m-0 zen-text-sm zen-text-zen-muted-fg", b), children: n.t("chunkUploader.noFileSelected") });
};
export {
  ee as ChunkUploader
};
//# sourceMappingURL=index121.js.map
