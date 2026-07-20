# todo.md

Tracking work that's deliberately deferred for after the shadcn / Radix
component migration is complete. Each item should be promoted to its own
issue / PR when its turn comes.

---

## Housekeeping / release readiness

The migration on `ui-refactor` is feature-complete but hasn't been
prepped for release. Decide each of these before any merge / publish.

- [ ] **Branch strategy** — `master` is still at the initial commit.
      Open a PR for `ui-refactor` → `master`, or keep as a long-lived
      branch?
- [ ] **CHANGELOG.md + version bump** — this is a breaking change set
      (new exports, legacy types renamed `Legacy*`, primary export
      shapes changed). Recommend v3.0.0 with a written migration
      guide alongside.
- [ ] **README update** — current README / DEV_GUIDE.md /
      library_usage.md still describe the legacy API.
- [x] **Remote push** — stale as written. `origin` is
      `github.com:Algorisys-Technologies/zen-ui` and `dev` tracks `origin/dev`;
      pushed 2026-07-15. `main` is also on the remote, so the branch-strategy
      question above is about merging, not about publishing.
- [ ] **Unit + interaction tests** — none exist on the new components.
      Cover at minimum: keyboard nav on DropdownMenu / Select,
      indeterminate Checkbox, Switch + RadioGroup form submission
      round-trips, asChild composition through Button's Slottable.
- [ ] **`Math.random()` → `React.useId()` audit** — flagged in
      docs/rp-review-1.md (P1-4). Migration mostly replaced these
      organically (Radix primitives use useId internally), but a final
      grep should confirm zero remaining call sites in the new code.
- [ ] **Final tick-through of [docs/rp-review-1.md](docs/rp-review-1.md)
      P0/P1 items** — most are resolved by the migration; confirm and
      mark closed.
- [ ] **Bundle size** — current Vite build emits a ~1.96 MB JS chunk.
      Code-split the library entry; split per-component imports.
- [ ] **Drop heavy deps from `dependencies`** — `onnxruntime-web`
      (~10 MB), `raygun4js`, `regenerator-runtime`, `react-flags-select`
      should move to `peerDependencies` / `optionalDependencies` or be
      removed.

---

## Phase 2 — Component behaviours (after all components are migrated)

Once the migration is complete, the library needs to add capabilities
that are common to data-heavy UIs but are not part of the headless
primitives themselves. Treat these as **per-component opt-ins**, not as
a global concern.

### Up next — in this order

1. [x] **`<DataTable>`** built on `@tanstack/react-table` +
       `@tanstack/react-virtual`. Single primitive with toggleable
       capabilities so callers compose what they need:
       - [x] `enableVirtualization` (off by default; flip on for ≥ 200 rows)
       - [x] `enablePagination` (client-side; with page-size selector)
       - [x] `manualPagination` (server-driven cursors)
       - [x] `enableSorting` (per-column toggle)
       - [x] `enableColumnFilters` (global filter)
       - [x] `enableRowSelection` (Checkbox in a select column)
       - [x] `enableColumnVisibility` (DropdownMenu of columns)
       - [x] empty state, loading state, error state

   **Follow-ups (all opt-in, separate commits):**
   - [x] `enableColumnOrdering` — drag column headers to reorder
         (@dnd-kit horizontalListSortingStrategy). `onColumnOrderChange`
         callback lets the caller persist the order (e.g. localStorage).
   - [x] `enableColumnResizing` — drag the right edge of any header.
         `columnResizeMode: "onChange"` so the body updates live.
   - [x] `enableColumnPinning` — pin columns to the left/right edge.
         `initialColumnPinning={{ left, right }}` for the common static case;
         `columnPinning` + `onColumnPinningChange` for controlled. Pinned cells
         get sticky offsets + a soft inner-edge shadow. Combines with
         `stickyHeader` for a 2-D freeze. Works in virtualized mode too
         when pinned columns have explicit `size` on the column def.
   - [x] `stickyHeader` — pin the `<thead>` to the top of the scroll viewport
         in non-virtualized mode. Body wraps in a `maxBodyHeight` container so
         sticky has a real scroll context. Virtualized mode already does this.
   - [x] `enableGrouping` — group by one or more columns with built-in
         sum/mean/count aggregations via `aggregationFn` +
         `aggregatedCell`. Toolbar `Group by` menu lists every
         groupable column. Hard-gated against `enableVirtualization`
         (would mis-display aggregates as scalars) — emits a dev-mode
         `console.error` when both are configured.
   - [x] `renderSubRow` — caller-rendered detail panel beneath each
         expanded row with a chevron toggle column. Hard-gated against
         `enableVirtualization` (variable sub-row height).
   - [x] **Per-column filters** — `enablePerColumnFilters` renders an
         Input row under each filterable header; composes with the
         global filter. Now wired in virtualized mode too.
   - [x] **Per-column filter operators** — `meta.filterVariant` picks
         text / number / numberRange / select / boolean inputs and
         auto-attaches the matching `filterFn`. Text/number variants
         expose contains/equals/starts/ends + ≥/≤/etc. operator menus.
   - [x] **Active filter chips + clear-all** — auto-shown above the
         table when any filter is set; one chip per active filter with
         ✕, plus a Clear-all button.
   - [x] **Multi-sort** — `enableMultiSort` prop; Shift-click adds a
         secondary sort. Header shows a small priority badge.
   - [x] **CSV / JSON export** — `enableExport` adds a toolbar menu;
         exports the filtered set (or `exportOnlySelected` for the
         checked rows). Utility columns (`__select`, `__drag`) excluded.
   - [x] **Inline cell editing** — `meta.editable` on a column +
         `onCellEdit` on the table. Double-click (or Enter when focused)
         swaps the cell for the matching input (text / number / select).
         Enter + blur commit, Esc cancels.
   - [x] **Bulk-action bar** — `renderBulkActions` shows a contextual
         toolbar when ≥ 1 row is selected, with built-in selected count,
         dismiss ✕, and a "Select all N matching" affordance when the
         filter has more matches than the current page.
   - [x] **rowClassName hook** — per-row styling callback merged after
         hover / selected classes. Status-based row tinting.
   - [x] **getRowId** — exposed for stable row identity across re-renders
         (row selection / reorder / inline edit all key by row.id).
   - [x] **manualSorting / manualFiltering** — server-driven escape
         hatches matching the existing `manualPagination`. All three
         compose for a fully server-driven table.
   - [x] **persistKey** — localStorage snapshot of column order /
         sizing / visibility / pinning, versioned for shape-change
         safety.
   - [x] **a11y polish** — aria-sort on headers, aria-colcount on virt,
         aria-busy on body during loading, aria-labelledby for "Rows
         per page", aria-live count in the bulk-action bar.
   - [ ] **Excel / PDF export** — would pull in `xlsx` / `jspdf` deps;
         CSV + JSON cover most needs today.
   - [ ] **Tests** — none of the DataTable behaviors are unit-covered.

