import { jsx as i, jsxs as L } from "react/jsx-runtime";
import * as a from "react";
import { cn as p } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { waveformPath as Y, formatMediaTime as Z, MIN_MEDIA_RANGE as ee, clampBadgePct as k, moveClip as X, dragClipEdge as B } from "./index30.js";
const ne = (z) => `color-mix(in srgb, var(--zen-color-primary) ${z}%, transparent)`, E = "zen-absolute zen-top-0.5 -zen-translate-x-1/2 zen-whitespace-nowrap zen-rounded-zen-sm zen-bg-zen-foreground zen-px-1.5 zen-text-xs zen-font-mono zen-text-zen-background zen-pointer-events-none zen-z-20", te = a.forwardRef(
  ({
    peaks: z,
    duration: s,
    audioDuration: u = s,
    clip: t,
    onClipChange: y,
    onClipInput: K,
    onClipCommit: S,
    onSeek: T,
    currentTime: P,
    zoom: W = 1,
    minClipDuration: f = ee,
    formatTime: m = Z,
    clipClass: $,
    label: j = "Audio waveform",
    className: U,
    ..._
  }, F) => {
    const N = a.useRef(null), [c, R] = a.useState(null), [b, D] = a.useState(null), [x, w] = a.useState(null), v = a.useRef(null), M = a.useRef(0), g = a.useRef(!1), d = (e) => e / s * 100, h = (e) => {
      const n = N.current;
      if (!n) return 0;
      const l = n.getBoundingClientRect();
      return Math.max(0, Math.min(1, (e - l.left) / l.width)) * s;
    }, G = a.useMemo(() => Y(z), [z]), H = t ? `${t.start / u * z.length} 0 ${(t.end - t.start) / u * z.length} 2` : "", O = (e) => (K ?? y)?.(e), A = (e, n) => {
      n.preventDefault(), n.stopPropagation(), n.target.setPointerCapture(n.pointerId), e === "move" && (M.current = h(n.clientX) - t.offset), R(e), w(null), v.current = null;
    }, V = (e) => {
      if (!c) {
        w(h(e.clientX));
        return;
      }
      e.preventDefault();
      const n = h(e.clientX), l = t;
      let r, o;
      c === "move" ? (r = X(l, n - M.current, s), o = r.offset) : (r = B(l, c, n, {
        audioDuration: u,
        laneDuration: s,
        minDuration: f
      }), o = c === "start" ? r.offset : r.offset + (r.end - r.start)), v.current = r, D({
        pct: k(d(o)),
        text: `${m(o)} · ${(r.end - r.start).toFixed(1)}s`
      }), O(r);
    }, q = () => {
      c && (v.current && (S?.(v.current), g.current = !0), R(null), D(null), v.current = null);
    }, J = (e) => {
      if (g.current) {
        g.current = !1;
        return;
      }
      T?.(h(e.clientX));
    }, C = (e, n) => {
      const l = n.key === "ArrowRight" ? 1 : n.key === "ArrowLeft" ? -1 : 0;
      if (!l) return;
      n.preventDefault();
      const r = l * (n.shiftKey ? 1 : f), o = t, Q = e === "move" ? X(o, o.offset + r, s) : B(o, e, (e === "start" ? o.offset : o.offset + (o.end - o.start)) + r, {
        audioDuration: u,
        laneDuration: s,
        minDuration: f
      });
      y?.(Q);
    }, I = (e) => /* @__PURE__ */ i(
      "svg",
      {
        "aria-hidden": "true",
        className: "zen-absolute zen-inset-0 zen-h-full zen-w-full zen-text-zen-primary zen-pointer-events-none",
        viewBox: e,
        preserveAspectRatio: "none",
        children: /* @__PURE__ */ i("path", { d: G, fill: "currentColor", fillOpacity: "0.7" })
      }
    );
    return /* @__PURE__ */ i("div", { ref: F, className: p("zen-flex zen-w-full zen-flex-col", U), ..._, children: /* @__PURE__ */ i("div", { className: "zen-w-full zen-overflow-x-auto zen-rounded-zen-md", children: /* @__PURE__ */ L(
      "div",
      {
        ref: N,
        role: "group",
        "aria-label": j,
        dir: "ltr",
        className: p(
          "zen-relative zen-h-12 zen-select-none zen-overflow-hidden zen-rounded-zen-md",
          "zen-border zen-border-zen-border zen-bg-zen-muted zen-cursor-crosshair"
        ),
        style: { width: `${W * 100}%`, minWidth: "100%" },
        onClick: J,
        onPointerDown: () => g.current = !1,
        onPointerMove: V,
        onPointerUp: q,
        onPointerLeave: () => w(null),
        children: [
          t === void 0 ? I(`0 0 ${Math.max(1, z.length)} 2`) : /* @__PURE__ */ L(
            "div",
            {
              role: "slider",
              tabIndex: 0,
              "aria-orientation": "horizontal",
              "aria-label": "Clip position",
              "aria-valuemin": 0,
              "aria-valuemax": s - (t.end - t.start),
              "aria-valuenow": t.offset,
              "aria-valuetext": m(t.offset),
              className: p(
                "zen-absolute zen-top-0 zen-h-full",
                c === "move" ? "zen-cursor-grabbing" : "zen-cursor-grab",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                $ ?? "zen-ring-1 zen-ring-zen-primary"
              ),
              style: {
                left: `${d(t.offset)}%`,
                width: `${d(t.end - t.start)}%`,
                ...$ ? {} : { background: ne(25) }
              },
              onClick: (e) => e.stopPropagation(),
              onPointerDown: (e) => A("move", e),
              onKeyDown: (e) => C("move", e),
              children: [
                I(H),
                ["start", "end"].map((e) => /* @__PURE__ */ i(
                  "div",
                  {
                    role: "slider",
                    tabIndex: 0,
                    "aria-orientation": "horizontal",
                    "aria-label": `Clip trim ${e}`,
                    "aria-valuemin": e === "start" ? 0 : t.start + f,
                    "aria-valuemax": e === "start" ? t.end - f : u,
                    "aria-valuenow": t[e],
                    "aria-valuetext": m(t[e]),
                    className: p(
                      "zen-absolute zen-top-0 zen-h-full zen-w-2 zen-cursor-ew-resize",
                      "zen-bg-zen-primary hover:zen-opacity-80",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      e === "start" ? "zen-left-0" : "zen-right-0"
                    ),
                    onPointerDown: (n) => A(e, n),
                    onKeyDown: (n) => C(e, n)
                  },
                  e
                ))
              ]
            }
          ),
          P !== void 0 && s > 0 ? /* @__PURE__ */ i(
            "div",
            {
              className: "zen-absolute zen-top-0 zen-h-full zen-w-px zen-bg-zen-foreground zen-pointer-events-none zen-z-10",
              style: { left: `${d(P)}%` }
            }
          ) : null,
          x !== null && !c ? /* @__PURE__ */ i("div", { className: E, style: { left: `${k(d(x))}%` }, children: m(x) }) : null,
          b ? /* @__PURE__ */ i("div", { className: E, style: { left: `${b.pct}%` }, children: b.text }) : null
        ]
      }
    ) }) });
  }
);
te.displayName = "Waveform";
export {
  te as Waveform
};
//# sourceMappingURL=index29.js.map
