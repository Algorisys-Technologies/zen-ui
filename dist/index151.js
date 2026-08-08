import * as c from "react";
import { composeEventHandlers as P } from "./index194.js";
import { useComposedRefs as O } from "./index192.js";
import { createContextScope as G } from "./index195.js";
import { DismissableLayer as H } from "./index196.js";
import { useFocusGuards as K } from "./index197.js";
import { FocusScope as $ } from "./index198.js";
import { useId as j } from "./index199.js";
import { Root as U, Anchor as _, createPopperScope as x, Content as V, Arrow as W } from "./index200.js";
import { Portal as Z } from "./index201.js";
import { Presence as w } from "./index202.js";
import { Primitive as E } from "./index203.js";
import { createSlot as q } from "./index150.js";
import { useControllableState as z } from "./index204.js";
import { hideOthers as B } from "./index205.js";
import J from "./index206.js";
import { jsx as i } from "react/jsx-runtime";
var C = "Popover", [b] = G(C, [
  x
]), m = x(), [Q, u] = b(C), F = (o) => {
  const {
    __scopePopover: n,
    children: t,
    open: a,
    defaultOpen: e,
    onOpenChange: r,
    modal: s = !1
  } = o, p = m(n), d = c.useRef(null), [v, g] = c.useState(!1), [h, l] = z({
    prop: a,
    defaultProp: e ?? !1,
    onChange: r,
    caller: C
  });
  return /* @__PURE__ */ i(U, { ...p, children: /* @__PURE__ */ i(
    Q,
    {
      scope: n,
      contentId: j(),
      triggerRef: d,
      open: h,
      onOpenChange: l,
      onOpenToggle: c.useCallback(() => l((R) => !R), [l]),
      hasCustomAnchor: v,
      onCustomAnchorAdd: c.useCallback(() => g(!0), []),
      onCustomAnchorRemove: c.useCallback(() => g(!1), []),
      modal: s,
      children: t
    }
  ) });
};
F.displayName = C;
var N = "PopoverAnchor", S = c.forwardRef(
  (o, n) => {
    const { __scopePopover: t, ...a } = o, e = u(N, t), r = m(t), { onCustomAnchorAdd: s, onCustomAnchorRemove: p } = e;
    return c.useEffect(() => (s(), () => p()), [s, p]), /* @__PURE__ */ i(_, { ...r, ...a, ref: n });
  }
);
S.displayName = N;
var y = "PopoverTrigger", D = c.forwardRef(
  (o, n) => {
    const { __scopePopover: t, ...a } = o, e = u(y, t), r = m(t), s = O(n, e.triggerRef), p = /* @__PURE__ */ i(
      E.button,
      {
        type: "button",
        "aria-haspopup": "dialog",
        "aria-expanded": e.open,
        "aria-controls": e.open ? e.contentId : void 0,
        "data-state": L(e.open),
        ...a,
        ref: s,
        onClick: P(o.onClick, e.onOpenToggle)
      }
    );
    return e.hasCustomAnchor ? p : /* @__PURE__ */ i(_, { asChild: !0, ...r, children: p });
  }
);
D.displayName = y;
var A = "PopoverPortal", [X, Y] = b(A, {
  forceMount: void 0
}), M = (o) => {
  const { __scopePopover: n, forceMount: t, children: a, container: e } = o, r = u(A, n);
  return /* @__PURE__ */ i(X, { scope: n, forceMount: t, children: /* @__PURE__ */ i(w, { present: t || r.open, children: /* @__PURE__ */ i(Z, { asChild: !0, container: e, children: a }) }) });
};
M.displayName = A;
var f = "PopoverContent", k = c.forwardRef(
  (o, n) => {
    const t = Y(f, o.__scopePopover), { forceMount: a = t.forceMount, ...e } = o, r = u(f, o.__scopePopover);
    return /* @__PURE__ */ i(w, { present: a || r.open, children: r.modal ? /* @__PURE__ */ i(eo, { ...e, ref: n }) : /* @__PURE__ */ i(ro, { ...e, ref: n }) });
  }
);
k.displayName = f;
var oo = q("PopoverContent.RemoveScroll"), eo = c.forwardRef(
  (o, n) => {
    const t = u(f, o.__scopePopover), a = c.useRef(null), e = O(n, a), r = c.useRef(!1);
    return c.useEffect(() => {
      const s = a.current;
      if (s) return B(s);
    }, []), /* @__PURE__ */ i(J, { as: oo, allowPinchZoom: !0, children: /* @__PURE__ */ i(
      I,
      {
        ...o,
        ref: e,
        trapFocus: t.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: P(o.onCloseAutoFocus, (s) => {
          s.preventDefault(), r.current || t.triggerRef.current?.focus();
        }),
        onPointerDownOutside: P(
          o.onPointerDownOutside,
          (s) => {
            const p = s.detail.originalEvent, d = p.button === 0 && p.ctrlKey === !0, v = p.button === 2 || d;
            r.current = v;
          },
          { checkForDefaultPrevented: !1 }
        ),
        onFocusOutside: P(
          o.onFocusOutside,
          (s) => s.preventDefault(),
          { checkForDefaultPrevented: !1 }
        )
      }
    ) });
  }
), ro = c.forwardRef(
  (o, n) => {
    const t = u(f, o.__scopePopover), a = c.useRef(!1), e = c.useRef(!1);
    return /* @__PURE__ */ i(
      I,
      {
        ...o,
        ref: n,
        trapFocus: !1,
        disableOutsidePointerEvents: !1,
        onCloseAutoFocus: (r) => {
          o.onCloseAutoFocus?.(r), r.defaultPrevented || (a.current || t.triggerRef.current?.focus(), r.preventDefault()), a.current = !1, e.current = !1;
        },
        onInteractOutside: (r) => {
          o.onInteractOutside?.(r), r.defaultPrevented || (a.current = !0, r.detail.originalEvent.type === "pointerdown" && (e.current = !0));
          const s = r.target;
          t.triggerRef.current?.contains(s) && r.preventDefault(), r.detail.originalEvent.type === "focusin" && e.current && r.preventDefault();
        }
      }
    );
  }
), I = c.forwardRef(
  (o, n) => {
    const {
      __scopePopover: t,
      trapFocus: a,
      onOpenAutoFocus: e,
      onCloseAutoFocus: r,
      disableOutsidePointerEvents: s,
      onEscapeKeyDown: p,
      onPointerDownOutside: d,
      onFocusOutside: v,
      onInteractOutside: g,
      ...h
    } = o, l = u(f, t), R = m(t);
    return K(), /* @__PURE__ */ i(
      $,
      {
        asChild: !0,
        loop: !0,
        trapped: a,
        onMountAutoFocus: e,
        onUnmountAutoFocus: r,
        children: /* @__PURE__ */ i(
          H,
          {
            asChild: !0,
            disableOutsidePointerEvents: s,
            onInteractOutside: g,
            onEscapeKeyDown: p,
            onPointerDownOutside: d,
            onFocusOutside: v,
            onDismiss: () => l.onOpenChange(!1),
            deferPointerDownOutside: !0,
            children: /* @__PURE__ */ i(
              V,
              {
                "data-state": L(l.open),
                role: "dialog",
                id: l.contentId,
                ...R,
                ...h,
                ref: n,
                style: {
                  ...h.style,
                  "--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
                  "--radix-popover-content-available-width": "var(--radix-popper-available-width)",
                  "--radix-popover-content-available-height": "var(--radix-popper-available-height)",
                  "--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
                  "--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
                }
              }
            )
          }
        )
      }
    );
  }
), T = "PopoverClose", to = c.forwardRef(
  (o, n) => {
    const { __scopePopover: t, ...a } = o, e = u(T, t);
    return /* @__PURE__ */ i(
      E.button,
      {
        type: "button",
        ...a,
        ref: n,
        onClick: P(o.onClick, () => e.onOpenChange(!1))
      }
    );
  }
);
to.displayName = T;
var no = "PopoverArrow", ao = c.forwardRef(
  (o, n) => {
    const { __scopePopover: t, ...a } = o, e = m(t);
    return /* @__PURE__ */ i(W, { ...e, ...a, ref: n });
  }
);
ao.displayName = no;
function L(o) {
  return o ? "open" : "closed";
}
var _o = F, xo = S, wo = D, Eo = M, bo = k;
export {
  xo as Anchor,
  bo as Content,
  F as Popover,
  S as PopoverAnchor,
  ao as PopoverArrow,
  to as PopoverClose,
  k as PopoverContent,
  M as PopoverPortal,
  D as PopoverTrigger,
  Eo as Portal,
  _o as Root,
  wo as Trigger
};
//# sourceMappingURL=index151.js.map
