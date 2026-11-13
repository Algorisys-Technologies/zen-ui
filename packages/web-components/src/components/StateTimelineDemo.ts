import {
  durationMessage,
  useLocale,
  type StateSegment,
  type StateSegmentInput,
} from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Every strip below is a <zen-state-timeline>, bound the way a framework
 * template binds one: PROPERTIES for the segment records (which already hold
 * epoch numbers — nothing to gain from serialising them to ISO and parsing them
 * back), attributes for the plain strings. The markup in the code examples is
 * the hand-written form, where the json attribute and ISO strings are revived.
 */
type TimelineEl = HTMLElement & Record<string, unknown>;

const timeline = (props: Record<string, unknown>): TimelineEl => {
  const el = document.createElement("zen-state-timeline") as TimelineEl;
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

// A fixed clock, so the demo draws the same every time: a 06:00–14:00 shift
// (UTC) seen at 12:30, with the last segment still going.
const H = 3_600_000;
const M = 60_000;
const S = 1_000;
const FROM = Date.UTC(2026, 10, 13, 6, 0);
const TO = FROM + 8 * H;
const NOW = FROM + 6.5 * H;
const at = (h: number, m = 0, s = 0) => FROM + h * H + m * M + s * S;

const press4: StateSegmentInput[] = [
  { id: "p1", state: "setup", start: at(0), end: at(0, 25), label: "Changeover to SKU 4471" },
  { id: "p2", state: "running", start: at(0, 25), end: at(1, 52) },
  { id: "p3", state: "stopped", start: at(1, 52), end: at(1, 52, 40) },
  { id: "p4", state: "running", start: at(1, 52, 40), end: at(2, 40) },
  { id: "p5", state: "fault", start: at(2, 40), end: at(3, 5), label: "Hydraulic pressure low" },
  { id: "p6", state: "running", start: at(3, 5), end: at(4, 10) },
  // 04:10–04:45: the collector dropped out — a hole, drawn as no data.
  { id: "p7", state: "running", start: at(4, 45), end: at(5, 30) },
  { id: "p8", state: "waiting", start: at(5, 30), end: at(5, 48), label: "Starved: no blanks" },
  { id: "p9", state: "running", start: at(5, 48), end: null },
];

const events = [
  { id: "e1", at: at(0, 25), label: "Batch 1 started" },
  { id: "e2", at: at(3, 30), label: "QC sign-off, batch 1" },
  { id: "e3", at: at(5, 50), label: "Batch 2 started" },
];

const line: { name: string; segments: StateSegmentInput[] }[] = [
  { name: "Press 4", segments: press4 },
  {
    name: "Press 5",
    segments: [
      { state: "running", start: at(0), end: at(3, 20) },
      { state: "maintenance", start: at(3, 20), end: at(4, 50), label: "PM: spindle bearings" },
      { state: "running", start: at(4, 50), end: null },
    ],
  },
  {
    name: "Trim 1",
    segments: [
      { state: "idle", start: at(0), end: at(1, 10) },
      { state: "running", start: at(1, 10), end: at(2, 0) },
      { state: "stopped", start: at(2, 0), end: at(2, 1, 30) },
      { state: "running", start: at(2, 1, 30), end: at(2, 50) },
      { state: "stopped", start: at(2, 50), end: at(2, 52) },
      { state: "running", start: at(2, 52), end: at(6, 0) },
      { state: "cleaning", start: at(6, 0), end: null },
    ],
  },
  { name: "Weld 2", segments: [{ state: "running", start: at(0), end: at(1, 30) }] },
];

/** The two-column grid the stacked sections share: a name, then its strip. */
function rows(): HTMLDivElement {
  const grid = document.createElement("div");
  grid.className = "zen-grid zen-w-full zen-items-center zen-gap-x-3 zen-gap-y-2";
  grid.style.gridTemplateColumns = "auto 1fr";
  return grid;
}

/** zen-w-20 is the 5rem name column the other bindings' demos give the grid. */
function rowName(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "zen-w-20 zen-self-start zen-text-sm zen-font-medium";
  span.textContent = text;
  return span;
}

export default function StateTimelineDemo(): HTMLElement {
  const loc = useLocale();
  const duration = (ms: number) => {
    const d = durationMessage(ms);
    return loc.t(d.key, d.values);
  };

  return DemoPage({
    title: "StateTimeline",
    description:
      "One machine's states along a window of time. Every stretch is exactly as wide as its duration, so a 40-second stop stays visible as the sliver it is. A hole in the record is hatched as no data rather than absorbed by its neighbours, and nothing is drawn after now.",
    sections: [
      {
        title: "1. A shift so far",
        codeTitle: "segments, a window, and events",
        codeDescription:
          "Seen at 12:30. The last segment has no `end`, so it runs to now. Between 10:10 and 10:45 the collector sent nothing: that is hatched. The 40-second stop at 07:52 is drawn at its true width, with a 2px floor so it cannot vanish. Hover a stretch for its times.",
        code: `<zen-state-timeline
  label="Press 4"
  from="2026-11-13T06:00:00Z" to="2026-11-13T14:00:00Z"
  time-zone="UTC"
  segments='[
    { "state": "setup", "start": "…", "end": "…", "label": "Changeover to SKU 4471" },
    { "state": "running", "start": "…", "end": "…" },
    { "state": "stopped", "start": "…", "end": "…" },
    …
    { "state": "running", "start": "…", "end": null }
  ]'
  events='[{ "id": "e1", "at": "…", "label": "Batch 1 started" }, …]'
></zen-state-timeline>`,
        render: () =>
          timeline({ label: "Press 4", from: FROM, to: TO, now: NOW, segments: press4, events, timeZone: "UTC" }),
      },
      {
        title: "2. Saying why a machine stopped",
        codeTitle: "zen-segment-click turns stretches into buttons; isSegmentClickable picks which",
        codeDescription:
          "Only the stops can be clicked here — time that went well has nothing to decide. The strip is one tab stop: arrow keys walk the stops, Home and End jump to the ends, Enter opens one.",
        code: `const timeline = document.querySelector("zen-state-timeline");
timeline.segments = record;
timeline.isSegmentClickable = (s) => s.tone === "down";
timeline.addEventListener("zen-segment-click", (e) => {
  timeline.setAttribute("selected-id", e.detail.id);
  showCause(e.detail);
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-3";

          const readout = document.createElement("p");
          readout.className = "zen-m-0 zen-flex zen-min-h-7 zen-items-center zen-gap-2 zen-text-sm";
          readout.setAttribute("aria-live", "polite");
          const empty = document.createElement("span");
          empty.className = "zen-text-zen-muted-fg";
          empty.textContent = "Pick a stop to classify it.";
          readout.append(empty);

          const show = (picked: StateSegment) => {
            const pill = document.createElement("zen-state-pill");
            pill.setAttribute("state", picked.state);
            // Empty when the stretch has no cause: the pill then names the state.
            if (picked.label) pill.textContent = picked.label;
            const time = document.createElement("span");
            time.className = "zen-tabular-nums";
            time.textContent = duration(picked.durationMs);
            readout.replaceChildren(pill, time);
          };

          const strip = timeline({
            label: "Press 4",
            from: FROM,
            to: TO,
            now: NOW,
            segments: press4,
            timeZone: "UTC",
            isSegmentClickable: (s: StateSegment) => s.tone === "down",
          });
          strip.addEventListener("zen-segment-click", (e) => {
            const picked = (e as CustomEvent<StateSegment>).detail;
            if (picked.id) strip.setAttribute("selected-id", picked.id);
            show(picked);
          });
          wrap.append(strip, readout);
          return wrap;
        },
      },
      {
        title: "3. A line, machine by machine",
        codeTitle: "stack them on the same window; size sm, one axis",
        codeDescription:
          "The same `from` and `to` line every row up, so the eye can run down a moment in time. Weld 2's record stops at 07:30: everything after is no data, which is the row to go and look at.",
        code: `<zen-state-timeline label="Press 4" size="sm" hide-axis from="…" to="…" segments='[…]'></zen-state-timeline>
<zen-state-timeline label="Press 5" size="sm" hide-axis from="…" to="…" segments='[…]'></zen-state-timeline>
<zen-state-timeline label="Trim 1"  size="sm" hide-axis from="…" to="…" segments='[…]'></zen-state-timeline>
<!-- only the last row draws the axis -->
<zen-state-timeline label="Weld 2"  size="sm" from="…" to="…" segments='[…]'></zen-state-timeline>`,
        render: () => {
          const grid = rows();
          line.forEach((m, i) => {
            grid.append(
              rowName(m.name),
              timeline({
                label: m.name,
                size: "sm",
                hideAxis: i < line.length - 1,
                from: FROM,
                to: TO,
                now: NOW,
                segments: m.segments,
                timeZone: "UTC",
              }),
            );
          });
          return grid;
        },
      },
      {
        title: "4. The plant's timezone",
        codeTitle: "time-zone places the ticks on round times where the machine is",
        codeDescription:
          "The same shift read in India (UTC+5:30) and in Berlin. Ticks land on the hour in each zone, so in India they sit at half past UTC. An axis in the browser's zone would label a shift in the wrong hours for the people working it.",
        code: `<zen-state-timeline time-zone="Asia/Kolkata" …></zen-state-timeline>
<zen-state-timeline time-zone="Europe/Berlin" …></zen-state-timeline>`,
        render: () => {
          const grid = rows();
          grid.append(
            rowName("Pune"),
            timeline({
              label: "Press 4, Pune time",
              from: FROM,
              to: TO,
              now: NOW,
              segments: press4,
              timeZone: "Asia/Kolkata",
              size: "sm",
            }),
            rowName("Berlin"),
            timeline({
              label: "Press 4, Berlin time",
              from: FROM,
              to: TO,
              now: NOW,
              segments: press4,
              timeZone: "Europe/Berlin",
              size: "sm",
            }),
          );
          return grid;
        },
      },
    ],
  });
}
