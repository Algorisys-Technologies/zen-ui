import { jsxs as r, jsx as t } from "react/jsx-runtime";
import * as i from "react";
import { Dialog as p, Close as s, DialogPortal as b, DialogTrigger as x, Content as z, Description as l, DialogOverlay as d, DialogTitle as m } from "./index232.js";
import { cva as y } from "./index198.js";
import { useLocale as v } from "./index90.js";
import { cn as a } from "./index197.js";
const O = p, P = x, V = s, N = b, c = i.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
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
const w = y(
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
), S = i.forwardRef(({ className: e, side: n = "right", showCloseButton: o = !0, children: f, ...h }, g) => {
  const u = v();
  return /* @__PURE__ */ r(N, { children: [
    /* @__PURE__ */ t(c, {}),
    /* @__PURE__ */ r(
      z,
      {
        ref: g,
        className: a(w({ side: n }), e),
        ...h,
        children: [
          f,
          o ? /* @__PURE__ */ t(
            s,
            {
              "aria-label": u.t("sheet.closeSheet"),
              className: a(
                "zen-absolute zen-top-3 zen-end-3 zen-inline-flex zen-items-center zen-justify-center",
                "zen-h-7 zen-w-7 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
                "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
              ),
              children: /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
                /* @__PURE__ */ t("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
                /* @__PURE__ */ t("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
              ] })
            }
          ) : null
        ]
      }
    )
  ] });
});
S.displayName = z.displayName;
const D = ({
  className: e,
  ...n
}) => /* @__PURE__ */ t(
  "div",
  {
    className: a("zen-flex zen-flex-col zen-gap-1.5", e),
    ...n
  }
);
D.displayName = "SheetHeader";
const j = ({
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
j.displayName = "SheetFooter";
const C = i.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
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
C.displayName = m.displayName;
const k = i.forwardRef(({ className: e, ...n }, o) => /* @__PURE__ */ t(
  l,
  {
    ref: o,
    className: a("zen-text-sm zen-text-zen-muted-fg zen-m-0", e),
    ...n
  }
));
k.displayName = l.displayName;
export {
  O as Sheet,
  V as SheetClose,
  S as SheetContent,
  k as SheetDescription,
  j as SheetFooter,
  D as SheetHeader,
  c as SheetOverlay,
  N as SheetPortal,
  C as SheetTitle,
  P as SheetTrigger,
  w as sheetContentVariants
};
//# sourceMappingURL=index85.js.map
