<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# timeline — API (React, the parity reference)

Exports: `Timeline`, `TimelineProps`, `TimelineItem`, `TimelineState`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-timeline>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Timeline

- `items: TimelineItem[]`
- `density?: "default" | "compact" | undefined` — `"compact"` drops the description and body and tightens the spacing, for a sidebar or a popover where the timeline is context rather than the subject.
- `emptyMessage?: React.ReactNode` — Message when there is nothing yet.
- `className?: string | undefined`

### TimelineItem (type)

- `id: string`
- `title: React.ReactNode` — What happened. Keep it to a line; the body is for the rest.
- `description?: React.ReactNode`
- `timestamp?: string | undefined` — Shown beside the title. A display string, not a Date — formatting a date is a locale and timezone decision the caller has already made elsewhere.
- `dateTime?: string | undefined` — Machine-readable form for `<time dateTime>`, when `timestamp` is prose.
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star" …` — Replaces the dot.
- `state?: TimelineState | undefined`
- `group?: string | undefined` — A heading that starts a new run of items — "Today", "March".
- `children?: React.ReactNode` — Anything richer than a description: a diff, a quote, an attachment.

### Other exports

- `TimelineState` = `"info" | "error" | "default" | "success" | "warning"`

### Types

- `TimelineProps` — type (see the component above)
