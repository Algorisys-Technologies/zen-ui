import { AnalyticChart } from "./analytic-chart/analytic-chart";
import { registerChartKind, legendOf, seriesOf, toNumber } from "@algorisys/zen-ui-core/analytic-chart";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * AnalyticChartDemo — mirrors NewAnalyticChartDemo.tsx section for section:
 * same data, same charts. State that React keeps in hooks is a variable here,
 * and a change is an `update()` on the chart that shows it.
 */

const MONTHS = [
  { month: "Apr", revenue: 1240000, cost: 870000, margin: 0.298 },
  { month: "May", revenue: 1385000, cost: 952000, margin: 0.313 },
  { month: "Jun", revenue: 1190000, cost: 861000, margin: 0.276 },
  { month: "Jul", revenue: 1520000, cost: 1004000, margin: 0.339 },
  { month: "Aug", revenue: 1610000, cost: 1066000, margin: 0.338 },
  { month: "Sep", revenue: 1480000, cost: 1012000, margin: 0.316 },
];

const REGIONS = [
  { region: "North", retail: 420, wholesale: 610, online: 180 },
  { region: "South", retail: 530, wholesale: 480, online: 260 },
  { region: "East", retail: 310, wholesale: 390, online: 120 },
  { region: "West", retail: 590, wholesale: 720, online: 340 },
];

const PL = [
  { line: "Revenue", amount: 8425000 },
  { line: "Cost of goods", amount: -5190000 },
  { line: "Gross profit", total: true },
  { line: "Salaries", amount: -1320000 },
  { line: "Rent", amount: -420000 },
  { line: "Other income", amount: 185000 },
  { line: "Operating profit", total: true },
  { line: "Tax", amount: -432000 },
  { line: "Net profit", total: true },
];

const PIPELINE = [
  { stage: "Leads", count: 1240 },
  { stage: "Qualified", count: 610 },
  { stage: "Quotation", count: 288 },
  { stage: "Negotiation", count: 134 },
  { stage: "Won", count: 71 },
];

const WAREHOUSES = ["Pune", "Chennai", "Delhi", "Kolkata"];
const STOCK = WAREHOUSES.flatMap((wh, w) =>
  ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({
    warehouse: wh,
    month: m,
    // Deterministic, so the demo (and its screenshots) do not change per load.
    // The w * i term keeps the low cells scattered: a purely linear (aw + bi) % n
    // has a whole diagonal of zeros, which reads as a rendering bug.
    units: 200 + ((w * 7 + i * 3 + w * i * 5) % 10) * 80 + (w === 2 && i > 3 ? 600 : 0),
  })),
);

const SPEND = [
  { category: "Raw material", amount: 2840000 },
  { category: "Freight", amount: 640000 },
  { category: "Salaries", amount: 1320000 },
  { category: "Power", amount: 380000 },
  { category: "Rent", amount: 420000 },
  { category: "Maintenance", amount: 210000 },
  { category: "Marketing", amount: 160000 },
];

const ITEMS = [
  { item: "Bearing 6204", price: 180, qty: 940 },
  { item: "V-belt A42", price: 240, qty: 610 },
  { item: "Gear oil 5L", price: 1450, qty: 210 },
  { item: "Coupling L100", price: 2200, qty: 95 },
  { item: "Seal kit", price: 620, qty: 380 },
  { item: "Filter cartridge", price: 890, qty: 300 },
  { item: "Motor 2HP", price: 9800, qty: 22 },
  { item: "Valve 2in", price: 3100, qty: 70 },
];

// A year of daily orders, deterministic.
const DAILY = Array.from({ length: 365 }, (_, i) => {
  const d = new Date(Date.UTC(2025, 3, 1 + i));
  const season = Math.sin((i / 365) * Math.PI * 2) * 40;
  const weekday = d.getUTCDay() === 0 ? -60 : 0;
  return { day: d.toISOString().slice(0, 10), orders: Math.round(180 + season + weekday + ((i * 29) % 23)) };
});

const YEARS = [
  { year: "FY22", revenue: 12.4 },
  { year: "FY23", revenue: 14.1 },
  { year: "FY24", revenue: 15.8 },
  { year: "FY25", revenue: 17.3 },
];
const quarters = (year: string) =>
  ["Q1", "Q2", "Q3", "Q4"].map((q, i) => ({ quarter: `${year} ${q}`, revenue: +((YEARS.find((y) => y.year === year)?.revenue ?? 0) / 4 + (i - 1.5) * 0.3).toFixed(2) }));

