/**
 * Contract for the semantic date-range engine.
 *
 * Date maths is the classic case where a browser hides the bug: "This Quarter"
 * looks plausible in a popover on any day you happen to test, and is wrong on
 * 1 January. So this pins the answers against a FIXED `now` — which is the
 * whole reason resolveDateRange takes `now` as an argument instead of reading
 * the clock.
 *
 * Ranges are compared as LOCAL date-times, never via JSON.stringify: a Date
 * serialises to UTC, so a stringify-based check passes in London and fails in
 * Mumbai. This repo runs in +05:30.
 */
import {
  DATE_RANGE_OPERATORS,
  formatDateRangeValue,
  parseISODate,
  resolveDateRange,
  toISODate,
  type DateRangeValue,
} from "../packages/core/src/date-range";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(46)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

/** Local wall-clock rendering, so the check is timezone-independent. */
const p = (n: number, w = 2) => String(n).padStart(w, "0");
const stamp = (d?: Date) =>
  !d
    ? "—"
    : `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
const span = (v: DateRangeValue, now: Date, opts = {}) => {
  const r = resolveDateRange(v, now, opts);
  return `${stamp(r.from)} → ${stamp(r.to)}`;
};

// 2026-07-15 is a WEDNESDAY, in Q3. Mid-month, mid-week, mid-quarter — so a
// resolver that returns the wrong period is visibly wrong rather than
// accidentally right.
const NOW = new Date(2026, 6, 15, 14, 30, 0);

console.log("\nsanity — the fixed clock is the day this check assumes");
t(NOW.getDay(), 3, "2026-07-15 is a Wednesday");

console.log("\nday operators");
t(span({ operator: "TODAY" }, NOW), "2026-07-15 00:00:00.000 → 2026-07-15 23:59:59.999", "TODAY spans the whole day");
t(span({ operator: "YESTERDAY" }, NOW), "2026-07-14 00:00:00.000 → 2026-07-14 23:59:59.999", "YESTERDAY");
t(span({ operator: "TOMORROW" }, NOW), "2026-07-16 00:00:00.000 → 2026-07-16 23:59:59.999", "TOMORROW");

console.log("\nthe end of a range is the last millisecond, not next midnight");
// to=midnight would exclude everything that happened on the final day.
t(resolveDateRange({ operator: "TODAY" }, NOW).to?.getHours(), 23, "TODAY ends at hour 23");
t(resolveDateRange({ operator: "TODAY" }, NOW).to?.getMilliseconds(), 999, "TODAY ends at .999");

console.log("\nweeks — Sunday start, matching what both calendars draw");
t(span({ operator: "THIS_WEEK" }, NOW), "2026-07-12 00:00:00.000 → 2026-07-18 23:59:59.999", "THIS_WEEK is Sun 12 – Sat 18");
t(span({ operator: "LAST_WEEK" }, NOW), "2026-07-05 00:00:00.000 → 2026-07-11 23:59:59.999", "LAST_WEEK");
t(span({ operator: "NEXT_WEEK" }, NOW), "2026-07-19 00:00:00.000 → 2026-07-25 23:59:59.999", "NEXT_WEEK");
t(span({ operator: "THIS_WEEK" }, NOW, { weekStartsOn: 1 }), "2026-07-13 00:00:00.000 → 2026-07-19 23:59:59.999", "THIS_WEEK, weekStartsOn=1 (Mon)");

console.log("\nmonths");
t(span({ operator: "THIS_MONTH" }, NOW), "2026-07-01 00:00:00.000 → 2026-07-31 23:59:59.999", "THIS_MONTH knows July has 31 days");
t(span({ operator: "LAST_MONTH" }, NOW), "2026-06-01 00:00:00.000 → 2026-06-30 23:59:59.999", "LAST_MONTH knows June has 30");
t(span({ operator: "MONTH_TO_DATE" }, NOW), "2026-07-01 00:00:00.000 → 2026-07-15 23:59:59.999", "MONTH_TO_DATE ends today");

console.log("\nquarters — 2026-07-15 is Q3");
t(span({ operator: "THIS_QUARTER" }, NOW), "2026-07-01 00:00:00.000 → 2026-09-30 23:59:59.999", "THIS_QUARTER = Jul–Sep");
t(span({ operator: "LAST_QUARTER" }, NOW), "2026-04-01 00:00:00.000 → 2026-06-30 23:59:59.999", "LAST_QUARTER = Apr–Jun");
t(span({ operator: "NEXT_QUARTER" }, NOW), "2026-10-01 00:00:00.000 → 2026-12-31 23:59:59.999", "NEXT_QUARTER = Oct–Dec");
t(span({ operator: "QUARTER_TO_DATE" }, NOW), "2026-07-01 00:00:00.000 → 2026-07-15 23:59:59.999", "QUARTER_TO_DATE");

console.log("\nyears");
t(span({ operator: "THIS_YEAR" }, NOW), "2026-01-01 00:00:00.000 → 2026-12-31 23:59:59.999", "THIS_YEAR");
t(span({ operator: "LAST_YEAR" }, NOW), "2025-01-01 00:00:00.000 → 2025-12-31 23:59:59.999", "LAST_YEAR");
t(span({ operator: "YEAR_TO_DATE" }, NOW), "2026-01-01 00:00:00.000 → 2026-07-15 23:59:59.999", "YEAR_TO_DATE");

console.log("\nLAST_* means COMPLETED periods — today is excluded by default");
t(span({ operator: "LAST_DAYS", count: 7 }, NOW), "2026-07-08 00:00:00.000 → 2026-07-14 23:59:59.999", "LAST_DAYS(7) ends yesterday");
t(span({ operator: "LAST_DAYS", count: 1 }, NOW), "2026-07-14 00:00:00.000 → 2026-07-14 23:59:59.999", "LAST_DAYS(1) is exactly yesterday");
t(span({ operator: "LAST_DAYS", count: 7, includeCurrent: true }, NOW), "2026-07-09 00:00:00.000 → 2026-07-15 23:59:59.999", "LAST_DAYS(7, incl) ends today");
// The pair above is the whole reason the flag exists: same operator, same
// count, a range shifted by one day. Silently picking one is a filter that is
// off by a day forever.
t(span({ operator: "NEXT_DAYS", count: 3 }, NOW), "2026-07-16 00:00:00.000 → 2026-07-18 23:59:59.999", "NEXT_DAYS(3) starts tomorrow");
t(span({ operator: "NEXT_DAYS", count: 3, includeCurrent: true }, NOW), "2026-07-15 00:00:00.000 → 2026-07-17 23:59:59.999", "NEXT_DAYS(3, incl) starts today");

console.log("\nrolling weeks / months / quarters / years");
t(span({ operator: "LAST_WEEKS", count: 2 }, NOW), "2026-06-28 00:00:00.000 → 2026-07-11 23:59:59.999", "LAST_WEEKS(2) = 2 whole weeks before this");
t(span({ operator: "LAST_WEEKS", count: 2, includeCurrent: true }, NOW), "2026-06-28 00:00:00.000 → 2026-07-18 23:59:59.999", "LAST_WEEKS(2, incl) runs to Sat");
t(span({ operator: "LAST_MONTHS", count: 3 }, NOW), "2026-04-01 00:00:00.000 → 2026-06-30 23:59:59.999", "LAST_MONTHS(3) = Apr–Jun");
t(span({ operator: "LAST_MONTHS", count: 3, includeCurrent: true }, NOW), "2026-04-01 00:00:00.000 → 2026-07-31 23:59:59.999", "LAST_MONTHS(3, incl) runs to Jul 31");
t(span({ operator: "LAST_QUARTERS", count: 2 }, NOW), "2026-01-01 00:00:00.000 → 2026-06-30 23:59:59.999", "LAST_QUARTERS(2) = Q1+Q2");
t(span({ operator: "LAST_YEARS", count: 2 }, NOW), "2024-01-01 00:00:00.000 → 2025-12-31 23:59:59.999", "LAST_YEARS(2) = 2024+2025");
t(span({ operator: "NEXT_MONTHS", count: 2 }, NOW), "2026-08-01 00:00:00.000 → 2026-09-30 23:59:59.999", "NEXT_MONTHS(2) = Aug–Sep");

console.log("\nyear boundaries — where 'last month' usually breaks");
const JAN = new Date(2026, 0, 10, 9, 0, 0);
t(span({ operator: "LAST_MONTH" }, JAN), "2025-12-01 00:00:00.000 → 2025-12-31 23:59:59.999", "LAST_MONTH from Jan crosses the year");
t(span({ operator: "LAST_QUARTER" }, JAN), "2025-10-01 00:00:00.000 → 2025-12-31 23:59:59.999", "LAST_QUARTER from Q1 is last year's Q4");
t(span({ operator: "THIS_QUARTER" }, JAN), "2026-01-01 00:00:00.000 → 2026-03-31 23:59:59.999", "THIS_QUARTER from Jan is Q1");
// A week that straddles New Year: 2026-01-01 is a Thursday, so its Sunday is
// 2025-12-28. A naive "same month" week calculation gets this wrong.
const NYD = new Date(2026, 0, 1, 12, 0, 0);
t(span({ operator: "THIS_WEEK" }, NYD), "2025-12-28 00:00:00.000 → 2026-01-03 23:59:59.999", "THIS_WEEK straddling New Year");

console.log("\nleap years");
const FEB24 = new Date(2024, 1, 10, 12, 0, 0);
t(span({ operator: "THIS_MONTH" }, FEB24), "2024-02-01 00:00:00.000 → 2024-02-29 23:59:59.999", "Feb 2024 has 29 days");
const FEB26 = new Date(2026, 1, 10, 12, 0, 0);
t(span({ operator: "THIS_MONTH" }, FEB26), "2026-02-01 00:00:00.000 → 2026-02-28 23:59:59.999", "Feb 2026 has 28");
// 2100 is NOT a leap year (divisible by 100, not 400) — the rule everyone
// forgets. Date knows; this asserts we defer to it rather than doing % 4.
const FEB2100 = new Date(2100, 1, 10, 12, 0, 0);
t(span({ operator: "THIS_MONTH" }, FEB2100), "2100-02-01 00:00:00.000 → 2100-02-28 23:59:59.999", "Feb 2100 has 28 (not a leap year)");
// From 31 Mar, "last month" must be all of February, not 3 March: month
// arithmetic that lets Date overflow lands in the wrong month entirely.
const MAR31 = new Date(2024, 2, 31, 12, 0, 0);
t(span({ operator: "LAST_MONTH" }, MAR31), "2024-02-01 00:00:00.000 → 2024-02-29 23:59:59.999", "LAST_MONTH from 31 Mar clamps to Feb");

console.log("\nabsolute operators");
t(span({ operator: "DATE", date: "2026-03-09" }, NOW), "2026-03-09 00:00:00.000 → 2026-03-09 23:59:59.999", "DATE covers the whole day");
t(span({ operator: "BETWEEN", from: "2026-03-01", to: "2026-03-31" }, NOW), "2026-03-01 00:00:00.000 → 2026-03-31 23:59:59.999", "BETWEEN");
t(span({ operator: "BETWEEN", from: "2026-03-31", to: "2026-03-01" }, NOW), "2026-03-01 00:00:00.000 → 2026-03-31 23:59:59.999", "BETWEEN backwards is still a range");
t(span({ operator: "FROM", date: "2026-03-01" }, NOW), "2026-03-01 00:00:00.000 → —", "FROM is open-ended");
t(span({ operator: "TO", date: "2026-03-01" }, NOW), "— → 2026-03-01 23:59:59.999", "TO is open-ended");

console.log("\nISO parsing is LOCAL, not UTC");
// new Date("2026-07-15") is UTC midnight — the 14th anywhere west of London.
// This is a real off-by-one that only breaks for half the planet.
const parsed = parseISODate("2026-07-15")!;
t([parsed.getFullYear(), parsed.getMonth(), parsed.getDate()], [2026, 6, 15], "parseISODate keeps the day it was given");
t(toISODate(new Date(2026, 6, 5)), "2026-07-05", "toISODate zero-pads");
t(toISODate(parseISODate("2026-01-31")!), "2026-01-31", "round-trips");
t(parseISODate("2026-02-31"), null, "rejects 31 February");
t(parseISODate("15/07/2026"), null, "rejects a non-ISO string");
t(parseISODate(""), null, "rejects empty");

console.log("\nunresolvable values return {} rather than throwing");
t(resolveDateRange(null, NOW), {}, "null");
t(resolveDateRange({ operator: "DATE", date: "nope" }, NOW), {}, "an unparseable date");
t(resolveDateRange({ operator: "NOPE" } as never, NOW), {}, "an unknown operator");

console.log("\ncounts are clamped, never inverted");
t(span({ operator: "LAST_DAYS", count: 0 }, NOW), "2026-07-15 00:00:00.000 → 2026-07-14 23:59:59.999", "count 0 is empty, not inverted");
t(span({ operator: "LAST_DAYS", count: -5 }, NOW), "2026-07-15 00:00:00.000 → 2026-07-14 23:59:59.999", "a negative count clamps to 0");
t(span({ operator: "LAST_DAYS", count: 2.7 }, NOW), "2026-07-13 00:00:00.000 → 2026-07-14 23:59:59.999", "a fractional count floors");

console.log("\nthe value survives being saved and read back");
// The entire premise: a saved filter must re-resolve, not freeze.
const saved: DateRangeValue = { operator: "LAST_DAYS", count: 7 };
const roundTripped = JSON.parse(JSON.stringify(saved)) as DateRangeValue;
t(roundTripped, saved, "JSON round-trips exactly");
t(span(roundTripped, NOW), span(saved, NOW), "and resolves identically");
// Same value, different day -> different dates. That IS the feature.
const LATER = new Date(2026, 7, 20, 9, 0, 0);
t(
  span(saved, LATER),
  "2026-08-13 00:00:00.000 → 2026-08-19 23:59:59.999",
  "the same saved value moves with the clock",
);

console.log("\nlabels name the question, not the answer");
t(formatDateRangeValue({ operator: "LAST_DAYS", count: 7 }), "Last 7 days", "LAST_DAYS(7)");
t(formatDateRangeValue({ operator: "LAST_DAYS", count: 1 }), "Last 1 day", "singular");
t(formatDateRangeValue({ operator: "LAST_DAYS", count: 7, includeCurrent: true }), "Last 7 days, incl. current", "incl. current is visible");
t(formatDateRangeValue({ operator: "THIS_QUARTER" }), "This quarter", "fixed operator");
t(formatDateRangeValue(null), "", "null is empty");
t(formatDateRangeValue({ operator: "DATE", date: "2026-07-15" }, toISODate), "On 2026-07-15", "DATE, custom formatter");
t(formatDateRangeValue({ operator: "BETWEEN", from: "2026-07-01", to: "2026-07-31" }, toISODate), "2026-07-01 – 2026-07-31", "BETWEEN, custom formatter");

console.log("\nevery advertised operator actually resolves");
// Guards the gap where an operator is added to the metadata list (so it shows
// up in the UI) but never wired into a resolver — it would render as a silently
// empty range.
for (const meta of DATE_RANGE_OPERATORS) {
  const v =
    meta.arity === "count"
      ? { operator: meta.operator, count: 3 }
      : meta.arity === "date"
        ? { operator: meta.operator, date: "2026-07-15" }
        : meta.arity === "range"
          ? { operator: meta.operator, from: "2026-07-01", to: "2026-07-31" }
          : { operator: meta.operator };
  const r = resolveDateRange(v as DateRangeValue, NOW);
  const resolves = !!(r.from || r.to);
  const labelled = formatDateRangeValue(v as DateRangeValue).length > 0;
  t(resolves && labelled, true, `${meta.operator} resolves and labels`);
}

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
