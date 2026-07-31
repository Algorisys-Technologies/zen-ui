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

import {
  planningColumns,
  planningRange,
  planningRangeLabel,
  shiftPlanningAnchor,
  startOfWeek,
  type PlanningColumn,
  type PlanningColumnOptions,
  type PlanningPlacement,
  type PlanningRange,
  type PlanningView,
} from "./planning";

/**
 * The views a Gantt offers: PlanningCalendar's three, plus the two that let a
 * multi-month plan be seen whole.
 *
 * A superset rather than a widening of `PlanningView` — see the module note.
 * Quarter draws week columns, year draws month columns; both have columns of
 * UNEQUAL duration, which is what `ganttColumnWidths` exists for.
 */
export type GanttView = PlanningView | "quarter" | "year";

export type GanttTaskStatus = "not-started" | "on-track" | "delayed" | "complete";

/**
 * Which end of each bar a link joins.
 *
 * All four exist because they are the same two-line anchor choice, and adding
 * one later would be a change to a shipped `dependencies` array. Finish-to-start
 * is the default and by far the common one: B cannot begin until A is done.
 */
export type GanttDependencyType =
  | "finish-to-start"
  | "start-to-start"
  | "finish-to-finish"
  | "start-to-finish";

export interface GanttDependency {
  /** Id of the task that comes first. */
  from: string;
  /** Id of the task that waits. */
  to: string;
  /** Default "finish-to-start". */
  type?: GanttDependencyType;
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

/* ------------------------------------------------------------------------ *
 * Working time
 *
 * A factory does not work every hour. It works two shifts and not three, it
 * stops at the weekend, it stops for a public holiday, it stops for planned
 * maintenance. Until that is modelled, every duration the module reports is
 * wall-clock and therefore wrong: a 6-hour job starting Friday 16:00 on a
 * single-shift plant draws to Friday 22:00 and really finishes Monday 13:00.
 *
 * LOCAL WALL CLOCK, deliberately, for the reason ./planning gives for the whole
 * module. "The early shift is 06:00 to 14:00" is a statement about the clock on
 * the wall, and it stays true across a daylight-saving change — which means the
 * day a change falls on is genuinely 23 or 25 hours long, and a shift that
 * spans the transition is genuinely an hour shorter or longer. Periods are
 * therefore turned into instants with the local Date constructor rather than by
 * adding milliseconds to midnight, because adding milliseconds does not respect
 * a clock that jumped.
 * ------------------------------------------------------------------------ */

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

const DAY_MINUTES = 24 * 60;

/**
 * Always working. Passing this is exactly equivalent to passing no calendar at
 * all, which is the property that makes the whole feature backward compatible —
 * and it is asserted rather than assumed in scripts/check-gantt.ts.
 */
export const GANTT_CALENDAR_24_7: GanttCalendar = {
  id: "24/7",
  week: Array.from({ length: 7 }, () => [{ from: 0, to: DAY_MINUTES }]),
};

/** An instant on `day` at `minutes` past local midnight. */
const atMinutes = (day: Date, minutes: number): Date =>
  new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    // Not `midnight + minutes * 60000`: on a DST day that lands an hour out.
    // The constructor normalises 24:00 to the next midnight, which is what a
    // period ending at 1440 means.
    Math.floor(minutes / 60),
    minutes % 60,
    0,
    0,
  );

const sameDate = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Sorted, clamped, non-overlapping periods. Overlapping input would otherwise
 * be counted twice by every duration below — a calendar with an 06:00–14:00 and
 * an 08:00–16:00 entry would report a 12-hour day.
 */
const normalisePeriods = (periods: GanttWorkingPeriod[]): GanttWorkingPeriod[] => {
  const clean = periods
    .map((p) => ({ from: Math.max(0, Math.min(DAY_MINUTES, p.from)), to: Math.max(0, Math.min(DAY_MINUTES, p.to)) }))
    .filter((p) => p.to > p.from)
    .sort((a, b) => a.from - b.from);

  const merged: GanttWorkingPeriod[] = [];
  for (const p of clean) {
    const last = merged[merged.length - 1];
    if (last && p.from <= last.to) last.to = Math.max(last.to, p.to);
    else merged.push({ ...p });
  }
  return merged;
};

