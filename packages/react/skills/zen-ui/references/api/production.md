<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# production — API (React, the parity reference)

Exports: `ProductionConflict`, `ProductionConflictKind`, `ProductionFlatten`, `ProductionFlattenOptions`, `ProductionLoadBucket`, `ProductionLoadOptions`, `ProductionOperationNode`, `ProductionPlacement`, `ProductionPlacementOptions`, `ProductionResourceNode`, `ProductionRow`, `ProductionSetupMatrix`, `flattenProductionResources`, `packProductionLanes`, `productionConflicts`, `productionLoad`, `productionPeakLoad`, `productionPlacement`, `productionSequenceConflicts`, `productionSetupMinutes`, `productionSetupPlan`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-production>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ProductionConflict (type)

- `kind: ProductionConflictKind`
- `resourceId: string` — The resource it is about, where there is one.
- `operationIds: string[]` — The operations involved. Empty for a resource-level finding.

### ProductionFlattenOptions (type)

- `calendar?: GanttCalendar | undefined` — The plant's calendar. A resource's own `calendar` overrides it.
- `setupMatrix?: ProductionSetupMatrix | undefined` — Sequence-dependent changeover. With one supplied, an operation that states no `setupMinutes` gets one derived from what ran before it on the same resource — see `productionSetupPlan`.
- `maxLanes?: number | undefined` — How many lanes a row may grow to. Default 3. Bounded because rows are a FIXED height — the window and the connector routes both depend on it — so lanes are drawn by dividing a row rather than by growing one. Past three the bars are thinner than the gap between them.
- `minGapMs?: number | undefined` — Gaps shorter than this are absorbed rather than split on. Derived by the renderer from the axis scale — roughly one pixel's worth of time — because splitting is a geometry decision, not a data one. A 6-hour job across a weekend is two segments and that is the point; a three-month summary bar under a 24/5 calendar is ~65 segments, none of them a pixel wide, which is 65 DOM nodes to draw a dashed line.
- `maxSegments?: number | undefined` — Beyond this, the span is returned whole. A safety net against a calendar that alternates every few minutes, which would otherwise be able to hang the renderer.

### ProductionLoadBucket (type)

- `start: Date`
- `end: Date`
- `availableMs: number` — Working milliseconds the resource offers here — open time × capacity.
- `bookedMs: number` — Working milliseconds booked, SETUP INCLUDED.
- `utilisation: number | null` — `bookedMs / availableMs`, or null where nothing is available. Null rather than 0 or Infinity, and the distinction matters: a Sunday on a 24/5 plant has no capacity and no work, which is not 0% utilised — it is not a question. Drawing it as an empty bar says the plant was idle.
- `overloaded: boolean` — Booked past what is available. Reported; never enforced.

### ProductionLoadOptions (type)

- `calendar?: GanttCalendar | undefined`
- `capacity?: number | undefined` — Parallel capacity. Default 1.

### ProductionOperationNode (type)

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

### ProductionPlacementOptions (type)

- `setupMinutes?: number | undefined` — Changeover derived from the sequence, used only when the operation does not state its own. A stated `setupMinutes` is a statement and wins.
- `minGapMs?: number | undefined` — Gaps shorter than this are absorbed rather than split on. Derived by the renderer from the axis scale — roughly one pixel's worth of time — because splitting is a geometry decision, not a data one. A 6-hour job across a weekend is two segments and that is the point; a three-month summary bar under a 24/5 calendar is ~65 segments, none of them a pixel wide, which is 65 DOM nodes to draw a dashed line.
- `maxSegments?: number | undefined` — Beyond this, the span is returned whole. A safety net against a calendar that alternates every few minutes, which would otherwise be able to hang the renderer.

### ProductionResourceNode (type)

- `id: string`
- `capacity?: number | undefined` — How many operations can run at once. Default 1. On a PARENT this is its own number, not the sum of its children's — a line of four machines has whatever capacity the line itself has, which is usually four but is a fact somebody has to state rather than one to infer. Omit it on a parent and the sum of the children is used, because that is the answer that is right more often than 1 is.
- `calendar?: GanttCalendar | undefined` — This resource's own working calendar, overriding the chart's. A furnace on continuous run inside a plant on two shifts is the case this exists for.
- `children?: ProductionResourceNode[] | undefined`

### ProductionSetupMatrix (type)

- `minutes: Record<string, Record<string, number>>` — `minutes[fromFamily][toFamily]`, either key optionally `"*"`.
- `fallbackMinutes?: number | undefined` — When nothing matches. Default 0 — no rule means no changeover, not a guess.

### Other exports

- `ProductionConflictKind` = `"over-capacity" | "non-working" | "unknown-resource" | "sequence"`
- `ProductionFlatten` = `ProductionFlatten<R, O>`
- `ProductionPlacement` = `ProductionPlacement<O>`
- `ProductionRow` = `ProductionRow<R, O>`
- `flattenProductionResources<R extends ProductionResourceNode, O extends ProductionOperationNode>(resources: R[], operations: O[], isExpanded: (resource: R) => boolean, options?: ProductionFlattenOptions): ProductionFlatten<R, O>`
- `packProductionLanes<O extends ProductionOperationNode>(placements: ProductionPlacement<O>[], maxLanes: number): { lanes: ProductionPlacement<O>[][]; overflow: number; }`
- `productionConflicts<O extends ProductionOperationNode>(rows: ProductionRow<ProductionResourceNode, O>[], operations: O[], options?: { calendar?: GanttCalendar; }): ProductionConflict[]`
- `productionLoad(placements: ProductionPlacement[], columns: PlanningColumn[], options?: ProductionLoadOptions): ProductionLoadBucket[]`
- `productionPeakLoad(placements: ProductionPlacement[]): number`
- `productionPlacement<O extends ProductionOperationNode>(operation: O, calendar?: GanttCalendar, segmentOptions?: ProductionPlacementOptions): ProductionPlacement<O> | null`
- `productionSequenceConflicts(dependencies: GanttDependency[], placements: Map<string, ProductionPlacement>, options?: { calendar?: GanttCalendar; }): ProductionConflict[]`
- `productionSetupMinutes(matrix: ProductionSetupMatrix, from: string | null, to: string | null): number`
- `productionSetupPlan<O extends ProductionOperationNode>(operations: O[], matrix: ProductionSetupMatrix): Map<string, number>`
