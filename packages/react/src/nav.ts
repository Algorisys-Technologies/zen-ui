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
};

export type NavGroup = {
  title: string;
  items: NavItem[];
  /** Groups flagged `catalogue: false` are sidebar-only (e.g. Getting started). */
  catalogue?: boolean;
};

export const NAV: NavGroup[] = [
  {
    title: "Getting started",
    catalogue: false,
    items: [
      { to: "/", label: "Welcome" },
    ],
  },
  {
    title: "Components",
    items: [
      { to: "/button-new", label: "Button", description: "forwardRef, asChild, CVA variants \u00d7 colors \u00d7 sizes \u00d7 shapes" },
      { to: "/tooltip-new", label: "Tooltip", description: "Radix Tooltip \u2014 positioning, dismissal, a11y" },
      { to: "/dropdown-menu", label: "DropdownMenu", description: "Radix DropdownMenu \u2014 action menus, sub-menus, checkbox/radio items" },
      { to: "/separator", label: "Separator", description: "Radix Separator \u2014 horizontal / vertical with decorative semantics" },
      { to: "/switch-new", label: "Switch", description: "Radix Switch \u2014 sizes, controlled / uncontrolled, form submission" },
      { to: "/checkbox-new", label: "Checkbox", description: "Radix Checkbox \u2014 native tri-state indeterminate, sizes" },
      { to: "/radio-group", label: "RadioGroup", description: "Radix RadioGroup \u2014 roving tabindex, arrow nav, form submission" },
      { to: "/progress-new", label: "Progress", description: "Radix Progress \u2014 sizes \u00d7 colors, accessible value" },
      { to: "/avatar-new", label: "Avatar", description: "Radix Avatar \u2014 image + initials fallback + stacked group" },
      { to: "/badge-new", label: "Badge", description: "Styled span with variants \u00d7 colors, asChild for clickable" },
      { to: "/skeleton-new", label: "Skeleton", description: "Animated muted-box placeholder" },
      { to: "/loading-new", label: "Loading", description: "Animated spinner with sr-only label, color=current for buttons" },
      { to: "/select-new", label: "Select", description: "Radix Select \u2014 keyboard nav, groups, form submission" },
      { to: "/slider-new", label: "Slider", description: "Radix Slider \u2014 single + range, vertical, keyboard control" },
      { to: "/scroll-area-new", label: "ScrollArea", description: "Radix ScrollArea \u2014 custom scrollbars, both axes" },
      { to: "/input-new", label: "Input + Textarea", description: "Plain styled <input> / <textarea>, all native attrs" },
      { to: "/number-field-new", label: "NumberField", description: "Number input with \u2212/+ stepper, clamp, decimal step" },
      { to: "/date-picker-new", label: "DatePicker", description: "react-day-picker in a Radix Popover; inline Calendar too" },
      { to: "/otp-new", label: "InputOTP", description: "one input per digit, zero-dep; paste / autocomplete / a11y" },
      { to: "/phone-input-new", label: "PhoneInput", description: "Composition: Select (country) + Input (number)" },
      { to: "/fab-new", label: "FAB", description: "Fixed-position Button wrapper + DropdownMenu for speed-dial" },
      { to: "/form-new", label: "Form (RHF + Zod)", description: "react-hook-form + Zod resolver; FormField / FormItem / FormLabel / FormMessage" },
      { to: "/data-table", label: "DataTable", description: "TanStack Table + Virtual; sorting, filtering, grouping, pinning, resizing, windowing" },
      { to: "/lazy-options", label: "Lazy options", description: "VirtualizedItems \u2014 drop-in windowing for huge option lists inside Combobox / Select" },
      { to: "/combobox", label: "Combobox + Async", description: "cmdk-backed; sync `options` or async `onSearch` with debounced loading" },
      { to: "/alert", label: "Alert", description: "Inline semantic callout; compound Icon / Title / Description / Actions API" },
      { to: "/dialog", label: "Dialog + AlertDialog", description: "Radix Dialog modal surface, plus AlertDialog for destructive confirmations" },
      { to: "/toast", label: "Toast", description: "Radix Toast \u2014 imperative toast() plus a Toaster viewport; variants and actions" },
      { to: "/file-upload", label: "FileUpload", description: "Drag-and-drop or browse; accept / max-size validation with per-file progress" },
      { to: "/form-bound", label: "Bound* fields", description: "BoundInput / BoundSelect / BoundSwitch \u2014 form-wired field wrappers, no boilerplate" },
      { to: "/stepper", label: "Stepper", description: "Multi-step wizard for onboarding + journey apps (horizontal / vertical, linear / non-linear)" },
      { to: "/banner", label: "Banner", description: "Page-top persistent callout \u2014 verification reminders, maintenance windows, impersonation" },
      { to: "/empty-state", label: "EmptyState", description: "First-run / no-data / no-results surface; icon + title + description + actions" },
      { to: "/tabs", label: "Tabs", description: "Radix-backed tabbed navigation; underline + pills variants, horizontal / vertical" },
      { to: "/accordion", label: "Accordion", description: "Radix-backed collapsible sections; single + multiple expand modes" },
      { to: "/card", label: "Card", description: "Surface primitive + SelectableCard variant for goal pickers / plan selectors" },
      { to: "/sheet", label: "Sheet / Drawer", description: "Slide-in side panel on Radix Dialog; right / left / top / bottom" },
      { to: "/date-range-picker", label: "DateRangePicker", description: "Two-month side-by-side calendar in a Popover; range anchoring, controlled / uncontrolled" },
      { to: "/tag-input", label: "TagInput", description: "Type + Enter chip input; comma-paste splits, Backspace removes, per-tag validator, max-N" },
      { to: "/multi-combobox", label: "MultiCombobox", description: "Multi-select Combobox with chip trigger + overflow collapse + sync / async option loading" },
      { to: "/rating", label: "Rating", description: "5-star rating input; hover preview, arrow-key nav, sm / md / lg, customizable max" },
      { to: "/nps", label: "NPS", description: "Net Promoter Score 0-10 strip with detractor / passive / promoter color buckets" },
      { to: "/likert", label: "Likert", description: "n-point attitudinal scale; segmented + stacked layouts, custom option sets" },
      { to: "/time-picker", label: "TimePicker", description: "Segmented HH:MM(:SS) input, 12h / 24h, AM/PM, auto-advance + arrow stepping" },
      { to: "/date-time-picker", label: "DateTimePicker", description: "Calendar + TimePicker in one Popover; preserves time-of-day on day changes" },
      { to: "/qr-scanner", label: "QRScanner", description: "Camera-based QR / barcode scanner; native BarcodeDetector + custom-decoder escape hatch" },
      { to: "/notifications-inbox", label: "NotificationsInbox", description: "Bell icon + popover panel; day-grouped feed with unread badge + per-row actions" },
      { to: "/breadcrumb", label: "Breadcrumb", description: "Hierarchical navigation path; collapsible ellipsis for deep trees" },
      { to: "/pagination", label: "Pagination", description: "Page navigation with truncated ranges; usePaginationRange hook" },
      { to: "/sidebar", label: "Sidebar", description: "Collapsible navigation shell; provider + trigger + grouped menu" },
    ],
  },
  {
    title: "Heavy / optional (lazy peer deps)",
    items: [
      { to: "/chart", label: "Chart (recharts)", description: "Lazy-loaded line / bar / area charts; recharts is an optional peer dep" },
      { to: "/rich-text", label: "RichText (jodit)", description: "Lazy-loaded WYSIWYG editor; jodit-pro-react is an optional peer dep" },
      { to: "/map", label: "Map (leaflet)", description: "Lazy-loaded map with markers; leaflet + react-leaflet are optional peer deps" },
      { to: "/camera", label: "Camera (webcam)", description: "Lazy-loaded camera capture; react-webcam is an optional peer dep" },
    ],
  },
  {
    title: "Fiori-shaped",
    items: [
      { to: "/icon", label: "Icon", description: "zen-ui icon set (48 glyphs); inherits text colour, decorative by default" },
      { to: "/object", label: "Object atoms", description: "ObjectStatus / ObjectNumber / ObjectIdentifier / ObjectMarker" },
      { to: "/button-family", label: "Button family", description: "ToggleButton, SegmentedButton, SplitButton" },
      { to: "/toolbar", label: "Toolbar", description: "Actions that collapse into an overflow menu when they do not fit" },
      { to: "/tree", label: "Tree", description: "Hierarchical expandable list with full ARIA keyboard navigation" },
    ],
  },
  {
    title: "Fiori table ecosystem",
    items: [
      { to: "/select-dialog", label: "SelectDialog", description: "Searchable list picker — single commits on click, multi commits on OK" },
      { to: "/value-help", label: "ValueHelp", description: "F4 lookup dialog — the list picker plus a condition builder" },
    ],
  },
  {
    title: "Fiori app frame",
    items: [
      { to: "/shellbar", label: "ShellBar", description: "Top-level app header — branding, search, actions, profile menu" },
      { to: "/flexible-column-layout", label: "FlexibleColumnLayout", description: "1–3 column master-detail frame with responsive collapse" },
      { to: "/dynamic-page", label: "DynamicPage", description: "Title + header that snaps away on scroll; pinnable header" },
      { to: "/object-page", label: "ObjectPageLayout", description: "Anchored sections with scroll-spy navigation" },
    ],
  },
];
