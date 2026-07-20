# Changelog

All three published packages — `@algorisys/zen-ui-core`, `@algorisys/zen-ui-react`
and `@algorisys/zen-ui-solid` — share one version.

They ship the same API by construction: a component that exists in one binding
and not the other is a bug here, not a roadmap item (see the parity rule in
[CLAUDE.md](CLAUDE.md)). Two version numbers describing one API would only
diverge and force every question to name a binding first.

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [9.3.0] - 2026-07-21

### Added

- **`TreeTable`** in all four bindings — a table whose rows form a hierarchy.
  Built on TanStack Table in React and Solid; hand-written in vanilla (no new
  runtime deps), with `<zen-tree-table>` as the declarative layer.
  - Chevron inside the first column, indented by `row.depth`; `indent` is
    configurable and applied as `padding-inline-start`, so it flips under RTL.
  - `getSubRows` (defaults to `row.children`), `expanded` / `defaultExpanded` /
    `onExpandedChange`, `enableExpandAll`.
  - `filterFromLeafRows` so a match retains its ancestors.
  - `enableRowSelection` + `enableSubRowSelection` (default true) with
    indeterminate parents derived from the subtree, not from the parent's own
    row entry.
  - Sorting scoped to siblings; number columns sort descending first, matching
    TanStack's `sortDescFirst`.
  - `role="treegrid"`, `aria-level` / `aria-expanded` / per-parent
    `aria-posinset`+`aria-setsize`, roving row focus, direction-aware arrows via
    `arrowStep` from core.
  - `enableVirtualization` + `rowEstimatedHeight` (requires `maxBodyHeight`).
    Spacer rows rather than an absolutely-positioned grid clone, to keep real
    `<table>` markup and therefore the treegrid roles; adds `aria-rowcount` and
    `aria-rowindex` when windowed.

### Fixed

- Solid: three lint warnings that had been miscounted as zero in `CLAUDE.md` —
  two dead `eslint-disable` directives (`date-picker`), and one in `time-picker`
  where `eslint-disable-next-line` sat on the outer line of a multi-line call
  while the rule reported the inner one, so it silenced nothing.

### Performance

- vanilla `TreeTable` expand/collapse splices the affected subtree instead of
  rebuilding `<tbody>`. At 1,110 visible rows a toggle went from ~49 ms to
  3–8 ms; at 22,620 rows from ~924 ms to 88–138 ms.

### Internal

- `scripts/bindings.mjs`: `TreeTableColumn` and `TreeTableCellContext` recorded
  as data-driven divergences alongside `DataTableColumn`.
- `CLAUDE.md`: build order is now Solid → React → vanilla → web-components
  (React remains the parity reference); notes that `check:parity` is red for the
  duration of a port by construction; and a new verification trap — a
  solution-style `tsconfig.json` (`{"files": [], "references": […]}`) compiles an
  empty program and exits 0 on any code.

## [9.2.0] - 2026-07-20

### Added

- **`MessagePopover`** — aggregated form validation grouped by severity, with
  click-to-navigate to the offending field. All four bindings
  (`<zen-message-popover>` for web-components, `messages` as a property). The
  last unbuilt item on `docs/fiori-gap-analysis.md`'s recommendation shortlist.
  - Severity reuses `ObjectState` minus `"none"` — the same four words `Alert`,
    `Banner` and `ObjectStatus` use, rather than a fifth scale.
  - The trigger shows the icon of the WORST severity present, not just a total.
  - The severity filter appears only when more than one kind is present.
  - `onMessageSelect` runs alongside the navigation, not instead of it.
  - The navigation needed a DIFFERENT mechanism per binding: React and Solid
    restore focus to the trigger on close, so the field is focused in
    `onCloseAutoFocus` with `preventDefault()` — a `requestAnimationFrame` was
    measurably undone a tick later. Vanilla's Popover restores focus
    synchronously in `doClose()`, so navigating after `close()` is enough.

### Changed (demo only)

- Solid's `FAB` and `BoundFields` demos were 22- and 18-line stubs with no
  sections; `BoundFields` rendered the entire Form demo inside itself, second
  `<h1>` and all. Both are real pages now (4 and 3 sections). Every demo in
  every binding now has at least one code example.

## [9.1.0] - 2026-07-20

### Added

- `Calendar` gains `month`, `onMonthChange` and `defaultMonth` in the **Solid**
  and **vanilla** bindings (and therefore web-components). React already had
  them: its `Calendar` is `react-day-picker` and forwards `DayPickerProps`.
  `month` makes the visible month controlled — the escape hatch for "I want the
  view to follow the selection", which no binding does on its own.

