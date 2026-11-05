/**
 * AnalyticChart's framework-agnostic half: everything about a chart that is not
 * drawing it. The spec, the chart-kind registry, number formatting, the table
 * view and its CSV, and the ECharts option each kind builds.
 *
 * WHY A REGISTRY. A business app wants more chart types than any release ships,
 * so a chart type is a module (`ChartKind`), not a branch in a component. Each
 * kind says which ECharts parts it needs (imported only when a chart of that
 * kind is drawn), how a spec becomes an ECharts option, and, if the default
 * does not fit, how its data reads as a table and what a click selected. The
 * built-ins register themselves through `registerChartKind`, the same call an
 * app uses for its own (a Sankey, a radar), so adding one touches no component,
 * no binding, and none of the toolbar, table view, export or theming.
 *
 * WHY HERE. The four bindings draw with the same renderer (ECharts) from this
 * one file, so they cannot disagree about what a waterfall's bars are, the way
 * the older Chart already does (recharts in React, hand-drawn SVG elsewhere).
 * Everything in this file is pure: `bun run check:analytic-chart` pins it
 * without a browser. The DOM half (mounting, resizing, theme changes) is
 * `analytic-chart-echarts.ts`.
 *
 * Options are typed loosely (`EChartsOption` is a plain record) on purpose: core
 * must not depend on echarts' types at runtime, and the option is ECharts' own
 * documented shape, which the `option` prop lets a caller extend.
 */

export type ChartRow = Record<string, unknown>;

/** An ECharts option object. ECharts' own documented shape; kept loose here. */
export type EChartsOption = Record<string, any>;

/** How values read: a preset, or your own function. */
export type ValueFormat = "number" | "currency" | "percent" | "compact" | ((value: number) => string);

export interface AnalyticSeries {
  /** The field in each row that holds this series' value. */
  key: string;
  /** Shown in the legend, tooltip and table header. Default: `key`. */
  label?: string;
  /** For `combo` (and to override bar / line / area per series): how this series draws. */
  kind?: "bar" | "line" | "area";
  /** `secondary` plots against a second value axis, with `secondaryFormat`. */
  axis?: "primary" | "secondary";
  /** Series sharing a stack id stack on each other. `stacked` stacks every series. */
  stack?: string;
  /** Any CSS colour, `var(--zen-…)` included. Default: the theme palette, in order. */
  color?: string;
}

export interface AnalyticChartSpec {
  /** A registered kind: bar, line, area, combo, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, or your own. */
  type: string;
  data: ChartRow[];
  /** The category / label field (the name of each slice, stage or tile). */
  x?: string;
  /** The value fields. Pie, donut, funnel, gauge, treemap and waterfall use the first. */
  series?: AnalyticSeries[];
  /** A second field: heatmap's row category, scatter's y when `series` is not given. */
  y?: string;
  /** Stack every bar / area series. */
  stacked?: boolean;
  /** Bars run left to right instead of bottom to top. */
  horizontal?: boolean;
  /** Waterfall: the field that marks a row as a running total (Opening, Gross profit, Closing). */
  total?: string;
  /** Gauge: the value that fills the dial. Default 100. */
  max?: number;
  /** Gauge: where the target sits, drawn as a mark on the dial. */
  target?: number;
  /** Category-axis zoom: a slider under the chart, and the wheel / pinch. */
  zoom?: boolean;
  /** Default: shown when there is more than one series. */
  legend?: boolean;
  /** The chart's accessible name, and the table view's caption. */
  title?: string;
  /** A sentence a screen reader gets with the name: what the chart shows. */
  description?: string;
}

/** The colours and type a chart draws in, read from the `--zen-*` tokens. */
export interface ChartTheme {
  palette: string[];
  foreground: string;
  /** Axis labels and other secondary text. */
  muted: string;
  /** Gridlines and axis lines. */
  border: string;
  background: string;
  /** A filled-but-empty surface: the gauge's track, a heatmap's low end. */
  surface: string;
  positive: string;
  negative: string;
  fontFamily: string;
}

/** What a kind builds with, beyond the spec. */
export interface ChartContext {
  theme: ChartTheme;
  /** Formats a value on the given axis (the primary unless said). */
  format: (value: number, axis?: "primary" | "secondary") => string;
  /** The page reads right to left. */
  rtl: boolean;
  /** The chart's width in px, when known: lets category labels wrap instead of dropping. */
  width?: number;
  /** A catalogue word (`analyticChart.*`), translated when the app supplied one. */
  t: (key: string, values?: Record<string, string | number>) => string;
}

/** What a click (on a mark or a table row) selected. */
export interface ChartSelection {
  row: ChartRow;
  /** The row's index in `data`. */
  index: number;
  seriesKey?: string;
  value?: number;
}

