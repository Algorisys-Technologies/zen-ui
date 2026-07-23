<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# components-pivot — API (React, the parity reference)

Exports: `PivotWorkbench`, `PivotGrid`, `PivotDropZone`, `PivotFieldChip`, `PivotFilterMenu`, `PivotWorkbenchProps`, `PivotGridProps`, `PivotDropZoneProps`, `PivotFieldChipProps`, `PivotFilterMenuProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-components-pivot>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PivotWorkbench

- `fields: PivotField[]`
- `initialLayout?: PivotLayout | undefined`
- `onLayoutApply?: ((layout: PivotLayout) => void) | undefined` — Fires on "View Data", not on every drag.
- `className?: string | undefined`
- `children?: React.ReactNode` — The grid. Rendered, never talked to.
- `totalRows?: number | undefined`
- `totalCols?: number | undefined`
- `onClearFilters?: (() => void) | undefined`
- `showBuilder?: boolean | undefined`
- `loadMembers?: ((request: PivotMembersRequest) => Promise<PivotMembersResult>) | undefined`

### PivotGrid

- `layout: PivotLayout`
- `totalRows: number`
- `totalCols: number`
- `rowHeaderDepth: number`
- `colHeaderDepth: number`
- `getCell: (row: number, col: number) => { value: unknown; isLoading?: boolean; } | null`
- `getRowHeader: (row: number, depth: number) => { value: string; rowSpan?: number; isVisible?: boolean; isLoading?: boolean; } | null`
- `getColHeader: (depth: number, col: number) => { value: string; colSpan?: number; isVisible?: boolean; isLoading?: boolean; } | null`
- `rowHeight?: number | undefined`
- `colWidth?: number | undefined`
- `rowHeaderWidth?: number | undefined`
- `label?: string | undefined` — Names the grid for a screen reader.
- `onVisibleRangeChange?: ((range: { rowStart: number; rowEnd: number; colStart: number; colEnd: number; }) => void) | undefined`

### PivotDropZone

- `id: PivotZone`
- `title: string`
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" | "star" …`
- `hideTitle?: boolean | undefined`
- `className?: string | undefined`
- `horizontal?: boolean | undefined`
- `children?: React.ReactNode`
- `isEmpty?: boolean | undefined`

### PivotFieldChip

- `fieldKey: string`
- `fields: PivotField[]`
- `hasActiveFilter?: boolean | undefined`
- `selection?: PivotFilterSelection | undefined`
- `filters?: PivotFilters | undefined`
- `loadMembers?: ((request: PivotMembersRequest) => Promise<PivotMembersResult>) | undefined`
- `onSelectionChange?: ((selection: PivotFilterSelection | null) => void) | undefined`
- `onRemove?: (() => void) | undefined`
- `zone?: PivotZone | undefined`
- `aggregation?: PivotAggregation | undefined`
- `onAggregationChange?: ((aggregation: PivotAggregation) => void) | undefined`
- `onMoveToZone?: ((zone: PivotZone) => void) | undefined` — Move this field to another zone. THE KEYBOARD PATH. dnd-kit does ship a KeyboardSensor, but it emulates a drag with arrow keys — which for a four-bin builder means memorising a spatial layout you cannot see. WAI-ARIA asks for an ALTERNATIVE to dragging rather than a keyboard mime of it, so the ⋮ handle opens a menu of zones. The Solid binding has no keyboard sensor at all, so this is also what makes the two behave alike.
- `singleSelect?: boolean | undefined`
- `disabled?: boolean | undefined`
- `dragHandleProps?: React.HTMLAttributes<HTMLElement> | undefined` — Drag handle props from the sortable wrapper.

### PivotFilterMenu

- `columnKey: string`
- `label: string`
- `selection?: PivotFilterSelection | undefined`
- `formatValue?: ((value: string) => string) | undefined`
- `onChange: (selection: PivotFilterSelection | null) => void`
- `loadOptions?: ((columnKey: string, optionSearch: string, pagination?: { offset: number; limit: number; }) => Promise<PivotFilterOptionsBody>) | undefined`
- `triggerClassName?: string | undefined`
- `triggerChildren?: React.ReactNode`
- `singleSelect?: boolean | undefined`

### Types

- `PivotWorkbenchProps` — type (see the component above)
- `PivotGridProps` — type (see the component above)
- `PivotDropZoneProps` — type (see the component above)
- `PivotFieldChipProps` — type (see the component above)
- `PivotFilterMenuProps` — type (see the component above)