### Notes

- The bindings differ in where they OPEN, deliberately. react-day-picker
  computes `month || defaultMonth || today` and never consults `selected`, so
  React opens on today unless told otherwise; Solid and vanilla open on the
  month of `selected`. The differing default stays — having no override at all
  was the defect.

### Fixed (tooling)

- `gen-previews` recycles its page every 25 routes. **Diagnosed**: vanilla's
  `/skip-to-content` was blamed and is innocent — fresh it renders in 56ms on
  the preview server and 355ms on dev. A faithful replica stalled at exactly
  route 78 of 82 against the **dev** server every time, while the identical
  crawl against `vite preview` sailed past. The vite dev server degrades over a
  long single-page crawl; the route was merely where the budget ran out. vanilla
  now completes 82/82 with no ceiling line at all.

## [9.0.4] - 2026-07-20

### Fixed (Solid only)

- Callback props were bound once at setup, so replacing one after render had no
  effect. A native event binding is not reactive in Solid.
  `NotificationsInbox` onMarkAllRead / onViewAll, `DataTable` chip-remove and
  pin-toggle, and the demo shell's reset.
- `DataTable` called TanStack's `getToggleSortingHandler()` /
  `getResizeHandler()` during render and bound the result. TanStack rebuilds
  those when column or table state changes, so a bound one could go stale. The
  lookup is deferred to event time.
- `FormField` did `const F = props.Field` and rendered `<F>`, capturing the
  component prop once. Now `<Dynamic component={props.Field}>`.
- `DataTable`'s placeholder-header guard was an early `return` reading a signal;
  now a `<Show>`. `innerContent` became a function in the same change — as a
  const it was built eagerly at setup, so the guard had been hiding that cost
  rather than avoiding it.

### Lint

- Solid **41 warnings → 0**; React already 0. **Both bindings are now clean, so
  any finding is the reader's own.**
- 11 of the 41 were real (above). The rest are disabled INDIVIDUALLY with the
  reason at the site — seeding a signal from props, drag ids fixed for a row's
  life, and imperative or event contexts the rule misreads.
- Settled by compiling rather than guessing: an IIFE returning JSX **is**
  reactive. Solid hoists its body into the arrow it passes to `insert()`, the
  same shape it emits for `{props.x}`; a static control produced no `insert()`
  call at all, which is what shows the test discriminates.

### Known, and deliberate

- `Calendar` / `DatePicker` seed the visible month from `selected` once, so
  setting `selected` to a date in another month does not move the view. Recorded
  as a UX decision in the source and in `todo.md`, not silenced.

## [9.0.3] - 2026-07-20

### Fixed

- `Combobox` / `MultiCombobox`: `allOptions = isAsync ? asyncResults : options ?? []`
  allocated a new array on every render when `options` was undefined, so every
  hook depending on it re-ran each time. Memoised.
- The TanStack `ColumnMeta` augmentation constrained `TData` to a bare
  `unknown`; upstream constrains to `RowData`, so it now mirrors the declaration
  it augments. React and Solid.

### Changed

- Six empty `interface X extends Y {}` prop types are now `type X = Y`:
  `SkeletonProps`, `SeparatorProps`, `TextareaProps`, `InputProps`,
  `AlertCloseProps`, `BannerCloseProps`. Same name, same shape; only declaration
  merging is lost.

### Added (demo only)

- vanilla and web-components render the component catalogue from `nav.ts`, which
  they previously did not — their landing pages were prose alone. All four demos
  now share it, via a `catalogue()` in each binding's demo-helpers.
- Every catalogue card carries a generated thumbnail. `bun run gen:previews`
  screenshots the first `.example-preview` of each route against the DEV server;
  `deploy.sh` regenerates before building. Gitignored, and the card's `<img>`
  removes itself when a file is missing.

### Lint

- React **29 problems → 0**. Solid **8 errors / 46 warnings → 0 errors / 41**.
  Two rules are scoped rather than obeyed, with the reasoning at the config:
  `react-refresh/only-export-components` off for library source (Fast Refresh is
  an app concern; the alternative was splitting 17 files so their `cva()`
  variants live elsewhere), and `solid/no-destructure` around DataTable's column
  factory (TanStack `ColumnDef` renderers destructure a plain cell context).
- Solid's remaining 41 are `solid/reactivity` and `solid/components-return-once`
  — real, behaviour-changing to fix, and deliberately not swept.

