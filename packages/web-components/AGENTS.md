<!-- GENERATED FILE — do not edit by hand.
     Source: ../../packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)
     Regenerate: bun run gen:agent-guide  (checked by `bun run check`) -->

# @algorisys/zen-ui-web-components — for AI coding agents

The **Web Components** binding of zen-ui. Native custom elements over the vanilla factories. Importing the package registers every <zen-*> element as a side effect; it also re-exports the vanilla factories, so either style works.

zen-ui ships four bindings that share one API and one design core; this file is
for agents targeting **Web Components**. The other bindings —
`@algorisys/zen-ui-react`, `@algorisys/zen-ui-solid`, `@algorisys/zen-ui-vanilla` — expose the same catalogue with their own idiom.

```tsx
import "@algorisys/zen-ui-web-components";        // registers every <zen-*> element
import "@algorisys/zen-ui-web-components/styles";

<zen-button variant="solid" color="primary">Save</zen-button>
```

> This package also ships the same guidance as a Claude Code **skill** that
> loads itself whenever an agent builds UI here. Install it once per project:
> `cp -r node_modules/@algorisys/zen-ui-web-components/skills/zen-ui .claude/skills/`

## Licence — check this before adding a zen-ui dependency

zen-ui is copyright **Algorisys Technologies Pvt. Ltd** and **source-available, not open
source**:
[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0)
(SPDX `PolyForm-Noncommercial-1.0.0`).

- **Free, no permission needed** — personal and hobby projects, learning,
  experiments, research, and use by schools, universities, registered charities,
  public research bodies and government institutions.
- **Needs a licence first** — anything commercial. That **includes internal
  tools at a for-profit company** and client work; "not sold to anyone" is not
  the same as noncommercial. A licence is granted by Algorisys Technologies Pvt. Ltd and
  asked for at <pillai.rajesh@gmail.com>; see `COMMERCIAL.md`, shipped in each
  package and at
  <https://github.com/Algorisys-Technologies/zen-ui/blob/main/COMMERCIAL.md>.

If you are working on a commercial project, surface this to the user before
adding the dependency rather than after. Do not describe zen-ui as open source:
the Open Source Definition forbids restricting the field of use, so a
noncommercial condition disqualifies it regardless of the source being public.

## How to choose a component

Each entry is the component's name and what it is *for*. Match the task to the
description, then import the name from your binding's package.

### Components

