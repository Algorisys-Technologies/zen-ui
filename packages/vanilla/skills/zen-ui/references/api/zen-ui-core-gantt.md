<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-gantt — API (React, the parity reference)

Exports: `GanttBarAnchor`, `GanttConnector`, `GanttDependency`, `GanttDependencyType`, `GanttRow`, `GanttSpan`, `GanttTaskNode`, `GanttTaskStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-gantt>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### GanttBarAnchor (type)

- `rowIndex: number`
- `startPct: number` — 0–100 from the range start, as PlanningPlacement reports it.
- `widthPct: number`

### GanttConnector (type)

- `id: string` — Stable across renders: the dependency it came from, not the rows it hit.
- `from: string`
- `to: string`
- `type: GanttDependencyType`
- `d: string` — SVG path data, in the axis's own pixel space.
- `arrow: { x: number; y: number; dir: 1 | -1; }` — The arrowhead's tip, and which way it points: 1 = rightwards, -1 = leftwards.

### GanttDependency (type)

- `from: string` — Id of the task that comes first.
- `to: string` — Id of the task that waits.
- `type?: GanttDependencyType | undefined` — Default "finish-to-start".

### GanttSpan (type)

- `start: Date`
- `end: Date` — Inclusive of the last instant of work; half-open against the axis, as in ./planning.

### GanttTaskNode (type)

- `id: string`
- `start?: Date | undefined` — Omit both dates on a summary row to have them rolled up from the children.
- `end?: Date | undefined`
- `percentComplete?: number | undefined` — 0–100. Omit on a parent to have it averaged from the children.
- `baselineEnd?: Date | undefined` — What the plan originally promised. Slip is measured against this.
- `status?: GanttTaskStatus | undefined` — Overrides the derived status.
- `children?: GanttTaskNode[] | undefined`

### Other exports

- `GanttDependencyType` = `"finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish"`
- `GanttRow` = `GanttRow<T>`
- `GanttTaskStatus` = `"not-started" | "on-track" | "delayed" | "complete"`
