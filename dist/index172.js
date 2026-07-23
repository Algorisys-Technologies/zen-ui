import { createComponent as u, mergeProps as P } from "solid-js/web";
import { createInteractOutside as D } from "./index180.js";
import { createEscapeKeyDown as E } from "./index181.js";
import { layerStack as n } from "./index178.js";
import { Polymorphic as v } from "./index161.js";
import { getDocument as L, contains as c } from "./index163.js";
import { splitProps as g, onMount as O, createEffect as w, on as x, onCleanup as d, createContext as B, useContext as C } from "solid-js";
import { mergeRefs as b } from "./index166.js";
var m = B();
function h() {
  return C(m);
}
function $(f) {
  let t;
  const a = h(), [o, l] = g(f, ["ref", "disableOutsidePointerEvents", "excludedElements", "onEscapeKeyDown", "onPointerDownOutside", "onFocusOutside", "onInteractOutside", "onDismiss", "bypassTopMostLayerCheck"]), i = /* @__PURE__ */ new Set([]), y = (e) => {
    i.add(e);
    const r = a?.registerNestedLayer(e);
    return () => {
      i.delete(e), r?.();
    };
  };
  D({
    shouldExcludeElement: (e) => t ? o.excludedElements?.some((r) => c(r(), e)) || [...i].some((r) => c(r, e)) : !1,
    onPointerDownOutside: (e) => {
      !t || n.isBelowPointerBlockingLayer(t) || !o.bypassTopMostLayerCheck && !n.isTopMostLayer(t) || (o.onPointerDownOutside?.(e), o.onInteractOutside?.(e), e.defaultPrevented || o.onDismiss?.());
    },
    onFocusOutside: (e) => {
      o.onFocusOutside?.(e), o.onInteractOutside?.(e), e.defaultPrevented || o.onDismiss?.();
    }
  }, () => t), E({
    ownerDocument: () => L(t),
    onEscapeKeyDown: (e) => {
      !t || !n.isTopMostLayer(t) || (o.onEscapeKeyDown?.(e), !e.defaultPrevented && o.onDismiss && (e.preventDefault(), o.onDismiss()));
    }
  }), O(() => {
    if (!t)
      return;
    n.addLayer({
      node: t,
      isPointerBlocking: o.disableOutsidePointerEvents,
      dismiss: o.onDismiss
    });
    const e = a?.registerNestedLayer(t);
    n.assignPointerEventToLayers(), n.disableBodyPointerEvents(t), d(() => {
      t && (n.removeLayer(t), e?.(), n.assignPointerEventToLayers(), n.restoreBodyPointerEvents(t));
    });
  }), w(x([() => t, () => o.disableOutsidePointerEvents], ([e, r]) => {
    if (!e)
      return;
    const s = n.find(e);
    s && s.isPointerBlocking !== r && (s.isPointerBlocking = r, n.assignPointerEventToLayers()), r && n.disableBodyPointerEvents(e), d(() => {
      n.restoreBodyPointerEvents(e);
    });
  }, {
    defer: !0
  }));
  const p = {
    registerNestedLayer: y
  };
  return u(m.Provider, {
    value: p,
    get children() {
      return u(v, P({
        as: "div",
        ref(e) {
          var r = b((s) => t = s, o.ref);
          typeof r == "function" && r(e);
        }
      }, l));
    }
  });
}
export {
  $ as DismissableLayer
};
//# sourceMappingURL=index172.js.map
