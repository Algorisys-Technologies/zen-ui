<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# production-schedule — API (React, the parity reference)

Exports: `ProductionSchedule`, `ProductionScheduleProps`, `ProductionResource`, `ProductionOperation`, `ProductionPaneColumn`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-production-schedule>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProductionSchedule

- `resources: ProductionResource[]`
- `operations: ProductionOperation[]`
- `dependencies?: GanttDependency[] | undefined` — Routing links between operations — op 10 finishes, op 20 starts. Drawn with the same four link types a Gantt dependency has.
- `showDependencies?: boolean | undefined` — Draw the routing layer. Default true.
- `calendar?: GanttCalendar | undefined` — When the plant is open. A resource's own `calendar` overrides it. Strongly recommended here, unlike on `Gantt`: without one every duration is wall-clock, so a changeover runs through the night, and load is measured against 24 hours a day the plant does not have.
- `hourStep?: number | undefined` — Hours per column in the DAY view. Default 1; 0.25 for quarter-hour columns.
- `setupMatrix?: ProductionSetupMatrix | undefined` — Sequence-dependent changeover, keyed on the pair of `setupFamily` values. With one supplied, an operation that states no `setupMinutes` gets one derived from what ran before it on the same machine. This is the difference between a changeover and a changeover *cost*: white to black is an hour of washing out, black to white is fifteen minutes, and a single per-operation duration cannot say so.
- `defaultView?: GanttView | undefined` — Uncontrolled starting view. Default "fit".
- `view?: GanttView | undefined`
- `onViewChange?: ((view: GanttView) => void) | undefined`
- `views?: GanttView[] | undefined`
- `defaultDate?: Date | undefined`
- `date?: Date | undefined`
- `onDateChange?: ((date: Date) => void) | undefined`
- `expanded?: string[] | undefined` — Ids of the open parents. Controlled; pair with `onExpandedChange`.
- `defaultExpanded?: string[] | undefined` — Uncontrolled starting set. Omit it and everything opens.
- `onExpandedChange?: ((ids: string[]) => void) | undefined`
- `onOperationClick?: ((operation: ProductionOperation, row: ProductionRowData<ProductionResource, ProductionOperation>) => void) | undefined`
- `onReschedule?: ((proposal: ProductionProposal) => void) | undefined` — Called with what WOULD happen if the user's move were made. Supplying it is what turns rescheduling on. The component never applies it. It stays controlled: it renders the `operations` it is given, hands you a proposal, and changes nothing until you pass a new array. That is what keeps undo yours — a history of arrays you already own — and it is why there is no internal pending state to get out of sync with your ERP. `proposal.cascade` includes the operation the user dragged, first. Persist only that one and you have written a schedule nobody saw. `conflicts` and `cycles` are reported, never enforced: overtime gets authorised, and a supervisor who knows both jobs can run may double-book deliberately.
- `canReschedule?: ((operation: ProductionOperation) => boolean) | undefined` — Whether an operation may be moved at all. Default: everything may, once `onReschedule` is supplied. This GATES THE AFFORDANCE rather than the outcome — a forbidden operation simply is not draggable, so a user never does the work of moving something and then gets told no. Returning a rejection after the drag is the version that feels like a bug.
- `maxLanes?: number | undefined` — How many operations may stack on one row before the rest are counted as overflow. Default 3. Bounded because it sets the height of EVERY row: one badly double-booked machine would otherwise make the whole chart tall.
- `showLoad?: boolean | undefined` — Draw the load histogram under the axis. Default true.
- `showCriticalPath?: boolean | undefined` — Compute float and mark the critical path. Off by default: it is a graph pass over every operation, and a schedule with no routing has nothing to be critical about. With `until` supplied it is measured against a real due date, and every operation can then have NEGATIVE float — which is the plant being late, not a fault. Without it, the latest finish in the schedule is the end, so the longest chain is critical by construction.
- `until?: Date | undefined` — The date float is measured against. Default: the schedule's own last finish.
- `now?: Date | undefined`
- `columnWidth?: number | undefined`
- `hideToolbar?: boolean | undefined`
- `columns?: ProductionPaneColumn[] | undefined` — Which pane columns, in preference order. Default all four.
- `loading?: boolean | undefined`
- `loadingRows?: number | undefined`
- `emptyState?: React.ReactNode`
- `className?: string | undefined`

### ProductionResource (type)

- `name: string`
- `subtitle?: string | undefined` — Second line under the name — an asset number, a location.
- `children?: ProductionResource[] | undefined`
- `id: string`
- `capacity?: number | undefined` — How many operations can run at once. Default 1. On a PARENT this is its own number, not the sum of its children's — a line of four machines has whatever capacity the line itself has, which is usually four but is a fact somebody has to state rather than one to infer. Omit it on a parent and the sum of the children is used, because that is the answer that is right more often than 1 is.
- `calendar?: GanttCalendar | undefined` — This resource's own working calendar, overriding the chart's. A furnace on continuous run inside a plant on two shifts is the case this exists for.

### ProductionOperation (type)

- `name: string`
- `order?: string | undefined` — The works order it belongs to. Shown in the tooltip.
- `statusLabel?: string | undefined` — Overrides the derived status colour's words, not its colour.
- `id: string`
- `resourceId: string` — The resource it is booked on. Must name a resource in the tree.
- `start: Date` — When the machine is claimed — the start of SETUP, not of the run.
- `runMinutes?: number | undefined` — Run time in WORKING minutes, resolved through the calendar. This is the normal way to state an operation: how long the work takes is a property of the job, and when it lands is a property of the plant's shifts.
- `end?: Date | undefined` — An explicit end, which wins over `runMinutes` — a stated end is a statement, a duration is a derivation. Measured from the end of setup.
- `setupMinutes?: number | undefined` — Changeover before the run, in working minutes. It occupies the machine and makes nothing, which is exactly why it has to be counted rather than assumed away. A stated number is a STATEMENT and wins over anything derived, the same way `end` wins over `runMinutes`. Leave it off and a `ProductionSetupMatrix` derives it from what ran before — see `setupFamily`.
- `setupFamily?: string | undefined` — What this operation is, for changeover purposes — a product, a colour, a material, a tooling set. Changeover is SEQUENCE-DEPENDENT and that is not a refinement: going from white paint to black costs minutes, and black to white costs an hour of washing out. A per-operation duration cannot express a cost that depends on what the machine did before, so the matrix is keyed on the pair.
- `load?: number | undefined` — How much of the resource's capacity this consumes. Default 1. A job that needs both operators on a two-operator cell is 2.
- `percentComplete?: number | undefined`
- `status?: GanttTaskStatus | undefined`

### Other exports

- `ProductionPaneColumn` = `"resource" | "jobs" | "capacity" | "load" | "float"`

### Types

- `ProductionScheduleProps` — type (see the component above)
