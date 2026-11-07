import { jsxs as p, jsx as t } from "react/jsx-runtime";
import * as u from "react";
import { VIRTUAL_SCROLL_WINDOW_PAGE_SIZE as F } from "./index225.js";
import { isFilterActive as L, isValueSelected as V } from "./index29.js";
import { Icon as C } from "./index63.js";
import { Input as M } from "./index4.js";
import { Loading as W } from "./index67.js";
import { Popover as A, PopoverTrigger as I, PopoverContent as R } from "./index35.js";
import { useWindowedOptionPages as j } from "./index226.js";
import { WindowedVirtualList as _ } from "./index227.js";
import { useLocale as E } from "./index90.js";
import { cn as O } from "./index160.js";
const T = ({
  columnKey: d,
  label: l,
  selection: c,
  formatValue: b,
  onChange: i,
  loadOptions: z,
  triggerClassName: y,
  triggerChildren: N,
  singleSelect: m
}) => {
  const o = E(), [h, P] = u.useState(!1), [f, g] = u.useState(""), v = L(c), k = u.useCallback(
    async (e, n, s) => {
      if (!z) return { values: [], hasMore: !1, total: 0 };
      const r = await z(d, s, { offset: e, limit: n });
      return { values: r.values, hasMore: r.hasMore, total: r.total ?? r.values.length };
    },
    [z, d]
  ), a = j({
    pageSize: F,
    isActive: h,
    search: f,
    loadPage: k
  }), S = (e) => {
    if (m) {
      i({ kind: "include", values: [e] });
      return;
    }
    const n = c;
    if (!n || n.kind === "all") {
      const r = n?.kind === "all" ? n.exclude : [], x = r.includes(e) ? r.filter((w) => w !== e) : [...r, e];
      x.length === 0 ? i(null) : i({ kind: "all", exclude: x, ...n?.kind === "all" && n.optionSearch ? { optionSearch: n.optionSearch } : {} });
      return;
    }
    const s = n.values.includes(e) ? n.values.filter((r) => r !== e) : [...n.values, e];
    i(s.length === 0 ? null : { kind: "include", values: s });
  };
  return /* @__PURE__ */ p(
    A,
    {
      open: h,
      onOpenChange: (e) => {
        P(e), e && (g(""), a.openPanelFetch());
      },
      children: [
        /* @__PURE__ */ t(I, { asChild: !0, children: /* @__PURE__ */ t(
          "button",
          {
            type: "button",
            "aria-label": o.t("pivot.filterLabel", { label: l }),
            onPointerDown: (e) => e.stopPropagation(),
            className: O(
              "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-transition-colors",
              v ? "zen-text-zen-primary hover:zen-bg-zen-muted" : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
              y
            ),
            children: N ?? /* @__PURE__ */ t(C, { name: "chevron-down", className: "zen-h-3.5 zen-w-3.5" })
          }
        ) }),
        /* @__PURE__ */ t(R, { className: "zen-w-72 zen-p-2", align: "start", children: /* @__PURE__ */ p("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          /* @__PURE__ */ t(
            M,
            {
              value: f,
              onChange: (e) => g(e.target.value),
              placeholder: o.t("pivot.searchLabel", { label: l }),
              "aria-label": o.t("pivot.searchValues", { label: l }),
              autoFocus: !0,
              className: "zen-h-8"
            }
          ),
          a.loading ? /* @__PURE__ */ t("div", { className: "zen-flex zen-items-center zen-justify-center zen-py-6", "aria-busy": !0, children: /* @__PURE__ */ t(W, { size: "sm", label: o.t("pivot.loadingValues") }) }) : a.loadError ? (
            // A failed fetch is NOT an empty result. Saying "No matching values"
            // here sends people looking for data that is not missing.
            /* @__PURE__ */ p("div", { className: "zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3", role: "alert", children: [
              /* @__PURE__ */ t("p", { className: "zen-m-0 zen-text-sm zen-text-zen-error", children: o.t("pivot.loadFailed") }),
              /* @__PURE__ */ t(
                "button",
                {
                  type: "button",
                  className: "zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline",
                  onClick: () => a.openPanelFetch(),
                  children: o.t("pivot.tryAgain")
                }
              )
            ] })
          ) : a.totalCount === 0 ? /* @__PURE__ */ t("p", { className: "zen-m-0 zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg", children: o.t("pivot.noMatchingValues") }) : /* @__PURE__ */ t(
            _,
            {
              label: l,
              totalCount: a.totalCount,
              optionsWindows: a.optionsWindows,
              isSelected: (e) => V(c, e),
              onToggle: S,
              onVisibleRange: a.handleVisibleRange,
              formatValue: b,
              singleSelect: m
            }
          ),
          v ? /* @__PURE__ */ t(
            "button",
            {
              type: "button",
              className: "zen-cursor-pointer zen-self-start zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline",
              onClick: () => i(null),
              children: o.t("pivot.clearFilter")
            }
          ) : null
        ] }) })
      ]
    }
  );
};
T.displayName = "PivotFilterMenu";
export {
  T as PivotFilterMenu
};
//# sourceMappingURL=index154.js.map