export interface ChartTable {
  columns: { key: string; label: string; numeric?: boolean; axis?: "primary" | "secondary" }[];
  /** One entry per table row: the cells, and the `data` row it stands for (for selection). */
  rows: { cells: (string | number | null)[]; index: number; seriesKey?: string }[];
}

/** The ECharts module namespaces a kind picks its parts from. */
export interface EChartsModules {
  charts: () => Promise<Record<string, unknown>>;
  components: () => Promise<Record<string, unknown>>;
}

export interface ChartKind {
  id: string;
  /**
   * The ECharts chart / component parts this kind needs, imported when a chart
   * of this kind is first drawn. Return them from a destructured dynamic import
   * so a bundler keeps only those: `import("echarts/charts").then(({ BarChart }) => [BarChart])`.
   */
  modules: () => Promise<unknown[]>;
  /** The spec, with its theme and formatter, as an ECharts option. Pure. */
  build: (spec: AnalyticChartSpec, ctx: ChartContext) => EChartsOption;
  /** The table view and CSV. Default: the x field, then one column per series. */
  table?: (spec: AnalyticChartSpec, ctx: ChartContext) => ChartTable;
  /** What a click on a mark selected, from ECharts' click params. Default: the row at `dataIndex`. */
  select?: (spec: AnalyticChartSpec, params: { dataIndex: number; seriesId?: string; value?: unknown }) => ChartSelection | undefined;
}

const KINDS = new Map<string, ChartKind>();

/**
 * Add a chart type, or replace one: the built-ins come in through here too. An
 * app's own kind is drawn, themed, tabulated, exported and selected exactly as
 * a built-in is.
 */
export function registerChartKind(kind: ChartKind): void {
  KINDS.set(kind.id, kind);
}

export function getChartKind(id: string): ChartKind | undefined {
  return KINDS.get(id);
}

/** Every registered kind's id, in registration order. */
export function chartKinds(): string[] {
  return [...KINDS.keys()];
}

// ---------------------------------------------------------------------------
// Values and formatting

/** A cell as a number, or null when it is not one (a gap, not a zero). */
export function toNumber(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

const label = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/**
 * A formatter for one axis. `percent` takes a ratio (0.25 reads 25%), as
 * Intl does; `compact` reads 1.2M / 12 lakh by locale; `currency` needs a
 * currency (the prop's, else the provider's) and falls back to `number`.
 */
export function makeFormatter(
  format: ValueFormat | undefined,
  opts: { locale?: string; currency?: string } = {},
): (value: number) => string {
  if (typeof format === "function") return format;
  const { locale, currency } = opts;
  let nf: Intl.NumberFormat;
  try {
    nf =
      format === "currency" && currency
        ? new Intl.NumberFormat(locale, { style: "currency", currency })
        : format === "percent"
          ? new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 })
          : format === "compact"
            ? new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 })
            : new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });
  } catch {
    // An unknown locale or currency code: still read the number.
    nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });
  }
  return (value) => nf.format(value);
}

/** The series a spec draws, with labels filled in. */
export function seriesOf(spec: AnalyticChartSpec): (AnalyticSeries & { label: string })[] {
  return (spec.series ?? []).map((s) => ({ ...s, label: s.label ?? s.key }));
}

/**
 * What selecting row `index` (of series `seriesKey`) means for this spec: the
 * kind's own answer (a waterfall's change), else the row and that series'
 * value. One function for a click on a mark AND a table row's button, so the
 * two cannot report different things.
 */
export function selectionAt(spec: AnalyticChartSpec, index: number, seriesKey?: string): ChartSelection | undefined {
  const kind = getChartKind(spec.type);
  const key = seriesKey ?? spec.series?.[0]?.key;
  if (kind?.select) return kind.select(spec, { dataIndex: index, seriesId: key });
  const row = spec.data[index];
  if (!row) return undefined;
  return { row, index, seriesKey: key, value: (key ? toNumber(row[key]) : null) ?? undefined };
}

// ---------------------------------------------------------------------------
// Table view and CSV

/** The default table: the x field, then one column per series. */
export function defaultTable(spec: AnalyticChartSpec): ChartTable {
  const series = seriesOf(spec);
  return {
    columns: [
      ...(spec.x ? [{ key: spec.x, label: spec.x }] : []),
      ...series.map((s) => ({ key: s.key, label: s.label, numeric: true, axis: s.axis })),
    ],
    rows: spec.data.map((row, index) => ({
      index,
      cells: [...(spec.x ? [label(row[spec.x])] : []), ...series.map((s) => toNumber(row[s.key]))],
    })),
  };
}

/** The table a spec reads as: its kind's, else the default. */
export function chartTable(spec: AnalyticChartSpec, ctx: ChartContext): ChartTable {
  const kind = getChartKind(spec.type);
  return kind?.table ? kind.table(spec, ctx) : defaultTable(spec);
}

