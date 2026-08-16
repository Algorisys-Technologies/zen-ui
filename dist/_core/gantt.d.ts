/**
 * Layout maths for a project schedule — the arithmetic behind Gantt, with no
 * DOM and no framework in it.
 *
 * A Gantt is a PlanningCalendar whose rows nest and whose blocks know about
 * each other. Bar placement and the now line still come from ./planning, which
 * four renderers already agree on. What this module adds is the five things a
 * schedule has that a calendar does not:
 *
 *  1. a hierarchy that collapses, so the visible rows are a projection of the
 *     tree rather than the tree itself;
 *  2. summary bars — a parent with no dates of its own spans its children, and
 *     its percent-complete is their duration-weighted average;
 *  3. slip against a baseline, in whole calendar days;
 *  4. dependency connectors, as orthogonal routes between two bars;
 *  5. an axis that can show a whole PROJECT — see below.
 *
 * All of them fail silently when wrong. A collapsed subtree that drops its
 * dependency arrows looks like a project with no dependencies. A parent bar
 * rolled up from the wrong children is a plausible date. A connector routed
 * through a bar is just an ugly line. Nothing throws, so scripts/check-gantt.ts
 * is where they are pinned.
 *
 * THE AXIS — this module's header used to say the axis was deliberately not
 * re-derived here, and that stopped being true when `quarter` and `year` were
 * added. The reason it changed: PlanningCalendar's widest view is one calendar
 * month, which is right for "who is busy this month" and useless for a plan
 * that runs from July to October — every phase after the first renders
 * correctly and emptily, and the shape of the project, the one thing a Gantt
 * exists to show, cannot be seen at all.
 *
 * So `ganttRange` / `ganttColumns` / `ganttRangeLabel` / `shiftGanttAnchor`
 * DELEGATE to their planning equivalents for day, week and month, and handle
 * quarter and year themselves. `PlanningView` is deliberately NOT widened:
 * it ships in 10.0.0, so adding members is source-breaking for any exhaustive
 * switch over it, and it would hand PlanningCalendar two views it was never
 * designed or tested for. `GanttView` is the superset.
 *
 * EQUAL-DURATION COLUMNS ARE AN ASSUMPTION, AND THE NEW VIEWS BREAK IT.
 * `placeAppointment` returns percentages of the whole range, so a bar only
 * lands on a gridline when the column under it occupies the same fraction of
 * the axis that it does of the range. That is automatic while every column is
 * the same length — an hour, a day — and false the moment columns are months:
 * 28 to 31 days drawn at one uniform width drifts a bar off its gridline by up
 * to three days across a year, and looks entirely plausible while doing it.
 * `ganttColumnWidths` is the fix and the reason it lives here rather than in a
 * renderer: widths come from each column's own duration, so the tiling and the
 * placement are computed from one set of numbers.
 *
 * TIME ZONES: as in ./planning, everything is computed from the caller's local
 * `Date` objects, deliberately unconverted.
 */
import { type PlanningColumn, type PlanningColumnOptions, type PlanningPlacement, type PlanningRange, type PlanningView } from "./planning";
/**
 * The views whose range is a function of the ANCHOR date: move the anchor and
 * the window moves with it, which is what makes prev / next / today mean
 * something.
 *
 * A superset rather than a widening of `PlanningView` — see the module note.
 * Quarter draws week columns, year draws month columns; both have columns of
 * UNEQUAL duration, which is what `ganttColumnWidths` exists for.
 */
export type GanttAnchoredView = PlanningView | "quarter" | "year";
/**
 * Every view a Gantt offers, including the one whose range comes from the DATA.
 *
 * `fit` is the odd one out and deliberately typed apart from the rest: its range
 * is the span of the tasks, so `ganttRange`, `ganttColumns`, `ganttRangeLabel`
 * and `shiftGanttAnchor` cannot answer for it and do not accept it. That is a
 * compile error rather than a silent wrong axis, which is the same trap
 * `planningRange` still has for `quarter` and `year` — its final branch returns
 * a MONTH for anything it does not recognise, so a view it has never heard of
 * type-checks and draws the wrong four weeks. Use `ganttFitRange` +
 * `ganttRangeColumns` for `fit`; the renderer branches once, at the top.
 */
