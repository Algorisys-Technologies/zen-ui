import { jsx as e, jsxs as f } from "react/jsx-runtime";
import * as l from "react";
import { RadioGroup as d, Item as p, Indicator as x } from "./index211.js";
import { cn as s } from "./index197.js";
const y = l.forwardRef(({ className: i, label: n, description: a, children: r, ...o }, t) => {
  const z = l.useId();
  if (n == null && a == null)
    return /* @__PURE__ */ e(
      d,
      {
        ref: t,
        className: s("zen-grid zen-gap-2", i),
        ...o,
        children: r
      }
    );
  const c = n != null ? `${z}-label` : void 0, m = a != null ? `${z}-description` : void 0, u = (...g) => g.filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ f(
    d,
    {
      ref: t,
      className: s("zen-flex zen-flex-col zen-gap-2", i),
      ...o,
      "aria-labelledby": u(o["aria-labelledby"], c),
      "aria-describedby": u(o["aria-describedby"], m),
      children: [
        n != null ? /* @__PURE__ */ e(
          "span",
          {
            id: c,
            className: "zen-text-sm zen-font-medium zen-leading-none zen-text-zen-foreground",
            children: n
          }
        ) : null,
        /* @__PURE__ */ e(
          "div",
          {
            className: o.orientation === "horizontal" ? "zen-flex zen-gap-3" : "zen-grid zen-gap-2",
            children: r
          }
        ),
        a != null ? /* @__PURE__ */ e("div", { id: m, className: "zen-text-xs zen-text-zen-muted-fg", children: a }) : null
      ]
    }
  );
});
y.displayName = d.displayName;
const N = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5"
}, R = l.forwardRef(({ label: i, ...n }, a) => {
  const r = /* @__PURE__ */ e(b, { ref: a, ...n });
  return i == null ? r : /* @__PURE__ */ f("label", { className: "zen-inline-flex zen-items-center zen-gap-2 zen-text-sm", children: [
    r,
    /* @__PURE__ */ e("span", { children: i })
  ] });
}), b = l.forwardRef(({ className: i, size: n = "md", ...a }, r) => /* @__PURE__ */ e(
  p,
  {
    ref: r,
    className: s(
      // zen-p-0: a <button>'s default padding is 1px 6px, which left a 16px
      // radio 2px of content width and squeezed the dot into a 2×8 bar.
      "zen-aspect-square zen-p-0 zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "data-[state=checked]:zen-border-zen-primary",
      N[n],
      i
    ),
    ...a,
    children: /* @__PURE__ */ e(x, { className: "zen-flex zen-items-center zen-justify-center", children: /* @__PURE__ */ e("span", { className: "zen-block zen-h-2 zen-w-2 zen-rounded-zen-full zen-bg-zen-primary" }) })
  }
));
b.displayName = p.displayName;
R.displayName = "RadioGroupItem";
export {
  y as RadioGroup,
  R as RadioGroupItem
};
//# sourceMappingURL=index37.js.map