// An app's own chart type, registered the same way the built-ins are. Nothing in
// AnalyticChart knows about radar charts.
registerChartKind({
  id: "radar",
  modules: () =>
    Promise.all([
      import("echarts/charts").then(({ RadarChart }) => [RadarChart]),
      import("echarts/components").then(({ RadarComponent }) => [RadarComponent]),
    ]).then((m) => m.flat()),
  build: (spec, ctx) => {
    const series = seriesOf(spec);
    const max = Math.max(...spec.data.flatMap((r) => series.map((s) => toNumber(r[s.key]) ?? 0)), 1);
    return {
      legend: legendOf(spec, ctx, series.length),
      tooltip: { trigger: "item" },
      radar: {
        indicator: spec.data.map((r) => ({ name: String(r[spec.x ?? ""] ?? ""), max })),
        axisName: { color: ctx.theme.muted },
        splitLine: { lineStyle: { color: ctx.theme.border } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: ctx.theme.border } },
      },
      series: [
        {
          type: "radar",
          data: series.map((s) => ({ name: s.label, value: spec.data.map((r) => toNumber(r[s.key]) ?? 0), areaStyle: { opacity: 0.15 } })),
        },
      ],
    };
  },
});

const SUPPLIERS = [
  { measure: "On time", acme: 92, zenith: 78 },
  { measure: "Quality", acme: 88, zenith: 94 },
  { measure: "Price", acme: 70, zenith: 85 },
  { measure: "Response", acme: 81, zenith: 66 },
  { measure: "Terms", acme: 75, zenith: 72 },
];

const inr = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const KINDS = ["bar", "line", "area", "combo", "pie", "donut", "waterfall", "funnel", "gauge", "heatmap", "scatter", "treemap"];

const column = (...children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
  d.append(...children);
  return d;
};
const twoUp = (...children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.className = "zen-grid zen-w-full zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2";
  d.append(...children);
  return d;
};
const FULL = { width: "100%" };

