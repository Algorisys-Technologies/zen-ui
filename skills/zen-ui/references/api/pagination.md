<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# pagination — API (React, the parity reference)

Exports: `Pagination`, `usePaginationRange`, `PaginationProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-pagination>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Pagination

- `page: number` — current page, 1-based
- `pageCount: number` — total number of pages
- `onPageChange: (page: number) => void` — called with the next 1-based page
- `siblingCount?: number | undefined` — pages shown either side of the current page (default 1)
- `boundaryCount?: number | undefined` — pages pinned at each end (default 1)
- `hidePrevNext?: boolean | undefined` — hide the Prev / Next controls
- …plus the underlying element's standard props (279 inherited).

### Other exports

- `usePaginationRange({ page, pageCount, siblingCount, boundaryCount, }: { page: number; pageCount: number; siblingCount?: number; boundaryCount?: number; }): Array<number | typeof DOTS>`

### Types

- `PaginationProps` — type (see the component above)
