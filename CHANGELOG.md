# Changelog

All three published packages — `@algorisys/zen-ui-core`, `@algorisys/zen-ui-react`
and `@algorisys/zen-ui-solid` — share one version.

They ship the same API by construction: a component that exists in one binding
and not the other is a bug here, not a roadmap item (see the parity rule in
[CLAUDE.md](CLAUDE.md)). Two version numbers describing one API would only
diverge and force every question to name a binding first.

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [10.5.0] - 2026-08-04

The seven assessment components from 10.4.0, ported to **Solid**. The
React↔Solid direction of `check:parity` now reports React-only as clean: the 31
names that existed only in React are in both bindings.

### Added

- `packages/solid` — `TimerBadge`, `TestCountdownBar`, `CodeEditor`,
  `IDEWindow`, `SpreadsheetGrid`, `SheetCalculator`, `ProctorStreamGrid`,
  `ProctorFlagOverlay`, `ChunkUploader`, `DiagramCanvas`, `ArchitectureDraw`,
  with demos, `nav.ts` entries and routes.
- `@monaco-editor/loader` as an OPTIONAL peer of the Solid binding, plus a
  `loaderConfig` prop for self-hosting Monaco.

### Changed

- **Solid's `CodeEditor` loads Monaco through `@monaco-editor/loader`** rather
  than importing `monaco-editor` directly. `@monaco-editor/react` is React-only,
  and the ESM build's own worker entry fails to resolve under Vite — measured:
  "Failed to resolve module specifier
  `../../../base/common/worker/webWorkerBootstrap.js`", which is not fixable from
  inside a component. Wiring `MonacoEnvironment` with Vite's `?worker` imports
  did NOT fix it either; that was tried first.

  Using the same loader React's wrapper uses means both bindings fetch the same
  Monaco the same way, so they behave the same rather than merely looking the
  same. It also removes the worker problem, because the fetched build has its
  workers wired.

### Notes on the port

Both bugs found in the React spreadsheet were carried across as fixes rather
than rediscovered — the `preventDefault` that stops the first keystroke being
doubled, and the `table-layout: fixed` + `<colgroup>` that stops a cell resizing
on edit. Re-verified in Solid: 96×25 through an edit, `=1+2*3` → 7.

Three `solid/reactivity` warnings were triaged, not suppressed wholesale — the
initial countdown read, the Monaco event callbacks, and the Yappy poll interval
are all deliberate untracked reads, each disabled individually with its reason
at the site.

### Verification

- `bun run check` — 27 green. `check:parity` red only where expected: Solid-only
  components (next phase) and vanilla/web-components (the phase after).
- lint 0 problems across all four bindings.
- `node scripts/visual-check.mjs solid` — **105 routes, no runtime errors**.
- Driven in a browser: identical arithmetic to React (€1,260 / €2,095 /
  €2,534.95), all five error values, cell geometry stable through an edit, and a
  typed formula evaluating correctly.

## [10.4.1] - 2026-08-04

### Fixed

- **`DiagramCanvas` could not load an embedded editor's own assets.** The frame
  was sandboxed without `allow-same-origin`, giving it an OPAQUE origin, so every
  asset it fetched from its own server counted as cross-origin and needed CORS
  headers most apps do not send. Measured against yappydraw.com: the document
  loaded and then all four of its own bundles were blocked, leaving a blank frame
  that the host page cannot detect. draw.io survived the omission only because
  diagrams.net serves its assets with CORS — which is exactly why this shipped:
  the provider it was written against masked it.

  `allow-same-origin` is now in the default sandbox, with a `sandbox` prop to
  narrow it. It grants the frame its OWN origin back, not access to the host
  document — the same-origin policy between two different origins does that, and
  the sandbox was never what held that line. The arrangement to avoid is a
  same-origin `src` with `allow-same-origin` + `allow-scripts`, where the frame
  can remove its own sandbox attribute.
- **The YappyDraw bridge probed before the frame had navigated.** A fresh iframe
  holds an initial `about:blank` inheriting the parent's origin, so the first
  `postMessage` was rejected with a target-origin mismatch. The retry loop got
  past it, but every attempt logged, so a working integration read as broken. It
  waits for the frame's `load` event now.

Verified in a browser: framing yappydraw.com goes from 8 console errors to 0,
the only remaining message being YappyDraw's own analytics noting it is in a
frame — which is proof its scripts now execute. `visual-check` react: 101 routes,
no runtime errors.

## [10.4.0] - 2026-08-04

Seven components for assessment platforms, in the **React binding only**.
`check:parity` is now RED IN BOTH DIRECTIONS — 31 React-only names and 28
Solid-only — which is the cost of building React-first before closing the Solid
port, and was flagged before the work started.

### Added

- `packages/core/src/countdown.ts` (38 assertions), `chunk-upload.ts` (33) and
  `spreadsheet.ts` (72), each wired into `bun run check`.
- `TimerBadge` / `TestCountdownBar` — deadline-driven, not a decrementing
  counter. `crossedThresholds` compares two readings rather than testing for an
  exact second, because a throttled tab skips seconds and a warning that tests
  for exactly 300 never fires.
- `CodeEditor` / `IDEWindow` — `@monaco-editor/react` as an OPTIONAL peer,
  lazily imported behind an error boundary that names the package.
- `SpreadsheetGrid` / `SheetCalculator` — recursive-descent formula parser, NOT
  `eval`. Circular references return `#CIRCULAR!` rather than overflowing the
  stack.
- `ProctorStreamGrid` / `ProctorFlagOverlay` — display only. No MediaPipe, no
  getUserMedia; the boundary is deliberate and documented.
- `ChunkUploader` — bounded retries with exponential backoff, resuming on the
  failed chunk rather than past it.
