<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# sortable-list — API (React, the parity reference)

Exports: `SortableList`, `SortableListItem`, `SortableListHandle`, `SortableListProps`, `SortableListItemProps`, `SortableListHandleProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-sortable-list>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### SortableList

- `items: string[]` — Ordered ids. Controlled — there is no uncontrolled mode by design.
- `onReorder: (ids: string[]) => void` — Called once per committed change, with the whole new order.
- `orientation?: ReorderOrientation | undefined`
- `disabled?: boolean | undefined`
- `handle?: boolean | undefined` — `true` (the default) means only the handle starts a drag. Whole-item dragging is the wrong default for a library: real rows hold buttons, links and selectable text, and making the row a drag target breaks all three.
- `onDragStart?: ((id: string) => void) | undefined`
- `onDragEnd?: ((id: string) => void) | undefined`
- `announcements?: Partial<ReorderAnnouncements> | undefined` — Replace the screen-reader messages, e.g. for a localised app.
- `className?: string | undefined`
- `children?: React.ReactNode`

### SortableListItem

- `id: string`
- `disabled?: boolean | undefined`
- `className?: string | undefined`
- `children?: React.ReactNode`

### SortableListHandle

- `label?: string | undefined` — Accessible name. Defaults to "Reorder".
- `className?: string | undefined`
- `children?: React.ReactNode`

### Types

- `SortableListProps` — type (see the component above)
- `SortableListItemProps` — type (see the component above)
- `SortableListHandleProps` — type (see the component above)
