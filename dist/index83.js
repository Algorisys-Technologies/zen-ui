import { jsxs as t, jsx as e } from "react/jsx-runtime";
import * as s from "react";
import { Item as c, Indicator as m, RadioGroup as u } from "./index153.js";
import { cn as a } from "./index143.js";
const p = s.forwardRef(({ className: z, ...n }, r) => /* @__PURE__ */ e(
  u,
  {
    ref: r,
    className: a("zen-grid zen-gap-3", z),
    ...n
  }
));
p.displayName = "SelectableCardGroup";
const f = s.forwardRef(({ className: z, title: n, icon: r, badge: i, children: o, ...d }, l) => /* @__PURE__ */ t(
  c,
  {
    ref: l,
    className: a(
      "zen-group zen-relative zen-w-full zen-text-start",
      "zen-rounded-zen-md zen-border-2 zen-border-zen-border zen-bg-zen-background",
      "zen-p-4 zen-cursor-pointer zen-transition-colors",
      /* hover (only when not selected and not disabled) */
      "hover:zen-border-zen-muted-fg",
      /* selected state — primary ring + soft tint */
      "data-[state=checked]:zen-border-zen-primary data-[state=checked]:zen-bg-zen-primary-soft",
      /* disabled */
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50 disabled:hover:zen-border-zen-border",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
      z
    ),
    ...d,
    children: [
      /* @__PURE__ */ t("div", { className: "zen-flex zen-items-start zen-gap-3", children: [
        r ? /* @__PURE__ */ e(
          "span",
          {
            "aria-hidden": !0,
            className: a(
              "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
              "zen-h-8 zen-w-8 zen-rounded-zen-sm",
              "zen-bg-zen-muted zen-text-zen-muted-fg",
              "group-data-[state=checked]:zen-bg-zen-primary group-data-[state=checked]:zen-text-zen-primary-fg"
            ),
            children: r
          }
        ) : null,
        /* @__PURE__ */ t("div", { className: "zen-flex-1 zen-min-w-0", children: [
          /* @__PURE__ */ t("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
            n ? /* @__PURE__ */ e("span", { className: "zen-text-sm zen-font-semibold zen-text-zen-foreground", children: n }) : null,
            i ? /* @__PURE__ */ e("span", { className: "zen-ml-auto", children: i }) : null
          ] }),
          o ? /* @__PURE__ */ e("div", { className: "zen-text-xs zen-text-zen-muted-fg zen-mt-1 zen-leading-relaxed", children: o }) : null
        ] })
      ] }),
      /* @__PURE__ */ e(
        m,
        {
          className: a(
            "zen-absolute zen-top-2.5 zen-end-2.5",
            "zen-inline-flex zen-items-center zen-justify-center",
            "zen-h-5 zen-w-5 zen-rounded-zen-full",
            "zen-bg-zen-primary zen-text-zen-primary-fg"
          ),
          children: /* @__PURE__ */ e(
            "svg",
            {
              width: "12",
              height: "12",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              strokeWidth: "3",
              strokeLinecap: "round",
              strokeLinejoin: "round",
              "aria-hidden": !0,
              children: /* @__PURE__ */ e("polyline", { points: "20 6 9 17 4 12" })
            }
          )
        }
      )
    ]
  }
));
f.displayName = "SelectableCard";
export {
  f as SelectableCard,
  p as SelectableCardGroup
};
//# sourceMappingURL=index83.js.map
