// ============================================================================
// Component Exports
// ============================================================================
// Design tokens — public theming surface (override --zen-* CSS vars to retheme).
// Safe to ship: every declaration is a `--zen-*` custom property or a
// `.zen-*`-namespaced class, so it cannot collide with the consuming app.
import "@algorisys/zen-ui-core/tokens.css";
// Import UnoCSS generated styles for utility classes used in components
import "virtual:uno.css";

// NOTE: this entry deliberately imports NO page-level or element-level CSS.
// `./index.css` (html/body/#root rules) belongs to the demo app and is imported
// by `src/main.tsx`; shipping it here let the library restyle the consumer's
// document — it set their root font-size to 10px. The element reset now lives
// behind the opt-in `@algorisys/zen-ui-react/preflight` export.
// See docs/css-interop.md.
// Form Components - Input + Textarea (shadcn-style)
export { Input } from "./components/form/input/input";
export type { InputProps } from "./components/form/input/input";
export { Textarea } from "./components/form/input/textarea";
export type { TextareaProps } from "./components/form/input/textarea";
export { DEFAULT_EMAIL_DOMAINS } from "./components/form/input/input.constants";

// Form Components - Search (magnifier + clear button; type=search / role=searchbox)
export { Search } from "./components/form/search/search";
export type { SearchProps, SearchSize } from "./components/form/search/search";

// Form Components - PasswordInput (native input with a show/hide toggle)
export { PasswordInput } from "./components/form/password-input/password-input";
export type { PasswordInputProps } from "./components/form/password-input/password-input";

// Form Components - NumberField (shadcn-style)
export { NumberField } from "./components/form/number-field/number-field";
export type { NumberFieldProps } from "./components/form/number-field/number-field";

// Form Components - DatePicker + Calendar (react-day-picker + Radix Popover)
export {
  DatePicker,
  Calendar,
} from "./components/form/date-picker/date-picker";
export type {
  DatePickerProps,
  CalendarProps,
} from "./components/form/date-picker/date-picker";
// Survey primitives - Rating (5-star feedback input)
export { Rating } from "./components/survey/rating";
export type { RatingProps } from "./components/survey/rating";

// Survey primitives - NPS (Net Promoter Score 0-10 strip)
export { NPS } from "./components/survey/nps";
export type { NPSProps } from "./components/survey/nps";

// Survey primitives - Likert (n-point agree/disagree attitudinal scale)
export { Likert } from "./components/survey/likert";
export type { LikertProps, LikertOption } from "./components/survey/likert";

// Form Components - TagInput (type + Enter chip input)
export { TagInput } from "./components/form/tag-input/tag-input";
export type { TagInputProps } from "./components/form/tag-input/tag-input";

// Form Components - DateRangePicker (Calendar mode="range" in a Popover)
export { DateRangePicker } from "./components/form/date-picker/date-range-picker";
export type {
  DateRangePickerProps,
  DateRange,
} from "./components/form/date-picker/date-range-picker";

// Form Components - TimePicker (segmented HH:MM[:SS] input, 12h/24h)
export { TimePicker } from "./components/form/time-picker/time-picker";
export type { TimePickerProps } from "./components/form/time-picker/time-picker";

// Form Components - DateTimePicker (Calendar + TimePicker in one Popover)
export { DateTimePicker } from "./components/form/date-picker/date-time-picker";
export type { DateTimePickerProps } from "./components/form/date-picker/date-time-picker";

// QR / Barcode scanner — native BarcodeDetector with custom-decoder escape hatch
export { QRScanner } from "./components/qr-scanner/qr-scanner";
export type {
  QRScannerProps,
  QRScannerScan,
} from "./components/qr-scanner/qr-scanner";

// NotificationsInbox — bell + popover panel, grouped by day, read/unread
export { NotificationsInbox } from "./components/notifications-inbox/notifications-inbox";
export type {
  NotificationsInboxProps,
  Notification,
} from "./components/notifications-inbox/notifications-inbox";

// ColorPicker + ColorPalette (swatch grid + the platform's own picker;
// colour maths shared via core/color)
export { ColorPicker } from "./components/color-picker/color-picker";
export type { ColorPickerProps } from "./components/color-picker/color-picker";
export { ColorPalette } from "./components/color-picker/color-palette";
export type { ColorPaletteProps } from "./components/color-picker/color-palette";
export type { ColorOption } from "@algorisys/zen-ui-core/color";

