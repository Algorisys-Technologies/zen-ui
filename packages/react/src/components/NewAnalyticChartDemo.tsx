import { useMemo, useState } from "react";
import { AnalyticChart } from "./analytic-chart/analytic-chart";
import { registerChartKind, legendOf, seriesOf, toNumber, type ChartSelection } from "@algorisys/zen-ui-core/analytic-chart";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const STOPS = [
  { cause: "Tool change", minutes: 42 },
  { cause: "Jam at infeed", minutes: 185 },
  { cause: "No blanks", minutes: 96 },
  { cause: "Changeover", minutes: 140 },
  { cause: "Sensor fault", minutes: 18 },
  { cause: "Lubrication", minutes: 11 },
  { cause: "Waiting for crane", minutes: 27 },
  { cause: "Other", minutes: 9 },
];
const MINUTES_SERIES = [{ key: "minutes", label: "Minutes" }];

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

const FULL = { width: "100%" } as const;
const KINDS = ["bar", "line", "area", "combo", "pie", "donut", "waterfall", "funnel", "gauge", "heatmap", "scatter", "treemap", "pareto"];

const NewAnalyticChartDemo: React.FC = () => {
  const [picked, setPicked] = useState<ChartSelection | undefined>();
  const [paretoPick, setParetoPick] = useState<ChartSelection | undefined>();
  const [drillYear, setDrillYear] = useState<string | undefined>();
  const [horizontal, setHorizontal] = useState(false);
  const [region, setRegion] = useState<string | undefined>();
  const regionRows = useMemo(() => (region ? REGIONS.filter((r) => r.region === region) : REGIONS), [region]);
  // Stable references, so a re-render does not hand the charts "new" data.
  const drillRows = useMemo(() => (drillYear ? quarters(drillYear) : YEARS), [drillYear]);

  return (
    <div className="demo-page">
      <h1>AnalyticChart</h1>
      <p className="lede">
        Interactive charts for business screens: twelve built-in types, and any your app registers. Click a mark to
        drill down or filter, switch to the table, download PNG or CSV. Drawn by ECharts, an optional dependency
        loaded only when a chart appears; numbers follow the locale and currency, colours follow the theme.
      </p>

      <section className="demo-section">
        <h2>1. Revenue and margin: combo, two axes, click to select</h2>
        <CodeExample
          title="Bars against a currency axis, a line against a percent axis"
          description="Click a month's bar (or, in the table view, the month's button) and onSelect gets the row. The table view is how a keyboard or screen-reader user reaches the same selection: the chart itself cannot take focus."
          code={`<AnalyticChart
  type="combo"
  title="Revenue and margin by month"
  data={months}
  x="month"
  series={[
    { key: "revenue", label: "Revenue" },
    { key: "cost", label: "Cost", kind: "bar" },
    { key: "margin", label: "Margin", kind: "line", axis: "secondary" },
  ]}
  format="compact"
  secondaryFormat="percent"
  onSelect={(s) => setPicked(s)}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <AnalyticChart
              type="combo"
              title="Revenue and margin by month"
              data={MONTHS}
              x="month"
              series={COMBO_SERIES}
              format="compact"
              secondaryFormat="percent"
              onSelect={setPicked}
              data-testid="combo"
            />
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite" data-testid="picked">
              {picked
                ? `Selected ${String(picked.row.month)}: ${picked.seriesKey} ${picked.seriesKey === "margin" ? `${Math.round((picked.value ?? 0) * 1000) / 10}%` : inr(picked.value ?? 0)}`
                : "Click a bar to select a month."}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Sales by region and channel: stacked, horizontal, filtering</h2>
        <CodeExample
          title="stacked, horizontal, and a click that filters"
          description="Clicking a region narrows the chart to it: the same onSelect that drives a DataTable filter on a real screen."
          code={`<AnalyticChart type="bar" stacked horizontal={horizontal} data={rows} x="region"
  series={[{ key: "retail", label: "Retail" }, { key: "wholesale", label: "Wholesale" }, { key: "online", label: "Online" }]}
  onSelect={(s) => setRegion(String(s.row.region))} />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
              <Button size="sm" variant="outline" onClick={() => setHorizontal((h) => !h)}>
                {horizontal ? "Vertical bars" : "Horizontal bars"}
              </Button>
              {region && (
                <Button size="sm" variant="ghost" onClick={() => setRegion(undefined)} data-testid="clear-region">
                  Show all regions (showing {region})
                </Button>
              )}
            </div>
            <AnalyticChart
              type="bar"
              stacked
              horizontal={horizontal}
              title="Sales by region and channel (units)"
              data={regionRows}
              x="region"
              series={REGION_SERIES}
              onSelect={(s) => setRegion(String(s.row.region))}
              data-testid="stacked"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Profit and loss: waterfall</h2>
        <CodeExample
          title="Rises, falls and running totals"
          description="Each row is a change; a row whose total field is set shows the running total instead. Rises take the success colour, falls the error colour, totals the primary. The table view lists each change beside where it leaves you."
          code={`<AnalyticChart type="waterfall" title="Profit and loss, FY25" data={pl} x="line"
  series={[{ key: "amount", label: "Amount" }]} total="total"
  format="currency" currency="INR" locale="en-IN" />`}
        >
          <AnalyticChart
            type="waterfall"
            title="Profit and loss, FY25"
            data={PL}
            x="line"
            series={AMOUNT_SERIES}
            total="total"
            format="compact"
            locale="en-IN"
            height={360}
            style={FULL}
            data-testid="waterfall"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Drill down: years to quarters</h2>
        <CodeExample
          title="onSelect swaps the data"
          description="Drill-down is not a mode of the chart: it is your state. Pick a year and the same chart shows its quarters."
          code={`const [year, setYear] = useState<string>();
<AnalyticChart type="bar" data={year ? quarters(year) : years} x={year ? "quarter" : "year"}
  series={[{ key: "revenue", label: "Revenue (₹ cr)" }]}
  onSelect={year ? undefined : (s) => setYear(String(s.row.year))} />`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <div className="zen-flex zen-items-center zen-gap-2 zen-text-sm">
              {drillYear ? (
                <>
                  <Button size="sm" variant="outline" onClick={() => setDrillYear(undefined)} data-testid="drill-up">
                    ← All years
                  </Button>
                  <span className="zen-text-zen-foreground">{drillYear}</span>
                </>
              ) : (
                <span className="zen-text-zen-muted-fg">Click a year to see its quarters.</span>
              )}
            </div>
            <AnalyticChart
              type="bar"
              title={drillYear ? `Revenue by quarter, ${drillYear}` : "Revenue by year"}
              data={drillRows}
              x={drillYear ? "quarter" : "year"}
              series={REVENUE_SERIES}
              onSelect={drillYear ? undefined : (s) => setDrillYear(String(s.row.year))}
              height={280}
              data-testid="drill"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Sales pipeline and target: funnel and gauge</h2>
        <CodeExample
          title="funnel keeps your stage order; gauge shows a target mark"
          code={`<AnalyticChart type="funnel" title="Pipeline" data={pipeline} x="stage" series={[{ key: "count", label: "Opportunities" }]} />
<AnalyticChart type="gauge" title="Quarter target" data={[{ attained: 7.8 }]}
  series={[{ key: "attained", label: "₹ crore booked" }]} max={10} target={9} />`}
        >
          <div className="zen-grid zen-w-full zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2">
            <AnalyticChart
              type="funnel"
              title="Sales pipeline, this quarter"
              data={PIPELINE}
              x="stage"
              series={COUNT_SERIES}
              height={280}
              data-testid="funnel"
            />
            <AnalyticChart
              type="gauge"
              title="Quarter target"
              description="7.8 of 10 crore booked; the mark is the 9 crore target"
              data={GAUGE}
              series={ATTAINED_SERIES}
              max={10}
              target={9}
              height={280}
              data-testid="gauge"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Stock by warehouse and month: heatmap</h2>
        <CodeExample
          title="x and y are categories; the colour is the value"
          code={`<AnalyticChart type="heatmap" title="Units in stock" data={stock} x="month" y="warehouse"
  series={[{ key: "units", label: "Units" }]} />`}
        >
          <AnalyticChart
            type="heatmap"
            title="Units in stock by warehouse and month"
            data={STOCK}
            x="month"
            y="warehouse"
            series={UNITS_SERIES}
            height={300}
            style={FULL}
            data-testid="heatmap"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Where the money goes: treemap and donut</h2>
        <CodeExample
          title="Where the money goes: treemap and donut"
          code={`<AnalyticChart type="treemap" data={spend} x="category" series={[{ key: "amount" }]} format="currency" currency="INR" />
<AnalyticChart type="donut" legend data={spend} x="category" series={[{ key: "amount" }]} format="currency" currency="INR" />`}
        >
          <div className="zen-grid zen-w-full zen-grid-cols-1 zen-gap-4 md:zen-grid-cols-2">
            <AnalyticChart
              type="treemap"
              title="Spend by category"
              data={SPEND}
              x="category"
              series={SPEND_SERIES}
              format="compact"
              locale="en-IN"
              height={300}
              data-testid="treemap"
            />
            <AnalyticChart
              type="donut"
              legend
              title="Share of spend"
              data={SPEND}
              x="category"
              series={SPEND_SERIES}
              format="currency"
              currency="INR"
              locale="en-IN"
              height={300}
              data-testid="donut"
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. Price against volume: scatter</h2>
        <CodeExample
          title="Price against volume: scatter"
          code={`<AnalyticChart type="scatter" data={items} x="price" y="qty" format="number" />`}
        >
          <AnalyticChart
            type="scatter"
            title="Unit price against quantity sold"
            data={ITEMS}
            x="price"
            series={QTY_SERIES}
            height={300}
            style={FULL}
            data-testid="scatter"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>9. A year of daily orders: zoom, canvas renderer</h2>
        <CodeExample
          title="zoom adds a slider and wheel zoom; canvas for many points"
          code={`<AnalyticChart type="area" zoom renderer="canvas" data={daily} x="day" series={[{ key: "orders", label: "Orders" }]} />`}
        >
          <AnalyticChart
            type="area"
            zoom
            renderer="canvas"
            title="Orders per day, FY25"
            data={DAILY}
            x="day"
            series={ORDERS_SERIES}
            height={320}
            style={FULL}
            data-testid="zoom"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>10. A chart type of your own: radar</h2>
        <CodeExample
          title="registerChartKind: the same call the built-ins use"
          description="A kind names the ECharts parts it needs (loaded on first use) and builds an option from the spec, theme and formatter. The toolbar, table view, CSV, theming and selection come with it."
          code={`registerChartKind({
  id: "radar",
  modules: () => Promise.all([
    import("echarts/charts").then(({ RadarChart }) => [RadarChart]),
    import("echarts/components").then(({ RadarComponent }) => [RadarComponent]),
  ]).then((m) => m.flat()),
  build: (spec, ctx) => ({ radar: { indicator: … }, series: [{ type: "radar", data: … }] }),
});

<AnalyticChart type="radar" data={suppliers} x="measure"
  series={[{ key: "acme", label: "Acme" }, { key: "zenith", label: "Zenith" }]} />`}
        >
          <AnalyticChart
            type="radar"
            title="Supplier scorecard"
            data={SUPPLIERS}
            x="measure"
            series={SUPPLIER_SERIES}
            height={320}
            style={FULL}
            data-testid="radar"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>11. Every built-in type</h2>
        <CodeExample
          title="chartKinds() lists what is registered"
          code={`chartKinds() // ${KINDS.join(", ")}`}
        >
          <ul className="zen-m-0 zen-flex zen-flex-wrap zen-gap-2 zen-p-0" data-testid="kinds">
            {KINDS.map((k) => (
              <li key={k} className="zen-list-none zen-rounded-zen-sm zen-bg-zen-muted zen-px-2 zen-py-0.5 zen-font-mono zen-text-xs">
                {k}
              </li>
            ))}
          </ul>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>12. Pareto</h2>
        <CodeExample
          title="type pareto: largest first, a cumulative line, the vital few marked"
          description="Downtime minutes by cause, given in any order. The bars sort largest first; the line is the running share of the total on its own 0–100% axis; the bars that together reach the threshold (80% unless set) stay full colour and the rest fade — those are the causes to fix first. Click a bar, or a row's button in the table view: onSelect gets the original row, not its position after sorting."
          code={`<AnalyticChart
  type="pareto"
  title="Downtime by cause, this week"
  data={stops}          // any order
  x="cause"
  series={[{ key: "minutes", label: "Minutes" }]}
  threshold={0.8}
  onSelect={(s) => open(s.row)}
/>`}
        >
          <div className="zen-flex zen-w-full zen-flex-col zen-gap-2">
            <AnalyticChart
              type="pareto"
              title="Downtime by cause, this week"
              data={STOPS}
              x="cause"
              series={MINUTES_SERIES}
              height={320}
              className="zen-w-full"
              data-testid="pareto"
              onSelect={setParetoPick}
            />
            <p className="zen-m-0 zen-text-sm" data-testid="pareto-pick">
              Selected: {paretoPick ? `${String(paretoPick.row.cause)} (row ${paretoPick.index})` : "—"}
            </p>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

// Series lists hoisted out of render: an inline array is a new spec every
// render, which redraws the chart for nothing.
const COMBO_SERIES = [
  { key: "revenue", label: "Revenue" },
  { key: "cost", label: "Cost", kind: "bar" as const },
  { key: "margin", label: "Margin", kind: "line" as const, axis: "secondary" as const },
];
const REGION_SERIES = [
  { key: "retail", label: "Retail" },
  { key: "wholesale", label: "Wholesale" },
  { key: "online", label: "Online" },
];
const AMOUNT_SERIES = [{ key: "amount", label: "Amount" }];
const REVENUE_SERIES = [{ key: "revenue", label: "Revenue (₹ cr)" }];
const COUNT_SERIES = [{ key: "count", label: "Opportunities" }];
const ATTAINED_SERIES = [{ key: "attained", label: "₹ crore booked" }];
const GAUGE = [{ attained: 7.8 }];
const UNITS_SERIES = [{ key: "units", label: "Units" }];
const SPEND_SERIES = [{ key: "amount", label: "Spend" }];
const QTY_SERIES = [{ key: "qty", label: "Quantity sold" }];
const ORDERS_SERIES = [{ key: "orders", label: "Orders" }];
const SUPPLIER_SERIES = [
  { key: "acme", label: "Acme Bearings" },
  { key: "zenith", label: "Zenith Tools" },
];

export default NewAnalyticChartDemo;