/**
 * The working periods that apply on a given date.
 *
 * An exception REPLACES the weekday pattern rather than adding to it, so a
 * holiday is `periods: []` and a one-off Saturday shift is the shift. Merging
 * the two instead would make "closed on Boxing Day" impossible to express.
 */
export function ganttWorkingPeriodsOn(calendar: GanttCalendar, day: Date): GanttWorkingPeriod[] {
  const exception = calendar.exceptions?.find((e) => sameDate(e.date, day));
  if (exception) return normalisePeriods(exception.periods);
  return normalisePeriods(calendar.week[day.getDay()] ?? []);
}

/** Whether an instant falls inside working time. */
export function ganttIsWorking(calendar: GanttCalendar, at: Date): boolean {
  const t = at.getTime();
  for (const p of ganttWorkingPeriodsOn(calendar, at)) {
    if (t >= atMinutes(at, p.from).getTime() && t < atMinutes(at, p.to).getTime()) return true;
  }
  return false;
}

/**
 * A day loop has to stop somewhere. A calendar with no working time at all
 * would otherwise spin forever in `ganttAddWorkingMs`, and a caller who passes
 * an empty week is far more likely to have a data bug than a ten-year job.
 */
const MAX_DAYS_SCANNED = 366 * 10;

/**
 * Working milliseconds in `[from, to)`.
 *
 * Half-open at both ends, as everywhere else in this module: work that ends
 * exactly when a shift ends is counted once, not once per adjacent period.
 */
export function ganttWorkingMs(calendar: GanttCalendar, from: Date, to: Date): number {
  const end = to.getTime();
  if (end <= from.getTime()) return 0;

  let total = 0;
  let cursor = startOfDay(from);
  for (let guard = 0; guard < MAX_DAYS_SCANNED && cursor.getTime() < end; guard++) {
    for (const p of ganttWorkingPeriodsOn(calendar, cursor)) {
      const segmentStart = Math.max(atMinutes(cursor, p.from).getTime(), from.getTime());
      const segmentEnd = Math.min(atMinutes(cursor, p.to).getTime(), end);
      if (segmentEnd > segmentStart) total += segmentEnd - segmentStart;
    }
    cursor = addDays(cursor, 1);
  }
  return total;
}

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
export function ganttAddWorkingMs(calendar: GanttCalendar, from: Date, ms: number): Date {
  if (ms <= 0) return new Date(from.getTime());

  let remaining = ms;
  let cursor = startOfDay(from);
  for (let guard = 0; guard < MAX_DAYS_SCANNED; guard++) {
    for (const p of ganttWorkingPeriodsOn(calendar, cursor)) {
      const periodStart = Math.max(atMinutes(cursor, p.from).getTime(), from.getTime());
      const periodEnd = atMinutes(cursor, p.to).getTime();
      if (periodEnd <= periodStart) continue;
      const available = periodEnd - periodStart;
      if (available >= remaining) return new Date(periodStart + remaining);
      remaining -= available;
    }
    cursor = addDays(cursor, 1);
  }
  // Out of calendar. Returning `from` would silently claim zero duration; this
  // at least lands the bar where the scan gave up.
  return new Date(cursor.getTime());
}

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
export function ganttWorkingSegments(
  calendar: GanttCalendar,
  from: Date,
  to: Date,
  options: GanttSegmentOptions = {},
): GanttSpan[] {
  const end = to.getTime();
  if (end <= from.getTime()) return [];

  const minGap = options.minGapMs ?? 0;
  const maxSegments = options.maxSegments ?? 500;

  const raw: GanttSpan[] = [];
  let cursor = startOfDay(from);
  for (let guard = 0; guard < MAX_DAYS_SCANNED && cursor.getTime() < end; guard++) {
    for (const p of ganttWorkingPeriodsOn(calendar, cursor)) {
      const segmentStart = Math.max(atMinutes(cursor, p.from).getTime(), from.getTime());
      const segmentEnd = Math.min(atMinutes(cursor, p.to).getTime(), end);
      if (segmentEnd <= segmentStart) continue;
      const last = raw[raw.length - 1];
      // Adjacent or gap-too-small: extend rather than emit. Consecutive days of
      // a 24/7 calendar are one segment, not 365.
      if (last && segmentStart - last.end.getTime() <= minGap) {
        last.end = new Date(segmentEnd);
      } else {
        raw.push({ start: new Date(segmentStart), end: new Date(segmentEnd) });
      }
    }
    cursor = addDays(cursor, 1);
  }

  if (raw.length > maxSegments) {
    return [{ start: raw[0].start, end: raw[raw.length - 1].end }];
  }
  return raw;
}

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

