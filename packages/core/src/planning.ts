/**
 * Layout maths for a resource-by-time grid — the arithmetic behind
 * PlanningCalendar, with no DOM and no framework in it.
 *
 * A planning calendar is four calculations wearing a component: which columns a
 * view shows, where an appointment sits along that axis, which appointments
 * collide and therefore need stacking, and where "now" is. Every one of them
 * fails silently when wrong — a block lands half a column left, an overlap hides
 * a meeting behind another, a bar for "now" sits at 3pm on a Tuesday you are not
 * looking at. None of it throws.
 *
 * It lives here rather than in a binding because four renderers must not each
 * re-derive it; that is how two calendars end up disagreeing about where a
 * 09:30 meeting starts. Pinned by scripts/check-planning.ts.
 *
 * TIME ZONES: everything is computed from the caller's `Date` objects in local
 * time, deliberately. A calendar that converted would have to be told which zone
 * to convert TO, and getting that wrong moves every appointment by hours without
 * anything looking broken. If your data is UTC, convert before you pass it.
 */

export type PlanningView = "day" | "week" | "month";

export interface PlanningColumn {
  /** Inclusive start of the column. */
  start: Date;
  /** Exclusive end. `end` of column n is `start` of column n+1, exactly. */
  end: Date;
  /** "09:00", "Mon 21", "21" — what the header shows. */
  label: string;
  /** Second line of the header: the weekday for a month view, "" otherwise. */
  sublabel: string;
  /** Saturday/Sunday in day-column views, or outside working hours in a day view. */
  nonWorking: boolean;
  /** Contains the reference "now". */
  today: boolean;
}

export interface PlanningRange {
  start: Date;
  /** Exclusive. */
  end: Date;
}

export interface PlanningAppointmentInput {
  start: Date;
  end: Date;
}

/** Where a block sits on the axis, as percentages of the whole range. */
export interface PlanningPlacement {
  /** 0–100, from the range start. */
  startPct: number;
  /** >0, never taking startPct+widthPct past 100. */
  widthPct: number;
  /** The appointment begins before the visible range and is cut at the left. */
  clippedStart: boolean;
  /** …and at the right. */
  clippedEnd: boolean;
}

const MS_MIN = 60_000;
const MS_HOUR = 60 * MS_MIN;
const MS_DAY = 24 * MS_HOUR;

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 0, 0, 0, 0);

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const pad2 = (n: number): string => String(n).padStart(2, "0");

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Monday, not Sunday.
 *
 * A week view whose first column is Sunday puts the weekend at both ends and
 * splits the working week in two, which is the one thing the view exists to show
 * whole. This is a fixed choice rather than a locale lookup: the alternative is
 * a calendar whose columns move when the browser language changes, and a caller
 * who wants Sunday-first can pass the Sunday as `start` — the range functions
 * honour the date they are given for `day`, and only `week` normalises.
 */
export function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const backToMonday = day === 0 ? 6 : day - 1;
  return addDays(d, -backToMonday);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * The half-open interval a view covers, normalised from any date inside it.
 *
 * Half-open — `end` is the first instant NOT shown — because the alternative is
 * 23:59:59.999 arithmetic, where an appointment ending exactly at midnight
 * belongs to two days and gets drawn twice.
 */
export function planningRange(view: PlanningView, anchor: Date): PlanningRange {
  if (view === "day") {
    const start = startOfDay(anchor);
    return { start, end: addDays(start, 1) };
  }
  if (view === "week") {
    const start = startOfWeek(anchor);
    return { start, end: addDays(start, 7) };
  }
  const start = startOfMonth(anchor);
  return { start, end: new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0) };
}

/** Move the anchor one view forward or back. `delta` is in views, not days. */
export function shiftPlanningAnchor(view: PlanningView, anchor: Date, delta: number): Date {
  if (view === "day") return addDays(anchor, delta);
  if (view === "week") return addDays(startOfWeek(anchor), delta * 7);
  const m = startOfMonth(anchor);
  // Month arithmetic through the Date constructor: month 12 rolls the year, and
  // day 1 cannot overflow the way "31 January + 1 month" does.
  return new Date(m.getFullYear(), m.getMonth() + delta, 1, 0, 0, 0, 0);
}

