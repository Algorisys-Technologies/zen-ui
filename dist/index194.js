import { jsx as t, jsxs as h } from "react/jsx-runtime";
import * as p from "react";
import { useVirtualizer as D } from "./index244.js";
import { useLocale as H } from "./index90.js";
import { cn as o } from "./index199.js";
const N = "zen-rounded-zen-sm zen-bg-zen-muted-fg motion-safe:zen-animate-pulse", ee = "zen-sticky zen-z-30 zen-box-border zen-border-e zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]", ne = "zen-sticky zen-z-20 zen-border-e zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]", te = ({
  layout: V,
  totalRows: G,
  totalCols: b,
  rowHeaderDepth: c,
  colHeaderDepth: P,
  getCell: Y,
  getRowHeader: q,
  getColHeader: F,
  rowHeight: x = 25,
  colWidth: a = 200,
  rowHeaderWidth: l = 160,
  label: J,
  onVisibleRangeChange: T,
  totals: i,
  className: Q,
  style: U,
  height: y,
  headerClassName: g,
  rowHeaderClassName: X,
  stickyHeader: Z = !0,
  stickyRowHeaders: C = !0
}) => {
  const w = H(), k = p.useRef(null), [A, W] = p.useState(0), [O, K] = p.useState(0);
  p.useEffect(() => {
    const e = k.current;
    if (!e) return;
    const n = new ResizeObserver((z) => K(z[0]?.contentRect.width ?? e.clientWidth));
    return n.observe(e), K(e.clientWidth), () => n.disconnect();
  }, []);
  const d = D({
    count: G,
    getScrollElement: () => k.current,
    estimateSize: () => x,
    overscan: 6
  }), $ = c * l, r = p.useMemo(() => {
    if (b <= 0) return { minIndex: 0, maxIndex: -1, items: [], padLeft: 0, padRight: 0 };
    const e = Math.abs(A), n = Math.max(0, Math.floor((e - $) / a) - 4), z = Math.min(b - 1, Math.ceil((e + O - $) / a) + 4), s = Math.max(n, z), m = [];
    for (let E = n; E <= s; E++) m.push(E);
    return {
      minIndex: n,
      maxIndex: s,
      items: m,
      padLeft: n * a,
      padRight: Math.max(0, (b - s - 1) * a)
    };
  }, [b, A, O, $, a]), j = p.useRef(T);
  j.current = T;
  const f = d.getVirtualItems();
  p.useEffect(() => {
    f.length && j.current?.({
      rowStart: f[0].index,
      rowEnd: f[f.length - 1].index,
      colStart: r.minIndex,
      colEnd: r.maxIndex
    });
  }, [f, r.minIndex, r.maxIndex]);
  const S = Array.from({ length: Math.max(P, 1) }, (e, n) => n), u = {
    height: `${x}px`,
    minHeight: `${x}px`,
    maxHeight: `${x}px`
  }, B = (e) => C ? { insetInlineStart: `${e * l}px` } : {}, L = i?.row ? Math.max(1, i.columns ?? 1) : 0, _ = Array.from({ length: L }, (e, n) => n), I = (e) => ({
    insetInlineEnd: `${(L - 1 - e) * a}px`,
    width: `${a}px`,
    minWidth: `${a}px`,
    maxWidth: `${a}px`
  }), R = (e) => e?.isLoading ? /* @__PURE__ */ t("div", { className: o("zen-ml-auto zen-h-3 zen-w-10", N) }) : e?.value ?? "-", M = (e) => Z ? { position: "sticky", top: `${e * x}px` } : {}, v = (e) => e % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";
  return /* @__PURE__ */ t(
    "div",
    {
      className: o("zen-flex zen-h-full zen-w-full zen-min-h-0 zen-min-w-0 zen-flex-col zen-gap-2", Q),
      style: { ...y !== void 0 ? { height: typeof y == "number" ? `${y}px` : y } : {}, ...U },
      children: /* @__PURE__ */ t(
        "div",
        {
          ref: k,
          className: "zen-min-h-0 zen-w-full zen-min-w-0 zen-flex-1 zen-overflow-auto zen-overscroll-contain zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background",
          role: "region",
          "aria-label": J ?? w.t("pivot.grid"),
          tabIndex: 0,
          onScroll: (e) => W(e.currentTarget.scrollLeft),
          children: /* @__PURE__ */ h(
            "table",
            {
              className: "zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground",
              style: { borderCollapse: "separate", width: `${$ + (b + L) * a}px` },
              children: [
                /* @__PURE__ */ t("thead", { className: "zen-bg-zen-muted", children: S.map((e) => /* @__PURE__ */ h("tr", { children: [
                  c > 0 ? Array.from({ length: c }, (n, z) => /* @__PURE__ */ t(
                    "th",
                    {
                      scope: "col",
                      className: o(
                        ee,
                        "zen-px-2 zen-py-1 zen-text-start zen-align-bottom zen-text-sm zen-font-medium zen-capitalize zen-text-zen-muted-fg",
                        g
                      ),
                      style: {
                        ...B(z),
                        ...M(e),
                        ...u,
                        width: `${l}px`,
                        minWidth: `${l}px`,
                        maxWidth: `${l}px`
                      },
                      children: e === S.length - 1 ? /* @__PURE__ */ t("span", { className: "zen-mt-auto zen-block", title: V.rows[z]?.replace(/_/g, " ") || "", children: V.rows[z]?.replace(/_/g, " ") || "" }) : null
                    },
                    z
                  )) : null,
                  r.padLeft > 0 ? /* @__PURE__ */ t(
                    "th",
                    {
                      "aria-hidden": !0,
                      className: o("zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0", g),
                      style: { ...M(e), ...u, width: `${r.padLeft}px`, minWidth: `${r.padLeft}px` }
                    }
                  ) : null,
                  r.items.map((n) => {
                    const z = F(e, n);
                    if (z?.isVisible === !1) return null;
                    const s = z?.colSpan || 1;
                    return /* @__PURE__ */ t(
                      "th",
                      {
                        scope: "col",
                        colSpan: s,
                        className: o(
                          "zen-sticky zen-z-10 zen-truncate zen-border-b zen-border-r zen-border-zen-border zen-bg-zen-background zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-text-zen-foreground",
                          g
                        ),
                        style: {
                          width: `${a * s}px`,
                          minWidth: `${a * s}px`,
                          maxWidth: `${a * s}px`,
                          ...u,
                          ...M(e)
                        },
                        children: z?.isLoading ? /* @__PURE__ */ t("div", { className: o("zen-h-3 zen-w-full", N) }) : z?.value || ""
                      },
                      n
                    );
                  }),
                  r.padRight > 0 ? /* @__PURE__ */ t(
                    "th",
                    {
                      "aria-hidden": !0,
                      className: o("zen-border-0 zen-bg-zen-muted zen-p-0", g),
                      style: { width: `${r.padRight}px`, minWidth: `${r.padRight}px` }
                    }
                  ) : null,
                  e === 0 ? _.map((n) => /* @__PURE__ */ t(
                    "th",
                    {
                      scope: "col",
                      "data-pivot-total": "column",
                      rowSpan: S.length,
                      className: o(
                        "zen-sticky zen-top-0 zen-z-30 zen-truncate zen-border-b zen-border-s zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-end zen-align-bottom zen-text-xs zen-font-semibold zen-text-zen-foreground",
                        g
                      ),
                      style: I(n),
                      children: i?.columnHeader?.(n) ?? w.t("pivot.total")
                    },
                    `total-${n}`
                  )) : null
                ] }, e)) }),
                /* @__PURE__ */ h("tbody", { children: [
                  d.getVirtualItems().length > 0 && d.getVirtualItems()[0].start > 0 ? /* @__PURE__ */ t("tr", { "aria-hidden": !0, children: /* @__PURE__ */ t("td", { style: { height: `${d.getVirtualItems()[0].start}px` }, className: "zen-border-0 zen-p-0" }) }) : null,
                  d.getVirtualItems().map((e) => {
                    const n = e.index;
                    return /* @__PURE__ */ h("tr", { className: "zen-border-b zen-border-zen-border", children: [
                      c > 0 ? Array.from({ length: c }, (z, s) => {
                        const m = q(n, s);
                        return m?.isVisible === !1 ? null : /* @__PURE__ */ t(
                          "th",
                          {
                            scope: "row",
                            rowSpan: m?.rowSpan || 1,
                            className: o(
                              ne,
                              "zen-break-words zen-bg-zen-background zen-px-2 zen-py-1 zen-text-start zen-align-top zen-text-xs zen-font-medium zen-leading-tight zen-text-zen-foreground",
                              n > 0 ? "zen-border-t zen-border-zen-border" : "zen-border-t-0",
                              X
                            ),
                            style: {
                              ...B(s),
                              width: `${l}px`,
                              minWidth: `${l}px`,
                              maxWidth: `${l}px`
                            },
                            children: m?.isLoading ? /* @__PURE__ */ t("div", { className: o("zen-h-3 zen-w-1/2", N) }) : /* @__PURE__ */ t("span", { className: "zen-block", title: m?.value, children: m?.value || "" })
                          },
                          s
                        );
                      }) : null,
                      r.padLeft > 0 ? /* @__PURE__ */ t("td", { "aria-hidden": !0, className: o("zen-border-0 zen-p-0", v(n)), style: { width: `${r.padLeft}px` } }) : null,
                      r.items.map((z) => {
                        const s = Y(n, z);
                        return /* @__PURE__ */ t(
                          "td",
                          {
                            className: o(
                              "zen-truncate zen-border-b zen-border-r zen-border-zen-border zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-tabular-nums",
                              v(n)
                            ),
                            style: { width: `${a}px`, minWidth: `${a}px`, maxWidth: `${a}px` },
                            children: s?.isLoading ? /* @__PURE__ */ t("div", { className: o("zen-ml-auto zen-h-3 zen-w-10", N) }) : s?.value ?? "-"
                          },
                          z
                        );
                      }),
                      r.padRight > 0 ? /* @__PURE__ */ t("td", { "aria-hidden": !0, className: o("zen-border-0 zen-p-0", v(n)), style: { width: `${r.padRight}px` } }) : null,
                      _.map((z) => /* @__PURE__ */ t(
                        "td",
                        {
                          "data-pivot-total": "row",
                          className: o(
                            "zen-sticky zen-z-20 zen-truncate zen-border-b zen-border-s zen-border-zen-border zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-font-semibold zen-tabular-nums",
                            v(n)
                          ),
                          style: I(z),
                          children: R(i?.row?.(n, z) ?? null)
                        },
                        `total-${z}`
                      ))
                    ] }, e.key);
                  }),
                  (() => {
                    const e = d.getVirtualItems(), n = e.length ? d.getTotalSize() - e[e.length - 1].end : d.getTotalSize();
                    return n > 0 ? /* @__PURE__ */ t("tr", { "aria-hidden": !0, children: /* @__PURE__ */ t("td", { style: { height: `${n}px` }, className: "zen-border-0 zen-p-0" }) }) : null;
                  })()
                ] }),
                i?.column ? /* @__PURE__ */ t("tfoot", { children: /* @__PURE__ */ h("tr", { "data-pivot-total": "totals-row", children: [
                  c > 0 ? /* @__PURE__ */ t(
                    "th",
                    {
                      scope: "row",
                      colSpan: c,
                      className: "zen-sticky zen-bottom-0 zen-z-30 zen-border-t zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-semibold zen-text-zen-foreground",
                      style: { insetInlineStart: "0px", ...u },
                      children: i.label ?? w.t("pivot.total")
                    }
                  ) : null,
                  r.padLeft > 0 ? /* @__PURE__ */ t("td", { "aria-hidden": !0, className: "zen-sticky zen-bottom-0 zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0", style: { width: `${r.padLeft}px` } }) : null,
                  r.items.map((e) => /* @__PURE__ */ t(
                    "td",
                    {
                      className: "zen-sticky zen-bottom-0 zen-z-10 zen-truncate zen-border-t zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-font-semibold zen-tabular-nums",
                      style: { width: `${a}px`, minWidth: `${a}px`, maxWidth: `${a}px`, ...u },
                      children: R(i.column?.(e) ?? null)
                    },
                    e
                  )),
                  r.padRight > 0 ? /* @__PURE__ */ t("td", { "aria-hidden": !0, className: "zen-sticky zen-bottom-0 zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0", style: { width: `${r.padRight}px` } }) : null,
                  _.map((e) => /* @__PURE__ */ t(
                    "td",
                    {
                      "data-pivot-total": "grand",
                      className: "zen-sticky zen-bottom-0 zen-z-30 zen-truncate zen-border-t zen-border-s zen-border-zen-border zen-bg-zen-muted zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-font-semibold zen-tabular-nums",
                      style: { ...I(e), ...u },
                      children: R(i.grand?.(e) ?? null)
                    },
                    `grand-${e}`
                  ))
                ] }) }) : null
              ]
            }
          )
        }
      )
    }
  );
};
te.displayName = "PivotGrid";
export {
  te as PivotGrid
};
//# sourceMappingURL=index194.js.map