/**
 * The table as CSV: RFC 4180 quoting, raw numbers (a spreadsheet formats them;
 * a pre-formatted "₹1,25,000.00" would arrive as text), CRLF line ends, and a
 * leading quote on a cell a spreadsheet would run as a formula (=, +, -, @).
 */
export function tableToCsv(table: ChartTable): string {
  const cell = (v: string | number | null): string => {
    if (v === null) return "";
    if (typeof v === "number") return String(v);
    const guarded = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
    return /[",\r\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
  };
  return [table.columns.map((c) => cell(c.label)), ...table.rows.map((r) => r.cells.map(cell))]
    .map((line) => line.join(","))
    .join("\r\n");
}

// ---------------------------------------------------------------------------
// Option assembly

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * `extra` deep-merged over `base`: objects merge key by key, anything else
 * (arrays included) replaces. ECharts' own `setOption` merge is by component
 * index and would keep stale series; this one is what the caller wrote.
 */
export function mergeOption(base: EChartsOption, extra: EChartsOption | undefined): EChartsOption {
  if (!extra) return base;
  const out: EChartsOption = { ...base };
  for (const [k, v] of Object.entries(extra)) {
    out[k] = isPlainObject(v) && isPlainObject(out[k]) ? mergeOption(out[k], v) : v;
  }
  return out;
}

/**
 * The full option for a spec: the theme's text, palette, tooltip and
 * accessibility description, then what the kind built, then the caller's
 * `option` over both. Throws on an unregistered type, naming the ones that are.
 */
export function buildChartOption(spec: AnalyticChartSpec, ctx: ChartContext, extra?: EChartsOption): EChartsOption {
  const kind = getChartKind(spec.type);
  if (!kind) throw new Error(`AnalyticChart: unknown type "${spec.type}". Registered: ${chartKinds().join(", ")}.`);
  const { theme } = ctx;
  const base: EChartsOption = {
    color: theme.palette,
    backgroundColor: "transparent",
    textStyle: { color: theme.foreground, fontFamily: theme.fontFamily },
    animationDuration: 300,
    tooltip: {
      backgroundColor: theme.background,
      borderColor: theme.border,
      textStyle: { color: theme.foreground, fontFamily: theme.fontFamily },
      valueFormatter: (v: unknown) => {
        const n = toNumber(v);
        return n === null ? "" : ctx.format(n);
      },
    },
    aria: {
      enabled: true,
      ...(spec.description ? { label: { description: spec.description } } : {}),
    },
  };
  return mergeOption(mergeOption(base, kind.build(spec, ctx)), extra);
}

// ---------------------------------------------------------------------------
// Shared builders the built-in kinds compose (exported for app kinds too)

/** The legend, on top, aligned to the reading start. */
export function legendOf(spec: AnalyticChartSpec, ctx: ChartContext, count: number): EChartsOption {
  const show = spec.legend ?? count > 1;
  return {
    show,
    top: 0,
    [ctx.rtl ? "right" : "left"]: 0,
    icon: "roundRect",
    itemWidth: 12,
    itemHeight: 12,
    textStyle: { color: ctx.theme.foreground },
  };
}

/**
 * Category + value axes, grid and zoom for the cartesian kinds. Right to left
 * mirrors the category axis and moves the primary value axis to the right; a
 * horizontal chart swaps the two axes.
 */
export function cartesianFrame(
  spec: AnalyticChartSpec,
  ctx: ChartContext,
  opts: { secondary?: boolean; categories?: string[]; boundaryGap?: boolean } = {},
): EChartsOption {
  const { theme, rtl } = ctx;
  const categories = opts.categories ?? spec.data.map((r) => label(spec.x ? r[spec.x] : ""));
  const axisText = { color: theme.muted, fontFamily: theme.fontFamily };
  // Name every category when they fit: a P&L that skips every other line
  // ("auto" interval, measured) is not a P&L. Up to 24 categories wrap into
  // their slot; past that, or with no width, ECharts thins them.
  const slot = ctx.width && !spec.horizontal ? Math.floor((ctx.width - 96) / Math.max(1, categories.length)) - 6 : 0;
  const wrap = slot >= 36 && categories.length <= 24;
  const category = {
    type: "category",
    data: categories,
    boundaryGap: opts.boundaryGap ?? true,
    axisLine: { lineStyle: { color: theme.border } },
    axisTick: { show: false },
    axisLabel: wrap
      ? { ...axisText, interval: 0, width: slot, overflow: "break", lineHeight: 14 }
      : { ...axisText, hideOverlap: true },
  };
  const valueAxis = (axis: "primary" | "secondary") => ({
    type: "value",
    axisLabel: { ...axisText, formatter: (v: number) => ctx.format(v, axis) },
    splitLine: { show: axis === "primary", lineStyle: { color: theme.border, type: "dashed" } },
    axisLine: { show: false },
  });
  const values = opts.secondary ? [valueAxis("primary"), valueAxis("secondary")] : [valueAxis("primary")];
  const legendShown = spec.legend ?? (spec.series?.length ?? 0) > 1;
  const grid = {
    containLabel: true,
    left: 8,
    right: 8,
    top: legendShown ? 36 : 12,
    bottom: spec.zoom ? 44 : 8,
  };
  const zoomAxis = spec.horizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 };
  const dataZoom = spec.zoom
    ? [
        { type: "inside", ...zoomAxis },
        {
          type: "slider",
          ...zoomAxis,
          height: 18,
          bottom: 8,
          borderColor: theme.border,
          fillerColor: "rgba(127,127,127,0.15)",
          textStyle: axisText,
        },
      ]
    : undefined;
  if (spec.horizontal) {
    return {
      grid,
      // Horizontal bars read top-down: the first row at the top.
      yAxis: { ...category, inverse: true, position: rtl ? "right" : "left" },
      xAxis: values.map((v, i) => ({ ...v, inverse: rtl, position: i === 0 ? "bottom" : "top" })),
      ...(dataZoom ? { dataZoom } : {}),
    };
  }
  return {
    grid,
    xAxis: { ...category, inverse: rtl },
    yAxis: values.map((v, i) => ({ ...v, position: (i === 0) !== rtl ? "left" : "right" })),
    ...(dataZoom ? { dataZoom } : {}),
  };
}

