import { jsxs as c, jsx as r } from "react/jsx-runtime";
import * as p from "react";
import { cn as z } from "./index143.js";
import "./index24.js";
import "./index98.js";
import { evaluateFormula as M, formatRef as C, isCellError as B, formatCellValue as T, parseRef as G } from "./index105.js";
const I = ({
  rows: d = 12,
  cols: i = 6,
  cells: o = {},
  onCellsChange: f,
  formats: h = {},
  readOnly: a = !1,
  colWidth: b = "6rem",
  onCellCommit: k,
  className: w
}) => {
  const [K, u] = p.useState(null), [x, y] = p.useState(""), [R, N] = p.useState("A1"), _ = p.useMemo(() => {
    const e = {};
    for (const n of Object.keys(o)) e[n] = M(o[n], o);
    return e;
  }, [o]), j = (e) => {
    const n = e.replace(/[0-9]/g, "");
    return h[e] ?? h[n] ?? {};
  }, g = (e, n) => {
    const l = { ...o };
    n === "" ? delete l[e] : l[e] = /^-?[0-9]*\.?[0-9]+$/.test(n.trim()) ? Number(n) : n, f?.(l), k?.(e, l[e], M(l[e], l)), u(null);
  }, v = (e, n, l) => {
    const s = G(e);
    if (!s) return;
    const t = Math.min(i - 1, Math.max(0, s.col + n)), S = Math.min(d - 1, Math.max(0, s.row + l));
    N(C(t, S));
  }, E = (e, n) => {
    if (K === n) {
      e.key === "Enter" ? (e.preventDefault(), g(n, x), v(n, 0, 1)) : e.key === "Escape" ? (e.preventDefault(), u(null)) : e.key === "Tab" && (e.preventDefault(), g(n, x), v(n, e.shiftKey ? -1 : 1, 0));
      return;
    }
    const s = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0]
    }[e.key];
    s ? (e.preventDefault(), v(n, s[0], s[1])) : e.key === "Tab" ? (e.preventDefault(), v(n, e.shiftKey ? -1 : 1, 0)) : !a && (e.key === "Enter" || e.key === "F2") ? (e.preventDefault(), y(String(o[n] ?? "")), u(n)) : !a && (e.key === "Delete" || e.key === "Backspace") ? (e.preventDefault(), g(n, "")) : !a && e.key.length === 1 && !e.ctrlKey && !e.metaKey && (e.preventDefault(), y(e.key), u(n));
  }, D = "zen-bg-zen-muted zen-text-zen-muted-fg zen-text-xs zen-font-medium zen-text-center zen-sticky";
  return /* @__PURE__ */ r(
    "div",
    {
      className: z(
        "zen-w-full zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
        w
      ),
      children: /* @__PURE__ */ c("table", { className: "zen-table-fixed zen-border-collapse zen-text-sm", children: [
        /* @__PURE__ */ c("colgroup", { children: [
          /* @__PURE__ */ r("col", { style: { width: "2.5rem" } }),
          Array.from({ length: i }, (e, n) => /* @__PURE__ */ r("col", { style: { width: b } }, n))
        ] }),
        /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ c("tr", { children: [
          /* @__PURE__ */ r("th", { scope: "col", className: z(D, "zen-start-0 zen-top-0 zen-z-20 zen-w-10"), children: /* @__PURE__ */ r("span", { className: "zen-sr-only", children: "Row" }) }),
          Array.from({ length: i }, (e, n) => /* @__PURE__ */ r(
            "th",
            {
              scope: "col",
              className: z(D, "zen-top-0 zen-z-10 zen-border zen-border-zen-border zen-px-1 zen-py-1"),
              children: C(n, 0).replace(/[0-9]/g, "")
            },
            n
          ))
        ] }) }),
        /* @__PURE__ */ r("tbody", { children: Array.from({ length: d }, (e, n) => /* @__PURE__ */ c("tr", { children: [
          /* @__PURE__ */ r(
            "th",
            {
              scope: "row",
              className: z(D, "zen-start-0 zen-z-10 zen-border zen-border-zen-border zen-px-1"),
              children: n + 1
            }
          ),
          Array.from({ length: i }, (l, s) => {
            const t = C(s, n), S = K === t, F = R === t, A = _[t], V = B(A);
            return /* @__PURE__ */ r(
              "td",
              {
                className: z(
                  "zen-border zen-border-zen-border zen-p-0",
                  F && "zen-outline zen-outline-2 -zen-outline-offset-2 zen-outline-zen-primary"
                ),
                children: S ? /* @__PURE__ */ r(
                  "input",
                  {
                    autoFocus: !0,
                    value: x,
                    "aria-label": t,
                    onChange: (m) => y(m.target.value),
                    onBlur: () => g(t, x),
                    onKeyDown: (m) => E(m, t),
                    size: 1,
                    className: "zen-block zen-w-full zen-min-w-0 zen-border-0 zen-bg-zen-background zen-px-1 zen-py-0.5 zen-font-mono zen-text-sm focus:zen-outline-none"
                  }
                ) : /* @__PURE__ */ r(
                  "div",
                  {
                    role: "gridcell",
                    tabIndex: F ? 0 : -1,
                    "aria-label": t,
                    "aria-readonly": a || void 0,
                    onFocus: () => N(t),
                    onClick: () => N(t),
                    onDoubleClick: () => {
                      a || (y(String(o[t] ?? "")), u(t));
                    },
                    onKeyDown: (m) => E(m, t),
                    className: z(
                      "zen-min-h-6 zen-cursor-cell zen-truncate zen-px-1 zen-py-0.5 focus:zen-outline-none",
                      /* Numbers right, text left — the alignment IS the
                         type signal in a sheet. */
                      typeof A == "number" ? "zen-text-end zen-tabular-nums" : "zen-text-start",
                      V && "zen-text-zen-error"
                    ),
                    title: typeof o[t] == "string" && String(o[t]).startsWith("=") ? String(o[t]) : void 0,
                    children: T(A, j(t))
                  }
                )
              },
              s
            );
          })
        ] }, n)) })
      ] })
    }
  );
}, H = ({ summary: d, className: i, ...o }) => {
  const [f, h] = p.useState("A1"), a = o.cells?.[f];
  return /* @__PURE__ */ c("div", { className: z("zen-flex zen-w-full zen-flex-col zen-gap-2", i), children: [
    /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-py-1", children: [
      /* @__PURE__ */ r("span", { className: "zen-w-12 zen-shrink-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: f }),
      /* @__PURE__ */ r("span", { className: "zen-min-w-0 zen-flex-1 zen-truncate zen-font-mono zen-text-xs zen-text-zen-foreground", children: a == null ? "" : String(a) }),
      d ? /* @__PURE__ */ r("span", { className: "zen-shrink-0 zen-text-xs", children: d }) : null
    ] }),
    /* @__PURE__ */ r(
      I,
      {
        ...o,
        onCellCommit: (b, k, w) => {
          h(b), o.onCellCommit?.(b, k, w);
        }
      }
    )
  ] });
};
export {
  H as SheetCalculator,
  I as SpreadsheetGrid
};
//# sourceMappingURL=index104.js.map
