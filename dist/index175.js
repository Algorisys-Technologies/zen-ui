import { jsxs as T, jsx as i, Fragment as se } from "react/jsx-runtime";
import * as o from "react";
import { createPortal as ae } from "react-dom";
import { pathTo as le, isSelectable as D, filterTree as ce, visibleRows as de, treeKeyTarget as ue } from "./index256.js";
import { useAnchoredPlacement as fe } from "./index257.js";
import { Icon as K } from "./index63.js";
import { useLocale as ze } from "./index90.js";
import { cn as j } from "./index197.js";
function q(l, u, N) {
  const f = ce(l, u);
  return { filtered: f, rows: de(f.items, /* @__PURE__ */ new Set([...N, ...f.expand])) };
}
const pe = o.forwardRef(
  ({
    items: l,
    value: u,
    defaultValue: N,
    onValueChange: f,
    placeholder: E,
    leavesOnly: x = !1,
    showPath: J,
    pathSeparator: V,
    defaultExpanded: X,
    emptyMessage: Y,
    invalid: P,
    disabled: z,
    width: I,
    id: Z,
    "aria-label": F,
    "aria-labelledby": _,
    className: O
  }, ee) => {
    const L = ze(), v = o.useId(), ne = Z ?? `${v}-input`, Q = (e) => `${v}-${e}`, [te, re] = o.useState(N ?? null), p = u !== void 0 ? u : te, [r, y] = o.useState(!1), [m, b] = o.useState(""), [h, U] = o.useState(() => new Set(X ?? [])), [s, g] = o.useState(0), M = o.useRef(null), A = o.useRef(null), k = o.useRef(null);
    o.useImperativeHandle(ee, () => A.current);
    const d = o.useMemo(() => p ? le(l, p) ?? [] : [], [l, p]), W = d.length ? J ? d.map((e) => e.label).join(V ?? " › ") : d[d.length - 1].label : "", { rows: c } = o.useMemo(() => q(l, m, h), [l, m, h]), w = () => {
      if (z || r) return;
      let e = h;
      d.length > 1 && (e = /* @__PURE__ */ new Set([...h, ...d.slice(0, -1).map((n) => n.id)]), U(e)), b(""), y(!0);
      const t = q(l, "", e).rows.findIndex((n) => n.node.id === p);
      g(t >= 0 ? t : 0);
    }, C = () => {
      y(!1), b("");
    }, B = (e) => {
      D(e, x) && (u === void 0 && re(e.id), f?.(e.id, e), C());
    }, S = (e) => U((t) => {
      const n = new Set(t);
      return n.has(e) ? n.delete(e) : n.add(e), n;
    });
    o.useEffect(() => {
      s > c.length - 1 && g(Math.max(0, c.length - 1));
    }, [c.length, s]);
    const $ = fe({ anchor: M, popup: k, open: r, maxHeight: 288, matchWidth: !0 }), H = o.useRef(!1);
    o.useLayoutEffect(() => {
      const e = k.current;
      if (!r || !e) return;
      if (H.current) {
        H.current = !1;
        return;
      }
      const t = e.querySelector(`[data-index="${s}"]`);
      if (!t) return;
      const n = t.offsetTop, a = n + t.offsetHeight;
      n < e.scrollTop ? e.scrollTop = n : a > e.scrollTop + e.clientHeight && (e.scrollTop = a - e.clientHeight);
    }, [r, s, $.style]), o.useEffect(() => {
      if (!r) return;
      const e = (t) => {
        const n = t.target;
        !M.current?.contains(n) && !k.current?.contains(n) && (y(!1), b(""));
      };
      return document.addEventListener("pointerdown", e, !0), () => document.removeEventListener("pointerdown", e, !0);
    }, [r]);
    const oe = (e) => {
      if (z) return;
      if (!r) {
        e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" && !e.nativeEvent.isComposing ? (e.preventDefault(), w()) : e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && w();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault(), C();
        return;
      }
      if (e.key === "Tab") {
        C();
        return;
      }
      const t = c[s];
      if (e.key === "Enter") {
        if (e.preventDefault(), !t) return;
        D(t.node, x) ? B(t.node) : t.hasChildren && S(t.node.id);
        return;
      }
      if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && m) return;
      const n = ue(e.key, c, s);
      n && (e.preventDefault(), n.kind === "move" ? g(n.index) : S(n.id));
    }, ie = (e) => {
      const t = m.trim();
      if (!t) return e;
      const n = e.toLocaleLowerCase().indexOf(t.toLocaleLowerCase());
      return n < 0 ? e : /* @__PURE__ */ T(se, { children: [
        e.slice(0, n),
        /* @__PURE__ */ i("mark", { className: "zen-bg-transparent zen-font-semibold zen-text-inherit", children: e.slice(n, n + t.length) }),
        e.slice(n + t.length)
      ] });
    }, G = c[s];
    return /* @__PURE__ */ T(
      "div",
      {
        ref: M,
        className: j("zen-relative", O),
        style: { width: typeof I == "number" ? `${I}px` : I ?? "100%" },
        children: [
          /* @__PURE__ */ T(
            "div",
            {
              className: j(
                "zen-flex zen-h-zen-control zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x",
                "focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
                P && "zen-border-zen-error",
                z && "zen-cursor-not-allowed zen-opacity-50"
              ),
              children: [
                /* @__PURE__ */ i(
                  "input",
                  {
                    ref: A,
                    id: ne,
                    type: "text",
                    role: "combobox",
                    "aria-haspopup": "tree",
                    "aria-expanded": r,
                    "aria-controls": r ? v : void 0,
                    "aria-activedescendant": r && G ? Q(G.node.id) : void 0,
                    "aria-autocomplete": "list",
                    "aria-invalid": P ? "true" : void 0,
                    "aria-label": F,
                    "aria-labelledby": _,
                    disabled: z,
                    autoComplete: "off",
                    spellCheck: !1,
                    value: r ? m : W,
                    placeholder: r && W || E,
                    onChange: (e) => {
                      const t = e.currentTarget.value;
                      b(t), r || y(!0);
                      const n = q(l, t, h), a = n.rows.findIndex((R) => n.filtered.matches.has(R.node.id) && D(R.node, x));
                      g(a >= 0 ? a : 0);
                    },
                    onClick: () => w(),
                    onKeyDown: oe,
                    className: "zen-min-w-0 zen-flex-1 zen-border-0 zen-bg-transparent zen-text-sm zen-text-zen-foreground zen-outline-none placeholder:zen-text-zen-muted-fg"
                  }
                ),
                /* @__PURE__ */ i(
                  "button",
                  {
                    type: "button",
                    tabIndex: -1,
                    "aria-label": r ? L.t("common.close") : L.t("common.open"),
                    disabled: z,
                    onMouseDown: (e) => e.preventDefault(),
                    onClick: () => {
                      r ? C() : (w(), A.current?.focus());
                    },
                    className: "zen-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-border-0 zen-bg-transparent zen-p-0 zen-text-zen-muted-fg",
                    children: /* @__PURE__ */ i(K, { name: r ? "chevron-up" : "chevron-down", size: 16 })
                  }
                )
              ]
            }
          ),
          r && ae(
            /* @__PURE__ */ i(
              "div",
              {
                ref: k,
                dir: $.dir,
                style: $.style,
                id: v,
                role: "tree",
                "aria-label": F ?? E,
                onMouseDown: (e) => e.preventDefault(),
                className: "zen-z-50 zen-overflow-y-auto zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-bg-zen-background zen-p-1 zen-shadow-md",
                children: c.length === 0 ? /* @__PURE__ */ i("div", { className: "zen-px-2 zen-py-1.5 zen-text-sm zen-text-zen-muted-fg", children: Y ?? L.t("treeSelect.noMatches") }) : c.map((e, t) => {
                  const n = D(e.node, x), a = p === e.node.id;
                  return /* @__PURE__ */ T(
                    "div",
                    {
                      id: Q(e.node.id),
                      role: "treeitem",
                      "data-index": t,
                      "aria-level": e.level,
                      "aria-posinset": e.posInSet,
                      "aria-setsize": e.setSize,
                      "aria-expanded": e.hasChildren ? e.expanded : void 0,
                      "aria-selected": a,
                      "aria-disabled": e.node.disabled || void 0,
                      onMouseMove: () => {
                        s !== t && (H.current = !0, g(t));
                      },
                      onClick: () => n ? B(e.node) : e.hasChildren && S(e.node.id),
                      className: j(
                        "zen-flex zen-cursor-default zen-select-none zen-items-center zen-gap-1 zen-rounded-zen-sm zen-py-zen-menu-y zen-pe-2 zen-text-sm",
                        t === s && "zen-bg-zen-muted",
                        a && "zen-font-medium zen-text-zen-primary",
                        !n && !e.hasChildren && "zen-opacity-50",
                        !n && e.hasChildren && "zen-text-zen-muted-fg"
                      ),
                      style: { paddingInlineStart: `calc(${e.level - 1} * var(--zen-space-4) + var(--zen-space-1))` },
                      children: [
                        /* @__PURE__ */ i(
                          "span",
                          {
                            "aria-hidden": "true",
                            className: "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center",
                            onClick: (R) => {
                              e.hasChildren && (R.stopPropagation(), S(e.node.id));
                            },
                            children: e.hasChildren ? /* @__PURE__ */ i(K, { name: e.expanded ? "chevron-down" : "chevron-right", size: 14 }) : null
                          }
                        ),
                        /* @__PURE__ */ i("span", { className: "zen-min-w-0 zen-flex-1 zen-truncate", children: ie(e.node.label) }),
                        a ? /* @__PURE__ */ i(K, { name: "check", size: 14 }) : null
                      ]
                    },
                    e.node.id
                  );
                })
              }
            ),
            document.body
          )
        ]
      }
    );
  }
);
pe.displayName = "TreeSelect";
export {
  pe as TreeSelect
};
//# sourceMappingURL=index175.js.map
