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
| L | LocaleProvider / useLocale | ok (e94479a) | ok | ok (<zen-locale-provider>) |
| A1 | AmountField, QuantityField, ObjectNumber `number=`; /amount-field, /localization | ok | ok | ok |
| A2 | Shortcuts: Kbd, ShortcutProvider, useShortcut, ShortcutHelp | ok | ok | ok |
| A3 | ContextMenu | ok | ok | ok |
| A4 | DocumentTabs | ok | ok | ok |
| A5 | Tile, TileGrid | ok | ok | ok |
| A6 | QRCode, Barcode | ok | ok | ok |
| A7 | DateInput; Calendar arrow keys; DatePicker `initialFocus` | ok | ok | ok |
| A8 | TreeSelect | ok | ok | ok |
| A9 | LookupField | ok | ok | ok |
| A10 | FilterBuilder | ok | ok | ok |
| A11 | ViewManager | ok | ok | ok |
| A12 | Sidebar collapseMode / overlay / badges / header label | ok | ok | ok |
| A13 | Gaps batch (ShellBar search, SegmentedButtonItem count, StatCard lg + chart, MicroBarChart baseline, ObjectStatus stamp, table tokens, invalid on Combobox/Select, closeLabel, list resets, warning-text) | ok | ok | ok |
| D | DataTable: keyboard rows, cell navigation, row virtualization + drag, contextMenu, totals, server export, the editor / sort-priority / group-row fixes | ok | ok (grouping / per-column filters: pre-existing gap) | ok (as vanilla) |
| S | Strings: the binding's components read the message catalogue; check:strings per binding | ok (139/139) | ok (128/128) | ok (<zen-locale-provider>) |

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
- 2026-11-05: A7 vanilla+WC merged (DateInput 28/28, calendar keys 31/31 on
  both; 107/109 routes identical per binding, /date-picker extended, `/` count).
  Vanilla's calendar had NO arrow keys before (measured); default DatePicker
  focus (the panel) unchanged. Shift+arrows follow React; disabled days are
  stepped over (react-day-picker does; Solid does not — noted). WC names the
  inner input via `input-id` / `input-aria-label` (as <zen-tag-input>).
  Known: vanilla Calendar/DatePicker hard-code "Previous month", "Next month",
  "Pick a date" (unit S). A10 vanilla+WC launched.
- 2026-11-05: A2 vanilla+WC merged (Shortcuts 12/12 both; vanilla registry
  15/15; WC 7/7). Vanilla ShortcutProvider takes a children function like
  LocaleProvider and useShortcut returns its release; WC uses one document
  registry (`documentShortcuts()`) with <zen-shortcut> / <zen-kbd> /
  <zen-shortcut-help>, since a provider element cannot reach parsed children.
- 2026-11-05: A3 vanilla+WC merged (ContextMenu 11/11 + 4/4 + 11/11 both).
  Data-driven like vanilla DropdownMenu (same item specs and drawing code, in
  the new `menu-engine.ts`; DropdownMenu's 11 menus byte-identical). React's 14
  compound part names are divergences in bindings.mjs, as DropdownMenu's are.
  Noted, not changed: vanilla DropdownMenu opened from the keyboard under a
  resting mouse loses first-item focus to the row under the cursor
  (ContextMenu uses pointermove and does not).
- 2026-11-05: A11 and A13 vanilla+WC launched.
- 2026-11-05: A8 vanilla+WC merged (TreeSelect 18/18 + 19/19 both; vanilla
  `lib/anchored.ts` = `anchorPopup`, onPlace re-runs scroll after the cap).
  It suspects React's TreeSelect re-scroll effect (depends on a style object
  that changes on every scroll) could pull a wheeled list back; not
  reproduced — noted, unconfirmed.
- 2026-11-05: A11 vanilla+WC merged (ViewManager 25/25 + 21/21 both, WC
  promise 4/4). Vanilla DropdownMenu radio `closeOnSelect` (default true,
  6/6 identical). WC `lib/define.ts` now RETURNS an assigned callback's value
  (so a Promise reaches the factory); no existing factory reads that value.
- 2026-11-05: A9 vanilla+WC merged (LookupField 30/30 + 9/9 both, unchanged
  oracles; flexible column 14 cells aligned).
