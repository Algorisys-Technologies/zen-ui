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
export declare function startOfWeek(d: Date): Date;
export declare function startOfMonth(d: Date): Date;
/**
 * The half-open interval a view covers, normalised from any date inside it.
 *
 * Half-open — `end` is the first instant NOT shown — because the alternative is
 * 23:59:59.999 arithmetic, where an appointment ending exactly at midnight
 * belongs to two days and gets drawn twice.
 */
export declare function planningRange(view: PlanningView, anchor: Date): PlanningRange;
/** Move the anchor one view forward or back. `delta` is in views, not days. */
export declare function shiftPlanningAnchor(view: PlanningView, anchor: Date, delta: number): Date;
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
export declare function planningColumns(view: PlanningView, anchor: Date, options?: PlanningColumnOptions): PlanningColumn[];
/** A heading for the whole range — what the toolbar shows between the arrows. */
export declare function planningRangeLabel(view: PlanningView, anchor: Date): string;
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
export declare function placeAppointment(appointment: PlanningAppointmentInput, range: PlanningRange, minWidthPct?: number): PlanningPlacement | null;
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
export declare function layoutLanes(appointments: PlanningAppointmentInput[]): {
    lanes: number[];
    laneCount: number;
};
/**
 * Where "now" sits in the range, as a percentage, or `null` when it is outside.
 *
 * Null rather than a clamped 0 or 100: a line pinned to the left edge of next
 * week reads as "it is Monday morning", which is a worse answer than no line.
 */
export declare function nowPct(range: PlanningRange, now?: Date): number | null;
/** "09:00 – 10:30", for an appointment's accessible name and tooltip. */
export declare function formatTimeRange(start: Date, end: Date): string;