const MS_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 0, 0, 0, 0);

/** The 1st of the quarter containing `d` — January, April, July or October. */
const startOfQuarter = (d: Date): Date =>
  new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1, 0, 0, 0, 0);

const startOfYear = (d: Date): Date => new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);

const shortMonth = (d: Date): string => d.toLocaleString(undefined, { month: "short" });

/**
 * The half-open interval a view covers.
 *
 * Delegates for day / week / month. A quarter is a CALENDAR quarter — the 1st
 * of Jan/Apr/Jul/Oct to the 1st of the next one — not three months from the
 * anchor, so the same quarter is shown from any date inside it and the columns
 * line up with how anyone reports one.
 */
export function ganttRange(view: GanttView, anchor: Date): PlanningRange {
  if (view === "quarter") {
    const start = startOfQuarter(anchor);
    // Through the Date constructor so month 12 rolls the year, and day 1 cannot
    // overflow the way "31 January + 1 month" does.
    return { start, end: new Date(start.getFullYear(), start.getMonth() + 3, 1, 0, 0, 0, 0) };
  }
  if (view === "year") {
    const start = startOfYear(anchor);
    return { start, end: new Date(start.getFullYear() + 1, 0, 1, 0, 0, 0, 0) };
  }
  return planningRange(view, anchor);
}

/** Move the anchor one view forward or back. `delta` is in views, not days. */
export function shiftGanttAnchor(view: GanttView, anchor: Date, delta: number): Date {
  if (view === "quarter") {
    const q = startOfQuarter(anchor);
    return new Date(q.getFullYear(), q.getMonth() + delta * 3, 1, 0, 0, 0, 0);
  }
  if (view === "year") return new Date(anchor.getFullYear() + delta, 0, 1, 0, 0, 0, 0);
  return shiftPlanningAnchor(view, anchor, delta);
}

/** A heading for the whole range — what the toolbar shows between the arrows. */
export function ganttRangeLabel(view: GanttView, anchor: Date): string {
  if (view === "quarter") {
    const q = startOfQuarter(anchor);
    return `Q${Math.floor(q.getMonth() / 3) + 1} ${q.getFullYear()}`;
  }
  if (view === "year") return String(anchor.getFullYear());
  return planningRangeLabel(view, anchor);
}

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

/** Rewrites `nonWorking` from the calendar. A column counts as non-working when
 *  NO part of it is working time — so an hour column inside a shift stays lit,
 *  and a whole Sunday goes dark. */
const applyCalendar = (columns: PlanningColumn[], calendar: GanttCalendar): PlanningColumn[] =>
  columns.map((column) => ({
    ...column,
    nonWorking: ganttWorkingMs(calendar, column.start, column.end) === 0,
  }));

export function ganttColumns(
  view: GanttView,
  anchor: Date,
  options: GanttColumnOptions = {},
): PlanningColumn[] {
  const { calendar } = options;
  if (view !== "quarter" && view !== "year") {
    const columns = planningColumns(view, anchor, options);
    return calendar ? applyCalendar(columns, calendar) : columns;
  }

  const now = options.now ?? new Date();
  const { start, end } = ganttRange(view, anchor);
  const columns: PlanningColumn[] = [];

  if (view === "year") {
    for (let d = start; d.getTime() < end.getTime(); ) {
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
      columns.push({
        start: d,
        end: next,
        label: shortMonth(d),
        // The year is already in the range label; repeating it in all twelve
        // columns is noise.
        sublabel: "",
        // A week or a month is neither working nor non-working — the weekend is
        // inside every one of them, so shading any of them says nothing.
        nonWorking: false,
        today: now.getTime() >= d.getTime() && now.getTime() < next.getTime(),
      });
      d = next;
    }
    return calendar ? applyCalendar(columns, calendar) : columns;
  }

  for (let d = start; d.getTime() < end.getTime(); ) {
    // The Monday after the week `d` falls in, clipped to the quarter. That is
    // what makes the first and last columns partial and the tiling exact.
    const nextMonday = addDays(startOfWeek(d), 7);
    const next = nextMonday.getTime() < end.getTime() ? nextMonday : end;
    columns.push({
      start: d,
      end: next,
      label: `${d.getDate()} ${shortMonth(d)}`,
      sublabel: "",
      nonWorking: false,
      today: now.getTime() >= d.getTime() && now.getTime() < next.getTime(),
    });
    d = next;
  }
  return calendar ? applyCalendar(columns, calendar) : columns;
}

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
export function ganttColumnWidths(
  columns: PlanningColumn[],
  range: PlanningRange,
  axisWidth: number,
): number[] {
  const from = range.start.getTime();
  const span = range.end.getTime() - from;
  if (span <= 0) return columns.map(() => 0);

  let previous = 0;
  return columns.map((column) => {
    const offset = ((column.end.getTime() - from) / span) * axisWidth;
    const width = offset - previous;
    previous = offset;
    return width;
  });
}

