# Changelog

All five published packages — `@algorisys/zen-ui-core`, `@algorisys/zen-ui-react`,
`@algorisys/zen-ui-solid`, `@algorisys/zen-ui-vanilla` and
`@algorisys/zen-ui-web-components` — share one version. The canonical list is
[scripts/bindings.mjs](scripts/bindings.mjs); `check:release` drives from it.

They ship the same API by construction: a component that exists in one binding
and not the other is a bug here, not a roadmap item (see the parity rule in
[CLAUDE.md](CLAUDE.md)). Two version numbers describing one API would only
diverge and force every question to name a binding first.

This file follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
the versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Icons for an app's business areas — `tag`, `cart`, `package`, `factory`,
  `briefcase`, `book`, `percent`, `building`, `award`, `shield`, `chart` — so a
  Sidebar with `collapseMode="icon"` has a glyph per workspace group. (From
  one-erp's vendored zen-ui.)

- Machine state, the shared vocabulary for shop-floor components
  (`@algorisys/zen-ui-core/machine-state`): nine states — running, idle,
  stopped, fault, waiting, setup, cleaning, maintenance, unknown — each with a
  colour TONE (six: running, down, setup, planned, idle, unknown) and an OEE
  CATEGORY (productive, unplanned-loss, changeover, planned-stop, no-demand,
  no-data). `machineStateTone`, `machineStateCategory`, `isAvailabilityLoss`,
  `isMachineState`, `machineStateMessageKey`; `check:machine-state` pins the
  table, including that every state drawn as down is counted as an unplanned
  loss and the reverse. Waiting (starved / blocked) is down, not idle.
  Labels are in the message catalogue (`machineState.*`; unknown reads
  "No data").
- `--zen-state-<tone>` / `-soft` / `-soft-fg` tokens and `zen-*-zen-state-*`
  utilities. Each aliases a semantic colour, declared on every theme scope so a
  nested `data-theme` resolves its own; override one family to give a plant
  its own andon colours without restyling form errors. Measured label contrast
  over 45 pills in the five themes: lowest 4.79:1.
- StatePill (Solid; React, vanilla and web-components to follow — `check:parity`
  is red until they land): a state as a labelled pill, label always drawn.
  `state` gives colour and label, children replace the label, and `tone` +
  a label covers a vocabulary that is not ours (PackML Held, a plant's
  "Starved"). `unknown` is a dashed outline with no fill. Sizes `sm` / `md`.
- OEE (`@algorisys/zen-ui-core/oee`): `oeeFromCounts` turns planned time, run
  time, ideal cycle time and counts into Availability, Performance, Quality and
  OEE. OEE is good × ideal cycle ÷ planned time — equal to A × P × Q wherever
  all three exist, and still a true 0 for a machine that never ran, where P is
  undefined and the product would be NaN. A factor that cannot be computed is
  `null`, never NaN or 0; nothing is clamped, so a Performance over 100% (a
  wrong ideal cycle time) stays visible. `oeeBand` with configurable
  thresholds (defaults 65% / 85%), `gaugeAngle`. `check:oee`.
- OeeGauge (Solid; other bindings to follow): OEE as a half-circle gauge, with
  the band zones as a ring outside the track and Availability / Performance /
  Quality underneath when `factors` is given. `role="meter"`; the number is
  always printed and the band named in words ("Near target"), so colour is
  never the only carrier. `null` draws an empty track and "No data", never a 0.
  An impossible value over 100% fills the arc and prints as it is
  (`aria-valuenow` clamped to the range, the real figure in
  `aria-valuetext`). Sizes `sm` / `md` / `lg`; `bands` for a plant's own
  targets.
- State timeline (`@algorisys/zen-ui-core/state-timeline`):
  `layoutStateTimeline` lays a machine's state record on a window as fractions
  true to duration; holes become explicit no-data segments, an open segment
  runs to `now` and nothing is laid out after it, overlaps are cut by the later
  start, and a caller's `id` survives. `stateTimelineTotals`,
  `layoutTimelineEvents`, `timelineTicks` (round times in an IANA timezone —
  IST ticks sit at half past UTC), `durationMessage` ("42s", "5m 10s", "25m",
  "1h 12m"). `check:state-timeline`.
- StateTimeline (Solid; other bindings to follow): one machine's states along
  a shift. Stretches exactly as wide as their duration (2px floor), no data
  hatched, a now line, event markers (listed for screen readers), an axis in
  the plant's `timeZone` whose label count follows the strip's width.
  `onSegmentClick` makes segments buttons in one tab stop, walked with arrow
  keys (visual direction, so RTL works), Home / End; `isSegmentClickable`,
  `selectedId`. The group's accessible name carries the per-state totals.
  Stack several with `size="sm"` and `hideAxis` to compare a line.
- Andon (`@algorisys/zen-ui-core/andon`): `andonShowsClock` (the clock
  measures trouble, not uptime — none for running or idle), `sortAndonTiles`
  (down, no data, setup, planned, idle, running; longest in state first),
  `boardFreshness` (stale past a limit, default 2 min). `check:andon`.
- AndonTile / AndonBoard (Solid; other bindings to follow): the plant board,
  one tile per machine with name, line, state in words, cause and a live
  clock, framed and washed in the state's tone (no data dashed). The board
  takes `lastUpdated` — the last SUCCESSFUL refresh — and past `staleAfterMs`
  greys its tiles and says how old they are, since a frozen board looks like a
  calm plant. Tiles keep the order given unless `sort` is set (people find a
  machine on a wall board by where it always is). `onTileClick` / `onClick`
  make tiles buttons. `--zen-andon-tile-min-width` sets the column width.
  Measured label contrast over 165 tile labels in five themes: lowest 4.64:1.
- Reason codes (`@algorisys/zen-ui-core/reason-codes`): `reasonCategories`
  (the plant's own order, with counts) and `filterReasons` — label, code and
  description, every word in any order, case and accents ignored.
  `check:reason-codes`.
- ReasonCodePicker (Solid; other bindings to follow): a touch grid for why a
  machine stopped or a part was scrapped. 48px-plus targets, category chips
  when there is more than one category, search once there are more than 12
  reasons. A listbox with one tab stop; arrow keys (Down / Up by visual row)
  move focus but do not select — Enter, Space or a tap does, because choosing
  a reason is often what records the stop. A selected reason the filter hides
  stays selected and is named under the grid. `--zen-reason-min-width`.
- Scan detection (`@algorisys/zen-ui-core/scan`): `classifyEntry` tells a
  USB scanner's burst from a person typing by timing (default: 4+ characters,
  every gap at most 35 ms, no edits); `createScanBuffer` collects bursts typed
  with no field focused, dropping stray keys and flushing scanners configured
  with no suffix. `check:scan`.
- ScanInput (Solid; other bindings to follow): a 48px monospace field for a
  wedge scanner. Enter submits with `{ source: "scanner" | "keyboard" }`;
  `onScan` returns an error message, a promise of one, or nothing, and the
  status line says Checking / Scanned / the error (a newer scan wins over a
  slower older lookup). `allowTyping={false}` refuses typed codes;
  `captureGlobal` catches scans made while no field has focus, leaving keys
  typed into other fields alone. Clears and keeps focus between scans.
- Icon: `scan-barcode`.
- Touch density: `data-density="touch"` on any element takes inputs,
  selects, comboboxes, md buttons and menu items to 48px and table rows to
  52px (measured), for shop-floor tablets. Type does not grow. Checkbox,
  radio, switch and sm / xs buttons keep fixed sizes (measured: checkbox
  controls 14–20px at every density); wrap them in a label on touch screens.
  Theme demo section 6.
- Production progress (`@algorisys/zen-ui-core/production-progress`):
  `productionProgress` — remaining, over-target, done, started and bar
  fractions from target / good / scrap; scrap never counts toward the target,
  over-production is reported, and good + scrap past the target scale down
  together so scrap stays visible. `segmentFill` for cartons / pallets.
  `check:production-progress`.
- ProductionProgress (Solid; other bindings to follow): good and scrap against
  a work order's target, "361 of 500 good · 19 scrap · 139 to go". Colour is
  what the parts are (good primary, success once done; scrap error), never a
  ramp by percentage. A 2px sliver once work has started; optional
  `segments` row of units; `size="sm"` / `hideText` for table rows, counts
  kept in `aria-valuetext`. (Planned as "SegmentedProgress"; renamed for
  what it measures.)
- Measurement (`@algorisys/zen-ui-core/measurement`): `judgeMeasurement`
  (pass / warn / fail with the side and deviation; inclusive limits with a
  floating-point allowance, one-sided specs, an optional warning band, no
  verdict for an inverted spec) and `measurementScale` (built from the limits,
  so a wild reading is pinned and flagged off-scale). `check:measurement`.
- MeasurementInput (Solid; other bindings to follow): an inspection reading
  checked against its limits as it is typed, in the user's locale. Verdict in
  words with an icon; spec line ("10.00 ± 0.10 mm", "At least 40 Nm"); a
  scale with the tolerance and warning bands, nominal and reading. Readings
  are never rounded to the spec's precision. Screen readers hear the verdict
  when the reading is committed (Enter / blur), not per keystroke. Indicator
  colours keep 3:1 (measured lowest 4.45:1 across five themes).
- Step runner (`@algorisys/zen-ui-core/step-runner`): `stepRunnerState`
  (current step, locked / open / done / skipped / issue per step, complete)
  and `canCompleteStep` (checklist all ticked; measurement entered and in
  tolerance unless allowed). Sequential by default, issues hold the line, only
  optional steps skip. `check:step-runner`.
- StepRunner (Solid; other bindings to follow): operator work instructions, a
  list of steps beside the current one. Checklists as 48px toggles,
  measurements through MeasurementInput, Complete / Skip / Report issue, and
  the reason written under the button when a step cannot complete yet. Done
  steps open for review. Controlled (`records` / `onRecordsChange`, so a run
  survives a reload) or not; `onStepComplete`, `onReportIssue`, `onComplete`.
  Announces the step it moves to, not every tick. `--zen-step-rail-width`.
- AnalyticChart: a `pareto` kind, built into core, so every binding draws it.
  Rows sort largest first (zero and blank last); bars in the series colour,
  with the vital few — the rows that together reach `threshold` (default
  0.8) — full strength and the rest faded; a cumulative line on its own
  0–100% axis with the threshold marked. Shares read with one decimal in the
  tooltip and table, so 79.7% is not shown as a threshold-reaching "80%".
  Selecting a bar or a table row reports the ORIGINAL row. `paretoRows` is
  exported. New optional spec field `threshold` and context field `locale`
  (percent labels in the chart's locale; the browser's when a binding does not
  pass it). Solid passes both; React, vanilla and web-components draw Pareto
  today with the default threshold and pick up `threshold` / `locale` in the
  port (vanilla's and React's spec-key lists need the field).
- Live state (`@algorisys/zen-ui-core/live`): `liveState` — offline (the app
  says the connection is down) over waiting (nothing yet) over stale (past
  `staleAfterMs` since the last successful update) over live. `check:live`.
- LiveIndicator (Solid; other bindings to follow): "Updated 12s ago" with a
  dot, turning to "Not updated for 3m 10s" and "Offline, last update 20s ago".
  The visible age ticks every second but is not a live region; a hidden one
  announces only state changes (measured: 23 visible changes, 2 announcements
  in 23 seconds).
- Shifts (`@algorisys/zen-ui-core/shifts`): `shiftAt` (which shift an
  instant is in, or the next / previous one from a gap), `shiftWindow`,
  `nextShift`, `previousShift`, `wallClockToInstant`, `plantDayOf`,
  `addPlantDays`. Wall-clock times in the plant's IANA zone; a night shift
  belongs to the day it starts; across daylight saving a shift keeps its
  wall-clock times and its length changes (Berlin's 24 Oct 2026 night shift
  is 9 hours). `check:shifts`, verified from three machine time zones.
- ShiftNavigator (Solid; other bindings to follow): previous / next / back to
  the current shift, labelled "Night · Thu, Nov 12 · 10:00 PM–06:00 AM" in the
  plant's zone, "Now" on the current one. Next stops at the current shift
  unless `allowFuture`. Step buttons follow density (40px, 48px touch).
- Planned vs actual (`@algorisys/zen-ui-core/planned-vs-actual`):
  `plannedVsActual` — plan and actual at now, the gap, ahead / on / behind
  within a tolerance (default 2% of the plan total), and a projection from
  the pace so far once 15% of the window has run; final after the end.
  `planAt` (cumulative plan, linear, 0 before its first point) and
  `readingAt` (a counter reading holds until the next — never interpolated
  forward). `check:planned-vs-actual`.
- PlannedVsActual (Solid; other bindings to follow): "256 pcs behind plan",
  what was made against what was planned so far, the projection, and a
  plain-SVG chart (no chart library): the plan dashed over the shift, the
  actual as steps up to now, the gap marked at now, a time axis in the
  plant's zone. `hideChart` for a tile.
- Rate buckets (`@algorisys/zen-ui-core/rate-bars`): `rateBuckets` — output
  per equal bucket from counter readings (a reading going down is a counter
  reset and counts from zero, not as negative output), per hour, the state
  that covered most of each bucket, the bucket containing now flagged partial
  with its rate over the elapsed part. `check:rate-bars`.
- RateBars (Solid; other bindings to follow): output bars coloured by machine
  state, every bar keeping a 3px stub so a bucket that made nothing still
  shows why, the filling bucket hatched, a dashed target line, and the rate
  now / average / target as text.
- Line ETA (`@algorisys/zen-ui-core/line-eta`): `lineEta` — an ETA only while
  running with a rate; done once good reaches the target; no time for a line
  that is stopped, in setup, idle or in a planned stop; unknown with no data.
  `check:line-eta`.
- LineCard (Solid; other bindings to follow): a line's name, StatePill, OEE,
  the order as a ProductionProgress, and a last line that answers "when will
  it finish?" — "Done by 11:00 AM" in the plant's zone, or what it is doing
  instead ("Fault for 23m: Hydraulic pressure low", "No data for 5m 12s").
  `href` makes the card a link through its name (stretched over the card), so
  the progress bar is not nested inside a button or link.
- Capacity (`@algorisys/zen-ui-core/capacity`): `capacityCell` / `capacityGrid`
  — load from booked and available hours; free / ok / high (from 85%) /
  over (strictly above 100%, with a floating-point allowance); work booked
  where there is no capacity is `no-capacity`, the worst case rather than a
  division by zero; no work and no capacity is `closed`. Totals sum hours,
  then divide. `check:capacity`.
- CapacityHeatmap (Solid; other bindings to follow): a real table, every cell
  printing its load and hours over a wash that deepens with load; over and
  no-capacity cells as alarms (error colours and a 2px outline), a count of
  them above the table, row / column / grand totals, and `onCellClick` for a
  drill-down. Measured label contrast over 300 labels in five themes: lowest
  4.79:1.
- Column mapping (`@algorisys/zen-ui-core/column-mapper`): `parseDelimited`
  (quotes, doubled quotes, newlines in quotes, BOM, CRLF), `detectDelimiter`
  (`,` `;` tab `|` — European exports use `;`), `autoMap` (exact match on a
  field's id, label or aliases, case / accents / punctuation ignored, never a
  fuzzy guess), `parseImportDate` (ISO or a full date in the locale's order —
  no "today" shortcuts in an import), `validateMapping` (unmapped required
  fields, fields mapped twice, and every bad cell with its row and column).
  `check:column-mapper`.
- ColumnMapper (Solid; other bindings to follow): each column with sample
  values, a "Maps to" select and its status; every problem in words above;
  a preview of the first rows with each cell that will not import marked and
  its reason given to screen readers. Numbers and dates read in the user's
  locale.
- Genealogy (`@algorisys/zen-ui-core/genealogy`): `traceGenealogy` —
  breadth-first both ways from a focus (upstream negative levels, downstream
  positive), each node once at its shortest distance, loops ending, nodes
  past `maxDepth` cut and counted per side, columns ordered by neighbours'
  positions so lines cross less. `check:genealogy`.
- GenealogyGraph (Solid; other bindings to follow): columns from "Made from"
  through the traced item to "Went into", cards joined by measured curves
  (following wrap, resize and direction changes), click any card to trace
  from it, and a cut trace that says so ("4 more further on"). Each card's
  accessible name says what it was made from and what it went into.
- Routing (`@algorisys/zen-ui-core/routing`): `routingLayout` (layers by
  longest path; the implicit chain in step order, flagged, when there are no
  links), `canAddLink` / `wouldCreateCycle` (refusing self-links, duplicates,
  unknown steps and loops), `effectiveLinks`, `startableSteps`. Loops and
  dangling links in stored data are left out of the layout, not drawn.
  `check:routing`.
- RoutingGraph (Solid; other bindings to follow): steps laid out left to right
  with arrowed links; a link that skips a column runs over the top in its own
  lane, never behind a card it does not touch. Read-only with step status, or
  editable: the selected step lists what it runs after (each removable) and
  a picker offers only steps that would not close a loop — the same by
  keyboard, screen reader or pointer. While the routing is the implicit
  chain, the first edit writes the chain out before applying itself.
- Production scheduling: placing work and lateness. `due` on an operation
  (core type, so every binding accepts it); `productionLateMs` (0 on time,
  null without a due date); `productionPlaceProposal` (placing a job not yet
  on the chart is a move of a job that did not exist — the same cascade and
  conflicts as a drag); `productionNextFreeStart`; `snapToMinutes`;
  `PRODUCTION_DRAG_TYPE`. `check:production-place`.
- ProductionSchedule (Solid; React and vanilla to follow): `onPlace` accepts
  work dragged in onto a leaf work centre, proposed like a reschedule and
  snapped to 15 minutes; the drop layer exists only when `onPlace` is given,
  so charts without it render the DOM they always did. Operations that end
  after their `due` carry an error-coloured end cap and say "Late by …" in
  the tooltip and accessible name. No internal undo: placements are
  proposals and undo stays the caller's (DECISION 2) — the demo keeps it.
- ScheduleBacklog (Solid; other bindings to follow): unscheduled jobs, overdue
  first, each draggable onto the chart AND placeable from a Place button
  (choose a work centre: after its last job) — the path for touch screens and
  keyboards, where drag and drop does not exist.

- RadioGroup: `label` and `description` props, in every binding (attributes on
  `<zen-radio-group>`). `label` becomes the group's accessible name through
  `aria-labelledby`, so a screen reader announces the question before the
  options; `description` is wired to `aria-describedby`. A caller's own
  `aria-labelledby` / `aria-describedby` are kept and ours appended. Without
  either prop the group renders exactly as before — the root stays the item
  container; with one, the root stacks heading, items and help text, and the
  items get their own container (which honours `orientation`).
- RadioGroupItem: `label` prop. Solid treats it as an alias for children. React,
  vanilla and web-components wrap the radio in a `<label>` with the text, so
  clicking the text selects it and the text names the radio — React previously
  dropped an item's children silently, so a hand-written `<label htmlFor>` was
  the only way. Vanilla reads it at creation (the item's `el` becomes the
  `<label>`).
- React: `RadioGroupProps` is exported.

### Fixed

- Sidebar: collapsing to the rail closed groups the app controls, in every
  binding. `SidebarMenuSub` shared one `open` between the inline list and the
  rail's flyout and closed it on collapse, which reached a controlled owner as
  `onOpenChange(false)` — an app that opens the group the current page lives
  in recorded a close the user never made, and the group came back shut. The
  flyout now has its own state: collapsing or expanding closes only the
  flyout, opening a flyout no longer reports an inline open, and
  `open` / `onOpenChange` describe only the inline expansion. An uncontrolled
  group open before collapsing is likewise still open after expanding.
  (Reported from one-erp, whose React and Solid fix this carries; vanilla —
  and web-components through it — fixed here.) New demo section in every
  binding: "Groups the app controls".

- `check:types` and `check:nav` failed in a fresh checkout (`tsc: command not
  found`, `Cannot find package 'typescript'`): the root scripts import
  `typescript`, but only the React and vanilla packages declared it, and it
  reached the root only by Bun's hoisting. The root now declares it.

- NativeSelect (Solid) showed its first option, whatever `value` said, when
  its options were rendered with `<For>`: spread props land before children
  are inserted, and a native `<select>` given a value it has no option for
  yet selects nothing. NativeSelect now applies `value` itself after render,
  on change, and whenever its options change. Verified by removing the
  `selected`-on-each-option workarounds from ColumnMapper, RoutingGraph and
  ScheduleBacklog: all three select correctly through plain `value`.

- Outlines that never drew, in every binding: DataTable's selected-row
  outline and keyboard-focus outline, SpreadsheetGrid's selected-cell
  outline, and MediaTimeline's focus ring. Each paired a bare `zen-outline`
  (UnoCSS: `outline-style: solid`) with a width such as `zen-outline-2`, and
  `cn()`'s tailwind-merge v3 — which follows Tailwind v4, where a bare
  `outline` is a WIDTH — read the two as conflicting widths and dropped
  `zen-outline`, leaving a width and a colour with no style. `cn()` now groups
  a bare `outline` as the style it generates. Measured: the selected row and
  cell draw a solid outline in Solid, React, vanilla and web-components.

- BoundRadioGroup: the field label was not connected to the group. It rendered
  `<label for={id}>`, but no element carried that id — the group is a `div`,
  which `for` cannot target anyway — so a screen reader announced the options
  with no question. The frame's label now takes an id and the group points at it
  with `aria-labelledby` (measured: group name "" → "Priority" in Solid and
  React; vanilla, which no demo mounts, measured directly: "" → "Tier").
- RadioGroup (React, vanilla, web-components): the selected dot rendered as a
  2×8px bar instead of an 8×8px dot. The radio is a `<button>`, whose default
  `1px 6px` padding left a 16px control 2px of content width. Solid draws its
  control on a `div` and was unaffected.
- `<zen-radio-group>` ignored its starting `value` / `default-value`: every
  radio came up unchecked, and every radio was its own tab stop, so Tab walked
  the options instead of entering the group once. A parent custom element
  connects before its children, so the group painted while its
  `<zen-radio-group-item>`s had not built their radios yet, and nothing painted
  again. Vanilla's RadioGroup now repaints (and re-applies group `disabled`)
  when radios appear inside it after a render. Measured on the demo: 7 of 7
  groups wrong before, 0 after; selecting, arrow keys and a later `value`
  change still work.

## [12.8.4] - 2026-11-09

### Fixed

- Sidebar: collapsing and expanding were choppy in every binding. Only the
  width animated while every row restyled on the first frame: icons jumped
  ~100px right and slid back (346px for a `SidebarMenuSub` row, which was
  remounted), the toggle moved out from under the pointer, labels vanished at
  once on collapse and drew over the page on expand, and group headings
  snapped 24px. Rows now keep their geometry — the icon is centred on the rail
  by padding that eases, labels truncate and fade, headings fold with an eased
  margin, the aside clips while it moves — so the measured per-frame icon step
  is 0.3px. The rail's end state is unchanged, and an expanded sidebar at rest
  lays out exactly as before: it clips and keeps rows to one line only while
  collapsed or moving (`data-transitioning`).
- Sidebar: the overlay slides in and out instead of appearing, and
  `SidebarMenuSub`'s inline list eases open and closed (it is still unmounted
  when closed). React's overlay no longer slides shut on page load.
