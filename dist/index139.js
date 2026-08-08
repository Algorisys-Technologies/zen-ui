import { jsxs as s, jsx as n, Fragment as U } from "react/jsx-runtime";
import * as u from "react";
import { useSensors as X, useSensor as Y, DndContext as _, DragOverlay as $, pointerWithin as k, PointerSensor as K } from "./index177.js";
import { SortableContext as p, rectSortingStrategy as f, useSortable as ee } from "./index178.js";
import { CSS as ne } from "./index179.js";
import { createEmptyLayout as F, moveFieldToZone as te, describeMove as re, availableFields as ie, isLayoutRenderable as le, hasActiveFilters as oe, updateValueAggregation as ae, zoneOf as se, fieldLabel as ce } from "./index25.js";
import { Alert as E, AlertIcon as P, AlertContent as R, AlertTitle as V, AlertDescription as I } from "./index90.js";
import { Button as de } from "./index64.js";
import { Icon as L } from "./index56.js";
import { PivotDropZone as v } from "./index135.js";
import { PivotFieldChip as O } from "./index136.js";
import { cn as T } from "./index143.js";
const b = (t) => {
  const { attributes: l, listeners: o, setNodeRef: a, transform: c, isDragging: x } = ee({
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
      ref: a,
      ...l,
      ...o,
      "data-pivot-chip": ce(t.fields, t.fieldKey),
      style: { transform: ne.Translate.toString(c) },
      className: T(
        "zen-max-w-full zen-touch-none",
        t.zone === "rows" || t.zone === "values" ? "zen-flex zen-w-full" : "zen-inline-flex",
        x && "zen-relative zen-z-50 zen-opacity-50"
      ),
      children: /* @__PURE__ */ n(O, { ...t })
    }
  );
}, me = (t) => {
  const l = t.droppableContainers.filter(
    (c) => c.data.current?.sortable && c.id !== t.active.id
  ), o = k({ ...t, droppableContainers: l });
  if (o.length) return o;
  const a = t.droppableContainers.filter((c) => !c.data.current?.sortable);
  return k({ ...t, droppableContainers: a });
}, ue = ({
  fields: t,
  initialLayout: l,
  onLayoutApply: o,
  className: a,
  children: c,
  totalRows: x,
  totalCols: Z,
  onClearFilters: D,
  showBuilder: j = !0,
  loadMembers: M
}) => {
  const [r, z] = u.useState(l ?? F()), [g, W] = u.useState(l ?? F()), [q, N] = u.useState(""), [w, C] = u.useState(null), B = X(
    // A small distance, so a click on the ⋮ handle or the remove button is not
    // read as the start of a drag.
    Y(K, { activationConstraint: { distance: 5 } })
  ), S = u.useCallback(
    (e, d, i) => {
      z((m) => te(m, e, d, { index: i })), N(re(t, e, d, i));
    },
    [t]
  ), G = (e) => C(String(e.active.id)), H = (e) => {
    const { active: d, over: i } = e;
    if (C(null), !i) return;
    const m = String(d.id), A = i.data.current?.zone ?? i.id, Q = !!i.data.current?.sortable ? ze(r, String(i.id), A) : void 0;
    S(m, A, Q);
  }, y = ie(r, t), J = le(g), h = (e, d) => ({
    fieldKey: e,
    fields: t,
    zone: d,
    filters: r.filters,
    selection: r.filters[e],
    loadMembers: M,
    // Available is a preview of a field you have not placed yet, so its filter
    // picks ONE member — it answers "what is in here", not "which of these do I
    // want". A placed field filters for real and takes as many as you like.
    // The prop was implemented in the chip and the menu but never passed here,
    // so React's available fields multi-selected while Solid's did not. Mirrors
    // the Solid binding.
    singleSelect: d === "available",
    onSelectionChange: (i) => z((m) => ge(m, e, i)),
    onMoveToZone: (i) => S(e, i),
    onRemove: d === "available" ? void 0 : () => S(e, "available")
  });
  return /* @__PURE__ */ s(
    "div",
    {
      className: T(
        "zen-flex zen-h-full zen-w-full zen-min-w-0 zen-flex-col zen-overflow-hidden zen-rounded-zen-md zen-border zen-border-zen-border",
        a
      ),
      children: [
        /* @__PURE__ */ n("div", { "aria-live": "polite", "aria-atomic": "true", className: "zen-sr-only", children: q }),
        /* @__PURE__ */ s(
          _,
          {
            sensors: B,
            collisionDetection: me,
            onDragStart: G,
            onDragEnd: H,
            onDragCancel: () => {
              C(null), N("Move cancelled.");
            },
            children: [
              /* @__PURE__ */ n("div", { className: "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-bg-zen-background zen-p-2", children: j ? /* @__PURE__ */ s(U, { children: [
                /* @__PURE__ */ s("div", { className: "zen-flex zen-items-center zen-justify-between zen-gap-2", children: [
                  /* @__PURE__ */ s("span", { className: "zen-text-xs zen-text-zen-muted-fg", children: [
                    (x ?? 0).toLocaleString(),
                    " rows · ",
                    (Z ?? 0).toLocaleString(),
                    " cols"
                  ] }),
                  /* @__PURE__ */ s("div", { className: "zen-flex zen-items-center zen-gap-2", children: [
                    oe(r.filters) ? /* @__PURE__ */ n(
                      "button",
                      {
                        type: "button",
                        className: "-zen-m-1 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-1 zen-text-sm zen-text-zen-muted-fg hover:zen-text-zen-foreground",
                        onClick: () => {
                          D ? D() : z((e) => ({ ...e, filters: {} }));
                        },
                        children: "Clear filters"
                      }
                    ) : null,
                    /* @__PURE__ */ n(
                      de,
                      {
                        size: "sm",
                        onClick: () => {
                          W(r), o?.(r);
                        },
                        children: "View Data"
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ n(
                  v,
                  {
                    id: "available",
                    title: "Available Fields",
                    horizontal: !0,
                    isEmpty: y.length === 0,
                    children: /* @__PURE__ */ n(p, { items: y.map((e) => e.key), strategy: f, children: y.map((e) => /* @__PURE__ */ n(b, { ...h(e.key, "available") }, e.key)) })
                  }
                ),
                /* @__PURE__ */ s("div", { className: "zen-grid zen-grid-cols-1 zen-gap-2 sm:zen-grid-cols-3", children: [
                  /* @__PURE__ */ n(v, { id: "values", title: "Values", isEmpty: r.values.length === 0, children: /* @__PURE__ */ n(p, { items: r.values.map((e) => e.id), strategy: f, children: r.values.map((e) => /* @__PURE__ */ n(
                    b,
                    {
                      ...h(e.id, "values"),
                      aggregation: e.aggregation,
                      onAggregationChange: (d) => z((i) => ae(i, e.id, d))
                    },
                    e.id
                  )) }) }),
                  /* @__PURE__ */ n(v, { id: "rows", title: "Rows", isEmpty: r.rows.length === 0, children: /* @__PURE__ */ n(p, { items: r.rows, strategy: f, children: r.rows.map((e) => /* @__PURE__ */ n(b, { ...h(e, "rows") }, e)) }) }),
                  /* @__PURE__ */ n(v, { id: "columns", title: "Columns", isEmpty: r.columns.length === 0, children: /* @__PURE__ */ n(p, { items: r.columns, strategy: f, children: r.columns.map((e) => /* @__PURE__ */ n(b, { ...h(e, "columns") }, e)) }) })
                ] })
              ] }) : null }),
              /* @__PURE__ */ n($, { children: w ? /* @__PURE__ */ n("div", { "data-pivot-drag-overlay": !0, className: "zen-inline-flex zen-cursor-grabbing zen-opacity-90 zen-shadow-md", children: /* @__PURE__ */ n(O, { fieldKey: w, fields: t, zone: se(r, w) }) }) : null })
            ]
          }
        ),
        /* @__PURE__ */ n("div", { className: "zen-relative zen-min-h-0 zen-min-w-0 zen-flex-1 zen-bg-zen-background zen-p-2", children: J ? c : /* @__PURE__ */ s("div", { className: "zen-flex zen-flex-col zen-gap-2", children: [
          g.values.length === 0 ? /* @__PURE__ */ s(E, { color: "warning", children: [
            /* @__PURE__ */ n(P, { children: /* @__PURE__ */ n(L, { name: "info" }) }),
            /* @__PURE__ */ s(R, { children: [
              /* @__PURE__ */ n(V, { children: "Value field required" }),
              /* @__PURE__ */ n(I, { children: "Drop at least one field into Values to calculate data." })
            ] })
          ] }) : null,
          g.rows.length === 0 && g.columns.length === 0 ? /* @__PURE__ */ s(E, { color: "warning", children: [
            /* @__PURE__ */ n(P, { children: /* @__PURE__ */ n(L, { name: "info" }) }),
            /* @__PURE__ */ s(R, { children: [
              /* @__PURE__ */ n(V, { children: "Dimension required" }),
              /* @__PURE__ */ n(I, { children: "Drop at least one field into Rows or Columns." })
            ] })
          ] }) : null
        ] }) })
      ]
    }
  );
};
ue.displayName = "PivotWorkbench";
const ze = (t, l, o) => {
  const a = o === "rows" ? t.rows.indexOf(l) : o === "columns" ? t.columns.indexOf(l) : o === "values" ? t.values.findIndex((c) => c.id === l) : -1;
  return a === -1 ? void 0 : a;
}, ge = (t, l, o) => {
  const a = { ...t.filters };
  return o ? a[l] = o : delete a[l], { ...t, filters: a };
};
export {
  ue as PivotWorkbench
};
//# sourceMappingURL=index139.js.map
