import * as u from "react";
import { composeEventHandlers as w } from "./index191.js";
import { useComposedRefs as K } from "./index192.js";
import { createContextScope as U } from "./index193.js";
import { useControllableState as g } from "./index202.js";
import { Primitive as B } from "./index201.js";
import { Root as F, Group as H, Portal as W, RadioGroup as $, Sub as j, Anchor as X, createMenuScope as D, CheckboxItem as q, ItemIndicator as z, Content as J, Item as Q, Label as V, RadioItem as Y, Separator as Z, SubContent as oo, SubTrigger as eo, Arrow as ro } from "./index216.js";
import { useId as M } from "./index197.js";
import { jsx as t } from "react/jsx-runtime";
var f = "DropdownMenu", [no] = U(
  f,
  [D]
), i = D(), [ao, _] = no(f), h = (o) => {
  const {
    __scopeDropdownMenu: n,
    children: r,
    dir: e,
    open: a,
    defaultOpen: p,
    onOpenChange: c,
    modal: s = !0
  } = o, d = i(n), v = u.useRef(null), [l, m] = g({
    prop: a,
    defaultProp: p ?? !1,
    onChange: c,
    caller: f
  });
  return /* @__PURE__ */ t(
    ao,
    {
      scope: n,
      triggerId: M(),
      triggerRef: v,
      contentId: M(),
      open: l,
      onOpenChange: m,
      onOpenToggle: u.useCallback(() => m((L) => !L), [m]),
      modal: s,
      children: /* @__PURE__ */ t(F, { ...d, open: l, onOpenChange: m, dir: e, modal: s, children: r })
    }
  );
};
h.displayName = f;
var R = "DropdownMenuTrigger", b = u.forwardRef(
  (o, n) => {
    const { __scopeDropdownMenu: r, disabled: e = !1, ...a } = o, p = _(R, r), c = i(r), s = K(n, p.triggerRef);
    return /* @__PURE__ */ t(X, { asChild: !0, ...c, children: /* @__PURE__ */ t(
      B.button,
      {
        type: "button",
        id: p.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": p.open,
        "aria-controls": p.open ? p.contentId : void 0,
        "data-state": p.open ? "open" : "closed",
        "data-disabled": e ? "" : void 0,
        disabled: e,
        ...a,
        ref: s,
        onPointerDown: w(o.onPointerDown, (d) => {
          !e && d.button === 0 && d.ctrlKey === !1 && (p.onOpenToggle(), p.open || d.preventDefault());
        }),
        onKeyDown: w(o.onKeyDown, (d) => {
          e || (["Enter", " "].includes(d.key) && p.onOpenToggle(), d.key === "ArrowDown" && p.onOpenChange(!0), ["Enter", " ", "ArrowDown"].includes(d.key) && d.preventDefault());
        })
      }
    ) });
  }
);
b.displayName = R;
var to = "DropdownMenuPortal", I = (o) => {
  const { __scopeDropdownMenu: n, ...r } = o, e = i(n);
  return /* @__PURE__ */ t(W, { ...e, ...r });
};
I.displayName = to;
var S = "DropdownMenuContent", C = u.forwardRef(
  (o, n) => {
    const { __scopeDropdownMenu: r, ...e } = o, a = _(S, r), p = i(r), c = u.useRef(!1);
    return /* @__PURE__ */ t(
      J,
      {
        id: a.contentId,
        "aria-labelledby": a.triggerId,
        ...p,
        ...e,
        ref: n,
        onCloseAutoFocus: w(o.onCloseAutoFocus, (s) => {
          c.current || a.triggerRef.current?.focus(), c.current = !1, s.preventDefault();
        }),
        onInteractOutside: w(o.onInteractOutside, (s) => {
          const d = s.detail.originalEvent, v = d.button === 0 && d.ctrlKey === !0, l = d.button === 2 || v;
          (!a.modal || l) && (c.current = !0);
        }),
        style: {
          ...o.style,
          "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    );
  }
);
C.displayName = S;
var po = "DropdownMenuGroup", N = u.forwardRef(
  (o, n) => {
    const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
    return /* @__PURE__ */ t(H, { ...a, ...e, ref: n });
  }
);
N.displayName = po;
var uo = "DropdownMenuLabel", x = u.forwardRef(
  (o, n) => {
    const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
    return /* @__PURE__ */ t(V, { ...a, ...e, ref: n });
  }
);
x.displayName = uo;
var io = "DropdownMenuItem", A = u.forwardRef(
  (o, n) => {
    const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
    return /* @__PURE__ */ t(Q, { ...a, ...e, ref: n });
  }
);
A.displayName = io;
var so = "DropdownMenuCheckboxItem", P = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t(q, { ...a, ...e, ref: n });
});
P.displayName = so;
var co = "DropdownMenuRadioGroup", E = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t($, { ...a, ...e, ref: n });
});
E.displayName = co;
var lo = "DropdownMenuRadioItem", O = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t(Y, { ...a, ...e, ref: n });
});
O.displayName = lo;
var mo = "DropdownMenuItemIndicator", y = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t(z, { ...a, ...e, ref: n });
});
y.displayName = mo;
var wo = "DropdownMenuSeparator", T = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t(Z, { ...a, ...e, ref: n });
});
T.displayName = wo;
var fo = "DropdownMenuArrow", vo = u.forwardRef(
  (o, n) => {
    const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
    return /* @__PURE__ */ t(ro, { ...a, ...e, ref: n });
  }
);
vo.displayName = fo;
var Mo = (o) => {
  const { __scopeDropdownMenu: n, children: r, open: e, onOpenChange: a, defaultOpen: p } = o, c = i(n), [s, d] = g({
    prop: e,
    defaultProp: p ?? !1,
    onChange: a,
    caller: "DropdownMenuSub"
  });
  return /* @__PURE__ */ t(j, { ...c, open: s, onOpenChange: d, children: r });
}, go = "DropdownMenuSubTrigger", G = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t(eo, { ...a, ...e, ref: n });
});
G.displayName = go;
var Do = "DropdownMenuSubContent", k = u.forwardRef((o, n) => {
  const { __scopeDropdownMenu: r, ...e } = o, a = i(r);
  return /* @__PURE__ */ t(
    oo,
    {
      ...a,
      ...e,
      ref: n,
      style: {
        ...o.style,
        "--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
k.displayName = Do;
var xo = h, Ao = b, Po = I, Eo = C, Oo = N, yo = x, To = A, Go = P, ko = E, Lo = O, Ko = y, Uo = T, Bo = Mo, Fo = G, Ho = k;
export {
  Go as CheckboxItem,
  Eo as Content,
  h as DropdownMenu,
  vo as DropdownMenuArrow,
  P as DropdownMenuCheckboxItem,
  C as DropdownMenuContent,
  N as DropdownMenuGroup,
  A as DropdownMenuItem,
  y as DropdownMenuItemIndicator,
  x as DropdownMenuLabel,
  I as DropdownMenuPortal,
  E as DropdownMenuRadioGroup,
  O as DropdownMenuRadioItem,
  T as DropdownMenuSeparator,
  Mo as DropdownMenuSub,
  k as DropdownMenuSubContent,
  G as DropdownMenuSubTrigger,
  b as DropdownMenuTrigger,
  Oo as Group,
  To as Item,
  Ko as ItemIndicator,
  yo as Label,
  Po as Portal,
  ko as RadioGroup,
  Lo as RadioItem,
  xo as Root,
  Uo as Separator,
  Bo as Sub,
  Ho as SubContent,
  Fo as SubTrigger,
  Ao as Trigger
};
//# sourceMappingURL=index168.js.map
