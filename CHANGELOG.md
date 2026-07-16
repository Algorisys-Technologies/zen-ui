# Changelog

All three published packages — `@algorisys/zen-ui-core`, `@algorisys/zen-ui-react`
and `@algorisys/zen-ui-solid` — share one version.

They ship the same API by construction: a component that exists in one binding
and not the other is a bug here, not a roadmap item (see the parity rule in
[CLAUDE.md](CLAUDE.md)). Two version numbers describing one API would only
diverge and force every question to name a binding first.

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Additive — a minor when it ships. From the Carbon gap analysis
([docs/carbon-gap-analysis.md](docs/carbon-gap-analysis.md)) shortlist.

### Added

- **`Search`** — a search field as a component, in all three bindings. Magnifier,
  `type="search"` (so the platform gives it `role="searchbox"`), a
  keyboard-reachable clear button that shows only when there is text, `sm`/`md`/`lg`,
  controlled or uncontrolled. zen-ui had inlined this exact affordance seven times
  (ShellBar, ValueHelp, SelectDialog, DataTable, the select list, Combobox,
  MultiCombobox); this is the extraction. Files:
  `packages/{react,solid,vanilla}/src/components/form/search/`.
- **`PasswordInput`** — a password field with a show/hide toggle, in all three
  bindings. The toggle is a real `<button>` (keyboard reachable, labelled,
  `aria-pressed`), and it never moves focus out of the field; every native input
  attribute passes through. Files:
  `packages/{react,solid,vanilla}/src/components/form/password-input/`.
- **Type + motion tokens** in core. `--zen-font-*` (family, size scale xs–5xl,
  weights) and `--zen-duration-*` / `--zen-ease-*` now back the theme, so
  `zen-text-*` / `zen-font-*` / `zen-anim-*` resolve through `--zen-*` instead of
  hardcoded literals. Computed output is unchanged (verified against the published
  stylesheet) — the point is that type and motion are now re-themeable through the
  documented `--zen-*` surface, which they were not. Files:
  `packages/core/styles/tokens.css`, `packages/core/src/uno-preset.ts`.

### Fixed

- **The twelve `zen-anim-*` animations now honour `prefers-reduced-motion`.** A media
  block in `tokens.css` drops the duration tokens to near-zero — touching only
  `--zen-*` custom properties, so it stays inside the library's rule that the
  published stylesheet may set only `--zen-*` and the elements zen-ui renders. There
  was no reduced-motion story before, because the timings were inlined per keyframe
  with nowhere central to answer it.

## [7.0.0] - 2026-07-16

Found by building a third binding with no framework and asking whether the shared
core was actually framework-agnostic. It was not.

### Fixed

- **The entire animation layer was dead CSS, in every binding, since it was
  written.** All twelve `zen-anim-*` classes were hand-written rules in
  `core/styles/tokens.css`, and every component used them only behind a state
  variant (`data-[state=open]:zen-anim-accordion-down`) — 24 usages across the two
  bindings, zero bare. UnoCSS cannot build a variant of a class it does not own, so
  it emitted nothing and the plain rule matched no element on any page. They are now
  real utilities, declared as `ZEN_ANIMATIONS` + `zenAnimationsPreset` in
  `core/src/uno-preset.ts`. Accordion, Sheet and the fades animate for the first
  time. Files: `packages/core/src/uno-preset.ts`, `packages/core/styles/tokens.css`,
  `packages/{react,solid,vanilla}/uno.config.ts`.
- **`core/styles/tokens.css` named a Radix implementation detail.** The collapsible
  keyframes interpolated height to `var(--radix-accordion-content-height)` in the
  one file shared by every binding. Kobalte publishes `--kb-accordion-content-height`
  and a frameworkless binding publishes neither, so this could only ever have worked
  for Radix. The keyframes now read `--zen-collapsible-content-height` and each
  binding maps its own measurement onto it. Files: `packages/core/styles/tokens.css`,
  `packages/{react,solid}/src/components/accordion/accordion.tsx`,
  `packages/vanilla/src/lib/presence.ts`.
