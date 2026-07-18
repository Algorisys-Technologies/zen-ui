/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import {
  CHART_PALETTE,
  describeSlices,
  formatPercent,
  toSlices,
  type Slice,
} from "@algorisys/zen-ui-core/chart";
import { cn } from "../../lib/cn";

/**
 * Chart — thin wrapper over `recharts` (an OPTIONAL peer dependency). Lazy-loads
 * recharts on first render so it never weighs on consumers who don't chart.
 * Install `recharts` to use it.
 *
 *   <Chart
 *     type="line"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "spend", label: "Spend" }, { key: "budget" }]}
 *   />
 *
 * `pie` and `donut` ask a different question from the other three — every row is
 * a slice rather than a point on an axis — but they need no new props for it:
 * `xKey` already names the label and the first series already names the value.
 *
 *   <Chart type="donut" data={rows} xKey="answer" series={[{ key: "count" }]} />
 *
 * The slice maths lives in @algorisys/zen-ui-core/chart, shared with the Solid
 * binding. That sharing is load-bearing here: the two bindings have no renderer
 * in common (recharts vs hand-built SVG), so it is the only place they can be
 * made to agree about what a percentage is.
 */

export interface ChartSeries {
  /** key into each data row */
  key: string;
  /** legend / tooltip label (defaults to `key`) */
  label?: string;
  /** override colour (any CSS colour; defaults to the zen palette) */
  color?: string;
}

export interface ChartProps {
  type?: "line" | "area" | "bar" | "pie" | "donut";
  data: Array<Record<string, any>>;
  /**
   * For line/area/bar: one entry per plotted series.
   *
   * For pie/donut: only the FIRST entry is read — it names the value on each
   * row. A pie has one number per slice; a second series would be a second pie.
   */
  series: ChartSeries[];
  /** key on each row used for the x-axis — or, for pie/donut, the slice label */
  xKey: string;
  /**
   * Slice colours for pie/donut, in row order, wrapping if short. Defaults to
   * the zen palette. (Per-series `color` cannot express this: a pie is one
   * series and many colours.)
   */
  colors?: string[];
  height?: number;
  className?: string;
}

const PALETTE = CHART_PALETTE;

const isPie = (t: ChartProps["type"]) => t === "pie" || t === "donut";

