/**
 * Single source of truth for the demo's navigation AND its landing-page
 * catalogue. Both App.tsx (sidebar) and components/Welcome.tsx (cards) render
 * from this list, so a component can no longer appear in one and not the other
 * — which is exactly how the landing page ended up 16 entries out of date.
 *
 * Adding a component: add it here, add its <Route> in App.tsx. Nothing else.
 */

import { RELEASE_NOTES } from "./release-notes";

export type NavItem = {
  to: string;
  label: string;
  /** Shown on the landing page. Omitted for non-component routes (Welcome). */
  description?: string;
  /**
   * Repo-relative path to the demo file behind this route — the USAGE, not the
   * component's own source. It is what "View code" opens.
   *
   * The demos already print a snippet, but that snippet is a `code` string
   * typed by hand next to the JSX it claims to describe, and nothing makes the
   * two agree. This is the file that actually ran.
   *
   * Kept honest by `bun run check:nav`, which asserts every one of these exists
   * and matches the component the route really renders.
   */
  source?: string;
  /**
   * The version this component first ships in. While that is the current
   * release's minor version or a later one, the sidebar and the catalogue mark
   * it "New"; one minor release later the mark goes by itself, so nobody has
   * to remember to take it off.
   */
  since?: string;
  /**
   * The version this component last changed in (a feature or a fix worth
   * knowing). While that is the current release's minor or later, and it is
   * not New, the sidebar and the catalogue mark it "Updated"; like New, the
   * mark goes by itself one minor release later. Set it when you change a
   * component, alongside the CHANGELOG entry.
   */
  updated?: string;
};

/** "12.2.0" -> 12002: major and minor, comparable as a number. */
const minorOf = (version: string) => {
  const [major = 0, minor = 0] = version.split(".").map(Number);
  return major * 1000 + minor;
};

const currentMinor = () => minorOf(RELEASE_NOTES[0]?.version ?? "0.0.0");

/** Whether an entry is marked New, against the latest release in RELEASE_NOTES. */
export const isNew = (item: NavItem): boolean => !!item.since && minorOf(item.since) >= currentMinor();

/** Whether an entry is marked Updated: changed in this release line, and not New. */
export const isUpdated = (item: NavItem): boolean =>
  !isNew(item) && !!item.updated && minorOf(item.updated) >= currentMinor();

export type NavGroup = {
  title: string;
  items: NavItem[];
  /** Groups flagged `catalogue: false` are sidebar-only (e.g. Getting started). */
  catalogue?: boolean;
  /**
   * Whether this group's items count toward the header's component tally.
   * Default true.
   *
   * A second axis, because `catalogue` cannot express it: Patterns belongs ON
   * the landing page but is not made of components — it is screens assembled
   * from the groups above. Counting a screen as a component inflates the
   * number the header states, and that number is checked.
   */
  components?: boolean;
};

