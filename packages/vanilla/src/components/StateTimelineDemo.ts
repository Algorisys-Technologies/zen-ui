import { StateTimeline } from "./state-timeline/state-timeline";
import { StatePill } from "./state-pill/state-pill";
import { durationMessage, type StateSegment, type StateSegmentInput } from "@algorisys/zen-ui-core/state-timeline";
import { useLocale } from "./locale/locale";
import { DemoPage } from "./demo-helpers";

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
  grid.style.display = "grid";
  grid.style.gridTemplateColumns = "5rem 1fr";
  grid.style.gap = "8px 12px";
  grid.style.alignItems = "center";
  grid.style.width = "100%";
  return grid;
}

function rowName(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "zen-self-start zen-text-sm zen-font-medium";
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
        code: `StateTimeline({
  label: "Press 4",
  from: shiftStart, to: shiftEnd, now,
  segments: [
    { state: "setup", start, end, label: "Changeover to SKU 4471" },
    { state: "running", start, end },
    { state: "stopped", start, end },          // 40 s
    …
    { state: "running", start, end: null },     // still going
  ],
  events: [{ id: "e1", at, label: "Batch 1 started" }, …],
  timeZone: "UTC",
}).el`,
        render: () =>
          StateTimeline({ label: "Press 4", from: FROM, to: TO, now: NOW, segments: press4, events, timeZone: "UTC" }).el,
      },
      {
        title: "2. Saying why a machine stopped",
        codeTitle: "onSegmentClick turns stretches into buttons; isSegmentClickable picks which",
        codeDescription:
          "Only the stops can be clicked here — time that went well has nothing to decide. The strip is one tab stop: arrow keys walk the stops, Home and End jump to the ends, Enter opens one.",
        code: `const timeline = StateTimeline({
  label: "Press 4", from, to, segments: record,
  isSegmentClickable: (s) => s.tone === "down",
  onSegmentClick: (s) => {
    timeline.update({ selectedId: s.id });
    showCause(s);
  },
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

          let pill: ReturnType<typeof StatePill> | undefined;
          const show = (picked: StateSegment) => {
            pill?.destroy();
            pill = StatePill({ state: picked.state, children: picked.label });
            const time = document.createElement("span");
            time.className = "zen-tabular-nums";
            time.textContent = duration(picked.durationMs);
            readout.replaceChildren(pill.el, time);
          };

          const timeline = StateTimeline({
            label: "Press 4",
            from: FROM,
            to: TO,
            now: NOW,
            segments: press4,
            timeZone: "UTC",
            isSegmentClickable: (s) => s.tone === "down",
            onSegmentClick: (s) => {
              timeline.update({ selectedId: s.id });
              show(s);
            },
          });
          wrap.append(timeline.el, readout);
          return wrap;
        },
      },
      {
        title: "3. A line, machine by machine",
        codeTitle: "stack them on the same window; size sm, one axis",
        codeDescription:
          "The same `from` and `to` line every row up, so the eye can run down a moment in time. Weld 2's record stops at 07:30: everything after is no data, which is the row to go and look at.",
        code: `for (const [i, m] of machines.entries()) {
  grid.append(StateTimeline({
    label: m.name, size: "sm",
    hideAxis: i < machines.length - 1,
    from, to, segments: m.segments,
  }).el);
}`,
        render: () => {
          const grid = rows();
          line.forEach((m, i) => {
            grid.append(
              rowName(m.name),
              StateTimeline({
                label: m.name,
                size: "sm",
                hideAxis: i < line.length - 1,
                from: FROM,
                to: TO,
                now: NOW,
                segments: m.segments,
                timeZone: "UTC",
              }).el,
            );
          });
          return grid;
        },
      },
      {
        title: "4. The plant's timezone",
        codeTitle: "timeZone places the ticks on round times where the machine is",
        codeDescription:
          "The same shift read in India (UTC+5:30) and in Berlin. Ticks land on the hour in each zone, so in India they sit at half past UTC. An axis in the browser's zone would label a shift in the wrong hours for the people working it.",
        code: `StateTimeline({ timeZone: "Asia/Kolkata", … }).el
StateTimeline({ timeZone: "Europe/Berlin", … }).el`,
        render: () => {
          const grid = rows();
          grid.append(
            rowName("Pune"),
            StateTimeline({
              label: "Press 4, Pune time",
              from: FROM,
              to: TO,
              now: NOW,
              segments: press4,
              timeZone: "Asia/Kolkata",
              size: "sm",
            }).el,
            rowName("Berlin"),
            StateTimeline({
              label: "Press 4, Berlin time",
              from: FROM,
              to: TO,
              now: NOW,
              segments: press4,
              timeZone: "Europe/Berlin",
              size: "sm",
            }).el,
          );
          return grid;
        },
      },
    ],
  });
}