- **`zen-transition-[grid-template-rows]` generated nothing**, so DynamicPage's
  header collapsed instantly directly beneath a comment explaining how it animated.
  UnoCSS has no arbitrary-value form of `transition-*`; the arbitrary-property form
  (`zen-[transition-property:…]`) is the one that works. Files:
  `packages/{react,solid}/src/components/dynamic-page/dynamic-page.tsx`.

### Added

- **`scripts/check-css-live.ts`**, wired into `bun run check`. Extracts every `zen-`
  utility from every binding's source and asks the real generator whether it
  resolves. Catches the whole family above in ~0.2s with no browser and no build. It
  would have caught all twelve on the day they were written.
- **`scripts/check-collapsible-var.mjs`**, one driven contract run against all three
  bindings. Asserts the accordion's height actually interpolates, because a class
  name and a variable name can both be right while nothing moves.
- **`scripts/check-vanilla-ui.mjs`**, 20 driven assertions over the behaviour the
  vanilla binding had to write itself (focus trap, scroll lock, dismiss, roving
  focus, mask engine).
- **`scripts/bindings.mjs`** — the binding registry. CLAUDE.md claimed "adding a
  framework is one entry in `scripts/demos.mjs`"; that was true for `dev:all` and
  nothing else. `check-nav`, `check-parity`, `check-release` and `demos.mjs` now
  derive from it, and comparisons run against the REFERENCE binding rather than
  pairwise.
- **`packages/vanilla`** — `@algorisys/zen-ui-vanilla`, a full third binding: every
  component family React and Solid ship, no framework, no primitive library, zero
  runtime dependencies. Data-driven where React uses compound children — one factory
  per family, returning a `{ el, update, destroy }` handle. Started as an
  eight-component slice to test the seam (and found the four bugs above); grown to
  parity and held to it — the `partial` registry flag is gone, and `check-parity`
  now compares it against React with its data-driven divergences declared in
  `scripts/bindings.mjs`. Wired into `dev:all`, `deploy.sh` (`/builder-vanilla/`) and
  `check:dist`, but **not published to npm** this release while its data APIs settle.
- **`PORTING.md`** — the old-idiom → new-idiom map (LOOPS XXXVI).

### Changed

- **`buttonVariants` / `badgeVariants` moved to `@algorisys/zen-ui-core/variants`.**
  They were duplicated per binding — byte-identical, but only because someone
  hand-copied correctly every time, and a third binding would have made three
  copies. Both bindings still re-export them and the published CSS is unchanged,
  verified by diffing the built stylesheet across the move. Variants that name a
  state attribute (Tabs, Accordion) deliberately did NOT move: Radix's
  `data-[state=active]` and Kobalte's `data-[selected]` are the same decision in two
  dialects, and merging them would trade a duplication for a lie.
- **`RELEASE_NOTES` moved to `@algorisys/zen-ui-core/release-notes`.** Pure data whose
  own header said "keep this in sync with the Solid binding's copy" — by hand, with
  nothing checking. Both bindings re-export it, so no import moved.
- **Each binding's `uno.config.ts` now names the files Uno must scan.** Uno's default
  pipeline covers `.tsx`/`.vue`/`.svelte` — every framework with a template syntax —
  but not plain `.ts`, so `core/src/variants.ts` was invisible to the generator and
  the hoist silently deleted 13 rules from the published stylesheet while the build,
  the typecheck and `check:parity` all stayed green. The vanilla binding needs `.ts`
  scanned outright: its components are plain TypeScript, and on the default config
  none of its classes were emitted at all.

## [6.0.0] — 2026-07-16

### Changed

- **Pivot: Solid's workbench layout aligned to React's.** React rendered a
  toolbar bar (`n rows · n cols` + View Data), Available Fields, then Values |
  Rows | Columns as three equal `sm:zen-grid-cols-3` columns. Solid folded the
  toolbar into the Available Fields header, stacked Values and Rows in a fixed
  `lg:zen-w-64` sidebar, and ran Columns as a horizontal strip over the grid.
  Same props, same core, same drop rules — different shape. Solid now renders
  React's structure.
  React's is the one that survives: three equal zones is the conventional
  pivot-builder shape, and `sm:grid-cols-3` is a real responsive grid where the
  sidebar/strip split read as incidental. It also hardcoded the grid area's
  height (`lg:zen-h-[500px] zen-h-[350px]`), which the caller's `children` then
  had to live inside; the area is now `flex-1` and the grid gets the space that
  exists.
  Breaking under this repo's rule that altered visual output is breaking. No prop
  changed.

