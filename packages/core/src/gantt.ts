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
export function ganttRange(view: GanttAnchoredView, anchor: Date): PlanningRange {
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
export function shiftGanttAnchor(view: GanttAnchoredView, anchor: Date, delta: number): Date {
  if (view === "quarter") {
    const q = startOfQuarter(anchor);
    return new Date(q.getFullYear(), q.getMonth() + delta * 3, 1, 0, 0, 0, 0);
  }
  if (view === "year") return new Date(anchor.getFullYear() + delta, 0, 1, 0, 0, 0, 0);
  return shiftPlanningAnchor(view, anchor, delta);
}

/** A heading for the whole range — what the toolbar shows between the arrows. */
export function ganttRangeLabel(view: GanttAnchoredView, anchor: Date): string {
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
  view: GanttAnchoredView,
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

/* ------------------------------------------------------------------------ *
 * Fit — an axis whose range comes from the data
 *
 * `year` technically answered "let me see the whole plan" and answered it
 * badly: a calendar year is a fixed window, so a plan running July to October
 * fills 40% of the axis and January to June is a wall of empty columns. Worse,
 * a plan that crosses New Year cannot be seen whole in ANY anchored view.
 *
 * Fit takes the range from the tasks instead. That breaks the invariant every
 * other view holds — range is a function of the anchor — and the consequence is
 * not cosmetic: prev, next and today have nothing to move, so a renderer must
 * HIDE them rather than leave them live and inert. Three arrows that do nothing
 * are worse than three arrows that are not there.
 *
 * The granularity is chosen, not passed. `ganttFitUnit` is a pure function with
 * pinned thresholds precisely so it is not a ternary in a renderer that four
 * bindings would each get subtly different.
 * ------------------------------------------------------------------------ */

/** What one column of an arbitrary range covers. */
export type GanttColumnUnit = "hour" | "day" | "week" | "month";

const MS_HOUR = 60 * 60 * 1000;
const pad2 = (n: number): string => String(n).padStart(2, "0");
const startOfMonth = (d: Date): Date => new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
const startOfHour = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), 0, 0, 0);

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
export function ganttFitUnit(spanMs: number): GanttColumnUnit {
  const days = spanMs / MS_DAY;
  if (days <= 2) return "hour";
  if (days <= 45) return "day";
  if (days <= 315) return "week";
  return "month";
}

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

/** A task's OWN span — dates, or a start plus a working duration. No rollup. */
const explicitSpan = (task: GanttTaskNode, calendar?: GanttCalendar): GanttSpan | null => {
  if (task.start && task.end) {
    const a = task.start.getTime();
    const b = task.end.getTime();
    // Inverted, as in placeAppointment: normalised to its bounds rather than
    // swapped-and-believed.
    return { start: new Date(Math.min(a, b)), end: new Date(Math.max(a, b)) };
  }
  if (task.start && typeof task.workingMinutes === "number" && task.workingMinutes >= 0) {
    const ms = task.workingMinutes * 60_000;
    const end = calendar
      ? ganttAddWorkingMs(calendar, task.start, ms)
      : new Date(task.start.getTime() + ms);
    return { start: new Date(task.start.getTime()), end };
  }
  return null;
};

/** Snap outward to whole units, so the first and last columns are not slivers. */
const floorToUnit = (d: Date, unit: GanttColumnUnit): Date => {
  if (unit === "hour") return startOfHour(d);
  if (unit === "day") return startOfDay(d);
  if (unit === "week") return startOfWeek(d);
  return startOfMonth(d);
};

