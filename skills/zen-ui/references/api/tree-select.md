<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tree-select — API (React, the parity reference)

Exports: `TreeSelect`, `TreeSelectProps`, `TreeSelectNode`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tree-select>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### TreeSelect

- `items: TreeSelectNode[]`
- `value?: string | null | undefined`
- `defaultValue?: string | null | undefined`
- `onValueChange?: ((id: string, node: TreeSelectNode) => void) | undefined`
- `placeholder?: string | undefined`
- `leavesOnly?: boolean | undefined` — Only nodes without children can be picked; groups open and close.
- `showPath?: boolean | undefined` — The closed field shows the node's path from the root, not just its name.
- `pathSeparator?: string | undefined` — Between the path's names. Default " › ".
- `defaultExpanded?: string[] | undefined` — Groups open when the list first opens, besides the picked node's ancestors.
- `emptyMessage?: string | undefined` — Shown when nothing matches what was typed. Default "No matches".
- `invalid?: boolean | undefined` — Marked aria-invalid, with the error border.
- `disabled?: boolean | undefined`
- `width?: string | number | undefined` — Width of the field. Default 100%.
- `id?: string | undefined` — Lands on the input, so `<label htmlFor>` names it.
- `aria-label?: string | undefined`
- `aria-labelledby?: string | undefined`
- `className?: string | undefined`
- …plus the underlying element's standard props (2 inherited).

### TreeSelectNode (type)

- `id: string`
- `label: string`
- `children?: TreeSelectNode[] | undefined`
- `disabled?: boolean | undefined`

### Types

- `TreeSelectProps` — type (see the component above)
