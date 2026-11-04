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
| A1 | AmountField, QuantityField, ObjectNumber `number=`; /amount-field, /localization | ok | — | — |
| A2 | Shortcuts: Kbd, ShortcutProvider, useShortcut, ShortcutHelp | ok | — | — |
| A3 | ContextMenu | wip | — | — |
| A4 | DocumentTabs | wip | — | — |
| A5 | Tile, TileGrid | wip | — | — |
| A6 | QRCode, Barcode | wip | — | — |
| A7 | DateInput; Calendar arrow keys; DatePicker `initialFocus` | wip | — | — |
| A8 | TreeSelect | wip | — | — |
| A9 | LookupField | — | — | — |
| A10 | FilterBuilder | — | — | — |
| A11 | ViewManager | — | — | — |
| A12 | Sidebar collapseMode / overlay / badges / header label | — | — | — |
| A13 | Gaps batch (ShellBar search, SegmentedButtonItem count, StatCard lg + chart, MicroBarChart baseline, ObjectStatus stamp, table tokens, invalid on Combobox/Select, closeLabel, list resets, warning-text) | — | — | — |
| D | DataTable: keyboard rows, cell navigation, row virtualization + drag, contextMenu, totals, server export, the editor / sort-priority / group-row fixes | wip | — | — |
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