const clampPct = (n: number): number => Math.min(100, Math.max(0, n));

/**
 * A task's own span, or the union of its descendants'.
 *
 * BOTH dates are required for the explicit case. A task carrying only a start is
 * not a one-instant task, it is half-entered data, and drawing it as a milestone
 * would invent an end date the caller never gave.
 */
export function ganttSpan(task: GanttTaskNode, calendar?: GanttCalendar): GanttSpan | null {
  if (task.start && task.end) {
    const a = task.start.getTime();
    const b = task.end.getTime();
    // Inverted, as in placeAppointment: normalised to its bounds rather than
    // swapped-and-believed.
    return { start: new Date(Math.min(a, b)), end: new Date(Math.max(a, b)) };
  }

  /* A start plus a working duration. The end is DERIVED, which is the whole
     point: the caller states how long the job takes, and the calendar decides
     when that lands. Without a calendar this is elapsed time, because no
     calendar means a 24/7 one. */
  if (task.start && typeof task.workingMinutes === "number" && task.workingMinutes >= 0) {
    const ms = task.workingMinutes * 60_000;
    const end = calendar
      ? ganttAddWorkingMs(calendar, task.start, ms)
      : new Date(task.start.getTime() + ms);
    return { start: new Date(task.start.getTime()), end };
  }

  let from = Number.POSITIVE_INFINITY;
  let to = Number.NEGATIVE_INFINITY;
  for (const child of task.children ?? []) {
    const span = ganttSpan(child, calendar);
    if (!span) continue;
    from = Math.min(from, span.start.getTime());
    to = Math.max(to, span.end.getTime());
  }
  if (from === Number.POSITIVE_INFINITY) return null;
  return { start: new Date(from), end: new Date(to) };
}

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
export function ganttProgress(task: GanttTaskNode, calendar?: GanttCalendar): number | null {
  if (typeof task.percentComplete === "number") return clampPct(task.percentComplete);

  let weighted = 0;
  let weight = 0;
  let plain = 0;
  let count = 0;
  let anyStated = false;

  /* WORKING duration where a calendar is in play, elapsed where it is not.
     Weighting by wall clock would count a child that happens to straddle a
     shutdown as larger than the work inside it — the same bug the whole
     working-time model exists to remove, one level down. */
  const weightOf = (node: GanttTaskNode): number => {
    const span = ganttSpan(node, calendar);
    if (!span) return 0;
    return calendar
      ? ganttWorkingMs(calendar, span.start, span.end)
      : span.end.getTime() - span.start.getTime();
  };

  const walk = (node: GanttTaskNode): void => {
    const children = node.children ?? [];
    if (children.length === 0) {
      const pct = typeof node.percentComplete === "number" ? clampPct(node.percentComplete) : 0;
      if (typeof node.percentComplete === "number") anyStated = true;
      const ms = weightOf(node);
      weighted += pct * ms;
      weight += ms;
      plain += pct;
      count += 1;
      return;
    }
    // A parent that states its own progress is believed, and its subtree is not
    // re-derived: the caller has already answered the question for that branch.
    if (typeof node.percentComplete === "number") {
      anyStated = true;
      const pct = clampPct(node.percentComplete);
      const ms = weightOf(node);
      weighted += pct * ms;
      weight += ms;
      plain += pct;
      count += 1;
      return;
    }
    for (const child of children) walk(child);
  };

  for (const child of task.children ?? []) walk(child);

  if (!anyStated || count === 0) return null;
  return weight > 0 ? weighted / weight : plain / count;
}