- `DiagramCanvas` / `ArchitectureDraw` — `postMessage` embed with two providers:
  `drawio`, and `yappydraw` (Algorisys's own, client-side and self-hostable) with
  its structured `__yappy` RPC bridge.
- `RichText.onImageUpload` and `RichText.math`, plus an exported `renderMath`.
  `katex` as an OPTIONAL peer.

### Fixed (during development, never released)

- **The spreadsheet doubled the first keystroke.** Typing `=` seeded the draft
  AND was inserted again by the browser into the input that autofocused on the
  next render, so `=` became `==` and every typed formula evaluated to
  `#ERROR!`. The parser was never at fault. Missing `preventDefault`.
- **Editing a cell resized the grid.** An `<input>` carries an intrinsic width of
  about twenty characters, so entering edit mode widened the cell 96px → 186px
  and the table 425 → 515; the grid jumped under the cursor on every edit. Fixed
  with `table-layout: fixed` plus an explicit `<colgroup>`, so a column's width
  comes from the layout and never from its contents. Re-measured: 96×25 and 425
  across idle, editing, and a long formula.
- **CodeEditor crashed the demo with "Cannot read properties of null (reading
  'useState')".** Installing monaco into `packages/react` pulled a NESTED React
  (19.2.8 beside the root's 19.2.3), so Monaco's hooks ran against a second React
  instance. Nothing in that error names React duplication and the library build
  was unaffected, so only the demo showed it. `resolve.dedupe` in
  `vite.config.demo.ts`.
- A dead `zen--outline-offset-2` — the negative marker goes BEFORE the prefix.
  Caught by `check:css-live`, which is what that check is for.

### Changed

- The DiagramCanvas demo loads its iframes behind a button rather than on page
  view. Both providers are third-party origins, and a demo page that frames one
  as you scroll past makes a privacy decision for the reader. It also removed the
  sandboxed frame's own blocked XHR from every visual-check run.

### Verification

- `bun run check` — 27 green; only `check:parity`, red in both directions.
- lint 0 problems across all four bindings.
- `node scripts/visual-check.mjs react` — 101 routes, no runtime errors.
- Driven in a browser: formulas evaluated live (3 × 420 = €1,260, SUM = €2,095,
  +21% VAT = €2,534.95), all five error values rendered, `=1+2*3` typed into a
  cell returned 7, a reference to a formula cell returned €70.00, Escape
  abandoned an edit, and cell geometry was measured stable through an edit.

## [10.3.1] - 2026-08-04

### Fixed

- **`Splitter`: clicking the divider did not focus it, so the keyboard did
  nothing and the page scrolled instead.** `onPointerDown` calls
  `preventDefault()` to stop a drag selecting text across both panes, and that
  same default is what moves focus to the clicked element — so focus stayed on
  the body and the arrows were never the splitter's to claim. Focus is now moved
  explicitly on pointer-down, before the drag starts, rather than on click,
  because the arrow may be pressed before the pointer is released.

  Worth recording why it shipped: the keyboard support was verified by TABBING
  to the divider, which works, and a keyboard-only test never clicks. Re-verified
  across all 8 dividers in the demo — every one focuses on click and moves on the
  next arrow press, the three-panel cases move only their two neighbours
  (25/50/25 → 26/49/25 for handle 0, → 26/50/24 for handle 1), and the disabled
  splitter still correctly does nothing.

## [10.3.0] - 2026-08-04

Two components in the **Solid binding only** — `Splitter` and `SortableList`.
Every published package bumps to keep one version number; the other three
bindings do not have them yet. `check:parity` stays RED by the same standing
exception as 10.2.0.

### Added

- `packages/core/src/splitter.ts` — `normalizeSizes`, `dragHandle`,
  `handleBounds`, `splitterKeyDelta`, `mirrorDelta`. Pinned by
  `scripts/check-splitter.ts` (68 assertions), wired into `check` as
  `check:splitter`. Exported at `@algorisys/zen-ui-core/splitter`.
  `react-resizable-panels` was rejected: no Solid equivalent, so the bindings
  would diverge in behaviour rather than composition, which `check-parity`
  compares names not behaviour and cannot see.
- `packages/core/src/sortable.ts` — `moveItem`, `reduceReorder`,
  `keyToReorderAction`, `DEFAULT_REORDER_ANNOUNCEMENTS`. Pinned by
  `scripts/check-sortable.ts` (51 assertions), wired in as `check:sortable`.
  The keyboard layer is in core because `@thisbeyond/solid-dnd@0.7.5` ships none
  (measured: 0 files in its dist mention `keydown`; dnd-kit has 11) and vanilla
  and web-components have no drag library — three of four need it hand-written
  regardless, so dnd-kit's `KeyboardSensor` is deliberately NOT used in React.
- `packages/solid` — `Splitter` / `SplitterPanel` / `SplitterHandle`, and
  `SortableList` / `SortableListItem` / `SortableListHandle`, with demos,
  `nav.ts` entries and routes.

### Fixed (during development, never released)

- **The divider was invisible.** `zen-w-px` on the handle set the TOTAL width
  under `box-sizing: border-box`, so the 6px touch padding consumed it and
  `bg-clip-content` painted a 0px line. Measured: 12px total, 0px content. The
  line is its own child element now — the only arrangement where the visible
  width and the grabbable width are independent.
- **Collapse was unreachable by dragging.** Each `pointermove` applied its step
  to the previous CLAMPED result, so the position could never travel below a
  panel's min and the snap never fired — a 300px drag left the panel sitting at
  min. Drags now accumulate from the layout at `pointerdown`.
- **`aria-valuemin`/`aria-valuemax` were hardcoded 0/100** while the real range
  was 20–70, so a screen reader announced twenty percent of travel that did not
  exist. `handleBounds` is now shared between the ARIA range and `dragHandle`,
  so the announced and reachable ranges cannot drift; verified in a browser that
  Home and End land exactly on the announced bounds.
- **Escape announced "Moved from position 3 to 1"** instead of "Reorder
  cancelled" — cancelling does commit (the return trip), and the commit branch
  was tested before the cancel branch.
- **A failed `setPointerCapture` killed the handle.** `pointermove` was gated on
  `hasPointerCapture`, and `setPointerCapture` throws for an inactive pointer id,
  so one failed call turned the divider into a dead control. Capture is an
  enhancement now; an explicit flag is the gate.

### Verification

- `bun run check` — 24 green; `check:parity` red by the standing exception.
- `bun run lint:solid` — 0 problems. Two `solid/reactivity` warnings triaged as
  the documented "the getter IS the tracked scope" false positive and disabled
  individually with reasons; one dead directive removed. One of them had prose
  between the directive and the reported line, which silently disables nothing —
  the trap CLAUDE.md already warns about.
- `node scripts/visual-check.mjs solid` — 99 routes, no runtime errors. The
  first run reported **198** errors: `deploy.sh` had rebuilt the demos with the
  `/zen-ui/` base and `dist-demo/index.html` still pointed there, so every asset
  404'd. Rebuilt with `build:solid` before believing the result.
- Both components driven with a REAL keyboard and a REAL mouse: Tab reaches the
  divider (106 tabs into the page), arrow/shift-arrow/Home/End move it, a mouse
  drag runs 30/70 → 44/56 and commits on release, a hard drag collapses to the
  6% rail with `data-state="collapsed"` and drags back out to min. For the list:
  pick up, move, Home/End, and Escape restoring the original order exactly —
  and an arrow or Escape with nothing held is confirmed NOT to be swallowed.

## [10.2.0] - 2026-08-04

Two new components and one additive prop group, built in the **Solid binding
only**. Every published package bumps to keep one version number, but React,
vanilla and web-components do not yet have `DiffView`, `DocumentViewer`, or
`Timeline`'s disclosure props — the ports are the next piece of work.

`check:parity` is RED for this release by construction and by agreement: it
reports 11 names that exist only in Solid, which is exactly what it is for. It
goes green when the three ports land.

### Added

- `packages/core/src/diff.ts` — `computeDiff(before, after, opts)` returning
  `{key, label, kind, before, after}` rows. One level of keys; a nested
  difference surfaces on the top-level key that contains it. Pinned by
  `scripts/check-diff.ts` (34 assertions), wired into `bun run check` as
  `check:diff`. Exported at `@algorisys/zen-ui-core/diff`.
- `packages/core/src/document.ts` — `inferDocumentKind`, `clampZoom`,
  `zoomStep`, `normalizeRotation`, `fitScale`, `DOCUMENT_ZOOM_MIN/MAX`. Pinned
  by `scripts/check-document.ts` (45 assertions), wired in as `check:document`.
  Exported at `@algorisys/zen-ui-core/document`.
- `packages/solid` — `DiffView`, rendering a `<table>` with `<th scope="row">`
  per field. Kind is signalled by strikethrough and a `zen-sr-only` "not set"
  label, never colour alone.
- `packages/solid` — `DocumentViewer`. Image via `<img>` sized by zoom (not a
  CSS `scale()`, which leaves the layout box unchanged so the scroller never
  learns the content grew and zooming past the frame just clips); PDF via
  `pdfjs-dist` rendered to a canvas at `devicePixelRatio`.
- `pdfjs-dist` declared as an **optional** `peerDependency` of
  `@algorisys/zen-ui-solid` (`^5 || ^6`), plus a `devDependency` so the demo
  runs. Lazily imported; images never touch it.
- `TimelineItem.collapsible`, `.defaultOpen`, `.collapseLabel` — a native
  `<details>` disclosure around `children`.
- Demos, `nav.ts` entries and routes for `/diff-view` and `/document-viewer`;
  a new "Collapsible bodies" section in the Timeline demo.

### Changed

- `apps/landing` — the SolidJS binding's status card reads **stable** rather
  than alpha, in both the card and the repository tree listing. Vanilla and
  web-components are unchanged.

### Fixed (during development, never released)

- `DiffView` rendered its "not set" placeholder in only one cell of the page. A
  JSX value assigned to a `const` is a single DOM node in Solid, and a node
  lives in exactly one parent, so every earlier cell silently rendered empty.
  Measured: two of three placeholders vanished. It is a component now.
- `DocumentViewer` collided on the canvas under rapid input — pdf.js allows one
  `render()` per canvas and `cancel()` does not free it synchronously, so two
  calls could both pass the cancel while awaiting `getPage`. Measured: five
  collisions from six rapid zoom presses. Renders are serialised through a
  promise chain and coalesced, so a held button produces one render of the final
  state rather than one per press. Re-measured: zero errors from 8 rapid zooms
  plus 9 mixed rotate/page presses.
- `DocumentViewer` passed a string to `pdf.getDocument`, which pdf.js dropped in
  favour of an options object; its error names three parameters rather than
  saying the argument shape changed.

### Changed after review against a real consumer

The three components were reviewed against a Solid app that had hand-rolled all
of them (a gate-entry/GRN system). Five gaps were real and are fixed here,
before the API shipped:

- `DocumentViewer` — `zoom`, `page` and `rotation` are now
  controlled-or-uncontrolled per knob. The app drives zoom from a window-level
  `+`/`-`/`0` keydown handler, which an uncontrolled component cannot express at
  all; that would have forced a fork.
- `DocumentViewer` — `minZoom`, `maxZoom`, `zoomStep`, and buttons that disable
  at the bounds. The app uses 0.25–4.0 in 0.25 steps.
- `DocumentViewer` — `resetOnSrcChange` (default `true`). The app resets zoom on
  every open; with uncontrolled state, `defaultZoom` does not re-apply when
  `src` changes, so switching documents carried the previous zoom over.
- `DiffView` — `before`/`after` widened from `Record<string, unknown>` to
  `unknown`, plus `parseSnapshot`/`isKeyed` in core and a `parse` prop. The real
  column is `nvarchar` holding an object, a bare ARRAY, an ad-hoc map, arbitrary
  prose, or empty; the previous signature rejected three of the five, and the
  consumer had already been bitten by a bare `JSON.parse` taking down a panel.
  Non-keyed payloads render as two whole-value panes with a per-side "not set",
  so a creation and a deletion stay distinguishable.
- `TimelineItem` — `open`/`onOpenChange`, and `collapseLabel` may be a function
  of the open state. The app's audit panel is a single-open accordion and its
  toggle reads "View ▼" / "Hide ▲"; per-item uncontrolled state cannot do
  either.

Confirmed unnecessary for that consumer but kept, because they are cheap and
other apps will want them: `onDownload`, rotation, page navigation. Noted as a
real risk for them: a pdf.js canvas gives up the native PDF viewer's built-in
text selection, in-document search and print, which an `<iframe>` provides free.
That trade is deliberate — it is the only way to get a page count and rotation —
but it is a downgrade for an app that only ever needed to look at one page.

### Fixed — four items reported by consumers

- **Colour vocabulary converged on `error`.** Alert and Banner now accept
  `color="error"` in all four bindings; `destructive` still works, renders
  identically and is marked `@deprecated`. Verified by comparing all 11
  `error`/`destructive` pairs across the six files — 0 mismatches. New in
  `packages/core/src/variants.ts`: `ZEN_SEMANTIC_COLORS` / `ZenSemanticColor`,
  so the next component draws from one list instead of inlining its own.
  Untouched, needing a rename decision: `Toast.variant` collides head-on with
  `Button.variant` (same prop name, disjoint vocabularies), and
  `DropdownMenuItem.variant` is `default | destructive` on what may be a
  different axis entirely.
- **`StatCard.description`** in all four bindings — a free-text sub-line under
  the value. `trend` could not serve: its direction arrow is mandatory.
  Destructured/split out of the rest-props in React and Solid, so it cannot leak
  onto the DOM element; added to the web-components `props` list.
- **`StatCardTrend.color` honoured in vanilla and web-components.** It existed
  in React and Solid and was documented in the generated API reference shipped
  inside the vanilla and web-components packages, but the render hardcoded
  `TREND_COLOR[direction]` and dropped the override.
- **Documented that the shipped stylesheet is a closed set** — in
  `docs/css-interop.md` and, more importantly, in the generated agent guides
  (`STYLING` in `scripts/gen-agent-guide.ts`, reaching all 15 files). A consumer
  bulk-converted an app to `zen-` utilities, found 144 of them produced no CSS,
  concluded the preset shipped no spacing scale and no arbitrary values, and
  reverted two-thirds of their styles to inline `style` attributes. Measured
  against the real generator, the preset emits all of it — `zen-p-7`, `zen-p-9`,
  `zen-p-0.5`, `zen-py-3.5`, `zen-gap-1.5`, `zen-p-[10px]`, `zen-text-[0.7rem]`,
  `zen-grid-cols-[1fr_1fr]`. The real cause is that `dist/style.css` contains
  only what zen-ui's own source uses, so any class the consumer writes that
  zen-ui does not already use is dead. Two of their findings WERE real bugs in
  their markup: `muted-foreground` (the token is `muted-fg`) and `zen-bg-zen-card`
  (no `card` colour exists).

### Verification

- `bun run check` — 22 of 23 green; `check:parity` red as described above.
- `bun run lint:solid` — 0 problems. Two `solid/reactivity` warnings were
  triaged, not suppressed wholesale: both are deliberate untracked reads
  (`defaultOpen` is an initial value; the render callback must read signals when
  it runs, which is the coalescing mechanism) and each is disabled individually
  with its reason at the site.
- `node scripts/visual-check.mjs solid` — 97 routes, no runtime errors.
- All three components driven in a browser: DiffView row kinds and the
  screen-reader labels asserted in the DOM, the Timeline disclosure toggled in
  both directions with the chevron tracking state, and the PDF verified by
  counting non-blank canvas pixels at each zoom, page and rotation.

## [10.1.0] - 2026-08-01

Two new components across all four bindings, and the pure-logic and browser
harnesses that hold them. Purely additive: 16,274 insertions, zero deletions in
`packages/*/src`, no token or stylesheet change, no existing component touched.

### Added

- **`Gantt`** — a `treegrid` of tasks beside bars on a shared clock. Collapsing
  hierarchy with rolled-up parent bars and duration-weighted percentages,
  four dependency types with routed connectors, slip against `baselineEnd`,
  fit / day / week / month / quarter / year views, a frozen pane that sheds
  columns before the axis gives way, and row windowing at every size with no
  threshold. `GanttAnchoredView` vs `GanttView` is a deliberate type split:
  passing `"fit"` to a function that needs an anchor is a compile error rather
  than a silent month.
- **`ProductionSchedule`** — work centres as rows carrying lane-packed
  operations. Sequence-dependent changeover via `setupMatrix`, finite capacity
  with a sweep-based overload test (not pairwise), a load histogram of booked
  over available working time, routing links with lag, and a critical path with
  free and total float.
- **Rescheduling** — `onReschedule` / `canReschedule` on `ProductionSchedule`.
  Pointer drag and `Alt`+arrow both build a `ProductionProposal`; the component
  never mutates its inputs. Push-later-never-pull, cycles reported rather than
  iterated, setups held constant through the cascade.
- **Working-time model in core** — `GanttCalendar` with weekly shifts and dated
  exceptions; `ganttWorkingMs`, `ganttAddWorkingMs`, `ganttSubWorkingMs`,
  `ganttWorkingSegments` and split bars. Everything downstream measures in
  working minutes, including float and the reschedule cascade.
- **New core modules**: `gantt.ts`, `production.ts`, `reschedule.ts`,
  `critical-path.ts`.
- **`<zen-gantt>` and `<zen-production-schedule>`** in the web-components
  binding, with recursive ISO-date revival for the task tree, the resource tree
  and calendar exceptions.

### Changed

- `packages/*/src/components/gantt/schedule-grid.*` — one renderer shared by both
  components in every binding (axis, frozen pane, row window, connector layer,
  roving-tabindex keyboard model). Measured payoff: `Gantt` 56 kB,
  `ProductionSchedule` 59 kB, **both together 66 kB** against a 75 kB budget;
  duplicating the shell would put the pair at ~108 kB.
- React's `ProductionSchedule` bar no longer wraps in a Radix `Tooltip`. It was
  a divergence introduced during the Solid port and never recorded; all three
  bindings now carry the same sentence in `title`. A tooltip trigger installs
  pointer handlers on a bar that is draggable, and they compete with the pointer
  capture the drag depends on.
- `scripts/check-schedule-parity.mjs` accepts `all`, which its sibling harness
  already took — it was dying on an undefined lookup. An unknown binding now
  reports itself instead of throwing a `TypeError`.

### Fixed

- `ganttConnectors` skipped a link whenever two anchors *resolved* to the same
  bar; it now compares the resolved anchor rather than the id, so a link between
  two tasks folded into one collapsed parent still draws.
- `ganttFitUnit`'s hour band was unreachable: `minPadMs` defaulted to one day,
  inflating a four-hour job to three. It is one hour now.
- The frozen pane shed columns greedily and could drop three and still scroll.
  It sheds only when shedding achieves a fit, and anchored views shrink before
  shedding rather than growing.
- An expanded parent reported 0% load — `ProductionRow` now carries both `lanes`
  (what it draws) and `subtree` (what it is responsible for).
- The over-capacity marker lived in the Capacity column, which is among the
  first the pane sheds; a conflict marker that vanishes when the container
  narrows is worse than none. It is on the never-dropped resource column.
- A cross-resource reschedule measured the duration with the *target* calendar,
  so a four-hour job arrived on a continuous furnace seventeen hours long.
  `productionReschedule` takes the source calendar for the duration.
- An overhanging percent label widened the scroller by 25 px; it flips to the
  other side of the bar instead.
- `ganttSubWorkingMs` was implemented but unexported from both bindings — found
  by unpacking the tarball, not by any check in the repo at the time.

### Testing

- Pure-logic contracts: `check-gantt.ts` (263 assertions), `check-production.ts`
  (102), `check-reschedule.ts` (28), `check-critical-path.ts` (32), all wired
  into `bun run check`.
- `scripts/check-schedule-dom.mjs` is parameterised by binding and drives
  `/gantt` and `/production-schedule` in both directions: **600 assertions over
  four bindings**. A binding that has not ported a component is reported as NOT
  PORTED and counts as neither pass nor failure, and a run that checked nothing
  exits non-zero — it printed "all passed — 0 assertions" once during its own
  development, which is the zero-denominator green this repo has shipped twice.
- Rescheduling is now driven by the harness, both paths. It reads the demo's
  live note rather than the bars, because a component that silently *applied* a
  move would look identical in the DOM and be wrong. Proved failing by inverting
  vanilla's RTL drag sign.
- `scripts/check-schedule-parity.mjs` compares rendered charts against React:
  pane columns, axis columns, first label, `aria-rowcount`/`colcount`, mounted
  rows, bars, connectors, range label. **72 charts, all identical.**

### Notes for maintainers

- `show-dependencies` / `show-load` are declared as element **properties**, not
  attributes, in the web-components binding. An absent boolean attribute coerces
  to `false` (so removing one resets the prop), and both flags default to true —
  as attributes they switched the load strip off on all eight charts while the
  build, the typecheck and the lint all passed. Every other boolean attribute in
  `src/elements` defaults to false; these two are the whole exception.
- The layout trap that produced two false readings: `.example-preview` is
  `display: flex`, so a wrapper without `w-full` is content-sized — and a fit
  axis sizes itself from its scroller's measured width, which makes the two
  define each other. Identical data rendered at 516 px in one section and 1800 px
  in another, and per-scroller overflow checks could not see it because each
  scroller was internally consistent.

## [10.0.0] - 2026-07-30

### Breaking

- **Licensed PolyForm Noncommercial 1.0.0** (SPDX `PolyForm-Noncommercial-1.0.0`),
  copyright Algorisys Technologies Pvt. Ltd, authored by Rajesh Pillai. There was
  previously no `LICENSE` and no `license` field in any manifest, which is *all
  rights reserved* by default, not permissive. Free for personal, hobby,
  learning, research, education, charity and government use; commercial use needs
  a separate licence (`COMMERCIAL.md`). Source-available, **not** open source —
  the OSD forbids field-of-use restrictions and SPDX marks the id
  `isOsiApproved: false`.
  - `LICENSE` + `COMMERCIAL.md` at the root and in all five packages, listed in
    each `files` array — npm auto-includes a package's own `LICENSE` only when
    `files` is absent, and every binding has one.
  - The licence body is byte-identical to the upstream PolyForm file. Diff
    against that repo, not the rendered page: the page transcribes differently
    ("To receive any license" for "In order to get any license", a dropped
    `Required Notice:` example).
  - `.gitignore` allowlists `COMMERCIAL.md` — `*.md` matches at any depth, and
    the licence's `Required Notice:` names that file, so an untracked copy would
    ship a pointer to nothing. A bare pattern covers the per-package copies too;
    verify with `git add -n`, not `git check-ignore -v`, which counts a negation
    as a match and exits 0.
  - Stated in `AGENTS.md` and the zen-ui skill via `LICENSING` in
    `scripts/gen-agent-guide.ts`, so a consumer's coding agent sees it before
    recommending the dependency.

### Fixed

- **The published packages were not installable.** Each binding declared
  `@algorisys/zen-ui-core` as `workspace:*` under `dependencies`; that protocol
  resolves only inside this monorepo, so tarball, `file:`, GitHub Packages and
  git-URL installs all failed (`npm`: `EUNSUPPORTEDPROTOCOL`; `bun`: `failed to
  resolve`), and `packages/core` is `private: true` so the range could never have
  pointed at anything publishable. Green everywhere inside the workspace, which
  is why it survived. No binding externalises core, so rollup inlines it and
  `dist/index.js` imports nothing from it — measured 0 sibling imports in all
  four entries — making it a build-time dependency, now declared as one.
  `check:package` verifies declared paths exist, not that the dependency graph
  resolves outside the workspace.
- **The published type declarations did not resolve.** Same cause one level down:
  every `.d.ts` referenced `@algorisys/zen-ui-core/*` because core's `exports`
  point at `./src/*.ts` and tsc resolves the source across the workspace. A
  strict consumer measured 69 errors, 37 unresolved siblings; `skipLibCheck:
  true` hid it. `scripts/vendor-core-types.mjs` now copies core's declarations
  into each `dist/_core/` and rewrites specifiers to relative paths, wired into
  each `build:lib` after `build:types`. Three traps, all recorded in CLAUDE.md:
  subpath must be rewritten before the bare specifier; tsc's inline
  `import("…").T` form is not a statement, and the first version used the same
  line anchor for its own leak check so it reported 0 leaks while a strict
  consumer still failed; `declare module "…/styles"` and 26 JSDoc mentions must
  keep the bare specifier.
- **`dist/assets/` was publishing stale demo output** — bundles from before the
  demo build moved to `dist-demo`, kept alive by `emptyOutDir: false` and shipped
  by `files: ["dist"]`. 36% of the React tarball, and the last files still
  importing core. `build:lib` now begins `rm -rf dist/assets`. Unpacked: react
  9.92 → 6.36 MB, vanilla 5.82 → 4.13, web-components 5.28 → 3.54.
- **`bun.lock` recorded 7.1.0 for all five packages** while the manifests said
  9.10.0 — two majors stale. `bun pm pack` takes the version it substitutes for
  `workspace:*` from the lockfile, so it was stamping a wrong range into
  tarballs. `check:release` guards the four places a version lives and never
  reads the lockfile.
- **The landing page claimed "MIT-style internal use"** and printed
  `npm install @algorisys/zen-ui-<binding>` on three of four cards. Nothing is on
  a public registry (all five 404), so that command has never worked. Cards now
  show the tarball route, gated on `repoHref` so the planned Vue and Svelte cards
  do not render a build command for a directory that does not exist.
- **`build:landing` had been failing** since c05babc — two SVG `<path>` elements
  used React's camelCase `strokeWidth`/`strokeLinecap`/`strokeLinejoin`, which
  Solid's JSX types reject. Invisible from both directions: `bun run check` does
  not build the landing page, and `deploy.sh` runs `vite build` directly,
  skipping the `tsc -b` in the package's own build script — so every deploy
  succeeded while the script failed.
- **The demo footer's first ~240px was hidden behind the sidebar** in all four
  demos, so the copyright line read as starting mid-word at "en-ui". `.sidebar`
  is `position: sticky` at `calc(100vh - header)`, which never subtracts the
  footer, so it overhangs by exactly the footer's height and, being positioned,
  paints over a non-positioned in-flow bar. `.app-footer` is now
  `position: relative; z-index: 1`.

### Added

- **`COMMERCIAL.md`** — who needs a commercial licence, what to send, and the
  contributor note about copyright.
- **`packages/core/tsconfig.types.json`** — declaration-only build for core, so
  its `.d.ts` can be vendored. `uno-preset.ts` excluded: no binding's public
  types reference it and it would drag unocss's types in.
- **`scripts/vendor-core-types.mjs`** — makes a binding's declarations
  self-contained; asserts 0 sibling specifiers and reports the count of
  declarations examined.
- **README distribution route 5 — bundler alias** for a submodule or sibling
  checkout, with the alias-ordering, `dedupe` and rebuild caveats. The route
  consumers were already using and the only one that was undocumented.
- **A licence line in every demo footer** and on the landing page.
- **`clsx` and `class-variance-authority`** as dependencies of every binding —
  the vendored `_core/cn.d.ts` and `_core/variants.d.ts` import `ClassValue` and
  `VariantProps`, so they are part of the public type surface even though the JS
  inlines them.

### Changed

- `@algorisys/zen-ui-core` moved from `dependencies` to `devDependencies` in all
  four bindings; `@algorisys/zen-ui-vanilla` likewise in web-components.
- Manifest `repository.url` and `homepage` corrected from `github.com/algorisys`
  (404) to `github.com/Algorisys-Technologies`.

## [9.10.0] - 2026-07-23

### Added

- **MediaTimeline `rangeMode="independent"` — labeled, movable, overlappable
  ranges, all four bindings.** Consumer-driven again (StudioX's
  elements-timeline, the overlay-elements lane its Phase C could not port).
  Independent mode drops the neighbour clamps (spans overlap freely, z-order
  is array order), adds body-drag (whole-span move, length preserved,
  grab-point kept under the cursor — core `moveRange`, contract-tested) and
  makes the bar body a focusable slider (arrows move it). New per-range hooks:
  `rangeLabel` (rendered in the bar, truncated, pointer-events none) and
  `rangeColor` (any CSS colour; fill/ring/handles derived — arbitrary hex is
  exactly what class tokens cannot express). Precedence: rangeClass >
  rangeColor > default tint. Deselection: empty-track click in independent
  mode emits `onActiveIndexChange(-1)` (the DOM `selectedIndex` convention —
  chosen over `number | null` because widening the callback parameter would
  be a compile-breaking change for every existing consumer) and still seeks.
  Recorded per-mode decisions: body-drag is independent-only (moving a
  partition range through neighbours has no defined meaning); independent
  lanes default to the shorter `zen-h-10` track (the caller's class lands on
  the root, where a height utility cannot reach the track). Partition mode
  is byte-for-byte unchanged — `dragRangeEdge`'s mode parameter defaults to
  it. Default `"partition"`; existing consumers unaffected.

### Fixed

- **A stale `suppressClick` swallowed the first track click after any drag,
  in both media components, all bindings.** The flag armed on drag-end
  assumed the drag's own click would reach the track and consume it — but
  that click targets the captured handle and is stopped by the range's click
  handler, so it never arrives, and the NEXT genuine click-to-seek (or
  independent-mode deselect) was eaten instead. The flag now clears on any
  pointerdown that actually reaches the track: a fresh track press is what
  legitimizes the click that follows it, while a capture-lost drag click
  (whose pointerdown was stopped at the handle) is still suppressed. Found
  by the interaction driver's new deselect assertion.

## [9.9.0] - 2026-07-23

### Added

- **`MediaTimeline` + `Waveform` — the media family, all four bindings.**
  Consumer-driven (StudioX's editor surface; contract in
  [IMPLEMENT-media-components.md](IMPLEMENT-media-components.md)).
  `MediaTimeline` is a filmstrip trim track: controlled `ranges` with
  edge-drag handles (neighbour clamps with a min-duration gap), hover
  timestamp bubble, click-to-seek, live drag tooltip, playhead, consumer
  thumbnails, controlled `zoom`, and the Input/Change/Commit callback grammar
  that separates live edits from history. `Waveform` is an audio lane: a
  `peaks: number[]` envelope as one SVG path, with an optional clip window —
  body-drag to place (`offset`), edge-drag to trim (`start`/`end` in audio
  time; left edge keeps the tail fixed). Semantics are generic — a range is
  just a range; `rangeClass`/`clipClass` replace the default tint. All drag
  math lives in `packages/core/src/media.ts`, pinned by `scripts/check-media.ts`
  (`check:media`, part of `bun run check`), so all four renderers clamp
  identically by construction. Handles are focusable `role="slider"`s with
  arrow-key nudge. Build order was Solid → React → vanilla → web-components,
  each verified with the same 13-assertion Playwright interaction drive before
  the next port. The vanilla port is factory + handle
  (`MediaTimeline({ … }).update({ ranges })`), split render/paint so a drag
  never rebuilds the element holding pointer capture; web-components wraps it
  as `<zen-media-timeline>` / `<zen-waveform>` with the drag grammar as
  CustomEvents (`zen-ranges-input`, `zen-clip-commit`, …) and the remove
  affordance presence-gated on a `zen-range-remove` listener.
  Files: `packages/core/src/media.ts`, `scripts/check-media.ts`,
  `packages/{react,solid}/src/components/{media-timeline,waveform}/`,
  `packages/vanilla/src/components/{media-timeline,waveform}/`,
  `packages/web-components/src/elements/{media-timeline,waveform}.ts`, demos +
  nav + routes in all four demo apps.

### Fixed

- **A plain click on an element inside the media track could be silently
  swallowed in React.** The track's pointerup handler wrote state
  unconditionally; the resulting commit between pointerup and mouseup re-set
  the remove button's Icon innerHTML, detaching the node the mousedown had
  targeted, and the browser then suppressed the click. All bindings now bail
  out of pointerup when no drag is in flight.
- **Solid's Avatar demo used `https://broken.invalid/x.png` for its
  intentionally-broken image** where React and vanilla use
  `/deliberately-missing.jpg` — the filename visual-check's filter recognizes
  as deliberate. The divergence made every full Solid visual pass report one
  false runtime error. Aligned with the reference demos.

## [9.8.0] - 2026-07-23

### Added

- **`skills/zen-ui/references/api/` — per-family API references, generated
  from the React source types.** `scripts/gen-skill-api.ts` walks `index.ts`'s
  export declarations with the TypeScript checker (the module specifier is the
  family) and filters each props type by declaration origin: in-repo members
  in full (name, type, JSDoc — includes the cva variant unions, which resolve
  to core's `variants.ts`), third-party non-DOM members (Radix escape hatches)
  as names grouped by package, inherited DOM attributes as one summary count.
  Item shapes (`StepperStep`, …) render their members; short aliases inline
  (`StepStatus = "error" | "current" | …`). Component-level JSDoc deliberately
  dropped — headers like "on @radix-ui/react-dialog" parse the package name as
  a JSDoc tag and truncate. 108 family files + `index.md`, root copy plus one
  per binding package. `check:skill-api` joins `bun run check`; write mode
  deletes orphaned files. SKILL.md workflow gains "read the API file before
  writing props".

## [9.7.0] - 2026-07-23

### Added

- **`skills/zen-ui/` — a Claude Code skill, published in every binding
  package.** `SKILL.md` (workflow: pick the binding, check the catalogue,
  verify the silent-failure setup rules) plus `references/catalogue.md` (every
  family with its nav.ts description, lazy-loaded). Generated by
  `scripts/gen-agent-guide.ts` from the React `nav.ts` — the same source and
  staleness gate as `AGENTS.md`, so `bun run check` fails if a component lands
  without the skill regenerating. One skill for all four bindings; each
  package's `files` now lists `skills`, and each per-package `AGENTS.md` points
  at the install (`cp -r node_modules/<pkg>/skills/zen-ui .claude/skills/`).
  `.gitignore` allowlists `skills/**/*.md` and `packages/*/skills/**/*.md` —
  the `*.md`-at-any-depth rule would otherwise silently untrack all of it.
- **Component search in every demo sidebar.** A search box (the library's own
  `Search` in React/Solid/vanilla, `<zen-search>` in web-components) filters
  the nav by label AND `description`, so "wizard" finds Stepper. Groups with no
  hits drop out; a garbage query shows an empty-state line instead of a blank
  sidebar; clearing restores the full list. In vanilla/web-components the
  rebuilt links re-derive the active route from `path()`, because `render()`'s
  active-link repaint only runs on navigation. Verified by driving all four
  demos in a browser (filter, description match, empty state, restore — 0 page
  errors each).

## [9.6.0] - 2026-07-21

### Added

- **`PlanningCalendar`** — resource-by-time grid. `rows` (each `{ id, title,
  subtitle?, appointments }`), `view` / `defaultView` / `onViewChange`, `views`,
  `date` / `defaultDate` / `onDateChange`, `onAppointmentClick`, `now`,
  `hideToolbar`, `emptyMessage`. An appointment is `{ id, start, end, title,
  subtitle?, state?, icon? }` with `Date`s in the caller's local time,
  deliberately unconverted. Three views: day (hours), week (days, Monday first),
  month (days). The month is ONE axis of 28–31 columns, not a 6×7 page —
  wrapping it into weeks would give each resource six rows and destroy the
  cross-row comparison the component exists for. Read-only by design: no
  drag-to-move, drag-to-create or resize. Blocks are real `<button>`s;
  `<zen-planning-calendar>` fires `zen-appointment-click` with detail
  `[appointment, row]`.
- **`@algorisys/zen-ui-core/planning`** — the layout maths behind it, exported in
  its own right: `planningRange`, `planningColumns`, `planningRangeLabel`,
  `shiftPlanningAnchor`, `placeAppointment`, `layoutLanes`, `nowPct`,
  `formatTimeRange`, `startOfWeek`, `startOfMonth`. Framework-agnostic, so four
  renderers cannot drift on where 09:30 is.
- **`scripts/check-planning.ts`**, wired into `bun run check`. 60 assertions over
  the cases that fail silently: Sunday belonging to the week that just ended
  (`getDay()` is 0, so the naive `d - getDay() + 1` sends it forward a week);
  31 January + 1 month landing in February rather than overflowing to 2 March;
  ranges half-open at BOTH ends, so an appointment ending at midnight does not
  draw a zero-width sliver on the next day; touching intervals sharing a lane;
  lanes returned in INPUT order; a zero-length appointment keeping a clickable
  width; `nowPct` returning null outside the range instead of clamping to an
  edge.

### Changed

- `PlanningCalendar` added to every binding's `nav.ts`, demo routes and the
  generated `AGENTS.md` catalogue.

### Internal

- Two findings from driving it in a browser rather than reading it: the toolbar
  rendered over an empty resource list, where Previous / Today / Next and the
  view switcher cannot change anything visible, and the root shrink-wrapped to a
  ~490px week whose columns were too narrow to read. Both fixed before the
  Solid binding was committed, so no port carried them.
- The web-components element wraps the factory to revive ISO strings into
  `Date`s. JSON has no date type; without it every appointment from a markup
  `rows` attribute is `Invalid Date`, every placement returns null, and the grid
  renders an empty axis with no error anywhere.

## [9.5.0] - 2026-07-21

### Added

- **`Timeline`** — ordered list of events with a rail, markers, timestamps and
  date groups. `items`, `density` (`default | compact`), `emptyMessage`. An item
  is `{ id, title, description?, timestamp?, dateTime?, icon?, state?, group?,
  children? }`. Renders an `<ol>`; the group heading is deliberately NOT an
  `<li>` (it would inflate the announced count); the rail is suppressed on the
  last item; markers are `aria-hidden`. Grouping is a `group` STRING on the item
  rather than a `groupBy` callback — deriving it would require guessing the
  caller's timezone. `compact` drops the description and body rather than
  scaling type. The rail uses logical insets (`start-*`), so it moves side under
  RTL. All four bindings; `<zen-timeline>` takes `items` as a json attribute and
  a property, no slot.
- **`UploadCollection`** — the list of uploaded files: progress, rename, delete,
  retry. `items`, `onRemove`, `onRetry`, `onRename`, `emptyMessage`, `disabled`.
  An item is `{ id, name, size?, type?, status?, progress?, error?, url?,
  uploadedAt?, uploadedBy?, thumbnail? }`, `status` defaulting to `complete`.
  Renders a `<ul>` (attachments have no sequence, unlike Timeline). Transport is
  the caller's: no url/method/retry policy, and `onRetry` hands the item back.
  Actions are presence-gated on the handler — in web-components on the LISTENER,
  which `defineZenElement`'s opt-in event wiring gives for free. `class` /
  `className` reaches the empty state as well as the list, so removing the last
  file does not resize the box. `<zen-upload-collection>` events:
  `zen-remove` / `zen-retry` (detail: the item), `zen-rename` (detail:
  `[item, name]`, since a CustomEvent carries one payload).

### Fixed

- **Rename editors committed on cancel, and twice on commit.** Closing the
  inline editor removes a FOCUSED input, so the browser fires `blur` during the
  removal and re-enters the handler mid-call. Escape's discard was undone by the
  blur that followed it, and Enter committed twice — in vanilla the second
  `replaceWith` also threw `NotFoundError`. Fixed in all four bindings by
  setting the guard BEFORE the DOM is touched. Note `input.isConnected` does NOT
  work: at blur time the node is still a child, so it reads `true`. (Shipped
  only inside 9.5.0's new `UploadCollection`; no released component had it.)

### Changed

- `Timeline` and `UploadCollection` added to every binding's `nav.ts`, demo
  routes and the generated `AGENTS.md` catalogue.

### Internal

- `tree-table.tsx` (Solid): the last `solid/reactivity` warning disabled at the
  site with its reason. The rule fires on the callback `getSubRows` RETURNS; the
  tracked scope is the getter, which TanStack reads inside its own memo, so the
  callback is a snapshot by design and tracking it would recompute the row model
  per row instead of per load. Solid lint is genuinely 0 again — CLAUDE.md had
  claimed 0 while it was 1, and now says how it was measured.
- Probe correction, not a code change: an assertion for "no `<ul>` when empty"
  counted vanilla's `FileUpload` list, which stays in the DOM at `display:none`
  rather than being removed. Counting VISIBLE lists (and reporting both numbers)
  made all four bindings agree.

## [9.4.0] - 2026-07-21

### Added

- **`TreeTable` lazy children** — `hasChildren` marks a row openable before its
  children exist (without it an unloaded node is indistinguishable from a leaf,
  gets no chevron, and can never trigger its own load); `loadChildren` fetches on
  first expand; `onLoadChildrenError` handles rejection (re-thrown if absent).
  Results cache against the row id, so this requires `getRowId` or an `id` on the
  row — an index-path key moves under sorting/filtering and the cache would miss.
  The chevron becomes a spinner and the control carries `aria-busy` while in
  flight. In React and Solid the table's `data` getter returns a fresh top-level
  array identity after a load, because TanStack memoizes the row model on data
  identity and would otherwise never surface the fetched children.
- **`TreeTable` pagination** — `enablePagination`, `pageSize` (default 10),
  `pageSizeOptions`, `onPaginationChange`. Pages the ROOT rows via TanStack's
  `paginateExpandedRows: false`; vanilla slices the roots inside `flatten()`
  before descending, which is the same guarantee by construction.
- **`TreeTable` virtualization** — `enableVirtualization` + `rowEstimatedHeight`,
  requires `maxBodyHeight` and warns otherwise. Spacer rows rather than an
  absolutely-positioned grid clone, keeping real `<table>` markup and therefore
  the treegrid roles; adds `aria-rowcount` / `aria-rowindex` when windowed.
- `<zen-tree-table>`: `enable-pagination`, `page-size`, `enable-virtualization`,
  `row-estimated-height` attributes; `hasChildren`, `loadChildren`,
  `onLoadChildrenError`, `pageSizeOptions` properties; `zen-pagination-change`
  event.

### Performance

- vanilla/web-components `TreeTable` expand/collapse splices the affected subtree
  instead of rebuilding `<tbody>`: ~49 ms → 3–8 ms at 1,110 visible rows, and
  ~924 ms → 88–138 ms at 22,620.

### Fixed

- Solid: three lint warnings miscounted as zero in `CLAUDE.md` — two dead
  `eslint-disable` directives (`date-picker`), and one in `time-picker` where
  `eslint-disable-next-line` sat on the outer line of a multi-line call while the
  rule reported the inner one, silencing nothing.

### Internal

- `CLAUDE.md`: build order is Solid → React → vanilla → web-components (React
  remains the parity reference); `check:parity` is red for the duration of a port
  by construction; and a solution-style `tsconfig.json` (`{"files": []}`) compiles
  an empty program and exits 0 on any code.

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
