const I = /* @__PURE__ */ new Map();
function T(e) {
  I.set(e.id, e);
}
function A(e) {
  return I.get(e);
}
function W() {
  return [...I.keys()];
}
function d(e) {
  if (typeof e == "number") return Number.isFinite(e) ? e : null;
  if (typeof e == "string" && e.trim() !== "") {
    const t = Number(e);
    return Number.isFinite(t) ? t : null;
  }
  return null;
}
const y = (e) => e == null ? "" : String(e);
function U(e, t = {}) {
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
function b(e) {
  return (e.series ?? []).map((t) => ({ ...t, label: t.label ?? t.key }));
}
function X(e, t, a) {
  const r = A(e.type), n = a ?? e.series?.[0]?.key;
  if (r?.select) return r.select(e, { dataIndex: t, seriesId: n });
  const o = e.data[t];
  if (o)
    return { row: o, index: t, seriesKey: n, value: (n ? d(o[n]) : null) ?? void 0 };
}
function O(e) {
  const t = b(e);
  return {
    columns: [
      ...e.x ? [{ key: e.x, label: e.x }] : [],
      ...t.map((a) => ({ key: a.key, label: a.label, numeric: !0, axis: a.axis }))
    ],
    rows: e.data.map((a, r) => ({
      index: r,
      cells: [...e.x ? [y(a[e.x])] : [], ...t.map((n) => d(a[n.key]))]
    }))
  };
}
function Y(e, t) {
  const a = A(e.type);
  return a?.table ? a.table(e, t) : O(e);
}
function ee(e) {
  const t = (a) => {
    if (a === null) return "";
    if (typeof a == "number") return String(a);
    const r = /^[=+\-@\t\r]/.test(a) ? `'${a}` : a;
    return /[",\r\n]/.test(r) ? `"${r.replace(/"/g, '""')}"` : r;
  };
  return [e.columns.map((a) => t(a.label)), ...e.rows.map((a) => a.cells.map(t))].map((a) => a.join(",")).join(`\r
`);
}
const z = (e) => typeof e == "object" && e !== null && !Array.isArray(e);
function $(e, t) {
  if (!t) return e;
  const a = { ...e };
  for (const [r, n] of Object.entries(t))
    a[r] = z(n) && z(a[r]) ? $(a[r], n) : n;
  return a;
}
function te(e, t, a) {
  const r = A(e.type);
  if (!r) throw new Error(`AnalyticChart: unknown type "${e.type}". Registered: ${W().join(", ")}.`);
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
        const s = d(l);
        return s === null ? "" : t.format(s);
      }
    },
    aria: {
      enabled: !0,
      ...e.description ? { label: { description: e.description } } : {}
    }
  };
  return $($(o, r.build(e, t)), a);
}
function F(e, t, a) {
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
function w(e, t, a = {}) {
  const { theme: r, rtl: n } = t, o = a.categories ?? e.data.map((c) => y(e.x ? c[e.x] : "")), l = { color: r.muted, fontFamily: r.fontFamily }, s = t.width && !e.horizontal ? Math.floor((t.width - 96) / Math.max(1, o.length)) - 6 : 0, i = s >= 36 && o.length <= 24, h = {
    type: "category",
    data: o,
    boundaryGap: a.boundaryGap ?? !0,
    axisLine: { lineStyle: { color: r.border } },
    axisTick: { show: !1 },
    axisLabel: i ? { ...l, interval: 0, width: s, overflow: "break", lineHeight: 14 } : { ...l, hideOverlap: !0 }
  }, m = (c) => ({
    type: "value",
    axisLabel: { ...l, formatter: (k) => t.format(k, c) },
    splitLine: { show: c === "primary", lineStyle: { color: r.border, type: "dashed" } },
    axisLine: { show: !1 }
  }), f = a.secondary ? [m("primary"), m("secondary")] : [m("primary")], L = {
    containLabel: !0,
    left: 8,
    right: 8,
    top: e.legend ?? (e.series?.length ?? 0) > 1 ? 36 : 12,
    bottom: e.zoom ? 44 : 8
  }, M = e.horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 }, v = e.zoom ? [
    { type: "inside", ...M },
    {
      type: "slider",
      ...M,
      height: 18,
      bottom: 8,
      borderColor: r.border,
      fillerColor: "rgba(127,127,127,0.15)",
      textStyle: l
    }
  ] : void 0;
  return e.horizontal ? {
    grid: L,
    // Horizontal bars read top-down: the first row at the top.
    yAxis: { ...h, inverse: !0, position: n ? "right" : "left" },
    xAxis: f.map((c, k) => ({ ...c, inverse: n, position: k === 0 ? "bottom" : "top" })),
    ...v ? { dataZoom: v } : {}
  } : {
    grid: L,
    xAxis: { ...h, inverse: n },
    yAxis: f.map((c, k) => ({ ...c, position: k === 0 !== n ? "left" : "right" })),
    ...v ? { dataZoom: v } : {}
  };
}
function P(e, t, a) {
  return b(e).map((r, n) => {
    const o = r.kind ?? a(n), l = r.stack ?? (e.stacked && o !== "line" ? "total" : void 0), s = {
      id: r.key,
      name: r.label,
      data: e.data.map((i) => d(i[r.key])),
      ...r.color ? { itemStyle: { color: r.color } } : {},
      ...l ? { stack: l } : {},
      ...r.axis === "secondary" ? e.horizontal ? { xAxisIndex: 1 } : { yAxisIndex: 1 } : {},
      emphasis: { focus: "series" },
      tooltip: { valueFormatter: (i) => D(t, i, r.axis) }
    };
    if (o === "bar") {
      const h = e.horizontal ? t.rtl ? [3, 0, 0, 3] : [0, 3, 3, 0] : [3, 3, 0, 0];
      return {
        ...s,
        type: "bar",
        barMaxWidth: 48,
        // Stacked segments get a 1px background-coloured edge, so neighbours sit
        // 2px apart and read as separate quantities rather than one bar.
        itemStyle: {
          ...r.color ? { color: r.color } : {},
          borderRadius: l ? 0 : h,
          ...l ? { borderColor: t.theme.background, borderWidth: 1 } : {}
        }
      };
    }
    return {
      ...s,
      type: "line",
      symbol: "circle",
      symbolSize: 6,
      showSymbol: e.data.length <= 40,
      connectNulls: !1,
      ...o === "area" ? { areaStyle: { opacity: l ? 0.6 : 0.15 } } : {}
    };
  });
}
const D = (e, t, a) => {
  const r = d(t);
  return r === null ? "" : e.format(r, a);
}, R = (e) => (e.series ?? []).some((t) => t.axis === "secondary"), g = (e) => (t) => e.map((a) => t[a]), x = (e, t) => ({
  id: e,
  modules: () => Promise.all([
    import("echarts/charts").then(({ BarChart: a, LineChart: r }) => [a, r]),
    import("echarts/components").then(({ GridComponent: a, DataZoomComponent: r }) => [a, r])
  ]).then((a) => a.flat()),
  build: (a, r) => ({
    ...w(a, r, {
      secondary: R(a),
      boundaryGap: (a.series ?? []).some((n, o) => (n.kind ?? t(o)) === "bar")
    }),
    legend: F(a, r, a.series?.length ?? 0),
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    series: P(a, r, t)
  }),
  select: (a, r) => {
    const n = a.data[r.dataIndex];
    if (!n) return;
    const o = d(r.seriesId ? n[r.seriesId] : void 0) ?? void 0;
    return { row: n, index: r.dataIndex, seriesKey: r.seriesId, value: o };
  }
}), K = (e, t) => ({
  id: e,
  modules: () => import("echarts/charts").then(({ PieChart: a }) => [a]),
  build: (a, r) => {
    const n = b(a)[0], o = a.data.map((l, s) => ({
      name: y(a.x ? l[a.x] : s),
      value: n ? d(l[n.key]) : null
    }));
    return {
      legend: { ...F(a, r, o.length), show: a.legend ?? !1, type: "scroll" },
      tooltip: {
        trigger: "item",
        formatter: (l) => `${u(l.name)}: <b>${u(r.format(l.value))}</b> (${l.percent}%)`
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
    return n ? { row: n, index: r.dataIndex, seriesKey: o?.key, value: d(o ? n[o.key] : void 0) ?? void 0 } : void 0;
  }
});
function p(e) {
  const t = e.series?.[0]?.key;
  let a = 0;
  return e.data.map((r) => {
    if (e.total && r[e.total])
      return { base: Math.min(0, a), height: Math.abs(a), running: a, change: null, kind: "total" };
    const n = (t ? d(r[t]) : null) ?? 0, o = a;
    return a += n, { base: Math.min(o, a), height: Math.abs(n), running: a, change: n, kind: n >= 0 ? "up" : "down" };
  });
}
const _ = {
  id: "waterfall",
  modules: () => Promise.all([
    import("echarts/charts").then(({ BarChart: e }) => [e]),
    import("echarts/components").then(({ GridComponent: e, DataZoomComponent: t }) => [e, t])
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const a = p(e), r = b(e)[0], n = { up: t.theme.positive, down: t.theme.negative, total: t.theme.palette[0] };
    return {
      ...w({ ...e, legend: !1 }, t),
      legend: { show: !1 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (o) => {
          const l = o[0]?.dataIndex ?? 0, s = a[l];
          if (!s) return "";
          const i = u(o[0]?.name ?? "");
          if (s.kind === "total") return `${i}<br/>${u(t.t("analyticChart.total"))}: <b>${u(t.format(s.running))}</b>`;
          const h = (s.change ?? 0) > 0 ? `+${t.format(s.change ?? 0)}` : t.format(s.change ?? 0);
          return `${i}<br/>${u(t.t("analyticChart.change"))}: <b>${u(h)}</b><br/>${u(t.t("analyticChart.runningTotal"))}: ${u(t.format(s.running))}`;
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
    const a = p(e);
    return {
      columns: [
        ...e.x ? [{ key: e.x, label: e.x }] : [],
        { key: "change", label: t.t("analyticChart.change"), numeric: !0 },
        { key: "running", label: t.t("analyticChart.runningTotal"), numeric: !0 }
      ],
      rows: e.data.map((r, n) => ({
        index: n,
        cells: [...e.x ? [y(r[e.x])] : [], a[n]?.change ?? null, a[n]?.running ?? null]
      }))
    };
  },
  select: (e, t) => {
    const a = e.data[t.dataIndex];
    if (!a) return;
    const r = p(e)[t.dataIndex];
    return { row: a, index: t.dataIndex, seriesKey: e.series?.[0]?.key, value: r?.change ?? r?.running };
  }
};
function S(e) {
  const t = e.series?.[0]?.key, a = e.data.map((i, h) => ({
    index: h,
    label: y(e.x ? i[e.x] : ""),
    value: Math.max(0, (t ? d(i[t]) : null) ?? 0),
    blank: t ? d(i[t]) === null : !0
  }));
  a.sort((i, h) => h.value - i.value || Number(i.blank) - Number(h.blank) || i.index - h.index);
  const r = a.reduce((i, h) => i + h.value, 0);
  let n = 0;
  const o = a.map((i) => (n += i.value, { index: i.index, label: i.label, value: i.value, cumulative: n, share: r > 0 ? n / r : 0 })), l = e.threshold ?? 0.8, s = o.findIndex((i) => i.share >= l - 1e-9);
  return { rows: o, total: r, vitalCount: r > 0 ? s < 0 ? o.length : s + 1 : 0 };
}
const C = (e, t = 1) => {
  let a;
  try {
    a = new Intl.NumberFormat(e.locale, { style: "percent", maximumFractionDigits: t });
  } catch {
    a = new Intl.NumberFormat(void 0, { style: "percent", maximumFractionDigits: t });
  }
  return (r) => a.format(r);
}, G = {
  id: "pareto",
  modules: () => Promise.all([
    import("echarts/charts").then(({ BarChart: e, LineChart: t }) => [e, t]),
    import("echarts/components").then(({ GridComponent: e, DataZoomComponent: t, MarkLineComponent: a }) => [
      e,
      t,
      a
    ])
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const { rows: a, vitalCount: r } = S(e), n = b(e)[0], o = C(t), l = C(t, 0), s = e.threshold ?? 0.8, i = w({ ...e, horizontal: !1, legend: !1 }, t, {
      secondary: !0,
      categories: a.map((m) => m.label)
    });
    i.yAxis[1] = {
      ...i.yAxis[1],
      min: 0,
      max: 1,
      axisLabel: { ...i.yAxis[1].axisLabel, formatter: (m) => l(m) }
    };
    const h = n?.color ?? t.theme.palette[0];
    return {
      ...i,
      legend: { show: !1 },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (m) => {
          const f = a[m[0]?.dataIndex ?? 0];
          return f ? `${u(f.label)}<br/>${u(n?.label ?? "")}: <b>${u(t.format(f.value))}</b><br/>${u(t.t("analyticChart.cumulative"))}: ${u(o(f.share))}` : "";
        }
      },
      series: [
        {
          id: n?.key ?? "value",
          name: n?.label,
          type: "bar",
          barMaxWidth: 48,
          // The vital few in full colour; the trivial many faded — the chart's
          // whole point is which bars to fix first.
          data: a.map((m, f) => ({ value: m.value, itemStyle: { color: h, opacity: f < r ? 1 : 0.45, borderRadius: [3, 3, 0, 0] } }))
        },
        {
          id: "__cumulative",
          name: t.t("analyticChart.cumulative"),
          type: "line",
          yAxisIndex: 1,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: t.theme.foreground, width: 2 },
          itemStyle: { color: t.theme.foreground },
          data: a.map((m) => m.share),
          markLine: {
            silent: !0,
            symbol: "none",
            lineStyle: { color: t.theme.muted, type: "dashed" },
            // At the line's start, inside the plot: at its end it lands on
            // the axis's own tick label and the two print over each other.
            label: { formatter: () => o(s), color: t.theme.muted, position: "insideStartTop" },
            data: [{ yAxis: s }]
          }
        }
      ]
    };
  },
  table: (e, t) => {
    const { rows: a } = S(e), r = b(e)[0], n = C(t);
    return {
      columns: [
        ...e.x ? [{ key: e.x, label: e.x }] : [],
        { key: r?.key ?? "value", label: r?.label ?? "", numeric: !0 },
        { key: "cumulative", label: t.t("analyticChart.cumulative"), numeric: !0 }
      ],
      rows: a.map((o, l) => ({
        index: l,
        cells: [...e.x ? [o.label] : [], o.value, n(o.share)]
      }))
    };
  },
  // A click and a table row both give the position in Pareto order; this maps
  // it back to the row in `data`, so the two cannot report different things.
  select: (e, t) => {
    const a = S(e).rows[t.dataIndex];
    if (a)
      return { row: e.data[a.index], index: a.index, seriesKey: e.series?.[0]?.key, value: a.value };
  }
}, j = {
  id: "funnel",
  modules: () => import("echarts/charts").then(g(["FunnelChart"])),
  build: (e, t) => {
    const a = b(e)[0];
    return {
      legend: { show: !1 },
      tooltip: {
        trigger: "item",
        formatter: (r) => `${u(r.name)}: <b>${u(t.format(r.value))}</b>`
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
          data: e.data.map((r, n) => ({ name: y(e.x ? r[e.x] : n), value: a ? d(r[a.key]) : null }))
        }
      ]
    };
  }
}, H = {
  id: "gauge",
  modules: () => import("echarts/charts").then(g(["GaugeChart"])),
  build: (e, t) => {
    const a = b(e)[0], r = (a ? d(e.data[0]?.[a.key]) : null) ?? 0, n = e.max ?? 100, o = 16;
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
            axisLine: { lineStyle: { width: o + 8, color: J(e.target, n, t.theme.foreground) } },
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
    const a = b(e)[0];
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
            a ? d(e.data[0]?.[a.key]) : null,
            e.max ?? 100,
            ...e.target !== void 0 ? [e.target] : []
          ]
        }
      ]
    };
  },
  select: (e) => {
    const t = e.data[0], a = e.series?.[0];
    return t ? { row: t, index: 0, seriesKey: a?.key, value: d(a ? t[a.key] : void 0) ?? void 0 } : void 0;
  }
}, N = (e, t) => {
  const a = /* @__PURE__ */ new Set();
  for (const r of e) a.add(y(t ? r[t] : ""));
  return [...a];
}, E = {
  id: "heatmap",
  modules: () => Promise.all([
    import("echarts/charts").then(g(["HeatmapChart"])),
    import("echarts/components").then(g(["GridComponent", "VisualMapComponent"]))
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const a = b(e)[0], r = N(e.data, e.x), n = N(e.data, e.y), o = e.data.map((m) => a ? d(m[a.key]) : null), l = o.filter((m) => m !== null), s = l.length ? Math.min(...l) : 0, i = l.length ? Math.max(...l) : 1, h = w({ ...e, horizontal: !1, zoom: !1, legend: !1 }, t, { categories: r });
    return {
      ...h,
      grid: { ...h.grid, bottom: 44 },
      // Rows read top-down in the data's order, as a table would.
      yAxis: {
        ...h.xAxis,
        data: n,
        inverse: !0,
        position: t.rtl ? "right" : "left",
        splitArea: { show: !1 },
        axisLabel: { color: t.theme.muted, fontFamily: t.theme.fontFamily }
      },
      legend: { show: !1 },
      tooltip: {
        trigger: "item",
        formatter: (m) => `${u(r[m.value[0]] ?? "")} · ${u(n[m.value[1]] ?? "")}: <b>${u(m.value[2] === null ? "" : t.format(m.value[2]))}</b>`
      },
      visualMap: {
        min: s,
        max: i === s ? s + 1 : i,
        calculable: !1,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemHeight: 120,
        itemWidth: 10,
        // The scale's ends, labelled: a colour ramp with no numbers reads as decoration.
        text: [t.format(i === s ? s + 1 : i), t.format(s)],
        textGap: 8,
        textStyle: { color: t.theme.muted },
        inRange: { color: [t.theme.surface, a?.color ?? t.theme.palette[0]] }
      },
      series: [
        {
          id: a?.key,
          name: a?.label,
          type: "heatmap",
          data: e.data.map((m, f) => [r.indexOf(y(e.x ? m[e.x] : "")), n.indexOf(y(e.y ? m[e.y] : "")), o[f]]),
          itemStyle: { borderColor: t.theme.background, borderWidth: 2 },
          emphasis: { itemStyle: { borderColor: t.theme.foreground, borderWidth: 1 } }
        }
      ]
    };
  },
  table: (e) => {
    const t = b(e)[0];
    return {
      columns: [
        ...e.x ? [{ key: e.x, label: e.x }] : [],
        ...e.y ? [{ key: e.y, label: e.y }] : [],
        ...t ? [{ key: t.key, label: t.label, numeric: !0 }] : []
      ],
      rows: e.data.map((a, r) => ({
        index: r,
        cells: [
          ...e.x ? [y(a[e.x])] : [],
          ...e.y ? [y(a[e.y])] : [],
          ...t ? [d(a[t.key])] : []
        ]
      }))
    };
  }
}, B = {
  id: "scatter",
  modules: () => Promise.all([
    import("echarts/charts").then(g(["ScatterChart"])),
    import("echarts/components").then(g(["GridComponent", "DataZoomComponent"]))
  ]).then((e) => e.flat()),
  build: (e, t) => {
    const a = e.series?.length ? b(e) : e.y ? [{ key: e.y, label: e.y }] : [], r = { color: t.theme.muted, fontFamily: t.theme.fontFamily }, n = (o) => ({
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
      legend: F(e, t, a.length),
      xAxis: { ...n(e.x), inverse: t.rtl, nameLocation: "middle", nameGap: 30 },
      yAxis: { ...n(a.length === 1 ? a[0]?.label : void 0), position: t.rtl ? "right" : "left" },
      tooltip: {
        trigger: "item",
        formatter: (o) => `${u(o.seriesName)}<br/>${u(e.x ?? "")}: <b>${u(t.format(o.value[0]))}</b><br/>${u(t.format(o.value[1]))}`
      },
      series: a.map((o) => ({
        id: o.key,
        name: o.label,
        type: "scatter",
        symbolSize: 9,
        ..."color" in o && o.color ? { itemStyle: { color: o.color } } : {},
        data: e.data.map((l) => [d(e.x ? l[e.x] : null), d(l[o.key])])
      }))
    };
  },
  select: (e, t) => {
    const a = e.data[t.dataIndex];
    return a ? { row: a, index: t.dataIndex, seriesKey: t.seriesId, value: d(t.seriesId ? a[t.seriesId] : void 0) ?? void 0 } : void 0;
  }
}, Z = 0.03, q = {
  id: "treemap",
  modules: () => import("echarts/charts").then(g(["TreemapChart"])),
  build: (e, t) => {
    const a = b(e)[0], r = e.data.map((o) => a ? d(o[a.key]) : null), n = r.reduce((o, l) => o + Math.max(0, l ?? 0), 0);
    return {
      tooltip: {
        trigger: "item",
        formatter: (o) => `${u(o.name)}: <b>${u(t.format(o.value))}</b>`
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
            name: y(e.x ? o[e.x] : l),
            value: r[l],
            itemStyle: { color: t.theme.palette[l % t.theme.palette.length] },
            label: {
              // Text that reads on its own tile: white on the amber tile did not.
              color: V(t.theme.palette[l % t.theme.palette.length] ?? "#000"),
              // A tile under 3% of the whole has no room for a label at any
              // usual size ("M\n1." was what showed); the tooltip and the
              // table view still carry its name and value.
              show: n > 0 && Math.max(0, r[l] ?? 0) / n >= Z
            }
          }))
        }
      ]
    };
  }
};
function V(e) {
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
function J(e, t, a) {
  const r = Math.min(1, Math.max(0, t > 0 ? e / t : 0)), n = 6e-3;
  return [
    [Math.max(0, r - n), "transparent"],
    [Math.min(1, r + n), a],
    [1, "transparent"]
  ];
}
const u = (e) => e.replace(/[&<>"']/g, (t) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[t]);
for (const e of [
  x("bar", () => "bar"),
  x("line", () => "line"),
  x("area", () => "area"),
  x("combo", (t) => t === 0 ? "bar" : "line"),
  K("pie", !1),
  K("donut", !0),
  _,
  j,
  H,
  E,
  B,
  q,
  G
])
  T(e);
export {
  Z as TREEMAP_LABEL_MIN_SHARE,
  te as buildChartOption,
  w as cartesianFrame,
  W as chartKinds,
  Y as chartTable,
  O as defaultTable,
  A as getChartKind,
  F as legendOf,
  U as makeFormatter,
  $ as mergeOption,
  S as paretoRows,
  V as readableOn,
  T as registerChartKind,
  X as selectionAt,
  b as seriesOf,
  ee as tableToCsv,
  J as targetStops,
  d as toNumber,
  p as waterfallBars
};
//# sourceMappingURL=index184.js.map
