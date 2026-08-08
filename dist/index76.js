import { jsxs as s, jsx as t } from "react/jsx-runtime";
import * as i from "react";
import { Dialog as u, Close as r, DialogPortal as p, DialogTrigger as b, Content as z, Description as l, DialogOverlay as d, DialogTitle as m } from "./index168.js";
import { cva as x } from "./index144.js";
import { cn as a } from "./index143.js";
const F = u, H = b, L = r, y = p, c = i.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  d,
  {
    ref: o,
    className: a(
      "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/40",
      "data-[state=open]:zen-anim-fade-in",
      "data-[state=closed]:zen-anim-fade-out",
      e
    ),
    ...n
  }
));
c.displayName = d.displayName;
const v = x(
  [
    "zen-fixed zen-z-50 zen-flex zen-flex-col zen-gap-4 zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
    "zen-transition zen-ease-in-out",
    "focus-visible:zen-outline-none"
  ].join(" "),
  {
    variants: {
      side: {
        right: [
          "zen-inset-y-0 zen-right-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-l zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-right",
          "data-[state=closed]:zen-anim-slide-out-right"
        ].join(" "),
        left: [
          "zen-inset-y-0 zen-left-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-r zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-left",
          "data-[state=closed]:zen-anim-slide-out-left"
        ].join(" "),
        top: [
          "zen-inset-x-0 zen-top-0 zen-w-full zen-max-h-[80vh] zen-border-b zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-top",
          "data-[state=closed]:zen-anim-slide-out-top"
        ].join(" "),
        bottom: [
          "zen-inset-x-0 zen-bottom-0 zen-w-full zen-max-h-[80vh] zen-border-t zen-border-zen-border",
          "zen-rounded-t-zen-lg",
          "data-[state=open]:zen-anim-slide-in-bottom",
          "data-[state=closed]:zen-anim-slide-out-bottom"
        ].join(" ")
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
), N = i.forwardRef(({ className: e, side: n = "right", showCloseButton: o = !0, children: f, ...g }, h) => /* @__PURE__ */ s(y, { children: [
  /* @__PURE__ */ t(c, {}),
  /* @__PURE__ */ s(
    z,
    {
      ref: h,
      className: a(v({ side: n }), e),
      ...g,
      children: [
        f,
        o ? /* @__PURE__ */ t(
          r,
          {
            "aria-label": "Close sheet",
            className: a(
              "zen-absolute zen-top-3 zen-end-3 zen-inline-flex zen-items-center zen-justify-center",
              "zen-h-7 zen-w-7 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ s("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
              /* @__PURE__ */ t("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
              /* @__PURE__ */ t("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
            ] })
          }
        ) : null
      ]
    }
  )
] }));
N.displayName = z.displayName;
const w = ({
  className: e,
  ...n
}) => /* @__PURE__ */ t(
  "div",
  {
    className: a("zen-flex zen-flex-col zen-gap-1.5", e),
    ...n
  }
);
w.displayName = "SheetHeader";
const S = ({
  className: e,
  ...n
}) => /* @__PURE__ */ t(
  "div",
  {
    className: a(
      "zen-mt-auto zen-flex zen-flex-col-reverse zen-gap-2 sm:zen-flex-row sm:zen-justify-end",
      e
    ),
    ...n
  }
);
S.displayName = "SheetFooter";
const D = i.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  m,
  {
    ref: o,
    className: a(
      "zen-text-base zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-m-0",
      e
    ),
    ...n
  }
));
D.displayName = m.displayName;
const j = i.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  l,
  {
    ref: o,
    className: a("zen-text-sm zen-text-zen-muted-fg zen-m-0", e),
    ...n
  }
));
j.displayName = l.displayName;
export {
  F as Sheet,
  L as SheetClose,
  N as SheetContent,
  j as SheetDescription,
  S as SheetFooter,
  w as SheetHeader,
  c as SheetOverlay,
  y as SheetPortal,
  D as SheetTitle,
  H as SheetTrigger,
  v as sheetContentVariants
};
//# sourceMappingURL=index76.js.map
