import { jsx as a, jsxs as x } from "react/jsx-runtime";
import * as o from "react";
import { Group as G, Portal as h, RadioGroup as P, Sub as L, Root as U, CheckboxItem as b, ItemIndicator as g, Content as M, Item as R, Label as w, RadioItem as T, Separator as S, SubContent as I, SubTrigger as v, Trigger as K } from "./index193.js";
import { menuIndicatorSlotClass as k, CheckIcon as j, menuIndicatorItemClass as D, menuContentClass as E, menuItemClass as A, menuLabelClass as H, DotIcon as q, menuSeparatorClass as B, menuShortcutClass as X, ChevronRightIcon as Y, menuSubTriggerClass as z } from "./index191.js";
const N = o.createContext(null), J = (e) => {
  const t = o.useRef({ returnTo: null, byKeyboard: !1 });
  return /* @__PURE__ */ a(N.Provider, { value: t, children: /* @__PURE__ */ a(U, { ...e }) });
};
J.displayName = "ContextMenu";
const O = o.forwardRef(({ onKeyDown: e, onKeyUp: t, onContextMenu: n, disabled: s, ...l }, C) => {
  const i = o.useContext(N), d = o.useRef(!1), m = o.useRef(0);
  return o.useEffect(() => () => window.clearTimeout(m.current), []), /* @__PURE__ */ a(
    K,
    {
      ref: C,
      disabled: s,
      onKeyDown: (r) => {
        if (e?.(r), r.defaultPrevented || s || r.key !== "ContextMenu" && !(r.shiftKey && r.key === "F10")) return;
        r.preventDefault();
        const f = document.activeElement, c = f instanceof Element && r.currentTarget.contains(f) ? f : r.currentTarget, y = c.getBoundingClientRect(), F = getComputedStyle(c).direction === "rtl";
        d.current = !0, window.clearTimeout(m.current), m.current = window.setTimeout(() => d.current = !1, 1e3), c.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: !0,
            cancelable: !0,
            clientX: F ? y.right : y.left,
            clientY: y.bottom
          })
        );
      },
      onKeyUp: (r) => {
        t?.(r), d.current && (window.clearTimeout(m.current), m.current = window.setTimeout(() => d.current = !1));
      },
      onContextMenu: (r) => {
        const f = r.nativeEvent.isTrusted;
        if (f && d.current && r.button !== 2) {
          r.preventDefault();
          return;
        }
        if (n?.(r), s || !i) return;
        const c = document.activeElement;
        i.current.returnTo = c instanceof HTMLElement && c !== r.currentTarget && r.currentTarget.contains(c) ? c : null, i.current.byKeyboard = !f;
      },
      ...l
    }
  );
});
O.displayName = K.displayName;
const Q = o.forwardRef(({ className: e, onCloseAutoFocus: t, onFocus: n, ...s }, l) => {
  const C = o.useContext(N), i = o.useRef(!1), d = (u) => {
    n?.(u), !(i.current || u.target !== u.currentTarget) && (i.current = !0, C?.current.byKeyboard && u.currentTarget.querySelector('[role^="menuitem"]:not([data-disabled])')?.focus());
  }, m = (u) => {
    if (i.current = !1, t?.(u), u.defaultPrevented) return;
    const p = C?.current.returnTo;
    p?.isConnected && (u.preventDefault(), p.focus({ preventScroll: !0 }));
  };
  return /* @__PURE__ */ a(h, { children: /* @__PURE__ */ a(
    M,
    {
      ref: l,
      className: E(e),
      onFocus: d,
      onCloseAutoFocus: m,
      ...s
    }
  ) });
});
Q.displayName = M.displayName;
const ue = h, ce = G, le = L, ie = P, V = o.forwardRef(({ className: e, inset: t, children: n, ...s }, l) => /* @__PURE__ */ x(v, { ref: l, className: z(t, e), ...s, children: [
  n,
  /* @__PURE__ */ a(Y, {})
] }));
V.displayName = v.displayName;
const W = o.forwardRef(({ className: e, ...t }, n) => (
  // Not portalled, as DropdownMenuSubContent is not: the two menus' submenus
  // sit in the same place in the tree.
  /* @__PURE__ */ a(I, { ref: n, className: E(e), ...t })
));
W.displayName = I.displayName;
const Z = o.forwardRef(
  ({ className: e, inset: t, variant: n = "default", ...s }, l) => /* @__PURE__ */ a(R, { ref: l, className: A(n, t, e), ...s })
);
Z.displayName = R.displayName;
const _ = o.forwardRef(({ className: e, children: t, ...n }, s) => /* @__PURE__ */ x(b, { ref: s, className: D(e), ...n, children: [
  /* @__PURE__ */ a("span", { className: k, children: /* @__PURE__ */ a(g, { children: /* @__PURE__ */ a(j, {}) }) }),
  t
] }));
_.displayName = b.displayName;
const $ = o.forwardRef(({ className: e, children: t, ...n }, s) => /* @__PURE__ */ x(T, { ref: s, className: D(e), ...n, children: [
  /* @__PURE__ */ a("span", { className: k, children: /* @__PURE__ */ a(g, { children: /* @__PURE__ */ a(q, {}) }) }),
  t
] }));
$.displayName = T.displayName;
const ee = o.forwardRef(({ className: e, inset: t, ...n }, s) => /* @__PURE__ */ a(w, { ref: s, className: H(t, e), ...n }));
ee.displayName = w.displayName;
const te = o.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ a(S, { ref: n, className: B(e), ...t }));
te.displayName = S.displayName;
const ne = ({ className: e, ...t }) => /* @__PURE__ */ a("span", { className: X(e), ...t });
ne.displayName = "ContextMenuShortcut";
export {
  J as ContextMenu,
  _ as ContextMenuCheckboxItem,
  Q as ContextMenuContent,
  ce as ContextMenuGroup,
  Z as ContextMenuItem,
  ee as ContextMenuLabel,
  ue as ContextMenuPortal,
  ie as ContextMenuRadioGroup,
  $ as ContextMenuRadioItem,
  te as ContextMenuSeparator,
  ne as ContextMenuShortcut,
  le as ContextMenuSub,
  W as ContextMenuSubContent,
  V as ContextMenuSubTrigger,
  O as ContextMenuTrigger
};
//# sourceMappingURL=index75.js.map
