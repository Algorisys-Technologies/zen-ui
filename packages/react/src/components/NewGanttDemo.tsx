import * as React from "react";
import { Gantt, type GanttTask } from "./gantt/gantt";
import type { GanttDependency } from "@algorisys/zen-ui-core";
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

/** Section 5: a live click handler, so the section is not a dead control. */
const Clickable = () => {
  const [picked, setPicked] = React.useState("Nothing picked yet");
  return (
    <div className="zen-flex zen-flex-col zen-gap-2">
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

/** Section 2: collapsing a parent, driven from outside the component. */
const Collapsible = () => {
  const [expanded, setExpanded] = React.useState<string[]>(["p1", "p2", "p3"]);
  return (
    <div className="zen-flex zen-flex-col zen-gap-2">
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

<Gantt tasks={plan} defaultView="month" />`}
      >
        <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} defaultView="month" />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. The hierarchy collapses, and the arrows survive it</h2>
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
      <h2>3. Dependencies</h2>
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
      <h2>4. Slip, and the colour that follows from it</h2>
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
      <h2>5. Quarter and year, for a plan that outlasts a month</h2>
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
      <h2>6. Clicking a task</h2>
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
      <h2>7. Loading and empty</h2>
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
  </div>
);

export default NewGanttDemo;