export type GanttView = GanttAnchoredView | "fit";
export type GanttTaskStatus = "not-started" | "on-track" | "delayed" | "complete";
/**
 * Which end of each bar a link joins.
 *
 * All four exist because they are the same two-line anchor choice, and adding
 * one later would be a change to a shipped `dependencies` array. Finish-to-start
 * is the default and by far the common one: B cannot begin until A is done.
 */
export type GanttDependencyType = "finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish";
export interface GanttDependency {
    /** Id of the task that comes first. */
    from: string;
    /** Id of the task that waits. */
    to: string;
    /** Default "finish-to-start". */
    type?: GanttDependencyType;
    /**
     * Enforced delay between the two ends, in WORKING minutes — "start four hours
     * after the previous operation finishes, for cooling".
     *
     * Negative is a LEAD: the successor may begin that much before the link would
     * otherwise allow, which is how overlapping operations are expressed ("start
     * the next op when the first is 80% through"). Working minutes rather than
     * elapsed, for the reason everything else here is: four hours of cooling that
     * begins at 16:00 on a single-shift plant is not done at 20:00.
     *
     * Nothing in this module ENFORCES it. A read-only schedule reports a link it
     * violates and draws the bars where the caller put them — see
     * `productionSequenceConflicts`.
     */
    lagMinutes?: number;
}
/**
 * The minimum a task must have for the maths to work. A binding's own task type
 * adds the display fields (name, assignees) and extends this.
 */
export interface GanttTaskNode {
    id: string;
    /** Omit both dates on a summary row to have them rolled up from the children. */
    start?: Date;
    end?: Date;
    /** 0–100. Omit on a parent to have it averaged from the children. */
    percentComplete?: number;
    /**
     * Duration in WORKING minutes. With a `start` and no `end`, the end is
     * computed from the calendar — which is how a 6-hour job starting Friday
     * 16:00 correctly finishes on Monday. Ignored when `end` is given, since an
     * explicit end is a statement and a duration is a derivation.
     *
     * With no calendar in play this is elapsed minutes, because no calendar means
     * a 24/7 one and the two are then the same number.
     */
    workingMinutes?: number;
    /** What the plan originally promised. Slip is measured against this. */
    baselineEnd?: Date;
    /** Overrides the derived status. */
    status?: GanttTaskStatus;
    children?: GanttTaskNode[];
}
export interface GanttSpan {
    start: Date;
    /** Inclusive of the last instant of work; half-open against the axis, as in ./planning. */
    end: Date;
}
/** Minutes from local midnight, half-open: `[from, to)`. 1440 is end of day. */
export interface GanttWorkingPeriod {
    from: number;
    to: number;
}
/** A dated override of the weekly pattern: a holiday, a shutdown, overtime. */
export interface GanttCalendarException {
    /** Any instant on the day this applies to. Only the local date is read. */
    date: Date;
    /** That day's working periods. An EMPTY array is a full non-working day. */
    periods: GanttWorkingPeriod[];
}
/**
 * When work can happen.
 *
 * Every working-time function takes one of these explicitly rather than reading
 * an ambient default. That is what leaves room for per-resource calendars later
 * — a machine on continuous run, a line on two shifts — without rewriting the
 * module: the call site gains a lookup, the maths does not change. There is one
 * calendar today because there is one kind of row today.
 */
export interface GanttCalendar {
    /** Working periods per weekday, index 0 = Sunday, matching `Date#getDay`. */
    week: GanttWorkingPeriod[][];
    exceptions?: GanttCalendarException[];
    /** Names the calendar, for the per-resource case. Unused today. */
    id?: string;
}
/**
 * Always working. Passing this is exactly equivalent to passing no calendar at
 * all, which is the property that makes the whole feature backward compatible —
 * and it is asserted rather than assumed in scripts/check-gantt.ts.
 */
export declare const GANTT_CALENDAR_24_7: GanttCalendar;
/**
 * The working periods that apply on a given date.
 *
 * An exception REPLACES the weekday pattern rather than adding to it, so a
 * holiday is `periods: []` and a one-off Saturday shift is the shift. Merging
 * the two instead would make "closed on Boxing Day" impossible to express.
 */
