<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# flexible-column-layout — API (React, the parity reference)

Exports: `FlexibleColumnLayout`, `FlexibleColumnLayoutProps`, `FlexibleColumnLayoutType`, `FlexibleColumnLayoutChangeDetail`, `FlexibleColumnName`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-flexible-column-layout>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### FlexibleColumnLayout

- `layout?: FlexibleColumnLayoutType | undefined`
- `onLayoutChange?: ((detail: FlexibleColumnLayoutChangeDetail) => void) | undefined` — Fires when the rendered result changes — layout prop, or container tier.
- `startColumn?: React.ReactNode`
- `midColumn?: React.ReactNode`
- `endColumn?: React.ReactNode`
- …plus the underlying element's standard props (279 inherited).

### FlexibleColumnLayoutType (type)

- …plus the underlying element's standard props (50 inherited).

### FlexibleColumnLayoutChangeDetail (type)

- `layout: FlexibleColumnLayoutType` — The `layout` prop in effect. Deliberately NOT rewritten by responsive collapse — same as Fiori, whose `layoutChange` reports the requested layout alongside the visibility it actually resolved to.
- `maxColumnsCount: 1 | 3 | 2` — How many columns the CONTAINER is wide enough for: 1, 2 or 3.
- `visibleColumns: FlexibleColumnName[]` — The columns actually rendered, in order.

### Other exports

- `FlexibleColumnName` = `"start" | "end" | "mid"`

### Types

- `FlexibleColumnLayoutProps` — type (see the component above)
