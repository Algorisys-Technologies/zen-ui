import { jsx as a } from "react/jsx-runtime";
import * as d from "react";
import { cva as s } from "./index144.js";
import { cn as o } from "./index143.js";
const i = s(
  "zen-rounded-zen-md zen-border zen-bg-zen-background zen-text-zen-foreground",
  {
    variants: {
      variant: {
        elevated: "zen-border-zen-border zen-shadow-zen-sm",
        outlined: "zen-border-zen-border",
        ghost: "zen-border-transparent"
      },
      padding: {
        none: "",
        sm: "zen-p-3",
        md: "zen-p-5",
        lg: "zen-p-6"
      }
    },
    defaultVariants: {
      variant: "outlined",
      padding: "none"
    }
  }
), m = d.forwardRef(
  ({ className: e, variant: n, padding: r, ...t }, z) => /* @__PURE__ */ a(
    "div",
    {
      ref: z,
      className: o(i({ variant: n, padding: r }), e),
      ...t
    }
  )
);
m.displayName = "Card";
const p = d.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ a(
  "div",
  {
    ref: r,
    className: o("zen-flex zen-flex-col zen-gap-1 zen-p-5 zen-pb-3", e),
    ...n
  }
));
p.displayName = "CardHeader";
const l = d.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ a(
  "h3",
  {
    ref: r,
    className: o(
      "zen-text-base zen-font-semibold zen-leading-tight zen-m-0 zen-text-zen-foreground",
      e
    ),
    ...n
  }
));
l.displayName = "CardTitle";
const f = d.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ a(
  "p",
  {
    ref: r,
    className: o("zen-text-sm zen-text-zen-muted-fg zen-m-0", e),
    ...n
  }
));
f.displayName = "CardDescription";
const c = d.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ a("div", { ref: r, className: o("zen-p-5 zen-pt-0", e), ...n }));
c.displayName = "CardContent";
const b = d.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ a(
  "div",
  {
    ref: r,
    className: o(
      "zen-flex zen-items-center zen-gap-2 zen-p-5 zen-pt-3 zen-border-t zen-border-zen-border",
      e
    ),
    ...n
  }
));
b.displayName = "CardFooter";
export {
  m as Card,
  c as CardContent,
  f as CardDescription,
  b as CardFooter,
  p as CardHeader,
  l as CardTitle,
  i as cardVariants
};
//# sourceMappingURL=index81.js.map
