import { jsxs as l, jsx as e } from "react/jsx-runtime";
import * as h from "react";
import { toSlices as G, describeSlices as K, CHART_PALETTE as M, formatPercent as O } from "./index133.js";
import { cn as g } from "./index145.js";
const z = M, v = (n) => n === "pie" || n === "donut", V = ({
  type: n = "line",
  data: t,
  series: a,
  xKey: o,
  colors: m,
  height: d = 300,
  className: s
}) => {
  const [u, x] = h.useState(null), [C, k] = h.useState(!1);
  h.useEffect(() => {
    let r = !0;
    return import("recharts").then((c) => {
      r && x(c);
    }).catch(() => {
      r && k(!0);
    }), () => {
      r = !1;
    };
  }, []);
  const i = h.useMemo(
    () => v(n) && a[0] ? G(t, o, a[0].key, m ?? z) : [],
    [n, t, o, a, m]
  );
  if (C)
    return /* @__PURE__ */ l(
      "div",
      {
        className: g(
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
  if (!u)
    return /* @__PURE__ */ e(
      "div",
      {
        className: g(
          "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
          s
        ),
        style: { height: d },
        children: "Loading chart…"
      }
    );
  const {
    ResponsiveContainer: f,
    LineChart: y,
    AreaChart: A,
    BarChart: S,
    PieChart: w,
    Pie: L,
    Cell: P,
    Line: R,
    Area: T,
    Bar: N,
    XAxis: j,
    YAxis: E,
    CartesianGrid: B,
    Tooltip: p,
    Legend: D
  } = u;
  if (v(n))
    return /* @__PURE__ */ l("div", { className: s, style: { width: "100%", height: d }, children: [
      /* @__PURE__ */ e(
        "div",
        {
          role: "img",
          "aria-label": K(i, n === "donut" ? "Donut chart" : "Pie chart"),
          style: { width: "100%", height: "calc(100% - 28px)" },
          children: /* @__PURE__ */ e(f, { width: "100%", height: "100%", children: /* @__PURE__ */ l(w, { children: [
            /* @__PURE__ */ e(p, { formatter: (r, c) => [r, c] }),
            /* @__PURE__ */ e(
              L,
              {
                data: i.map((r) => ({ name: r.label, value: r.value })),
                dataKey: "value",
                nameKey: "name",
                startAngle: 90,
                endAngle: -270,
                innerRadius: n === "donut" ? "55%" : 0,
                outerRadius: "80%",
                paddingAngle: 0,
                isAnimationActive: !1,
                children: i.map((r) => /* @__PURE__ */ e(P, { fill: r.color, stroke: "var(--zen-color-background)" }, r.label))
              }
            )
          ] }) })
        }
      ),
      /* @__PURE__ */ e(X, { slices: i }),
      /* @__PURE__ */ e(Y, { slices: i, labelHeader: o })
    ] });
  const H = n === "area" ? A : n === "bar" ? S : y, F = n === "area" ? T : n === "bar" ? N : R;
  return /* @__PURE__ */ e("div", { className: s, style: { width: "100%", height: d }, children: /* @__PURE__ */ e(f, { width: "100%", height: "100%", children: /* @__PURE__ */ l(H, { data: t, children: [
    /* @__PURE__ */ e(B, { strokeDasharray: "3 3", stroke: "var(--zen-color-border)" }),
    /* @__PURE__ */ e(j, { dataKey: o, stroke: "var(--zen-color-muted-fg)", fontSize: 12 }),
    /* @__PURE__ */ e(E, { stroke: "var(--zen-color-muted-fg)", fontSize: 12 }),
    /* @__PURE__ */ e(p, {}),
    /* @__PURE__ */ e(D, {}),
    a.map((r, c) => {
      const b = r.color ?? z[c % z.length];
      return /* @__PURE__ */ e(
        F,
        {
          type: "monotone",
          dataKey: r.key,
          name: r.label ?? r.key,
          stroke: b,
          fill: b,
          fillOpacity: n === "area" ? 0.2 : 1
        },
        r.key
      );
    })
  ] }) }) });
};
V.displayName = "Chart";
const X = ({ slices: n }) => /* @__PURE__ */ e("div", { className: "zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-3 zen-text-xs", children: n.map((t) => /* @__PURE__ */ l("span", { className: "zen-inline-flex zen-items-center zen-gap-1.5", children: [
  /* @__PURE__ */ e(
    "span",
    {
      "aria-hidden": !0,
      className: "zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full",
      style: { backgroundColor: t.color }
    }
  ),
  /* @__PURE__ */ e("span", { className: "zen-text-zen-muted-fg", children: t.label })
] }, t.label)) }), Y = ({ slices: n, labelHeader: t }) => /* @__PURE__ */ l("table", { className: "zen-sr-only", children: [
  /* @__PURE__ */ e("caption", { children: "Chart data" }),
  /* @__PURE__ */ e("thead", { children: /* @__PURE__ */ l("tr", { children: [
    /* @__PURE__ */ e("th", { scope: "col", children: t }),
    /* @__PURE__ */ e("th", { scope: "col", children: "Value" }),
    /* @__PURE__ */ e("th", { scope: "col", children: "Share" })
  ] }) }),
  /* @__PURE__ */ e("tbody", { children: n.map((a) => /* @__PURE__ */ l("tr", { children: [
    /* @__PURE__ */ e("th", { scope: "row", children: a.label }),
    /* @__PURE__ */ e("td", { children: a.value }),
    /* @__PURE__ */ e("td", { children: O(a.percent) })
  ] }, a.label)) })
] });
export {
  V as Chart
};
//# sourceMappingURL=index132.js.map
