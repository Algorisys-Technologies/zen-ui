<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# object-page — API (React, the parity reference)

Exports: `ObjectPageLayout`, `ObjectPageLayoutProps`, `ObjectPageSection`, `ObjectPageSubSection`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-object-page>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ObjectPageLayout

- `sections: ObjectPageSection[]`
- `selectedSectionId?: string | undefined` — Controlled active section. Setting it scrolls there.
- `defaultSelectedSectionId?: string | undefined`
- `onSelectedSectionChange?: ((id: string) => void) | undefined` — Fires for both a click on an anchor and a scroll that changes the section.
- `header?: React.ReactNode` — The object header — scrolls away under the anchor bar.
- `title?: React.ReactNode` — Stays put above the scroller.
- `showAnchorBar?: boolean | undefined`
- `anchorBarLabel?: string | undefined` — Accessible name for the anchor bar's nav landmark.
- …plus the underlying element's standard props (279 inherited).

### ObjectPageSection (type)

- `id: string`
- `title: React.ReactNode`
- `subSections?: ObjectPageSubSection[] | undefined`
- `content?: React.ReactNode`

### ObjectPageSubSection (type)

- `id: string`
- `title: React.ReactNode`
- `content: React.ReactNode`

### Types

- `ObjectPageLayoutProps` — type (see the component above)
