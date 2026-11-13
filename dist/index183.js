import { jsxs as u, jsx as n } from "react/jsx-runtime";
import * as a from "react";
import { makeFormatter as J, chartTable as be, getChartKind as ye, selectionAt as pe, tableToCsv as ve } from "./index184.js";
import { useLocale as ge } from "./index90.js";
import { Button as Q } from "./index71.js";
import { SegmentedButton as xe, SegmentedButtonItem as W } from "./index70.js";
import { Icon as X } from "./index63.js";
import { cn as j } from "./index197.js";
const Ce = {
  palette: [],
  foreground: "",
  muted: "",
  border: "",
  background: "",
  surface: "",
  positive: "",
  negative: "",
  fontFamily: ""
}, Y = (m, h) => {
  const l = document.createElement("a");
  l.href = m, l.download = h, document.body.append(l), l.click(), l.remove();
}, Z = (m) => m.replace(/[\\/:*?"<>|]+/g, " ").trim() || "chart", we = a.forwardRef(
  ({
    type: m,
    data: h,
    x: l,
    y: $,
    series: E,
    stacked: L,
    horizontal: B,
    total: M,
    max: S,
    target: T,
    threshold: A,
    zoom: U,
    legend: V,
    title: z,
    description: x,
    format: F,
    secondaryFormat: C,
    currency: ee,
    locale: ne,
    onSelect: b,
    toolbar: te = !0,
    view: I,
    defaultView: ae,
    onViewChange: re,
    height: w = 320,
    renderer: oe,
    option: K,
    fileName: O,
    className: le,
    ...ce
  }, se) => {
    const N = ge(), t = N.t, [s, D] = a.useState("loading"), [ie, de] = a.useState(ae ?? "chart"), v = s === "unavailable" ? "table" : I ?? ie, ue = (e) => {
      I === void 0 && de(e), re?.(e);
    }, i = a.useMemo(
      () => ({ type: m, data: h, x: l, y: $, series: E, stacked: L, horizontal: B, total: M, max: S, target: T, threshold: A, zoom: U, legend: V, title: z, description: x }),
      [m, h, l, $, E, L, B, M, S, T, A, U, V, z, x]
    ), H = ne ?? N.locale, P = ee ?? N.currency, y = a.useMemo(() => {
      const e = { locale: H, currency: P }, r = J(F, e), d = C ? J(C, e) : r;
      return {
        format: (o, g) => g === "secondary" ? d(o) : r(o),
        t,
        locale: e.locale
      };
    }, [H, P, F, C, t]), f = h.length === 0, _ = typeof w == "number" ? `${w}px` : w, q = z ?? "", c = a.useMemo(() => be(i, { ...y, rtl: !1, theme: Ce }), [i, y]), G = (e, r) => e === null ? "" : typeof e == "number" ? y.format(e, c.columns[r]?.axis) : e, R = a.useRef(null), p = a.useRef(void 0), k = a.useRef(b);
    k.current = b;
    const me = a.useRef(oe), ze = b !== void 0;
    a.useEffect(() => {
      let e = !1;
      return (async () => {
        try {
          const { createChartController: r } = await import("./index261.js");
          if (e || !R.current) return;
          const d = await r(R.current, {
            renderer: me.current,
            onSelect: (o) => k.current?.(o),
            // The wrapper above always exists; whether a click does anything is this.
            selectable: () => k.current !== void 0
          });
          if (e) {
            d.dispose();
            return;
          }
          p.current = d, D("ready");
        } catch {
          e || D("unavailable");
        }
      })(), () => {
        e = !0, p.current?.dispose(), p.current = void 0;
      };
    }, []), a.useEffect(() => {
      const e = p.current;
      if (!(s !== "ready" || !e || f)) {
        if (!ye(i.type)) {
          console.error(`AnalyticChart: unknown type "${i.type}"`);
          return;
        }
        e.render(i, y, K);
      }
    }, [s, i, y, K, f, ze]);
    const fe = async () => {
      const e = p.current;
      e && Y(await e.toPng(), `${Z(O ?? (q || "chart"))}.png`);
    }, he = () => {
      const e = new Blob(["\uFEFF", ve(c)], { type: "text/csv;charset=utf-8" }), r = URL.createObjectURL(e);
      Y(r, `${Z(O ?? (q || "chart"))}.csv`), setTimeout(() => URL.revokeObjectURL(r), 0);
    };
    return /* @__PURE__ */ u("div", { ref: se, className: j("zen-flex zen-flex-col zen-gap-2", le), ...ce, children: [
      te && /* @__PURE__ */ u("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-justify-end zen-gap-2", children: [
        s !== "unavailable" && /* @__PURE__ */ u(
          xe,
          {
            "aria-label": t("analyticChart.view"),
            value: v,
            onValueChange: (e) => ue(e),
            children: [
              /* @__PURE__ */ n(W, { value: "chart", children: t("analyticChart.chart") }),
              /* @__PURE__ */ n(W, { value: "table", children: t("analyticChart.table") })
            ]
          }
        ),
        v === "chart" && s === "ready" && !f && /* @__PURE__ */ u(
          Q,
          {
            variant: "ghost",
            size: "sm",
            "aria-label": t("analyticChart.downloadPng"),
            title: t("analyticChart.downloadPng"),
            onClick: () => {
              fe();
            },
            children: [
              /* @__PURE__ */ n(X, { name: "download" }),
              t("analyticChart.png")
            ]
          }
        ),
        /* @__PURE__ */ u(
          Q,
          {
            variant: "ghost",
            size: "sm",
            "aria-label": t("analyticChart.downloadCsv"),
            title: t("analyticChart.downloadCsv"),
            onClick: he,
            disabled: f,
            children: [
              /* @__PURE__ */ n(X, { name: "download" }),
              t("analyticChart.csv")
            ]
          }
        )
      ] }),
      s === "unavailable" && /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg", children: t("analyticChart.unavailable") }),
      /* @__PURE__ */ u("div", { className: "zen-relative", style: { height: _ }, hidden: v !== "chart", children: [
        /* @__PURE__ */ n(
          "div",
          {
            ref: R,
            role: "img",
            "aria-label": [z, x].filter(Boolean).join(". ") || void 0,
            className: "zen-h-full zen-w-full"
          }
        ),
        (s === "loading" || f) && /* @__PURE__ */ n("div", { className: "zen-absolute zen-inset-0 zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg", children: t(f ? "analyticChart.noData" : "analyticChart.loading") })
      ] }),
      v === "table" && /* @__PURE__ */ n(
        "div",
        {
          className: "zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
          style: { maxHeight: _ },
          children: /* @__PURE__ */ u("table", { className: "zen-w-full zen-border-collapse zen-text-sm", children: [
            z && /* @__PURE__ */ n("caption", { className: "zen-sr-only", children: z }),
            /* @__PURE__ */ n("thead", { className: "zen-sticky zen-top-0 zen-bg-zen-muted", children: /* @__PURE__ */ n("tr", { children: c.columns.map((e) => /* @__PURE__ */ n(
              "th",
              {
                scope: "col",
                className: j(
                  "zen-px-3 zen-py-2 zen-font-medium zen-text-zen-foreground",
                  e.numeric ? "zen-text-end" : "zen-text-start"
                ),
                children: e.label
              },
              e.key
            )) }) }),
            /* @__PURE__ */ n("tbody", { children: c.rows.length === 0 ? /* @__PURE__ */ n("tr", { children: /* @__PURE__ */ n(
              "td",
              {
                className: "zen-px-3 zen-py-6 zen-text-center zen-text-zen-muted-fg",
                colSpan: Math.max(1, c.columns.length),
                children: t("analyticChart.noData")
              }
            ) }) : c.rows.map((e, r) => /* @__PURE__ */ n("tr", { className: "zen-border-t zen-border-zen-border", children: e.cells.map((d, o) => /* @__PURE__ */ n(
              "td",
              {
                className: j(
                  "zen-px-3 zen-py-1.5 zen-text-zen-foreground",
                  c.columns[o]?.numeric ? "zen-text-end zen-tabular-nums" : "zen-text-start"
                ),
                children: o === 0 && b ? /* @__PURE__ */ n(
                  "button",
                  {
                    type: "button",
                    className: "zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0 zen-text-start zen-font-medium zen-text-zen-primary zen-underline-offset-2 hover:zen-underline focus-visible:zen-rounded-zen-sm focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    onClick: () => {
                      const g = pe(i, e.index, e.seriesKey);
                      g && b(g);
                    },
                    children: G(d, o) || String(e.index + 1)
                  }
                ) : G(d, o)
              },
              c.columns[o]?.key ?? o
            )) }, `${e.index}:${e.seriesKey ?? ""}:${r}`)) })
          ] })
        }
      )
    ] });
  }
);
we.displayName = "AnalyticChart";
export {
  we as AnalyticChart
};
//# sourceMappingURL=index183.js.map
