import * as a from "react";
import { composeEventHandlers as m } from "./index230.js";
import { createContextScope as W } from "./index231.js";
import { Primitive as X } from "./index239.js";
import { Group as j, Portal as H, RadioGroup as $, Sub as K, Root as Y, CheckboxItem as q, ItemIndicator as z, Content as J, createMenuScope as g, Item as Q, Label as V, RadioItem as Z, Separator as ee, SubContent as te, SubTrigger as ne, Anchor as oe, Arrow as re } from "./index248.js";
import { useControllableState as R } from "./index240.js";
import { jsx as u, jsxs as ae, Fragment as ue } from "react/jsx-runtime";
var v = "ContextMenu", [ie] = W(v, [
  g
]), i = g(), [se, _] = ie(v), P = (e) => {
  const { __scopeContextMenu: n, children: o, onOpenChange: t, open: r, dir: p, modal: d = !0 } = e, s = a.useRef(!1);
  {
    const c = a.useRef(!1);
    a.useEffect(() => {
      r === !0 && !s.current && !c.current && (c.current = !0, console.warn(
        "ContextMenu: The `open` prop has been set to `true` before the user has interacted with the trigger, so its position is indeterminate. This is likely unintended and will result in the menu being anchored to the top-left corner of the viewport."
      ));
    }, [r]);
  }
  const [x, C] = R({
    prop: r,
    defaultProp: !1,
    onChange: t,
    caller: v
  }), f = i(n);
  return /* @__PURE__ */ u(
    se,
    {
      scope: n,
      open: x,
      onOpenChange: C,
      modal: d,
      hasInteractedRef: s,
      children: /* @__PURE__ */ u(Y, { ...f, dir: p, open: x, onOpenChange: C, modal: d, children: o })
    }
  );
};
P.displayName = v;
var S = "ContextMenuTrigger", b = a.forwardRef(
  (e, n) => {
    const { __scopeContextMenu: o, disabled: t = !1, ...r } = e, p = _(S, o), d = i(o), [s, x] = a.useState({ x: 0, y: 0 }), C = a.useMemo(
      () => ({
        current: {
          getBoundingClientRect: () => DOMRect.fromRect({ width: 0, height: 0, ...s })
        }
      }),
      [s]
    ), f = a.useRef(0), c = a.useCallback(
      () => window.clearTimeout(f.current),
      []
    ), h = (l) => {
      p.hasInteractedRef.current = !0, x({ x: l.clientX, y: l.clientY }), p.onOpenChange(!0);
    };
    return a.useEffect(() => c, [c]), a.useEffect(() => {
      t && c();
    }, [t, c]), /* @__PURE__ */ ae(ue, { children: [
      /* @__PURE__ */ u(oe, { ...d, virtualRef: C }),
      /* @__PURE__ */ u(
        X.span,
        {
          "data-state": p.open ? "open" : "closed",
          "data-disabled": t ? "" : void 0,
          ...r,
          ref: n,
          style: { WebkitTouchCallout: "none", ...e.style },
          onContextMenu: t ? e.onContextMenu : m(e.onContextMenu, (l) => {
            c(), h(l), l.preventDefault();
          }),
          onPointerDown: t ? e.onPointerDown : m(
            e.onPointerDown,
            M((l) => {
              c(), p.open && p.onOpenChange(!1), f.current = window.setTimeout(() => h(l), 700);
            })
          ),
          onPointerMove: t ? e.onPointerMove : m(e.onPointerMove, M(c)),
          onPointerCancel: t ? e.onPointerCancel : m(e.onPointerCancel, M(c)),
          onPointerUp: t ? e.onPointerUp : m(e.onPointerUp, M(c))
        }
      )
    ] });
  }
);
b.displayName = S;
var ce = "ContextMenuPortal", I = (e) => {
  const { __scopeContextMenu: n, ...o } = e, t = i(n);
  return /* @__PURE__ */ u(H, { ...t, ...o });
};
I.displayName = ce;
var w = "ContextMenuContent", N = a.forwardRef(
  (e, n) => {
    const { __scopeContextMenu: o, ...t } = e, r = _(w, o), p = i(o), d = a.useRef(!1);
    return /* @__PURE__ */ u(
      J,
      {
        ...p,
        ...t,
        ref: n,
        side: "right",
        sideOffset: 2,
        align: "start",
        onCloseAutoFocus: (s) => {
          e.onCloseAutoFocus?.(s), !s.defaultPrevented && d.current && s.preventDefault(), d.current = !1;
        },
        onInteractOutside: (s) => {
          e.onInteractOutside?.(s), !s.defaultPrevented && !r.modal && (d.current = !0);
        },
        style: {
          ...e.style,
          "--radix-context-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
          "--radix-context-menu-content-available-width": "var(--radix-popper-available-width)",
          "--radix-context-menu-content-available-height": "var(--radix-popper-available-height)",
          "--radix-context-menu-trigger-width": "var(--radix-popper-anchor-width)",
          "--radix-context-menu-trigger-height": "var(--radix-popper-anchor-height)"
        }
      }
    );
  }
);
N.displayName = w;
var pe = "ContextMenuGroup", A = a.forwardRef(
  (e, n) => {
    const { __scopeContextMenu: o, ...t } = e, r = i(o);
    return /* @__PURE__ */ u(j, { ...r, ...t, ref: n });
  }
);
A.displayName = pe;
var de = "ContextMenuLabel", E = a.forwardRef(
  (e, n) => {
    const { __scopeContextMenu: o, ...t } = e, r = i(o);
    return /* @__PURE__ */ u(V, { ...r, ...t, ref: n });
  }
);
E.displayName = de;
var le = "ContextMenuItem", T = a.forwardRef(
  (e, n) => {
    const { __scopeContextMenu: o, ...t } = e, r = i(o);
    return /* @__PURE__ */ u(Q, { ...r, ...t, ref: n });
  }
);
T.displayName = le;
var xe = "ContextMenuCheckboxItem", O = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u(q, { ...r, ...t, ref: n });
});
O.displayName = xe;
var me = "ContextMenuRadioGroup", y = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u($, { ...r, ...t, ref: n });
});
y.displayName = me;
var Ce = "ContextMenuRadioItem", G = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u(Z, { ...r, ...t, ref: n });
});
G.displayName = Ce;
var fe = "ContextMenuItemIndicator", k = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u(z, { ...r, ...t, ref: n });
});
k.displayName = fe;
var Me = "ContextMenuSeparator", D = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u(ee, { ...r, ...t, ref: n });
});
D.displayName = Me;
var ve = "ContextMenuArrow", he = a.forwardRef(
  (e, n) => {
    const { __scopeContextMenu: o, ...t } = e, r = i(o);
    return /* @__PURE__ */ u(re, { ...r, ...t, ref: n });
  }
);
he.displayName = ve;
var L = "ContextMenuSub", U = (e) => {
  const { __scopeContextMenu: n, children: o, onOpenChange: t, open: r, defaultOpen: p } = e, d = i(n), [s, x] = R({
    prop: r,
    defaultProp: p ?? !1,
    onChange: t,
    caller: L
  });
  return /* @__PURE__ */ u(K, { ...d, open: s, onOpenChange: x, children: o });
};
U.displayName = L;
var ge = "ContextMenuSubTrigger", B = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u(ne, { ...r, ...t, ref: n });
});
B.displayName = ge;
var Re = "ContextMenuSubContent", F = a.forwardRef((e, n) => {
  const { __scopeContextMenu: o, ...t } = e, r = i(o);
  return /* @__PURE__ */ u(
    te,
    {
      ...r,
      ...t,
      ref: n,
      style: {
        ...e.style,
        "--radix-context-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
        "--radix-context-menu-content-available-width": "var(--radix-popper-available-width)",
        "--radix-context-menu-content-available-height": "var(--radix-popper-available-height)",
        "--radix-context-menu-trigger-width": "var(--radix-popper-anchor-width)",
        "--radix-context-menu-trigger-height": "var(--radix-popper-anchor-height)"
      }
    }
  );
});
F.displayName = Re;
function M(e) {
  return (n) => n.pointerType !== "mouse" ? e(n) : void 0;
}
var Ne = P, Ae = b, Ee = I, Te = N, Oe = A, ye = E, Ge = T, ke = O, De = y, Le = G, Ue = k, Be = D, Fe = U, We = B, Xe = F;
export {
  ke as CheckboxItem,
  Te as Content,
  P as ContextMenu,
  he as ContextMenuArrow,
  O as ContextMenuCheckboxItem,
  N as ContextMenuContent,
  A as ContextMenuGroup,
  T as ContextMenuItem,
  k as ContextMenuItemIndicator,
  E as ContextMenuLabel,
  I as ContextMenuPortal,
  y as ContextMenuRadioGroup,
  G as ContextMenuRadioItem,
  D as ContextMenuSeparator,
  U as ContextMenuSub,
  F as ContextMenuSubContent,
  B as ContextMenuSubTrigger,
  b as ContextMenuTrigger,
  Oe as Group,
  Ge as Item,
  Ue as ItemIndicator,
  ye as Label,
  Ee as Portal,
  De as RadioGroup,
  Le as RadioItem,
  Ne as Root,
  Be as Separator,
  Fe as Sub,
  Xe as SubContent,
  We as SubTrigger,
  Ae as Trigger
};
//# sourceMappingURL=index193.js.map