2. [x] **Lazy-loaded options for Select + DropdownMenu** —
       `<VirtualizedItems>` helper shipped under
       `src/components/listbox/`. Used by `DataTable` virtualization,
       `Lazy options` demo, and a Combobox-with-VirtualizedItems pattern.
       - Gotcha documented: Radix `<SelectValue>` reads its label from
         the mounted `<SelectItem>`. With a virtualized list the selected
         row may be unmounted, so the demo renders the label manually
         via a value→label `Map`. Consider providing a helper
         `<VirtualizedSelectValue>` that closes over the same map.
3. [x] **`<Combobox>` primitive** — cmdk-backed, single component with
       both sync (`options`) and async (`onSearch`) modes. Debounce
       (configurable), AbortController + monotonic-seq to cancel stale
       requests, loading / empty states baked in. The async mode
       supersedes the previously-planned `<AsyncSelect>` — same API.
4. [x] **`<AsyncSelect>`** — merged into Combobox's async mode
       (`onSearch` prop). No separate component needed.

### Performance — other

- [ ] **Avatar** lazy `<img>` decoding via `loading="lazy"` (Safari
      already supports this; just add the attr).
- [ ] **Skeleton** suspense-aware variant that auto-hides when its
      boundary settles.

### Async / data integration

- [ ] **Suspense / loading boundaries** at each async component. Avoid
      ad-hoc spinners; use `<Skeleton>` consistently.

### Forms

- [x] **Form primitives** — Form, FormField, FormItem, FormLabel,
      FormControl, FormDescription, FormMessage with the shadcn
      pattern on react-hook-form. Resolver-agnostic; Zod wired into
      the demo at /form-new.
- [ ] **Async / server-validated fields** — submit-handler integration
      for slow remote validations (debounced + cancelable; useTransition).

### A11y polish

- [x] **`prefers-reduced-motion`** — done, and better than this item asked for.
      Rather than gating each animation, `tokens.css:409` rebinds `--zen-duration-*`
      to `0.01ms` under `@media (prefers-reduced-motion: reduce)` — one rule, covers
      every animation that uses the tokens, and stays inside the "only set `--zen-*`"
      CSS rule. Near-zero rather than `0` so `animationend` still fires and
      components waiting on it still unmount. Carousel and ObjectPage additionally
      check `matchMedia` in JS, all four bindings, for scroll behaviour CSS cannot
      reach. Verified 2026-07-20.
- [x] **RTL audit** — ~~verify Radix's logical-property defaults render
      correctly in `dir="rtl"`.~~ **Done 2026-07-20 — see the RTL audit entry in
      the Carbon-shaped section below**, which is where the findings and the three
      remediation items live. This entry had been duplicated there; resolved to
      one place.
      The answer to the question as phrased: **Radix's defaults never get the
      chance to apply.** No binding renders a `DirectionProvider`, so the
      primitives read `ltr` internally regardless of `document.dir`.
- [ ] **High-contrast / forced-colors** — make sure focus rings and
      borders remain visible under Windows High Contrast and macOS
      Increase Contrast.

### Tooling

- [ ] **Storybook (or Ladle)** alongside the demo app so each component
      has individual stories, controls, and a11y panel.
- [ ] **Visual regression** via Chromatic / Playwright snapshots,
      gated on PR.
- [ ] **Unit / interaction tests** with `vitest` +
      `@testing-library/react`. Cover keyboard nav and form submission
      paths.

### Theming

- [x] **Theme switcher dropdown** in the demo shell (header).
- [x] **Default theme** (current `--zen-*` palette / Algorisys brand).
- [x] **Zen theme** — full official color spec applied (Primary,
      Neutral, Success, Info, Warning, Destructive — 10-step shade
      scales each).
- [x] **Zen theme — remaining artifacts applied** (refinement pass):
      - shadows-blur → `--zen-shadow-xs/sm/md/lg/xl/2xl`
        tokens shipped in `tokens.css` per spec (Neutral/500 base colour
        + conventional alpha; xxlarge is pure black per spec). UnoCSS
        utilities `shadow-zen-*` exposed in `uno.config.ts`. `App.css`
        sticky-header shadow adopts `--zen-shadow-xs`.
      - spacing → `--zen-space-0…16` scale in `tokens.css`
        (4-px grid; derived from layout-grid + table + alert spec
        values).
      - table → `data-table/table.tsx` matches spec:
        header is XSmall Medium + Neutral/200; cell padding 12 / 8;
        row borders Neutral/50; selected-row gets primary-tinted drop
        shadow (`0 4px 12px var(--zen-color-primary-soft)`).
      - alert → `<Alert>` primitive shipped under
        `src/components/alert/alert.tsx` — compound API (Alert / Icon /
        Content / Title / Description / Actions / Close), `color`
        (neutral / primary / info / success / warning / destructive)
        × `variant` (soft / outline). Demo at `/alert`.
- [x] **Dark theme** — shipped for free since it falls out of the same
      `data-theme` mechanism.
- [x] **Demo chrome dark-mode contrast pass** — every hardcoded hex in
      `demo-helpers.css`, `Welcome.tsx`, and the `NewXxxDemo.tsx` files
      swept to `var(--zen-color-*)` references so cards / heads /
      previews re-tint in the dark theme.
- [ ] **High-contrast theme** for forced-colors environments.
- [ ] **Token sync with the rest of Algorisys products** — consider exposing
      the palette as a small JSON / TS file consumable by other apps.

### Distribution

- [ ] **shadcn-CLI compatibility** — publish a `components.json` and
      rename the design tokens to shadcn defaults
      (`--primary`, `--background`, `--ring`, …) so consumers can
      `npx shadcn add card` and have it slot in.
- [ ] **Code-split the bundle** — current Vite build emits a ~1.7 MB
      JS chunk. Tree-shake `svg_components.tsx` (42 KB of icons) and
      split per-component entries.
- [ ] **Drop `onnxruntime-web`, `raygun4js`, `regenerator-runtime`** from
      `dependencies` (or move to `peerDependencies`); they don't belong
      in a UI library.

---

## Migration status (shadcn / Radix refactor)

Tracked separately in commit history on `ui-refactor`. See
[docs/rp-shadcn-radix-gap.md](docs/rp-shadcn-radix-gap.md) for the
rubric and component-by-component plan.

Current progress (auto-updated by reviewing the branch):

- [x] Foundation (cn, tokens, preflight, CVA, Slot, UnoCSS rem postprocess)
- [x] Button
- [x] Tooltip
- [x] DropdownMenu
- [x] Separator
- [x] Switch
- [x] Checkbox
- [x] RadioGroup
- [x] Progress
- [x] Avatar
- [x] Badge
- [x] Skeleton
- [x] Loading
- [x] Select
- [x] Slider
- [x] ScrollArea
- [x] Input / Textarea
- [x] NumberField
- [x] DatePicker (Popover + react-day-picker)
- [x] OTP (InputOTP via input-otp)
- [x] PhoneInput (Select + Input composition)
- [x] FAB (Button composition)
- [x] Popover (new primitive, used by DatePicker)

