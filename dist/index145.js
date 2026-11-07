import { jsxs as i, jsx as e } from "react/jsx-runtime";
import * as h from "react";
import { toSlices as M, describeSlices as O, CHART_PALETTE as X, formatPercent as Y } from "./index148.js";
import { useLocale as k } from "./index90.js";
import { cn as v } from "./index160.js";
const z = X, x = (n) => n === "pie" || n === "donut", _ = ({
  type: n = "line",
  data: r,
  series: a,
  xKey: l,
  colors: u,
  height: d = 300,
  className: s
}) => {
  const m = k(), [f, C] = h.useState(null), [y, A] = h.useState(!1);
  h.useEffect(() => {
    let t = !0;
    return import("recharts").then((o) => {
      t && C(o);
    }).catch(() => {
      t && A(!0);
    }), () => {
      t = !1;
    };
  }, []);
  const c = h.useMemo(
    () => x(n) && a[0] ? M(r, l, a[0].key, u ?? z) : [],
    [n, r, l, a, u]
  );
  if (y)
    return /* @__PURE__ */ i(
      "div",
      {
        className: v(
          "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg",
          s
        ),
        style: { height: d },
        children: [
          "Chart needs the optional peer dependency ",
          /* @__PURE__ */ e("code", { className: "zen-mx-1", children: "recharts" }),
          " — install it to render this."
        ]
      }
    );
  if (!f)
    return /* @__PURE__ */ e(
      "div",
      {
        className: v(
          "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
          s
        ),
        style: { height: d },
        children: m.t("chart.loading")
      }
    );
  const {
    ResponsiveContainer: p,
    LineChart: S,
    AreaChart: w,
    BarChart: L,
    PieChart: R,
    Pie: T,
    Cell: N,
    Line: P,
    Area: j,
    Bar: E,
    XAxis: B,
    YAxis: H,
    CartesianGrid: D,
    Tooltip: b,
    Legend: F
  } = f;
  if (x(n))
    return /* @__PURE__ */ i("div", { className: s, style: { width: "100%", height: d }, children: [
      /* @__PURE__ */ e(
        "div",
        {
          role: "img",
          "aria-label": O(c, n === "donut" ? m.t("chart.donut") : m.t("chart.pie")),
          style: { width: "100%", height: "calc(100% - 28px)" },
          children: /* @__PURE__ */ e(p, { width: "100%", height: "100%", children: /* @__PURE__ */ i(R, { children: [
            /* @__PURE__ */ e(b, { formatter: (t, o) => [t, o] }),
            /* @__PURE__ */ e(
              T,
              {
                data: c.map((t) => ({ name: t.label, value: t.value })),
                dataKey: "value",
                nameKey: "name",
                startAngle: 90,
                endAngle: -270,
                innerRadius: n === "donut" ? "55%" : 0,
                outerRadius: "80%",
                paddingAngle: 0,
                isAnimationActive: !1,
                children: c.map((t) => /* @__PURE__ */ e(N, { fill: t.color, stroke: "var(--zen-color-background)" }, t.label))
              }
            )
          ] }) })
        }
      ),
      /* @__PURE__ */ e(q, { slices: c }),
      /* @__PURE__ */ e(I, { slices: c, labelHeader: l })
    ] });
  const G = n === "area" ? w : n === "bar" ? L : S, K = n === "area" ? j : n === "bar" ? E : P;
  return /* @__PURE__ */ e("div", { className: s, style: { width: "100%", height: d }, children: /* @__PURE__ */ e(p, { width: "100%", height: "100%", children: /* @__PURE__ */ i(G, { data: r, children: [
    /* @__PURE__ */ e(D, { strokeDasharray: "3 3", stroke: "var(--zen-color-border)" }),
    /* @__PURE__ */ e(B, { dataKey: l, stroke: "var(--zen-color-muted-fg)", fontSize: 12 }),
    /* @__PURE__ */ e(H, { stroke: "var(--zen-color-muted-fg)", fontSize: 12 }),
    /* @__PURE__ */ e(b, {}),
    /* @__PURE__ */ e(F, {}),
    a.map((t, o) => {
      const g = t.color ?? z[o % z.length];
      return /* @__PURE__ */ e(
        K,
        {
          type: "monotone",
          dataKey: t.key,
          name: t.label ?? t.key,
          stroke: g,
          fill: g,
          fillOpacity: n === "area" ? 0.2 : 1
        },
        t.key
      );
    })
  ] }) }) });
};
_.displayName = "Chart";
const q = ({ slices: n }) => /* @__PURE__ */ e("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-3 zen-text-xs", children: n.map((r) => /* @__PURE__ */ i("span", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
  /* @__PURE__ */ e(
    "span",
    {
      "aria-hidden": !0,
      className: "zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full",
      style: { backgroundColor: r.color }
    }
  ),
  /* @__PURE__ */ e("span", { className: "zen-text-zen-muted-fg", children: r.label })
] }, r.label)) }), I = ({ slices: n, labelHeader: r }) => {
  const a = k();
  return /* @__PURE__ */ i("table", { className: "zen-sr-only", children: [
    /* @__PURE__ */ e("caption", { children: a.t("chart.data") }),
    /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ i("tr", { children: [
      /* @__PURE__ */ e("th", { scope: "col", children: r }),
      /* @__PURE__ */ e("th", { scope: "col", children: a.t("chart.value") }),
      /* @__PURE__ */ e("th", { scope: "col", children: a.t("chart.share") })
    ] }) }),
    /* @__PURE__ */ e("tbody", { children: n.map((l) => /* @__PURE__ */ i("tr", { children: [
      /* @__PURE__ */ e("th", { scope: "row", children: l.label }),
      /* @__PURE__ */ e("td", { children: l.value }),
      /* @__PURE__ */ e("td", { children: Y(l.percent) })
    ] }, l.label)) })
  ] });
};
export {
  _ as Chart
};
//# sourceMappingURL=index145.js.map
