import { jsxs as l, jsx as n } from "react/jsx-runtime";
import * as o from "react";
import { cn as s } from "./index197.js";
import "./index28.js";
import "./index110.js";
import { Button as c } from "./index71.js";
import { SelectDialog as O } from "./index59.js";
import { useLocale as E } from "./index90.js";
const R = "zen-[grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]", A = ({
  fields: i,
  onGo: d,
  onClear: z,
  variant: h,
  visibleIds: m,
  onVisibleIdsChange: x,
  adaptable: p = !0,
  collapsible: v = !0,
  defaultExpanded: y = !0,
  goLabel: B,
  clearLabel: k,
  adaptLabel: L,
  className: N
}) => {
  const t = E(), C = B ?? t.t("filterBar.go"), D = k ?? t.t("common.clear"), a = L ?? t.t("filterBar.adapt"), [r, I] = o.useState(y), [j, u] = o.useState(!1), [w, F] = o.useState(
    () => i.filter((e) => !e.hiddenByDefault).map((e) => e.id)
  ), f = m !== void 0, b = f ? m : w, S = (e) => {
    f || F(e), x?.(e);
  }, g = i.filter((e) => b.includes(e.id));
  return /* @__PURE__ */ l(
    "div",
    {
      className: s(
        "zen-flex zen-flex-col zen-gap-zen-bar-y zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-4 zen-py-zen-bar-y",
        N
      ),
      children: [
        /* @__PURE__ */ l("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
          v ? /* @__PURE__ */ n(
            "button",
            {
              type: "button",
              "aria-expanded": r,
              "aria-label": r ? t.t("filterBar.collapse") : t.t("filterBar.expand"),
              onClick: () => I((e) => !e),
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
          h,
          /* @__PURE__ */ l("div", { className: "zen-ml-auto zen-flex zen-items-center zen-gap-2", children: [
            p ? /* @__PURE__ */ n(
              c,
              {
                type: "button",
                variant: "ghost",
                color: "neutral",
                size: "sm",
                onClick: () => u(!0),
                children: a
              }
            ) : null,
            z ? /* @__PURE__ */ n(c, { type: "button", variant: "outline", color: "neutral", size: "sm", onClick: z, children: D }) : null,
            d ? /* @__PURE__ */ n(c, { type: "button", size: "sm", onClick: d, children: C }) : null
          ] })
        ] }),
        r ? g.length ? /* @__PURE__ */ n("div", { className: s("zen-grid zen-gap-3", R), children: g.map((e) => /* @__PURE__ */ l("label", { className: "zen-flex zen-flex-col zen-gap-1", children: [
          /* @__PURE__ */ n("span", { className: "zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: e.label }),
          e.render()
        ] }, e.id)) }) : /* @__PURE__ */ n("p", { className: "zen-m-0 zen-py-2 zen-text-sm zen-text-zen-muted-fg", children: t.t("filterBar.noFilters", { adapt: a }) }) : null,
        p ? /* @__PURE__ */ n(
          O,
          {
            open: j,
            onOpenChange: u,
            title: a,
            description: t.t("filterBar.adaptDescription"),
            items: i.map((e) => ({ id: e.id, label: e.label })),
            multiple: !0,
            selectedIds: b,
            onConfirm: S
          }
        ) : null
      ]
    }
  );
};
A.displayName = "FilterBar";
export {
  A as FilterBar
};
//# sourceMappingURL=index56.js.map
