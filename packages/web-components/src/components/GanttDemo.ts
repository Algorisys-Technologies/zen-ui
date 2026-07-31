import type { GanttCalendar, GanttDependency, GanttRow, GanttTask } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Every chart below is a <zen-gantt>, built the way a framework template binds
 * one: attributes for the primitives, PROPERTIES for the trees and the
 * callbacks. `tasks` has a json attribute too — an author writing markup by
 * hand needs one — but a demo that already holds real Dates has nothing to gain
 * from serialising them to ISO and having the element parse them back.
 */
type GanttEl = HTMLElement & Record<string, unknown>;

const gantt = (props: Record<string, unknown>): GanttEl => {
  const el = document.createElement("zen-gantt") as GanttEl;
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) el[key] = value;
  }
  return el;
};


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


/**
 * A chart plus a live readout under it.
 *
 * The interactive sections in the React and Solid demos are components holding
 * state; here they are a closure holding the same state and re-rendering the
 * one line that changed. `w-full` on the wrapper is load-bearing in all three:
 * the preview area is a flex row, so a content-sized wrapper leaves the fit
 * axis with nothing stable to measure.
 */
const withReadout = (
  initial: string,
  build: (say: (text: string) => void) => HTMLElement,
): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-min-w-0 zen-flex-col zen-gap-2";
  const note = document.createElement("p");
  note.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  note.setAttribute("aria-live", "polite");
  note.textContent = initial;
  wrap.append(build((text) => { note.textContent = text; }), note);
  return wrap;
};

