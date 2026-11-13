import { jsx as r, jsxs as m } from "react/jsx-runtime";
import * as t from "react";
import { Provider as p, Root as i, Action as z, Close as l, Description as d, Title as c, Viewport as f } from "./index234.js";
import { cva as u } from "./index198.js";
import { useLocale as g } from "./index90.js";
import { cn as s } from "./index197.js";
const C = p, x = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  f,
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
x.displayName = f.displayName;
const b = u(
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
), v = t.forwardRef(({ className: e, variant: n, ...o }, a) => /* @__PURE__ */ r(
  i,
  {
    ref: a,
    className: s(b({ variant: n }), e),
    ...o
  }
));
v.displayName = i.displayName;
const w = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  z,
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
w.displayName = z.displayName;
const y = t.forwardRef(({ className: e, ...n }, o) => {
  const a = g();
  return /* @__PURE__ */ r(
    l,
    {
      ref: o,
      "toast-close": "",
      "aria-label": a.t("common.close"),
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
  );
});
y.displayName = l.displayName;
const h = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  c,
  {
    ref: o,
    className: s("zen-text-sm zen-font-semibold zen-leading-tight", e),
    ...n
  }
));
h.displayName = c.displayName;
const N = t.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ r(
  d,
  {
    ref: o,
    className: s("zen-text-sm zen-opacity-90 zen-leading-snug", e),
    ...n
  }
));
N.displayName = d.displayName;
export {
  v as Toast,
  w as ToastAction,
  y as ToastClose,
  N as ToastDescription,
  C as ToastProvider,
  h as ToastTitle,
  x as ToastViewport,
  b as toastVariants
};
//# sourceMappingURL=index82.js.map
