import * as React from "react";
import {
  ProductionSchedule,
  type ProductionOperation,
  type ProductionResource,
} from "./production-schedule/production-schedule";
import type { GanttCalendar, GanttDependency } from "@algorisys/zen-ui-core";
import { CodeExample } from "./demo-helpers";

/* A fixed reference instant, so the page reads the same on any date and a probe
   has something to assert against. 2026-07-20 is a Monday. */
const NOW = new Date(2026, 6, 21, 10, 30, 0, 0);
const on = (day: number, h: number, m = 0) => new Date(2026, 6, day, h, m, 0, 0);

/* A single-shift plant: 06:00-17:00 Monday to Friday with an hour off at noon,
   shut at weekends, closed on the 22nd for planned maintenance, working a
   Saturday morning on the 25th. */
const SHIFT = [
  { from: 6 * 60, to: 12 * 60 },
  { from: 13 * 60, to: 17 * 60 },
];
const PLANT: GanttCalendar = {
  week: [[], SHIFT, SHIFT, SHIFT, SHIFT, SHIFT, []],
  exceptions: [
    { date: new Date(2026, 6, 22), periods: [] },
    { date: new Date(2026, 6, 25), periods: [{ from: 8 * 60, to: 12 * 60 }] },
  ],
};

/* A furnace runs continuously — it does not stop for lunch or the weekend, and
   giving it its own calendar is the whole reason resources carry one. */
const CONTINUOUS: GanttCalendar = {
  id: "24/7",
  week: Array.from({ length: 7 }, () => [{ from: 0, to: 1440 }]),
};

const CELLS: ProductionResource[] = [
  {
    id: "mach",
    name: "Machining",
    subtitle: "Cell A",
    children: [
      { id: "cnc3", name: "CNC-3", subtitle: "Mazak 450" },
      // Two operators, so two jobs at once is capacity, not an overload.
      { id: "cnc4", name: "CNC-4", subtitle: "Mazak 450", capacity: 2 },
    ],
  },
  { id: "furnace", name: "Furnace 2", subtitle: "continuous", calendar: CONTINUOUS },
  { id: "grind", name: "Grinding", subtitle: "Cell B" },
  { id: "insp", name: "Inspection", subtitle: "CMM" },
];

const JOBS: ProductionOperation[] = [
  { id: "j1", resourceId: "cnc3", name: "Housing · op 10", order: "WO-4471", start: on(20, 6), setupMinutes: 45, runMinutes: 240, percentComplete: 100 },
  { id: "j2", resourceId: "cnc3", name: "Housing · op 20", order: "WO-4471", start: on(20, 13), setupMinutes: 30, runMinutes: 300, percentComplete: 100 },
  // A changeover that starts at 16:30 on a shift ending at 17:00 finishes the
  // next morning — and the run has not begun.
  { id: "j3", resourceId: "cnc3", name: "Bracket · op 10", order: "WO-4482", start: on(21, 16, 30), setupMinutes: 45, runMinutes: 360, percentComplete: 20 },

  { id: "j4", resourceId: "cnc4", name: "Flange · op 10", order: "WO-4490", start: on(20, 6), setupMinutes: 20, runMinutes: 420, percentComplete: 100 },
  { id: "j5", resourceId: "cnc4", name: "Flange · op 20", order: "WO-4490", start: on(20, 9), runMinutes: 300, percentComplete: 80 },
  { id: "j6", resourceId: "cnc4", name: "Cover · op 10", order: "WO-4495", start: on(23, 6), setupMinutes: 60, runMinutes: 300, percentComplete: 0 },

  { id: "j7", resourceId: "furnace", name: "Heat treat", order: "WO-4471", start: on(21, 6), runMinutes: 900, percentComplete: 45 },
  { id: "j8", resourceId: "grind", name: "Grind + hone", order: "WO-4471", start: on(23, 8), setupMinutes: 30, runMinutes: 240, percentComplete: 0 },
  { id: "j9", resourceId: "insp", name: "CMM report", order: "WO-4471", start: on(24, 8), runMinutes: 120, percentComplete: 0 },
  // Booked onto the Saturday overtime window — a real bar, not a data error.
  { id: "j10", resourceId: "grind", name: "Rework", order: "WO-4460", start: on(25, 8), end: on(25, 12), percentComplete: 0 },
];

