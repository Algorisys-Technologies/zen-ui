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

export type NavItem = {
  to: string;
  label: string;
  /** Shown on the landing page. Omitted for non-component routes. */
  description?: string;
  /** Repo-relative path to the demo file behind this route. */
  source?: string;
};

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
      { to: "/", label: "Welcome", description: "", source: "packages/web-components/src/components/Welcome.ts" },
    ],
  },
  {
    title: "Components",
    items: [
      { to: "/button", label: "Button", description: "Variant × color × size × shape, polymorphic via `as`, loading state", source: "packages/web-components/src/components/ButtonDemo.ts" },
      { to: "/badge", label: "Badge", description: "Styled span; the whole component is variants, cn() and the prefix", source: "packages/web-components/src/components/BadgeDemo.ts" },
      { to: "/accordion", label: "Accordion", description: "Collapsible sections; single + multiple, keyboard nav, real height animation", source: "packages/web-components/src/components/AccordionDemo.ts" },
      { to: "/tabs", label: "Tabs", description: "Roving focus, underline + pills, controlled and uncontrolled", source: "packages/web-components/src/components/TabsDemo.ts" },
      { to: "/input", label: "Input + MaskInput", description: "MaskInput drives core's mask engine — the same applyMask() React and Solid call", source: "packages/web-components/src/components/InputDemo.ts" },
      { to: "/search", label: "Search", description: "Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times", source: "packages/web-components/src/components/SearchDemo.ts" },
      { to: "/password-input", label: "PasswordInput", description: "Password field with a show / hide toggle; every native input prop passes through", source: "packages/web-components/src/components/PasswordInputDemo.ts" },
      { to: "/select", label: "Select", description: "Listbox on a trigger; the known React/Solid divergence, decided here", source: "packages/web-components/src/components/SelectDemo.ts" },
      { to: "/combobox", label: "Combobox + Async", description: "Searchable single-select; sync `options` or async `onSearch` with debounce + abort, plus a creatable row", source: "packages/web-components/src/components/ComboboxDemo.ts" },
      { to: "/dialog", label: "Dialog", description: "Portal, focus trap, scroll lock, Escape and click-outside — all hand-written", source: "packages/web-components/src/components/DialogDemo.ts" },
      { to: "/separator", label: "Separator", description: "Radix Separator — horizontal / vertical with decorative semantics", source: "packages/web-components/src/components/SeparatorDemo.ts" },
      { to: "/progress", label: "Progress", description: "Determinate progress indicator — sizes × colors, accessible value", source: "packages/web-components/src/components/ProgressDemo.ts" },
      { to: "/loading", label: "Loading", description: "Animated spinner with sr-only label, color=current for buttons", source: "packages/web-components/src/components/LoadingDemo.ts" },
      { to: "/skeleton", label: "Skeleton", description: "Animated muted-box placeholder", source: "packages/web-components/src/components/SkeletonDemo.ts" },
      { to: "/avatar", label: "Avatar", description: "Radix Avatar — image + initials fallback + stacked group", source: "packages/web-components/src/components/AvatarDemo.ts" },
      { to: "/link", label: "Link", description: "Styled anchor; real &lt;a&gt; always, external, inline, disabled", source: "packages/web-components/src/components/LinkDemo.ts" },
      { to: "/stack", label: "Stack", description: "Minimal flexbox layout primitive — a thin div laying children out in a row or column with configurable alignment, wrapping, gap and padding.", source: "packages/web-components/src/components/StackDemo.ts" },
      { to: "/stat-card", label: "StatCard", description: "A labelled figure — icon, delta, and somewhere to go", source: "packages/web-components/src/components/StatCardDemo.ts" },
      { to: "/card", label: "Card", description: "Generic surface primitive with a compound Header / Content / Footer API and three variants (elevated · outlined · ghost)", source: "packages/web-components/src/components/CardDemo.ts" },
      { to: "/empty-state", label: "EmptyState", description: "First-run / no-data / no-results surface; icon + title + description + actions", source: "packages/web-components/src/components/EmptyStateDemo.ts" },
      { to: "/alert", label: "Alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions API", source: "packages/web-components/src/components/AlertDemo.ts" },
      { to: "/fab", label: "FAB", description: "Fixed-position Button wrapper for a floating action button, with speed-dial composition", source: "packages/web-components/src/components/FABDemo.ts" },
      { to: "/banner", label: "Banner", description: "Page-top persistent callout — verification reminders, maintenance windows, impersonation", source: "packages/web-components/src/components/BannerDemo.ts" },
      { to: "/breadcrumb", label: "Breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees", source: "packages/web-components/src/components/BreadcrumbDemo.ts" },
      { to: "/page", label: "Page + Bar", description: "The Page whole-screen container and the three-slot Bar row — the structural frame pieces", source: "packages/web-components/src/components/PageDemo.ts" },
      { to: "/switch", label: "Switch", description: "Boolean toggle — sizes, controlled / uncontrolled, hidden-checkbox form submission", source: "packages/web-components/src/components/SwitchDemo.ts" },
      { to: "/number-field", label: "NumberField", description: "Number input with −/+ stepper, clamp, decimal step", source: "packages/web-components/src/components/NumberFieldDemo.ts" },
      { to: "/textarea", label: "Textarea", description: "Plain styled <textarea> primitive, all native attrs", source: "packages/web-components/src/components/TextareaDemo.ts" },
      { to: "/slider", label: "Slider", description: "Single-thumb or multi-thumb range slider — pointer drag, keyboard control, ARIA, marks, vertical orientation", source: "packages/web-components/src/components/SliderDemo.ts" },
      { to: "/checkbox", label: "Checkbox", description: "Tri-state checkbox (true / false / indeterminate) with a single prop, sizes, and native form submission", source: "packages/web-components/src/components/CheckboxDemo.ts" },
      { to: "/phone-input", label: "PhoneInput", description: "Composition: Select (country) + Input (number)", source: "packages/web-components/src/components/PhoneInputDemo.ts" },
      { to: "/time-picker", label: "TimePicker", description: "Segmented HH:MM(:SS) input, 12h / 24h, AM/PM, auto-advance + arrow stepping", source: "packages/web-components/src/components/TimePickerDemo.ts" },
      { to: "/radio-group", label: "RadioGroup", description: "Roving tabindex, arrow-key nav, form submission", source: "packages/web-components/src/components/RadioGroupDemo.ts" },
      { to: "/tag-input", label: "TagInput", description: "Type + Enter chip input; comma-paste splits, Backspace removes, per-tag validator, max-N", source: "packages/web-components/src/components/TagInputDemo.ts" },
      { to: "/pagination", label: "Pagination", description: "Page navigation with truncated ranges; paginationRange() helper", source: "packages/web-components/src/components/PaginationDemo.ts" },
      { to: "/sheet", label: "Sheet / Drawer", description: "Slide-in side panel on hand-written portal/focus-trap/scroll-lock; right / left / top / bottom", source: "packages/web-components/src/components/SheetDemo.ts" },
      { to: "/otp", label: "InputOTP", description: "one input per digit, zero-dep; paste / autocomplete / a11y", source: "packages/web-components/src/components/InputOTPDemo.ts" },
      { to: "/popover", label: "Popover", description: "Anchored panel; trigger + separate anchor, side/align with collision flip", source: "packages/web-components/src/components/PopoverDemo.ts" },
      { to: "/tooltip", label: "Tooltip", description: "Hover/focus bubble on a trigger; hand-written portal, collision positioning, delay, and dismissal", source: "packages/web-components/src/components/TooltipDemo.ts" },
      { to: "/nps", label: "NPS", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter color buckets", source: "packages/web-components/src/components/NpsDemo.ts" },
      { to: "/likert", label: "Likert", description: "n-point attitudinal scale; segmented, stacked and scale layouts, custom option sets", source: "packages/web-components/src/components/LikertDemo.ts" },
      { to: "/rating", label: "Rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg, customizable max", source: "packages/web-components/src/components/RatingDemo.ts" },
      { to: "/scroll-area", label: "ScrollArea", description: "Custom scrollbars over native scrolling, both axes — hand-written, no primitive library", source: "packages/web-components/src/components/ScrollAreaDemo.ts" },
      { to: "/stepper", label: "Stepper", description: "Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)", source: "packages/web-components/src/components/StepperDemo.ts" },
      { to: "/carousel", label: "Carousel", description: "Scroll-snap slide strip; every child is a slide, no autoplay", source: "packages/web-components/src/components/CarouselDemo.ts" },
      { to: "/dropdown-menu", label: "DropdownMenu", description: "Action menus, sub-menus, checkbox/radio items — positioning, keyboard nav and dismissal all hand-written", source: "packages/web-components/src/components/DropdownMenuDemo.ts" },
      { to: "/file-upload", label: "FileUpload", description: "Drag-and-drop or browse; accept / max-size / max-files validation with an inline removable file list", source: "packages/web-components/src/components/FileUploadDemo.ts" },
      { to: "/color-picker", label: "ColorPicker", description: "Swatch palette + the platform picker; hex in, hex out", source: "packages/web-components/src/components/ColorPickerDemo.ts" },
      { to: "/multi-combobox", label: "MultiCombobox", description: "Multi-select Combobox with chip trigger + overflow collapse + sync / async option loading", source: "packages/web-components/src/components/MultiComboboxDemo.ts" },
      { to: "/sidebar", label: "Sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu", source: "packages/web-components/src/components/SidebarDemo.ts" },
      { to: "/date-picker", label: "DatePicker", description: "Trigger-anchored date picker plus a from-scratch inline Calendar (single/multiple/range)", source: "packages/web-components/src/components/DatePickerDemo.ts" },
      { to: "/notifications-inbox", label: "NotificationsInbox", description: "Bell icon + popover panel; day-grouped feed with unread badge + per-row actions", source: "packages/web-components/src/components/NotificationsInboxDemo.ts" },
      { to: "/virtualized-items", label: "Virtualized items", description: "A windowed scrolling viewport that mounts only the visible rows of a huge list — dense array or server-paged sparse mode", source: "packages/web-components/src/components/VirtualizedItemsDemo.ts" },
      { to: "/date-time-picker", label: "DateTimePicker", description: "Calendar + TimePicker in one Popover; preserves time-of-day on day changes", source: "packages/web-components/src/components/DateTimePickerDemo.ts" },
      { to: "/date-range-picker", label: "DateRangePicker", description: "Two-month side-by-side calendar in a Popover; range anchoring, controlled / uncontrolled", source: "packages/web-components/src/components/DateRangePickerDemo.ts" },
      { to: "/toast", label: "Toast", description: "Radix-parity toasts — imperative toast() plus a Toaster() viewport; variants, actions, plus hand-written timer, hover-pause, swipe-to-dismiss and ARIA live region", source: "packages/web-components/src/components/ToastDemo.ts" },
      { to: "/qr-scanner", label: "QRScanner", description: "Camera-based QR / barcode scanner; native BarcodeDetector + custom-decoder escape hatch", source: "packages/web-components/src/components/QRScannerDemo.ts" },
      { to: "/data-table", label: "DataTable", description: "A headless data grid — columns, sorting, pagination, row selection, and row virtualization — hand-written with no table library", source: "packages/web-components/src/components/DataTableDemo.ts" },
      { to: "/form", label: "Form (RHF + Zod)", description: "createForm() controller + any zod-shaped schema; FormField wires a11y/errors (React's FormControl Slot, without a Slot), plus Bound* field wrappers", source: "packages/web-components/src/components/FormDemo.ts" },
      { to: "/pivot", label: "Pivot", description: "Drag-and-drop pivot builder; fields into zones, 2D-windowed grid", source: "packages/web-components/src/components/PivotDemo.ts" },
    ],
  },
  {
    title: "Heavy / optional (lazy peer deps)",
    items: [
      { to: "/rich-text", label: "RichText (jodit)", description: "Lazy-loaded WYSIWYG editor; jodit is an optional peer dep", source: "packages/web-components/src/components/RichTextDemo.ts" },
      { to: "/camera", label: "Camera (webcam)", description: "Webcam capture via getUserMedia; onCapture returns a data-URL screenshot painted from an offscreen canvas", source: "packages/web-components/src/components/CameraDemo.ts" },
      { to: "/map", label: "Map (leaflet)", description: "Lazy-loaded map with markers; leaflet is an optional peer dep", source: "packages/web-components/src/components/MapDemo.ts" },
      { to: "/chart", label: "Chart", description: "Line / bar / area / pie / donut; dependency-free SVG in the vanilla binding", source: "packages/web-components/src/components/ChartDemo.ts" },
    ],
  },
  {
    title: "Zen-shaped",
    items: [
      { to: "/icon", label: "Icon", description: "The shared zen-ui icon set, rendered straight from core's geometry", source: "packages/web-components/src/components/IconDemo.ts" },
      { to: "/object", label: "Object atoms", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker", source: "packages/web-components/src/components/ObjectDemo.ts" },
      { to: "/button-family", label: "Button family", description: "ToggleButton, SegmentedButton, SplitButton", source: "packages/web-components/src/components/ButtonFamilyDemo.ts" },
      { to: "/tree", label: "Tree", description: "Hierarchical expandable list with full ARIA keyboard navigation", source: "packages/web-components/src/components/TreeDemo.ts" },
      { to: "/toolbar", label: "Toolbar", description: "Actions that collapse into an overflow menu when they do not fit", source: "packages/web-components/src/components/ToolbarDemo.ts" },
    ],
  },
  {
    title: "Zen table ecosystem",
    items: [
      { to: "/filter-bar", label: "FilterBar", description: "List Report filter area — fields, Go, and Adapt filters", source: "packages/web-components/src/components/FilterBarDemo.ts" },
      { to: "/select-dialog", label: "SelectDialog", description: "Searchable list picker — single commits on click, multi commits on OK", source: "packages/web-components/src/components/SelectDialogDemo.ts" },
      { to: "/value-help", label: "ValueHelp", description: "F4 lookup dialog — the list picker plus a condition builder", source: "packages/web-components/src/components/ValueHelpDemo.ts" },
      { to: "/view-settings", label: "ViewSettingsDialog", description: "Sort / group / filter settings; commits on OK", source: "packages/web-components/src/components/ViewSettingsDemo.ts" },
    ],
  },
  {
    title: "Zen app frame",
    items: [
      { to: "/page-header", label: "PageHeader", description: "A heading with a back affordance and one action — the light one", source: "packages/web-components/src/components/PageHeaderDemo.ts" },
      { to: "/skip-to-content", label: "SkipToContent", description: "Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)", source: "packages/web-components/src/components/SkipToContentDemo.ts" },
      { to: "/shellbar", label: "ShellBar", description: "Top-level app header — branding, search, actions, profile menu", source: "packages/web-components/src/components/ShellBarDemo.ts" },
      { to: "/flexible-column-layout", label: "FlexibleColumnLayout", description: "1–3 column master-detail frame with responsive collapse", source: "packages/web-components/src/components/FlexibleColumnLayoutDemo.ts" },
      { to: "/dynamic-page", label: "DynamicPage", description: "Title + header that snaps away on scroll; pinnable header", source: "packages/web-components/src/components/DynamicPageDemo.ts" },
      { to: "/object-page", label: "ObjectPageLayout", description: "Anchored sections with scroll-spy navigation", source: "packages/web-components/src/components/ObjectPageLayoutDemo.ts" },
    ],
  },
];
