import { jsxs as M, jsx as o } from "react/jsx-runtime";
import * as l from "react";
import { liveState as N } from "./index134.js";
import { durationMessage as T } from "./index120.js";
import { useLocale as k } from "./index90.js";
import { cn as c } from "./index197.js";
const E = {
  live: "zen-bg-zen-success",
  stale: "zen-bg-zen-warning-soft-fg",
  offline: "zen-bg-zen-error",
  waiting: "zen-border zen-border-solid zen-border-zen-muted-fg"
}, I = {
  live: "zen-text-zen-muted-fg",
  stale: "zen-font-medium zen-text-zen-warning-soft-fg",
  offline: "zen-font-medium zen-text-zen-error",
  waiting: "zen-text-zen-muted-fg"
}, S = { live: "live.live", stale: "live.stale", offline: "live.offline", waiting: "live.waiting" }, j = l.forwardRef(
  ({ lastUpdated: z, staleAfterMs: m, connected: u, now: g, size: d, className: v, ...x }, p) => {
    const t = k(), [w, b] = l.useState(() => Date.now());
    l.useEffect(() => {
      const i = setInterval(() => b(Date.now()), 1e3);
      return () => clearInterval(i);
    }, []);
    const n = N({ lastUpdated: z, now: g ?? w, staleAfterMs: m, connected: u }), e = n.state, a = () => {
      const i = T(n.ageMs ?? 0);
      return t.t(i.key, i.values);
    };
    let s;
    e === "live" ? s = n.ageMs !== null && n.ageMs < 5e3 ? t.t("live.justNow") : t.t("live.updated", { age: a() }) : e === "stale" ? s = t.t("live.stale", { age: a() }) : e === "offline" ? s = n.ageMs === null ? t.t("live.offline") : t.t("live.offlineFor", { age: a() }) : s = t.t("live.waiting");
    const r = () => e === "stale" ? t.t("live.stale", { age: a() }) : t.t(S[e]), [f, h] = l.useState(() => ({ state: e, text: r() }));
    return f.state !== e && h({ state: e, text: r() }), /* @__PURE__ */ M(
      "span",
      {
        ref: p,
        "data-state": e,
        className: c(
          "zen-inline-flex zen-items-center zen-gap-1.5 zen-tabular-nums",
          d === "sm" ? "zen-text-xs" : "zen-text-sm",
          I[e],
          v
        ),
        ...x,
        children: [
          /* @__PURE__ */ o("span", { "aria-hidden": "true", className: c("zen-h-2 zen-w-2 zen-shrink-0 zen-rounded-zen-full", E[e]) }),
          /* @__PURE__ */ o("span", { children: s }),
          /* @__PURE__ */ o("span", { className: "zen-sr-only", role: "status", children: f.text })
        ]
      }
    );
  }
);
j.displayName = "LiveIndicator";
export {
  j as LiveIndicator
};
//# sourceMappingURL=index133.js.map
