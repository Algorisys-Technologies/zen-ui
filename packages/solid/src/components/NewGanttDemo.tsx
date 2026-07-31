import { createSignal } from "solid-js";
import { Gantt, type GanttTask } from "./gantt/gantt";
import type { GanttDependency } from "@algorisys/zen-ui-core";
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
  const [picked, setPicked] = createSignal("Nothing picked yet");
  return (
    <div class="zen-flex zen-flex-col zen-gap-2">
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
      <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        {picked()}
      </p>
    </div>
  );
};

/** Section 2: collapsing a parent, driven from outside the component. */
const Collapsible = () => {
  const [expanded, setExpanded] = createSignal<string[]>(["p1", "p2", "p3"]);
  return (
    <div class="zen-flex zen-flex-col zen-gap-2">
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

<Gantt tasks={plan} defaultView="month" />`}
    >
      <Gantt tasks={PLAN} dependencies={LINKS} now={NOW} defaultDate={NOW} defaultView="month" />
    </DemoSection>

    <DemoSection
      title="2. The hierarchy collapses, and the arrows survive it"
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
      title="3. Dependencies"
      codeTitle="Four kinds, routed around the bars"
      codeDescription="A dependency is two ids and a kind. Finish-to-start is the default and the common one — B cannot begin until A is done — and start-to-start, finish-to-finish and start-to-finish join the other ends. A link whose successor starts before its predecessor finishes has to double back, so it turns in the gutter between the two rows instead of cutting a straight line through everything in between. A dependency naming a task with no bar, because it has no dates or is entirely outside the view, draws nothing: a line running off the edge of the chart reads as a task that starts off-screen."
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
    </DemoSection>

    <DemoSection
      title="4. Slip, and the colour that follows from it"
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
      title="5. Three views, and clicking a task"
      codeTitle="It renders the plan; it does not reschedule it"
      codeDescription="Day is hours, week is days, month is days — the same axis PlanningCalendar uses, from the same functions, so the two cannot disagree about where a date is. There is no drag-to-move, no drag-to-resize and no pulling a new dependency between two bars. Moving a task in a real plan cascades through its successors, and what should happen then is a policy question: does it push the whole chain, does it need an approval, what does undo mean, who is allowed. That belongs to your domain. onTaskClick hands you the task and its derived row — status, rolled-up span, progress, slip — and you open your own editor."
      code={`<Gantt
  tasks={plan}
  dependencies={links}
  onTaskClick={(task, row) => openEditor(task, row.status)}
/>

<Gantt tasks={plan} views={["week", "month"]} defaultView="week" />`}
    >
      <Clickable />
    </DemoSection>

    <DemoSection
      title="6. Loading and empty"
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
  </DemoPage>
);

export default NewGanttDemo;
