import * as t from "react";
import { composeEventHandlers as S } from "./index191.js";
import { Primitive as W, dispatchDiscreteCustomEvent as j } from "./index201.js";
import { useComposedRefs as A } from "./index192.js";
import { useCallbackRef as g } from "./index207.js";
import { jsx as _ } from "react/jsx-runtime";
var X = "DismissableLayer", I = "dismissableLayer.update", Y = "dismissableLayer.pointerDownOutside", q = "dismissableLayer.focusOutside", N, B = t.createContext({
  layers: /* @__PURE__ */ new Set(),
  layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
  branches: /* @__PURE__ */ new Set(),
  // Outside elements that belong to a layer's own dismiss affordance (eg, a
  // dialog overlay). Pressing them should dismiss the layer regardless of
  // whether or not they stop propagation.
  //
  // See https://github.com/radix-ui/primitives/issues/3346
  dismissableSurfaces: /* @__PURE__ */ new Set()
}), U = t.forwardRef(
  (r, a) => {
    const {
      disableOutsidePointerEvents: e = !1,
      deferPointerDownOutside: u = !1,
      onEscapeKeyDown: c,
      onPointerDownOutside: d,
      onFocusOutside: h,
      onInteractOutside: p,
      onDismiss: f,
      ...v
    } = r, n = t.useContext(B), [s, y] = t.useState(null), l = s?.ownerDocument ?? globalThis?.document, [, O] = t.useState({}), P = A(a, y), E = Array.from(n.layers), [w] = [
      ...n.layersWithOutsidePointerEventsDisabled
    ].slice(-1), L = w ? E.indexOf(w) : -1, i = s ? E.indexOf(s) : -1, m = n.layersWithOutsidePointerEventsDisabled.size > 0, D = i >= L, b = t.useRef(!1), z = Q(
      (o) => {
        d?.(o), p?.(o), o.defaultPrevented || f?.();
      },
      {
        ownerDocument: l,
        deferPointerDownOutside: u,
        isDeferredPointerDownOutsideRef: b,
        dismissableSurfaces: n.dismissableSurfaces,
        shouldHandlePointerDownOutside: t.useCallback(
          (o) => {
            if (!(o instanceof Node))
              return !1;
            const R = [...n.branches].some(
              (x) => x.contains(o)
            );
            return D && !R;
          },
          [n.branches, D]
        )
      }
    ), T = V((o) => {
      if (u && b.current)
        return;
      const R = o.target;
      [...n.branches].some((K) => K.contains(R)) || (h?.(o), p?.(o), o.defaultPrevented || f?.());
    }, l), k = s ? i === E.length - 1 : !1, C = g((o) => {
      o.key === "Escape" && (c?.(o), !o.defaultPrevented && f && (o.preventDefault(), f()));
    });
    return t.useEffect(() => {
      if (k)
        return l.addEventListener("keydown", C, { capture: !0 }), () => l.removeEventListener("keydown", C, { capture: !0 });
    }, [l, k, C]), t.useEffect(() => {
      if (s)
        return e && (n.layersWithOutsidePointerEventsDisabled.size === 0 && (N = l.body.style.pointerEvents, l.body.style.pointerEvents = "none"), n.layersWithOutsidePointerEventsDisabled.add(s)), n.layers.add(s), F(), () => {
          e && (n.layersWithOutsidePointerEventsDisabled.delete(s), n.layersWithOutsidePointerEventsDisabled.size === 0 && (l.body.style.pointerEvents = N));
        };
    }, [s, l, e, n]), t.useEffect(() => () => {
      s && (n.layers.delete(s), n.layersWithOutsidePointerEventsDisabled.delete(s), F());
    }, [s, n]), t.useEffect(() => {
      const o = () => O({});
      return document.addEventListener(I, o), () => document.removeEventListener(I, o);
    }, []), /* @__PURE__ */ _(
      W.div,
      {
        ...v,
        ref: P,
        style: {
          pointerEvents: m ? D ? "auto" : "none" : void 0,
          ...r.style
        },
        onFocusCapture: S(r.onFocusCapture, T.onFocusCapture),
        onBlurCapture: S(r.onBlurCapture, T.onBlurCapture),
        onPointerDownCapture: S(
          r.onPointerDownCapture,
          z.onPointerDownCapture
        )
      }
    );
  }
);
U.displayName = X;
var G = "DismissableLayerBranch", H = t.forwardRef((r, a) => {
  const e = t.useContext(B), u = t.useRef(null), c = A(a, u);
  return t.useEffect(() => {
    const d = u.current;
    if (d)
      return e.branches.add(d), () => {
        e.branches.delete(d);
      };
  }, [e.branches]), /* @__PURE__ */ _(W.div, { ...r, ref: c });
});
H.displayName = G;
function se() {
  const r = t.useContext(B), [a, e] = t.useState(null);
  return t.useEffect(() => {
    if (a)
      return r.dismissableSurfaces.add(a), () => {
        r.dismissableSurfaces.delete(a);
      };
  }, [a, r.dismissableSurfaces]), e;
}
var J = () => !0;
function Q(r, a) {
  const {
    ownerDocument: e = globalThis?.document,
    deferPointerDownOutside: u = !1,
    isDeferredPointerDownOutsideRef: c,
    dismissableSurfaces: d,
    shouldHandlePointerDownOutside: h = J
  } = a, p = g(r), f = t.useRef(!1), v = t.useRef(!1), n = t.useRef(/* @__PURE__ */ new Map()), s = t.useRef(() => {
  });
  return t.useEffect(() => {
    function y() {
      v.current = !1, c.current = !1, n.current.clear();
    }
    function l() {
      return Array.from(n.current.values()).some(Boolean);
    }
    function O(i) {
      if (!v.current)
        return;
      const m = i.target;
      m instanceof Node && [...d].some((b) => b.contains(m)) || n.current.set(i.type, !0), i.type === "click" && window.setTimeout(() => {
        v.current && s.current();
      }, 0);
    }
    function P(i) {
      v.current && n.current.set(i.type, !1);
    }
    const E = (i) => {
      if (i.target && !f.current) {
        let m = function() {
          e.removeEventListener("click", s.current);
          const b = l();
          y(), b || M(
            Y,
            p,
            D,
            { discrete: !0 }
          );
        };
        if (!h(i.target)) {
          e.removeEventListener("click", s.current), y(), f.current = !1;
          return;
        }
        const D = { originalEvent: i };
        v.current = !0, c.current = u && i.button === 0, n.current.clear(), !u || i.button !== 0 ? m() : (e.removeEventListener("click", s.current), s.current = m, e.addEventListener("click", s.current, { once: !0 }));
      } else
        e.removeEventListener("click", s.current), y();
      f.current = !1;
    }, w = [
      "pointerup",
      "mousedown",
      "mouseup",
      "touchstart",
      "touchend",
      "click"
    ];
    for (const i of w)
      e.addEventListener(i, O, !0), e.addEventListener(i, P);
    const L = window.setTimeout(() => {
      e.addEventListener("pointerdown", E);
    }, 0);
    return () => {
      window.clearTimeout(L), e.removeEventListener("pointerdown", E), e.removeEventListener("click", s.current);
      for (const i of w)
        e.removeEventListener(i, O, !0), e.removeEventListener(i, P);
    };
  }, [
    e,
    p,
    u,
    c,
    d,
    h
  ]), {
    // ensures we check React component tree (not just DOM tree)
    onPointerDownCapture: () => f.current = !0
  };
}
function V(r, a = globalThis?.document) {
  const e = g(r), u = t.useRef(!1);
  return t.useEffect(() => {
    const c = (d) => {
      d.target && !u.current && M(q, e, { originalEvent: d }, {
        discrete: !1
      });
    };
    return a.addEventListener("focusin", c), () => a.removeEventListener("focusin", c);
  }, [a, e]), {
    onFocusCapture: () => u.current = !0,
    onBlurCapture: () => u.current = !1
  };
}
function F() {
  const r = new CustomEvent(I);
  document.dispatchEvent(r);
}
function M(r, a, e, { discrete: u }) {
  const c = e.originalEvent.target, d = new CustomEvent(r, { bubbles: !1, cancelable: !0, detail: e });
  a && c.addEventListener(r, a, { once: !0 }), u ? j(c, d) : c.dispatchEvent(d);
}
var re = U, ie = H;
export {
  ie as Branch,
  U as DismissableLayer,
  H as DismissableLayerBranch,
  re as Root,
  se as useDismissableLayerSurface
};
//# sourceMappingURL=index194.js.map