/** Bar / line / area series, per series kind, stacking and axis. */
function seriesSeries(spec: AnalyticChartSpec, ctx: ChartContext, defaultKind: (i: number) => "bar" | "line" | "area") {
  return seriesOf(spec).map((s, i) => {
    const kind = s.kind ?? defaultKind(i);
    const stack = s.stack ?? (spec.stacked && kind !== "line" ? "total" : undefined);
    const common = {
      id: s.key,
      name: s.label,
      data: spec.data.map((r) => toNumber(r[s.key])),
      ...(s.color ? { itemStyle: { color: s.color } } : {}),
      ...(stack ? { stack } : {}),
      ...(s.axis === "secondary" ? (spec.horizontal ? { xAxisIndex: 1 } : { yAxisIndex: 1 }) : {}),
      emphasis: { focus: "series" },
      tooltip: { valueFormatter: (v: unknown) => fmt(ctx, v, s.axis) },
    };
    if (kind === "bar") {
      const r = 3;
      const radius = spec.horizontal ? (ctx.rtl ? [r, 0, 0, r] : [0, r, r, 0]) : [r, r, 0, 0];
      return {
        ...common,
        type: "bar",
        barMaxWidth: 48,
        // Stacked segments get a 1px background-coloured edge, so neighbours sit
        // 2px apart and read as separate quantities rather than one bar.
        itemStyle: {
          ...(s.color ? { color: s.color } : {}),
          borderRadius: stack ? 0 : radius,
          ...(stack ? { borderColor: ctx.theme.background, borderWidth: 1 } : {}),
        },
      };
    }
    return {
      ...common,
      type: "line",
      symbol: "circle",
      symbolSize: 6,
      showSymbol: spec.data.length <= 40,
      connectNulls: false,
      ...(kind === "area" ? { areaStyle: { opacity: stack ? 0.6 : 0.15 } } : {}),
    };
  });
}

const fmt = (ctx: ChartContext, v: unknown, axis?: "primary" | "secondary") => {
  const n = toNumber(v);
  return n === null ? "" : ctx.format(n, axis);
};

const hasSecondary = (spec: AnalyticChartSpec) => (spec.series ?? []).some((s) => s.axis === "secondary");

const pick = (names: string[]) => (m: Record<string, unknown>) => names.map((n) => m[n]);

// ---------------------------------------------------------------------------
// Built-in kinds

const cartesianKind = (id: string, defaultKind: (i: number) => "bar" | "line" | "area"): ChartKind => ({
  id,
  modules: () =>
    Promise.all([
      import("echarts/charts").then(({ BarChart, LineChart }) => [BarChart, LineChart]),
      import("echarts/components").then(({ GridComponent, DataZoomComponent }) => [GridComponent, DataZoomComponent]),
    ]).then((m) => m.flat()),
  build: (spec, ctx) => ({
    ...cartesianFrame(spec, ctx, {
      secondary: hasSecondary(spec),
      boundaryGap: (spec.series ?? []).some((s, i) => (s.kind ?? defaultKind(i)) === "bar"),
    }),
    legend: legendOf(spec, ctx, spec.series?.length ?? 0),
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    series: seriesSeries(spec, ctx, defaultKind),
  }),
  select: (spec, p) => {
    const row = spec.data[p.dataIndex];
    if (!row) return undefined;
    const value = toNumber(p.seriesId ? row[p.seriesId] : undefined) ?? undefined;
    return { row, index: p.dataIndex, seriesKey: p.seriesId, value };
  },
});

