import { jsxs as d, jsx as n, Fragment as _ } from "react/jsx-runtime";
import * as z from "react";
import { useSensors as $, useSensor as K, DndContext as ee, DragOverlay as ne, pointerWithin as R, PointerSensor as te } from "./index242.js";
import { SortableContext as b, rectSortingStrategy as x, useSortable as oe } from "./index243.js";
import { CSS as ie } from "./index244.js";
import { createEmptyLayout as Z, moveFieldToZone as re, fieldLabel as O, availableFields as le, isLayoutRenderable as ae, hasActiveFilters as se, updateValueAggregation as ce, zoneOf as de } from "./index29.js";
import { Alert as E, AlertIcon as L, AlertContent as P, AlertTitle as T, AlertDescription as q } from "./index102.js";
import { Button as me } from "./index71.js";
import { Icon as I } from "./index63.js";
import { PivotDropZone as w } from "./index189.js";
import { PivotFieldChip as j } from "./index190.js";
import { useLocale as ve } from "./index90.js";
import { cn as W } from "./index197.js";
const S = (t) => {
  const { attributes: l, listeners: a, setNodeRef: s, transform: m, isDragging: C } = oe({
    id: t.fieldKey,
    // `zone` is what the drop handler reads. It must never parse the zone out of
    // a droppable's id: once a zone holds a chip, the CHIP is the droppable that
    // wins, and its id is a field key. Reading an id as a zone is what deleted
    // fields.
    data: { zone: t.zone, sortable: !0 }
  });
  return /* @__PURE__ */ n(
    "div",
    {
      ref: s,
      ...l,
      ...a,
      "data-pivot-chip": O(t.fields, t.fieldKey),
      style: { transform: ie.Translate.toString(m) },
      className: W(
        "zen-max-w-full zen-touch-none",
        t.zone === "rows" || t.zone === "values" ? "zen-flex zen-w-full" : "zen-inline-flex",
        C && "zen-relative zen-z-50 zen-opacity-50"
      ),
      children: /* @__PURE__ */ n(j, { ...t })
    }
  );
}, ue = (t) => {
  const l = t.droppableContainers.filter(
    (m) => m.data.current?.sortable && m.id !== t.active.id
  ), a = R({ ...t, droppableContainers: l });
  if (a.length) return a;
  const s = t.droppableContainers.filter((m) => !m.data.current?.sortable);
  return R({ ...t, droppableContainers: s });
}, pe = ({
  fields: t,
  initialLayout: l,
  onLayoutApply: a,
  className: s,
  children: m,
  totalRows: C,
  totalCols: B,
  onClearFilters: k,
  showBuilder: H = !0,
  loadMembers: V
}) => {
  const i = ve(), [o, g] = z.useState(l ?? Z()), [h, M] = z.useState(l ?? Z()), [G, F] = z.useState(""), [y, N] = z.useState(null), J = $(
    // A small distance, so a click on the ⋮ handle or the remove button is not
    // read as the start of a drag.
    K(te, { activationConstraint: { distance: 5 } })
  ), D = z.useCallback(
    (e, c, r) => {
      g((u) => re(u, e, c, { index: r }));
      const v = O(t, e), p = (u) => i.t(u === "available" ? "pivot.zoneAvailable" : u === "rows" ? "pivot.zoneRows" : u === "columns" ? "pivot.zoneColumns" : "pivot.zoneValues");
      F(
        c === "available" ? i.t("pivot.removedFromLayout", { field: v }) : r === void 0 ? i.t("pivot.movedTo", { field: v, zone: p(c) }) : i.t("pivot.movedToAt", { field: v, zone: p(c), position: r + 1 })
      );
    },
    [t, i]
  ), Q = (e) => N(String(e.active.id)), U = (e) => {
    const { active: c, over: r } = e;
    if (N(null), !r) return;
    const v = String(c.id), p = r.data.current?.zone ?? r.id, Y = !!r.data.current?.sortable ? ze(o, String(r.id), p) : void 0;
    D(v, p, Y);
  }, A = le(o, t), X = ae(h), f = (e, c) => ({
    fieldKey: e,
    fields: t,
    zone: c,
    filters: o.filters,
    selection: o.filters[e],
    loadMembers: V,
    // Available is a preview of a field you have not placed yet, so its filter
    // picks ONE member — it answers "what is in here", not "which of these do I
    // want". A placed field filters for real and takes as many as you like.
    // The prop was implemented in the chip and the menu but never passed here,
    // so React's available fields multi-selected while Solid's did not. Mirrors
    // the Solid binding.
    singleSelect: c === "available",
    onSelectionChange: (r) => g((v) => ge(v, e, r)),
    onMoveToZone: (r) => D(e, r),
    onRemove: c === "available" ? void 0 : () => D(e, "available")
  });
  return /* @__PURE__ */ d(
    "div",
    {
      className: W(
        "zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        s
      ),
      children: [
        /* @__PURE__ */ n("div", { "aria-live": "polite", "aria-atomic": "true", className: "zen-sr-only", children: G }),
        /* @__PURE__ */ d(
          ee,
          {
            sensors: J,
            collisionDetection: ue,
            onDragStart: Q,
            onDragEnd: U,
            onDragCancel: () => {
              N(null), F(i.t("pivot.moveCancelled"));
            },
            children: [
              /* @__PURE__ */ n("div", { className: "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-bg-zen-background zen-p-2", children: H ? /* @__PURE__ */ d(_, { children: [
                /* @__PURE__ */ d("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-2", children: [
                  /* @__PURE__ */ d("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
                    (C ?? 0).toLocaleString(),
                    " rows · ",
                    (B ?? 0).toLocaleString(),
                    " cols"
                  ] }),
                  /* @__PURE__ */ d("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
                    se(o.filters) ? /* @__PURE__ */ n(
                      "button",
                      {
                        type: "button",
                        className: "-zen-m-1 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-1 zen-text-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground",
                        onClick: () => {
                          k ? k() : g((e) => ({ ...e, filters: {} }));
                        },
                        children: i.t("pivot.clearFilters")
                      }
                    ) : null,
                    /* @__PURE__ */ n(
                      me,
                      {
                        size: "sm",
                        onClick: () => {
                          M(o), a?.(o);
                        },
                        children: i.t("pivot.viewData")
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ n(
                  w,
                  {
                    id: "available",
                    title: i.t("pivot.availableFields"),
                    horizontal: !0,
                    isEmpty: A.length === 0,
                    children: /* @__PURE__ */ n(b, { items: A.map((e) => e.key), strategy: x, children: A.map((e) => /* @__PURE__ */ n(S, { ...f(e.key, "available") }, e.key)) })
                  }
                ),
                /* @__PURE__ */ d("div", { className: "zen-grid zen-grid-cols-1 zen-gap-2 sm:zen-grid-cols-3", children: [
                  /* @__PURE__ */ n(w, { id: "values", title: i.t("pivot.valuesZone"), isEmpty: o.values.length === 0, children: /* @__PURE__ */ n(b, { items: o.values.map((e) => e.id), strategy: x, children: o.values.map((e) => /* @__PURE__ */ n(
                    S,
                    {
                      ...f(e.id, "values"),
                      aggregation: e.aggregation,
                      onAggregationChange: (c) => g((r) => ce(r, e.id, c))
                    },
                    e.id
                  )) }) }),
                  /* @__PURE__ */ n(w, { id: "rows", title: i.t("pivot.rowsZone"), isEmpty: o.rows.length === 0, children: /* @__PURE__ */ n(b, { items: o.rows, strategy: x, children: o.rows.map((e) => /* @__PURE__ */ n(S, { ...f(e, "rows") }, e)) }) }),
                  /* @__PURE__ */ n(w, { id: "columns", title: i.t("pivot.columnsZone"), isEmpty: o.columns.length === 0, children: /* @__PURE__ */ n(b, { items: o.columns, strategy: x, children: o.columns.map((e) => /* @__PURE__ */ n(S, { ...f(e, "columns") }, e)) }) })
                ] })
              ] }) : null }),
              /* @__PURE__ */ n(ne, { children: y ? /* @__PURE__ */ n("div", { "data-pivot-drag-overlay": !0, className: "zen-inline-flex zen-cursor-grabbing zen-opacity-90 zen-shadow-md", children: /* @__PURE__ */ n(j, { fieldKey: y, fields: t, zone: de(o, y) }) }) : null })
            ]
          }
        ),
        /* @__PURE__ */ n("div", { className: "zen-relative zen-min-h-0 zen-min-w-0 zen-flex-1 zen-bg-zen-background zen-p-2", children: X ? m : /* @__PURE__ */ d("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          h.values.length === 0 ? /* @__PURE__ */ d(E, { color: "warning", children: [
            /* @__PURE__ */ n(L, { children: /* @__PURE__ */ n(I, { name: "info" }) }),
            /* @__PURE__ */ d(P, { children: [
              /* @__PURE__ */ n(T, { children: i.t("pivot.valueRequired") }),
              /* @__PURE__ */ n(q, { children: i.t("pivot.valueRequiredHelp") })
            ] })
          ] }) : null,
          h.rows.length === 0 && h.columns.length === 0 ? /* @__PURE__ */ d(E, { color: "warning", children: [
            /* @__PURE__ */ n(L, { children: /* @__PURE__ */ n(I, { name: "info" }) }),
            /* @__PURE__ */ d(P, { children: [
              /* @__PURE__ */ n(T, { children: i.t("pivot.dimensionRequired") }),
              /* @__PURE__ */ n(q, { children: i.t("pivot.dimensionRequiredHelp") })
            ] })
          ] }) : null
        ] }) })
      ]
    }
  );
};
pe.displayName = "PivotWorkbench";
const ze = (t, l, a) => {
  const s = a === "rows" ? t.rows.indexOf(l) : a === "columns" ? t.columns.indexOf(l) : a === "values" ? t.values.findIndex((m) => m.id === l) : -1;
  return s === -1 ? void 0 : s;
}, ge = (t, l, a) => {
  const s = { ...t.filters };
  return a ? s[l] = a : delete s[l], { ...t, filters: s };
};
export {
  pe as PivotWorkbench
};
//# sourceMappingURL=index193.js.map
