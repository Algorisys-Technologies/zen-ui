import { DemoPage } from "./demo-helpers";

interface Appointment {
  id: string;
  start: Date;
  end: Date;
  title: string;
  subtitle?: string;
  state?: string;
}

interface Row {
  id: string;
  title: string;
  subtitle?: string;
  appointments: Appointment[];
}

type CalendarEl = HTMLElement & { rows: Row[]; now: Date; defaultDate: Date };

/* A fixed reference day, so the demo reads the same on any date and the probe
   has something to assert against. 2026-07-21 is a Tuesday. */
const NOW = new Date(2026, 6, 21, 11, 30, 0, 0);
const at = (day: number, h: number, m = 0) => new Date(2026, 6, day, h, m, 0, 0);

const TEAM: Row[] = [
  {
    id: "r1",
    title: "Rhea Iyer",
    subtitle: "Field engineer",
    appointments: [
      { id: "a1", start: at(20, 9), end: at(20, 12), title: "Site survey", state: "info" },
      { id: "a2", start: at(21, 10), end: at(21, 11, 30), title: "Install", subtitle: "Bay 4", state: "success" },
      { id: "a3", start: at(21, 11), end: at(21, 13), title: "Handover", state: "warning" },
      { id: "a4", start: at(23, 8), end: at(23, 17), title: "Training", state: "default" },
    ],
  },
  {
    id: "r2",
    title: "Arun Fernandes",
    subtitle: "Commissioning",
    appointments: [
      { id: "b1", start: at(20, 14), end: at(22, 11), title: "Rotterdam trip", state: "info" },
      { id: "b2", start: at(24, 9), end: at(24, 10), title: "Standup" },
      { id: "b3", start: at(24, 10), end: at(24, 11), title: "Review" },
      { id: "b4", start: at(24, 11), end: at(24, 12), title: "Retro" },
    ],
  },
  {
    id: "r3",
    title: "Bay 4",
    subtitle: "Workshop",
    appointments: [
      { id: "c1", start: at(21, 10), end: at(21, 11, 30), title: "Install", state: "success" },
      { id: "c2", start: at(25, 9), end: at(26, 18), title: "Maintenance window", state: "error" },
    ],
  },
];

const ONE_DAY: Row[] = [
  {
    id: "d1",
    title: "Rhea Iyer",
    appointments: [
      { id: "x1", start: at(21, 9), end: at(21, 10, 30), title: "Standup + triage", state: "info" },
      { id: "x2", start: at(21, 10), end: at(21, 12), title: "Install", state: "success" },
      { id: "x3", start: at(21, 10, 30), end: at(21, 11), title: "Call", state: "warning" },
      { id: "x4", start: at(21, 14), end: at(21, 14), title: "Cutover", state: "error" },
    ],
  },
  {
    id: "d2",
    title: "Arun Fernandes",
    appointments: [
      { id: "y1", start: at(20, 22), end: at(21, 6), title: "Night shift", state: "default" },
      { id: "y2", start: at(21, 13), end: at(22, 2), title: "Overnight cutover", state: "error" },
    ],
  },
];

/**
 * Build a <zen-planning-calendar>. Rows go on as a PROPERTY here because they
 * carry Date objects; the json attribute takes ISO strings, which the element
 * revives — section 1's snippet shows that form.
 */
function pc(rows: Row[], attrs: Record<string, string> = {}): CalendarEl {
  const el = document.createElement("zen-planning-calendar") as CalendarEl;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.rows = rows;
  el.now = NOW;
  el.defaultDate = NOW;
  return el;
}

/** Section 4: a live listener, so the section is not a dead control. */
function clickable(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-flex-col zen-gap-2";
  const out = document.createElement("p");
  out.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  out.setAttribute("aria-live", "polite");
  out.textContent = "Nothing picked yet";
  const cal = pc(TEAM);
  cal.addEventListener("zen-appointment-click", (e) => {
    // Two arguments, so the detail is the pair.
    const [appointment, row] = (e as CustomEvent<[Appointment, Row]>).detail;
    out.textContent = `${appointment.title} — ${row.title}`;
  });
  wrap.append(cal, out);
  return wrap;
}

