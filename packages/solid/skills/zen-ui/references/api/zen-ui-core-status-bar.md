<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-status-bar — API (React, the parity reference)

Exports: `statusBarCollapse`, `statusBarSides`, `StatusBarAlign`, `StatusBarLayoutItem`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-status-bar>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StatusBarLayoutItem (type)

- `id: string`
- `align?: StatusBarAlign | undefined`
- `priority?: number | undefined` — Higher stays longer when the bar is narrow. Default 0.
- `hidden?: boolean | undefined`

### Other exports

- `statusBarCollapse(items: readonly StatusBarLayoutItem[], widths: Readonly<Record<string, number>>, room: number, gap: number): string[]`
- `statusBarSides<T extends StatusBarLayoutItem>(items: readonly T[]): { start: T[]; end: T[]; }`
- `StatusBarAlign` = `"start" | "end"`