const pieKind = (id: string, donut: boolean): ChartKind => ({
  id,
  modules: () => import("echarts/charts").then(({ PieChart }) => [PieChart]),
  build: (spec, ctx) => {
    const s = seriesOf(spec)[0];
    const data = spec.data.map((r, i) => ({
      name: label(spec.x ? r[spec.x] : i),
      value: s ? toNumber(r[s.key]) : null,
    }));
    return {
      legend: { ...legendOf(spec, ctx, data.length), show: spec.legend ?? false, type: "scroll" },
      tooltip: {
        trigger: "item",
        formatter: (p: { name: string; value: number; percent: number }) =>
          `${escapeHtml(p.name)}: <b>${escapeHtml(ctx.format(p.value))}</b> (${p.percent}%)`,
      },
      series: [
        {
          id: s?.key,
          name: s?.label,
          type: "pie",
          radius: donut ? ["52%", "78%"] : [0, "78%"],
          center: ["50%", spec.legend ? "55%" : "50%"],
          data,
          itemStyle: { borderColor: ctx.theme.background, borderWidth: 2 },
          // With a legend the slices are already named; labels too would say it
          // twice and crowd (they truncated, measured).
          label: { show: !spec.legend, color: ctx.theme.foreground, formatter: "{b}" },
          labelLine: { show: !spec.legend, lineStyle: { color: ctx.theme.border } },
          emphasis: { scaleSize: 4 },
        },
      ],
    };
  },
  select: (spec, p) => {
    const row = spec.data[p.dataIndex];
    const s = spec.series?.[0];
    return row ? { row, index: p.dataIndex, seriesKey: s?.key, value: toNumber(s ? row[s.key] : undefined) ?? undefined } : undefined;
  },
});

/** Waterfall arithmetic, exported for the check: per row its base, height, running total and sign. */
export function waterfallBars(spec: AnalyticChartSpec): { base: number; height: number; running: number; change: number | null; kind: "up" | "down" | "total" }[] {
  const key = spec.series?.[0]?.key;
  let running = 0;
  return spec.data.map((row) => {
    if (spec.total && row[spec.total]) {
      return { base: Math.min(0, running), height: Math.abs(running), running, change: null, kind: "total" as const };
    }
    const change = (key ? toNumber(row[key]) : null) ?? 0;
    const start = running;
    running += change;
    return { base: Math.min(start, running), height: Math.abs(change), running, change, kind: change >= 0 ? ("up" as const) : ("down" as const) };
  });
}

const waterfallKind: ChartKind = {
  id: "waterfall",
  modules: () =>
    Promise.all([
      import("echarts/charts").then(({ BarChart }) => [BarChart]),
      import("echarts/components").then(({ GridComponent, DataZoomComponent }) => [GridComponent, DataZoomComponent]),
    ]).then((m) => m.flat()),
  build: (spec, ctx) => {
    const bars = waterfallBars(spec);
    const s = seriesOf(spec)[0];
    const colour = { up: ctx.theme.positive, down: ctx.theme.negative, total: ctx.theme.palette[0] };
    return {
      ...cartesianFrame({ ...spec, legend: false }, ctx),
      legend: { show: false },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        formatter: (params: { dataIndex: number; name: string }[]) => {
          const i = params[0]?.dataIndex ?? 0;
          const b = bars[i];
          if (!b) return "";
          const name = escapeHtml(params[0]?.name ?? "");
          if (b.kind === "total") return `${name}<br/>${escapeHtml(ctx.t("analyticChart.total"))}: <b>${escapeHtml(ctx.format(b.running))}</b>`;
          const signed = (b.change ?? 0) > 0 ? `+${ctx.format(b.change ?? 0)}` : ctx.format(b.change ?? 0);
          return `${name}<br/>${escapeHtml(ctx.t("analyticChart.change"))}: <b>${escapeHtml(signed)}</b><br/>${escapeHtml(ctx.t("analyticChart.runningTotal"))}: ${escapeHtml(ctx.format(b.running))}`;
        },
      },
      series: [
        {
          // The invisible part of each column: where the visible part starts.
          id: "__base",
          type: "bar",
          stack: "waterfall",
          stackStrategy: "all",
          silent: true,
          itemStyle: { color: "transparent", borderColor: "transparent" },
          emphasis: { disabled: true },
          tooltip: { show: false },
          data: bars.map((b) => b.base),
        },
        {
          id: s?.key ?? "value",
          name: s?.label,
          type: "bar",
          stack: "waterfall",
          stackStrategy: "all",
          barMaxWidth: 48,
          data: bars.map((b) => ({ value: b.height, itemStyle: { color: colour[b.kind], borderRadius: 2 } })),
        },
      ],
    };
  },
  table: (spec, ctx) => {
    const bars = waterfallBars(spec);
    return {
      columns: [
        ...(spec.x ? [{ key: spec.x, label: spec.x }] : []),
        { key: "change", label: ctx.t("analyticChart.change"), numeric: true },
        { key: "running", label: ctx.t("analyticChart.runningTotal"), numeric: true },
      ],
      rows: spec.data.map((row, index) => ({
        index,
        cells: [...(spec.x ? [label(row[spec.x])] : []), bars[index]?.change ?? null, bars[index]?.running ?? null],
      })),
    };
  },
  select: (spec, p) => {
    const row = spec.data[p.dataIndex];
    if (!row) return undefined;
    const b = waterfallBars(spec)[p.dataIndex];
    return { row, index: p.dataIndex, seriesKey: spec.series?.[0]?.key, value: b?.change ?? b?.running };
  },
};