export default function AnalyticChartDemo(): HTMLElement {
  return DemoPage({
    title: "AnalyticChart",
    description:
      "Interactive charts for business screens: twelve built-in types, and any your app registers. Click a mark to drill down or filter, switch to the table, download PNG or CSV. Drawn by ECharts, an optional dependency loaded only when a chart appears; numbers follow the locale and currency, colours follow the theme.",
    sections: [
      {
        title: "1. Revenue and margin: combo, two axes, click to select",
        codeTitle: "Bars against a currency axis, a line against a percent axis",
        codeDescription:
          "Click a month's bar (or, in the table view, the month's button) and onSelect gets the row. The table view is how a keyboard or screen-reader user reaches the same selection: the chart itself cannot take focus.",
        code: `const chart = AnalyticChart({
  type: "combo",
  title: "Revenue and margin by month",
  data: months,
  x: "month",
  series: [
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost", kind: "bar" },
    { key: "margin", label: "Margin", kind: "line", axis: "secondary" },
  ],
  format: "compact",
  secondaryFormat: "percent",
  onSelect: (s) => show(s),
});
host.append(chart.el);`,
        render: () => {
          const picked = document.createElement("p");
          picked.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          picked.setAttribute("aria-live", "polite");
          picked.dataset.testid = "picked";
          picked.textContent = "Click a bar to select a month.";
          const chart = AnalyticChart({
            type: "combo",
            title: "Revenue and margin by month",
            data: MONTHS,
            x: "month",
            series: [
              { key: "revenue", label: "Revenue" },
              { key: "cost", label: "Cost", kind: "bar" },
              { key: "margin", label: "Margin", kind: "line", axis: "secondary" },
            ],
            format: "compact",
            secondaryFormat: "percent",
            onSelect: (p) => {
              picked.textContent = `Selected ${String(p.row.month)}: ${p.seriesKey} ${p.seriesKey === "margin" ? `${Math.round((p.value ?? 0) * 1000) / 10}%` : inr(p.value ?? 0)}`;
            },
            "data-testid": "combo",
          });
          return column(chart.el, picked);
        },
      },
      {
        title: "2. Sales by region and channel: stacked, horizontal, filtering",
        codeTitle: "stacked, horizontal, and a click that filters",
        codeDescription:
          "Clicking a region narrows the chart to it: the same onSelect that drives a DataTable filter on a real screen.",
        code: `const chart = AnalyticChart({ type: "bar", stacked: true, data: regions, x: "region",
  series: [{ key: "retail", label: "Retail" }, { key: "wholesale", label: "Wholesale" }, { key: "online", label: "Online" }],
  onSelect: (s) => chart.update({ data: regions.filter((r) => r.region === s.row.region) }) });
// flip it:
chart.update({ horizontal: true });`,
        render: () => {
          let horizontal = false;
          let region: string | undefined;
          const bar = document.createElement("div");
          bar.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-2";
          const flip = Button({ size: "sm", variant: "outline", children: "Horizontal bars" });
          const clear = Button({ size: "sm", variant: "ghost", "data-testid": "clear-region" });
          const chart = AnalyticChart({
            type: "bar",
            stacked: true,
            title: "Sales by region and channel (units)",
            data: REGIONS,
            x: "region",
            series: [
              { key: "retail", label: "Retail" },
              { key: "wholesale", label: "Wholesale" },
              { key: "online", label: "Online" },
            ],
            onSelect: (s) => setRegion(String(s.row.region)),
            "data-testid": "stacked",
          });
          const setRegion = (r: string | undefined) => {
            region = r;
            chart.update({ data: r ? REGIONS.filter((x) => x.region === r) : REGIONS });
            clear.update({ children: `Show all regions (showing ${r})` });
            bar.replaceChildren(flip.el, ...(r ? [clear.el] : []));
          };
          flip.update({
            onClick: () => {
              horizontal = !horizontal;
              chart.update({ horizontal });
              flip.update({ children: horizontal ? "Vertical bars" : "Horizontal bars" });
            },
          });
          clear.update({ onClick: () => setRegion(undefined) });
          setRegion(region);
          return column(bar, chart.el);
        },
      },
      {
        title: "3. Profit and loss: waterfall",
        codeTitle: "Rises, falls and running totals",
        codeDescription:
          "Each row is a change; a row whose total field is set shows the running total instead. Rises take the success colour, falls the error colour, totals the primary. The table view lists each change beside where it leaves you.",
        code: `AnalyticChart({ type: "waterfall", title: "Profit and loss, FY25", data: pl, x: "line",
  series: [{ key: "amount", label: "Amount" }], total: "total",
  format: "currency", currency: "INR", locale: "en-IN" })`,
        render: () =>
          AnalyticChart({
            type: "waterfall",
            title: "Profit and loss, FY25",
            data: PL,
            x: "line",
            series: [{ key: "amount", label: "Amount" }],
            total: "total",
            format: "compact",
            locale: "en-IN",
            height: 360,
            style: FULL,
            "data-testid": "waterfall",
          }).el,
      },
      {
        title: "4. Drill down: years to quarters",
        codeTitle: "onSelect swaps the data",
        codeDescription:
          "Drill-down is not a mode of the chart: it is your state. Pick a year and the same chart shows its quarters.",
        code: `const chart = AnalyticChart({ type: "bar", data: years, x: "year",
  series: [{ key: "revenue", label: "Revenue (₹ cr)" }],
  onSelect: (s) => chart.update({ data: quarters(String(s.row.year)), x: "quarter", onSelect: undefined }) });`,
        render: () => {
          const crumb = document.createElement("div");
          crumb.className = "zen-flex zen-items-center zen-gap-2 zen-text-sm";
          const up = Button({ size: "sm", variant: "outline", children: "← All years", "data-testid": "drill-up" });
          const chart = AnalyticChart({
            type: "bar",
            title: "Revenue by year",
            data: YEARS,
            x: "year",
            series: [{ key: "revenue", label: "Revenue (₹ cr)" }],
            height: 280,
            "data-testid": "drill",
          });
          const drill = (year: string | undefined) => {
            chart.update(
              year
                ? { title: `Revenue by quarter, ${year}`, data: quarters(year), x: "quarter", onSelect: undefined }
                : { title: "Revenue by year", data: YEARS, x: "year", onSelect: (s) => drill(String(s.row.year)) },
            );
            const label = document.createElement("span");
            label.className = year ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg";
            label.textContent = year ?? "Click a year to see its quarters.";
            crumb.replaceChildren(...(year ? [up.el] : []), label);
          };
          up.update({ onClick: () => drill(undefined) });
          drill(undefined);
          return column(crumb, chart.el);
        },
      },
      {
        title: "5. Sales pipeline and target: funnel and gauge",
        codeTitle: "funnel keeps your stage order; gauge shows a target mark",
        code: `AnalyticChart({ type: "funnel", title: "Pipeline", data: pipeline, x: "stage", series: [{ key: "count", label: "Opportunities" }] })
AnalyticChart({ type: "gauge", title: "Quarter target", data: [{ attained: 7.8 }],
  series: [{ key: "attained", label: "₹ crore booked" }], max: 10, target: 9 })`,
        render: () =>
          twoUp(
            AnalyticChart({
              type: "funnel",
              title: "Sales pipeline, this quarter",
              data: PIPELINE,
              x: "stage",
              series: [{ key: "count", label: "Opportunities" }],
              height: 280,
              "data-testid": "funnel",
            }).el,
            AnalyticChart({
              type: "gauge",
              title: "Quarter target",
              description: "7.8 of 10 crore booked; the mark is the 9 crore target",
              data: [{ attained: 7.8 }],
              series: [{ key: "attained", label: "₹ crore booked" }],
              max: 10,
              target: 9,
              height: 280,
              "data-testid": "gauge",
            }).el,
          ),
      },
      {
        title: "6. Stock by warehouse and month: heatmap",
        codeTitle: "x and y are categories; the colour is the value",
        code: `AnalyticChart({ type: "heatmap", title: "Units in stock", data: stock, x: "month", y: "warehouse",
  series: [{ key: "units", label: "Units" }] })`,
        render: () =>
          AnalyticChart({
            type: "heatmap",
            title: "Units in stock by warehouse and month",
            data: STOCK,
            x: "month",
            y: "warehouse",
            series: [{ key: "units", label: "Units" }],
            height: 300,
            style: FULL,
            "data-testid": "heatmap",
          }).el,
      },
      {
        title: "7. Where the money goes: treemap and donut",
        code: `AnalyticChart({ type: "treemap", data: spend, x: "category", series: [{ key: "amount" }], format: "currency", currency: "INR" })
AnalyticChart({ type: "donut", legend: true, data: spend, x: "category", series: [{ key: "amount" }], format: "currency", currency: "INR" })`,
        render: () =>
          twoUp(
            AnalyticChart({
              type: "treemap",
              title: "Spend by category",
              data: SPEND,
              x: "category",
              series: [{ key: "amount", label: "Spend" }],
              format: "compact",
              locale: "en-IN",
              height: 300,
              "data-testid": "treemap",
            }).el,
            AnalyticChart({
              type: "donut",
              legend: true,
              title: "Share of spend",
              data: SPEND,
              x: "category",
              series: [{ key: "amount", label: "Spend" }],
              format: "currency",
              currency: "INR",
              locale: "en-IN",
              height: 300,
              "data-testid": "donut",
            }).el,
          ),
      },
      {
        title: "8. Price against volume: scatter",
        code: `AnalyticChart({ type: "scatter", data: items, x: "price", y: "qty", format: "number" })`,
        render: () =>
          AnalyticChart({
            type: "scatter",
            title: "Unit price against quantity sold",
            data: ITEMS,
            x: "price",
            series: [{ key: "qty", label: "Quantity sold" }],
            height: 300,
            style: FULL,
            "data-testid": "scatter",
          }).el,
      },
      {
        title: "9. A year of daily orders: zoom, canvas renderer",
        codeTitle: "zoom adds a slider and wheel zoom; canvas for many points",
        code: `AnalyticChart({ type: "area", zoom: true, renderer: "canvas", data: daily, x: "day", series: [{ key: "orders", label: "Orders" }] })`,
        render: () =>
          AnalyticChart({
            type: "area",
            zoom: true,
            renderer: "canvas",
            title: "Orders per day, FY25",
            data: DAILY,
            x: "day",
            series: [{ key: "orders", label: "Orders" }],
            height: 320,
            style: FULL,
            "data-testid": "zoom",
          }).el,
      },
      {
        title: "10. A chart type of your own: radar",
        codeTitle: "registerChartKind: the same call the built-ins use",
        codeDescription:
          "A kind names the ECharts parts it needs (loaded on first use) and builds an option from the spec, theme and formatter. The toolbar, table view, CSV, theming and selection come with it.",
        code: `registerChartKind({
  id: "radar",
  modules: () => Promise.all([
    import("echarts/charts").then(({ RadarChart }) => [RadarChart]),
    import("echarts/components").then(({ RadarComponent }) => [RadarComponent]),
  ]).then((m) => m.flat()),
  build: (spec, ctx) => ({ radar: { indicator: … }, series: [{ type: "radar", data: … }] }),
});

AnalyticChart({ type: "radar", data: suppliers, x: "measure",
  series: [{ key: "acme", label: "Acme" }, { key: "zenith", label: "Zenith" }] })`,
        render: () =>
          AnalyticChart({
            type: "radar",
            title: "Supplier scorecard",
            data: SUPPLIERS,
            x: "measure",
            series: [
              { key: "acme", label: "Acme Bearings" },
              { key: "zenith", label: "Zenith Tools" },
            ],
            height: 320,
            style: FULL,
            "data-testid": "radar",
          }).el,
      },
      {
        title: "11. Every built-in type",
        codeTitle: "chartKinds() lists what is registered",
        code: `chartKinds() // ${KINDS.join(", ")}`,
        render: () => {
          const ul = document.createElement("ul");
          ul.className = "zen-m-0 zen-flex zen-flex-wrap zen-gap-2 zen-p-0";
          ul.dataset.testid = "kinds";
          for (const k of KINDS) {
            const li = document.createElement("li");
            li.className = "zen-list-none zen-rounded-zen-sm zen-bg-zen-muted zen-px-2 zen-py-0.5 zen-font-mono zen-text-xs";
            li.textContent = k;
            ul.append(li);
          }
          return ul;
        },
      },
    ],
  });
}
