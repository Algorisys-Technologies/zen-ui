import { jsx as e, jsxs as i } from "react/jsx-runtime";
import * as o from "react";
import { Group as w, SelectValue as b, Root as v, Portal as N, Content as c, SelectViewport as I, Item as d, ItemIndicator as k, ItemText as C, Label as z, ScrollDownButton as p, ScrollUpButton as m, SelectSeparator as u, SelectTrigger as f, Icon as $ } from "./index176.js";
import { cn as a } from "./index160.js";
const h = o.createContext(!1), j = ({
  invalid: n = !1,
  ...t
}) => /* @__PURE__ */ e(h.Provider, { value: n, children: /* @__PURE__ */ e(v, { ...t }) });
j.displayName = "Select";
const q = w, A = b, B = o.forwardRef(({ className: n, children: t, invalid: r, ...l }, s) => {
  const y = o.useContext(h);
  return /* @__PURE__ */ i(
    f,
    {
      ref: s,
      className: a(
        "zen-flex zen-h-zen-control zen-w-full zen-items-center zen-justify-between zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // Marked invalid (aria-invalid="true", from `invalid` or the caller):
        // the error border, as Input and Combobox show theirs.
        "aria-[invalid=true]:zen-border-zen-error",
        "[&>span]:zen-line-clamp-1",
        n
      ),
      ...l,
      "aria-invalid": r || y ? "true" : l["aria-invalid"],
      children: [
        t,
        /* @__PURE__ */ e($, { asChild: !0, children: /* @__PURE__ */ e(x, {}) })
      ]
    }
  );
});
B.displayName = f.displayName;
const S = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  m,
  {
    ref: r,
    className: a("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", n),
    ...t,
    children: /* @__PURE__ */ e(U, {})
  }
));
S.displayName = m.displayName;
const g = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  p,
  {
    ref: r,
    className: a("zen-flex zen-cursor-default zen-items-center zen-justify-center zen-py-1", n),
    ...t,
    children: /* @__PURE__ */ e(x, {})
  }
));
g.displayName = p.displayName;
const L = o.forwardRef(({ className: n, children: t, position: r = "popper", ...l }, s) => /* @__PURE__ */ e(N, { children: /* @__PURE__ */ i(
  c,
  {
    ref: s,
    position: r,
    className: a(
      "zen-relative zen-z-50 zen-max-h-96 zen-min-w-32 zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-shadow-md",
      r === "popper" && "data-[side=bottom]:zen-translate-y-1 data-[side=left]:-zen-translate-x-1 data-[side=right]:zen-translate-x-1 data-[side=top]:-zen-translate-y-1",
      n
    ),
    ...l,
    children: [
      /* @__PURE__ */ e(S, {}),
      /* @__PURE__ */ e(
        I,
        {
          className: a(
            "zen-p-1",
            r === "popper" && "zen-h-[var(--radix-select-trigger-height)] zen-w-full zen-min-w-[var(--radix-select-trigger-width)]"
          ),
          children: t
        }
      ),
      /* @__PURE__ */ e(g, {})
    ]
  }
) }));
L.displayName = c.displayName;
const R = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  z,
  {
    ref: r,
    className: a("zen-px-2 zen-py-1.5 zen-text-xs zen-font-semibold zen-text-zen-muted-fg", n),
    ...t
  }
));
R.displayName = z.displayName;
const T = o.forwardRef(({ className: n, children: t, ...r }, l) => /* @__PURE__ */ i(
  d,
  {
    ref: l,
    className: a(
      "zen-relative zen-flex zen-w-full zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-zen-menu-y zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
      "data-[highlighted]:zen-bg-zen-muted",
      "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
      n
    ),
    ...r,
    children: [
      /* @__PURE__ */ e("span", { className: "zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center", children: /* @__PURE__ */ e(k, { children: /* @__PURE__ */ e(V, {}) }) }),
      /* @__PURE__ */ e(C, { children: t })
    ]
  }
));
T.displayName = d.displayName;
const D = o.forwardRef(({ className: n, ...t }, r) => /* @__PURE__ */ e(
  u,
  {
    ref: r,
    className: a("-zen-mx-1 zen-my-1 zen-h-px zen-bg-zen-border", n),
    ...t
  }
));
D.displayName = u.displayName;
const x = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" }) }), U = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "18 15 12 9 6 15" }) }), V = () => /* @__PURE__ */ e("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" }) });
export {
  j as Select,
  L as SelectContent,
  q as SelectGroup,
  T as SelectItem,
  R as SelectLabel,
  g as SelectScrollDownButton,
  S as SelectScrollUpButton,
  D as SelectSeparator,
  B as SelectTrigger,
  A as SelectValue
};
//# sourceMappingURL=index39.js.map
