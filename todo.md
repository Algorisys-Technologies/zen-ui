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
- [ ] **Remote push** — branch only lives locally; `git remote add` +
      `git push -u` when ready for collaborators.
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
         `stickyHeader` for a 2-D freeze. Not wired into virtualized mode.
   - [x] `stickyHeader` — pin the `<thead>` to the top of the scroll viewport
         in non-virtualized mode. Body wraps in a `maxBodyHeight` container so
         sticky has a real scroll context. Virtualized mode already does this.
   - [ ] `enableRowGrouping` / expandable rows.
   - [x] **Per-column filters** — `enablePerColumnFilters` renders an
         Input row under each filterable header; composes with the
         global filter.
   - [x] **Multi-sort** — `enableMultiSort` prop; Shift-click adds a
         secondary sort. Header shows a small priority badge.
   - [x] **CSV / JSON export** — `enableExport` adds a toolbar menu;
         exports the filtered set (or `exportOnlySelected` for the
         checked rows). Utility columns (`__select`, `__drag`) excluded.

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

- [ ] **`prefers-reduced-motion`** — gate all CSS animations behind
      `@media (prefers-reduced-motion: no-preference)`.
- [ ] **RTL audit** — verify Radix's logical-property defaults render
      correctly in `dir="rtl"`.
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