// DynamicDateRange (semantic periods; the value is the question, not the answer)
export { DynamicDateRange } from "./components/form/dynamic-date-range/dynamic-date-range";
export type { DynamicDateRangeProps } from "./components/form/dynamic-date-range/dynamic-date-range";
export type {
  DateRangeValue,
  DateRangeOperator,
  ResolvedRange,
  OperatorMeta,
} from "@algorisys/zen-ui-core/date-range";
export {
  resolveDateRange,
  formatDateRangeValue,
  DATE_RANGE_OPERATORS,
  parseISODate,
  toISODate,
} from "@algorisys/zen-ui-core/date-range";

// Pivot — the components from this binding, the model from core.
//
// The whole model surface, not a subset: the Solid binding shipped PivotWorkbench
// while withholding PivotMembersRequest/Result, so `loadMembers` — the pivot's
// single integration point — had a signature no consumer could name.
export {
  PivotWorkbench,
  PivotGrid,
  PivotDropZone,
  PivotFieldChip,
  PivotFilterMenu,
} from "./components/pivot";
export type {
  PivotWorkbenchProps,
  PivotGridProps,
  PivotDropZoneProps,
  PivotFieldChipProps,
  PivotFilterMenuProps,
} from "./components/pivot";

export {
  createEmptyLayout,
  moveFieldToZone,
  removeFieldFromLayout,
  updateValueAggregation,
  zoneOf,
  zoneLabel,
  fieldLabel,
  availableFields,
  isLayoutRenderable,
  defaultAggregationForField,
  normalizeFilterSelection,
  isFilterActive,
  isValueSelected,
  hasActiveFilters,
  describeFilterSelection,
  describeMove,
  PIVOT_ZONES,
  PIVOT_AGGREGATIONS,
} from "@algorisys/zen-ui-core/pivot";
export type {
  PivotLayout,
  PivotField,
  PivotFieldType,
  PivotValueField,
  PivotZone,
  PivotAggregation,
  PivotFilters,
  PivotFilterSelection,
  PivotFilterOptionsBody,
  PivotMembersRequest,
  PivotMembersResult,
  PivotSort,
  SortDirection,
} from "@algorisys/zen-ui-core/pivot";

// Carousel (CSS scroll-snap; every child is a slide, no CarouselItem to import)
export { Carousel } from "./components/carousel/carousel";
export type { CarouselProps } from "./components/carousel/carousel";

// Media (filmstrip trim track + audio lane; math shared with every binding via core)
export { MediaTimeline } from "./components/media-timeline/media-timeline";
export type { MediaTimelineProps } from "./components/media-timeline/media-timeline";
export { Waveform } from "./components/waveform/waveform";
export type { WaveformProps } from "./components/waveform/waveform";
export { formatMediaTime, MIN_MEDIA_RANGE } from "@algorisys/zen-ui-core/media";
export type { MediaRange, MediaRangeMode, WaveformClip } from "@algorisys/zen-ui-core/media";

// Link (styled anchor; asChild for router links, external + disabled)
export { Link, linkVariants } from "./components/link/link";
export type { LinkProps } from "./components/link/link";

// UI Components - Popover (Radix-backed; standalone primitive)
export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
} from "./components/popover/popover";

// Form Components - Checkbox (Radix-backed)
export { Checkbox } from "./components/form/checkbox/checkbox";
export type {
  CheckboxProps,
  CheckboxSize,
} from "./components/form/checkbox/checkbox";

// Form Components - RadioGroup (Radix-backed)
export {
  RadioGroup,
  RadioGroupItem,
} from "./components/form/radio/radio-group";
export type {
  RadioGroupItemProps,
  RadioSize,
} from "./components/form/radio/radio-group";

// Form Components - Switch (Radix-backed)
export { Switch } from "./components/form/switch/switch";
export type { SwitchProps, SwitchSize } from "./components/form/switch/switch";

// Form Components - Select (Radix-backed compound API)
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./components/form/select/select";

