import { jsxs as i, jsx as o } from "react/jsx-runtime";
import * as t from "react";
import { Dialog as p, Close as s, DialogPortal as D, DialogTrigger as y, Content as d, Description as g, DialogOverlay as c, DialogTitle as m } from "./index170.js";
import { cn as l } from "./index145.js";
const R = p, O = y, b = D, P = s, f = t.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  c,
  {
    ref: a,
    className: l("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", e),
    ...n
  }
));
f.displayName = c.displayName;
const h = t.forwardRef(({ className: e, children: n, variant: a = "default", ...u }, x) => {
  const r = a === "paper", z = /* @__PURE__ */ i(
    d,
    {
      ref: x,
      className: l(
        "zen-z-50 focus:zen-outline-none",
        r ? [
          /* Relative inside the scroll container, so it flows with the
             scroll rather than being pinned to the viewport. `mx-auto`
             centres it horizontally and `my-` is the sheet's margin on the
             desk — which is also what makes the bottom edge visible when
             you reach the end, instead of the document being clipped
             against the viewport. */
          "zen-relative zen-mx-auto zen-my-12 zen-w-full zen-max-w-3xl",
          "zen-rounded-zen-sm zen-bg-zen-background zen-text-zen-foreground zen-p-12 zen-shadow-zen-xl"
        ] : [
          "zen-fixed zen-left-1/2 zen-top-1/2 -zen-translate-x-1/2 -zen-translate-y-1/2",
          "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
          // A surface that paints its own background MUST paint its own
          // foreground. This is portalled to <body>, so "inherit" means the
          // consumer's body colour, not the app's — with a dark theme the
          // panel went dark and the text stayed black, at about 1.2:1. The
          // token was right the whole time; nothing read it.
          "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg"
        ],
        e
      ),
      ...u,
      children: [
        n,
        /* @__PURE__ */ o(
          s,
          {
            "aria-label": "Close",
            className: l(
              "zen-absolute zen-end-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center",
              "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
              "hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ o($, {})
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ i(b, { children: [
    /* @__PURE__ */ o(f, {}),
    r ? /* @__PURE__ */ o("div", { className: "zen-fixed zen-inset-0 zen-z-50 zen-overflow-y-auto", children: z }) : z
  ] });
});
h.displayName = d.displayName;
const v = ({
  className: e,
  ...n
}) => /* @__PURE__ */ o(
  "div",
  {
    className: l("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3 zen-pe-8", e),
    ...n
  }
);
v.displayName = "DialogHeader";
const N = ({
  className: e,
  ...n
}) => /* @__PURE__ */ o(
  "div",
  {
    className: l(
      "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5",
      e
    ),
    ...n
  }
);
N.displayName = "DialogFooter";
const w = t.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  m,
  {
    ref: a,
    className: l(
      "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground",
      e
    ),
    ...n
  }
));
w.displayName = m.displayName;
const C = t.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  g,
  {
    ref: a,
    className: l("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", e),
    ...n
  }
));
C.displayName = g.displayName;
const $ = () => /* @__PURE__ */ i("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ o("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ o("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
export {
  R as Dialog,
  P as DialogClose,
  h as DialogContent,
  C as DialogDescription,
  N as DialogFooter,
  v as DialogHeader,
  f as DialogOverlay,
  b as DialogPortal,
  w as DialogTitle,
  O as DialogTrigger
};
//# sourceMappingURL=index71.js.map