export declare function ganttWorkingPeriodsOn(calendar: GanttCalendar, day: Date): GanttWorkingPeriod[];
/** Whether an instant falls inside working time. */
export declare function ganttIsWorking(calendar: GanttCalendar, at: Date): boolean;
/**
 * Working milliseconds in `[from, to)`.
 *
 * Half-open at both ends, as everywhere else in this module: work that ends
 * exactly when a shift ends is counted once, not once per adjacent period.
 */
export declare function ganttWorkingMs(calendar: GanttCalendar, from: Date, to: Date): number;
/**
 * `from` plus a working duration.
 *
 * This is the function that answers the Friday-16:00 question, and it is the
 * one everything in the tiers above it — setup times, capacity, float — is
 * eventually built on.
 *
 * A duration that exactly fills the remainder of a shift ends AT the shift end,
 * not at the start of the next one. "Finishes at 17:00" is what a planner
 * means, and pushing it to 06:00 the next morning would report a job as
 * finishing on a day no work happened.
 *
 * A non-positive duration returns `from` unchanged, including when `from` is
 * outside working time — a milestone is a point someone chose, not a point to
 * be relocated.
 */
export declare function ganttAddWorkingMs(calendar: GanttCalendar, from: Date, ms: number): Date;
/**
 * `from` minus a working duration — `ganttAddWorkingMs` walking backwards.
 *
 * Needed because a dependency LEAD is a negative lag, and "four working hours
 * before 09:00 on Monday" is 13:00 the previous Friday on a single-shift plant,
 * not 05:00 on Monday. Subtracting milliseconds gets the second answer, which
 * is a time nobody was at work.
 *
 * A separate function rather than widening `ganttAddWorkingMs` to accept a
 * negative: that one's contract is that a non-positive duration returns `from`
 * unchanged — a milestone is a point someone chose, not a point to be
 * relocated — and several assertions rest on it.
 *
 * Lands ON a period's start rather than at the end of the previous one, which
 * is the mirror of the forward rule: "starts at 06:00" is what a planner means,
 * and pushing it back to 17:00 the day before would report work beginning on a
 * day nothing happened.
 */
export declare function ganttSubWorkingMs(calendar: GanttCalendar, from: Date, ms: number): Date;
export interface GanttSegmentOptions {
    /**
     * Gaps shorter than this are absorbed rather than split on.
     *
     * Derived by the renderer from the axis scale — roughly one pixel's worth of
     * time — because splitting is a geometry decision, not a data one. A 6-hour
     * job across a weekend is two segments and that is the point; a three-month
     * summary bar under a 24/5 calendar is ~65 segments, none of them a pixel
     * wide, which is 65 DOM nodes to draw a dashed line.
     */
    minGapMs?: number;
    /**
     * Beyond this, the span is returned whole. A safety net against a calendar
     * that alternates every few minutes, which would otherwise be able to hang
     * the renderer.
     */
    maxSegments?: number;
}
/**
 * `[from, to)` broken into the stretches where work actually happens.
 *
 * Returns `[]` when no part of the span is working time. That is deliberately
 * NOT the same as returning the whole span: the caller has to be able to tell
 * "this job runs straight through" from "this job is scheduled entirely inside
 * a shutdown", and the second is a data error worth showing rather than hiding.
 */