export const NAV: NavGroup[] = [
  {
    title: "Getting started",
    catalogue: false,
    items: [
      { to: "/", label: "Welcome", source: "packages/react/src/demos/welcome.tsx" },
      { to: "/customizing", label: "Customizing", source: "packages/react/src/demos/customizing.tsx" },
    ],
  },
  {
    title: "Components",
    items: [
      { to: "/button", label: "Button", description: "forwardRef, asChild, CVA variants \u00d7 colors \u00d7 sizes \u00d7 shapes", source: "packages/react/src/demos/button.tsx" },
      { to: "/tooltip", label: "Tooltip", description: "Radix Tooltip \u2014 positioning, dismissal, a11y", source: "packages/react/src/demos/tooltip.tsx" },
      { to: "/popover", label: "Popover", description: "Anchored panel; asChild trigger, side/align, separate anchor", source: "packages/react/src/demos/popover.tsx" },
      { to: "/link", label: "Link", description: "Styled anchor; asChild for router links, external, disabled", source: "packages/react/src/demos/link.tsx" },
      { to: "/theme", label: "Theme", description: "Scopes a theme to a subtree \u2014 a dark panel inside a light page; nests, no JS", source: "packages/react/src/demos/theme.tsx", updated: "12.9.0" },
      { to: "/localization", label: "Localization", description: "Translate every built-in string through LocaleProvider (any subset; the rest stays English), with plural rules per language; set the locale and currency numbers and dates use", source: "packages/react/src/demos/localization.tsx", since: "12.3.0" },
      { to: "/direction", label: "DirectionProvider", description: "Right-to-left support \u2014 tells menus, tabs and sliders which way the page reads", source: "packages/react/src/demos/direction.tsx" },
      { to: "/stack", label: "Stack", description: "Minimal flexbox layout primitive — a thin div laying children out in a row or column with configurable alignment, wrapping, gap and padding.", source: "packages/react/src/demos/stack.tsx" },
      { to: "/message-popover", label: "MessagePopover", description: "Aggregated form validation grouped by severity; click a message to land on the field", source: "packages/react/src/demos/message-popover.tsx" },
      { to: "/page", label: "Page + Bar", description: "The Page whole-screen container and the three-slot Bar row \u2014 the structural frame pieces", source: "packages/react/src/demos/page.tsx" },
      { to: "/color-picker", label: "ColorPicker", description: "Swatch palette + the platform picker; hex in, hex out", source: "packages/react/src/demos/color-picker.tsx" },
      { to: "/carousel", label: "Carousel", description: "Scroll-snap slide strip; every child is a slide, no autoplay", source: "packages/react/src/demos/carousel.tsx" },
      { to: "/dropdown-menu", label: "DropdownMenu", description: "Radix DropdownMenu \u2014 action menus, sub-menus, checkbox/radio items", source: "packages/react/src/demos/dropdown-menu.tsx", updated: "12.3.0" },
      { to: "/context-menu", label: "ContextMenu", description: "Right-click menus at the pointer, from the keyboard (menu key, Shift+F10) and on long press", source: "packages/react/src/demos/context-menu.tsx", since: "12.3.0" },
      { to: "/separator", label: "Separator", description: "Radix Separator \u2014 horizontal / vertical with decorative semantics", source: "packages/react/src/demos/separator.tsx" },
      { to: "/switch", label: "Switch", description: "Radix Switch \u2014 sizes, controlled / uncontrolled, form submission", source: "packages/react/src/demos/switch.tsx" },
      { to: "/checkbox", label: "Checkbox", description: "Radix Checkbox \u2014 native tri-state indeterminate, sizes", source: "packages/react/src/demos/checkbox.tsx" },
      { to: "/radio-group", label: "RadioGroup", description: "Radix RadioGroup \u2014 roving tabindex, arrow nav, form submission", source: "packages/react/src/demos/radio-group.tsx", updated: "12.9.0" },
      { to: "/progress", label: "Progress", description: "Radix Progress \u2014 sizes \u00d7 colors, accessible value", source: "packages/react/src/demos/progress.tsx" },
      { to: "/avatar", label: "Avatar", description: "Radix Avatar \u2014 image + initials fallback + stacked group", source: "packages/react/src/demos/avatar.tsx" },
      { to: "/badge", label: "Badge", description: "Styled span with variants \u00d7 colors, asChild for clickable", source: "packages/react/src/demos/badge.tsx" },
      { to: "/skeleton", label: "Skeleton", description: "Animated muted-box placeholder", source: "packages/react/src/demos/skeleton.tsx" },
      { to: "/loading", label: "Loading", description: "Animated spinner with sr-only label, color=current for buttons", source: "packages/react/src/demos/loading.tsx" },
      { to: "/select", label: "Select", description: "Radix Select \u2014 keyboard nav, groups, form submission", source: "packages/react/src/demos/select.tsx", updated: "12.3.0" },
      { to: "/slider", label: "Slider", description: "Radix Slider \u2014 single + range, vertical, keyboard control", source: "packages/react/src/demos/slider.tsx" },
      { to: "/scroll-area", label: "ScrollArea", description: "Radix ScrollArea \u2014 custom scrollbars, both axes", source: "packages/react/src/demos/scroll-area.tsx" },
      { to: "/input", label: "Input + Textarea", description: "Plain styled <input> / <textarea>, all native attrs", source: "packages/react/src/demos/input.tsx", updated: "12.3.0" },
      { to: "/textarea", label: "Textarea", description: "Plain styled <textarea> primitive, all native attrs", source: "packages/react/src/demos/textarea.tsx" },
      { to: "/search", label: "Search", description: "Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times", source: "packages/react/src/demos/search.tsx" },
      { to: "/password-input", label: "PasswordInput", description: "Password field with a show / hide toggle; every native input attribute passes through", source: "packages/react/src/demos/password-input.tsx" },
      { to: "/number-field", label: "NumberField", description: "Number input with \u2212/+ stepper, clamp, decimal step", source: "packages/react/src/demos/number-field.tsx" },
      { to: "/amount-field", label: "AmountField and QuantityField", description: "Amounts and quantities typed the way clerks do (1,25,000, 2.5L, 1.2Cr), formatted in the locale with the currency's own precision; LocaleProvider sets locale and currency once", source: "packages/react/src/demos/amount-field.tsx", since: "12.3.0" },
      { to: "/date-input", label: "DateInput", description: "Type a date the way clerks do (150326, t, +7) in the locale's order, with the calendar as a second way in; impossible dates are kept and flagged, never rolled over", source: "packages/react/src/demos/date-input.tsx", since: "12.3.0" },
      { to: "/date-picker", label: "DatePicker", description: "react-day-picker in a Radix Popover; inline Calendar too", source: "packages/react/src/demos/date-picker.tsx" },
      { to: "/otp", label: "InputOTP", description: "one input per digit, zero-dep; paste / autocomplete / a11y", source: "packages/react/src/demos/otp.tsx" },
      { to: "/mask-input", label: "MaskInput", description: "Fixed-template input — 99-9999, aa-99; the mask decides what may be typed", source: "packages/react/src/demos/mask-input.tsx" },
      { to: "/phone-input", label: "PhoneInput", description: "Composition: Select (country) + Input (number)", source: "packages/react/src/demos/phone-input.tsx" },
      { to: "/fab", label: "FAB", description: "Fixed-position Button wrapper + DropdownMenu for speed-dial", source: "packages/react/src/demos/fab.tsx" },
      { to: "/form", label: "Form (RHF + Zod)", description: "react-hook-form + Zod resolver; FormField / FormItem / FormLabel / FormMessage", source: "packages/react/src/demos/form.tsx" },
      { to: "/data-table", label: "DataTable", description: "TanStack Table + Virtual; sorting, filtering, grouping, pinning, resizing, windowing", source: "packages/react/src/demos/data-table.tsx", updated: "12.12.0" },
      { to: "/tree-table", label: "TreeTable", description: "Hierarchical rows; chevron indents inside the first column, filter keeps ancestors", source: "packages/react/src/demos/tree-table.tsx", updated: "12.12.0" },
      { to: "/micro-chart", label: "Micro charts", description: "Sparkline-sized trend marks for a table cell or card \u2014 line, bar, bullet, delta, radial", source: "packages/react/src/demos/micro-chart.tsx", updated: "12.3.0" },
      { to: "/countdown", label: "TimerBadge / TestCountdownBar", description: "Exam clock from a deadline, not a decrementing number — colour thresholds, auto-expire hook, sticky bar", source: "packages/react/src/demos/countdown.tsx" },
      { to: "/code-editor", label: "CodeEditor / IDEWindow", description: "Monaco wrapper — language, theme, read-only, Ctrl+Enter run hook; file list beside it", source: "packages/react/src/demos/code-editor.tsx", updated: "13.3.0" },
      { to: "/spreadsheet-grid", label: "SpreadsheetGrid / SheetCalculator", description: "Editable cells with a real formula evaluator; errors render as errors, never a plausible number", source: "packages/react/src/demos/spreadsheet-grid.tsx", updated: "12.13.0" },
      { to: "/proctor", label: "ProctorStreamGrid / ProctorFlagOverlay", description: "Live candidate tiles with violation flags; displays streams, does not detect anything", source: "packages/react/src/demos/proctor.tsx" },
      { to: "/chunk-uploader", label: "ChunkUploader", description: "Large file in pieces — bounded retries, exponential backoff, pause and resume", source: "packages/react/src/demos/chunk-uploader.tsx" },
      { to: "/diagram-canvas", label: "DiagramCanvas / ArchitectureDraw", description: "Embedded diagrams.net editor over postMessage; draw.io XML in and out", source: "packages/react/src/demos/diagram-canvas.tsx" },
      { to: "/diff-view", label: "DiffView", description: "What changed between two snapshots — added / removed / changed rows for an audit payload or a revision", source: "packages/react/src/demos/diff-view.tsx" },
      { to: "/document-viewer", label: "DocumentViewer", description: "Show a scanned document — image or PDF, with zoom, fit, rotate and page count; the other half of FileUpload", source: "packages/react/src/demos/document-viewer.tsx" },
      { to: "/splitter", label: "Splitter", description: "Resizable panes — drag the divider, or arrow it; percentages, collapse, full WAI-ARIA separator", source: "packages/react/src/demos/splitter.tsx" },
      { to: "/sortable-list", label: "SortableList", description: "Reorder a list by dragging or entirely by keyboard; the app owns the order", source: "packages/react/src/demos/sortable-list.tsx" },
      { to: "/timeline", label: "Timeline", description: "Ordered list of events with a rail, markers, timestamps and date groups", source: "packages/react/src/demos/timeline.tsx" },
      { to: "/upload-collection", label: "UploadCollection", description: "The list of uploaded files \u2014 progress, rename, delete, retry; the result FileUpload has no view for", source: "packages/react/src/demos/upload-collection.tsx" },
      { to: "/planning-calendar", label: "PlanningCalendar", description: "Resource-by-time grid \u2014 rows of people or rooms, appointments as blocks, day / week / month views", source: "packages/react/src/demos/planning-calendar.tsx", updated: "12.13.0" },
      { to: "/gantt", label: "Gantt", description: "Project schedule \u2014 a collapsing task tree beside bars on a shared clock, with percent-complete fills, slip chips, dependency arrows and milestone diamonds; opens on a fit axis taken from the data, one tab stop with arrow-key grid navigation", source: "packages/react/src/demos/gantt.tsx", updated: "13.4.0" },
      { to: "/production-schedule", label: "ProductionSchedule", description: "Shop-floor schedule \u2014 work centres as rows holding many operations in lanes, changeovers drawn as time the machine is busy making nothing, finite capacity with overload, and a load histogram of booked over available WORKING hours", source: "packages/react/src/demos/production-schedule.tsx", updated: "13.2.0" },
      { to: "/state-pill", label: "StatePill", description: "A machine\u2019s state as a labelled pill \u2014 running, stopped, setup, planned stops and no data, from one shared vocabulary that also says how OEE counts the time", source: "packages/react/src/demos/state-pill.tsx", since: "12.9.0" },
      { to: "/oee-gauge", label: "OeeGauge", description: "OEE as a half-circle gauge with Availability, Performance and Quality underneath \u2014 computed from counts and times, banded against a plant\u2019s own targets, and honest about what it cannot compute", source: "packages/react/src/demos/oee-gauge.tsx", since: "12.9.0" },
      { to: "/state-timeline", label: "StateTimeline", description: "A machine\u2019s states along a shift, every stretch exactly as wide as its duration \u2014 holes in the record hatched as no data, clickable stops, event markers, an axis in the plant\u2019s timezone; stack them to compare machines", source: "packages/react/src/demos/state-timeline.tsx", since: "12.9.0" },
      { to: "/andon", label: "AndonTile / AndonBoard", description: "The plant board read from across the room \u2014 one tile per machine with its state, cause and a downtime clock (never an uptime one), optional trouble-first sorting, and a board that says when its data has stopped updating", source: "packages/react/src/demos/andon.tsx", since: "12.9.0" },
      { to: "/reason-code-picker", label: "ReasonCodePicker", description: "A touch grid for saying why a machine stopped or a part was scrapped \u2014 big targets, category chips, search by words or code, and arrow keys that never record a reason on the way past", source: "packages/react/src/demos/reason-code-picker.tsx", since: "12.9.0" },
      { to: "/scan-input", label: "ScanInput", description: "A field for a USB barcode scanner \u2014 tells a scan from typing by timing, can refuse typed codes, checks each code through one callback, and can catch scans made anywhere on a station page", source: "packages/react/src/demos/scan-input.tsx", since: "12.9.0" },
      { to: "/production-progress", label: "ProductionProgress", description: "A work order\u2019s good and scrap against its target \u2014 scrap shown and never counted toward the target, over-production reported, a sliver once work starts, and optional cartons or pallets as segments", source: "packages/react/src/demos/production-progress.tsx", since: "12.9.0" },
      { to: "/measurement-input", label: "MeasurementInput", description: "An inspection reading checked against its limits as it is typed \u2014 pass, near a limit or out in words, a scale showing the tolerance and warning bands, locale-aware decimals, one-sided specs", source: "packages/react/src/demos/measurement-input.tsx", since: "12.9.0" },
      { to: "/step-runner", label: "StepRunner", description: "Operator work instructions one step at a time \u2014 enforced order, checklists that must all be ticked, measurements that must be in tolerance, issues that hold the line, and the reason written when a step cannot complete yet", source: "packages/react/src/demos/step-runner.tsx", since: "12.9.0" },
      { to: "/live-indicator", label: "LiveIndicator", description: "Whether a live screen is current \u2014 \u201cUpdated 12s ago\u201d, turning to a warning when data stops arriving and to offline when the connection drops, announced to screen readers once per change", source: "packages/react/src/demos/live-indicator.tsx", since: "12.9.0" },
      { to: "/shift-navigator", label: "ShiftNavigator", description: "Step through a plant\u2019s shifts in the plant\u2019s own timezone \u2014 night shifts belong to the day they start, daylight-saving days keep wall-clock times, and next stops at now unless the screen plans ahead", source: "packages/react/src/demos/shift-navigator.tsx", since: "12.9.0" },
      { to: "/planned-vs-actual", label: "PlannedVsActual", description: "Pieces made this shift against the plan \u2014 the gap in words, what was made against what was planned so far, where the pace will end up, and a chart of plan and counter readings up to now", source: "packages/react/src/demos/planned-vs-actual.tsx", since: "12.9.0" },
      { to: "/rate-bars", label: "RateBars", description: "Output in equal time buckets, each bar coloured by what the machine was doing \u2014 a short green bar ran slow, a red stub stopped \u2014 with the rate now, the average and the target", source: "packages/react/src/demos/rate-bars.tsx", since: "12.9.0" },
      { to: "/line-card", label: "LineCard", description: "One production line at a glance \u2014 state, the order it is running, good and scrap against target, and when it will finish or why it is not moving", source: "packages/react/src/demos/line-card.tsx", since: "12.9.0" },
      { to: "/capacity-heatmap", label: "CapacityHeatmap", description: "Booked hours against available hours, resource by period \u2014 a real table whose wash deepens with load, with over-capacity and work booked on a closed line drawn as alarms, totals that sum hours, and a drill-down on each cell", source: "packages/react/src/demos/capacity-heatmap.tsx", since: "12.9.0" },
      { to: "/column-mapper", label: "ColumnMapper", description: "Map a spreadsheet\u2019s columns onto your fields \u2014 matched by name, never guessed, with every problem in words and a preview of the first rows marking each cell that will not import", source: "packages/react/src/demos/column-mapper.tsx", since: "12.9.0" },
      { to: "/genealogy-graph", label: "GenealogyGraph", description: "Trace a lot, order or unit both ways \u2014 what it was made from and what it went into, each step a column, click any item to trace from it, and a trace cut short says so", source: "packages/react/src/demos/genealogy-graph.tsx", since: "12.9.0" },
      { to: "/routing-graph", label: "RoutingGraph", description: "A process\u2019s steps and which must finish before which \u2014 laid out by longest path, step status for the operator, and editing by keyboard or pointer that refuses any link closing a loop", source: "packages/react/src/demos/routing-graph.tsx", since: "12.9.0" },
      { to: "/pivot", label: "Pivot", description: "Drag-and-drop pivot builder; fields into zones, 2D-windowed grid", source: "packages/react/src/demos/pivot.tsx", updated: "13.3.0" },
      { to: "/media-timeline", label: "MediaTimeline", description: "Filmstrip trim track — draggable ranges over thumbnails, playhead, hover scrub, zoom; the app owns the state", source: "packages/react/src/demos/media-timeline.tsx" },
      { to: "/waveform", label: "Waveform", description: "Audio peaks lane with a draggable, trimmable clip window; shares a zoom with MediaTimeline so lanes align", source: "packages/react/src/demos/waveform.tsx" },
      { to: "/lazy-options", label: "Lazy options", description: "VirtualizedItems \u2014 drop-in windowing for huge option lists inside Combobox / Select", source: "packages/react/src/demos/lazy-options.tsx" },
      { to: "/virtualized-items", label: "Virtualized items", description: "A windowed scrolling viewport that mounts only the visible rows of a huge list — dense array or server-paged sparse mode", source: "packages/react/src/demos/virtualized-items.tsx" },
      { to: "/combobox", label: "Combobox + Async", description: "cmdk-backed; sync `options` or async `onSearch` with debounced loading", source: "packages/react/src/demos/combobox.tsx", updated: "12.8.1" },
      { to: "/tree-select", label: "TreeSelect", description: "Pick one node from a hierarchy (accounts, item groups): type to search, matches shown under their ancestors", source: "packages/react/src/demos/tree-select.tsx", since: "12.3.0" },
      { to: "/lookup-field", label: "LookupField", description: "Pick a row from a table of choices (items, customers): column headers, search across the columns in any order, server results, the chosen row returned whole; F4 opens the full search", source: "packages/react/src/demos/lookup-field.tsx", since: "12.3.0" },
      { to: "/alert", label: "Alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions API", source: "packages/react/src/demos/alert.tsx" },
      { to: "/dialog", label: "Dialog + AlertDialog", description: "Radix Dialog modal surface, plus AlertDialog for destructive confirmations", source: "packages/react/src/demos/dialog.tsx" },
      { to: "/shortcuts", label: "Shortcuts", description: "Kbd key caps, useShortcut with scopes, and a ? overlay listing every key: one chord string, spelled per platform", source: "packages/react/src/demos/shortcuts.tsx", since: "12.3.0" },
      { to: "/toast", label: "Toast", description: "Radix Toast \u2014 imperative toast() plus a Toaster viewport; variants and actions", source: "packages/react/src/demos/toast.tsx" },
      { to: "/file-upload", label: "FileUpload", description: "Drag-and-drop or browse; accept / max-size validation with per-file progress", source: "packages/react/src/demos/file-upload.tsx", updated: "12.3.0" },
      { to: "/bound-fields", label: "Bound* fields", description: "BoundInput / BoundSelect / BoundSwitch \u2014 form-wired field wrappers, no boilerplate", source: "packages/react/src/demos/bound-fields.tsx", updated: "12.9.0" },
      { to: "/stepper", label: "Stepper", description: "Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)", source: "packages/react/src/demos/stepper.tsx", updated: "12.3.0" },
      { to: "/banner", label: "Banner", description: "Page-top persistent callout \u2014 verification reminders, maintenance windows, impersonation", source: "packages/react/src/demos/banner.tsx" },
      { to: "/empty-state", label: "EmptyState", description: "First-run / no-data / no-results surface; icon + title + description + actions", source: "packages/react/src/demos/empty-state.tsx" },
      { to: "/tabs", label: "Tabs", description: "Radix-backed tabbed navigation; underline + pills variants, horizontal / vertical", source: "packages/react/src/demos/tabs.tsx", updated: "12.3.0" },
      { to: "/accordion", label: "Accordion", description: "Radix-backed collapsible sections; single + multiple expand modes", source: "packages/react/src/demos/accordion.tsx" },
      { to: "/collapsible", label: "Collapsible", description: "One region that shows and hides — the single disclosure Accordion overserves", source: "packages/react/src/demos/collapsible.tsx" },
      { to: "/native-select", label: "NativeSelect", description: "The platform <select>, styled to match Input — submits with no hidden input, opens as the OS picker on a phone", source: "packages/react/src/demos/native-select.tsx" },
      { to: "/label", label: "Label", description: "The <label> for a control outside a Form; required marker, sizes, peer-disabled dimming", source: "packages/react/src/demos/label.tsx" },
      { to: "/card", label: "Card", description: "Surface primitive + SelectableCard variant for goal pickers / plan selectors", source: "packages/react/src/demos/card.tsx" },
      { to: "/paper", label: "Paper", description: "Document surface — reading measure, document typography, and a paper Dialog variant", source: "packages/react/src/demos/paper.tsx" },
      { to: "/stat-card", label: "StatCard", description: "A labelled figure — icon, delta, and somewhere to go", source: "packages/react/src/demos/stat-card.tsx", updated: "12.3.0" },
      { to: "/tile", label: "Tile", description: "A launchpad: tiles with a mark, a name and a live count, in a grid that is one tab stop with arrow keys", source: "packages/react/src/demos/tile.tsx", since: "12.3.0" },
      { to: "/sheet", label: "Sheet / Drawer", description: "Slide-in side panel on Radix Dialog; right / left / top / bottom", source: "packages/react/src/demos/sheet.tsx" },
      { to: "/date-range-picker", label: "DateRangePicker", description: "Two-month side-by-side calendar in a Popover; range anchoring, controlled / uncontrolled", source: "packages/react/src/demos/date-range-picker.tsx" },
      { to: "/dynamic-date-range", label: "DynamicDateRange", description: "Semantic periods — \"Last 7 days\", \"This quarter\"; stores the question, not the answer", source: "packages/react/src/demos/dynamic-date-range.tsx", updated: "13.3.0" },
      { to: "/tag-input", label: "TagInput", description: "Type + Enter chip input; comma-paste splits, Backspace removes, per-tag validator, max-N", source: "packages/react/src/demos/tag-input.tsx" },
      { to: "/multi-combobox", label: "MultiCombobox", description: "Multi-select Combobox with chip trigger + overflow collapse + sync / async option loading", source: "packages/react/src/demos/multi-combobox.tsx", updated: "12.8.1" },
      { to: "/rating", label: "Rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg, customizable max", source: "packages/react/src/demos/rating.tsx" },
      { to: "/nps", label: "NPS", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter color buckets", source: "packages/react/src/demos/nps.tsx" },
      { to: "/likert", label: "Likert", description: "n-point attitudinal scale; segmented + stacked layouts, custom option sets", source: "packages/react/src/demos/likert.tsx" },
      { to: "/time-picker", label: "TimePicker", description: "Segmented HH:MM(:SS) input, 12h / 24h, AM/PM, auto-advance + arrow stepping", source: "packages/react/src/demos/time-picker.tsx" },
      { to: "/date-time-picker", label: "DateTimePicker", description: "Calendar + TimePicker in one Popover; preserves time-of-day on day changes", source: "packages/react/src/demos/date-time-picker.tsx" },
      { to: "/barcode", label: "QRCode and Barcode", description: "Draw codes as SVG for screens and print: QR (the e-invoice's signed QR, gate passes; error correction L to H), Code 128, EAN-13 and Code 39, dark on light in every theme", source: "packages/react/src/demos/barcode.tsx", since: "12.3.0" },
      { to: "/qr-scanner", label: "QRScanner", description: "Camera-based QR / barcode scanner; native BarcodeDetector + custom-decoder escape hatch", source: "packages/react/src/demos/qr-scanner.tsx" },
      { to: "/notifications-inbox", label: "NotificationsInbox", description: "Bell icon + popover panel; day-grouped feed with unread badge + per-row actions", source: "packages/react/src/demos/notifications-inbox.tsx" },
      { to: "/breadcrumb", label: "Breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees", source: "packages/react/src/demos/breadcrumb.tsx", updated: "12.3.0" },
      { to: "/pagination", label: "Pagination", description: "Page navigation with truncated ranges; usePaginationRange hook", source: "packages/react/src/demos/pagination.tsx" },
      { to: "/sidebar", label: "Sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu", source: "packages/react/src/demos/sidebar.tsx", updated: "12.9.0" },
    ],
  },
  {
    title: "Heavy / optional (lazy peer deps)",
    items: [
      { to: "/chart", label: "Chart (recharts)", description: "Lazy-loaded line / bar / area / pie / donut; recharts is an optional peer dep", source: "packages/react/src/demos/chart.tsx" },
      { to: "/analytic-chart", label: "AnalyticChart", description: "Interactive business charts: bar, line, area, combo with two axes, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, and your own types; click to drill down or filter, a table view, PNG and CSV download", source: "packages/react/src/demos/analytic-chart.tsx", since: "12.4.0", updated: "12.9.0" },
      { to: "/rich-text", label: "RichText (jodit)", description: "Lazy-loaded WYSIWYG editor; jodit-pro-react is an optional peer dep", source: "packages/react/src/demos/rich-text.tsx", updated: "13.3.0" },
      { to: "/map", label: "Map (leaflet)", description: "Lazy-loaded map with markers; leaflet + react-leaflet are optional peer deps", source: "packages/react/src/demos/map.tsx" },
      { to: "/camera", label: "Camera (webcam)", description: "Lazy-loaded camera capture; react-webcam is an optional peer dep", source: "packages/react/src/demos/camera.tsx" },
    ],
  },
  {
    title: "Zen-shaped",
    items: [
      { to: "/icon", label: "Icon", description: "zen-ui icon set (48 glyphs); inherits text colour, decorative by default", source: "packages/react/src/demos/icon.tsx" },
      { to: "/object", label: "Object atoms", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker", source: "packages/react/src/demos/object.tsx", updated: "12.3.0" },
      { to: "/button-family", label: "Button family", description: "ToggleButton, SegmentedButton, SplitButton", source: "packages/react/src/demos/button-family.tsx", updated: "12.3.0" },
      { to: "/document-tabs", label: "Document tabs", description: "A workspace's open documents as closable, pinnable tabs with an all-tabs menu", source: "packages/react/src/demos/document-tabs.tsx", since: "12.3.0" },
      { to: "/toolbar", label: "Toolbar", description: "Actions that collapse into an overflow menu when they do not fit", source: "packages/react/src/demos/toolbar.tsx" },
      { to: "/tree", label: "Tree", description: "Hierarchical expandable list with full ARIA keyboard navigation", source: "packages/react/src/demos/tree.tsx", updated: "12.13.0" },
    ],
  },
  {
    title: "Zen table ecosystem",
    items: [
      { to: "/select-dialog", label: "SelectDialog", description: "Searchable list picker — single commits on click, multi commits on OK", source: "packages/react/src/demos/select-dialog.tsx" },
      { to: "/value-help", label: "ValueHelp", description: "F4 lookup dialog — the list picker plus a condition builder", source: "packages/react/src/demos/value-help.tsx", updated: "12.3.0" },
      { to: "/view-settings", label: "ViewSettingsDialog", description: "Sort / group / filter settings; commits on OK", source: "packages/react/src/demos/view-settings.tsx", updated: "12.3.0" },
      { to: "/filter-builder", label: "FilterBuilder", description: "Nested AND/OR conditions on any field as one serialisable object, for advanced list filters, report criteria and saved views; says in words what it filters", source: "packages/react/src/demos/filter-builder.tsx", since: "12.3.0" },
      { to: "/view-manager", label: "ViewManager", description: "Saved views beside the page title: name, save, save as, set as default, manage and share a list screen's filters, sort and columns as one object; storage stays the app's", source: "packages/react/src/demos/view-manager.tsx", since: "12.3.0" },
      { to: "/filter-bar", label: "FilterBar", description: "List Report filter area — fields, Go, and Adapt filters", source: "packages/react/src/demos/filter-bar.tsx" },
    ],
  },
  {
    title: "Zen app frame",
    items: [
      { to: "/page-header", label: "PageHeader", description: "A heading with a back affordance and one action — the light one", source: "packages/react/src/demos/page-header.tsx" },
      { to: "/skip-to-content", label: "SkipToContent", description: "Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)", source: "packages/react/src/demos/skip-to-content.tsx" },
      { to: "/shellbar", label: "ShellBar", description: "Top-level app header — branding, search, actions, profile menu", source: "packages/react/src/demos/shellbar.tsx", updated: "12.3.0" },
      { to: "/status-bar", label: "StatusBar", description: "The strip along the bottom of an app or editor \u2014 text and clickable items on two sides, coloured chips for problems, and the least important items giving way first when it is narrow", source: "packages/react/src/demos/status-bar.tsx", since: "12.11.0" },
      { to: "/flexible-column-layout", label: "FlexibleColumnLayout", description: "1–3 column master-detail frame with responsive collapse", source: "packages/react/src/demos/flexible-column-layout.tsx" },
      { to: "/dynamic-page", label: "DynamicPage", description: "Title + header that snaps away on scroll; pinnable header", source: "packages/react/src/demos/dynamic-page.tsx" },
      { to: "/object-page", label: "ObjectPageLayout", description: "Anchored sections with scroll-spy navigation", source: "packages/react/src/demos/object-page.tsx", updated: "12.3.1" },
    ],
  },
  {
    // Screens, not components. Everything here is assembled from what is
    // already in the sidebar above — the point is the composition, so a
    // "ListReport" component would defeat it. Solid's nav already uses
    // "Composite" for components BUILT FROM other components (QRScanner,
    // NotificationsInbox), which is a different idea; hence "Patterns".
    title: "Patterns",
    components: false,
    items: [
      { to: "/list-report", label: "List Report", description: "FilterBar + DataTable — filter a set, read the result, act on a row", source: "packages/react/src/demos/list-report.tsx" },
    ],
  },
];