const funnelKind: ChartKind = {
  id: "funnel",
  modules: () => import("echarts/charts").then(pick(["FunnelChart"])),
  build: (spec, ctx) => {
    const s = seriesOf(spec)[0];
    return {
      legend: { show: false },
      tooltip: {
        trigger: "item",
        formatter: (p: { name: string; value: number }) => `${escapeHtml(p.name)}: <b>${escapeHtml(ctx.format(p.value))}</b>`,
      },
      series: [
        {
          id: s?.key,
          name: s?.label,
          type: "funnel",
          // Labels beside the funnel, not in it: inside, the narrow stages
          // clipped them and a light stage made white text unreadable.
          left: ctx.rtl ? "36%" : "4%",
          right: ctx.rtl ? "4%" : "36%",
          top: 8,
          bottom: 8,
          sort: "none",
          gap: 2,
          minSize: "8%",
          itemStyle: { borderColor: ctx.theme.background, borderWidth: 1 },
          label: {
            position: ctx.rtl ? "left" : "right",
            color: ctx.theme.foreground,
            formatter: (p: { name: string; value: number }) => `${p.name}  ${ctx.format(p.value)}`,
          },
          labelLine: { show: true, lineStyle: { color: ctx.theme.border } },
          data: spec.data.map((r, i) => ({ name: label(spec.x ? r[spec.x] : i), value: s ? toNumber(r[s.key]) : null })),
        },
      ],
    };
  },
};

const gaugeKind: ChartKind = {
  id: "gauge",
  modules: () => import("echarts/charts").then(pick(["GaugeChart"])),
  build: (spec, ctx) => {
    const s = seriesOf(spec)[0];
    const value = (s ? toNumber(spec.data[0]?.[s.key]) : null) ?? 0;
    const max = spec.max ?? 100;
    const width = 16;
    return {
      tooltip: { show: false },
      series: [
        {
          id: s?.key,
          name: s?.label,
          type: "gauge",
          min: 0,
          max,
          startAngle: 210,
          endAngle: -30,
          radius: "92%",
          center: ["50%", "58%"],
          progress: { show: true, width, roundCap: true, itemStyle: { color: s?.color ?? ctx.theme.palette[0] } },
          axisLine: { roundCap: true, lineStyle: { width, color: [[1, ctx.theme.surface]] } },
          pointer: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          anchor: { show: false },
          title: { show: true, offsetCenter: [0, "38%"], color: ctx.theme.muted, fontSize: 13 },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, "0%"],
            color: ctx.theme.foreground,
            fontSize: 28,
            fontWeight: 600,
            formatter: (v: number) => ctx.format(v),
          },
          data: [{ value, name: s?.label ?? "" }],
        },
        ...(spec.target !== undefined
          ? [
              {
                // The target: a short arc across the track at its value, drawn
                // as a second, otherwise empty dial whose line is coloured only
                // there. Silent, so a click still lands on the value.
                id: "__target",
                type: "gauge",
                silent: true,
                min: 0,
                max,
                startAngle: 210,
                endAngle: -30,
                radius: "96%",
                center: ["50%", "58%"],
                axisLine: { lineStyle: { width: width + 8, color: targetStops(spec.target, max, ctx.theme.foreground) } },
                progress: { show: false },
                pointer: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                detail: { show: false },
                title: { show: false },
                anchor: { show: false },
                data: [],
              },
            ]
          : []),
      ],
    };
  },
  table: (spec, ctx) => {
    const s = seriesOf(spec)[0];
    return {
      columns: [
        { key: "label", label: s?.label ?? "" },
        { key: "value", label: ctx.t("analyticChart.value"), numeric: true },
        { key: "max", label: ctx.t("analyticChart.max"), numeric: true },
        ...(spec.target !== undefined ? [{ key: "target", label: ctx.t("analyticChart.target"), numeric: true }] : []),
      ],
      rows: [
        {
          index: 0,
          cells: [
            s?.label ?? "",
            s ? toNumber(spec.data[0]?.[s.key]) : null,
            spec.max ?? 100,
            ...(spec.target !== undefined ? [spec.target] : []),
          ],
        },
      ],
    };
  },
  select: (spec) => {
    const row = spec.data[0];
    const s = spec.series?.[0];
    return row ? { row, index: 0, seriesKey: s?.key, value: toNumber(s ? row[s.key] : undefined) ?? undefined } : undefined;
  },
};

