import { jsxs as r, jsx as o } from "react/jsx-runtime";
import * as l from "react";
import { Dialog as f, Close as t, DialogPortal as D, DialogTrigger as p, Content as s, Description as z, DialogOverlay as g, DialogTitle as d } from "./index168.js";
import { cn as i } from "./index143.js";
const k = f, T = p, x = D, j = t, c = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  g,
  {
    ref: a,
    className: i("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", e),
    ...n
  }
));
c.displayName = g.displayName;
const u = l.forwardRef(({ className: e, children: n, ...a }, m) => /* @__PURE__ */ r(x, { children: [
  /* @__PURE__ */ o(c, {}),
  /* @__PURE__ */ r(
    s,
    {
      ref: m,
      className: i(
        "zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2",
        "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
        // A surface that paints its own background MUST paint its own
        // foreground. This is portalled to <body>, so "inherit" means the
        // consumer's body colour, not the app's — with a dark theme the panel
        // went dark and the text stayed black, at about 1.2:1. The token was
        // right the whole time; nothing read it.
        "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
        "focus:zen-outline-none",
        e
      ),
      ...a,
      children: [
        n,
        /* @__PURE__ */ o(
          t,
          {
            "aria-label": "Close",
            className: i(
              "zen-absolute zen-end-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center",
              "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
              "hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ o(v, {})
          }
        )
      ]
    }
  )
] }));
u.displayName = s.displayName;
const y = ({
  className: e,
  ...n
}) => /* @__PURE__ */ o(
  "div",
  {
    className: i("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3 zen-pe-8", e),
    ...n
  }
);
y.displayName = "DialogHeader";
const b = ({
  className: e,
  ...n
}) => /* @__PURE__ */ o(
  "div",
  {
    className: i(
      "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5",
      e
    ),
    ...n
  }
);
b.displayName = "DialogFooter";
const N = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  d,
  {
    ref: a,
    className: i(
      "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground",
      e
    ),
    ...n
  }
));
N.displayName = d.displayName;
const h = l.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  z,
  {
    ref: a,
    className: i("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", e),
    ...n
  }
));
h.displayName = z.displayName;
const v = () => /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ o("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ o("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
export {
  k as Dialog,
  j as DialogClose,
  u as DialogContent,
  h as DialogDescription,
  b as DialogFooter,
  y as DialogHeader,
  c as DialogOverlay,
  x as DialogPortal,
  N as DialogTitle,
  T as DialogTrigger
};
//# sourceMappingURL=index70.js.map
