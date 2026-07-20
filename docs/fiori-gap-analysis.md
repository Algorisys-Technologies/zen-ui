# SAP Fiori for Web — Component Gap Analysis

**Surveyed:** 2026-07-14 against `@algorisys/zen-ui-react` 2.2.0 (branch `dev`, commit `f379e16`)
**Revised:** 2026-07-15 — Tier 1 and much of Tier 2 have been built since the survey, so the
status column and the executive summary were refreshed against `index.ts` rather than left
describing a library that no longer exists. Four rows had been reporting ❌ for components that
already shipped.
**Revised:** 2026-07-20 — again, against **8.0.0**. Tier 3's dialogs all closed (ViewSettingsDialog
and FilterBar shipped), as did ColorPicker/ColorPalette and the typography layer's `Link`. The
survey now covers **four** bindings, not two — vanilla landed in 7.0.0, web-components in 7.2.0 —
which changes every effort estimate below; see [Cost basis](#cost-basis-changed-2026-07-20).
Checked against all four `index.ts` files.
**Reference:** [SAP Fiori Design System for Web](https://www.sap.com/design-system/fiori-design-web)

## How this was compiled

`www.sap.com/design-system/fiori-design-web` returns **403 to every automated fetch** (WebFetch and curl alike), and `experience.sap.com/fiori-design-web` 301s into the same wall. The inventory below was therefore reconstructed from the authoritative machine-readable sources that back those guidelines:

| Source | What it gave us |
|---|---|
| `UI5/webcomponents` repo — `packages/{main,fiori,ai,compat}/src` | The modern Fiori-for-Web component set |
| `ui5.sap.com/docs/api/api-index.json` (v1.150.0, 4,505 symbols) | Authoritative control names across all libraries |
| `sdk.openui5.org/test-resources/sap/<lib>/designtime/api.json` | Public, non-deprecated `Control` subclasses per library |
| `@sapui5` / `@openui5` npm scopes via jsdelivr CDN | Raw control source, for exact `@since` / `@deprecated` tags |
| Wayback CDX of `experience.sap.com/fiori-design-web/*` (~29.6k URLs → 454 slugs) | The guidelines page inventory, incl. floorplans |

Two source notes worth recording, because they cost time:

- The GitHub org **renamed**: `SAP/ui5-webcomponents` → `UI5/webcomponents`, and `SAP/openui5` → `UI5/openui5`. Docs moved from the dead `sap.github.io/ui5-webcomponents` to `ui5.github.io/webcomponents/nightly/components/{main,fiori,ai}/<Name>/`.
- `ui5.sap.com/#/api/…` and `sdk.openui5.org/#/api/…` are Angular SPAs — fetching them yields only a page title. Use the `api.json` / `api-index.json` endpoints instead.

## Executive summary

zen-ui is a **shadcn/Radix-style general-purpose library**; Fiori is an **enterprise application design system**. This document was written when zen-ui covered the *form and primitive* layer well and was nearly absent at the *application frame* and *enterprise data* layers. Tiers 1–2 have largely been built since; the percentages below are current as of the revision date above, not as of the original survey.

Roughly:

- **Primitives / form controls** — ~90% covered. SegmentedButton, SplitButton, ToggleButton, Tree, Toolbar, MaskInput, ColorPicker, Carousel and DynamicDateRange have since been built; what remains is a typography layer and the illustration/icon sets, which are asset gaps rather than component gaps.
- **App frame** (ShellBar, FlexibleColumnLayout, DynamicPage, ObjectPage) — was 0%, now **built in both bindings**, plus `Page`/`Bar` and a light `PageHeader` for screens that want a heading rather than a snapping header. This was the largest gap and the one that most defines a "Fiori-like" app; it is closed.
- **Enterprise object atoms** (ObjectStatus/Number/Identifier/Marker) — was 0%, now **built in both bindings**. MessageStrip variants and QuickView remain.
- **Table ecosystem beyond the grid itself** — was ~15%. `SelectDialog`, `ValueHelp`, `ViewSettingsDialog` and `FilterBar` are built; **VariantManagement, p13n and export remain**, which is where the persistence story lives. *(2026-07-20: all four dialogs confirmed shipped in all bindings. **TreeTable is wanted** — see below — which moves it out of the "separate, extensions of DataTable" bucket it was parked in.)*
- **Tiles, micro charts, planning calendars, Smart controls** — **0% covered**, and mostly should stay that way (see the caveat below). *(2026-07-20: still 0%. Note that [todo.md](../todo.md) records a decision to build this entire tier, overriding the caveat below — that decision is now five releases old, unstarted, and was taken when a component cost two implementations rather than three.)*

An important scoping caveat: **most of what's listed below should not be built.** Fiori's tail (Smart controls, OData annotations, Analysis Path Framework, T-Account) is inseparable from SAP's backend. The value of this document is Tiers 1–2; Tiers 3–4 are recorded for completeness, not as a roadmap.

### Cost basis changed (2026-07-20)

This document and its 3.0.0-era estimates assumed **two** bindings. There are now four: React,
Solid, vanilla (7.0.0) and web-components (7.2.0). Because web-components is a declarative layer
over the vanilla factories and re-exports its surface verbatim, a new component family costs
**three real implementations** plus three demos and three `nav.ts` entries — a 50% increase over
what the recommendation section below priced.

Work in `packages/core` (tokens, engines like `core/mask` and `core/date-range`) still costs one.
The practical consequence: **the shortlist's ordering still holds, but the gap between its
core-level and component-level items widened.** Nothing in Tier 4 was re-priced for this.

## What zen-ui has today

Extracted from [packages/react/src/index.ts](packages/react/src/index.ts) (63 component families).
**Stale as of 2026-07-20** — the list below is the 2.2.0 inventory and is kept as the survey's
baseline, not as a current inventory. At 8.0.0 React exports 491 names across ~57 component
directories, Solid 500, vanilla 462. Do not read this section as "what exists"; run the delta
command in [CLAUDE.md](../CLAUDE.md) instead.

**Form & input** — Input, Textarea, NumberField, Checkbox, RadioGroup, Switch, Select, Slider (incl. range), TagInput, InputOTP, PhoneInput, FileUpload, Combobox, MultiCombobox, DatePicker, DateRangePicker, DateTimePicker, TimePicker, Calendar, Listbox, Form (RHF + Zod), FormBuilder, Bound\* field wrappers

**Display** — Avatar (+ Group), Badge, Card (+ SelectableCard), Separator, Skeleton, Loading, Progress, Rating, Stack, EmptyState, Tooltip

**Navigation** — Breadcrumb, Pagination, Sidebar, Tabs, Stepper, DropdownMenu, Command

**Overlay** — Dialog, AlertDialog, Popover, Sheet, Toast, Banner, Alert

**Data** — DataTable (TanStack Table + Virtual), Table, VirtualizedItems, Chart (line/bar/area)

**Other** — FAB, Accordion, ScrollArea, NotificationsInbox, QRScanner, Camera, Map, RichText, Survey (NPS / Likert / Rating), ThemeSwitcher

---

## Tier 1 — Structural gaps (define whether an app reads as "Fiori") — CLOSED

~~None of these exist in zen-ui in any form.~~ They are the app frame. **All nine rows shipped by
2026-07-15 and are confirmed present in all four bindings at 8.0.0**, except `NavigationLayout`,
which was deliberately not built — it owns no state and no behaviour, only a div (decision recorded
in [todo.md](../todo.md)). The table is kept for the descriptions; treat every row as ✅.

| Fiori component | What it is | Notes for zen-ui |
|---|---|---|
| **ShellBar** (+ Branding, Item, Search, Spacer) | Global app header: logo, product name, search, notifications, avatar/user menu | The single most recognizable Fiori element. Nothing in zen-ui composes to this. |
| **FlexibleColumnLayout** | 1–3 resizable columns for list → detail → detail, with responsive collapse rules | Master-detail is the dominant Fiori navigation pattern. |
| **DynamicPage** (+ Title, Header, HeaderActions) | Page with a collapsing/**snapping** header that shrinks on scroll, plus floating footer | Underpins List Report *and* Object Page. The snapping behavior is the hard part. |
| **ObjectPageLayout** (+ Section, SubSection, AnchorBar) | Object detail page with anchored, scroll-synced sections | `sap.uxap`'s whole reason to exist. |
| **NavigationLayout** + **SideNavigation** (+ Group, Item, SubItem) | Shell with collapsible side nav; collapsed state opens a NavigationMenu popup | zen-ui's `Sidebar` is a **partial** overlap — no collapse-to-icons + popup-menu behavior. |
| **Page** | Whole-screen container: header / content / footer | Trivial, but everything else assumes it. |
| **Toolbar** / **OverflowToolbar** (+ Button, Select, Separator, Spacer) | Horizontal action bar that **overflows into a menu** when space runs out | No zen-ui equivalent. The overflow logic is the value. |
| **Bar** | Header / subheader / footer layout bar | |
| **Tree** (+ TreeItem, TreeItemCustom) | Hierarchical expandable list | **Notable absence** — zen-ui has no tree of any kind. |

## Tier 2 — Enterprise semantics (high value, tractable to build)

These are small components that carry enormous weight in enterprise UIs.

### Object display atoms

| Component | What it is |
|---|---|
| **ObjectStatus** | Text/icon with semantic state (Success / Warning / Error / Information) |
| **ObjectNumber** | Number + unit with semantic coloring |
| **ObjectIdentifier** | Title + attribute pairing identifying an object |
| **ObjectMarker** | Flag / favorite / draft / locked indicators |
| **ObjectAttribute** | Label-value metadata line |
| **InfoLabel** / **GenericTag** | Small semantic status label |
| **QuickView** / **QuickViewCard** | Compact object preview in a popover |

### Messaging

| Component | What it is | zen-ui overlap |
|---|---|---|
| **MessageStrip** | Inline semantic banner | ✅ `Alert` / `Banner` cover this |
| **MessageBox** | Semantic modal (confirm / error / warning / success) | ⚠️ `AlertDialog` is close; lacks semantic presets |
| **MessagePopover** / **MessageView** | **Aggregated validation messages** from a form, grouped by severity, click-to-navigate-to-field | ❌ No equivalent. High value for `Form`. |

### Inputs & actions

| Component | What it is | zen-ui overlap |
|---|---|---|
| **SegmentedButton** (+ Item) | Mutually exclusive button group | ✅ `SegmentedButton` |
| **SplitButton** | Default action + dropdown arrow | ✅ `SplitButton` |
| **ToggleButton** | Button with pressed state | ✅ `ToggleButton` |
| **MenuButton** | Button opening a menu | ⚠️ `DropdownMenu` composes to this |
| **StepInput** | Numeric input with +/- steppers | ✅ `NumberField` |
| **ColorPicker** / **ColorPalette** (+ Item, Popover) | HSL/RGB picker; predefined swatch grid | ✅ `ColorPicker` + `ColorPalette`, all four bindings *(2026-07-20)* |
| **MaskInput** | Fixed character mask input | ✅ `MaskInput` — engine shared via `core/mask` |
| **DynamicDateRange** | **Semantic relative dates** — "Today", "Last 7 Days", "This Quarter", "From…" | ✅ `DynamicDateRange` — 32 operators; the value stores the PERIOD, not the dates, so a saved filter re-resolves. Engine in `core/date-range`. |
| **Token** / **Tokenizer** | Chip collection | ⚠️ `TagInput` is close |
| **Link**, **Title**, **Label**, **Text**, **ExpandableText** | Typography primitives; ExpandableText = show more/less | ⚠️ **`Link` shipped, all bindings.** `Title` / `Label` / `Text` / `ExpandableText` still absent — verified 2026-07-20, zero exports in any binding (`Label` exists only as `FormLabel`). The *token* half is closed: 17 `--zen-font-*` + 9 `--zen-line-*` now ship. |
| **Icon** | SVG icon from the SAP icon font (~1,000 icons) | ⚠️ `Icon` ships 48 hand-drawn glyphs and still no icon dependency. The set, not the component, is the gap. |
| **Panel** | Collapsible titled container | ⚠️ `Accordion` partially |
| **Carousel** | Swipeable rotating items | ✅ `Carousel` — CSS scroll-snap; every child is a slide, `perView` for a strip. No autoplay, by design. |
| **IllustratedMessage** | Empty/error state **with illustration** | ⚠️ `EmptyState` lacks the illustration set |
| **Wizard** (+ Step, Tab) | Multi-step guided task | ⚠️ `Stepper` is close; no branching/validation gating |
| **BusyIndicator** / **BusyDialog** | Spinner / modal blocker | ✅ `Loading` |

## Tier 3 — Data-heavy ecosystem (large effort, needs a backend story)

zen-ui's `DataTable` already implements sorting, filtering, grouping, pagination, column visibility, row selection, pinning, resizing and virtualization. What's missing is everything *around* the grid.

| Component | What it is | Gap |
|---|---|---|
| **FilterBar** / **SmartFilterBar** | Structured filter area above a table, with expand/collapse and "Adapt Filters" | ✅ `FilterBar`, all four bindings *(2026-07-20)*. `SmartFilterBar` is annotation-driven — not built, not wanted. |
| **VariantManagement** | **Save / load / share named personalization variants** (columns + filters + sort) | ❌ No persistence concept in zen-ui at all |
| **p13n.Popup** (+ SelectionPanel, SortPanel, GroupPanel) | The personalization dialog surface | ❌ zen-ui has the *state*, not the *dialog* |
| **table.columnmenu.Menu** (+ QuickSort, QuickGroup, QuickTotal, QuickResize, ActionItem) | Column-header quick-personalization popover | ❌ |
| **ValueHelpDialog** (F4 help) | Rich lookup dialog: search + list + **condition builder** (ranges, exclusions) | ✅ `ValueHelp`, all four bindings |
| **SelectDialog** / **TableSelectDialog** | Modal item picker with search + growing list | ✅ `SelectDialog`, all four bindings |
| **ViewSettingsDialog** (+ Sort/Filter/Group items) | Sort / filter / group settings dialog | ✅ `ViewSettingsDialog`, all four bindings *(2026-07-20)* |
| **AnalyticalTable** | Grid table with **aggregation and totals rows** | ❌ |
| **TreeTable** | Hierarchical grid table | ❌ — **wanted** (stated 2026-07-20). Promoted out of the "separate / extensions of DataTable" bucket; `Tree` and `DataTable` both exist, so this is a composition question rather than a new primitive. |
| **Export to Spreadsheet** (`sap.ui.export`) | Export table data to `.xlsx` | ❌ |
| **Growing** (`growingScrollToLoad`) | "More" button / infinite scroll from the model | ⚠️ Virtualization ≠ growing; different concern |
| **Sticky** (ColumnHeaders / HeaderToolbar / InfoToolbar / GroupHeaders) | Sticky table regions on scroll | ⚠️ Partial |

## Tier 4 — Fiori-specific surface (record, don't build)

Listed for completeness. Most of this is inseparable from SAP's backend, annotations, or Launchpad.

- **Tiles / Launchpad** — GenericTile, SlideTile, ActionTile, TileContent, NumericContent, FeedContent, NewsContent, ImageContent, GridContainer, GridList, ProductSwitch
- **Micro charts** (9) — Area, Bullet, Column, Comparison, Delta, HarveyBall, Line, Radial, StackedBar; plus Interactive Bar/Line/Donut charts
- **Charts** — Analytical Card, Bubble, Waterfall, Treemap, Gantt, Network Graph, Process Flow, Micro Process Flow, T-Account, Calculation Builder, 3D Viewport
- **Smart controls** (`sap.ui.comp`, OData V2-only) — SmartTable, SmartField, SmartForm, SmartChart, SmartLink, SmartFilterBar, SmartList, SmartVariantManagement, SmartMultiInput, SmartMultiEdit, 9× SmartMicroChart
  - *Correction to a common belief:* these are **not formally deprecated**. Inspecting `@sapui5/sap.ui.comp@1.144.0` source shows no class-level `@deprecated` tags — only `NavigationPopover` (deprecated 1.121 → `sap.ui.mdc.link.Panel`). The "replaced by `sap.ui.mdc`" story is a **roadmap statement**, not an API deprecation. `sap.ui.mdc` has been productive since 1.124 and is protocol-agnostic, which is why it exists.
- **Calendars** — PlanningCalendar, SinglePlanningCalendar (Day/Week/WorkWeek/Month views), CalendarLegend, SpecialCalendarDate
- **Content & collaboration** — Timeline (+ Item, GroupItem), UploadCollection / UploadSet, FeedInput, FeedListItem, MediaGallery, LightBox, PDFViewer, NotificationList (+ Item, GroupItem)
- **AI components** (`@ui5/webcomponents-ai`) — AI Button (+ ButtonState), PromptInput, WritingAssistant, AI Input, AI TextArea, ToolbarLabel, Versioning; plus `TableHeaderCellActionAI` in main
- **Search** — Search, SearchField, SearchItem, SearchItemGroup, SearchItemShowMore, SearchMessageArea, SearchScope
- **User** — UserMenu (+ Account, Item, ItemGroup), UserSettingsDialog (+ View, Item, AccountView, AppearanceView)
- **Misc** — SemanticPage + ~20 SemanticButton actions, SidePanel, HeaderContainer, BarcodeScannerDialog *(zen-ui `QRScanner` ✅)*, MediaGallery, HeroBanner, DynamicSideContent

### Floorplans (page-level patterns, not components)

List Report · Analytical List Page · Worklist · Object Page · Overview Page · Initial Page · Wizard · Create/Edit Page · Form Page · Multi-Instance Handling · Message Page · Empty Page · Home Page · Situation Detail View · Flat Object View · Master-Detail · Approval App · Smart Business Drilldown · Analysis Path Framework

## Foundations gaps

Beyond components, Fiori defines platform concerns zen-ui doesn't currently model:

| Foundation | Fiori | zen-ui |
|---|---|---|
| **Icon set** | ~1,000-icon SAP icon font, semantic names | ⚠️ 48 hand-drawn glyphs in `core/icons.ts`, still no icon dependency *(2026-07-20)* |
| **Type scale** | Fixed 72/Horizon scale | ✅ **Closed 2026-07-20** — 17 `--zen-font-*` + 9 `--zen-line-*`. Row added; the original table omitted typography entirely. |
| **Motion** | Defined durations + easings | 🟡 **Partly closed 2026-07-20** — 2 durations, 4 easings. No `prefers-reduced-motion`. Row added. |
| **Layout / grid** | Responsive grid + breakpoints per control | ❌ **Open.** `Stack` only, zero breakpoint tokens. Row added — both this doc and the Carbon one flag it, and neither had a row for it here. |
| **Content density** | `cozy` (touch) / `compact` (desktop) — a global density switch | ❌ Fixed sizing — unchanged at 8.0.0 |
| **Theming** | Horizon / Quartz, light + dark + HCB/HCW | ✅ Token-based (`--zen-*`), 3 themes — **architecturally comparable**. ⚠️ but **global-only**: no subtree scoping, `theme.ts` sets the attribute on `documentElement`. |
| **RTL** | Full right-to-left support | ❓ **Still unverified at 8.0.0** — open since 2026-07-14 and now spanning four bindings. The cheapest item in this table to settle: [scripts/visual-check.mjs](../scripts/visual-check.mjs) already drives every route. |
| **Responsiveness** | Explicit phone/tablet/desktop adaptivity per control | ⚠️ Ad hoc — unchanged |
| **Accessibility** | Documented per control | ⚠️ Radix gives a strong baseline, but **zen-ui ships no per-component a11y documentation** and two Solid a11y defects are open (see [todo.md](../todo.md) *Known-latent*). Downgraded from ✅ 2026-07-20. |
| **i18n** | Per-control translation bundles | ❌ Strings hardcoded — unchanged |

## Recommendation

If the goal is "zen-ui should feel viable for enterprise apps" rather than "zen-ui should clone Fiori", the ordered shortlist is:

1. ✅ **An icon layer** — a prerequisite for almost everything below. *(48 glyphs shipped; the set, not the component, remains thin.)*
2. ✅ **Toolbar with overflow** + **SegmentedButton**, **SplitButton**, **ToggleButton** — cheap, high frequency.
3. ✅ **Object atoms** — ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker. Days of work, large perceived gain.
4. ✅ **Tree** — a real absence, not a Fiori-specific one.
5. ❌ **MessagePopover** — pairs with the existing `Form`; aggregated validation is genuinely useful. **The only unbuilt item in this list, and the highest-value open component in the document.**
6. ✅ **DynamicDateRange** — semantic relative dates; useful far beyond Fiori.
7. ✅ **App frame** — ShellBar + FlexibleColumnLayout + DynamicPage. Big, but this is what makes an app "look Fiori".
8. 🟡 **FilterBar + VariantManagement** — only if there's a persistence story to attach them to. `FilterBar` shipped; `VariantManagement` correctly still waiting on the persistence question, which remains unanswered.

**Status 2026-07-20: seven of eight shipped in about five days of calendar time.** The one that did
not is #5, and nothing has displaced it.

Deliberately **not** recommended: Smart controls, micro charts, tiles, planning calendars, floorplans. They encode SAP's backend, not a design language.

**This recommendation is contradicted by [todo.md](../todo.md)**, which records a decision to build
all of Tier 4 — taken with this paragraph in view, and deliberately overriding it. Recorded here so
the disagreement is visible from both ends rather than looking like an oversight. Nothing has been
built against that decision in five releases, and the cost basis has since risen by 50%
(see [Cost basis](#cost-basis-changed-2026-07-20)), so it is worth re-confirming rather than
inheriting.

## References

- [UI5 Web Components (GitHub)](https://github.com/UI5/webcomponents) — `packages/{main,fiori,ai,compat}`
- [UI5 Web Components docs](https://ui5.github.io/webcomponents/nightly/components/main/Button/)
- [OpenUI5 (GitHub)](https://github.com/UI5/openui5) — `sap.m`, `sap.f`, `sap.ui.table`, `sap.uxap`, `sap.ui.layout`
- [OpenUI5 SDK](https://sdk.openui5.org/) — `test-resources/sap/<lib>/designtime/api.json`
- [SAPUI5 docs source](https://github.com/SAP-docs/sapui5) — the markdown behind help.sap.com
- [SAP Fiori for Web Design Guidelines](https://www.sap.com/design-system/fiori-design-web) *(403s to automated fetch; browse manually)*
