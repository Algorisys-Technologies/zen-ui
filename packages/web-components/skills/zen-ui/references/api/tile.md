<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tile — API (React, the parity reference)

Exports: `Tile`, `TileGrid`, `TileProps`, `TileGridProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tile>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Tile

- `title: React.ReactNode` — The tile's name.
- `subtitle?: React.ReactNode` — A live line under the name: a count, a status, "Open".
- `avatar?: string | undefined` — Up to two letters in a square mark ("SI"). Ignored when `icon` is given.
- `icon?: React.ReactNode` — An icon in the square mark, in place of `avatar`.
- `href?: string | undefined` — Makes the tile a link.
- `as?: React.ElementType<any, keyof React.JSX.IntrinsicElements> | undefined` — The link element: a router's `Link`, say. Default "a". It is given `href` and, for routers that navigate by `to` (react-router), `to` as well.
- `onClick?: ((e: React.MouseEvent<HTMLElement>) => void) | undefined` — Makes the tile a button (when it has no href).
- `loading?: boolean | undefined` — The subtitle is still coming: shown as a skeleton, and the tile is marked busy.
- `disabled?: boolean | undefined` — Not available: not focusable, not activated, dimmed.
- `locked?: boolean | undefined` — Outside what this user has (a module not in their plan): muted, with a lock. Still activatable, so the app can say why or offer an upgrade.
- `lockedLabel?: string | undefined` — Read with a locked tile's name, and shown under it. Default "Locked".
- `className?: string | undefined`

### TileGrid

- `minTileWidth?: string | undefined` — The narrowest a tile gets before the grid drops a column. Default: --zen-tile-min-width.
- …plus the underlying element's standard props (280 inherited).

### Types

- `TileProps` — type (see the component above)
- `TileGridProps` — type (see the component above)
