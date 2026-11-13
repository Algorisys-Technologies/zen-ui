<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# column-mapper-column-mapper — API (React, the parity reference)

Exports: `ColumnMapper`, `ColumnMapperProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-column-mapper-column-mapper>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ColumnMapper

- `rows: string[][]` — The file's rows, header first.
- `fields: MapperField[]`
- `mapping?: ColumnMapping | undefined`
- `defaultMapping?: ColumnMapping | undefined` — Defaults to the automatic match.
- `onChange?: ((mapping: ColumnMapping, validation: MappingValidation) => void) | undefined`
- `previewRows?: number | undefined` — Rows shown in the preview. Default 5.
- …plus the underlying element's standard props (278 inherited).

### Types

- `ColumnMapperProps` — type (see the component above)
