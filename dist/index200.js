import * as s from "react";
import { useFloating as me, offset as he, shift as ue, flip as ge, size as we, arrow as Pe, hide as xe, limitShift as ye } from "./index216.js";
import { Root as Ae } from "./index217.js";
import { useComposedRefs as F } from "./index192.js";
import { createContextScope as ve } from "./index195.js";
import { Primitive as B } from "./index203.js";
import { useCallbackRef as Se } from "./index207.js";
import { useLayoutEffect as O } from "./index208.js";
import { useSize as Ce } from "./index213.js";
import { jsx as u } from "react/jsx-runtime";
import { autoUpdate as be } from "./index218.js";
var E = "Popper", [T, Be] = ve(E), [Re, j] = T(E), L = (t) => {
  const { __scopePopper: c, children: n } = t, [a, i] = s.useState(null), [e, r] = s.useState(void 0);
  return /* @__PURE__ */ u(
    Re,
    {
      scope: c,
      anchor: a,
      onAnchorChange: i,
      placementState: e,
      setPlacementState: r,
      children: n
    }
  );
};
L.displayName = E;
var Z = "PopperAnchor", U = s.forwardRef(
  (t, c) => {
    const { __scopePopper: n, virtualRef: a, ...i } = t, e = j(Z, n), r = s.useRef(null), h = e.onAnchorChange, p = s.useCallback(
      (o) => {
        r.current = o, o && h(o);
      },
      [h]
    ), l = F(c, p), d = s.useRef(null);
    s.useEffect(() => {
      if (!a)
        return;
      const o = d.current;
      d.current = a.current, o !== d.current && h(d.current);
    });
    const f = e.placementState && _(e.placementState), g = f?.[0], w = f?.[1];
    return a ? null : /* @__PURE__ */ u(
      B.div,
      {
        "data-radix-popper-side": g,
        "data-radix-popper-align": w,
        ...i,
        ref: l
      }
    );
  }
);
U.displayName = Z;
var N = "PopperContent", [Oe, Ee] = T(N), q = s.forwardRef(
  (t, c) => {
    const {
      __scopePopper: n,
      side: a = "bottom",
      sideOffset: i = 0,
      align: e = "center",
      alignOffset: r = 0,
      arrowPadding: h = 0,
      avoidCollisions: p = !0,
      collisionBoundary: l = [],
      collisionPadding: d = 0,
      sticky: f = "partial",
      hideWhenDetached: g = !1,
      updatePositionStrategy: w = "optimized",
      onPlaced: o,
      ...m
    } = t, $ = j(N, n), [v, K] = s.useState(null), Q = F(c, K), [S, V] = s.useState(null), H = Ce(S), ee = H?.width ?? 0, W = H?.height ?? 0, te = a + (e !== "center" ? "-" + e : ""), re = typeof d == "number" ? d : { top: 0, right: 0, bottom: 0, left: 0, ...d }, z = Array.isArray(l) ? l : [l], I = z.length > 0, x = {
      padding: re,
      boundary: z.filter(_e),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: I
    }, { refs: oe, floatingStyles: Y, placement: C, isPositioned: y, middlewareData: P } = me({
      // default to `fixed` strategy so users don't have to pick and we also avoid focus scroll issues
      strategy: "fixed",
      placement: te,
      whileElementsMounted: (...R) => be(...R, {
        animationFrame: w === "always"
      }),
      elements: {
        reference: $.anchor
      },
      middleware: [
        he({ mainAxis: i + W, alignmentAxis: r }),
        p && ue({
          mainAxis: !0,
          crossAxis: !1,
          limiter: f === "partial" ? ye() : void 0,
          ...x
        }),
        p && ge({ ...x }),
        we({
          ...x,
          apply: ({ elements: R, rects: D, availableWidth: pe, availableHeight: le }) => {
            const { width: de, height: fe } = D.reference, A = R.floating.style;
            A.setProperty("--radix-popper-available-width", `${pe}px`), A.setProperty("--radix-popper-available-height", `${le}px`), A.setProperty("--radix-popper-anchor-width", `${de}px`), A.setProperty("--radix-popper-anchor-height", `${fe}px`);
          }
        }),
        S && Pe({ element: S, padding: h }),
        $e({ arrowWidth: ee, arrowHeight: W }),
        g && xe({
          strategy: "referenceHidden",
          ...x,
          // `hide` detects whether the anchor (reference) is clipped, so when
          // no explicit `collisionBoundary` is set we fall back to Floating
          // UI's default clipping ancestors (e.g. a scrollable menu). This
          // lets an occluded submenu hide once its anchor scrolls out of view
          // (#3237). The collision/size middlewares deliberately keep the
          // viewport-based default to avoid clamping content rendered inside
          // transformed or overflow-clipping portal containers.
          boundary: I ? x.boundary : void 0
        })
      ]
    }), b = $.setPlacementState;
    O(() => (b(C), () => {
      b(void 0);
    }), [C, b]);
    const [k, M] = _(C), X = Se(o);
    O(() => {
      y && X?.();
    }, [y, X]);
    const ne = P.arrow?.x, ae = P.arrow?.y, ie = P.arrow?.centerOffset !== 0, [se, ce] = s.useState();
    return O(() => {
      v && ce(window.getComputedStyle(v).zIndex);
    }, [v]), /* @__PURE__ */ u(
      "div",
      {
        ref: oe.setFloating,
        "data-radix-popper-content-wrapper": "",
        style: {
          ...Y,
          transform: y ? Y.transform : "translate(0, -200%)",
          // keep off the page when measuring
          minWidth: "max-content",
          zIndex: se,
          "--radix-popper-transform-origin": [
            P.transformOrigin?.x,
            P.transformOrigin?.y
          ].join(" "),
          // hide the content if using the hide middleware and should be hidden
          // set visibility to hidden and disable pointer events so the UI behaves
          // as if the PopperContent isn't there at all
          ...P.hide?.referenceHidden && {
            visibility: "hidden",
            pointerEvents: "none"
          }
        },
        dir: t.dir,
        children: /* @__PURE__ */ u(
          Oe,
          {
            scope: n,
            placedSide: k,
            placedAlign: M,
            onArrowChange: V,
            arrowX: ne,
            arrowY: ae,
            shouldHideArrow: ie,
            children: /* @__PURE__ */ u(
              B.div,
              {
                "data-side": k,
                "data-align": M,
                ...m,
                ref: Q,
                style: {
                  ...m.style,
                  // if the PopperContent hasn't been placed yet (not all measurements done)
                  // we prevent animations so that users's animation don't kick in too early referring wrong sides
                  animation: y ? void 0 : "none"
                }
              }
            )
          }
        )
      }
    );
  }
);
q.displayName = N;
var G = "PopperArrow", Ne = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right"
}, J = s.forwardRef(function(c, n) {
  const { __scopePopper: a, ...i } = c, e = Ee(G, a), r = Ne[e.placedSide];
  return (
    // we have to use an extra wrapper because `ResizeObserver` (used by `useSize`)
    // doesn't report size as we'd expect on SVG elements.
    // it reports their bounding box which is effectively the largest path inside the SVG.
    /* @__PURE__ */ u(
      "span",
      {
        ref: e.onArrowChange,
        style: {
          position: "absolute",
          left: e.arrowX,
          top: e.arrowY,
          [r]: 0,
          transformOrigin: {
            top: "",
            right: "0 0",
            bottom: "center 0",
            left: "100% 0"
          }[e.placedSide],
          transform: {
            top: "translateY(100%)",
            right: "translateY(50%) rotate(90deg) translateX(-50%)",
            bottom: "rotate(180deg)",
            left: "translateY(50%) rotate(-90deg) translateX(50%)"
          }[e.placedSide],
          visibility: e.shouldHideArrow ? "hidden" : void 0
        },
        children: /* @__PURE__ */ u(
          Ae,
          {
            ...i,
            ref: n,
            style: {
              ...i.style,
              // ensures the element can be measured correctly (mostly for if SVG)
              display: "block"
            }
          }
        )
      }
    )
  );
});
J.displayName = G;
function _e(t) {
  return t !== null;
}
var $e = (t) => ({
  name: "transformOrigin",
  options: t,
  fn(c) {
    const { placement: n, rects: a, middlewareData: i } = c, r = i.arrow?.centerOffset !== 0, h = r ? 0 : t.arrowWidth, p = r ? 0 : t.arrowHeight, [l, d] = _(n), f = { start: "0%", center: "50%", end: "100%" }[d], g = (i.arrow?.x ?? 0) + h / 2, w = (i.arrow?.y ?? 0) + p / 2;
    let o = "", m = "";
    return l === "bottom" ? (o = r ? f : `${g}px`, m = `${-p}px`) : l === "top" ? (o = r ? f : `${g}px`, m = `${a.floating.height + p}px`) : l === "right" ? (o = `${-p}px`, m = r ? f : `${w}px`) : l === "left" && (o = `${a.floating.width + p}px`, m = r ? f : `${w}px`), { data: { x: o, y: m } };
  }
});
function _(t) {
  const [c, n = "center"] = t.split("-");
  return [c, n];
}
var Te = L, je = U, Le = q, Ze = J;
export {
  je as Anchor,
  Ze as Arrow,
  Le as Content,
  L as Popper,
  U as PopperAnchor,
  J as PopperArrow,
  q as PopperContent,
  Te as Root,
  Be as createPopperScope
};
//# sourceMappingURL=index200.js.map
