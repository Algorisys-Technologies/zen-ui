import { jsxs as r, Fragment as C, jsx as n } from "react/jsx-runtime";
import * as z from "react";
import { cn as k } from "./index160.js";
import "./index28.js";
import "./index110.js";
import { Dialog as te, DialogContent as le, DialogTitle as oe, DialogDescription as re } from "./index79.js";
import { Button as g } from "./index71.js";
import { Switch as se } from "./index38.js";
import { Tabs as ie, TabsList as ce, TabsTrigger as ae, TabsContent as de } from "./index98.js";
import { SelectListBody as b } from "./index183.js";
import { useLocale as ze } from "./index90.js";
const h = {
  sortBy: null,
  sortDescending: !1,
  groupBy: null,
  groupDescending: !1,
  filters: {}
}, me = (s) => Object.values(s ?? {}).reduce((i, c) => i + c.length, 0), ue = ({
  open: s,
  onOpenChange: i,
  title: c,
  description: d,
  sortItems: x,
  groupItems: v,
  filterGroups: y,
  value: T,
  onConfirm: j,
  confirmLabel: V,
  cancelLabel: E,
  resetLabel: R,
  sortTabLabel: G,
  groupTabLabel: M,
  filterTabLabel: Y,
  className: q
}) => {
  const l = ze(), A = c ?? l.t("viewSettings.title"), H = V ?? l.t("common.ok"), J = E ?? l.t("common.cancel"), K = R ?? l.t("viewSettings.reset"), Q = G ?? l.t("viewSettings.sort"), U = M ?? l.t("viewSettings.group"), W = Y ?? l.t("viewSettings.filter"), [t, m] = z.useState(h), w = z.useRef(T);
  z.useEffect(() => {
    w.current = T;
  }), z.useEffect(() => {
    if (!s) return;
    const e = w.current;
    m({ ...h, ...e, filters: { ...e?.filters ?? {} } });
  }, [s]);
  const a = [
    x?.length ? "sort" : null,
    v?.length ? "group" : null,
    y?.length ? "filter" : null
  ].filter(Boolean), u = (e) => m((o) => ({ ...o, ...e })), B = (e) => u({ sortBy: t.sortBy === e ? null : e }), S = (e) => u({ groupBy: t.groupBy === e ? null : e }), D = (e, o, I) => m((p) => {
    const f = p.filters?.[e] ?? [], ee = I ? f.includes(o) ? f.filter((ne) => ne !== o) : [...f, o] : f.includes(o) ? [] : [o];
    return { ...p, filters: { ...p.filters, [e]: ee } };
  }), X = () => {
    j(t), i(!1);
  }, L = z.useId(), N = me(t.filters), Z = /* @__PURE__ */ r(C, { children: [
    /* @__PURE__ */ n(
      b,
      {
        items: x ?? [],
        selected: t.sortBy ? [t.sortBy] : [],
        onToggle: B,
        onPick: B,
        emptyText: l.t("viewSettings.noSortFields")
      }
    ),
    /* @__PURE__ */ n(
      P,
      {
        label: l.t("viewSettings.descending"),
        checked: !!t.sortDescending,
        disabled: !t.sortBy,
        onChange: (e) => u({ sortDescending: e })
      }
    )
  ] }), _ = /* @__PURE__ */ r(C, { children: [
    /* @__PURE__ */ n(
      b,
      {
        items: v ?? [],
        selected: t.groupBy ? [t.groupBy] : [],
        onToggle: S,
        onPick: S,
        emptyText: l.t("viewSettings.noGroupFields")
      }
    ),
    /* @__PURE__ */ n(
      P,
      {
        label: l.t("viewSettings.descending"),
        checked: !!t.groupDescending,
        disabled: !t.groupBy,
        onChange: (e) => u({ groupDescending: e })
      }
    )
  ] }), $ = /* @__PURE__ */ n("div", { className: "zen-flex zen-flex-col zen-gap-3", children: (y ?? []).map((e) => /* @__PURE__ */ r("div", { children: [
    /* @__PURE__ */ n("div", { className: "zen-px-4 zen-pb-1 zen-text-xs zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: e.label }),
    /* @__PURE__ */ n(
      b,
      {
        items: e.items,
        multiple: e.multiple ?? !0,
        selected: t.filters?.[e.id] ?? [],
        onToggle: (o) => D(e.id, o, e.multiple ?? !0),
        onPick: (o) => D(e.id, o, e.multiple ?? !0),
        emptyText: l.t("viewSettings.noValues")
      }
    )
  ] }, e.id)) }), F = (e) => e === "sort" ? Z : e === "group" ? _ : $, O = (e) => e === "sort" ? Q : e === "group" ? U : W;
  return /* @__PURE__ */ n(te, { open: s, onOpenChange: i, children: /* @__PURE__ */ r(
    le,
    {
      className: k("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", q),
      "aria-describedby": d ? L : void 0,
      children: [
        /* @__PURE__ */ r("div", { className: "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: [
          /* @__PURE__ */ n(oe, { className: "zen-pr-8", children: A }),
          d ? /* @__PURE__ */ n(re, { id: L, children: d }) : null
        ] }),
        a.length > 1 ? /* @__PURE__ */ r(ie, { defaultValue: a[0], className: "zen-flex zen-min-h-0 zen-flex-1 zen-flex-col", children: [
          /* @__PURE__ */ n(ce, { className: "zen-mx-6 zen-mt-3", children: a.map((e) => /* @__PURE__ */ r(ae, { value: e, children: [
            O(e),
            e === "filter" && N > 0 ? /* @__PURE__ */ n("span", { className: "zen-ml-2 zen-rounded-zen-full zen-bg-zen-primary-soft zen-px-1.5 zen-text-xs zen-text-zen-primary-soft-fg", children: N }) : null
          ] }, e)) }),
          a.map((e) => /* @__PURE__ */ n(
            de,
            {
              value: e,
              className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2",
              children: F(e)
            },
            e
          ))
        ] }) : /* @__PURE__ */ n("div", { className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2", children: a.length ? F(a[0]) : null }),
        /* @__PURE__ */ r("div", { className: "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3", children: [
          /* @__PURE__ */ n(
            g,
            {
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              className: "zen-mr-auto",
              onClick: () => m({ ...h, filters: {} }),
              children: K
            }
          ),
          /* @__PURE__ */ n(
            g,
            {
              type: "button",
              variant: "outline",
              color: "neutral",
              size: "sm",
              onClick: () => i(!1),
              children: J
            }
          ),
          /* @__PURE__ */ n(g, { type: "button", size: "sm", onClick: X, children: H })
        ] })
      ]
    }
  ) });
};
ue.displayName = "ViewSettingsDialog";
const P = ({
  label: s,
  checked: i,
  disabled: c,
  onChange: d
}) => /* @__PURE__ */ r(
  "label",
  {
    className: k(
      "zen-mt-2 zen-flex zen-items-center zen-gap-2 zen-border-0 zen-border-t zen-border-solid zen-border-zen-border zen-px-4 zen-pt-3 zen-text-sm",
      c && "zen-opacity-50"
    ),
    children: [
      /* @__PURE__ */ n(se, { checked: i, disabled: c, onCheckedChange: d }),
      s
    ]
  }
);
export {
  ue as ViewSettingsDialog
};
//# sourceMappingURL=index55.js.map
