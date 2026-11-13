import { jsx as n, jsxs as r, Fragment as T } from "react/jsx-runtime";
import "react";
import { fieldLabel as j, isFilterActive as I, describeFilterSelection as K, PIVOT_ZONES as V, defaultAggregationForField as R } from "./index29.js";
import { Badge as Z } from "./index64.js";
import { Icon as s } from "./index63.js";
import { DropdownMenu as $, DropdownMenuTrigger as B, DropdownMenuContent as E, DropdownMenuLabel as U, DropdownMenuItem as k, DropdownMenuSeparator as _ } from "./index73.js";
import { PivotFilterMenu as q } from "./index191.js";
import { useLocale as G } from "./index90.js";
import { cn as P } from "./index197.js";
const H = (C) => {
  const t = G(), u = (e) => t.t(e === "available" ? "pivot.zoneAvailable" : e === "rows" ? "pivot.zoneRows" : e === "columns" ? "pivot.zoneColumns" : "pivot.zoneValues"), {
    fieldKey: i,
    fields: d,
    hasActiveFilter: D,
    selection: z,
    filters: S,
    loadMembers: p,
    onSelectionChange: g,
    onRemove: v,
    zone: o,
    aggregation: A,
    onAggregationChange: f,
    onMoveToZone: c,
    singleSelect: L,
    disabled: h
  } = C, l = j(d, i), m = d.find((e) => e.key === i), b = m?.type === "measure", x = D ?? I(z), w = K(z);
  return /* @__PURE__ */ n("div", { className: "zen-group zen-relative zen-flex zen-max-w-full zen-items-center zen-gap-1", children: /* @__PURE__ */ r(
    Z,
    {
      variant: "outline",
      className: P(
        "zen-h-7 zen-max-w-full zen-cursor-grab zen-select-none zen-bg-zen-background zen-shadow-sm active:zen-cursor-grabbing",
        (o === "rows" || o === "values") && "zen-w-full",
        x ? "zen-border-zen-primary/30 zen-text-zen-primary" : "zen-text-zen-foreground",
        h && "zen-cursor-not-allowed zen-opacity-50"
      ),
      children: [
        c ? (
          // The pointer guard is on this wrapper, never on the trigger: passing
          // onPointerDown to the trigger would replace its own handler and the
          // menu would never open.
          /* @__PURE__ */ n("span", { className: "zen-flex zen-shrink-0", onPointerDown: (e) => e.stopPropagation(), children: /* @__PURE__ */ r($, { children: [
            /* @__PURE__ */ n(B, { asChild: !0, children: /* @__PURE__ */ n(
              "button",
              {
                type: "button",
                "aria-label": t.t("pivot.move", { label: l }),
                disabled: h,
                className: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                children: /* @__PURE__ */ n(s, { name: "more-vertical", className: "zen-h-3 zen-w-3" })
              }
            ) }),
            /* @__PURE__ */ r(E, { align: "start", children: [
              /* @__PURE__ */ n(U, { children: t.t("pivot.moveTo", { label: l }) }),
              V.filter((e) => e !== "available" && e !== o).map((e) => /* @__PURE__ */ n(k, { onSelect: () => c(e), children: u(e) }, e)),
              o !== "available" ? /* @__PURE__ */ r(T, { children: [
                /* @__PURE__ */ n(_, {}),
                /* @__PURE__ */ n(k, { onSelect: () => c("available"), children: t.t("pivot.removeFromLayout") })
              ] }) : null
            ] })
          ] }) })
        ) : /* @__PURE__ */ n(s, { name: "more-vertical", className: "zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg/50" }),
        /* @__PURE__ */ n(
          s,
          {
            name: o === "values" ? "plus" : "file",
            className: "zen-h-3 zen-w-3 zen-shrink-0 zen-text-zen-muted-fg"
          }
        ),
        /* @__PURE__ */ r("span", { className: P("zen-min-w-0 zen-flex-1 zen-truncate", x && "zen-italic"), children: [
          /* @__PURE__ */ n("span", { className: "zen-font-medium", children: l }),
          w ? /* @__PURE__ */ r("span", { className: "zen-font-normal", children: [
            ": ",
            w
          ] }) : null
        ] }),
        o === "values" && b && f && m ? /* @__PURE__ */ r("span", { className: "zen-inline-block zen-shrink-0 zen-text-xs", onPointerDown: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ n("label", { className: "zen-sr-only", htmlFor: `agg-${i}`, children: t.t("pivot.aggregationFor", { label: l }) }),
          /* @__PURE__ */ n(
            "select",
            {
              id: `agg-${i}`,
              value: A ?? R(m),
              onChange: (e) => f(e.target.value),
              className: "zen-h-6 zen-min-w-14 zen-cursor-pointer zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background zen-px-1.5 zen-text-xs zen-text-zen-foreground",
              children: ["sum", "count", "avg", "min", "max"].map((e) => /* @__PURE__ */ n("option", { value: e, children: e }, e))
            }
          )
        ] }) : null,
        o !== "values" && p && g ? /* @__PURE__ */ n(
          q,
          {
            columnKey: i,
            label: l,
            selection: z,
            onChange: g,
            loadOptions: async (e, N, y) => {
              const F = {};
              for (const [M, O] of Object.entries(S ?? {}))
                M !== i && (F[M] = O);
              const a = await p({
                fieldKey: e,
                search: N.trim() ? N.trim() : void 0,
                offset: y?.offset,
                limit: y?.limit,
                filters: F
              });
              return { values: a.values, hasMore: a.hasMore, total: a.total ?? a.values.length };
            },
            formatValue: (e) => b ? Number(e).toLocaleString("en-US", { maximumFractionDigits: 2 }) : e,
            singleSelect: L
          }
        ) : null,
        o !== "available" && v ? /* @__PURE__ */ n(
          "button",
          {
            type: "button",
            className: "zen-ml-1 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 zen-bg-transparent zen-p-1 zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            "aria-label": t.t("pivot.removeFrom", { label: l, zone: u(o ?? "available") }),
            onPointerDown: (e) => e.stopPropagation(),
            onClick: (e) => {
              e.stopPropagation(), v();
            },
            children: /* @__PURE__ */ n(s, { name: "x", className: "zen-h-3.5 zen-w-3.5" })
          }
        ) : null
      ]
    }
  ) });
};
H.displayName = "PivotFieldChip";
export {
  H as PivotFieldChip
};
//# sourceMappingURL=index190.js.map
