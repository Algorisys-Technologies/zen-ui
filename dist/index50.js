import { jsxs as t, jsx as n } from "react/jsx-runtime";
import * as o from "react";
import { cn as s } from "./index143.js";
import "./index24.js";
import "./index98.js";
import { Button as a } from "./index64.js";
import { SelectDialog as D } from "./index52.js";
const S = "zen-[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]", E = ({
  fields: i,
  onGo: d,
  onClear: z,
  variant: x,
  visibleIds: c,
  onVisibleIdsChange: g,
  adaptable: m = !0,
  collapsible: b = !0,
  defaultExpanded: v = !0,
  goLabel: N = "Go",
  clearLabel: k = "Clear",
  adaptLabel: l = "Adapt filters",
  className: y
}) => {
  const [r, C] = o.useState(v), [w, u] = o.useState(!1), [B, I] = o.useState(
    () => i.filter((e) => !e.hiddenByDefault).map((e) => e.id)
  ), p = c !== void 0, f = p ? c : B, j = (e) => {
    p || I(e), g?.(e);
  }, h = i.filter((e) => f.includes(e.id));
  return /* @__PURE__ */ t(
    "div",
    {
      className: s(
        "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-4 zen-py-3",
        y
      ),
      children: [
        /* @__PURE__ */ t("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
          b ? /* @__PURE__ */ n(
            "button",
            {
              type: "button",
              "aria-expanded": r,
              "aria-label": r ? "Collapse filters" : "Expand filters",
              onClick: () => C((e) => !e),
              className: "zen-inline-flex zen-h-7 zen-w-7 zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              children: /* @__PURE__ */ n(
                "svg",
                {
                  width: "14",
                  height: "14",
                  viewBox: "0 0 24 24",
                  fill: "none",
                  stroke: "currentColor",
                  strokeWidth: "2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  "aria-hidden": "true",
                  className: s("zen-transition-transform", r && "zen-rotate-90"),
                  children: /* @__PURE__ */ n("polyline", { points: "9 18 15 12 9 6" })
                }
              )
            }
          ) : null,
          x,
          /* @__PURE__ */ t("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
            m ? /* @__PURE__ */ n(
              a,
              {
                type: "button",
                variant: "ghost",
                color: "neutral",
                size: "sm",
                onClick: () => u(!0),
                children: l
              }
            ) : null,
            z ? /* @__PURE__ */ n(a, { type: "button", variant: "outline", color: "neutral", size: "sm", onClick: z, children: k }) : null,
            d ? /* @__PURE__ */ n(a, { type: "button", size: "sm", onClick: d, children: N }) : null
          ] })
        ] }),
        r ? h.length ? /* @__PURE__ */ n("div", { className: s("zen-grid zen-gap-3", S), children: h.map((e) => /* @__PURE__ */ t("label", { className: "zen-flex zen-flex-col zen-gap-1", children: [
          /* @__PURE__ */ n("span", { className: "zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: e.label }),
          e.render()
        ] }, e.id)) }) : /* @__PURE__ */ t("p", { className: "zen-m-0 zen-py-2 zen-text-sm zen-text-zen-muted-fg", children: [
          "No filters shown. Use ",
          l,
          " to add some."
        ] }) : null,
        m ? /* @__PURE__ */ n(
          D,
          {
            open: w,
            onOpenChange: u,
            title: l,
            description: "Choose which filters appear on the bar.",
            items: i.map((e) => ({ id: e.id, label: e.label })),
            multiple: !0,
            selectedIds: f,
            onConfirm: j
          }
        ) : null
      ]
    }
  );
};
E.displayName = "FilterBar";
export {
  E as FilterBar
};
//# sourceMappingURL=index50.js.map
