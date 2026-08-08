<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# url-data-table — API (React, the parity reference)

Exports: `UrlDataTable`, `parseSortParam`, `serializeSortParam`, `parseFilterParam`, `serializeFilterParam`, `UrlDataTableProps`, `UrlDataTableColumn`, `UrlDataTableFilter`, `UrlDataTableFilterOption`, `UrlDataTableParamNames`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-url-data-table>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### UrlDataTable

- `columns: UrlDataTableColumn<TRow>[]`
- `rows: TRow[]` — The current page of rows, already sorted and filtered by the server.
- `params: URLSearchParams` — Current querystring.
- `onParamsChange: (next: URLSearchParams) => void` — Called with the next querystring whenever the user changes table state.
- `search?: boolean | undefined` — Show the global search box.
- `searchPlaceholder?: string | undefined`
- `filters?: UrlDataTableFilter[] | undefined` — Dropdown filters rendered in the toolbar.
- `actions?: ((row: TRow) => React.ReactNode) | undefined` — Trailing actions column.
- `actionsLabel?: string | undefined`
- `page?: number | undefined` — 1-based, to match the way page numbers appear in a URL.
- `pageCount?: number | undefined`
- `pageSize?: number | undefined`
- `totalCount?: number | undefined`
- `emptyMessage?: string | undefined`
- `loading?: boolean | undefined`
- `paramNames?: UrlDataTableParamNames | undefined` — Override the querystring keys if they collide with something else.
- `className?: string | undefined`

### UrlDataTableFilter (type)

- `label: string`
- `key: string`
- `values: UrlDataTableFilterOption[]`

### UrlDataTableFilterOption (type)

- `label: string`
- `value: string`

### UrlDataTableParamNames (type)

- `sort?: string | undefined`
- `filters?: string | undefined`
- `search?: string | undefined`
- `page?: string | undefined`

### Other exports

- `parseSortParam(raw: string | null): SortingState`
- `serializeSortParam(sorting: SortingState): string`
- `parseFilterParam(raw: string | null): ColumnFiltersState`
- `serializeFilterParam(filters: ColumnFiltersState): string`
- `UrlDataTableColumn` = `UrlDataTableColumn<TRow>`

### Types

- `UrlDataTableProps` — type (see the component above)
