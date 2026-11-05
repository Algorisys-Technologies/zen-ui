# Vanilla DataTable — the features it never had

Owner's go-ahead 2026-11-05. Vanilla's DataTable (and so `<zen-data-table>`,
which wraps it) is a hand-written grid: no TanStack, and no new runtime
dependency is allowed, so every data feature React and Solid get from
TanStack is written here. 12.3.0 ported only 12.2.0's additions; the older
features were never ported, and `check:parity` cannot see a missing PROP,
which is how it stayed hidden.

## The gap, measured

`DataTableProps`: React 73, Solid 73 (the same 73), vanilla 47. The 27 in
React and Solid but not vanilla, by feature:

| # | Feature | Props |
|---|---|---|
| A | Column visibility + Columns menu | `enableColumnVisibility`, `columnVisibility`, `onColumnVisibilityChange` |
| B | Column ordering | `enableColumnOrdering`, `onColumnOrderChange` |
| C | Column resizing | `enableColumnResizing` |
| D | Column pinning | `enableColumnPinning`, `columnPinning`, `initialColumnPinning`, `onColumnPinningChange` |
| E | Layout memory | `persistKey` |
| F | Per-column filters | `enablePerColumnFilters`, `enableFilterOperators`, `columnFilters`, `onColumnFiltersChange`, `manualFiltering` |
| G | Server sorting | `manualSorting` |
| H | Expandable rows | `renderSubRow`, `expanded`, `onExpandedChange` |
| I | Grouping + subtotals | `enableGrouping`, `grouping`, `initialGrouping`, `onGroupingChange` |
| J | Client export menu | `enableExport`, `exportOnlySelected` |
| K | Bulk actions | `renderBulkActions` |

(React's extra `className` and vanilla's `id` are each binding's idiom, not a gap.)

## Approach

- **Port behaviour, not syntax.** React is the API reference; names, defaults
  and what a user sees and hears match it. The 12.5 / 12.6 work (meta.label,
  Reset columns, keyboard resize as a `role="separator"`, Alt+↑/↓ in the
  Columns menu, `toolbarPlacement`) comes with A–D, not later.
- **Pure logic goes to core**, so vanilla does not grow a third copy:
  - per-column filter matching (text with operators, number, range, select,
    boolean), today duplicated in React's and Solid's `filters.tsx`;
  - column-state ordering / pinning / visibility helpers next to
    `core/columns.ts` (`moveColumn` is there already);
  - grouping and subtotals on `core/aggregate.ts`.
  Each with a `check:*` script. React and Solid can adopt the shared filter
  matcher later; this work does not change them.
- **Pointer drag for header reorder** follows vanilla SortableList's
  hand-written pointer path; the keyboard path is the Columns menu's
  Alt+↑/↓, as in React and Solid.
- **Web components in the same phase**: each new prop gets its attribute,
  property or event on `<zen-data-table>`, and the WC demo its section.
- **Nothing existing moves.** Every feature is opt-in behind its flag, as in
  the other bindings; a vanilla table that sets none of them renders as it
  does today (route-snapshot comparison before / after each phase).

## Phases (each one shipped on its own)

0. **A props-parity check** (`check:props`): DataTableProps first, then every
   component's Props, compared across the four bindings, with an allowlist
   of known gaps that may only shrink. Red items are the remaining phases.
1. **Columns: A, B, C, D, E** — the column-state layer, Columns menu (Reset,
   Alt+↑/↓, current order), keyboard resize separator, header drag, pinning
   (sticky offsets), `persistKey`, `toolbarPlacement` for the new menus.
2. **Filtering and server sorting: F, G** — the filter row, operators,
   controlled `columnFilters`, `manualFiltering`, `manualSorting`.
3. **Expandable rows: H.**
4. **Grouping: I** — group rows, subtotals from `meta.aggregate`, Group by menu.
5. **Client export and bulk actions: J, K.**

Verification per phase, as for AnalyticChart and 12.5: driven in a browser
by keyboard as well as pointer, in vanilla and web components; `check`,
lint ×4, `visual-check`, the route-snapshot comparison for vanilla and WC.

## Status

- [x] Phase 0: `check:props` (in `bun run check`): 128 props interfaces in
  two or more bindings compared; 44 known gaps listed, 27 of them DataTable.
  It also surfaced React/Solid divergences (RichText `math` / `onImageUpload`,
  CodeEditor `loading` vs `loaderConfig`, PivotFilterMenu sort, DirectionProvider
  `locale`) and TreeTable's 7 controlled-state props in vanilla.
- [x] Phase 1: columns (2026-11-05). Visibility, ordering (header drag +
  Alt+↑/↓ in the Columns menu), resizing (separator: drag or arrows), pinning
  (sticky, offsets measured after layout, selection column sticks too),
  `persistKey` (the same `zen-dt:` entry React and Solid write; measured
  identical), Reset columns, `toolbarPlacement` for the Columns menu; vanilla
  and `<zen-data-table>`. Driven in a browser by keyboard and pointer in both,
  with the probe React and Solid passed. Not in this phase: pinning in the
  older div-grid body (`enableVirtualization`), and live feedback while
  dragging a resize handle there (the width applies on release). The Columns
  menu with pinning uses a submenu per column (show; not pinned / left /
  right), keyboard-reachable, unlike React's and Solid's pin buttons.
- [x] Phase 2: filters, server sorting (2026-11-05). The filter row (text and
  number with operators, range, select, boolean), chips with Clear all,
  controlled `columnFilters`, `enableFilterOperators`, `manualFiltering`,
  `manualSorting`; vanilla and `<zen-data-table>`. Matching in
  core/column-filter, proven identical to React's FilterFns over 570 cases.
  Filter inputs persist across repaints (focus and caret kept while typing;
  IME composition respected). Found on the way and fixed: vanilla Select and
  NumberField put `aria-label` on their wrapper, so the control was unnamed.
- [x] Phase 3: expandable rows (2026-11-05). `renderSubRow` (a chevron column
  and a full-width detail row, React's markup), controlled `expanded` (`true`
  or a record) + `onExpandedChange`; vanilla and `<zen-data-table>`. Works in
  the paged table and inside row virtualization, where an open row and its
  detail are mounted, moved and measured as one item (verified: unmounted far
  away, re-paired on return, bottom reachable over 2,000 rows).
- [ ] Phase 4: grouping
- [ ] Phase 5: client export, bulk actions
