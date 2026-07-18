/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMemo, createSignal, onCleanup, For, Show, mergeProps } from "solid-js";
import {
  CHART_PALETTE,
  arcPath,
  describeSlices,
  formatPercent,
  toSlices,
  type Slice,
} from "@algorisys/zen-ui-core/chart";
import { cn } from "../../lib/cn";

/**
 * Chart — line / area / bar chart rendered as plain SVG. No dependency.
 *
 * The React binding wraps `recharts`, which is React-only. Rather than pull a
 * React runtime into the Solid binding, this renders the same chart types from
 * the same public props with hand-built SVG, so `Chart` works out of the box
 * with nothing to install.
 *
 * That means the two bindings share no renderer at all, which is exactly why
 * the pie/donut maths lives in @algorisys/zen-ui-core/chart rather than here:
 * it is the only thing the two can agree about a percentage through.
 *
 *   <Chart
 *     type="line"
 *     data={rows}
 *     xKey="month"
 *     series={[{ key: "spend", label: "Spend" }, { key: "budget" }]}
 *   />
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
  class?: string;
}

/** Shared with the React binding, so the two cannot drift apart. */
const PALETTE = CHART_PALETTE;

/** SVG-space geometry, in px. Not CSS lengths — no token applies. */
const PAD = { top: 12, right: 12, bottom: 24, left: 44 };
const LEGEND_H = 28;
const TICK_COUNT = 5;

const niceNum = (range: number, round: boolean): number => {
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  else nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * Math.pow(10, exp);
};

/** Axis domain rounded out to human-readable tick boundaries. */
const niceScale = (rawMin: number, rawMax: number) => {
  let min = rawMin;
  let max = rawMax;
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    min = 0;
    max = 1;
  }
  if (min === max) {
    // Flat series: open the domain so the line does not sit on an edge.
    min = min === 0 ? 0 : min - Math.abs(min) * 0.5;
    max = max === 0 ? 1 : max + Math.abs(max) * 0.5;
  }
  const step = niceNum(niceNum(max - min, false) / (TICK_COUNT - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    // Kill float drift from repeated addition (0.30000000000000004).
    ticks.push(Number(v.toPrecision(12)));
  }
  return { min: niceMin, max: niceMax, ticks };
};

