import { jsx as r, jsxs as m } from "react/jsx-runtime";
import * as t from "react";
import { Provider as p, Root as a, Action as i, Close as z, Description as d, Title as l, Viewport as c } from "./index172.js";
import { cva as u } from "./index146.js";
import { cn as s } from "./index145.js";
const k = p, g = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  c,
  {
    ref: o,
    className: s(
      "zen-fixed zen-top-0 zen-right-0 zen-z-[100] zen-flex zen-max-h-screen zen-w-full zen-flex-col zen-p-4",
      "md:zen-max-w-sm",
      e
    ),
    ...n
  }
));
g.displayName = c.displayName;
const x = u(
  [
    "zen-group zen-pointer-events-auto zen-relative zen-flex zen-w-full zen-items-start zen-gap-3",
    "zen-overflow-hidden zen-rounded-zen-md zen-border zen-p-4 zen-shadow-zen-lg",
    "data-[swipe=cancel]:zen-translate-x-0",
    "data-[swipe=end]:zen-translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:zen-translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:zen-transition-none"
  ].join(" "),
  {
    variants: {
      variant: {
        default: "zen-bg-zen-background zen-border-zen-border zen-text-zen-foreground",
        success: "zen-bg-zen-success-soft zen-border-zen-success zen-text-zen-success-soft-fg",
        warning: "zen-bg-zen-warning-soft zen-border-zen-warning zen-text-zen-warning-soft-fg",
        destructive: "zen-bg-zen-error-soft zen-border-zen-error zen-text-zen-error-soft-fg",
        info: "zen-bg-zen-info-soft zen-border-zen-info zen-text-zen-info-soft-fg"
      }
    },
    defaultVariants: { variant: "default" }
  }
), b = t.forwardRef(({ className: e, variant: n, ...o }, f) => /* @__PURE__ */ r(
  a,
  {
    ref: f,
    className: s(x({ variant: n }), e),
    ...o
  }
));
b.displayName = a.displayName;
const v = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  i,
  {
    ref: o,
    className: s(
      "zen-ml-auto zen-inline-flex zen-h-8 zen-shrink-0 zen-items-center zen-justify-center",
      "zen-rounded-zen-sm zen-border zen-border-current/30 zen-bg-transparent zen-px-3 zen-text-sm zen-font-medium",
      "hover:zen-bg-current/10",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      e
    ),
    ...n
  }
));
v.displayName = i.displayName;
const w = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  z,
  {
    ref: o,
    "toast-close": "",
    "aria-label": "Close",
    className: s(
      "zen-absolute zen-end-2 zen-top-2 zen-inline-flex zen-h-6 zen-w-6 zen-items-center zen-justify-center",
      "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-opacity-70",
      "hover:zen-opacity-100 hover:zen-bg-current/10",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      e
    ),
    ...n,
    children: /* @__PURE__ */ m("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
      /* @__PURE__ */ r("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
      /* @__PURE__ */ r("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
    ] })
  }
));
w.displayName = z.displayName;
const y = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  l,
  {
    ref: o,
    className: s("zen-text-sm zen-font-semibold zen-leading-tight", e),
    ...n
  }
));
y.displayName = l.displayName;
const h = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  d,
  {
    ref: o,
    className: s("zen-text-sm zen-opacity-90 zen-leading-snug", e),
    ...n
  }
));
h.displayName = d.displayName;
export {
  b as Toast,
  v as ToastAction,
  w as ToastClose,
  h as ToastDescription,
  k as ToastProvider,
  y as ToastTitle,
  g as ToastViewport,
  x as toastVariants
};
//# sourceMappingURL=index74.js.map
