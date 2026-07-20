/**
 * Contract for the resource-by-time grid maths behind PlanningCalendar.
 *
 * All four bindings render this from one module, so this file is where they are
 * made to agree. Every failure mode here is silent: a block half a column left,
 * a meeting hidden behind another because they were not detected as
 * overlapping, a "now" line pinned to Monday 00:00 of a week nobody is looking
 * at. None of it throws, and none of it fails a build.
 *
 * Dates are constructed with the local-time constructor on purpose — that is
 * what the module reads, and a Date built from an ISO string with a Z would test
 * a different calendar than the one users see.
 */
import {
  formatTimeRange,
  layoutLanes,
  nowPct,
  placeAppointment,
  planningColumns,
  planningRange,
  planningRangeLabel,
  shiftPlanningAnchor,
  startOfMonth,
  startOfWeek,
} from "../packages/core/src/planning";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(58)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

/** 2026-07-21 is a Tuesday. */
const at = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min, 0, 0);
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

console.log("\nthe week starts on Monday, from any day inside it");
t(iso(startOfWeek(at(2026, 7, 21))), "2026-07-20 00:00", "Tuesday -> Monday");
t(iso(startOfWeek(at(2026, 7, 20))), "2026-07-20 00:00", "Monday is already the start");
// The one everybody gets wrong: getDay() is 0 for Sunday, so a naive
// `d - getDay() + 1` sends Sunday FORWARD into the next week.
t(iso(startOfWeek(at(2026, 7, 26))), "2026-07-20 00:00", "Sunday belongs to the week that just ended");
t(iso(startOfMonth(at(2026, 7, 21))), "2026-07-01 00:00", "start of month");

console.log("\nthe range a view covers is half-open");
t(
  [iso(planningRange("day", at(2026, 7, 21, 15)).start), iso(planningRange("day", at(2026, 7, 21, 15)).end)],
  ["2026-07-21 00:00", "2026-07-22 00:00"],
  "day: midnight to midnight, from any time inside it",
);
t(
  [iso(planningRange("week", at(2026, 7, 21)).start), iso(planningRange("week", at(2026, 7, 21)).end)],
  ["2026-07-20 00:00", "2026-07-27 00:00"],
  "week: Monday to the next Monday",
);
t(
  [iso(planningRange("month", at(2026, 7, 21)).start), iso(planningRange("month", at(2026, 7, 21)).end)],
  ["2026-07-01 00:00", "2026-08-01 00:00"],
  "month: the 1st to the next 1st",
);
t(
  iso(planningRange("month", at(2026, 12, 9)).end),
  "2027-01-01 00:00",
  "December rolls into the next YEAR, not month 13",
);

console.log("\nmoving by one view");
t(iso(shiftPlanningAnchor("day", at(2026, 7, 21), 1)), "2026-07-22 00:00", "next day");
t(iso(shiftPlanningAnchor("day", at(2026, 7, 31), 1)), "2026-08-01 00:00", "next day crosses the month");
t(iso(shiftPlanningAnchor("week", at(2026, 7, 21), 1)), "2026-07-27 00:00", "next week normalises to Monday");
t(iso(shiftPlanningAnchor("week", at(2026, 7, 21), -1)), "2026-07-13 00:00", "previous week");
// 31 January + 1 month is the classic overflow: Date rolls it to 2 or 3 March.
// Anchoring on the 1st is what stops it.
t(iso(shiftPlanningAnchor("month", at(2026, 1, 31), 1)), "2026-02-01 00:00", "31 Jan + 1 month is February, not March");
t(iso(shiftPlanningAnchor("month", at(2026, 3, 15), -1)), "2026-02-01 00:00", "previous month");

