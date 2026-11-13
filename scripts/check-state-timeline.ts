/**
 * State timeline contract.
 *
 *   bun run check:state-timeline
 *
 * The pure half of StateTimeline: a machine's state record laid out on a
 * window of time. What it must get right:
 *
 *  - Positions are true to duration. A 40-second stop in an 8-hour shift is
 *    0.14% of the strip, and stays 0.14% — rounding it away is how short stops
 *    vanish from the record nobody then investigates.
 *  - A hole in the record is drawn as "no data", never stretched over by its
 *    neighbours and never left blank. A collector that died for an hour must
 *    look like an hour of nothing known, not an hour of running.
 *  - The future is empty. An open segment (no end yet) runs to `now`, and
 *    nothing is drawn after `now` — not even "no data", because nobody expects
 *    data from the future.
 *  - Overlapping records (bad data, but it happens) do not draw on top of each
 *    other: the later start cuts the earlier segment short.
 *  - The axis lands on round times in the PLANT's timezone. India is UTC+5:30,
 *    so "on the hour" there is half past in UTC; a browser-local or UTC axis
 *    labels a shift in the wrong hours for the people working it.
 */
import {
  layoutStateTimeline,
  stateTimelineTotals,
  layoutTimelineEvents,
  timelineTicks,
  durationMessage,
} from "../packages/core/src/state-timeline";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const H = 3_600_000;
const M = 60_000;
const S = 1_000;
const T0 = Date.UTC(2026, 10, 13, 6, 0, 0); // 06:00 UTC
const win = { from: T0, to: T0 + 8 * H, now: T0 + 8 * H };
const brief = (l: ReturnType<typeof layoutStateTimeline>) =>
  l.map((s) => `${s.state}${s.gap ? "(gap)" : ""}${s.open ? "(open)" : ""}:${(s.start - T0) / M}-${(s.end - T0) / M}`);

console.log("\nlayout — positions true to duration");
const basic = layoutStateTimeline(
  [
    { state: "running", start: T0, end: T0 + 4 * H },
    { state: "stopped", start: T0 + 4 * H, end: T0 + 4 * H + 40 * S },
    { state: "running", start: T0 + 4 * H + 40 * S, end: T0 + 8 * H },
  ],
  win,
);
t(basic.map((s) => s.state), ["running", "stopped", "running"], "three segments, in order");
t(basic[1].left, 0.5, "the stop starts half way");
t(Math.round(basic[1].width * 1e6) / 1e6, Math.round(((40 * S) / (8 * H)) * 1e6) / 1e6, "a 40 s stop keeps its exact share (0.139%)");
t(basic[1].durationMs, 40 * S, "and its duration");
t(basic.reduce((n, s) => n + s.width, 0), 1, "widths sum to the whole window");

console.log("\nlayout — holes are no data, the future is empty");
const holey = layoutStateTimeline(
  [
    { state: "running", start: T0 + 1 * H, end: T0 + 2 * H },
    { state: "setup", start: T0 + 3 * H, end: null },
  ],
  { from: T0, to: T0 + 8 * H, now: T0 + 5 * H },
);
t(brief(holey), ["unknown(gap):0-60", "running:60-120", "unknown(gap):120-180", "setup(open):180-300"], "leading and middle holes filled; open segment ends at now");
t(holey.at(-1)?.end, T0 + 5 * H, "nothing is drawn after now");
t(Math.round(holey.reduce((n, s) => n + s.width, 0) * 1000) / 1000, 0.625, "so the strip is 5/8 drawn");

