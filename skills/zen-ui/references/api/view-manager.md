<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# view-manager — API (React, the parity reference)

Exports: `ViewManager`, `ViewManagerProps`, `SavedView`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-view-manager>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ViewManager

- `views: SavedView<S>[]`
- `activeId: string | null` — The view on screen; null for the standard (unsaved) one.
- `state: S` — The screen's state now, to tell when it has drifted from the view.
- `standardState?: S | undefined` — The state with no view applied: with it, "Standard" shows Modified too.
- `standardName?: string | undefined` — Default "Standard".
- `onSelect: (view: SavedView<S> | null) => void` — A view was chosen (null: the standard one). Apply its state.
- `onSave?: ((view: SavedView<S>) => void | Promise<void>) | undefined` — Save: the active view, with the current state. Without it, no Save.
- `onCreate?: ((view: SavedView<S>) => void | Promise<void>) | undefined` — Save as: a new view of the current state. Without it, no Save as.
- `onRename?: ((id: string, name: string) => void | Promise<void>) | undefined`
- `onDelete?: ((id: string) => void | Promise<void>) | undefined`
- `onDefaultChange?: ((id: string | null) => void | Promise<void>) | undefined` — The view the screen opens with changed (null: the standard one).
- `onShare?: ((view: SavedView<S>, token: string) => void) | undefined` — Copy link: the view with the current state as a URL-safe token. Without it, no Copy link.
- `aria-label?: string | undefined` — Names the trigger for assistive tech, before the view name. Default "View".
- `className?: string | undefined`

### Other exports

- `SavedView` = `SavedView<S>`

### Types

- `ViewManagerProps` — type (see the component above)
