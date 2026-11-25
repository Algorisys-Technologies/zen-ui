<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# gantt-gantt — API (React, the parity reference)

Exports: `Gantt`, `GanttProps`, `GanttTask`, `GanttAssignee`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-gantt-gantt>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Gantt

- `tasks: GanttTask[]`
- `dependencies?: GanttDependency[] | undefined` — Links between tasks. Finish-to-start unless the link says otherwise.
- `showDependencies?: boolean | undefined` — Draw the connector layer. Default true.
- `dependencyStyle?: ((dependency: GanttDependency) => GanttDependencyStyle | undefined) | undefined` — The colour and dash of one dependency's arrow, from the caller's own data — typically its `kind`: `(d) => d.kind === "sequence" ? { color: "var(--zen-color-info)" } : { dash: "4 3" }`. Give each kind a dash as well as a colour; red already means late here. A link the plan breaks is still drawn red.
- `defaultView?: GanttView | undefined` — Uncontrolled starting view. Default "fit" — the axis takes its range from the tasks, so the plan opens whole instead of showing whichever calendar month today happens to fall in.
- `view?: GanttView | undefined` — Controlled view; pair with `onViewChange`.
- `onViewChange?: ((view: GanttView) => void) | undefined`
- `views?: GanttView[] | undefined` — Which views the switcher offers. Default all six.
- `defaultDate?: Date | undefined` — Any date inside the range to open on. Default today.
- `date?: Date | undefined` — Controlled anchor date; pair with `onDateChange`.
- `onDateChange?: ((date: Date) => void) | undefined`
- `expanded?: string[] | undefined` — Ids of the parents that are open. Controlled; pair with `onExpandedChange`. A parent not in the list is closed.
- `defaultExpanded?: string[] | undefined` — Uncontrolled starting set. Omit it and everything opens.
- `onExpandedChange?: ((ids: string[]) => void) | undefined`
- `onTaskClick?: ((task: GanttTask, row: GanttRow<GanttTask>) => void) | undefined`
- `calendar?: GanttCalendar | undefined` — When work can happen — shift patterns per weekday plus dated exceptions for holidays, planned maintenance and one-off overtime. With one supplied, durations become WORKING durations, bars break across non-working time instead of drawing through it, and the shaded columns are decided by this rather than by the weekend-and-nine-to-five default. Omit it and nothing changes: no calendar means a 24/7 one.
- `hourStep?: number | undefined` — Hours per column in the DAY view. Default 1. Set 0.25 for quarter-hour columns, which is the resolution a shop floor schedules at.
- `now?: Date | undefined` — Reference "now" for the marker, the today column and the derived status.
- `columnWidth?: number | undefined` — Nominal pixel width of one column — the axis is `columns × this`. In the quarter, year and fit views columns differ in length (a 28-day February is narrower than a 31-day January), so this sets the average rather than the literal width. Defaults to something readable per view. Setting it also opts the FIT view out of sizing itself to the container, which is the one thing that view exists to do — so pass it there only when you would rather scroll than let the columns choose their own width.
- `hideToolbar?: boolean | undefined` — Hide the toolbar when your page already has one.
- `columns?: GanttPaneColumn[] | undefined` — Which columns the frozen pane carries, and in what order. Default all four: `["name", "assignees", "status", "variance"]`. The order is a PREFERENCE order, not just a set. Four columns at their natural widths plus a year axis need about 1430px, so what you list last is what the pane sheds first when the container is too narrow to hold both it and a usable axis. The first entry is never dropped, and if even that plus the axis does not fit, the chart scrolls sideways as a last resort. Drop the two your data cannot fill and the pane stops costing you the timeline.
- `loading?: boolean | undefined` — Show skeleton rows instead of the chart.
- `loadingRows?: number | undefined` — How many skeleton rows. Default 6.
- `emptyState?: React.ReactNode` — Replaces the whole no-tasks surface.
- `rowHeight?: number | undefined` — Every row's height in px. Default 36. One value for all rows: the row window and the dependency arrows place rows at index × height.
- `maxBodyHeight?: string | number | undefined` — The chart's maximum height before it scrolls (px, or any CSS length). Default 32rem.
- `rowClassName?: ((task: GanttTask, row: GanttRow<GanttTask>) => string | undefined) | undefined` — Classes for a task's row — a tint for a critical or late task.
- `barClassName?: ((task: GanttTask) => string | undefined | false | null) | undefined` — Classes for a task's bar, applied after its status colours so they win: `(t) => t.team === "Design" && "zen-bg-zen-accent-purple zen-border-zen-accent-purple"`.
- `barAccent?: ((task: GanttTask) => string | undefined | false | null) | undefined` — A CSS colour for a stripe on the bar's leading edge — a second channel beside the status fill, for a shift, a line or a customer: `(t) => shiftColour[t.shift]`. A value rather than a class, so the colour can come from data. On a milestone it is a border inside the diamond, so the arrows still meet its points.
- `actualLayout?: GanttActualLayout | undefined` — Planned vs actual. A task with `actualStart` (and, once done, `actualEnd`) gets a second bar showing when the work really ran; its `start`/`end` stay the plan. Running work's bar ends at now. Nothing changes for a task without them. "strip" (default) keeps the planned bar where it always was and draws the actual one slim beneath it. "split" draws two equal bars, plan above.
- `deriveFromActuals?: boolean | undefined` — Let the actual dates drive status and slip. Default true: an actual end with no % stated is Complete, a running task is On track (or Delayed past its plan), and with no `baselineEnd` the variance is the actual finish against the planned end. An explicit `status`, `percentComplete` or `baselineEnd` still wins. False draws the actual bar and changes nothing else.
- `actualBarClassName?: ((task: GanttTask) => string | undefined | false | null) | undefined` — Classes for a task's actual bar, applied after its own: `(t) => "zen-opacity-60"`.
- `actualBarColor?: ((task: GanttTask) => string | undefined | false | null) | undefined` — A CSS colour for a task's actual bar. Default: the row's status colour. A value rather than a class, so the colour can come from data.
- `barLabel?: ((task: GanttTask, row: GanttRow<GanttTask>) => string | undefined | false | null) | undefined` — Text ON the planned bar, replacing its "60%": `(t, row) => \`Planned (6–12 Jul)\``. Drawn inside when it fits, beside the bar when it does not. Hidden from assistive tech — the bar's name already says its dates and progress.
- `actualBarLabel?: ((task: GanttTask, row: GanttRow<GanttTask>) => string | undefined | false | null) | undefined` — Text on the actual bar, as `barLabel`. A slim "strip" bar always puts it beside.
- `progressOn?: "planned" | "actual" | undefined` — Which bar carries the % fill — and with it the status colour. "planned" (default) is how it has always been. "actual" fills the actual bar and makes the plan a neutral reference; a task with no actual dates keeps its fill on the planned bar, since there is nowhere else to put it.
- `statusColor?: ((task: GanttTask, row: GanttRow<GanttTask>) => string | undefined | false | null) | undefined` — A CSS colour for a row's status, replacing the four-colour palette on its chip and bars — for statuses of your own ("On hold"), named with `statusLabel`: `(t) => t.onHold && "var(--zen-color-accent-purple)"`.
- `legend?: boolean | GanttLegendItem[] | undefined` — A key in the toolbar. `true` builds it from the chart — one entry per status label and colour on screen; an array draws exactly those entries (add "Planned" and "Actual" yourself if you restyle the bars).
- `monthColumns?: "week" | "day" | undefined` — What one column of the Month view is: "day" (default) or "week" — the month in calendar weeks, room for a label on every bar. The other views, Fit and a continuous axis are unaffected.
- `headerClassName?: string | undefined` — Classes for the header: the row and its frozen pane, applied after their own, so a caller's background and text colour win (`"zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"`).
- `headerGroups?: boolean | undefined` — A second header row giving the columns their date context: the date above hours, the month above days or weeks, the year above months. Each label stays in view while the axis scrolls sideways, so a planner following an order across weeks never has to look up to the toolbar for the month. Off by default: the header is then the single row it always was.
- `continuous?: boolean | undefined` — One continuous timeline over the whole plan, scrolled sideways: Day, Week, Month, Quarter and Year set the ZOOM instead of a one-period window, so a bar is never cut at a period edge and an order can be followed across weeks. Previous / Next / Today scroll; the title names the period in the middle of the screen. Turns `headerGroups` on unless it is set to false. Fit is continuous already and is unaffected. Off by default.
- `density?: Density | undefined` — How much room a row and its bar takes: "compact", "comfortable" (the default, and the size it always was) or "touch" (48px targets, for shop-floor tablets). Opt-in: it does not follow data-density, so setting that on a page moves nothing here. An explicit size prop wins over it.
- `className?: string | undefined`

