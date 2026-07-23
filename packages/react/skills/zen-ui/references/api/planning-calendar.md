<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# planning-calendar — API (React, the parity reference)

Exports: `PlanningCalendar`, `PlanningCalendarProps`, `PlanningRow`, `PlanningAppointment`, `PlanningAppointmentState`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-planning-calendar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PlanningCalendar

- `rows: PlanningRow[]`
- `defaultView?: PlanningView | undefined` — Uncontrolled starting view.
- `view?: PlanningView | undefined` — Controlled view; pair with `onViewChange`.
- `onViewChange?: ((view: PlanningView) => void) | undefined`
- `views?: PlanningView[] | undefined` — Which views the switcher offers. Default all three.
- `defaultDate?: Date | undefined` — Any date inside the range to open on. Default today.
- `date?: Date | undefined` — Controlled anchor date; pair with `onDateChange`.
- `onDateChange?: ((date: Date) => void) | undefined`
- `onAppointmentClick?: ((appointment: PlanningAppointment, row: PlanningRow) => void) | undefined`
- `now?: Date | undefined` — Reference "now" for the marker and today highlight. Injectable for tests.
- `hideToolbar?: boolean | undefined` — Hide the toolbar when your page already has one.
- `emptyMessage?: React.ReactNode` — Message when there are no resources.
- `className?: string | undefined`

### PlanningRow (type)

- `id: string`
- `title: string` — The resource: a person, a room, a machine.
- `subtitle?: string | undefined`
- `appointments: PlanningAppointment[]`

### PlanningAppointment (type)

- `id: string`
- `start: Date`
- `end: Date`
- `title: string`
- `subtitle?: string | undefined` — Second line, when the block is wide enough to show it.
- `state?: PlanningAppointmentState | undefined`
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star" …`

### Other exports

- `PlanningAppointmentState` = `"info" | "error" | "default" | "success" | "warning"`

### Types

- `PlanningCalendarProps` — type (see the component above)
