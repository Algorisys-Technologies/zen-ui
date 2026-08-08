import { jsx as n, jsxs as r, Fragment as L } from "react/jsx-runtime";
import "react";
import { fieldLabel as O, isFilterActive as j, describeFilterSelection as I, PIVOT_ZONES as K, zoneLabel as M, defaultAggregationForField as R } from "./index25.js";
import { Badge as T } from "./index57.js";
import { Icon as i } from "./index56.js";
import { DropdownMenu as V, DropdownMenuTrigger as Z, DropdownMenuContent as B, DropdownMenuLabel as E, DropdownMenuItem as F, DropdownMenuSeparator as U } from "./index66.js";
import { PivotFilterMenu as _ } from "./index137.js";
import { cn as k } from "./index143.js";
const q = (P) => {
  const {
    fieldKey: t,
    fields: m,
    hasActiveFilter: D,
    selection: s,
    filters: C,
    loadMembers: u,
    onSelectionChange: d,
    onRemove: g,
    zone: o,
    aggregation: S,
    onAggregationChange: f,
    onMoveToZone: z,
    singleSelect: A,
    disabled: p
  } = P, l = O(m, t), c = m.find((e) => e.key === t), h = c?.type === "measure", b = D ?? j(s), v = I(s);
  return /* @__PURE__ */ n("div", { className: "zen-group zen-relative zen-flex zen-max-w-full zen-items-center zen-gap-1", children: /* @__PURE__ */ r(
    T,
    {
      variant: "outline",
      className: k(
        "zen-h-7 zen-max-w-full zen-cursor-grab zen-select-none zen-bg-zen-background zen-shadow-sm active:zen-cursor-grabbing",
        (o === "rows" || o === "values") && "zen-w-full",
        b ? "zen-border-zen-primary/30 zen-text-zen-primary" : "zen-text-zen-foreground",
        p && "zen-cursor-not-allowed zen-opacity-50"
      ),
      children: [
        z ? (
          // The pointer guard is on this wrapper, never on the trigger: passing
          // onPointerDown to the trigger would replace its own handler and the
          // menu would never open.
          /* @__PURE__ */ n("span", { className: "zen-flex zen-shrink-0", onPointerDown: (e) => e.stopPropagation(), children: /* @__PURE__ */ r(V, { children: [
            /* @__PURE__ */ n(Z, { asChild: !0, children: /* @__PURE__ */ n(
              "button",
              {
                type: "button",
                "aria-label": `Move ${l}`,
                disabled: p,
                className: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                children: /* @__PURE__ */ n(i, { name: "more-vertical", className: "zen-h-3 zen-w-3" })
              }
            ) }),
            /* @__PURE__ */ r(B, { align: "start", children: [
              /* @__PURE__ */ r(E, { children: [
                "Move ",
                l,
                " to"
              ] }),
              K.filter((e) => e !== "available" && e !== o).map((e) => /* @__PURE__ */ n(F, { onSelect: () => z(e), children: M(e) }, e)),
              o !== "available" ? /* @__PURE__ */ r(L, { children: [
                /* @__PURE__ */ n(U, {}),
                /* @__PURE__ */ n(F, { onSelect: () => z("available"), children: "Remove from layout" })
              ] }) : null
            ] })
          ] }) })
        ) : /* @__PURE__ */ n(i, { name: "more-vertical", className: "zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg/50" }),
        /* @__PURE__ */ n(
          i,
          {
            name: o === "values" ? "plus" : "file",
            className: "zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg"
          }
        ),
        /* @__PURE__ */ r("span", { className: k("zen-min-w-0 zen-flex-1 zen-truncate", b && "zen-italic"), children: [
          /* @__PURE__ */ n("span", { className: "zen-font-medium", children: l }),
          v ? /* @__PURE__ */ r("span", { className: "zen-font-normal", children: [
            ": ",
            v
          ] }) : null
        ] }),
        o === "values" && h && f && c ? /* @__PURE__ */ r("span", { className: "zen-inline-block zen-shrink-0 zen-text-xs", onPointerDown: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ r("label", { className: "zen-sr-only", htmlFor: `agg-${t}`, children: [
            "Aggregation for ",
            l
          ] }),
          /* @__PURE__ */ n(
            "select",
            {
              id: `agg-${t}`,
              value: S ?? R(c),
              onChange: (e) => f(e.target.value),
              className: "zen-h-6 zen-min-w-14 zen-cursor-pointer zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-1.5 zen-text-xs zen-text-zen-foreground",
              children: ["sum", "count", "avg", "min", "max"].map((e) => /* @__PURE__ */ n("option", { value: e, children: e }, e))
            }
          )
        ] }) : null,
        o !== "values" && u && d ? /* @__PURE__ */ n(
          _,
          {
            columnKey: t,
            label: l,
            selection: s,
            onChange: d,
            loadOptions: async (e, x, w) => {
              const N = {};
              for (const [y, $] of Object.entries(C ?? {}))
                y !== t && (N[y] = $);
              const a = await u({
                fieldKey: e,
                search: x.trim() ? x.trim() : void 0,
                offset: w?.offset,
                limit: w?.limit,
                filters: N
              });
              return { values: a.values, hasMore: a.hasMore, total: a.total ?? a.values.length };
            },
            formatValue: (e) => h ? Number(e).toLocaleString("en-US", { maximumFractionDigits: 2 }) : e,
            singleSelect: A
          }
        ) : null,
        o !== "available" && g ? /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            className: "zen-ml-1 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "aria-label": `Remove ${l} from ${M(o ?? "available")}`,
            onPointerDown: (e) => e.stopPropagation(),
            onClick: (e) => {
              e.stopPropagation(), g();
            },
            children: /* @__PURE__ */ n(i, { name: "x", className: "zen-h-3.5 zen-w-3.5" })
          }
        ) : null
      ]
    }
  ) });
};
q.displayName = "PivotFieldChip";
export {
  q as PivotFieldChip
};
//# sourceMappingURL=index136.js.map