// Form Components - PhoneInput (shadcn-style; composes Select + Input)
export { PhoneInput } from "./components/form/phone-input/phone-input";
export type {
  PhoneInputProps,
  PhoneValue,
} from "./components/form/phone-input/phone-input";
export {
  COUNTRY_CODES,
  COUNTRY_NAMES,
} from "./components/form/phone-input/phone-input.constants";

// Form Components - Slider (Radix-backed)
export { Slider } from "./components/form/slider/slider";
export type { SliderProps, SliderMark } from "./components/form/slider/slider";

// Form Components - MaskInput (fixed-template input; engine shared via core)
export { MaskInput } from "./components/form/mask-input/mask-input";
export type { MaskInputProps } from "./components/form/mask-input/mask-input";
export type { MaskRules } from "@algorisys/zen-ui-core/mask";

// Form Components - InputOTP (one <input> per digit, zero-dependency)
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./components/form/otp/otp";
export type { InputOTPProps } from "./components/form/otp/otp";

// UI Components - Avatar (Radix-backed compound API)
export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "./components/avatar/avatar";
export type {
  AvatarProps,
  AvatarGroupProps,
  AvatarSize,
} from "./components/avatar/avatar";

// Page + Bar (Zen-shaped structural frame)
export { Page, Bar } from "./components/page/page";
export type { PageProps, BarProps } from "./components/page/page";

// PageHeader (a heading with a back affordance and one action — the light
// alternative to DynamicPage when a screen just needs a title)
export { PageHeader } from "./components/page-header/page-header";
export type { PageHeaderProps } from "./components/page-header/page-header";

// Toolbar (Zen-shaped: actions collapse into an overflow menu)
export { Toolbar } from "./components/toolbar/toolbar";
export type { ToolbarProps, ToolbarAction } from "./components/toolbar/toolbar";

// SkipToContent (a11y keyboard bypass for the app frame — WCAG 2.4.1)
export { SkipToContent, SKIP_TO_CONTENT_CLASS } from "./components/skip-to-content/skip-to-content";
export type { SkipToContentProps } from "./components/skip-to-content/skip-to-content";

// ShellBar (Zen-shaped app frame: the top-level application header)
export { ShellBar } from "./components/shellbar/shellbar";
export type {
  ShellBarProps,
  ShellBarItem,
  ShellBarMenuItem,
  ShellBarProfile,
} from "./components/shellbar/shellbar";

// FlexibleColumnLayout (Zen-shaped app frame: 1-3 column master-detail)
export { FlexibleColumnLayout } from "./components/flexible-column-layout/flexible-column-layout";
export type {
  FlexibleColumnLayoutProps,
  FlexibleColumnLayoutType,
  FlexibleColumnLayoutChangeDetail,
  FlexibleColumnName,
} from "./components/flexible-column-layout/flexible-column-layout";

// DynamicPage (Zen-shaped app frame: header snaps away on scroll)
export {
  DynamicPage,
  DynamicPageTitle,
  DynamicPageHeader,
  DynamicPageFooter,
} from "./components/dynamic-page/dynamic-page";
export type {
  DynamicPageProps,
  DynamicPageTitleProps,
  DynamicPageHeaderProps,
  DynamicPageFooterProps,
} from "./components/dynamic-page/dynamic-page";

// ViewSettingsDialog (Zen-shaped: sort / group / filter settings)
export { ViewSettingsDialog } from "./components/view-settings/view-settings-dialog";
export type {
  ViewSettingsDialogProps,
  ViewSettingsValue,
  ViewSettingsItem,
  ViewSettingsFilterGroup,
} from "./components/view-settings/view-settings-dialog";

// FilterBar (Zen-shaped: the List Report filter area)
export { FilterBar } from "./components/filter-bar/filter-bar";
export type { FilterBarProps, FilterBarField } from "./components/filter-bar/filter-bar";

// ValueHelp (Zen-shaped: the F4 lookup dialog — list + condition builder)
export { ValueHelp } from "./components/value-help/value-help";
export type {
  ValueHelpProps,
  ValueHelpCondition,
  ValueHelpOperator,
  ValueHelpResult,
} from "./components/value-help/value-help";

// SelectDialog (Zen-shaped: the searchable list picker)
export { SelectDialog } from "./components/select-dialog/select-dialog";
export type {
  SelectDialogProps,
  SelectDialogItem,
} from "./components/select-dialog/select-dialog";

