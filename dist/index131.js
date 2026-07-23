import { createComponent as l, mergeProps as u, memo as E, Portal as K } from "solid-js/web";
import { createFocusScope as Q } from "./index173.js";
import { createHideOutside as V } from "./index174.js";
import { DismissableLayer as X } from "./index175.js";
import { createDisclosureState as Y } from "./index176.js";
import { ButtonRoot as $ } from "./index177.js";
import { createRegisterId as h } from "./index160.js";
import { Polymorphic as x } from "./index162.js";
import { __export as Z } from "./index163.js";
import { mergeDefaultProps as C, createGenerateId as ee, callHandler as y, contains as te, focusWithoutScrolling as A } from "./index164.js";
import { createUniqueId as oe, createSignal as d, createContext as ne, splitProps as g, Show as R, useContext as re, createEffect as w, onCleanup as b } from "solid-js";
import ie from "./index178.js";
import _ from "./index165.js";
import { mergeRefs as T } from "./index167.js";
import { combineStyle as se } from "./index168.js";
var ae = {};
Z(ae, {
  CloseButton: () => L,
  Content: () => M,
  Description: () => N,
  Dialog: () => le,
  Overlay: () => G,
  Portal: () => H,
  Root: () => U,
  Title: () => j,
  Trigger: () => q,
  useDialogContext: () => c
});
var B = ne();
function c() {
  const n = re(B);
  if (n === void 0)
    throw new Error("[kobalte]: `useDialogContext` must be used within a `Dialog` component");
  return n;
}
function L(n) {
  const t = c(), [e, s] = g(n, ["aria-label", "onClick"]);
  return l($, u({
    get "aria-label"() {
      return e["aria-label"] || t.translations().dismiss;
    },
    onClick: (r) => {
      y(r, e.onClick), t.close();
    }
  }, s));
}
function M(n) {
  let t;
  const e = c(), s = C({
    id: e.generateId("content")
  }, n), [i, r] = g(s, ["ref", "onOpenAutoFocus", "onCloseAutoFocus", "onPointerDownOutside", "onFocusOutside", "onInteractOutside"]);
  let a = !1, f = !1;
  const I = (o) => {
    i.onPointerDownOutside?.(o), e.modal() && o.detail.isContextMenu && o.preventDefault();
  }, p = (o) => {
    i.onFocusOutside?.(o), e.modal() && o.preventDefault();
  }, P = (o) => {
    i.onInteractOutside?.(o), !e.modal() && (o.defaultPrevented || (a = !0, o.detail.originalEvent.type === "pointerdown" && (f = !0)), te(e.triggerRef(), o.target) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && f && o.preventDefault());
  }, m = (o) => {
    i.onCloseAutoFocus?.(o), e.modal() ? (o.preventDefault(), A(e.triggerRef())) : (o.defaultPrevented || (a || A(e.triggerRef()), o.preventDefault()), a = !1, f = !1);
  };
  return V({
    isDisabled: () => !(e.isOpen() && e.modal()),
    targets: () => t ? [t] : []
  }), ie({
    element: () => t ?? null,
    enabled: () => e.contentPresent() && e.preventScroll()
  }), Q({
    trapFocus: () => e.isOpen() && e.modal(),
    onMountAutoFocus: i.onOpenAutoFocus,
    onUnmountAutoFocus: m
  }, () => t), w(() => b(e.registerContentId(r.id))), l(R, {
    get when() {
      return e.contentPresent();
    },
    get children() {
      return l(X, u({
        ref(o) {
          var v = T((D) => {
            e.setContentRef(D), t = D;
          }, i.ref);
          typeof v == "function" && v(o);
        },
        role: "dialog",
        tabIndex: -1,
        get disableOutsidePointerEvents() {
          return E(() => !!e.modal())() && e.isOpen();
        },
        get excludedElements() {
          return [e.triggerRef];
        },
        get "aria-labelledby"() {
          return e.titleId();
        },
        get "aria-describedby"() {
          return e.descriptionId();
        },
        get "data-expanded"() {
          return e.isOpen() ? "" : void 0;
        },
        get "data-closed"() {
          return e.isOpen() ? void 0 : "";
        },
        onPointerDownOutside: I,
        onFocusOutside: p,
        onInteractOutside: P,
        get onDismiss() {
          return e.close;
        }
      }, r));
    }
  });
}
function N(n) {
  const t = c(), e = C({
    id: t.generateId("description")
  }, n), [s, i] = g(e, ["id"]);
  return w(() => b(t.registerDescriptionId(s.id))), l(x, u({
    as: "p",
    get id() {
      return s.id;
    }
  }, i));
}
function G(n) {
  const t = c(), [e, s] = g(n, ["ref", "style", "onPointerDown"]), i = (r) => {
    y(r, e.onPointerDown), r.target === r.currentTarget && r.preventDefault();
  };
  return l(R, {
    get when() {
      return t.overlayPresent();
    },
    get children() {
      return l(x, u({
        as: "div",
        ref(r) {
          var a = T(t.setOverlayRef, e.ref);
          typeof a == "function" && a(r);
        },
        get style() {
          return se({
            "pointer-events": "auto"
          }, e.style);
        },
        get "data-expanded"() {
          return t.isOpen() ? "" : void 0;
        },
        get "data-closed"() {
          return t.isOpen() ? void 0 : "";
        },
        onPointerDown: i
      }, s));
    }
  });
}
function H(n) {
  const t = c();
  return l(R, {
    get when() {
      return t.contentPresent() || t.overlayPresent();
    },
    get children() {
      return l(K, n);
    }
  });
}
var k = {
  // `aria-label` of Dialog.CloseButton.
  dismiss: "Dismiss"
};
function U(n) {
  const t = `dialog-${oe()}`, e = C({
    id: t,
    modal: !0,
    translations: k
  }, n), [s, i] = d(), [r, a] = d(), [f, I] = d(), [p, P] = d(), [m, o] = d(), [v, D] = d(), O = Y({
    open: () => e.open,
    defaultOpen: () => e.defaultOpen,
    onOpenChange: (J) => e.onOpenChange?.(J)
  }), F = () => e.forceMount || O.isOpen(), {
    present: W
  } = _({
    show: F,
    element: () => p() ?? null
  }), {
    present: z
  } = _({
    show: F,
    element: () => m() ?? null
  }), S = {
    translations: () => e.translations ?? k,
    isOpen: O.isOpen,
    modal: () => e.modal ?? !0,
    preventScroll: () => e.preventScroll ?? S.modal(),
    contentId: s,
    titleId: r,
    descriptionId: f,
    triggerRef: v,
    overlayRef: p,
    setOverlayRef: P,
    contentRef: m,
    setContentRef: o,
    overlayPresent: W,
    contentPresent: z,
    close: O.close,
    toggle: O.toggle,
    setTriggerRef: D,
    generateId: ee(() => e.id),
    registerContentId: h(i),
    registerTitleId: h(a),
    registerDescriptionId: h(I)
  };
  return l(B.Provider, {
    value: S,
    get children() {
      return e.children;
    }
  });
}
function j(n) {
  const t = c(), e = C({
    id: t.generateId("title")
  }, n), [s, i] = g(e, ["id"]);
  return w(() => b(t.registerTitleId(s.id))), l(x, u({
    as: "h2",
    get id() {
      return s.id;
    }
  }, i));
}
function q(n) {
  const t = c(), [e, s] = g(n, ["ref", "onClick"]);
  return l($, u({
    ref(r) {
      var a = T(t.setTriggerRef, e.ref);
      typeof a == "function" && a(r);
    },
    "aria-haspopup": "dialog",
    get "aria-expanded"() {
      return t.isOpen();
    },
    get "aria-controls"() {
      return E(() => !!t.isOpen())() ? t.contentId() : void 0;
    },
    get "data-expanded"() {
      return t.isOpen() ? "" : void 0;
    },
    get "data-closed"() {
      return t.isOpen() ? void 0 : "";
    },
    onClick: (r) => {
      y(r, e.onClick), t.toggle();
    }
  }, s));
}
var le = Object.assign(U, {
  CloseButton: L,
  Content: M,
  Description: N,
  Overlay: G,
  Portal: H,
  Title: j,
  Trigger: q
});
export {
  le as Dialog,
  L as DialogCloseButton,
  M as DialogContent,
  N as DialogDescription,
  G as DialogOverlay,
  H as DialogPortal,
  U as DialogRoot,
  j as DialogTitle,
  q as DialogTrigger,
  ae as dialog_exports,
  c as useDialogContext
};
//# sourceMappingURL=index131.js.map