export interface PlanningColumnOptions {
  /** Hours per column in the day view. Default 1. */
  hourStep?: number;
  /** Inclusive first hour of the day view. Default 0. */
  dayStartHour?: number;
  /** Exclusive last hour of the day view. Default 24. */
  dayEndHour?: number;
  /** Marks columns outside it non-working in the day view. Default 9–18. */
  workingHours?: [number, number];
  /** Day indexes (0 = Sunday) that count as non-working. Default Sat + Sun. */
  nonWorkingDays?: number[];
  /** What counts as "today". Defaults to the real clock. */
  now?: Date;
}

/**
 * The columns a view shows.
 *
 * A day view is hours; a week and a month are days. The month view is
 * deliberately NOT a 6×7 page grid: this is a resource-by-time chart, so a month
 * is one long axis of 28–31 columns that scrolls, and every row stays a single
 * timeline. Wrapping it into weeks would give each resource six separate rows
 * and lose the one comparison the component exists to make.
 */
export function planningColumns(
  view: PlanningView,
  anchor: Date,
  options: PlanningColumnOptions = {},
): PlanningColumn[] {
  const now = options.now ?? new Date();
  const nonWorkingDays = options.nonWorkingDays ?? [0, 6];
  const columns: PlanningColumn[] = [];

  if (view === "day") {
    const step = options.hourStep && options.hourStep > 0 ? options.hourStep : 1;
    const from = options.dayStartHour ?? 0;
    const to = options.dayEndHour ?? 24;
    const [workFrom, workTo] = options.workingHours ?? [9, 18];
    const base = startOfDay(anchor);
    for (let hour = from; hour < to; hour += step) {
      const start = new Date(base.getTime() + hour * MS_HOUR);
      const end = new Date(Math.min(base.getTime() + (hour + step) * MS_HOUR, base.getTime() + to * MS_HOUR));
      columns.push({
        start,
        end,
        label: `${pad2(hour)}:00`,
        sublabel: "",
        nonWorking: hour < workFrom || hour >= workTo,
        // Every column of a day view is "today" or none of them is, so the flag
        // would paint the whole row. It marks the column containing `now`, which
        // is the only reading that says anything.
        today: sameDay(start, now) && now.getTime() >= start.getTime() && now.getTime() < end.getTime(),
      });
    }
    return columns;
  }

  const { start, end } = planningRange(view, anchor);
  for (let d = start; d.getTime() < end.getTime(); d = addDays(d, 1)) {
    const next = addDays(d, 1);
    columns.push({
      start: d,
      end: next,
      label: view === "week" ? `${WEEKDAYS[d.getDay()]} ${d.getDate()}` : String(d.getDate()),
      sublabel: view === "month" ? WEEKDAYS[d.getDay()] : "",
      nonWorking: nonWorkingDays.includes(d.getDay()),
      today: sameDay(d, now),
    });
  }
  return columns;
}

/** A heading for the whole range — what the toolbar shows between the arrows. */
export function planningRangeLabel(view: PlanningView, anchor: Date): string {
  const { start, end } = planningRange(view, anchor);
  const month = (d: Date) => d.toLocaleString(undefined, { month: "long" });
  if (view === "day") {
    return `${WEEKDAYS[start.getDay()]} ${start.getDate()} ${month(start)} ${start.getFullYear()}`;
  }
  if (view === "week") {
    const last = new Date(end.getTime() - MS_DAY);
    // "29 September – 5 October 2026", not "29 September 2026 – 5 October 2026":
    // the year is repeated only when the week actually crosses one.
    const left =
      start.getFullYear() === last.getFullYear()
        ? start.getMonth() === last.getMonth()
          ? `${start.getDate()}`
          : `${start.getDate()} ${month(start)}`
        : `${start.getDate()} ${month(start)} ${start.getFullYear()}`;
    return `${left} – ${last.getDate()} ${month(last)} ${last.getFullYear()}`;
  }
  return `${month(start)} ${start.getFullYear()}`;
}

