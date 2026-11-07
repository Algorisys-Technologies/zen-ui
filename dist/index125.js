import { jsx as D, jsxs as j } from "react/jsx-runtime";
import * as e from "react";
import { cn as I } from "./index160.js";
import { directionOf as M } from "./index168.js";
import "./index28.js";
import "./index110.js";
import { normalizeSizes as A, dragHandle as B, mirrorDelta as E, handleBounds as K, splitterKeyDelta as O } from "./index126.js";
import { useLocale as q } from "./index90.js";
const F = e.createContext(null), H = () => {
  const o = e.useContext(F);
  if (!o) throw new Error("SplitterPanel and SplitterHandle must be inside a Splitter.");
  return o;
}, Q = ({
  orientation: o = "horizontal",
  sizes: u,
  defaultSizes: h,
  onSizesChange: f,
  onSizesCommit: g,
  disabled: n = !1,
  className: x,
  children: c
}) => {
  const r = e.useRef([]), p = e.useRef([]), [d, v] = e.useState(0), [z, l] = e.useState(h ?? []), [i, R] = e.useState(!1), b = e.useMemo(
    () => A(u ?? (z.length ? z : void 0), d),
    [u, z, d]
  ), S = e.useRef(b);
  S.current = b;
  const y = e.useRef({ onSizesChange: f, onSizesCommit: g });
  y.current = { onSizesChange: f, onSizesCommit: g };
  const a = e.useRef(0), w = e.useRef(null), t = e.useCallback(() => {
    if (a.current = 0, !w.current) return;
    const s = w.current;
    w.current = null, u === void 0 && l(s), y.current.onSizesChange?.(s);
  }, [u]);
  e.useEffect(() => () => {
    a.current && cancelAnimationFrame(a.current);
  }, []);
  const m = e.useMemo(
    () => ({
      orientation: o,
      sizes: b,
      disabled: n,
      registerPanel: (s, P) => {
        const C = r.current.length;
        return r.current.push(s), p.current.push(P), v(r.current.length), C;
      },
      registerHandle: () => Math.max(0, r.current.length - 1),
      panelId: (s) => p.current[s] ?? "",
      boundsOf: (s) => K(S.current, s, r.current.map((P) => P())),
      dragFrom: (s, P, C, k) => {
        n || (w.current = B(
          P,
          s,
          E(C, o, k),
          r.current.map((N) => N())
        ), a.current || (a.current = requestAnimationFrame(t)));
      },
      commit: () => {
        a.current && (cancelAnimationFrame(a.current), t()), R(!1), y.current.onSizesCommit?.(S.current);
      },
      beginDrag: () => R(!0)
    }),
    [o, b, n, t]
  );
  return /* @__PURE__ */ D(F.Provider, { value: m, children: /* @__PURE__ */ D(
    "div",
    {
      "data-orientation": o,
      "data-dragging": i ? "" : void 0,
      className: I(
        "zen-flex zen-h-full zen-w-full zen-overflow-hidden",
        o === "horizontal" ? "zen-flex-row" : "zen-flex-col",
        /* The resize cursor is held across the WHOLE splitter while a drag is
           live. The handle is a 1px line with a padded hit area, so the pointer
           spends most of a fast drag over a panel — without this it flickers
           back to the default arrow mid-gesture. */
        i && (o === "horizontal" ? "zen-cursor-col-resize" : "zen-cursor-row-resize"),
        i && "zen-select-none",
        x
      ),
      children: c
    }
  ) });
}, T = ({ min: o, max: u, collapsible: h, collapsedSize: f, className: g, children: n }) => {
  const x = H(), c = e.useId(), r = e.useRef({ min: o, max: u, collapsible: h, collapsedSize: f });
  r.current = { min: o, max: u, collapsible: h, collapsedSize: f };
  const [p] = e.useState(() => x.registerPanel(() => r.current, c)), d = x.sizes[p] ?? 0, v = d <= (f ?? 0) + 1e-6;
  return /* @__PURE__ */ D(
    "div",
    {
      id: c,
      "data-state": v ? "collapsed" : "expanded",
      style: { flexBasis: `${d}%`, flexGrow: 0, flexShrink: 0 },
      className: I("zen-min-h-0 zen-min-w-0 zen-overflow-auto", g),
      children: n
    }
  );
}, V = ({ label: o, disabled: u, className: h, children: f }) => {
  const g = q(), n = H(), x = e.useId(), [c] = e.useState(() => n.registerHandle()), r = e.useRef(null), p = e.useRef(0), d = e.useRef(1), v = e.useRef([]), z = e.useRef(!1), l = n.disabled || (u ?? !1), i = n.orientation === "horizontal", R = n.boundsOf(c), b = n.sizes[c] ?? 0, S = (t) => {
    if (l) return;
    t.preventDefault(), r.current?.focus();
    try {
      r.current?.setPointerCapture(t.pointerId);
    } catch {
    }
    z.current = !0, n.beginDrag(), p.current = i ? t.clientX : t.clientY, v.current = [...n.sizes];
    const m = r.current?.parentElement?.getBoundingClientRect();
    d.current = Math.max(1, i ? m?.width ?? 1 : m?.height ?? 1);
  }, y = (t) => {
    if (l || !z.current) return;
    const s = ((i ? t.clientX : t.clientY) - p.current) / d.current * 100;
    n.dragFrom(c, v.current, s, M(r.current));
  }, a = (t) => {
    if (z.current) {
      z.current = !1;
      try {
        r.current?.releasePointerCapture(t.pointerId);
      } catch {
      }
      n.commit();
    }
  }, w = (t) => {
    if (l) return;
    const m = O(t.key, n.orientation, t.shiftKey);
    m !== null && (t.preventDefault(), n.dragFrom(c, n.sizes, m, M(r.current)), n.commit());
  };
  return /* @__PURE__ */ j(
    "div",
    {
      ref: r,
      id: x,
      role: "separator",
      tabIndex: l ? -1 : 0,
      "aria-orientation": i ? "vertical" : "horizontal",
      "aria-label": o ?? g.t("splitter.resizePanels"),
      "aria-controls": n.panelId(c),
      "aria-valuenow": Math.round(b),
      "aria-valuemin": Math.round(R.min),
      "aria-valuemax": Math.round(R.max),
      "aria-disabled": l || void 0,
      onPointerDown: S,
      onPointerMove: y,
      onPointerUp: a,
      onPointerCancel: a,
      onKeyDown: w,
      className: I(
        "zen-group zen-relative zen-flex zen-shrink-0 zen-items-center zen-justify-center",
        /*
         * The hit area, and ONLY the hit area — it paints nothing itself.
         *
         * The line used to be this element, sized `w-px` with padding for touch.
         * Under `box-sizing: border-box` the padding eats the width, so the
         * content box came out 0px wide and the divider was invisible. The line
         * is its own child now, which is the only arrangement where the visible
         * width and the grabbable width are independent.
         */
        i ? "zen-w-3 -zen-mx-1.5 zen-cursor-col-resize" : "zen-h-3 -zen-my-1.5 zen-cursor-row-resize",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        /* Or the page scrolls instead of the splitter moving. */
        "zen-touch-none",
        l && "zen-cursor-default zen-opacity-60",
        h
      ),
      children: [
        /* @__PURE__ */ D(
          "span",
          {
            "aria-hidden": !0,
            className: I(
              "zen-pointer-events-none zen-bg-zen-border zen-transition-colors",
              i ? "zen-h-full zen-w-px" : "zen-h-px zen-w-full",
              !l && "group-hover:zen-bg-zen-primary group-focus-visible:zen-bg-zen-primary"
            )
          }
        ),
        f
      ]
    }
  );
};
export {
  Q as Splitter,
  V as SplitterHandle,
  T as SplitterPanel
};
//# sourceMappingURL=index125.js.map
