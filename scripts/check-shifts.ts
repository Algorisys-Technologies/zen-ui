/**
 * Shift calendar contract.
 *
 *   bun run check:shifts
 *
 * The pure half of ShiftNavigator, and what the shift-based screens after it
 * read: which shift an instant falls in, and where that shift starts and ends,
 * in the PLANT's timezone. What must hold:
 *
 *  - A night shift crossing midnight belongs to the day it STARTS: 03:00 on
 *    the 14th is the 13th's night shift. That is how plants report it, and a
 *    shift split across two "days" double-counts.
 *  - Times are wall-clock times in the plant's zone: 06:00 in Pune is 00:30
 *    UTC, and a browser elsewhere must not move the shift.
 *  - On a daylight-saving change the shift keeps its wall-clock times and its
 *    length changes: Berlin's night shift on 24–25 Oct 2026 is 9 hours.
 *  - A pattern with gaps (one day shift) has no shift in the gap, and "next"
 *    from a gap is the next one that exists.
 */
import { shiftAt, shiftWindow, nextShift, previousShift, type ShiftDef } from "../packages/core/src/shifts";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 16) + "Z";
const H = 3_600_000;

const three: ShiftDef[] = [
  { id: "A", start: "06:00", end: "14:00" },
  { id: "B", start: "14:00", end: "22:00" },
  { id: "C", start: "22:00", end: "06:00" },
];
const IST = "Asia/Kolkata";

console.log("\nshiftAt — Pune, three shifts");
t(shiftAt(Date.UTC(2026, 10, 13, 1, 30), three, IST), { id: "A", day: "2026-11-13" }, "07:00 IST is shift A of the 13th");
t(shiftAt(Date.UTC(2026, 10, 13, 21, 30), three, IST), { id: "C", day: "2026-11-13" }, "03:00 IST on the 14th belongs to the 13th's night shift");
t(shiftAt(Date.UTC(2026, 10, 13, 0, 30), three, IST), { id: "A", day: "2026-11-13" }, "exactly 06:00 IST starts shift A (start inclusive)");
t(shiftAt(Date.UTC(2026, 10, 13, 0, 29), three, IST), { id: "C", day: "2026-11-12" }, "a minute before is still the previous night");

console.log("\nshiftWindow — wall clock in the plant's zone");
const a = shiftWindow({ id: "A", day: "2026-11-13" }, three, IST);
t([iso(a!.start), iso(a!.end)], ["2026-11-13T00:30Z", "2026-11-13T08:30Z"], "A on the 13th: 06:00–14:00 IST");
const c = shiftWindow({ id: "C", day: "2026-11-13" }, three, IST);
t([iso(c!.start), iso(c!.end)], ["2026-11-13T16:30Z", "2026-11-14T00:30Z"], "C on the 13th ends on the 14th");
t(shiftWindow({ id: "Z", day: "2026-11-13" }, three, IST), null, "an unknown shift has no window");

console.log("\ndaylight saving — the shift keeps its wall clock, its length changes");
const BER = "Europe/Berlin";
const night = shiftWindow({ id: "C", day: "2026-10-24" }, three, BER)!;
t([iso(night.start), iso(night.end), (night.end - night.start) / H], ["2026-10-24T20:00Z", "2026-10-25T05:00Z", 9], "Berlin night shift across the clocks going back: 9 hours");
const spring = shiftWindow({ id: "C", day: "2026-03-28" }, three, BER)!;
t((spring.end - spring.start) / H, 7, "…and 7 hours across the clocks going forward");

console.log("\nnext / previous");
t(nextShift({ id: "A", day: "2026-11-13" }, three), { id: "B", day: "2026-11-13" }, "A → B, same day");
t(nextShift({ id: "C", day: "2026-11-13" }, three), { id: "A", day: "2026-11-14" }, "C → A of the next day");
t(previousShift({ id: "A", day: "2026-11-14" }, three), { id: "C", day: "2026-11-13" }, "A ← C of the day before");
t(previousShift({ id: "B", day: "2026-11-01" }, three), { id: "A", day: "2026-11-01" }, "B ← A");
t(nextShift({ id: "C", day: "2026-12-31" }, three), { id: "A", day: "2027-01-01" }, "across the year end");
t(previousShift({ id: "A", day: "2026-03-01" }, three), { id: "C", day: "2026-02-28" }, "across a month end");

console.log("\na pattern with gaps");
const dayOnly: ShiftDef[] = [{ id: "D", start: "08:00", end: "16:30" }];
t(shiftAt(Date.UTC(2026, 10, 13, 14, 0), dayOnly, IST), null, "19:30 IST is between shifts: no shift");
t(nextShift({ id: "D", day: "2026-11-13" }, dayOnly), { id: "D", day: "2026-11-14" }, "next of the only shift is tomorrow's");
t(shiftAt(Date.UTC(2026, 10, 13, 14, 0), dayOnly, IST, { orNext: true }), { id: "D", day: "2026-11-14" }, "orNext: from a gap, the next shift that exists");
t(shiftAt(Date.UTC(2026, 10, 13, 14, 0), dayOnly, IST, { orPrevious: true }), { id: "D", day: "2026-11-13" }, "orPrevious: the one that just ended");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
