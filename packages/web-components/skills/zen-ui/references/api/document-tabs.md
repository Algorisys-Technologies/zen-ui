<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# document-tabs — API (React, the parity reference)

Exports: `DocumentTabs`, `DocumentTabsProps`, `DocumentTab`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-document-tabs>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DocumentTabs

- `tabs: DocumentTab[]`
- `activeId?: string | null | undefined`
- `onSelect: (id: string) => void`
- `onClose?: ((id: string) => void) | undefined`
- `onPinChange?: ((id: string, pinned: boolean) => void) | undefined`
- `panelId?: ((id: string) => string) | undefined` — The id of the panel a tab controls (aria-controls), when there is one.
- `label?: string | undefined` — Accessible name of the strip.
- `allTabsLabel?: string | undefined`
- `closeLabel?: ((tab: DocumentTab) => string) | undefined` — The close button's tooltip, per tab: say how else to close it, e.g. `() => "Close (Alt+W)"`. Default "Close". Its accessible name stays "Close <tab label>", so it is clear which tab it closes.
- …plus the underlying element's standard props (279 inherited).

### DocumentTab (type)

- `id: string`
- `label: string` — The document's name, shown on the tab.
- `description?: string | undefined` — A second, quieter line or prefix: the document's type.
- `pinned?: boolean | undefined` — Kept at the strip's start and not closable until unpinned.
- `dirty?: boolean | undefined` — Has unsaved changes: shown as a dot, announced as "unsaved changes".

### Types

- `DocumentTabsProps` — type (see the component above)
