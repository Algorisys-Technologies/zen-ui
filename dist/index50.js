import { jsxs as r, Fragment as P, jsx as n } from "react/jsx-runtime";
import * as d from "react";
import { cn as k } from "./index145.js";
import "./index25.js";
import "./index100.js";
import { Dialog as W, DialogContent as X, DialogTitle as Z, DialogDescription as _ } from "./index71.js";
import { Button as f } from "./index65.js";
import { Switch as $ } from "./index35.js";
import { Tabs as I, TabsList as ee, TabsTrigger as ne, TabsContent as te } from "./index88.js";
import { SelectListBody as g } from "./index162.js";
const h = {
  sortBy: null,
  sortDescending: !1,
  groupBy: null,
  groupDescending: !1,
  filters: {}
}, le = (o) => Object.values(o ?? {}).reduce((s, i) => s + i.length, 0), re = ({
  open: o,
  onOpenChange: s,
  title: i = "View settings",
  description: a,
  sortItems: x,
  groupItems: b,
  filterGroups: y,
  value: B,
  onConfirm: j,
  confirmLabel: R = "OK",
  cancelLabel: V = "Cancel",
  resetLabel: E = "Reset",
  sortTabLabel: L = "Sort",
  groupTabLabel: G = "Group",
  filterTabLabel: K = "Filter",
  className: M
}) => {
  const [t, z] = d.useState(h), D = d.useRef(B);
  d.useEffect(() => {
    D.current = B;
  }), d.useEffect(() => {
    if (!o) return;
    const e = D.current;
    z({ ...h, ...e, filters: { ...e?.filters ?? {} } });
  }, [o]);
  const c = [
    x?.length ? "sort" : null,
    b?.length ? "group" : null,
    y?.length ? "filter" : null
  ].filter(Boolean), u = (e) => z((l) => ({ ...l, ...e })), N = (e) => u({ sortBy: t.sortBy === e ? null : e }), v = (e) => u({ groupBy: t.groupBy === e ? null : e }), T = (e, l, O) => z((p) => {
    const m = p.filters?.[e] ?? [], Q = O ? m.includes(l) ? m.filter((U) => U !== l) : [...m, l] : m.includes(l) ? [] : [l];
    return { ...p, filters: { ...p.filters, [e]: Q } };
  }), Y = () => {
    j(t), s(!1);
  }, w = d.useId(), C = le(t.filters), q = /* @__PURE__ */ r(P, { children: [
    /* @__PURE__ */ n(
      g,
      {
        items: x ?? [],
        selected: t.sortBy ? [t.sortBy] : [],
        onToggle: N,
        onPick: N,
        emptyText: "No sort fields"
      }
    ),
    /* @__PURE__ */ n(
      S,
      {
        label: "Descending",
        checked: !!t.sortDescending,
        disabled: !t.sortBy,
        onChange: (e) => u({ sortDescending: e })
      }
    )
  ] }), A = /* @__PURE__ */ r(P, { children: [
    /* @__PURE__ */ n(
      g,
      {
        items: b ?? [],
        selected: t.groupBy ? [t.groupBy] : [],
        onToggle: v,
        onPick: v,
        emptyText: "No group fields"
      }
    ),
    /* @__PURE__ */ n(
      S,
      {
        label: "Descending",
        checked: !!t.groupDescending,
        disabled: !t.groupBy,
        onChange: (e) => u({ groupDescending: e })
      }
    )
  ] }), H = /* @__PURE__ */ n("div", { className: "zen-flex zen-flex-col zen-gap-3", children: (y ?? []).map((e) => /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ n("div", { className: "zen-px-4 zen-pb-1 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: e.label }),
    /* @__PURE__ */ n(
      g,
      {
        items: e.items,
        multiple: e.multiple ?? !0,
        selected: t.filters?.[e.id] ?? [],
        onToggle: (l) => T(e.id, l, e.multiple ?? !0),
        onPick: (l) => T(e.id, l, e.multiple ?? !0),
        emptyText: "No values"
      }
    )
  ] }, e.id)) }), F = (e) => e === "sort" ? q : e === "group" ? A : H, J = (e) => e === "sort" ? L : e === "group" ? G : K;
  return /* @__PURE__ */ n(W, { open: o, onOpenChange: s, children: /* @__PURE__ */ r(
    X,
    {
      className: k("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", M),
      "aria-describedby": a ? w : void 0,
      children: [
        /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: [
          /* @__PURE__ */ n(Z, { className: "zen-pr-8", children: i }),
          a ? /* @__PURE__ */ n(_, { id: w, children: a }) : null
        ] }),
        c.length > 1 ? /* @__PURE__ */ r(I, { defaultValue: c[0], className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col", children: [
          /* @__PURE__ */ n(ee, { className: "zen-mx-6 zen-mt-3", children: c.map((e) => /* @__PURE__ */ r(ne, { value: e, children: [
            J(e),
            e === "filter" && C > 0 ? /* @__PURE__ */ n("span", { className: "zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg", children: C }) : null
          ] }, e)) }),
          c.map((e) => /* @__PURE__ */ n(
            te,
            {
              value: e,
              className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2",
              children: F(e)
            },
            e
          ))
        ] }) : /* @__PURE__ */ n("div", { className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2", children: c.length ? F(c[0]) : null }),
        /* @__PURE__ */ r("div", { className: "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3", children: [
          /* @__PURE__ */ n(
            f,
            {
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              className: "zen-mr-auto",
              onClick: () => z({ ...h, filters: {} }),
              children: E
            }
          ),
          /* @__PURE__ */ n(
            f,
            {
              type: "button",
              variant: "outline",
              color: "neutral",
              size: "sm",
              onClick: () => s(!1),
              children: V
            }
          ),
          /* @__PURE__ */ n(f, { type: "button", size: "sm", onClick: Y, children: R })
        ] })
      ]
    }
  ) });
};
re.displayName = "ViewSettingsDialog";
const S = ({
  label: o,
  checked: s,
  disabled: i,
  onChange: a
}) => /* @__PURE__ */ r(
  "label",
  {
    className: k(
      "zen-mt-2 zen-flex zen-items-center zen-gap-2 zen-border-0 zen-border-t zen-border-solid zen-border-zen-border zen-px-4 zen-pt-3 zen-text-sm",
      i && "zen-opacity-50"
    ),
    children: [
      /* @__PURE__ */ n($, { checked: s, disabled: i, onCheckedChange: a }),
      o
    ]
  }
);
export {
  re as ViewSettingsDialog
};
//# sourceMappingURL=index50.js.map
