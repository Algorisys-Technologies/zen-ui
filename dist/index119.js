import { jsxs as N, Fragment as ae, jsx as r } from "react/jsx-runtime";
import * as a from "react";
import { cn as g } from "./index197.js";
import { directionOf as ie } from "./index205.js";
import "./index28.js";
import "./index110.js";
import { machineStateMessageKey as j } from "./index116.js";
import { layoutStateTimeline as oe, layoutTimelineEvents as re, timelineTicks as se, stateTimelineTotals as le, durationMessage as ce } from "./index120.js";
import { useLocale as de } from "./index90.js";
const O = {
  running: "zen-bg-zen-state-running",
  down: "zen-bg-zen-state-down",
  setup: "zen-bg-zen-state-setup",
  planned: "zen-bg-zen-state-planned",
  idle: "zen-bg-zen-state-idle",
  unknown: ""
}, ue = {
  backgroundImage: "repeating-linear-gradient(135deg, var(--zen-state-unknown) 0 1px, transparent 1px 6px)"
}, me = {
  sm: "zen-h-3",
  md: "zen-h-6",
  lg: "zen-h-10"
};
function ze(s, u) {
  const [x, p] = a.useState(() => Date.now());
  return a.useEffect(() => {
    if (!u) return;
    p(Date.now());
    const m = setInterval(() => p(Date.now()), s);
    return () => clearInterval(m);
  }, [s, u]), x;
}
const W = (s) => ({
  insetInlineStart: `${s.left * 100}%`,
  width: `${s.width * 100}%`,
  // True position, never moved; a stop too short to see still gets 2px.
  minWidth: "2px",
  ...s.tone === "unknown" ? ue : {}
}), fe = a.forwardRef(
  ({
    label: s,
    segments: u,
    from: x,
    to: p,
    now: m,
    events: k,
    timeZone: z,
    onSegmentClick: I,
    isSegmentClickable: R,
    selectedId: h,
    hideAxis: C,
    size: K,
    className: q,
    ...G
  }, B) => {
    const t = de(), J = ze(3e4, m === void 0), Q = m === void 0 ? J : m, n = +x, i = +p, c = +Q, y = a.useMemo(
      () => oe(u, { from: n, to: i, now: c }),
      [u, n, i, c]
    ), T = a.useMemo(
      () => re(k ?? [], { from: n, to: i }),
      [k, n, i, c]
    ), [b, U] = a.useState(576), $ = a.useMemo(
      () => se(n, i, { timeZone: z, maxTicks: Math.max(2, Math.floor(b / 88)) }),
      [n, i, z, b]
    ), D = c > n && c < i ? (c - n) / (i - n) : null, V = new Intl.DateTimeFormat(
      t.locale,
      $.stepMs >= 24 * 36e5 ? { month: "short", day: "numeric", timeZone: z } : { hour: "2-digit", minute: "2-digit", timeZone: z }
    ), l = (e) => new Intl.DateTimeFormat(t.locale, { hour: "2-digit", minute: "2-digit", timeZone: z }).format(e), M = (e) => {
      const o = ce(e);
      return t.t(o.key, o.values);
    }, A = (e) => e.label ?? t.t(j(e.state)), S = (e) => e.open ? t.t("stateTimeline.ongoing", { state: A(e), from: l(e.start), duration: M(e.durationMs) }) : t.t("stateTimeline.segment", {
      state: A(e),
      from: l(e.start),
      to: l(e.end),
      duration: M(e.durationMs)
    }), X = t.t("stateTimeline.summary", {
      label: s,
      from: l(n),
      to: l(i),
      totals: le(y).map((e) => t.t("stateTimeline.total", { state: t.t(j(e.state)), duration: M(e.ms) })).join(", ")
    }), F = I !== void 0, L = (e) => F && (R ? R(e) : !e.gap), d = y.filter(L), [Y, E] = a.useState(), _ = Y ?? h, H = d.find((e) => e.id === _)?.id ?? d[0]?.id, w = a.useRef(null);
    a.useEffect(() => {
      const e = w.current;
      if (!e || typeof ResizeObserver > "u") return;
      const o = new ResizeObserver(([v]) => U(v.contentRect.width));
      return o.observe(e), () => o.disconnect();
    }, []);
    const P = (e) => {
      E(e), w.current?.querySelector(`[data-segment-id="${CSS.escape(e)}"]`)?.focus();
    }, Z = (e) => {
      if (!F) return;
      const o = d.findIndex((ne) => ne.id === H);
      if (o < 0) return;
      const v = ie(w.current) === "rtl", ee = v ? "ArrowLeft" : "ArrowRight", te = v ? "ArrowRight" : "ArrowLeft";
      let f = -1;
      if (e.key === ee) f = Math.min(d.length - 1, o + 1);
      else if (e.key === te) f = Math.max(0, o - 1);
      else if (e.key === "Home") f = 0;
      else if (e.key === "End") f = d.length - 1;
      else return;
      e.preventDefault(), P(d[f].id);
    };
    return /* @__PURE__ */ N(
      "div",
      {
        ref: B,
        role: "group",
        "aria-label": X,
        className: g("zen-flex zen-w-full zen-flex-col zen-gap-1", q),
        ...G,
        children: [
          T.length > 0 && /* @__PURE__ */ N(ae, { children: [
            /* @__PURE__ */ r("div", { className: "zen-relative zen-h-2", "aria-hidden": "true", children: T.map((e) => /* @__PURE__ */ r(
              "span",
              {
                className: "zen-absolute zen-top-0 zen-h-2 zen-w-2 -zen-translate-x-1/2 zen-rotate-45 zen-rounded-zen-sm zen-bg-zen-foreground rtl:zen-translate-x-1/2",
                style: { insetInlineStart: `${e.left * 100}%` },
                title: `${l(e.at)} ${e.label}`
              },
              e.id
            )) }),
            /* @__PURE__ */ r("ul", { className: "zen-sr-only", "aria-label": t.t("stateTimeline.events"), children: T.map((e) => /* @__PURE__ */ r("li", { children: t.t("stateTimeline.event", { time: l(e.at), label: e.label }) }, e.id)) })
          ] }),
          /* @__PURE__ */ N(
            "div",
            {
              ref: w,
              className: g(
                "zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-sm zen-bg-zen-muted",
                me[K ?? "md"]
              ),
              onKeyDown: Z,
              children: [
                y.map(
                  (e) => L(e) ? /* @__PURE__ */ r(
                    "button",
                    {
                      type: "button",
                      "data-segment-id": e.id,
                      "data-tone": e.tone,
                      "aria-label": S(e),
                      "aria-pressed": h === void 0 ? void 0 : h === e.id,
                      title: S(e),
                      tabIndex: H === e.id ? 0 : -1,
                      className: g(
                        "zen-absolute zen-inset-y-0 zen-m-0 zen-cursor-pointer zen-border-0 zen-p-0",
                        "hover:zen-brightness-110 focus-visible:zen-z-10 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                        h === e.id && "zen-z-10 zen-ring-2 zen-ring-zen-foreground zen-ring-inset",
                        O[e.tone]
                      ),
                      style: W(e),
                      onFocus: () => E(e.id),
                      onClick: () => I?.(e)
                    },
                    e.id
                  ) : /* @__PURE__ */ r(
                    "div",
                    {
                      "aria-hidden": "true",
                      "data-tone": e.tone,
                      className: g("zen-absolute zen-inset-y-0", O[e.tone]),
                      style: W(e),
                      title: S(e)
                    },
                    e.id
                  )
                ),
                D !== null && /* @__PURE__ */ r(
                  "span",
                  {
                    "aria-hidden": "true",
                    className: "zen-absolute zen-inset-y-0 zen-w-px zen-bg-zen-foreground",
                    style: { insetInlineStart: `${D * 100}%` }
                  }
                )
              ]
            }
          ),
          !C && /* @__PURE__ */ r("div", { className: "zen-relative zen-h-4 zen-text-xs zen-text-zen-muted-fg zen-tabular-nums", "aria-hidden": "true", children: $.ticks.map((e) => /* @__PURE__ */ r(
            "span",
            {
              className: g(
                "zen-absolute zen-top-0 zen-whitespace-nowrap",
                // A label within half a label's width of either end is
                // aligned to that end instead of centred, so it never hangs
                // past the strip. Measured in pixels: a percentage threshold
                // let a tick 13px in overflow by 12px on a narrow strip.
                e.left * b < 32 ? "" : (1 - e.left) * b < 32 ? "-zen-translate-x-full rtl:zen-translate-x-full" : "-zen-translate-x-1/2 rtl:zen-translate-x-1/2"
              ),
              style: { insetInlineStart: `${e.left * 100}%` },
              children: V.format(e.at)
            },
            e.at
          )) })
        ]
      }
    );
  }
);
fe.displayName = "StateTimeline";
export {
  fe as StateTimeline
};
//# sourceMappingURL=index119.js.map
