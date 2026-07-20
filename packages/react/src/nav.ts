/**
 * Single source of truth for the demo's navigation AND its landing-page
 * catalogue. Both App.tsx (sidebar) and components/Welcome.tsx (cards) render
 * from this list, so a component can no longer appear in one and not the other
 * — which is exactly how the landing page ended up 16 entries out of date.
 *
 * Adding a component: add it here, add its <Route> in App.tsx. Nothing else.
 */

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
};

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
      { to: "/", label: "Welcome", source: "packages/react/src/components/Welcome.tsx" },
      { to: "/customizing", label: "Customizing", source: "packages/react/src/components/NewCustomizingDemo.tsx" },
    ],
  },
  {
    title: "Components",
    items: [
      { to: "/button-new", label: "Button", description: "forwardRef, asChild, CVA variants \u00d7 colors \u00d7 sizes \u00d7 shapes", source: "packages/react/src/components/NewButtonDemo.tsx" },
      { to: "/tooltip-new", label: "Tooltip", description: "Radix Tooltip \u2014 positioning, dismissal, a11y", source: "packages/react/src/components/NewTooltipDemo.tsx" },
      { to: "/popover", label: "Popover", description: "Anchored panel; asChild trigger, side/align, separate anchor", source: "packages/react/src/components/NewPopoverDemo.tsx" },
      { to: "/link", label: "Link", description: "Styled anchor; asChild for router links, external, disabled", source: "packages/react/src/components/NewLinkDemo.tsx" },
      { to: "/theme", label: "Theme", description: "Scopes a theme to a subtree \u2014 a dark panel inside a light page; nests, no JS", source: "packages/react/src/components/NewThemeDemo.tsx" },
      { to: "/direction", label: "DirectionProvider", description: "Right-to-left support \u2014 tells menus, tabs and sliders which way the page reads", source: "packages/react/src/components/NewDirectionDemo.tsx" },
      { to: "/message-popover", label: "MessagePopover", description: "Aggregated form validation grouped by severity; click a message to land on the field", source: "packages/react/src/components/NewMessagePopoverDemo.tsx" },
      { to: "/page", label: "Page + Bar", description: "The Page whole-screen container and the three-slot Bar row \u2014 the structural frame pieces", source: "packages/react/src/components/NewPageDemo.tsx" },
      { to: "/color-picker", label: "ColorPicker", description: "Swatch palette + the platform picker; hex in, hex out", source: "packages/react/src/components/NewColorPickerDemo.tsx" },
      { to: "/carousel", label: "Carousel", description: "Scroll-snap slide strip; every child is a slide, no autoplay", source: "packages/react/src/components/NewCarouselDemo.tsx" },
      { to: "/dropdown-menu", label: "DropdownMenu", description: "Radix DropdownMenu \u2014 action menus, sub-menus, checkbox/radio items", source: "packages/react/src/components/NewDropdownMenuDemo.tsx" },
      { to: "/separator", label: "Separator", description: "Radix Separator \u2014 horizontal / vertical with decorative semantics", source: "packages/react/src/components/NewSeparatorDemo.tsx" },
      { to: "/switch-new", label: "Switch", description: "Radix Switch \u2014 sizes, controlled / uncontrolled, form submission", source: "packages/react/src/components/NewSwitchDemo.tsx" },
      { to: "/checkbox-new", label: "Checkbox", description: "Radix Checkbox \u2014 native tri-state indeterminate, sizes", source: "packages/react/src/components/NewCheckboxDemo.tsx" },
      { to: "/radio-group", label: "RadioGroup", description: "Radix RadioGroup \u2014 roving tabindex, arrow nav, form submission", source: "packages/react/src/components/NewRadioGroupDemo.tsx" },
      { to: "/progress-new", label: "Progress", description: "Radix Progress \u2014 sizes \u00d7 colors, accessible value", source: "packages/react/src/components/NewProgressDemo.tsx" },
      { to: "/avatar-new", label: "Avatar", description: "Radix Avatar \u2014 image + initials fallback + stacked group", source: "packages/react/src/components/NewAvatarDemo.tsx" },
      { to: "/badge-new", label: "Badge", description: "Styled span with variants \u00d7 colors, asChild for clickable", source: "packages/react/src/components/NewBadgeDemo.tsx" },
      { to: "/skeleton-new", label: "Skeleton", description: "Animated muted-box placeholder", source: "packages/react/src/components/NewSkeletonDemo.tsx" },
      { to: "/loading-new", label: "Loading", description: "Animated spinner with sr-only label, color=current for buttons", source: "packages/react/src/components/NewLoadingDemo.tsx" },
      { to: "/select-new", label: "Select", description: "Radix Select \u2014 keyboard nav, groups, form submission", source: "packages/react/src/components/NewSelectDemo.tsx" },
      { to: "/slider-new", label: "Slider", description: "Radix Slider \u2014 single + range, vertical, keyboard control", source: "packages/react/src/components/NewSliderDemo.tsx" },
      { to: "/scroll-area-new", label: "ScrollArea", description: "Radix ScrollArea \u2014 custom scrollbars, both axes", source: "packages/react/src/components/NewScrollAreaDemo.tsx" },
      { to: "/input-new", label: "Input + Textarea", description: "Plain styled <input> / <textarea>, all native attrs", source: "packages/react/src/components/NewInputDemo.tsx" },
      { to: "/search", label: "Search", description: "Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times", source: "packages/react/src/components/SearchDemo.tsx" },
      { to: "/password-input", label: "PasswordInput", description: "Password field with a show / hide toggle; every native input attribute passes through", source: "packages/react/src/components/PasswordInputDemo.tsx" },
      { to: "/number-field-new", label: "NumberField", description: "Number input with \u2212/+ stepper, clamp, decimal step", source: "packages/react/src/components/NewNumberFieldDemo.tsx" },
      { to: "/date-picker-new", label: "DatePicker", description: "react-day-picker in a Radix Popover; inline Calendar too", source: "packages/react/src/components/NewDatePickerDemo.tsx" },
      { to: "/otp-new", label: "InputOTP", description: "one input per digit, zero-dep; paste / autocomplete / a11y", source: "packages/react/src/components/NewOTPDemo.tsx" },
      { to: "/mask-input", label: "MaskInput", description: "Fixed-template input — 99-9999, aa-99; the mask decides what may be typed", source: "packages/react/src/components/NewMaskInputDemo.tsx" },
      { to: "/phone-input-new", label: "PhoneInput", description: "Composition: Select (country) + Input (number)", source: "packages/react/src/components/NewPhoneInputDemo.tsx" },
      { to: "/fab-new", label: "FAB", description: "Fixed-position Button wrapper + DropdownMenu for speed-dial", source: "packages/react/src/components/NewFABDemo.tsx" },
      { to: "/form-new", label: "Form (RHF + Zod)", description: "react-hook-form + Zod resolver; FormField / FormItem / FormLabel / FormMessage", source: "packages/react/src/components/NewFormDemo.tsx" },
      { to: "/data-table", label: "DataTable", description: "TanStack Table + Virtual; sorting, filtering, grouping, pinning, resizing, windowing", source: "packages/react/src/components/NewDataTableDemo.tsx" },
      { to: "/tree-table", label: "TreeTable", description: "Hierarchical rows; chevron indents inside the first column, filter keeps ancestors", source: "packages/react/src/components/NewTreeTableDemo.tsx" },
      { to: "/micro-chart", label: "Micro charts", description: "Sparkline-sized trend marks for a table cell or card \u2014 line, bar, bullet, delta, radial", source: "packages/react/src/components/NewMicroChartDemo.tsx" },
      { to: "/timeline", label: "Timeline", description: "Ordered list of events with a rail, markers, timestamps and date groups", source: "packages/react/src/components/NewTimelineDemo.tsx" },
      { to: "/upload-collection", label: "UploadCollection", description: "The list of uploaded files \u2014 progress, rename, delete, retry; the result FileUpload has no view for", source: "packages/react/src/components/NewUploadCollectionDemo.tsx" },
      { to: "/pivot", label: "Pivot", description: "Drag-and-drop pivot builder; fields into zones, 2D-windowed grid", source: "packages/react/src/components/NewPivotDemo.tsx" },
      { to: "/lazy-options", label: "Lazy options", description: "VirtualizedItems \u2014 drop-in windowing for huge option lists inside Combobox / Select", source: "packages/react/src/components/NewLazyOptionsDemo.tsx" },
      { to: "/combobox", label: "Combobox + Async", description: "cmdk-backed; sync `options` or async `onSearch` with debounced loading", source: "packages/react/src/components/NewComboboxDemo.tsx" },
      { to: "/alert", label: "Alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions API", source: "packages/react/src/components/NewAlertDemo.tsx" },
      { to: "/dialog", label: "Dialog + AlertDialog", description: "Radix Dialog modal surface, plus AlertDialog for destructive confirmations", source: "packages/react/src/components/NewDialogDemo.tsx" },
      { to: "/toast", label: "Toast", description: "Radix Toast \u2014 imperative toast() plus a Toaster viewport; variants and actions", source: "packages/react/src/components/NewToastDemo.tsx" },
      { to: "/file-upload", label: "FileUpload", description: "Drag-and-drop or browse; accept / max-size validation with per-file progress", source: "packages/react/src/components/NewFileUploadDemo.tsx" },
      { to: "/form-bound", label: "Bound* fields", description: "BoundInput / BoundSelect / BoundSwitch \u2014 form-wired field wrappers, no boilerplate", source: "packages/react/src/components/NewBoundFieldsDemo.tsx" },
      { to: "/stepper", label: "Stepper", description: "Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)", source: "packages/react/src/components/NewStepperDemo.tsx" },
      { to: "/banner", label: "Banner", description: "Page-top persistent callout \u2014 verification reminders, maintenance windows, impersonation", source: "packages/react/src/components/NewBannerDemo.tsx" },
      { to: "/empty-state", label: "EmptyState", description: "First-run / no-data / no-results surface; icon + title + description + actions", source: "packages/react/src/components/NewEmptyStateDemo.tsx" },
      { to: "/tabs", label: "Tabs", description: "Radix-backed tabbed navigation; underline + pills variants, horizontal / vertical", source: "packages/react/src/components/NewTabsDemo.tsx" },
      { to: "/accordion", label: "Accordion", description: "Radix-backed collapsible sections; single + multiple expand modes", source: "packages/react/src/components/NewAccordionDemo.tsx" },
      { to: "/card", label: "Card", description: "Surface primitive + SelectableCard variant for goal pickers / plan selectors", source: "packages/react/src/components/NewCardDemo.tsx" },
      { to: "/stat-card", label: "StatCard", description: "A labelled figure — icon, delta, and somewhere to go", source: "packages/react/src/components/NewStatCardDemo.tsx" },
      { to: "/sheet", label: "Sheet / Drawer", description: "Slide-in side panel on Radix Dialog; right / left / top / bottom", source: "packages/react/src/components/NewSheetDemo.tsx" },
      { to: "/date-range-picker", label: "DateRangePicker", description: "Two-month side-by-side calendar in a Popover; range anchoring, controlled / uncontrolled", source: "packages/react/src/components/NewDateRangePickerDemo.tsx" },
      { to: "/dynamic-date-range", label: "DynamicDateRange", description: "Semantic periods — \"Last 7 days\", \"This quarter\"; stores the question, not the answer", source: "packages/react/src/components/NewDynamicDateRangeDemo.tsx" },
      { to: "/tag-input", label: "TagInput", description: "Type + Enter chip input; comma-paste splits, Backspace removes, per-tag validator, max-N", source: "packages/react/src/components/NewTagInputDemo.tsx" },
      { to: "/multi-combobox", label: "MultiCombobox", description: "Multi-select Combobox with chip trigger + overflow collapse + sync / async option loading", source: "packages/react/src/components/NewMultiComboboxDemo.tsx" },
      { to: "/rating", label: "Rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg, customizable max", source: "packages/react/src/components/NewRatingDemo.tsx" },
      { to: "/nps", label: "NPS", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter color buckets", source: "packages/react/src/components/NewNpsDemo.tsx" },
      { to: "/likert", label: "Likert", description: "n-point attitudinal scale; segmented + stacked layouts, custom option sets", source: "packages/react/src/components/NewLikertDemo.tsx" },
      { to: "/time-picker", label: "TimePicker", description: "Segmented HH:MM(:SS) input, 12h / 24h, AM/PM, auto-advance + arrow stepping", source: "packages/react/src/components/NewTimePickerDemo.tsx" },
      { to: "/date-time-picker", label: "DateTimePicker", description: "Calendar + TimePicker in one Popover; preserves time-of-day on day changes", source: "packages/react/src/components/NewDateTimePickerDemo.tsx" },
      { to: "/qr-scanner", label: "QRScanner", description: "Camera-based QR / barcode scanner; native BarcodeDetector + custom-decoder escape hatch", source: "packages/react/src/components/NewQRScannerDemo.tsx" },
      { to: "/notifications-inbox", label: "NotificationsInbox", description: "Bell icon + popover panel; day-grouped feed with unread badge + per-row actions", source: "packages/react/src/components/NewNotificationsInboxDemo.tsx" },
      { to: "/breadcrumb", label: "Breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees", source: "packages/react/src/components/NewBreadcrumbDemo.tsx" },
      { to: "/pagination", label: "Pagination", description: "Page navigation with truncated ranges; usePaginationRange hook", source: "packages/react/src/components/NewPaginationDemo.tsx" },
      { to: "/sidebar", label: "Sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu", source: "packages/react/src/components/NewSidebarDemo.tsx" },
    ],
  },
  {
    title: "Heavy / optional (lazy peer deps)",
    items: [
      { to: "/chart", label: "Chart (recharts)", description: "Lazy-loaded line / bar / area / pie / donut; recharts is an optional peer dep", source: "packages/react/src/components/NewChartDemo.tsx" },
      { to: "/rich-text", label: "RichText (jodit)", description: "Lazy-loaded WYSIWYG editor; jodit-pro-react is an optional peer dep", source: "packages/react/src/components/NewRichTextDemo.tsx" },
      { to: "/map", label: "Map (leaflet)", description: "Lazy-loaded map with markers; leaflet + react-leaflet are optional peer deps", source: "packages/react/src/components/NewMapDemo.tsx" },
      { to: "/camera", label: "Camera (webcam)", description: "Lazy-loaded camera capture; react-webcam is an optional peer dep", source: "packages/react/src/components/NewCameraDemo.tsx" },
    ],
  },
  {
    title: "Zen-shaped",
    items: [
      { to: "/icon", label: "Icon", description: "zen-ui icon set (48 glyphs); inherits text colour, decorative by default", source: "packages/react/src/components/NewIconDemo.tsx" },
      { to: "/object", label: "Object atoms", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker", source: "packages/react/src/components/NewObjectDemo.tsx" },
      { to: "/button-family", label: "Button family", description: "ToggleButton, SegmentedButton, SplitButton", source: "packages/react/src/components/NewButtonFamilyDemo.tsx" },
      { to: "/toolbar", label: "Toolbar", description: "Actions that collapse into an overflow menu when they do not fit", source: "packages/react/src/components/NewToolbarDemo.tsx" },
      { to: "/tree", label: "Tree", description: "Hierarchical expandable list with full ARIA keyboard navigation", source: "packages/react/src/components/NewTreeDemo.tsx" },
    ],
  },
  {
    title: "Zen table ecosystem",
    items: [
      { to: "/select-dialog", label: "SelectDialog", description: "Searchable list picker — single commits on click, multi commits on OK", source: "packages/react/src/components/NewSelectDialogDemo.tsx" },
      { to: "/value-help", label: "ValueHelp", description: "F4 lookup dialog — the list picker plus a condition builder", source: "packages/react/src/components/NewValueHelpDemo.tsx" },
      { to: "/view-settings", label: "ViewSettingsDialog", description: "Sort / group / filter settings; commits on OK", source: "packages/react/src/components/NewViewSettingsDemo.tsx" },
      { to: "/filter-bar", label: "FilterBar", description: "List Report filter area — fields, Go, and Adapt filters", source: "packages/react/src/components/NewFilterBarDemo.tsx" },
    ],
  },
  {
    title: "Zen app frame",
    items: [
      { to: "/page-header", label: "PageHeader", description: "A heading with a back affordance and one action — the light one", source: "packages/react/src/components/NewPageHeaderDemo.tsx" },
      { to: "/skip-to-content", label: "SkipToContent", description: "Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)", source: "packages/react/src/components/SkipToContentDemo.tsx" },
      { to: "/shellbar", label: "ShellBar", description: "Top-level app header — branding, search, actions, profile menu", source: "packages/react/src/components/NewShellBarDemo.tsx" },
      { to: "/flexible-column-layout", label: "FlexibleColumnLayout", description: "1–3 column master-detail frame with responsive collapse", source: "packages/react/src/components/NewFlexibleColumnLayoutDemo.tsx" },
      { to: "/dynamic-page", label: "DynamicPage", description: "Title + header that snaps away on scroll; pinnable header", source: "packages/react/src/components/NewDynamicPageDemo.tsx" },
      { to: "/object-page", label: "ObjectPageLayout", description: "Anchored sections with scroll-spy navigation", source: "packages/react/src/components/NewObjectPageDemo.tsx" },
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
      { to: "/list-report", label: "List Report", description: "FilterBar + DataTable — filter a set, read the result, act on a row", source: "packages/react/src/components/NewListReportDemo.tsx" },
    ],
  },
];
