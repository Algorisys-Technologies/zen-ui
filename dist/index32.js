import { jsx as i, jsxs as C } from "react/jsx-runtime";
import * as a from "react";
import { cn as b } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { waveformPath as ee, formatMediaTime as ne, MIN_MEDIA_RANGE as te, clampBadgePct as E, moveClip as S, dragClipEdge as W } from "./index33.js";
import { useLocale as re } from "./index90.js";
const oe = (c) => `color-mix(in srgb, var(--zen-color-primary) ${c}%, transparent)`, X = "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20", se = a.forwardRef(
  ({
    peaks: c,
    duration: s,
    audioDuration: z = s,
    clip: t,
    onClipChange: P,
    onClipInput: B,
    onClipCommit: K,
    onSeek: T,
    currentTime: N,
    zoom: j = 1,
    minClipDuration: u = te,
    formatTime: d = ne,
    clipClass: $,
    label: U,
    className: _,
    ...F
  }, G) => {
    const p = re(), H = U ?? p.t("waveform.audioWaveform"), R = a.useRef(null), [f, D] = a.useState(null), [w, M] = a.useState(null), [x, y] = a.useState(null), v = a.useRef(null), I = a.useRef(0), g = a.useRef(!1), m = (e) => e / s * 100, h = (e) => {
      const n = R.current;
      if (!n) return 0;
      const l = n.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e - l.left) / l.width)) * s;
    }, O = a.useMemo(() => ee(c), [c]), V = t ? `${t.start / z * c.length} 0 ${(t.end - t.start) / z * c.length} 2` : "", q = (e) => (B ?? P)?.(e), L = (e, n) => {
      n.preventDefault(), n.stopPropagation(), n.target.setPointerCapture(n.pointerId), e === "move" && (I.current = h(n.clientX) - t.offset), D(e), y(null), v.current = null;
    }, J = (e) => {
      if (!f) {
        y(h(e.clientX));
        return;
      }
      e.preventDefault();
      const n = h(e.clientX), l = t;
      let r, o;
      f === "move" ? (r = S(l, n - I.current, s), o = r.offset) : (r = W(l, f, n, {
        audioDuration: z,
        laneDuration: s,
        minDuration: u
      }), o = f === "start" ? r.offset : r.offset + (r.end - r.start)), v.current = r, M({
        pct: E(m(o)),
        text: `${d(o)} · ${(r.end - r.start).toFixed(1)}s`
      }), q(r);
    }, Q = () => {
      f && (v.current && (K?.(v.current), g.current = !0), D(null), M(null), v.current = null);
    }, Y = (e) => {
      if (g.current) {
        g.current = !1;
        return;
      }
      T?.(h(e.clientX));
    }, A = (e, n) => {
      const l = n.key === "ArrowRight" ? 1 : n.key === "ArrowLeft" ? -1 : 0;
      if (!l) return;
      n.preventDefault();
      const r = l * (n.shiftKey ? 1 : u), o = t, Z = e === "move" ? S(o, o.offset + r, s) : W(o, e, (e === "start" ? o.offset : o.offset + (o.end - o.start)) + r, {
        audioDuration: z,
        laneDuration: s,
        minDuration: u
      });
      P?.(Z);
    }, k = (e) => /* @__PURE__ */ i(
      "svg",
      {
        "aria-hidden": "true",
        className: "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none",
        viewBox: e,
        preserveAspectRatio: "none",
        children: /* @__PURE__ */ i("path", { d: O, fill: "currentColor", fillOpacity: "0.7" })
      }
    );
    return /* @__PURE__ */ i("div", { ref: G, className: b("zen-flex zen-w-full zen-flex-col", _), ...F, children: /* @__PURE__ */ i("div", { className: "zen-w-full zen-overflow-x-auto zen-rounded-zen-md", children: /* @__PURE__ */ C(
      "div",
      {
        ref: R,
        role: "group",
        "aria-label": H,
        dir: "ltr",
        className: b(
          "zen-relative zen-h-12 zen-select-none zen-overflow-hidden zen-rounded-zen-md",
          "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"
        ),
        style: { width: `${j * 100}%`, minWidth: "100%" },
        onClick: Y,
        onPointerDown: () => g.current = !1,
        onPointerMove: J,
        onPointerUp: Q,
        onPointerLeave: () => y(null),
        children: [
          t === void 0 ? k(`0 0 ${Math.max(1, c.length)} 2`) : /* @__PURE__ */ C(
            "div",
            {
              role: "slider",
              tabIndex: 0,
              "aria-orientation": "horizontal",
              "aria-label": p.t("waveform.clipPosition"),
              "aria-valuemin": 0,
              "aria-valuemax": s - (t.end - t.start),
              "aria-valuenow": t.offset,
              "aria-valuetext": d(t.offset),
              className: b(
                "zen-absolute zen-top-0 zen-h-full",
                f === "move" ? "zen-cursor-grabbing" : "zen-cursor-grab",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                $ ?? "zen-ring-1 zen-ring-zen-primary"
              ),
              style: {
                left: `${m(t.offset)}%`,
                width: `${m(t.end - t.start)}%`,
                ...$ ? {} : { background: oe(25) }
              },
              onClick: (e) => e.stopPropagation(),
              onPointerDown: (e) => L("move", e),
              onKeyDown: (e) => A("move", e),
              children: [
                k(V),
                ["start", "end"].map((e) => /* @__PURE__ */ i(
                  "div",
                  {
                    role: "slider",
                    tabIndex: 0,
                    "aria-orientation": "horizontal",
                    "aria-label": p.t(e === "start" ? "waveform.trimStart" : "waveform.trimEnd"),
                    "aria-valuemin": e === "start" ? 0 : t.start + u,
                    "aria-valuemax": e === "start" ? t.end - u : z,
                    "aria-valuenow": t[e],
                    "aria-valuetext": d(t[e]),
                    className: b(
                      "zen-absolute zen-top-0 zen-h-full zen-w-2 zen-cursor-ew-resize",
                      "zen-bg-zen-primary hover:zen-opacity-80",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      e === "start" ? "zen-left-0" : "zen-right-0"
                    ),
                    onPointerDown: (n) => L(e, n),
                    onKeyDown: (n) => A(e, n)
                  },
                  e
                ))
              ]
            }
          ),
          N !== void 0 && s > 0 ? /* @__PURE__ */ i(
            "div",
            {
              className: "zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10",
              style: { left: `${m(N)}%` }
            }
          ) : null,
          x !== null && !f ? /* @__PURE__ */ i("div", { className: X, style: { left: `${E(m(x))}%` }, children: d(x) }) : null,
          w ? /* @__PURE__ */ i("div", { className: X, style: { left: `${w.pct}%` }, children: w.text }) : null
        ]
      }
    ) }) });
  }
);
se.displayName = "Waveform";
export {
  se as Waveform
};
//# sourceMappingURL=index32.js.map
