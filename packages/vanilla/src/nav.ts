/**
 * The single source of truth for the sidebar and the landing-page catalogue.
 *
 * Adding a component: add it here, add its route in main.ts. Nothing else. The
 * other two bindings kept two hand-maintained lists that drifted 16 entries apart
 * before `check:nav` started re-deriving the truth from the router.
 *
 * `source` is the demo file "View code" opens, guarded by `bun run check:nav`,
 * which re-derives route -> component -> file from main.ts and compares. Left
 * alone these rot: a demo gets renamed, the link keeps working, and it opens the
 * wrong file for a visitor and nobody else.
 *
 * ONE ENTRY PER LINE, deliberately. check:nav matches an entry with
 * `\{[^{}\n]*to:\s*"…"[^{}\n]*\}` — a single-line object — which is the shape
 * React's nav.ts already uses. Reformatting these across lines does not fail the
 * check; it makes the entry invisible TO the check, which silently stops guarding
 * the source path. That is worse than a failure and is exactly what happened here
 * once already.
 */

import { RELEASE_NOTES } from "@algorisys/zen-ui-core/release-notes";

export type NavItem = {
  to: string;
  label: string;
  /** Shown on the landing page. Omitted for non-component routes. */
  description?: string;
  /** Repo-relative path to the demo file behind this route. */
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
  /** Groups flagged `catalogue: false` are sidebar-only. */
  catalogue?: boolean;
  /** Whether the group's items count toward the header's component tally. */
  components?: boolean;
};