**Migration complete.** Every legacy component is preserved as `Legacy*`
for back-compat; demo routes pair `(legacy)` and `(new)` side by side.
Next priorities live in this file's Phase 2 sections.

---

## Roadmap — onboarding + data-collection journey apps

Components to add to make this library a strong primary toolkit for
customer onboarding flows, KYC journeys, surveys, and form-heavy
application apps. Prioritized by ROI based on modern form / onboarding
UX research (Baymard, Stripe Elements, NNG, *Form Design Patterns*).

### Tier 1 — high-impact essentials (build first)

- [x] **Stepper / Wizard** — compound API: `Stepper` / `StepperList` /
      `StepperPanel` / `StepperNavigation` + `useStepper()` hook.
      Horizontal + vertical orientation, linear (default) +
      non-linear modes, per-step status override (`pending` /
      `current` / `completed` / `error`), `onBeforeNext` gate so
      `form.trigger()` blocks forward navigation on validation
      failure. Demo at `/stepper` wires a 4-step onboarding with
      RHF + Zod.
- [x] **Tabs** — Radix-backed compound (Tabs / TabsList / TabsTrigger /
      TabsContent). `underline` (default) + `pills` variants, both
      with horizontal + vertical orientation. Disabled triggers,
      controlled + uncontrolled. Demo at `/tabs`.
- [x] **Accordion / Collapsible** — Radix-backed (Accordion /
      AccordionItem / AccordionTrigger / AccordionContent). `single`
      + `multiple` expand modes; `single collapsible` for closeable
      one-at-a-time. Animated height transition via Radix's
      `--radix-accordion-content-height` + keyframes in tokens.css.
      Demo at `/accordion`.
- [x] **Card** — generic surface (Card / CardHeader / CardTitle /
      CardDescription / CardContent / CardFooter) with `elevated` /
      `outlined` (default) / `ghost` variants. Plus **SelectableCard**
      + **SelectableCardGroup** on top of Radix RadioGroup for the
      onboarding "pick one" pattern (goal picker, plan picker) with
      icon / title / description / badge slots and a check indicator
      when selected. Demo at `/card`.
- [x] **Drawer / Sheet** — Radix Dialog with slide-from-edge animation.
      `side` prop: right (default) / left / top / bottom. Compound API
      (Sheet / SheetTrigger / SheetContent / SheetHeader / SheetTitle
      / SheetDescription / SheetFooter / SheetClose). Built-in ✕
      (toggleable via `showCloseButton={false}`). Demo at `/sheet`.
- [x] **Empty State** — compound API (Icon / Title / Description /
      Actions). `size` sm/md/lg, optional `bordered` dashed-frame for
      drop-zones / placeholder regions. Demo at `/empty-state`.
- [x] **Banner** — compound API mirroring Alert (Icon / Content / Title
      / Description / Actions / Close); spans container width, optional
      `sticky` pin to viewport top. 6 color tokens. Demo at `/banner`.
- [ ] **Stepper-progress visualization** — numbered-dot horizontal bar
      separate from the wizard itself + "Step 2 of 5" label. Distinct
      from `<Progress>` which is a `<progress>`-style bar.

### Tier 2 — journey-specific (KYC, surveys, signups)

- [ ] **Signature pad** — canvas-based drawing → SVG / data URL. Loan
      disclosure, T&Cs, healthcare consent.
- [ ] **Camera capture / Selfie** — `getUserMedia` wrapper with
      front/rear toggle, capture, retake. KYC liveness + profile photo.
- [ ] **ID document upload** — specialized FileUpload variant with
      front + back slots, edge detection / glare warnings, crop,
      file-type lock.
- [ ] **Image cropper** — after upload or capture. Circle / rect modes,
      zoom, rotate. Pairs with Camera capture + Avatar uploader.
- [ ] **Address autocomplete** — Combobox + provider adapter
      (Google Places / Mapbox / OS). Single biggest checkout-time
      reducer (~30 % per Baymard).
- [x] **Rating** (5-star) — `<Rating>` with hover preview, arrow-key
      nav (radiogroup semantics), 3 sizes, customizable `max`,
      `allowClear` toggle on the active star, read-only display mode,
      optional hidden input for native form submission. Demo at
      `/rating`.
- [x] **NPS** — `<NPS>` 0–10 strip with standard detractor (0–6) /
      passive (7–8) / promoter (9–10) buckets color-coded via existing
      error/warning/success tokens. Selected score gets the saturated
      bucket fill. Anchor labels customizable, optional bucket caption
      below ("8 · Promoter"). Demo at `/nps`.
- [x] **Likert scale** — `<Likert>` n-point attitudinal scale.
      Default 5-point Strongly disagree → Strongly agree; pass
      `options` for any attitudinal scale (agreement / frequency /
      importance / ease / satisfaction). Two layouts: `segmented`
      (default — compact pill strip) and `stacked` (vertical radio
      list, more readable). Demo at `/likert`.
- [x] **Range slider** (two-handle) — already shipped. The existing
      `<Slider>` auto-renders one Radix Thumb per value in the array
      (`defaultValue={[20, 80]}`), so range is just an array-shaped
      value. Demo at `/slider-new` section 3.
- [x] **Date-range picker** — `<DateRangePicker>` built on
      react-day-picker's `mode="range"` inside a Popover. Returns the
      DateRange shape `{from?, to?}`. Default `numberOfMonths={2}` for
      the Airbnb / Booking side-by-side layout; drop to 1 for narrow
      popovers. Re-uses the existing Calendar component. Demo at
      `/date-range-picker`.
- [x] **Tag / chip input** — `<TagInput>` with type+Enter commit,
      Backspace-on-empty remove, paste-splits-on-delimiters, optional
      per-tag `validate`, `max` cap, `unique` dedupe. Chips render as
      removable pills (or via a `renderTag` override). Demo at
      `/tag-input`.
- [x] **Multi-select Combobox** — `<MultiCombobox>` sibling of
      Combobox with `value: string[]` semantics. Selected items render
      as removable chips inside the trigger with `maxDisplayed`
      collapse into "+N more". Same sync / async option-loading story
      as Combobox (debounce + AbortController + monotonic seq). Label
      cache keeps chip labels human even when the async result page
      rotates. Built-in Clear-all footer affordance. Demo at
      `/multi-combobox`.

### Tier 3 — friction reducers (move the needle on completion)

- [ ] **Inline help / hint icon** — small `?` next to a field label;
      tooltip on hover, popover on tap. Reduces support tickets.
- [ ] **AutoSaveIndicator** — "Saved 2 s ago" / "Saving…" badge.
      Auto-save is table-stakes for any form ≥ 2 minutes long.
- [ ] **RestoreDraftPrompt** — "We found unsaved work from yesterday.
      Restore?". Pairs with `useAutoSave` hook below.
- [ ] **Onboarding tour / coachmarks** — spotlight + tooltip sequence
      (Shepherd / Driver.js patterns) for post-signup product tours.
