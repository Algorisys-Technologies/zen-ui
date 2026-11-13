<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-gantt — API (React, the parity reference)

Exports: `GanttAnchoredView`, `GanttBarAnchor`, `GanttCalendar`, `GanttCalendarException`, `GanttColumnUnit`, `GanttConnector`, `GanttDependency`, `GanttDependencyType`, `GanttFitOptions`, `GanttFlattenOptions`, `GanttPaneColumn`, `GanttRow`, `GanttSegmentOptions`, `GanttSpan`, `GanttTaskNode`, `GanttTaskStatus`, `GanttView`, `GanttWorkingPeriod`, `GANTT_CALENDAR_24_7`, `GANTT_PANE_COLUMNS`, `ganttAddWorkingMs`, `ganttFitRange`, `ganttFitUnit`, `ganttIsWorking`, `ganttSubWorkingMs`, `ganttPaneColumns`, `ganttRangeColumns`, `ganttSpanLabel`, `ganttWorkingMs`, `ganttWorkingPeriodsOn`, `ganttWorkingSegments`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-gantt>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### GanttBarAnchor (type)

- `rowIndex: number`
- `startPct: number` — 0–100 from the range start, as PlanningPlacement reports it.
- `widthPct: number`
- `yOffset?: number | undefined` — Pixels from the row's TOP to the point a link should join, overriding the row's middle. A project Gantt has one bar per row and wants the middle, which is the default. A production row stacks its operations in lanes, and a routing arrow drawn to the middle of a three-lane row misses every bar in it.

### GanttCalendar (type)

- `week: GanttWorkingPeriod[][]` — Working periods per weekday, index 0 = Sunday, matching `Date#getDay`.
- `exceptions?: GanttCalendarException[] | undefined`
- `id?: string | undefined` — Names the calendar, for the per-resource case. Unused today.

### GanttCalendarException (type)

- `date: Date` — Any instant on the day this applies to. Only the local date is read.
- `periods: GanttWorkingPeriod[]` — That day's working periods. An EMPTY array is a full non-working day.

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
- `lagMinutes?: number | undefined` — Enforced delay between the two ends, in WORKING minutes — "start four hours after the previous operation finishes, for cooling". Negative is a LEAD: the successor may begin that much before the link would otherwise allow, which is how overlapping operations are expressed ("start the next op when the first is 80% through"). Working minutes rather than elapsed, for the reason everything else here is: four hours of cooling that begins at 16:00 on a single-shift plant is not done at 20:00. Nothing in this module ENFORCES it. A read-only schedule reports a link it violates and draws the bars where the caller put them — see `productionSequenceConflicts`.

### GanttFitOptions (type)

- `calendar?: GanttCalendar | undefined` — Durations are resolved through this, as everywhere else.
- `padFraction?: number | undefined` — Breathing room either side, as a fraction of the span. Default 0.04. Without it the first bar starts hard against the left edge and reads as clipped — the same thing `placeAppointment` deliberately signals for a bar that really is cut by the range.
- `minPadMs?: number | undefined` — A floor on that padding, so a zero-width plan still gets a real axis. Default one HOUR. It was a day, and a day made the `hour` band unreachable: a 4-hour works order padded to 3 days and drew as three day columns, with none of the sub-day resolution the whole working-time model exists to show. Measured — a 4-hour job, an 8-hour shift and a two-shift order all came back `day`. The floor is only there for the degenerate case, so it belongs at the smallest unit the axis can draw rather than at the largest.

### GanttFlattenOptions (type)

- `calendar?: GanttCalendar | undefined` — When work can happen. Omit it and every span is wall-clock, which is exactly today's behaviour — the working-time path is not entered at all.
- `minGapMs?: number | undefined` — Gaps shorter than this are absorbed rather than split on. Derived by the renderer from the axis scale — roughly one pixel's worth of time — because splitting is a geometry decision, not a data one. A 6-hour job across a weekend is two segments and that is the point; a three-month summary bar under a 24/5 calendar is ~65 segments, none of them a pixel wide, which is 65 DOM nodes to draw a dashed line.
- `maxSegments?: number | undefined` — Beyond this, the span is returned whole. A safety net against a calendar that alternates every few minutes, which would otherwise be able to hang the renderer.