export default function PlanningCalendarDemo(): HTMLElement {
  return DemoPage({
    title: "PlanningCalendar",
    description:
      "Who is busy, and when. One row per resource, one axis of time, appointments as blocks on it — the question it answers is a comparison across rows.",
    sections: [
      {
        title: "1. Resources down, time across",
        codeTitle: "A row is a person, a room or a machine",
        codeDescription:
          "Each row carries its own appointments, and every row shares one time axis, so 'who is free on Thursday' is a vertical read. The toolbar moves by one view at a time and Today returns to now. The current column is tinted, the weekend is shaded, and a red line marks the present moment — but only when the present is actually in view, because a line pinned to the left edge of next week reads as 'it is Monday morning'.",
        code: `<zen-planning-calendar rows='[
  { "id": "r1", "title": "Rhea Iyer", "subtitle": "Field engineer",
    "appointments": [
      { "id": "a2", "start": "2026-07-21T10:00", "end": "2026-07-21T11:30",
        "title": "Install", "subtitle": "Bay 4", "state": "success" }
    ] }
]'></zen-planning-calendar>

<!-- JSON has no date type, so the element revives ISO strings into Dates.
     Setting el.rows with real Dates works too and is the usual route. -->`,
        render: () => pc(TEAM),
      },
      {
        title: "2. Three views, one axis",
        codeTitle: "A month is 31 columns, not a 6×7 page",
        codeDescription:
          "Day is hours, week is days, month is days. The month is deliberately NOT a page grid: this is a resource-by-time chart, so wrapping it into weeks would give every resource six separate rows and destroy the comparison the component exists for. If you want a month page with one date per cell, that is Calendar. Pass views to offer fewer, or view + onViewChange to control it from your own toolbar.",
        code: `<zen-planning-calendar default-view="month"></zen-planning-calendar>
<zen-planning-calendar views='["day", "week"]'></zen-planning-calendar>

<script>
  el.setAttribute("view", "day");   // controlled: push the view back in
</script>`,
        render: () => pc(TEAM, { "default-view": "month" }),
      },
      {
        title: "3. Overlaps stack; edges are cut, not squared off",
        codeTitle: "The day view, where both actually show",
        codeDescription:
          "Appointments that overlap are assigned lanes and stack, using exactly as many lanes as the busiest instant needs — so a double-booking is visible rather than hidden behind whichever block drew last. Back-to-back is not overlap: 10:00–11:00 and 11:00–12:00 share a lane, or a normal day would become a staircase. An appointment that starts before the view or ends after it is clipped, and the cut edge loses its border and corner so it reads as continuing rather than ending there. A zero-length appointment still gets a clickable sliver, because a 0%-wide block is indistinguishable from data that failed to load.",
        code: `{ "id": "x2", "start": "2026-07-21T10:00",    "end": "2026-07-21T12:00" }  // overlaps x3
{ "id": "x3", "start": "2026-07-21T10:30",    "end": "2026-07-21T11:00" }  // -> lane 2
{ "id": "y1", "start": "2026-07-20T22:00",    "end": "2026-07-21T06:00" }  // clipped left
{ "id": "x4", "start": "2026-07-21T14:00",    "end": "2026-07-21T14:00" }  // a milestone`,
        render: () => pc(ONE_DAY, { "default-view": "day" }),
      },
      {
        title: "4. Clicking an appointment",
        codeTitle: "It renders the plan; it does not edit it",
        codeDescription:
          "There is no drag-to-move, no drag-to-create and no resize handle. Those need a conflict policy, an undo story and a permission model that belong to your domain, and a component that half-implements them is worse than one that clearly does not. onAppointmentClick hands you the appointment and its row, and you open your own editor. Every block is a real button whether or not you pass a handler, because they are the only things in the grid worth reaching by keyboard.",
        code: `el.addEventListener("zen-appointment-click", (e) => {
  const [appointment, row] = e.detail;   // one payload, so a pair
  openEditor(appointment, row);
});`,
        render: () => clickable(),
      },
      {
        title: "5. Empty",
        codeTitle: "emptyMessage",
        codeDescription:
          "No resources means there is nothing to compare, so the grid is not drawn at all — an empty axis with no rows under it reads as a component that failed to load.",
        code: `<zen-planning-calendar rows="[]" empty-message="No one is scheduled this week">
</zen-planning-calendar>`,
        render: () => pc([], { "empty-message": "No one is scheduled this week" }),
      },
    ],
  });
}