- Sidebar: motion follows `--zen-duration-fast` (`--zen-sidebar-duration`,
  `--zen-sidebar-ease`: 200ms, linear, as shadcn), so `prefers-reduced-motion`
  now stops it; it was a hardcoded `duration-200`.
- Sidebar: clicking a collapsed `SidebarMenuSub`'s row while its flyout was
  open closed and reopened it. Solid: a controlled `SidebarMenuSub` closed its
  own flyout (the collapse effect tracked `props.open`).
- Core: `@algorisys/zen-ui-core/sidebar` (`afterTransition`,
  `afterWidthTransition`).
- Files: `packages/{solid,react}/src/components/sidebar/sidebar.tsx`,
  `packages/vanilla/src/components/sidebar/sidebar.ts` (web-components
  inherits it), `packages/core/{src/sidebar.ts,package.json,styles/tokens.css}`.

## [12.8.3] - 2026-11-09

### Fixed

- Solid: the published DOM and SSR builds are now hydratable, so a SolidStart
  app hydrates zen-ui components instead of failing with "Failed attempt to
  create new DOM elements during hydration". Only the DOM build changed: the
  SSR config already got `hydratable` from `solid({ ssr: true })`, and now says
  so explicitly.
- Solid: `exports` gains `worker` (server build), `browser` and `default`
  conditions, ordered `worker` before `browser` to match `solid-js` itself. A
  resolver that sets both (Cloudflare workerd, worker bundles) resolves
  `solid-js` to its server runtime, so zen-ui must too; the reverse order paired
  the DOM build with the server runtime.

## [12.8.2] - 2026-11-07

### Fixed
- **Solid DateInput: a closed form of date fields stayed in memory.** Every
  `DateInput` mounted a Kobalte Popover root, anchor, trigger and content, with
  the Calendar inside, whether or not the calendar was ever opened. The ERPNext
  port's leak check (open documents in tabs, close every tab, repeat) failed
  4 runs of 4 once its forms used DateInput: about 7 MB of a closed form held
  between close cycles (21.1, 23.9, 23.9, 31.0, 31.0, 23.9, 31.0 MB after each
  close), no detached DOM, so JS held through the per-field popover tree.
  The field is now plain markup (box, input, calendar button with
  aria-haspopup / aria-expanded); the Popover is mounted inside `<Show
  when={open()}>`, anchored to the field with Kobalte's `anchorRef`. With it,
  the same check passes over 10 cycles (after each close: 20.0, 19.5, 17.0,
  17.0, 17.0, 22.3, 17.0, 17.0, 20.5, 17.0 MB).
- Without a Kobalte trigger, the button and the dismiss rules are explicit: the
  button toggles; a pointer down inside the field is not "outside"
  (`onInteractOutside` prevented), so the calendar stays open while typing; a
  close from inside the calendar (a day picked, Esc) returns focus to the
  input, a click elsewhere leaves focus there. Driven in the ERPNext app:
  typed 15/3, opened (focus on the chosen day), picked (value set, focus back),
  Esc, button toggle, outside click; no page errors.


