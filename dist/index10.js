import { template as E, spread as W, mergeProps as X, insert as m, createComponent as v, use as Y, effect as Z, setAttribute as o, setStyleProperty as _, className as w, delegateEvents as ee } from "solid-js/web";
import { splitProps as ne, createSignal as I, createMemo as O, For as te, Show as R } from "solid-js";
import { cn as U } from "./index103.js";
import { arrowStep as j } from "./index112.js";
import "./index25.js";
import { Icon as q } from "./index21.js";
var de = /* @__PURE__ */ E("<ul role=tree>"), ie = /* @__PURE__ */ E("<li role=treeitem class=zen-m-0><div><span class=zen-truncate>"), se = /* @__PURE__ */ E('<span class="zen-inline-block zen-w-3.5 zen-shrink-0">');
function B(p, s, z = 1, g = null) {
  const u = [];
  return p.forEach((r, x) => {
    const c = !!r.children?.length;
    u.push({
      node: r,
      level: z,
      parentId: g,
      hasChildren: c,
      posInSet: x + 1,
      setSize: p.length
    }), c && s.has(r.id) && u.push(...B(r.children, s, z + 1, r.id));
  }), u;
}
const ue = (p) => {
  const [s, z] = ne(p, ["items", "expanded", "defaultExpanded", "onExpandedChange", "selected", "defaultSelected", "onSelectedChange", "class"]), [g, u] = I(s.defaultExpanded ?? []), [r, x] = I(s.defaultSelected ?? null), c = () => s.expanded ?? g(), k = () => s.selected !== void 0 ? s.selected : r(), h = O(() => new Set(c())), S = O(() => B(s.items, h())), [G, y] = I(null), J = () => G() ?? k() ?? S()[0]?.node.id ?? null, D = /* @__PURE__ */ new Map(), Q = (n) => {
    s.expanded === void 0 && u(n), s.onExpandedChange?.(n);
  }, b = (n, e) => {
    const i = h().has(n), l = e ?? !i;
    l !== i && Q(l ? [...c(), n] : c().filter((d) => d !== n));
  }, A = (n) => {
    s.selected === void 0 && x(n), s.onSelectedChange?.(n);
  }, f = (n) => {
    y(n), D.get(n)?.focus();
  }, V = (n, e) => {
    const i = S(), l = i.findIndex((a) => a.node.id === e.node.id), d = n.key;
    d === "ArrowDown" ? (n.preventDefault(), i[l + 1] && f(i[l + 1].node.id)) : d === "ArrowUp" ? (n.preventDefault(), i[l - 1] && f(i[l - 1].node.id)) : j(d, n.currentTarget) === 1 ? (n.preventDefault(), e.hasChildren && !h().has(e.node.id) ? b(e.node.id, !0) : e.hasChildren && i[l + 1] && f(i[l + 1].node.id)) : j(d, n.currentTarget) === -1 ? (n.preventDefault(), e.hasChildren && h().has(e.node.id) ? b(e.node.id, !1) : e.parentId && f(e.parentId)) : d === "Home" ? (n.preventDefault(), i[0] && f(i[0].node.id)) : d === "End" ? (n.preventDefault(), i.at(-1) && f(i.at(-1).node.id)) : (d === "Enter" || d === " ") && (n.preventDefault(), e.node.disabled || A(e.node.id));
  };
  return (() => {
    var n = de();
    return W(n, X({
      get class() {
        return U("zen-m-0 zen-list-none zen-p-0 zen-text-sm", s.class);
      }
    }, z), !1, !0), m(n, v(te, {
      get each() {
        return S();
      },
      children: (e) => {
        const i = () => h().has(e.node.id), l = () => k() === e.node.id;
        return (() => {
          var d = ie(), a = d.firstChild, C = a.firstChild;
          return a.$$click = () => {
            e.node.disabled || (e.hasChildren && b(e.node.id), A(e.node.id));
          }, a.addEventListener("focus", () => y(e.node.id)), a.$$keydown = (t) => V(t, e), Y((t) => D.set(e.node.id, t), a), m(a, v(R, {
            get when() {
              return e.hasChildren;
            },
            get fallback() {
              return se();
            },
            get children() {
              return v(q, {
                get name() {
                  return i() ? "chevron-down" : "chevron-right";
                },
                size: 14,
                class: "zen-shrink-0 zen-text-zen-muted-fg"
              });
            }
          }), C), m(a, v(R, {
            get when() {
              return e.node.icon;
            },
            children: (t) => v(q, {
              get name() {
                return t();
              },
              size: 14,
              class: "zen-shrink-0 zen-text-zen-muted-fg"
            })
          }), C), m(C, () => e.node.label), Z((t) => {
            var P = e.hasChildren ? i() : void 0, T = l(), $ = e.level, F = e.posInSet, M = e.setSize, H = e.node.disabled || void 0, K = J() === e.node.id ? 0 : -1, L = `calc(${e.level - 1} * 1rem + 0.25rem)`, N = U("zen-flex zen-cursor-pointer zen-items-center zen-gap-1.5 zen-rounded-zen-sm zen-py-1 zen-pr-2", "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring", "hover:zen-bg-zen-muted", l() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg zen-font-medium", e.node.disabled && "zen-cursor-not-allowed zen-opacity-50");
            return P !== t.e && o(d, "aria-expanded", t.e = P), T !== t.t && o(d, "aria-selected", t.t = T), $ !== t.a && o(d, "aria-level", t.a = $), F !== t.o && o(d, "aria-posinset", t.o = F), M !== t.i && o(d, "aria-setsize", t.i = M), H !== t.n && o(d, "aria-disabled", t.n = H), K !== t.s && o(a, "tabindex", t.s = K), L !== t.h && _(a, "padding-left", t.h = L), N !== t.r && w(a, t.r = N), t;
          }, {
            e: void 0,
            t: void 0,
            a: void 0,
            o: void 0,
            i: void 0,
            n: void 0,
            s: void 0,
            h: void 0,
            r: void 0
          }), d;
        })();
      }
    })), n;
  })();
};
ee(["keydown", "click"]);
export {
  ue as Tree
};
//# sourceMappingURL=index10.js.map
