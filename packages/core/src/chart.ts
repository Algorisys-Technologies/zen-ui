/**
 * Pie and donut geometry, and the slice maths behind them.
 *
 * Framework-agnostic, so React and Solid cannot disagree about what a slice is
 * — the same argument as mask.ts, color.ts and date-range.ts. Here it is load
 * bearing in a way it was not for the others: the React binding draws pies with
 * recharts and the Solid binding draws them with hand-built SVG paths, so the
 * two renderers share NOTHING except this file. If the percentages are computed
 * twice they will disagree twice.
 *
 * The arc maths only the Solid binding renders with, but it lives here anyway
 * because it is pure, because it is where the interesting bugs are (a 100%
 * slice, a slice past 180°), and because a check can pin it without a browser.
 */

/** One slice, after the maths. */
export interface Slice {
  label: string;
  value: number;
  /** 0–1. Zero when the total is zero, never NaN. */
  percent: number;
  color: string;
  /** Degrees from 12 o'clock, clockwise. */
  startAngle: number;
  endAngle: number;
}

/** The default slice colours: the zen palette, as custom properties. */
export const CHART_PALETTE = [
  "var(--zen-color-primary)",
  "var(--zen-color-info)",
  "var(--zen-color-success)",
  "var(--zen-color-warning)",
  "var(--zen-color-error)",
  "var(--zen-color-neutral)",
];

/**
 * Rows -> slices.
 *
 * A pie asks a different question from a line chart: every row is a slice, the
 * label comes from `labelKey` and the size from `valueKey`. That is why the
 * component needs no new props for it — `xKey` already names the label and
 * `series[0].key` already names the value.
 *
 * Rules, all of which exist because the alternative renders something wrong
 * rather than failing:
 *
 *  - A non-numeric or missing value is 0, not NaN. One NaN poisons the total
 *    and every percentage with it, and NaN reaches the DOM as an invalid path
 *    that simply does not draw.
 *  - Negative values are DROPPED, not absolute'd. A negative slice has no
 *    meaning in a part-of-whole chart: -5 of a 10 total is not half the circle,
 *    and abs() would silently show it as if it were.
 *  - A zero total yields zero percentages and zero-width arcs rather than a
 *    division by zero.
 */
export const toSlices = (
  rows: Array<Record<string, unknown>>,
  labelKey: string,
  valueKey: string,
  colors: string[] = CHART_PALETTE,
): Slice[] => {
  const usable = rows
    .map((row) => {
      const raw = row[valueKey];
      const value = typeof raw === "number" && Number.isFinite(raw) ? raw : Number(raw);
      return {
        label: String(row[labelKey] ?? ""),
        value: Number.isFinite(value) ? value : 0,
      };
    })
    .filter((s) => s.value >= 0);

  const total = usable.reduce((n, s) => n + s.value, 0);

  let angle = 0;
  return usable.map((s, i) => {
    const percent = total > 0 ? s.value / total : 0;
    const start = angle;
    const end = angle + percent * 360;
    angle = end;
    return {
      label: s.label,
      value: s.value,
      percent,
      color: colors[i % colors.length] ?? CHART_PALETTE[i % CHART_PALETTE.length],
      startAngle: start,
      endAngle: end,
    };
  });
};

/** Total of the slices' values — what a donut's centre usually wants to say. */
export const sliceTotal = (slices: Slice[]): number => slices.reduce((n, s) => n + s.value, 0);

/**
 * A point on a circle, in SVG coordinates.
 *
 * Angles run from 12 o'clock, clockwise, because that is where a pie chart
 * starts and which way it goes. SVG's own angles start at 3 o'clock and y grows
 * downward, hence the sin/-cos rather than the cos/sin you would write on paper.
 */
