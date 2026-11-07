<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tree-table — API (React, the parity reference)

Exports: `TreeTable`, `TreeTableProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tree-table>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### TreeTable

- `data: TData[]`
- `columns: ColumnDef<TData, TValue>[]`
- `getSubRows?: ((row: TData) => TData[] | undefined) | undefined` — Where a row's children live. Defaults to `row.children`. Return `undefined` (not `[]`) for a leaf — an empty array still reads as "expandable, but empty" and renders a chevron that does nothing.
- `getRowId?: ((originalRow: TData, index: number, parent?: Row<TData> | undefined) => string) | undefined`
- `hasChildren?: ((row: TData) => boolean) | undefined` — Which rows can be opened before their children exist. Without this a row with no children yet is indistinguishable from a leaf, so it gets no chevron and can never be opened to trigger the load.
- `loadChildren?: ((row: TData) => Promise<TData[]>) | undefined` — Fetch a row's children on its first expand. Requires `getRowId` (or an `id` on the row): the result is cached against that id, and an index-path key would move the moment anything above it is sorted or filtered.
- `onLoadChildrenError?: ((error: unknown, row: TData) => void) | undefined` — Called when `loadChildren` rejects. Without it the error is re-thrown.
- `expanded?: ExpandedState | undefined`
- `defaultExpanded?: ExpandedState | undefined` — `true` expands everything on first render.
- `onExpandedChange?: ((state: ExpandedState) => void) | undefined`
- `enableExpandAll?: boolean | undefined` — Show the expand-all / collapse-all control. Default true.
- `enableSorting?: boolean | undefined`
- `sorting?: SortingState | undefined`
- `onSortingChange?: ((state: SortingState) => void) | undefined`
- `enablePagination?: boolean | undefined` — Page the top-level rows. A page carries each root's WHOLE subtree, so `pageSize` counts roots rather than rendered rows and a page's row count varies with what is open. Paging the flattened list instead would cut through a subtree and strand its children on the next page.
- `pageSize?: number | undefined` — Root rows per page. Default 10.
- `pageSizeOptions?: number[] | undefined`
- `onPaginationChange?: ((state: PaginationState) => void) | undefined`
- `enableGlobalFilter?: boolean | undefined`
- `globalFilter?: string | undefined`
- `onGlobalFilterChange?: ((value: string) => void) | undefined`
- `globalFilterPlaceholder?: string | undefined`
- `enableRowSelection?: boolean | undefined`
- `enableSubRowSelection?: boolean | undefined` — Selecting a parent selects its descendants. Default true.
- `rowSelection?: RowSelectionState | undefined`
- `onRowSelectionChange?: ((state: RowSelectionState) => void) | undefined`
- `hierarchyColumnId?: string | undefined` — Which column carries the chevron. Defaults to the first visible column.
- `indent?: number | undefined` — Pixels of indent per level. Default 20.
- `enableVirtualization?: boolean | undefined` — Render only the rows near the viewport. Requires `maxBodyHeight` — the window needs a bounded scroller to be a window of anything.
- `rowEstimatedHeight?: number | undefined` — Row height estimate used before a row is measured. Default 44.
- `stickyHeader?: boolean | undefined`
- `headerVariant?: "underline" | "plain" | "branded" | undefined`
- `maxBodyHeight?: number | undefined`
- `rowClassName?: ((row: Row<TData>) => string | undefined) | undefined`
- `onRowClick?: ((row: Row<TData>) => void) | undefined`
- `emptyMessage?: string | undefined`
- `loading?: boolean | undefined`
- `className?: string | undefined`

### Types

- `TreeTableProps` — type (see the component above)
