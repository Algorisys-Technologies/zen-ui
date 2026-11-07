import { jsxs as u, jsx as n } from "react/jsx-runtime";
import * as a from "react";
import { makeFormatter as G, chartTable as he, getChartKind as be, selectionAt as ye, tableToCsv as pe } from "./index147.js";
import { useLocale as ve } from "./index90.js";
import { Button as J } from "./index71.js";
import { SegmentedButton as ge, SegmentedButtonItem as Q } from "./index70.js";
import { Icon as W } from "./index63.js";
import { cn as j } from "./index160.js";
const xe = {
  palette: [],
  foreground: "",
  muted: "",
  border: "",
  background: "",
  surface: "",
  positive: "",
  negative: "",
  fontFamily: ""
}, X = (m, h) => {
  const l = document.createElement("a");
  l.href = m, l.download = h, document.body.append(l), l.click(), l.remove();
}, Y = (m) => m.replace(/[\\/:*?"<>|]+/g, " ").trim() || "chart", Ce = a.forwardRef(
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
    zoom: A,
    legend: U,
    title: z,
    description: x,
    format: V,
    secondaryFormat: C,
    currency: Z,
    locale: ee,
    onSelect: b,
    toolbar: ne = !0,
    view: F,
    defaultView: te,
    onViewChange: ae,
    height: w = 320,
    renderer: re,
    option: I,
    fileName: K,
    className: oe,
    ...le
  }, ce) => {
    const N = ve(), t = N.t, [s, O] = a.useState("loading"), [se, ie] = a.useState(te ?? "chart"), v = s === "unavailable" ? "table" : F ?? se, de = (e) => {
      F === void 0 && ie(e), ae?.(e);
    }, i = a.useMemo(
      () => ({ type: m, data: h, x: l, y: $, series: E, stacked: L, horizontal: B, total: M, max: S, target: T, zoom: A, legend: U, title: z, description: x }),
      [m, h, l, $, E, L, B, M, S, T, A, U, z, x]
    ), D = ee ?? N.locale, H = Z ?? N.currency, y = a.useMemo(() => {
      const e = { locale: D, currency: H }, r = G(V, e), d = C ? G(C, e) : r;
      return {
        format: (o, g) => g === "secondary" ? d(o) : r(o),
        t
      };
    }, [D, H, V, C, t]), f = h.length === 0, P = typeof w == "number" ? `${w}px` : w, _ = z ?? "", c = a.useMemo(() => he(i, { ...y, rtl: !1, theme: xe }), [i, y]), q = (e, r) => e === null ? "" : typeof e == "number" ? y.format(e, c.columns[r]?.axis) : e, R = a.useRef(null), p = a.useRef(void 0), k = a.useRef(b);
    k.current = b;
    const ue = a.useRef(re), me = b !== void 0;
    a.useEffect(() => {
      let e = !1;
      return (async () => {
        try {
          const { createChartController: r } = await import("./index223.js");
          if (e || !R.current) return;
          const d = await r(R.current, {
            renderer: ue.current,
            onSelect: (o) => k.current?.(o),
            // The wrapper above always exists; whether a click does anything is this.
            selectable: () => k.current !== void 0
          });
          if (e) {
            d.dispose();
            return;
          }
          p.current = d, O("ready");
        } catch {
          e || O("unavailable");
        }
      })(), () => {
        e = !0, p.current?.dispose(), p.current = void 0;
      };
    }, []), a.useEffect(() => {
      const e = p.current;
      if (!(s !== "ready" || !e || f)) {
        if (!be(i.type)) {
          console.error(`AnalyticChart: unknown type "${i.type}"`);
          return;
        }
        e.render(i, y, I);
      }
    }, [s, i, y, I, f, me]);
    const ze = async () => {
      const e = p.current;
      e && X(await e.toPng(), `${Y(K ?? (_ || "chart"))}.png`);
    }, fe = () => {
      const e = new Blob(["\uFEFF", pe(c)], { type: "text/csv;charset=utf-8" }), r = URL.createObjectURL(e);
      X(r, `${Y(K ?? (_ || "chart"))}.csv`), setTimeout(() => URL.revokeObjectURL(r), 0);
    };
    return /* @__PURE__ */ u("div", { ref: ce, className: j("zen-flex zen-flex-col zen-gap-2", oe), ...le, children: [
      ne && /* @__PURE__ */ u("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-justify-end zen-gap-2", children: [
        s !== "unavailable" && /* @__PURE__ */ u(
          ge,
          {
            "aria-label": t("analyticChart.view"),
            value: v,
            onValueChange: (e) => de(e),
            children: [
              /* @__PURE__ */ n(Q, { value: "chart", children: t("analyticChart.chart") }),
              /* @__PURE__ */ n(Q, { value: "table", children: t("analyticChart.table") })
            ]
          }
        ),
        v === "chart" && s === "ready" && !f && /* @__PURE__ */ u(
          J,
          {
            variant: "ghost",
            size: "sm",
            "aria-label": t("analyticChart.downloadPng"),
            title: t("analyticChart.downloadPng"),
            onClick: () => {
              ze();
            },
            children: [
              /* @__PURE__ */ n(W, { name: "download" }),
              t("analyticChart.png")
            ]
          }
        ),
        /* @__PURE__ */ u(
          J,
          {
            variant: "ghost",
            size: "sm",
            "aria-label": t("analyticChart.downloadCsv"),
            title: t("analyticChart.downloadCsv"),
            onClick: fe,
            disabled: f,
            children: [
              /* @__PURE__ */ n(W, { name: "download" }),
              t("analyticChart.csv")
            ]
          }
        )
      ] }),
      s === "unavailable" && /* @__PURE__ */ n("p", { className: "zen-m-0 zen-text-xs zen-text-zen-muted-fg", children: t("analyticChart.unavailable") }),
      /* @__PURE__ */ u("div", { className: "zen-relative", style: { height: P }, hidden: v !== "chart", children: [
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
          style: { maxHeight: P },
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
                      const g = ye(i, e.index, e.seriesKey);
                      g && b(g);
                    },
                    children: q(d, o) || String(e.index + 1)
                  }
                ) : q(d, o)
              },
              c.columns[o]?.key ?? o
            )) }, `${e.index}:${e.seriesKey ?? ""}:${r}`)) })
          ] })
        }
      )
    ] });
  }
);
Ce.displayName = "AnalyticChart";
export {
  Ce as AnalyticChart
};
//# sourceMappingURL=index146.js.map