- **Button** — forwardRef, asChild, CVA variants × colors × sizes × shapes
- **Tooltip** — Radix Tooltip — positioning, dismissal, a11y
- **Popover** — Anchored panel; asChild trigger, side/align, separate anchor
- **Link** — Styled anchor; asChild for router links, external, disabled
- **Theme** — Scopes a theme to a subtree — a dark panel inside a light page; nests, no JS
- **DirectionProvider** — Right-to-left support — tells menus, tabs and sliders which way the page reads
- **MessagePopover** — Aggregated form validation grouped by severity; click a message to land on the field
- **Page + Bar** — The Page whole-screen container and the three-slot Bar row — the structural frame pieces
- **ColorPicker** — Swatch palette + the platform picker; hex in, hex out
- **Carousel** — Scroll-snap slide strip; every child is a slide, no autoplay
- **DropdownMenu** — Radix DropdownMenu — action menus, sub-menus, checkbox/radio items
- **Separator** — Radix Separator — horizontal / vertical with decorative semantics
- **Switch** — Radix Switch — sizes, controlled / uncontrolled, form submission
- **Checkbox** — Radix Checkbox — native tri-state indeterminate, sizes
- **RadioGroup** — Radix RadioGroup — roving tabindex, arrow nav, form submission
- **Progress** — Radix Progress — sizes × colors, accessible value
- **Avatar** — Radix Avatar — image + initials fallback + stacked group
- **Badge** — Styled span with variants × colors, asChild for clickable
- **Skeleton** — Animated muted-box placeholder
- **Loading** — Animated spinner with sr-only label, color=current for buttons
- **Select** — Radix Select — keyboard nav, groups, form submission
- **Slider** — Radix Slider — single + range, vertical, keyboard control
- **ScrollArea** — Radix ScrollArea — custom scrollbars, both axes
- **Input + Textarea** — Plain styled <input> / <textarea>, all native attrs
- **Search** — Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times
- **PasswordInput** — Password field with a show / hide toggle; every native input attribute passes through
- **NumberField** — Number input with −/+ stepper, clamp, decimal step
- **DatePicker** — react-day-picker in a Radix Popover; inline Calendar too
- **InputOTP** — one input per digit, zero-dep; paste / autocomplete / a11y
- **MaskInput** — Fixed-template input — 99-9999, aa-99; the mask decides what may be typed
- **PhoneInput** — Composition: Select (country) + Input (number)
- **FAB** — Fixed-position Button wrapper + DropdownMenu for speed-dial
- **Form (RHF + Zod)** — react-hook-form + Zod resolver; FormField / FormItem / FormLabel / FormMessage
- **DataTable** — TanStack Table + Virtual; sorting, filtering, grouping, pinning, resizing, windowing
- **TreeTable** — Hierarchical rows; chevron indents inside the first column, filter keeps ancestors
- **Micro charts** — Sparkline-sized trend marks for a table cell or card — line, bar, bullet, delta, radial
- **TimerBadge / TestCountdownBar** — Exam clock from a deadline, not a decrementing number — colour thresholds, auto-expire hook, sticky bar
- **CodeEditor / IDEWindow** — Monaco wrapper — language, theme, read-only, Ctrl+Enter run hook; file list beside it
- **SpreadsheetGrid / SheetCalculator** — Editable cells with a real formula evaluator; errors render as errors, never a plausible number
- **ProctorStreamGrid / ProctorFlagOverlay** — Live candidate tiles with violation flags; displays streams, does not detect anything
- **ChunkUploader** — Large file in pieces — bounded retries, exponential backoff, pause and resume
- **DiagramCanvas / ArchitectureDraw** — Embedded diagrams.net editor over postMessage; draw.io XML in and out
- **DiffView** — What changed between two snapshots — added / removed / changed rows for an audit payload or a revision
- **DocumentViewer** — Show a scanned document — image or PDF, with zoom, fit, rotate and page count; the other half of FileUpload
- **Splitter** — Resizable panes — drag the divider, or arrow it; percentages, collapse, full WAI-ARIA separator
- **SortableList** — Reorder a list by dragging or entirely by keyboard; the app owns the order
- **Timeline** — Ordered list of events with a rail, markers, timestamps and date groups
- **UploadCollection** — The list of uploaded files — progress, rename, delete, retry; the result FileUpload has no view for
- **PlanningCalendar** — Resource-by-time grid — rows of people or rooms, appointments as blocks, day / week / month views
- **Gantt** — Project schedule — a collapsing task tree beside bars on a shared clock, with percent-complete fills, slip chips and dependency arrows; opens on a fit axis taken from the data, one tab stop with arrow-key grid navigation
- **ProductionSchedule** — Shop-floor schedule — work centres as rows holding many operations in lanes, changeovers drawn as time the machine is busy making nothing, finite capacity with overload, and a load histogram of booked over available WORKING hours
- **Pivot** — Drag-and-drop pivot builder; fields into zones, 2D-windowed grid
- **MediaTimeline** — Filmstrip trim track — draggable ranges over thumbnails, playhead, hover scrub, zoom; the app owns the state
- **Waveform** — Audio peaks lane with a draggable, trimmable clip window; shares a zoom with MediaTimeline so lanes align
- **Lazy options** — VirtualizedItems — drop-in windowing for huge option lists inside Combobox / Select
- **Combobox + Async** — cmdk-backed; sync `options` or async `onSearch` with debounced loading
- **Alert** — Inline semantic callout; compound Icon / Title / Description / Actions API
- **Dialog + AlertDialog** — Radix Dialog modal surface, plus AlertDialog for destructive confirmations
- **Toast** — Radix Toast — imperative toast() plus a Toaster viewport; variants and actions
- **FileUpload** — Drag-and-drop or browse; accept / max-size validation with per-file progress
- **Bound* fields** — BoundInput / BoundSelect / BoundSwitch — form-wired field wrappers, no boilerplate
- **Stepper** — Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)
- **Banner** — Page-top persistent callout — verification reminders, maintenance windows, impersonation
- **EmptyState** — First-run / no-data / no-results surface; icon + title + description + actions
- **Tabs** — Radix-backed tabbed navigation; underline + pills variants, horizontal / vertical
- **Accordion** — Radix-backed collapsible sections; single + multiple expand modes
- **Collapsible** — One region that shows and hides — the single disclosure Accordion overserves
- **NativeSelect** — The platform <select>, styled to match Input — submits with no hidden input, opens as the OS picker on a phone
- **Label** — The <label> for a control outside a Form; required marker, sizes, peer-disabled dimming
- **Card** — Surface primitive + SelectableCard variant for goal pickers / plan selectors
- **Paper** — Document surface — reading measure, document typography, and a paper Dialog variant
- **StatCard** — A labelled figure — icon, delta, and somewhere to go
- **Sheet / Drawer** — Slide-in side panel on Radix Dialog; right / left / top / bottom
- **DateRangePicker** — Two-month side-by-side calendar in a Popover; range anchoring, controlled / uncontrolled
- **DynamicDateRange** — Semantic periods — "Last 7 days", "This quarter"; stores the question, not the answer
- **TagInput** — Type + Enter chip input; comma-paste splits, Backspace removes, per-tag validator, max-N
- **MultiCombobox** — Multi-select Combobox with chip trigger + overflow collapse + sync / async option loading
- **Rating** — 5-star rating input; hover preview, arrow-key nav, sm / md / lg, customizable max
- **NPS** — Net Promoter Score 0-10 strip with detractor / passive / promoter color buckets
- **Likert** — n-point attitudinal scale; segmented + stacked layouts, custom option sets
- **TimePicker** — Segmented HH:MM(:SS) input, 12h / 24h, AM/PM, auto-advance + arrow stepping
- **DateTimePicker** — Calendar + TimePicker in one Popover; preserves time-of-day on day changes
- **QRScanner** — Camera-based QR / barcode scanner; native BarcodeDetector + custom-decoder escape hatch
- **NotificationsInbox** — Bell icon + popover panel; day-grouped feed with unread badge + per-row actions
- **Breadcrumb** — Hierarchical navigation path; collapsible ellipsis for deep trees
- **Pagination** — Page navigation with truncated ranges; usePaginationRange hook
- **Sidebar** — Collapsible navigation shell; provider + trigger + grouped menu

