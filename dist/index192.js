import { createComponent as c, mergeProps as g, memo as D } from "solid-js/web";
import { createDisclosureState as S } from "./index170.js";
import { ButtonRoot as _ } from "./index155.js";
import { createRegisterId as $ } from "./index173.js";
import { Polymorphic as y } from "./index175.js";
import { __export as A } from "./index159.js";
import { mergeDefaultProps as I, createGenerateId as N, callHandler as T } from "./index160.js";
import { useContext as q, createContext as B, splitProps as C, createUniqueId as E, createSignal as p, createMemo as F, onMount as H, onCleanup as x, createEffect as f, on as v, Show as j } from "solid-js";
import G from "./index177.js";
import { mergeRefs as U } from "./index161.js";
import { combineStyle as W } from "./index179.js";
var z = {};
A(z, {
  Collapsible: () => J,
  Content: () => P,
  Root: () => R,
  Trigger: () => k,
  useCollapsibleContext: () => b
});
var w = B();
function b() {
  const n = q(w);
  if (n === void 0)
    throw new Error("[kobalte]: `useCollapsibleContext` must be used within a `Collapsible.Root` component");
  return n;
}
function P(n) {
  const [e, s] = p(), t = b(), a = I({
    id: t.generateId("content")
  }, n), [r, u] = C(a, ["ref", "id", "style"]), {
    present: o
  } = G({
    show: t.shouldMount,
    element: () => e() ?? null
  }), [l, m] = p(0), [d, M] = p(0);
  let h = t.isOpen() || o();
  return H(() => {
    const i = requestAnimationFrame(() => {
      h = !1;
    });
    x(() => {
      cancelAnimationFrame(i);
    });
  }), f(v(
    /**
     * depends on `present` because it will be `false` on
     * animation end (so when close finishes). This allows us to
     * retrieve the dimensions *before* closing.
     */
    o,
    () => {
      if (!e())
        return;
      e().style.transitionDuration = "0s", e().style.animationName = "none";
      const i = e().getBoundingClientRect();
      m(i.height), M(i.width), h || (e().style.transitionDuration = "", e().style.animationName = "");
    }
  )), f(v(t.isOpen, (i) => {
    !i && e() && (e().style.transitionDuration = "", e().style.animationName = "");
  }, {
    defer: !0
  })), f(() => x(t.registerContentId(r.id))), c(j, {
    get when() {
      return o();
    },
    get children() {
      return c(y, g({
        as: "div",
        ref(i) {
          var O = U(s, r.ref);
          typeof O == "function" && O(i);
        },
        get id() {
          return r.id;
        },
        get style() {
          return W({
            "--kb-collapsible-content-height": l() ? `${l()}px` : void 0,
            "--kb-collapsible-content-width": d() ? `${d()}px` : void 0
          }, r.style);
        }
      }, () => t.dataset(), u));
    }
  });
}
function R(n) {
  const e = `collapsible-${E()}`, s = I({
    id: e
  }, n), [t, a] = C(s, ["open", "defaultOpen", "onOpenChange", "disabled", "forceMount"]), [r, u] = p(), o = S({
    open: () => t.open,
    defaultOpen: () => t.defaultOpen,
    onOpenChange: (d) => t.onOpenChange?.(d)
  }), l = F(() => ({
    "data-expanded": o.isOpen() ? "" : void 0,
    "data-closed": o.isOpen() ? void 0 : "",
    "data-disabled": t.disabled ? "" : void 0
  })), m = {
    dataset: l,
    isOpen: o.isOpen,
    disabled: () => t.disabled ?? !1,
    shouldMount: () => t.forceMount || o.isOpen(),
    contentId: r,
    toggle: o.toggle,
    generateId: N(() => a.id),
    registerContentId: $(u)
  };
  return c(w.Provider, {
    value: m,
    get children() {
      return c(y, g({
        as: "div"
      }, l, a));
    }
  });
}
function k(n) {
  const e = b(), [s, t] = C(n, ["onClick"]);
  return c(_, g({
    get "aria-expanded"() {
      return e.isOpen();
    },
    get "aria-controls"() {
      return D(() => !!e.isOpen())() ? e.contentId() : void 0;
    },
    get disabled() {
      return e.disabled();
    },
    onClick: (r) => {
      T(r, s.onClick), e.toggle();
    }
  }, () => e.dataset(), t));
}
var J = Object.assign(R, {
  Content: P,
  Trigger: k
});
export {
  J as Collapsible,
  P as CollapsibleContent,
  R as CollapsibleRoot,
  k as CollapsibleTrigger,
  z as collapsible_exports,
  b as useCollapsibleContext
};
//# sourceMappingURL=index192.js.map