export declare function ganttWorkingSegments(calendar: GanttCalendar, from: Date, to: Date, options?: GanttSegmentOptions): GanttSpan[];
/** One visible line of the chart: a task, plus everything derived about it. */
export interface GanttRow<T extends GanttTaskNode = GanttTaskNode> {
    task: T;
    /** 0 for a root. Drives the indent, not the layout. */
    depth: number;
    /** Position in the visible list. This is the row's y coordinate. */
    index: number;
    parentId: string | null;
    hasChildren: boolean;
    expanded: boolean;
    /**
     * Its own dates, or the union of its descendants'. Null when nothing has
     * dates. With a calendar in play this is CLAMPED to the working segments
     * below — see `segments` for why that matters.
     */
    span: GanttSpan | null;
    /**
     * The stretches of `span` where work actually happens, or null when the bar
     * is drawn whole (no calendar, one continuous segment, or a span with no
     * working time in it at all).
     *
     * `span` and `segments` cannot disagree: whenever segments exist, `span` has
     * been clamped to `[segments[0].start, segments.at(-1).end]`. That is what
     * keeps a dependency arrow on the bar it points at — anchoring to an
     * unclamped envelope would put a finish-to-start arrow two days left of a
     * bar whose first working segment is Monday.
     */
    segments: GanttSpan[] | null;
    /** Its own percentComplete, or the descendants' weighted average. Null when unknown. */
    progress: number | null;
    status: GanttTaskStatus;
    /** Whole calendar days late (positive) or early (negative). Null with no baseline. */
    variance: number | null;
}
export interface GanttFlatten<T extends GanttTaskNode = GanttTaskNode> {
    rows: GanttRow<T>[];
    /**
     * EVERY task id, visible or not, mapped to the row that represents it.
     *
     * A task inside a collapsed parent has no row of its own, so it maps to the
     * nearest ancestor that does. That is what lets a dependency touching a hidden
     * task still be drawn — against the summary bar it collapsed into — instead of
     * disappearing and making the project look dependency-free.
     */
    rowIndexById: Map<string, number>;
}
/**
 * The half-open interval a view covers.
 *
 * Delegates for day / week / month. A quarter is a CALENDAR quarter — the 1st
 * of Jan/Apr/Jul/Oct to the 1st of the next one — not three months from the
 * anchor, so the same quarter is shown from any date inside it and the columns
 * line up with how anyone reports one.
 */
export declare function ganttRange(view: GanttAnchoredView, anchor: Date): PlanningRange;
/** Move the anchor one view forward or back. `delta` is in views, not days. */
export declare function shiftGanttAnchor(view: GanttAnchoredView, anchor: Date, delta: number): Date;
/** A heading for the whole range — what the toolbar shows between the arrows. */
export declare function ganttRangeLabel(view: GanttAnchoredView, anchor: Date): string;
/**
 * The columns a view shows.
 *
 * Quarter is weeks and year is months, because a quarter of day-columns is 90
 * of them and a year is 365 — readable only as a smear. Both granularities
 * produce columns of UNEQUAL duration, deliberately:
 *
 *  - A quarter starts on the 1st, which is almost never a Monday, so its first
 *    and last week columns are PARTIAL. Snapping the range to whole weeks
 *    instead would mean "Q3" showed dates from June, which is a worse lie than
 *    a narrow first column.
 *  - Months are 28 to 31 days and there is no honest way around that.
 *
 * In both cases the columns still tile the range exactly — no gap, no overlap,
 * first starts at `range.start`, last ends at `range.end`. That invariant is
 * the whole basis of bars landing on gridlines, and it is pinned in
 * scripts/check-gantt.ts.
 */
export interface GanttColumnOptions extends PlanningColumnOptions {
    /**
     * When supplied, `nonWorking` is decided by the CALENDAR rather than by
     * planning.ts's weekend list and 9-to-18 default.
     *
     * That default is otherwise a second source of truth for the same fact, and
     * the two disagree the moment a plant runs 06:00-14:00: the columns would
     * shade nine-to-five while the bars broke at two. The calendar wins where one
     * is given, and nothing changes where one is not.
     */
    calendar?: GanttCalendar;
}
export declare function ganttColumns(view: GanttAnchoredView, anchor: Date, options?: GanttColumnOptions): PlanningColumn[];
/** What one column of an arbitrary range covers. */
export type GanttColumnUnit = "hour" | "day" | "week" | "month";
/**
 * The column unit for a span of `spanMs`.
 *
 * The thresholds are chosen so each band tops out near 48 columns, which is
 * where a label stops fitting once the axis is squeezed into a normal content
 * width — about 28px per column at 1300px. They are ABSOLUTE rather than
 * derived from an available width because the alternative is a granularity that
 * changes as you resize the window, which redraws the whole axis under the
 * reader mid-sentence.
 *
 *     <= 2 days      hour    (<= 48 columns)
 *     <= 45 days     day     (<= 45)
 *     <= 315 days    week    (<= 45)
 *     otherwise      month
 *
 * The caps are approximate on purpose: `ganttFitRange` snaps outward to whole
 * units AFTER choosing one, so a 45-day span can end up drawn as 46 day
 * columns. Snapping first and choosing second would need two passes to agree,
 * and one extra column is not worth a second source of truth.
 */