console.log("\ncolumns");
const dayCols = planningColumns("day", at(2026, 7, 21), { now: at(2026, 7, 21, 10, 30) });
t(dayCols.length, 24, "a day is 24 hourly columns");
t(dayCols[0].label, "00:00", "the first is midnight");
t(dayCols[9].label, "09:00", "labels are zero-padded");
t([dayCols[8].nonWorking, dayCols[9].nonWorking, dayCols[18].nonWorking], [true, false, true], "08:00 and 18:00 are outside 9-18, 09:00 is inside");
t(dayCols.filter((c) => c.today).length, 1, "exactly ONE column holds now, not the whole day");
t(dayCols.findIndex((c) => c.today), 10, "10:30 lands in the 10:00 column");
t(planningColumns("day", at(2026, 7, 21), { hourStep: 2 }).length, 12, "hourStep 2 halves the count");
t(
  planningColumns("day", at(2026, 7, 21), { dayStartHour: 8, dayEndHour: 18 }).map((c) => c.label).at(-1),
  "17:00",
  "dayEndHour is exclusive",
);

const weekCols = planningColumns("week", at(2026, 7, 21), { now: at(2026, 7, 21) });
t(weekCols.length, 7, "a week is 7 columns");
t(weekCols.map((c) => c.label), ["Mon 20", "Tue 21", "Wed 22", "Thu 23", "Fri 24", "Sat 25", "Sun 26"], "Monday first");
t(weekCols.filter((c) => c.nonWorking).map((c) => c.label), ["Sat 25", "Sun 26"], "the weekend is the weekend");
t(weekCols.filter((c) => c.today).map((c) => c.label), ["Tue 21"], "today is one column");

t(planningColumns("month", at(2026, 7, 21)).length, 31, "July has 31 columns");
t(planningColumns("month", at(2026, 2, 10)).length, 28, "February 2026 has 28");
t(planningColumns("month", at(2024, 2, 10)).length, 29, "February 2024 has 29 — leap years are not special-cased anywhere");

console.log("\nrange labels");
t(planningRangeLabel("day", at(2026, 7, 21)), "Tue 21 July 2026", "a day names its weekday");
t(planningRangeLabel("week", at(2026, 7, 21)), "20 – 26 July 2026", "one month: the month is said once");
t(planningRangeLabel("week", at(2026, 10, 1)), "28 September – 4 October 2026", "across two months: both named, year once");
t(planningRangeLabel("week", at(2026, 12, 31)), "28 December 2026 – 3 January 2027", "across a year: both years named");
t(planningRangeLabel("month", at(2026, 7, 21)), "July 2026", "a month");

console.log("\nplacing an appointment on the axis");
const day = planningRange("day", at(2026, 7, 21));
const place = (fromH: number, fromM: number, toH: number, toM: number) =>
  placeAppointment({ start: at(2026, 7, 21, fromH, fromM), end: at(2026, 7, 21, toH, toM) }, day);
t(place(0, 0, 12, 0)?.startPct, 0, "midnight starts at 0%");
t(place(6, 0, 12, 0)?.startPct, 25, "06:00 is a quarter through the day");
t(place(6, 0, 12, 0)?.widthPct, 25, "six hours is a quarter wide");
// Rounded for readability, not to hide a discrepancy: 9.5/24 is not exactly
// representable, so an exact literal here would pin a float artefact rather than
// the maths. Six places is far finer than a pixel on any real axis.
const r6 = (n: number | undefined) => (n === undefined ? undefined : Number(n.toFixed(6)));
t(r6(place(9, 30, 10, 0)?.startPct), 39.583333, "09:30 is not rounded to the hour");
t([place(6, 0, 12, 0)?.clippedStart, place(6, 0, 12, 0)?.clippedEnd], [false, false], "inside the range is not clipped");

const spilling = placeAppointment(
  { start: at(2026, 7, 20, 22, 0), end: at(2026, 7, 22, 2, 0) },
  day,
);
t([spilling?.startPct, spilling?.widthPct], [0, 100], "an appointment covering the whole day fills it");
t([spilling?.clippedStart, spilling?.clippedEnd], [true, true], "and reports both cuts, so the caller can draw them");