### Fixed

- **Pivot: `en-IN` was hardcoded into Solid's row/col counts.** `toLocaleString("en-IN")`
  gave every consumer Indian digit grouping from a component with no locale prop.
  Now `toLocaleString()`, as React already did.
- **Pivot: Solid counted an empty filter selection as an active filter.** Its
  local `hasAnyFilters` tested `Object.keys(layout.filters).length > 0` — the
  presence of a key, not whether it filters — so "Clear filters" could appear
  with nothing to clear. Replaced with core's `hasActiveFilters`, which tests
  `isFilterActive` per entry. Renderability likewise moves from an inlined
  `values.length === 0 || (rows.length === 0 && columns.length === 0)` to core's
  `isLayoutRenderable`. Both bindings now read the same two functions, so the
  question "is this filter active" has one answer.
- **Pivot: Available chips carried a dead remove button in Solid.** `onRemove`
  was passed for the available zone, where it moved the field to the zone it was
  already in. React passes `undefined` there; Solid now does too.
- **Pivot: React's warning alerts rendered an empty icon box.** `<AlertIcon />`
  was passed no children, and `AlertIcon` is a pure slot — it renders
  `{...props}` into a span, so both "Value field required" and "Dimension
  required" drew the box and no icon. Solid's `<AlertIcon><Icon name="info" /></AlertIcon>`
  was correct; React now matches. This is the one fix that went Solid → React
  rather than the reverse — "align Solid to React" did not mean React was right
  about everything.

### Internal

- `packages/solid/src/components/pivot/pivot-workbench.tsx` is 49 lines shorter
  (+150/−199): the sidebar/grid nesting, the `showBuilder` fallback branch that
  duplicated the children render, and two reimplemented core predicates all go.
- **Verified by driving it, not by building it.** `scripts/check-pivot-ui.mjs` —
  deliberately the same file for both bindings — passes fully on each, including
  the cases this rewrite could plausibly have broken: a field into an empty zone,
  a SECOND field into a populated one, Escape mid-drag, and the live-region
  announcements. Solid's drag-and-drop was working before this change and is the
  reason it was worth pinning.
- Note for the next `visual-check` run: both `packages/*/dist` were serving stale
  builds when this landed — Solid's held a library build (`index100.js`, no
  `index.html`) and React's held a demo build still carrying `deploy.sh`'s
  `/zen-ui/` base. Both render as a blank page with a bare 404, which reads
  exactly like a broken route. Diagnose with a control route: if `/button` is
  blank too, it is the build.

### Repo

- **`slop.md` removed**, and CLAUDE.md's design review now points at
  [impeccable](.claude/skills/impeccable), installed project-scoped. slop.md was
  added to evaluate it (one commit, `d6a82a6`, of an external document) and the
  evaluation concluded. Removed with the references that would otherwise dangle:
  CLAUDE.md's guidelines block and Other-references line, and `.gitignore`'s
  `!slop.md` allowlist.
- CLAUDE.md's em-dash carve-out is **kept and retargeted** — impeccable ships its
  own `em-dash-overuse` detector, so deleting the exception with its source would
  have re-opened what it was written to prevent. The detector cannot reach this
  repo's prose (it reads rendered UI body text; CLAUDE.md's 53 em dashes and a
  .tsx's 11 both come back clean), but the risk was never the detector firing —
  it is an agent generalising from the rule's existence.
- **impeccable is installed project-scoped and committed**, replacing an
  accidental global install across five agent directories. Two edits the
  installer does not make were needed for "project-scoped" to mean anything:
  `.gitignore`'s `*.md` was swallowing `SKILL.md` and all 23
  `reference/<command>.md` files (33 of 102 — a clone would have got the scripts
  and nothing that made them mean anything), and the hook it writes lands in
  `.claude/settings.local.json`, which is gitignored as the personal file, so it
  moved to `.claude/settings.json`. The hook is now live for anyone who clones:
  PostToolUse on `Edit|Write|MultiEdit`, 5s timeout.

