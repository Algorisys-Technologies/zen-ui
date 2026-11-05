/**
 * AnalyticChart's pure contract: the registry, the option every built-in kind
 * builds, waterfall arithmetic, formatting, right to left, the table view and
 * its CSV. No browser and no echarts: the kinds' `modules()` are never called.
 */
import {
  buildChartOption,
  chartKinds,
  chartTable,
  getChartKind,
  makeFormatter,
  readableOn,
  mergeOption,
  registerChartKind,
  selectionAt,
  tableToCsv,
  targetStops,
  waterfallBars,
  type AnalyticChartSpec,
  type ChartContext,
} from "../packages/core/src/analytic-chart";
import { DEFAULT_MESSAGES } from "../packages/core/src/messages";

let f = 0;
let n = 0;
const t = (got: unknown, want: unknown, name: string) => {
  n++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

const ctx = (over: Partial<ChartContext> = {}): ChartContext => ({
  theme: {
    palette: ["#111", "#222", "#333", "#444", "#555", "#666"],
    foreground: "#000",
    muted: "#777",
    border: "#ddd",
    background: "#fff",
    surface: "#eee",
    positive: "#0a0",
    negative: "#a00",
    fontFamily: "Inter",
  },
  format: (v) => String(v),
  rtl: false,
  t: (key) => (DEFAULT_MESSAGES as Record<string, string>)[key] ?? key,
  ...over,
});

const SALES = [
  { month: "Jan", revenue: 120, cost: 80, margin: 0.33 },
  { month: "Feb", revenue: 150, cost: 90, margin: 0.4 },
  { month: "Mar", revenue: "", cost: 70, margin: 0.2 },
];

console.log("\nregistry");
const BUILT_IN = ["bar", "line", "area", "combo", "pie", "donut", "waterfall", "funnel", "gauge", "heatmap", "scatter", "treemap"];
t(chartKinds(), BUILT_IN, "the twelve built-ins, in order");
let threw = "";
try {
  buildChartOption({ type: "sankey", data: [] }, ctx());
} catch (e) {
  threw = String((e as Error).message);
}
t(threw.includes('unknown type "sankey"') && threw.includes("waterfall"), true, "an unknown type names the registered ones");
registerChartKind({ id: "sankey", modules: async () => [], build: () => ({ series: [{ type: "sankey" }] }) });
t(buildChartOption({ type: "sankey", data: [] }, ctx()).series, [{ type: "sankey" }], "an app's own kind draws through the same call");
t(chartTable({ type: "sankey", data: [{ a: 1 }], x: "a" }, ctx()).columns.length, 1, "…and gets the default table");
t(getChartKind("bar") !== undefined, true, "getChartKind finds a built-in");

console.log("\ncartesian: bar / line / area / combo");
const bar: AnalyticChartSpec = { type: "bar", data: SALES, x: "month", series: [{ key: "revenue", label: "Revenue" }, { key: "cost" }] };
const o = buildChartOption(bar, ctx());
t(o.xAxis.data, ["Jan", "Feb", "Mar"], "categories from x");
t(o.series.map((s: { type: string }) => s.type), ["bar", "bar"], "bar draws bars");
t(o.series[0].data, [120, 150, null], "an empty cell is a gap, not a zero");
t(o.series.map((s: { name: string }) => s.name), ["Revenue", "cost"], "label, else key");
t(o.legend.show, true, "legend shown for two series");
t(buildChartOption({ ...bar, series: [{ key: "revenue" }] }, ctx()).legend.show, false, "…and not for one");
t(o.color, ctx().theme.palette, "the theme palette");
t(o.aria.enabled, true, "ECharts aria description on");
const stacked = buildChartOption({ ...bar, stacked: true }, ctx());
t(stacked.series.map((s: { stack?: string }) => s.stack), ["total", "total"], "stacked: every bar series on one stack");
t(stacked.series.map((s: { itemStyle: { borderColor?: string; borderWidth?: number } }) => [s.itemStyle.borderColor, s.itemStyle.borderWidth]), [["#fff", 1], ["#fff", 1]], "stacked segments are edged in the background (a 2px gap)");
t(buildChartOption(bar, ctx()).series.map((s: { itemStyle: { borderWidth?: number } }) => s.itemStyle.borderWidth ?? 0), [0, 0], "…unstacked bars are not");
t(buildChartOption({ ...bar, type: "line" }, ctx()).series.map((s: { type: string }) => s.type), ["line", "line"], "line draws lines");
t(!!buildChartOption({ ...bar, type: "area" }, ctx()).series[0].areaStyle, true, "area fills");
const combo = buildChartOption(
  { type: "combo", data: SALES, x: "month", series: [{ key: "revenue" }, { key: "margin", axis: "secondary" }] },
  ctx({ format: (v, axis) => (axis === "secondary" ? `${v * 100}%` : `₹${v}`) }),
);
t(combo.series.map((s: { type: string }) => s.type), ["bar", "line"], "combo: first a bar, the rest lines");
t(combo.yAxis.length, 2, "a secondary series adds a second value axis");
t(combo.series[1].yAxisIndex, 1, "…and plots against it");
t([combo.yAxis[0].axisLabel.formatter(5), combo.yAxis[1].axisLabel.formatter(0.5)], ["₹5", "50%"], "each axis formats in its own format");
t(combo.series[1].tooltip.valueFormatter(0.4), "40%", "the tooltip formats a secondary value as its axis does");
t(buildChartOption({ ...bar, series: [{ key: "revenue", kind: "line" }] }, ctx()).series[0].type, "line", "a series kind overrides the chart's");

console.log("\nright to left and horizontal");
const rtl = buildChartOption(bar, ctx({ rtl: true }));
t(rtl.xAxis.inverse, true, "RTL mirrors the category axis");
t(rtl.yAxis[0].position, "right", "…and puts the value axis on the right");
t(rtl.legend.right, 0, "…and the legend at the reading start");
const h = buildChartOption({ ...bar, horizontal: true }, ctx());
t([h.yAxis.type, h.xAxis[0].type], ["category", "value"], "horizontal swaps the axes");
t(h.yAxis.inverse, true, "…first row at the top");
t(h.series[0].itemStyle.borderRadius, [0, 3, 3, 0], "…rounded at the bar's end");
t(buildChartOption({ ...bar, horizontal: true }, ctx({ rtl: true })).series[0].itemStyle.borderRadius, [3, 0, 0, 3], "…which is the left in RTL");
t(buildChartOption({ ...bar, zoom: true }, ctx()).dataZoom.map((z: { type: string }) => z.type), ["inside", "slider"], "zoom: wheel and slider");
t(buildChartOption({ ...bar, zoom: true, horizontal: true }, ctx()).dataZoom[0].yAxisIndex, 0, "…on the category axis when horizontal");

console.log("\nwaterfall");
const PL = [
  { line: "Opening", amount: 0, isTotal: true },
  { line: "Sales", amount: 500 },
  { line: "COGS", amount: -300 },
  { line: "Gross profit", isTotal: true },
  { line: "Opex", amount: -250 },
  { line: "Net", isTotal: true },
];
const wf: AnalyticChartSpec = { type: "waterfall", data: PL, x: "line", series: [{ key: "amount", label: "Amount" }], total: "isTotal" };
const bars = waterfallBars(wf);
t(bars.map((b) => [b.base, b.height]), [[0, 0], [0, 500], [200, 300], [0, 200], [-50, 250], [-50, 50]], "bases and heights, through a negative total");
t(bars.map((b) => b.running), [0, 500, 200, 200, -50, -50], "running totals");
t(bars.map((b) => b.kind), ["total", "up", "down", "total", "down", "total"], "up / down / total");
const wo = buildChartOption(wf, ctx());
t(wo.series[0].itemStyle.color, "transparent", "the base series is invisible");
t([wo.series[0].stackStrategy, wo.series[1].stackStrategy], ["all", "all"], "stacked across signs, so a negative base still lifts");
t(wo.series[1].data.map((d: { itemStyle: { color: string } }) => d.itemStyle.color), ["#111", "#0a0", "#a00", "#111", "#a00", "#111"], "rises positive, falls negative, totals primary");
t(wo.series[1].data.map((d: { value: number }) => d.value), [0, 500, 300, 200, 250, 50], "visible heights");
t(wo.series[1].data.length, wo.series[0].data.length, "the two series line up");
const wt = chartTable(wf, ctx());
t(wt.columns.map((c) => c.label), ["line", "Change", "Running total"], "table: change and running total");
t(wt.rows.map((r) => r.cells), [["Opening", null, 0], ["Sales", 500, 500], ["COGS", -300, 200], ["Gross profit", null, 200], ["Opex", -250, -50], ["Net", null, -50]], "table rows");
t(wo.tooltip.formatter([{ dataIndex: 2, name: "COGS" }]), "COGS<br/>Change: <b>-300</b><br/>Running total: 200", "tooltip: the change and where it leaves you");
t(wo.tooltip.formatter([{ dataIndex: 1, name: "Sales" }]).includes("+500"), true, "…a rise signed +");

t(selectionAt(wf, 2)?.value, -300, "selecting a waterfall step reports its change");
t(selectionAt(wf, 3)?.value, 200, "…and a total row its running total");
t(selectionAt(bar, 1, "cost"), { row: SALES[1], index: 1, seriesKey: "cost", value: 90 }, "a bar: the row and that series' value");
t(selectionAt(bar, 1)?.seriesKey, "revenue", "a table row (no series) selects the first series");
t(selectionAt(bar, 9), undefined, "out of range selects nothing");

console.log("\npie / donut / funnel / treemap");
const pie = buildChartOption({ type: "donut", data: SALES, x: "month", series: [{ key: "cost" }] }, ctx());
t(pie.series[0].radius, ["52%", "78%"], "donut has a hole");
t(buildChartOption({ type: "pie", data: SALES, x: "month", series: [{ key: "cost" }] }, ctx()).series[0].radius, [0, "78%"], "pie does not");
t(pie.series[0].data, [{ name: "Jan", value: 80 }, { name: "Feb", value: 90 }, { name: "Mar", value: 70 }], "slices from x and the first series");
t(pie.tooltip.formatter({ name: "<b>", value: 5, percent: 10 }), "&lt;b&gt;: <b>5</b> (10%)", "tooltip escapes a category name");
const funnel = buildChartOption({ type: "funnel", data: [{ s: "Leads", n: 100 }, { s: "Won", n: 12 }], x: "s", series: [{ key: "n" }] }, ctx());
t(funnel.series[0].sort, "none", "funnel keeps the stages in your order");
t(funnel.series[0].data.map((d: { value: number }) => d.value), [100, 12], "funnel values");
const tree = buildChartOption({ type: "treemap", data: SALES, x: "month", series: [{ key: "cost" }] }, ctx());
t(tree.series[0].data.map((d: { itemStyle: { color: string } }) => d.itemStyle.color), ["#111", "#222", "#333"], "treemap colours each tile from the palette");
{
  const sp: Omit<AnalyticChartSpec, "data"> = { type: "treemap", x: "k", series: [{ key: "v" }] };
  const tm = buildChartOption({ ...sp, data: [{ k: "big", v: 96 }, { k: "edge", v: 3 }, { k: "tiny", v: 1 }] }, ctx());
  t(tm.series[0].data.map((d: { label: { show: boolean } }) => d.label.show), [true, true, false], "treemap: a tile under 3% of the total has no label");
  t(tm.series[0].label.overflow, "truncate", "…and a label wider than its tile ends in an ellipsis");
  const zero = buildChartOption({ ...sp, data: [{ k: "a", v: 0 }] }, ctx());
  t(zero.series[0].data[0].label.show, false, "…an all-zero treemap labels nothing rather than dividing by zero");
}

console.log("\ngauge");
const gauge = buildChartOption({ type: "gauge", data: [{ attained: 72 }], series: [{ key: "attained", label: "Target attained" }], max: 120, target: 90 }, ctx());
t([gauge.series[0].max, gauge.series[0].data[0].value], [120, 72], "the value against max");
t(gauge.series[0].pointer.show, false, "a progress arc, not a needle");
t(gauge.series[1].silent, true, "the target mark does not take clicks");
t(targetStops(90, 120, "#000"), [[0.744, "transparent"], [0.756, "#000"], [1, "transparent"]], "the target sits at 75% of the dial");
t(targetStops(500, 100, "#000")[1]![0], 1, "a target past max clamps to the end");
t(chartTable({ type: "gauge", data: [{ a: 72 }], series: [{ key: "a", label: "Attained" }], max: 120, target: 90 }, ctx()).rows[0]!.cells, ["Attained", 72, 120, 90], "gauge table: value, max, target");

console.log("\nheatmap / scatter");
const STOCK = [
  { wh: "Pune", m: "Jan", qty: 10 },
  { wh: "Pune", m: "Feb", qty: 30 },
  { wh: "Delhi", m: "Jan", qty: 5 },
];
const heat = buildChartOption({ type: "heatmap", data: STOCK, x: "m", y: "wh", series: [{ key: "qty" }] }, ctx());
t([heat.xAxis.data, heat.yAxis.data], [["Jan", "Feb"], ["Pune", "Delhi"]], "categories in first-seen order");
t(heat.series[0].data, [[0, 0, 10], [1, 0, 30], [0, 1, 5]], "cells by index");
t([heat.visualMap.min, heat.visualMap.max], [5, 30], "colour scale from the data's range");
t(heat.visualMap.inRange.color, ["#eee", "#111"], "surface to primary");
t(buildChartOption({ type: "heatmap", data: [{ x: "a", y: "b", v: 4 }], x: "x", y: "y", series: [{ key: "v" }] }, ctx()).visualMap.max, 5, "one value: the scale still has a width");
const sc = buildChartOption({ type: "scatter", data: [{ price: 10, qty: 3 }], x: "price", y: "qty" }, ctx());
t(sc.series[0].data, [[10, 3]], "scatter: x against y");
t(buildChartOption({ type: "scatter", data: [{ price: 10, qty: 3 }], x: "price", y: "qty" }, ctx({ rtl: true })).xAxis.inverse, true, "…mirrored in RTL");

console.log("\nreadability fixes found in the browser");
const wide = buildChartOption({ ...wf }, ctx({ width: 930 }));
t([wide.xAxis.axisLabel.interval, wide.xAxis.axisLabel.overflow], [0, "break"], "with a width, every category is named and wraps");
t(wide.xAxis.axisLabel.width, Math.floor((930 - 96) / 6) - 6, "…into its own slot (6 rows)");
t(buildChartOption(wf, ctx()).xAxis.axisLabel.hideOverlap, true, "without a width, ECharts thins them");
t(buildChartOption({ ...bar, data: Array.from({ length: 40 }, (_, i) => ({ month: `d${i}`, revenue: i })) }, ctx({ width: 930 })).xAxis.axisLabel.hideOverlap, true, "too many to fit: thinned, not crushed");
t([readableOn("#F2BB13"), readableOn("#1C43B9"), readableOn("#fff"), readableOn("rgb(26, 122, 30)"), readableOn("nonsense")], ["#111111", "#ffffff", "#111111", "#ffffff", "#ffffff"], "readableOn: dark on amber and white, white on blue and green");
t(buildChartOption({ type: "donut", legend: true, data: SALES, x: "month", series: [{ key: "cost" }] }, ctx()).series[0].label.show, false, "a pie with a legend drops the slice labels");
t(buildChartOption({ type: "funnel", data: [{ s: "A", n: 1 }], x: "s", series: [{ key: "n" }] }, ctx()).series[0].label.position, "right", "funnel labels sit beside it");
t(buildChartOption({ type: "funnel", data: [{ s: "A", n: 1 }], x: "s", series: [{ key: "n" }] }, ctx({ rtl: true })).series[0].label.position, "left", "…on the left in RTL");
t(heat.yAxis.inverse, true, "heatmap rows read top-down");
t(heat.visualMap.text, ["30", "5"], "heatmap scale ends are labelled");

console.log("\nformatting");
t(makeFormatter("currency", { locale: "en-IN", currency: "INR" })(125000), "₹1,25,000.00", "currency in en-IN groups by lakh");
t(makeFormatter("currency", { locale: "de-DE", currency: "EUR" })(1234.5).replace(/\s/g, " "), "1.234,50 €", "currency in de-DE (Intl spaces it with a no-break space)");
t(makeFormatter("percent", { locale: "en-US" })(0.256), "25.6%", "percent takes a ratio");
t(makeFormatter("compact", { locale: "en-US" })(1234567), "1.2M", "compact");
t(makeFormatter("currency", { locale: "en-US" })(5), "5", "currency with no currency falls back to number");
t(makeFormatter("number", { locale: "xx-NOPE-1" })(1.5), "1.5", "an invalid locale still reads the number");
t(makeFormatter((v) => `${v}u`)(3), "3u", "your own function");

console.log("\ntable and CSV");
const table = chartTable(bar, ctx());
t(table.columns.map((c) => c.label), ["month", "Revenue", "cost"], "x, then each series");
t(table.rows[2]!.cells, ["Mar", null, 70], "a gap stays empty");
t(tableToCsv(table).split("\r\n"), ["month,Revenue,cost", "Jan,120,80", "Feb,150,90", "Mar,,70"], "CSV: raw numbers, CRLF");
t(
  tableToCsv({ columns: [{ key: "a", label: 'Say "hi", ok' }], rows: [{ index: 0, cells: ["=SUM(A1)"] }, { index: 1, cells: ["-5 net"] }] }),
  "\"Say \"\"hi\"\", ok\"\r\n'=SUM(A1)\r\n'-5 net",
  "CSV quotes, and defuses a formula",
);

console.log("\nmerging a caller's option");
t(mergeOption({ a: { b: 1, c: 2 }, d: [1] }, { a: { b: 9 }, d: [2, 3] }), { a: { b: 9, c: 2 }, d: [2, 3] }, "objects merge, arrays replace");
t(buildChartOption(bar, ctx(), { grid: { top: 99 } }).grid.top, 99, "the option prop wins over the kind");
t(buildChartOption(bar, ctx(), { grid: { top: 99 } }).grid.containLabel, true, "…without dropping what it did not name");

console.log(f ? `\n${f} FAILED (of ${n})\n` : `\nall ${n} passed\n`);
process.exit(f ? 1 : 0);
