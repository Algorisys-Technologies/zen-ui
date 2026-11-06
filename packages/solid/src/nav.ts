/**
 * Single source of truth for the demo's navigation AND its landing-page
 * catalogue. Both App.tsx (sidebar) and components/Welcome.tsx (cards) render
 * from this list so the two cannot drift apart.
 *
 * Adding a component: add it here, add its <Route> in main.tsx. Nothing else.
 */

import { RELEASE_NOTES } from "./release-notes";

export type NavItem = {
  path: string;
  label: string;
  /** Shown on the landing page. */
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
  group: string;
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
    // The landing page was reachable only by typing "/" — the sidebar had no
    // link to it, unlike the React demo. Mirrors React's "Getting started".
    group: "Getting started",
    catalogue: false,
    items: [
      { label: "Welcome", path: "/", source: "packages/solid/src/components/Welcome.tsx" },
      { label: "Customizing", path: "/customizing", source: "packages/solid/src/components/NewCustomizingDemo.tsx" },
    ],
  },
  {
    group: "Primitives",
    items: [
      { label: "Button", path: "/button", description: "Variants \u00d7 colours \u00d7 sizes \u00d7 shapes via CVA; polymorphic `as` prop", source: "packages/solid/src/components/NewButtonDemo.tsx" },
      { label: "Badge", path: "/badge", description: "Styled span with variants \u00d7 colours; `as` for clickable badges", source: "packages/solid/src/components/NewBadgeDemo.tsx" },
      { label: "Link", path: "/link", description: "Styled anchor; polymorphic via as, external, disabled", source: "packages/solid/src/components/NewLinkDemo.tsx" },
      { label: "Theme", path: "/theme", description: "Scopes a theme to a subtree \u2014 a dark panel inside a light page; nests, no JS", source: "packages/solid/src/components/NewThemeDemo.tsx" },
      { label: "Localization", path: "/localization", description: "Translate every built-in string through LocaleProvider (any subset; the rest stays English), with plural rules per language; set the locale and currency numbers and dates use", source: "packages/solid/src/components/NewLocaleDemo.tsx", since: "12.2.0" },
      { label: "DirectionProvider", path: "/direction", description: "Right-to-left support \u2014 tells menus, tabs and sliders which way the page reads", source: "packages/solid/src/components/NewDirectionDemo.tsx" },
      { label: "MessagePopover", path: "/message-popover", description: "Aggregated form validation grouped by severity; click a message to land on the field", source: "packages/solid/src/components/NewMessagePopoverDemo.tsx" },
      { label: "Page + Bar", path: "/page", description: "The Page whole-screen container and the three-slot Bar row \u2014 the structural frame pieces", source: "packages/solid/src/components/NewPageDemo.tsx" },
      { label: "ColorPicker", path: "/color-picker", description: "Swatch palette + the platform picker; hex in, hex out", source: "packages/solid/src/components/NewColorPickerDemo.tsx" },
      { label: "Carousel", path: "/carousel", description: "Scroll-snap slide strip; every child is a slide, no autoplay", source: "packages/solid/src/components/NewCarouselDemo.tsx" },
      { label: "Card", path: "/card", description: "Surface primitive + SelectableCard for goal pickers / plan selectors", source: "packages/solid/src/components/NewCardDemo.tsx" },
      { label: "Paper", path: "/paper", description: "Document surface — reading measure, document typography, and a paper Dialog variant", source: "packages/solid/src/components/NewPaperDemo.tsx" },
      { label: "StatCard", path: "/stat-card", description: "A labelled figure — icon, delta, and somewhere to go", source: "packages/solid/src/components/NewStatCardDemo.tsx", updated: "12.3.0" },
      { label: "Tile", path: "/tile", description: "A launchpad: tiles with a mark, a name and a live count, in a grid that is one tab stop with arrow keys", source: "packages/solid/src/components/NewTileDemo.tsx", since: "12.2.0" },
      { label: "Skeleton", path: "/skeleton", description: "Animated muted-box placeholder; size it with utility classes", source: "packages/solid/src/components/NewSkeletonDemo.tsx" },
      { label: "Loading", path: "/loading", description: "Animated spinner with sr-only label; colour=current inside buttons", source: "packages/solid/src/components/NewLoadingDemo.tsx" },
      { label: "FAB", path: "/fab", description: "Fixed-position floating action button + speed-dial menu", source: "packages/solid/src/components/NewFABDemo.tsx" },
      { label: "Separator", path: "/separator", description: "Horizontal / vertical rule with decorative semantics", source: "packages/solid/src/components/NewSeparatorDemo.tsx" },
    ],
  },
  {
    group: "Surfaces",
    items: [
      { label: "Alert", path: "/alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions", source: "packages/solid/src/components/NewAlertDemo.tsx" },
      { label: "Banner", path: "/banner", description: "Page-top persistent callout \u2014 maintenance windows, impersonation", source: "packages/solid/src/components/NewBannerDemo.tsx" },
      { label: "EmptyState", path: "/empty-state", description: "First-run / no-data / no-results surface; icon + title + actions", source: "packages/solid/src/components/NewEmptyStateDemo.tsx" },
    ],
  },
  {
    group: "Flows",
    items: [
      { label: "Stepper", path: "/stepper", description: "Multi-step wizard; horizontal / vertical, linear / non-linear", source: "packages/solid/src/components/NewStepperDemo.tsx" , updated: "12.2.0" },
    ],
  },
  {
    group: "Survey",
    items: [
      { label: "Rating", path: "/rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg", source: "packages/solid/src/components/NewRatingDemo.tsx" },
      { label: "NPS", path: "/nps", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter buckets", source: "packages/solid/src/components/NewNpsDemo.tsx" },
      { label: "Likert", path: "/likert", description: "n-point attitudinal scale; segmented + stacked layouts", source: "packages/solid/src/components/NewLikertDemo.tsx" },
    ],
  },
  {
    group: "Display (Kobalte)",
    items: [
      { label: "Avatar", path: "/avatar", description: "Image + initials fallback + stacked group, with status dot", source: "packages/solid/src/components/NewAvatarDemo.tsx" },
      { label: "Progress", path: "/progress", description: "Determinate bar; sizes \u00d7 colours, accessible value", source: "packages/solid/src/components/NewProgressDemo.tsx" },
      { label: "Tooltip", path: "/tooltip", description: "Positioning, dismissal and a11y on Kobalte", source: "packages/solid/src/components/NewTooltipDemo.tsx" },
    ],
  },
  {
    group: "Form (Kobalte)",
    items: [
      { label: "Switch", path: "/switch", description: "Toggle for immediate settings; sizes, controlled / uncontrolled", source: "packages/solid/src/components/NewSwitchDemo.tsx" },
      { label: "Checkbox", path: "/checkbox", description: "Binary + indeterminate tri-state; sizes, form submission", source: "packages/solid/src/components/NewCheckboxDemo.tsx" },
      { label: "RadioGroup", path: "/radio-group", description: "Roving tabindex, arrow-key nav, form submission", source: "packages/solid/src/components/NewRadioGroupDemo.tsx" },
      { label: "Slider", path: "/slider", description: "Single + range, vertical, full keyboard control", source: "packages/solid/src/components/NewSliderDemo.tsx" },
      { label: "Select", path: "/select", description: "Keyboard nav, option groups, form submission", source: "packages/solid/src/components/NewSelectDemo.tsx" , updated: "12.2.0" },
    ],
  },
  {
    group: "Disclosure (Kobalte)",
    items: [
      { label: "Tabs", path: "/tabs", description: "Tabbed navigation; underline + pills variants", source: "packages/solid/src/components/NewTabsDemo.tsx", updated: "12.2.0" },
      { label: "Accordion", path: "/accordion", description: "Collapsible sections; single + multiple expand modes", source: "packages/solid/src/components/NewAccordionDemo.tsx" },
      { label: "Collapsible", path: "/collapsible", description: "One region that shows and hides — the single disclosure Accordion overserves", source: "packages/solid/src/components/NewCollapsibleDemo.tsx" },
    ],
  },
  {
    group: "Overlays (Kobalte)",
    items: [
      { label: "Popover", path: "/popover", description: "Non-modal overlay anchored to a trigger", source: "packages/solid/src/components/NewPopoverDemo.tsx" },
      { label: "Dialog", path: "/dialog", description: "Modal surface, plus AlertDialog for destructive confirms", source: "packages/solid/src/components/NewDialogDemo.tsx" },
      { label: "Sheet", path: "/sheet", description: "Slide-in side panel; right / left / top / bottom", source: "packages/solid/src/components/NewSheetDemo.tsx" },
      { label: "DropdownMenu", path: "/dropdown-menu", description: "Action menus, sub-menus, checkbox / radio items", source: "packages/solid/src/components/NewDropdownMenuDemo.tsx", updated: "12.5.0" },
      { label: "ContextMenu", path: "/context-menu", description: "Right-click menus at the pointer, from the keyboard (menu key, Shift+F10) and on long press", source: "packages/solid/src/components/NewContextMenuDemo.tsx" , since: "12.2.0" },
      { label: "Shortcuts", path: "/shortcuts", description: "Kbd key caps, useShortcut with scopes, and a ? overlay listing every key: one chord string, spelled per platform", source: "packages/solid/src/components/NewShortcutsDemo.tsx", since: "12.2.0" },
      { label: "Toast", path: "/toast", description: "Imperative toast() + Toaster viewport; variants and actions", source: "packages/solid/src/components/NewToastDemo.tsx" },
    ],
  },
  {
    group: "Layout",
    items: [
      { label: "ScrollArea", path: "/scroll-area", description: "Custom scrollbars on both axes", source: "packages/solid/src/components/NewScrollAreaDemo.tsx" },
      // These three had a demo AND a route but no nav entry, so they were
      // unreachable from the sidebar and missing from the catalogue — the
      // "add it to nav.ts" rule, violated quietly. It is why this demo
      // counted 68 components against React's 70.
      { label: "Breadcrumb", path: "/breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees", source: "packages/solid/src/components/NewBreadcrumbDemo.tsx" , updated: "12.2.0" },
      { label: "Pagination", path: "/pagination", description: "Page navigation with truncated ranges", source: "packages/solid/src/components/NewPaginationDemo.tsx" },
      { label: "Sidebar", path: "/sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu", source: "packages/solid/src/components/NewSidebarDemo.tsx" , updated: "12.2.0" },
    ],
  },
  {
    group: "Form (custom)",
    items: [
      { label: "Input", path: "/input", description: "Styled input + textarea; all native attributes pass through", source: "packages/solid/src/components/NewInputDemo.tsx" , updated: "12.2.0" },
      { label: "Label", path: "/label", description: "The <label> for a control outside a Form; required marker, sizes, peer-disabled dimming", source: "packages/solid/src/components/NewLabelDemo.tsx" },
      { label: "Search", path: "/search", description: "Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times", source: "packages/solid/src/components/SearchDemo.tsx" },
      { label: "PasswordInput", path: "/password-input", description: "Password field with a show / hide toggle; every native input attribute passes through", source: "packages/solid/src/components/PasswordInputDemo.tsx" },
      { label: "NumberField", path: "/number-field", description: "Number input with \u2212/+ stepper, clamping, decimal step", source: "packages/solid/src/components/NewNumberFieldDemo.tsx" },
      { label: "AmountField and QuantityField", path: "/amount-field", description: "Amounts and quantities typed the way clerks do (1,25,000, 2.5L, 1.2Cr), formatted in the locale with the currency's own precision; LocaleProvider sets locale and currency once", source: "packages/solid/src/components/NewAmountFieldDemo.tsx", since: "12.2.0" },
      { label: "TagInput", path: "/tag-input", description: "Type + Enter chip input; comma-paste splits, per-tag validator", source: "packages/solid/src/components/NewTagInputDemo.tsx" },
      { label: "PhoneInput", path: "/phone-input", description: "Composition: Select (country) + Input (number)", source: "packages/solid/src/components/NewPhoneInputDemo.tsx" },
      { label: "InputOTP", path: "/otp", description: "One input per digit, zero-dep; paste / autocomplete / a11y", source: "packages/solid/src/components/NewOTPDemo.tsx" },
      { label: "MaskInput", path: "/mask-input", description: "Fixed-template input — 99-9999, aa-99; the mask decides what may be typed", source: "packages/solid/src/components/NewMaskInputDemo.tsx" },
      { label: "FileUpload", path: "/file-upload", description: "Drag-and-drop or browse; accept / max-size validation, progress", source: "packages/solid/src/components/NewFileUploadDemo.tsx" , updated: "12.2.0" },
    ],
  },
  {
    group: "Data",
    items: [
      { label: "DataTable", path: "/data-table", description: "TanStack Table + Virtual; sorting, filtering, grouping, windowing", source: "packages/solid/src/components/NewDataTableDemo.tsx", updated: "12.8.0" },
      { label: "TreeTable", path: "/tree-table", description: "Hierarchical rows; chevron indents inside the first column, filter keeps ancestors", source: "packages/solid/src/components/NewTreeTableDemo.tsx" },
      { label: "Micro charts", path: "/micro-chart", description: "Sparkline-sized trend marks for a table cell or card \u2014 line, bar, bullet, delta, radial", source: "packages/solid/src/components/NewMicroChartDemo.tsx" , updated: "12.2.0" },
      { label: "TimerBadge / TestCountdownBar", path: "/countdown", description: "Exam clock from a deadline, not a decrementing number — colour thresholds, auto-expire hook, sticky bar", source: "packages/solid/src/components/NewCountdownDemo.tsx" },
      { label: "CodeEditor / IDEWindow", path: "/code-editor", description: "Monaco wrapper — language, theme, read-only, Ctrl+Enter run hook; file list beside it", source: "packages/solid/src/components/NewCodeEditorDemo.tsx" },
      { label: "SpreadsheetGrid / SheetCalculator", path: "/spreadsheet-grid", description: "Editable cells with a real formula evaluator; errors render as errors, never a plausible number", source: "packages/solid/src/components/NewSpreadsheetGridDemo.tsx" },
      { label: "ProctorStreamGrid / ProctorFlagOverlay", path: "/proctor", description: "Live candidate tiles with violation flags; displays streams, does not detect anything", source: "packages/solid/src/components/NewProctorDemo.tsx" },
      { label: "ChunkUploader", path: "/chunk-uploader", description: "Large file in pieces — bounded retries, exponential backoff, pause and resume", source: "packages/solid/src/components/NewChunkUploaderDemo.tsx" },
      { label: "DiagramCanvas / ArchitectureDraw", path: "/diagram-canvas", description: "Embedded draw.io or YappyDraw editor over postMessage; XML or JSON in and out", source: "packages/solid/src/components/NewDiagramCanvasDemo.tsx" },
      { label: "Timeline", path: "/timeline", description: "Ordered list of events with a rail, markers, timestamps and date groups; item bodies can be collapsible", source: "packages/solid/src/components/NewTimelineDemo.tsx" },
      { label: "DiffView", path: "/diff-view", description: "What changed between two snapshots — added / removed / changed rows for an audit payload or a revision", source: "packages/solid/src/components/NewDiffViewDemo.tsx" },
      { label: "Splitter", path: "/splitter", description: "Resizable panes — drag the divider, or arrow it; percentages, collapse, full WAI-ARIA separator", source: "packages/solid/src/components/NewSplitterDemo.tsx" },
      { label: "SortableList", path: "/sortable-list", description: "Reorder a list by dragging or entirely by keyboard; the app owns the order", source: "packages/solid/src/components/NewSortableListDemo.tsx" },
      { label: "DocumentViewer", path: "/document-viewer", description: "Show a scanned document — image or PDF, with zoom, fit, rotate and page count; the other half of FileUpload", source: "packages/solid/src/components/NewDocumentViewerDemo.tsx" },
      { label: "UploadCollection", path: "/upload-collection", description: "The list of uploaded files \u2014 progress, rename, delete, retry; the result FileUpload has no view for", source: "packages/solid/src/components/NewUploadCollectionDemo.tsx" },
      { label: "PlanningCalendar", path: "/planning-calendar", description: "Resource-by-time grid \u2014 rows of people or rooms, appointments as blocks, day / week / month views", source: "packages/solid/src/components/NewPlanningCalendarDemo.tsx" },
      { label: "Gantt", path: "/gantt", description: "Project schedule \u2014 a collapsing task tree beside bars on a shared clock, with percent-complete fills, slip chips and dependency arrows", source: "packages/solid/src/components/NewGanttDemo.tsx" },
      { label: "ProductionSchedule", path: "/production-schedule", description: "Shop-floor schedule \u2014 work centres as rows holding many operations in lanes, changeovers drawn as time the machine is busy making nothing, finite capacity with overload, and a load histogram of booked over available WORKING hours", source: "packages/solid/src/components/NewProductionScheduleDemo.tsx" },
      { label: "Pivot", path: "/pivot", description: "Drag-and-drop pivot builder; fields into zones, 2D-windowed grid", source: "packages/solid/src/components/NewPivotDemo.tsx" },
      { label: "Combobox", path: "/combobox", description: "Sync options or async onSearch with debounced loading", source: "packages/solid/src/components/NewComboboxDemo.tsx" , updated: "12.8.1" },
      { label: "TreeSelect", path: "/tree-select", description: "Pick one node from a hierarchy (accounts, item groups): type to search, matches shown under their ancestors", source: "packages/solid/src/components/NewTreeSelectDemo.tsx", since: "12.2.0" },
      { label: "LookupField", path: "/lookup-field", description: "Pick a row from a table of choices (items, customers): column headers, search across the columns in any order, server results, the chosen row returned whole; F4 opens the full search", source: "packages/solid/src/components/NewLookupFieldDemo.tsx", since: "12.2.0" },
      { label: "MultiCombobox", path: "/multi-combobox", description: "Multi-select with chip trigger + overflow collapse", source: "packages/solid/src/components/NewMultiComboboxDemo.tsx", updated: "12.2.0" },
      { label: "VirtualizedItems", path: "/lazy-options", description: "Drop-in windowing for huge option lists", source: "packages/solid/src/components/NewLazyOptionsDemo.tsx" },
    ],
  },
  {
    group: "Media",
    items: [
      { label: "MediaTimeline", path: "/media-timeline", description: "Filmstrip trim track — draggable ranges over thumbnails, playhead, hover scrub, zoom; the app owns the state", source: "packages/solid/src/components/NewMediaTimelineDemo.tsx" },
      { label: "Waveform", path: "/waveform", description: "Audio peaks lane with a draggable, trimmable clip window; shares a zoom with MediaTimeline so lanes align", source: "packages/solid/src/components/NewWaveformDemo.tsx" },
    ],
  },
  {
    group: "Forms",
    items: [
      { label: "Form", path: "/form-new", description: "Form primitives with validation wiring", source: "packages/solid/src/components/NewFormDemo.tsx" },
      { label: "BoundFields", path: "/bound-fields", description: "Bound* field wrappers \u2014 form-wired, no boilerplate", source: "packages/solid/src/components/NewBoundFieldsDemo.tsx" },
    ],
  },
  {
    group: "Date & time",
    items: [
      { label: "DateInput", path: "/date-input", description: "Type a date the way clerks do (150326, t, +7) in the locale's order, with the calendar as a second way in; impossible dates are kept and flagged, never rolled over", source: "packages/solid/src/components/NewDateInputDemo.tsx", since: "12.2.0" },
      { label: "DatePicker", path: "/date-picker", description: "Calendar in a Popover; inline Calendar too", source: "packages/solid/src/components/NewDatePickerDemo.tsx" },
      { label: "DateRangePicker", path: "/date-range-picker", description: "Two-month side-by-side calendar; range anchoring", source: "packages/solid/src/components/NewDateRangePickerDemo.tsx" },
      { label: "DynamicDateRange", path: "/dynamic-date-range", description: "Semantic periods — \"Last 7 days\", \"This quarter\"; stores the question, not the answer", source: "packages/solid/src/components/NewDynamicDateRangeDemo.tsx" },
      { label: "TimePicker", path: "/time-picker", description: "Segmented HH:MM(:SS), 12h / 24h, auto-advance + arrow stepping", source: "packages/solid/src/components/NewTimePickerDemo.tsx" },
      { label: "DateTimePicker", path: "/date-time-picker", description: "Calendar + TimePicker in one Popover", source: "packages/solid/src/components/NewDateTimePickerDemo.tsx" },
    ],
  },
  {
    group: "Composite",
    items: [
      { label: "QRCode and Barcode", path: "/barcode", description: "Draw codes as SVG for screens and print: QR (the e-invoice's signed QR, gate passes; error correction L to H), Code 128, EAN-13 and Code 39, dark on light in every theme", source: "packages/solid/src/components/NewBarcodeDemo.tsx", since: "12.2.0" },
      { label: "QRScanner", path: "/qr-scanner", description: "Camera-based QR / barcode scanner with decoder escape hatch", source: "packages/solid/src/components/NewQRScannerDemo.tsx" },
      { label: "NotificationsInbox", path: "/notifications-inbox", description: "Bell + popover panel; day-grouped feed with unread badge", source: "packages/solid/src/components/NewNotificationsInboxDemo.tsx" },
    ],
  },
  {
    group: "Heavy / optional (lazy peer deps)",
    items: [
      { label: "Chart", path: "/chart", description: "Line / bar / area / pie / donut; dependency-free SVG in the Solid binding", source: "packages/solid/src/components/NewChartDemo.tsx" },
      { label: "AnalyticChart", path: "/analytic-chart", description: "Interactive business charts: bar, line, area, combo with two axes, pie, donut, waterfall, funnel, gauge, heatmap, scatter, treemap, and your own types; click to drill down or filter, a table view, PNG and CSV download", source: "packages/solid/src/components/NewAnalyticChartDemo.tsx", since: "12.4.0" },
      { label: "RichText", path: "/rich-text", description: "Lazy-loaded WYSIWYG editor; jodit is an optional peer dep", source: "packages/solid/src/components/NewRichTextDemo.tsx" },
      { label: "Map", path: "/map", description: "Lazy-loaded map with markers; leaflet is an optional peer dep", source: "packages/solid/src/components/NewMapDemo.tsx" },
      { label: "Camera", path: "/camera", description: "Camera capture via getUserMedia; no peer dep", source: "packages/solid/src/components/NewCameraDemo.tsx" },
    ],
  },
  {
    group: "Zen-shaped",
    items: [
      { label: "Icon", path: "/icon", description: "zen-ui icon set (48 glyphs); inherits text colour, decorative by default", source: "packages/solid/src/components/NewIconDemo.tsx" },
      { label: "Object atoms", path: "/object", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker", source: "packages/solid/src/components/NewObjectDemo.tsx" , updated: "12.2.0" },
      { label: "Button family", path: "/button-family", description: "ToggleButton, SegmentedButton, SplitButton", source: "packages/solid/src/components/NewButtonFamilyDemo.tsx" , updated: "12.2.0" },
      { label: "Document tabs", path: "/document-tabs", description: "A workspace's open documents as closable, pinnable tabs with an all-tabs menu", source: "packages/solid/src/components/NewDocumentTabsDemo.tsx" , since: "12.2.0" },
      { label: "Toolbar", path: "/toolbar", description: "Actions that collapse into an overflow menu when they do not fit", source: "packages/solid/src/components/NewToolbarDemo.tsx" },
      { label: "Tree", path: "/tree", description: "Hierarchical expandable list with full ARIA keyboard navigation", source: "packages/solid/src/components/NewTreeDemo.tsx" },
    ],
  },
  {
    group: "Zen table ecosystem",
    items: [
      { label: "SelectDialog", path: "/select-dialog", description: "Searchable list picker — single commits on click, multi commits on OK", source: "packages/solid/src/components/NewSelectDialogDemo.tsx" },
      { label: "ValueHelp", path: "/value-help", description: "F4 lookup dialog — the list picker plus a condition builder", source: "packages/solid/src/components/NewValueHelpDemo.tsx", updated: "12.2.0" },
      { label: "ViewSettingsDialog", path: "/view-settings", description: "Sort / group / filter settings; commits on OK", source: "packages/solid/src/components/NewViewSettingsDemo.tsx", updated: "12.2.0" },
      { label: "FilterBuilder", path: "/filter-builder", description: "Nested AND/OR conditions on any field as one serialisable object, for advanced list filters, report criteria and saved views; says in words what it filters", source: "packages/solid/src/components/NewFilterBuilderDemo.tsx", since: "12.2.0" },
      { label: "ViewManager", path: "/view-manager", description: "Saved views beside the page title: name, save, save as, set as default, manage and share a list screen's filters, sort and columns as one object; storage stays the app's", source: "packages/solid/src/components/NewViewManagerDemo.tsx", since: "12.2.0" },
      { label: "FilterBar", path: "/filter-bar", description: "List Report filter area — fields, Go, and Adapt filters", source: "packages/solid/src/components/NewFilterBarDemo.tsx" },
    ],
  },
  {
    group: "Zen app frame",
    items: [
      { label: "PageHeader", path: "/page-header", description: "A heading with a back affordance and one action — the light one", source: "packages/solid/src/components/NewPageHeaderDemo.tsx" },
      { label: "SkipToContent", path: "/skip-to-content", description: "Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)", source: "packages/solid/src/components/SkipToContentDemo.tsx" },
      { label: "ShellBar", path: "/shellbar", description: "Top-level app header — branding, search, actions, profile menu", source: "packages/solid/src/components/NewShellBarDemo.tsx" , updated: "12.2.0" },
      { label: "FlexibleColumnLayout", path: "/flexible-column-layout", description: "1–3 column master-detail frame with responsive collapse", source: "packages/solid/src/components/NewFlexibleColumnLayoutDemo.tsx" },
      { label: "DynamicPage", path: "/dynamic-page", description: "Title + header that snaps away on scroll; pinnable header", source: "packages/solid/src/components/NewDynamicPageDemo.tsx" },
      { label: "ObjectPageLayout", path: "/object-page", description: "Anchored sections with scroll-spy navigation", source: "packages/solid/src/components/NewObjectPageDemo.tsx" , updated: "12.3.1" },
    ],
  },
  {
    // Screens, not components. Everything here is assembled from what is
    // already in the sidebar above — the point is the composition, so a
    // "ListReport" component would defeat it. Note "Composite" above means
    // something else: components BUILT FROM other components.
    group: "Patterns",
    components: false,
    items: [
      { label: "List Report", path: "/list-report", description: "FilterBar + DataTable — filter a set, read the result, act on a row", source: "packages/solid/src/components/NewListReportDemo.tsx" },
    ],
  },
];