// Half-open at BOTH ends. Without this an appointment ending at midnight draws a
// zero-width sliver on the following day as well.
t(placeAppointment({ start: at(2026, 7, 20, 8, 0), end: at(2026, 7, 21, 0, 0) }, day), null, "ending exactly at the range start is not in view");
t(placeAppointment({ start: at(2026, 7, 22, 0, 0), end: at(2026, 7, 22, 8, 0) }, day), null, "starting exactly at the range end is not in view");
t(placeAppointment({ start: at(2026, 7, 25, 9, 0), end: at(2026, 7, 25, 10, 0) }, day), null, "another day entirely");

const milestone = place(14, 0, 14, 0);
t(milestone?.widthPct, 0.5, "a zero-length appointment still gets a clickable width");
t(r6(milestone?.startPct), 58.333333, "…without moving from where it happens");
// An inverted pair is bad data, not a backwards meeting. Normalised rather than
// swapped-and-believed: swapping invents a duration nobody entered.
t(
  placeAppointment({ start: at(2026, 7, 21, 12, 0), end: at(2026, 7, 21, 9, 0) }, day)?.startPct,
  37.5,
  "an inverted appointment is placed at its earlier bound, not dropped",
);
t(placeAppointment({ start: at(2026, 7, 21, 9, 0), end: at(2026, 7, 21, 10, 0) }, { start: day.end, end: day.start }), null, "an inverted RANGE places nothing");

const near = placeAppointment({ start: at(2026, 7, 21, 23, 59), end: at(2026, 7, 22, 6, 0) }, day);
t(Number(((near?.startPct ?? 0) + (near?.widthPct ?? 0)).toFixed(6)), 100, "a block at the very end never exceeds 100%");

console.log("\nstacking overlaps into lanes");
const lanes = (spans: Array<[number, number]>) =>
  layoutLanes(spans.map(([a, b]) => ({ start: at(2026, 7, 21, a), end: at(2026, 7, 21, b) })));
t(lanes([[9, 10], [11, 12]]).laneCount, 1, "two appointments that do not overlap share one lane");
t(lanes([[9, 11], [10, 12]]).laneCount, 2, "two that do need two");
t(lanes([[9, 11], [10, 12]]).lanes, [0, 1], "…and the later one moves down");
// Touching is not overlapping. Without a half-open comparison a back-to-back day
// becomes a staircase of lanes.
t(lanes([[9, 10], [10, 11], [11, 12]]).laneCount, 1, "back-to-back appointments do NOT stack");
t(lanes([[9, 12], [10, 11], [10, 13], [14, 15]]).laneCount, 3, "the busiest instant decides the lane count");
t(lanes([[9, 12], [10, 11], [10, 13], [14, 15]]).lanes, [0, 1, 2, 0], "a lane is reused once it is free");
// Input order is the caller's; they key on their own ids.
t(lanes([[14, 15], [9, 11], [10, 12]]).lanes, [0, 0, 1], "lanes come back in INPUT order, not sorted order");
t(lanes([]).laneCount, 0, "nothing needs no lanes");

console.log("\nthe now line");
t(nowPct(day, at(2026, 7, 21, 12, 0)), 50, "midday is halfway");
t(nowPct(day, at(2026, 7, 21, 0, 0)), 0, "midnight is at the start");
t(nowPct(day, at(2026, 7, 22, 0, 0)), null, "the exclusive end is outside");
t(nowPct(day, at(2026, 7, 19, 12, 0)), null, "before the range: no line, rather than one pinned to 0%");

console.log("\ntime range labels");
t(formatTimeRange(at(2026, 7, 21, 9, 0), at(2026, 7, 21, 10, 30)), "09:00 – 10:30", "within a day");
t(formatTimeRange(at(2026, 7, 21, 22, 0), at(2026, 7, 22, 2, 0)), "21 Tue 22:00 – 22 Wed 02:00", "across midnight names the days");

console.log(f === 0 ? "\nall passed\n" : `\n${f} FAILED\n`);
process.exit(f === 0 ? 0 : 1);