const formatTick = (v: number): string => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${Number((v / 1_000_000_000).toPrecision(3))}B`;
  if (abs >= 1_000_000) return `${Number((v / 1_000_000).toPrecision(3))}M`;
  if (abs >= 1_000) return `${Number((v / 1_000).toPrecision(3))}k`;
  return `${Number(v.toPrecision(6))}`;
};

export const Chart = (props: ChartProps) => {
  const merged = mergeProps({ type: "line" as const, height: 300 }, props);

  // A pie answers a different question from an axis chart — parts of a whole,
  // not a value over a range — so it shares none of the scale/axis machinery
  // below. Splitting here keeps that machinery from growing a "unless it is a
  // pie" branch in every function.
  return (
    <Show when={merged.type !== "pie" && merged.type !== "donut"} fallback={<PieDonut {...merged} />}>
      <AxisChart {...merged} />
    </Show>
  );
};
Chart.displayName = "Chart";

// Named `merged` rather than aliased from `props`: an alias is what the
// reactivity rule flags, and Solid's props object must be read through, never
// captured.
const AxisChart = (merged: ChartProps & { type: "line" | "area" | "bar" | "pie" | "donut"; height: number }) => {

  const [width, setWidth] = createSignal(0);
  const [hover, setHover] = createSignal<number | null>(null);

  let host: HTMLDivElement | undefined;

  const attachHost = (el: HTMLDivElement) => {
    host = el;
    // Width is measured, not declared: mirrors recharts' ResponsiveContainer.
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? el.clientWidth;
      setWidth(w);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    onCleanup(() => ro.disconnect());
  };

  const colorOf = (s: ChartSeries, i: number) => s.color ?? PALETTE[i % PALETTE.length];
  const labelOf = (s: ChartSeries) => s.label ?? s.key;

  const svgH = () => Math.max(0, merged.height - LEGEND_H);
  const plotW = () => Math.max(0, width() - PAD.left - PAD.right);
  const plotH = () => Math.max(0, svgH() - PAD.top - PAD.bottom);

  const valueAt = (row: Record<string, any>, key: string): number | null => {
    const raw = Number(row?.[key]);
    return Number.isFinite(raw) ? raw : null;
  };

  const scale = createMemo(() => {
    const values: number[] = [];
    for (const row of merged.data) {
      for (const s of merged.series) {
        const v = valueAt(row, s.key);
        if (v !== null) values.push(v);
      }
    }
    if (values.length === 0) return niceScale(0, 1);
    // Bars and areas are read against a zero baseline; a line is not.
    const dataMin = Math.min(...values);
    const dataMax = Math.max(...values);
    const zeroBased = merged.type !== "line";
    return niceScale(
      zeroBased ? Math.min(0, dataMin) : dataMin,
      zeroBased ? Math.max(0, dataMax) : dataMax,
    );
  });

  const y = (v: number) => {
    const { min, max } = scale();
    const span = max - min || 1;
    return PAD.top + plotH() * (1 - (v - min) / span);
  };

  const bandW = () => (merged.data.length > 0 ? plotW() / merged.data.length : plotW());

  /** Centre of the slot for row `i` on the x-axis. */
  const x = (i: number) => {
    const n = merged.data.length;
    if (merged.type === "bar") return PAD.left + bandW() * (i + 0.5);
    if (n <= 1) return PAD.left + plotW() / 2;
    return PAD.left + (plotW() * i) / (n - 1);
  };

  const linePath = (key: string): string => {
    let d = "";
    let pen = false;
    merged.data.forEach((row, i) => {
      const v = valueAt(row, key);
      if (v === null) {
        // Gap in the series: lift the pen rather than interpolate across it.
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i)} ${y(v)} `;
      pen = true;
    });
    return d.trim();
  };

  const areaPath = (key: string): string => {
    const pts = merged.data
      .map((row, i) => ({ i, v: valueAt(row, key) }))
      .filter((p): p is { i: number; v: number } => p.v !== null);
    if (pts.length === 0) return "";
    const { min, max } = scale();
    const base = y(Math.min(Math.max(0, min), max));
    const top = pts.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i)} ${y(p.v)}`).join(" ");
    return `${top} L${x(pts[pts.length - 1].i)} ${base} L${x(pts[0].i)} ${base} Z`;
  };

  /** Drop x labels until they stop colliding (~60px each). */
  const labelStride = createMemo(() => {
    const n = merged.data.length;
    if (n === 0) return 1;
    const fits = Math.max(1, Math.floor(plotW() / 60));
    return Math.max(1, Math.ceil(n / fits));
  });

  const indexFromPointer = (clientX: number): number | null => {
    if (!host || merged.data.length === 0) return null;
    const rel = clientX - host.getBoundingClientRect().left;
    const n = merged.data.length;
    if (merged.type === "bar") {
      const i = Math.floor((rel - PAD.left) / (bandW() || 1));
      return i >= 0 && i < n ? i : null;
    }
    if (n === 1) return 0;
    const i = Math.round(((rel - PAD.left) / (plotW() || 1)) * (n - 1));
    return Math.min(n - 1, Math.max(0, i));
  };

  const tooltipRows = createMemo(() => {
    const i = hover();
    if (i === null) return null;
    const row = merged.data[i];
    if (!row) return null;
    return {
      x: String(row[merged.xKey] ?? ""),
      items: merged.series.map((s, si) => ({
        label: labelOf(s),
        color: colorOf(s, si),
        value: row[s.key],
      })),
    };
  });

  return (
    <div
      ref={attachHost}
      class={cn("zen-relative zen-w-full", merged.class)}
      style={{ height: `${merged.height}px` }}
    >
      <Show when={width() > 0}>
        <svg
          width={width()}
          height={svgH()}
          role="img"
          aria-label={`${merged.type} chart`}
          onMouseMove={(e) => setHover(indexFromPointer(e.clientX))}
          onMouseLeave={() => setHover(null)}
        >
          {/* horizontal grid + y ticks */}
          <For each={scale().ticks}>
            {(t) => (
              <>
                <line
                  x1={PAD.left}
                  x2={PAD.left + plotW()}
                  y1={y(t)}
                  y2={y(t)}
                  stroke="var(--zen-color-border)"
                  stroke-dasharray="3 3"
                />
                <text
                  x={PAD.left - 8}
                  y={y(t)}
                  text-anchor="end"
                  dominant-baseline="middle"
                  font-size="12"
                  fill="var(--zen-color-muted-fg)"
                >
                  {formatTick(t)}
                </text>
              </>
            )}
          </For>

          {/* x axis line + labels */}
          <line
            x1={PAD.left}
            x2={PAD.left + plotW()}
            y1={PAD.top + plotH()}
            y2={PAD.top + plotH()}
            stroke="var(--zen-color-border)"
          />
          <For each={merged.data}>
            {(row, i) => (
              <Show when={i() % labelStride() === 0}>
                <text
                  x={x(i())}
                  y={PAD.top + plotH() + 16}
                  text-anchor="middle"
                  font-size="12"
                  fill="var(--zen-color-muted-fg)"
                >
                  {String(row[merged.xKey] ?? "")}
                </text>
              </Show>
            )}
          </For>

          {/* hover guide */}
          <Show when={hover() !== null && merged.type !== "bar"}>
            <line
              x1={x(hover()!)}
              x2={x(hover()!)}
              y1={PAD.top}
              y2={PAD.top + plotH()}
              stroke="var(--zen-color-border)"
            />
          </Show>

          {/* series */}
          <For each={merged.series}>
            {(s, si) => {
              const color = () => colorOf(s, si());
              return (
                <Show
                  when={merged.type === "bar"}
                  fallback={
                    <>
                      <Show when={merged.type === "area"}>
                        <path d={areaPath(s.key)} fill={color()} fill-opacity="0.2" stroke="none" />
                      </Show>
                      <path
                        d={linePath(s.key)}
                        fill="none"
                        stroke={color()}
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </>
                  }
                >
                  <For each={merged.data}>
                    {(row, i) => {
                      const v = () => valueAt(row, s.key);
                      const slot = () => (bandW() * 0.7) / Math.max(1, merged.series.length);
                      const bx = () =>
                        x(i()) - (bandW() * 0.7) / 2 + slot() * si();
                      const zero = () => {
                        const { min, max } = scale();
                        return y(Math.min(Math.max(0, min), max));
                      };
                      return (
                        <Show when={v() !== null}>
                          <rect
                            x={bx()}
                            y={Math.min(y(v()!), zero())}
                            width={Math.max(0, slot())}
                            height={Math.abs(zero() - y(v()!))}
                            fill={color()}
                          />
                        </Show>
                      );
                    }}
                  </For>
                </Show>
              );
            }}
          </For>

          {/* point markers on the hovered row */}
          <Show when={hover() !== null && merged.type !== "bar"}>
            <For each={merged.series}>
              {(s, si) => {
                const v = () => valueAt(merged.data[hover()!] ?? {}, s.key);
                return (
                  <Show when={v() !== null}>
                    <circle
                      cx={x(hover()!)}
                      cy={y(v()!)}
                      r="3.5"
                      fill={colorOf(s, si())}
                      stroke="var(--zen-color-background)"
                      stroke-width="1.5"
                    />
                  </Show>
                );
              }}
            </For>
          </Show>
        </svg>
      </Show>

      {/* legend */}
      <div
        class="zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-4"
        style={{ height: `${LEGEND_H}px` }}
      >
        <For each={merged.series}>
          {(s, si) => (
            <span class="zen-inline-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg">
              <span
                class="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full"
                style={{ "background-color": colorOf(s, si()) }}
              />
              {labelOf(s)}
            </span>
          )}
        </For>
      </div>

      {/* tooltip */}
      <Show when={tooltipRows()}>
        {(tip) => (
          <div
            class="zen-pointer-events-none zen-absolute zen-top-2 zen-z-10 zen-min-w-24 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-2 zen-text-xs zen-shadow-md"
            style={{
              // Flip to the left of the guide once past the midpoint so the
              // tooltip never runs off the container.
              left:
                x(hover()!) > width() / 2
                  ? "auto"
                  : `${Math.min(x(hover()!) + 12, Math.max(0, width() - 8))}px`,
              right:
                x(hover()!) > width() / 2 ? `${Math.max(0, width() - x(hover()!) + 12)}px` : "auto",
            }}
          >
            <div class="zen-mb-1 zen-font-medium zen-text-zen-foreground">{tip().x}</div>
            <For each={tip().items}>
              {(item) => (
                <div class="zen-flex zen-items-center zen-gap-1.5 zen-text-zen-muted-fg">
                  <span
                    class="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full"
                    style={{ "background-color": item.color }}
                  />
                  <span>{item.label}</span>
                  <span class="zen-ml-auto zen-font-medium zen-text-zen-foreground">
                    {String(item.value ?? "—")}
                  </span>
                </div>
              )}
            </For>
          </div>
        )}
      </Show>
    </div>
  );
};

/**
 * Pie and donut — hand-built arcs, mirroring what the React binding gets from
 * recharts' <Pie>.
 *
 * A viewBox rather than a measured width: unlike the axis charts, nothing here
 * needs to know its pixel size. The circle is drawn once in a 0–100 space and
 * the browser scales it, so there is no ResizeObserver and no first-paint jump.
 *
 * All the geometry comes from core: the arc path, the angles, the percentages.
 * The interesting cases are pinned by `bun run check:chart` — a 100% slice
 * (start === end draws NOTHING), and a slice past 180° (drawn as its own
 * complement without the large-arc flag, which looks perfectly convincing).
 */
const R_OUTER = 40;
const R_INNER = 22;

const PieDonut = (props: ChartProps & { type: "line" | "area" | "bar" | "pie" | "donut"; height: number }) => {
  const [hover, setHover] = createSignal<number | null>(null);

  const slices = createMemo(() =>
    props.series[0]
      ? toSlices(props.data, props.xKey, props.series[0].key, props.colors ?? PALETTE)
      : [],
  );

  const label = () => (props.type === "donut" ? "Donut chart" : "Pie chart");
  const svgH = () => Math.max(0, props.height - LEGEND_H);

  return (
    <div class={cn("zen-relative zen-w-full", props.class)} style={{ height: `${props.height}px` }}>
      <svg
        width="100%"
        height={svgH()}
        viewBox="0 0 100 100"
        role="img"
        aria-label={describeSlices(slices(), label())}
      >
        <For each={slices()}>
          {(s, i) => (
            <path
              d={arcPath(50, 50, R_OUTER, props.type === "donut" ? R_INNER : 0, s.startAngle, s.endAngle)}
              fill={s.color}
              // The gap between slices is the page showing through, not a
              // colour — so it stays right in any theme.
              stroke="var(--zen-color-background)"
              stroke-width="0.75"
              opacity={hover() === null || hover() === i() ? 1 : 0.45}
              onMouseEnter={() => setHover(i())}
              onMouseLeave={() => setHover(null)}
            />
          )}
        </For>
      </svg>

      <Show when={hover() !== null && slices()[hover()!]}>
        {(s) => (
          <div
            class={cn(
              "zen-pointer-events-none zen-absolute zen-left-1/2 zen-top-2 -zen-translate-x-1/2",
              "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
              "zen-px-2 zen-py-1 zen-text-xs zen-text-zen-foreground zen-shadow-md",
            )}
          >
            <span class="zen-font-medium">{s().label}</span>{" "}
            <span class="zen-text-zen-muted-fg">
              {s().value} · {formatPercent(s().percent)}
            </span>
          </div>
        )}
      </Show>

      <div class="zen-flex zen-flex-wrap zen-items-center zen-justify-center zen-gap-3 zen-text-xs">
        <For each={slices()}>
          {(s, i) => (
            <span
              class="zen-inline-flex zen-cursor-default zen-items-center zen-gap-1.5"
              onMouseEnter={() => setHover(i())}
              onMouseLeave={() => setHover(null)}
            >
              <span
                aria-hidden="true"
                class="zen-inline-block zen-h-2 zen-w-2 zen-rounded-zen-full"
                style={{ "background-color": s.color }}
              />
              <span class="zen-text-zen-muted-fg">{s.label}</span>
            </span>
          )}
        </For>
      </div>

      <SliceTable slices={slices()} labelHeader={props.xKey} />
    </div>
  );
};

/**
 * The slice data as a table, for screen readers.
 *
 * Visually hidden rather than absent: an aria-label can say "Agree 50%, Neutral
 * 30%", but a listener cannot navigate a sentence, compare two numbers in it, or
 * come back to one. A table they can. This is the difference between a pie chart
 * being described and being readable. Mirrors the React binding.
 */
const SliceTable = (props: { slices: Slice[]; labelHeader: string }) => (
  <table class="zen-sr-only">
    <caption>Chart data</caption>
    <thead>
      <tr>
        <th scope="col">{props.labelHeader}</th>
        <th scope="col">Value</th>
        <th scope="col">Share</th>
      </tr>
    </thead>
    <tbody>
      <For each={props.slices}>
        {(s) => (
          <tr>
            <th scope="row">{s.label}</th>
            <td>{s.value}</td>
            <td>{formatPercent(s.percent)}</td>
          </tr>
        )}
      </For>
    </tbody>
  </table>
);
