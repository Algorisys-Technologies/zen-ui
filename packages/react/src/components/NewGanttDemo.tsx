import * as React from "react";
import { Gantt, type GanttTask } from "./gantt/gantt";
import type { GanttCalendar, GanttDependency } from "@algorisys/zen-ui-core";
import { CodeExample } from "./demo-helpers";

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
      { id: "L2a", name: "Wireframes", start: on(7, 20), end: on(8, 5), percentComplete: 95, assignees: [MEI] },
      { id: "L2b", name: "Design system", start: on(8, 3), end: on(8, 21), percentComplete: 40, assignees: [MEI, OLU] },
    ],
  },
  {
    id: "L3",
    name: "Build",
    assignees: [SVEN, OLU, MEI, ARUN],
    children: [
      { id: "L3a", name: "Application shell", start: on(8, 10), end: on(8, 28), percentComplete: 70, assignees: [SVEN] },
      { id: "L3b", name: "Gantt view", start: on(8, 24), end: on(9, 18), percentComplete: 5, assignees: [OLU, MEI] },
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
  const [picked, setPicked] = React.useState("Nothing picked yet");
  /* `w-full` is load-bearing: `.example-preview` is a flex row, so a wrapper
     without it is content-sized and the fit axis has nothing stable to
     measure — see the trap noted in the component. */
  return (
    <div className="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <Gantt
        tasks={PLAN}
        dependencies={LINKS}
        now={NOW}
        defaultDate={NOW}
        defaultView="month"
        onTaskClick={(task, row) =>
          setPicked(`${task.name} — ${row.status}${row.progress === null ? "" : `, ${Math.round(row.progress)}%`}`)
        }
      />
      <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        {picked}
      </p>
    </div>
  );
};

/** Section 9: the same handler, reached by keyboard rather than by pointer. */
const Keyboardable = () => {
  const [picked, setPicked] = React.useState("Tab to the chart, then use the arrow keys");
  /* `w-full` is load-bearing: `.example-preview` is a flex row, so a wrapper
     without it is content-sized and the fit axis has nothing stable to
     measure — see the trap noted in the component. */
  return (
    <div className="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <Gantt
        tasks={LONG_PLAN}
        dependencies={LONG_LINKS}
        now={NOW}
        onTaskClick={(task) => setPicked(`Activated: ${task.name}`)}
      />
      <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        {picked}
      </p>
    </div>
  );
};

/** Section 3: collapsing a parent, driven from outside the component. */
const Collapsible = () => {
  const [expanded, setExpanded] = React.useState<string[]>(["p1", "p2", "p3"]);
  /* `w-full` is load-bearing: `.example-preview` is a flex row, so a wrapper
     without it is content-sized and the fit axis has nothing stable to
     measure — see the trap noted in the component. */
  return (
    <div className="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <Gantt
        tasks={PLAN}
        dependencies={LINKS}
        now={NOW}
        defaultDate={NOW}
        defaultView="month"
        expanded={expanded}
        onExpandedChange={setExpanded}
      />
      <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        Open: {expanded.length === 0 ? "nothing" : expanded.join(", ")}
      </p>
    </div>
  );
};

const NewGanttDemo = () => (
  <div className="demo-page">
    <h1>Gantt</h1>
    <p className="lede">
      What the project is doing, and what is waiting on what. A task tree on the
      left, the same rows as bars on a shared clock on the right, dependency
      arrows in between.
    </p>

    <section className="demo-section">
      <h2>1. Tasks down, time across</h2>
      <CodeExample
        title="One scroller, not two panes"
        description="The task pane is stuck to the inline start and the header to the top, so scrolling down moves both and scrolling sideways moves only the axis. Panes synced by a scroll listener drift by a row the first time a scrollbar appears, which is why there is only one here. A parent with no dates of its own gets a summary bar spanning its children, and a percentage weighted by their durations — an unweighted mean would let a one-day task cancel a ten-day one. The bar's fill is the percent complete and the number sits inside it, unless the bar is too narrow to hold it or the fill has already reached the end, in which case it moves outside where it is still readable."
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
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Fit, and why it is the default</h2>
      <CodeExample
        title="An axis whose range comes from the data"
        description="Every other view is a window onto a calendar: pick a month and you see that month, whether or not the plan is in it. This one takes its range from the tasks — the span of every task, padded, snapped outward to whole hours, days, weeks or months depending on how long the plan runs. So a plan opens showing its own shape rather than whichever month today falls in, and a plan that crosses New Year can be seen whole at all, which no calendar year can do. The granularity is chosen from the span by a pinned function in core rather than by a ternary in the renderer, and the columns are sized to the container, because 'the whole plan without scrolling sideways' is the only thing the view is for. Notice what is missing from the toolbar: a fit axis has no anchor to move, so Previous, Today and Next are gone rather than disabled. Three buttons that visibly do nothing read as a broken chart."
        code={`<Gantt tasks={plan} />                    // fit is the default

<Gantt tasks={plan} defaultView="month" />   // or pin a calendar window
<Gantt tasks={plan} views={["fit", "week", "month"]} />`}
      >
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <Gantt tasks={CROSS_YEAR} now={NOW} />
          <Gantt tasks={CROSS_YEAR} now={NOW} defaultDate={NOW} defaultView="year" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. The hierarchy collapses, and the arrows survive it</h2>
      <CodeExample
        title="expanded / onExpandedChange"
        description="Close a phase and its children fold into the summary bar. Their dependencies do not disappear with them: a link touching a hidden task is redrawn against the bar it folded into, and a dozen links that all end up between the same two summary bars collapse to one arrow rather than stacking. Dropping them instead would make a collapsed project look like a project with no dependencies at all. Leave expanded off entirely and everything opens, which is what a plan you have just loaded should look like."
        code={`const [expanded, setExpanded] = useState(["p1", "p2", "p3"]);

<Gantt
  tasks={plan}
  dependencies={links}
  expanded={expanded}
  onExpandedChange={setExpanded}
/>`}
      >
        <Collapsible />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Dependencies</h2>
      <CodeExample
        title="Four kinds, routed around the bars"
        description="A dependency is two ids and a kind. Finish-to-start is the default and the common one — B cannot begin until A is done — and start-to-start, finish-to-finish and start-to-finish join the other ends. A link whose successor starts before its predecessor finishes has to double back, so it turns in the gutter between the two rows instead of cutting a straight line through everything in between. A dependency naming a task with no bar, because it has no dates or is entirely outside the view, draws nothing: a line running off the edge of the chart reads as a task that starts off-screen."
        code={`const links = [
  { from: "t4", to: "t5" },                            // finish-to-start
  { from: "t4", to: "t6", type: "start-to-start" },
];

<Gantt tasks={plan} dependencies={links} />
<Gantt tasks={plan} dependencies={links} showDependencies={false} />`}
      >
        <Gantt
          tasks={PLAN}
          dependencies={LINKS}
          now={NOW}
          defaultDate={NOW}
          defaultView="month"
          expanded={["p2"]}
        />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Slip, and the colour that follows from it</h2>
      <CodeExample
        title="baselineEnd, and the derived status"
        description="Give a task the date the plan originally promised and the row reports the difference in whole calendar days: 'On time', '+5d', '-2d'. Whole days rather than hours, so finishing at 18:00 instead of 09:00 on the same date is not late and a daylight-saving boundary cannot turn two days into 1.96. The bar's colour follows from the same reading, and the order it resolves in is the whole point: finished beats late, so a task delivered after its baseline is complete rather than red — the slip is already said by the chip. Late beats not-started, so a task that is 0% done and a week past due is the most urgent row on the chart instead of the quietest. Pass status yourself to override the lot."
        code={`{ id: "t2", name: "Field research",
  start: at(3), end: at(10),
  baselineEnd: at(8) }        // -> "+2d", and a delayed bar until it hits 100%

{ id: "t9", name: "Go live", status: "not-started" }   // says so outright`}
      >
        <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} defaultView="month" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>6. Quarter and year, for a plan that outlasts a month</h2>
      <CodeExample
        title="A whole project, at the granularity that fits it"
        description="A month is the widest view a calendar needs and the narrowest a plan does: this four-month schedule shows one phase in month view and three empty columns of nothing. Quarter draws week columns, year draws month columns. Both have columns of UNEQUAL length — a quarter begins on the 1st, which is almost never a Monday, so its first and last weeks are partial, and months are 28 to 31 days. Each column is therefore drawn at its own share of the axis rather than at one uniform width. That is not a detail: uniform month columns walk every bar off its gridline by up to three days across a year, while looking perfectly reasonable. Check a bar's edge against the line beside it in the year view below."
        code={`<Gantt tasks={plan} dependencies={links} defaultView="year" />
<Gantt tasks={plan} defaultView="quarter" />

// Offer a subset — a plan measured in days has no use for a year:
<Gantt tasks={plan} views={["week", "month", "quarter"]} />`}
      >
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} defaultDate={NOW} defaultView="year" />
          <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} defaultDate={NOW} defaultView="quarter" />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>7. The pane gives way before the axis does</h2>
      <CodeExample
        title="columns"
        description="Task, Assignees, Status and Variance are 436px of frozen pane, and a year axis wants around 960 more — so a normal page width used to scroll sideways before anybody had done anything, and the columns pushed off were whichever ones happened to be last. Now the pane sheds them on purpose. List the ones you want and the order is a PREFERENCE order, not just a set: what you list last is the first to go when the container cannot hold both the pane and a usable axis. The Task column is never dropped, because a schedule with no task names is not a narrower schedule. Drop the two your data cannot fill and the pane stops costing you the timeline — the first chart below asks for two columns, the second asks for all four inside an 800px container and gets what fits."
        code={`// Say what you want, in the order you want to lose it:
<Gantt tasks={plan} columns={["name", "status"]} />

// Or leave it alone and let the container decide:
<Gantt tasks={plan} />`}
      >
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} columns={["name", "status"]} />
          <div style={{ maxWidth: 800 }}>
            <Gantt tasks={LONG_PLAN} dependencies={LONG_LINKS} now={NOW} />
          </div>
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>8. Keyboard: one tab stop, arrows inside</h2>
      <CodeExample
        title="Grid navigation over a windowed chart"
        description="Tab reaches the chart once and leaves it once, however many rows it has — at 10,000 rows the old tab-through-the-bars model put 10,000 stops between a reader and whatever came after the chart. Inside, the arrow keys move a cell: up and down a row, left and right a column, Home and End to the ends of the row, Ctrl+Home and Ctrl+End to the ends of the plan, PageUp and PageDown a screenful. On the first column the forward arrow expands a closed phase and the backward arrow collapses an open one, which is how the hierarchy is reached without a pointer. Enter or Space activates the row and calls onTaskClick. The hard part is invisible: rows are windowed, so moving to a row that is not in the DOM has to scroll it in, re-render, and then focus it — get that wrong and focus lands on the page body and the next Tab restarts from the top of the document. Arrow keys follow the visual direction, so they still point the way they are drawn under RTL."
        code={`<Gantt tasks={plan} onTaskClick={(task) => open(task)} />

// Arrow keys       move one cell
// Home / End       first / last cell in the row
// Ctrl+Home / End  first / last row of the plan
// PageUp / Down    one screenful
// Left / Right     collapse / expand, on the first column
// Enter / Space    onTaskClick`}
      >
        <Keyboardable />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>9. Clicking a task</h2>
      <CodeExample
        title="It renders the plan; it does not reschedule it"
        description="There is no drag-to-move, no drag-to-resize and no pulling a new dependency between two bars. Moving a task in a real plan cascades through its successors, and what should happen then is a policy question: does it push the whole chain, does it need an approval, what does undo mean, who is allowed. That belongs to your domain. onTaskClick hands you the task and its derived row — status, rolled-up span, progress, slip — and you open your own editor."
        code={`<Gantt
  tasks={plan}
  dependencies={links}
  onTaskClick={(task, row) => openEditor(task, row.status)}
/>

<Gantt tasks={plan} views={["month", "quarter", "year"]} />`}
      >
        <Clickable />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>10. Working time — shifts, holidays and split bars</h2>
      <CodeExample
        title="calendar"
        description="A factory does not work every hour, and until that is modelled every duration is wrong. Give the chart a calendar — working periods per weekday, plus dated exceptions for holidays, planned maintenance or one-off overtime — and three things change. Durations become working durations: a job given workingMinutes has its end derived through the calendar, so six hours starting Friday 16:00 finishes on MONDAY rather than at Friday 22:00. Bars break across the time nobody is working instead of drawing straight through it, and the gap is transparent so the shaded column shows through. And the shading itself comes from the calendar rather than from a weekend-and-nine-to-five guess. Switch to Day below to see the shift and its lunch break. Pass no calendar and none of this happens — no calendar means a 24/7 one, which is exactly the behaviour every other section on this page shows."
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
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <Gantt
            tasks={SHOP}
            dependencies={SHOP_LINKS}
            calendar={PLANT}
            now={SHOP_NOW}
            defaultDate={SHOP_NOW}
            defaultView="week"
          />
          <Gantt
            tasks={SHOP}
            dependencies={SHOP_LINKS}
            calendar={PLANT}
            now={SHOP_NOW}
            defaultDate={SHOP_NOW}
            defaultView="day"
          />
          {/* The four-hour overtime job on its own, so fit lands in the HOUR
              band — the resolution a shop floor actually schedules at, and the
              one a day-wide padding floor used to make unreachable. The shaded
              columns either side are the hours the plant is shut. */}
          <Gantt tasks={[SHOP[0].children![3]]} calendar={PLANT} now={SHOP_NOW} />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>11. Loading and empty</h2>
      <CodeExample
        title="loading / emptyState"
        description="The skeleton is staggered rather than a stack of equal bars, because the shape is the information: a schedule that loads as a table reads as the wrong component for a second. The toolbar is not drawn over either state — Previous, Today and Next cannot change anything the user can see when there is nothing to see, and a dead control is worse than no control."
        code={`<Gantt tasks={[]} loading />
<Gantt tasks={[]} />                     // the default empty surface
<Gantt tasks={[]} emptyState={<MyOwnEmpty />} />`}
      >
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <Gantt tasks={[]} loading now={NOW} defaultDate={NOW} />
          <Gantt tasks={[]} now={NOW} defaultDate={NOW} />
        </div>
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>12. 840 rows, 26 of them in the DOM</h2>
      <CodeExample
        title="Windowing, and the keyboard that has to survive it"
        description="Rows are windowed always, at every size — only the screenful under the viewport is mounted, and the spacers above and below keep the scrollbar measuring the whole plan rather than the window. There is no threshold, deliberately: a threshold would mean the windowed path is the one no demo and no check ever exercises, and production is the first thing to try it. The connector layer is the exception and is drawn whole, because a link between two off-screen tasks still routes through the band you can see, and culling it would blink arrows in and out as their endpoints scrolled away. This is also the only section where windowing and keyboard navigation meet: press Ctrl+End here and focus has to move to a row that is not in the document yet, which means scrolling it in, re-rendering, and then focusing it. Get that wrong and focus lands on the page body — from where the next Tab restarts at the top of the document, stranding whoever was reading row 800."
        code={`// Nothing to switch on. 840 rows or 8, the same component:
<Gantt tasks={plan} />

// Ctrl+End      last row of the plan, scrolled in and focused
// PageDown      one screenful at a time`}
      >
        <Gantt tasks={BIG_PLAN} now={NOW} defaultExpanded={["w0", "w1"]} />
      </CodeExample>
    </section>
  </div>
);

export default NewGanttDemo;
