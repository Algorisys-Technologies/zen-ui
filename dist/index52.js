import { jsx as n, jsxs as h } from "react/jsx-runtime";
import * as t from "react";
import { cn as K } from "./index143.js";
import "./index24.js";
import "./index98.js";
import { Dialog as M, DialogContent as P, DialogTitle as Q, DialogDescription as V } from "./index70.js";
import { Button as p } from "./index64.js";
import { SelectSearchField as A, SelectListBody as G } from "./index160.js";
import { filterItems as H } from "./index161.js";
const J = ({
  open: s,
  onOpenChange: i,
  title: S,
  description: c,
  items: a,
  multiple: d = !1,
  selectedIds: b,
  onConfirm: v,
  searchable: D = !0,
  searchPlaceholder: k = "Search",
  onSearch: m,
  emptyText: w = "No matching items",
  confirmLabel: C = "OK",
  cancelLabel: j = "Cancel",
  clearLabel: B = "Clear",
  showClearAll: R = !0,
  className: E
}) => {
  const [z, g] = t.useState(""), [f, u] = t.useState([]), x = t.useRef(b);
  t.useEffect(() => {
    x.current = b;
  }), t.useEffect(() => {
    s && (u(x.current ?? []), g(""));
  }, [s]);
  const I = t.useMemo(
    () => H(a, z, !!m),
    [a, z, m]
  ), y = (e) => {
    v(e), i(!1);
  }, L = (e) => u((r) => r.includes(e) ? r.filter((o) => o !== e) : [...r, e]), T = (e) => {
    const r = new Set(e), o = a.filter((l) => r.has(l.id)).map((l) => l.id), F = new Set(o);
    return [...o, ...e.filter((l) => !F.has(l))];
  }, q = (e) => {
    g(e), m?.(e);
  }, N = t.useId();
  return /* @__PURE__ */ n(M, { open: s, onOpenChange: i, children: /* @__PURE__ */ h(
    P,
    {
      className: K("zen-flex zen-max-h-[85vh] zen-flex-col zen-overflow-hidden zen-p-0", E),
      "aria-describedby": c ? N : void 0,
      children: [
        /* @__PURE__ */ h("div", { className: "zen-flex zen-flex-col zen-gap-2 zen-border-b zen-border-zen-border zen-px-6 zen-py-4", children: [
          /* @__PURE__ */ n(Q, { className: "zen-pr-8", children: S }),
          c ? /* @__PURE__ */ n(V, { id: N, children: c }) : null,
          D ? /* @__PURE__ */ n(
            A,
            {
              value: z,
              onValueChange: q,
              placeholder: k,
              className: "zen-mt-1"
            }
          ) : null
        ] }),
        /* @__PURE__ */ n("div", { className: "zen-min-h-0 zen-flex-1 zen-overflow-y-auto zen-px-2 zen-py-2", children: /* @__PURE__ */ n(
          G,
          {
            items: I,
            multiple: d,
            selected: f,
            onToggle: L,
            onPick: (e) => y([e]),
            emptyText: w
          }
        ) }),
        /* @__PURE__ */ h("div", { className: "zen-flex zen-items-center zen-justify-end zen-gap-2 zen-border-t zen-border-zen-border zen-px-6 zen-py-3", children: [
          d && R ? /* @__PURE__ */ n(
            p,
            {
              type: "button",
              variant: "ghost",
              color: "neutral",
              size: "sm",
              disabled: f.length === 0,
              onClick: () => u([]),
              className: "zen-mr-auto",
              children: B
            }
          ) : null,
          /* @__PURE__ */ n(
            p,
            {
              type: "button",
              variant: "outline",
              color: "neutral",
              size: "sm",
              onClick: () => i(!1),
              children: j
            }
          ),
          d ? /* @__PURE__ */ n(p, { type: "button", size: "sm", onClick: () => y(T(f)), children: C }) : null
        ] })
      ]
    }
  ) });
};
J.displayName = "SelectDialog";
export {
  J as SelectDialog
};
//# sourceMappingURL=index52.js.map