// ObjectPageLayout (Zen-shaped app frame: scroll-spy anchored sections)
export { ObjectPageLayout } from "./components/object-page/object-page";
export type {
  ObjectPageLayoutProps,
  ObjectPageSection,
  ObjectPageSubSection,
} from "./components/object-page/object-page";

// Tree (Zen-shaped; also zen-ui's first tree of any kind)
export { Tree } from "./components/tree/tree";
export type { TreeProps, TreeNode } from "./components/tree/tree";

// Object atoms (Zen-shaped: ObjectStatus / Number / Identifier / Marker)
export {
  ObjectStatus,
  ObjectNumber,
  ObjectIdentifier,
  ObjectMarker,
  objectStatusVariants,
} from "./components/object/object";
export type {
  ObjectStatusProps,
  ObjectNumberProps,
  ObjectIdentifierProps,
  ObjectMarkerProps,
  ObjectState,
  ObjectMarkerType,
} from "./components/object/object";

// UI Components - Icon (zen-ui icon set; geometry shared with the Solid binding)
export { Icon, ZEN_ICON_NAMES } from "./components/icon/icon";
export type { IconProps, IconName } from "./components/icon/icon";

// UI Components - Badge (shadcn-style; no Radix primitive)
export { Badge, badgeVariants } from "./components/badge/badge";
export type { BadgeProps } from "./components/badge/badge";

// UI Components - Separator (Radix-backed)
export { Separator } from "./components/divider/divider";
export type { SeparatorProps } from "./components/divider/divider";

// UI Components - Progress (Radix-backed)
export { Progress } from "./components/progress/progress";
export type {
  ProgressProps,
  ProgressSize,
  ProgressColor,
} from "./components/progress/progress";

// UI Components - Loading (shadcn-style)
export { Loading, spinnerVariants } from "./components/loading/loading";
export type { LoadingProps } from "./components/loading/loading";

// UI Components - Skeleton (shadcn-style)
export { Skeleton } from "./components/skeleton/skeleton";
export type { SkeletonProps } from "./components/skeleton/skeleton";

// UI Components - ScrollArea (Radix-backed)
export { ScrollArea, ScrollBar } from "./components/scroll-area/scroll-area";

// Button family (Zen-shaped: ToggleButton / SegmentedButton / SplitButton)
export {
  ToggleButton,
  SegmentedButton,
  SegmentedButtonItem,
  SplitButton,
} from "./components/button/button-family";
export type {
  ToggleButtonProps,
  SegmentedButtonProps,
  SegmentedButtonItemProps,
  SplitButtonProps,
} from "./components/button/button-family";

// UI Components - Button (shadcn/radix-style)
export { Button, buttonVariants } from "./components/button/button";
export type { ButtonProps } from "./components/button/button";

// UI Components - Tooltip (Radix-backed compound API)
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
} from "./components/tooltip/tooltip";
export type { TooltipContentProps } from "./components/tooltip/tooltip";

// UI Components - DropdownMenu (Radix-backed action-menu compound API)
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./components/dropdown-menu/dropdown-menu";

// UI Components - FAB (shadcn-style; composes the Button)
export { FAB } from "./components/fab/fab";
export type { FABProps } from "./components/fab/fab";

// Form primitives (shadcn pattern on react-hook-form)
export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  useFormField,
} from "./components/form-builder/form";

// Bound* fields — config-driven adapter over the compound Form primitives.
// Read from useFormContext() and render label + control + error in one shot.
export {
  BoundInput,
  BoundTextarea,
  BoundSelect,
  BoundCheckbox,
  BoundSwitch,
  BoundRadioGroup,
  BoundSlider,
} from "./components/form-builder/bound-fields";
export type {
  BoundInputProps,
  BoundTextareaProps,
  BoundSelectProps,
  BoundCheckboxProps,
  BoundSwitchProps,
  BoundRadioGroupProps,
  BoundSliderProps,
  SelectOption as BoundSelectOption,
} from "./components/form-builder/bound-fields";

// UI Components - Dialog (Radix-backed)
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./components/dialog/dialog";

// UI Components - AlertDialog (destructive-confirm variant)
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./components/dialog/alert-dialog";

