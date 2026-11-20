import { jsxs as i, jsx as n, Fragment as M } from "react/jsx-runtime";
import * as h from "react";
import { VIRTUAL_SCROLL_WINDOW_PAGE_SIZE as W } from "./index282.js";
import { isFilterActive as R, isValueSelected as j } from "./index29.js";
import { Icon as z } from "./index63.js";
import { Input as O } from "./index4.js";
import { Loading as _ } from "./index67.js";
import { Popover as E, PopoverTrigger as T, PopoverContent as G } from "./index35.js";
import { useWindowedOptionPages as U } from "./index283.js";
import { WindowedVirtualList as Z } from "./index284.js";
import { useLocale as q } from "./index90.js";
import { cn as k } from "./index199.js";
const B = ({
  columnKey: f,
  label: c,
  selection: u,
  sortDirection: s,
  formatValue: P,
  onChange: l,
  onSort: m,
  loadOptions: d,
  triggerClassName: F,
  triggerChildren: C,
  singleSelect: g
}) => {
  const o = q(), [v, x] = h.useState(!1), [b, w] = h.useState(""), y = R(u), S = h.useCallback(
    async (e, t, p) => {
      if (!d) return { values: [], hasMore: !1, total: 0 };
      const r = await d(f, p, { offset: e, limit: t });
      return { values: r.values, hasMore: r.hasMore, total: r.total ?? r.values.length };
    },
    [d, f]
  ), a = U({
    pageSize: W,
    isActive: v,
    search: b,
    loadPage: S
  }), L = (e) => {
    m?.(s === e ? null : e), x(!1);
  }, V = (e) => k(
    "zen-flex zen-w-full zen-cursor-pointer zen-items-center zen-gap-2 zen-rounded-md zen-border-0 zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-start zen-text-sm zen-text-zen-foreground zen-transition-colors hover:zen-bg-zen-muted hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-primary",
    s === e && "zen-font-medium zen-text-zen-primary"
  ), A = (e) => {
    if (g) {
      l({ kind: "include", values: [e] });
      return;
    }
    const t = u;
    if (!t || t.kind === "all") {
      const r = t?.kind === "all" ? t.exclude : [], N = r.includes(e) ? r.filter((I) => I !== e) : [...r, e];
      N.length === 0 ? l(null) : l({ kind: "all", exclude: N, ...t?.kind === "all" && t.optionSearch ? { optionSearch: t.optionSearch } : {} });
      return;
    }
    const p = t.values.includes(e) ? t.values.filter((r) => r !== e) : [...t.values, e];
    l(p.length === 0 ? null : { kind: "include", values: p });
  };
  return /* @__PURE__ */ i(
    E,
    {
      open: v,
      onOpenChange: (e) => {
        x(e), e && (w(""), a.openPanelFetch());
      },
      children: [
        /* @__PURE__ */ n(T, { asChild: !0, children: /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            "aria-label": o.t(m ? "pivot.sortOrFilter" : "pivot.filterLabel", { label: c }),
            onPointerDown: (e) => e.stopPropagation(),
            className: k(
              "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-transition-colors",
              y || s ? "zen-text-zen-primary hover:zen-bg-zen-muted" : "zen-text-zen-muted-fg hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
              F
            ),
            children: C ?? /* @__PURE__ */ i(M, { children: [
              /* @__PURE__ */ n(z, { name: "chevron-down", className: "zen-h-3.5 zen-w-3.5" }),
              s === "asc" ? /* @__PURE__ */ n(z, { name: "arrow-up", className: "zen-h-3 zen-w-3" }) : null,
              s === "desc" ? /* @__PURE__ */ n(z, { name: "arrow-down", className: "zen-h-3 zen-w-3" }) : null
            ] })
          }
        ) }),
        /* @__PURE__ */ n(G, { className: "zen-w-72 zen-p-2", align: "start", children: /* @__PURE__ */ i("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          m ? /* @__PURE__ */ n("div", { className: "zen-flex zen-flex-col zen-border-b zen-border-zen-border zen-pb-1", children: ["asc", "desc"].map((e) => /* @__PURE__ */ i(
            "button",
            {
              type: "button",
              className: V(e),
              onClick: () => L(e),
              children: [
                /* @__PURE__ */ n(z, { name: e === "asc" ? "arrow-up" : "arrow-down", className: "zen-h-3.5 zen-w-3.5" }),
                /* @__PURE__ */ n("span", { children: o.t(e === "asc" ? "pivot.sortAscending" : "pivot.sortDescending") }),
                s === e ? /* @__PURE__ */ n(z, { name: "check", className: "zen-ms-auto zen-h-3.5 zen-w-3.5" }) : null
              ]
            },
            e
          )) }) : null,
          /* @__PURE__ */ n(
            O,
            {
              value: b,
              onChange: (e) => w(e.target.value),
              placeholder: o.t("pivot.searchLabel", { label: c }),
              "aria-label": o.t("pivot.searchValues", { label: c }),
              autoFocus: !0,
              className: "zen-h-8"
            }
          ),
          a.loading ? /* @__PURE__ */ n("div", { className: "zen-flex zen-items-center zen-justify-center zen-py-6", "aria-busy": !0, children: /* @__PURE__ */ n(_, { size: "sm", label: o.t("pivot.loadingValues") }) }) : a.loadError ? (
            // A failed fetch is NOT an empty result. Saying "No matching values"
            // here sends people looking for data that is not missing.
            /* @__PURE__ */ i("div", { className: "zen-flex zen-flex-col zen-items-start zen-gap-1 zen-px-2 zen-py-3", role: "alert", children: [
              /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-sm zen-text-zen-error", children: o.t("pivot.loadFailed") }),
              /* @__PURE__ */ n(
                "button",
                {
                  type: "button",
                  className: "zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline",
                  onClick: () => a.openPanelFetch(),
                  children: o.t("pivot.tryAgain")
                }
              )
            ] })
          ) : a.totalCount === 0 ? /* @__PURE__ */ n("p", { className: "zen-m-0 zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg", children: o.t("pivot.noMatchingValues") }) : /* @__PURE__ */ n(
            Z,
            {
              label: c,
              totalCount: a.totalCount,
              optionsWindows: a.optionsWindows,
              isSelected: (e) => j(u, e),
              onToggle: A,
              onVisibleRange: a.handleVisibleRange,
              formatValue: P,
              singleSelect: g
            }
          ),
          y ? /* @__PURE__ */ n(
            "button",
            {
              type: "button",
              className: "zen-cursor-pointer zen-self-start zen-border-0 zen-bg-transparent zen-p-0 zen-text-xs zen-text-zen-primary hover:zen-underline",
              onClick: () => l(null),
              children: o.t("pivot.clearFilter")
            }
          ) : null
        ] }) })
      ]
    }
  );
};
B.displayName = "PivotFilterMenu";
export {
  B as PivotFilterMenu
};
//# sourceMappingURL=index193.js.map
