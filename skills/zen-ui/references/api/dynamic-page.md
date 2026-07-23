<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# dynamic-page — API (React, the parity reference)

Exports: `DynamicPage`, `DynamicPageTitle`, `DynamicPageHeader`, `DynamicPageFooter`, `DynamicPageProps`, `DynamicPageTitleProps`, `DynamicPageHeaderProps`, `DynamicPageFooterProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-dynamic-page>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### DynamicPage

- `headerExpanded?: boolean | undefined` — Controlled expanded state of the header.
- `defaultHeaderExpanded?: boolean | undefined` — Uncontrolled initial expanded state (default true).
- `onHeaderExpandedChange?: ((expanded: boolean) => void) | undefined`
- `headerPinnable?: boolean | undefined` — Offer the pin toggle that keeps the header expanded while scrolling.
- `showFooter?: boolean | undefined` — Set false to hide a `<DynamicPageFooter>` without unmounting the page.
- …plus the underlying element's standard props (280 inherited).

### DynamicPageTitle

- `heading: React.ReactNode`
- `subheading?: React.ReactNode`
- `actions?: React.ReactNode` — Rendered at the trailing edge; does not collapse.
- `breadcrumbs?: React.ReactNode`
- `expandedContent?: React.ReactNode` — Extra title content shown only while the header is EXPANDED.
- `snappedContent?: React.ReactNode` — Extra title content shown only while the header is SNAPPED — the way to keep the facts you lose to the collapse.
- …plus the underlying element's standard props (279 inherited).

### DynamicPageHeader

- `aria-label?: string | undefined` — Names the header region.
- `pinLabel?: string | undefined`
- `unpinLabel?: string | undefined`
- …plus the underlying element's standard props (279 inherited).

### DynamicPageFooter

- …plus the underlying element's standard props (280 inherited).

### Types

- `DynamicPageProps` — type (see the component above)
- `DynamicPageTitleProps` — type (see the component above)
- `DynamicPageHeaderProps` — type (see the component above)
- `DynamicPageFooterProps` — type (see the component above)
