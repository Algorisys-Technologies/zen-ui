import { jsx as a } from "react/jsx-runtime";
import * as r from "react";
import { cva as d } from "./index146.js";
import { cn as z } from "./index145.js";
const o = d(
  [
    "zen-flex zen-flex-col zen-items-center zen-justify-center zen-text-center",
    "zen-text-zen-foreground"
  ].join(" "),
  {
    variants: {
      size: {
        sm: "zen-py-6 zen-px-3 zen-gap-1.5",
        md: "zen-py-10 zen-px-6 zen-gap-3",
        lg: "zen-py-16 zen-px-8 zen-gap-4"
      },
      bordered: {
        true: "zen-border-2 zen-border-dashed zen-border-zen-border zen-rounded-zen-md zen-bg-zen-muted/40",
        false: ""
      }
    },
    defaultVariants: {
      size: "md",
      bordered: !1
    }
  }
), i = r.forwardRef(
  ({ className: e, size: t, bordered: n, ...m }, s) => /* @__PURE__ */ a(
    "div",
    {
      ref: s,
      role: "status",
      className: z(o({ size: t, bordered: n }), e),
      ...m
    }
  )
);
i.displayName = "EmptyState";
const p = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ a(
  "div",
  {
    ref: n,
    "aria-hidden": !0,
    className: z(
      "zen-inline-flex zen-items-center zen-justify-center",
      "zen-h-12 zen-w-12 zen-rounded-zen-full zen-bg-zen-muted zen-text-zen-muted-fg",
      "zen-mb-1",
      e
    ),
    ...t
  }
));
p.displayName = "EmptyStateIcon";
const f = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ a(
  "h3",
  {
    ref: n,
    className: z("zen-text-base zen-font-semibold zen-m-0", e),
    ...t
  }
));
f.displayName = "EmptyStateTitle";
const c = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ a(
  "p",
  {
    ref: n,
    className: z(
      "zen-text-sm zen-text-zen-muted-fg zen-max-w-[40ch] zen-m-0 zen-leading-relaxed",
      e
    ),
    ...t
  }
));
c.displayName = "EmptyStateDescription";
const l = r.forwardRef(({ className: e, ...t }, n) => /* @__PURE__ */ a(
  "div",
  {
    ref: n,
    className: z(
      "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-2 zen-mt-2",
      e
    ),
    ...t
  }
));
l.displayName = "EmptyStateActions";
export {
  i as EmptyState,
  l as EmptyStateActions,
  c as EmptyStateDescription,
  p as EmptyStateIcon,
  f as EmptyStateTitle,
  o as emptyStateVariants
};
//# sourceMappingURL=index89.js.map