### GanttSegmentOptions (type)

- `minGapMs?: number | undefined` — Gaps shorter than this are absorbed rather than split on. Derived by the renderer from the axis scale — roughly one pixel's worth of time — because splitting is a geometry decision, not a data one. A 6-hour job across a weekend is two segments and that is the point; a three-month summary bar under a 24/5 calendar is ~65 segments, none of them a pixel wide, which is 65 DOM nodes to draw a dashed line.
- `maxSegments?: number | undefined` — Beyond this, the span is returned whole. A safety net against a calendar that alternates every few minutes, which would otherwise be able to hang the renderer.

### GanttSpan (type)

- `start: Date`
- `end: Date` — Inclusive of the last instant of work; half-open against the axis, as in ./planning.

### GanttTaskNode (type)

- `id: string`
- `start?: Date | undefined` — Omit both dates on a summary row to have them rolled up from the children.
- `end?: Date | undefined`
- `percentComplete?: number | undefined` — 0–100. Omit on a parent to have it averaged from the children.
- `workingMinutes?: number | undefined` — Duration in WORKING minutes. With a `start` and no `end`, the end is computed from the calendar — which is how a 6-hour job starting Friday 16:00 correctly finishes on Monday. Ignored when `end` is given, since an explicit end is a statement and a duration is a derivation. With no calendar in play this is elapsed minutes, because no calendar means a 24/7 one and the two are then the same number.
- `baselineEnd?: Date | undefined` — What the plan originally promised. Slip is measured against this.
- `status?: GanttTaskStatus | undefined` — Overrides the derived status.
- `children?: GanttTaskNode[] | undefined`

### GanttWorkingPeriod (type)

- `from: number`
- `to: number`

### Other exports

- `GanttAnchoredView` = `PlanningView | "quarter" | "year"`
- `GanttColumnUnit` = `"month" | "week" | "day" | "hour"`
- `GanttDependencyType` = `"finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish"`
- `GanttPaneColumn` = `"name" | "status" | "assignees" | "variance"`
- `GanttRow` = `GanttRow<T>`
- `GanttTaskStatus` = `"not-started" | "on-track" | "delayed" | "complete"`
- `GanttView` = `GanttAnchoredView | "fit"`
- `GANTT_CALENDAR_24_7: GanttCalendar`
- `GANTT_PANE_COLUMNS: GanttPaneColumn[]`
- `ganttAddWorkingMs(calendar: GanttCalendar, from: Date, ms: number): Date`
- `ganttFitRange(tasks: GanttTaskNode[], options?: GanttFitOptions): PlanningRange | null`
- `ganttFitUnit(spanMs: number): GanttColumnUnit`
- `ganttIsWorking(calendar: GanttCalendar, at: Date): boolean`
- `ganttSubWorkingMs(calendar: GanttCalendar, from: Date, ms: number): Date`
- `ganttPaneColumns<K extends string>(requested: readonly K[], widths: Record<K, number>, available: number, minAxisWidth: number): K[]`
- `ganttRangeColumns(range: PlanningRange, unit: GanttColumnUnit, options?: GanttColumnOptions): PlanningColumn[]`
- `ganttSpanLabel(range: PlanningRange): string`
- `ganttWorkingMs(calendar: GanttCalendar, from: Date, to: Date): number`
- `ganttWorkingPeriodsOn(calendar: GanttCalendar, day: Date): GanttWorkingPeriod[]`
- `ganttWorkingSegments(calendar: GanttCalendar, from: Date, to: Date, options?: GanttSegmentOptions): GanttSpan[]`