/** Distinct values of a field, in first-seen order. */
const distinct = (rows: ChartRow[], field: string | undefined) => {
  const seen = new Set<string>();
  for (const r of rows) seen.add(label(field ? r[field] : ""));
  return [...seen];
};

const heatmapKind: ChartKind = {
  id: "heatmap",
  modules: () =>
    Promise.all([
      import("echarts/charts").then(pick(["HeatmapChart"])),
      import("echarts/components").then(pick(["GridComponent", "VisualMapComponent"])),
    ]).then((m) => m.flat()),
  build: (spec, ctx) => {
    const s = seriesOf(spec)[0];
    const xs = distinct(spec.data, spec.x);
    const ys = distinct(spec.data, spec.y);
    const values = spec.data.map((r) => (s ? toNumber(r[s.key]) : null));
    const finite = values.filter((v): v is number => v !== null);
    const min = finite.length ? Math.min(...finite) : 0;
    const max = finite.length ? Math.max(...finite) : 1;
    const frame = cartesianFrame({ ...spec, horizontal: false, zoom: false, legend: false }, ctx, { categories: xs });
    return {
      ...frame,
      grid: { ...frame.grid, bottom: 44 },
      // Rows read top-down in the data's order, as a table would.
      yAxis: {
        ...frame.xAxis,
        data: ys,
        inverse: true,
        position: ctx.rtl ? "right" : "left",
        splitArea: { show: false },
        axisLabel: { color: ctx.theme.muted, fontFamily: ctx.theme.fontFamily },
      },
      legend: { show: false },
      tooltip: {
        trigger: "item",
        formatter: (p: { value: [number, number, number | null] }) =>
          `${escapeHtml(xs[p.value[0]] ?? "")} · ${escapeHtml(ys[p.value[1]] ?? "")}: <b>${escapeHtml(p.value[2] === null ? "" : ctx.format(p.value[2]))}</b>`,
      },
      visualMap: {
        min,
        max: max === min ? min + 1 : max,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        itemHeight: 120,
        itemWidth: 10,
        // The scale's ends, labelled: a colour ramp with no numbers reads as decoration.
        text: [ctx.format(max === min ? min + 1 : max), ctx.format(min)],
        textGap: 8,
        textStyle: { color: ctx.theme.muted },
        inRange: { color: [ctx.theme.surface, s?.color ?? ctx.theme.palette[0]] },
      },
      series: [
        {
          id: s?.key,
          name: s?.label,
          type: "heatmap",
          data: spec.data.map((r, i) => [xs.indexOf(label(spec.x ? r[spec.x] : "")), ys.indexOf(label(spec.y ? r[spec.y] : "")), values[i]]),
          itemStyle: { borderColor: ctx.theme.background, borderWidth: 2 },
          emphasis: { itemStyle: { borderColor: ctx.theme.foreground, borderWidth: 1 } },
        },
      ],
    };
  },
  table: (spec) => {
    const s = seriesOf(spec)[0];
    return {
      columns: [
        ...(spec.x ? [{ key: spec.x, label: spec.x }] : []),
        ...(spec.y ? [{ key: spec.y, label: spec.y }] : []),
        ...(s ? [{ key: s.key, label: s.label, numeric: true }] : []),
      ],
      rows: spec.data.map((row, index) => ({
        index,
        cells: [
          ...(spec.x ? [label(row[spec.x])] : []),
          ...(spec.y ? [label(row[spec.y])] : []),
          ...(s ? [toNumber(row[s.key])] : []),
        ],
      })),
    };
  },
};

