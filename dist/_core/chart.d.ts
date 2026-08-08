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
export declare const CHART_PALETTE: string[];
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
export declare const toSlices: (rows: Array<Record<string, unknown>>, labelKey: string, valueKey: string, colors?: string[]) => Slice[];
/** Total of the slices' values — what a donut's centre usually wants to say. */
export declare const sliceTotal: (slices: Slice[]) => number;
/**
 * A point on a circle, in SVG coordinates.
 *
 * Angles run from 12 o'clock, clockwise, because that is where a pie chart
 * starts and which way it goes. SVG's own angles start at 3 o'clock and y grows
 * downward, hence the sin/-cos rather than the cos/sin you would write on paper.
 */
export declare const polarPoint: (cx: number, cy: number, r: number, angleDeg: number) => [number, number];
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
export declare const arcPath: (cx: number, cy: number, rOuter: number, rInner: number, startAngle: number, endAngle: number) => string;
/**
 * A percentage, for a label. One decimal only when it needs one — "33.3%" is
 * useful, "25.0%" is noise.
 */
export declare const formatPercent: (percent: number) => string;
/**
 * The one-line summary a screen reader gets before the table.
 *
 * A pie chart is the least accessible thing in any dashboard: the shape carries
 * the meaning and none of it reaches a screen reader. The component pairs this
 * with a real data table, so the numbers survive.
 */
export declare const describeSlices: (slices: Slice[], label?: string) => string;
