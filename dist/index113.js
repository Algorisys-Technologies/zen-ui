import { jsx as P, jsxs as j } from "react/jsx-runtime";
import * as e from "react";
import { cn as D } from "./index143.js";
import { directionOf as M } from "./index148.js";
import "./index24.js";
import "./index98.js";
import { normalizeSizes as A, dragHandle as B, mirrorDelta as E, handleBounds as K, splitterKeyDelta as O } from "./index114.js";
const F = e.createContext(null), H = () => {
  const t = e.useContext(F);
  if (!t) throw new Error("SplitterPanel and SplitterHandle must be inside a Splitter.");
  return t;
}, J = ({
  orientation: t = "horizontal",
  sizes: l,
  defaultSizes: x,
  onSizesChange: d,
  onSizesCommit: n,
  disabled: h = !1,
  className: i,
  children: o
}) => {
  const s = e.useRef([]), g = e.useRef([]), [z, m] = e.useState(0), [c, p] = e.useState(x ?? []), [v, y] = e.useState(!1), b = e.useMemo(
    () => A(l ?? (c.length ? c : void 0), z),
    [l, c, z]
  ), R = e.useRef(b);
  R.current = b;
  const w = e.useRef({ onSizesChange: d, onSizesCommit: n });
  w.current = { onSizesChange: d, onSizesCommit: n };
  const f = e.useRef(0), r = e.useRef(null), a = e.useCallback(() => {
    if (f.current = 0, !r.current) return;
    const u = r.current;
    r.current = null, l === void 0 && p(u), w.current.onSizesChange?.(u);
  }, [l]);
  e.useEffect(() => () => {
    f.current && cancelAnimationFrame(f.current);
  }, []);
  const I = e.useMemo(
    () => ({
      orientation: t,
      sizes: b,
      disabled: h,
      registerPanel: (u, S) => {
        const C = s.current.length;
        return s.current.push(u), g.current.push(S), m(s.current.length), C;
      },
      registerHandle: () => Math.max(0, s.current.length - 1),
      panelId: (u) => g.current[u] ?? "",
      boundsOf: (u) => K(R.current, u, s.current.map((S) => S())),
      dragFrom: (u, S, C, k) => {
        h || (r.current = B(
          S,
          u,
          E(C, t, k),
          s.current.map((N) => N())
        ), f.current || (f.current = requestAnimationFrame(a)));
      },
      commit: () => {
        f.current && (cancelAnimationFrame(f.current), a()), y(!1), w.current.onSizesCommit?.(R.current);
      },
      beginDrag: () => y(!0)
    }),
    [t, b, h, a]
  );
  return /* @__PURE__ */ P(F.Provider, { value: I, children: /* @__PURE__ */ P(
    "div",
    {
      "data-orientation": t,
      "data-dragging": v ? "" : void 0,
      className: D(
        "zen-flex zen-h-full zen-w-full zen-overflow-hidden",
        t === "horizontal" ? "zen-flex-row" : "zen-flex-col",
        /* The resize cursor is held across the WHOLE splitter while a drag is
           live. The handle is a 1px line with a padded hit area, so the pointer
           spends most of a fast drag over a panel — without this it flickers
           back to the default arrow mid-gesture. */
        v && (t === "horizontal" ? "zen-cursor-col-resize" : "zen-cursor-row-resize"),
        v && "zen-select-none",
        i
      ),
      children: o
    }
  ) });
}, L = ({ min: t, max: l, collapsible: x, collapsedSize: d, className: n, children: h }) => {
  const i = H(), o = e.useId(), s = e.useRef({ min: t, max: l, collapsible: x, collapsedSize: d });
  s.current = { min: t, max: l, collapsible: x, collapsedSize: d };
  const [g] = e.useState(() => i.registerPanel(() => s.current, o)), z = i.sizes[g] ?? 0, m = z <= (d ?? 0) + 1e-6;
  return /* @__PURE__ */ P(
    "div",
    {
      id: o,
      "data-state": m ? "collapsed" : "expanded",
      style: { flexBasis: `${z}%`, flexGrow: 0, flexShrink: 0 },
      className: D("zen-min-h-0 zen-min-w-0 zen-overflow-auto", n),
      children: h
    }
  );
}, Q = ({ label: t, disabled: l, className: x, children: d }) => {
  const n = H(), h = e.useId(), [i] = e.useState(() => n.registerHandle()), o = e.useRef(null), s = e.useRef(0), g = e.useRef(1), z = e.useRef([]), m = e.useRef(!1), c = n.disabled || (l ?? !1), p = n.orientation === "horizontal", v = n.boundsOf(i), y = n.sizes[i] ?? 0, b = (r) => {
    if (c) return;
    r.preventDefault(), o.current?.focus();
    try {
      o.current?.setPointerCapture(r.pointerId);
    } catch {
    }
    m.current = !0, n.beginDrag(), s.current = p ? r.clientX : r.clientY, z.current = [...n.sizes];
    const a = o.current?.parentElement?.getBoundingClientRect();
    g.current = Math.max(1, p ? a?.width ?? 1 : a?.height ?? 1);
  }, R = (r) => {
    if (c || !m.current) return;
    const I = ((p ? r.clientX : r.clientY) - s.current) / g.current * 100;
    n.dragFrom(i, z.current, I, M(o.current));
  }, w = (r) => {
    if (m.current) {
      m.current = !1;
      try {
        o.current?.releasePointerCapture(r.pointerId);
      } catch {
      }
      n.commit();
    }
  }, f = (r) => {
    if (c) return;
    const a = O(r.key, n.orientation, r.shiftKey);
    a !== null && (r.preventDefault(), n.dragFrom(i, n.sizes, a, M(o.current)), n.commit());
  };
  return /* @__PURE__ */ j(
    "div",
    {
      ref: o,
      id: h,
      role: "separator",
      tabIndex: c ? -1 : 0,
      "aria-orientation": p ? "vertical" : "horizontal",
      "aria-label": t ?? "Resize panels",
      "aria-controls": n.panelId(i),
      "aria-valuenow": Math.round(y),
      "aria-valuemin": Math.round(v.min),
      "aria-valuemax": Math.round(v.max),
      "aria-disabled": c || void 0,
      onPointerDown: b,
      onPointerMove: R,
      onPointerUp: w,
      onPointerCancel: w,
      onKeyDown: f,
      className: D(
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
        p ? "zen-w-3 -zen-mx-1.5 zen-cursor-col-resize" : "zen-h-3 -zen-my-1.5 zen-cursor-row-resize",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        /* Or the page scrolls instead of the splitter moving. */
        "zen-touch-none",
        c && "zen-cursor-default zen-opacity-60",
        x
      ),
      children: [
        /* @__PURE__ */ P(
          "span",
          {
            "aria-hidden": !0,
            className: D(
              "zen-pointer-events-none zen-bg-zen-border zen-transition-colors",
              p ? "zen-h-full zen-w-px" : "zen-h-px zen-w-full",
              !c && "group-hover:zen-bg-zen-primary group-focus-visible:zen-bg-zen-primary"
            )
          }
        ),
        d
      ]
    }
  );
};
export {
  J as Splitter,
  Q as SplitterHandle,
  L as SplitterPanel
};
//# sourceMappingURL=index113.js.map