/** The routing: op 10 finishes, op 20 starts, across resources. */
const ROUTING: GanttDependency[] = [
  { from: "j1", to: "j2" },
  { from: "j2", to: "j7" },
  { from: "j7", to: "j8" },
  { from: "j8", to: "j9" },
  { from: "j4", to: "j5", type: "start-to-start" },
];

/* The same cell, deliberately over-committed: three jobs on a ONE-operator
   machine at the same moment. */
const SQUEEZED: ProductionResource[] = [{ id: "cnc3", name: "CNC-3", subtitle: "Mazak 450" }];
const SQUEEZED_JOBS: ProductionOperation[] = [
  { id: "s1", resourceId: "cnc3", name: "Housing", order: "WO-4471", start: on(20, 6), runMinutes: 480, percentComplete: 60 },
  { id: "s2", resourceId: "cnc3", name: "Bracket", order: "WO-4482", start: on(20, 8), runMinutes: 300, percentComplete: 10 },
  { id: "s3", resourceId: "cnc3", name: "Cover", order: "WO-4495", start: on(20, 9), runMinutes: 240, percentComplete: 0 },
];

/** Section 4: a live click handler, so the section is not a dead control. */
const Clickable = () => {
  const [picked, setPicked] = React.useState("Nothing picked yet");
  /* `w-full` is load-bearing: `.example-preview` is a flex row, so a wrapper
     without it is content-sized and the fit axis has nothing stable to
     measure — see the trap noted in the component. */
  return (
    <div className="zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2">
      <ProductionSchedule
        resources={CELLS}
        operations={JOBS}
        dependencies={ROUTING}
        calendar={PLANT}
        now={NOW}
        onOperationClick={(operation) =>
          setPicked(`${operation.name}${operation.order ? ` · ${operation.order}` : ""}`)
        }
      />
      <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg" aria-live="polite">
        {picked}
      </p>
    </div>
  );
};

