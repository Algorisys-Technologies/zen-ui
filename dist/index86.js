import { jsx as a } from "react/jsx-runtime";
import * as i from "react";
import { Root as m, Content as s, List as z, Trigger as d } from "./index174.js";
import { cva as l } from "./index144.js";
import { cn as o } from "./index143.js";
const N = m, b = l("zen-inline-flex zen-items-stretch", {
  variants: {
    variant: {
      underline: "zen-border-b zen-border-zen-border zen-w-full zen-gap-1",
      pills: "zen-rounded-zen-md zen-bg-zen-muted zen-p-1 zen-gap-1"
    },
    orientation: {
      // flex-wrap so a horizontal tab list with many tabs wraps to multiple
      // rows instead of overflowing/clipping its container.
      horizontal: "zen-flex-row zen-flex-wrap",
      vertical: "zen-flex-col zen-items-start"
    }
  },
  compoundVariants: [
    {
      variant: "underline",
      orientation: "vertical",
      class: "zen-border-b-0 zen-border-r zen-border-zen-border"
    },
    {
      variant: "pills",
      orientation: "vertical",
      class: "zen-items-stretch"
    }
  ],
  defaultVariants: {
    variant: "underline",
    orientation: "horizontal"
  }
}), f = i.forwardRef(({ className: n, variant: e, orientation: t, ...r }, c) => /* @__PURE__ */ a(
  z,
  {
    ref: c,
    "data-variant": e ?? "underline",
    className: o(b({ variant: e, orientation: t }), n),
    ...r
  }
));
f.displayName = z.displayName;
const p = l(
  [
    "zen-inline-flex zen-items-center zen-justify-center zen-whitespace-nowrap",
    "zen-text-sm zen-font-medium",
    "zen-border-0 zen-bg-transparent zen-cursor-pointer",
    "zen-transition-colors",
    "disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset"
  ].join(" "),
  {
    variants: {
      variant: {
        underline: [
          "zen-px-3 zen-py-2 -zen-mb-px zen-text-zen-muted-fg",
          "zen-border-b-2 zen-border-transparent",
          "hover:zen-text-zen-foreground",
          "data-[state=active]:zen-text-zen-primary data-[state=active]:zen-border-zen-primary"
        ].join(" "),
        pills: [
          "zen-px-3 zen-py-1.5 zen-rounded-zen-sm zen-text-zen-muted-fg",
          "hover:zen-text-zen-foreground",
          "data-[state=active]:zen-bg-zen-background data-[state=active]:zen-text-zen-foreground data-[state=active]:zen-shadow-zen-xs"
        ].join(" ")
      }
    },
    defaultVariants: {
      variant: "underline"
    }
  }
), u = i.forwardRef(({ className: n, variant: e, ...t }, r) => /* @__PURE__ */ a(
  d,
  {
    ref: r,
    className: o(p({ variant: e }), n),
    ...t
  }
));
u.displayName = d.displayName;
const v = i.forwardRef(({ className: n, ...e }, t) => /* @__PURE__ */ a(
  s,
  {
    ref: t,
    className: o(
      "zen-mt-3 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring zen-rounded-zen-sm",
      n
    ),
    ...e
  }
));
v.displayName = s.displayName;
export {
  N as Tabs,
  v as TabsContent,
  f as TabsList,
  u as TabsTrigger,
  b as tabsListVariants,
  p as tabsTriggerVariants
};
//# sourceMappingURL=index86.js.map
