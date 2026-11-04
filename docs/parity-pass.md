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
| A1 | AmountField, QuantityField, ObjectNumber `number=`; /amount-field, /localization | — | — | — |
| A2 | Shortcuts: Kbd, ShortcutProvider, useShortcut, ShortcutHelp | — | — | — |
| A3 | ContextMenu | — | — | — |
| A4 | DocumentTabs | — | — | — |
| A5 | Tile, TileGrid | — | — | — |
| A6 | QRCode, Barcode | — | — | — |
| A7 | DateInput; Calendar arrow keys; DatePicker `initialFocus` | — | — | — |
| A8 | TreeSelect | — | — | — |
| A9 | LookupField | — | — | — |
| A10 | FilterBuilder | — | — | — |
| A11 | ViewManager | — | — | — |
| A12 | Sidebar collapseMode / overlay / badges / header label | — | — | — |
| A13 | Gaps batch (ShellBar search, SegmentedButtonItem count, StatCard lg + chart, MicroBarChart baseline, ObjectStatus stamp, table tokens, invalid on Combobox/Select, closeLabel, list resets, warning-text) | — | — | — |
| D | DataTable: keyboard rows, cell navigation, row virtualization + drag, contextMenu, totals, server export, the editor / sort-priority / group-row fixes | — | — | — |
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