// UI Components - FileUpload (drag + drop, size/type validation)
export { FileUpload } from "./components/file-upload/file-upload";
export type {
  FileUploadProps,
  FileRejection,
} from "./components/file-upload/file-upload";

// UI Components - Toast (Radix-backed) + imperative API
export {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
  toastVariants,
} from "./components/toast/toast";
export type { ToastProps } from "./components/toast/toast";
export { Toaster } from "./components/toast/toaster";
export { useToast, toast } from "./components/toast/use-toast";
export type {
  ToastDescriptor,
  ToastInput,
} from "./components/toast/use-toast";

// UI Components - Sheet / Drawer (Radix Dialog with slide-from-edge animation)
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  sheetContentVariants,
} from "./components/sheet/sheet";
export type { SheetContentProps } from "./components/sheet/sheet";

// UI Components - Stack (flexbox layout primitive)
export { Stack } from "./components/stack/stack";
export type { StackProps } from "./components/stack/stack";

// Theme — scopes a theme to a subtree. The document-wide switch is applyTheme()
// in core; this is the same mechanism narrowed to one element.
export { Theme } from "./components/theme/theme";
export type { ThemeProps } from "./components/theme/theme";

// DirectionProvider — tells the Radix primitives which way the page reads.
// CSS flips on its own; the JS that decides submenu side and arrow-key meaning
// does not, and Radix defaults to ltr regardless of document.dir.
// MessagePopover — aggregated form validation, grouped by severity, with
// click-to-navigate to the offending field.
export { MessagePopover } from "./components/message-popover/message-popover";
export type { Message, MessageType, MessagePopoverProps } from "./components/message-popover/message-popover";

export { DirectionProvider } from "./components/direction/direction";
export type { Direction, DirectionProviderProps } from "./components/direction/direction";

// UI Components - Card (generic surface + SelectableCard for "pick one")
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
} from "./components/card/card";
export type { CardProps } from "./components/card/card";

// StatCard (a labelled figure on the Card surface — icon, delta, somewhere to go)
export { StatCard } from "./components/stat-card/stat-card";
export type {
  StatCardProps,
  StatCardTrend,
  StatCardColor,
} from "./components/stat-card/stat-card";
export {
  SelectableCard,
  SelectableCardGroup,
} from "./components/card/card.selectable";
export type { SelectableCardProps } from "./components/card/card.selectable";

// UI Components - Accordion (Radix-backed collapsible-section list)
export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/accordion/accordion";

// UI Components - Tabs (Radix-backed; underline + pills variants)
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
} from "./components/tabs/tabs";
export type {
  TabsListProps,
  TabsTriggerProps,
} from "./components/tabs/tabs";

// UI Components - EmptyState (first-run / no-data surface; compound API)
export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  emptyStateVariants,
} from "./components/empty-state/empty-state";
export type { EmptyStateProps } from "./components/empty-state/empty-state";

// UI Components - Banner (page-top persistent callout; compound API)
export {
  Banner,
  BannerIcon,
  BannerContent,
  BannerTitle,
  BannerDescription,
  BannerActions,
  BannerClose,
  bannerVariants,
} from "./components/banner/banner";
export type { BannerProps, BannerCloseProps } from "./components/banner/banner";

// UI Components - Stepper / Wizard (compound API for multi-step flows)
export {
  Stepper,
  StepperList,
  StepperPanel,
  StepperNavigation,
  useStepper,
} from "./components/stepper/stepper";
export type {
  StepperProps,
  StepperListProps,
  StepperPanelProps,
  StepperNavigationProps,
  StepperStep,
  StepStatus,
} from "./components/stepper/stepper";

// UI Components - Alert (zen-theme spec)
export {
  Alert,
  AlertIcon,
  AlertContent,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertClose,
  alertVariants,
} from "./components/alert/alert";
export type { AlertProps, AlertCloseProps } from "./components/alert/alert";

// Theming
export { useTheme, applyTheme, getInitialTheme, THEMES } from "./lib/theme";
export type { ThemeName, ThemeDescriptor } from "./lib/theme";

