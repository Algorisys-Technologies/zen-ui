import * as s from "react";
import { composeEventHandlers as d } from "./index191.js";
import { useComposedRefs as C } from "./index192.js";
import { createContextScope as M } from "./index193.js";
import { useId as v } from "./index197.js";
import { useControllableState as F } from "./index202.js";
import { useDismissableLayerSurface as w, DismissableLayer as S } from "./index194.js";
import { FocusScope as k } from "./index196.js";
import { Portal as L } from "./index199.js";
import { Presence as R } from "./index200.js";
import { Primitive as p } from "./index201.js";
import { useFocusGuards as G } from "./index195.js";
import j from "./index204.js";
import { hideOthers as H } from "./index203.js";
import { createSlot as K } from "./index152.js";
import { jsx as i, Fragment as U } from "react/jsx-runtime";
var m = "Dialog", [h, Ce] = M(m), [V, c] = h(m), Y = (e) => {
  const {
    __scopeDialog: a,
    children: r,
    open: n,
    defaultOpen: t,
    onOpenChange: o,
    modal: l = !0
  } = e, u = s.useRef(null), P = s.useRef(null), [T, D] = F({
    prop: n,
    defaultProp: t ?? !1,
    onChange: o,
    caller: m
  });
  return /* @__PURE__ */ i(
    V,
    {
      scope: a,
      triggerRef: u,
      contentRef: P,
      contentId: v(),
      titleId: v(),
      descriptionId: v(),
      open: T,
      onOpenChange: D,
      onOpenToggle: s.useCallback(() => D((b) => !b), [D]),
      modal: l,
      children: r
    }
  );
};
Y.displayName = m;
var y = "DialogTrigger", Z = s.forwardRef(
  (e, a) => {
    const { __scopeDialog: r, ...n } = e, t = c(y, r), o = C(a, t.triggerRef);
    return /* @__PURE__ */ i(
      p.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": t.open,
        "aria-controls": t.open ? t.contentId : void 0,
        "data-state": O(t.open),
        ...n,
        ref: o,
        onClick: d(e.onClick, t.onOpenToggle)
      }
    );
  }
);
Z.displayName = y;
var _ = "DialogPortal", [q, E] = h(_, {
  forceMount: void 0
}), z = (e) => {
  const { __scopeDialog: a, forceMount: r, children: n, container: t } = e, o = c(_, a);
  return /* @__PURE__ */ i(q, { scope: a, forceMount: r, children: s.Children.map(n, (l) => /* @__PURE__ */ i(R, { present: r || o.open, children: /* @__PURE__ */ i(L, { asChild: !0, container: t, children: l }) })) });
};
z.displayName = _;
var g = "DialogOverlay", B = s.forwardRef(
  (e, a) => {
    const r = E(g, e.__scopeDialog), { forceMount: n = r.forceMount, ...t } = e, o = c(g, e.__scopeDialog);
    return o.modal ? /* @__PURE__ */ i(R, { present: n || o.open, children: /* @__PURE__ */ i(Q, { ...t, ref: a }) }) : null;
  }
);
B.displayName = g;
var J = K("DialogOverlay.RemoveScroll"), Q = s.forwardRef(
  (e, a) => {
    const { __scopeDialog: r, ...n } = e, t = c(g, r), o = w(), l = C(a, o);
    return (
      // Make sure `Content` is scrollable even when it doesn't live inside `RemoveScroll`
      // ie. when `Overlay` and `Content` are siblings
      /* @__PURE__ */ i(j, { as: J, allowPinchZoom: !0, shards: [t.contentRef], children: /* @__PURE__ */ i(
        p.div,
        {
          "data-state": O(t.open),
          ...n,
          ref: l,
          style: { pointerEvents: "auto", ...n.style }
        }
      ) })
    );
  }
), f = "DialogContent", W = s.forwardRef(
  (e, a) => {
    const r = E(f, e.__scopeDialog), { forceMount: n = r.forceMount, ...t } = e, o = c(f, e.__scopeDialog);
    return /* @__PURE__ */ i(R, { present: n || o.open, children: o.modal ? /* @__PURE__ */ i(X, { ...t, ref: a }) : /* @__PURE__ */ i($, { ...t, ref: a }) });
  }
);
W.displayName = f;
var X = s.forwardRef(
  (e, a) => {
    const r = c(f, e.__scopeDialog), n = s.useRef(null), t = C(a, r.contentRef, n);
    return s.useEffect(() => {
      const o = n.current;
      if (o) return H(o);
    }, []), /* @__PURE__ */ i(
      I,
      {
        ...e,
        ref: t,
        trapFocus: r.open,
        disableOutsidePointerEvents: r.open,
        onCloseAutoFocus: d(e.onCloseAutoFocus, (o) => {
          o.preventDefault(), r.triggerRef.current?.focus();
        }),
        onPointerDownOutside: d(e.onPointerDownOutside, (o) => {
          const l = o.detail.originalEvent, u = l.button === 0 && l.ctrlKey === !0;
          (l.button === 2 || u) && o.preventDefault();
        }),
        onFocusOutside: d(
          e.onFocusOutside,
          (o) => o.preventDefault()
        )
      }
    );
  }
), $ = s.forwardRef(
  (e, a) => {
    const r = c(f, e.__scopeDialog), n = s.useRef(!1), t = s.useRef(!1);
    return /* @__PURE__ */ i(
      I,
      {
        ...e,
        ref: a,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (o) => {
          e.onCloseAutoFocus?.(o), o.defaultPrevented || (n.current || r.triggerRef.current?.focus(), o.preventDefault()), n.current = !1, t.current = !1;
        },
        onInteractOutside: (o) => {
          e.onInteractOutside?.(o), o.defaultPrevented || (n.current = !0, o.detail.originalEvent.type === "pointerdown" && (t.current = !0));
          const l = o.target;
          r.triggerRef.current?.contains(l) && o.preventDefault(), o.detail.originalEvent.type === "focusin" && t.current && o.preventDefault();
        }
      }
    );
  }
), I = s.forwardRef(
  (e, a) => {
    const { __scopeDialog: r, trapFocus: n, onOpenAutoFocus: t, onCloseAutoFocus: o, ...l } = e, u = c(f, r);
    return G(), /* @__PURE__ */ i(U, { children: /* @__PURE__ */ i(
      k,
      {
        asChild: !0,
        loop: !0,
        trapped: n,
        onMountAutoFocus: t,
        onUnmountAutoFocus: o,
        children: /* @__PURE__ */ i(
          S,
          {
            role: "dialog",
            id: u.contentId,
            "aria-describedby": u.descriptionId,
            "aria-labelledby": u.titleId,
            "data-state": O(u.open),
            ...l,
            ref: a,
            deferPointerDownOutside: !0,
            onDismiss: () => u.onOpenChange(!1)
          }
        )
      }
    ) });
  }
), x = "DialogTitle", ee = s.forwardRef(
  (e, a) => {
    const { __scopeDialog: r, ...n } = e, t = c(x, r);
    return /* @__PURE__ */ i(p.h2, { id: t.titleId, ...n, ref: a });
  }
);
ee.displayName = x;
var N = "DialogDescription", oe = s.forwardRef(
  (e, a) => {
    const { __scopeDialog: r, ...n } = e, t = c(N, r);
    return /* @__PURE__ */ i(p.p, { id: t.descriptionId, ...n, ref: a });
  }
);
oe.displayName = N;
var A = "DialogClose", te = s.forwardRef(
  (e, a) => {
    const { __scopeDialog: r, ...n } = e, t = c(A, r);
    return /* @__PURE__ */ i(
      p.button,
      {
        type: "button",
        ...n,
        ref: a,
        onClick: d(e.onClick, () => t.onOpenChange(!1))
      }
    );
  }
);
te.displayName = A;
function O(e) {
  return e ? "open" : "closed";
}
export {
  te as Close,
  W as Content,
  oe as Description,
  Y as Dialog,
  te as DialogClose,
  W as DialogContent,
  oe as DialogDescription,
  B as DialogOverlay,
  z as DialogPortal,
  ee as DialogTitle,
  Z as DialogTrigger,
  B as Overlay,
  z as Portal,
  Y as Root,
  ee as Title,
  Z as Trigger,
  Ce as createDialogScope
};
//# sourceMappingURL=index170.js.map