console.log("\nlayout — clipping and bad data");
const clipped = layoutStateTimeline(
  [
    { state: "running", start: T0 - 2 * H, end: T0 + 1 * H },
    { state: "fault", start: T0 + 7 * H, end: T0 + 10 * H },
  ],
  win,
);
t(brief(clipped), ["running:0-60", "unknown(gap):60-420", "fault:420-480"], "segments clipped to the window at both ends");
const overlap = layoutStateTimeline(
  [
    { state: "running", start: T0, end: T0 + 3 * H },
    { state: "stopped", start: T0 + 2 * H, end: T0 + 8 * H },
  ],
  win,
);
t(brief(overlap), ["running:0-120", "stopped:120-480"], "an overlap: the later start cuts the earlier one short");
const unsorted = layoutStateTimeline(
  [
    { state: "idle", start: T0 + 4 * H, end: T0 + 8 * H },
    { state: "running", start: T0, end: T0 + 4 * H },
  ],
  win,
);
t(brief(unsorted), ["running:0-240", "idle:240-480"], "input order does not matter");
t(
  brief(layoutStateTimeline([{ state: "running", start: T0, end: null }, { state: "stopped", start: T0 + H, end: T0 + 2 * H }], win)),
  ["running:0-60", "stopped:60-120", "unknown(gap):120-480"],
  "an open segment cut short by a later record is no longer open",
);
t(layoutStateTimeline([], win).map((s) => s.state), ["unknown"], "no record at all is one no-data stretch");
t(layoutStateTimeline([{ state: "running", start: T0, end: T0 }], win).map((s) => s.state), ["unknown"], "a zero-length segment draws nothing");
t(
  layoutStateTimeline([{ state: "running", start: T0, end: T0 + H, id: "r1" }], win)[0].id,
  "r1",
  "a caller's id survives, so a click can be traced back",
);

console.log("\ntotals");
t(
  stateTimelineTotals(basic),
  [
    { state: "running", ms: 8 * H - 40 * S },
    { state: "stopped", ms: 40 * S },
  ],
  "summed per state, in vocabulary order, zeros left out",
);
t(stateTimelineTotals(holey).map((x) => x.state), ["running", "setup", "unknown"], "no-data time is totalled too");

console.log("\nevents");
const ev = layoutTimelineEvents(
  [
    { id: "b", at: T0 + 6 * H, label: "QC sign-off" },
    { id: "a", at: T0 + 2 * H, label: "Batch 2 started" },
    { id: "out", at: T0 + 9 * H, label: "Outside" },
  ],
  win,
);
t(ev.map((e) => [e.id, e.left]), [["a", 0.25], ["b", 0.75]], "in the window, in time order, placed by fraction");

console.log("\nticks — round times in the plant's timezone");
const utcTicks = timelineTicks(T0, T0 + 8 * H, { timeZone: "UTC" });
t(utcTicks.stepMs, H, "an 8-hour shift gets hourly ticks");
t(utcTicks.ticks.map((x) => new Date(x.at).toISOString().slice(11, 16)), ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"], "on the hour in UTC, both ends included");
const ist = timelineTicks(T0, T0 + 8 * H, { timeZone: "Asia/Kolkata" });
t(ist.ticks[0].at - T0, 30 * M, "IST is UTC+5:30: its first full hour is 30 min into a UTC-hour window");
t(ist.ticks.map((x) => new Date(x.at).toISOString().slice(11, 16)).slice(0, 2), ["06:30", "07:30"], "so the ticks sit at half past in UTC");
t(timelineTicks(T0, T0 + 24 * H, { timeZone: "UTC" }).stepMs, 3 * H, "a day gets 3-hour ticks");
t(timelineTicks(T0, T0 + H, { timeZone: "UTC" }).stepMs, 10 * M, "an hour gets 10-minute ticks");
t(timelineTicks(T0, T0 + 8 * H, { timeZone: "UTC", maxTicks: 4 }).stepMs, 2 * H, "fewer ticks wanted, a longer step");
t(timelineTicks(T0, T0 + 8 * H, { timeZone: "UTC" }).ticks[4].left, 0.5, "each tick knows its position");

console.log("\ndurations — which message, with what values");
t(durationMessage(42 * S), { key: "stateTimeline.durationSeconds", values: { s: 42 } }, "under a minute: seconds");
t(durationMessage(5 * M + 10 * S), { key: "stateTimeline.durationMinutes", values: { m: 5, s: 10 } }, "under an hour: minutes and seconds");
t(durationMessage(H + 12 * M + 59 * S), { key: "stateTimeline.durationHours", values: { h: 1, m: 12 } }, "an hour or more: hours and minutes, seconds dropped");
t(durationMessage(25 * M), { key: "stateTimeline.durationMinutesOnly", values: { m: 25 } }, "a whole number of minutes: no '0s' tail");
t(durationMessage(4 * H + 20 * S), { key: "stateTimeline.durationHoursOnly", values: { h: 4 } }, "a whole number of hours: no '0m' tail");
t(durationMessage(400), { key: "stateTimeline.durationSeconds", values: { s: 0 } }, "under a second is 0 s, not hidden");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
