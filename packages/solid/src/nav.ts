/**
 * Single source of truth for the demo's navigation AND its landing-page
 * catalogue. Both App.tsx (sidebar) and components/Welcome.tsx (cards) render
 * from this list so the two cannot drift apart.
 *
 * Adding a component: add it here, add its <Route> in main.tsx. Nothing else.
 */

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
};

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
      { label: "DirectionProvider", path: "/direction", description: "Right-to-left support \u2014 tells menus, tabs and sliders which way the page reads", source: "packages/solid/src/components/NewDirectionDemo.tsx" },
      { label: "MessagePopover", path: "/message-popover", description: "Aggregated form validation grouped by severity; click a message to land on the field", source: "packages/solid/src/components/NewMessagePopoverDemo.tsx" },
      { label: "Page + Bar", path: "/page", description: "The Page whole-screen container and the three-slot Bar row \u2014 the structural frame pieces", source: "packages/solid/src/components/NewPageDemo.tsx" },
      { label: "ColorPicker", path: "/color-picker", description: "Swatch palette + the platform picker; hex in, hex out", source: "packages/solid/src/components/NewColorPickerDemo.tsx" },
      { label: "Carousel", path: "/carousel", description: "Scroll-snap slide strip; every child is a slide, no autoplay", source: "packages/solid/src/components/NewCarouselDemo.tsx" },
      { label: "Card", path: "/card", description: "Surface primitive + SelectableCard for goal pickers / plan selectors", source: "packages/solid/src/components/NewCardDemo.tsx" },
      { label: "StatCard", path: "/stat-card", description: "A labelled figure — icon, delta, and somewhere to go", source: "packages/solid/src/components/NewStatCardDemo.tsx" },
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
      { label: "Stepper", path: "/stepper", description: "Multi-step wizard; horizontal / vertical, linear / non-linear", source: "packages/solid/src/components/NewStepperDemo.tsx" },
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
      { label: "Select", path: "/select", description: "Keyboard nav, option groups, form submission", source: "packages/solid/src/components/NewSelectDemo.tsx" },
    ],
  },
  {
    group: "Disclosure (Kobalte)",
    items: [
      { label: "Tabs", path: "/tabs", description: "Tabbed navigation; underline + pills variants", source: "packages/solid/src/components/NewTabsDemo.tsx" },
      { label: "Accordion", path: "/accordion", description: "Collapsible sections; single + multiple expand modes", source: "packages/solid/src/components/NewAccordionDemo.tsx" },
    ],
  },
  {
    group: "Overlays (Kobalte)",
    items: [
      { label: "Popover", path: "/popover", description: "Non-modal overlay anchored to a trigger", source: "packages/solid/src/components/NewPopoverDemo.tsx" },
      { label: "Dialog", path: "/dialog", description: "Modal surface, plus AlertDialog for destructive confirms", source: "packages/solid/src/components/NewDialogDemo.tsx" },
      { label: "Sheet", path: "/sheet", description: "Slide-in side panel; right / left / top / bottom", source: "packages/solid/src/components/NewSheetDemo.tsx" },
      { label: "DropdownMenu", path: "/dropdown-menu", description: "Action menus, sub-menus, checkbox / radio items", source: "packages/solid/src/components/NewDropdownMenuDemo.tsx" },
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
      { label: "Breadcrumb", path: "/breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees", source: "packages/solid/src/components/NewBreadcrumbDemo.tsx" },
      { label: "Pagination", path: "/pagination", description: "Page navigation with truncated ranges", source: "packages/solid/src/components/NewPaginationDemo.tsx" },
      { label: "Sidebar", path: "/sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu", source: "packages/solid/src/components/NewSidebarDemo.tsx" },
    ],
  },
  {
    group: "Form (custom)",
    items: [
      { label: "Input", path: "/input", description: "Styled input + textarea; all native attributes pass through", source: "packages/solid/src/components/NewInputDemo.tsx" },
      { label: "Search", path: "/search", description: "Search field — magnifier, clear button, sm / md / lg; the affordance zen-ui inlined seven times", source: "packages/solid/src/components/SearchDemo.tsx" },
      { label: "PasswordInput", path: "/password-input", description: "Password field with a show / hide toggle; every native input attribute passes through", source: "packages/solid/src/components/PasswordInputDemo.tsx" },
      { label: "NumberField", path: "/number-field", description: "Number input with \u2212/+ stepper, clamping, decimal step", source: "packages/solid/src/components/NewNumberFieldDemo.tsx" },
      { label: "TagInput", path: "/tag-input", description: "Type + Enter chip input; comma-paste splits, per-tag validator", source: "packages/solid/src/components/NewTagInputDemo.tsx" },
      { label: "PhoneInput", path: "/phone-input", description: "Composition: Select (country) + Input (number)", source: "packages/solid/src/components/NewPhoneInputDemo.tsx" },
      { label: "InputOTP", path: "/otp", description: "One input per digit, zero-dep; paste / autocomplete / a11y", source: "packages/solid/src/components/NewOTPDemo.tsx" },
      { label: "MaskInput", path: "/mask-input", description: "Fixed-template input — 99-9999, aa-99; the mask decides what may be typed", source: "packages/solid/src/components/NewMaskInputDemo.tsx" },
      { label: "FileUpload", path: "/file-upload", description: "Drag-and-drop or browse; accept / max-size validation, progress", source: "packages/solid/src/components/NewFileUploadDemo.tsx" },
    ],
  },
  {
    group: "Data",
    items: [
      { label: "DataTable", path: "/data-table", description: "TanStack Table + Virtual; sorting, filtering, grouping, windowing", source: "packages/solid/src/components/NewDataTableDemo.tsx" },
      { label: "TreeTable", path: "/tree-table", description: "Hierarchical rows; chevron indents inside the first column, filter keeps ancestors", source: "packages/solid/src/components/NewTreeTableDemo.tsx" },
      { label: "Micro charts", path: "/micro-chart", description: "Sparkline-sized trend marks for a table cell or card \u2014 line, bar, bullet, delta, radial", source: "packages/solid/src/components/NewMicroChartDemo.tsx" },
      { label: "Pivot", path: "/pivot", description: "Drag-and-drop pivot builder; fields into zones, 2D-windowed grid", source: "packages/solid/src/components/NewPivotDemo.tsx" },
      { label: "Combobox", path: "/combobox", description: "Sync options or async onSearch with debounced loading", source: "packages/solid/src/components/NewComboboxDemo.tsx" },
      { label: "MultiCombobox", path: "/multi-combobox", description: "Multi-select with chip trigger + overflow collapse", source: "packages/solid/src/components/NewMultiComboboxDemo.tsx" },
      { label: "VirtualizedItems", path: "/lazy-options", description: "Drop-in windowing for huge option lists", source: "packages/solid/src/components/NewLazyOptionsDemo.tsx" },
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
      { label: "QRScanner", path: "/qr-scanner", description: "Camera-based QR / barcode scanner with decoder escape hatch", source: "packages/solid/src/components/NewQRScannerDemo.tsx" },
      { label: "NotificationsInbox", path: "/notifications-inbox", description: "Bell + popover panel; day-grouped feed with unread badge", source: "packages/solid/src/components/NewNotificationsInboxDemo.tsx" },
    ],
  },
  {
    group: "Heavy / optional (lazy peer deps)",
    items: [
      { label: "Chart", path: "/chart", description: "Line / bar / area / pie / donut; dependency-free SVG in the Solid binding", source: "packages/solid/src/components/NewChartDemo.tsx" },
      { label: "RichText", path: "/rich-text", description: "Lazy-loaded WYSIWYG editor; jodit is an optional peer dep", source: "packages/solid/src/components/NewRichTextDemo.tsx" },
      { label: "Map", path: "/map", description: "Lazy-loaded map with markers; leaflet is an optional peer dep", source: "packages/solid/src/components/NewMapDemo.tsx" },
      { label: "Camera", path: "/camera", description: "Camera capture via getUserMedia; no peer dep", source: "packages/solid/src/components/NewCameraDemo.tsx" },
    ],
  },
  {
    group: "Zen-shaped",
    items: [
      { label: "Icon", path: "/icon", description: "zen-ui icon set (48 glyphs); inherits text colour, decorative by default", source: "packages/solid/src/components/NewIconDemo.tsx" },
      { label: "Object atoms", path: "/object", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker", source: "packages/solid/src/components/NewObjectDemo.tsx" },
      { label: "Button family", path: "/button-family", description: "ToggleButton, SegmentedButton, SplitButton", source: "packages/solid/src/components/NewButtonFamilyDemo.tsx" },
      { label: "Toolbar", path: "/toolbar", description: "Actions that collapse into an overflow menu when they do not fit", source: "packages/solid/src/components/NewToolbarDemo.tsx" },
      { label: "Tree", path: "/tree", description: "Hierarchical expandable list with full ARIA keyboard navigation", source: "packages/solid/src/components/NewTreeDemo.tsx" },
    ],
  },
  {
    group: "Zen table ecosystem",
    items: [
      { label: "SelectDialog", path: "/select-dialog", description: "Searchable list picker — single commits on click, multi commits on OK", source: "packages/solid/src/components/NewSelectDialogDemo.tsx" },
      { label: "ValueHelp", path: "/value-help", description: "F4 lookup dialog — the list picker plus a condition builder", source: "packages/solid/src/components/NewValueHelpDemo.tsx" },
      { label: "ViewSettingsDialog", path: "/view-settings", description: "Sort / group / filter settings; commits on OK", source: "packages/solid/src/components/NewViewSettingsDemo.tsx" },
      { label: "FilterBar", path: "/filter-bar", description: "List Report filter area — fields, Go, and Adapt filters", source: "packages/solid/src/components/NewFilterBarDemo.tsx" },
    ],
  },
  {
    group: "Zen app frame",
    items: [
      { label: "PageHeader", path: "/page-header", description: "A heading with a back affordance and one action — the light one", source: "packages/solid/src/components/NewPageHeaderDemo.tsx" },
      { label: "SkipToContent", path: "/skip-to-content", description: "Keyboard bypass — the first Tab reveals a link that jumps past the app chrome to the content (WCAG 2.4.1)", source: "packages/solid/src/components/SkipToContentDemo.tsx" },
      { label: "ShellBar", path: "/shellbar", description: "Top-level app header — branding, search, actions, profile menu", source: "packages/solid/src/components/NewShellBarDemo.tsx" },
      { label: "FlexibleColumnLayout", path: "/flexible-column-layout", description: "1–3 column master-detail frame with responsive collapse", source: "packages/solid/src/components/NewFlexibleColumnLayoutDemo.tsx" },
      { label: "DynamicPage", path: "/dynamic-page", description: "Title + header that snaps away on scroll; pinnable header", source: "packages/solid/src/components/NewDynamicPageDemo.tsx" },
      { label: "ObjectPageLayout", path: "/object-page", description: "Anchored sections with scroll-spy navigation", source: "packages/solid/src/components/NewObjectPageDemo.tsx" },
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
