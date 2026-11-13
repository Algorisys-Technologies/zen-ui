import { jsxs as d, jsx as s } from "react/jsx-runtime";
import * as r from "react";
import { Root as h, Group as y, Portal as l, RadioGroup as M, Sub as g, Trigger as x, CheckboxItem as p, ItemIndicator as c, Content as i, Item as u, Label as N, RadioItem as w, Separator as f, SubContent as C, SubTrigger as I } from "./index227.js";
import { menuIndicatorSlotClass as D, CheckIcon as G, menuIndicatorItemClass as R, menuContentClass as S, menuItemClass as T, menuLabelClass as k, DotIcon as L, menuSeparatorClass as P, menuShortcutClass as j, ChevronRightIcon as v, menuSubTriggerClass as q } from "./index228.js";
const W = h, X = x, Y = y, Z = l, _ = g, $ = M, z = r.forwardRef(({ className: a, inset: e, children: o, ...n }, t) => /* @__PURE__ */ d(
  I,
  {
    ref: t,
    className: q(e, a),
    ...n,
    children: [
      o,
      /* @__PURE__ */ s(v, {})
    ]
  }
));
z.displayName = I.displayName;
const A = r.forwardRef(({ className: a, ...e }, o) => /* @__PURE__ */ s(
  C,
  {
    ref: o,
    className: S(a),
    ...e
  }
));
A.displayName = C.displayName;
const B = r.forwardRef(({ className: a, sideOffset: e = 4, ...o }, n) => /* @__PURE__ */ s(l, { children: /* @__PURE__ */ s(
  i,
  {
    ref: n,
    sideOffset: e,
    className: S(a),
    ...o
  }
) }));
B.displayName = i.displayName;
const E = r.forwardRef(({ className: a, inset: e, variant: o = "default", ...n }, t) => /* @__PURE__ */ s(
  u,
  {
    ref: t,
    className: T(o, e, a),
    ...n
  }
));
E.displayName = u.displayName;
const F = r.forwardRef(({ className: a, children: e, checked: o, ...n }, t) => /* @__PURE__ */ d(
  p,
  {
    ref: t,
    className: R(a),
    checked: o,
    ...n,
    children: [
      /* @__PURE__ */ s("span", { className: D, children: /* @__PURE__ */ s(c, { children: /* @__PURE__ */ s(G, {}) }) }),
      e
    ]
  }
));
F.displayName = p.displayName;
const H = r.forwardRef(({ className: a, children: e, closeOnSelect: o = !0, onSelect: n, ...t }, b) => /* @__PURE__ */ d(
  w,
  {
    ref: b,
    onSelect: o ? n : (m) => {
      n?.(m), m.preventDefault();
    },
    className: R(a),
    ...t,
    children: [
      /* @__PURE__ */ s("span", { className: D, children: /* @__PURE__ */ s(c, { children: /* @__PURE__ */ s(L, {}) }) }),
      e
    ]
  }
));
H.displayName = w.displayName;
const J = r.forwardRef(({ className: a, inset: e, ...o }, n) => /* @__PURE__ */ s(
  N,
  {
    ref: n,
    className: k(e, a),
    ...o
  }
));
J.displayName = N.displayName;
const K = r.forwardRef(({ className: a, ...e }, o) => /* @__PURE__ */ s(
  f,
  {
    ref: o,
    className: P(a),
    ...e
  }
));
K.displayName = f.displayName;
const O = ({
  className: a,
  ...e
}) => /* @__PURE__ */ s(
  "span",
  {
    className: j(a),
    ...e
  }
);
O.displayName = "DropdownMenuShortcut";
export {
  W as DropdownMenu,
  F as DropdownMenuCheckboxItem,
  B as DropdownMenuContent,
  Y as DropdownMenuGroup,
  E as DropdownMenuItem,
  J as DropdownMenuLabel,
  Z as DropdownMenuPortal,
  $ as DropdownMenuRadioGroup,
  H as DropdownMenuRadioItem,
  K as DropdownMenuSeparator,
  O as DropdownMenuShortcut,
  _ as DropdownMenuSub,
  A as DropdownMenuSubContent,
  z as DropdownMenuSubTrigger,
  X as DropdownMenuTrigger
};
//# sourceMappingURL=index73.js.map
