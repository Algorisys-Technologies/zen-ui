# Parity pass after 12.2.0 (started 2026-11-05)

The live tracker for porting 12.2.0's Solid-only work to React, then vanilla,
then web components (CLAUDE.md "Binding parity", todo.md "Order of work").
React stays the API reference; Solid is the behaviour reference for these
features, since they were built there first. Read this before resuming.

**Method.** Each unit is ported to React by its own agent in a git worktree
(LOOPS XXXVI "isolate parallel work"), then merged into `dev` and verified
here (typecheck, lint, the demo driven in a browser). A unit's vanilla port
starts only after its React port is merged and verified; web components only
after vanilla. `check:parity` stays red until the last unit lands in all four.

**State key:** `—` not started · `wip` in progress · `ok` merged and verified
· `blocked` (see notes).

| unit | what | React | vanilla | WC |
|---|---|---|---|---|
| L | LocaleProvider / useLocale | ok (e94479a) | ok | ok (re-export; `<zen-locale-provider>` with unit S) |
| A1 | AmountField, QuantityField, ObjectNumber `number=`; /amount-field, /localization | ok | ok | ok |
| A2 | Shortcuts: Kbd, ShortcutProvider, useShortcut, ShortcutHelp | ok | wip | wip |
| A3 | ContextMenu | ok | wip | wip |
| A4 | DocumentTabs | ok | ok | ok |
| A5 | Tile, TileGrid | ok | ok | ok |
| A6 | QRCode, Barcode | ok | ok | ok |
| A7 | DateInput; Calendar arrow keys; DatePicker `initialFocus` | ok | wip | wip |
| A8 | TreeSelect | ok | wip | wip |
| A9 | LookupField | ok | — | — |
| A10 | FilterBuilder | ok | — | — |
| A11 | ViewManager | ok | — | — |
| A12 | Sidebar collapseMode / overlay / badges / header label | ok | wip | wip |
| A13 | Gaps batch (ShellBar search, SegmentedButtonItem count, StatCard lg + chart, MicroBarChart baseline, ObjectStatus stamp, table tokens, invalid on Combobox/Select, closeLabel, list resets, warning-text) | ok | — | — |
| D | DataTable: keyboard rows, cell navigation, row virtualization + drag, contextMenu, totals, server export, the editor / sort-priority / group-row fixes | ok | wip | wip |
| S | Strings: the binding's components read the message catalogue; check:strings per binding | — | — | — |

## Log

- 2026-11-05: L merged (React LocaleProvider; Solid index also re-exports
  MessageKey / ZenMessages).
- 2026-11-05: L for vanilla: `LocaleProvider({ children: () => … })` runs its
  children function as the current locale, so factories read it with
  `useLocale()` when called, as React/Solid read context; `localeOf(node)` for
  words rendered after mount; `update()` rebuilds (and destroys) a function's
  children. 7/7 in Chromium (defaults, translation, nesting, scope ends,
  rebuild + destroy, localeOf, cleanup). Web components re-export it.
- 2026-11-05: wave 1 of React ports launched in worktrees: D (DataTable),
  A1, A2, A3, A4, A5+A6.
- 2026-11-05: A2 React merged (Shortcuts; oracle 12/12 prod + StrictMode dev,
  11/11 React-specific: no StrictMode duplicate, handler via ref, release on
  unmount). `within` also takes a RefObject (additive). Integrator re-check on
  dev: tsc app 0, eslint 258 files 0.
- 2026-11-05: A1 React merged (AmountField/QuantityField 25/25 unmodified
  oracle; locale 8/8; ObjectNumber /object and /object-page byte-identical
  before/after). React's /localization shows only AmountField until React's
  strings unit (S). Integrator re-check: tsc 0, eslint 261 files 0.
- Merge note: `.repograph/graph.json` is a tracked tool cache and conflicts on
  every merge; take dev's side. Regenerate agent guide + skill API after each
  merge rather than merging generated files.
- 2026-11-05: A7 and A8 React launched.
- 2026-11-05: A5+A6 React merged (Tile 10/10, QR/Barcode 16/16 with every
  symbol on the page decoded by zxing). Tile `as` passes `href` and `to`
  (react-router Link works); TileGrid chains a caller's onKeyDown.
- 2026-11-05: A4 React merged (DocumentTabs: a new 35-assertion drive gives
  identical results on Solid and React; a control with the per-tab observer
  removed drops to 32/35). It found 5 strings Solid hard-coded that
  check:strings could not see; widening the check found 13 more in Solid
  (2a234331, 120/120 routes identical).
- 2026-11-05: A3 React merged (ContextMenu 11/11 + 4 extra; Button bundle
  byte-identical). DropdownMenu and ContextMenu now share classes via
  `dropdown-menu/menu-parts.tsx` (DropdownMenu output identical on 12 menus).
  Radix forces separate item components and its prop names (`onCheckedChange`);
  a checkbox item closes the menu as React's DropdownMenu does. Not testable
  in Playwright: suppressing the browser's own keyboard contextmenu.
  Also found: vendor-core-types vendored nothing under a dotted path (fixed,
  64dd29ce).
- 2026-11-05: A10 (FilterBuilder), A11 (ViewManager), A12 (Sidebar) React
  launched.
