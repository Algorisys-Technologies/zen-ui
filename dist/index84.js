import { jsx as e, jsxs as z } from "react/jsx-runtime";
import * as s from "react";
import { Root as l, Content as a, Item as m, Header as f, Trigger as c } from "./index172.js";
import { cn as t } from "./index143.js";
const v = l, p = s.forwardRef(({ className: n, ...o }, r) => /* @__PURE__ */ e(
  m,
  {
    ref: r,
    className: t("zen-border-b zen-border-zen-border last:zen-border-b-0", n),
    ...o
  }
));
p.displayName = "AccordionItem";
const g = s.forwardRef(({ className: n, children: o, ...r }, i) => /* @__PURE__ */ e(f, { className: "zen-flex", children: /* @__PURE__ */ z(
  c,
  {
    ref: i,
    className: t(
      "zen-flex zen-flex-1 zen-items-center zen-justify-between zen-gap-2",
      "zen-py-3 zen-px-1 zen-text-sm zen-font-medium zen-text-start",
      "zen-bg-transparent zen-border-0 zen-cursor-pointer",
      "zen-transition-colors hover:zen-text-zen-foreground",
      "zen-text-zen-foreground",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
      /* Rotate the trailing chevron when open via data-state. */
      "[&[data-state=open]>svg.zen-acc-chevron]:zen-rotate-180",
      n
    ),
    ...r,
    children: [
      o,
      /* @__PURE__ */ e(
        "svg",
        {
          className: "zen-acc-chevron zen-transition-transform zen-duration-200 zen-text-zen-muted-fg zen-flex-shrink-0",
          width: "16",
          height: "16",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          "aria-hidden": !0,
          children: /* @__PURE__ */ e("polyline", { points: "6 9 12 15 18 9" })
        }
      )
    ]
  }
) }));
g.displayName = c.displayName;
const u = s.forwardRef(({ className: n, children: o, style: r, ...i }, d) => /* @__PURE__ */ e(
  a,
  {
    ref: d,
    style: {
      "--zen-collapsible-content-height": "var(--radix-accordion-content-height)",
      ...r
    },
    className: t(
      "zen-overflow-hidden zen-text-sm",
      "data-[state=closed]:zen-anim-accordion-up data-[state=open]:zen-anim-accordion-down"
    ),
    ...i,
    children: /* @__PURE__ */ e("div", { className: t("zen-pb-3 zen-px-1 zen-pt-0 zen-text-zen-foreground", n), children: o })
  }
));
u.displayName = a.displayName;
export {
  v as Accordion,
  u as AccordionContent,
  p as AccordionItem,
  g as AccordionTrigger
};
//# sourceMappingURL=index84.js.map
