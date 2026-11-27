import { jsx as c, jsxs as $ } from "react/jsx-runtime";
import * as o from "react";
import { cn as D } from "./index199.js";
import { arrowStep as C } from "./index207.js";
import "./index208.js";
import { treeRowDensityClass as q } from "./index198.js";
import "./index28.js";
import "./index110.js";
import { Icon as N } from "./index63.js";
function k(f, u, p = 1, h = null) {
  const d = [];
  return f.forEach((a, v) => {
    const m = !!a.children?.length;
    d.push({ node: a, level: p, parentId: h, hasChildren: m, posInSet: v + 1, setSize: f.length }), m && u.has(a.id) && d.push(...k(a.children, u, p + 1, a.id));
  }), d;
}
const B = o.forwardRef(
  ({ items: f, expanded: u, defaultExpanded: p = [], onExpandedChange: h, selected: d, defaultSelected: a = null, onSelectedChange: v, itemClassName: m, density: E, className: R, ...T }, M) => {
    const [j, A] = o.useState(p), [F, K] = o.useState(a), z = u ?? j, x = d !== void 0 ? d : F, l = o.useMemo(() => new Set(z), [z]), i = o.useMemo(() => k(f, l), [f, l]), [H, S] = o.useState(null), L = H ?? x ?? i[0]?.node.id ?? null, g = o.useRef(/* @__PURE__ */ new Map()), O = (e) => {
      u === void 0 && A(e), h?.(e);
    }, I = (e, n) => {
      const s = l.has(e), t = n ?? !s;
      t !== s && O(t ? [...z, e] : z.filter((b) => b !== e));
    }, y = (e) => {
      d === void 0 && K(e), v?.(e);
    }, r = (e) => {
      S(e), g.current.get(e)?.focus();
    }, U = (e, n) => {
      const s = i.findIndex((b) => b.node.id === n.node.id), t = e.key;
      t === "ArrowDown" ? (e.preventDefault(), i[s + 1] && r(i[s + 1].node.id)) : t === "ArrowUp" ? (e.preventDefault(), i[s - 1] && r(i[s - 1].node.id)) : C(t, e.currentTarget) === 1 ? (e.preventDefault(), n.hasChildren && !l.has(n.node.id) ? I(n.node.id, !0) : n.hasChildren && i[s + 1] && r(i[s + 1].node.id)) : C(t, e.currentTarget) === -1 ? (e.preventDefault(), n.hasChildren && l.has(n.node.id) ? I(n.node.id, !1) : n.parentId && r(n.parentId)) : t === "Home" ? (e.preventDefault(), i[0] && r(i[0].node.id)) : t === "End" ? (e.preventDefault(), i.at(-1) && r(i.at(-1).node.id)) : (t === "Enter" || t === " ") && (e.preventDefault(), n.node.disabled || y(n.node.id));
    };
    return /* @__PURE__ */ c(
      "ul",
      {
        ref: M,
        role: "tree",
        className: D("zen-m-0 zen-list-none zen-p-0 zen-text-sm", R),
        ...T,
        children: i.map((e) => {
          const n = l.has(e.node.id), s = x === e.node.id;
          return /* @__PURE__ */ c(
            "li",
            {
              role: "treeitem",
              "aria-expanded": e.hasChildren ? n : void 0,
              "aria-selected": s,
              "aria-level": e.level,
              "aria-posinset": e.posInSet,
              "aria-setsize": e.setSize,
              "aria-disabled": e.node.disabled || void 0,
              className: "zen-m-0",
              children: /* @__PURE__ */ $(
                "div",
                {
                  ref: (t) => {
                    t ? g.current.set(e.node.id, t) : g.current.delete(e.node.id);
                  },
                  tabIndex: L === e.node.id ? 0 : -1,
                  onKeyDown: (t) => U(t, e),
                  onFocus: () => S(e.node.id),
                  onClick: () => {
                    e.node.disabled || (e.hasChildren && I(e.node.id), y(e.node.id));
                  },
                  style: { paddingLeft: `calc(${e.level - 1} * 1rem + 0.25rem)` },
                  className: D(
                    "zen-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-sm zen-py-1 zen-pr-2",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    "hover:zen-bg-zen-muted",
                    s && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-medium",
                    e.node.disabled && "zen-cursor-not-allowed zen-opacity-50",
                    q[E ?? "comfortable"],
                    m?.(e.node)
                  ),
                  children: [
                    e.hasChildren ? /* @__PURE__ */ c(
                      N,
                      {
                        name: n ? "chevron-down" : "chevron-right",
                        size: 14,
                        className: "zen-shrink-0 zen-text-zen-muted-fg"
                      }
                    ) : (
                      // Keep leaves aligned with their expandable siblings.
                      /* @__PURE__ */ c("span", { className: "zen-inline-block zen-w-3.5 zen-shrink-0" })
                    ),
                    e.node.icon ? /* @__PURE__ */ c(N, { name: e.node.icon, size: 14, className: "zen-shrink-0 zen-text-zen-muted-fg" }) : null,
                    /* @__PURE__ */ c("span", { className: "zen-truncate", children: e.node.label })
                  ]
                }
              )
            },
            e.node.id
          );
        })
      }
    );
  }
);
B.displayName = "Tree";
export {
  B as Tree
};
//# sourceMappingURL=index61.js.map