export declare function ganttFitUnit(spanMs: number): GanttColumnUnit;
export declare function ganttFitHourStep(spanMs: number, maxColumns?: number): number;
export interface GanttFitOptions {
    /** Durations are resolved through this, as everywhere else. */
    calendar?: GanttCalendar;
    /**
     * Breathing room either side, as a fraction of the span. Default 0.04.
     *
     * Without it the first bar starts hard against the left edge and reads as
     * clipped — the same thing `placeAppointment` deliberately signals for a bar
     * that really is cut by the range.
     */
    padFraction?: number;
    /**
     * A floor on that padding, so a zero-width plan still gets a real axis.
     * Default one HOUR.
     *
     * It was a day, and a day made the `hour` band unreachable: a 4-hour works
     * order padded to 3 days and drew as three day columns, with none of the
     * sub-day resolution the whole working-time model exists to show. Measured —
     * a 4-hour job, an 8-hour shift and a two-shift order all came back `day`.
     * The floor is only there for the degenerate case, so it belongs at the
     * smallest unit the axis can draw rather than at the largest.
     */
    minPadMs?: number;
}
/**
 * The range that shows the whole plan: every task's span, padded and snapped.
 *
 * EVERY node is unioned, not just the roots. A parent that carries its own
 * dates is believed rather than rolled up (`ganttSpan` says so), so a parent
 * whose stated end falls before a child's would otherwise fit an axis that cuts
 * the child in half — and a clipped bar in the one view that exists to show
 * everything is exactly the silent wrong this module keeps warning about.
 *
 * Returns null when nothing has dates, which is a real state and not an error:
 * a plan of unscheduled tasks. The caller decides what to show instead — the
 * React binding falls back to the month around its anchor, so the toolbar and
 * the axis still make sense while the dates are being filled in.
 */
export declare function ganttFitRange(tasks: GanttTaskNode[], options?: GanttFitOptions): PlanningRange | null;
export declare function ganttRangeColumns(range: PlanningRange, unit: GanttColumnUnit, options?: GanttColumnOptions): PlanningColumn[];
/**
 * A heading for a range nobody anchored — what the toolbar shows in place of
 * "July 2026" when the axis came from the data.
 *
 * Days below about two months and months above it, which is the same reading
 * `ganttFitUnit` makes: at day granularity "3 – 28 Jul 2026" is the useful
 * sentence, and at month granularity the days are noise nobody can act on.
 * The range is half-open, so the last instant is one millisecond before `end` —
 * labelling `end` itself would report a plan finishing on the 28th as ending on
 * the 29th.
 */
export declare function ganttSpanLabel(range: PlanningRange): string;
/**
 * A column of the Gantt's frozen pane, other than the timeline itself.
 *
 * `ganttPaneColumns` is generic over the key rather than taking this type, so a
 * second schedule component can shed ITS columns — work centre, order, quantity
 * — by the same rule. The rule is about widths and an axis, not about what the
 * columns mean.
 */
export type GanttPaneColumn = "name" | "assignees" | "status" | "variance";
/** Every pane column, in the order a caller who says nothing gets them. */
export declare const GANTT_PANE_COLUMNS: GanttPaneColumn[];
/**
 * Which pane columns actually fit, dropping from the END of the list until the
 * axis has `minAxisWidth` to work with.
 *
 * The order of `requested` is a PREFERENCE order, not just a set: what the
 * caller lists last is what goes first. The first entry is never dropped —
 * a schedule with no task names is not a narrower schedule, it is an unreadable
 * one — so this can return a set that still does not fit, and the renderer
 * scrolls as a last resort rather than rendering nothing.
 *
 * Shedding only happens when it ACHIEVES a fit. Measured on the demo page:
 * a month axis wants 1364px in a 1008px container, so the greedy version
 * dropped three columns, got the scroll down from 792px to 536px, and still
 * scrolled — the reader lost Assignees, Status and Variance and gained a
 * chart they still had to drag sideways. When the narrowest possible pane plus
 * the axis cannot fit, nothing is dropped and the chart scrolls with all its
 * columns intact.
 *
 * `available <= 0` means "not measured yet" and returns `requested` untouched.
 * Treating an unmeasured container as a zero-width one would drop every column
 * on the first paint and put them back on the second, which reads as a glitch
 * rather than as a layout.
 */
