import { jsxs as g, jsx as t } from "react/jsx-runtime";
import * as l from "react";
import { Root as m, Action as c, Cancel as f, Portal as p, Trigger as x, Content as r, Description as s, Overlay as i, Title as z } from "./index171.js";
import { cn as o } from "./index145.js";
const T = m, h = x, y = p, d = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ t(
  i,
  {
    ref: a,
    className: o("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", e),
    ...n
  }
));
d.displayName = i.displayName;
const D = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ g(y, { children: [
  /* @__PURE__ */ t(d, {}),
  /* @__PURE__ */ t(
    r,
    {
      ref: a,
      className: o(
        "zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2",
        "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
        "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
        "focus:zen-outline-none",
        e
      ),
      ...n
    }
  )
] }));
D.displayName = r.displayName;
const N = ({
  className: e,
  ...n
}) => /* @__PURE__ */ t("div", { className: o("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3", e), ...n });
N.displayName = "AlertDialogHeader";
const A = ({
  className: e,
  ...n
}) => /* @__PURE__ */ t(
  "div",
  {
    className: o(
      "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5",
      e
    ),
    ...n
  }
);
A.displayName = "AlertDialogFooter";
const u = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ t(
  z,
  {
    ref: a,
    className: o("zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground", e),
    ...n
  }
));
u.displayName = z.displayName;
const b = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ t(
  s,
  {
    ref: a,
    className: o("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", e),
    ...n
  }
));
b.displayName = s.displayName;
const C = c, j = f;
export {
  T as AlertDialog,
  C as AlertDialogAction,
  j as AlertDialogCancel,
  D as AlertDialogContent,
  b as AlertDialogDescription,
  A as AlertDialogFooter,
  N as AlertDialogHeader,
  d as AlertDialogOverlay,
  y as AlertDialogPortal,
  u as AlertDialogTitle,
  h as AlertDialogTrigger
};
//# sourceMappingURL=index72.js.map