## [9.0.2] - 2026-07-20

### Fixed

- Positioned affordances were pinned to a physical side, so in RTL the layout
  mirrored around them and they stayed put. Measured on the Dialog close: 13px
  from the physical right in BOTH directions before; 13px from the right in LTR
  and from the left in RTL after. 39 files across React, Solid and vanilla —
  Dialog / Sheet / Toast close buttons; Search and PasswordInput trailing
  buttons; the menu / select / combobox check indicator; the SelectableCard
  tick; notification count badges; the ShellBar search icon; the Rating fill
  overlay.
- `DialogHeader`'s `zen-pr-8` → `zen-pe-8`, changed together with the close
  button it reserves room for. Flipping one without the other puts the title
  under the button.
- Input padding (`zen-pl-*` / `zen-pr-*` → `zen-ps-*` / `zen-pe-*`) in Search,
  PasswordInput and the shared select list, for the same reason.

### Notes

- Logical utilities were verified to GENERATE before use (`zen-start-*`,
  `zen-end-*` and negatives all emit `inset-inline-*`) — a prefixed class that
  silently emits nothing is a documented trap in this repo.
- Deliberately left physical, with reasons recorded in `todo.md`: offscreen
  measurement ghosts (arbitrary position), centring transforms
  (direction-agnostic), and `DataTable`'s column-resize handles — those share
  their maths with column pinning and sticky offsets computed physically in JS,
  so moving the grip alone would put it on the wrong edge of a pinned column.

## [9.0.1] - 2026-07-20

### Fixed

- `Bar`: `middleContent` could overlap `endContent` on a narrow bar. The outer
  slots carried `min-w-0 flex-1`, which lets a flex item shrink below its
  content while a `Button` inside does not shrink with it — so the end slot's box
  collapsed and its button overflowed leftwards (`justify-end`) over a
  `shrink-0` middle. The shrink priority is inverted: outer slots drop `min-w-0`
  and never shrink below their content; the middle takes `min-w-0` +
  `overflow-hidden` and is the one that gives. All four bindings; verified by
  measuring adjacent slot rects in a browser (bars found 6/6/7/7, zero
  overlapping pairs).
- `deploy.sh` copied `packages/*/dist` into the site, but the demo build moved to
  `dist-demo` in 8.0.0 (`ed0fcc9`) — so it assembled a stale library build. Its
  own verify step caught it and refused to publish; `gh-pages` was never touched.
- `scripts/visual-check.mjs` guarded on `dist/index.html` for the same reason, so
  it errored on a correctly-built demo and passed on a missing one.

### Docs

- `CLAUDE.md` gains two verification traps that produced false passes while
  fixing the above: `bun run build` builds **React only**, so after `deploy.sh`
  the other three demos keep a `/zen-ui/` base and render blank pages that
  `visual-check` reports as clean; and a geometric assertion that matches nothing
  passes, so a check must report the count of things examined next to the count
  of failures.

## [9.0.0] - 2026-07-20

### Added

- `Theme` — scopes a theme to a subtree, in all four bindings
  (`<zen-theme>` for web-components). `transparent` renders the wrapper as
  `display: contents` for grid/flex children. Pure CSS; no JS runs.
- `DirectionProvider` — feeds reading direction to Radix (React) and Kobalte
  (Solid), which keep it in their own JS context and default to `ltr` regardless
  of `document.dir`. Follows `<html dir>` live via `MutationObserver`. Solid's
  additionally accepts `locale`: Kobalte derives direction FROM a locale rather
  than accepting one, so the two cannot be set independently there. Vanilla and
  web-components ship it as a `dir`-carrying wrapper (no primitive library to
  inform, but the same caller-facing contract).
- `core`: `directionOf(el)`, `arrowStep(key, el)`, `horizontalStep(key, dir)`,
  `readDocumentDirection()`, `observeDocumentDirection()`.
- `check:direction` — pure-logic contract for `horizontalStep`, incl. the rule
  that vertical arrows never flip.
- `scripts/visual-check.mjs --dir <ltr|rtl>`; RTL shots are suffixed `.rtl.png`
  so they never clobber the LTR baseline. Flag values are now excluded by index
  rather than by value, so a route named `dark` is no longer swallowed.
- Demo + nav entry for `Theme` and `DirectionProvider` in all four bindings,
  and for `Page`/`Bar` in React and Solid (vanilla and web-components already
  had one — the tracked claim that all four were missing it was over-broad).
  The `DirectionProvider` page drives the point rather than describing it: the
  same Carousel and Rating side by side in both directions, so the arrow keys
  can be tried. Solid's has a third section for its `locale` prop, since that
  divergence needs explaining where a reader will meet it.

