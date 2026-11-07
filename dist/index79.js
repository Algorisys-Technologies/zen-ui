import { jsxs as r, jsx as o } from "react/jsx-runtime";
import * as t from "react";
import { Dialog as D, Close as z, DialogPortal as y, DialogTrigger as b, Content as d, Description as g, DialogOverlay as c, DialogTitle as m } from "./index195.js";
import { useLocale as h } from "./index90.js";
import { cn as l } from "./index160.js";
const P = D, F = b, v = y, H = z, f = t.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  c,
  {
    ref: a,
    className: l("zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50", e),
    ...n
  }
));
f.displayName = c.displayName;
const N = t.forwardRef(({ className: e, children: n, variant: a = "default", ...u }, p) => {
  const x = h(), i = a === "paper", s = /* @__PURE__ */ r(
    d,
    {
      ref: p,
      className: l(
        "zen-z-50 focus:zen-outline-none",
        i ? [
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
          z,
          {
            "aria-label": x.t("common.close"),
            className: l(
              "zen-absolute zen-end-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center",
              "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
              "hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
            ),
            children: /* @__PURE__ */ o(T, {})
          }
        )
      ]
    }
  );
  return /* @__PURE__ */ r(v, { children: [
    /* @__PURE__ */ o(f, {}),
    i ? /* @__PURE__ */ o("div", { className: "zen-fixed zen-inset-0 zen-z-50 zen-overflow-y-auto", children: s }) : s
  ] });
});
N.displayName = d.displayName;
const w = ({
  className: e,
  ...n
}) => /* @__PURE__ */ o(
  "div",
  {
    className: l("zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3 zen-pe-8", e),
    ...n
  }
);
w.displayName = "DialogHeader";
const $ = ({
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
$.displayName = "DialogFooter";
const k = t.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
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
k.displayName = m.displayName;
const C = t.forwardRef(({ className: e, ...n }, a) => /* @__PURE__ */ o(
  g,
  {
    ref: a,
    className: l("zen-text-sm zen-text-zen-muted-fg zen-leading-snug", e),
    ...n
  }
));
C.displayName = g.displayName;
const T = () => /* @__PURE__ */ r("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": !0, children: [
  /* @__PURE__ */ o("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
  /* @__PURE__ */ o("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
] });
export {
  P as Dialog,
  H as DialogClose,
  N as DialogContent,
  C as DialogDescription,
  $ as DialogFooter,
  w as DialogHeader,
  f as DialogOverlay,
  v as DialogPortal,
  k as DialogTitle,
  F as DialogTrigger
};
//# sourceMappingURL=index79.js.map