### Heavy / optional (lazy peer deps)

- **Chart (recharts)** — Lazy-loaded line / bar / area / pie / donut; recharts is an optional peer dep
- **RichText (jodit)** — Lazy-loaded WYSIWYG editor; jodit-pro-react is an optional peer dep
- **Map (leaflet)** — Lazy-loaded map with markers; leaflet + react-leaflet are optional peer deps
- **Camera (webcam)** — Lazy-loaded camera capture; react-webcam is an optional peer dep

### Zen-shaped

- **Icon** — zen-ui icon set (48 glyphs); inherits text colour, decorative by default
- **Object atoms** — ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker
- **Button family** — ToggleButton, SegmentedButton, SplitButton
- **Toolbar** — Actions that collapse into an overflow menu when they do not fit
- **Tree** — Hierarchical expandable list with full ARIA keyboard navigation

### Zen table ecosystem

- **SelectDialog** — Searchable list picker — single commits on click, multi commits on OK
- **ValueHelp** — F4 lookup dialog — the list picker plus a condition builder
- **ViewSettingsDialog** — Sort / group / filter settings; commits on OK
- **FilterBar** — List Report filter area — fields, Go, and Adapt filters

### Zen app frame

- **PageHeader** — A heading with a back affordance and one action — the light one
- **SkipToContent** — Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)
- **ShellBar** — Top-level app header — branding, search, actions, profile menu
- **FlexibleColumnLayout** — 1–3 column master-detail frame with responsive collapse
- **DynamicPage** — Title + header that snaps away on scroll; pinnable header
- **ObjectPageLayout** — Anchored sections with scroll-spy navigation