const scatterKind: ChartKind = {
  id: "scatter",
  modules: () =>
    Promise.all([
      import("echarts/charts").then(pick(["ScatterChart"])),
      import("echarts/components").then(pick(["GridComponent", "DataZoomComponent"])),
    ]).then((m) => m.flat()),
  build: (spec, ctx) => {
    const series = spec.series?.length ? seriesOf(spec) : spec.y ? [{ key: spec.y, label: spec.y }] : [];
    const axisText = { color: ctx.theme.muted, fontFamily: ctx.theme.fontFamily };
    const valueAxis = (name: string | undefined) => ({
      type: "value",
      scale: true,
      name,
      nameTextStyle: axisText,
      axisLabel: { ...axisText, formatter: (v: number) => ctx.format(v) },
      splitLine: { lineStyle: { color: ctx.theme.border, type: "dashed" } },
      axisLine: { lineStyle: { color: ctx.theme.border } },
    });
    return {
      // containLabel does not count an axis NAME: leave room for the x one.
      grid: { containLabel: true, left: 8, right: 16, top: series.length > 1 ? 36 : 24, bottom: spec.x ? 28 : 8 },
      legend: legendOf(spec, ctx, series.length),
      xAxis: { ...valueAxis(spec.x), inverse: ctx.rtl, nameLocation: "middle", nameGap: 30 },
      yAxis: { ...valueAxis(series.length === 1 ? series[0]?.label : undefined), position: ctx.rtl ? "right" : "left" },
      tooltip: {
        trigger: "item",
        formatter: (p: { seriesName: string; value: [number, number] }) =>
          `${escapeHtml(p.seriesName)}<br/>${escapeHtml(spec.x ?? "")}: <b>${escapeHtml(ctx.format(p.value[0]))}</b><br/>${escapeHtml(ctx.format(p.value[1]))}`,
      },
      series: series.map((s) => ({
        id: s.key,
        name: s.label,
        type: "scatter",
        symbolSize: 9,
        ...("color" in s && s.color ? { itemStyle: { color: s.color } } : {}),
        data: spec.data.map((r) => [toNumber(spec.x ? r[spec.x] : null), toNumber(r[s.key])]),
      })),
    };
  },
  select: (spec, p) => {
    const row = spec.data[p.dataIndex];
    return row ? { row, index: p.dataIndex, seriesKey: p.seriesId, value: toNumber(p.seriesId ? row[p.seriesId] : undefined) ?? undefined } : undefined;
  },
};

/** Treemap tiles below this share of the total draw without a label. */
export const TREEMAP_LABEL_MIN_SHARE = 0.03;

const treemapKind: ChartKind = {
  id: "treemap",
  modules: () => import("echarts/charts").then(pick(["TreemapChart"])),
  build: (spec, ctx) => {
    const s = seriesOf(spec)[0];
    const values = spec.data.map((r) => (s ? toNumber(r[s.key]) : null));
    const total = values.reduce<number>((a, v) => a + Math.max(0, v ?? 0), 0);
    return {
      tooltip: {
        trigger: "item",
        formatter: (p: { name: string; value: number }) => `${escapeHtml(p.name)}: <b>${escapeHtml(ctx.format(p.value))}</b>`,
      },
      series: [
        {
          id: s?.key,
          name: s?.label,
          type: "treemap",
          roam: false,
          nodeClick: false,
          breadcrumb: { show: false },
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          label: {
            show: true,
            // A label wider than its tile ends in "…" instead of being cut mid-glyph.
            overflow: "truncate",
            ellipsis: "…",
            formatter: (p: { name: string; value: number }) => `${p.name}\n${ctx.format(p.value)}`,
          },
          itemStyle: { borderColor: ctx.theme.background, borderWidth: 2, gapWidth: 2 },
          data: spec.data.map((r, i) => ({
            name: label(spec.x ? r[spec.x] : i),
            value: values[i],
            itemStyle: { color: ctx.theme.palette[i % ctx.theme.palette.length] },
            label: {
              // Text that reads on its own tile: white on the amber tile did not.
              color: readableOn(ctx.theme.palette[i % ctx.theme.palette.length] ?? "#000"),
              // A tile under 3% of the whole has no room for a label at any
              // usual size ("M\n1." was what showed); the tooltip and the
              // table view still carry its name and value.
              show: total > 0 && Math.max(0, values[i] ?? 0) / total >= TREEMAP_LABEL_MIN_SHARE,
            },
          })),
        },
      ],
    };
  },
};

/**
 * Black or white, whichever reads on `colour` (#rgb, #rrggbb, rgb()/rgba()):
 * by relative luminance, the WCAG measure. An unparseable colour gets white.
 */
export function readableOn(colour: string): string {
  let rgb: number[] | undefined;
  const hex = colour.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    rgb = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  } else {
    const m = colour.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (m) rgb = [m[1], m[2], m[3]].map(Number);
  }
  if (!rgb) return "#ffffff";
  const lin = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
  // The luminance where black and white give equal contrast.
  return lum > 0.179 ? "#111111" : "#ffffff";
}

/** Colour stops that paint only a sliver of a dial at `target`. */
export function targetStops(target: number, max: number, colour: string): [number, string][] {
  const at = Math.min(1, Math.max(0, max > 0 ? target / max : 0));
  const half = 0.006;
  return [
    [Math.max(0, at - half), "transparent"],
    [Math.min(1, at + half), colour],
    [1, "transparent"],
  ];
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

for (const kind of [
  cartesianKind("bar", () => "bar"),
  cartesianKind("line", () => "line"),
  cartesianKind("area", () => "area"),
  cartesianKind("combo", (i) => (i === 0 ? "bar" : "line")),
  pieKind("pie", false),
  pieKind("donut", true),
  waterfallKind,
  funnelKind,
  gaugeKind,
  heatmapKind,
  scatterKind,
  treemapKind,
]) {
  registerChartKind(kind);
}