export declare function ganttPaneColumns<K extends string>(requested: readonly K[], widths: Record<K, number>, available: number, minAxisWidth: number): K[];
/**
 * Pixel width per column, from each column's own share of the range.
 *
 * The reason this is not `axisWidth / columns.length`: see the module note.
 * Uniform widths silently misplace every bar the moment columns stop being
 * equal in duration.
 *
 * Widths come from the DIFFERENCE between cumulative offsets rather than from
 * each duration independently, so they sum to exactly `axisWidth` and no
 * rounding residue opens a sub-pixel gap between two columns — a hairline the
 * background shows through, once per column, all the way across.
 *
 * For equal-duration columns this returns exactly what the old uniform maths
 * did, so day, week and month are unchanged to the pixel.
 */
export declare function ganttColumnWidths(columns: PlanningColumn[], range: PlanningRange, axisWidth: number): number[];
/**
 * A task's own span, or the union of its descendants'.
 *
 * BOTH dates are required for the explicit case. A task carrying only a start is
 * not a one-instant task, it is half-entered data, and drawing it as a milestone
 * would invent an end date the caller never gave.
 */
export declare function ganttSpan(task: GanttTaskNode, calendar?: GanttCalendar): GanttSpan | null;
/**
 * Percent complete, rolled up when the task does not state its own.
 *
 * Weighted by duration, because an unweighted mean lets a one-day task cancel
 * out a six-month one. A descendant that states no progress counts as 0 — it has
 * reported nothing done — but a subtree where NOBODY states progress returns
 * null rather than 0, which is the difference between "not started" and "we do
 * not track this".
 *
 * When every descendant is a milestone the weights are all zero, so it falls
 * back to a plain mean rather than dividing by nothing.
 */
export declare function ganttProgress(task: GanttTaskNode, calendar?: GanttCalendar): number | null;
/**
 * Slip in whole calendar days: positive is late, negative is early.
 *
 * Days rather than milliseconds, and calendar days rather than 24-hour blocks —
 * "finishing on the 3rd instead of the 1st" is two days late whether the work
 * stops at 09:00 or at 18:00, and a DST boundary must not turn it into 1.96.
 */
export declare function ganttVarianceDays(end: Date, baselineEnd: Date): number;
/** "On time", "+452d", "-3d" — the chip next to a row. Null passes through. */
export declare function formatGanttVariance(days: number | null): string | null;
/**
 * The status a bar is coloured by, when the task does not state one.
 *
 * Order matters and is the whole content of this function. Finished beats late:
 * a task delivered two weeks after its baseline is COMPLETE, not delayed — the
 * slip is already said by the variance chip, and colouring it red would leave a
 * project that shipped looking like a project on fire. Late beats not-started,
 * because a task that is 0% done and a week past due is the most urgent row on
 * the chart and "not started" is the one reading that hides it.
 *
 * A task with no baseline is still late if its end has passed and it is not
 * finished. Requiring a baseline would mean most projects never show a slip.
 */
export declare function ganttTaskStatus(task: GanttTaskNode, span: GanttSpan | null, progress: number | null, now?: Date): GanttTaskStatus;
/**
 * The tree, projected onto the rows that are actually on screen.
 *
 * `isExpanded` is asked rather than a Set being passed in, so the caller can
 * default to open, closed, or open-to-depth-2 without this module having an
 * opinion. A leaf is never asked.
 */
