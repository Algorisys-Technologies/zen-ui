import type { ShiftDef, ShiftRef } from "@algorisys/zen-ui-core/shifts";
import { ShiftNavigator } from "./shift-navigator/shift-navigator";
import { DemoPage } from "./demo-helpers";

const three: ShiftDef[] = [
  { id: "A", start: "06:00", end: "14:00", label: "Morning" },
  { id: "B", start: "14:00", end: "22:00", label: "Afternoon" },
  { id: "C", start: "22:00", end: "06:00", label: "Night" },
];
// A pinned clock: 13 Nov 2026, 03:00 in Pune — inside the 12th's night shift.
const NOW = Date.UTC(2026, 10, 12, 21, 30);

/** 1. Controlled, with what onChange reported printed under it. */
function pune(): Node {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-3";
  const out = document.createElement("p");
  out.className = "zen-m-0 zen-text-sm zen-tabular-nums";
  out.dataset.testid = "pune-out";
  out.textContent = "onChange: —";

  let shift: ShiftRef | undefined;
  const nav = ShiftNavigator({
    shifts: three,
    timeZone: "Asia/Kolkata",
    now: NOW,
    value: shift,
    onChange: (ref, w) => {
      shift = ref;
      nav.update({ value: ref });
      out.textContent =
        "onChange: " + ref.id + " on " + ref.day + " · " + new Date(w.start).toISOString() + " → " + new Date(w.end).toISOString();
    },
    "data-testid": "pune",
  });
  wrap.append(nav.el, out);
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
        codeTitle: "shifts, timeZone, value / onChange",
        codeDescription: `The clock is pinned at 03:00 on the 13th, which is the 12th's night shift: a night shift belongs to the day it starts. Next is disabled at the current shift — later shifts have no data yet. Go back and "Current shift" returns.`,
        code: `const nav = ShiftNavigator({
  shifts: [
    { id: "A", start: "06:00", end: "14:00", label: "Morning" },
    { id: "B", start: "14:00", end: "22:00", label: "Afternoon" },
    { id: "C", start: "22:00", end: "06:00", label: "Night" },
  ],
  timeZone: "Asia/Kolkata",
  value: shift,
  onChange: (ref, window) => {
    shift = ref;
    nav.update({ value: ref });
  },
});`,
        render: pune,
      },
      {
        title: "2. Planning ahead",
        codeTitle: "allowFuture lets next go past now",
        code: `ShiftNavigator({ shifts, timeZone: "Asia/Kolkata", allowFuture: true }).el`,
        render: () =>
          ShiftNavigator({ shifts: three, timeZone: "Asia/Kolkata", now: NOW, allowFuture: true, "data-testid": "future" }).el,
      },
      {
        title: "3. The clocks going back",
        codeTitle: "a shift keeps its wall-clock times; its length changes",
        codeDescription:
          "Berlin's night shift starting 24 October 2026 runs 22:00 to 06:00 — nine hours, because the clocks go back at 03:00.",
        code: `ShiftNavigator({ shifts, timeZone: "Europe/Berlin", defaultValue: { id: "C", day: "2026-10-24" } }).el`,
        render: () =>
          ShiftNavigator({
            shifts: three,
            timeZone: "Europe/Berlin",
            now: Date.UTC(2026, 10, 1),
            defaultValue: { id: "C", day: "2026-10-24" },
            "data-testid": "berlin",
          }).el,
      },
    ],
  });
}