/**
 * Where a block sits on the axis, or `null` when it is not in view at all.
 *
 * Percentages rather than pixels, so the same numbers drive a 400px column and a
 * 2,000px one and nothing has to be measured or re-measured on resize.
 *
 * A zero-length appointment gets a real, if small, width. A block of 0% is
 * invisible and unclickable, which reads as data that did not load rather than a
 * milestone at 14:00.
 */
export function placeAppointment(
  appointment: PlanningAppointmentInput,
  range: PlanningRange,
  minWidthPct = 0.5,
): PlanningPlacement | null {
  const rangeStart = range.start.getTime();
  const rangeEnd = range.end.getTime();
  const span = rangeEnd - rangeStart;
  if (span <= 0) return null;

  const rawStart = appointment.start.getTime();
  const rawEnd = appointment.end.getTime();
  // An inverted appointment is not a short one. Treated as a point in time at
  // its start rather than silently swapped: swapping invents a duration the
  // caller's data does not have.
  const from = Math.min(rawStart, rawEnd);
  const to = Math.max(rawStart, rawEnd);

  // Half-open on both sides: something ending exactly at the range start, or
  // starting exactly at its end, is not in view. Without this an appointment
  // that ends at midnight draws a zero-width sliver on the next day too.
  if (to <= rangeStart || from >= rangeEnd) return null;

  const clippedStart = from < rangeStart;
  const clippedEnd = to > rangeEnd;
  const visibleFrom = Math.max(from, rangeStart);
  const visibleTo = Math.min(to, rangeEnd);

  const startPct = ((visibleFrom - rangeStart) / span) * 100;
  const rawWidth = ((visibleTo - visibleFrom) / span) * 100;
  const widthPct = Math.min(Math.max(rawWidth, minWidthPct), 100 - startPct);

  return { startPct, widthPct, clippedStart, clippedEnd };
}

/**
 * Assign each appointment a lane so that overlapping ones stack instead of
 * hiding each other.
 *
 * Greedy by start time into the first lane whose last block has ended — the
 * standard interval-partitioning result, which uses exactly as many lanes as the
 * busiest instant needs. Returns one lane index per input, IN INPUT ORDER, plus
 * the total; the caller keys on its own ids and must not be handed a re-sorted
 * array it did not ask for.
 *
 * Touching is not overlapping: 10:00–11:00 and 11:00–12:00 share a lane. Half-
 * open again, and the reason a back-to-back day does not stack into a staircase.
 */
export function layoutLanes(appointments: PlanningAppointmentInput[]): {
  lanes: number[];
  laneCount: number;
} {
  const order = appointments
    .map((a, index) => ({ index, start: Math.min(a.start.getTime(), a.end.getTime()), end: Math.max(a.start.getTime(), a.end.getTime()) }))
    .sort((x, y) => x.start - y.start || x.end - y.end);

  const laneEnds: number[] = [];
  const lanes = new Array<number>(appointments.length).fill(0);

  for (const item of order) {
    let lane = laneEnds.findIndex((end) => end <= item.start);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.end);
    } else {
      laneEnds[lane] = item.end;
    }
    lanes[item.index] = lane;
  }

  return { lanes, laneCount: laneEnds.length };
}

/**
 * Where "now" sits in the range, as a percentage, or `null` when it is outside.
 *
 * Null rather than a clamped 0 or 100: a line pinned to the left edge of next
 * week reads as "it is Monday morning", which is a worse answer than no line.
 */
export function nowPct(range: PlanningRange, now: Date = new Date()): number | null {
  const start = range.start.getTime();
  const end = range.end.getTime();
  const at = now.getTime();
  if (at < start || at >= end) return null;
  return ((at - start) / (end - start)) * 100;
}

/** "09:00 – 10:30", for an appointment's accessible name and tooltip. */
export function formatTimeRange(start: Date, end: Date): string {
  const t = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  return sameDay(start, end)
    ? `${t(start)} – ${t(end)}`
    : `${start.getDate()} ${WEEKDAYS[start.getDay()]} ${t(start)} – ${end.getDate()} ${WEEKDAYS[end.getDay()]} ${t(end)}`;
}
