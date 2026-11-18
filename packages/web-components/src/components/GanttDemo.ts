import type { GanttCalendar, GanttDependency, GanttDependencyStyle, GanttRow, GanttTask } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

const tagged = (testid: string, child: Node, opts: { maxWidth?: string; dir?: string; vars?: Record<string, string> } = {}): HTMLElement => {
  const box = document.createElement("div");
  box.className = "zen-w-full";
  box.setAttribute("data-testid", testid);
  if (opts.maxWidth) box.style.maxWidth = opts.maxWidth;
  if (opts.dir) box.dir = opts.dir;
  for (const [k, v] of Object.entries(opts.vars ?? {})) box.style.setProperty(k, v);
  box.append(child);
  return box;
};

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

/* The legend is the caller's to draw — only the caller knows what the kinds
   are called. A swatch is a stripe for a shift and a line for a kind of link. */
const legend = (items: { label: string; swatch: Node }[]): HTMLElement => {
  const list = document.createElement("ul");
  list.className = "zen-flex zen-flex-wrap zen-gap-x-4 zen-gap-y-1 zen-text-xs zen-text-zen-muted-fg";
  for (const item of items) {
    const li = document.createElement("li");
    li.className = "zen-flex zen-items-center zen-gap-1.5";
    li.append(item.swatch, item.label);
    list.append(li);
  }
  return list;
};
const stripe = (colour: string): Node => {
  const s = document.createElement("span");
  s.setAttribute("aria-hidden", "true");
  s.className = "zen-inline-block zen-h-3 zen-w-1 zen-rounded-zen-sm";
  s.style.backgroundColor = colour;
  return s;
};
const line = (style: GanttDependencyStyle): Node => {
  const NS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "24");
  svg.setAttribute("height", "6");
  const l = document.createElementNS(NS, "line");
  for (const [k, v] of Object.entries({ x1: "0", y1: "3", x2: "24", y2: "3", "stroke-width": "1.5" })) l.setAttribute(k, v);
  if (style.color) l.setAttribute("stroke", style.color);
  if (style.dash) l.setAttribute("stroke-dasharray", style.dash);
  svg.append(l);
  return svg;
};

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
      {
        title: "13. Row height, chart height and colours",
        codeTitle: "row-height, max-body-height, header-class-name, rowClassName, barClassName",
        codeDescription:
          "row-height sets every row (one value: the row window and the arrows place rows at index × height, so they cannot differ). max-body-height replaces the 32rem the chart scrolls after. rowClassName tints a task's row; barClassName colours a bar and wins over its status colours — here Mei's work in purple, and the phases' rows shaded. header-class-name styles the header row and its frozen pane. The small print (subtitles, percentages) follows --zen-schedule-label-font-size.",
        code: `<zen-gantt row-height="48" max-body-height="300"
  header-class-name="zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"></zen-gantt>

<script>
  chart.rowClassName = (t) => t.children && "zen-bg-zen-muted";
  chart.barClassName = (t) => t.assignees?.some((a) => a.id === "u3") && "zen-bg-zen-accent-purple zen-border-zen-accent-purple";
</script>`,
        render: () => {
          const chart = gantt({
            tasks: PLAN,
            dependencies: LINKS,
            now: NOW,
            defaultDate: NOW,
            rowClassName: (t: GanttTask) => (t.children ? "zen-bg-zen-muted" : undefined),
            barClassName: (t: GanttTask) => t.assignees?.some((a) => a.id === MEI.id) && "zen-bg-zen-accent-purple zen-border-zen-accent-purple",
          });
          chart.setAttribute("row-height", "48");
          chart.setAttribute("max-body-height", "300");
          chart.setAttribute("header-class-name", "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg");
          return tagged("gantt-styled", chart, { vars: { "--zen-schedule-label-font-size": "11px" } });
        },
      },
      {
        title: "14. Density",
        codeTitle: 'density: "compact" | "comfortable" | "touch"',
        codeDescription:
          "compact: 28px rows for a long plan read all day. touch: 48px rows and 32px bars, for a tablet on the shop floor. rowHeight, when given, wins. Opt-in, per component: it does not follow data-density, so a page that already sets that sees nothing move here. comfortable is the default and is the size it always was.",
        code: `<zen-gantt density="compact"></zen-gantt>
<zen-gantt density="touch"></zen-gantt>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          box.append(tagged("gantt-compact", (() => { const c = gantt({ tasks: PLAN, dependencies: LINKS, now: NOW, defaultDate: NOW }); c.setAttribute("density", "compact"); return c; })()), tagged("gantt-touch", (() => { const c = gantt({ tasks: PLAN, dependencies: LINKS, now: NOW, defaultDate: NOW }); c.setAttribute("density", "touch"); return c; })()));
          return box;
        },
      },
      {
        title: '15. Colour by your own data: shifts and kinds of link',
        codeTitle: 'rowClassName, barAccent, dependencyStyle, kind on a dependency',
        codeDescription:
          "Three channels, each driven by data the component never interprets, and each optional — use one, two or all three. rowClassName (a property, like every callback here) tints the row's timeline band (here, by the shift the operation runs on). barAccent returns a CSS colour for a stripe on the bar's leading edge, so the status fill keeps saying what it said; it is a value rather than a class so the colour can come from your records. A dependency can carry a kind of your own naming, and dependencyStyle turns it into a colour and a dash: here, the next step of the same order against a wait on another order. Give every kind a dash as well as a colour, because red already means late. The legend is yours to draw: only you know what the kinds are called.",
        code: `<zen-gantt id="plan" default-view="week"></zen-gantt>
<script>
  const band = {
    GS: "zen-bg-[color-mix(in_srgb,var(--zen-color-accent-orange)_12%,transparent)]",
    S2: "zen-bg-[color-mix(in_srgb,var(--zen-color-accent-purple)_12%,transparent)]",
  };
  const colour = { GS: "var(--zen-color-accent-orange)", S2: "var(--zen-color-accent-purple)" };
  const linkStyle = {
    sequence: { color: "var(--zen-color-info)" },
    dependency: { color: "var(--zen-color-accent-magenta)", dash: "4 3" },
  };
  const chart = document.querySelector("#plan");
  chart.tasks = operations;
  chart.dependencies = [
    { from: "a1", to: "a2", kind: "sequence" },
    { from: "a3", to: "b3", kind: "dependency" },
  ];
  chart.rowClassName = (t) => band[shiftOf[t.id]];
  chart.barAccent = (t) => colour[shiftOf[t.id]];
  chart.dependencyStyle = (link) => linkStyle[link.kind];
</script>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-flex zen-w-full zen-flex-col zen-gap-3";
          box.setAttribute("data-testid", "gantt-data-colours");
          const chart = gantt({
            tasks: MES,
            dependencies: MES_LINKS,
            now: SHOP_NOW,
            defaultDate: shopAt(21, 0),
            rowClassName: (t: GanttTask) => SHIFT_BAND[MES_SHIFT[t.id]],
            barAccent: (t: GanttTask) => SHIFT_COLOUR[MES_SHIFT[t.id]],
            dependencyStyle: (link: GanttDependency) => (link.kind ? LINK_STYLE[link.kind] : undefined),
          });
          chart.setAttribute("default-view", "week");
          box.append(
            legend([
              { label: "General shift (GS)", swatch: stripe(SHIFT_COLOUR.GS) },
              { label: "Second shift (S2)", swatch: stripe(SHIFT_COLOUR.S2) },
              { label: "Next step, same order", swatch: line(LINK_STYLE.sequence) },
              { label: "Waits on another order", swatch: line(LINK_STYLE.dependency) },
            ]),
            chart,
          );
          return box;
        },
      },
      {
        title: "16. Date context above the columns",
        codeTitle: "header-groups",
        codeDescription:
          "A second header row says which date, month or year the columns belong to: the date above hours, the month above days or weeks, the year above months. Each label is sticky just past the frozen pane, so it stays on screen while its columns scroll sideways, and a planner following an order across weeks never has to look up to the toolbar. The first chart is a Week view of 29 June to 5 July, a week split across two months. The second is Fit over the whole plan. With groups on, the per-column hint that used to repeat the month or year at each boundary is dropped; the group row says it once. Off by default, so an existing chart's header does not change.",
        code: `<zen-gantt tasks='[…]' header-groups default-view="week" default-date="2026-07-01"></zen-gantt>
<zen-gantt tasks='[…]' header-groups></zen-gantt>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          box.setAttribute("data-testid", "gantt-header-groups");
          const week = gantt({ tasks: PLAN, dependencies: LINKS, now: NOW, defaultDate: at(1) });
          week.setAttribute("default-view", "week");
          week.setAttribute("header-groups", "");
          const fit = gantt({ tasks: PLAN, dependencies: LINKS, now: NOW });
          fit.setAttribute("header-groups", "");
          box.append(week, fit);
          return box;
        },
      },
      {
        title: "17. One continuous timeline: the view is the zoom",
        codeTitle: "continuous",
        codeDescription:
          "With continuous on, the whole plan is one timeline you scroll sideways, and Day, Week, Month, Quarter and Year set how far you are zoomed in rather than which single period is shown. A bar is never cut off at the edge of a week, so an order can be followed from start to finish. Previous and Next scroll by one period from what is on screen, Today scrolls to now, and the title names the period in the middle of the screen. The date row above the columns is on by default here, because a scrolled timeline needs it. Only the columns near the screen are drawn, so even an hourly zoom over weeks stays light. The first chart is the July plan at Week zoom, the second a plan spanning months at Month zoom.",
        code: `<zen-gantt tasks='[…]' continuous default-view="week"></zen-gantt>
<zen-gantt tasks='[…]' continuous default-view="month"></zen-gantt>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-flex zen-w-full zen-flex-col zen-gap-4";
          box.setAttribute("data-testid", "gantt-continuous");
          // No header-groups attribute on purpose: continuous turns the row on.
          const week = gantt({ tasks: PLAN, dependencies: LINKS, now: NOW, defaultDate: NOW, maxBodyHeight: 320 });
          week.setAttribute("continuous", "");
          week.setAttribute("default-view", "week");
          const month = gantt({ tasks: LONG_PLAN, dependencies: LONG_LINKS, now: NOW, defaultDate: NOW, maxBodyHeight: 320 });
          month.setAttribute("continuous", "");
          month.setAttribute("default-view", "month");
          box.append(week, month);
          return box;
        },
      },
    ],
  });
}
