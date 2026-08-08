import { jsxs as z, jsx as t } from "react/jsx-runtime";
import * as u from "react";
import { VIRTUAL_SCROLL_WINDOW_PAGE_SIZE as w } from "./index189.js";
import { isFilterActive as C, isValueSelected as F } from "./index25.js";
import { Icon as L } from "./index56.js";
import { Input as W } from "./index4.js";
import { Loading as I } from "./index60.js";
import { Popover as M, PopoverTrigger as R, PopoverContent as V } from "./index31.js";
import { useWindowedOptionPages as j } from "./index190.js";
import { WindowedVirtualList as A } from "./index191.js";
import { cn as T } from "./index143.js";
const _ = ({
  columnKey: d,
  label: l,
  selection: i,
  formatValue: v,
  onChange: a,
  loadOptions: c,
  triggerClassName: b,
  triggerChildren: y,
  singleSelect: p
}) => {
  const [m, N] = u.useState(!1), [h, f] = u.useState(""), g = C(i), P = u.useCallback(
    async (e, n, s) => {
      if (!c) return { values: [], hasMore: !1, total: 0 };
      const r = await c(d, s, { offset: e, limit: n });
      return { values: r.values, hasMore: r.hasMore, total: r.total ?? r.values.length };
    },
    [c, d]
  ), o = j({
    pageSize: w,
    isActive: m,
    search: h,
    loadPage: P
  }), S = (e) => {
    if (p) {
      a({ kind: "include", values: [e] });
      return;
    }
    const n = i;
    if (!n || n.kind === "all") {
      const r = n?.kind === "all" ? n.exclude : [], x = r.includes(e) ? r.filter((k) => k !== e) : [...r, e];
      x.length === 0 ? a(null) : a({ kind: "all", exclude: x, ...n?.kind === "all" && n.optionSearch ? { optionSearch: n.optionSearch } : {} });
      return;
    }
    const s = n.values.includes(e) ? n.values.filter((r) => r !== e) : [...n.values, e];
    a(s.length === 0 ? null : { kind: "include", values: s });
  };
  return /* @__PURE__ */ z(
    M,
    {
      open: m,
      onOpenChange: (e) => {
        N(e), e && (f(""), o.openPanelFetch());
      },
      children: [
        /* @__PURE__ */ t(R, { asChild: !0, children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            "aria-label": `Filter ${l}`,
            onPointerDown: (e) => e.stopPropagation(),
            className: T(
              "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-transition-colors",
              g ? "zen-text-zen-primary hover:zen-bg-zen-muted" : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
              b
            ),
            children: y ?? /* @__PURE__ */ t(L, { name: "chevron-down", className: "zen-h-3.5 zen-w-3.5" })
          }
        ) }),
        /* @__PURE__ */ t(V, { className: "zen-w-72 zen-p-2", align: "start", children: /* @__PURE__ */ z("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          /* @__PURE__ */ t(
            W,
            {
              value: h,
              onChange: (e) => f(e.target.value),
              placeholder: `Search ${l}`,
              "aria-label": `Search ${l} values`,
              autoFocus: !0,
              className: "zen-h-8"
            }
          ),
          o.loading ? /* @__PURE__ */ t("div", { className: "zen-flex zen-items-center zen-justify-center zen-py-6", "aria-busy": !0, children: /* @__PURE__ */ t(I, { size: "sm", label: "Loading values…" }) }) : o.loadError ? (
            // A failed fetch is NOT an empty result. Saying "No matching values"
            // here sends people looking for data that is not missing.
            /* @__PURE__ */ z("div", { className: "zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3", role: "alert", children: [
              /* @__PURE__ */ t("p", { className: "zen-m-0 zen-text-sm zen-text-zen-error", children: "Could not load values." }),
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline",
                  onClick: () => o.openPanelFetch(),
                  children: "Try again"
                }
              )
            ] })
          ) : o.totalCount === 0 ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg", children: "No matching values" }) : /* @__PURE__ */ t(
            A,
            {
              label: l,
              totalCount: o.totalCount,
              optionsWindows: o.optionsWindows,
              isSelected: (e) => F(i, e),
              onToggle: S,
              onVisibleRange: o.handleVisibleRange,
              formatValue: v,
              singleSelect: p
            }
          ),
          g ? /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "zen-cursor-pointer zen-self-start zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline",
              onClick: () => a(null),
              children: "Clear filter"
            }
          ) : null
        ] }) })
      ]
    }
  );
};
_.displayName = "PivotFilterMenu";
export {
  _ as PivotFilterMenu
};
//# sourceMappingURL=index137.js.map
