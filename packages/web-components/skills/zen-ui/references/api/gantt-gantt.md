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
- `defaultView?: PlanningView | undefined` — Uncontrolled starting view. Default "week".
- `view?: PlanningView | undefined` — Controlled view; pair with `onViewChange`.
- `onViewChange?: ((view: PlanningView) => void) | undefined`
- `views?: PlanningView[] | undefined` — Which views the switcher offers. Default all three.
- `defaultDate?: Date | undefined` — Any date inside the range to open on. Default today.
- `date?: Date | undefined` — Controlled anchor date; pair with `onDateChange`.
- `onDateChange?: ((date: Date) => void) | undefined`
- `expanded?: string[] | undefined` — Ids of the parents that are open. Controlled; pair with `onExpandedChange`. A parent not in the list is closed.
- `defaultExpanded?: string[] | undefined` — Uncontrolled starting set. Omit it and everything opens.
- `onExpandedChange?: ((ids: string[]) => void) | undefined`
- `onTaskClick?: ((task: GanttTask, row: GanttRow<GanttTask>) => void) | undefined`
- `now?: Date | undefined` — Reference "now" for the marker, the today column and the derived status.
- `columnWidth?: number | undefined` — Pixel width of one column. Defaults to something readable per view.
- `hideToolbar?: boolean | undefined` — Hide the toolbar when your page already has one.
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
- `baselineEnd?: Date | undefined` — What the plan originally promised. Slip is measured against this.
- `status?: GanttTaskStatus | undefined` — Overrides the derived status.

### GanttAssignee (type)

- `id: string`
- `name: string`
- `src?: string | undefined` — Avatar image. Falls back to initials when absent or broken.
- `initials?: string | undefined` — Overrides the initials derived from `name`.

### Types

- `GanttProps` — type (see the component above)
