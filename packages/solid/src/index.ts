// ============================================================================
// @algorisys/zen-ui-solid — public exports
// ============================================================================
// Side-effect CSS imports. Tokens must load before any UnoCSS utility
// (bg-zen-*, text-zen-*, …) is evaluated, otherwise those classes
// resolve to var(--zen-color-…) → empty.
// Only `--zen-*` custom properties and `.zen-*` classes ship from here. The
// element reset is opt-in via `@algorisys/zen-ui-solid/preflight` so the library
// cannot restyle a consumer's document — see docs/css-interop.md.
import "@algorisys/zen-ui-core/tokens.css";
import "virtual:uno.css";

// Theming
export { useTheme, applyTheme, getInitialTheme, THEMES } from "./lib/theme";
export type { ThemeName, ThemeDescriptor } from "./lib/theme";

// Utility
export { cn } from "./lib/cn";
export type { PolymorphicProps } from "./lib/polymorphic";

// ---------------------------------------------------------------------------
// Tier 1 — zero-dep primitives
// ---------------------------------------------------------------------------

export { Button, buttonVariants } from "./components/button/button";

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
export type { ButtonProps } from "./components/button/button";

export { Page, Bar } from "./components/page/page";
export type { PageProps, BarProps } from "./components/page/page";

export { PageHeader } from "./components/page-header/page-header";
export type { PageHeaderProps } from "./components/page-header/page-header";

export { Toolbar } from "./components/toolbar/toolbar";
export type { ToolbarProps, ToolbarAction } from "./components/toolbar/toolbar";

export { Tree } from "./components/tree/tree";
export type { TreeProps, TreeNode } from "./components/tree/tree";

export { SkipToContent, SKIP_TO_CONTENT_CLASS } from "./components/skip-to-content/skip-to-content";
export type { SkipToContentProps } from "./components/skip-to-content/skip-to-content";
export { ShellBar } from "./components/shellbar/shellbar";
export type {
  ShellBarProps,
  ShellBarItem,
  ShellBarMenuItem,
  ShellBarProfile,
} from "./components/shellbar/shellbar";

export { FlexibleColumnLayout } from "./components/flexible-column-layout/flexible-column-layout";
export type {
  FlexibleColumnLayoutProps,
  FlexibleColumnLayoutType,
  FlexibleColumnLayoutChangeDetail,
  FlexibleColumnName,
} from "./components/flexible-column-layout/flexible-column-layout";

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

export { SelectDialog } from "./components/select-dialog/select-dialog";
export type {
  SelectDialogProps,
  SelectDialogItem,
} from "./components/select-dialog/select-dialog";

export { ViewSettingsDialog } from "./components/view-settings/view-settings-dialog";
export type {
  ViewSettingsDialogProps,
  ViewSettingsValue,
  ViewSettingsItem,
  ViewSettingsFilterGroup,
} from "./components/view-settings/view-settings-dialog";

export { FilterBar } from "./components/filter-bar/filter-bar";
export type { FilterBarProps, FilterBarField } from "./components/filter-bar/filter-bar";

export { ValueHelp } from "./components/value-help/value-help";
export type {
  ValueHelpProps,
  ValueHelpCondition,
  ValueHelpOperator,
  ValueHelpResult,
} from "./components/value-help/value-help";

export { ObjectPageLayout } from "./components/object-page/object-page";
export type {
  ObjectPageLayoutProps,
  ObjectPageSection,
  ObjectPageSubSection,
} from "./components/object-page/object-page";

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

export { Icon, ZEN_ICON_NAMES } from "./components/icon/icon";
export type { IconProps, IconName } from "./components/icon/icon";

export { ColorPicker } from "./components/color-picker/color-picker";
export type { ColorPickerProps } from "./components/color-picker/color-picker";
export { ColorPalette } from "./components/color-picker/color-palette";
export type { ColorPaletteProps } from "./components/color-picker/color-palette";
export type { ColorOption } from "@algorisys/zen-ui-core/color";

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

export { Carousel } from "./components/carousel/carousel";
export type { CarouselProps } from "./components/carousel/carousel";

export { Link, linkVariants } from "./components/link/link";
export type { LinkProps } from "./components/link/link";

export { Badge, badgeVariants } from "./components/badge/badge";
export type { BadgeProps } from "./components/badge/badge";

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
export type {
  SelectableCardProps,
  SelectableCardGroupProps,
} from "./components/card/card.selectable";

export { Skeleton } from "./components/skeleton/skeleton";
export type { SkeletonProps } from "./components/skeleton/skeleton";

export { Loading, spinnerVariants } from "./components/loading/loading";
export type { LoadingProps } from "./components/loading/loading";

export { FAB } from "./components/fab/fab";
export type { FABProps } from "./components/fab/fab";