### Patterns (compositions, not exported components)

- **List Report** — FilterBar + DataTable — filter a set, read the result, act on a row

## Binding divergences an agent must know

The bindings are one API with four renderers, but three differences are
structural — reaching for the React shape in another binding is a bug, not a
missing export:

- **Compound parts exist only in React and Solid.** `DialogContent`,
  `TabsList`, `AccordionItem`, `SelectTrigger` and the like are child
  components you compose. The **vanilla** and **web-components** bindings expose
  each family as ONE factory (or one `<zen-*>` element) that takes data — there
  is nothing to name the parts. Do not import `DialogContent` from
  `@algorisys/zen-ui-vanilla`; it does not exist by design.
- **Select.** React exports the Radix compound parts
  (`SelectTrigger`, `SelectContent`, `SelectItem`, …). Solid, vanilla and
  web-components export a single `Select` that takes an `options` array.
- **Toast.** React wraps Radix Toast primitives; Solid uses solid-toast. Both
  expose an imperative `toast()` plus a viewport, but the primitive API differs.

## Styling your own markup — do not write `zen-` classes by default

The stylesheet you import (`<pkg>/styles`) is a **closed set**: UnoCSS generated
it by scanning zen-ui's own source, so it contains exactly the utilities zen-ui's
components use and nothing else. It never saw your app.

A `zen-` class you write in your own markup therefore produces **no CSS** unless
zen-ui already uses that identical class. It fails silently — no error, no
warning, green build, unstyled element.

**Use your app's own styling system for your own markup.** Plain Tailwind or
UnoCSS utilities, CSS modules, whatever you already have. The `zen-` prefix
exists so zen-ui cannot collide with your CSS; it is not a vocabulary offered to
you.

If you genuinely want to author `zen-` utilities, run UnoCSS over your own
source with zen-ui's preset:

```ts
// uno.config.ts, in YOUR app
import { defineConfig, presetUno } from "unocss";
import { ZEN_PREFIX, zenUnoTheme, zenAnimationsPreset } from "@algorisys/zen-ui-core/uno-preset";

export default defineConfig({
  presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
  theme: zenUnoTheme,
});
```

Two things NOT to conclude when a `zen-` class does nothing:

- **Not "the preset has no spacing scale."** It does. `zen-p-7`, `zen-p-9`,
  `zen-p-0.5`, `zen-py-3.5`, `zen-gap-1.5` and arbitrary values like
  `zen-p-[10px]`, `zen-text-[0.7rem]`, `zen-grid-cols-[1fr_1fr]` all generate
  when UnoCSS is actually run over the file that uses them.
- **Not "the token is missing."** Check the spelling first. `muted-fg`, not
  `muted-foreground`; there is no `card` colour — use `background`.

To restyle zen-ui's OWN components, override `--zen-*` custom properties. That
is the supported theming surface and it needs no build step.


## Rules that apply in every binding

- **You must import the stylesheet.** `import "<pkg>/styles";` once at your
  app entry. Without it, components render unstyled — utilities resolve to
  nothing. An optional element reset is a separate opt-in: `import "<pkg>/preflight";`.
- **If you import both, preflight goes FIRST.** The reset sets
  `background-color: transparent` on `[type="button"]` — an attribute selector,
  so the same specificity as `.zen-bg-zen-primary`. A tie is broken by source
  order, so importing preflight SECOND makes it win and every solid `<Button>`
  renders invisible. Nothing errors and the build stays green.
- **Utilities are prefixed `zen-`; variants sit outside the prefix** —
  `hover:zen-bg-zen-primary`, `data-[state=open]:zen-p-4`, `!zen-p-4`. You
  rarely write these as a consumer, but if you extend a component's class, keep
  the prefix.
- **Theming is `--zen-*` custom properties — that is the whole public surface.**
  Override them in your own CSS. Four built-in themes switch via
  `data-theme`: `default`, `zen-theme`, `dark`, `paper`.
- **Heavy components need an optional peer dep.** Chart wants `recharts`,
  RichText wants jodit, Map wants `leaflet`, Camera wants `react-webcam`. They
  lazy-load it; install it when you use one.
