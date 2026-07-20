<!-- GENERATED FILE — do not edit by hand.
     Source: ../../packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)
     Regenerate: bun run gen:agent-guide  (checked by `bun run check`) -->

# @algorisys/zen-ui-solid — for AI coding agents

The **Solid** binding of zen-ui. JSX components (Kobalte-backed). Mirrors the React API.

zen-ui ships four bindings that share one API and one design core; this file is
for agents targeting **Solid**. The other bindings —
`@algorisys/zen-ui-react`, `@algorisys/zen-ui-vanilla`, `@algorisys/zen-ui-web-components` — expose the same catalogue with their own idiom.

```tsx
import { Button } from "@algorisys/zen-ui-solid";
import "@algorisys/zen-ui-solid/styles";

<Button variant="solid" color="primary">Save</Button>;
```

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
- **Timeline** — Ordered list of events with a rail, markers, timestamps and date groups
- **Pivot** — Drag-and-drop pivot builder; fields into zones, 2D-windowed grid
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
- **Card** — Surface primitive + SelectableCard variant for goal pickers / plan selectors
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

## Rules that apply in every binding

- **You must import the stylesheet.** `import "<pkg>/styles";` once at your
  app entry. Without it, components render unstyled — utilities resolve to
  nothing. An optional element reset is a separate opt-in: `import "<pkg>/preflight";`.
- **Utilities are prefixed `zen-`; variants sit outside the prefix** —
  `hover:zen-bg-zen-primary`, `data-[state=open]:zen-p-4`, `!zen-p-4`. You
  rarely write these as a consumer, but if you extend a component's class, keep
  the prefix.
- **Theming is `--zen-*` custom properties — that is the whole public surface.**
  Override them in your own CSS. Three built-in themes switch via
  `data-theme`: `default`, `zen-theme`, `dark`.
- **Heavy components need an optional peer dep.** Chart wants `recharts`,
  RichText wants jodit, Map wants `leaflet`, Camera wants `react-webcam`. They
  lazy-load it; install it when you use one.