- [ ] **Confirmation-with-typing AlertDialog** — "Type DELETE to
      confirm". Variant of existing AlertDialog.
- [ ] **Field error / success border state** — auto red/green ring
      after blur tied to RHF state. Visual sibling of FormMessage.

### Tier 4 — specialized but high-leverage in the right vertical

- [ ] **Currency input** — NumberField + locale-aware formatting +
      symbol prefix + thousand separators (₹1,00,000 vs $100,000).
- [x] **Time picker** + **DateTime picker** — scheduling /
      appointments. _Shipped: segmented HH:MM(:SS) input, 12h / 24h,
      AM/PM, auto-advance + arrow stepping; DateTimePicker composes
      Calendar + TimePicker in one Popover._
- [ ] **Country picker** — specialized Combobox with flag + ISO + dial
      code. Often paired with PhoneInput.
- [x] **QR scanner** — `getUserMedia` + jsQR. Payments, doc handoff,
      device pairing. _Shipped: native `BarcodeDetector` (Chromium /
      Safari 17+) with `decode` escape hatch for browsers without it
      so the library doesn't bundle a heavy polyfill._
- [ ] **Command palette** — `cmdk` already a dep via Combobox; surface
      as `<CommandPalette open shortcut="cmd+k">` for power-user apps.
- [ ] **Map / geolocation picker** — pluggable Leaflet / Mapbox;
      pick-a-pin or "near me" for service apps.

### Cross-cutting (patterns / hooks, not components)

- [ ] **Conditional fields** as a Form-builder pattern
      (`<BoundField visibleWhen={…}>`). Critical in journey apps where
      Q3 only appears if Q2 = X.
- [ ] **`useAutoSave(form, fn)`** — debounced save with a small state
      machine (idle / saving / saved / error). Powers
      AutoSaveIndicator + RestoreDraftPrompt.
- [ ] **`useFormFlow` / step-graph** — non-linear stepper navigation
      where the next step depends on previous answers.
- [ ] **RTL + locale audit** — token system already covers the visual
      half; verify `dir="rtl"` works through every primitive (Radix
      handles most, but DataTable / DropdownMenu position calcs may
      need a pass).

### Recommended initial cut

If we're optimizing for "we can build a real onboarding flow tomorrow",
the smallest shipable set is:

1. Stepper / Wizard
2. Card (selection variant)
3. Drawer / Sheet
4. Address autocomplete (with a swappable provider adapter)
5. Signature pad

---

## Roadmap — CRM & ERP-class applications

The onboarding roadmap above optimises for forms-heavy linear journeys.
Building **CRM (with kanban)** and **ERP (with master + transaction
nested forms)** apps surfaces a new class of needs: long-lived record
views, drag-and-drop pipelines, line-item grids, hierarchy navigation,
and dense desktop layouts. This section captures the gap; group by
component class (primitive / compound / layout / hook) so authors can
slot work into the right tier of the library.

### Layout primitives (cross-cutting; both CRM and ERP need them)

- [ ] **ResizablePanes / Splitter** — horizontal + vertical split with a
      draggable gutter; persists ratio in localStorage. Master-detail
      and side-by-side panels rely on this.
- [ ] **MasterDetailLayout** — opinionated two-pane wrapper on top of
      ResizablePanes (list left, detail right, mobile = stacked).
- [ ] **PageHeader** — title + subtitle + breadcrumb + actions slot.
      Every CRUD page rolls its own today; standardise.
- [ ] **Toolbar** — action-bar primitive with overflow `…` menu when
      space is tight. Useful in card-detail, line-item rows, kanban
      column headers.

### Display compound components

- [ ] **KanbanBoard** — multi-column draggable cards (@dnd-kit, already
      a dep). Drag between columns, optional WIP limits, swim lanes,
      virtualised column body for long lists. CRM-anchor component.
- [ ] **Timeline / ActivityFeed** — chronological list of events with
      icon prefix + day-grouping + "load more". Deal history, customer
      interactions, audit log.
- [ ] **TreeView** — hierarchical list with expand/collapse, drag-to-
      reparent, lazy-load children. Chart of accounts, BOM, org tree,
      folder structures.
- [ ] **PipelineStages** — read-only horizontal stage indicator (Lead
      → Qualified → Proposal → Won). Cousin of Stepper but for display
      rather than navigation.
- [ ] **ApprovalChain** — multi-stage approval indicator with avatars +
      status per stage. ERP / workflow staple.
- [ ] **AuditTrail** — who-changed-what diff list. Shaped like Timeline
      but rows are `{ field, oldValue, newValue, by, at }`.
- [x] **NotificationsInbox** — bell + dropdown panel with read/unread,
      grouping by day, action buttons inline. _Shipped: Popover-backed
      panel, auto unread-count badge with `99+` cap and override,
      day-grouped sections (Today / Yesterday / weekday / date),
      per-row actions slot, controlled open, `onItemSelect` +
      `onMarkAllRead` + optional `onViewAll` footer link._
- [ ] **UserMenu / WorkspaceSwitcher** — top-right account chip + org
      switcher. Universal across CRM/ERP/SaaS.

### Form / input primitives (record-detail editors)

- [ ] **InlineEdit** — standalone click-to-edit text/select/date field
      for record-detail pages. DataTable already has cell-level edit;
      this is the surface for single-record screens.
- [ ] **LookupField** — code+description autocomplete with "create
      new on the fly" (vendor / customer / item picker). Scan-by-code
      semantics are different from MultiCombobox's filter-by-substring.
- [ ] **AddressBlock** — composite (line1 / line2 / city / state / zip
      / country) with country-aware label swaps + per-country
      validation hooks. Pairs with the Tier-4 address autocomplete.
- [ ] **TagPicker** — multi-tag with creatable + per-tag color
      management. TagInput is the input layer; this adds the color
      registry.
- [ ] **MentionsInput** — `@username` autocomplete on a Textarea.
      Cmdk-powered, similar in shape to MultiCombobox.
- [ ] **ContextMenu** — right-click menu. Radix `ContextMenu` exists
      and is unwrapped; ~30-min wrap to land it.

### Form composition compounds (ERP master + transaction shape)

- [ ] **LineItems / RepeatingFields** — header + row pattern (invoice
      header + N line items) with add / duplicate / delete / reorder,
      RHF `useFieldArray` integration. Drives ~80 % of ERP UIs.
- [ ] **EditableGrid** — spreadsheet-feel data entry: Tab moves
      cell→cell, paste-from-Excel, copy-down (Ctrl+D), formula cells.
      Distinct from DataTable's one-cell inline edit; this is the
      data-entry version. ERP-anchor component.
- [ ] **FormSection** — Accordion-shaped but form-aware: validates
      collapsed sections, shows an error-count badge on the section
      header, scrolls into view on first invalid submit.
- [ ] **CommentThread** — threaded comments with author + timestamp +
      reply layout + edit / delete + soft-deleted markers. Anchor for
      collaboration features.

