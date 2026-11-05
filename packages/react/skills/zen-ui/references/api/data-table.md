<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# data-table — API (React, the parity reference)

Exports: `DataTable`, `DataTableProps`, `DataTableManualPagination`, `DataTableMenuTarget`

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
- `toolbarPlacement?: "top" | "pagination" | undefined` — Where the toolbar's menu buttons (Export, Group by, Columns) sit. `"top"` (default): their own row above the table. `"pagination"`: in the pager row, beside the page buttons, so a table whose toolbar would be one button does not spend a row on it. The search box stays above the table, next to what it filters. Without a pager the buttons stay on top.
- `enableVirtualization?: boolean | undefined` — The older virtualized body: a grid of divs, not the table, so it renders differently and cannot group, expand sub-rows, reorder rows or take keyboard navigation. Kept as it is for the tables already built on it; new tables want `enableRowVirtualization`.
- `enableRowVirtualization?: boolean | undefined` — Render only the rows in view, inside the regular table: the same rows, cells and features as an unvirtualized table (grouping, sub-rows, keyboard navigation, cell navigation, editing, pinning, a sticky header, `fillHeight`), for thousands of rows. Heights are measured, so group rows and expanded sub-rows may differ from the rest. The rows scroll inside the table: give it `fillHeight` or it is capped at `maxBodyHeight`. Columns keep their widths as rows come and go (the table lays out from the header). With `enableRowOrdering`, rows are dragged by the table itself, to anywhere in it (it scrolls near its edges; Esc cancels), and expanded panels are off. Wins over `enableVirtualization` when both are set.
- `enableColumnOrdering?: boolean | undefined` — Drag column headers sideways to reorder. Persists nothing — caller can lift onColumnOrderChange.
- `onColumnOrderChange?: ((order: string[]) => void) | undefined`
- `enableColumnResizing?: boolean | undefined` — Drag column dividers to resize.
- `enablePerColumnFilters?: boolean | undefined` — Render a per-column filter row under the header. Inputs are <Input>s by default.
- `enableFilterOperators?: boolean | undefined` — Render the operator select beside each per-column filter input. Default true. Turn it off when the server owns the predicate — an operator the backend ignores is a control that lies about what it does.
- `enableExport?: boolean | undefined` — Show an "Export" button in the toolbar with CSV / JSON options.
- `exportFilename?: string | undefined` — Filename (without extension) for exports. Default "data-table".
- `exportOnlySelected?: boolean | undefined` — When true, export only selected rows (requires enableRowSelection).
- `onExport?: ((format: ExportFormat, request: ExportRequest) => void | Blob | { url: string; filename?: string; } | Promise<void | Blob | { url: string; filename?: string; }>) | undefined` — Export on the SERVER: for data too large to be in the browser (a table showing one page of a million rows). The Export menu then offers `exportFormats` and hands your server an ExportRequest: exactly what the user is looking at (visible columns in order with header, width, format and total; filters, sort, grouping; locale; all matching rows, or the selected ids, even ones on pages never loaded). Your endpoint queries the full data and renders the file. Return a Blob (downloaded as `exportFilename`), a `{ url }` (opened as a download), or nothing (you handled it). A rejected Promise is shown as the reason. Without it, Export is the client-side CSV of the loaded rows, as before.
- `exportFormats?: ExportFormat[] | undefined` — The formats the server export offers, in menu order. Default xlsx, pdf, csv.
- `exportContext?: Record<string, unknown> | undefined` — Extra state for the server (a FilterBuilder tree, a saved view's id): sent as `request.context`.
- `exportTitle?: string | undefined` — A title for the exported document (a report heading).
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
- `onCellsEdit?: ((edits: CellEditPayload[]) => void) | undefined` — Several cells changed at once: a paste, or Delete over a selection, with enableCellNavigation. Without it each change goes to onCellEdit.
- `enableCellNavigation?: boolean | undefined` — Work in the table cell by cell, as in a spreadsheet. One tab stop for the table; the arrows, PageUp/PageDown, Home/End and Ctrl+Home/End move between cells (the arithmetic is
- `contextMenu?: ((target: DataTableMenuTarget<TData>) => React.ReactNode) | undefined` — A right-click menu for the rows: return ContextMenu items for the target (the row, the cell's column, and the selection it acts on). Right-clicking a row or cell focuses it, as on a desktop; the menu key and Shift+F10 open the menu for the focused row or cell; focus returns there when it closes. Outside the rows (the header, the footer) the browser keeps its own menu. contextMenu={({ row, selection }) => (<> <ContextMenuItem onSelect={() => openInNewTab(row.original)}>Open in new tab</ContextMenuItem> <ContextMenuItem variant="destructive" onSelect={() => remove(selection)}>Delete…</ContextMenuItem> </>)}
- `enableKeyboardNavigation?: boolean | undefined` — Rows take keyboard focus, with one tab stop for the whole table: ↑/↓, Home/End and PageUp/PageDown move between rows (the key logic is
- `onRowActivate?: ((row: Row<TData>, event: React.KeyboardEvent<HTMLTableRowElement>) => void) | undefined` — Enter on a focused row. The event carries its modifiers, so Ctrl+Enter can mean something else.
- `rowLabel?: ((row: Row<TData>) => string) | undefined` — A row's accessible name, read as focus moves onto it.
- `stickyHeader?: boolean | undefined` — Pin the header row to the top of a scroll viewport. In virtualized mode the header is already sticky and this prop is ignored. In non-virtualized mode the body is wrapped in a `maxBodyHeight` scroll container so the header has something to stick against.
- `fillHeight?: boolean | undefined` — Fill the parent's height: the rows scroll inside the table, under a header that stays put, and the pager stays below. For a list that is the page's main pane. The parent must give it a height (a flex child with min-height 0, or a fixed height). Implies stickyHeader; maxBodyHeight is ignored.
- `totalsOver?: "filtered" | "page" | undefined` — Which rows a column's `meta.aggregate` totals: every row the filters let through, across pages (default), or the rows on this page.
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

### Other exports

- `DataTableMenuTarget` = `DataTableMenuTarget<TData>`

### Types

- `DataTableProps` — type (see the component above)
