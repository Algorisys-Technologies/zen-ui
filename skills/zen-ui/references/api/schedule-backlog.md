<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# schedule-backlog — API (React, the parity reference)

Exports: `ScheduleBacklog`, `BacklogItem`, `ScheduleBacklogProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-schedule-backlog>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ScheduleBacklog

- `items: BacklogItem[]`
- `resources: { id: string; name: string; }[]` — Work centres the Place button offers — leaves only, as the chart accepts.
- `onPlace: (at: { operationId: string; resourceId: string; start?: Date; }) => void`
- `now?: number | Date | undefined` — Pins the clock for the overdue test, in tests and screenshots.
- `timeZone?: string | undefined`
- …plus the underlying element's standard props (279 inherited).

### BacklogItem (type)

- `id: string`
- `name: string`
- `order?: string | undefined`
- `runMinutes?: number | undefined` — Run time in working minutes, shown as a duration.
- `due?: Date | undefined`

### Types

- `ScheduleBacklogProps` — type (see the component above)