### Hooks / patterns (no JSX surface)

- [ ] **useCalculatedField** — derived RHF field that recomputes from
      sibling values (line total, GST, grand total). Thin RHF helper.
- [ ] **useConditionalField** — show / hide / require based on another
      field's value. Pairs with the onboarding-roadmap entry but
      formalises it as a hook with a TypeScript-friendly predicate.

### Anchor components — build these first

Just like Stepper + Sheet anchored the onboarding tier, two components
unlock the bulk of CRM/ERP use cases:

1. **KanbanBoard** — unlocks CRM-class apps.
2. **LineItems + EditableGrid** (paired) — unlocks ERP-class apps.

The rest in this section is half-day or less per item; these two are
the 1–2-day builds where the depth investment shows up.

---

## Zen-shaped work — queued (2026-07-15, reconciled 2026-07-20)

Tracked against `docs/fiori-gap-analysis.md`. Tier numbering is that doc's.
Carbon work is tracked in its own section below — it had no home here until
2026-07-20, which is why three of its foundation items sat unnoticed for five
releases.

**Reconciled 2026-07-20 against 8.0.0**, checked against all four `index.ts`
files. Six rows were reporting open for work that had shipped. **The cost basis
also changed and nothing here was re-priced for it:** vanilla (7.0.0) and
web-components (7.2.0) mean a component family now costs three real
implementations rather than two, while `packages/core` work still costs one.

**Done, both bindings**: icon set (48), Object atoms, Button family, Tree,
Toolbar (overflow), Page, Bar, ShellBar, FlexibleColumnLayout, DynamicPage,
ObjectPageLayout, SelectDialog, ValueHelp, Sidebar sub-items + collapsed flyout.

**Tier 1 is closed** (2026-07-15). Tier 2 is roughly half and was previously
untracked here. Tier 3 is 2 of 4 dialogs. Status below is checked against
`index.ts` exports in both bindings, not against memory of what a session said it
built — Tier 1 spent a day marked done while a row was missing.

- [ ] **`Page` and `Bar` have no demo or nav entry.** Shipped in 9aab1eb as
      exports only, so they violate the "add it to nav.ts, add its Route" rule
      and are invisible in both demos. Everything else Zen-shaped has a demo.
- [ ] **SKILLS.md (or similar) so coding agents can drive this library.**
      Requested 2026-07-15. Claude / Cursor / Antigravity currently have to
      infer the API from source. Wants: the `zen-` prefix rule and why variants
      sit outside it, the compound-component patterns, the parity rule (a
      component added to one binding must be added to the other), the token /
      theming surface, and per-family usage snippets. `nav.ts` + the demos are
      the obvious generation source — they already enumerate every component
      with a description. Decide: one root SKILLS.md, or a real Agent Skill
      (SKILL.md + frontmatter) that tools can auto-load.

- [ ] **Global search across the demo** (requested) — a Cmd/Ctrl-K command
      palette over every route. Natural fit: `Command` now exists in both
      bindings, and `src/nav.ts` is already the single source of truth for the
      sidebar AND the landing catalogue, so the palette can render from it with
      no third list to drift. Must land in React AND Solid per the parity rule.
