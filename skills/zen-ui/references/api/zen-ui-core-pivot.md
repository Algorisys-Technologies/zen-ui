<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-pivot — API (React, the parity reference)

Exports: `createEmptyLayout`, `moveFieldToZone`, `removeFieldFromLayout`, `updateValueAggregation`, `zoneOf`, `zoneLabel`, `fieldLabel`, `availableFields`, `isLayoutRenderable`, `defaultAggregationForField`, `normalizeFilterSelection`, `isFilterActive`, `isValueSelected`, `hasActiveFilters`, `describeFilterSelection`, `describeMove`, `PIVOT_ZONES`, `PIVOT_AGGREGATIONS`, `PivotLayout`, `PivotField`, `PivotFieldType`, `PivotValueField`, `PivotZone`, `PivotAggregation`, `PivotFilters`, `PivotFilterSelection`, `PivotFilterOptionsBody`, `PivotMembersRequest`, `PivotMembersResult`, `PivotSort`, `SortDirection`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-pivot>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### PivotLayout (type)

- `rows: string[]` — Field keys, outermost first.
- `columns: string[]`
- `values: PivotValueField[]`
- `filters: PivotFilters` — Typed, not `Record<string, unknown>`. It was the latter while PivotFilterSelection sat right next to it, so every read needed a cast and `filters: otherFilters as any` was load-bearing.

### PivotField (type)

- `key: string`
- `label: string`
- `type: PivotFieldType`

### PivotValueField (type)

- `id: string`
- `aggregation: PivotAggregation`

### PivotFilterSelection (type)

- `kind: "include" | "all"`

### PivotFilterOptionsBody (type)

- `values: string[]`
- `hasMore: boolean`
- `total: number`

### PivotMembersRequest (type)

- `fieldKey: string`
- `search?: string | undefined`
- `offset?: number | undefined`
- `limit?: number | undefined`
- `filters?: PivotFilters | undefined` — The other zones' filters, so members can be narrowed by them.

### PivotMembersResult (type)

- `values: string[]`
- `hasMore: boolean`
- `total?: number | undefined`

### PivotSort (type)

- `column: string`
- `direction: SortDirection`

### Other exports

- `createEmptyLayout(): PivotLayout`
- `moveFieldToZone(layout: PivotLayout, fieldId: string, zone: PivotZone, options?: { index?: number; aggregation?: PivotAggregation; }): PivotLayout`
- `removeFieldFromLayout(layout: PivotLayout, fieldId: string): PivotLayout`
- `updateValueAggregation(layout: PivotLayout, fieldId: string, aggregation: PivotAggregation): PivotLayout`
- `zoneOf(layout: PivotLayout, fieldId: string): PivotZone`
- `zoneLabel(zone: PivotZone): string`
- `fieldLabel(fields: PivotField[], key: string): string`
- `availableFields(layout: PivotLayout, fields: PivotField[]): PivotField[]`
- `isLayoutRenderable(layout: PivotLayout): boolean`
- `defaultAggregationForField(field: PivotField): PivotAggregation`
- `normalizeFilterSelection(selection: PivotFilterSelection): PivotFilterSelection`
- `isFilterActive(selection: PivotFilterSelection | undefined): boolean`
- `isValueSelected(selection: PivotFilterSelection | undefined, value: string): boolean`
- `hasActiveFilters(filters: PivotFilters): boolean`
- `describeFilterSelection(selection: PivotFilterSelection | undefined): string`
- `describeMove(fields: PivotField[], fieldId: string, to: PivotZone, index?: number): string`
- `PIVOT_ZONES: readonly PivotZone[]`
- `PIVOT_AGGREGATIONS: readonly PivotAggregation[]`
- `PivotFieldType` = `"dimension" | "measure"`
- `PivotZone` = `"rows" | "values" | "available" | "columns"`
- `PivotAggregation` = `"max" | "min" | "count" | "sum" | "avg"`
- `SortDirection` = `"asc" | "desc"`

### Types

- `PivotFilters` — type
