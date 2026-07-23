import { createComponent as s, mergeProps as u, memo as k, Portal as X } from "solid-js/web";
import { PopperArrow as F, Popper as _ } from "./index154.js";
import { createFocusScope as Y } from "./index166.js";
import { createHideOutside as Z } from "./index167.js";
import { DismissableLayer as ee } from "./index168.js";
import { createDisclosureState as te } from "./index170.js";
import { ButtonRoot as E } from "./index155.js";
import { createRegisterId as R } from "./index173.js";
import { Polymorphic as w } from "./index175.js";
import { __export as oe } from "./index159.js";
import { mergeDefaultProps as h, createGenerateId as ne, callHandler as x, contains as re, focusWithoutScrolling as y } from "./index160.js";
import { createUniqueId as ie, splitProps as p, createSignal as g, createMemo as se, createContext as ae, createEffect as b, onCleanup as A, Show as $, useContext as ce } from "solid-js";
import le from "./index176.js";
import de from "./index177.js";
import { mergeRefs as M } from "./index161.js";
import { combineStyle as ue } from "./index179.js";
var pe = {};
oe(pe, {
  Anchor: () => L,
  Arrow: () => F,
  CloseButton: () => N,
  Content: () => H,
  Description: () => U,
  Popover: () => fe,
  Portal: () => j,
  Root: () => q,
  Title: () => G,
  Trigger: () => V,
  usePopoverContext: () => d
});
var B = ae();
function d() {
  const r = ce(B);
  if (r === void 0)
    throw new Error("[kobalte]: `usePopoverContext` must be used within a `Popover` component");
  return r;
}
function L(r) {
  const t = d(), [e, o] = p(r, ["ref"]);
  return s(w, u({
    as: "div",
    ref(i) {
      var c = M(t.setDefaultAnchorRef, e.ref);
      typeof c == "function" && c(i);
    }
  }, () => t.dataset(), o));
}
function N(r) {
  const t = d(), [e, o] = p(r, ["aria-label", "onClick"]);
  return s(E, u({
    get "aria-label"() {
      return e["aria-label"] || t.translations().dismiss;
    },
    onClick: (c) => {
      x(c, e.onClick), t.close();
    }
  }, () => t.dataset(), o));
}
function H(r) {
  let t;
  const e = d(), o = h({
    id: e.generateId("content")
  }, r), [i, c] = p(o, ["ref", "style", "onOpenAutoFocus", "onCloseAutoFocus", "onPointerDownOutside", "onFocusOutside", "onInteractOutside"]);
  let a = !1, l = !1, m = !1;
  const v = (n) => {
    i.onCloseAutoFocus?.(n), e.isModal() ? (n.preventDefault(), a || y(e.triggerRef())) : (n.defaultPrevented || (l || y(e.triggerRef()), n.preventDefault()), l = !1, m = !1);
  }, C = (n) => {
    i.onPointerDownOutside?.(n), e.isModal() && (a = n.detail.isContextMenu);
  }, I = (n) => {
    i.onFocusOutside?.(n), e.isOpen() && e.isModal() && n.preventDefault();
  }, D = (n) => {
    i.onInteractOutside?.(n), !e.isModal() && (n.defaultPrevented || (l = !0, n.detail.originalEvent.type === "pointerdown" && (m = !0)), re(e.triggerRef(), n.target) && n.preventDefault(), n.detail.originalEvent.type === "focusin" && m && n.preventDefault());
  };
  return Z({
    isDisabled: () => !(e.isOpen() && e.isModal()),
    targets: () => t ? [t] : []
  }), le({
    element: () => t ?? null,
    enabled: () => e.contentPresent() && e.preventScroll()
  }), Y({
    trapFocus: () => e.isOpen() && e.isModal(),
    onMountAutoFocus: i.onOpenAutoFocus,
    onUnmountAutoFocus: v
  }, () => t), b(() => A(e.registerContentId(c.id))), s($, {
    get when() {
      return e.contentPresent();
    },
    get children() {
      return s(_.Positioner, {
        get children() {
          return s(ee, u({
            ref(n) {
              var P = M((O) => {
                e.setContentRef(O), t = O;
              }, i.ref);
              typeof P == "function" && P(n);
            },
            role: "dialog",
            tabIndex: -1,
            get disableOutsidePointerEvents() {
              return k(() => !!e.isOpen())() && e.isModal();
            },
            get excludedElements() {
              return [e.triggerRef];
            },
            get style() {
              return ue({
                "--kb-popover-content-transform-origin": "var(--kb-popper-content-transform-origin)",
                position: "relative"
              }, i.style);
            },
            get "aria-labelledby"() {
              return e.titleId();
            },
            get "aria-describedby"() {
              return e.descriptionId();
            },
            onPointerDownOutside: C,
            onFocusOutside: I,
            onInteractOutside: D,
            get onDismiss() {
              return e.close;
            }
          }, () => e.dataset(), c));
        }
      });
    }
  });
}
function U(r) {
  const t = d(), e = h({
    id: t.generateId("description")
  }, r), [o, i] = p(e, ["id"]);
  return b(() => A(t.registerDescriptionId(o.id))), s(w, u({
    as: "p",
    get id() {
      return o.id;
    }
  }, () => t.dataset(), i));
}
function j(r) {
  const t = d();
  return s($, {
    get when() {
      return t.contentPresent();
    },
    get children() {
      return s(X, r);
    }
  });
}
var S = {
  // `aria-label` of Popover.CloseButton.
  dismiss: "Dismiss"
};
function q(r) {
  const t = `popover-${ie()}`, e = h({
    id: t,
    modal: !1,
    translations: S
  }, r), [o, i] = p(e, ["translations", "id", "open", "defaultOpen", "onOpenChange", "modal", "preventScroll", "forceMount", "anchorRef"]), [c, a] = g(), [l, m] = g(), [v, C] = g(), [I, D] = g(), [n, P] = g(), [O, W] = g(), f = te({
    open: () => o.open,
    defaultOpen: () => o.defaultOpen,
    onOpenChange: (Q) => o.onOpenChange?.(Q)
  }), z = () => o.anchorRef?.() ?? c() ?? l(), {
    present: J
  } = de({
    show: () => o.forceMount || f.isOpen(),
    element: () => v() ?? null
  }), K = se(() => ({
    "data-expanded": f.isOpen() ? "" : void 0,
    "data-closed": f.isOpen() ? void 0 : ""
  })), T = {
    translations: () => o.translations ?? S,
    dataset: K,
    isOpen: f.isOpen,
    isModal: () => o.modal ?? !1,
    preventScroll: () => o.preventScroll ?? T.isModal(),
    contentPresent: J,
    triggerRef: l,
    contentId: I,
    titleId: n,
    descriptionId: O,
    setDefaultAnchorRef: a,
    setTriggerRef: m,
    setContentRef: C,
    close: f.close,
    toggle: f.toggle,
    generateId: ne(() => o.id),
    registerContentId: R(D),
    registerTitleId: R(P),
    registerDescriptionId: R(W)
  };
  return s(B.Provider, {
    value: T,
    get children() {
      return s(_, u({
        anchorRef: z,
        contentRef: v
      }, i));
    }
  });
}
function G(r) {
  const t = d(), e = h({
    id: t.generateId("title")
  }, r), [o, i] = p(e, ["id"]);
  return b(() => A(t.registerTitleId(o.id))), s(w, u({
    as: "h2",
    get id() {
      return o.id;
    }
  }, () => t.dataset(), i));
}
function V(r) {
  const t = d(), [e, o] = p(r, ["ref", "onClick", "onPointerDown"]);
  return s(E, u({
    ref(a) {
      var l = M(t.setTriggerRef, e.ref);
      typeof l == "function" && l(a);
    },
    "aria-haspopup": "dialog",
    get "aria-expanded"() {
      return t.isOpen();
    },
    get "aria-controls"() {
      return k(() => !!t.isOpen())() ? t.contentId() : void 0;
    },
    onPointerDown: (a) => {
      x(a, e.onPointerDown), a.preventDefault();
    },
    onClick: (a) => {
      x(a, e.onClick), t.toggle();
    }
  }, () => t.dataset(), o));
}
var fe = Object.assign(q, {
  Anchor: L,
  Arrow: F,
  CloseButton: N,
  Content: H,
  Description: U,
  Portal: j,
  Title: G,
  Trigger: V
});
export {
  fe as Popover,
  L as PopoverAnchor,
  N as PopoverCloseButton,
  H as PopoverContent,
  U as PopoverDescription,
  j as PopoverPortal,
  q as PopoverRoot,
  G as PopoverTitle,
  V as PopoverTrigger,
  pe as popover_exports,
  d as usePopoverContext
};
//# sourceMappingURL=index127.js.map
