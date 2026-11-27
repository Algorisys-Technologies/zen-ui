import { jsxs as c, jsx as r } from "react/jsx-runtime";
import { sheetCellDensityClass as G } from "./index198.js";
import * as p from "react";
import { cn as z } from "./index199.js";
import "./index208.js";
import "./index28.js";
import "./index110.js";
import { evaluateFormula as M, formatRef as A, isCellError as I, formatCellValue as U, parseRef as W } from "./index156.js";
import { useLocale as $ } from "./index90.js";
const q = ({
  rows: d = 12,
  cols: i = 6,
  cells: o = {},
  onCellsChange: f,
  formats: h = {},
  readOnly: a = !1,
  colWidth: b = "6rem",
  onCellCommit: w,
  cellClassName: N,
  density: R,
  className: _
}) => {
  const j = $(), [K, m] = p.useState(null), [x, y] = p.useState(""), [V, D] = p.useState("A1"), B = p.useMemo(() => {
    const e = {};
    for (const n of Object.keys(o)) e[n] = M(o[n], o);
    return e;
  }, [o]), L = (e) => {
    const n = e.replace(/[0-9]/g, "");
    return h[e] ?? h[n] ?? {};
  }, g = (e, n) => {
    const l = { ...o };
    n === "" ? delete l[e] : l[e] = /^-?[0-9]*\.?[0-9]+$/.test(n.trim()) ? Number(n) : n, f?.(l), w?.(e, l[e], M(l[e], l)), m(null);
  }, v = (e, n, l) => {
    const s = W(e);
    if (!s) return;
    const t = Math.min(i - 1, Math.max(0, s.col + n)), C = Math.min(d - 1, Math.max(0, s.row + l));
    D(A(t, C));
  }, E = (e, n) => {
    if (K === n) {
      e.key === "Enter" ? (e.preventDefault(), g(n, x), v(n, 0, 1)) : e.key === "Escape" ? (e.preventDefault(), m(null)) : e.key === "Tab" && (e.preventDefault(), g(n, x), v(n, e.shiftKey ? -1 : 1, 0));
      return;
    }
    const s = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0]
    }[e.key];
    s ? (e.preventDefault(), v(n, s[0], s[1])) : e.key === "Tab" ? (e.preventDefault(), v(n, e.shiftKey ? -1 : 1, 0)) : !a && (e.key === "Enter" || e.key === "F2") ? (e.preventDefault(), y(String(o[n] ?? "")), m(n)) : !a && (e.key === "Delete" || e.key === "Backspace") ? (e.preventDefault(), g(n, "")) : !a && e.key.length === 1 && !e.ctrlKey && !e.metaKey && (e.preventDefault(), y(e.key), m(n));
  }, S = "zen-bg-zen-muted zen-text-zen-muted-fg zen-text-xs zen-font-medium zen-text-center zen-sticky";
  return /* @__PURE__ */ r(
    "div",
    {
      className: z(
        "zen-w-full zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
        _
      ),
      children: /* @__PURE__ */ c("table", { className: "zen-table-fixed zen-border-collapse zen-text-sm", children: [
        /* @__PURE__ */ c("colgroup", { children: [
          /* @__PURE__ */ r("col", { style: { width: "2.5rem" } }),
          Array.from({ length: i }, (e, n) => /* @__PURE__ */ r("col", { style: { width: b } }, n))
        ] }),
        /* @__PURE__ */ r("thead", { children: /* @__PURE__ */ c("tr", { children: [
          /* @__PURE__ */ r("th", { scope: "col", className: z(S, "zen-start-0 zen-top-0 zen-z-20 zen-w-10"), children: /* @__PURE__ */ r("span", { className: "zen-sr-only", children: j.t("spreadsheet.row") }) }),
          Array.from({ length: i }, (e, n) => /* @__PURE__ */ r(
            "th",
            {
              scope: "col",
              className: z(S, "zen-top-0 zen-z-10 zen-border zen-border-zen-border zen-px-1 zen-py-1"),
              children: A(n, 0).replace(/[0-9]/g, "")
            },
            n
          ))
        ] }) }),
        /* @__PURE__ */ r("tbody", { children: Array.from({ length: d }, (e, n) => /* @__PURE__ */ c("tr", { children: [
          /* @__PURE__ */ r(
            "th",
            {
              scope: "row",
              className: z(S, "zen-start-0 zen-z-10 zen-border zen-border-zen-border zen-px-1"),
              children: n + 1
            }
          ),
          Array.from({ length: i }, (l, s) => {
            const t = A(s, n), C = K === t, F = V === t, k = B[t], T = I(k);
            return /* @__PURE__ */ r(
              "td",
              {
                className: z(
                  "zen-border zen-border-zen-border zen-p-0",
                  F && "zen-outline zen-outline-2 -zen-outline-offset-2 zen-outline-zen-primary"
                ),
                children: C ? /* @__PURE__ */ r(
                  "input",
                  {
                    autoFocus: !0,
                    value: x,
                    "aria-label": t,
                    onChange: (u) => y(u.target.value),
                    onBlur: () => g(t, x),
                    onKeyDown: (u) => E(u, t),
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
                    onFocus: () => D(t),
                    onClick: () => D(t),
                    onDoubleClick: () => {
                      a || (y(String(o[t] ?? "")), m(t));
                    },
                    onKeyDown: (u) => E(u, t),
                    className: z(
                      "zen-min-h-6 zen-cursor-cell zen-truncate zen-px-1 zen-py-0.5 focus:zen-outline-none",
                      /* Numbers right, text left — the alignment IS the
                         type signal in a sheet. */
                      typeof k == "number" ? "zen-text-end zen-tabular-nums" : "zen-text-start",
                      T && "zen-text-zen-error",
                      G[R ?? "comfortable"],
                      N?.(t, k)
                    ),
                    title: typeof o[t] == "string" && String(o[t]).startsWith("=") ? String(o[t]) : void 0,
                    children: U(k, L(t))
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
}, ee = ({ summary: d, className: i, ...o }) => {
  const [f, h] = p.useState("A1"), a = o.cells?.[f];
  return /* @__PURE__ */ c("div", { className: z("zen-flex zen-w-full zen-flex-col zen-gap-2", i), children: [
    /* @__PURE__ */ c("div", { className: "zen-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-px-2 zen-py-1", children: [
      /* @__PURE__ */ r("span", { className: "zen-w-12 zen-shrink-0 zen-text-xs zen-font-medium zen-text-zen-muted-fg", children: f }),
      /* @__PURE__ */ r("span", { className: "zen-min-w-0 zen-flex-1 zen-truncate zen-font-mono zen-text-xs zen-text-zen-foreground", children: a == null ? "" : String(a) }),
      d ? /* @__PURE__ */ r("span", { className: "zen-shrink-0 zen-text-xs", children: d }) : null
    ] }),
    /* @__PURE__ */ r(
      q,
      {
        ...o,
        onCellCommit: (b, w, N) => {
          h(b), o.onCellCommit?.(b, w, N);
        }
      }
    )
  ] });
};
export {
  ee as SheetCalculator,
  q as SpreadsheetGrid
};
//# sourceMappingURL=index155.js.map