export const polarPoint = (cx: number, cy: number, r: number, angleDeg: number): [number, number] => {
  const rad = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
};

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * The SVG path for one pie or donut segment.
 *
 * `rInner` of 0 gives a pie wedge (a triangle to the centre); anything larger
 * gives a donut segment (two arcs joined at the ends).
 *
 * Two cases that look like edge cases and are not:
 *
 *  - **A slice of 100%.** start === end, so the arc's two points are the same
 *    point, and SVG draws NOTHING — a chart with one category renders empty,
 *    which is a real thing to have (every response the same answer). Drawn as
 *    two half-arcs instead.
 *  - **A slice past 180°.** The arc needs large-arc-flag=1 or SVG takes the
 *    short way round and draws the complement — a 270° slice appearing as 90°,
 *    which looks entirely plausible and is exactly backwards.
 */
export const arcPath = (
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  startAngle: number,
  endAngle: number,
): string => {
  const span = endAngle - startAngle;
  if (span <= 0) return "";

  // A full circle cannot be one arc: its start and end points coincide, so the
  // renderer draws nothing at all.
  if (span >= 359.999) {
    const half = startAngle + 180;
    const o0 = polarPoint(cx, cy, rOuter, startAngle).map(round);
    const oHalf = polarPoint(cx, cy, rOuter, half).map(round);
    if (rInner <= 0) {
      return `M ${o0[0]} ${o0[1]} A ${rOuter} ${rOuter} 0 1 1 ${oHalf[0]} ${oHalf[1]} A ${rOuter} ${rOuter} 0 1 1 ${o0[0]} ${o0[1]} Z`;
    }
    const i0 = polarPoint(cx, cy, rInner, startAngle).map(round);
    const iHalf = polarPoint(cx, cy, rInner, half).map(round);
    return (
      `M ${o0[0]} ${o0[1]} A ${rOuter} ${rOuter} 0 1 1 ${oHalf[0]} ${oHalf[1]} A ${rOuter} ${rOuter} 0 1 1 ${o0[0]} ${o0[1]} Z ` +
      `M ${i0[0]} ${i0[1]} A ${rInner} ${rInner} 0 1 0 ${iHalf[0]} ${iHalf[1]} A ${rInner} ${rInner} 0 1 0 ${i0[0]} ${i0[1]} Z`
    );
  }

  const largeArc = span > 180 ? 1 : 0;
  const [ox0, oy0] = polarPoint(cx, cy, rOuter, startAngle).map(round);
  const [ox1, oy1] = polarPoint(cx, cy, rOuter, endAngle).map(round);

  if (rInner <= 0) {
    return `M ${round(cx)} ${round(cy)} L ${ox0} ${oy0} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${ox1} ${oy1} Z`;
  }

  const [ix1, iy1] = polarPoint(cx, cy, rInner, endAngle).map(round);
  const [ix0, iy0] = polarPoint(cx, cy, rInner, startAngle).map(round);
  // Outer arc clockwise (sweep 1), inner arc back anticlockwise (sweep 0).
  return `M ${ox0} ${oy0} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${ox1} ${oy1} L ${ix1} ${iy1} A ${rInner} ${rInner} 0 ${largeArc} 0 ${ix0} ${iy0} Z`;
};

/**
 * A percentage, for a label. One decimal only when it needs one — "33.3%" is
 * useful, "25.0%" is noise.
 */
export const formatPercent = (percent: number): string => {
  const n = percent * 100;
  return `${Number.isInteger(n) ? n : Math.round(n * 10) / 10}%`;
};

/**
 * The one-line summary a screen reader gets before the table.
 *
 * A pie chart is the least accessible thing in any dashboard: the shape carries
 * the meaning and none of it reaches a screen reader. The component pairs this
 * with a real data table, so the numbers survive.
 */
export const describeSlices = (slices: Slice[], label = "Pie chart"): string => {
  if (!slices.length) return `${label}: no data`;
  const parts = slices.map((s) => `${s.label} ${formatPercent(s.percent)}`);
  return `${label}: ${parts.join(", ")}`;
};
