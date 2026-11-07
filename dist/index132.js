import { jsxs as g, jsx as i } from "react/jsx-runtime";
import * as c from "react";
import { cn as f } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { remainingMs as x, DEFAULT_COUNTDOWN_THRESHOLDS as N, formatCountdown as y, countdownLevel as R, crossedThresholds as D } from "./index133.js";
import { useLocale as v } from "./index90.js";
const C = {
  normal: "zen-text-zen-foreground",
  warning: "zen-text-zen-warning-text",
  critical: "zen-text-zen-error",
  expired: "zen-text-zen-muted-fg"
}, S = {
  normal: "zen-bg-zen-muted zen-text-zen-foreground",
  warning: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg",
  critical: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
  expired: "zen-bg-zen-muted zen-text-zen-muted-fg"
}, _ = 1e3, h = ({ deadline: e, thresholds: o, onExpire: s, onThreshold: a, paused: z }) => {
  const t = o ?? N, [r, n] = c.useState(() => x(e, Date.now())), l = c.useRef(s), w = c.useRef(a);
  l.current = s, w.current = a;
  const d = c.useRef(!1), m = c.useRef(r);
  return c.useEffect(() => {
    d.current = !1, m.current = x(e, Date.now()), n(m.current);
  }, [e]), c.useEffect(() => {
    if (z) return;
    const p = () => {
      const u = x(e, Date.now()), T = D(m.current, u, t);
      m.current = u, n(u);
      for (const L of T) w.current?.(L);
      u <= 0 && !d.current && (d.current = !0, l.current?.());
    };
    p();
    const E = setInterval(p, _), b = () => {
      document.hidden || p();
    };
    return document.addEventListener("visibilitychange", b), () => {
      clearInterval(E), document.removeEventListener("visibilitychange", b);
    };
  }, [e, z, t]), { ms: r, level: R(r, t), text: y(r) };
}, k = ({
  label: e,
  variant: o = "soft",
  size: s = "md",
  className: a,
  ...z
}) => {
  const t = v(), { ms: r, level: n, text: l } = h(z);
  return /* @__PURE__ */ g(
    "span",
    {
      role: "timer",
      "aria-live": "off",
      "aria-label": typeof e == "string" ? t.t("countdown.labelRemaining", { label: e, time: l }) : t.t("countdown.remaining", { time: l }),
      "data-level": n,
      className: f(
        "zen-inline-flex zen-items-center zen-gap-2 zen-font-medium zen-tabular-nums",
        s === "sm" ? "zen-text-xs" : "zen-text-sm",
        o === "soft" && f("zen-rounded-zen-full zen-px-3 zen-py-1", S[n]),
        o === "bare" && C[n],
        /* The last minute pulses. Colour alone fails a colour-blind candidate,
           and this is the one moment the component must not be missable. */
        n === "critical" && "zen-animate-pulse motion-reduce:zen-animate-none",
        a
      ),
      children: [
        e ? /* @__PURE__ */ i("span", { className: "zen-font-normal zen-opacity-80", children: e }) : null,
        /* @__PURE__ */ i("span", { className: f(s === "sm" ? "zen-text-sm" : "zen-text-base", "zen-font-semibold"), children: l }),
        n === "critical" && r > 0 ? /* @__PURE__ */ i("span", { className: "zen-sr-only", children: t.t("countdown.lessThanAMinuteRemaining") }) : null,
        n === "expired" ? /* @__PURE__ */ i("span", { className: "zen-sr-only", children: t.t("countdown.timeIsUp") }) : null
      ]
    }
  );
}, A = ({
  title: e,
  children: o,
  actions: s,
  sticky: a = !0,
  className: z,
  ...t
}) => {
  const r = v(), { level: n } = h({ ...t, onExpire: void 0, onThreshold: void 0 });
  return /* @__PURE__ */ g(
    "header",
    {
      "data-level": n,
      className: f(
        "zen-flex zen-w-full zen-flex-wrap zen-items-center zen-gap-3 zen-border-b zen-px-4 zen-py-2",
        "zen-bg-zen-background",
        n === "critical" ? "zen-border-zen-error" : "zen-border-zen-border",
        /* z-30 matches Banner's sticky layer, so two sticky bars in one app
           stack in a predictable order rather than by DOM accident. */
        a && "zen-sticky zen-top-0 zen-z-30",
        z
      ),
      children: [
        e ? /* @__PURE__ */ i("span", { className: "zen-truncate zen-text-sm zen-font-medium zen-text-zen-foreground", children: e }) : null,
        o ? /* @__PURE__ */ i("div", { className: "zen-flex zen-min-w-0 zen-items-center zen-gap-3", children: o }) : null,
        /* @__PURE__ */ g("div", { className: "zen-ms-auto zen-flex zen-items-center zen-gap-2", children: [
          /* @__PURE__ */ i(k, { label: r.t("countdown.timeLeft"), ...t }),
          s
        ] })
      ]
    }
  );
};
export {
  A as TestCountdownBar,
  k as TimerBadge
};
//# sourceMappingURL=index132.js.map
