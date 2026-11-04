/**
 * Typed date contract.
 *
 *   bun run check:date-input
 *
 * The pure half of DateInput: what a clerk types, read in the locale's order,
 * with shortcuts. Invariants re-checked everywhere: every date formatted and
 * typed back is the same date, in each order; an impossible date is refused,
 * never rolled over.
 */
import {
  orderForLocale, makeDate, expandYear, addMonths, parseDateInput, formatDateInput, patternFor,
  type DateOrder,
} from "../packages/core/src/date-input";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};
const iso = (d: Date | null | "invalid") => (d instanceof Date ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : d);
const TODAY = new Date(2026, 10, 4, 15, 30); // 4 Nov 2026, mid-afternoon
const p = (t: string, o: DateOrder = "dmy") => iso(parseDateInput(t, o, TODAY));

/* locales */
eq("en-IN is dmy", orderForLocale("en-IN"), "dmy");
eq("en-GB is dmy", orderForLocale("en-GB"), "dmy");
eq("en-US is mdy", orderForLocale("en-US"), "mdy");
eq("ja-JP is ymd", orderForLocale("ja-JP"), "ymd");
eq("a tag Intl rejects falls back to dmy", orderForLocale("!!"), "dmy");

/* real dates only */
eq("31 Feb refused", makeDate(2026, 2, 31), null);
eq("29 Feb leap", iso(makeDate(2028, 2, 29)), "2028-02-29");
eq("29 Feb not leap", makeDate(2026, 2, 29), null);
eq("month 13", makeDate(2026, 13, 1), null);
eq("day 0", makeDate(2026, 3, 0), null);
eq("year 0099 stays 0099", makeDate(99, 1, 1)?.getFullYear(), 99);

/* two-digit years */
eq("26 -> 2026", expandYear(26, TODAY), 2026);
eq("75 -> 2075", expandYear(75, TODAY), 2075);
eq("77 -> 1977", expandYear(77, TODAY), 1977);
eq("99 -> 1999", expandYear(99, TODAY), 1999);

/* months clamp */
eq("31 Jan + 1m", iso(addMonths(new Date(2026, 0, 31), 1)), "2026-02-28");
eq("31 Jan 2028 + 1m", iso(addMonths(new Date(2028, 0, 31), 1)), "2028-02-29");
eq("31 Mar - 1m", iso(addMonths(new Date(2026, 2, 31), -1)), "2026-02-28");

/* shortcuts */
eq("t", p("t"), "2026-11-04");
eq("Today", p("Today"), "2026-11-04");
eq("y", p("y"), "2026-11-03");
eq("+7", p("+7"), "2026-11-11");
eq("-1", p("-1"), "2026-11-03");
eq("+ 2w", p("+ 2w"), "2026-11-18");
eq("+1m", p("+1m"), "2026-12-04");
eq("-1y", p("-1y"), "2025-11-04");
eq("+30 crosses a month", p("+30"), "2026-12-04");

/* typed, day first */
eq("15/03/2026", p("15/03/2026"), "2026-03-15");
eq("15-3-26", p("15-3-26"), "2026-03-15");
eq("15.03.2026", p("15.03.2026"), "2026-03-15");
eq("15 3 2026", p("15 3 2026"), "2026-03-15");
eq("15/3 this year", p("15/3"), "2026-03-15");
eq("150326", p("150326"), "2026-03-15");
eq("15032026", p("15032026"), "2026-03-15");
eq("1503 this year", p("1503"), "2026-03-15");
eq("15 this month", p("15"), "2026-11-15");
eq("5 this month", p("5"), "2026-11-05");
eq("ISO in a dmy locale", p("2026-03-15"), "2026-03-15");
/* month first */
eq("mdy 03/15/2026", p("03/15/2026", "mdy"), "2026-03-15");
eq("mdy 031526", p("031526", "mdy"), "2026-03-15");
eq("mdy 3/15", p("3/15", "mdy"), "2026-03-15");
/* year first */
eq("ymd 2026/03/15", p("2026/03/15", "ymd"), "2026-03-15");
eq("ymd 20260315", p("20260315", "ymd"), "2026-03-15");
eq("ymd 0315", p("0315", "ymd"), "2026-03-15");
/* refused */
eq("31/02/2026", p("31/02/2026"), "invalid");
eq("15/13/2026", p("15/13/2026"), "invalid");
eq("letters", p("abc"), "invalid");
eq("five digits", p("15032"), "invalid");
eq("four parts", p("1/2/3/4"), "invalid");
eq("32 this month", p("32"), "invalid");
eq("0", p("0"), "invalid");
eq("empty is no date", p("   "), null);
eq("mdy refuses a dmy reading", p("15/03/2026", "mdy"), "invalid");

/* patterns */
eq("patterns", (["dmy", "mdy", "ymd"] as DateOrder[]).map(patternFor), ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]);

/* Invariant: format then parse is the same date, every day of 2024 to 2028, each order. */
let combos = 0;
for (const order of ["dmy", "mdy", "ymd"] as DateOrder[]) {
  for (let d = new Date(2024, 0, 1); d.getFullYear() <= 2028; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const text = formatDateInput(d, order);
    const back = parseDateInput(text, order, TODAY);
    if (!(back instanceof Date) || back.getTime() !== d.getTime()) eq(`round trip ${order} ${text}`, iso(back), iso(d));
    else checked++;
    combos++;
  }
}
// Invariant: no typed day/month that does not exist parses, for every day 1–31 of every month.
for (let m = 1; m <= 12; m++) for (let day = 1; day <= 31; day++) {
  // Decided independently of makeDate, so a broken makeDate cannot agree with itself.
  const exists = day <= new Date(2026, m, 0).getDate();
  const got = parseDateInput(`${day}/${m}/2026`, "dmy", TODAY);
  eq(`${day}/${m}/2026 ${exists ? "exists" : "refused"}`, got instanceof Date, exists);
  combos++;
}

if (failed) { console.error(`\ncheck:date-input — ${failed} of ${checked} failed`); process.exit(1); }
console.log(`check:date-input — ${checked} assertions passed (${combos} round-trip and calendar combinations)`);
