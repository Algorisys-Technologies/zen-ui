import { createSignal, For, type JSX } from "solid-js";
import { Gantt, type GanttTask } from "../components/gantt/gantt";
import type { GanttCalendar, GanttDependency, GanttDependencyStyle } from "@algorisys/zen-ui-core";
import { DemoPage, DemoSection } from "./demo-helpers";


/* A fixed reference day, so the demo reads the same on any date and a probe has
   something to assert against. 2026-07-21 is a Tuesday. */
const NOW = new Date(2026, 6, 21, 11, 30, 0, 0);
const at = (day: number) => new Date(2026, 6, day, 0, 0, 0, 0);

const RHEA = { id: "u1", name: "Rhea Iyer" };
const ARUN = { id: "u2", name: "Arun Fernandes" };
const MEI = { id: "u3", name: "Mei Tanaka" };
const OLU = { id: "u4", name: "Olu Adeyemi" };
const SVEN = { id: "u5", name: "Sven Holm" };

const PLAN: GanttTask[] = [
  {
    id: "p1",
    name: "Discovery",
    assignees: [RHEA, ARUN],
    children: [
      { id: "t1", name: "Kickoff", start: at(1), end: at(3), percentComplete: 100, assignees: [RHEA] },
      {
        id: "t2",
        name: "Field research",
        subtitle: "3 sites",
        start: at(3),
        end: at(10),
        percentComplete: 100,
        baselineEnd: at(8),
        assignees: [RHEA, ARUN, MEI],
      },
      { id: "t3", name: "Requirements", start: at(8), end: at(14), percentComplete: 100, assignees: [ARUN] },
    ],
  },
  {
    id: "p2",
    /* No dates of its own: the bar is rolled up from the children, and so is
       the percentage. */
    name: "Build",
    assignees: [MEI, OLU, SVEN, RHEA],
    children: [
      { id: "t4", name: "Design system", start: at(13), end: at(18), percentComplete: 100, assignees: [MEI] },
      {
        id: "t5",
        name: "Frontend",
        start: at(17),
        end: at(27),
        percentComplete: 55,
        baselineEnd: at(24),
        assignees: [MEI, OLU],
      },
      { id: "t6", name: "Backend", start: at(16), end: at(25), percentComplete: 70, assignees: [SVEN, ARUN, OLU, RHEA] },
      { id: "t7", name: "Data migration", start: at(14), end: at(19), percentComplete: 20, assignees: [SVEN] },
    ],
  },
  {
    id: "p3",
    name: "Launch",
    assignees: [ARUN],
    children: [
      { id: "t8", name: "QA + UAT", start: at(24), end: at(29), percentComplete: 0, assignees: [MEI, ARUN] },
      { id: "t9", name: "Go live", start: at(30), end: at(30), percentComplete: 0, assignees: [ARUN] },
    ],
  },
];

/* A four-month plan, for the two views that exist to show one. `on` takes a
   month and a day so the phases can run past July, which the single-month PLAN
   above deliberately does not. */
const on = (month: number, day: number) => new Date(2026, month - 1, day, 0, 0, 0, 0);

const LONG_PLAN: GanttTask[] = [
  {
    id: "L1",
    name: "Discovery",
    assignees: [RHEA, ARUN],
    children: [
      { id: "L1a", name: "Stakeholder interviews", start: on(7, 6), end: on(7, 15), percentComplete: 100, assignees: [RHEA] },
      { id: "L1b", name: "Systems audit", start: on(7, 13), end: on(7, 24), percentComplete: 100, assignees: [ARUN] },
    ],
  },
  {
    id: "L2",
    name: "Design",
    assignees: [MEI, OLU],
    children: [
      { id: "L2a", name: "Wireframes", start: on(7, 20), end: on(8, 5), percentComplete: 95, baselineEnd: on(7, 31), assignees: [MEI] },
      { id: "L2b", name: "Design system", start: on(8, 3), end: on(8, 21), percentComplete: 40, assignees: [MEI, OLU] },
    ],
  },
  {
    id: "L3",
    name: "Build",
    assignees: [SVEN, OLU, MEI, ARUN],
    children: [
      { id: "L3a", name: "Application shell", start: on(8, 10), end: on(8, 28), percentComplete: 70, assignees: [SVEN] },
      { id: "L3b", name: "Gantt view", start: on(8, 24), end: on(9, 18), percentComplete: 5, baselineEnd: on(9, 25), assignees: [OLU, MEI] },
      { id: "L3c", name: "Reporting", start: on(9, 14), end: on(10, 9), percentComplete: 0, assignees: [ARUN] },
    ],
  },
  {
    id: "L4",
    name: "Launch",
    assignees: [ARUN],
    children: [
      { id: "L4a", name: "Beta cohort", start: on(10, 12), end: on(10, 30), percentComplete: 0, assignees: [ARUN, RHEA] },
    ],
  },
];

const LONG_LINKS: GanttDependency[] = [
  { from: "L1", to: "L2" },
  { from: "L2a", to: "L2b" },
  { from: "L2a", to: "L3" },
  { from: "L3a", to: "L3b" },
  { from: "L3b", to: "L3c" },
  { from: "L3", to: "L4" },
];

const LINKS: GanttDependency[] = [
  { from: "t1", to: "t2" },
  { from: "t2", to: "t3" },
  { from: "t3", to: "t4" },
  { from: "t4", to: "t5" },
  { from: "t4", to: "t6", type: "start-to-start" },
  { from: "t5", to: "t8" },
  { from: "t6", to: "t8" },
  { from: "t8", to: "t9" },
];

/* A single-shift plant: 06:00-17:00 Monday to Friday with an hour off at noon,
   shut at weekends, closed on the 22nd, working a Saturday morning on the 25th.
   2026-07-24 is a Friday. */