## [12.8.1] - 2026-11-06

### Fixed
- **Solid Combobox (async): typing did not open the list when the results
  arrived.** Kobalte decides open or shut on the keystroke, while the options
  are still the previous search's, often none; nothing reopened it when
  `onSearch` returned, so the user had to press the arrow. Found by the ERPNext
  port's end-to-end test (Country "Indi": the search returned India, the list
  stayed shut). In async mode the list now opens empty on the keystroke
  (`allowsEmptyCollection`), and the server's results are no longer filtered
  again by label text, which hid results the server matched by code or
  keyword. Results and the end of loading are set in one `batch`, so the
  filter never sees new results while still "loading". A rejected `onSearch`
  now empties the list (it was an unhandled rejection that kept the old one).
  Sync mode is unchanged. Solid's MultiCombobox has no `onSearch`.

### Changed
- **Async Combobox / MultiCombobox behave the same in every binding.** Measured
  side by side (zzz → Sv → Vu → keyword → reject, against one test server)
  they disagreed in three places; all now match Solid's fixed behaviour:
  - *Searching from the keystroke.* React and vanilla showed the loading row
    only when the debounce fired, so for the first ~250ms an empty list read
    "No results". The row now shows at once, and "No results" is held back
    while a search is in flight (React's `CommandEmpty` too).
  - *The stale list is narrowed while loading.* The previous query's results
    were shown unfiltered until the response came; they are now narrowed by
    the binding's own sync matcher (label + keywords; vanilla MultiCombobox
    also value), and drawn exactly as returned once the response lands.
  - *One label.* Solid's loading row said "Loading…" (`combobox.loading`);
    every binding now says "Searching…" (`combobox.searching`).
  - Vanilla: closing the list mid-search left `asyncLoading` stuck true (the
    aborted search never reached its `finally`); it is reset on close.

### Docs
- **CLAUDE.md "Ship it"**: `main` takes `--no-ff` (it has merge commits, so
  `--ff-only` was always refused); push one ref at a time and check
  `ls-remote`; the dist-pkg tarballs and the npm-package-react branch are
  steps in the procedure rather than a memory.

## [12.8.0] - 2026-11-06

### Added
- **DataTable `respectColumnSizes`**, all four bindings (`respect-column-sizes`,
  a json attribute, on `<zen-data-table>`). Each column with a `size`, a
  resized width, or a pin gets that width as its header's `min-width`, and the
  root `min-w-0` so the table scrolls inside a flex parent instead of growing
  it. Rule in core/columns (`respectsColumnSizes`, `columnMinWidth`; 11 new
  cases in check:columns, 47 total).

### Fixed
- **DataTable: sized columns were squeezed in tables with pinning or
  resizing.** Automatic table layout treats `width` as a hint, so at 1100px
  React's pinning demo drew Name at 86 of its 180px and never scrolled, which
  left pinning nothing to do; a column resized wider than the room left was
  squeezed back. `respectColumnSizes` defaults on with `enableColumnPinning` or
  `enableColumnResizing`, so those tables now keep their sizes and scroll
  sideways (measured in all four bindings: exact widths, both pinned edges at
  0 after scrolling, page width unchanged). Tables with neither are unchanged
  (the squeezed-column list for every demo table is identical before and
  after).

## [12.7.0] - 2026-11-06

### Added
- **Vanilla / web-components DataTable: column management** (phase 1 of
  docs/vanilla-data-table.md). `enableColumnVisibility` (a Columns menu with
  Reset columns), `enableColumnOrdering` (drag a header; Alt+ArrowUp /
  Alt+ArrowDown on a column in the menu), `enableColumnResizing` (a focusable
  `role="separator"`: drag it or arrow keys, 16px / Shift 64px),
  `enableColumnPinning` + `columnPinning` / `initialColumnPinning` (sticky
  columns, the selection column sticking with them), `persistKey` (the same
  `zen-dt:` entry React and Solid write: a saved layout reads across bindings),
  controlled `columnVisibility` and the `on…Change` callbacks; columns take
  `enableHiding`, `enableResizing`, `minSize`, `maxSize`. On
  `<zen-data-table>`: `enable-column-*` and `persist-key` attributes,
  `zen-column-visibility-change` / `-order-change` / `-pinning-change` events.
  Pure layout in core (`columnLayout`, `orderedColumnIds`; check:columns 36).
  Driven in a browser by keyboard and pointer in both bindings with the probe
  React and Solid passed; the saved entry measured byte-identical.
  check:props: 11 DataTable gaps closed (33 known remain, 16 DataTable).
  With pinning, the vanilla Columns menu gives each column a submenu (Show
  column; Not pinned / Pin to left / Pin to right), all reachable by keyboard.
- **Vanilla / web-components DataTable: per-column filters and server-side
  filtering and sorting** (phase 2). `enablePerColumnFilters` with
  `meta.filterVariant` (text and number with operators, numberRange, select,
  boolean) and `meta.filterOptions`; active filters as removable chips with
  Clear all (the search term too, as React shows it); `enableFilterOperators`
  (off: text filters are bare strings); controlled `columnFilters` +
  `onColumnFiltersChange`; `manualFiltering` / `manualSorting`. On
  `<zen-data-table>`: `enable-per-column-filters`, `enable-filter-operators`,
  `manual-filtering`, `manual-sorting`, `zen-column-filters-change`. The
  matching lives in core/column-filter (check:column-filter, 35), measured
  identical to React's TanStack FilterFns over 570 value/filter/variant
  combinations. Filter inputs are kept across repaints so typing keeps focus,
  caret and IME composition. The filter types (FilterVariant, TextOp, …) are
  exported, as from React and Solid. check:props: 6 more closed.
- **Vanilla / web-components DataTable: expandable rows** (phase 3).
  `renderSubRow` (a chevron column; the open row shows a full-width detail
  row), controlled `expanded` + `onExpandedChange`; on `<zen-data-table>` the
  `renderSubRow` / `expanded` properties and `zen-expanded-change`. In row
  virtualization an open row and its detail are one measured item.
  check:props: 3 more closed (10 known remain in DataTable).
- **Vanilla / web-components DataTable: row grouping** (phase 4).
  `enableGrouping`, controlled `grouping` / `initialGrouping` +
  `onGroupingChange`; a "Group by" / "Group by (N)" menu; group rows
  "value (N)" that expand and collapse (by keyboard too), subtotals from
  `meta.aggregate`, nesting by several columns, grouped columns leading, and
  pages that count group rows (TanStack's semantics, measured on React's demo:
  the subtotals match it). Columns opt out with `enableGrouping: false`. On
  `<zen-data-table>`: `enable-grouping`, `grouping` / `initialGrouping`,
  `zen-grouping-change`. check:props: 4 more closed.
- **Vanilla / web-components DataTable: client export and bulk actions**
  (phase 5, the last). `enableExport` (CSV / JSON of the filtered rows in data
  order, React's formats), `exportOnlySelected`, `renderBulkActions` (count,
  "Select all N matching" after a whole page is selected, your actions,
  clear). With it vanilla's DataTable has every prop React's and Solid's have:
  check:props lists 0 DataTable gaps (27 at the start).