const ceilToUnit = (d: Date, unit: GanttColumnUnit): Date => {
  const floored = floorToUnit(d, unit);
  if (floored.getTime() === d.getTime()) return floored;
  if (unit === "hour") return new Date(floored.getFullYear(), floored.getMonth(), floored.getDate(), floored.getHours() + 1, 0, 0, 0);
  if (unit === "day") return addDays(floored, 1);
  if (unit === "week") return addDays(floored, 7);
  return new Date(floored.getFullYear(), floored.getMonth() + 1, 1, 0, 0, 0, 0);
};

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
export function ganttFitRange(
  tasks: GanttTaskNode[],
  options: GanttFitOptions = {},
): PlanningRange | null {
  const { calendar, padFraction = 0.04, minPadMs = MS_HOUR } = options;

  let from = Number.POSITIVE_INFINITY;
  let to = Number.NEGATIVE_INFINITY;
  const visit = (node: GanttTaskNode): void => {
    const own = explicitSpan(node, calendar);
    if (own) {
      from = Math.min(from, own.start.getTime());
      to = Math.max(to, own.end.getTime());
    }
    for (const child of node.children ?? []) visit(child);
  };
  for (const task of tasks) visit(task);
  if (from === Number.POSITIVE_INFINITY) return null;

  /* A single milestone is a zero-width span, and a zero-width range makes every
     percentage in placeAppointment a division by zero. The floor is what keeps
     it a real axis. */
  const pad = Math.max(minPadMs, (to - from) * padFraction);
  const unit = ganttFitUnit(to - from + 2 * pad);
  return {
    start: floorToUnit(new Date(from - pad), unit),
    end: ceilToUnit(new Date(to + pad), unit),
  };
}

/**
 * Columns tiling an ARBITRARY range at a chosen unit.
 *
 * `ganttColumns` cannot do this: it derives the range from the view and the
 * anchor, which is the one thing a fit axis does not have. Same invariant
 * though, and it is the one everything else rests on — the columns tile the
 * range exactly, first starting at `range.start` and last ending at
 * `range.end`, with no gap and no overlap, so `ganttColumnWidths` can hand each
 * one its own share of the axis and every bar lands on a gridline.
 *
 * Stepped through the local Date constructor rather than by adding
 * milliseconds, for the reason the working-time section gives: on the day a
 * clock changes, "one hour later" and "3,600,000ms later" are different
 * instants, and the second walks every column after the transition off the wall
 * clock by an hour.
 */
const WEEKDAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export function ganttRangeColumns(
  range: PlanningRange,
  unit: GanttColumnUnit,
  options: GanttColumnOptions = {},
): PlanningColumn[] {
  const now = options.now ?? new Date();
  const nonWorkingDays = options.nonWorkingDays ?? [0, 6];
  const [workFrom, workTo] = options.workingHours ?? [9, 18];
  const { calendar } = options;

  const end = range.end.getTime();
  const columns: PlanningColumn[] = [];
  if (end <= range.start.getTime()) return columns;

  /* Only worth repeating the year when the range actually crosses one. A fit
     axis routinely does, which is the whole reason this is not the year view. */
  const crossesYear = range.start.getFullYear() !== new Date(end - 1).getFullYear();
  const stepMinutes = Math.max(
    1,
    Math.round((options.hourStep && options.hourStep > 0 ? options.hourStep : 1) * 60),
  );

  const advance = (d: Date): Date => {
    if (unit === "hour") {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes() + stepMinutes, 0, 0);
    }
    if (unit === "day") return addDays(d, 1);
    if (unit === "week") return addDays(startOfWeek(d), 7);
    return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
  };

  let cursor = range.start;
  let previousDay = -1;
  let previousMonth = -1;
  for (let guard = 0; guard < 4096 && cursor.getTime() < end; guard++) {
    const stepped = advance(cursor);
    // A step that does not advance would spin forever. It cannot happen for a
    // snapped range, and a caller can pass any range they like.
    if (stepped.getTime() <= cursor.getTime()) break;
    const next = stepped.getTime() < end ? stepped : range.end;

    let label: string;
    let sublabel = "";
    let nonWorking = false;
    if (unit === "hour") {
      label = `${pad2(cursor.getHours())}:${pad2(cursor.getMinutes())}`;
      // The date, once per day. An hour axis spanning two days is otherwise two
      // identical runs of 00:00–23:00 with nothing to tell them apart.
      if (cursor.getDate() !== previousDay) sublabel = `${cursor.getDate()} ${shortMonth(cursor)}`;
      previousDay = cursor.getDate();
      const hour = cursor.getHours() + cursor.getMinutes() / 60;
      nonWorking = hour < workFrom || hour >= workTo;
    } else if (unit === "day") {
      label = String(cursor.getDate());
      sublabel = WEEKDAY_INITIALS[cursor.getDay()];
      nonWorking = nonWorkingDays.includes(cursor.getDay());
    } else if (unit === "week") {
      /* The date, and the month only where it CHANGES. "13 Jul" in every one
         of twenty columns is nineteen redundant copies of "Jul", and the width
         they cost is the difference between an axis that fits its container
         and one the reader has to drag sideways. */
      label = String(cursor.getDate());
      if (cursor.getMonth() !== previousMonth) sublabel = shortMonth(cursor);
      previousMonth = cursor.getMonth();
      // A week or a month is neither working nor non-working — the weekend is
      // inside every one of them, so shading any of them says nothing.
    } else {
      label = shortMonth(cursor);
      if (crossesYear && (cursor.getMonth() === 0 || columns.length === 0)) {
        sublabel = String(cursor.getFullYear());
      }
    }

    columns.push({
      start: cursor,
      end: next,
      label,
      sublabel,
      nonWorking,
      today: now.getTime() >= cursor.getTime() && now.getTime() < next.getTime(),
    });
    cursor = next;
  }

  return calendar ? applyCalendar(columns, calendar) : columns;
}

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
export function ganttSpanLabel(range: PlanningRange): string {
  const start = range.start;
  const last = new Date(range.end.getTime() - 1);
  if (range.end.getTime() <= start.getTime()) return "";

  const month = (d: Date) => shortMonth(d);
  const sameYear = start.getFullYear() === last.getFullYear();

  if ((range.end.getTime() - start.getTime()) / MS_DAY <= 62) {
    if (sameYear && start.getMonth() === last.getMonth()) {
      return `${start.getDate()} – ${last.getDate()} ${month(last)} ${last.getFullYear()}`;
    }
    if (sameYear) {
      return `${start.getDate()} ${month(start)} – ${last.getDate()} ${month(last)} ${last.getFullYear()}`;
    }
    return `${start.getDate()} ${month(start)} ${start.getFullYear()} – ${last.getDate()} ${month(last)} ${last.getFullYear()}`;
  }

  if (sameYear && start.getMonth() === last.getMonth()) return `${month(start)} ${start.getFullYear()}`;
  if (sameYear) return `${month(start)} – ${month(last)} ${last.getFullYear()}`;
  return `${month(start)} ${start.getFullYear()} – ${month(last)} ${last.getFullYear()}`;
}

/* ------------------------------------------------------------------------ *
 * The frozen pane
 *
 * Four columns of task metadata at their natural widths cost 468px, and a year
 * axis wants another 960 — so a 1292px page scrolls sideways before the reader
 * has done anything. Scrolling is the wrong failure: the columns that get
 * pushed off are the ones nobody chose to lose.
 * ------------------------------------------------------------------------ */

/** A column of the frozen pane, other than the timeline itself. */
export type GanttPaneColumn = "name" | "assignees" | "status" | "variance";

/** Every pane column, in the order a caller who says nothing gets them. */
export const GANTT_PANE_COLUMNS: GanttPaneColumn[] = ["name", "assignees", "status", "variance"];

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
export function ganttPaneColumns(
  requested: GanttPaneColumn[],
  widths: Record<GanttPaneColumn, number>,
  available: number,
  minAxisWidth: number,
): GanttPaneColumn[] {
  if (requested.length <= 1 || available <= 0) return requested;

  const out = [...requested];
  const total = () => out.reduce((sum, key) => sum + widths[key], 0);
  if (total() + minAxisWidth <= available) return requested;
  if (widths[requested[0]] + minAxisWidth > available) return requested;

  while (out.length > 1 && total() + minAxisWidth > available) out.pop();
  return out;
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
  /* Its own dates, or a start plus a working duration — where the end is
     DERIVED, which is the whole point: the caller states how long the job takes
     and the calendar decides when that lands. Shared with `ganttFitRange`,
     which needs the same answer WITHOUT the rollup below. */
  const own = explicitSpan(task, calendar);
  if (own) return own;

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
