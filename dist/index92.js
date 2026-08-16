import { jsx as o, jsxs as l } from "react/jsx-runtime";
import * as t from "react";
import { cva as c } from "./index146.js";
import { cn as s } from "./index145.js";
const f = c(
  [
    "zen-relative zen-w-full zen-rounded-zen-md zen-p-3",
    "zen-flex zen-items-start zen-gap-2"
  ].join(" "),
  {
    variants: {
      color: {
        neutral: "",
        primary: "",
        info: "",
        success: "",
        warning: "",
        error: "",
        /** @deprecated spell it `error` — same tokens, same rendering. */
        destructive: ""
      },
      variant: {
        soft: "",
        outline: "zen-bg-zen-background"
      }
    },
    compoundVariants: [
      // soft (Zen theme "Sky Bg" / tinted background)
      { variant: "soft", color: "neutral", class: "zen-bg-zen-muted zen-text-zen-foreground zen-border zen-border-zen-border" },
      { variant: "soft", color: "primary", class: "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-border zen-border-zen-primary-soft" },
      { variant: "soft", color: "info", class: "zen-bg-zen-info-soft zen-text-zen-info-soft-fg zen-border zen-border-zen-info-soft" },
      { variant: "soft", color: "success", class: "zen-bg-zen-success-soft zen-text-zen-success-soft-fg zen-border zen-border-zen-success-soft" },
      { variant: "soft", color: "warning", class: "zen-bg-zen-warning-soft zen-text-zen-warning-soft-fg zen-border zen-border-zen-warning-soft" },
      { variant: "soft", color: "error", class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border zen-border-zen-error-soft" },
      { variant: "soft", color: "destructive", class: "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-border zen-border-zen-error-soft" },
      // outline (Zen theme "Opaque Bg" / white surface with colored border)
      { variant: "outline", color: "neutral", class: "zen-border zen-border-zen-border zen-text-zen-foreground" },
      { variant: "outline", color: "primary", class: "zen-border zen-border-zen-primary zen-text-zen-foreground" },
      { variant: "outline", color: "info", class: "zen-border zen-border-zen-info zen-text-zen-foreground" },
      { variant: "outline", color: "success", class: "zen-border zen-border-zen-success zen-text-zen-foreground" },
      { variant: "outline", color: "warning", class: "zen-border zen-border-zen-warning zen-text-zen-foreground" },
      { variant: "outline", color: "error", class: "zen-border zen-border-zen-error zen-text-zen-foreground" },
      { variant: "outline", color: "destructive", class: "zen-border zen-border-zen-error zen-text-zen-foreground" }
    ],
    defaultVariants: {
      variant: "soft",
      color: "info"
    }
  }
), d = t.forwardRef(
  ({ className: e, color: n, variant: r, role: a = "alert", ...z }, i) => /* @__PURE__ */ o(
    "div",
    {
      ref: i,
      role: a,
      className: s(f({ color: n, variant: r, className: e })),
      ...z
    }
  )
);
d.displayName = "Alert";
const u = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "span",
  {
    ref: r,
    "aria-hidden": !0,
    className: s("zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-mt-0.5", e),
    ...n
  }
));
u.displayName = "AlertIcon";
const b = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "div",
  {
    ref: r,
    className: s("zen-min-w-0 zen-flex-1 zen-flex zen-flex-col zen-gap-1", e),
    ...n
  }
));
b.displayName = "AlertContent";
const g = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "p",
  {
    ref: r,
    className: s("zen-font-semibold zen-leading-tight zen-text-sm", e),
    ...n
  }
));
g.displayName = "AlertTitle";
const m = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "p",
  {
    ref: r,
    className: s("zen-text-sm zen-opacity-90 zen-leading-snug", e),
    ...n
  }
));
m.displayName = "AlertDescription";
const p = t.forwardRef(({ className: e, ...n }, r) => /* @__PURE__ */ o(
  "div",
  {
    ref: r,
    className: s("zen-ml-auto zen-shrink-0 zen-flex zen-items-center zen-gap-4 zen-self-center", e),
    ...n
  }
));
p.displayName = "AlertActions";
const v = t.forwardRef(
  ({ className: e, ...n }, r) => /* @__PURE__ */ o(
    "button",
    {
      ref: r,
      type: "button",
      "aria-label": "Dismiss",
      className: s(
        "zen-shrink-0 zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-current zen-opacity-70",
        "hover:zen-opacity-100 hover:zen-bg-current/10",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        e
      ),
      ...n,
      children: /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
        /* @__PURE__ */ o("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
        /* @__PURE__ */ o("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
      ] })
    }
  )
);
v.displayName = "AlertClose";
export {
  d as Alert,
  p as AlertActions,
  v as AlertClose,
  b as AlertContent,
  m as AlertDescription,
  u as AlertIcon,
  g as AlertTitle,
  f as alertVariants
};
//# sourceMappingURL=index92.js.map
