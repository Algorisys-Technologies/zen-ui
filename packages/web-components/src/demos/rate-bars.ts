import type { CountPoint } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * A <zen-rate-bars>, bound with PROPERTIES for the readings and the state record
 * (epoch numbers already) and attributes for the plain values. The code example
 * is the hand-written markup, where the json attributes carry ISO strings and
 * the element revives them.
 */
type RateBarsEl = HTMLElement & Record<string, unknown>;

// The last hour on Press 4, seen at 10:30 IST: about 300 an hour, a slow
// stretch, a 6-minute stop, and the current bucket half full.
const M = 60_000;
const TO = Date.UTC(2026, 10, 13, 5, 0);
const FROM = TO - 60 * M;
const NOW = TO - M;
const perMinute = (m: number) => (m >= 22 && m < 28 ? 0 : m >= 36 && m < 44 ? 3 : 5);
const readings: CountPoint[] = [];
for (let m = 0, v = 0; m <= 59; m++) {
  readings.push({ at: FROM + m * M, value: v });
  v += perMinute(m);
}
const segments = [
  { state: "running" as const, start: FROM, end: FROM + 22 * M },
  { state: "stopped" as const, start: FROM + 22 * M, end: FROM + 28 * M },
  { state: "running" as const, start: FROM + 28 * M, end: null },
];

export default function RateBarsDemo(): HTMLElement {
  return DemoPage({
    title: "RateBars",
    description:
      "Output in equal time buckets, each bar coloured by what the machine was doing. A dip reads at a glance: a short green bar ran slow, a red stub stopped.",
    sections: [
      {
        title: "1. The last hour",
        codeTitle: "counter readings, the state record, a bucket width and a target",
        codeDescription:
          "Two-minute buckets. The stop at 09:52 is a red stub — a bucket that made nothing still says why. The slow stretch after 10:06 is short green bars under the dashed target. The last bar is still filling, so it is hatched and its rate is over the minute elapsed, not the whole bucket.",
        code: `<zen-rate-bars
  readings='[{ "at": "2026-11-13T04:00:00Z", "value": 0 }, …]'
  segments='[{ "state": "running", "start": "…", "end": "…" }, …]'
  from="2026-11-13T04:00:00Z" to="2026-11-13T05:00:00Z"
  bucket-ms="120000" target="300" unit="pcs" time-zone="Asia/Kolkata"
></zen-rate-bars>`,
        render: () => {
          const el = document.createElement("zen-rate-bars") as RateBarsEl;
          el.setAttribute("data-testid", "hour");
          Object.assign(el, {
            readings,
            segments,
            from: FROM,
            to: TO,
            now: NOW,
            target: 300,
            unit: "pcs",
            timeZone: "Asia/Kolkata",
          });
          return el;
        },
      },
    ],
  });
}
