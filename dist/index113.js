import { jsxs as v, jsx as t } from "react/jsx-runtime";
import * as u from "react";
import { useSensors as K, useSensor as O, DndContext as A, closestCenter as H, PointerSensor as M } from "./index179.js";
import { SortableContext as T, verticalListSortingStrategy as U, horizontalListSortingStrategy as j, useSortable as h } from "./index180.js";
import { CSS as _ } from "./index181.js";
import { cn as y } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { DEFAULT_REORDER_ANNOUNCEMENTS as B, keyToReorderAction as F, reduceReorder as G, moveItem as S } from "./index114.js";
const k = u.createContext(null), D = u.createContext(""), C = () => {
  const e = u.useContext(k);
  if (!e) throw new Error("SortableListItem and SortableListHandle must be inside a SortableList.");
  return e;
}, ee = ({
  items: e,
  onReorder: p,
  orientation: c = "vertical",
  disabled: a = !1,
  handle: r = !0,
  onDragStart: n,
  onDragEnd: z,
  announcements: f,
  className: b,
  children: w
}) => {
  const [m, L] = u.useState(null), [N, g] = u.useState(""), x = u.useMemo(
    () => ({ ...B, ...f }),
    [f]
  ), E = K(O(M, { activationConstraint: { distance: 4 } })), R = (l, i) => {
    if (a) return;
    const o = F(l.key, c, m !== null, e.length);
    if (!o) return;
    l.preventDefault();
    const d = e.indexOf(i);
    if (d < 0) return;
    const P = o.type === "pickup" ? { type: "pickup", id: i, index: d } : o, s = G(m, P, e.length);
    s.commit && p(S(e, s.commit.from, s.commit.to)), o.type === "cancel" ? g(x.onCancel()) : o.type === "pickup" && s.picked ? g(x.onPickUp(i, s.picked.index, e.length)) : o.type === "drop" && m ? g(x.onDrop(i, m.index)) : s.commit && g(x.onMove(i, s.commit.from, s.commit.to)), L(s.picked);
  }, I = (l) => {
    const i = String(l.active.id);
    if (z?.(i), !l.over) return;
    const o = e.indexOf(i), d = e.indexOf(String(l.over.id));
    o < 0 || d < 0 || o === d || (p(S(e, o, d)), g(x.onDrop(i, d)));
  };
  return /* @__PURE__ */ v(
    k.Provider,
    {
      value: { items: e, orientation: c, disabled: a, usesHandle: r, picked: m, onKeyDown: R },
      children: [
        /* @__PURE__ */ t("div", { "aria-live": "polite", "aria-atomic": !0, className: "zen-sr-only", children: N }),
        /* @__PURE__ */ t(
          A,
          {
            sensors: E,
            collisionDetection: H,
            onDragStart: (l) => n?.(String(l.active.id)),
            onDragEnd: I,
            children: /* @__PURE__ */ t(
              T,
              {
                items: e,
                strategy: c === "vertical" ? U : j,
                children: /* @__PURE__ */ t(
                  "ul",
                  {
                    className: y(
                      "zen-m-0 zen-flex zen-list-none zen-p-0",
                      c === "vertical" ? "zen-flex-col zen-gap-1" : "zen-flex-row zen-gap-1",
                      b
                    ),
                    children: w
                  }
                )
              }
            )
          }
        )
      ]
    }
  );
}, te = ({ id: e, disabled: p, className: c, children: a }) => {
  const r = C(), n = h({ id: e }), z = r.disabled || (p ?? !1), f = r.picked?.id === e;
  return /* @__PURE__ */ t(
    "li",
    {
      ref: n.setNodeRef,
      style: { transform: _.Transform.toString(n.transform), transition: n.transition },
      "data-dragging": n.isDragging ? "" : void 0,
      "data-picked": f ? "" : void 0,
      "aria-roledescription": "sortable item",
      className: y(
        "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1.5",
        "zen-transition-shadow",
        n.isDragging && "zen-opacity-60",
        f && "zen-ring-2 zen-ring-zen-ring",
        z && "zen-opacity-60",
        c
      ),
      ...r.usesHandle || z ? {} : {
        ...n.attributes,
        ...n.listeners,
        tabIndex: 0,
        onKeyDown: (b) => r.onKeyDown(b, e)
      },
      children: /* @__PURE__ */ t(D.Provider, { value: e, children: a })
    }
  );
}, q = () => /* @__PURE__ */ v("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": !0, className: "zen-shrink-0", children: [
  /* @__PURE__ */ t("circle", { cx: "9", cy: "6", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "15", cy: "6", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "9", cy: "12", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "15", cy: "12", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "9", cy: "18", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "15", cy: "18", r: "1.6" })
] }), ne = ({ label: e, className: p, children: c }) => {
  const a = C(), r = u.useContext(D), n = h({ id: r });
  return /* @__PURE__ */ t(
    "button",
    {
      type: "button",
      ref: n.setActivatorNodeRef,
      "aria-label": e ?? "Reorder",
      disabled: a.disabled,
      ...n.attributes,
      ...n.listeners,
      "aria-pressed": a.picked?.id === r,
      onKeyDown: (z) => a.onKeyDown(z, r),
      className: y(
        "zen-inline-flex zen-cursor-grab zen-items-center zen-rounded-zen-sm zen-p-1 zen-text-zen-muted-fg",
        "hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        /* Or the page scrolls instead of the item moving. */
        "zen-touch-none",
        p
      ),
      children: c ?? /* @__PURE__ */ t(q, {})
    }
  );
};
export {
  ee as SortableList,
  ne as SortableListHandle,
  te as SortableListItem
};
//# sourceMappingURL=index113.js.map
