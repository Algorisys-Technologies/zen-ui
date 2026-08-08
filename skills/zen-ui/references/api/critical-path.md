<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# critical-path — API (React, the parity reference)

Exports: `productionCriticalPath`, `ProductionCriticalPath`, `ProductionCriticalPathOptions`, `ProductionFloat`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-critical-path>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProductionCriticalPath (type)

- `byOperation: Map<string, ProductionFloat>`
- `critical: string[]` — Ids with no total float, earliest first.
- `projectEnd: Date` — The end the backward pass measured against.
- `cycles: string[]` — Operations in a routing cycle. No float exists for them — a cycle has no "latest" — so they are named and left out rather than given a number that happens not to crash.

### ProductionCriticalPathOptions (type)

- `calendar?: GanttCalendar | undefined`
- `calendarFor?: ((resourceId: string) => GanttCalendar | undefined) | undefined`
- `setupMatrix?: ProductionSetupMatrix | undefined`
- `until?: Date | undefined` — The date everything is measured against — an order's due date, a shipping window. Defaults to the latest finish in the schedule, which makes the longest chain critical and everything else's float relative to it. Passing a real due date is the more useful reading and changes the answer: against a due date, EVERY operation can have negative float, and that is the plant being late rather than a bug.

### ProductionFloat (type)

- `operationId: string`
- `freeFloatMinutes: number` — Working minutes it can slip before delaying an immediate successor.
- `totalFloatMinutes: number` — …before delaying the project end. Never less than the free float.
- `critical: boolean` — Zero total float — it is on the critical path. Negative float means the schedule is ALREADY past the end it is measured against, and that counts as critical too: a job that cannot be moved without making things worse is exactly what the flag is for.
- `latestFinish: Date` — The latest it may finish without pushing the end out.

### Other exports

- `productionCriticalPath<O extends ProductionOperationNode>(operations: O[], dependencies: GanttDependency[], options?: ProductionCriticalPathOptions): ProductionCriticalPath`