## [5.0.0] — 2026-07-16

### Fixed

- **Pivot: available fields single-select in React, as Solid already did.** The
  React binding's available-fields filter multi-selected; Solid's took one
  member at a time. The prop was not missing — `singleSelect` was fully
  implemented in `pivot-field-chip` and `pivot-filter-menu`, and the chip
  forwarded it. `PivotWorkbench`'s `chipProps` is shared across all four zones
  and set every property except that one, so it was never passed. Solid's
  workbench passes `singleSelect={true}` for the available zone only; React now
  does too.
  Available is a preview of an unplaced field, so its filter answers "what is in
  here" with one member; a placed field filters for real and takes many. Hence
  per-zone rather than global.
- **Pivot: the single-select affordance, which React lacked entirely.** The
  indicator is now a radio when single-select and a checkbox otherwise, matching
  Solid. React drew a square box unconditionally — a promise you can tick more
  than one, which was exactly the bug.

Both are breaking under this repo's rule that altered visual output is a
breaking change: the menu looks different and a second click no longer adds.

Verified by driving both demos — open a field's filter, click two options, count
what stays selected: React 1, Solid 1, radio indicators in both. A typecheck
cannot see this; both bindings compiled clean while disagreeing.

## [4.0.0] — 2026-07-15

Packaging only. No component, prop or visual change.

### Fixed

- **The library is tree-shakeable.** It was published as a single bundled module
  (`preserveModules: false`) and declared no `sideEffects`, so a bundler could
  drop nothing: one `<Button>` cost 151 kB gzipped, and adding eight more
  components cost a further 330 bytes. Now 17 kB / 57 kB. Solid: 83 kB → 16 kB.
  The two settings only work together — bundled into one module `sideEffects` is
  all-or-nothing and the module is used; split into modules without
  `sideEffects` rollup must assume each has side effects. Fixing either alone
  measures as a no-op (12 bytes), which is why this survived.
  `sideEffects` is `["**/*.css"]`, not `false`: the entry imports `tokens.css`
  and `virtual:uno.css` for effect and a blanket `false` lets a bundler shake the
  stylesheet out and render the library unstyled.
- **Consumers received no TypeScript types.** Both bindings declared
  `"types": "./dist/index.d.ts"` while `tsc` emitted `dist/src/index.d.ts`, with
  no `rootDir` set. Every zen-ui import was silently `any`. It survived a release
  because `emptyOutDir: false` preserved a stale `dist/index.d.ts` on machines
  that had built an older layout; a clean clone never had one. Fixed with
  `rootDir: "./src"`, mirroring `preserveModulesRoot`.
- **The landing page footer advertised v0.1** from the day it was written
  through 3.0.0 — hardcoded, on the most public page in the repo. It now reads
  core's `package.json` via vite `define`, resolved against the config file
  rather than `process.cwd()` (a bare relative path worked under
  `bun --filter`, which enters the package dir, and threw under `deploy.sh`,
  which runs vite from the repo root — so the one command that publishes was the
  one that failed).

### Added

- `scripts/check-bundle-size.mjs` (`check:size`) — builds real consumer apps
  against the built `dist` and weighs gzipped output against budgets. Bundle
  regressions are invisible to a build log; the 151 kB button passed every
  check in the repo.
- `scripts/check-package-artifacts.mjs` (`check:package`) — asserts every path
  `package.json` promises exists on a clean `dist`, that the entry `.d.ts` is
  real rather than a stub, and that both tree-shaking prerequisites are present
  so a future edit cannot silently drop one.
- `scripts/check-release.ts` (`check:release`) — asserts the version agrees
  across the four places that describe a release, and that no page hardcodes a
  version literal.
- `release-notes/` — per-version prose for people upgrading. Allowlisted in
  `.gitignore`, which has a `*.md` rule that matches at any depth.
- `bun run check:dist` — builds both libs then runs `check:package` +
  `check:size`.

### Changed

- `dist/` is now one file per module (379 files) rather than a single
  `index.js`. Deep paths into `dist/` were never a supported API.
- CLAUDE.md documents the "ship it" procedure.

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