- 2026-11-05: found by the A9 port: vanilla `Disposer.dispose()` latched
  "done" forever, so every Disposer reused per opening (Combobox's session,
  TreeSelect's, ~25 others) ran its cleanups on the first close only; later
  openings' document listeners stayed attached (since 7.0.0). Fix in
  `lib/component.ts` (take the list, then run it; reusable; re-entrant safe),
  being A/B-measured: listener counts over 5 cycles + all vanilla routes
  snapshotted before/after.
- 2026-11-05: Disposer fix A/B measured and committed (1ab8d2fa): Combobox
  document listeners after 5 open/close cycles 8 -> 0, TreeSelect 1 -> 0;
  116/116 vanilla routes identical.
- 2026-11-05: A12 vanilla+WC merged (Sidebar 11/11 + 9/9 + WC elements 14/14;
  rail fix measured element by element). `SidebarHeader` takes an optional
  `sidebar` to get the rail fix (vanilla parts have no context lookup).
- 2026-11-05: A13 vanilla+WC merged (34/34 both; 106/113 vanilla and 105/113
  WC routes identical, 7 extended, 1 WC timing-flaky /chunk-uploader; computed
  style differences are the intended list resets + StatCard underline only).
  Vanilla DataTable body cells + row hover then moved onto the tokens
  (0e46351e: 7286 cells identical at defaults).
- 2026-11-05: D vanilla+WC merged, steps 1-5 (keyboard rows 18/18, totals 9/9,
  export 17/17 with md5-identical ExportRequests across React/vanilla/WC once
  in the same sort state, contextMenu 10/10). NOT DONE: cell navigation and
  row virtualization — vanilla DataTable has no inline editing, grouping or
  per-column filters (a pre-existing gap); group subtotals therefore n/a.
  Also fixed: repaints dropped focus and scrolled a scrolled table to the top.
  Known divergence: a number column's first sort click is descending in
  React (TanStack) and ascending in vanilla.
- 2026-11-05: A10 vanilla+WC merged (FilterBuilder 21/21 + 9/9 + 5/5 both;
  vanilla contract 15/15, WC 10/10). Fixed in vanilla Select: dead after its
  first close (open and render shared one cleanup list); 112/112 routes
  identical. Merge conflicts in nav/main/index resolved by keeping both.
- 2026-11-05: **check:parity GREEN across all four bindings.**
  Integrated React re-verification (one build of dev): amount 25/25, locale
  8/8, shortcuts 12/12, contextmenu 11/11, barcode 16/16, tile 10/10,
  treeselect 18/18 + 19/19, filter 21/21, date-input 28/28, cal-keys 21/21,
  sidebar 11/11, doc-tabs 35/35, lookup 30/30, views 25/25 — every merged React unit re-verified together
  on one integrated build (15 scripts, 0 failures).
- 2026-11-05: S React merged: 139/139 components on the catalogue,
  `check:strings` takes a binding and `check:strings:react` is in `bun run
  check`; 121/121 routes + 57 opened popovers identical in English. 30 new
  keys (half cover English Solid still hard-codes). S2 launched: Solid onto
  those keys, plus the words neither scan can see (helpers, data tables) in
  both bindings, and a wider check that would have caught them.
- 2026-11-05: D-rest vanilla+WC merged: inline editing (17/17), cell navigation
  (26/26 oracle + 10/10), row virtualization (18/18; 6 grouping/expand checks
  n/a, leak check passes), row ordering + virtualized drag (7/7, 5/5), all on
  both demos; 17 existing sections identical (a11y + byte-identical markup).
  `onCellEdit` takes React's `{ rowId, columnId, value }` payload. Remaining
  vanilla DataTable gaps, all pre-existing and out of this pass: grouping,
  per-column filters, expandable rows, column visibility/pinning/resizing.
  Noted: edit-cell's `zen-m-[-0.5rem] zen-p-[0.4rem]` raw rem literals exist
  identically in Solid, React and now vanilla (CLAUDE.md rule; todo).
- 2026-11-05: S vanilla+WC merged: ~80 vanilla components on the catalogue,
  `check:strings:vanilla` in `bun run check`; 117/117 vanilla routes + 151
  popup triggers identical. `withLocale(value, fn)` builds later-rendered parts
  (a calendar on open) in the component's locale. `<zen-locale-provider>`:
  elements build inside the nearest provider and rebuild when it changes
  (19/19 drive). FIXED in WC: a nested element lost its children on
  re-connect (on dev, /alert, /avatar, /code-editor, /theme rendered their
  nested parts empty); 13 WC routes changed = content restored.
  Merge with the React sweep: the two sweeps had named some strings
  differently; one key per string, React's kept (7 vanilla keys folded,
  `chunkUploader.progress` placeholder unified to {count}); same-English keys
  in DIFFERENT components kept separate on purpose (context for translators).
  Vanilla DataTable strings then swept too (128/128, nothing exempt); A/B of
  every vanilla route running.
- 2026-11-05: S2 merged (Solid + React): words built in helpers, ternaries and
  data tables now come from the catalogue too, on the vanilla sweep's keys
  (+25 new: DataTable operators / bulk bar / column pins, Solid camera
  errors). check:strings widened by shape; on the OLD tree it now finds 250
  strings (136 Solid, 114 React) it used to pass; 24 planted strings each fail
  it. Solid 120/120 and React 121/121 routes identical; 3,976 + 4,239 popover
  strings identical. All three bindings 100% clean, nothing exempt.
  Left: ProductionSchedule's "h"/"m" units in Solid/React (vanilla has keys);
  NotificationsInbox older dates use the browser locale (changing it changes
  output).
- 2026-11-05: **all units done.** Full ship gate running (measure only).
