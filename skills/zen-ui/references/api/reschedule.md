<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# reschedule — API (React, the parity reference)

Exports: `productionReschedule`, `ProductionMove`, `ProductionProposal`, `ProductionRescheduleOptions`, `ProductionShift`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-reschedule>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProductionMove (type)

- `operationId: string`
- `start: Date` — The new start of the BOOKING — where setup begins, not the run.
- `resourceId?: string | undefined` — A new resource, when the drag crossed rows. Omit to stay put.

### ProductionProposal (type)

- `move: ProductionMove`
- `cascade: ProductionShift[]` — Everything that moves, the dragged operation FIRST. Empty if nothing does.
- `conflicts: ProductionConflict[]` — What the proposed schedule violates. Reported; the caller decides.
- `cycles: string[]` — Operations sitting in a routing cycle, left exactly where they are. A cycle cannot be satisfied by pushing — every push makes the next link worse — so the honest answer is to move nothing and say which operations are involved. Silently iterating to a guard limit would produce a schedule that is merely wrong more slowly.

### ProductionRescheduleOptions (type)

- `calendar?: GanttCalendar | undefined`
- `calendarFor?: ((resourceId: string) => GanttCalendar | undefined) | undefined` — A resource's own calendar, when it has one.
- `resources?: ProductionResourceNode[] | undefined` — Resources, so capacity conflicts can be computed on the proposed state.
- `setupMatrix?: ProductionSetupMatrix | undefined`

### ProductionShift (type)

- `operationId: string`
- `from: GanttSpan`
- `to: GanttSpan`
- `reason: "moved" | "pushed"` — `moved` is the one the user dragged; `pushed` is everything that had to follow. Distinguished because a caller may well want to confirm the second kind separately — "this also moves 6 other jobs" is the sentence a planner needs before committing.
- `resourceId?: string | undefined` — Set only when the operation changed resource.

### Other exports

- `productionReschedule<O extends ProductionOperationNode>(operations: O[], dependencies: GanttDependency[], move: ProductionMove, options?: ProductionRescheduleOptions): ProductionProposal`
