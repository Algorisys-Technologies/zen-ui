import { jsxs as o, jsx as e } from "react/jsx-runtime";
import * as c from "react";
import { cn as i } from "./index143.js";
const f = c.forwardRef(
  ({ header: r, footer: n, flush: z = !1, className: l, children: a, ...d }, s) => (
    // `h-full`, not `min-h-full`. min-height is a floor, not a ceiling: a page
    // that grows to fit its content means the content area never scrolls — it
    // just expands — and the overflow lands on whatever ancestor can take it,
    // producing a second scrollbar and a header that scrolls away. That exact
    // bug shipped in this repo's demo shell.
    /* @__PURE__ */ o(
      "div",
      {
        ref: s,
        className: i("zen-flex zen-h-full zen-flex-col zen-overflow-hidden", l),
        ...d,
        children: [
          r ? /* @__PURE__ */ e("div", { className: "zen-shrink-0", children: r }) : null,
          /* @__PURE__ */ e("div", { className: i("zen-min-h-0 zen-flex-1 zen-overflow-y-auto", !z && "zen-p-4"), children: a }),
          n ? /* @__PURE__ */ e("div", { className: "zen-shrink-0", children: n }) : null
        ]
      }
    )
  )
);
f.displayName = "Page";
const m = {
  header: "zen-border-b zen-border-zen-border zen-bg-zen-background",
  subheader: "zen-border-b zen-border-zen-border zen-bg-zen-muted",
  footer: "zen-border-t zen-border-zen-border zen-bg-zen-background"
}, t = c.forwardRef(
  ({ startContent: r, middleContent: n, endContent: z, design: l = "header", className: a, ...d }, s) => /* @__PURE__ */ o(
    "div",
    {
      ref: s,
      className: i(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-px-4 zen-py-2",
        m[l],
        a
      ),
      ...d,
      children: [
        /* @__PURE__ */ e("div", { className: "zen-flex zen-flex-1 zen-items-center zen-gap-2", children: r }),
        n ? /* @__PURE__ */ e("div", { className: "zen-flex zen-min-w-0 zen-items-center zen-gap-2 zen-overflow-hidden", children: n }) : null,
        /* @__PURE__ */ e("div", { className: "zen-flex zen-flex-1 zen-items-center zen-justify-end zen-gap-2", children: z })
      ]
    }
  )
);
t.displayName = "Bar";
export {
  t as Bar,
  f as Page
};
//# sourceMappingURL=index42.js.map
