import { jsx as r, jsxs as x, Fragment as q } from "react/jsx-runtime";
import * as n from "react";
import { statusBarSides as A, statusBarCollapse as D } from "./index136.js";
import { statusBarItemVariants as H, statusBarSeparatorClass as J, statusBarVariants as K } from "./index198.js";
import { Icon as M } from "./index63.js";
import { useLocale as P } from "./index90.js";
import { cn as w } from "./index199.js";
const Q = (o, l) => o.length === l.length && o.every((u, R) => u === l[R]), T = n.forwardRef(
  ({ items: o, variant: l, size: u, label: R, onCollapse: z, className: F, ...k }, d) => {
    const E = P(), [i, I] = n.useState([]), v = A(o), g = [...v.start, ...v.end], L = v.end.find((e) => !i.includes(e.id))?.id, f = n.useRef(null), p = n.useRef([]), S = n.useRef({}), B = n.useRef({ items: o, ordered: g, collapsed: i, onCollapse: z });
    B.current = { items: o, ordered: g, collapsed: i, onCollapse: z };
    const y = n.useCallback(() => {
      const e = f.current;
      if (!e) return;
      const { items: t, ordered: s, collapsed: a, onCollapse: b } = B.current, c = getComputedStyle(e), V = e.clientWidth - (parseFloat(c.paddingLeft) || 0) - (parseFloat(c.paddingRight) || 0), G = parseFloat(c.columnGap) || 0;
      s.forEach((C, W) => {
        const N = p.current[W];
        N && !a.includes(C.id) && (S.current[C.id] = N.getBoundingClientRect().width);
      });
      const h = D(t, S.current, V, G);
      Q(h, a) || (B.current.collapsed = h, I(h), b?.(h));
    }, []), m = n.useRef(null);
    n.useLayoutEffect(() => {
      if (typeof ResizeObserver > "u" || !f.current) return;
      const e = new ResizeObserver(() => y());
      m.current = e, e.observe(f.current);
      for (const t of p.current) t && e.observe(t);
      return () => {
        e.disconnect(), m.current = null;
      };
    }, [y]);
    const O = n.useRef([]), j = (e) => O.current[e] ??= (t) => {
      const s = p.current[e];
      s !== t && (s && m.current?.unobserve(s), p.current[e] = t, t && m.current?.observe(t));
    };
    return /* @__PURE__ */ r(
      "div",
      {
        ref: (e) => {
          f.current = e, typeof d == "function" ? d(e) : d && (d.current = e);
        },
        role: "group",
        "aria-label": R ?? E.t("statusBar.label"),
        className: w(K({ variant: l, size: u }), F),
        ...k,
        children: g.map((e, t) => {
          const s = i.includes(e.id), a = e.label === void 0 || e.label === null || e.label === "", b = H({ color: e.color ?? "none", interactive: !!e.onSelect }), c = /* @__PURE__ */ x(q, { children: [
            e.icon && /* @__PURE__ */ r(M, { name: e.icon, size: u === "sm" ? 12 : 14 }),
            e.title && !(a && e.onSelect) && /* @__PURE__ */ r("span", { className: "zen-sr-only", children: e.title }),
            !a && /* @__PURE__ */ r("span", { className: "zen-truncate", role: e.announce ? "status" : void 0, children: e.label })
          ] });
          return /* @__PURE__ */ x(
            "span",
            {
              ref: j(t),
              "data-status-item": e.id,
              "data-collapsed": s ? "" : void 0,
              className: w(
                s ? "zen-hidden" : "zen-inline-flex zen-h-full zen-shrink-0 zen-items-center zen-gap-1",
                L === e.id && "zen-ms-auto"
              ),
              children: [
                e.separatorBefore && /* @__PURE__ */ r("span", { "aria-hidden": "true", className: J }),
                e.onSelect ? /* @__PURE__ */ r(
                  "button",
                  {
                    type: "button",
                    className: b,
                    title: e.title,
                    "aria-label": a ? e.title : void 0,
                    disabled: e.disabled,
                    onClick: () => e.onSelect?.(),
                    children: c
                  }
                ) : /* @__PURE__ */ r("span", { className: b, title: e.title, children: c })
              ]
            },
            t
          );
        })
      }
    );
  }
);
T.displayName = "StatusBar";
export {
  T as StatusBar
};
//# sourceMappingURL=index135.js.map
