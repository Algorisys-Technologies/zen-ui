import { jsxs as z, jsx as e } from "react/jsx-runtime";
import * as d from "react";
import { Root as b, Group as x, Portal as i, RadioGroup as y, Sub as N, Trigger as R, CheckboxItem as l, ItemIndicator as c, Content as p, Item as m, Label as u, RadioItem as h, Separator as g, SubContent as f, SubTrigger as w } from "./index168.js";
import { cn as r } from "./index145.js";
const A = b, E = R, F = x, H = i, J = N, K = y, D = d.forwardRef(({ className: n, inset: o, children: t, ...a }, s) => /* @__PURE__ */ z(
  w,
  {
    ref: s,
    className: r(
      "zen-flex zen-cursor-default zen-items-center zen-gap-2 zen-select-none zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[state=open]:zen-bg-zen-muted data-[highlighted]:zen-bg-zen-muted",
      o && "zen-pl-8",
      n
    ),
    ...a,
    children: [
      t,
      /* @__PURE__ */ e(B, {})
    ]
  }
));
D.displayName = w.displayName;
const v = d.forwardRef(({ className: n, ...o }, t) => /* @__PURE__ */ e(
  f,
  {
    ref: t,
    className: r(
      "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
      n
    ),
    ...o
  }
));
v.displayName = f.displayName;
const I = d.forwardRef(({ className: n, sideOffset: o = 4, ...t }, a) => /* @__PURE__ */ e(i, { children: /* @__PURE__ */ e(
  p,
  {
    ref: a,
    sideOffset: o,
    className: r(
      "zen-z-50 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
      n
    ),
    ...t
  }
) }));
I.displayName = p.displayName;
const M = d.forwardRef(({ className: n, inset: o, variant: t = "default", ...a }, s) => /* @__PURE__ */ e(
  m,
  {
    ref: s,
    className: r(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-2 zen-rounded-zen-sm zen-px-2 zen-py-1.5 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      t === "destructive" && "zen-text-zen-error data-[highlighted]:zen-bg-zen-error-soft data-[highlighted]:zen-text-zen-error-soft-fg",
      o && "zen-pl-8",
      n
    ),
    ...a
  }
));
M.displayName = m.displayName;
const k = d.forwardRef(({ className: n, children: o, checked: t, ...a }, s) => /* @__PURE__ */ z(
  l,
  {
    ref: s,
    className: r(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      n
    ),
    checked: t,
    ...a,
    children: [
      /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center", children: /* @__PURE__ */ e(c, { children: /* @__PURE__ */ e(G, {}) }) }),
      o
    ]
  }
));
k.displayName = l.displayName;
const C = d.forwardRef(({ className: n, children: o, ...t }, a) => /* @__PURE__ */ z(
  h,
  {
    ref: a,
    className: r(
      "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      n
    ),
    ...t,
    children: [
      /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center", children: /* @__PURE__ */ e(c, { children: /* @__PURE__ */ e(T, {}) }) }),
      o
    ]
  }
));
C.displayName = h.displayName;
const S = d.forwardRef(({ className: n, inset: o, ...t }, a) => /* @__PURE__ */ e(
  u,
  {
    ref: a,
    className: r(
      "zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
      o && "zen-pl-8",
      n
    ),
    ...t
  }
));
S.displayName = u.displayName;
const L = d.forwardRef(({ className: n, ...o }, t) => /* @__PURE__ */ e(
  g,
  {
    ref: t,
    className: r("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", n),
    ...o
  }
));
L.displayName = g.displayName;
const j = ({
  className: n,
  ...o
}) => /* @__PURE__ */ e(
  "span",
  {
    className: r(
      "zen-ml-auto zen-text-xs zen-tracking-widest zen-text-zen-muted-fg",
      n
    ),
    ...o
  }
);
j.displayName = "DropdownMenuShortcut";
const G = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) }), T = () => /* @__PURE__ */ e("svg", { width: "8", height: "8", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ e("circle", { cx: "12", cy: "12", r: "6" }) }), B = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "zen-ml-auto", children: /* @__PURE__ */ e("polyline", { points: "9 18 15 12 9 6" }) });
export {
  A as DropdownMenu,
  k as DropdownMenuCheckboxItem,
  I as DropdownMenuContent,
  F as DropdownMenuGroup,
  M as DropdownMenuItem,
  S as DropdownMenuLabel,
  H as DropdownMenuPortal,
  K as DropdownMenuRadioGroup,
  C as DropdownMenuRadioItem,
  L as DropdownMenuSeparator,
  j as DropdownMenuShortcut,
  J as DropdownMenuSub,
  v as DropdownMenuSubContent,
  D as DropdownMenuSubTrigger,
  E as DropdownMenuTrigger
};
//# sourceMappingURL=index67.js.map
