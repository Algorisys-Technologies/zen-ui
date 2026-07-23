<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# data-table — API (React, the parity reference)

Exports: `DataTable`, `DataTableProps`, `DataTableManualPagination`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-data-table>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DataTable

- `data: TData[]`
- `columns: ColumnDef<TData, TValue>[]`
- `enableSorting?: boolean | undefined`
- `enableMultiSort?: boolean | undefined` — Allow chaining multiple sort columns via Shift-click on headers. Implies `enableSorting`. TanStack reads the Shift modifier from the native click event automatically.
- `enablePagination?: boolean | undefined`
- `enableColumnFilters?: boolean | undefined`
- `enableRowSelection?: boolean | undefined`
- `enableColumnVisibility?: boolean | undefined`
- `enableVirtualization?: boolean | undefined`
- `enableColumnOrdering?: boolean | undefined` — Drag column headers sideways to reorder. Persists nothing — caller can lift onColumnOrderChange.
- `onColumnOrderChange?: ((order: string[]) => void) | undefined`
- `enableColumnResizing?: boolean | undefined` — Drag column dividers to resize.
- `enablePerColumnFilters?: boolean | undefined` — Render a per-column filter row under the header. Inputs are <Input>s by default.
- `enableExport?: boolean | undefined` — Show an "Export" button in the toolbar with CSV / JSON options.
- `exportFilename?: string | undefined` — Filename (without extension) for exports. Default "data-table".
- `exportOnlySelected?: boolean | undefined` — When true, export only selected rows (requires enableRowSelection).
- `enableColumnSeparators?: boolean | undefined` — Vertical 1-px dividers between columns (per Zen theme table spec, opt-in).
- `enableRowOrdering?: boolean | undefined` — Drag-to-reorder rows. Adds a leading grip-handle column; on drop fires `onRowOrderChange(newIdsInOrder)`. Caller owns the source `data` array and is responsible for reordering it. For stable drag identity, the consumer should pass `getRowId` via a column / table option so each row has a permanent key (otherwise TanStack uses row index, which changes after a reorder). Forcibly disabled when `enableVirtualization` is on — the grip column is hidden and `onRowOrderChange` will never fire. A dev-mode `console.warn` flags the misconfig.
- `onRowOrderChange?: ((orderedIds: string[]) => void) | undefined`
- `renderSubRow?: ((row: Row<TData>) => React.ReactNode) | undefined` — Expandable rows. Pass a render function and DataTable prepends a chevron toggle column; when a row is expanded, the function renders a full-width detail panel directly beneath the row. <DataTable data={orders} columns={cols} renderSubRow={(row) => ( <div className="px-6 py-3"> <OrderDetails id={row.original.id} /> </div> )} /> The caller controls rendering of the expanded content; DataTable just manages the expand toggle + the row-below slot. Expansion state can be controlled via `expanded` + `onExpandedChange` if you need to drive it externally (e.g. expand-all from a button). Forcibly disabled when `enableVirtualization` is on — the expand toggle column is hidden and sub-rows won't render. A dev-mode `console.warn` flags the misconfig. Sub-rows have variable height which the fixed-size virtualizer doesn't model.
- `expanded?: ExpandedState | undefined`
- `onExpandedChange?: ((state: ExpandedState) => void) | undefined`
- `enableGrouping?: boolean | undefined` — Row grouping. Set `enableGrouping` and pass one or more column ids via `grouping` / `initialGrouping`. Rows that share the same value in a grouped column are nested under a group-header row showing "▶ <value> (N)"; clicking the toggle expands/collapses the group. <DataTable enableGrouping initialGrouping={["role"]} columns={[ { accessorKey: "role", header: "Role" }, { accessorKey: "salary", header: "Salary", aggregationFn: "sum", aggregatedCell: (info) => `Σ ${info.getValue<number>().toLocaleString()}` }, ... ]} /> Per-column control: - `enableGrouping: false` on a column def excludes it from the GroupBy menu (the user can't group by it). - `aggregationFn` + `aggregatedCell` produce the value rendered in each non-grouped column on the group-header row. Grouping forces expansion on under the hood, so renderSubRow and row grouping are mutually exclusive in the same table. **Forcibly disabled when `enableVirtualization` is on.** Mixing grouping with the fixed-size virtualizer would render group-header rows as plain data rows and mis-display aggregated values as scalars (data-integrity risk), so DataTable hard-gates the combo and emits a dev-mode `console.error`. Disable virt to use grouping.
- `grouping?: GroupingState | undefined`
- `initialGrouping?: GroupingState | undefined`
- `onGroupingChange?: ((state: GroupingState) => void) | undefined`
- `rowClassName?: ((row: Row<TData>) => string | undefined) | undefined` — Per-row className hook. Called for each rendered body row; the returned string is merged into the row's className (after the built-in classes that handle hover / selected / borders). Useful for status-based row tinting: <DataTable rowClassName={(row) => row.original.status === "suspended" ? "bg-zen-error-soft/50" : "" } /> Works in regular, row-reorder, and virtualized render paths.
- `persistKey?: string | undefined` — Persist user-tweaked column state to localStorage under `zen-dt:${persistKey}`. The persisted snapshot covers `columnOrder`, `columnSizing`, `columnVisibility`, and `columnPinning` — anything the user can manipulate via drag / resize / Columns menu. Filters, sorting, selection, and pagination are deliberately left out (too volatile, usually app-state not user-state). <DataTable persistKey="people-table" … /> The hydrated snapshot only applies to uncontrolled state — if you also pass `columnPinning` (etc.) as a controlled prop, that wins. No-op when omitted; localStorage failures (quota, private mode) are swallowed.
- `getRowId?: ((originalRow: TData, index: number, parent?: Row<TData> | undefined) => string) | undefined` — Stable row-id resolver. Defaults to the row's array index, which is fine for static lists but breaks identity-tracking features the moment rows reorder or get inserted: row selection by id, row reorder drag-and-drop, and inline cell editing (the editingCell pointer stops matching after a commit re-renders the row). <DataTable data={users} getRowId={(u) => u.id} … /> Mirrors TanStack's getRowId option signature.
- `renderBulkActions?: ((ctx: { table: TanStackTable<TData>; rows: Row<TData>[]; clear: () => void; }) => React.ReactNode) | undefined` — Render a contextual toolbar when one or more rows are selected. The caller decides what actions go inside (Delete, Export, Approve, …); DataTable supplies the surrounding chrome — selected count, a "Clear selection" button, and a "Select all N matching" affordance when only the current page is checked but more rows match the current filter. <DataTable enableRowSelection renderBulkActions={({ rows, clear }) => ( <> <Button onClick={() => mutate(rows)}>Delete</Button> <Button variant="outline" onClick={clear}>Cancel</Button> </> )} /> Receives the table, the selected `Row<TData>[]`, and a `clear()` helper that resets selection.
- `onCellEdit?: ((payload: CellEditPayload) => void) | undefined` — Inline cell editing. Declare `meta.editable: true` (or a `(row) => boolean`) on any column to opt that column in. Double-click (or Enter when focused) swaps the cell content for the matching input — text by default, or `meta.editVariant: "number" | "select"`. Enter commits, Esc cancels, blur commits. <DataTable data={rows} columns={cols} onCellEdit={({ rowId, columnId, value }) => setRows(prev => prev.map(r => r.id === rowId ? { ...r, [columnId]: value } : r))} /> Pass `getRowId` on the table options (via column meta or a wrapper) so rowId is stable across re-renders.
- `stickyHeader?: boolean | undefined` — Pin the header row to the top of a scroll viewport. In virtualized mode the header is already sticky and this prop is ignored. In non-virtualized mode the body is wrapped in a `maxBodyHeight` scroll container so the header has something to stick against.
- `enableColumnPinning?: boolean | undefined` — Freeze columns to the left or right edge while the body scrolls horizontally. Pinned cells get a 1-px divider and a soft shadow on their inner edge so they read as floating. <DataTable enableColumnPinning initialColumnPinning={{ left: ["name"], right: ["actions"] }} /> Pass `columnPinning` + `onColumnPinningChange` for controlled mode. Works in both regular and virtualized modes; in virtualized mode the pinned columns should have explicit `size` on their column def so the horizontal-scroll offsets are stable.
- `columnPinning?: ColumnPinningState | undefined`
- `initialColumnPinning?: ColumnPinningState | undefined`
- `onColumnPinningChange?: ((state: ColumnPinningState) => void) | undefined`
- `headerVariant?: "underline" | "plain" | "branded" | undefined` — Brand intensity of the column-header row. - "plain" (default) — neutral grey chrome, brand color shows up only on selected rows / filter chips / focus rings. Best when the table coexists with other UI on a page. - "underline" — adds a 2-px primary underline under the header row. Light touch; still reads as a data table, not a hero. - "branded" — header band filled with primary-soft + dark-primary label text. For tables that are the focal point of a page (dashboards, single-resource lists).
- `pageSize?: number | undefined`
- `pageSizeOptions?: number[] | undefined`
- `maxBodyHeight?: number | undefined`
- `rowEstimatedHeight?: number | undefined`
- `globalFilterPlaceholder?: string | undefined`
- `emptyMessage?: string | undefined`
- `loading?: boolean | undefined`
- `className?: string | undefined`
- `manualPagination?: DataTableManualPagination | undefined`
- `manualSorting?: boolean | undefined` — Skip the client-side sort row model. The data array is taken as already-sorted by the caller; sort header clicks fire `onSortingChange` (or update the controlled `sorting` state) so the consumer can re-fetch with the new order.
- `manualFiltering?: boolean | undefined` — Skip the client-side filter row model. The data array is taken as already-filtered. Filter inputs still drive `onColumnFiltersChange` / `onGlobalFilterChange` so the consumer can re-fetch with the new predicate.
- `sorting?: SortingState | undefined`
- `onSortingChange?: ((state: SortingState) => void) | undefined`
- `columnFilters?: ColumnFiltersState | undefined`
- `onColumnFiltersChange?: ((state: ColumnFiltersState) => void) | undefined`
- `rowSelection?: RowSelectionState | undefined`
- `onRowSelectionChange?: ((state: RowSelectionState) => void) | undefined`
- `columnVisibility?: VisibilityState | undefined`
- `onColumnVisibilityChange?: ((state: VisibilityState) => void) | undefined`
- `globalFilter?: string | undefined`
- `onGlobalFilterChange?: ((value: string) => void) | undefined`

### DataTableManualPagination (type)

- `pageIndex: number`
- `pageCount: number`
- `pageSize?: number | undefined`
- `onPageChange: (next: number) => void`

### Types

- `DataTableProps` — type (see the component above)
