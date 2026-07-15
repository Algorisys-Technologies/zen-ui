# Changelog

All three published packages — `@algorisys/zen-ui-core`, `@algorisys/zen-ui-react`
and `@algorisys/zen-ui-solid` — share one version.

They ship the same API by construction: a component that exists in one binding
and not the other is a bug here, not a roadmap item (see the parity rule in
[CLAUDE.md](CLAUDE.md)). Two version numbers describing one API would only
diverge and force every question to name a binding first.

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] — 2026-07-15

The first release. Nothing before this was published or tagged, so everything
below is what a consumer gets on day one rather than a delta from a version
anyone could install. `zen-ui-solid` previously *declared* 1.0.0 and
`zen-ui-core` 0.0.0; both join React at 3.0.0 here.

The major is earned by the CSS isolation change (`fix(css)!`), which is
breaking against the 2.x line the library was used at internally: zen-ui no
longer ships page-level or element-level CSS from its entry, and the element
reset is opt-in via the `/preflight` export. It previously set the consuming
document's root font size to 10px.

### Added

**Application frame**
- `ShellBar` — top-level application header: branding, search, actions, profile
- `FlexibleColumnLayout` — 1–3 column master-detail with responsive collapse
- `DynamicPage` — title + header that snaps away on scroll; pinnable
- `ObjectPageLayout` — scroll-spy anchored sections
- `Page` / `Bar` — whole-screen container and three-slot row
- `PageHeader` — a heading with a back affordance and one action, for the
  screens that want a title rather than a snapping header

**Table ecosystem**
- `SelectDialog` — searchable list picker; single commits on click, multi on OK
- `ValueHelp` — F4 lookup dialog: the list picker plus a condition builder
- `ViewSettingsDialog` — sort / group / filter settings; commits on OK
- `FilterBar` — the List Report filter area: fields, Go, and Adapt filters

**Form and display**
- `MaskInput` — fixed-template input. The mask engine is framework-agnostic and
  lives in `@algorisys/zen-ui-core/mask`, so both bindings cannot disagree
  about what a mask means
- `ColorPicker` / `ColorPalette` — a swatch that opens a palette, a hex field
  and the platform's own picker. The colour maths is framework-agnostic and
  lives in `@algorisys/zen-ui-core/color`
- `Chart` — `type="pie"` and `type="donut"`, alongside line/area/bar. A pie is
  the existing props asking a different question, so it needed no new concepts:
  `xKey` already names the slice label and the first series names the value.
  `colors` is the one addition — a pie is one series and many colours. The slice
  maths is framework-agnostic and lives in `@algorisys/zen-ui-core/chart`, which
  matters more here than elsewhere: React draws with recharts and Solid with
  hand-built SVG, so it is the only thing the two share. Every pie also ships a
  visually-hidden data table
- `Carousel` — a scroll-snap slide strip. Every child is a slide, so there is
  no `CarouselItem` to import, and `perView` turns the stage into a strip.
  Deliberately has no autoplay
- `DynamicDateRange` — a date range you describe rather than point at:
  "Last 7 days", "This quarter", "Year to date". 32 operators. The value
  stores the PERIOD rather than the dates it currently means, so a saved
  filter still means the last seven days next year. The engine is
  framework-agnostic and lives in `@algorisys/zen-ui-core/date-range`
- `Pivot` — a drag-and-drop pivot builder (`PivotWorkbench`) and a grid windowed
  in two dimensions (`PivotGrid`), in both bindings. The workbench computes
  nothing: you get a `PivotLayout` and answer `getCell(row, col)`, which is what
  lets it sit over 50 rows or 50 million. Every field is reachable without a
  drag — each chip's ⋮ handle opens a menu of zones — and every move is
  announced. The model and the window maths are framework-agnostic
  (`@algorisys/zen-ui-core/pivot`, `/virtual-window`), which is load-bearing
  here: the bindings share no drag library, no virtualizer and no menu library,
  so that is the only place they can agree
- `Link` — a styled anchor with `inline`, `external` and `disabled`
- `StatCard` — a labelled figure with an icon, a delta and somewhere to go
- `Toolbar` — actions that collapse into an overflow menu
- `Tree` — hierarchical expandable list with full ARIA keyboard navigation
- `Icon` — 48 hand-drawn glyphs, no icon dependency
- Object atoms — `ObjectStatus`, `ObjectNumber`, `ObjectIdentifier`,
  `ObjectMarker`
- Button family — `ToggleButton`, `SegmentedButton`, `SplitButton`
- `Sidebar` — sub-items and a collapsed flyout

**Extensions to existing components**
- `Likert` — `layout="scale"`, `minLabel` / `maxLabel`, `renderOption`. The
  scale length is `options`, never markup
- `Rating` — `allowHalf`. The stars stay whole; the options halve
- `Slider` — `marks`, with optional labels
- `Combobox` / `MultiCombobox` — `creatable`. `onCreate` may return the new
  option: Combobox selects it, MultiCombobox appends it

### Fixed

- **CSS isolation** (breaking) — the library no longer ships page-level or
  element-level CSS from its entry; the element reset is opt-in via
  `/preflight`. It used to restyle the consuming document.
- **`cn()` dropped `zen-rounded-*` overrides.** tailwind-merge's radius group
  matches a fixed value list that `zen-md` is not on, so both classes survived
  and stylesheet order decided the winner — `zen-rounded-zen-full` passed to a
  `zen-rounded-zen-md` component was silently ignored while `zen-rounded-zen-sm`
  happened to work. Pinned by `bun run check:cn`.
- **Solid `ViewSettingsDialog` discarded the user's edit.** Its seeding effect
  tracked `props.value`, which is normally the signal `onConfirm` writes back,
  so any value change arriving mid-edit re-seeded the draft.
- **React `Rating` half-star clicks did nothing.** The option button was a
  component declared inside the render body, so React remounted it on every
  hover change and mousedown/mouseup landed on different nodes.
- **`Link` with `asChild` blanked the page** — Radix `Slot` takes exactly one
  child; now composed with `Slottable`, as `Button` already did.
- **Dialog, AlertDialog and Sheet were unreadable in a dark theme.** Each
  painted its own background but let its text colour inherit. They portal to
  `<body>`, so "inherit" means the consuming document's colour rather than the
  app's: the panel went dark and the text stayed black, at about 1.2:1. The
  `--zen-color-foreground` token was correct throughout — nothing read it. A
  surface that paints its own background must paint its own foreground.
- **RichText shipped unstyled** — a dependency's `exports` map blocked the
  stylesheet subpath and Vite dropped the import silently.

### Notes for consumers

- **Spacing is not themeable.** `--zen-space-*` exists in `tokens.css` but the
  utilities do not read it: `.zen-p-4` compiles to `padding:1rem`, a literal,
  while `.zen-rounded-zen-md` compiles to `var(--zen-radius-md)`. Colour, radius
  and shadow are token-themeable; spacing is per-instance via a prop or a class.
  See `/customizing` in either demo.
- **`Toast` is the one API that diverges between bindings** — React wraps Radix
  Toast primitives, Solid uses solid-toast. Converging it is open.
- **The Solid `Slider` takes `minValue`/`maxValue`** (Kobalte's vocabulary)
  where React takes `min`/`max` (Radix's).

[3.0.0]: https://github.com/Algorisys-Technologies/zen-ui/releases/tag/v3.0.0