- [x] **Tier 1 — app frame. Closed 2026-07-15, all 9 of the gap doc's rows.**
      Had been marked done earlier that day, but that entry scoped "app frame"
      to the four components that session happened to build while the tier's
      table has nine rows. Re-opened after checking exports, then closed
      properly: SideNavigation's real gaps (sub-items + flyout) shipped, and
      NavigationLayout deliberately not built. Two of the nine rows were
      already-shipped components the earlier entry simply had not counted.
  - [x] **SideNavigation behaviours** — done 2026-07-15, both bindings, as an
        extension of `Sidebar` rather than a second nav shell (decided with the
        gap doc's recommendation in view; two collapsible sidebars would drift).
        **The gap doc is wrong about the premise**: it says `Sidebar` has "no
        collapse-to-icons + popup-menu behavior", but collapse-to-icons was
        already there. The actual gaps were sub-items and the popup, both now
        shipped as `SidebarMenuSub` / `SidebarMenuSubItem` /
        `SidebarMenuSubButton`. The tier's `(+ Group, Item, SubItem)` maps to
        `SidebarGroup` / `SidebarMenuItem` / `SidebarMenuSubItem`.
        `SidebarMenuSub` owns the trigger, the open state and the list, so the
        same children render inline when expanded and inside a flyout Popover
        when collapsed. Diverges from shadcn, where `SidebarMenuSub` is only the
        `<ul>` — noted in the component docstring. 13 behaviours driven per
        binding (`subnav-verify.tmp.mjs`).
  - [x] **`NavigationLayout` will not be built** (decided 2026-07-15). The gap
        doc's row is "NavigationLayout + SideNavigation" and only the
        SideNavigation half exists, but the row's own note scopes the gap to
        "collapse-to-icons + popup-menu behavior", which is closed. The wrapper
        is `<ShellBar/>` above a flex row of `<Sidebar/>` and `<Page/>`: a
        component that owns no state and no behaviour, only a div. Everything
        exported is a promise, and this one would buy nothing a caller cannot
        write in four lines. Revisit only if a real layout concern shows up
        (persisted rail width, responsive collapse breakpoints).
  - [ ] _Pre-existing demo cosmetic, both bindings_: `<strong>Acme</strong>` in
        the Sidebar demo's header does not hide when the rail collapses, so it
        spills over the page content. The demo's brand is caller-land, but
        `Sidebar` also has no `overflow-hidden` to contain it. Visible in
        section 1 since before this work. Left alone — changing the aside's
        overflow is a behaviour change for consumers.
  - [x] Page, Bar, Toolbar (overflow), Tree — earlier commits. Page and Bar
        still have no demo or nav entry (see the item above).
  - [x] ShellBar, FlexibleColumnLayout, DynamicPage (snapping header),
        ObjectPageLayout (scroll-spy anchors) — done 2026-07-15.
        Both bindings: component + demo + nav entry + route. Two bugs found by
        driving the demo rather than by tsc, lint or the build — all three were
        green throughout:
        - `ObjectStatus` renders its `stateAnnouncement` in an `sr-only` span,
          which is `position: absolute` with no positioned ancestor. Inside
          ObjectPageLayout's scroller it escaped to the initial containing block,
          grew the document to 3343px and let the whole app shell scroll away —
          a clipped sidebar over white space. Fixed with `zen-relative` on the
          wrapper, in both bindings.
        - React's `FlexibleColumnLayout` memoised `present` on the column
          *nodes*. Inline JSX (`startColumn={<OrderList />}`) is a new identity
          every render, so `present`/`columns`/`detail` all churned, firing the
          `[detail]` effect → `onLayoutChange` → caller setState → render. 99.6%
          idle CPU, and it starved React's queue so route changes updated the URL
          without ever committing the new page. Keyed on booleans now. Solid was
          unaffected (fine-grained reactivity).
- [ ] **Tier 2 — enterprise semantics. Roughly half.** Untracked here until
      2026-07-15: this section used to jump Tier 1 → Tier 3, so a whole tier of
      "high value, tractable to build" work was invisible. Small components that
      carry disproportionate weight in enterprise UIs — and unlike Tier 4, none
      of them assume an SAP backend, which makes this the tier most likely to
      earn its keep.
  - [x] Object atoms (ObjectStatus, ObjectNumber, ObjectIdentifier,
        ObjectMarker), Button family (SegmentedButton, SplitButton,
        ToggleButton), icon set (48).
  - [x] _Already covered by existing components_: MessageStrip → `Alert` /
        `Banner`; StepInput → `NumberField`; BusyIndicator / BusyDialog →
        `Loading`.
  - [ ] **MessagePopover / MessageView** — aggregated form validation grouped by
        severity, click-to-navigate-to-field. No equivalent, and the gap doc
        flags it as high value for `Form`. **Best-value item in the tier.**
  - [x] **DynamicDateRange** — semantic relative dates ("Today", "Last 7 Days",
        "This Quarter", "From…"). Shipped, all four bindings; 32 operators, engine
        in `core/date-range`, and the value stores the PERIOD rather than the two
        dates it resolves to, so a saved filter re-resolves. Verified 2026-07-20.
  - [ ] Typography layer — ~~Link~~ / Title / Label / Text / ExpandableText
        (show-more/less). **`Link` shipped, all four bindings.** The other four are
        still absent (verified 2026-07-20 — `Label` exists only as `FormLabel`).
        The *token* half closed separately: 17 `--zen-font-*` + 9 `--zen-line-*`
        now ship, so this is no longer "no typography primitives at all".
  - [ ] ObjectAttribute, InfoLabel / GenericTag, QuickView / QuickViewCard.
  - [x] ColorPicker / ColorPalette, MaskInput, Carousel — all shipped, all four
        bindings. Verified 2026-07-20.
  - [ ] _Upgrades to something that already exists, not new builds_: MessageBox
        (semantic presets over `AlertDialog`), IllustratedMessage (`EmptyState`
        + an illustration set), Panel (`Accordion` is partial), MenuButton
        (`DropdownMenu` composes to it), Token / Tokenizer (`TagInput` is
        close), Wizard branching + validation gating (`Stepper` lacks it).

- [ ] **Tier 3 — table ecosystem. 2 of 4 dialogs.** Persistence question settled
      2026-07-15: **build the stateless dialogs first**, defer anything that
      needs a store.
      - [x] SelectDialog — searchable list picker, single + multi select.
            Done 2026-07-15, both bindings: component + demo + nav + route,
            15 behaviours driven per binding (`sd-verify.tmp.mjs`). Single
            commits on click; multi drafts until OK and Cancel restores the
            open-time selection. `onConfirm` reports ids in **list order**, not
            tick order, matching UI5's `selectedContexts` — ids the current
            `items` no longer holds (rotated `onSearch` page) keep their draft
            order on the end rather than being dropped.
            Three bugs, none of which tsc / lint / the build could see:
            - **Kobalte clobbers its own `Dialog.Content`.** `dialog` and
              `alert-dialog` both do `Object.assign(DialogRoot, …)` on the SAME
              root function, so importing both leaves `Dialog === AlertDialog`
              and the last module evaluated owns `.Content`. Every plain Dialog
              **and Sheet** in the Solid binding was announcing
              `role="alertdialog"` to screen readers. Fixed by importing the
              per-module `Root`/`Content` named exports instead of reaching
              through the mutated namespace object. Kobalte 0.13.11 — upstream,
              so re-check on upgrade; `role-verify.tmp.mjs` guards all three
              roles.
            - **`CodeExample` mounted every demo child twice.** `props.children`
              is a getter, and it was read once to test presence and again to
              render, so each read rebuilt the caller's JSX. Invisible for a
              plain Button (the spare is never inserted) but a child that
              portals mounts anyway — /select-dialog opened two stacked dialogs
              per click. Fixed with Solid's `children()` helper. Worth a sweep:
              any Solid demo child that portals had the same duplicate.
            - Multi-select committed in tick order (see above).
      - [x] ValueHelp — the F4 field picker. Done 2026-07-15, both bindings:
            component + demo + nav + route, 15 behaviours driven per binding
            (`vh-verify.tmp.mjs`). Two tabs — **Select** (the shared list) and
            **Conditions** (include/exclude, 9 operators, `BT` revealing a second
            bound). Both halves commit together from `onConfirm`, because a real
            filter is "these three, plus anything starting with X".
            Unlike SelectDialog, a row click never commits: the Conditions tab
            needs an OK too, so OK is the only way out. Rules with no value are
            dropped on commit (and a `BT` missing either bound is not a range) —
            committing them would be a silent no-op.
            The list is shared via `select-list`, extracted in 8e7a744 rather
            than duplicated; a Dialog cannot nest inside another Dialog's tab.
            Surfaced two Solid a11y bugs, both wider than ValueHelp — see
            Known-latent below.
      - [x] ViewSettingsDialog — sort / group / filter settings. Shipped, all four
            bindings. Verified 2026-07-20.
      - [x] FilterBar — filter fields + Go / Adapt Filters, variant slot. Shipped,
            all four bindings. Verified 2026-07-20. **Tier 3's dialogs are closed.**
      - [ ] _Deferred until saved views have a home_: VariantManagement, p13n
            dialog. Both are storage questions wearing a component costume.
      - [ ] **TreeTable — wanted** (stated 2026-07-20). Hierarchical grid table.
            Promoted out of the _Separate_ bucket below on request. Both halves
            already exist — `Tree` and `DataTable` — so the open question is whether
            this is expansion state threaded through DataTable's row model or a
            distinct component. Decide that before building; it is the difference
            between a prop and a family. Note `enableGrouping` is already hard-gated
            against `enableVirtualization`, and hierarchy has the same shape, so
            check that interaction first.
      - [ ] _Separate_: AnalyticalTable, spreadsheet export — extensions of
            DataTable, not dialogs around it.
- [ ] **Tier 4 — build the whole tier** (decided 2026-07-15, overriding the
      recommendation below): smart controls, micro charts, launchpad tiles,
      planning calendars, floorplans.

      The gap analysis recommends AGAINST this and that reasoning still stands
      — these encode SAP's backend, OData annotations and Launchpad rather than
      a design language, so they are the tier most likely to age badly or need
      a real SAP integration to be worth anything. Recorded here so the
      trade-off is visible rather than re-litigated: the call was made with the
      recommendation in view. Micro charts are the most defensible piece (small
      sparkline / bullet / radial charts are design-language); smart controls
      are the least (they assume annotations we do not have).

      **Re-confirm before starting (flagged 2026-07-20).** Nothing has been built
      against this decision in five releases, and it was taken when a component
      cost two implementations. At three, this tier is 40+ families × 3 — the
      largest block of declared-but-unstarted work in the repo. If it is still
      wanted, the defensible cut is micro charts alone; if it is not, deleting
      the row is worth more than leaving it as standing intent nobody is acting
      on.

## Carbon-shaped work — queued (2026-07-20)

Tracked against `docs/carbon-gap-analysis.md`. **This section did not exist until
2026-07-20**, which is the whole reason its foundation items went five releases
without being looked at: the shortlist lived only in the gap doc, and the gap doc
is not what anyone opens when picking up work.

Its thirteen-item shortlist is **8 done, 5 open**. The eight closed without ever
being tracked here — Link, Search, PasswordInput, SkipToContent, type tokens,
motion tokens (with `prefers-reduced-motion`), and ContentSwitcher (closed by
`SegmentedButton`, under Fiori's name). The five below are what is left.

- [x] **`<Theme>` subtree scoping — Phase 1 done 2026-07-20.** The three theme
      blocks in `tokens.css` are now unanchored `[data-theme="…"]`, and every
      binding exports a `<Theme name>` wrapper (`transparent` renders it
      `display: contents` so it adds no box). `applyTheme()` is unchanged; the
      document-wide switch still works exactly as before.
      Verified in a browser against the BUILT stylesheet, not the source: nesting
      resolves to the nearest themed ancestor (dark panel containing a zen-theme
      panel gives three distinct palettes), and the demo's Welcome "Themes" cards
      now render differently from each other — they had been showing one theme
      three times since they were written, because `:root[data-theme]` cannot
      match a `<div>`. That was a live bug this change fixes.
      **Do not re-anchor the `:root` blocks for fonts / motion / reduced-motion.**
      They are deliberately not per-theme, and specificity now ties at (0,1,0), so
      source order is load-bearing — comment in `tokens.css` explains it.
  - [ ] **Phase 2 — portalled content escapes the scope.** A Dialog / Popover /
        Sheet / Tooltip / DropdownMenu opened inside a `<Theme>` renders through a
        portal into `<body>` and falls back to the document theme. Measured:
        **6 components in React, 9 in Solid** (adds Combobox, MultiCombobox,
        pivot-filter-menu), and vanilla has **37** `document.body.append` sites to
        survey. The approach is decided: a context carries the theme NAME and the
        portalled content re-applies `data-theme` at the portal root — NOT
        portalling into the themed div, which would re-introduce the clipping and
        stacking problems portals exist to solve. Both APIs support either
        (Radix `container`, Solid `mount`). Deferred because there is no demand
        yet and it is most of the cost.
  - [x] **`Theme` demo + nav entry — done 2026-07-20, all four bindings.**
        Four sections: scoping, nesting, `transparent`, and an honest one on the
        portal limitation. The concrete cost of the gap, while it existed: because
        `AGENTS.md` is generated from React's `nav.ts`, `Theme` was invisible to
        every consumer's coding agent, and `check:agent-guide` passed precisely
        because the generator and `nav.ts` agreed it did not exist.
- [ ] **`Grid` / `Column` + breakpoint tokens** — zero breakpoint tokens in core;
      `Stack` is the only layout primitive. zen-ui now ships a full app frame
      (ShellBar, FlexibleColumnLayout, Page) with no layout system underneath it.
      Carbon's numbers if a scale is wanted: 320/672/1056/1312/1584px at 4/8/16/16/16
      columns.
- [x] **The Layer model — DECIDED: no. 2026-07-20.** Not deferred, not "revisit
      next quarter" — declined, with the conditions for reopening written below so
      it stops being re-discovered on every read of the gap doc.

      **The reason is not cost, it is that zen-ui already solved this problem a
      different way.** Carbon needs contextual surface tokens because Carbon
      delineates containers *by surface*: its tiles are largely borderless, so a
      card on a card is invisible unless the backgrounds differ, and `$layer` is
      the machinery that makes them differ. zen-ui delineates *by border and
      shadow*. Measured: `Card` is `zen-rounded-zen-md zen-border
      zen-bg-zen-background` and `DialogContent` is `zen-rounded-zen-md zen-border
      zen-border-zen-border zen-bg-zen-background zen-shadow-zen-lg` — so a Card
      inside a Dialog *is* white-on-white, and the boundary still reads, because
      the border draws it. The nesting problem the Layer model exists to solve is
      already handled; adopting Layer would mean either running two delineation
      strategies at once, or migrating off borders onto surfaces, which is a total
      restyle of every container in the library.

      Dark mode, where Carbon's monotonic ascent matters most, already does the
      right thing on a smaller scale: `background` #0F172A → `muted` #1F2937 →
      `border` #334155 ascends exactly as Carbon's g100 does, with two steps
      instead of four and an explicit border on top.

      Cost, for the record, since it is what the gap doc led with: ~60 component
      files per binding use the flat surface tokens (React 60, Solid 63, vanilla
      59 — ~180 files), and React alone has 152 occurrences (90 `zen-bg-zen-muted`
      + 62 `zen-bg-zen-background`). Every one becomes a contextual token. Per
      CLAUDE.md that is a major bump. **But cost is the second reason, not the
      first** — a genuinely missing capability would be worth 180 files.

      One implementation note that would matter if this is ever reopened: Carbon's
      Layer is React context, and **vanilla has no context mechanism at all**
      (imperative factories, zero `createContext`/Provider). A port would either
      need explicit level props threaded by callers in vanilla — which defeats the
      whole point, since the payoff is that authors never name a level — or a
      CSS-only implementation using descendant selectors
      (`[data-layer] [data-layer]`), which would cost one implementation in core
      rather than three. **If reopened, cost the CSS-only version first**; the gap
      doc's "~15 lines of React" framing does not survive contact with four
      bindings.

      **Reopen if any of these becomes true**, and not otherwise:
      - a borderless / surface-delineated visual direction is adopted (this is the
        real trigger — it makes Layer necessary rather than redundant);
      - a consumer reports a nesting depth where borders genuinely stop reading,
        with a screenshot rather than a hypothesis;
      - a dense enterprise surface lands that nests 3+ containers deep with
        borders suppressed for visual calm.
- [ ] **Per-component a11y documentation** — Carbon ships an `accessibility.mdx`
      per component; zen-ui ships none. The gap doc's line is the one worth keeping:
      a11y as "a stated, tooled, per-component commitment rather than a best-effort".
      The `id`-on-wrapper bug and `SkipToContent` both closed; this is the half that
      survived.
- [ ] **Small components, unranked** — `Toggletip` (the accessible middle between
      Tooltip and Popover — content with interactive children must not live in a
      hover tooltip), `Tag` (dismissible; `Badge` is display-only and `TagInput` is
      an input, so neither covers it), `CopyButton`, `AspectRatio`, `CodeSnippet`,
      `Tile`/`TileGroup`, `Heading`/`Section` (auto-levelling headings — a
      structural a11y win; the gap doc's "nearly free if Layer lands" note is moot
      now that Layer is not landing soon). Individually cheap, collectively not, at
      three implementations each. Build on demand rather than as a batch.

### Also open, from the foundations comparison

- [x] **RTL audit — DONE 2026-07-20. Verdict: mostly works; three defect classes.**
      `scripts/visual-check.mjs` gained a `--dir` flag, so this is now re-runnable
      rather than a one-off: `node scripts/visual-check.mjs react --dir rtl`.
      RTL shots are suffixed `.rtl.png` so they never clobber the LTR baseline.

      **The good news, which was not a given:** overall layout mirrors correctly.
      Sidebar moves to the right, ShellBar contents mirror, DataTable column order
      flips, prose right-aligns. Flexbox/grid plus `dir` on `<html>` do the work,
      and no route logged a runtime error in RTL.

      **Enabling fact, verified by generating CSS rather than assuming:** every
      physical utility has a working logical counterpart under the `zen-` prefix —
      `zen-ms/me/ps/pe`, `zen-start/end`, `zen-border-s/e`, `zen-rounded-s/e`,
      `zen-text-start/end` all emit correct `*-inline-*` CSS. So remediation is
      mechanical, not a redesign.

      Scale of the review surface (NOT a defect count — many `left-0 right-0`
      pairs are symmetric and correct as they stand): **478 physical-direction
      utilities across 132 component files** — React 154/45, Solid 157/45,
      vanilla 167/42 — and **zero** logical utilities anywhere.

  - [x] **Defect 1 — FIXED 2026-07-20.** ~~`TableHead` hardcodes `zen-text-left`.~~
        `data-table/table.tsx:113`. In RTL the header label stays left-aligned
        while its column data flows right, so headers visibly do not line up with
        their own columns. Affects `Table` AND `DataTable`. Fix is
        `zen-text-left` → `zen-text-start`, which is **identical in LTR**
        (`text-align:start` resolves to `left`), so it is a zero-risk change that
        only affects the currently-broken direction. Same for the 21 other
        `zen-text-left` sites, reviewed individually. All three bindings.
  - [ ] **Defect 2 (library, invisible to screenshots) — direction never reaches
        Radix or Kobalte.** No binding renders a `DirectionProvider`, and grep
        finds no `dir` passed to any primitive (the only `dir=` hits are
        Carousel's own prev/next prop). The primitives therefore default to `ltr`
        internally no matter what `document.dir` says, so submenu open direction,
        arrow-key semantics in menus/tabs/sliders, and Slider fill direction do
        not flip. **This is the most important finding and the one the screenshot
        pass cannot see** — it is interaction behaviour, not layout.
        `@radix-ui/react-direction` is already available. Needs a decision on
        surface: read `document.dir` automatically, or expose a `dir` prop on a
        provider the consumer renders. Kobalte has its own equivalent to check.
  - [x] **Defect 3 — FIXED 2026-07-20.** ~~(demo only, not shipped) code blocks render RTL.~~
        `demo-helpers.tsx:62` renders `<pre className="example-code">` with no
        `dir="ltr"`, so every code sample reverses in RTL and is unreadable. Code
        is always LTR regardless of UI direction. Library ships no code blocks, so
        this is demo-side only — but it is in all four demos.

      **Defects 1 and 3 fixed 2026-07-20; Defect 2 remains** and is deliberately
      separate, because it needs an API decision rather than a sweep.

      On Defect 1's scope: the fix was a full `zen-text-left` -> `zen-text-start`
      and `zen-text-right` -> `zen-text-end` replacement, but only after reading
      all 69 sites. Every one was reading-direction alignment — button labels,
      table headers, dialog headers, list items, numeric columns — and not one
      was a deliberate physical left. 49 files across all four bindings plus
      `core/src/variants.ts`, whose `multiline` button variant had
      `zen-justify-start` (logical) sitting next to `zen-text-left` (physical) in
      the same class string, so the flex alignment flipped in RTL and the text
      alignment did not.

  - [ ] **Still physical, deliberately out of scope of Defect 1**: `ml/mr`,
        `pl/pr`, `left/right`, `border-l/r`, `rounded-l/r`. These need per-site
        reasoning about whether the thing being offset actually flips —
        `DialogHeader`'s `zen-pr-8` reserves room for a close button that DOES
        move in RTL, so it wants `pe-8`; a decorative offset may not. Re-run
        `node scripts/visual-check.mjs <binding> --dir rtl` and fix what the
        screenshots actually show, rather than sweeping 400+ sites blind.
- [ ] **Content density** (`cozy`/`compact`) — Fiori has a global density switch;
      zen-ui is fixed-size. Token-level, so one implementation. No demand recorded
      yet — do not build speculatively.
- [ ] **Spacing scale ends** — `--zen-space-*` runs 0→64px in 11 steps. Carbon
      reaches 160px for page rhythm and 2px for hairlines, and zen-ui has neither
      end. Two tokens.

### Known-latent, found while porting

- [ ] **Solid: a Select inside a Dialog has its options hidden from screen
      readers.** Found 2026-07-15 while driving ValueHelp; affects any
      Select-in-Dialog, not just that component, and React/Radix is unaffected.
      Kobalte's Dialog aria-hidden's every body-level sibling to enforce
      modality, and Kobalte's Select portals its listbox to the body, so the
      dialog hides the Select's own popup. Measured on /value-help: **9
      `li[role=option]` in the DOM, 0 in the accessibility tree** (the portal's
      container div carries `aria-hidden="true"`). It looks and clicks fine, so
      only an a11y-tree query catches it. `vh-verify.tmp.mjs` drives those
      options via raw DOM and prints a note each time, so the defect stays
      visible rather than silently passing.
      Fix is not obvious: rendering the listbox inside the dialog dodges the
      sweep but DialogContent is `overflow-hidden` and carries a transform,
      which becomes the containing block for `position: fixed`. Likely upstream.
      Same family as the `Dialog.Content` clobbering fixed in 3083781.
- [ ] **Solid: `<Select aria-label>` never reaches the control.** It lands on a
      wrapper `div[role=group]`, so the trigger has no accessible name and the
      label is announced on a group instead. React puts it on the trigger. Found
      alongside the above. Same class as the Checkbox/RadioGroupItem/Select `id`
      bug below — Kobalte roots swallow attributes meant for sub-parts.

- [ ] Checkbox, RadioGroupItem and Select land a caller's `id` on the wrapper
      rather than the native control, so `<label for>` will not associate —
      Kobalte derives sub-part ids from the root. Same class as the Switch bug
      already fixed.
- [ ] Solid lint: 57 findings on its first-ever run (33 `solid/reactivity`,
      4 `solid/no-destructure` in data-table). These silently break reactivity
      and are invisible to tsc and the build. Fixing them changes runtime
      behaviour, so it deserves its own commit.
- [ ] Demo section-count gap: React has ~305 code examples to Solid's 158,
      because Solid's demos have genuinely fewer SECTIONS. Closing it means
      adding sections, not snippets.
- [ ] `Toast` is the last export gap: React wraps Radix Toast primitives, Solid
      uses solid-toast. A real API divergence — converge or accept it.
