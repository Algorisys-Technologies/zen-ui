<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# page-header — API (React, the parity reference)

Exports: `PageHeader`, `PageHeaderProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-page-header>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PageHeader

- `title: React.ReactNode`
- `subtitle?: React.ReactNode`
- `onBack?: (() => void) | undefined` — Renders a back affordance to the left of the title. Without it, none.
- `backLabel?: string | undefined` — Accessible name for the back control — it is icon-only. Default "Back".
- `actions?: React.ReactNode` — Right-aligned actions.
- `info?: React.ReactNode` — Sits beside the title, e.g. an info Tooltip.
- `breadcrumb?: React.ReactNode` — Sits above the title, e.g. a Breadcrumb.
- `className?: string | undefined`
- …plus the underlying element's standard props (278 inherited).

### Types

- `PageHeaderProps` — type (see the component above)
