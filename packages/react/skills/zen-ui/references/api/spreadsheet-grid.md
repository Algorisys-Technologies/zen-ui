<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# spreadsheet-grid — API (React, the parity reference)

Exports: `SpreadsheetGrid`, `SheetCalculator`, `SpreadsheetGridProps`, `SheetCalculatorProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-spreadsheet-grid>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### SpreadsheetGrid

- `rows?: number | undefined`
- `cols?: number | undefined`
- `cells?: CellMap | undefined` — `{A1: 10, B1: "=A1*2"}`. Controlled.
- `onCellsChange?: ((cells: CellMap) => void) | undefined`
- `formats?: Record<string, CellFormat> | undefined` — Per-cell or per-column display format, keyed by address or column letter.
- `readOnly?: boolean | undefined`
- `colWidth?: string | undefined` — Column width. Default `"6rem"`.
- `onCellCommit?: ((ref: string, raw: CellValue, evaluated: CellValue) => void) | undefined` — Fires with the evaluated value whenever a cell is committed.
- `className?: string | undefined`

### SheetCalculator

- `summary?: React.ReactNode` — Shown above the grid — the formula of the selected cell, and a total.
- `rows?: number | undefined`
- `cols?: number | undefined`
- `cells?: CellMap | undefined` — `{A1: 10, B1: "=A1*2"}`. Controlled.
- `onCellsChange?: ((cells: CellMap) => void) | undefined`
- `formats?: Record<string, CellFormat> | undefined` — Per-cell or per-column display format, keyed by address or column letter.
- `readOnly?: boolean | undefined`
- `colWidth?: string | undefined` — Column width. Default `"6rem"`.
- `onCellCommit?: ((ref: string, raw: CellValue, evaluated: CellValue) => void) | undefined` — Fires with the evaluated value whenever a cell is committed.
- `className?: string | undefined`

### Types

- `SpreadsheetGridProps` — type (see the component above)
- `SheetCalculatorProps` — type (see the component above)