### Changed

- **BREAKING (visual).** Theme token blocks moved from `:root[data-theme="x"]`
  to `[data-theme="x"]`. Specificity drops (0,2,0) → (0,1,0), so a consumer
  override at `:root` now ties and wins on source order where it previously
  lost. Overrides that were silently dead may start applying. The `:root` blocks
  for fonts, motion and `prefers-reduced-motion` are deliberately NOT rescoped —
  they are not per-theme, and source order is now load-bearing.
- **BREAKING (behaviour, RTL only).** 59 sites across 3 bindings treated
  `ArrowRight` as "forward"; they now resolve direction from the DOM via
  `arrowStep`. Affects Carousel, Rating, NPS, Likert, OTP, Tree, ColorPalette,
  ObjectPage anchors, and vanilla's hand-built DropdownMenu and Slider.
- `TimePicker`'s segment row is pinned `dir="ltr"` — clock notation is LTR in
  every locale, so it must not mirror. The one deliberate exception to the sweep.

### Fixed

- `zen-text-left`/`zen-text-right` → `zen-text-start`/`zen-text-end` across 49
  files plus `core/src/variants.ts`. `TableHead` was the visible case: in RTL the
  header stayed left while its column data flowed right. Identical in LTR, so
  only the broken direction changes. `variants.ts` had `zen-justify-start`
  (logical) beside `zen-text-left` (physical) in one class string.
- Carousel did not move at all in RTL: `scrollLeft` counts from 0 at the start
  DOWN through negative values there, so `scrollTo({left: +N})` scrolled the
  wrong way and clamped at 0. Signed in all three bindings; `onScroll` takes
  `Math.abs`. The arrow-key fix alone would not have caught this.
- Demo code blocks (`.example-code`) are pinned `direction: ltr` — code is LTR
  whatever the UI does. Demo-side only.
- The Welcome page's three theme preview cards had been rendering the SAME theme
  since they were written: they set `data-theme` on a `<div>`, which
  `:root[data-theme]` cannot match. They now differ.

### Docs

- `docs/fiori-gap-analysis.md` and `docs/carbon-gap-analysis.md` reconciled
  against 8.0.0 — four claims in the Carbon doc were false as written, and 7 of
  its 13 shortlist items had shipped unnoticed. Both gained a "cost basis"
  section: they were written at two bindings and there are now four.
- The Layer model is **declined**, with reopen conditions, rather than left open.
  zen-ui delineates containers by border and shadow where Carbon delineates by
  surface, so it solves a problem already solved another way.
- `todo.md` gained a Carbon section; its absence is why three foundation items
  sat unlooked-at for five releases.

## [8.0.0] - 2026-07-19

### Changed

- **BREAKING — `/preflight` now sets `box-sizing: border-box` on `*, ::before,
  ::after`.** Every sizing utility in the library already assumed it. Without it
  `w-full` measures the content box, so `Input` (`w-full` + `px-3` + `border`)
  renders 26px wider than its container and overflows it; in a flex row that
  swallows the gap, the controls touch, and the `ring-2 ring-offset-2` focus ring
  — drawn outside the element — overlaps the neighbouring field. Reported as
  overlapping filter inputs in a consuming app. Tailwind v3's preflight sets this
  rule and `preflight.css` exists because the library depends on that reset being
  present; it was the one load-bearing omission. Folded into the existing
  `*, ::before, ::after` block rather than added as a second one, since it resets
  the same universal selector. Major because the rule is universal and reaches a
  consumer's own markup: apps not already loading Tailwind's preflight will see
  layout move. Apps that do load it are unaffected — they had the rule already.

## [7.3.0] - 2026-07-19

### Added

- **`@algorisys/zen-ui-solid` ships a server (SSR) build.** `build:lib` now runs a
  second Vite build (`vite.config.lib.ssr.ts`) with `vite-plugin-solid`'s `ssr: true`
  so `renderToString` has a runtime to call. Output goes to `dist/server/index.js`
  (self-contained: `zen-ui-core` inlined, only `solid-js` + optional `leaflet`/`jodit`
  external) and is exposed through a `node` export condition ordered ahead of `import`,
  so a SolidStart/Vinxi server gets the SSR bundle while the browser keeps the DOM
  build. `solid-js` stays external in both bundles, keeping a single Solid instance
  across the server/client boundary for hydration. `check:package` validates the new
  `dist/server/index.js` path on a clean dist.

