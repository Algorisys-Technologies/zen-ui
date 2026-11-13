import { jsxs as c, jsx as a } from "react/jsx-runtime";
import * as d from "react";
import { machineStateTone as L, machineStateMessageKey as S } from "./index116.js";
import { rateBuckets as C } from "./index140.js";
import { useLocale as E } from "./index90.js";
import { cn as y } from "./index197.js";
const K = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: "zen-bg-zen-state-unknown"
}, q = d.forwardRef(
  ({ readings: p, segments: f, from: B, to: $, bucketMs: I, now: g, target: r, unit: x, timeZone: D, className: F, ...H }, R) => {
    const n = E(), [T, h] = d.useState(() => Date.now()), b = g === void 0;
    d.useEffect(() => {
      if (!b) return;
      h(Date.now());
      const e = setInterval(() => h(Date.now()), 15e3);
      return () => clearInterval(e);
    }, [b]);
    const z = I ?? 12e4, s = +B, o = +$, w = +(g ?? T), m = d.useMemo(
      () => C({ readings: p, segments: f, from: s, to: o, bucketMs: z, now: w }),
      [p, f, s, o, z, w]
    ), u = m.filter((e) => !e.partial), v = u.at(-1)?.perHour ?? null, N = u.reduce((e, t) => e + (t.end - t.start), 0), k = N > 0 ? u.reduce((e, t) => e + t.count, 0) / N * 36e5 : null, M = Math.max(1, r ?? 0, ...m.map((e) => e.perHour)) * 1.1, j = Math.max(1, Math.ceil((o - s) / z)), l = (e) => {
      const t = new Intl.NumberFormat(n.locale, { maximumFractionDigits: 0 }).format(e);
      return x ? `${t} ${x}` : t;
    }, i = (e) => new Intl.DateTimeFormat(n.locale, { hour: "2-digit", minute: "2-digit", timeZone: D }).format(e);
    return /* @__PURE__ */ c("div", { ref: R, className: y("zen-flex zen-w-full zen-flex-col zen-gap-2", F), ...H, children: [
      /* @__PURE__ */ c("div", { className: "zen-flex zen-flex-wrap zen-items-baseline zen-gap-x-4 zen-gap-y-1", children: [
        /* @__PURE__ */ a("span", { className: "zen-text-xl zen-font-bold zen-tabular-nums zen-text-zen-foreground", children: v === null ? "—" : n.t("rateBars.current", { rate: l(v) }) }),
        k !== null ? /* @__PURE__ */ a("span", { className: "zen-text-sm zen-tabular-nums zen-text-zen-foreground", children: n.t("rateBars.average", { rate: l(k) }) }) : null,
        r !== void 0 ? /* @__PURE__ */ a("span", { className: "zen-text-sm zen-tabular-nums zen-text-zen-muted-fg", children: n.t("rateBars.target", { rate: l(r) }) }) : null
      ] }),
      /* @__PURE__ */ c("div", { className: "zen-relative zen-h-28 zen-w-full zen-border-0 zen-border-b zen-border-solid zen-border-zen-border", "aria-hidden": "true", children: [
        /* @__PURE__ */ a("div", { className: "zen-absolute zen-inset-0 zen-grid zen-items-end zen-gap-px", style: { gridTemplateColumns: `repeat(${j}, minmax(0, 1fr))` }, children: m.map((e) => {
          const t = L(e.state);
          return /* @__PURE__ */ a(
            "div",
            {
              "data-tone": t,
              "data-partial": e.partial ? "" : void 0,
              title: `${n.t("rateBars.bucket", {
                from: i(e.start),
                to: i(e.end),
                count: l(e.count),
                state: n.t(S(e.state))
              })}${e.partial ? ` ${n.t("rateBars.filling")}` : ""}`,
              className: y("zen-rounded-t-zen-sm", K[t], e.partial && "zen-opacity-50"),
              style: {
                height: `${e.perHour / M * 100}%`,
                minHeight: "3px",
                ...e.partial ? { backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.55) 0 2px, transparent 2px 5px)" } : {}
              }
            },
            e.start
          );
        }) }),
        r !== void 0 ? /* @__PURE__ */ a(
          "span",
          {
            className: "zen-absolute zen-inset-x-0 zen-border-0 zen-border-t-2 zen-border-dashed zen-border-zen-foreground",
            style: { bottom: `${r / M * 100}%` }
          }
        ) : null
      ] }),
      /* @__PURE__ */ c("div", { className: "zen-flex zen-justify-between zen-text-xs zen-tabular-nums zen-text-zen-muted-fg", "aria-hidden": "true", children: [
        /* @__PURE__ */ a("span", { children: i(s) }),
        /* @__PURE__ */ a("span", { children: i(o) })
      ] })
    ] });
  }
);
q.displayName = "RateBars";
export {
  q as RateBars
};
//# sourceMappingURL=index139.js.map
