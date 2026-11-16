/**
 * Component density contract.
 *
 *   bun run check:density
 *
 * The opt-in `density` prop on the schedules, PlanningCalendar,
 * SpreadsheetGrid and Tree. Two rules carry it:
 *
 *  - "comfortable" is the default and is EXACTLY the size each component
 *    always drew, so an app that sets nothing sees nothing move;
 *  - "touch" reaches the 48px targets data-density="touch" gives controls
 *    (the row, the lane block); a bar inside a row stays clear of WCAG
 *    2.5.8's 24px minimum.
 *
 * An explicit size (rowHeight, laneHeight) wins over density.
 */
import { calendarLanePx, DENSITIES, ganttBarPx, laneBarPx, scheduleRowPx } from "../packages/core/src/density";

let f = 0;
let n = 0;
const t = (got: unknown, want: unknown, name: string) => {
  n++;
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(66)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

console.log("comfortable is today's sizes (and the default)");
t([scheduleRowPx(), ganttBarPx(), laneBarPx(), calendarLanePx()], [36, 18, 16, 30], "no density: row 36, Gantt bar 18, lane bar 16, calendar lane 30");
t([scheduleRowPx("comfortable"), ganttBarPx("comfortable"), laneBarPx("comfortable"), calendarLanePx("comfortable")], [36, 18, 16, 30], "comfortable: the same");

console.log("\ntouch reaches 48px targets");
t(scheduleRowPx("touch"), 48, "a schedule row is 48");
t(calendarLanePx("touch") - 6, 48, "a calendar block (lane − 6) is 48");
t(ganttBarPx("touch") >= 24 && laneBarPx("touch") >= 24, true, "bars clear WCAG 2.5.8's 24px");
t(ganttBarPx("touch") <= scheduleRowPx("touch") - 8, true, "a Gantt bar still fits its row with room");

console.log("\ncompact is smaller, never unreadable");
t(scheduleRowPx("compact") < 36 && calendarLanePx("compact") < 30, true, "compact rows and lanes are shorter");
t(ganttBarPx("compact") <= scheduleRowPx("compact") - 8, true, "a compact bar still fits its row");
t(calendarLanePx("compact") - 6 >= 14, true, "a compact calendar block keeps a line of text");

console.log("\nan explicit size wins");
t(scheduleRowPx("touch", 40), 40, "rowHeight over density");
t(calendarLanePx("compact", 44), 44, "laneHeight over density");
t([...DENSITIES], ["compact", "comfortable", "touch"], "the three densities, in order");

console.log(f ? `\n${f} of ${n} FAILED` : `\nall ${n} passed`);
process.exit(f || n === 0 ? 1 : 0);
