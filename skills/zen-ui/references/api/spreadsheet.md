<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# spreadsheet — API (React, the parity reference)

Exports: `parseRef`, `formatRef`, `expandRange`, `evaluateFormula`, `formatCellValue`, `isCellError`, `CELL_ERRORS`, `CellMap`, `CellValue`, `CellFormat`, `CellRef`, `CellError`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-spreadsheet>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### CellFormat (type)

- `type?: "number" | "text" | "currency" | "percent" | undefined`
- `decimals?: number | undefined`
- `currency?: string | undefined` — ISO 4217, for `currency`.
- `locale?: string | undefined` — BCP 47. Defaults to the runtime's.

### CellRef (type)

- `col: number`
- `row: number`

### Other exports

- `parseRef(ref: string): CellRef | null`
- `formatRef(col: number, row: number): string`
- `expandRange(range: string): string[]`
- `evaluateFormula(input: CellValue, cells: CellMap, seen?: ReadonlySet<string>): CellValue`
- `formatCellValue(value: CellValue, format?: CellFormat): string`
- `isCellError(v: unknown): v is CellError`
- `CELL_ERRORS: readonly ["#DIV/0!", "#VALUE!", "#NAME?", "#CIRCULAR!", "#ERROR!", "#REF!"]`
- `CellValue` = `string | number | boolean | null | undefined`
- `CellError` = `"#DIV/0!" | "#VALUE!" | "#NAME?" | "#CIRCULAR!" | "#ERROR!" | "#REF!"`

### Types

- `CellMap` — type