export default function GanttDemo(): HTMLElement {
  return DemoPage({
    title: "Gantt",
    description:
      "What the project is doing, and what is waiting on what. A task tree on the left, the same rows as bars on a shared clock on the right, dependency arrows in between.",
    sections: [
      {
        title: "1. Tasks down, time across",
        codeTitle: "One scroller, not two panes",
        codeDescription:
          "The task pane is stuck to the inline start and the header to the top, so scrolling down moves both and scrolling sideways moves only the axis. Panes synced by a scroll listener drift by a row the first time a scrollbar appears, which is why there is only one here. A parent with no dates of its own gets a summary bar spanning its children, and a percentage weighted by their durations — an unweighted mean would let a one-day task cancel a ten-day one. The bar's fill is the percent complete and the number sits inside it, unless the bar is too narrow to hold it or the fill has already reached the end, in which case it moves outside where it is still readable.",
        code: `<zen-gantt tasks='[
  { "id": "p2", "name": "Build",
    "children": [
      { "id": "t5", "name": "Frontend", "start": "2026-07-17", "end": "2026-07-27",
        "percentComplete": 55, "baselineEnd": "2026-07-24" },
      { "id": "t6", "name": "Backend", "start": "2026-07-16", "end": "2026-07-25",
        "percentComplete": 70 }
    ]}
]'></zen-gantt>

<!-- Dates are ISO strings in markup and real Dates on the property; the
     element revives them, depth-first, before the maths sees them. -->`,
        render: () => gantt({ tasks: PLAN, dependencies: LINKS, now: NOW }),
      },
      {
        title: "2. Fit, and why it is the default",
        codeTitle: "An axis whose range comes from the data",
        codeDescription:
          "Every other view is a window onto a calendar: pick a month and you see that month, whether or not the plan is in it. This one takes its range from the tasks — the span of every task, padded, snapped outward to whole hours, days, weeks or months depending on how long the plan runs. So a plan opens showing its own shape rather than whichever month today falls in, and a plan that crosses New Year can be seen whole at all, which no calendar year can do. The granularity is chosen from the span by a pinned function in core rather than by a ternary in the renderer, and the columns are sized to the container. Notice what is missing from the toolbar: a fit axis has no anchor to move, so Previous, Today and Next are gone rather than disabled. Three buttons that visibly do nothing read as a broken chart.",
        code: `<zen-gantt tasks='[…]'></zen-gantt>                        <!-- fit is the default -->
<zen-gantt tasks='[…]' default-view="month"></zen-gantt>   <!-- or pin a window -->`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          wrap.append(
            gantt({ tasks: CROSS_YEAR, now: NOW }),
            gantt({ tasks: CROSS_YEAR, now: NOW, defaultDate: NOW, defaultView: "year" }),
          );
          return wrap;
        },
      },
      {
        title: "3. The hierarchy collapses, and the arrows survive it",
        codeTitle: "expanded / onExpandedChange",
        codeDescription:
          "Close a phase and its children fold into the summary bar. Their dependencies do not disappear with them: a link touching a hidden task is redrawn against the bar it folded into, and a dozen links that all end up between the same two summary bars collapse to one arrow rather than stacking. Dropping them instead would make a collapsed project look like a project with no dependencies at all. Leave expanded off entirely and everything opens, which is what a plan you have just loaded should look like.",
        code: `const chart = document.querySelector("zen-gantt");
chart.tasks = plan;
chart.dependencies = links;
chart.expanded = ["p1", "p2", "p3"];
chart.addEventListener("zen-expanded-change", (e) => {
  chart.expanded = e.detail;   // controlled: the page owns which are open
});`,
        render: () =>
          withReadout("Open: p1, p2, p3", (say) => {
            const chart = gantt({
              tasks: PLAN,
              dependencies: LINKS,
              now: NOW,
              defaultDate: NOW,
              defaultView: "month",
              expanded: ["p1", "p2", "p3"],
              /* Controlled, and the loop is a property assignment rather than
                 an update() call — which is the whole difference between this
                 binding and the vanilla one it wraps. */
              onExpandedChange: (ids: string[]) => {
                chart.expanded = ids;
                say(`Open: ${ids.length === 0 ? "nothing" : ids.join(", ")}`);
              },
            });
            return chart;
          }),
      },
      {
        title: "4. Dependencies",
        codeTitle: "Four kinds, routed around the bars",
        codeDescription:
          "A dependency is two ids and a kind. Finish-to-start is the default and the common one — B cannot begin until A is done — and start-to-start, finish-to-finish and start-to-finish join the other ends. A link whose successor starts before its predecessor finishes has to double back, so it turns in the gutter between the two rows instead of cutting a straight line through everything in between. A dependency naming a task with no bar draws nothing: a line running off the edge of the chart reads as a task that starts off-screen.",
        code: `<zen-gantt
  tasks='[…]'
  dependencies='[
    { "from": "t4", "to": "t5" },
    { "from": "t4", "to": "t6", "type": "start-to-start" }
  ]'
></zen-gantt>`,
        render: () =>
          gantt({
            tasks: PLAN,
            dependencies: LINKS,
            now: NOW,
            defaultDate: NOW,
            defaultView: "month",
            expanded: ["p2"],
          }),
      },
      {
        title: "5. Slip, and the colour that follows from it",
        codeTitle: "baselineEnd, and the derived status",
        codeDescription:
          "Give a task the date the plan originally promised and the row reports the difference in whole calendar days: 'On time', '+5d', '-2d'. Whole days rather than hours, so finishing at 18:00 instead of 09:00 on the same date is not late and a daylight-saving boundary cannot turn two days into 1.96. The bar's colour follows from the same reading, and the order it resolves in is the whole point: finished beats late, so a task delivered after its baseline is complete rather than red — the slip is already said by the chip. Late beats not-started, so a task that is 0% done and a week past due is the most urgent row on the chart instead of the quietest.",
        code: `{ "id": "t2", "name": "Field research",
  "start": "2026-07-03", "end": "2026-07-10",
  "baselineEnd": "2026-07-08" }   → "+2d", and a delayed bar until it hits 100%`,
        render: () =>
          gantt({ tasks: PLAN, dependencies: LINKS, now: NOW, defaultDate: NOW, defaultView: "month" }),
      },
      {
        title: "6. Quarter and year, for a plan that outlasts a month",
        codeTitle: "A whole project, at the granularity that fits it",
        codeDescription:
          "A month is the widest view a calendar needs and the narrowest a plan does. Quarter draws week columns, year draws month columns. Both have columns of UNEQUAL length — a quarter begins on the 1st, which is almost never a Monday, so its first and last weeks are partial, and months are 28 to 31 days. Each column is therefore drawn at its own share of the axis rather than at one uniform width. That is not a detail: uniform month columns walk every bar off its gridline by up to three days across a year, while looking perfectly reasonable.",
        code: `<zen-gantt tasks='[…]' dependencies='[…]' default-view="year"></zen-gantt>
<zen-gantt tasks='[…]' default-view="quarter"></zen-gantt>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          wrap.append(
            gantt({ tasks: LONG_PLAN, dependencies: LONG_LINKS, now: NOW, defaultDate: NOW, defaultView: "year" }),
            gantt({ tasks: LONG_PLAN, dependencies: LONG_LINKS, now: NOW, defaultDate: NOW, defaultView: "quarter" }),
          );
          return wrap;
        },
      },
      {
        title: "7. The pane gives way before the axis does",
        codeTitle: "columns",
        codeDescription:
          "Task, Assignees, Status and Variance are 436px of frozen pane, and a year axis wants around 960 more — so a normal page width used to scroll sideways before anybody had done anything, and the columns pushed off were whichever ones happened to be last. Now the pane sheds them on purpose. List the ones you want and the order is a PREFERENCE order, not just a set: what you list last is the first to go when the container cannot hold both the pane and a usable axis. The Task column is never dropped, because a schedule with no task names is not a narrower schedule.",
        code: `<zen-gantt tasks='[…]' columns='["name", "status"]'></zen-gantt>
<zen-gantt tasks='[…]'></zen-gantt>   <!-- or let the container decide -->`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          const narrow = document.createElement("div");
          narrow.style.maxWidth = "800px";
          narrow.append(gantt({ tasks: LONG_PLAN, dependencies: LONG_LINKS, now: NOW }));
          wrap.append(
            gantt({ tasks: LONG_PLAN, dependencies: LONG_LINKS, now: NOW, columns: ["name", "status"] }),
            narrow,
          );
          return wrap;
        },
      },
      {
        title: "8. Keyboard: one tab stop, arrows inside",
        codeTitle: "Grid navigation over a windowed chart",
        codeDescription:
          "Tab reaches the chart once and leaves it once, however many rows it has — at 10,000 rows the old tab-through-the-bars model put 10,000 stops between a reader and whatever came after the chart. Inside, the arrow keys move a cell: up and down a row, left and right a column, Home and End to the ends of the row, Ctrl+Home and Ctrl+End to the ends of the plan, PageUp and PageDown a screenful. On the first column the forward arrow expands a closed phase and the backward arrow collapses an open one. Enter or Space activates the row. The hard part is invisible: rows are windowed, so moving to a row that is not in the DOM has to scroll it in, rebuild the band, and then focus it — get that wrong and focus lands on the page body and the next Tab restarts from the top of the document. Arrow keys follow the visual direction, so they still point the way they are drawn under RTL.",
        code: `<zen-gantt tasks='[…]'></zen-gantt>

chart.addEventListener("zen-task-click", (e) => open(e.detail[0]));

// Arrow keys       move one cell
// Home / End       first / last cell in the row
// Ctrl+Home / End  first / last row of the plan
// Enter / Space    zen-task-click`,
        render: () =>
          withReadout("Tab to the chart, then use the arrow keys", (say) =>
            gantt({
              tasks: LONG_PLAN,
              dependencies: LONG_LINKS,
              now: NOW,
              onTaskClick: (task: GanttTask) => say(`Activated: ${task.name}`),
            }),
          ),
      },
      {
        title: "9. Clicking a task",
        codeTitle: "It renders the plan; it does not reschedule it",
        codeDescription:
          "There is no drag-to-move, no drag-to-resize and no pulling a new dependency between two bars. Moving a task in a real plan cascades through its successors, and what should happen then is a policy question: does it push the whole chain, does it need an approval, what does undo mean, who is allowed. That belongs to your domain. onTaskClick hands you the task and its derived row — status, rolled-up span, progress, slip — and you open your own editor.",
        code: `chart.addEventListener("zen-task-click", (event) => {
  // One CustomEvent carries one payload, so the detail is the PAIR —
  // the row is half the answer to "what did I just click".
  const [task, row] = event.detail;
  openEditor(task, row.status);
});`,
        render: () =>
          withReadout("Nothing picked yet", (say) =>
            gantt({
              tasks: PLAN,
              dependencies: LINKS,
              now: NOW,
              defaultDate: NOW,
              defaultView: "month",
              onTaskClick: (task: GanttTask, row: GanttRow<GanttTask>) =>
                say(
                  `${task.name} — ${row.status}${row.progress === null ? "" : `, ${Math.round(row.progress)}%`}`,
                ),
            }),
          ),
      },
      {
        title: "10. Working time — shifts, holidays and split bars",
        codeTitle: "calendar",
        codeDescription:
          "A factory does not work every hour, and until that is modelled every duration is wrong. Give the chart a calendar — working periods per weekday, plus dated exceptions for holidays, planned maintenance or one-off overtime — and three things change. Durations become working durations: a job given workingMinutes has its end derived through the calendar, so six hours starting Friday 16:00 finishes on MONDAY rather than at Friday 22:00. Bars break across the time nobody is working instead of drawing straight through it, and the gap is transparent so the shaded column shows through. And the shading itself comes from the calendar rather than from a weekend-and-nine-to-five guess. Pass no calendar and none of this happens — no calendar means a 24/7 one.",
        code: `<zen-gantt calendar='{
  "week": [[], shift, shift, shift, shift, shift, []],
  "exceptions": [
    { "date": "2026-07-22", "periods": [] },
    { "date": "2026-07-25", "periods": [{ "from": 480, "to": 720 }] }
  ]
}'></zen-gantt>

<!-- The exception dates are revived a level below the calendar, and the end is
     DERIVED: 6 working hours from Friday 16:00 lands on Monday. -->
{ "id": "j2", "name": "Heat treat", "start": "2026-07-24T16:00", "workingMinutes": 360 }`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          wrap.append(
            gantt({ tasks: SHOP, dependencies: SHOP_LINKS, calendar: PLANT, now: SHOP_NOW, defaultDate: SHOP_NOW, defaultView: "week" }),
            gantt({ tasks: SHOP, dependencies: SHOP_LINKS, calendar: PLANT, now: SHOP_NOW, defaultDate: SHOP_NOW, defaultView: "day" }),
            // The four-hour overtime job on its own, so fit lands in the HOUR
            // band — the resolution a shop floor actually schedules at.
            gantt({ tasks: [SHOP[0].children![3]], calendar: PLANT, now: SHOP_NOW }),
          );
          return wrap;
        },
      },
      {
        title: "11. Loading and empty",
        codeTitle: "loading / emptyState",
        codeDescription:
          "The skeleton is staggered rather than a stack of equal bars, because the shape is the information: a schedule that loads as a table reads as the wrong component for a second. The toolbar is not drawn over either state — Previous, Today and Next cannot change anything the user can see when there is nothing to see, and a dead control is worse than no control.",
        code: `<zen-gantt tasks="[]" loading></zen-gantt>
<zen-gantt tasks="[]"></zen-gantt>          <!-- the default empty surface -->`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          wrap.append(
            gantt({ tasks: [], loading: true, now: NOW, defaultDate: NOW }),
            gantt({ tasks: [], now: NOW, defaultDate: NOW }),
          );
          return wrap;
        },
      },
      {
        title: "12. 840 rows, 26 of them in the DOM",
        codeTitle: "Windowing, and the keyboard that has to survive it",
        codeDescription:
          "Rows are windowed always, at every size — only the screenful under the viewport is mounted, and the spacers above and below keep the scrollbar measuring the whole plan rather than the window. There is no threshold, deliberately: a threshold would mean the windowed path is the one no demo and no check ever exercises, and production is the first thing to try it. The connector layer is the exception and is drawn whole, because a link between two off-screen tasks still routes through the band you can see. This is also the only section where windowing and keyboard navigation meet: press Ctrl+End here and focus has to move to a row that is not in the document yet, which means scrolling it in, rebuilding the band, and then focusing it.",
        code: `<!-- Nothing to switch on. 840 rows or 8, the same element: -->
<zen-gantt tasks='[…]'></zen-gantt>

// Ctrl+End      last row of the plan, scrolled in and focused
// PageDown      one screenful at a time`,
        render: () => gantt({ tasks: BIG_PLAN, now: NOW, defaultExpanded: ["w0", "w1"] }),
      },
    ],
  });
}