- 2026-11-05: A8 React merged (TreeSelect oracle 18/18 + 19/19 extra).
  `packages/react/src/lib/anchored.ts` = `useAnchoredPlacement` (React's
  first `createPortal`), for LookupField to reuse. The React port found a
  first-open scroll bug in its own first version (scrolled before the height
  cap); the integrator ran the same check on Solid: passes (scrollTop 46, row
  in view), so Solid does not have it. A9 (LookupField) React launched.
- 2026-11-05: A10 React merged (FilterBuilder: oracle 23/23, extra 14/14).
  Radix Select does not re-report on options change, but does re-fire inside a
  <form> (hidden native select): handlers ignore a report of the held value.
  MultiCombobox gained `aria-label` (as Solid's did). Follow-ups launched: date
  editor onto DateInput; React MultiCombobox showing raw values as chips on
  first paint (a pre-existing bug).
- 2026-11-05: A7 React merged (DateInput 28/28; calendar keys 21/21 incl. 7
  RTL). react-day-picker already had the keys; it mirrored ← → only with its
  own `dir` prop, so in an RTL page → went back a day: fixed without passing
  `dir` (that would flip the chevrons). Shift+arrows: React keeps
  react-day-picker's month/year (Solid: same as plain) — left as is, changing
  it would break. DatePicker `initialFocus` "first" = today's React focus.
  `scripts/snapshot-routes.mjs` reads `path:` but React's nav uses `to:`, so
  it cannot snapshot React yet (TODO for the vanilla/WC phase).
  Known: React DatePicker's placeholder "Pick a date" is hard-coded (unit S).
- 2026-11-05: A13 React (gaps batch) launched.
- 2026-11-05: A9 React merged (LookupField 30/30 unmodified oracle; a flexible
  column's 14 cells share one edge and width). Reuses useAnchoredPlacement.
  Enter ignored mid-IME-composition (a gap Solid also has; noted, not changed).
- 2026-11-05: vanilla phase begins. Each vanilla agent ports, verifies, commits,
  THEN builds the WC elements over the verified factory (binding order kept
  within one agent). First: A5+A6.
- 2026-11-05: A11 React merged (ViewManager 25/25 unedited + 21/21; DropdownMenu
  RadioItem `closeOnSelect`, default true = Radix's; dialogs mount content only
  while open, since Radix sends no onOpenChange for a programmatic open).
  Merge conflict in dropdown-menu.tsx resolved by hand (A3's shared classes +
  A11's onSelect).
- 2026-11-05: A12 React merged (Sidebar 11/11 + 9/9). Fixes measured in React:
  rail header spill (14 of 198 elements differ, all on the collapsed rail),
  asChild link blue/underlined.
- 2026-11-05: React follow-ups merged: FilterBuilder dates are a typed DateInput
  (21/21 + 9/9); MultiCombobox showed raw values as chips on first paint (fixed;
  18 snapshot lines differ, all raw value -> label). Solid unaffected.
- 2026-11-05: A13 React merged (gaps: 32/32 drive, 8/8 SSR; 111/119 routes
  identical, 7 extended at the end, /document-viewer timed out both runs;
  8,865 computed styles identical except the intended Breadcrumb / Stepper list
  resets and one StatCard underline). Visible on forms that already set
  aria-invalid: Input / SelectTrigger now take the error border (Solid's rule).
  It found a SOLID 12.2.0 regression: StatCard figures 8px taller (cn dropped
  leading-none after the size class) — fixed 42f7dd94. Label has the same
  order since before 12.1.1: todo.md, next major.
- 2026-11-05: D React merged (DataTable: keyboard rows 18/18, cell nav 26/26,
  row virt 24/24 + leak check, totals 12/12, export 16/16 with ExportRequest
  byte-identical to Solid's, drag 7/7; 27 existing sections identical). Also
  fixed in React: the select editor never saved a pick; the no-variant column
  filter matched nothing. `body-table.tsx` split out of data-table.tsx.
- 2026-11-05: A5+A6 and A1 vanilla+WC merged (Tile 10/10, Barcode 16/16 with
  all codes decoded, AmountField 25/25, locale 8/8, in BOTH bindings;
  /object routes byte-identical). Known WC limits: elements capture children
  once (a tile added later goes in via the rendered grid); no
  <zen-locale-provider>; an attribute cannot clear a controlled value.
- 2026-11-05: scripts fixed: visual-check used fixed ports that another
  session's servers held, screenshotting the wrong build (free port + group
  kill now, 5fdc860a); snapshot-routes read only Solid's nav (474c00b0).
  Six orphaned preview servers from finished agents stopped.
- 2026-11-05: wave 2 launched: D2 React (DataTable contextMenu), vanilla+WC
  A2, A3, A4, A7. Agent notes for vanilla in the scratchpad VANILLA-NOTES.md.
- 2026-11-05: D2 React merged (DataTable contextMenu 10/10, + 8/8 with cell
  navigation in a temporary build; /data-table 32 -> 33 sections, none changed).
  **check:parity: Solid <-> React clean in both directions.** Radix reads the
  trigger's `disabled` during the same event, so the target is committed in the
  capture phase with flushSync (a header right-click after a row's otherwise
  opened the row's menu).
- 2026-11-05: A4 vanilla+WC merged (DocumentTabs 35/35 on both, results file
  byte-identical to React's; update({tabs}) reconciles by id and keeps focus).
- 2026-11-05: D vanilla+WC, A8 vanilla+WC, A12 vanilla+WC launched.
