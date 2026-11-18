import type { ShiftDef, ShiftRef } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Every navigator below is a <zen-shift-navigator>, bound with PROPERTIES for
 * the shift list, the controlled value and the pinned clock, and attributes for
 * the plain values. The code examples are the hand-written markup: `shifts` is
 * a json attribute, and its times are wall-clock strings the element leaves as
 * they are.
 */
type NavEl = HTMLElement & Record<string, unknown>;

const shiftNav = (testid: string, props: Record<string, unknown>): NavEl => {
  const el = document.createElement("zen-shift-navigator") as NavEl;
  el.setAttribute("data-testid", testid);
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};

const three: ShiftDef[] = [
  { id: "A", start: "06:00", end: "14:00", label: "Morning" },
  { id: "B", start: "14:00", end: "22:00", label: "Afternoon" },
  { id: "C", start: "22:00", end: "06:00", label: "Night" },
];
// A pinned clock: 13 Nov 2026, 03:00 in Pune — inside the 12th's night shift.
const NOW = Date.UTC(2026, 10, 12, 21, 30);

/** 1. Controlled, with what zen-change reported printed under it. */
function pune(): Node {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-3";
  const out = document.createElement("p");
  out.className = "zen-m-0 zen-text-sm zen-tabular-nums";
  out.dataset.testid = "pune-out";
  out.textContent = "onChange: —";

  const nav = shiftNav("pune", { shifts: three, timeZone: "Asia/Kolkata", now: NOW });
  nav.addEventListener("zen-change", (e) => {
    const [ref, w] = (e as CustomEvent<[ShiftRef, { start: number; end: number }]>).detail;
    nav.value = ref;
    out.textContent =
      "onChange: " + ref.id + " on " + ref.day + " · " + new Date(w.start).toISOString() + " → " + new Date(w.end).toISOString();
  });
  wrap.append(nav, out);
  return wrap;
}

export default function ShiftNavigatorDemo(): HTMLElement {
  return DemoPage({
    title: "ShiftNavigator",
    description:
      "Step through a plant's shifts — previous, next, back to now — in the plant's own timezone. Every shift report, board and chart is read one shift at a time, and this is the control that picks it.",
    sections: [
      {
        title: "1. Three shifts in Pune",
        codeTitle: "shifts, time-zone, value / zen-change",
        codeDescription: `The clock is pinned at 03:00 on the 13th, which is the 12th's night shift: a night shift belongs to the day it starts. Next is disabled at the current shift — later shifts have no data yet. Go back and "Current shift" returns.`,
        code: `<zen-shift-navigator time-zone="Asia/Kolkata" shifts='[
  { "id": "A", "start": "06:00", "end": "14:00", "label": "Morning" },
  { "id": "B", "start": "14:00", "end": "22:00", "label": "Afternoon" },
  { "id": "C", "start": "22:00", "end": "06:00", "label": "Night" }
]'></zen-shift-navigator>

nav.addEventListener("zen-change", (e) => {
  const [ref, window] = e.detail;
  nav.value = ref;
});`,
        render: pune,
      },
      {
        title: "2. Planning ahead",
        codeTitle: "allow-future lets next go past now",
        code: `<zen-shift-navigator shifts='[…]' time-zone="Asia/Kolkata" allow-future></zen-shift-navigator>`,
        render: () => shiftNav("future", { shifts: three, timeZone: "Asia/Kolkata", now: NOW, allowFuture: true }),
      },
      {
        title: "3. The clocks going back",
        codeTitle: "a shift keeps its wall-clock times; its length changes",
        codeDescription:
          "Berlin's night shift starting 24 October 2026 runs 22:00 to 06:00 — nine hours, because the clocks go back at 03:00.",
        code: `<zen-shift-navigator shifts='[…]' time-zone="Europe/Berlin"
  default-value='{ "id": "C", "day": "2026-10-24" }'></zen-shift-navigator>`,
        render: () =>
          shiftNav("berlin", {
            shifts: three,
            timeZone: "Europe/Berlin",
            now: Date.UTC(2026, 10, 1),
            defaultValue: { id: "C", day: "2026-10-24" },
          }),
      },
    ],
  });
}
