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
- `className?: string | undefined`

### GanttTask (type)

- `name: string`
- `subtitle?: string | undefined` — Second line under the name.
- `assignees?: GanttAssignee[] | undefined`
- `statusLabel?: string | undefined` — Overrides the status chip's words. The colour still follows `status`.
- `children?: GanttTask[] | undefined`
- `id: string`
- `start?: Date | undefined` — Omit both dates on a summary row to have them rolled up from the children.
- `end?: Date | undefined`
- `percentComplete?: number | undefined` — 0–100. Omit on a parent to have it averaged from the children.
- `workingMinutes?: number | undefined` — Duration in WORKING minutes. With a `start` and no `end`, the end is computed from the calendar — which is how a 6-hour job starting Friday 16:00 correctly finishes on Monday. Ignored when `end` is given, since an explicit end is a statement and a duration is a derivation. With no calendar in play this is elapsed minutes, because no calendar means a 24/7 one and the two are then the same number.
- `baselineEnd?: Date | undefined` — What the plan originally promised. Slip is measured against this.
- `status?: GanttTaskStatus | undefined` — Overrides the derived status.

### GanttAssignee (type)

- `id: string`
- `name: string`
- `src?: string | undefined` — Avatar image. Falls back to initials when absent or broken.
- `initials?: string | undefined` — Overrides the initials derived from `name`.

### Types

- `GanttProps` — type (see the component above)
