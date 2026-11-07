const S = /* @__PURE__ */ new Map();
function K(e) {
  S.set(e.id, e);
}
function C(e) {
  return S.get(e);
}
function N() {
  return [...S.keys()];
}
function m(e) {
  if (typeof e == "number") return Number.isFinite(e) ? e : null;
  if (typeof e == "string" && e.trim() !== "") {
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}
const h = (e) => e == null ? "" : String(e);
function V(e, t = {}) {
  if (typeof e == "function") return e;
  const { locale: a, currency: r } = t;
  let n;
  try {
    n = e === "currency" && r ? new Intl.NumberFormat(a, { style: "currency", currency: r }) : e === "percent" ? new Intl.NumberFormat(a, { style: "percent", maximumFractionDigits: 1 }) : e === "compact" ? new Intl.NumberFormat(a, { notation: "compact", maximumFractionDigits: 1 }) : new Intl.NumberFormat(a, { maximumFractionDigits: 2 });
  } catch {
    n = new Intl.NumberFormat(void 0, { maximumFractionDigits: 2 });
  }
  return (o) => n.format(o);
}
function f(e) {
  return (e.series ?? []).map((t) => ({ ...t, label: t.label ?? t.key }));
}
function J(e, t, a) {
  const r = C(e.type), n = a ?? e.series?.[0]?.key;
  if (r?.select) return r.select(e, { dataIndex: t, seriesId: n });
  const o = e.data[t];
  if (o)
    return { row: o, index: t, seriesKey: n, value: (n ? m(o[n]) : null) ?? void 0 };
}
function T(e) {
  const t = f(e);
  return {
    columns: [
      ...e.x ? [{ key: e.x, label: e.x }] : [],
      ...t.map((a) => ({ key: a.key, label: a.label, numeric: !0, axis: a.axis }))
    ],
    rows: e.data.map((a, r) => ({
      index: r,
      cells: [...e.x ? [h(a[e.x])] : [], ...t.map((n) => m(a[n.key]))]
    }))
  };
}
function Q(e, t) {
  const a = C(e.type);
  return a?.table ? a.table(e, t) : T(e);
}
function U(e) {
  const t = (a) => {
    if (a === null) return "";
    if (typeof a == "number") return String(a);
    const r = /^[=+\-@\t\r]/.test(a) ? `'${a}` : a;
    return /[",\r\n]/.test(r) ? `"${r.replace(/"/g, '""')}"` : r;
  };
  return [e.columns.map((a) => t(a.label)), ...e.rows.map((a) => a.cells.map(t))].map((a) => a.join(",")).join(`\r
`);
}
const L = (e) => typeof e == "object" && e !== null && !Array.isArray(e);
function p(e, t) {
  if (!t) return e;
  const a = { ...e };
  for (const [r, n] of Object.entries(t))
    a[r] = L(n) && L(a[r]) ? p(a[r], n) : n;
  return a;
}
function X(e, t, a) {
  const r = C(e.type);
  if (!r) throw new Error(`AnalyticChart: unknown type "${e.type}". Registered: ${N().join(", ")}.`);
  const { theme: n } = t, o = {
    color: n.palette,
    backgroundColor: "transparent",
    textStyle: { color: n.foreground, fontFamily: n.fontFamily },
    animationDuration: 300,
    tooltip: {
      backgroundColor: n.background,
      borderColor: n.border,
      textStyle: { color: n.foreground, fontFamily: n.fontFamily },
      valueFormatter: (l) => {
        const i = m(l);
        return i === null ? "" : t.format(i);
      }
    },
    aria: {
      enabled: !0,
      ...e.description ? { label: { description: e.description } } : {}
    }
  };
  return p(p(o, r.build(e, t)), a);
}
function $(e, t, a) {
  return {
    show: e.legend ?? a > 1,
    top: 0,
    [t.rtl ? "right" : "left"]: 0,
    icon: "roundRect",
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { color: t.theme.foreground }
  };
}
function I(e, t, a = {}) {
  const { theme: r, rtl: n } = t, o = a.categories ?? e.data.map((y) => h(e.x ? y[e.x] : "")), l = { color: r.muted, fontFamily: r.fontFamily }, i = t.width && !e.horizontal ? Math.floor((t.width - 96) / Math.max(1, o.length)) - 6 : 0, u = i >= 36 && o.length <= 24, b = {
    type: "category",
    data: o,
    boundaryGap: a.boundaryGap ?? !0,
    axisLine: { lineStyle: { color: r.border } },
    axisTick: { show: !1 },
    axisLabel: u ? { ...l, interval: 0, width: i, overflow: "break", lineHeight: 14 } : { ...l, hideOverlap: !0 }
  }, d = (y) => ({
    type: "value",
    axisLabel: { ...l, formatter: (c) => t.format(c, y) },
    splitLine: { show: y === "primary", lineStyle: { color: r.border, type: "dashed" } },
    axisLine: { show: !1 }
  }), k = a.secondary ? [d("primary"), d("secondary")] : [d("primary")], A = {
    containLabel: !0,
    left: 8,
    right: 8,
    top: e.legend ?? (e.series?.length ?? 0) > 1 ? 36 : 12,
    bottom: e.zoom ? 44 : 8
  }, F = e.horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 }, w = e.zoom ? [
    { type: "inside", ...F },
    {
      type: "slider",
      ...F,
      height: 18,
      bottom: 8,
      borderColor: r.border,
      fillerColor: "rgba(127,127,127,0.15)",
      textStyle: l
    }
  ] : void 0;
  return e.horizontal ? {
    grid: A,
    // Horizontal bars read top-down: the first row at the top.
    yAxis: { ...b, inverse: !0, position: n ? "right" : "left" },
    xAxis: k.map((y, c) => ({ ...y, inverse: n, position: c === 0 ? "bottom" : "top" })),
    ...w ? { dataZoom: w } : {}
  } : {
    grid: A,
    xAxis: { ...b, inverse: n },
    yAxis: k.map((y, c) => ({ ...y, position: c === 0 !== n ? "left" : "right" })),
    ...w ? { dataZoom: w } : {}
  };
}
function W(e, t, a) {
  return f(e).map((r, n) => {
    const o = r.kind ?? a(n), l = r.stack ?? (e.stacked && o !== "line" ? "total" : void 0), i = {
      id: r.key,
      name: r.label,
      data: e.data.map((u) => m(u[r.key])),
      ...r.color ? { itemStyle: { color: r.color } } : {},
      ...l ? { stack: l } : {},
      ...r.axis === "secondary" ? e.horizontal ? { xAxisIndex: 1 } : { yAxisIndex: 1 } : {},
      emphasis: { focus: "series" },
      tooltip: { valueFormatter: (u) => O(t, u, r.axis) }
    };
    if (o === "bar") {
      const b = e.horizontal ? t.rtl ? [3, 0, 0, 3] : [0, 3, 3, 0] : [3, 3, 0, 0];
      return {
        ...i,
        type: "bar",
        barMaxWidth: 48,
        // Stacked segments get a 1px background-coloured edge, so neighbours sit
        // 2px apart and read as separate quantities rather than one bar.
        itemStyle: {
          ...r.color ? { color: r.color } : {},
          borderRadius: l ? 0 : b,
          ...l ? { borderColor: t.theme.background, borderWidth: 1 } : {}
        }
      };
    }
    return {
      ...i,
      type: "line",
      symbol: "circle",
      symbolSize: 6,
      showSymbol: e.data.length <= 40,
      connectNulls: !1,
      ...o === "area" ? { areaStyle: { opacity: l ? 0.6 : 0.15 } } : {}
    };
  });
}
const O = (e, t, a) => {
  const r = m(t);
  return r === null ? "" : e.format(r, a);
}, G = (e) => (e.series ?? []).some((t) => t.axis === "secondary"), g = (e) => (t) => e.map((a) => t[a]), x = (e, t) => ({
  id: e,
  modules: () => Promise.all([
    import("echarts/charts").then(({ BarChart: a, LineChart: r }) => [a, r]),
    import("echarts/components").then(({ GridComponent: a, DataZoomComponent: r }) => [a, r])
  ]).then((a) => a.flat()),
  build: (a, r) => ({
    ...I(a, r, {
      secondary: G(a),
      boundaryGap: (a.series ?? []).some((n, o) => (n.kind ?? t(o)) === "bar")
    }),
    legend: $(a, r, a.series?.length ?? 0),
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    series: W(a, r, t)
  }),
  select: (a, r) => {
    const n = a.data[r.dataIndex];
    if (!n) return;
    const o = m(r.seriesId ? n[r.seriesId] : void 0) ?? void 0;
    return { row: n, index: r.dataIndex, seriesKey: r.seriesId, value: o };
  }
}), M = (e, t) => ({
  id: e,
  modules: () => import("echarts/charts").then(({ PieChart: a }) => [a]),
  build: (a, r) => {
    const n = f(a)[0], o = a.data.map((l, i) => ({
      name: h(a.x ? l[a.x] : i),
      value: n ? m(l[n.key]) : null
    }));
    return {
      legend: { ...$(a, r, o.length), show: a.legend ?? !1, type: "scroll" },
      tooltip: {
        trigger: "item",
        formatter: (l) => `${s(l.name)}: <b>${s(r.format(l.value))}</b> (${l.percent}%)`
      },
      series: [
        {
          id: n?.key,
          name: n?.label,
          type: "pie",
          radius: t ? ["52%", "78%"] : [0, "78%"],
          center: ["50%", a.legend ? "55%" : "50%"],
          data: o,
          itemStyle: { borderColor: r.theme.background, borderWidth: 2 },
          // With a legend the slices are already named; labels too would say it
          // twice and crowd (they truncated, measured).
          label: { show: !a.legend, color: r.theme.foreground, formatter: "{b}" },
          labelLine: { show: !a.legend, lineStyle: { color: r.theme.border } },
          emphasis: { scaleSize: 4 }
        }
      ]
    };
  },
  select: (a, r) => {
    const n = a.data[r.dataIndex], o = a.series?.[0];
    return n ? { row: n, index: r.dataIndex, seriesKey: o?.key, value: m(o ? n[o.key] : void 0) ?? void 0 } : void 0;
  }
});
function v(e) {
  const t = e.series?.[0]?.key;
  let a = 0;
  return e.data.map((r) => {
    if (e.total && r[e.total])
      return { base: Math.min(0, a), height: Math.abs(a), running: a, change: null, kind: "total" };
    const n = (t ? m(r[t]) : null) ?? 0, o = a;
    return a += n, { base: Math.min(o, a), height: Math.abs(n), running: a, change: n, kind: n >= 0 ? "up" : "down" };
  });
}
const P = {
  id: "waterfall",
  modules: () => Promise.all([
    import("echarts/charts").then(({ BarChart: e }) => [e]),
    import("echarts/components").then(({ GridComponent: e, DataZoomComponent: t }) => [e, t])
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const a = v(e), r = f(e)[0], n = { up: t.theme.positive, down: t.theme.negative, total: t.theme.palette[0] };
    return {
      ...I({ ...e, legend: !1 }, t),
      legend: { show: !1 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (o) => {
          const l = o[0]?.dataIndex ?? 0, i = a[l];
          if (!i) return "";
          const u = s(o[0]?.name ?? "");
          if (i.kind === "total") return `${u}<br/>${s(t.t("analyticChart.total"))}: <b>${s(t.format(i.running))}</b>`;
          const b = (i.change ?? 0) > 0 ? `+${t.format(i.change ?? 0)}` : t.format(i.change ?? 0);
          return `${u}<br/>${s(t.t("analyticChart.change"))}: <b>${s(b)}</b><br/>${s(t.t("analyticChart.runningTotal"))}: ${s(t.format(i.running))}`;
        }
      },
      series: [
        {
          // The invisible part of each column: where the visible part starts.
          id: "__base",
          type: "bar",
          stack: "waterfall",
          stackStrategy: "all",
          silent: !0,
          itemStyle: { color: "transparent", borderColor: "transparent" },
          emphasis: { disabled: !0 },
          tooltip: { show: !1 },
          data: a.map((o) => o.base)
        },
        {
          id: r?.key ?? "value",
          name: r?.label,
          type: "bar",
          stack: "waterfall",
          stackStrategy: "all",
          barMaxWidth: 48,
          data: a.map((o) => ({ value: o.height, itemStyle: { color: n[o.kind], borderRadius: 2 } }))
        }
      ]
    };
  },
  table: (e, t) => {
    const a = v(e);
    return {
      columns: [
        ...e.x ? [{ key: e.x, label: e.x }] : [],
        { key: "change", label: t.t("analyticChart.change"), numeric: !0 },
        { key: "running", label: t.t("analyticChart.runningTotal"), numeric: !0 }
      ],
      rows: e.data.map((r, n) => ({
        index: n,
        cells: [...e.x ? [h(r[e.x])] : [], a[n]?.change ?? null, a[n]?.running ?? null]
      }))
    };
  },
  select: (e, t) => {
    const a = e.data[t.dataIndex];
    if (!a) return;
    const r = v(e)[t.dataIndex];
    return { row: a, index: t.dataIndex, seriesKey: e.series?.[0]?.key, value: r?.change ?? r?.running };
  }
}, j = {
  id: "funnel",
  modules: () => import("echarts/charts").then(g(["FunnelChart"])),
  build: (e, t) => {
    const a = f(e)[0];
    return {
      legend: { show: !1 },
      tooltip: {
        trigger: "item",
        formatter: (r) => `${s(r.name)}: <b>${s(t.format(r.value))}</b>`
      },
      series: [
        {
          id: a?.key,
          name: a?.label,
          type: "funnel",
          // Labels beside the funnel, not in it: inside, the narrow stages
          // clipped them and a light stage made white text unreadable.
          left: t.rtl ? "36%" : "4%",
          right: t.rtl ? "4%" : "36%",
          top: 8,
          bottom: 8,
          sort: "none",
          gap: 2,
          minSize: "8%",
          itemStyle: { borderColor: t.theme.background, borderWidth: 1 },
          label: {
            position: t.rtl ? "left" : "right",
            color: t.theme.foreground,
            formatter: (r) => `${r.name}  ${t.format(r.value)}`
          },
          labelLine: { show: !0, lineStyle: { color: t.theme.border } },
          data: e.data.map((r, n) => ({ name: h(e.x ? r[e.x] : n), value: a ? m(r[a.key]) : null }))
        }
      ]
    };
  }
}, D = {
  id: "gauge",
  modules: () => import("echarts/charts").then(g(["GaugeChart"])),
  build: (e, t) => {
    const a = f(e)[0], r = (a ? m(e.data[0]?.[a.key]) : null) ?? 0, n = e.max ?? 100, o = 16;
    return {
      tooltip: { show: !1 },
      series: [
        {
          id: a?.key,
          name: a?.label,
          type: "gauge",
          min: 0,
          max: n,
          startAngle: 210,
          endAngle: -30,
          radius: "92%",
          center: ["50%", "58%"],
          progress: { show: !0, width: o, roundCap: !0, itemStyle: { color: a?.color ?? t.theme.palette[0] } },
          axisLine: { roundCap: !0, lineStyle: { width: o, color: [[1, t.theme.surface]] } },
          pointer: { show: !1 },
          axisTick: { show: !1 },
          splitLine: { show: !1 },
          axisLabel: { show: !1 },
          anchor: { show: !1 },
          title: { show: !0, offsetCenter: [0, "38%"], color: t.theme.muted, fontSize: 13 },
          detail: {
            valueAnimation: !0,
            offsetCenter: [0, "0%"],
            color: t.theme.foreground,
            fontSize: 28,
            fontWeight: 600,
            formatter: (l) => t.format(l)
          },
          data: [{ value: r, name: a?.label ?? "" }]
        },
        ...e.target !== void 0 ? [
          {
            // The target: a short arc across the track at its value, drawn
            // as a second, otherwise empty dial whose line is coloured only
            // there. Silent, so a click still lands on the value.
            id: "__target",
            type: "gauge",
            silent: !0,
            min: 0,
            max: n,
            startAngle: 210,
            endAngle: -30,
            radius: "96%",
            center: ["50%", "58%"],
            axisLine: { lineStyle: { width: o + 8, color: Z(e.target, n, t.theme.foreground) } },
            progress: { show: !1 },
            pointer: { show: !1 },
            axisTick: { show: !1 },
            splitLine: { show: !1 },
            axisLabel: { show: !1 },
            detail: { show: !1 },
            title: { show: !1 },
            anchor: { show: !1 },
            data: []
          }
        ] : []
      ]
    };
  },
  table: (e, t) => {
    const a = f(e)[0];
    return {
      columns: [
        { key: "label", label: a?.label ?? "" },
        { key: "value", label: t.t("analyticChart.value"), numeric: !0 },
        { key: "max", label: t.t("analyticChart.max"), numeric: !0 },
        ...e.target !== void 0 ? [{ key: "target", label: t.t("analyticChart.target"), numeric: !0 }] : []
      ],
      rows: [
        {
          index: 0,
          cells: [
            a?.label ?? "",
            a ? m(e.data[0]?.[a.key]) : null,
            e.max ?? 100,
            ...e.target !== void 0 ? [e.target] : []
          ]
        }
      ]
    };
  },
  select: (e) => {
    const t = e.data[0], a = e.series?.[0];
    return t ? { row: t, index: 0, seriesKey: a?.key, value: m(a ? t[a.key] : void 0) ?? void 0 } : void 0;
  }
}, z = (e, t) => {
  const a = /* @__PURE__ */ new Set();
  for (const r of e) a.add(h(t ? r[t] : ""));
  return [...a];
}, R = {
  id: "heatmap",
  modules: () => Promise.all([
    import("echarts/charts").then(g(["HeatmapChart"])),
    import("echarts/components").then(g(["GridComponent", "VisualMapComponent"]))
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const a = f(e)[0], r = z(e.data, e.x), n = z(e.data, e.y), o = e.data.map((d) => a ? m(d[a.key]) : null), l = o.filter((d) => d !== null), i = l.length ? Math.min(...l) : 0, u = l.length ? Math.max(...l) : 1, b = I({ ...e, horizontal: !1, zoom: !1, legend: !1 }, t, { categories: r });
    return {
      ...b,
      grid: { ...b.grid, bottom: 44 },
      // Rows read top-down in the data's order, as a table would.
      yAxis: {
        ...b.xAxis,
        data: n,
        inverse: !0,
        position: t.rtl ? "right" : "left",
        splitArea: { show: !1 },
        axisLabel: { color: t.theme.muted, fontFamily: t.theme.fontFamily }
      },
      legend: { show: !1 },
      tooltip: {
        trigger: "item",
        formatter: (d) => `${s(r[d.value[0]] ?? "")} · ${s(n[d.value[1]] ?? "")}: <b>${s(d.value[2] === null ? "" : t.format(d.value[2]))}</b>`
      },
      visualMap: {
        min: i,
        max: u === i ? i + 1 : u,
        calculable: !1,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemHeight: 120,
        itemWidth: 10,
        // The scale's ends, labelled: a colour ramp with no numbers reads as decoration.
        text: [t.format(u === i ? i + 1 : u), t.format(i)],
        textGap: 8,
        textStyle: { color: t.theme.muted },
        inRange: { color: [t.theme.surface, a?.color ?? t.theme.palette[0]] }
      },
      series: [
        {
          id: a?.key,
          name: a?.label,
          type: "heatmap",
          data: e.data.map((d, k) => [r.indexOf(h(e.x ? d[e.x] : "")), n.indexOf(h(e.y ? d[e.y] : "")), o[k]]),
          itemStyle: { borderColor: t.theme.background, borderWidth: 2 },
          emphasis: { itemStyle: { borderColor: t.theme.foreground, borderWidth: 1 } }
        }
      ]
    };
  },
  table: (e) => {
    const t = f(e)[0];
    return {
      columns: [
        ...e.x ? [{ key: e.x, label: e.x }] : [],
        ...e.y ? [{ key: e.y, label: e.y }] : [],
        ...t ? [{ key: t.key, label: t.label, numeric: !0 }] : []
      ],
      rows: e.data.map((a, r) => ({
        index: r,
        cells: [
          ...e.x ? [h(a[e.x])] : [],
          ...e.y ? [h(a[e.y])] : [],
          ...t ? [m(a[t.key])] : []
        ]
      }))
    };
  }
}, _ = {
  id: "scatter",
  modules: () => Promise.all([
    import("echarts/charts").then(g(["ScatterChart"])),
    import("echarts/components").then(g(["GridComponent", "DataZoomComponent"]))
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const a = e.series?.length ? f(e) : e.y ? [{ key: e.y, label: e.y }] : [], r = { color: t.theme.muted, fontFamily: t.theme.fontFamily }, n = (o) => ({
      type: "value",
      scale: !0,
      name: o,
      nameTextStyle: r,
      axisLabel: { ...r, formatter: (l) => t.format(l) },
      splitLine: { lineStyle: { color: t.theme.border, type: "dashed" } },
      axisLine: { lineStyle: { color: t.theme.border } }
    });
    return {
      // containLabel does not count an axis NAME: leave room for the x one.
      grid: { containLabel: !0, left: 8, right: 16, top: a.length > 1 ? 36 : 24, bottom: e.x ? 28 : 8 },
      legend: $(e, t, a.length),
      xAxis: { ...n(e.x), inverse: t.rtl, nameLocation: "middle", nameGap: 30 },
      yAxis: { ...n(a.length === 1 ? a[0]?.label : void 0), position: t.rtl ? "right" : "left" },
      tooltip: {
        trigger: "item",
        formatter: (o) => `${s(o.seriesName)}<br/>${s(e.x ?? "")}: <b>${s(t.format(o.value[0]))}</b><br/>${s(t.format(o.value[1]))}`
      },
      series: a.map((o) => ({
        id: o.key,
        name: o.label,
        type: "scatter",
        symbolSize: 9,
        ..."color" in o && o.color ? { itemStyle: { color: o.color } } : {},
        data: e.data.map((l) => [m(e.x ? l[e.x] : null), m(l[o.key])])
      }))
    };
  },
  select: (e, t) => {
    const a = e.data[t.dataIndex];
    return a ? { row: a, index: t.dataIndex, seriesKey: t.seriesId, value: m(t.seriesId ? a[t.seriesId] : void 0) ?? void 0 } : void 0;
  }
}, H = 0.03, E = {
  id: "treemap",
  modules: () => import("echarts/charts").then(g(["TreemapChart"])),
  build: (e, t) => {
    const a = f(e)[0], r = e.data.map((o) => a ? m(o[a.key]) : null), n = r.reduce((o, l) => o + Math.max(0, l ?? 0), 0);
    return {
      tooltip: {
        trigger: "item",
        formatter: (o) => `${s(o.name)}: <b>${s(t.format(o.value))}</b>`
      },
      series: [
        {
          id: a?.key,
          name: a?.label,
          type: "treemap",
          roam: !1,
          nodeClick: !1,
          breadcrumb: { show: !1 },
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          label: {
            show: !0,
            // A label wider than its tile ends in "…" instead of being cut mid-glyph.
            overflow: "truncate",
            ellipsis: "…",
            formatter: (o) => `${o.name}
${t.format(o.value)}`
          },
          itemStyle: { borderColor: t.theme.background, borderWidth: 2, gapWidth: 2 },
          data: e.data.map((o, l) => ({
            name: h(e.x ? o[e.x] : l),
            value: r[l],
            itemStyle: { color: t.theme.palette[l % t.theme.palette.length] },
            label: {
              // Text that reads on its own tile: white on the amber tile did not.
              color: B(t.theme.palette[l % t.theme.palette.length] ?? "#000"),
              // A tile under 3% of the whole has no room for a label at any
              // usual size ("M\n1." was what showed); the tooltip and the
              // table view still carry its name and value.
              show: n > 0 && Math.max(0, r[l] ?? 0) / n >= H
            }
          }))
        }
      ]
    };
  }
};
function B(e) {
  let t;
  const a = e.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (a) {
    const o = a.length === 3 ? [...a].map((l) => l + l).join("") : a;
    t = [0, 2, 4].map((l) => parseInt(o.slice(l, l + 2), 16));
  } else {
    const o = e.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    o && (t = [o[1], o[2], o[3]].map(Number));
  }
  if (!t) return "#ffffff";
  const r = t.map((o) => {
    const l = o / 255;
    return l <= 0.03928 ? l / 12.92 : ((l + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r[0] + 0.7152 * r[1] + 0.0722 * r[2] > 0.179 ? "#111111" : "#ffffff";
}
function Z(e, t, a) {
  const r = Math.min(1, Math.max(0, t > 0 ? e / t : 0)), n = 6e-3;
  return [
    [Math.max(0, r - n), "transparent"],
    [Math.min(1, r + n), a],
    [1, "transparent"]
  ];
}
const s = (e) => e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
for (const e of [
  x("bar", () => "bar"),
  x("line", () => "line"),
  x("area", () => "area"),
  x("combo", (t) => t === 0 ? "bar" : "line"),
  M("pie", !1),
  M("donut", !0),
  P,
  j,
  D,
  R,
  _,
  E
])
  K(e);
export {
  H as TREEMAP_LABEL_MIN_SHARE,
  X as buildChartOption,
  I as cartesianFrame,
  N as chartKinds,
  Q as chartTable,
  T as defaultTable,
  C as getChartKind,
  $ as legendOf,
  V as makeFormatter,
  p as mergeOption,
  B as readableOn,
  K as registerChartKind,
  J as selectionAt,
  f as seriesOf,
  U as tableToCsv,
  Z as targetStops,
  m as toNumber,
  v as waterfallBars
};
//# sourceMappingURL=index147.js.map