const SHIFT = [{ from: 6 * 60, to: 12 * 60 }, { from: 13 * 60, to: 17 * 60 }];
const PLANT: GanttCalendar = {
  week: [[], SHIFT, SHIFT, SHIFT, SHIFT, SHIFT, []],
  exceptions: [
    { date: new Date(2026, 6, 22), periods: [] },
    { date: new Date(2026, 6, 25), periods: [{ from: 8 * 60, to: 12 * 60 }] },
  ],
};
const SHOP_NOW = new Date(2026, 6, 24, 10, 0, 0, 0);
const shopAt = (day: number, h: number, m = 0) => new Date(2026, 6, day, h, m, 0, 0);

const SHOP: GanttTask[] = [
  {
    id: "wo",
    name: "Works order 4471",
    assignees: [SVEN, OLU],
    children: [
      { id: "j1", name: "Mill housing", subtitle: "CNC-3", start: shopAt(23, 8), end: shopAt(24, 11), percentComplete: 100, assignees: [SVEN] },
      // The end is derived: 6 working hours from Friday 16:00 lands Monday 11:00.
      { id: "j2", name: "Heat treat", subtitle: "Furnace 2", start: shopAt(24, 16), workingMinutes: 360, percentComplete: 35, assignees: [OLU] },
      { id: "j3", name: "Grind + inspect", start: shopAt(27, 11), workingMinutes: 300, percentComplete: 0, assignees: [MEI] },
      // Booked onto a Saturday the plant does not normally work — the overtime
      // exception is what makes it a real bar rather than a data error.
      { id: "j4", name: "Rework (overtime)", start: shopAt(25, 8), end: shopAt(25, 12), percentComplete: 0, assignees: [ARUN] },
    ],
  },
];

const SHOP_LINKS: GanttDependency[] = [
  { from: "j1", to: "j2" },
  { from: "j2", to: "j3" },
];

/* Two works orders, one row per operation, each operation booked on a shift.
   The shift is the CALLER's data — kept beside the tasks here, but it could as
   well be a column in a database row. The component is never told what a shift
   is; it is only asked what to draw. */
const op = (id: string, name: string, machine: string, day: number, from: number, to: number) => ({
  id,
  name,
  subtitle: machine,
  start: shopAt(day, from),
  end: shopAt(day, to),
  percentComplete: 0,
});
const MES: GanttTask[] = [
  {
    id: "wo1",
    name: "BLD-4908",
    children: [
      op("a1", "Op 1 · Laser cut", "Laser 1", 21, 6, 14),
      op("a2", "Op 2 · Bend", "Press brake", 21, 14, 22),
      op("a3", "Op 3 · Weld", "Weld cell", 22, 6, 14),
      op("a4", "Op 4 · Paint", "Booth", 22, 14, 22),
    ],
  },
  {
    id: "wo2",
    name: "HB-4917",
    children: [
      op("b1", "Op 1 · Rod cut", "Saw 2", 21, 14, 22),
      op("b2", "Op 2 · Turn", "Lathe 4", 22, 14, 22),
      op("b3", "Op 3 · Assemble", "Bench 1", 23, 6, 14),
    ],
  },
];
const MES_SHIFT: Record<string, string> = { a1: "GS", a2: "S2", a3: "GS", a4: "S2", b1: "S2", b2: "S2", b3: "GS" };
/* Two ways to show a shift, both chosen per call. The band tints the whole
   timeline row and is a class (it ships with your stylesheet); the stripe is a
   value, so it can come straight out of your records. */
const SHIFT_BAND: Record<string, string> = {
  GS: "zen-bg-[color-mix(in_srgb,var(--zen-color-accent-orange)_12%,transparent)]",
  S2: "zen-bg-[color-mix(in_srgb,var(--zen-color-accent-purple)_12%,transparent)]",
};
const SHIFT_COLOUR: Record<string, string> = {
  GS: "var(--zen-color-accent-orange)",
  S2: "var(--zen-color-accent-purple)",
};
const MES_LINKS: GanttDependency[] = [
  { from: "a1", to: "a2", kind: "sequence" },
  { from: "a2", to: "a3", kind: "sequence" },
  { from: "a3", to: "a4", kind: "sequence" },
  { from: "b1", to: "b2", kind: "sequence" },
  { from: "b2", to: "b3", kind: "sequence" },
  // HB-4917's assembly needs the welded frame from the other order.
  { from: "a3", to: "b3", kind: "dependency" },
];
const LINK_STYLE: Record<string, GanttDependencyStyle> = {
  sequence: { color: "var(--zen-color-info)" },
  dependency: { color: "var(--zen-color-accent-magenta)", dash: "4 3" },
};

const Legend = (props: { items: { label: string; swatch: JSX.Element }[] }) => (
  <ul class="zen-flex zen-flex-wrap zen-gap-x-4 zen-gap-y-1 zen-text-xs zen-text-zen-muted-fg">
    <For each={props.items}>
      {(item) => (
        <li class="zen-flex zen-items-center zen-gap-1.5">
          {item.swatch}
          {item.label}
        </li>
      )}
    </For>
  </ul>
);
const stripe = (colour: string) => (
  <span aria-hidden="true" class="zen-inline-block zen-h-3 zen-w-1 zen-rounded-zen-sm" style={{ "background-color": colour }} />
);
const line = (style: GanttDependencyStyle) => (
  <svg aria-hidden="true" width="24" height="6">
    <line x1="0" y1="3" x2="24" y2="3" stroke={style.color} stroke-width="1.5" stroke-dasharray={style.dash} />
  </svg>
);

/* Milestones: points in time with work leading to and from them. Dated around
   NOW (Tue 21 Jul) so every status shows: passed and signed off (complete),
   passed and not signed off (late), and still ahead. The customer-facing gates
   carry an accent, through the same barAccent a bar uses. */
