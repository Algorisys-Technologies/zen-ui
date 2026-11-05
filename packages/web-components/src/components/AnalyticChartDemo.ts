import { registerChartKind, legendOf, seriesOf, toNumber, type ChartSelection } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * AnalyticChart demo — the web-components port, section for section with
 * NewAnalyticChartDemo.tsx. Every chart is a real <zen-analytic-chart>: the
 * scalar settings are attributes, `data` / `series` / `title` are properties,
 * and a click arrives as a `zen-select` event (whose listener is also what makes
 * the marks look clickable at all).
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

type ChartEl = HTMLElement & Record<string, unknown>;

/** A <zen-analytic-chart> with `attrs` as attributes and `props` as properties. */
function chart(attrs: Record<string, string>, props: Record<string, unknown>): ChartEl {
  const el = document.createElement("zen-analytic-chart") as ChartEl;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  Object.assign(el, props);
  return el;
}
const onSelect = (el: HTMLElement, fn: (s: ChartSelection) => void) =>
  el.addEventListener("zen-select", (e) => fn((e as CustomEvent<ChartSelection>).detail));

const wrap = (className: string, ...children: Node[]): HTMLElement => {
  const d = document.createElement("div");
  d.className = className;
  d.append(...children);
  return d;
};
const column = (...c: Node[]) => wrap("zen-flex zen-w-full zen-flex-col zen-gap-2", ...c);
const twoUp = (...c: Node[]) => wrap("zen-grid zen-w-full zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2", ...c);
/** A chart fills its preview row (a bare host is display: contents). */
const full = (el: ChartEl) => wrap("zen-w-full", el);
const button = (label: string, variant: string, testid?: string): HTMLElement => {
  const b = document.createElement("zen-button");
  b.setAttribute("size", "sm");
  b.setAttribute("variant", variant);
  if (testid) b.dataset.testid = testid;
  b.textContent = label;
  return b;
};

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
          "Click a month's bar (or, in the table view, the month's button) and zen-select carries the row. The table view is how a keyboard or screen-reader user reaches the same selection: the chart itself cannot take focus.",
        code: `<zen-analytic-chart id="pnl" type="combo" x="month" format="compact" secondary-format="percent"></zen-analytic-chart>
<script>
  const el = document.getElementById("pnl");
  el.title = "Revenue and margin by month";
  el.data = months;
  el.series = [
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost", kind: "bar" },
    { key: "margin", label: "Margin", kind: "line", axis: "secondary" },
  ];
  el.addEventListener("zen-select", (e) => show(e.detail));
</script>`,
        render: () => {
          const picked = document.createElement("p");
          picked.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
          picked.setAttribute("aria-live", "polite");
          picked.dataset.testid = "picked";
          picked.textContent = "Click a bar to select a month.";
          const el = chart(
            { type: "combo", x: "month", format: "compact", "secondary-format": "percent", "data-testid": "combo" },
            {
              title: "Revenue and margin by month",
              data: MONTHS,
              series: [
                { key: "revenue", label: "Revenue" },
                { key: "cost", label: "Cost", kind: "bar" },
                { key: "margin", label: "Margin", kind: "line", axis: "secondary" },
              ],
            },
          );
          onSelect(el, (p) => {
            picked.textContent = `Selected ${String(p.row.month)}: ${p.seriesKey} ${p.seriesKey === "margin" ? `${Math.round((p.value ?? 0) * 1000) / 10}%` : inr(p.value ?? 0)}`;
          });
          return column(full(el), picked);
        },
      },
      {
        title: "2. Sales by region and channel: stacked, horizontal, filtering",
        codeTitle: "stacked, horizontal, and a click that filters",
        codeDescription:
          "Clicking a region narrows the chart to it: the same zen-select that drives a DataTable filter on a real screen.",
        code: `<zen-analytic-chart id="sales" type="bar" stacked x="region"></zen-analytic-chart>
<script>
  const el = document.getElementById("sales");
  el.data = regions;
  el.series = [{ key: "retail", label: "Retail" }, { key: "wholesale", label: "Wholesale" }, { key: "online", label: "Online" }];
  el.addEventListener("zen-select", (e) => (el.data = regions.filter((r) => r.region === e.detail.row.region)));
  // flip it:
  el.toggleAttribute("horizontal", true);
</script>`,
        render: () => {
          const bar = wrap("zen-flex zen-flex-wrap zen-items-center zen-gap-2");
          const flip = button("Horizontal bars", "outline");
          const clear = button("", "ghost", "clear-region");
          const el = chart(
            { type: "bar", stacked: "", x: "region", "data-testid": "stacked" },
            {
              title: "Sales by region and channel (units)",
              data: REGIONS,
              series: [
                { key: "retail", label: "Retail" },
                { key: "wholesale", label: "Wholesale" },
                { key: "online", label: "Online" },
              ],
            },
          );
          const setRegion = (r: string | undefined) => {
            el.data = r ? REGIONS.filter((x) => x.region === r) : REGIONS;
            clear.textContent = `Show all regions (showing ${r})`;
            bar.replaceChildren(flip, ...(r ? [clear] : []));
          };
          onSelect(el, (s) => setRegion(String(s.row.region)));
          flip.addEventListener("click", () => {
            const h = el.toggleAttribute("horizontal");
            flip.textContent = h ? "Vertical bars" : "Horizontal bars";
          });
          clear.addEventListener("click", () => setRegion(undefined));
          setRegion(undefined);
          return column(bar, full(el));
        },
      },
      {
        title: "3. Profit and loss: waterfall",
        codeTitle: "Rises, falls and running totals",
        codeDescription:
          "Each row is a change; a row whose total field is set shows the running total instead. Rises take the success colour, falls the error colour, totals the primary. The table view lists each change beside where it leaves you.",
        code: `<zen-analytic-chart type="waterfall" x="line" total="total" format="currency" currency="INR" locale="en-IN"
  series='[{"key":"amount","label":"Amount"}]'></zen-analytic-chart>
<!-- el.title = "Profit and loss, FY25"; el.data = pl; -->`,
        render: () =>
          full(
            chart(
              { type: "waterfall", x: "line", total: "total", format: "compact", locale: "en-IN", height: "360", "data-testid": "waterfall" },
              { title: "Profit and loss, FY25", data: PL, series: [{ key: "amount", label: "Amount" }] },
            ),
          ),
      },
      {
        title: "4. Drill down: years to quarters",
        codeTitle: "zen-select swaps the data",
        codeDescription:
          "Drill-down is not a mode of the chart: it is your state. Pick a year and the same chart shows its quarters.",
        code: `<zen-analytic-chart id="rev" type="bar" x="year"></zen-analytic-chart>
<script>
  const el = document.getElementById("rev");
  el.data = years;
  el.series = [{ key: "revenue", label: "Revenue (₹ cr)" }];
  // The onSelect PROPERTY rather than a zen-select listener: it can be cleared,
  // and a chart with neither does not look clickable (a quarter is not).
  el.onSelect = (s) => {
    el.setAttribute("x", "quarter");
    el.data = quarters(String(s.row.year));
    el.onSelect = undefined;
  };
</script>`,
        render: () => {
          const crumb = wrap("zen-flex zen-items-center zen-gap-2 zen-text-sm");
          const up = button("← All years", "outline", "drill-up");
          const el = chart(
            { type: "bar", x: "year", height: "280", "data-testid": "drill" },
            { title: "Revenue by year", data: YEARS, series: [{ key: "revenue", label: "Revenue (₹ cr)" }] },
          );
          const drill = (y: string | undefined) => {
            // A year is clickable; a quarter is not, and must not look it.
            el.onSelect = y ? undefined : (s: ChartSelection) => drill(String(s.row.year));
            el.setAttribute("x", y ? "quarter" : "year");
            el.title = y ? `Revenue by quarter, ${y}` : "Revenue by year";
            el.data = y ? quarters(y) : YEARS;
            const label = document.createElement("span");
            label.className = y ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg";
            label.textContent = y ?? "Click a year to see its quarters.";
            crumb.replaceChildren(...(y ? [up] : []), label);
          };
          up.addEventListener("click", () => drill(undefined));
          drill(undefined);
          return column(crumb, full(el));
        },
      },
      {
        title: "5. Sales pipeline and target: funnel and gauge",
        codeTitle: "funnel keeps your stage order; gauge shows a target mark",
        code: `<zen-analytic-chart type="funnel" x="stage" series='[{"key":"count","label":"Opportunities"}]'></zen-analytic-chart>
<zen-analytic-chart type="gauge" max="10" target="9" data='[{"attained":7.8}]'
  series='[{"key":"attained","label":"₹ crore booked"}]'></zen-analytic-chart>`,
        render: () =>
          twoUp(
            full(
              chart(
                { type: "funnel", x: "stage", height: "280", "data-testid": "funnel" },
                { title: "Sales pipeline, this quarter", data: PIPELINE, series: [{ key: "count", label: "Opportunities" }] },
              ),
            ),
            full(
              chart(
                {
                  type: "gauge",
                  max: "10",
                  target: "9",
                  height: "280",
                  description: "7.8 of 10 crore booked; the mark is the 9 crore target",
                  data: JSON.stringify([{ attained: 7.8 }]),
                  series: JSON.stringify([{ key: "attained", label: "₹ crore booked" }]),
                  "data-testid": "gauge",
                },
                { title: "Quarter target" },
              ),
            ),
          ),
      },
      {
        title: "6. Stock by warehouse and month: heatmap",
        codeTitle: "x and y are categories; the colour is the value",
        code: `<zen-analytic-chart type="heatmap" x="month" y="warehouse" series='[{"key":"units","label":"Units"}]'></zen-analytic-chart>`,
        render: () =>
          full(
            chart(
              { type: "heatmap", x: "month", y: "warehouse", height: "300", "data-testid": "heatmap" },
              { title: "Units in stock by warehouse and month", data: STOCK, series: [{ key: "units", label: "Units" }] },
            ),
          ),
      },
      {
        title: "7. Where the money goes: treemap and donut",
        code: `<zen-analytic-chart type="treemap" x="category" format="compact" locale="en-IN"></zen-analytic-chart>
<zen-analytic-chart type="donut" legend="true" x="category" format="currency" currency="INR"></zen-analytic-chart>`,
        render: () =>
          twoUp(
            full(
              chart(
                { type: "treemap", x: "category", format: "compact", locale: "en-IN", height: "300", "data-testid": "treemap" },
                { title: "Spend by category", data: SPEND, series: [{ key: "amount", label: "Spend" }] },
              ),
            ),
            full(
              chart(
                { type: "donut", legend: "true", x: "category", format: "currency", currency: "INR", locale: "en-IN", height: "300", "data-testid": "donut" },
                { title: "Share of spend", data: SPEND, series: [{ key: "amount", label: "Spend" }] },
              ),
            ),
          ),
      },
      {
        title: "8. Price against volume: scatter",
        code: `<zen-analytic-chart type="scatter" x="price" series='[{"key":"qty","label":"Quantity sold"}]'></zen-analytic-chart>`,
        render: () =>
          full(
            chart(
              { type: "scatter", x: "price", height: "300", "data-testid": "scatter" },
              { title: "Unit price against quantity sold", data: ITEMS, series: [{ key: "qty", label: "Quantity sold" }] },
            ),
          ),
      },
      {
        title: "9. A year of daily orders: zoom, canvas renderer",
        codeTitle: "zoom adds a slider and wheel zoom; canvas for many points",
        code: `<zen-analytic-chart type="area" zoom renderer="canvas" x="day" series='[{"key":"orders","label":"Orders"}]'></zen-analytic-chart>`,
        render: () =>
          full(
            chart(
              { type: "area", zoom: "", renderer: "canvas", x: "day", height: "320", "data-testid": "zoom" },
              { title: "Orders per day, FY25", data: DAILY, series: [{ key: "orders", label: "Orders" }] },
            ),
          ),
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

<zen-analytic-chart type="radar" x="measure"
  series='[{"key":"acme","label":"Acme"},{"key":"zenith","label":"Zenith"}]'></zen-analytic-chart>`,
        render: () =>
          full(
            chart(
              { type: "radar", x: "measure", height: "320", "data-testid": "radar" },
              {
                title: "Supplier scorecard",
                data: SUPPLIERS,
                series: [
                  { key: "acme", label: "Acme Bearings" },
                  { key: "zenith", label: "Zenith Tools" },
                ],
              },
            ),
          ),
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
