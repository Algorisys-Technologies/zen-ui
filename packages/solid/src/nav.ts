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
};

export type NavGroup = {
  group: string;
  items: NavItem[];
  /** Groups flagged `catalogue: false` are sidebar-only (e.g. Getting started). */
  catalogue?: boolean;
};

export const NAV: NavGroup[] = [
  {
    // The landing page was reachable only by typing "/" — the sidebar had no
    // link to it, unlike the React demo. Mirrors React's "Getting started".
    group: "Getting started",
    catalogue: false,
    items: [{ label: "Welcome", path: "/" }],
  },
  {
    group: "Primitives",
    items: [
      { label: "Button", path: "/button", description: "Variants \u00d7 colours \u00d7 sizes \u00d7 shapes via CVA; polymorphic `as` prop" },
      { label: "Badge", path: "/badge", description: "Styled span with variants \u00d7 colours; `as` for clickable badges" },
      { label: "Card", path: "/card", description: "Surface primitive + SelectableCard for goal pickers / plan selectors" },
      { label: "Skeleton", path: "/skeleton", description: "Animated muted-box placeholder; size it with utility classes" },
      { label: "Loading", path: "/loading", description: "Animated spinner with sr-only label; colour=current inside buttons" },
      { label: "FAB", path: "/fab", description: "Fixed-position floating action button + speed-dial menu" },
      { label: "Separator", path: "/separator", description: "Horizontal / vertical rule with decorative semantics" },
    ],
  },
  {
    group: "Surfaces",
    items: [
      { label: "Alert", path: "/alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions" },
      { label: "Banner", path: "/banner", description: "Page-top persistent callout \u2014 maintenance windows, impersonation" },
      { label: "EmptyState", path: "/empty-state", description: "First-run / no-data / no-results surface; icon + title + actions" },
    ],
  },
  {
    group: "Flows",
    items: [
      { label: "Stepper", path: "/stepper", description: "Multi-step wizard; horizontal / vertical, linear / non-linear" },
    ],
  },
  {
    group: "Survey",
    items: [
      { label: "Rating", path: "/rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg" },
      { label: "NPS", path: "/nps", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter buckets" },
      { label: "Likert", path: "/likert", description: "n-point attitudinal scale; segmented + stacked layouts" },
    ],
  },
  {
    group: "Display (Kobalte)",
    items: [
      { label: "Avatar", path: "/avatar", description: "Image + initials fallback + stacked group, with status dot" },
      { label: "Progress", path: "/progress", description: "Determinate bar; sizes \u00d7 colours, accessible value" },
      { label: "Tooltip", path: "/tooltip", description: "Positioning, dismissal and a11y on Kobalte" },
    ],
  },
  {
    group: "Form (Kobalte)",
    items: [
      { label: "Switch", path: "/switch", description: "Toggle for immediate settings; sizes, controlled / uncontrolled" },
      { label: "Checkbox", path: "/checkbox", description: "Binary + indeterminate tri-state; sizes, form submission" },
      { label: "RadioGroup", path: "/radio-group", description: "Roving tabindex, arrow-key nav, form submission" },
      { label: "Slider", path: "/slider", description: "Single + range, vertical, full keyboard control" },
      { label: "Select", path: "/select", description: "Keyboard nav, option groups, form submission" },
    ],
  },
  {
    group: "Disclosure (Kobalte)",
    items: [
      { label: "Tabs", path: "/tabs", description: "Tabbed navigation; underline + pills variants" },
      { label: "Accordion", path: "/accordion", description: "Collapsible sections; single + multiple expand modes" },
    ],
  },
  {
    group: "Overlays (Kobalte)",
    items: [
      { label: "Popover", path: "/popover", description: "Non-modal overlay anchored to a trigger" },
      { label: "Dialog", path: "/dialog", description: "Modal surface, plus AlertDialog for destructive confirms" },
      { label: "Sheet", path: "/sheet", description: "Slide-in side panel; right / left / top / bottom" },
      { label: "DropdownMenu", path: "/dropdown-menu", description: "Action menus, sub-menus, checkbox / radio items" },
      { label: "Toast", path: "/toast", description: "Imperative toast() + Toaster viewport; variants and actions" },
    ],
  },
  {
    group: "Layout",
    items: [
      { label: "ScrollArea", path: "/scroll-area", description: "Custom scrollbars on both axes" },
    ],
  },
  {
    group: "Form (custom)",
    items: [
      { label: "Input", path: "/input", description: "Styled input + textarea; all native attributes pass through" },
      { label: "NumberField", path: "/number-field", description: "Number input with \u2212/+ stepper, clamping, decimal step" },
      { label: "TagInput", path: "/tag-input", description: "Type + Enter chip input; comma-paste splits, per-tag validator" },
      { label: "PhoneInput", path: "/phone-input", description: "Composition: Select (country) + Input (number)" },
      { label: "InputOTP", path: "/otp", description: "One input per digit, zero-dep; paste / autocomplete / a11y" },
      { label: "FileUpload", path: "/file-upload", description: "Drag-and-drop or browse; accept / max-size validation, progress" },
    ],
  },
  {
    group: "Data",
    items: [
      { label: "DataTable", path: "/data-table", description: "TanStack Table + Virtual; sorting, filtering, grouping, windowing" },
      { label: "Combobox", path: "/combobox", description: "Sync options or async onSearch with debounced loading" },
      { label: "MultiCombobox", path: "/multi-combobox", description: "Multi-select with chip trigger + overflow collapse" },
      { label: "VirtualizedItems", path: "/lazy-options", description: "Drop-in windowing for huge option lists" },
    ],
  },
  {
    group: "Forms",
    items: [
      { label: "Form", path: "/form-new", description: "Form primitives with validation wiring" },
      { label: "BoundFields", path: "/bound-fields", description: "Bound* field wrappers \u2014 form-wired, no boilerplate" },
    ],
  },
  {
    group: "Date & time",
    items: [
      { label: "DatePicker", path: "/date-picker", description: "Calendar in a Popover; inline Calendar too" },
      { label: "DateRangePicker", path: "/date-range-picker", description: "Two-month side-by-side calendar; range anchoring" },
      { label: "TimePicker", path: "/time-picker", description: "Segmented HH:MM(:SS), 12h / 24h, auto-advance + arrow stepping" },
      { label: "DateTimePicker", path: "/date-time-picker", description: "Calendar + TimePicker in one Popover" },
    ],
  },
  {
    group: "Composite",
    items: [
      { label: "QRScanner", path: "/qr-scanner", description: "Camera-based QR / barcode scanner with decoder escape hatch" },
      { label: "NotificationsInbox", path: "/notifications-inbox", description: "Bell + popover panel; day-grouped feed with unread badge" },
    ],
  },
];
