import { jsx as e, jsxs as s } from "react/jsx-runtime";
import * as a from "react";
import { Root as y, Group as w, SelectValue as x, Portal as b, Content as i, SelectViewport as N, Item as c, ItemIndicator as v, ItemText as k, Label as d, ScrollDownButton as z, ScrollUpButton as p, SelectSeparator as m, SelectTrigger as u, Icon as I } from "./index157.js";
import { cn as o } from "./index145.js";
const G = y, W = w, P = x, C = a.forwardRef(({ className: t, children: r, ...n }, l) => /* @__PURE__ */ s(
  u,
  {
    ref: l,
    className: o(
      "zen-flex zen-h-10 zen-w-full zen-items-center zen-justify-between zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
      "placeholder:zen-text-zen-muted-fg",
      "focus:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "[&>span]:zen-line-clamp-1",
      t
    ),
    ...n,
    children: [
      r,
      /* @__PURE__ */ e(I, { asChild: !0, children: /* @__PURE__ */ e(S, {}) })
    ]
  }
));
C.displayName = u.displayName;
const f = a.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ e(
  p,
  {
    ref: n,
    className: o("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", t),
    ...r,
    children: /* @__PURE__ */ e(R, {})
  }
));
f.displayName = p.displayName;
const h = a.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ e(
  z,
  {
    ref: n,
    className: o("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", t),
    ...r,
    children: /* @__PURE__ */ e(S, {})
  }
));
h.displayName = z.displayName;
const $ = a.forwardRef(({ className: t, children: r, position: n = "popper", ...l }, g) => /* @__PURE__ */ e(b, { children: /* @__PURE__ */ s(
  i,
  {
    ref: g,
    position: n,
    className: o(
      "zen-relative zen-z-50 zen-max-h-96 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md",
      n === "popper" && "data-[side=bottom]:zen-translate-y-1 data-[side=left]:-zen-translate-x-1 data-[side=right]:zen-translate-x-1 data-[side=top]:-zen-translate-y-1",
      t
    ),
    ...l,
    children: [
      /* @__PURE__ */ e(f, {}),
      /* @__PURE__ */ e(
        N,
        {
          className: o(
            "zen-p-1",
            n === "popper" && "zen-h-[var(--radix-select-trigger-height)] zen-w-full zen-min-w-[var(--radix-select-trigger-width)]"
          ),
          children: r
        }
      ),
      /* @__PURE__ */ e(h, {})
    ]
  }
) }));
$.displayName = i.displayName;
const j = a.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ e(
  d,
  {
    ref: n,
    className: o("zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", t),
    ...r
  }
));
j.displayName = d.displayName;
const B = a.forwardRef(({ className: t, children: r, ...n }, l) => /* @__PURE__ */ s(
  c,
  {
    ref: l,
    className: o(
      "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      t
    ),
    ...n,
    children: [
      /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center", children: /* @__PURE__ */ e(v, { children: /* @__PURE__ */ e(T, {}) }) }),
      /* @__PURE__ */ e(k, { children: r })
    ]
  }
));
B.displayName = c.displayName;
const L = a.forwardRef(({ className: t, ...r }, n) => /* @__PURE__ */ e(
  m,
  {
    ref: n,
    className: o("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", t),
    ...r
  }
));
L.displayName = m.displayName;
const S = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }), R = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }), T = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) });
export {
  G as Select,
  $ as SelectContent,
  W as SelectGroup,
  B as SelectItem,
  j as SelectLabel,
  h as SelectScrollDownButton,
  f as SelectScrollUpButton,
  L as SelectSeparator,
  C as SelectTrigger,
  P as SelectValue
};
//# sourceMappingURL=index36.js.map
