<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-column-mapper — API (React, the parity reference)

Exports: `autoMap`, `detectDelimiter`, `parseDelimited`, `parseImportDate`, `validateMapping`, `CellErrorKind`, `ColumnMapping`, `MapperField`, `MappingValidation`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-column-mapper>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MapperField (type)

- `id: string`
- `label: string`
- `required?: boolean | undefined`
- `type?: "number" | "date" | "text" | undefined`
- `aliases?: string[] | undefined` — Other headers that mean this field ("Item code", "Material").

### MappingValidation (type)

- `missing: string[]` — Required field ids no column is mapped to.
- `duplicates: string[]` — Field ids more than one column is mapped to.
- `cellErrors: { row: number; column: string; field: string; kind: CellErrorKind; value: string; }[]` — Row is 1-based over the data (the header row is not counted).
- `validRows: number`
- `totalRows: number`
- `ok: boolean`

### Other exports

- `autoMap(headers: readonly string[], fields: readonly MapperField[]): ColumnMapping`
- `detectDelimiter(text: string): string`
- `parseDelimited(text: string, options?: { delimiter?: string; }): string[][]`
- `parseImportDate(text: string, locale?: string): Date | null`
- `validateMapping(mapping: ColumnMapping, fields: readonly MapperField[], rows: readonly string[][], options?: { locale?: string; }): MappingValidation`
- `CellErrorKind` = `"number" | "required" | "date"`

### Types

- `ColumnMapping` — type