### GanttTask (type)

- `name: string`
- `subtitle?: string | string[] | undefined` — Second line under the name.
- `assignees?: GanttAssignee[] | undefined`
- `statusLabel?: string | undefined` — Overrides the status chip's words. The colour still follows `status`.
- `children?: GanttTask[] | undefined`
- `id: string`
- `start?: Date | undefined` — Omit both dates on a summary row to have them rolled up from the children.
- `end?: Date | undefined`
- `milestone?: boolean | undefined` — A point in time rather than a span — a sign-off, a delivery, a gate. Its date is `start`, or `end` when that is the only one given; any duration is ignored. Drawn as a diamond on its date instead of a bar. Without this a task is never a milestone: a start-only task is half-entered data, and a start equal to its end stays a (very short) bar, exactly as before.
- `percentComplete?: number | undefined` — 0–100. Omit on a parent to have it averaged from the children.
- `workingMinutes?: number | undefined` — Duration in WORKING minutes. With a `start` and no `end`, the end is computed from the calendar — which is how a 6-hour job starting Friday 16:00 correctly finishes on Monday. Ignored when `end` is given, since an explicit end is a statement and a duration is a derivation. With no calendar in play this is elapsed minutes, because no calendar means a 24/7 one and the two are then the same number.
- `baselineEnd?: Date | undefined` — What the plan originally promised. Slip is measured against this.
- `actualStart?: Date | undefined` — When work really began. `start`/`end` stay the PLAN; these are what happened, and are drawn as a second bar under the planned one. Opt-in by data: a chart where no task sets them draws exactly as it always did. A start with no `actualEnd` is work in progress — its actual bar runs to now. An `actualEnd` with no `actualStart` is half-entered and ignored.
- `actualEnd?: Date | undefined` — When work really finished. See `actualStart`.
- `status?: GanttTaskStatus | undefined` — Overrides the derived status.

### GanttAssignee (type)

- `id: string`
- `name: string`
- `src?: string | undefined` — Avatar image. Falls back to initials when absent or broken.
- `initials?: string | undefined` — Overrides the initials derived from `name`.

### Types

- `GanttProps` — type (see the component above)
