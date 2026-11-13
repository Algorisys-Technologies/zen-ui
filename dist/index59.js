import { jsx as n, jsxs as b } from "react/jsx-runtime";
import * as o from "react";
import { cn as G } from "./index197.js";
import "./index28.js";
import "./index110.js";
import { Dialog as H, DialogContent as J, DialogTitle as K, DialogDescription as U } from "./index79.js";
import { Button as p } from "./index71.js";
import { SelectSearchField as W, SelectListBody as X } from "./index220.js";
import { filterItems as Y } from "./index222.js";
import { useLocale as Z } from "./index90.js";
const _ = ({
  open: s,
  onOpenChange: a,
  title: D,
  description: i,
  items: m,
  multiple: d = !1,
  selectedIds: g,
  onConfirm: N,
  searchable: S = !0,
  searchPlaceholder: k,
  onSearch: f,
  emptyText: w,
  confirmLabel: j,
  cancelLabel: B,
  clearLabel: C,
  showClearAll: P = !0,
  className: R
}) => {
  const r = Z(), E = k ?? r.t("common.search"), I = j ?? r.t("common.ok"), T = B ?? r.t("common.cancel"), q = C ?? r.t("common.clear"), [z, x] = o.useState(""), [u, h] = o.useState([]), y = o.useRef(g);
  o.useEffect(() => {
    y.current = g;
  }), o.useEffect(() => {
    s && (h(y.current ?? []), x(""));
  }, [s]);
  const F = o.useMemo(
    () => Y(m, z, !!f),
    [m, z, f]
  ), L = (e) => {
    N(e), a(!1);
  }, M = (e) => h((t) => t.includes(e) ? t.filter((c) => c !== e) : [...t, e]), Q = (e) => {
    const t = new Set(e), c = m.filter((l) => t.has(l.id)).map((l) => l.id), A = new Set(c);
    return [...c, ...e.filter((l) => !A.has(l))];
  }, V = (e) => {
    x(e), f?.(e);
  }, v = o.useId();
  return /* @__PURE__ */ n(H, { open: s, onOpenChange: a, children: /* @__PURE__ */ b(
    J,
    {
      className: G("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", R),
      "aria-describedby": i ? v : void 0,
      children: [
        /* @__PURE__ */ b("div", { className: "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: [
          /* @__PURE__ */ n(K, { className: "zen-pr-8", children: D }),
          i ? /* @__PURE__ */ n(U, { id: v, children: i }) : null,
          S ? /* @__PURE__ */ n(
            W,
            {
              value: z,
              onValueChange: V,
              placeholder: E,
              className: "zen-mt-1"
            }
          ) : null
        ] }),
        /* @__PURE__ */ n("div", { className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2", children: /* @__PURE__ */ n(
          X,
          {
            items: F,
            multiple: d,
            selected: u,
            onToggle: M,
            onPick: (e) => L([e]),
            emptyText: w
          }
        ) }),
        /* @__PURE__ */ b("div", { className: "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3", children: [
          d && P ? /* @__PURE__ */ n(
            p,
            {
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              disabled: u.length === 0,
              onClick: () => h([]),
              className: "zen-mr-auto",
              children: q
            }
          ) : null,
          /* @__PURE__ */ n(
            p,
            {
              type: "button",
              variant: "outline",
              color: "neutral",
              size: "sm",
              onClick: () => a(!1),
              children: T
            }
          ),
          d ? /* @__PURE__ */ n(p, { type: "button", size: "sm", onClick: () => L(Q(u)), children: I }) : null
        ] })
      ]
    }
  ) });
};
_.displayName = "SelectDialog";
export {
  _ as SelectDialog
};
//# sourceMappingURL=index59.js.map