export const NAV: NavGroup[] = [
  {
    title: "Getting started",
    catalogue: false,
    components: false,
    items: [
      { to: "/", label: "Welcome", description: "", source: "packages/vanilla/src/components/Welcome.ts" },
    ],
  },
  {
    title: "Components",
    items: [
      { to: "/button", label: "Button", description: "Variant × color × size × shape, polymorphic via `as`, loading state", source: "packages/vanilla/src/components/ButtonDemo.ts" },
      { to: "/badge", label: "Badge", description: "Styled span; the whole component is variants, cn() and the prefix", source: "packages/vanilla/src/components/BadgeDemo.ts" },
      { to: "/collapsible", label: "Collapsible", description: "One region that shows and hides — the single disclosure Accordion overserves", source: "packages/vanilla/src/components/CollapsibleDemo.ts" },
      { to: "/accordion", label: "Accordion", description: "Collapsible sections; single + multiple, keyboard nav, real height animation", source: "packages/vanilla/src/components/AccordionDemo.ts" },
      { to: "/tabs", label: "Tabs", description: "Roving focus, underline + pills, controlled and uncontrolled", source: "packages/vanilla/src/components/TabsDemo.ts", updated: "12.3.0" },
      { to: "/label", label: "Label", description: "The <label> for a control outside a Form; required marker, sizes, peer-disabled dimming", source: "packages/vanilla/src/components/LabelDemo.ts" },
      { to: "/input", label: "Input + MaskInput", description: "MaskInput drives core's mask engine — the same applyMask() React and Solid call", source: "packages/vanilla/src/components/InputDemo.ts", updated: "12.3.0" },
      { to: "/search", label: "Search", description: "Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times", source: "packages/vanilla/src/components/SearchDemo.ts" },
      { to: "/password-input", label: "PasswordInput", description: "Password field with a show / hide toggle; every native input prop passes through", source: "packages/vanilla/src/components/PasswordInputDemo.ts" },
      { to: "/select", label: "Select", description: "Listbox on a trigger; the known React/Solid divergence, decided here", source: "packages/vanilla/src/components/SelectDemo.ts", updated: "12.7.0" },
      { to: "/combobox", label: "Combobox + Async", description: "Searchable single-select; sync `options` or async `onSearch` with debounce + abort, plus a creatable row", source: "packages/vanilla/src/components/ComboboxDemo.ts", updated: "12.8.1" },
      { to: "/tree-select", label: "TreeSelect", description: "Pick one node from a hierarchy (accounts, item groups): type to search, matches shown under their ancestors", source: "packages/vanilla/src/components/TreeSelectDemo.ts", since: "12.3.0" },
      { to: "/lookup-field", label: "LookupField", description: "Pick a row from a table of choices (items, customers): column headers, search across the columns in any order, server results, the chosen row returned whole; F4 opens the full search", source: "packages/vanilla/src/components/LookupFieldDemo.ts", since: "12.3.0" },
      { to: "/dialog", label: "Dialog", description: "Portal, focus trap, scroll lock, Escape and click-outside — all hand-written", source: "packages/vanilla/src/components/DialogDemo.ts" },
      { to: "/shortcuts", label: "Shortcuts", description: "Kbd key caps, useShortcut with scopes, and a ? overlay listing every key: one chord string, spelled per platform", source: "packages/vanilla/src/components/ShortcutsDemo.ts", since: "12.3.0" },
      { to: "/separator", label: "Separator", description: "Radix Separator — horizontal / vertical with decorative semantics", source: "packages/vanilla/src/components/SeparatorDemo.ts" },
      { to: "/progress", label: "Progress", description: "Determinate progress indicator — sizes × colors, accessible value", source: "packages/vanilla/src/components/ProgressDemo.ts" },
      { to: "/loading", label: "Loading", description: "Animated spinner with sr-only label, color=current for buttons", source: "packages/vanilla/src/components/LoadingDemo.ts" },
      { to: "/skeleton", label: "Skeleton", description: "Animated muted-box placeholder", source: "packages/vanilla/src/components/SkeletonDemo.ts" },
      { to: "/avatar", label: "Avatar", description: "Radix Avatar — image + initials fallback + stacked group", source: "packages/vanilla/src/components/AvatarDemo.ts" },
      { to: "/link", label: "Link", description: "Styled anchor; real &lt;a&gt; always, external, inline, disabled", source: "packages/vanilla/src/components/LinkDemo.ts" },
      { to: "/theme", label: "Theme", description: "Scopes a theme to a subtree \u2014 a dark panel inside a light page; nests, no JS", source: "packages/vanilla/src/components/ThemeDemo.ts" },
      { to: "/localization", label: "Localization", description: "Translate every built-in string through LocaleProvider (any subset; the rest stays English), with plural rules per language; set the locale and currency numbers and dates use", source: "packages/vanilla/src/components/LocaleDemo.ts", since: "12.3.0" },
      { to: "/message-popover", label: "MessagePopover", description: "Aggregated form validation grouped by severity; click a message to land on the field", source: "packages/vanilla/src/components/MessagePopoverDemo.ts" },
      { to: "/direction", label: "DirectionProvider", description: "Right-to-left support \u2014 tells menus, tabs and sliders which way the page reads", source: "packages/vanilla/src/components/DirectionDemo.ts" },
      { to: "/stack", label: "Stack", description: "Minimal flexbox layout primitive — a thin div laying children out in a row or column with configurable alignment, wrapping, gap and padding.", source: "packages/vanilla/src/components/StackDemo.ts" },
      { to: "/stat-card", label: "StatCard", description: "A labelled figure — icon, delta, and somewhere to go", source: "packages/vanilla/src/components/StatCardDemo.ts", updated: "12.3.0" },
      { to: "/tile", label: "Tile", description: "A launchpad: tiles with a mark, a name and a live count, in a grid that is one tab stop with arrow keys", source: "packages/vanilla/src/components/TileDemo.ts", since: "12.3.0" },
      { to: "/card", label: "Card", description: "Generic surface primitive with a compound Header / Content / Footer API and three variants (elevated · outlined · ghost)", source: "packages/vanilla/src/components/CardDemo.ts" },
      { to: "/paper", label: "Paper", description: "Document surface — reading measure, document typography, and a paper Dialog variant", source: "packages/vanilla/src/components/PaperDemo.ts" },
      { to: "/empty-state", label: "EmptyState", description: "First-run / no-data / no-results surface; icon + title + description + actions", source: "packages/vanilla/src/components/EmptyStateDemo.ts" },
      { to: "/alert", label: "Alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions API", source: "packages/vanilla/src/components/AlertDemo.ts" },
      { to: "/fab", label: "FAB", description: "Fixed-position Button wrapper for a floating action button, with speed-dial composition", source: "packages/vanilla/src/components/FABDemo.ts" },
      { to: "/banner", label: "Banner", description: "Page-top persistent callout — verification reminders, maintenance windows, impersonation", source: "packages/vanilla/src/components/BannerDemo.ts" },
      { to: "/breadcrumb", label: "Breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees", source: "packages/vanilla/src/components/BreadcrumbDemo.ts", updated: "12.3.0" },
      { to: "/page", label: "Page + Bar", description: "The Page whole-screen container and the three-slot Bar row — the structural frame pieces", source: "packages/vanilla/src/components/PageDemo.ts" },
      { to: "/switch", label: "Switch", description: "Boolean toggle — sizes, controlled / uncontrolled, hidden-checkbox form submission", source: "packages/vanilla/src/components/SwitchDemo.ts" },
      { to: "/number-field", label: "NumberField", description: "Number input with −/+ stepper, clamp, decimal step", source: "packages/vanilla/src/components/NumberFieldDemo.ts", updated: "12.7.0" },
      { to: "/amount-field", label: "AmountField and QuantityField", description: "Amounts and quantities typed the way clerks do (1,25,000, 2.5L, 1.2Cr), formatted in the locale with the currency's own precision; LocaleProvider sets locale and currency once", source: "packages/vanilla/src/components/AmountFieldDemo.ts", since: "12.3.0" },
      { to: "/textarea", label: "Textarea", description: "Plain styled <textarea> primitive, all native attrs", source: "packages/vanilla/src/components/TextareaDemo.ts" },
      { to: "/slider", label: "Slider", description: "Single-thumb or multi-thumb range slider — pointer drag, keyboard control, ARIA, marks, vertical orientation", source: "packages/vanilla/src/components/SliderDemo.ts" },
      { to: "/checkbox", label: "Checkbox", description: "Tri-state checkbox (true / false / indeterminate) with a single prop, sizes, and native form submission", source: "packages/vanilla/src/components/CheckboxDemo.ts" },
      { to: "/phone-input", label: "PhoneInput", description: "Composition: Select (country) + Input (number)", source: "packages/vanilla/src/components/PhoneInputDemo.ts" },
      { to: "/time-picker", label: "TimePicker", description: "Segmented HH:MM(:SS) input, 12h / 24h, AM/PM, auto-advance + arrow stepping", source: "packages/vanilla/src/components/TimePickerDemo.ts" },
      { to: "/radio-group", label: "RadioGroup", description: "Roving tabindex, arrow-key nav, form submission", source: "packages/vanilla/src/components/RadioGroupDemo.ts", updated: "12.9.0" },
      { to: "/tag-input", label: "TagInput", description: "Type + Enter chip input; comma-paste splits, Backspace removes, per-tag validator, max-N", source: "packages/vanilla/src/components/TagInputDemo.ts" },
      { to: "/pagination", label: "Pagination", description: "Page navigation with truncated ranges; paginationRange() helper", source: "packages/vanilla/src/components/PaginationDemo.ts" },
      { to: "/sheet", label: "Sheet / Drawer", description: "Slide-in side panel on hand-written portal/focus-trap/scroll-lock; right / left / top / bottom", source: "packages/vanilla/src/components/SheetDemo.ts" },
      { to: "/otp", label: "InputOTP", description: "one input per digit, zero-dep; paste / autocomplete / a11y", source: "packages/vanilla/src/components/InputOTPDemo.ts" },
      { to: "/popover", label: "Popover", description: "Anchored panel; trigger + separate anchor, side/align with collision flip", source: "packages/vanilla/src/components/PopoverDemo.ts" },
      { to: "/tooltip", label: "Tooltip", description: "Hover/focus bubble on a trigger; hand-written portal, collision positioning, delay, and dismissal", source: "packages/vanilla/src/components/TooltipDemo.ts" },
      { to: "/nps", label: "NPS", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter color buckets", source: "packages/vanilla/src/components/NpsDemo.ts" },
      { to: "/likert", label: "Likert", description: "n-point attitudinal scale; segmented, stacked and scale layouts, custom option sets", source: "packages/vanilla/src/components/LikertDemo.ts" },
      { to: "/rating", label: "Rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg, customizable max", source: "packages/vanilla/src/components/RatingDemo.ts" },
      { to: "/scroll-area", label: "ScrollArea", description: "Custom scrollbars over native scrolling, both axes — hand-written, no primitive library", source: "packages/vanilla/src/components/ScrollAreaDemo.ts" },
      { to: "/stepper", label: "Stepper", description: "Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)", source: "packages/vanilla/src/components/StepperDemo.ts", updated: "12.3.0" },
      { to: "/carousel", label: "Carousel", description: "Scroll-snap slide strip; every child is a slide, no autoplay", source: "packages/vanilla/src/components/CarouselDemo.ts" },
      { to: "/dropdown-menu", label: "DropdownMenu", description: "Action menus, sub-menus, checkbox/radio items — positioning, keyboard nav and dismissal all hand-written", source: "packages/vanilla/src/components/DropdownMenuDemo.ts", updated: "12.3.0" },
      { to: "/context-menu", label: "ContextMenu", description: "Right-click menus at the pointer, from the keyboard (menu key, Shift+F10) and on long press", source: "packages/vanilla/src/components/ContextMenuDemo.ts", since: "12.3.0" },
      { to: "/file-upload", label: "FileUpload", description: "Drag-and-drop or browse; accept / max-size / max-files validation with an inline removable file list", source: "packages/vanilla/src/components/FileUploadDemo.ts", updated: "12.3.0" },
      { to: "/color-picker", label: "ColorPicker", description: "Swatch palette + the platform picker; hex in, hex out", source: "packages/vanilla/src/components/ColorPickerDemo.ts" },
      { to: "/multi-combobox", label: "MultiCombobox", description: "Multi-select Combobox with chip trigger + overflow collapse + sync / async option loading", source: "packages/vanilla/src/components/MultiComboboxDemo.ts", updated: "12.8.1" },
      { to: "/sidebar", label: "Sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu", source: "packages/vanilla/src/components/SidebarDemo.ts", updated: "12.9.0" },
      { to: "/date-input", label: "DateInput", description: "Type a date the way clerks do (150326, t, +7) in the locale's order, with the calendar as a second way in; impossible dates are kept and flagged, never rolled over", source: "packages/vanilla/src/components/DateInputDemo.ts", since: "12.3.0" },
      { to: "/date-picker", label: "DatePicker", description: "Trigger-anchored date picker plus a from-scratch inline Calendar (single/multiple/range)", source: "packages/vanilla/src/components/DatePickerDemo.ts" },
      { to: "/notifications-inbox", label: "NotificationsInbox", description: "Bell icon + popover panel; day-grouped feed with unread badge + per-row actions", source: "packages/vanilla/src/components/NotificationsInboxDemo.ts" },
      { to: "/virtualized-items", label: "Virtualized items", description: "A windowed scrolling viewport that mounts only the visible rows of a huge list — dense array or server-paged sparse mode", source: "packages/vanilla/src/components/VirtualizedItemsDemo.ts" },
      { to: "/date-time-picker", label: "DateTimePicker", description: "Calendar + TimePicker in one Popover; preserves time-of-day on day changes", source: "packages/vanilla/src/components/DateTimePickerDemo.ts" },
      { to: "/date-range-picker", label: "DateRangePicker", description: "Two-month side-by-side calendar in a Popover; range anchoring, controlled / uncontrolled", source: "packages/vanilla/src/components/DateRangePickerDemo.ts" },
      { to: "/toast", label: "Toast", description: "Radix-parity toasts — imperative toast() plus a Toaster() viewport; variants, actions, plus hand-written timer, hover-pause, swipe-to-dismiss and ARIA live region", source: "packages/vanilla/src/components/ToastDemo.ts" },
      { to: "/barcode", label: "QRCode and Barcode", description: "Draw codes as SVG for screens and print: QR (the e-invoice's signed QR, gate passes; error correction L to H), Code 128, EAN-13 and Code 39, dark on light in every theme", source: "packages/vanilla/src/components/BarcodeDemo.ts", since: "12.3.0" },
      { to: "/qr-scanner", label: "QRScanner", description: "Camera-based QR / barcode scanner; native BarcodeDetector + custom-decoder escape hatch", source: "packages/vanilla/src/components/QRScannerDemo.ts" },
      { to: "/data-table", label: "DataTable", description: "A headless data grid — columns, sorting, pagination, row selection, and row virtualization — hand-written with no table library", source: "packages/vanilla/src/components/DataTableDemo.ts", updated: "12.8.0" },
      { to: "/tree-table", label: "TreeTable", description: "Hierarchical rows; chevron indents inside the first column, filter keeps ancestors", source: "packages/vanilla/src/components/TreeTableDemo.ts" },
      { to: "/micro-chart", label: "Micro charts", description: "Sparkline-sized trend marks for a table cell or card \u2014 line, bar, bullet, delta, radial", source: "packages/vanilla/src/components/MicroChartDemo.ts", updated: "12.3.0" },
      { to: "/timeline", label: "Timeline", description: "Ordered list of events with a rail, markers, timestamps and date groups", source: "packages/vanilla/src/components/TimelineDemo.ts" },
      { to: "/upload-collection", label: "UploadCollection", description: "The list of uploaded files \u2014 progress, rename, delete, retry; the result FileUpload has no view for", source: "packages/vanilla/src/components/UploadCollectionDemo.ts" },
      { to: "/planning-calendar", label: "PlanningCalendar", description: "Resource-by-time grid \u2014 rows of people or rooms, appointments as blocks, day / week / month views", source: "packages/vanilla/src/components/PlanningCalendarDemo.ts" },
      { to: "/gantt", label: "Gantt", description: "Project schedule \u2014 a collapsing task tree beside bars on a shared clock, with percent-complete fills, slip chips and dependency arrows; opens on a fit axis taken from the data, one tab stop with arrow-key grid navigation", source: "packages/vanilla/src/components/GanttDemo.ts" },
      { to: "/production-schedule", label: "ProductionSchedule", description: "Shop-floor schedule \u2014 work centres as rows holding many operations in lanes, changeovers drawn as time the machine is busy making nothing, finite capacity with overload, and a load histogram of booked over available WORKING hours", source: "packages/vanilla/src/components/ProductionScheduleDemo.ts" },
      { to: "/form", label: "Form (RHF + Zod)", description: "createForm() controller + any zod-shaped schema; FormField wires a11y/errors (React's FormControl Slot, without a Slot), plus Bound* field wrappers", source: "packages/vanilla/src/components/FormDemo.ts" },
      { to: "/pivot", label: "Pivot", description: "Drag-and-drop pivot builder; fields into zones, 2D-windowed grid", source: "packages/vanilla/src/components/PivotDemo.ts" },
      { to: "/media-timeline", label: "MediaTimeline", description: "Filmstrip trim track — draggable ranges over thumbnails, playhead, hover scrub, zoom; the app owns the state", source: "packages/vanilla/src/components/MediaTimelineDemo.ts" },
      { to: "/waveform", label: "Waveform", description: "Audio peaks lane with a draggable, trimmable clip window; shares a zoom with MediaTimeline so lanes align", source: "packages/vanilla/src/components/WaveformDemo.ts" },
      { to: "/countdown", label: "TimerBadge / TestCountdownBar", description: "Exam clock from a deadline, not a decrementing number — colour thresholds, auto-expire hook, sticky bar", source: "packages/vanilla/src/components/CountdownDemo.ts" },
      { to: "/spreadsheet-grid", label: "SpreadsheetGrid / SheetCalculator", description: "Editable cells with a real formula evaluator; errors render as errors, never a plausible number", source: "packages/vanilla/src/components/SpreadsheetGridDemo.ts" },
      { to: "/proctor", label: "ProctorStreamGrid / ProctorFlagOverlay", description: "Live candidate tiles with violation flags; displays streams, does not detect anything", source: "packages/vanilla/src/components/ProctorDemo.ts" },
      { to: "/chunk-uploader", label: "ChunkUploader", description: "Large file in pieces — bounded retries, exponential backoff, pause and resume", source: "packages/vanilla/src/components/ChunkUploaderDemo.ts" },
      { to: "/diff-view", label: "DiffView", description: "What changed between two snapshots — added / removed / changed rows for an audit payload or a revision", source: "packages/vanilla/src/components/DiffViewDemo.ts" },
      { to: "/splitter", label: "Splitter", description: "Resizable panes — drag the divider, or arrow it; percentages, collapse, full WAI-ARIA separator", source: "packages/vanilla/src/components/SplitterDemo.ts" },
      { to: "/sortable-list", label: "SortableList", description: "Reorder a list by dragging or entirely by keyboard; the app owns the order", source: "packages/vanilla/src/components/SortableListDemo.ts" },
    ],
  },
  {
    title: "Heavy / optional (lazy peer deps)",
    items: [
      { to: "/rich-text", label: "RichText (jodit)", description: "Lazy-loaded WYSIWYG editor; jodit is an optional peer dep", source: "packages/vanilla/src/components/RichTextDemo.ts" },
      { to: "/camera", label: "Camera (webcam)", description: "Webcam capture via getUserMedia; onCapture returns a data-URL screenshot painted from an offscreen canvas", source: "packages/vanilla/src/components/CameraDemo.ts" },
      { to: "/map", label: "Map (leaflet)", description: "Lazy-loaded map with markers; leaflet is an optional peer dep", source: "packages/vanilla/src/components/MapDemo.ts" },
      { to: "/chart", label: "Chart", description: "Line / bar / area / pie / donut; dependency-free SVG in the vanilla binding", source: "packages/vanilla/src/components/ChartDemo.ts" },
      { to: "/analytic-chart", label: "AnalyticChart", description: "Interactive business charts: bar, line, area, combo with two axes, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, and your own types; click to drill down or filter, a table view, PNG and CSV download", source: "packages/vanilla/src/components/AnalyticChartDemo.ts", since: "12.4.0" },
      { to: "/code-editor", label: "CodeEditor / IDEWindow", description: "Monaco wrapper — language, theme, read-only, Ctrl+Enter run hook; file list beside it", source: "packages/vanilla/src/components/CodeEditorDemo.ts" },
      { to: "/document-viewer", label: "DocumentViewer", description: "Show a scanned document — image or PDF, with zoom, fit, rotate and page count; the other half of FileUpload", source: "packages/vanilla/src/components/DocumentViewerDemo.ts" },
      { to: "/diagram-canvas", label: "DiagramCanvas / ArchitectureDraw", description: "Embedded diagrams.net or YappyDraw editor over postMessage; draw.io XML or Yappy JSON in and out", source: "packages/vanilla/src/components/DiagramCanvasDemo.ts" },
    ],
  },
  {
    title: "Zen-shaped",
    items: [
      { to: "/icon", label: "Icon", description: "The shared zen-ui icon set, rendered straight from core's geometry", source: "packages/vanilla/src/components/IconDemo.ts" },
      { to: "/object", label: "Object atoms", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker", source: "packages/vanilla/src/components/ObjectDemo.ts", updated: "12.3.0" },
      { to: "/button-family", label: "Button family", description: "ToggleButton, SegmentedButton, SplitButton", source: "packages/vanilla/src/components/ButtonFamilyDemo.ts", updated: "12.3.0" },
      { to: "/document-tabs", label: "Document tabs", description: "A workspace's open documents as closable, pinnable tabs with an all-tabs menu", source: "packages/vanilla/src/components/DocumentTabsDemo.ts", since: "12.3.0" },
      { to: "/tree", label: "Tree", description: "Hierarchical expandable list with full ARIA keyboard navigation", source: "packages/vanilla/src/components/TreeDemo.ts" },
      { to: "/toolbar", label: "Toolbar", description: "Actions that collapse into an overflow menu when they do not fit", source: "packages/vanilla/src/components/ToolbarDemo.ts" },
    ],
  },
  {
    title: "Zen table ecosystem",
    items: [
      { to: "/filter-bar", label: "FilterBar", description: "List Report filter area — fields, Go, and Adapt filters", source: "packages/vanilla/src/components/FilterBarDemo.ts" },
      { to: "/select-dialog", label: "SelectDialog", description: "Searchable list picker — single commits on click, multi commits on OK", source: "packages/vanilla/src/components/SelectDialogDemo.ts" },
      { to: "/value-help", label: "ValueHelp", description: "F4 lookup dialog — the list picker plus a condition builder", source: "packages/vanilla/src/components/ValueHelpDemo.ts", updated: "12.3.0" },
      { to: "/view-settings", label: "ViewSettingsDialog", description: "Sort / group / filter settings; commits on OK", source: "packages/vanilla/src/components/ViewSettingsDemo.ts", updated: "12.3.0" },
      { to: "/filter-builder", label: "FilterBuilder", description: "Nested AND/OR conditions on any field as one serialisable object, for advanced list filters, report criteria and saved views; says in words what it filters", source: "packages/vanilla/src/components/FilterBuilderDemo.ts", since: "12.3.0" },
      { to: "/view-manager", label: "ViewManager", description: "Saved views beside the page title: name, save, save as, set as default, manage and share a list screen's filters, sort and columns as one object; storage stays the app's", source: "packages/vanilla/src/components/ViewManagerDemo.ts", since: "12.3.0" },
    ],
  },
  {
    title: "Zen app frame",
    items: [
      { to: "/page-header", label: "PageHeader", description: "A heading with a back affordance and one action — the light one", source: "packages/vanilla/src/components/PageHeaderDemo.ts" },
      { to: "/skip-to-content", label: "SkipToContent", description: "Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)", source: "packages/vanilla/src/components/SkipToContentDemo.ts" },
      { to: "/shellbar", label: "ShellBar", description: "Top-level app header — branding, search, actions, profile menu", source: "packages/vanilla/src/components/ShellBarDemo.ts", updated: "12.3.0" },
      { to: "/flexible-column-layout", label: "FlexibleColumnLayout", description: "1–3 column master-detail frame with responsive collapse", source: "packages/vanilla/src/components/FlexibleColumnLayoutDemo.ts" },
      { to: "/dynamic-page", label: "DynamicPage", description: "Title + header that snaps away on scroll; pinnable header", source: "packages/vanilla/src/components/DynamicPageDemo.ts" },
      { to: "/object-page", label: "ObjectPageLayout", description: "Anchored sections with scroll-spy navigation", source: "packages/vanilla/src/components/ObjectPageLayoutDemo.ts", updated: "12.3.1" },
    ],
  },
];