const MILESTONE_PLAN: GanttTask[] = [
  {
    id: "rel",
    name: "Release 2.0",
    children: [
      { id: "ms-kick", name: "Kick-off approved", milestone: true, start: at(6), percentComplete: 100 },
      { id: "ms-design", name: "Design", start: at(6), end: at(10), percentComplete: 100 },
      { id: "ms-signoff", name: "Design sign-off", milestone: true, start: at(10), percentComplete: 100 },
      { id: "ms-build", name: "Build", start: at(13), end: at(24), percentComplete: 60 },
      { id: "ms-review", name: "Customer review", milestone: true, start: at(17) },
      { id: "ms-freeze", name: "Code freeze", milestone: true, start: at(24) },
      { id: "ms-qa", name: "QA", start: at(27), end: at(31) },
      { id: "ms-live", name: "Go live", milestone: true, start: at(31) },
    ],
  },
];
const CUSTOMER_GATES = new Set(["ms-review", "ms-live"]);
const MILESTONE_LINKS: GanttDependency[] = [
  { from: "ms-design", to: "ms-signoff" },
  { from: "ms-signoff", to: "ms-build" },
  { from: "ms-build", to: "ms-freeze" },
  { from: "ms-freeze", to: "ms-qa" },
  { from: "ms-qa", to: "ms-live" },
];

/** Planned vs actual: start/end are the plan, actualStart/actualEnd what happened. NOW is 21 Jul. */
const ACTUAL_PLAN: GanttTask[] = [
  {
    id: "web",
    name: "Website relaunch",
    children: [
      { id: "pa-disc", name: "Discovery", start: at(1), end: at(5), actualStart: at(1), actualEnd: at(4), assignees: [RHEA] },
      { id: "pa-design", name: "Design", start: at(6), end: at(12), actualStart: at(7), actualEnd: at(15), assignees: [MEI] },
      { id: "pa-content", name: "Content", start: at(8), end: at(17), actualStart: at(9), assignees: [OLU] },
      { id: "pa-build", name: "Build", start: at(13), end: at(28), actualStart: at(16), assignees: [ARUN, SVEN] },
      { id: "pa-qa", name: "QA", start: at(27), end: at(31), assignees: [RHEA] },
    ],
  },
];
const ACTUAL_LINKS: GanttDependency[] = [
  { from: "pa-disc", to: "pa-design" },
  { from: "pa-design", to: "pa-build" },
  { from: "pa-build", to: "pa-qa" },
];

/* A project board's style, from the same props: two full bars per row with
   their dates on them, the % on the actual bar, statuses of its own (On hold,
   Overdue) in their own colours, a key, and the month in weeks. NOW is 27 Nov. */
const BOARD_NOW = new Date(2026, 10, 27, 10, 0, 0, 0);
const nov = (day: number) => new Date(2026, 10, day, 0, 0, 0, 0);
const dmy = (d: Date) => `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
const dm = (a: Date, b: Date) => `${a.getDate()}–${b.getDate()} ${a.toLocaleString("en", { month: "short" })}`;
type BoardState = "progress" | "done" | "todo" | "hold" | "overdue";
const BOARD_STATE: Record<string, BoardState> = { b1: "progress", b2: "done", b3: "todo", b4: "hold", b5: "overdue" };
const BOARD_LOOK: Record<BoardState, { label: string; color: string }> = {
  progress: { label: "In progress", color: "var(--zen-color-warning)" },
  done: { label: "Completed", color: "var(--zen-color-success)" },
  todo: { label: "Todo", color: "var(--zen-color-info)" },
  hold: { label: "On hold", color: "var(--zen-color-accent-purple)" },
  overdue: { label: "Overdue, in progress", color: "var(--zen-color-error)" },
};
const boardTask = (id: string, name: string, plan: [number, number], actual?: [number, number?], percentComplete?: number): GanttTask => {
  const look = BOARD_LOOK[BOARD_STATE[id]];
  const lines = [`Planned: ${dmy(nov(plan[0]))} → ${dmy(nov(plan[1]))}`];
  if (actual) lines.push(`Actual: ${dmy(nov(actual[0]))} → ${actual[1] ? dmy(nov(actual[1])) : "…"}`);
  return {
    id,
    name,
    subtitle: lines,
    statusLabel: look.label,
    start: nov(plan[0]),
    end: nov(plan[1]),
    actualStart: actual ? nov(actual[0]) : undefined,
    actualEnd: actual?.[1] ? nov(actual[1]) : undefined,
    percentComplete,
  };
};
const BOARD: GanttTask[] = [
  boardTask("b1", "Project 1", [16, 20], [24], 50),
  boardTask("b2", "Project 2", [23, 25], [23, 25], 100),
  boardTask("b3", "Project 3", [24, 26]),
  boardTask("b4", "Project 4", [25, 27], [25], 20),
  boardTask("b5", "Project 5", [1, 7], [10], 60),
];
const BOARD_LEGEND = [
  { label: "Planned", color: "var(--zen-color-muted)" },
  ...(["done", "todo", "progress", "hold", "overdue"] as BoardState[]).map((s) => BOARD_LOOK[s]),
];

/** A plan that crosses New Year — the case no calendar year can show whole. */
const CROSS_YEAR: GanttTask[] = [
  {
    id: "X1",
    name: "Plant relocation",
    assignees: [SVEN, OLU],
    children: [
      { id: "X1a", name: "Site prep", start: on(11, 2), end: on(12, 18), percentComplete: 60, assignees: [SVEN] },
      { id: "X1b", name: "Line teardown", start: new Date(2026, 11, 7), end: new Date(2027, 0, 23), percentComplete: 10, assignees: [OLU] },
      { id: "X1c", name: "Recommission", start: new Date(2027, 0, 19), end: new Date(2027, 2, 6), percentComplete: 0, assignees: [MEI, SVEN] },
    ],
  },
];

/**
 * Section 12: a plan big enough that windowing and keyboard navigation actually
 * meet. Below a screenful the window covers every row and the interesting path
 * — move focus to a row that is not in the DOM — is never taken, which is how
 * it would go untested by every other section on this page.
 */
const BIG_PLAN: GanttTask[] = Array.from({ length: 40 }, (_, w) => ({
  id: `w${w}`,
  name: `Work centre ${w + 1}`,
  children: Array.from({ length: 20 }, (_, j) => {
    const day = 1 + ((w * 7 + j * 3) % 110);
    return {
      id: `w${w}j${j}`,
      name: `Job ${w + 1}-${String(j + 1).padStart(2, "0")}`,
      start: on(7, day),
      end: on(7, day + 2 + (j % 5)),
      percentComplete: (w * 13 + j * 7) % 101,
      assignees: [[RHEA, ARUN, MEI, OLU, SVEN][(w + j) % 5]],
    };
  }),
}));

/** Sections 8 and 9: a live readout, so neither section is a dead control. */
const Clickable = () => {
  const [picked, setPicked] = createSignal("Nothing picked yet");
  return (
    /* `w-full` is load-bearing: the preview area is a flex row, so a wrapper
       without it is content-sized and the fit axis has nothing stable to
       measure — see the trap noted in the component. */
    <div class="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <Gantt
        tasks={PLAN}
        dependencies={LINKS}
        now={NOW}
        defaultDate={NOW}
        defaultView="month"
        onTaskClick={(task, row) =>
          setPicked(
            `${task.name} — ${row.status}${row.progress === null ? "" : `, ${Math.round(row.progress)}%`}`,
          )
        }
      />
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        {picked()}
      </p>
    </div>
  );
};

/** Section 9: the same handler, reached by keyboard rather than by pointer. */
const Keyboardable = () => {
  const [picked, setPicked] = createSignal("Tab to the chart, then use the arrow keys");
  return (
    <div class="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <Gantt
        tasks={LONG_PLAN}
        dependencies={LONG_LINKS}
        now={NOW}
        onTaskClick={(task) => setPicked(`Activated: ${task.name}`)}
      />
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        {picked()}
      </p>
    </div>
  );
};

/** Section 3: collapsing a parent, driven from outside the component. */
const Collapsible = () => {
  const [expanded, setExpanded] = createSignal<string[]>(["p1", "p2", "p3"]);
  return (
    <div class="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <Gantt
        tasks={PLAN}
        dependencies={LINKS}
        now={NOW}
        defaultDate={NOW}
        defaultView="month"
        expanded={expanded()}
        onExpandedChange={setExpanded}
      />
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        Open: {expanded().length === 0 ? "nothing" : expanded().join(", ")}
      </p>
    </div>
  );
};

const NewGanttDemo = () => (
  <DemoPage
    title="Gantt"
    description={
      <>
        What the project is doing, and what is waiting on what. A task tree on
        the left, the same rows as bars on a shared clock on the right,
        dependency arrows in between.
      </>
    }
  >
    <DemoSection
      title="1. Tasks down, time across"
      codeTitle="One scroller, not two panes"
      codeDescription="The task pane is stuck to the inline start and the header to the top, so scrolling down moves both and scrolling sideways moves only the axis. Panes synced by a scroll listener drift by a row the first time a scrollbar appears, which is why there is only one here. A parent with no dates of its own gets a summary bar spanning its children, and a percentage weighted by their durations — an unweighted mean would let a one-day task cancel a ten-day one. The bar's fill is the percent complete and the number sits inside it, unless the bar is too narrow to hold it or the fill has already reached the end, in which case it moves outside where it is still readable."
      code={`const plan = [
  {
    id: "p2", name: "Build",              // no dates: rolled up from children
    assignees: [mei, olu, sven, rhea],
    children: [
      { id: "t5", name: "Frontend", start: at(17), end: at(27),
        percentComplete: 55, baselineEnd: at(24), assignees: [mei, olu] },
      { id: "t6", name: "Backend", start: at(16), end: at(25), percentComplete: 70 },
    ],
  },
];