- **`check:props`**: prop parity across bindings (see 12.6.0's follow-up);
  in `bun run check`.
- Vanilla DropdownMenu checkbox items take `id`, `onKeyDown` and
  `keyshortcuts` (what the Columns menu's Alt+Arrow reorder needs).

### Fixed
- **Vanilla Select and NumberField: an `aria-label` named nothing.** Both put
  `aria-*` on their wrapper `div`, so the combobox / number input itself was
  announced unnamed (React and Solid put it on the control). They go on the
  control now; Select also stops leaking `value` / `onValueChange` onto the
  wrapper as attributes, and keeps a caller's `aria-describedby` alongside its
  error message. Found by the per-column filter probe.

## [12.6.0] - 2026-11-05

### Added
- **DataTable `toolbarPlacement: "top" | "pagination"`** (every binding;
  `toolbar-placement` on `<zen-data-table>`). `"pagination"` moves the
  toolbar's menu buttons (Export, Group by, Columns; vanilla has Export only)
  into the pager row, at the start of its right-hand cluster, so a toolbar of
  one button does not spend a row (about 50px of list height). The search box
  stays above the table; without a pager the buttons stay on top. Default
  `"top"`: no existing table moves (measured: the demos' default toolbars
  are all still above their tables). Vanilla's pager now keeps its info,
  menu slot and controls as persistent elements, so the Export button is not
  detached by the repaint every sync does. ERPNext gaps doc, item 18.

### Fixed
- **DataTable's sortable header labels ignored the head text tokens**
  (`--zen-table-head-text-transform`, `--zen-table-head-letter-spacing`;
  every binding, without the opt-in preflight). The label is a `<button>`, and
  the browser's own stylesheet resets both properties on buttons; it inherits
  them now. Measured with the tokens set to uppercase / 0.04em: 51 / 53 / 25 /
  25 sort labels were `none` / `normal`, now 0; plain-text headers were never
  affected. With the tokens at their defaults nothing changes. Item 13.

## [12.5.0] - 2026-11-05

### Added
- **DataTable `meta.label`** (React, Solid): a column's plain-text name, for
  when `header` is a function (a span that right-aligns a figure column, an
  icon). The Columns menu, the sort button's and resize handle's accessible
  names, filter labels and CSV / server-export headers all used to fall back
  to the column id ("posting_date"); they read `meta.label`, then a string
  header, then the id. One `columnLabel()` in core
  (`@algorisys/zen-ui-core/columns`) replaces four per-binding copies.
  Vanilla / web components take a string `header` only, which is already the
  name. Asked for by the ERPNext port (its gaps doc, item 15).
- **DataTable "Reset columns"** (React, Solid) at the foot of the Columns
  menu: order, widths, visibility and pinning back to the table's defaults
  (`initialColumnPinning` for pinning), through the table's setters so
  controlled props hear it and a `persistKey` entry is rewritten. Item 16.
- **DataTable column resize and reorder from the keyboard** (React, Solid;
  item 17). The resize handle, in the table and the virtualized grid, is a
  focusable `role="separator"` with `aria-valuenow` (the width); ArrowLeft /
  ArrowRight resize by 16px, Shift by 64px, mirrored in RTL. It was a button
  with pointer handlers only. With `enableColumnOrdering`, Alt+ArrowUp /
  Alt+ArrowDown on a column's item in the Columns menu moves it, focus staying
  on it (`aria-keyshortcuts`, and a hint line in the menu). Buttons in the
  menu rows were tried first and measured unreachable: a menu moves focus
  between items with the arrows and Tab never reaches a button inside one.
  The menu now lists columns in the table's current order, not definition
  order. Pure halves in core (`moveColumn`, `columnResizeDelta`,
  `clampColumnSize`), `check:columns` (26).

### Fixed
- **Solid: opening or arrowing through a dropdown menu from the keyboard froze
  the page.** Every Solid DropdownMenu, DataTable's Columns / Export /
  Group-by menus included: Enter, Space or ArrowDown on the trigger hung the
  tab for good; a click worked. Kobalte's `scrollIntoViewport`
  (`@kobalte/utils` 0.9.2, the latest) walks scroll parents while a modal
  menu has locked page scroll, and `getScrollParent(x)` returns `x` itself
  when it scrolls, so on reaching a scrollable ancestor it looped forever.
  Patched with `bun patch` (`patches/@kobalte%2Futils@0.9.2.patch`): the walk
  continues from the parent's parent. Kobalte is bundled into the Solid
  `dist`, so the fix ships. Found by a debugger pause on the hung page; Select
  was unaffected (measured on the live 12.4.0 site). Upstream not yet
  reported.

## [12.4.0] - 2026-11-05

### Added
- **AnalyticChart** (every binding; `<zen-analytic-chart>` in web components):
  interactive business charts drawn by ECharts, an optional peer loaded on the
  first chart, so an app that never charts pays nothing. Twelve built-in kinds
  (bar, line, area, combo with a second axis, pie, donut, waterfall, funnel,
  gauge, heatmap, scatter, treemap); a kind is a registry entry, so an app adds
  its own with `registerChartKind` (the demos register a radar). Click a mark
  for `onSelect` (`zen-select`): drill-down and filtering are the caller's
  state. A Chart / Table switch, PNG and CSV download; the table is the
  keyboard and screen-reader path, its first cell a button that selects what a
  click on the mark does. Without echarts it shows the table and a one-line
  note instead of throwing. Everything but the drawing lives in
  `@algorisys/zen-ui-core/analytic-chart`; the ECharts controller in
  `…/analytic-chart-echarts`. `check:analytic-chart` (97 assertions) is in
  `bun run check`. Built Solid first, then React, vanilla, web components;
  each driven in a browser with one probe: all 12 charts draw, click and
  keyboard select, CSV / PNG, filter, drill-down, light / dark, RTL, the
  missing-peer fallback, no page errors. Bundle budgets unchanged (one Button
  17–18 kB); no echarts code in any `dist`; a strict consumer of the react and
  web-components tarballs, echarts NOT installed, gets 0 type errors.
- **`--zen-chart-1…8`**: a categorical series palette, one light set for every
  light theme and stepped values in `dark`, validated for colour-blind
  separation on each theme's surface (adjacent CVD ΔE ≥ 8.4, normal ≥ 19.3).
  AnalyticChart's default palette; it used to be built from the semantic
  tokens, which painted plain categories danger-red. Optional
  `--zen-chart-positive` / `--zen-chart-negative` override a waterfall's
  up / down steps (default: success / error).

### Fixed
- **web components: clearing a callback property did nothing.** An element
  passed a callback to its factory when the event had a listener OR the
  property was in its bag, and `el.onBack = undefined` leaves the key there,
  so an affordance a callback gates (PageHeader's back button, a chart's
  clickable marks) could never be taken away again. An assigned `undefined`
  now counts as unset. Found porting AnalyticChart's drill-down, whose
  quarter bars kept a pointer cursor; `visual-check` over all 118 WC routes
  shows no runtime errors.
- **Solid: `build:lib` left stale server chunks in `dist/server`**, which
  `files: ["dist"]` would publish. The server build only started emitting
  hashed chunks with AnalyticChart's dynamic import; `build:lib` now clears
  `dist/server` as it already cleared `dist/assets`.
- **ObjectPageLayout: an absolutely placed child escaped the scroll area**
  (every binding; reported from ERPNext). The scroller had `overflow-y: auto`
  but no position, so an absolutely placed descendant with no positioned
  ancestor in between, such as a visually-hidden native control, took its
  containing block from outside the page: overflow neither clipped nor
  scrolled it, and in a shell without a scroll container of its own it
  stretched the page. The scroller is `position: relative` now. Measured in
  each demo with a hidden checkbox in the last section: it scrolls with the
  content and is clipped (was: fixed outside the scroller), and of the 6 / 6 /
  18 / 18 absolutely placed elements already in the demo object pages, none
  visible changes anchor; anchor jumps land as before.

## [12.3.0] - 2026-11-05

### Added
- **The New / Updated marks are in every demo**, not only Solid's: React,
  vanilla and web components read `since` / `updated` from their own `nav.ts`
  and mark the sidebar and the catalogue the same way. Set from git, not by
  hand: the 12 routes each binding gained since v12.2.0 are New, and the 19
  existing ones whose components took the ported features are Updated (React's
  Input and Select under their own paths). Measured in each built demo: 12 New
  and 19 Updated in both the sidebar and the catalogue, no page errors. Solid's
  StatCard is Updated for 12.3.0, which carries its height fix.
- **Parity: 12.2.0's Solid-only work is in React, vanilla and web components.**
  `check:parity` is green across all four bindings for the first time since
  12.1. Each port was driven in a browser against the same scripts that
  verified the Solid original (tracker and numbers: docs/parity-pass.md).
  - **LocaleProvider / useLocale** in React and vanilla (web components
    re-export vanilla's). Vanilla's takes `children` as a FUNCTION and runs it
    as the current locale, so factories read it with `useLocale()` when called,
    as React and Solid components read context; `localeOf(node)` for words
    rendered after mount.
  - **New components** in React, vanilla and web components: AmountField,
    QuantityField, Shortcuts (Kbd, ShortcutProvider, useShortcut, ShortcutHelp;
    web components: `<zen-kbd>`, `<zen-shortcut>`, `<zen-shortcut-help>` over
    one document registry), ContextMenu (vanilla / web components data-driven,
    like their DropdownMenu), DocumentTabs, Tile and TileGrid, QRCode and
    Barcode, DateInput, TreeSelect, LookupField, FilterBuilder, ViewManager.
  - **Additions to existing components**, everywhere: ObjectNumber
    `number` / `currency` / `precision` / `locale`; DatePicker `initialFocus`;
    the Calendar's arrow keys (vanilla's had none; React's did not mirror in a
    right-to-left page); Sidebar `collapseMode`, `overlay`, `SidebarMenuBadge`,
    `SidebarHeaderLabel`, `SidebarMenuSub badge`; ShellBar `search`;
    SegmentedButton item `count`; StatCard `size="lg"` and `chart`;
    MicroBarChart `baseline`; ObjectStatus `stamp`; Combobox / Select
    `invalid`; the table, ObjectPage section-title and warning-text tokens;
    DropdownMenu radio (and vanilla checkbox) items `closeOnSelect`, default
    unchanged in each binding.
  - **DataTable** in React: keyboard rows, cell navigation, row virtualization
    with row drag, totals, server export (the ExportRequest is byte-identical
    across Solid, React, vanilla and web components for the same table state)
    and `contextMenu`. In vanilla and web components: inline editing,
    keyboard rows, cell navigation with copy and paste, row virtualization,
    totals, server export and `contextMenu`. Still missing there (pre-existing,
    todo.md): grouping, per-column filters, expandable rows. Corrected after
    release: the 12.3.0 notes first said cell navigation and virtualization
    were still to come in vanilla.
  - **Every built-in word is translatable in every binding.** React's and
    vanilla's components now take their words from the message catalogue as
    Solid's do (Solid 135, React 139, vanilla 128 components; nothing exempt),
    including words built in helpers and data tables (colour and Likert names,
    DataTable's operators, the scheduling labels, relative times). Web
    components gain `<zen-locale-provider locale currency>` with a `messages`
    property; the elements inside build in its words and rebuild when they
    change. `bun run check` runs `check:strings` for all three, and the check
    now reads the shapes it used to miss (it finds 250 such strings on the
    previous tree). English output is unchanged: every route snapshot and
    every opened popover identical in each binding.
  - React's DropdownMenu and ContextMenu share their item classes
    (`menu-parts.tsx`); vanilla's share their drawing code (`menu-engine.ts`).
    DropdownMenu output measured identical in both.

### Changed
- **Visible on existing pages, by design** (each is Solid's 12.2.0 behaviour
  reaching the other bindings):
  - React and vanilla: an Input (and React's SelectTrigger) that already has
    `aria-invalid="true"` now draws the error border, as an explicit
    `invalid` does. Forms that mark errors that way (React BoundFields,
    `FormControl`) show it when a field is in error.
  - React and vanilla Sidebar: a non-active menu button takes the theme's
    foreground colour; without the opt-in preflight a `<button>` row used the
    browser's button colour. Measured unchanged in the demos.

### Fixed
- **`bun run dev:all` died at start with ENOSPC.** Its router is a Vite server
  rooted at the repo, so it watched every file in it, `.claude/worktrees`
  included, for a server that only proxies. With the parity pass's 32 agent
  worktrees on disk the machine's 65536 inotify watchers ran out, chokidar's
  error went unhandled, and the hub exited. The router now watches nothing
  (`server.watch: null`); the children still watch their own packages. Driven
  after the fix: all five apps render through :5170, no page errors.
- **Built-in strings in 18 places were still hard-coded after 12.2.0's "every string
  can be translated"** (Solid), which overstated it: `check:strings` could
  not see words inside an attribute EXPRESSION (`aria-label={open ? "Collapse
  row" : "Expand row"}`, a template after `??`), lowercase JSX text (", unsaved
  changes" in a screen-reader span), or `fallback=`. Found by the React
  DocumentTabs port. The check now sees all four (ignoring code inside `${…}`
  and catalogue keys being built), and the strings are in the catalogue:
  Carousel's arrows, DataTable's expand / collapse and column pin titles,
  DiffView's "not set", FileUpload's "or drag and drop", Gantt's and
  ProductionSchedule's expand / collapse, Link's "(opens in a new tab)",
  MediaTimeline's range position, Proctor's video labels and flag count, Map's
  "Loading map…", and DocumentTabs' pin / unpin, unsaved marker and all-tabs
  count. Two developer install notices (Map, RichText) are marked
  `i18n-ignore-next-line`. English unchanged: all 120 Solid demo routes
  snapshot identical before and after.
- **React: the inline select editor never saved a pick** (Radix reported it
  after the close had cancelled the edit), **a per-column filter on a column
  without `filterVariant` matched nothing**, the number editor opened without
  focus, a lone sorted column showed a 16px "1", and a group row opened
  `renderSubRow`. Found and fixed by the DataTable port.
- **React: MultiCombobox showed raw values as chips** ("engineer", and
  "Remove engineer" to a screen reader) on first paint, until something else
  re-rendered it.
- **React: the Calendar's ← → were not mirrored in a right-to-left page**
  unless `dir` was passed to it.
- **React and vanilla: lists without the opt-in preflight** (Breadcrumb,
  Stepper, FileUpload showed browser markers and indents), a linked StatCard
  was underlined, the Sidebar header's text spilled out of the collapsed rail,
  and a menu button rendered as a link was link-blue and underlined.
- **Vanilla: a Select ignored every pick after its first close** (opening and
  rendering shared one cleanup list), and reopening during the close
  animation hid the list again.
- **Vanilla DataTable: a repaint dropped keyboard focus and scrolled a
  scrolled table back to its first row**; its sort-priority number was 16px
  beside 12px header text.
- **Web components: nested elements rendered empty** (`<zen-alert-title>`,
  `<zen-avatar-fallback>` and others on /alert, /avatar, /code-editor, /theme):
  an element re-connected by the one around it dropped its children. It keeps
  the children it captured first.
- **Vanilla (and web components) leaked document listeners on every opening
  after the first** of Combobox, TreeSelect and every other component that
  reuses a cleanup list per opening (about 25): `Disposer.dispose()` latched
  "done" after its first call, so cleanups added later never ran. Measured
  on Combobox: 2 more document listeners per open/close cycle (8 after five);
  now 0. `Disposer` is reusable (it takes its list, then runs it; a second or
  re-entrant call is a no-op). All 116 vanilla demo routes snapshot identical
  before and after. Present since 7.0.0; found by the LookupField port.
- **StatCard figures were drawn 32px tall instead of 24px in 12.2.0** (Solid;
  `size="lg"` 40px instead of 36px). Adding `size` put the font-size class
  after `zen-leading-none`, and `cn()` resolves a later font-size as also
  setting line-height, so the leading was dropped: every existing StatCard
  grew 8px taller. The size class comes first again; measured on the demo: 17
  figures back to 24px / 24px, one `lg` at 36px. Found by the React port of
  the same feature.
- **`scripts/visual-check.mjs` could report on another session's build**: its
  fixed ports were held by other previews, `--strictPort` made its own server
  exit quietly, and the health check got an answer from theirs. It takes a
  free port and checks its own server is alive, and stops the whole process
  group (it used to leave vite running). `scripts/snapshot-routes.mjs` read
  only Solid's nav and found zero routes in the other bindings; it reads all
  four and fails on zero.
- **`build:lib` vendored no core declarations in a checkout under a dotted
  path** (`scripts/vendor-core-types.mjs` treated "no dot in the path" as "a
  directory"), so every binding's build failed its own assertion there.

## [12.2.0] - 2026-11-04

### Added
- **Calendar: arrow keys between days** (Solid). ← → a day (mirrored right
  to left), ↑ ↓ a week, Home / End the week's ends, PageUp / PageDown a month
  (Shift: a year); crossing the visible months turns the page. These keys did
  nothing before.
- **DatePicker `initialFocus="selected"`** (Solid): opens on the chosen day
  (else today) instead of "Previous month". Opt-in; the default is unchanged.
- **`--zen-color-warning-text`**: warning text (ObjectStatus, ObjectNumber,
  Countdown, StatCard's trend) reads it, falling back to the warning colour, so
  nothing changes unless you set it. The plain warning colour is 1.77:1 on
  white; `:root { --zen-color-warning-text: var(--zen-color-warning-soft-fg); }`
  makes it 5.23:1.
- **Combobox takes `id` and `aria-label`** (Solid), on its input, so
  `<label for>` names and focuses it.
- `scripts/snapshot-routes.mjs` and `scripts/compare-route-snapshots.mjs`: the
  "nothing else moved" check for sweeping changes (see CLAUDE.md).
- **Server-side export: DataTable `onExport`** (Solid). For data too large to
  be in the browser: the Export menu (Excel, PDF, CSV; "only the n selected
  rows" when there is a selection) hands the app an `ExportRequest`, a few KB
  describing exactly what the user sees: the visible columns in order with
  header, width, alignment, format (`meta.exportFormat`) and total; the
  search, per-column filters, sort and grouping; the locale; every matching
  row, or the selected ids (including rows on pages the browser no longer
  holds); plus `exportContext` (a FilterBuilder tree, a view id). The app's
  server queries the full data and returns the file: a Blob is downloaded, a
  `{ url }` followed, a rejected Promise shown as the reason, with a busy
  state meanwhile. zen-ui runs nothing on the server. Without `onExport`, the
  client-side CSV / JSON export is unchanged. Core's new
  `@algorisys/zen-ui-core/export-request` (`buildExportRequest`, and
  `parseExportRequest` for JavaScript servers: validates, never throws), checked
  by `bun run check:export-request`. Integration guide, with a Frappe sketch:
  docs/server-export.md. Demo: DataTable section 26, a 100,000-row ledger behind
  a mock server.
- **Grid totals: `meta.aggregate` on a DataTable column** (Solid). `"sum"`,
  `"count"`, `"avg"`, `"min"`, `"max"` or a function, per column: DataTable
  fills the footer (a "Total" label in the first visible column without one),
  keeps it in view at the bottom while the rows scroll (fillHeight /
  stickyHeader), and shows each group's subtotal from the same declaration
  when grouped. Totals cover every row the filters let through across pages,
  or the page with `totalsOver="page"`; group header rows are never added in
  twice. Sums are exact in decimal (on generated money columns a plain double
  sum was wrong 332 times in 400). Formatted at the column's own decimal
  places in the locale; `meta.formatTotal` to show it your way. A column's own
  `footer`, `aggregationFn` and `aggregatedCell` are left alone, and a table
  with a hand-written footer and no `meta.aggregate` renders as before. Core's
  new `@algorisys/zen-ui-core/aggregate`, checked by `bun run check:aggregate`
  (3224 assertions, against an exact-integer oracle). Demo: DataTable section 25.
- **Every built-in string can be translated (B1, batch 1 of 3)** (Solid).
  One catalogue, `@algorisys/zen-ui-core/messages`, English by default;
  `LocaleProvider messages={…}` translates any subset of it, the rest stays
  English, and a nested provider inherits what it leaves out. Plural forms
  follow each language's own rules (ICU-style `{count, plural, one {…} other
  {…}}`, decided by Intl.PluralRules: Hindi counts 0 as "one", Arabic has six
  forms). A component's own label props still win. This batch covers the form
  controls and dialogs: Dialog, Combobox, MultiCombobox, Calendar, DatePicker,
  DateInput, DateRangePicker, DateTimePicker, TimePicker (its AM/PM too),
  NumberField, PasswordInput, PhoneInput, Search, TagInput, AmountField,
  QuantityField, LookupField, TreeSelect, FilterBar, SelectList, SelectDialog,
  ValueHelp (its operator names too), ViewSettingsDialog, FilterBuilder and
  ViewManager. A demo page, Localization, shows a partial Hindi translation.
- **Every built-in string can be translated: batches 2 and 3 of 3** (Solid).
  Batch 2: the tables and data (DataTable incl. its export menu and totals,
  UrlDataTable, TreeTable, Pagination, Pivot, SpreadsheetGrid, Chart,
  MicroChart). Batch 3: every remaining component, 135 in all, so
  `check:strings` now has no exemptions. Composite labels are whole messages
  ("Range {n} start", "{label}, step {n} of {count}, {status}"), never English
  glued to a translated word. Words CORE generates translate too:
  `formatDateRangeValue`, `operatorLabel` and `describeFilter` take an optional
  message lookup (`t`) and build every phrase by catalogue key
  (`dateRange.*`, `filter.*`); Barcode/QR errors carry a `code` and `values`
  (`barcode.error.*`). All additive: called as before they return the same
  English, and `check:messages` asserts the catalogue path reads identically
  for every date-range operator (166 values), every filter operator and each
  summary shape, and every barcode error. Route snapshots: 120 of 120 routes
  identical before and after.
- `bun run check:strings` fails on a hard-coded user-visible string in any
  swept component, and in any NEW component (components still to sweep are
  listed, and the list only shrinks). `bun run check:messages` checks the
  catalogue (placeholders, plurals in en / hi / ar, well-formed entries).
- **AmountField and QuantityField** (Solid; new): amounts and quantities as
  clerks type and read them. Raw digits while editing, formatted at rest in the
  locale's grouping (1,25,000.00 in India, 1.250,00 in Germany, Arabic-Indic
  digits in Egypt), an amount at its currency's own precision (INR 2, JPY 0,
  KWD 3) with the symbol where the locale puts it, a quantity with its unit.
  Typed 1,25,000, 125000, 2.5L, 1.2Cr or 15k all read; text that is not one
  number in the locale, or is out of range (or negative, unless
  allowNegative), is kept and marked aria-invalid, never quietly changed. Esc
  undoes the typing. Rounding is half away from zero in decimal (1.005 is
  1.01).
- **LocaleProvider / useLocale** (Solid; new): the locale and default currency
  zen-ui formats with, set once (nestable). Optional: without it nothing
  changes. The built-in strings will come from it next (review B1).
- **ObjectNumber formats a number it's given** (Solid): `number`, `currency`,
  `precision`, `locale`. `value` is still shown as given and wins when present,
  so existing uses render exactly as before (measured: every demo route
  snapshots identical).
- Core's new `@algorisys/zen-ui-core/number-format`: formatNumber,
  formatAmount (accounting negatives, symbol / code / name / none),
  formatQuantity, formatPercent (takes 18, not 0.18), parseNumber (strict:
  ambiguous text is "invalid", never a guess), currencyPrecision, roundTo.
  Checked by `bun run check:number-format`: 38145 assertions, 38080 of them
  format→parse round trips across 14 locales.
- **ViewManager** (Solid; new): saved views beside the page title ("My
  overdue invoices, this quarter, these columns"). Pick, Save, Save as (a free
  name offered; blank and duplicate names refused as a person reads them, case
  and spacing ignored), open the screen with a view by default, Manage (rename,
  delete in two presses, choose the default), and Copy link. The state is one
  object of the app's choosing (a FilterBuilder value, sort, columns); the
  picker never looks inside it, and marks the view Modified the moment the
  screen drifts from it (key order is not a change). Storage is the app's:
  every change is a callback, which may return a Promise; a dialog waits and
  shows the error rather than closing on a save that failed. Views marked
  readOnly (shared by a colleague) can be used and copied, not saved over.
  The pure half is core's new `@algorisys/zen-ui-core/views`: `encodeView` /
  `decodeView` for links (UTF-8, URL-safe; anything else decodes to null,
  never throws), name rules, one default at most. Checked by
  `bun run check:views` (1438 assertions).
- **DropdownMenuRadioItem takes `closeOnSelect`** (Solid). Default unchanged
  (stays open: a setting to flip and look at); a picker passes it.
- **FilterBuilder** (Solid; new): nested AND/OR conditions on any field, edited
  as a tree and held as one plain object, for advanced list filters, report
  criteria and saved views. A field's type picks its operators and editor
  (text, number, a typed date with a calendar, a list of choices, yes/no);
  each group's Match covers all, any, none and not all, so NOT is never a
  checkbox to miss. Unfinished conditions filter nothing; a summary in words
  says what the filter does now. Focus follows edits (a new condition's field,
  the next row after a removal). The pure half is core's new
  `@algorisys/zen-ui-core/filter`: `filterPredicate`, `describeFilter`, the
  edit functions, and `loadFilter`, which reads a saved filter against today's
  fields and names what it had to drop (a removed field, a retired option)
  instead of failing. Operator names are DataTable's. Checked by
  `bun run check:filter` (5826 assertions).
- **Select and MultiCombobox take `aria-label`** (Solid), landing on the
  control that takes focus. Select's used to fall through to Kobalte's root
  div, where it named nothing.
- **QRCode and Barcode** (Solid; new): codes drawn as SVG for screens and
  print. `QRCode`: versions 1–40, error correction L/M/Q/H, numeric /
  alphanumeric / byte (UTF-8) modes, `minVersion` for a fixed printed size;
  sized for the e-invoice's signed QR. `Barcode`: Code 128 (any ASCII, digit
  runs packed in pairs), EAN-13 (the check digit added, or a wrong one refused
  naming the right one) and Code 39. Dark on light in every theme (new
  `--zen-code-dark` / `--zen-code-light` tokens, black and white), quiet zone
  included; a value that cannot be encoded shows why in place of the code. The
  pure half is core's new `@algorisys/zen-ui-core/barcode`, checked by
  `bun run check:barcode` (627 assertions): every symbol is found and decoded
  by zxing-cpp (zxing-wasm, a devDependency of the check only), every QR version
  at every level at its exact capacity edge, all eight masks, and the format
  and version words against the standard's tables. The QR grids were also
  measured bit-identical to the `qrcode` package's for the same mask (203 of
  203).
- **LookupField** (Solid; new): pick a row from a table of choices (an item,
  a customer, an account) seeing several facts at once. Columns with headers,
  laid out as one grid (the header and rows are subgrids), so each column is as
  wide as its widest cell and lines up on every row; the table is at least the
  field and `--zen-lookup-list-width` wide, at most `--zen-lookup-list-max-width`.
  Type any part of any searchable column, words in any order; the likeliest row
  first (the code as typed, a code starting with it, words starting columns,
  then anywhere), accents and case ignored, matches drawn bold. `onSearch` takes
  the rows from a server instead: debounced, the stale request aborted,
  "Searching…" and the result count announced. The chosen row comes back whole.
  The field never holds text that is not a row. Keys: ↓ ↑ PageUp PageDown,
  Enter picks, Tab picks the active row after a search, Esc closes then undoes,
  F4 calls `onValueHelp` with what was typed (for ValueHelp). The pure half is
  core's new `@algorisys/zen-ui-core/lookup`, checked by `bun run check:lookup`
  (6344 assertions, against an independent brute force).
- **DateInput** (Solid; new): a date you type, the way clerks enter them,
  with the calendar as a second way in. Read in the locale's order (day first
  for en-IN, month first for en-US, or `order`): `15/03/2026`, `15-3-26`,
  `150326`, `1503` (this year), `15` (this month), ISO `2026-03-15` in any
  locale, and the shortcuts `t`, `y`, `+7`, `-1`, `+2w`, `+1m`, `+1y`. Enter or
  Tab reads it; ↑ ↓ move a day (Shift: a month); Alt+↓ opens the calendar on
  the chosen day; Esc undoes what was typed. A date that does not exist
  (31/02), or one outside `min` / `max` / `isDateDisabled`, is kept as typed
  and marked aria-invalid (`onInvalidInput` hears it), never rolled over into
  March. Width is the new `--zen-date-input-width` token. DatePicker is
  unchanged. The pure half is core's new `@algorisys/zen-ui-core/date-input`,
  checked by `bun run check:date-input` (5907 assertions; fails 11 when broken
  on purpose).
- **PopoverContent** (Solid): its type now names `onOpenAutoFocus` and
  `onCloseAutoFocus`, which it already forwarded to Kobalte (React's accepts
  them).
- **Shortcuts: Kbd, ShortcutProvider, useShortcut, ShortcutHelp** (Solid; new).
  One list of every key an app answers. A chord is written once ("Mod+S": Ctrl,
  or ⌘ on a Mac). `useShortcut` answers it while a component is on screen, with
  `within` (only while focus is inside an element, winning over a global one),
  `allowInFields`, `enabled`, a description and a group. `Kbd` draws a chord's
  keys spelled per platform; `keyshortcut()` gives a control its
  aria-keyshortcuts and `shortcutLabel()` its tooltip text. `ShortcutHelp` is
  the `?` overlay, generated from what is registered, plus `extra` keys handled
  elsewhere. Chords the browser keeps (Ctrl+T, Ctrl+W, F5…) and a second
  shortcut on the same keys in the same place are refused with a warning. The
  pure half is core's new `@algorisys/zen-ui-core/keys`, checked by
  `bun run check:keys` (431 assertions; fails 10 with ⌘ broken on purpose).
- **TreeSelect** (Solid; new): pick one node from a hierarchy, the chart of
  accounts, item groups, cost centres. Type to search: every match shows under
  its ancestors (opened), so "Cash" and "Cash Credit" read as the different
  accounts they are, and the first match you can pick is the active one.
  `leavesOnly` lets only end nodes be picked (groups open and close);
  `showPath` shows "Assets › Current Assets › Bank" in the closed field;
  `invalid`, `disabled`, `id` for `<label for>`. Keys as a tree view (→ opens or
  steps in, ← closes or steps out), focus staying in the field with
  aria-activedescendant. The pure half is core's new
  `@algorisys/zen-ui-core/tree-select`, checked by `bun run check:tree-select`
  (809 assertions; fails 20 with ancestors dropped on purpose).
- **Tile and TileGrid** (Solid; new): a launchpad. A tile has a mark (two
  letters or an icon), a name and a live line ("131 records"); it is a link
  with `href` (`as` takes a router link) or a button with `onClick`, and has
  `loading`, `disabled` and `locked` (outside the user's plan: muted, with a
  lock, still activatable so the app can explain). TileGrid lays tiles out in
  responsive columns (`--zen-tile-min-width`, or `minTileWidth`) as one tab
  stop: the arrows move between tiles, up and down by the columns as laid out.
- **Demo site: "New" and "Updated" tags** (Solid demo), New in green and
  Updated in yellow (4.92:1 and 4.84:1). `nav.ts` entries take
  `since` and `updated` versions; the sidebar and the catalogue mark them while
  that is the current release's minor or later, and the marks expire by
  themselves. Fourteen components are marked Updated for this release,
  ContextMenu and Document tabs New.
- **Combobox `invalid` and Select `invalid`** (Solid): marked aria-invalid with
  the error border, for a form that shows its own message (Select's
  `errorMessage` still prints one). **Input** takes the error border when it has
  `aria-invalid="true"`.
- **DocumentTabs `closeLabel(tab)`** (Solid): the close button's tooltip, e.g.
  "Close (Alt+W)"; its accessible name stays "Close <tab>".
- **`--zen-object-page-section-title-size`** (core; Solid reads it): the size of
  ObjectPage's section titles. Default: today's size.
- **Table tokens** (core; Solid's table reads them, the other bindings follow):
  `--zen-table-head-font-size`, `--zen-table-head-font-weight`,
  `--zen-table-head-text-transform`, `--zen-table-head-letter-spacing`,
  `--zen-table-cell-padding-x` and `--zen-table-row-hover`. Set values instead
  of overriding classes; the defaults are what the tables always drew (computed
  styles measured identical before and after).
- **ObjectStatus `stamp`** (Solid): a document's status as a stamp, a ruled
  box in the state's colour, uppercase and letter-spaced, never rotated
  (DRAFT, SUBMITTED, CANCELLED), with no icon unless one is given. Its colours
  are the readable soft-fg text colours (warning's plain colour is 1.77:1 on
  white).
- **StatCard `size="lg"` and `chart`** (Solid): the hero of a dashboard row,
  with a larger figure and a small chart under it across the card (a skeleton
  while loading). Cards without them render as before.
- **MicroBarChart `baseline="zero"`** (Solid): bars measured from zero, so a
  bar's length is its value and two bars compare as their numbers do (negative
  values hang below a zero line). The default stays `"range"`, which stretches
  the values' own range over the height, as a sparkline does.
- **SegmentedButtonItem `count`** (Solid): a count beside the label, for
  choices that filter a list ("All 206 · Paid 4 · Overdue 1"), as a muted chip
  in tabular figures, inverted when selected. The item is named "Paid, 4".
- **ShellBar `search`** (Solid): your own control in the bar's search place,
  a command palette's trigger, say, laid out by the bar. As a function it is
  told when the bar is compact (`bar.compact`, where the built-in field would
  shrink to an icon), so the control can shrink too. Replaces `searchable`'s
  field when both are given.
- **Sidebar: two more ways to collapse, and counts** (Solid; the other bindings
  follow).
  - `SidebarProvider collapseMode="hidden"`: collapsing hides the sidebar
    entirely, for a menu with no icons; a hidden sidebar is inert.
  - `SidebarProvider overlay` (`true`, or `{ below: 900 }`): the sidebar starts
    closed and opens over the content, takes focus, and closes on Esc, a click
    outside it or following a link in it. The width is the sidebar's
    container's, not the window's; widening past it restores the sidebar as it
    was.
  - `SidebarMenuBadge` (a count at a row's end) and `SidebarMenuSub badge` (on
    a group, before its chevron); `SidebarHeaderLabel` for the app's name.
- **ContextMenu** (Solid; React, vanilla and web components follow). The menu
  a right-click opens, at the pointer; from the keyboard (the menu key or
  Shift+F10) at the focused element's corner with its first item active; on a
  long press on touch. Focus returns to what it was opened on. Its items,
  groups, labels, separators and submenus are DropdownMenu's (in Kobalte the
  two menus share them), re-exported under ContextMenu names. Demo at
  /context-menu.
- **DataTable `contextMenu`** (Solid): a right-click menu for rows. It receives
  the row, the cell's column and the selection to act on (every selected row
  when the target row is selected). A right-click focuses its row or cell; the
  menu key and Shift+F10 open the menu for the focused one; the header and
  footer keep the browser's own menu. Works with keyboard rows, cell
  navigation and row virtualization. Demo section "6d".
- **DataTable `enableCellNavigation`** (Solid; React, vanilla and web
  components follow): work in a table cell by cell, as in a spreadsheet.
  - Keys: one tab stop for the table; arrows, PageUp/PageDown, Home/End and
    Ctrl+Home/End move between cells (← → follow the text direction). Enter or
    F2 edits, typing starts editing with the character typed, Esc returns to
    the cell; in an editor Enter saves and moves down, Tab saves and moves
    across.
  - Ranges: Shift with the arrows, Shift+click or a drag; Ctrl+A selects every
    cell; Esc collapses back to the active cell.
  - Clipboard: copy writes the range as tab-separated text (what spreadsheets
    exchange); paste fills editable cells from the active one, numbers parsed
    ("1,500" is 1500), select cells matched by value or label, anything a cell
    cannot take skipped; Delete clears a range. Several cells at once go to the
    new `onCellsEdit(edits)`, or to `onCellEdit` one by one without it.
  - Works with and without `enableRowVirtualization`: the active cell stays
    mounted, and a jump to a cell far away scrolls it into view.
  - The pure half is core's new `@algorisys/zen-ui-core/grid-range` (ranges,
    the clipboard format, where a paste lands), checked by
    `bun run check:grid-range`.
- **DataTable `enableRowVirtualization`** (Solid; React, vanilla and web
  components follow, see todo.md). Renders only the rows in view, inside the
  regular table, so a virtualized table keeps everything an ordinary one has:
  grouping, expandable rows, selection, keyboard navigation, inline editing,
  column pinning, a sticky header and `fillHeight`. `enableVirtualization`
  could do none of the first four, because it rendered a separate grid of divs;
  it is unchanged, for the tables built on it.
  - Spacer rows stand in for the rows not mounted; rows are measured as they
    mount, so group rows and expanded panels may be taller than the rest, and
    the row-height estimate is learned from the first row measured (it follows
    density) unless `rowEstimatedHeight` is given.
  - The keyboard's row and the row being edited stay mounted wherever the scroll
    is: the table never loses its tab stop, focus or a half-typed value. A jump
    (End, PageDown) scrolls only the table, never the page, and the row lands
    below the sticky header.
  - Columns lay out from the header (`table-layout: fixed`), so they hold still
    as rows come and go.
  - Measured in the Solid demo, 10 000 rows: 16–18 rows mounted, about one row
    added per row scrolled past, frame p50 16.5 ms / p95 21 ms; four end-to-end
    scrolls left DOM nodes and listeners unchanged.
  - Rows can be dragged (`enableRowOrdering`) to anywhere in the table, not
    just within view: the table scrolls while the pointer is near its top or
    bottom edge, a line shows where the row will land, and Esc cancels. The
    drag is the table's own, not solid-dnd's, which can drop only onto a row
    that is mounted; expanded panels are off while rows can be dragged, as in
    the unvirtualized table.
- **DataTable `enableFilterOperators`** (Solid; React has had it). Set it to
  `false` to drop the operator select beside each per-column text filter, when
  the server owns the predicate; the filter value is then a plain string.
- **Select `defaultOpen` and `onOpenChange`** (Solid): open the list when it
  mounts, and hear it open and close. Used by DataTable's inline select editor.
- **DataTable `fillHeight`** (all four bindings). The table fills its parent's
  height: the rows scroll inside it under a header that stays put, and the pager
  stays below — a list as the page's main pane, where `stickyHeader` alone needs
  a fixed `maxBodyHeight`. Implies `stickyHeader`. The parent must give it a
  height (a flex child with `min-height: 0`).
- **ShellBar `profile.menu`** (all four bindings): the profile menu's own body in
  place of `menuItems`, for a menu that holds settings (radio groups, labels) as
  well as actions. React and Solid take a function returning DropdownMenu parts
  (Solid must build them inside the menu's context, and a JSX value written into
  the profile object would be built outside it — Kobalte throws
  `useMenuRootContext must be used within a MenuRoot`); vanilla and web
  components take `DropdownMenuItemSpec[]`, the binding's data idiom.

- **Density: Comfortable or Compact** (core tokens; all four bindings). Set
  `data-density="compact"` on any element, usually `<html>`, and what is inside
  tightens: inputs, selects, comboboxes, number fields, search and md buttons go
  from 40px to 32px; table heads and cells, menu, select and command items,
  object-page sections and its anchor bar, filter bars and cards lose padding.
  Type does not shrink. Comfortable is the default and is exactly the old sizes,
  so nothing moves for a consumer who does not opt in (measured in all four demos:
  40px comfortable, 32px compact).
  - Tokens: `--zen-control-height`, `--zen-control-padding-x`,
    `--zen-table-head-height`, `--zen-table-cell-padding-y`,
    `--zen-section-padding-{x,y}`, `--zen-anchor-bar-height`,
    `--zen-bar-padding-y`, `--zen-card-padding`, `--zen-menu-item-padding-y`
    (tokens.css "Density", the last block, so compact wins by source order).
  - Utilities: the Uno theme maps them as spacing and height keys
    (`zen-h-zen-control`, `zen-px-zen-control-x`, `zen-py-zen-cell-y`, …), and
    `cn()` knows them as spacing, so a caller's `zen-h-8` still overrides.
  - Demo: Theme, section 5, in every binding.
  - Sizes other than md (button xs/sm/lg/xl, search sm/lg) stay fixed: a size
    asked for by name is kept.
- **DocumentTabs** (Solid; the React, vanilla and web-components ports follow, see
  todo.md — `check:parity` reports it until they land). A workspace's open
  documents as closable, pinnable tabs, marked when they hold unsaved changes.
  The consumer owns the panels, so a hidden document keeps its state.
  - Keyboard: WAI-ARIA tabs with manual activation (←/→ Home/End, Enter, Delete
    closes); middle-click closes.
  - Overflow: the strip scrolls (only the strip, never the page) to keep the
    active tab in view, and an all-tabs menu appears at its end.
- **`pin` icon** (a thumbtack), used by DocumentTabs. Skill API docs regenerated:
  every `IconName` list now includes it.

- **DataTable keyboard rows** (Solid; the other bindings follow, see todo.md):
  `enableKeyboardNavigation` gives the table one tab stop and moves focus a row
  at a time (↑/↓, PageUp/PageDown, Home/End); `onRowActivate(row, event)` runs
  on Enter, with the modifiers, so Ctrl+Enter can mean "elsewhere"; with
  `enableRowSelection`, Space toggles a row and Ctrl/Cmd+A the page. Keys with
  Alt, and anything typed in a field inside a row, are left alone. `rowLabel`
  names each row for a screen reader. The plain body only for now. The key
  logic is in core (`@algorisys/zen-ui-core/row-keys`) with
  `check:row-keys`, 2,724 assertions.

- **`cellKeyTarget`** (core `row-keys`, re-exported by every binding with
  `rowKeyTarget`, `ownsArrowKeys`, `ROW_PAGE_STEP` and the `GridCell` type):
  the cell a key moves to in an editable grid, as in a spreadsheet. Arrows move
  one cell, Home/End go to the row's ends, and Ctrl+Home/End to the grid's.
  Movement stops at the edges. `check:row-keys` covers it (15,937 assertions in
  all).

### Fixed
- **`check:nav` passed on a nav.ts that does not compile** (it read it with
  regexes). It parses it first now; a stray quote once blanked the Solid demo
  while the check said ok.
- **Two demo pages (DiffView, ObjectPage) warned "computations created outside
  a `createRoot`"**: they built JSX at module level. Built inside the demo
  components now; no warnings, every section still has its content.
- The Solid demo's header and catalogue counted the components differently;
  both count the same now.
- **A per-column text filter matched nothing on a column without
  `filterVariant`** (Solid DataTable; a regression from the operator select
  added earlier in this release, never in a published version). The operator
  select stores `{ op, value }`, and TanStack's automatic filter compared the
  cell with "[object Object]". Such a column now reads the operator; any other
  filter value (a plain string, a number range, a boolean), and the filter's
  autoRemove / resolveFilterValue, go to exactly the filter TanStack would
  have chosen, so nothing else changes. Every existing demo column declared
  `filterVariant`, which is why no demo showed it.
- **A malformed locale threw instead of falling back** (core number-format,
  new messages): `Intl` raises a RangeError on a tag like "en_IN", so an app
  passing one to AmountField or LocaleProvider would stop rendering. Now it
  behaves as no locale (the browser's).
- **check:lookup's sweep was far narrower than it claimed**: its random
  generator overflowed a double (`seed * 1103515245`), lost its low bits and
  picked 3 of 12 entries, so 12 distinct cells of 144 were tested and never a
  decomposed accent or an emoji. It uses `Math.imul` now, asserts its own
  variety, and passes. (No bug was hiding behind it; the claim was the defect.)
- **Esc did nothing in ValueHelp and ViewSettingsDialog while a tab had focus**
  (Solid), and ValueHelp opens with focus on one. Kobalte's tab list swallows
  Esc, though a tab list can never be emptied, so any Dialog, Sheet or Popover
  containing Tabs ignored the key. TabsList now passes it on, once, to whatever
  contains it.
- **TreeSelect's list was cut off** inside anything that clips (a card with
  overflow hidden, as on its own demo page) and never opened upward near the
  bottom of the window. It now renders in a portal placed against the field:
  below it, or above when there is more room there, its height capped to the
  room it has, following the field as the page scrolls.
- **Breadcrumb showed list numbers without the opt-in preflight** (Solid):
  "Home1. › Accounts2. ›", 44px high instead of 20. Its list resets its own
  margin, indent and markers now, as do Stepper's and FileUpload's lists,
  which had the same dependence.
- **Select never told a screen reader it was invalid** (Solid): the trigger
  carried `data-invalid` only. It has `aria-invalid` now.
- **StatCard with `href` underlined every word in the card** (Solid): an `<a>`
  keeps the browser's underline without the opt-in preflight. It no longer does.
- **Sidebar: the header's text spilled out of the collapsed rail** over the
  page (Solid). On the rail the header now stacks, and its text is read by
  screen readers but not shown, as the menu's labels already were.
- **Sidebar: a menu button rendered as a link was underlined and link-blue**
  (Solid, `as={A}` or `as="a"` without the opt-in preflight). It now looks like
  the button version; `SidebarMenuSubButton` already did.
- **DataTable: Esc in an inline text editor saved the edit instead of
  discarding it** (Solid, every table). Cancelling removed the input, and
  removing a focused input fires its blur, which saved. Measured in the demo
  before and after. An editor now ends once.
- **DataTable lost keyboard focus whenever its data changed** (Solid, with
  `enableKeyboardNavigation`): new data rebuilds the rows, the focused one with
  them, and focus fell to the page. It now returns to the same row. Saving an
  inline edit was the usual trigger.
- **DataTable with `enableRowVirtualization`: a jump to a row far away could
  land at the top of the table.** The browser's scroll anchoring adjusted the
  scroll as spacer rows changed height; it is off for the virtualized
  scroller.
- **DataTable: the inline number editor opened without focus** (Solid; React
  has the same bug, fixed with its port), so typing went nowhere until the
  field was clicked again. It now takes focus with its value selected.
- **DataTable: the inline select editor opened closed** (Solid), one more
  click than React's. It now opens its list at once; closing it without a pick
  cancels the edit.
- **DataTable showed a sort priority "1" beside a column sorted on its own**
  (Solid; React follows), at 16px, larger than the header text. The number now
  appears only when two or more columns are sorted, at the header's size, as
  vanilla already did.
- **DataTable: expanding a group row opened a detail panel under it** (Solid;
  the other bindings follow with the port) when the table had both
  `enableGrouping` and `renderSubRow`. The panel showed one member's details
  under the group header. A group row now expands into its rows only.
- **ObjectPage: a field reached with Tab could land under the sticky anchor
  bar** (all four bindings). The content scroller now has `scroll-padding-top`
  equal to the measured bar, so anything the browser scrolls into view there —
  focus, a grid cell, `scrollIntoView` — lands below it.
- **FlexibleColumnLayout left a blank gap when a layout named a column the
  caller did not fill.** A three-column layout with no start column drew mid
  and end at three quarters of the width and left the last quarter empty; the
  doc comment already promised an absent column "must not reserve room". The
  present columns now share the whole row in their layout's proportions
  (ThreeColumnsMidExpanded without start: mid 2/3, end 1/3). It matters to a
  consumer that keeps the detail in `mid` so that showing or hiding the list
  never remounts it. Every binding; layouts with all their columns filled
  render exactly as before.

### Changed
- **FlexibleColumnLayout's arithmetic moved to core**
  (`@algorisys/zen-ui-core/flexible-column-layout`): the tiers, the ratio
  tables and the re-spreading were three identical copies, one per binding.
  The bindings keep the `zen-basis-*` classes, mapped from a share token, since
  UnoCSS generates only the classes in each binding's own source. New
  `check:flexible-column-layout` (part of `bun run check`): 254 assertions,
  including that the rendered shares fill the row for every layout, tier and
  combination of present columns.

## [12.1.1] - 2026-11-02

### Fixed

- **`ObjectPageLayout` section jumps scroll only the layout's content scroller**
  (all four bindings). `scrollIntoView` also scrolled every scrollable ancestor,
  including `overflow: hidden` ones (still scriptable), so a consuming app's shell
  slid its header off screen. Replaced with a `scrollTo` on the scroller that
  honours the section's `scroll-margin-top`. Verified in each binding's demo: the
  surrounding page moved before and does not now, and the section lands at the bar
  edge (0px). Found in Algorisys One's forms.
- **Solid `ObjectPageLayout` debug logging removed**: five `console.log("DBG …")`
  calls left in the 12.1.0 build.

## [12.1.0] - 2026-11-02

### Added

- **`ObjectPageLayout` `headingLevel`** (all four bindings; `heading-level` on
  `<zen-object-page-layout>`). Sets the title's heading level; sections sit one
  below and sub-sections two below, so the outline never skips. The default, 2,
  renders the same h2 / h3 / h4 as before, so existing pages are unchanged. Pass 1
  when the object page is the page itself: a document screen in an app had no
  h1 at all. The demo gains section 5; the sub-section demo data takes an id
  prefix so the two layouts on one page don't share DOM ids.
- **`blue` theme** — indigo-blue (#4F46E5) on cool slate, 6 / 8 / 12px corners
  and an Inter-first type stack, from Algorisys' InterGold PPC app. Pick it with
  `data-theme="blue"` or `applyTheme("blue")`; it is listed in `THEMES`, so
  every binding's theme switcher offers it.
- **`PasswordInput` `autoHideMs`** (every binding; `auto-hide-ms` on
  `<zen-password-input>`): a revealed password re-masks itself after that many
  milliseconds, so it cannot be left on screen in plain text. Each reveal
  restarts the countdown; unset keeps today's behaviour.

## [12.0.1] - 2026-08-24

### Fixed

- **Solid: opening a menu whose `DropdownMenuLabel` was not inside a
  `DropdownMenuGroup` threw** (`[kobalte]: useMenuGroupContext must be used
  within a Menu.Group component`), taking the subtree down through the nearest
  error boundary — the Solid demo's `/dropdown-menu` route replaced the section
  with the error card as soon as the trigger was clicked. The content does not
  mount until the menu opens, so the ROUTE loads clean: `visual-check` reported
  "108 routes, no runtime errors" against the broken build, because it never
  opens anything. That is the gap that let this ship, not a stale build. The
  binding
  mapped `DropdownMenuLabel` onto Kobalte's `Menu.GroupLabel`, which reads a
  context only `Menu.Group` provides; React's Radix `Label` has no such
  requirement, so the identical markup — the one both demos ship — worked in one
  binding and crashed the other. `DropdownMenuGroup` and `DropdownMenuRadioGroup`
  now mark their subtree with a context flag (Kobalte's `RadioGroup` renders a
  `Menu.Group` internally, so it counts as one) and `DropdownMenuLabel` reads it:
  inside a group it renders `Menu.GroupLabel` and keeps the group's
  `aria-labelledby` association; standalone it renders the same span. Standalone
  it must NOT be `Menu.GroupLabel` — that primitive sets `aria-hidden="true"`
  because the group's accessible name carries the text, so with no group the
  heading would be unreadable to a screen reader. Radix's `Label` is a plain
  element for the same reason.
- Both group wrappers stay polymorphic (`PolymorphicProps`, so `as` still
  typechecks). They previously WERE Kobalte's components; a wrapper typed to a
  fixed `div` would have narrowed a published API in a patch release.

## [12.0.0] - 2026-08-14

### Breaking

- **The `paper` theme's elevation steps are now distinguishable.** Every step of
  its shadow scale sat within a few pixels of the next, so `raised` and `lifted`
  read as the same surface. Measured as the peak pixel shift each shadow makes
  against the theme's own ground (#F0EBE0), the scale ran
  **11 / 13 / 15 / 20 / 24 / 33** of 255 — six steps inside a range of 22 — and
  now runs **6 / 12 / 19 / 30 / 44 / 61**. `raised` to `lifted` goes from 7
  apart to 18. Note `xs` gets FAINTER (11 → 6): spreading a scale means dropping
  the bottom so the top has room, otherwise every step moves up together and
  stays equally crowded. Geometry is untouched — the offsets, blurs and the
  negative spread from `lg` up that keeps the shadow under the sheet rather than
  around it are the 11.0.0 values. Affects only consumers using
  `data-theme="paper"`; alphas are tokens, so the old weights can be restored by
  overriding `--zen-shadow-*` under that selector.

### Known

- The SHARED scale still has the same complaint — default measures 23 vs 27
  (4 apart), dark 22 vs 27 (5). Widening it restyles every elevated component in
  every theme for every consumer, where this change reaches only what opts into
  the paper theme. Deliberately left as a separate decision.

## [11.0.0] - 2026-08-14

Paper, a document surface — and two fixes that alter what existing apps render.

### Breaking

- **Dark mode now has shadows.** The `[data-theme="dark"]` block defined zero
  shadow tokens, so it inherited the light scale — a near-black TINT,
  `rgba(19, 26, 37, …)` at alphas of 0.08–0.20 — which cannot darken an already
  dark ground. Measured as peak pixel shift against the surface behind:
  `raised`/`lifted` were **2/2** of 255 in dark against **23/27** in light; they
  are now **22/27**. Elevation was not subtle in dark mode, it was absent, and
  every step looked identical. Affects Card, Dialog, Popover, Sheet and
  DropdownMenu. Black rather than a tint (a dark shadow reads as absence of
  light) at much higher alpha; offsets, blurs and spreads are deliberately
  unchanged so a component's elevation keeps its shape across themes. Consumers
  who want the flat look back override `--zen-shadow-*` under `[data-theme="dark"]`.
- **Arbitrary shadow overrides now win.** `cn("zen-shadow-zen-sm",
  "zen-shadow-[…]")` emitted BOTH classes, so the winner fell to stylesheet
  order — where Uno emits the named utility later, meaning a component's shadow
  silently beat the caller's. Named-against-named already deduped, which is why
  it survived; only named-against-ARBITRARY failed, because `zen-sm` is not a
  value tailwind-merge knows, so it read `shadow-zen-sm` as a shadow COLOUR and
  `shadow-[…]` as a shadow SIZE — two groups that never conflict. `cn` now
  teaches tailwind-merge the shadow scale exactly as it already did for radius,
  keyed off `zenUnoTheme` so a shadow added to the generator cannot go missing.
  Four regression cases in `check:cn`, including the arbitrary pair both ways.

### Added

- **`Paper`** — a document surface, in all four bindings. `measure`
  (`prose` 65ch / `wide` 80ch / `full`), `elevation`, `padding`, and the compound
  Header/Title/Description/Content/Footer shape mirroring Card's. The measure is
  in `ch` because the target is a line length, not a box; verified in a browser
  that the prose sheet renders 761px where a 65-character string measures 761px.
  Document typography is set by the component rather than inherited, so it reads
  the same under every theme.
- **`stack={1 | 2}`** on Paper — one or two sheet edges behind the top sheet,
  composing with `elevation`. Layered box-shadows: two techniques were built and
  rejected by measurement first. Pseudo-elements at `z-index: -1` had every
  computed property correct and rendered nothing, because a negative z-index goes
  behind the nearest stacking-context ROOT rather than behind its parent; real
  child divs paint ABOVE the sheet and draw borders across its face. The
  (stack × elevation) combinations are enumerated literally because UnoCSS scans
  source text, so a class assembled from template pieces generates no CSS.
- **`DialogContent variant="paper"`** — top-anchored document mode, in all four
  bindings. Needs a real scroll CONTAINER rather than `overflow-y-auto` on the
  overlay: Radix and Kobalte both render Overlay and Content as SIBLINGS, so the
  panel is not inside the overlay. Measured before the wrapper existed — the
  panel had no scrollable ancestor and a document taller than the viewport hung
  off the bottom unreachable. Default mode is byte-identical: fixed, `max-w-lg`,
  85vh, its own overflow, centred, no wrapper.
- **`paper` theme** — a fourth `data-theme`. Its block sits AFTER the bare
  `:root` type block rather than beside the other palettes, and that placement is
  load-bearing: both selectors are (0,1,0), so from the usual position every
  line-height and font override is swallowed by source order and paper renders as
  a recoloured default. Measured across the flip: `zen-text-base` 24px → 27.2px.
  Contrast AA throughout (body 12.7:1, muted-fg 5.65:1, primary 7.7:1).
- React exports `DialogContentProps`, which `check:parity` caught as defined but
  unexported — the new `variant` prop lives on it.

### Fixed

- The paper theme's ground-vs-sheet note claimed muted "is already the darker of
  the two in every theme". True for `default` and `paper`; wrong for `dark`,
  which inverts the pair (`background` #0F172A against `muted` #1F2937), so the
  ground is lighter than the sheet and a surface reads as a hole punched in the
  desk. Recorded rather than fixed — correcting it restyles dark's two most used
  surface tokens.

### Known

- `raised` and `lifted` are 0.10 vs 0.12 alpha, 4/255 apart in the default theme
  and 7/255 in paper, so the two steps are hard to distinguish at small sizes.
  Unchanged here: pulling the scale apart restyles every elevated component in
  every theme.

## [10.8.1] - 2026-08-14

### Fixed

- **Solid's virtualized TreeTable discarded almost every row measurement**, so
  the virtualizer stayed on `rowEstimatedHeight` rather than the height rows
  actually render at. Two Solid-specific ordering problems, and fixing only the
  first makes it worse. Solid applies JSX attributes AFTER running a ref, so
  `data-index` was absent when `measureElement` ran: `indexFromElement` returns
  -1, `resizeItem` looks up `measurementsCache[-1]`, finds nothing and returns,
  and the node is additionally cached against a bogus key so the ResizeObserver
  bookkeeping is wrong too. It warns rather than throwing. Stamping the
  attribute in the ref then COLLAPSED the total from ~54,600 to 4,810, because
  Solid also runs the ref BEFORE inserting the node — it has no layout and
  measures 0, and those zeros had previously been discarded along with the bad
  index. The measurement is now deferred to a microtask, guarded on
  `isConnected`. Measured over a 1240-row scroll with 45px rows against a 44px
  estimate: React 54617 → 54718 retained, Solid was 54617 → 54629 → 54621, now
  54616 → 54716 retained. All 34 `data-index` warnings are gone.

### Internal

- **Solid TreeTable** replaces two `rows().findIndex()` scans per row with the
  memoised id → index map the React binding already carried — a quadratic scan
  in the one component whose purpose is rendering long lists.
- **`check:schedule-dom` failed on the network rather than the code**, roughly
  three runs in four, always on the assertion named "no runtime errors". It is
  in the ship checklist, so a release was gated on network conditions — and the
  honest response to that flake is to re-run until green, which means it had
  stopped being a gate. The demos load Plus Jakarta Sans from fonts.gstatic.com
  and that request fails often enough to trip it. Third-party resource failures
  no longer count, discriminated by the message's LOCATION rather than its text:
  the text is the generic "Failed to load resource: … 404 ()" for every failed
  request, so matching on it would also swallow a same-origin asset 404 — the
  failure that renders a blank page inside a working shell. Same-origin
  failures, and console errors with no location, still fail. The first attempt
  excused `/favicon.ico` and the flake survived it; a probe printing each
  message's location named the real culprit. Verified 5/5 consecutive green
  runs, plus five discriminator cases so the filter cannot excuse everything.

## [10.8.0] - 2026-08-14

Four new components, a table bound to the URL, and a TreeTable that can open.

### Added

- **`UrlDataTable`** — a `DataTable` whose sort, filters, search and page live in
  the querystring. `params` in, `onParamsChange` out; no state of its own and no
  router import, so Remix `useSearchParams`, Next, TanStack Router and plain
  `history.pushState` wire in identically. Composes `DataTable` rather than
  forking it, so the 98 KB original stays the single implementation. Wire format
  is human-readable because these URLs get pasted into tickets:
  `?sort=name:asc,createdAt:desc&filters=status:active&search=acme&page=2`.
  Multi-sort order is precedence; a filter value may contain a colon and only the
  first splits key from value; half-written pairs are dropped rather than guessed.
  Every mutation resets to page 1 except a page change, or filtering on page 7 of
  7 requests page 7 of a two-page result and returns nothing.
- **`NativeSelect`** — the platform `<select>` carrying `Input`'s class list.
  Measured at Input's 40px with an identical border, native arrow suppressed,
  `optgroup` and disabled options intact. No `size` prop: on a `<select>` that is
  the number of visible rows, and shadowing it would break a caller passing it.
  vanilla and web-components take `options` as data, per those bindings' idiom.
- **`Label`** and **`Collapsible`** — two primitives that existed in no binding.
  Built Solid-first then ported React → vanilla → web-components; verified in a
  browser per binding (Solid 13/13, React 14/14, vanilla 14/14, wc 14/14
  behavioural checks). The peer-disabled dimming is a real divergence, not an
  oversight: React's Checkbox IS the `zen-peer` and is a Radix `<button>`, while
  Kobalte nests the control in a `<div>` that is never a sibling and never
  matches `:disabled`. `disabled` on the label is the portable route.
- **`content` on Combobox / MultiCombobox options** — a renderable row alongside
  the string `label`, which keeps matching, trigger display, `creatable`
  comparison and chip rendering. Widening `label` would have broken all four:
  `alreadyExists` calls `.trim().toLowerCase()` on it unconditionally. Data, not
  a render prop, so it ports — React and Solid take a node, vanilla and
  web-components a DOM `Node`, cloned per row.
- **DataTable column footers** — `footer` on any column gives the table a
  `<tfoot>`; columns without one render an empty cell to keep the row aligned.
  TanStack has carried `footer` since v8 and DataTable rendered none, so a column
  total meant hand-rolling the table. Verified: exactly 1 of 26 demo tables grew
  a `tfoot`. vanilla takes `footer?: (rows) => Child`, matching how its
  `DataTableColumn` already diverges from `ColumnDef`.
- **`enableFilterOperators`** on DataTable, default `true`.

### Fixed

- **TreeTable could not expand at all** in React and Solid without
  `enablePagination` — not by chevron, keyboard, or `defaultExpanded`. Both
  bindings pinned TanStack's `paginateExpandedRows` to `false`, but
  `getExpandedRowModel` returns the pre-expanded model untouched when that is
  false ("Only expand rows at this point if they are being paginated"), because
  the flattening, `expandRows()`, is delegated to `getPaginationRowModel` — which
  was only supplied when pagination was on. Nothing ever called it. The flag now
  tracks `enablePagination`, as a getter in Solid so it cannot freeze at setup.
  Silent failure: `row.subRows` was populated, so every chevron drew and the row
  reported `aria-expanded="false"` after a click. vanilla and web-components were
  never affected — their TreeTable walks the tree against its own `expanded` Set
  and never touches TanStack.
- **Filter operators offered a choice nothing acted on** in server-filtered
  tables. With operators on, a filter value is `{ op, value }`, so selecting an
  operator before typing made the active-filter chip render
  `Question: [object Object]`, and the URL carried an operator no loader honoured.
  `UrlDataTable` sets `enableFilterOperators={false}`.
- **`UrlDataTable` rendered two search boxes** — its own toolbar plus DataTable's
  global filter.
- **`UrlDataTable` coerced renderable cell values** with `String()`, so a status
  pill or link in a cell rendered `[object Object]`.
- **`UrlDataTable` dropped the filter operator from the URL** and issued a
  request per keystroke; typing is now debounced.
- **`NativeSelect` rendered a second element and claimed a width of its own.**

### Changed

- Sort arrows 12px → 14px, and the unsorted hint 30% → 60% opacity. At 12px and
  30% on a header it was invisible unless you knew to look.
- `UrlDataTable` uses single-column sort. Multi-sort renders a priority number
  beside the header — "Question ⌄ 1" — which reads as data in a table of numbers.
  The URL format still carries an ordered list, so multi-sort callers of
  `DataTable` are unaffected.

### Internal

- **`check:skill-api` was machine-dependent** and failed on every checkout but
  the one that last ran the generator. tsc writes the full resolved path into an
  inline `import(…)` type for structurally-reached symbols, so the committed
  reference carried a contributor's home directory. Measured: 110 changed lines,
  every one a path, zero that were not. Paths now normalise to the tail after the
  *last* `node_modules/` — bun nests a second inside `.bun/<pkg>@<version>/` — and
  before the 400-char truncation, or a long home directory would move the cut.
- **Solid lint back to 0.** 14 problems in `url-data-table.tsx`: two real
  (`cell: (info: any)` → `CellContext<TRow, unknown>`), twelve false positives
  disabled at the site with the reason — TanStack `ColumnDef` renderers are not
  Solid components, and mutators handed to `commit` run synchronously from event
  handlers, so reading `names()` is a snapshot by design. All four bindings are
  again 0 problems.
- CHANGELOG header said "all three published packages"; there are five.

## [10.7.1] - 2026-08-07

The radius scale gains two steps above `lg`.

### Added

- `--zen-radius-xl` (12px) and `--zen-radius-2xl` (16px), wired into the UnoCSS
  theme as `rounded-zen-xl` / `rounded-zen-2xl`. The scale stopped at 8px, so
  consumers reaching past `lg` for card and panel corners hand-wrote the value:
  a SkillsEngine audit across ~200 components found eleven distinct radii and
  every one above 8px arbitrary — 10px, 12px, 20px, 1rem — none themeable.
  8 → 12 → 16 continues the existing 4 → 6 → 8 progression. The tokens live in
  core, so every binding picks them up and parity is unaffected.

## [10.7.0] - 2026-08-04

The port closes. `vanilla` and `web-components` gain both component sets, and
`check:parity` is green in every direction for the first time — 2409 assertions
across `bun run check`, no component existing in only one binding.

### Added

- `packages/vanilla` and `packages/web-components` — `TimerBadge`,
  `TestCountdownBar`, `CodeEditor`, `IDEWindow`, `SpreadsheetGrid`,
  `SheetCalculator`, `ProctorStreamGrid`, `ProctorFlagOverlay`, `ChunkUploader`,
  `DiagramCanvas`, `ArchitectureDraw`, `DiffView`, `DocumentViewer`, `Splitter`
  and `SortableList`, plus `Timeline`'s collapsible body. Ten demos, nav entries
  and routes in each.
- `pdfjs-dist` and `@monaco-editor/loader` as OPTIONAL peers of both bindings.
  They were resolving only through hoisting from another package's install.

### Changed

- `scripts/bindings.mjs` — `SplitterPanel`, `SplitterHandle`, `SortableListItem`
  and `SortableListHandle` join `DATA_DRIVEN_DIVERGENT`, with
  `SplitterPanelSpec`, `SortableItemSpec` and `CountdownCore` as their
  data-driven counterparts. Same decision as every other family in that list.
- `packages/vanilla` — `SortableList`'s pointer dragging is written here against
  measured row boxes. There is no drag library in this binding and one is not
  worth adding for a single component; the keyboard path is still core's reducer,
  so the two agree with React's by construction.
- `packages/web-components` — `define.ts` refuses to define a `_bag` property
  that shadows a member it reads on the host. The guard is a named list rather
  than "anything on `HTMLElement.prototype`", because several elements shadow
  `children` deliberately: it is the default `childrenProp`, and since
  `Element.children` is getter-only the shadow is what makes it assignable.

### Fixed

- `packages/web-components` — `<zen-input-otp>` declared `style` as a prop, which
  shadowed `HTMLElement.prototype.style` with an accessor returning `undefined`;
  `connectedCallback`'s own `if (!this.style.display)` threw on every instance.
  Five runtime errors on the OTP demo and a dead page behind them. Pre-existing;
  found by running `visual-check` against this binding for the first time.
- `packages/vanilla` — `SpreadsheetGrid` selected the cell's text on entering
  edit mode, so the character that seeded the draft was replaced by the next
  keystroke: typing `=` then `1+2*3` committed the literal string `1+2*3`. Every
  formula silently stopped being one, and it read as the parser failing.
- `packages/vanilla` — `Timeline`'s disclosure never settled. Assigning `.open`
  fires `toggle` exactly as a click does, including on a freshly built element,
  so each rebuild reported itself as a user action and the caller re-rendered
  again. Clicking a second row left the first open and spun the page until the
  next navigation timed out. It compares against what was last rendered now.
  React and Solid already compared against their current state; this was
  vanilla's alone.

### Verified

- In a browser, all four bindings agreeing: splitter divider 1px in a 12px hit
  area, focus-on-click, `aria-valuenow/min/max` against real clamps, arrow 1%,
  shift 10%, Home/End on the announced bounds, drag, collapse-snap and reopen
  past min; sortable announcing "Picked up item 1 of 5", arrow reorder, Escape
  restoring exactly and still bubbling at rest; the same invoice arithmetic
  (1260 / 2095 / 439.95 / 2534.95) including a web-components grid seeded
  entirely from a `cells` attribute; `=1+2*3` giving 7; the PDF drawing real ink
  at 540×760 with a "1 / 2" counter and surviving six rapid zooms to 381% with no
  canvas collisions; Monaco loading 5 instances.
- `visual-check`: react 105 routes, vanilla 102, web-components 102 — no runtime
  errors in any.
- `check:dist`: budgets unchanged, one React Button still 18 kB gzip.

## [10.6.0] - 2026-08-04

The four Solid-only components, ported to **React**. `check:parity` now reports
React↔Solid clean in BOTH directions; `vanilla` and `web-components` remain red
for both this set and the 10.4.0 assessment set, which is the port still to do.

### Added

- `packages/react` — `DocumentViewer`, `DiffView`, `Splitter` (with
  `SplitterPanel`, `SplitterHandle`), `SortableList` (with `SortableListItem`,
  `SortableListHandle`), each with a demo, a `nav.ts` entry and a route.
- `packages/react` — `Timeline` items take `collapsible`, `open`,
  `onOpenChange` and `children`, rendering a disclosure body. Additive: an item
  without `collapsible` renders exactly as before.
- `pdfjs-dist` as an OPTIONAL peer of the React binding (`^5 || ^6`), loaded
  lazily and only when a PDF is actually rendered.

### Changed

- Keyboard reordering in React's `SortableList` comes from
  `@algorisys/zen-ui-core/sortable`, not dnd-kit's `KeyboardSensor`, which is
  deliberately not registered. Three of four bindings need a hand-written
  keyboard layer regardless (`@thisbeyond/solid-dnd` has none; vanilla and
  web-components have no drag library), so taking the free one would give React
  different cancel semantics and announcement timing from the rest.

### Verified

- In a browser, both bindings: splitter divider 1×222 with a 12px hit area,
  focus-on-click, `aria-valuenow/min/max` 30/20/70 against real clamps, arrow
  moving 1% and Home landing exactly on the announced min; sortable pick-up
  announcing "Picked up item 1 of 5", arrow reordering, Escape restoring the
  original order exactly and announcing "Reorder cancelled", and Escape at rest
  still bubbling.
- `visual-check react` — 105 routes, no runtime errors.

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