export { Separator } from "./components/divider/divider";
export type { SeparatorProps } from "./components/divider/divider";

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

export {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
  EmptyStateActions,
  emptyStateVariants,
} from "./components/empty-state/empty-state";
export type { EmptyStateProps } from "./components/empty-state/empty-state";

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

export { Rating } from "./components/survey/rating";
export type { RatingProps } from "./components/survey/rating";

export { NPS } from "./components/survey/nps";
export type { NPSProps } from "./components/survey/nps";

export { Likert } from "./components/survey/likert";
export type { LikertProps, LikertOption } from "./components/survey/likert";

// ---------------------------------------------------------------------------
// Tier 2 — Kobalte-backed components
// ---------------------------------------------------------------------------

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
} from "./components/avatar/avatar";
export type {
  AvatarProps,
  AvatarImageProps,
  AvatarGroupProps,
  AvatarSize,
} from "./components/avatar/avatar";

export { Progress } from "./components/progress/progress";
export type {
  ProgressProps,
  ProgressSize,
  ProgressColor,
} from "./components/progress/progress";

export { Switch } from "./components/form/switch/switch";
export type { SwitchProps, SwitchSize } from "./components/form/switch/switch";

export { Checkbox } from "./components/form/checkbox/checkbox";
export type {
  CheckboxProps,
  CheckboxSize,
} from "./components/form/checkbox/checkbox";

export {
  RadioGroup,
  RadioGroupItem,
} from "./components/form/radio/radio-group";
export type {
  RadioGroupProps,
  RadioGroupItemProps,
  RadioSize,
} from "./components/form/radio/radio-group";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipPortal,
} from "./components/tooltip/tooltip";
export type { TooltipContentProps } from "./components/tooltip/tooltip";

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
} from "./components/tabs/tabs";
export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from "./components/tabs/tabs";

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./components/accordion/accordion";
export type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from "./components/accordion/accordion";

export { MaskInput } from "./components/form/mask-input/mask-input";
export type { MaskInputProps } from "./components/form/mask-input/mask-input";
export type { MaskRules } from "@algorisys/zen-ui-core/mask";

export { Slider } from "./components/form/slider/slider";
export type { SliderProps, SliderMark } from "./components/form/slider/slider";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  PopoverPortal,
} from "./components/popover/popover";
export type { PopoverContentProps } from "./components/popover/popover";

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
export type { DialogContentProps } from "./components/dialog/dialog";

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
export type { AlertDialogContentProps } from "./components/dialog/alert-dialog";

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
export type {
  DropdownMenuItemProps,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioItemProps,
} from "./components/dropdown-menu/dropdown-menu";

export { Select } from "./components/form/select/select";
export type { SelectProps, SelectOption } from "./components/form/select/select";

export { ScrollArea, ScrollBar } from "./components/scroll-area/scroll-area";
export type { ScrollAreaProps } from "./components/scroll-area/scroll-area";

export { Toaster, toast } from "./components/toast/toaster";

// ---------------------------------------------------------------------------
// Tier 3 — special-lib + custom components
// ---------------------------------------------------------------------------

export { Input, Textarea } from "./components/form/input/input";
export type { InputProps, TextareaProps } from "./components/form/input/input";
export { DEFAULT_EMAIL_DOMAINS } from "./components/form/input/input.constants";
export { Search } from "./components/form/search/search";
export type { SearchProps, SearchSize } from "./components/form/search/search";
export { PasswordInput } from "./components/form/password-input/password-input";
export type { PasswordInputProps } from "./components/form/password-input/password-input";

export { NumberField } from "./components/form/number-field/number-field";
export type { NumberFieldProps } from "./components/form/number-field/number-field";

export { TagInput } from "./components/form/tag-input/tag-input";
export type { TagInputProps } from "./components/form/tag-input/tag-input";

export { PhoneInput, COUNTRY_CODES, COUNTRY_NAMES } from "./components/form/phone-input/phone-input";
export type { PhoneInputProps, PhoneValue } from "./components/form/phone-input/phone-input";

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./components/form/otp/otp";
export type { InputOTPProps } from "./components/form/otp/otp";

export { FileUpload } from "./components/file-upload/file-upload";
export type { FileUploadProps, FileRejection } from "./components/file-upload/file-upload";

// Tier 3 batch B — special-lib components
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
export type { TableProps } from "./components/data-table/table";

// Pivot — the components from this binding, the model from core.
//
// The whole model surface is re-exported, not a subset. It used to export
// PivotWorkbench while withholding PivotMembersRequest/Result, so `loadMembers`
// — the pivot's single integration point — had a signature no consumer could
// name. The demo only got away with it by deep-importing past the root.
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