<Gantt tasks={plan} />`}
    >
      <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} />
    </DemoSection>

    <DemoSection
      title="2. Fit, and why it is the default"
      codeTitle="An axis whose range comes from the data"
      codeDescription="Every other view is a window onto a calendar: pick a month and you see that month, whether or not the plan is in it. This one takes its range from the tasks — the span of every task, padded, snapped outward to whole hours, days, weeks or months depending on how long the plan runs. So a plan opens showing its own shape rather than whichever month today falls in, and a plan that crosses New Year can be seen whole at all, which no calendar year can do. The granularity is chosen from the span by a pinned function in core rather than by a ternary in the renderer, and the columns are sized to the container, because 'the whole plan without scrolling sideways' is the only thing the view is for. Notice what is missing from the toolbar: a fit axis has no anchor to move, so Previous, Today and Next are gone rather than disabled. Three buttons that visibly do nothing read as a broken chart."
      code={`<Gantt tasks={plan} />                    // fit is the default

<Gantt tasks={plan} defaultView="month" />   // or pin a calendar window
<Gantt tasks={plan} views={["fit", "week", "month"]} />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={CROSS_YEAR} now={NOW} />
        <Gantt tasks={CROSS_YEAR} now={NOW} defaultDate={NOW} defaultView="year" />
      </div>
    </DemoSection>

    <DemoSection
      title="3. The hierarchy collapses, and the arrows survive it"
      codeTitle="expanded / onExpandedChange"
      codeDescription="Close a phase and its children fold into the summary bar. Their dependencies do not disappear with them: a link touching a hidden task is redrawn against the bar it folded into, and a dozen links that all end up between the same two summary bars collapse to one arrow rather than stacking. Dropping them instead would make a collapsed project look like a project with no dependencies at all. Leave expanded off entirely and everything opens, which is what a plan you have just loaded should look like."
      code={`const [expanded, setExpanded] = createSignal(["p1", "p2", "p3"]);

<Gantt
  tasks={plan}
  dependencies={links}
  expanded={expanded()}
  onExpandedChange={setExpanded}
/>`}
    >
      <Collapsible />
    </DemoSection>

    <DemoSection
      title="4. Dependencies"
      codeTitle="Four kinds, routed around the bars"
      codeDescription="A dependency is two ids and a kind. Finish-to-start is the default and the common one — B cannot begin until A is done — and start-to-start, finish-to-finish and start-to-finish join the other ends. A link whose successor starts before its predecessor finishes has to double back, so it turns in the gutter between the two rows instead of cutting a straight line through everything in between. A dependency naming a task with no bar, because it has no dates or is entirely outside the view, draws nothing: a line running off the edge of the chart reads as a task that starts off-screen."
      code={`const links = [
  { from: "t4", to: "t5" },                            // finish-to-start
  { from: "t4", to: "t6", type: "start-to-start" },
];

<Gantt tasks={plan} dependencies={links} />
<Gantt tasks={plan} dependencies={links} showDependencies={false} />`}
    >
      <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} defaultView="month" expanded={["p2"]} />
    </DemoSection>

    <DemoSection
      title="5. Slip, and the colour that follows from it"
      codeTitle="baselineEnd, and the derived status"
      codeDescription="Give a task the date the plan originally promised and the row reports the difference in whole calendar days: 'On time', '+5d', '-2d'. Whole days rather than hours, so finishing at 18:00 instead of 09:00 on the same date is not late and a daylight-saving boundary cannot turn two days into 1.96. The bar's colour follows from the same reading, and the order it resolves in is the whole point: finished beats late, so a task delivered after its baseline is complete rather than red — the slip is already said by the chip. Late beats not-started, so a task that is 0% done and a week past due is the most urgent row on the chart instead of the quietest. Pass status yourself to override the lot."
      code={`{ id: "t2", name: "Field research",
  start: at(3), end: at(10),
  baselineEnd: at(8) }        // -> "+2d", and a delayed bar until it hits 100%

{ id: "t9", name: "Go live", status: "not-started" }   // says so outright`}
    >
      <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} defaultView="month" />
    </DemoSection>

    <DemoSection
      title="6. Quarter and year, for a plan that outlasts a month"
      codeTitle="A whole project, at the granularity that fits it"
      codeDescription="A month is the widest view a calendar needs and the narrowest a plan does: this four-month schedule shows one phase in month view and three empty columns of nothing. Quarter draws week columns, year draws month columns. Both have columns of UNEQUAL length — a quarter begins on the 1st, which is almost never a Monday, so its first and last weeks are partial, and months are 28 to 31 days. Each column is therefore drawn at its own share of the axis rather than at one uniform width. That is not a detail: uniform month columns walk every bar off its gridline by up to three days across a year, while looking perfectly reasonable."
      code={`<Gantt tasks={plan} dependencies={links} defaultView="year" />
<Gantt tasks={plan} defaultView="quarter" />

// Offer a subset — a plan measured in days has no use for a year:
<Gantt tasks={plan} views={["week", "month", "quarter"]} />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} defaultDate={NOW} defaultView="year" />
        <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} defaultDate={NOW} defaultView="quarter" />
      </div>
    </DemoSection>

    <DemoSection
      title="7. The pane gives way before the axis does"
      codeTitle="columns"
      codeDescription="Task, Assignees, Status and Variance are 436px of frozen pane, and a year axis wants around 960 more — so a normal page width used to scroll sideways before anybody had done anything, and the columns pushed off were whichever ones happened to be last. Now the pane sheds them on purpose. List the ones you want and the order is a PREFERENCE order, not just a set: what you list last is the first to go when the container cannot hold both the pane and a usable axis. The Task column is never dropped, because a schedule with no task names is not a narrower schedule. Drop the two your data cannot fill and the pane stops costing you the timeline — the first chart below asks for two columns, the second asks for all four inside an 800px container and gets what fits."
      code={`// Say what you want, in the order you want to lose it:
<Gantt tasks={plan} columns={["name", "status"]} />

// Or leave it alone and let the container decide:
<Gantt tasks={plan} />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} columns={["name", "status"]} />
        <div style={{ "max-width": "800px" }}>
          <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="8. Keyboard: one tab stop, arrows inside"
      codeTitle="Grid navigation over a windowed chart"
      codeDescription="Tab reaches the chart once and leaves it once, however many rows it has — at 10,000 rows the old tab-through-the-bars model put 10,000 stops between a reader and whatever came after the chart. Inside, the arrow keys move a cell: up and down a row, left and right a column, Home and End to the ends of the row, Ctrl+Home and Ctrl+End to the ends of the plan, PageUp and PageDown a screenful. On the first column the forward arrow expands a closed phase and the backward arrow collapses an open one, which is how the hierarchy is reached without a pointer. Enter or Space activates the row and calls onTaskClick. The hard part is invisible: rows are windowed, so moving to a row that is not in the DOM has to scroll it in, re-render, and then focus it — get that wrong and focus lands on the page body and the next Tab restarts from the top of the document. Arrow keys follow the visual direction, so they still point the way they are drawn under RTL."
      code={`<Gantt tasks={plan} onTaskClick={(task) => open(task)} />

// Arrow keys       move one cell
// Home / End       first / last cell in the row
// Ctrl+Home / End  first / last row of the plan
// PageUp / Down    one screenful
// Left / Right     collapse / expand, on the first column
// Enter / Space    onTaskClick`}
    >
      <Keyboardable />
    </DemoSection>

    <DemoSection
      title="9. Clicking a task"
      codeTitle="It renders the plan; it does not reschedule it"
      codeDescription="There is no drag-to-move, no drag-to-resize and no pulling a new dependency between two bars. Moving a task in a real plan cascades through its successors, and what should happen then is a policy question: does it push the whole chain, does it need an approval, what does undo mean, who is allowed. That belongs to your domain. onTaskClick hands you the task and its derived row — status, rolled-up span, progress, slip — and you open your own editor."
      code={`<Gantt
  tasks={plan}
  dependencies={links}
  onTaskClick={(task, row) => openEditor(task, row.status)}
/>

<Gantt tasks={plan} views={["month", "quarter", "year"]} />`}
    >
      <Clickable />
    </DemoSection>

    <DemoSection
      title="10. Working time — shifts, holidays and split bars"
      codeTitle="calendar"
      codeDescription="A factory does not work every hour, and until that is modelled every duration is wrong. Give the chart a calendar — working periods per weekday, plus dated exceptions for holidays, planned maintenance or one-off overtime — and three things change. Durations become working durations: a job given workingMinutes has its end derived through the calendar, so six hours starting Friday 16:00 finishes on MONDAY rather than at Friday 22:00. Bars break across the time nobody is working instead of drawing straight through it, and the gap is transparent so the shaded column shows through. And the shading itself comes from the calendar rather than from a weekend-and-nine-to-five guess. Pass no calendar and none of this happens — no calendar means a 24/7 one, which is exactly the behaviour every other section on this page shows."
      code={`const plant: GanttCalendar = {
  // 0 = Sunday. Two shifts with an hour off at noon; weekends shut.
  week: [[], shift, shift, shift, shift, shift, []],
  exceptions: [
    { date: new Date(2026, 6, 22), periods: [] },                    // holiday
    { date: new Date(2026, 6, 25), periods: [{ from: 8 * 60, to: 12 * 60 }] }, // overtime
  ],
};

// The end is DERIVED: 6 working hours from Friday 16:00 lands on Monday.
{ id: "j2", name: "Heat treat", start: at(24, 16), workingMinutes: 360 }

<Gantt tasks={jobs} calendar={plant} defaultView="week" />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={SHOP} dependencies={SHOP_LINKS} calendar={PLANT} now={SHOP_NOW} defaultDate={SHOP_NOW} defaultView="week" />
        <Gantt tasks={SHOP} dependencies={SHOP_LINKS} calendar={PLANT} now={SHOP_NOW} defaultDate={SHOP_NOW} defaultView="day" />
        {/* The four-hour overtime job on its own, so fit lands in the HOUR
            band — the resolution a shop floor actually schedules at. */}
        <Gantt tasks={[SHOP[0].children![3]]} calendar={PLANT} now={SHOP_NOW} />
      </div>
    </DemoSection>

    <DemoSection
      title="11. Loading and empty"
      codeTitle="loading / emptyState"
      codeDescription="The skeleton is staggered rather than a stack of equal bars, because the shape is the information: a schedule that loads as a table reads as the wrong component for a second. The toolbar is not drawn over either state — Previous, Today and Next cannot change anything the user can see when there is nothing to see, and a dead control is worse than no control."
      code={`<Gantt tasks={[]} loading />
<Gantt tasks={[]} />                     // the default empty surface
<Gantt tasks={[]} emptyState={<MyOwnEmpty />} />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={[]} loading now={NOW} defaultDate={NOW} />
        <Gantt tasks={[]} now={NOW} defaultDate={NOW} />
      </div>
    </DemoSection>

    <DemoSection
      title="12. 840 rows, 26 of them in the DOM"
      codeTitle="Windowing, and the keyboard that has to survive it"
      codeDescription="Rows are windowed always, at every size — only the screenful under the viewport is mounted, and the spacers above and below keep the scrollbar measuring the whole plan rather than the window. There is no threshold, deliberately: a threshold would mean the windowed path is the one no demo and no check ever exercises, and production is the first thing to try it. The connector layer is the exception and is drawn whole, because a link between two off-screen tasks still routes through the band you can see, and culling it would blink arrows in and out as their endpoints scrolled away. This is also the only section where windowing and keyboard navigation meet: press Ctrl+End here and focus has to move to a row that is not in the document yet, which means scrolling it in, re-rendering, and then focusing it. Get that wrong and focus lands on the page body — from where the next Tab restarts at the top of the document, stranding whoever was reading row 800."
      code={`// Nothing to switch on. 840 rows or 8, the same component:
<Gantt tasks={plan} />

// Ctrl+End      last row of the plan, scrolled in and focused
// PageDown      one screenful at a time`}
    >
      <Gantt tasks={BIG_PLAN} now={NOW} defaultExpanded={["w0", "w1"]} />
    </DemoSection>

    <DemoSection
      title="13. Row height, chart height and colours"
      codeTitle="rowHeight, maxBodyHeight, rowClassName, barClassName, headerClassName"
      codeDescription="rowHeight sets every row (one value: the row window and the arrows place rows at index × height, so they cannot differ). maxBodyHeight replaces the 32rem the chart scrolls after. rowClassName tints a task's row; barClassName colours a bar and wins over its status colours — here Mei's work in purple, and the phases' rows shaded. headerClassName styles the header row and its frozen pane. The small print (subtitles, percentages) follows --zen-schedule-label-font-size."
      code={`<Gantt
  tasks={plan}
  rowHeight={48}
  maxBodyHeight={300}
  rowClassName={(t) => t.children && "zen-bg-zen-muted"}
  barClassName={(t) => t.assignees?.some((a) => a.id === "u3") && "zen-bg-zen-accent-purple zen-border-zen-accent-purple"}
  headerClassName="zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
/>`}
    >
      <div data-testid="gantt-styled" class="zen-w-full" style={{ "--zen-schedule-label-font-size": "11px" }}>
        <Gantt
          tasks={PLAN}
          dependencies={LINKS}
          now={NOW}
          defaultDate={NOW}
          rowHeight={48}
          maxBodyHeight={300}
          rowClassName={(t) => (t.children ? "zen-bg-zen-muted" : undefined)}
          barClassName={(t) => t.assignees?.some((a) => a.id === MEI.id) && "zen-bg-zen-accent-purple zen-border-zen-accent-purple"}
          headerClassName="zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
        />
      </div>
    </DemoSection>

    <DemoSection
      title="14. Density"
      codeTitle='density="compact" | "comfortable" | "touch"'
      codeDescription="compact: 28px rows for a long plan read all day. touch: 48px rows and 32px bars, for a tablet on the shop floor. rowHeight, when given, wins. Opt-in, per component: it does not follow data-density, so a page that already sets that sees nothing move here. comfortable is the default and is the size it always was."
      code={`<Gantt tasks={plan} density="compact" />
<Gantt tasks={plan} density="touch" />`}
    >
      <div class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <div data-testid="gantt-compact" class="zen-w-full">
          <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} density="compact" />
        </div>
        <div data-testid="gantt-touch" class="zen-w-full">
          <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} density="touch" />
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="15. Colour by your own data: shifts and kinds of link"
      codeTitle="rowClassName, barAccent, dependencyStyle, kind on a dependency"
      codeDescription="Three channels, each driven by data the component never interprets, and each optional — use one, two or all three. rowClassName tints the row's timeline band (here, by the shift the operation runs on). barAccent returns a CSS colour for a stripe on the bar's leading edge, so the status fill keeps saying what it said; it is a value rather than a class so the colour can come from your records. A dependency can carry a kind of your own naming, and dependencyStyle turns it into a colour and a dash: here, the next step of the same order against a wait on another order. Give every kind a dash as well as a colour, because red already means late. The legend is yours to draw: only you know what the kinds are called."
      code={`// A tint, not the full colour: the band sits behind the bars.
const band = {
  GS: "zen-bg-[color-mix(in_srgb,var(--zen-color-accent-orange)_12%,transparent)]",
  S2: "zen-bg-[color-mix(in_srgb,var(--zen-color-accent-purple)_12%,transparent)]",
};
const colour = { GS: "var(--zen-color-accent-orange)", S2: "var(--zen-color-accent-purple)" };
const linkStyle = {
  sequence: { color: "var(--zen-color-info)" },
  dependency: { color: "var(--zen-color-accent-magenta)", dash: "4 3" },
};

<Gantt
  tasks={operations}
  dependencies={[
    { from: "a1", to: "a2", kind: "sequence" },
    { from: "a3", to: "b3", kind: "dependency" },
  ]}
  rowClassName={(t) => band[shiftOf[t.id]]}
  barAccent={(t) => colour[shiftOf[t.id]]}
  dependencyStyle={(link) => linkStyle[link.kind]}
/>`}
    >
      <div data-testid="gantt-data-colours" class="zen-flex zen-w-full zen-flex-col zen-gap-3">
        <Legend
          items={[
            { label: "General shift (GS)", swatch: stripe(SHIFT_COLOUR.GS) },
            { label: "Second shift (S2)", swatch: stripe(SHIFT_COLOUR.S2) },
            { label: "Next step, same order", swatch: line(LINK_STYLE.sequence) },
            { label: "Waits on another order", swatch: line(LINK_STYLE.dependency) },
          ]}
        />
        <Gantt
          tasks={MES}
          dependencies={MES_LINKS}
          now={SHOP_NOW}
          defaultView="week"
          defaultDate={shopAt(21, 0)}
          rowClassName={(t) => SHIFT_BAND[MES_SHIFT[t.id]]}
          barAccent={(t) => SHIFT_COLOUR[MES_SHIFT[t.id]]}
          dependencyStyle={(link) => (link.kind ? LINK_STYLE[link.kind] : undefined)}
        />
      </div>
    </DemoSection>

    <DemoSection
      title="16. Date context above the columns"
      codeTitle="headerGroups"
      codeDescription="A second header row says which date, month or year the columns belong to: the date above hours, the month above days or weeks, the year above months. Each label is sticky just past the frozen pane, so it stays on screen while its columns scroll sideways, and a planner following an order across weeks never has to look up to the toolbar. The first chart is a Week view of 29 June to 5 July, a week split across two months. The second is Fit over the whole plan. With groups on, the per-column hint that used to repeat the month or year at each boundary is dropped; the group row says it once. Off by default, so an existing chart's header does not change."
      code={`<Gantt tasks={plan} headerGroups defaultView="week" defaultDate={new Date(2026, 6, 1)} />
<Gantt tasks={plan} headerGroups />`}
    >
      <div data-testid="gantt-header-groups" class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} headerGroups defaultView="week" defaultDate={at(1)} />
        <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} headerGroups />
      </div>
    </DemoSection>

    <DemoSection
      title="17. One continuous timeline: the view is the zoom"
      codeTitle="continuous"
      codeDescription="With continuous on, the whole plan is one timeline you scroll sideways, and Day, Week, Month, Quarter and Year set how far you are zoomed in rather than which single period is shown. A bar is never cut off at the edge of a week, so an order can be followed from start to finish. Previous and Next scroll by one period from what is on screen, Today scrolls to now, and the title names the period in the middle of the screen. The date row above the columns is on by default here, because a scrolled timeline needs it. Only the columns near the screen are drawn, so even an hourly zoom over weeks stays light. The first chart is the July plan at Week zoom, the second a plan spanning months at Month zoom."
      code={`<Gantt tasks={plan} continuous defaultView="week" />
<Gantt tasks={longPlan} continuous defaultView="month" />`}
    >
      <div data-testid="gantt-continuous" class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} continuous defaultView="week" defaultDate={NOW} maxBodyHeight={320} />
        <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} continuous defaultView="month" defaultDate={NOW} maxBodyHeight={320} />
      </div>
    </DemoSection>

    <DemoSection
      title="18. Milestones"
      codeTitle="milestone: true on a task"
      codeDescription="A milestone is a point in time, not a span: a sign-off, a code freeze, a go-live. Mark a task milestone: true and it is drawn as a diamond on its date (its start, or its end if that is all it has), coloured by status like a bar: done, late if the date has passed and it is not done, otherwise ahead. Dependencies attach to its tips, so a finish-to-start arrow runs from the work into the milestone and out of it into the next stage. barAccent marks a milestone with a border in your colour, here the customer-facing gates. A screen reader hears it as a milestone with its date. Without the flag nothing changes: a task with only a start is still treated as unfinished data, not as a milestone."
      code={`const plan = [
  { id: "design", name: "Design", start: jul6, end: jul10, percentComplete: 100 },
  { id: "signoff", name: "Design sign-off", milestone: true, start: jul10, percentComplete: 100 },
  { id: "build", name: "Build", start: jul13, end: jul24 },
  { id: "review", name: "Customer review", milestone: true, start: jul17 },
  { id: "freeze", name: "Code freeze", milestone: true, start: jul24 },
];

<Gantt
  tasks={plan}
  dependencies={[
    { from: "design", to: "signoff" },
    { from: "signoff", to: "build" },
    { from: "build", to: "freeze" },
  ]}
  barAccent={(t) => t.id === "review" && "var(--zen-color-accent-purple)"}
/>`}
    >
      <div data-testid="gantt-milestones" class="zen-w-full">
        <Gantt
          tasks={MILESTONE_PLAN}
          dependencies={MILESTONE_LINKS}
          now={NOW}
          defaultView="month"
          defaultDate={NOW}
          barAccent={(t) => CUSTOMER_GATES.has(t.id) && "var(--zen-color-accent-purple)"}
        />
      </div>
    </DemoSection>

    <DemoSection
      title="19. Planned vs actual"
      codeTitle="actualStart and actualEnd on a task"
      codeDescription="A task's start and end are the plan. Give it actualStart when the work really begins and actualEnd when it really finishes, and a second bar shows the actual period under the planned one. Work still running has an actual bar that ends at now, with a square end because it has not finished yet. A task that has not started has no actual bar, so a plan that slipped past without anyone starting it is easy to spot. By default the actual dates also set the status and the slip: a finished task with no percentage given is complete, a running one is on track until its planned end passes, and the variance column shows how many days the actual finish (or today, for late running work) is past the planned end. An explicit status, percentComplete or baselineEnd still wins, and deriveFromActuals={false} turns this off and only draws the bar. actualLayout split gives the two bars equal weight instead, and actualBarColor or actualBarClassName restyle the actual bar. Tasks without actual dates look exactly as before."
      code={`const plan = [
  // Finished early, and finished late
  { id: "discovery", name: "Discovery", start: jul1, end: jul5, actualStart: jul1, actualEnd: jul4 },
  { id: "design", name: "Design", start: jul6, end: jul12, actualStart: jul7, actualEnd: jul15 },
  // Running: one inside its plan, one past it
  { id: "build", name: "Build", start: jul13, end: jul28, actualStart: jul16 },
  { id: "content", name: "Content", start: jul8, end: jul17, actualStart: jul9 },
  // Not started: the plan only
  { id: "qa", name: "QA", start: jul27, end: jul31 },
];

<Gantt tasks={plan} columns={["name", "status", "variance"]} />

// Two equal bars, the actual one in a colour of your choosing
<Gantt
  tasks={plan}
  actualLayout="split"
  actualBarColor={() => "var(--zen-color-accent-purple)"}
/>`}
    >
      <div data-testid="gantt-actuals" class="zen-flex zen-w-full zen-flex-col zen-gap-4">
        <Gantt
          tasks={ACTUAL_PLAN}
          dependencies={ACTUAL_LINKS}
          now={NOW}
          defaultView="month"
          defaultDate={NOW}
          columns={["name", "status", "variance"]}
        />
        <Gantt
          tasks={ACTUAL_PLAN}
          dependencies={ACTUAL_LINKS}
          now={NOW}
          defaultView="month"
          defaultDate={NOW}
          actualLayout="split"
          actualBarColor={() => "var(--zen-color-accent-purple)"}
        />
      </div>
    </DemoSection>

    <DemoSection
      title="20. A project board: labels, your own statuses, a key"
      codeTitle="barLabel, actualBarLabel, progressOn, statusColor, legend, monthColumns"
      codeDescription="The same chart styled as a project board. actualLayout split with a taller rowHeight gives two full bars per row, and barLabel and actualBarLabel put their dates on them; a label that does not fit goes beside its bar. progressOn actual moves the percentage onto the actual bar and turns the plan into a neutral grey reference. statusLabel and statusColor give statuses of your own, like On hold, their own colour on the chip and the bars. legend draws the key, from the chart with legend set to true or from your own list as here. monthColumns week shows the month in calendar weeks, which leaves room for a label on every bar. subtitle takes a list, one line each. Every one of these is optional, and without them the chart is unchanged."
      code={`const look = {
  progress: { label: "In progress", color: "var(--zen-color-warning)" },
  hold: { label: "On hold", color: "var(--zen-color-accent-purple)" },
  // …
};
const tasks = projects.map((p) => ({
  id: p.id, name: p.name,
  start: p.plannedStart, end: p.plannedEnd,
  actualStart: p.actualStart, actualEnd: p.actualEnd,
  percentComplete: p.percent,
  statusLabel: look[p.state].label,
  subtitle: [\`Planned: \${fmt(p.plannedStart)} → \${fmt(p.plannedEnd)}\`, \`Actual: …\`],
}));

<Gantt
  tasks={tasks}
  views={["week", "month", "quarter"]}
  defaultView="month"
  monthColumns="week"
  actualLayout="split"
  rowHeight={64}
  progressOn="actual"
  barLabel={(t) => \`Planned (\${range(t.start, t.end)})\`}
  actualBarLabel={(t, row) => \`Actual (\${range(row.actual.start, row.actual.end)}) – \${row.progress ?? 0}%\`}
  statusColor={(t) => look[stateOf(t)].color}
  legend={[{ label: "Planned", color: "var(--zen-color-muted)" }, ...Object.values(look)]}
/>`}
    >
      <div data-testid="gantt-board" class="zen-w-full">
        <Gantt
          tasks={BOARD}
          now={BOARD_NOW}
          views={["week", "month", "quarter"]}
          defaultView="month"
          defaultDate={BOARD_NOW}
          monthColumns="week"
          actualLayout="split"
          rowHeight={64}
          progressOn="actual"
          columns={["name", "status"]}
          barLabel={(t) => `Planned (${dm(t.start!, t.end!)})`}
          actualBarLabel={(_t, row) =>
            row.actual ? `Actual (${dm(row.actual.start, row.actual.end)}) – ${Math.round(row.progress ?? 0)}%` : null
          }
          statusColor={(t) => BOARD_LOOK[BOARD_STATE[t.id]]?.color}
          legend={BOARD_LEGEND}
        />
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewGanttDemo;
