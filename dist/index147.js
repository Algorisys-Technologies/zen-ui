import { jsx as l, jsxs as b } from "react/jsx-runtime";
import * as a from "react";
import { traceGenealogy as J } from "./index148.js";
import { cn as F } from "./index197.js";
import { observeDocumentDirection as K } from "./index205.js";
import "./index28.js";
import "./index110.js";
import { useLocale as Q } from "./index90.js";
const T = a.forwardRef(
  ({ nodes: z, edges: f, focus: A, defaultFocus: D, onFocusChange: G, maxDepth: x, className: M, ...q }, B) => {
    const r = Q(), [O, E] = a.useState(() => D ?? z[0]?.id ?? ""), d = A ?? O, s = a.useMemo(
      () => J(z, f, d, { maxDepth: x ?? 3 }),
      [z, f, d, x]
    ), p = a.useMemo(() => new Map(z.map((e) => [e.id, e])), [z]), h = (e) => p.get(e)?.label ?? e, U = (e) => {
      E(e), G?.(e);
    }, v = (e) => e === 0 ? r.t("genealogy.focus") : e < 0 ? [r.t("genealogy.upstream"), r.t("genealogy.levelUp", { count: -e })].join(" · ") : [r.t("genealogy.downstream"), r.t("genealogy.levelDown", { count: e })].join(" · "), W = (e) => {
      const n = f.filter((t) => t.to === e).map((t) => h(t.from)), o = f.filter((t) => t.from === e).map((t) => h(t.to)), i = p.get(e);
      return r.t("genealogy.node", {
        name: [i?.kind, i?.label ?? e].filter(Boolean).join(" "),
        from: n.length ? n.join(", ") : r.t("genealogy.none"),
        into: o.length ? o.join(", ") : r.t("genealogy.none")
      });
    }, g = a.useRef(null), [H, I] = a.useState([]), [y, L] = a.useState({ w: 0, h: 0 }), w = a.useRef(s);
    w.current = s;
    const u = a.useCallback(() => {
      const e = g.current;
      if (!e) return;
      const n = e.getBoundingClientRect(), o = (t) => e.querySelector(`[data-node="${CSS.escape(t)}"]`)?.getBoundingClientRect(), i = [];
      for (const t of w.current.edges) {
        const c = o(t.from), m = o(t.to);
        if (!c || !m) continue;
        const N = c.left < m.left, k = (N ? c.right : c.left) - n.left, j = (N ? m.left : m.right) - n.left, R = c.top + c.height / 2 - n.top, S = m.top + m.height / 2 - n.top, C = (k + j) / 2;
        i.push({ key: [t.from, t.to].join(">"), d: ["M", k, R, "C", C, R, C, S, j, S].join(" ") });
      }
      L({ w: e.scrollWidth, h: e.scrollHeight }), I(i);
    }, []);
    a.useEffect(() => {
      const e = new ResizeObserver(() => u());
      g.current && e.observe(g.current);
      let n = 0;
      const o = K(() => {
        cancelAnimationFrame(n), n = requestAnimationFrame(u);
      });
      return () => {
        e.disconnect(), o(), cancelAnimationFrame(n);
      };
    }, [u]), a.useEffect(() => {
      const e = requestAnimationFrame(u);
      return () => cancelAnimationFrame(e);
    }, [s, u]);
    const P = s.columns[0], $ = s.columns[s.columns.length - 1];
    return /* @__PURE__ */ l("div", { ref: B, className: F("zen-w-full zen-overflow-x-auto", M), ...q, children: /* @__PURE__ */ b(
      "div",
      {
        ref: g,
        className: "zen-relative zen-flex zen-w-max zen-min-w-full zen-items-stretch zen-gap-12 zen-p-1",
        role: "group",
        "aria-label": r.t("genealogy.label", { name: h(d) }),
        children: [
          /* @__PURE__ */ l("svg", { className: "zen-pointer-events-none zen-absolute zen-left-0 zen-top-0", width: y.w, height: y.h, "aria-hidden": "true", children: H.map((e) => /* @__PURE__ */ l("path", { d: e.d, fill: "none", stroke: "var(--zen-color-border)", strokeWidth: "1.5" }, e.key)) }),
          s.columns.map((e) => /* @__PURE__ */ b(
            "section",
            {
              className: "zen-relative zen-flex zen-w-48 zen-shrink-0 zen-flex-col zen-gap-2",
              "aria-label": v(e.level),
              children: [
                /* @__PURE__ */ l("h4", { className: "zen-m-0 zen-text-xs zen-font-medium zen-uppercase zen-tracking-wide zen-text-zen-muted-fg", children: v(e.level) }),
                e.level < 0 && e.level === P.level && s.cut.upstream > 0 && /* @__PURE__ */ l("p", { className: "zen-m-0 zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg", children: r.t("genealogy.cutUp", { count: s.cut.upstream }) }),
                /* @__PURE__ */ l("div", { className: "zen-flex zen-flex-1 zen-flex-col zen-justify-center zen-gap-3", children: e.nodes.map((n) => {
                  const o = p.get(n.id), i = n.id === d;
                  return /* @__PURE__ */ b(
                    "button",
                    {
                      type: "button",
                      "data-node": n.id,
                      "aria-current": i ? "true" : void 0,
                      "aria-label": W(n.id),
                      className: F(
                        "zen-relative zen-z-10 zen-flex zen-min-h-12 zen-w-full zen-flex-col zen-items-start zen-gap-0.5 zen-rounded-zen-md zen-border zen-border-solid zen-px-3 zen-py-2 zen-text-start zen-cursor-pointer",
                        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                        i ? "zen-border-2 zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground hover:zen-bg-zen-muted"
                      ),
                      onClick: () => U(n.id),
                      children: [
                        o?.kind && /* @__PURE__ */ l("span", { className: "zen-text-xs zen-opacity-80", children: o.kind }),
                        /* @__PURE__ */ l("span", { className: "zen-font-mono zen-text-sm zen-font-semibold", children: o?.label ?? n.id }),
                        o?.detail && /* @__PURE__ */ l("span", { className: "zen-text-xs", children: o.detail })
                      ]
                    },
                    n.id
                  );
                }) }),
                e.level > 0 && e.level === $.level && s.cut.downstream > 0 && /* @__PURE__ */ l("p", { className: "zen-m-0 zen-text-xs zen-font-medium zen-text-zen-warning-soft-fg", children: r.t("genealogy.cutDown", { count: s.cut.downstream }) })
              ]
            },
            e.level
          ))
        ]
      }
    ) });
  }
);
T.displayName = "GenealogyGraph";
export {
  T as GenealogyGraph
};
//# sourceMappingURL=index147.js.map
