<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# sortable — API (React, the parity reference)

Exports: `moveItem`, `reduceReorder`, `keyToReorderAction`, `DEFAULT_REORDER_ANNOUNCEMENTS`, `PickedUp`, `ReorderAction`, `ReorderIntent`, `ReorderResult`, `ReorderOrientation`, `ReorderAnnouncements`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-sortable>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PickedUp (type)

- `id: string`
- `origin: number` — Where it was when it was picked up, so Escape can put it back.
- `index: number` — Where it sits now.

### ReorderAction (type)

- `type: "pickup" | "move" | "moveTo" | "drop" | "cancel"`

### ReorderIntent (type)

- `type: "pickup" | "move" | "moveTo" | "drop" | "cancel"`

### ReorderResult (type)

- `picked: PickedUp | null`
- `commit: { from: number; to: number; } | null` — The move to apply, or `null` when nothing changed. A no-op must be `null` rather than `{from: n, to: n}` so a caller can wire it straight to `onReorder` without firing a change event for a key press that did nothing.

### ReorderAnnouncements (type)

- `onPickUp: (id: string, index: number, total: number) => string`
- `onMove: (id: string, from: number, to: number) => string`
- `onDrop: (id: string, index: number) => string`
- `onCancel: () => string`

### Other exports

- `moveItem<T>(items: readonly T[], from: number, to: number): T[]`
- `reduceReorder(picked: PickedUp | null, action: ReorderAction, total: number): ReorderResult`
- `keyToReorderAction(key: string, orientation: ReorderOrientation, isPickedUp: boolean, total: number): ReorderIntent | null`
- `DEFAULT_REORDER_ANNOUNCEMENTS: ReorderAnnouncements`
- `ReorderOrientation` = `"horizontal" | "vertical"`
