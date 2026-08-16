import { jsxs as x, jsx as a } from "react/jsx-runtime";
import * as o from "react";
import { cn as u } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { remainingMs as p, DEFAULT_COUNTDOWN_THRESHOLDS as N, formatCountdown as y, countdownLevel as L, crossedThresholds as R } from "./index122.js";
const D = {
  normal: "zen-text-zen-foreground",
  warning: "zen-text-zen-warning",
  critical: "zen-text-zen-error",
  expired: "zen-text-zen-muted-fg"
}, C = {
  normal: "zen-bg-zen-muted zen-text-zen-foreground",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  critical: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  expired: "zen-bg-zen-muted zen-text-zen-muted-fg"
}, S = 1e3, h = ({ deadline: n, thresholds: r, onExpire: s, onThreshold: i, paused: c }) => {
  const t = r ?? N, [e, z] = o.useState(() => p(n, Date.now())), g = o.useRef(s), v = o.useRef(i);
  g.current = s, v.current = i;
  const f = o.useRef(!1), l = o.useRef(e);
  return o.useEffect(() => {
    f.current = !1, l.current = p(n, Date.now()), z(l.current);
  }, [n]), o.useEffect(() => {
    if (c) return;
    const d = () => {
      const m = p(n, Date.now()), E = R(l.current, m, t);
      l.current = m, z(m);
      for (const T of E) v.current?.(T);
      m <= 0 && !f.current && (f.current = !0, g.current?.());
    };
    d();
    const w = setInterval(d, S), b = () => {
      document.hidden || d();
    };
    return document.addEventListener("visibilitychange", b), () => {
      clearInterval(w), document.removeEventListener("visibilitychange", b);
    };
  }, [n, c, t]), { ms: e, level: L(e, t), text: y(e) };
}, _ = ({
  label: n,
  variant: r = "soft",
  size: s = "md",
  className: i,
  ...c
}) => {
  const { ms: t, level: e, text: z } = h(c);
  return /* @__PURE__ */ x(
    "span",
    {
      role: "timer",
      "aria-live": "off",
      "aria-label": typeof n == "string" ? `${n}: ${z} remaining` : `${z} remaining`,
      "data-level": e,
      className: u(
        "zen-inline-flex zen-items-center zen-gap-2 zen-font-medium zen-tabular-nums",
        s === "sm" ? "zen-text-xs" : "zen-text-sm",
        r === "soft" && u("zen-rounded-zen-full zen-px-3 zen-py-1", C[e]),
        r === "bare" && D[e],
        /* The last minute pulses. Colour alone fails a colour-blind candidate,
           and this is the one moment the component must not be missable. */
        e === "critical" && "zen-animate-pulse motion-reduce:zen-animate-none",
        i
      ),
      children: [
        n ? /* @__PURE__ */ a("span", { className: "zen-font-normal zen-opacity-80", children: n }) : null,
        /* @__PURE__ */ a("span", { className: u(s === "sm" ? "zen-text-sm" : "zen-text-base", "zen-font-semibold"), children: z }),
        e === "critical" && t > 0 ? /* @__PURE__ */ a("span", { className: "zen-sr-only", children: "Less than a minute remaining" }) : null,
        e === "expired" ? /* @__PURE__ */ a("span", { className: "zen-sr-only", children: "Time is up" }) : null
      ]
    }
  );
}, $ = ({
  title: n,
  children: r,
  actions: s,
  sticky: i = !0,
  className: c,
  ...t
}) => {
  const { level: e } = h({ ...t, onExpire: void 0, onThreshold: void 0 });
  return /* @__PURE__ */ x(
    "header",
    {
      "data-level": e,
      className: u(
        "zen-flex zen-w-full zen-flex-wrap zen-items-center zen-gap-3 zen-border-b zen-px-4 zen-py-2",
        "zen-bg-zen-background",
        e === "critical" ? "zen-border-zen-error" : "zen-border-zen-border",
        /* z-30 matches Banner's sticky layer, so two sticky bars in one app
           stack in a predictable order rather than by DOM accident. */
        i && "zen-sticky zen-top-0 zen-z-30",
        c
      ),
      children: [
        n ? /* @__PURE__ */ a("span", { className: "zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: n }) : null,
        r ? /* @__PURE__ */ a("div", { className: "zen-flex zen-min-w-0 zen-items-center zen-gap-3", children: r }) : null,
        /* @__PURE__ */ x("div", { className: "zen-ms-auto zen-flex zen-items-center zen-gap-2", children: [
          /* @__PURE__ */ a(_, { label: "Time left", ...t }),
          s
        ] })
      ]
    }
  );
};
export {
  $ as TestCountdownBar,
  _ as TimerBadge
};
//# sourceMappingURL=index121.js.map
