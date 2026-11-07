import { jsx as n, jsxs as i } from "react/jsx-runtime";
import "react";
import { pivotFilterWindowValueAt as p } from "./index225.js";
import { VirtualizedItems as f } from "./index136.js";
import { useLocale as b } from "./index90.js";
import { cn as z } from "./index160.js";
const h = 36, x = ({
  totalCount: o,
  optionsWindows: s,
  isSelected: r,
  onToggle: a,
  onVisibleRange: l,
  formatValue: t,
  label: d,
  className: m,
  singleSelect: u
}) => {
  const c = b();
  return /* @__PURE__ */ n("ul", { role: "listbox", "aria-label": c.t("pivot.values", { label: d }), className: "zen-m-0 zen-list-none zen-p-0", children: /* @__PURE__ */ n(
    f,
    {
      totalCount: o,
      getItem: (e) => p(s, e),
      onVisibleRange: l,
      estimateSize: h,
      maxHeight: 256,
      overscan: 4,
      className: z("zen-p-1", m),
      children: ({ item: e }) => e === void 0 ? (
        // A skeleton, not a blank: an empty row reads as "no value" rather
        // than "not yet".
        /* @__PURE__ */ i("div", { className: "zen-flex zen-h-full zen-w-full zen-items-center zen-gap-2 zen-px-2", "aria-hidden": !0, children: [
          /* @__PURE__ */ n("div", { className: "zen-size-4 zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-muted/60 motion-safe:zen-animate-pulse" }),
          /* @__PURE__ */ n("div", { className: "zen-h-3 zen-w-3/4 zen-rounded-zen-sm zen-bg-zen-muted motion-safe:zen-animate-pulse" })
        ] })
      ) : /* @__PURE__ */ i(
        "button",
        {
          type: "button",
          role: "option",
          "aria-selected": r(e),
          onClick: () => a(e),
          className: z(
            "zen-flex zen-h-full zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-px-2 zen-text-start zen-text-sm zen-text-zen-foreground zen-transition-colors",
            "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary/50"
          ),
          children: [
            /* @__PURE__ */ n(
              "span",
              {
                "aria-hidden": !0,
                className: z(
                  "zen-flex zen-size-4 zen-shrink-0 zen-items-center zen-justify-center zen-border zen-border-zen-border",
                  u ? "zen-rounded-full" : "zen-rounded-zen-sm",
                  r(e) && "zen-bg-zen-primary zen-text-zen-primary-fg"
                ),
                children: r(e) ? "✓" : ""
              }
            ),
            /* @__PURE__ */ n("span", { className: "zen-truncate", children: t ? t(e) : e })
          ]
        }
      )
    }
  ) });
};
x.displayName = "WindowedVirtualList";
export {
  x as WindowedVirtualList
};
//# sourceMappingURL=index227.js.map