### Removed

- **Dropped `pnpm-workspace.yaml`.** It arrived with the SSR change but this repo
  installs with Bun (`bun.lock`, root `workspaces`) and no script uses pnpm; the file
  was inert and only introduced a second, lockfile-less workspace convention.

## [7.2.0] - 2026-07-18

### Added

- **A fourth binding: `@algorisys/zen-ui-web-components`.** The same component set
  as native custom elements — `<zen-button>`, `<zen-tabs>`, `<zen-data-table>`, and
  ~150 more. They are a thin declarative layer over the vanilla factories: each
  `<zen-*>` element wraps the matching factory and mounts its DOM in the LIGHT dom,
  so the shared `zen-*` stylesheet and `--zen-*` tokens style them byte-for-byte
  the same as the other bindings, and they drop into any framework (or none).
  - One `defineZenElement(descriptor)` primitive drives every element:
    `connectedCallback` builds the component, `attributeChangedCallback` →
    `update()`, `disconnectedCallback` → `destroy()`. Attributes for HTML
    authoring (with a `json` attr for data-driven components), JS properties for
    objects/arrays/callbacks, handle methods (`open()`/`close()`/`focus()`)
    forwarded onto the element, and value-change callbacks re-emitted as
    `CustomEvent`s (`zen-value-change`, `zen-checked-change`, …).
  - Creation is deferred/retried when a required data prop is set after the
    element is appended, so `append(el); el.options = [...]` works.
  - `index.ts` re-exports the vanilla binding's entire public surface, so the
    package is at export parity with the other three (`check:parity` covers it).
  - Files: `packages/web-components/`. Registered in the binding registry
    (`scripts/bindings.mjs`), the dev hub, `deploy.sh`, and the landing page;
    demo at `/builder-wc/`.

### Fixed

- **`bun run dev:all` no longer depends on `npx`.** `scripts/dev-all.mjs` spawned
  `npx vite` per demo, which fails with `ENOENT` on any machine where `npx` is not
  on `PATH` (a node install without npm, or a bun-only shell) — taking down every
  demo, not just one. It now launches vite through the runtime already running the
  script (`process.execPath`) and the locally installed vite CLI, which always
  resolve.
- **`bun run check:size` no longer depends on `npx`.** `scripts/check-bundle-size.mjs`
  built each probe app via `execFileSync("npx", …)`, so on a bun-only shell every
  case died with "Executable not found in $PATH: npx" and reported as "build
  failed" — indistinguishable from a real size regression, and it took down
  `check:dist` with it. Same fix as `dev-all.mjs`: `process.execPath` + the local
  `vite` bin.

## [7.1.0] - 2026-07-16

Additive. Components and foundations from the Carbon gap analysis
([docs/carbon-gap-analysis.md](docs/carbon-gap-analysis.md)) shortlist, plus a
Solid accessibility fix.

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
- **`SkipToContent`** — the keyboard bypass an app frame owes its users, in all
  three bindings. Visually hidden until focused; the first Tab reveals it and Enter
  jumps past the header and nav to the content (WCAG 2.4.1, Bypass Blocks). Also
  from the Carbon shortlist — zen-ui now ships a full app frame (ShellBar + Sidebar
  + Page) and this was the missing bypass. Files:
  `packages/{react,solid,vanilla}/src/components/skip-to-content/`.

### Fixed

- **The twelve `zen-anim-*` animations now honour `prefers-reduced-motion`.** A media
  block in `tokens.css` drops the duration tokens to near-zero — touching only
  `--zen-*` custom properties, so it stays inside the library's rule that the
  published stylesheet may set only `--zen-*` and the elements zen-ui renders. There
  was no reduced-motion story before, because the timings were inlined per keyframe
  with nowhere central to answer it.
- **Solid: `<label for>` now associates with Checkbox, RadioGroupItem and Select.**
  Kobalte put a caller's `id` on the root `<div role="group">` and derived
  `${id}-input` for the native control, so an external `<label for={id}>` pointed at
  a non-labelable div and never associated. The `id` now lands on the native control
  (Checkbox → `Input`, RadioGroupItem → `ItemInput`, Select → the `Trigger` button).
  Verified in a browser that clicking the label toggles/selects. React and vanilla
  were never affected — they put the `id` on a `<button>`, which is labelable — so
  the old CLAUDE.md note that grouped all three bindings was wrong; only Solid was.

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