// Data display — Table markup primitives + DataTable
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/data-table/table";
// Prop types are part of the API: a component whose props cannot be named is
// hard to wrap, extend or store in a variable. This existed and was simply not
// exported — Solid's binding exported its equivalent.
export type { TableProps } from "./components/data-table/table";
export { DataTable } from "./components/data-table/data-table";
export type {
  DataTableProps,
  DataTableManualPagination,
} from "./components/data-table/data-table";
export { TreeTable } from "./components/tree-table/tree-table";
export { PlanningCalendar } from "./components/planning-calendar/planning-calendar";
export type { PlanningView } from "@algorisys/zen-ui-core/planning";
export type { PlanningCalendarProps, PlanningRow, PlanningAppointment, PlanningAppointmentState } from "./components/planning-calendar/planning-calendar";
export { UploadCollection } from "./components/upload-collection/upload-collection";
export type { UploadCollectionProps, UploadItem, UploadStatus } from "./components/upload-collection/upload-collection";
export { Timeline } from "./components/timeline/timeline";
export type { TimelineProps, TimelineItem, TimelineState } from "./components/timeline/timeline";
export {
  MicroLineChart,
  MicroBarChart,
  MicroBulletChart,
  MicroDeltaChart,
  MicroRadialChart,
} from "./components/micro-chart/micro-chart";
export type {
  MicroChartColor,
  MicroLineChartProps,
  MicroBarChartProps,
  MicroBulletChartProps,
  MicroDeltaChartProps,
  MicroRadialChartProps,
} from "./components/micro-chart/micro-chart";
export type { TreeTableProps } from "./components/tree-table/tree-table";

// Listbox helpers (windowed rendering for large option lists)
export { VirtualizedItems } from "./components/listbox/virtualized-items";
export type {
  VirtualizedItemsProps,
  VirtualizedItemsDenseProps,
  VirtualizedItemsSparseProps,
} from "./components/listbox/virtualized-items";

// Combobox + Command (cmdk-backed; sync or async option loading)
export { Combobox } from "./components/combobox/combobox";
export type {
  ComboboxOption,
  ComboboxProps,
} from "./components/combobox/combobox";
export { MultiCombobox } from "./components/combobox/multi-combobox";
export type { MultiComboboxProps } from "./components/combobox/multi-combobox";
export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "./components/combobox/command";

// UI Components - Breadcrumb (navigation trail)
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/breadcrumb/breadcrumb";

// UI Components - Pagination (standalone page navigator)
export {
  Pagination,
  usePaginationRange,
} from "./components/pagination/pagination";
export type { PaginationProps } from "./components/pagination/pagination";

// UI Components - Sidebar (collapsible navigation shell)
export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarTrigger,
  useSidebar,
} from "./components/sidebar/sidebar";
export type {
  SidebarProviderProps,
  SidebarMenuButtonProps,
  SidebarMenuSubProps,
  SidebarMenuSubButtonProps,
  SidebarTriggerProps,
} from "./components/sidebar/sidebar";

// UI Components - Chart (lazy recharts wrapper; optional peer dep)
export { Chart } from "./components/chart/chart";
export type { ChartProps, ChartSeries } from "./components/chart/chart";
export type { Slice } from "@algorisys/zen-ui-core/chart";
export { CHART_PALETTE } from "@algorisys/zen-ui-core/chart";

// UI Components - RichText (lazy jodit-pro-react wrapper; optional peer dep)
export { RichText } from "./components/rich-text/rich-text";
export type { RichTextProps } from "./components/rich-text/rich-text";

// UI Components - Map (lazy react-leaflet wrapper; optional peer dep)
export { Map } from "./components/map/map";
export type { MapProps, MapMarker } from "./components/map/map";

// UI Components - Camera (lazy react-webcam wrapper; optional peer dep)
export { Camera } from "./components/camera/camera";
export type { CameraProps } from "./components/camera/camera";

// DataTable's filter + inline-edit vocabulary, and BoundSelect's option shape.
// All defined, all exported from their own modules, none re-exported from here
// — while Solid's root exported every one. A caller could pass a
// `meta.filterVariant` and never name its type. Found by `bun run check:parity`,
// which is the point of having it.
export type {
  FilterVariant,
  TextOp,
  TextFilterValue,
  NumberOp,
  NumberFilterValue,
  NumberRangeFilterValue,
} from "./components/data-table/filters";
export type { EditVariant, CellEditPayload } from "./components/data-table/edit-cell";
export type { SelectOption } from "./components/form-builder/bound-fields";