export const Chart = ({
  type = "line",
  data,
  series,
  xKey,
  colors,
  height = 300,
  className,
}: ChartProps) => {
  const [rc, setRc] = React.useState<any>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    import("recharts")
      .then((m) => {
        if (alive) setRc(m);
      })
      // recharts is an optional peer, so a consumer who never installed it gets
      // here. Saying so beats "Loading chart…" forever, which is what a silent
      // catch left on screen — a bug that looks like a slow network.
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const slices = React.useMemo(
    () => (isPie(type) && series[0] ? toSlices(data, xKey, series[0].key, colors ?? PALETTE) : []),
    [type, data, xKey, series, colors],
  );

  if (failed) {
    return (
      <div
        className={cn(
          "zen-flex zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-p-4 zen-text-center zen-text-sm zen-text-zen-muted-fg",
          className,
        )}
        style={{ height }}
      >
        Chart needs the optional peer dependency <code className="zen-mx-1">recharts</code> — install
        it to render this.
      </div>
    );
  }

  if (!rc) {
    return (
      <div
        className={cn(
          "zen-flex zen-items-center zen-justify-center zen-text-sm zen-text-zen-muted-fg",
          className,
        )}
        style={{ height }}
      >
        Loading chart…
      </div>
    );
  }

  const {
    ResponsiveContainer,
    LineChart,
    AreaChart,
    BarChart,
    PieChart,
    Pie,
    Cell,
    Line,
    Area,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } = rc;

  if (isPie(type)) {
    return (
      <div className={className} style={{ width: "100%", height }}>
        {/* The shape carries the whole meaning and none of it reaches a screen
            reader, so the numbers are published as a real table underneath. */}
        <div
          role="img"
          aria-label={describeSlices(slices, type === "donut" ? "Donut chart" : "Pie chart")}
          style={{ width: "100%", height: "calc(100% - 28px)" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip formatter={(v: number, n: string) => [v, n]} />
              <Pie
                data={slices.map((s) => ({ name: s.label, value: s.value }))}
                dataKey="value"
                nameKey="name"
                // Recharts defaults to starting at 3 o'clock and sweeping
                // ANTICLOCKWISE. core/chart — and therefore the Solid binding,
                // which draws these arcs by hand — starts at 12 o'clock and goes
                // clockwise, which is what a pie chart does everywhere else.
                // Without this the two bindings draw identical data in different
                // places from identical props: same numbers, different picture.
                startAngle={90}
                endAngle={-270}
                // A donut is a pie with a hole; the hole is the only difference,
                // so it is implied by the type rather than a knob to get wrong.
                innerRadius={type === "donut" ? "55%" : 0}
                outerRadius="80%"
                paddingAngle={0}
                isAnimationActive={false}
              >
                {slices.map((s) => (
                  <Cell key={s.label} fill={s.color} stroke="var(--zen-color-background)" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <SliceLegend slices={slices} />
        <SliceTable slices={slices} labelHeader={xKey} />
      </div>
    );
  }

  const ChartRoot = type === "area" ? AreaChart : type === "bar" ? BarChart : LineChart;
  const Series = type === "area" ? Area : type === "bar" ? Bar : Line;

  return (
    <div className={className} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartRoot data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--zen-color-border)" />
          <XAxis dataKey={xKey} stroke="var(--zen-color-muted-fg)" fontSize={12} />
          <YAxis stroke="var(--zen-color-muted-fg)" fontSize={12} />
          <Tooltip />
          <Legend />
          {series.map((s, i) => {
            const color = s.color ?? PALETTE[i % PALETTE.length];
            return (
              <Series
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                fill={color}
                fillOpacity={type === "area" ? 0.2 : 1}
              />
            );
          })}
        </ChartRoot>
      </ResponsiveContainer>
    </div>
  );
};
Chart.displayName = "Chart";

/**
 * The pie's legend, hand-built rather than recharts'.
 *
 * recharts orders a pie legend ALPHABETICALLY and ignores an explicit payload,
 * so it cannot be made to follow the slices — and a legend in a different order
 * from the thing it labels is a lookup table, not a key. Building it here is
 * also what makes the two bindings' pies identical: same order, same markers,
 * same tokens, from the same slices.
 */
const SliceLegend: React.FC<{ slices: Slice[] }> = ({ slices }) => (
  <div className="zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-3 zen-text-xs">
    {slices.map((s) => (
      <span key={s.label} className="zen-inline-flex zen-items-center zen-gap-1.5">
        <span
          aria-hidden
          className="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full"
          style={{ backgroundColor: s.color }}
        />
        <span className="zen-text-zen-muted-fg">{s.label}</span>
      </span>
    ))}
  </div>
);

/**
 * The slice data as a table, for screen readers.
 *
 * Visually hidden rather than absent: `aria-label` can say "Agree 50%, Neutral
 * 30%" but a listener cannot navigate a sentence, compare two numbers, or come
 * back to one. A table they can. This is the difference between a pie chart
 * being described and being readable.
 */
const SliceTable: React.FC<{ slices: Slice[]; labelHeader: string }> = ({ slices, labelHeader }) => (
  <table className="zen-sr-only">
    <caption>Chart data</caption>
    <thead>
      <tr>
        <th scope="col">{labelHeader}</th>
        <th scope="col">Value</th>
        <th scope="col">Share</th>
      </tr>
    </thead>
    <tbody>
      {slices.map((s) => (
        <tr key={s.label}>
          <th scope="row">{s.label}</th>
          <td>{s.value}</td>
          <td>{formatPercent(s.percent)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);