export interface GanttFlattenOptions extends GanttSegmentOptions {
    /**
     * When work can happen. Omit it and every span is wall-clock, which is
     * exactly today's behaviour — the working-time path is not entered at all.
     */
    calendar?: GanttCalendar;
}
export declare function flattenGanttTasks<T extends GanttTaskNode>(tasks: T[], isExpanded: (task: T) => boolean, now?: Date, options?: GanttFlattenOptions): GanttFlatten<T>;
/** Where a bar sits: its row, and its placement on the shared axis. */
export interface GanttBarAnchor {
    rowIndex: number;
    /** 0–100 from the range start, as PlanningPlacement reports it. */
    startPct: number;
    widthPct: number;
    /**
     * Pixels from the row's TOP to the point a link should join, overriding the
     * row's middle.
     *
     * A project Gantt has one bar per row and wants the middle, which is the
     * default. A production row stacks its operations in lanes, and a routing
     * arrow drawn to the middle of a three-lane row misses every bar in it.
     */
    yOffset?: number;
}
export interface GanttConnectorOptions {
    /** Pixel width of the whole time axis — columns × column width. */
    axisWidth: number;
    /** Pixel height of one row. Rows are uniform; the routes assume it. */
    rowHeight: number;
    /** How far a link runs straight out of a bar before it turns. Default 12. */
    stub?: number;
}
export interface GanttConnector {
    /** Stable across renders: the dependency it came from, not the rows it hit. */
    id: string;
    from: string;
    to: string;
    type: GanttDependencyType;
    /** SVG path data, in the axis's own pixel space. */
    d: string;
    /** The arrowhead's tip, and which way it points: 1 = rightwards, -1 = leftwards. */
    arrow: {
        x: number;
        y: number;
        dir: 1 | -1;
    };
}
/**
 * Orthogonal routes between dependent bars.
 *
 * `anchors` must carry an entry for every task id a dependency names, including
 * ids hidden inside a collapsed parent — `flattenGanttTasks`'s `rowIndexById` is
 * what resolves those to the summary row they folded into. A dependency naming a
 * task with no bar at all (no dates, or entirely outside the visible range) is
 * dropped: there is nothing to point at, and a line to the edge of the chart
 * reads as a task that starts off-screen.
 *
 * Two links that resolve to the same pair of rows collapse to one. Collapsing a
 * parent otherwise stacks a dozen identical arrows between the same two summary
 * bars.
 *
 * The route is three segments when the target is far enough downstream to reach
 * directly, and five when it is not — a finish-to-start link to a task that
 * begins BEFORE its predecessor ends has to double back, and a straight line
 * through the intervening bars would be unreadable. The turn happens in the
 * gutter between the two rows.
 */
export declare function ganttConnectors(anchors: Map<string, GanttBarAnchor>, dependencies: GanttDependency[], options: GanttConnectorOptions): GanttConnector[];
/** Turn a placement into an anchor. Sugar over ./planning's `placeAppointment`. */
export declare function ganttAnchor(rowIndex: number, placement: PlanningPlacement): GanttBarAnchor;
/** Which rows to actually mount, and the spacers that stand in for the rest. */
export interface GanttRowWindow {
    /** First row index to mount. */
    startIndex: number;
    /** One PAST the last row to mount, so `rows.slice(startIndex, endIndex)`. */
    endIndex: number;
    /** Height of the spacer standing in for the rows above. */
    paddingTop: number;
    /** …and below. */
    paddingBottom: number;
}
/**
 * The slice of rows worth putting in the DOM for a given scroll position.
 *
 * Rows are a FIXED height — the connector routes already depend on that, since
 * they place an endpoint at `rowIndex * rowHeight + rowHeight / 2` — so the
 * window is arithmetic rather than measurement, and no virtualizer is needed to
 * discover row offsets. That is why this is eleven lines in core instead of a
 * React-only integration: the Solid and vanilla ports get it by calling the
 * same function, which is the rule the whole module exists to serve.
 *
 * The spacers are what keep the scrollbar honest. Total height is always
 * `paddingTop + (endIndex - startIndex) * rowHeight + paddingBottom`, which is
 * `rowCount * rowHeight` however the window moves — so the thumb neither grows
 * nor jumps as rows mount and unmount.
 *
 * `overscan` rows are mounted beyond each edge so a fast scroll does not show a
 * band of blank before React catches up. It is deliberately NOT huge: every
 * overscanned row is a real row of DOM, and the cost of one is what the whole
 * change is trying to avoid.
 *
 * Always on, at every size. A threshold would mean the windowed path is the one
 * no demo, no screenshot and no check ever runs, and production is the first
 * thing to try it. Below a screenful the window simply covers every row and the
 * output is identical to not windowing at all.
 */
export declare function ganttRowWindow(rowCount: number, rowHeight: number, scrollTop: number, viewportHeight: number, overscan?: number): GanttRowWindow;