/**
 * Slip in whole calendar days: positive is late, negative is early.
 *
 * Days rather than milliseconds, and calendar days rather than 24-hour blocks —
 * "finishing on the 3rd instead of the 1st" is two days late whether the work
 * stops at 09:00 or at 18:00, and a DST boundary must not turn it into 1.96.
 */
export function ganttVarianceDays(end: Date, baselineEnd: Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(baselineEnd).getTime()) / MS_DAY);
}

/** "On time", "+452d", "-3d" — the chip next to a row. Null passes through. */
export function formatGanttVariance(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return "On time";
  return days > 0 ? `+${days}d` : `${days}d`;
}

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
export function ganttTaskStatus(
  task: GanttTaskNode,
  span: GanttSpan | null,
  progress: number | null,
  now: Date = new Date(),
): GanttTaskStatus {
  if (task.status) return task.status;
  if (progress !== null && progress >= 100) return "complete";

  const overBaseline =
    task.baselineEnd && span ? ganttVarianceDays(span.end, task.baselineEnd) > 0 : false;
  const overdue = span ? span.end.getTime() < now.getTime() : false;
  if (overBaseline || overdue) return "delayed";

  if (progress === null || progress <= 0) return "not-started";
  return "on-track";
}

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

export function flattenGanttTasks<T extends GanttTaskNode>(
  tasks: T[],
  isExpanded: (task: T) => boolean,
  now: Date = new Date(),
  options: GanttFlattenOptions = {},
): GanttFlatten<T> {
  const { calendar, ...segmentOptions } = options;

  /**
   * The span as drawn, plus its pieces.
   *
   * Three cases, and the third is the one worth stating. When a span has NO
   * working time in it — a job entered against a plant that is shut all week —
   * the raw span is kept and drawn whole. Returning nothing would make the bar
   * vanish, which reads as data that failed to load; drawing it against shaded
   * background says "you have scheduled work into a closed plant", which is the
   * thing the planner needs to see.
   */
  const resolve = (raw: GanttSpan | null): { span: GanttSpan | null; segments: GanttSpan[] | null } => {
    if (!raw || !calendar) return { span: raw, segments: null };
    const segments = ganttWorkingSegments(calendar, raw.start, raw.end, segmentOptions);
    if (segments.length === 0) return { span: raw, segments: null };
    const clamped = { start: segments[0].start, end: segments[segments.length - 1].end };
    return { span: clamped, segments: segments.length > 1 ? segments : null };
  };

  const rows: GanttRow<T>[] = [];
  const rowIndexById = new Map<string, number>();

  /** Every id under `task`, so a collapsed subtree can point at its summary row. */
  const claim = (task: GanttTaskNode, index: number): void => {
    rowIndexById.set(task.id, index);
    for (const child of task.children ?? []) claim(child, index);
  };

  const walk = (task: T, depth: number, parentId: string | null): void => {
    /* The node type is structural: a caller's richer task declares
       `children?: MyTask[]`, which is assignable to GanttTaskNode[] but does not
       infer back through the generic. The cast restores what the caller knows. */
    const children = (task.children ?? []) as T[];
    const hasChildren = children.length > 0;
    const expanded = hasChildren ? isExpanded(task) : false;
    const { span, segments } = resolve(ganttSpan(task, calendar));
    const progress = ganttProgress(task, calendar);
    const index = rows.length;

    rows.push({
      task,
      depth,
      index,
      parentId,
      hasChildren,
      expanded,
      span,
      segments,
      progress,
      status: ganttTaskStatus(task, span, progress, now),
      variance: task.baselineEnd && span ? ganttVarianceDays(span.end, task.baselineEnd) : null,
    });
    rowIndexById.set(task.id, index);

    if (!hasChildren) return;
    if (expanded) {
      for (const child of children) walk(child, depth + 1, task.id);
    } else {
      for (const child of children) claim(child, index);
    }
  };

  for (const task of tasks) walk(task, 0, null);
  return { rows, rowIndexById };
}

/** Where a bar sits: its row, and its placement on the shared axis. */
export interface GanttBarAnchor {
  rowIndex: number;
  /** 0–100 from the range start, as PlanningPlacement reports it. */
  startPct: number;
  widthPct: number;
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
  arrow: { x: number; y: number; dir: 1 | -1 };
}

