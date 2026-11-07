import { jsxs as h, jsx as t } from "react/jsx-runtime";
import * as p from "react";
import { useSensors as O, useSensor as A, DndContext as H, closestCenter as M, PointerSensor as T } from "./index205.js";
import { SortableContext as U, verticalListSortingStrategy as j, horizontalListSortingStrategy as _, useSortable as D } from "./index206.js";
import { CSS as B } from "./index207.js";
import { cn as S } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { DEFAULT_REORDER_ANNOUNCEMENTS as F, keyToReorderAction as G, reduceReorder as q, moveItem as v } from "./index124.js";
import { useLocale as k } from "./index90.js";
const C = p.createContext(null), L = p.createContext(""), w = () => {
  const e = p.useContext(C);
  if (!e) throw new Error("SortableListItem and SortableListHandle must be inside a SortableList.");
  return e;
}, ne = ({
  items: e,
  onReorder: m,
  orientation: c = "vertical",
  disabled: f = !1,
  handle: l = !0,
  onDragStart: r,
  onDragEnd: n,
  announcements: d,
  className: b,
  children: y
}) => {
  const [z, N] = p.useState(null), [E, g] = p.useState(""), x = p.useMemo(
    () => ({ ...F, ...d }),
    [d]
  ), R = O(A(T, { activationConstraint: { distance: 4 } })), I = (a, i) => {
    if (f) return;
    const o = G(a.key, c, z !== null, e.length);
    if (!o) return;
    a.preventDefault();
    const u = e.indexOf(i);
    if (u < 0) return;
    const K = o.type === "pickup" ? { type: "pickup", id: i, index: u } : o, s = q(z, K, e.length);
    s.commit && m(v(e, s.commit.from, s.commit.to)), o.type === "cancel" ? g(x.onCancel()) : o.type === "pickup" && s.picked ? g(x.onPickUp(i, s.picked.index, e.length)) : o.type === "drop" && z ? g(x.onDrop(i, z.index)) : s.commit && g(x.onMove(i, s.commit.from, s.commit.to)), N(s.picked);
  }, P = (a) => {
    const i = String(a.active.id);
    if (n?.(i), !a.over) return;
    const o = e.indexOf(i), u = e.indexOf(String(a.over.id));
    o < 0 || u < 0 || o === u || (m(v(e, o, u)), g(x.onDrop(i, u)));
  };
  return /* @__PURE__ */ h(
    C.Provider,
    {
      value: { items: e, orientation: c, disabled: f, usesHandle: l, picked: z, onKeyDown: I },
      children: [
        /* @__PURE__ */ t("div", { "aria-live": "polite", "aria-atomic": !0, className: "zen-sr-only", children: E }),
        /* @__PURE__ */ t(
          H,
          {
            sensors: R,
            collisionDetection: M,
            onDragStart: (a) => r?.(String(a.active.id)),
            onDragEnd: P,
            children: /* @__PURE__ */ t(
              U,
              {
                items: e,
                strategy: c === "vertical" ? j : _,
                children: /* @__PURE__ */ t(
                  "ul",
                  {
                    className: S(
                      "zen-m-0 zen-flex zen-list-none zen-p-0",
                      c === "vertical" ? "zen-flex-col zen-gap-1" : "zen-flex-row zen-gap-1",
                      b
                    ),
                    children: y
                  }
                )
              }
            )
          }
        )
      ]
    }
  );
}, re = ({ id: e, disabled: m, className: c, children: f }) => {
  const l = k(), r = w(), n = D({ id: e }), d = r.disabled || (m ?? !1), b = r.picked?.id === e;
  return /* @__PURE__ */ t(
    "li",
    {
      ref: n.setNodeRef,
      style: { transform: B.Transform.toString(n.transform), transition: n.transition },
      "data-dragging": n.isDragging ? "" : void 0,
      "data-picked": b ? "" : void 0,
      "aria-roledescription": l.t("sortableList.itemRoleDescription"),
      className: S(
        "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1.5",
        "zen-transition-shadow",
        n.isDragging && "zen-opacity-60",
        b && "zen-ring-2 zen-ring-zen-ring",
        d && "zen-opacity-60",
        c
      ),
      ...r.usesHandle || d ? {} : {
        ...n.attributes,
        ...n.listeners,
        tabIndex: 0,
        onKeyDown: (y) => r.onKeyDown(y, e)
      },
      children: /* @__PURE__ */ t(L.Provider, { value: e, children: f })
    }
  );
}, J = () => /* @__PURE__ */ h("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": !0, className: "zen-shrink-0", children: [
  /* @__PURE__ */ t("circle", { cx: "9", cy: "6", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "15", cy: "6", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "9", cy: "12", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "15", cy: "12", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "9", cy: "18", r: "1.6" }),
  /* @__PURE__ */ t("circle", { cx: "15", cy: "18", r: "1.6" })
] }), oe = ({ label: e, className: m, children: c }) => {
  const f = k(), l = w(), r = p.useContext(L), n = D({ id: r });
  return /* @__PURE__ */ t(
    "button",
    {
      type: "button",
      ref: n.setActivatorNodeRef,
      "aria-label": e ?? f.t("sortableList.reorder"),
      disabled: l.disabled,
      ...n.attributes,
      ...n.listeners,
      "aria-pressed": l.picked?.id === r,
      onKeyDown: (d) => l.onKeyDown(d, r),
      className: S(
        "zen-inline-flex zen-cursor-grab zen-items-center zen-rounded-zen-sm zen-p-1 zen-text-zen-muted-fg",
        "hover:zen-text-zen-foreground focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        /* Or the page scrolls instead of the item moving. */
        "zen-touch-none",
        m
      ),
      children: c ?? /* @__PURE__ */ t(J, {})
    }
  );
};
export {
  ne as SortableList,
  oe as SortableListHandle,
  re as SortableListItem
};
//# sourceMappingURL=index123.js.map