const NewProductionScheduleDemo = () => (
  <div className="demo-page">
    <h1>ProductionSchedule</h1>
    <p className="lede">
      What each machine is doing, and whether it can. Work centres down, the
      shop clock across, and a load histogram underneath that measures booked
      time against the hours the plant actually has.
    </p>

    <section className="demo-section">
      <h2>1. Machines down, the shop clock across</h2>
      <CodeExample
        title="resources + operations, not tasks"
        description="A row here is a work centre, not a task, and it holds a sequence of operations rather than one bar. That is why this is a separate component from Gantt rather than a mode of it: half the props would be inapplicable in each mode, and no flag describes both. What the two share is everything that does not depend on what a row is — the axis, the frozen pane, row windowing, the routing overlay and the keyboard model all come from one internal renderer, and the working-time arithmetic from one core module. Resources nest, and a collapsed line carries every operation booked anywhere beneath it, so folding a cell up shows the cell's real load instead of an empty strip."
        code={`const cells = [
  { id: "mach", name: "Machining", children: [
    { id: "cnc3", name: "CNC-3" },
    { id: "cnc4", name: "CNC-4", capacity: 2 },   // two operators
  ]},
  { id: "furnace", name: "Furnace 2", calendar: continuous },
];

const jobs = [
  { id: "j1", resourceId: "cnc3", name: "Housing · op 10",
    order: "WO-4471", start: at(20, 6), setupMinutes: 45, runMinutes: 240 },
];

<ProductionSchedule resources={cells} operations={jobs} calendar={plant} />`}
      >
        <ProductionSchedule
          resources={CELLS}
          operations={JOBS}
          dependencies={ROUTING}
          calendar={PLANT}
          now={NOW}
        />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>2. Setup is time the machine is busy making nothing</h2>
      <CodeExample
        title="setupMinutes"
        description="A changeover occupies the machine and produces nothing, so it is drawn as its own hatched block at the head of the booking rather than folded into the run — and it is counted in the load. A plant that measures only run time reports itself less busy than it is by exactly its changeovers, which is the number capacity planning turns on. The hatch rather than a second colour is deliberate: another solid tone reads as a second job. Both setup and run resolve through the calendar, which is the whole argument for the working-time model existing first — a 45-minute changeover starting at 16:30 on a shift that ends at 17:00 does not finish at 17:15, it finishes at 06:15 the next morning, and the run has not started. Wall-clock arithmetic reports that job done before anybody arrives."
        code={`// The machine is claimed from 16:30. Setup runs out the shift and resumes
// at 06:15; the run starts there, not at 17:15.
{ id: "j3", resourceId: "cnc3", name: "Bracket · op 10",
  start: at(21, 16, 30), setupMinutes: 45, runMinutes: 360 }`}
      >
        <ProductionSchedule
          resources={[CELLS[0].children![0]]}
          operations={JOBS.filter((j) => j.resourceId === "cnc3")}
          calendar={PLANT}
          now={NOW}
          defaultView="day"
          defaultDate={new Date(2026, 6, 21)}
        />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>3. Capacity, overload, and the difference between them</h2>
      <CodeExample
        title="capacity, lanes and the load histogram"
        description="Two jobs at once on a two-operator cell is capacity being used, not an overload — conflating overlap with overload is how a correct schedule gets painted red. A resource is overloaded when more of it is claimed at one instant than it has, which is a sweep over the bookings rather than a pairwise test: three jobs that overlap only two-at-a-time never claim more than two. Overlapping work is packed into lanes so a double-booking is two bars side by side rather than one drawn over the other, and every row in a chart is the same height because the row window is arithmetic and the routing arrows place their endpoints from it. The strip underneath is load per column: booked working time over available working time, clipped at 100% with the overflow drawn above the line, so 140% reads as 'more than there is' rather than as a taller bar with nothing to compare it against. A closed day has no utilisation at all — not 0%, which would claim the plant was idle rather than shut."
        code={`{ id: "cnc4", name: "CNC-4", capacity: 2 }   // two at once is fine

<ProductionSchedule resources={cells} operations={jobs}
                    calendar={plant} maxLanes={3} showLoad />`}
      >
        <ProductionSchedule
          resources={SQUEEZED}
          operations={SQUEEZED_JOBS}
          calendar={PLANT}
          now={NOW}
          defaultView="day"
          defaultDate={new Date(2026, 6, 20)}
        />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>4. Routing, and clicking an operation</h2>
      <CodeExample
        title="dependencies + onOperationClick"
        description="Routing links name operations rather than rows, and they arrive at the LANE the operation landed in — an arrow drawn to the middle of a three-lane row would miss every bar in it. A link whose endpoint has folded into a collapsed parent still draws, against the row it folded into. There is no drag-to-reschedule, and that is a deferred decision rather than a settled one: until the chart can show you the overload, a drag has nothing to aim at. Two consequences of the eventual answer are honoured already because they are cheaper kept than retrofitted — the component is fully controlled, and conflicts are computed and reported rather than enforced. Overtime gets authorised and due dates get renegotiated; a component that refused the booking would be wrong in every plant whose rules differ from the ones we guessed."
        code={`const routing = [
  { from: "j1", to: "j2" },                        // op 10 -> op 20
  { from: "j4", to: "j5", type: "start-to-start" },
];

<ProductionSchedule
  resources={cells}
  operations={jobs}
  dependencies={routing}
  onOperationClick={(op) => openJobCard(op)}
/>`}
      >
        <Clickable />
      </CodeExample>
    </section>

    <section className="demo-section">
      <h2>5. Loading and empty</h2>
      <CodeExample
        title="loading / emptyState"
        description="The skeleton draws two blocks per row rather than one long bar, because a machine's day is a sequence and a single bar reads as the wrong component for a second. The toolbar is not drawn over either state: Previous, Today and Next cannot change anything the user can see when there is nothing to see."
        code={`<ProductionSchedule resources={[]} operations={[]} loading />
<ProductionSchedule resources={[]} operations={[]} />`}
      >
        <div className="zen-flex zen-w-full zen-flex-col zen-gap-4">
          <ProductionSchedule resources={[]} operations={[]} loading now={NOW} />
          <ProductionSchedule resources={[]} operations={[]} now={NOW} />
        </div>
      </CodeExample>
    </section>
  </div>
);

export default NewProductionScheduleDemo;