/** Which end of each bar a type joins, and which way the line leaves and arrives. */
const ENDS: Record<GanttDependencyType, { fromEnd: boolean; toEnd: boolean }> = {
  "finish-to-start": { fromEnd: true, toEnd: false },
  "start-to-start": { fromEnd: false, toEnd: false },
  "finish-to-finish": { fromEnd: true, toEnd: true },
  "start-to-finish": { fromEnd: false, toEnd: true },
};

const r2 = (n: number): number => Math.round(n * 100) / 100;

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
export function ganttConnectors(
  anchors: Map<string, GanttBarAnchor>,
  dependencies: GanttDependency[],
  options: GanttConnectorOptions,
): GanttConnector[] {
  const { axisWidth, rowHeight } = options;
  const stub = options.stub ?? 12;
  const out: GanttConnector[] = [];
  const seen = new Set<string>();

  for (const dependency of dependencies) {
    const type = dependency.type ?? "finish-to-start";
    if (dependency.from === dependency.to) continue;

    const a = anchors.get(dependency.from);
    const b = anchors.get(dependency.to);
    if (!a || !b) continue;
    // Both ends folded into the same summary bar: a link from a task to itself.
    if (a.rowIndex === b.rowIndex) continue;

    const key = `${a.rowIndex}:${b.rowIndex}:${type}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { fromEnd, toEnd } = ENDS[type];
    const px = (pct: number) => (pct / 100) * axisWidth;
    const x1 = px(fromEnd ? a.startPct + a.widthPct : a.startPct);
    const x2 = px(toEnd ? b.startPct + b.widthPct : b.startPct);
    const y1 = a.rowIndex * rowHeight + rowHeight / 2;
    const y2 = b.rowIndex * rowHeight + rowHeight / 2;

    // Leaving a bar's finish runs right; leaving its start runs left. Arriving at
    // a start comes in from the left, so the head points right, and vice versa.
    const s = fromEnd ? 1 : -1;
    const dir: 1 | -1 = toEnd ? -1 : 1;

    const bx = x1 + s * stub;
    const ax = x2 - dir * stub;

    const points: Array<[number, number]> =
      s === dir && dir * (ax - bx) >= 0
        ? [
            [x1, y1],
            [ax, y1],
            [ax, y2],
            [x2, y2],
          ]
        : (() => {
            const my = (y1 + y2) / 2;
            return [
              [x1, y1],
              [bx, y1],
              [bx, my],
              [ax, my],
              [ax, y2],
              [x2, y2],
            ] as Array<[number, number]>;
          })();

    const d = points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${r2(x)} ${r2(y)}`)
      .join(" ");

    out.push({
      id: `${dependency.from}->${dependency.to}:${type}`,
      from: dependency.from,
      to: dependency.to,
      type,
      d,
      arrow: { x: r2(x2), y: r2(y2), dir },
    });
  }

  return out;
}

/** Turn a placement into an anchor. Sugar over ./planning's `placeAppointment`. */
export function ganttAnchor(rowIndex: number, placement: PlanningPlacement): GanttBarAnchor {
  return { rowIndex, startPct: placement.startPct, widthPct: placement.widthPct };
}

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
export function ganttRowWindow(
  rowCount: number,
  rowHeight: number,
  scrollTop: number,
  viewportHeight: number,
  overscan = 6,
): GanttRowWindow {
  if (rowCount <= 0 || rowHeight <= 0) {
    return { startIndex: 0, endIndex: 0, paddingTop: 0, paddingBottom: 0 };
  }
  // Clamped at 0: a rubber-band overscroll reports a NEGATIVE scrollTop on
  // macOS and iOS, which floors to a negative first index and yields a negative
  // paddingTop — the rows jump up under the header for the length of the bounce.
  const top = Math.max(0, scrollTop);
  const firstVisible = Math.floor(top / rowHeight);
  const lastVisible = Math.ceil((top + Math.max(0, viewportHeight)) / rowHeight);

  const startIndex = Math.min(Math.max(firstVisible - overscan, 0), rowCount);
  const endIndex = Math.min(Math.max(lastVisible + overscan, startIndex), rowCount);

  return {
    startIndex,
    endIndex,
    paddingTop: startIndex * rowHeight,
    paddingBottom: (rowCount - endIndex) * rowHeight,
  };
}