export { DataTable } from "./components/data-table/data-table";
export type {
  DataTableProps,
  DataTableManualPagination,
} from "./components/data-table/data-table";
export type {
  FilterVariant,
  TextOp,
  TextFilterValue,
  NumberOp,
  NumberFilterValue,
  NumberRangeFilterValue,
} from "./components/data-table/filters";
export type {
  EditVariant,
  CellEditPayload,
} from "./components/data-table/edit-cell";

export { VirtualizedItems } from "./components/listbox/virtualized-items";
export type {
  VirtualizedItemsProps,
  VirtualizedItemsDenseProps,
  VirtualizedItemsSparseProps,
} from "./components/listbox/virtualized-items";

export { Combobox } from "./components/combobox/combobox";
export type { ComboboxProps, ComboboxOption } from "./components/combobox/combobox";
export { MultiCombobox } from "./components/combobox/multi-combobox";
export type { MultiComboboxProps } from "./components/combobox/multi-combobox";

// Tier 3 batch C — Form + BoundFields
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
  BoundSelectOption,
} from "./components/form-builder/bound-fields";

// Tier 3 batch D — Date / Time pickers
export { Calendar, DatePicker } from "./components/form/date-picker/date-picker";
export type {
  CalendarProps,
  DatePickerProps,
  DateRange,
} from "./components/form/date-picker/date-picker";
export { DateRangePicker } from "./components/form/date-picker/date-range-picker";
export type { DateRangePickerProps } from "./components/form/date-picker/date-range-picker";
export { TimePicker } from "./components/form/time-picker/time-picker";
export type { TimePickerProps } from "./components/form/time-picker/time-picker";
export { DateTimePicker } from "./components/form/date-picker/date-time-picker";
export type { DateTimePickerProps } from "./components/form/date-picker/date-time-picker";

// Tier 3 batch E — device + composite
export { QRScanner } from "./components/qr-scanner/qr-scanner";
export type { QRScannerProps, QRScannerScan } from "./components/qr-scanner/qr-scanner";
export { NotificationsInbox } from "./components/notifications-inbox/notifications-inbox";
export type {
  NotificationsInboxProps,
  Notification,
} from "./components/notifications-inbox/notifications-inbox";

// ---------------------------------------------------------------------------
// Ported from the React binding — see CLAUDE.md's parity rule. Where Solid has
// no equivalent of a React-only dep (cmdk, recharts, react-webcam), the port
// rebuilds the behaviour rather than pulling React in; per-file port notes list
// any behavioural gaps.
// ---------------------------------------------------------------------------

export { Stack } from "./components/stack/stack";
export type { StackProps } from "./components/stack/stack";

// Theme — scopes a theme to a subtree. The document-wide switch is applyTheme()
// in core; this is the same mechanism narrowed to one element.
export { Theme } from "./components/theme/theme";
export type { ThemeProps } from "./components/theme/theme";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./components/breadcrumb/breadcrumb";
export type {
  BreadcrumbProps,
  BreadcrumbListProps,
  BreadcrumbItemProps,
  BreadcrumbLinkProps,
  BreadcrumbPageProps,
  BreadcrumbSeparatorProps,
  BreadcrumbEllipsisProps,
} from "./components/breadcrumb/breadcrumb";

export { Pagination, usePaginationRange } from "./components/pagination/pagination";

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandLoading,
  defaultFilter,
} from "./components/command/command";
export type { CommandFilter, CommandEmptyProps } from "./components/command/command";

export {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
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
  useSidebar,
} from "./components/sidebar/sidebar";
export type {
  SidebarMenuButtonProps,
  SidebarMenuSubProps,
  SidebarMenuSubButtonProps,
  SidebarTriggerProps,
} from "./components/sidebar/sidebar";

// Heavy / optional peer deps — lazy-loaded, never bundled.
export { Chart } from "./components/chart/chart";
// The types were missing here while React exported them, so Solid consumers
// could use Chart but never name its props. A parity bug, not a design.
export type { ChartProps, ChartSeries } from "./components/chart/chart";
export type { Slice } from "@algorisys/zen-ui-core/chart";
export { CHART_PALETTE } from "@algorisys/zen-ui-core/chart";
export { RichText } from "./components/rich-text/rich-text";
export { Map } from "./components/map/map";
export { Camera } from "./components/camera/camera";
// Prop types are part of the API: a component whose props cannot be named is
// hard to wrap, extend or store in a variable. These existed and were simply not
// exported.
export type { CameraProps } from "./components/camera/camera";
export type { MapProps, MapMarker } from "./components/map/map";
export type { PaginationProps } from "./components/pagination/pagination";
export type { RichTextProps } from "./components/rich-text/rich-text";
export type { SidebarProviderProps } from "./components/sidebar/sidebar";
