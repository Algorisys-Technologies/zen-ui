import { jsx as t, jsxs as h } from "react/jsx-runtime";
import * as c from "react";
import { useVirtualizer as j } from "./index176.js";
import { cn as d } from "./index143.js";
const v = "zen-rounded-zen-sm zen-bg-zen-muted-fg/25 motion-safe:zen-animate-pulse", B = "zen-sticky zen-z-30 zen-box-border zen-border-r zen-border-zen-border zen-bg-zen-muted zen-shadow-[1px_0_0_0_var(--zen-border)]", G = "zen-sticky zen-z-20 zen-border-r zen-border-zen-border zen-shadow-[1px_0_0_0_var(--zen-border)]", Y = ({
  layout: S,
  totalRows: V,
  totalCols: m,
  rowHeaderDepth: u,
  colHeaderDepth: E,
  getCell: T,
  getRowHeader: A,
  getColHeader: O,
  rowHeight: p = 25,
  colWidth: i = 200,
  rowHeaderWidth: z = 160,
  label: K,
  onVisibleRangeChange: L
}) => {
  const f = c.useRef(null), [_, P] = c.useState(0), [k, w] = c.useState(0);
  c.useEffect(() => {
    const e = f.current;
    if (!e) return;
    const n = new ResizeObserver((r) => w(r[0]?.contentRect.width ?? e.clientWidth));
    return n.observe(e), w(e.clientWidth), () => n.disconnect();
  }, []);
  const l = j({
    count: V,
    getScrollElement: () => f.current,
    estimateSize: () => p,
    overscan: 6
  }), b = u * z, s = c.useMemo(() => {
    if (m <= 0) return { minIndex: 0, maxIndex: -1, items: [], padLeft: 0, padRight: 0 };
    const e = Math.max(0, _), n = Math.max(0, Math.floor((e - b) / i) - 4), r = Math.min(m - 1, Math.ceil((e + k - b) / i) + 4), a = Math.max(n, r), o = [];
    for (let N = n; N <= a; N++) o.push(N);
    return {
      minIndex: n,
      maxIndex: a,
      items: o,
      padLeft: n * i,
      padRight: Math.max(0, (m - a - 1) * i)
    };
  }, [m, _, k, b, i]), I = c.useRef(L);
  I.current = L;
  const x = l.getVirtualItems();
  c.useEffect(() => {
    x.length && I.current?.({
      rowStart: x[0].index,
      rowEnd: x[x.length - 1].index,
      colStart: s.minIndex,
      colEnd: s.maxIndex
    });
  }, [x, s.minIndex, s.maxIndex]);
  const R = Array.from({ length: Math.max(E, 1) }, (e, n) => n), g = {
    height: `${p}px`,
    minHeight: `${p}px`,
    maxHeight: `${p}px`
  }, M = (e) => ({ left: `${e * z}px` }), y = (e) => ({ position: "sticky", top: `${e * p}px` }), $ = (e) => e % 2 === 1 ? "zen-bg-zen-muted" : "zen-bg-zen-background";
  return /* @__PURE__ */ t("div", { className: "zen-flex zen-h-full zen-w-full zen-min-h-0 zen-min-w-0 zen-flex-col zen-gap-2", children: /* @__PURE__ */ t(
    "div",
    {
      ref: f,
      className: "zen-min-h-0 zen-w-full zen-min-w-0 zen-flex-1 zen-overflow-auto zen-overscroll-contain zen-border-l zen-border-t zen-border-zen-border zen-bg-zen-background",
      role: "region",
      "aria-label": K ?? "Pivot grid",
      tabIndex: 0,
      onScroll: (e) => P(e.currentTarget.scrollLeft),
      children: /* @__PURE__ */ h(
        "table",
        {
          className: "zen-w-max zen-min-w-full zen-shrink-0 zen-border-separate zen-border-spacing-0 zen-text-zen-foreground",
          style: { borderCollapse: "separate", width: `${b + m * i}px` },
          children: [
            /* @__PURE__ */ t("thead", { className: "zen-bg-zen-muted", children: R.map((e) => /* @__PURE__ */ h("tr", { children: [
              u > 0 ? Array.from({ length: u }, (n, r) => /* @__PURE__ */ t(
                "th",
                {
                  scope: "col",
                  className: d(
                    B,
                    "zen-px-2 zen-py-1 zen-text-start zen-align-bottom zen-text-sm zen-font-medium zen-capitalize zen-text-zen-muted-fg"
                  ),
                  style: {
                    ...M(r),
                    ...y(e),
                    ...g,
                    width: `${z}px`,
                    minWidth: `${z}px`,
                    maxWidth: `${z}px`
                  },
                  children: e === R.length - 1 ? /* @__PURE__ */ t("span", { className: "zen-mt-auto zen-block", title: S.rows[r]?.replace(/_/g, " ") || "", children: S.rows[r]?.replace(/_/g, " ") || "" }) : null
                },
                r
              )) : null,
              s.padLeft > 0 ? /* @__PURE__ */ t(
                "th",
                {
                  "aria-hidden": !0,
                  className: "zen-sticky zen-z-10 zen-border-0 zen-bg-zen-muted zen-p-0",
                  style: { ...y(e), ...g, width: `${s.padLeft}px`, minWidth: `${s.padLeft}px` }
                }
              ) : null,
              s.items.map((n) => {
                const r = O(e, n);
                if (r?.isVisible === !1) return null;
                const a = r?.colSpan || 1;
                return /* @__PURE__ */ t(
                  "th",
                  {
                    scope: "col",
                    colSpan: a,
                    className: "zen-sticky zen-z-10 zen-truncate zen-border-b zen-border-r zen-border-zen-border/50 zen-bg-zen-background zen-px-2 zen-py-1 zen-text-start zen-text-xs zen-font-medium zen-text-zen-foreground",
                    style: {
                      width: `${i * a}px`,
                      minWidth: `${i * a}px`,
                      maxWidth: `${i * a}px`,
                      ...g,
                      ...y(e)
                    },
                    children: r?.isLoading ? /* @__PURE__ */ t("div", { className: d("zen-h-3 zen-w-full", v) }) : r?.value || ""
                  },
                  n
                );
              }),
              s.padRight > 0 ? /* @__PURE__ */ t(
                "th",
                {
                  "aria-hidden": !0,
                  className: "zen-border-0 zen-bg-zen-muted zen-p-0",
                  style: { width: `${s.padRight}px`, minWidth: `${s.padRight}px` }
                }
              ) : null
            ] }, e)) }),
            /* @__PURE__ */ h("tbody", { children: [
              l.getVirtualItems().length > 0 && l.getVirtualItems()[0].start > 0 ? /* @__PURE__ */ t("tr", { "aria-hidden": !0, children: /* @__PURE__ */ t("td", { style: { height: `${l.getVirtualItems()[0].start}px` }, className: "zen-border-0 zen-p-0" }) }) : null,
              l.getVirtualItems().map((e) => {
                const n = e.index;
                return /* @__PURE__ */ h("tr", { className: "zen-border-b zen-border-zen-border/60", children: [
                  u > 0 ? Array.from({ length: u }, (r, a) => {
                    const o = A(n, a);
                    return o?.isVisible === !1 ? null : /* @__PURE__ */ t(
                      "th",
                      {
                        scope: "row",
                        rowSpan: o?.rowSpan || 1,
                        className: d(
                          G,
                          "zen-break-words zen-bg-zen-background zen-px-2 zen-py-1 zen-text-start zen-align-top zen-text-xs zen-font-medium zen-leading-tight zen-text-zen-foreground",
                          n > 0 ? "zen-border-t zen-border-zen-border/50" : "zen-border-t-0"
                        ),
                        style: {
                          ...M(a),
                          width: `${z}px`,
                          minWidth: `${z}px`,
                          maxWidth: `${z}px`
                        },
                        children: o?.isLoading ? /* @__PURE__ */ t("div", { className: d("zen-h-3 zen-w-1/2", v) }) : /* @__PURE__ */ t("span", { className: "zen-block", title: o?.value, children: o?.value || "" })
                      },
                      a
                    );
                  }) : null,
                  s.padLeft > 0 ? /* @__PURE__ */ t("td", { "aria-hidden": !0, className: d("zen-border-0 zen-p-0", $(n)), style: { width: `${s.padLeft}px` } }) : null,
                  s.items.map((r) => {
                    const a = T(n, r);
                    return /* @__PURE__ */ t(
                      "td",
                      {
                        className: d(
                          "zen-truncate zen-border-b zen-border-r zen-border-zen-border/50 zen-px-2 zen-py-1 zen-text-end zen-text-sm zen-tabular-nums",
                          $(n)
                        ),
                        style: { width: `${i}px`, minWidth: `${i}px`, maxWidth: `${i}px` },
                        children: a?.isLoading ? /* @__PURE__ */ t("div", { className: d("zen-ml-auto zen-h-3 zen-w-10", v) }) : a?.value ?? "-"
                      },
                      r
                    );
                  }),
                  s.padRight > 0 ? /* @__PURE__ */ t("td", { "aria-hidden": !0, className: d("zen-border-0 zen-p-0", $(n)), style: { width: `${s.padRight}px` } }) : null
                ] }, e.key);
              }),
              (() => {
                const e = l.getVirtualItems(), n = e.length ? l.getTotalSize() - e[e.length - 1].end : l.getTotalSize();
                return n > 0 ? /* @__PURE__ */ t("tr", { "aria-hidden": !0, children: /* @__PURE__ */ t("td", { style: { height: `${n}px` }, className: "zen-border-0 zen-p-0" }) }) : null;
              })()
            ] })
          ]
        }
      )
    }
  ) });
};
Y.displayName = "PivotGrid";
export {
  Y as PivotGrid
};
//# sourceMappingURL=index138.js.map
