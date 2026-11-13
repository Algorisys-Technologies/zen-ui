// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility (bg-zen-*, text-zen-*, …) is
// evaluated, otherwise those classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "virtual:uno.css";

export { Button, buttonVariants } from "./components/button/button";
export type { ButtonProps } from "./components/button/button";

export { Badge, badgeVariants } from "./components/badge/badge";
export type { BadgeProps } from "./components/badge/badge";

export { Icon, ZEN_ICON_NAMES } from "./components/icon/icon";
export type { IconProps, IconHandle, IconName } from "./components/icon/icon";

export { Accordion } from "./components/accordion/accordion";
export { Collapsible } from "./components/collapsible/collapsible";
export type { CollapsibleProps } from "./components/collapsible/collapsible";
export type { AccordionProps, AccordionItemSpec } from "./components/accordion/accordion";

export { Tabs, tabsListVariants, tabsTriggerVariants } from "./components/tabs/tabs";
export type { TabsProps, TabSpec } from "./components/tabs/tabs";

export { Dialog } from "./components/dialog/dialog";
export type { DialogProps, DialogHandle } from "./components/dialog/dialog";

export { NativeSelect, NATIVE_SELECT_CLASS } from "./components/form/native-select/native-select";
export type { NativeSelectProps, NativeSelectOption } from "./components/form/native-select/native-select";
export { Label } from "./components/form/label/label";
export type { LabelProps } from "./components/form/label/label";
export { Input, INPUT_CLASS } from "./components/form/input/input";
export type { InputProps, InputHandle } from "./components/form/input/input";
export { Search } from "./components/form/search/search";
export type { SearchProps, SearchSize, SearchHandle } from "./components/form/search/search";
export { PasswordInput } from "./components/form/password-input/password-input";
export type { PasswordInputProps, PasswordInputHandle } from "./components/form/password-input/password-input";

export { MaskInput } from "./components/form/mask-input/mask-input";
export type { MaskInputProps, MaskInputHandle, MaskRules } from "./components/form/mask-input/mask-input";

export { Select } from "./components/form/select/select";
export type { SelectProps, SelectOption } from "./components/form/select/select";

export { Combobox } from "./components/combobox/combobox";
export type { ComboboxProps, ComboboxOption } from "./components/combobox/combobox";
// TreeSelect (pick one node from a hierarchy; tree logic in core)
export { TreeSelect } from "./components/tree-select/tree-select";
export type { TreeSelectProps, TreeSelectNode } from "./components/tree-select/tree-select";
// LookupField (pick a row from a table of choices; search and ranking in core)
export { LookupField } from "./components/lookup-field/lookup-field";
export type { LookupFieldProps, LookupColumn } from "./components/lookup-field/lookup-field";

// ---- Wave A: display primitives ------------------------------------------
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants } from "./components/card/card";
export type { CardProps } from "./components/card/card";

export {
  Paper,
  PaperHeader,
  PaperTitle,
  PaperDescription,
  PaperContent,
  PaperFooter,
} from "./components/paper/paper";
export type { PaperProps } from "./components/paper/paper";

export { Alert, AlertIcon, AlertContent, AlertTitle, AlertDescription, AlertActions, alertVariants } from "./components/alert/alert";
export type { AlertProps } from "./components/alert/alert";

export { Avatar, AvatarImage, AvatarFallback, AvatarGroup } from "./components/avatar/avatar";
export type { AvatarProps, AvatarImageProps, AvatarGroupProps, AvatarSize } from "./components/avatar/avatar";

export { Skeleton } from "./components/skeleton/skeleton";
export type { SkeletonProps } from "./components/skeleton/skeleton";

export { Separator } from "./components/divider/divider";
export type { SeparatorProps } from "./components/divider/divider";

export { Stack } from "./components/stack/stack";
export type { StackProps } from "./components/stack/stack";
export { Theme } from "./components/theme/theme";
export type { ThemeProps } from "./components/theme/theme";
export { MessagePopover } from "./components/message-popover/message-popover";
export type { Message, MessageType, MessagePopoverProps } from "./components/message-popover/message-popover";
export { DirectionProvider } from "./components/direction/direction";
export type { Direction, DirectionProviderProps } from "./components/direction/direction";
export { LocaleProvider, useLocale, localeOf, withLocale, provideLocale } from "./components/locale/locale";
export type { LocaleProviderProps, LocaleSettings, LocaleContextValue, MessageKey, ZenMessages } from "./components/locale/locale";

export { StatCard } from "./components/stat-card/stat-card";
export type { StatCardProps, StatCardColor, StatCardTrend } from "./components/stat-card/stat-card";
export { Tile, TileGrid } from "./components/tile/tile";
export type { TileProps, TileGridProps } from "./components/tile/tile";

export { Progress } from "./components/progress/progress";
export type { ProgressProps, ProgressSize, ProgressColor } from "./components/progress/progress";

export { Link, linkVariants } from "./components/link/link";
export type { LinkProps } from "./components/link/link";

export { Loading, spinnerVariants } from "./components/loading/loading";
export type { LoadingProps } from "./components/loading/loading";

export { EmptyState, EmptyStateIcon, EmptyStateTitle, EmptyStateDescription, EmptyStateActions, emptyStateVariants } from "./components/empty-state/empty-state";
export type { EmptyStateProps } from "./components/empty-state/empty-state";

export { Banner, BannerIcon, BannerContent, BannerActions, bannerVariants } from "./components/banner/banner";
export type { BannerProps } from "./components/banner/banner";

export { FAB } from "./components/fab/fab";
export type { FABProps } from "./components/fab/fab";

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/breadcrumb/breadcrumb";
export type { BreadcrumbProps, BreadcrumbLinkProps, BreadcrumbSeparatorProps, BreadcrumbEllipsisProps } from "./components/breadcrumb/breadcrumb";
export { Page, Bar, BAR_DESIGN } from "./components/page/page";
export type { PageProps, BarProps } from "./components/page/page";
export { ObjectStatus, ObjectNumber, ObjectIdentifier, ObjectMarker, objectStatusVariants } from "./components/object/object";
export type { ObjectState, ObjectStatusProps, ObjectNumberProps, ObjectIdentifierProps, ObjectMarkerProps, ObjectMarkerType } from "./components/object/object";
export { Switch } from "./components/form/switch/switch";
export type { SwitchProps, SwitchSize } from "./components/form/switch/switch";
export { PageHeader } from "./components/page-header/page-header";
export type { PageHeaderProps } from "./components/page-header/page-header";
export { NumberField } from "./components/form/number-field/number-field";
export type { NumberFieldProps, NumberFieldHandle } from "./components/form/number-field/number-field";
// AmountField / QuantityField (locale-formatted amounts and quantities)
export { AmountField, QuantityField } from "./components/form/amount-field/amount-field";
export type { AmountFieldProps, QuantityFieldProps, AmountFieldHandle, QuantityFieldHandle } from "./components/form/amount-field/amount-field";
export { Textarea, TEXTAREA_CLASS } from "./components/form/input/textarea";
export type { TextareaProps, TextareaHandle } from "./components/form/input/textarea";
export { Slider } from "./components/form/slider/slider";
export type { SliderProps, SliderMark } from "./components/form/slider/slider";
export { Checkbox } from "./components/form/checkbox/checkbox";
export type { CheckboxProps, CheckboxSize, CheckedState, CheckboxHandle } from "./components/form/checkbox/checkbox";
export { PhoneInput } from "./components/form/phone-input/phone-input";
export type { PhoneInputProps, PhoneValue } from "./components/form/phone-input/phone-input";
export { TimePicker } from "./components/form/time-picker/time-picker";
export type { TimePickerProps, TimePickerHandle } from "./components/form/time-picker/time-picker";
export { RadioGroup, RadioGroupItem } from "./components/form/radio/radio-group";
export type { RadioGroupProps, RadioGroupItemProps, RadioSize } from "./components/form/radio/radio-group";
export { TagInput } from "./components/form/tag-input/tag-input";
export type { TagInputProps } from "./components/form/tag-input/tag-input";
export { Pagination, paginationRange } from "./components/pagination/pagination";
export type { PaginationProps } from "./components/pagination/pagination";
export { AlertDialog } from "./components/dialog/alert-dialog";
export type { AlertDialogProps, AlertDialogHandle } from "./components/dialog/alert-dialog";
export { Sheet, sheetContentVariants } from "./components/sheet/sheet";
export type { SheetProps, SheetHandle, SheetSide } from "./components/sheet/sheet";
export { InputOTP } from "./components/form/otp/otp";
export type { InputOTPProps } from "./components/form/otp/otp";
export { Popover } from "./components/popover/popover";
export type { PopoverProps, PopoverHandle, PopoverSide, PopoverAlign } from "./components/popover/popover";
export { Tooltip } from "./components/tooltip/tooltip";
export type { TooltipProps, TooltipSide, TooltipHandle } from "./components/tooltip/tooltip";
export { ToggleButton, SegmentedButton, SplitButton } from "./components/button/button-family";
export type { ToggleButtonProps, SegmentedButtonProps, SegmentedButtonItem, SplitButtonProps, SplitButtonMenuItem } from "./components/button/button-family";
export { NPS } from "./components/survey/nps";
export type { NPSProps } from "./components/survey/nps";
export { Tree } from "./components/tree/tree";
export type { TreeProps, TreeNode } from "./components/tree/tree";
export { Likert } from "./components/survey/likert";
export type { LikertProps, LikertOption } from "./components/survey/likert";
export { Rating } from "./components/survey/rating";
export type { RatingProps, RatingSize } from "./components/survey/rating";
export { ScrollArea, ScrollBar } from "./components/scroll-area/scroll-area";
export type { ScrollAreaProps, ScrollBarProps } from "./components/scroll-area/scroll-area";
export { Stepper } from "./components/stepper/stepper";
export type { StepperProps, StepperStep, StepStatus, StepperApi, StepperHandle, StepperNavigationOptions } from "./components/stepper/stepper";
export { Toolbar } from "./components/toolbar/toolbar";
export type { ToolbarProps, ToolbarAction } from "./components/toolbar/toolbar";

// DocumentTabs (Zen-shaped: a workspace's open documents; the panels are the app's)
export { DocumentTabs } from "./components/document-tabs/document-tabs";
export type { DocumentTabsProps, DocumentTab } from "./components/document-tabs/document-tabs";
export { Carousel } from "./components/carousel/carousel";
export type { CarouselProps } from "./components/carousel/carousel";

export { MediaTimeline } from "./components/media-timeline/media-timeline";
export type { MediaTimelineProps } from "./components/media-timeline/media-timeline";
export { Waveform } from "./components/waveform/waveform";
export type { WaveformProps } from "./components/waveform/waveform";
export { formatMediaTime, MIN_MEDIA_RANGE } from "@algorisys/zen-ui-core/media";
export type { MediaRange, MediaRangeMode, WaveformClip } from "@algorisys/zen-ui-core/media";
export { DropdownMenu } from "./components/dropdown-menu/dropdown-menu";
export type { DropdownMenuProps, DropdownMenuHandle, DropdownMenuItemSpec, DropdownMenuActionItem, DropdownMenuLabelItem, DropdownMenuSeparatorItem, DropdownMenuCheckboxItemSpec, DropdownMenuRadioGroupSpec, DropdownMenuRadioOption, DropdownMenuSubSpec, DropdownMenuSide, DropdownMenuAlign } from "./components/dropdown-menu/dropdown-menu";
export { ContextMenu } from "./components/context-menu/context-menu";
export type { ContextMenuProps, ContextMenuHandle } from "./components/context-menu/context-menu";
export { FileUpload } from "./components/file-upload/file-upload";
export type { FileUploadProps, FileRejection } from "./components/file-upload/file-upload";
export { ColorPicker, ColorPalette } from "./components/color-picker/color-picker";
export type { ColorPickerProps, ColorPaletteProps } from "./components/color-picker/color-picker";
export { MultiCombobox } from "./components/combobox/multi-combobox";
// ComboboxOption already re-exported from ./components/combobox/combobox above.
export type { MultiComboboxProps } from "./components/combobox/multi-combobox";
export { SkipToContent, SKIP_TO_CONTENT_CLASS } from "./components/skip-to-content/skip-to-content";
export type { SkipToContentProps, SkipToContentHandle } from "./components/skip-to-content/skip-to-content";
export { ShellBar } from "./components/shellbar/shellbar";
export type { ShellBarProps, ShellBarItem, ShellBarMenuItem, ShellBarProfile } from "./components/shellbar/shellbar";
export { SidebarProvider, Sidebar, SidebarHeader, SidebarHeaderLabel, SidebarMenuBadge, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger } from "./components/sidebar/sidebar";
export type { SidebarContextValue, SidebarProviderProps, SidebarProviderHandle, SidebarProps, SidebarHeaderProps, SidebarHeaderLabelProps, SidebarGroupLabelProps, SidebarMenuButtonProps, SidebarMenuSubProps, SidebarMenuSubButtonProps, SidebarTriggerProps } from "./components/sidebar/sidebar";

export { Calendar, DatePicker } from "./components/form/date-picker/date-picker";
export type { CalendarProps, CalendarMode, CalendarSelected, DateRange, DatePickerProps } from "./components/form/date-picker/date-picker";
// DateInput (a typed date in the locale's order; the calendar as a second way in)
export { DateInput, isTypedDate } from "./components/form/date-picker/date-input";
export type { DateInputProps, DateOrder } from "./components/form/date-picker/date-input";
export { NotificationsInbox } from "./components/notifications-inbox/notifications-inbox";
export type { NotificationsInboxProps, NotificationsInboxHandle, Notification } from "./components/notifications-inbox/notifications-inbox";
export { VirtualizedItems } from "./components/listbox/virtualized-items";
export type { VirtualizedItemsProps, VirtualizedItemsDenseProps, VirtualizedItemsSparseProps } from "./components/listbox/virtualized-items";
export { FilterBar } from "./components/filter-bar/filter-bar";
export type { FilterBarProps, FilterBarField } from "./components/filter-bar/filter-bar";
// FilterBuilder — nested AND/OR conditions as one plain object (core's filter model)
export { FilterBuilder } from "./components/filter-builder/filter-builder";
export type { FilterBuilderProps, FilterField, FilterGroup, FilterNode, FilterCondition, FilterOperator } from "./components/filter-builder/filter-builder";
export { FlexibleColumnLayout } from "./components/flexible-column-layout/flexible-column-layout";
export type { FlexibleColumnLayoutProps, FlexibleColumnLayoutType, FlexibleColumnName, FlexibleColumnLayoutChangeDetail } from "./components/flexible-column-layout/flexible-column-layout";
export { SelectDialog } from "./components/select-dialog/select-dialog";
export type { SelectDialogProps, SelectDialogItem, SelectDialogHandle } from "./components/select-dialog/select-dialog";
export { ValueHelp } from "./components/value-help/value-help";
export type { ValueHelpProps, ValueHelpItem, ValueHelpCondition, ValueHelpResult, ValueHelpOperator } from "./components/value-help/value-help";
export { DateTimePicker } from "./components/form/date-picker/date-time-picker";
export type { DateTimePickerProps, DateTimePickerHandle } from "./components/form/date-picker/date-time-picker";
export { DateRangePicker } from "./components/form/date-picker/date-range-picker";
// DateRange already re-exported from ./components/form/date-picker/date-picker above.
export type { DateRangePickerProps } from "./components/form/date-picker/date-range-picker";
export { DynamicPage, DynamicPageTitle, DynamicPageHeader, DynamicPageFooter } from "./components/dynamic-page/dynamic-page";
export type { DynamicPageProps, DynamicPageTitleProps, DynamicPageHeaderProps, DynamicPageFooterProps } from "./components/dynamic-page/dynamic-page";
export { ViewSettingsDialog } from "./components/view-settings/view-settings-dialog";
export type { ViewSettingsDialogProps, ViewSettingsDialogHandle, ViewSettingsItem, ViewSettingsFilterGroup, ViewSettingsValue } from "./components/view-settings/view-settings-dialog";
export { ViewManager } from "./components/view-manager/view-manager";
export type { ViewManagerProps, ViewManagerHandle, SavedView } from "./components/view-manager/view-manager";
export { SelectableCardGroup } from "./components/card/card.selectable";
export type { SelectableCardGroupProps, SelectableCardItemSpec } from "./components/card/card.selectable";
export { ObjectPageLayout } from "./components/object-page/object-page";
export type { ObjectPageLayoutProps, ObjectPageSection, ObjectPageSubSection } from "./components/object-page/object-page";
export { DynamicDateRange } from "./components/form/dynamic-date-range/dynamic-date-range";
export type { DynamicDateRangeProps } from "./components/form/dynamic-date-range/dynamic-date-range";
export { Toaster, toast, dismiss, ToastAction, toastVariants } from "./components/toast/toaster";
export type { ToastInput, ToastDescriptor, ToasterProps, ToastActionProps, ToastVariant } from "./components/toast/toaster";

export { RichText } from "./components/rich-text/rich-text";
export type { RichTextProps } from "./components/rich-text/rich-text";
export { Camera } from "./components/camera/camera";
export type { CameraProps, CameraHandle } from "./components/camera/camera";
export { QRScanner } from "./components/qr-scanner/qr-scanner";
export type { QRScannerProps, QRScannerScan } from "./components/qr-scanner/qr-scanner";
export { QRCode, Barcode } from "./components/barcode/barcode";
export type { QRCodeProps, BarcodeProps, BarcodeFormat, QrEcc } from "./components/barcode/barcode";
export { Map } from "./components/map/map";
export type { MapProps, MapMarker } from "./components/map/map";
export { Chart } from "./components/chart/chart";
export type { ChartProps, ChartSeries } from "./components/chart/chart";
export type { Slice } from "@algorisys/zen-ui-core/chart";
export { CHART_PALETTE } from "@algorisys/zen-ui-core/chart";
// DataTable per-column filter types (meta.filterVariant), shared with React and Solid.
export type {
  FilterVariant,
  TextOp,
  TextFilterValue,
  NumberOp,
  NumberFilterValue,
  NumberRangeFilterValue,
} from "@algorisys/zen-ui-core/column-filter";

// AnalyticChart (ECharts, optional peer dep, loaded on first chart)
export { AnalyticChart } from "./components/analytic-chart/analytic-chart";
export type { AnalyticChartProps } from "./components/analytic-chart/analytic-chart";
export {
  registerChartKind,
  getChartKind,
  chartKinds,
  selectionAt,
  makeFormatter,
  cartesianFrame,
  legendOf,
  seriesOf,
  toNumber,
} from "@algorisys/zen-ui-core/analytic-chart";
export type {
  AnalyticChartSpec,
  AnalyticSeries,
  ChartKind,
  ChartContext,
  ChartSelection,
  ChartTable,
  ChartTheme,
  ChartRow,
  ValueFormat,
  EChartsOption,
} from "@algorisys/zen-ui-core/analytic-chart";
export { DataTable } from "./components/data-table/data-table";
export {
  UrlDataTable,
  parseSortParam,
  serializeSortParam,
  parseFilterParam,
  serializeFilterParam,
} from "./components/url-data-table/url-data-table";
export type {
  UrlDataTableProps,
  UrlDataTableColumn,
  UrlDataTableFilter,
  UrlDataTableFilterOption,
  UrlDataTableParamNames,
} from "./components/url-data-table/url-data-table";

export { TreeTable } from "./components/tree-table/tree-table";
export {
  MicroLineChart,
  MicroBarChart,
  MicroBulletChart,
  MicroDeltaChart,
  MicroRadialChart,
} from "./components/micro-chart/micro-chart";
export { PlanningCalendar } from "./components/planning-calendar/planning-calendar";
export type { PlanningView } from "@algorisys/zen-ui-core/planning";
export type { PlanningCalendarProps, PlanningRow, PlanningAppointment, PlanningAppointmentState } from "./components/planning-calendar/planning-calendar";
export { Gantt } from "./components/gantt/gantt";
export type { GanttProps, GanttTask, GanttAssignee } from "./components/gantt/gantt";
export type {
  GanttAnchoredView,
  GanttBarAnchor,
  GanttCalendar,
  GanttCalendarException,
  GanttColumnUnit,
  GanttConnector,
  GanttDependency,
  GanttDependencyType,
  GanttRow,
  GanttSpan,
  GanttTaskNode,
  GanttPaneColumn,
  GanttSegmentOptions,
  GanttTaskStatus,
  GanttView,
  GanttWorkingPeriod,
  GanttFitOptions,
  GanttFlattenOptions,
} from "@algorisys/zen-ui-core/gantt";
export {
  GANTT_CALENDAR_24_7,
  GANTT_PANE_COLUMNS,
  ganttAddWorkingMs,
  ganttFitRange,
  ganttFitUnit,
  ganttIsWorking,
  ganttPaneColumns,
  ganttRangeColumns,
  ganttSpanLabel,
  ganttSubWorkingMs,
  ganttWorkingMs,
  ganttWorkingPeriodsOn,
  ganttWorkingSegments,
} from "@algorisys/zen-ui-core/gantt";
export { ProductionSchedule } from "./components/production-schedule/production-schedule";
export type {
  ProductionScheduleProps,
  ProductionResource,
  ProductionOperation,
  ProductionPaneColumn,
} from "./components/production-schedule/production-schedule";
export type {
  ProductionConflict,
  ProductionConflictKind,
  ProductionFlatten,
  ProductionFlattenOptions,
  ProductionLoadBucket,
  ProductionLoadOptions,
  ProductionOperationNode,
  ProductionPlacement,
  ProductionPlacementOptions,
  ProductionResourceNode,
  ProductionRow,
  ProductionSetupMatrix,
} from "@algorisys/zen-ui-core/production";
export {
  flattenProductionResources,
  packProductionLanes,
  productionConflicts,
  productionLoad,
  productionPeakLoad,
  productionPlacement,
  productionSequenceConflicts,
  productionSetupMinutes,
  productionSetupPlan,
} from "@algorisys/zen-ui-core/production";
export {
  productionReschedule,
  productionPlaceProposal,
  productionNextFreeStart,
  snapToMinutes,
  PRODUCTION_DRAG_TYPE,
} from "@algorisys/zen-ui-core/reschedule";
export { productionLateMs } from "@algorisys/zen-ui-core/production";
export { ScheduleBacklog } from "./components/schedule-backlog/schedule-backlog";
export type { BacklogItem, ScheduleBacklogProps } from "./components/schedule-backlog/schedule-backlog";
export { StatePill } from "./components/state-pill/state-pill";
export type { StatePillProps, StatePillSize } from "./components/state-pill/state-pill";
export {
  MACHINE_STATES,
  isAvailabilityLoss,
  isMachineState,
  machineStateCategory,
  machineStateMessageKey,
  machineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
export type {
  MachineState,
  MachineStateCategory,
  MachineStateTone,
} from "@algorisys/zen-ui-core/machine-state";
export { OeeGauge } from "./components/oee-gauge/oee-gauge";
export type { OeeGaugeProps, OeeGaugeSize } from "./components/oee-gauge/oee-gauge";
export { DEFAULT_OEE_BANDS, gaugeAngle, oeeBand, oeeFromCounts } from "@algorisys/zen-ui-core/oee";
export type { OeeBand, OeeBands, OeeFactors, OeeInputs, OeeResult } from "@algorisys/zen-ui-core/oee";
export { StateTimeline } from "./components/state-timeline/state-timeline";
export type { StateTimelineProps, StateTimelineSize } from "./components/state-timeline/state-timeline";
export {
  durationMessage,
  layoutStateTimeline,
  layoutTimelineEvents,
  stateTimelineTotals,
  timelineTicks,
} from "@algorisys/zen-ui-core/state-timeline";
export { AndonBoard, AndonTile } from "./components/andon/andon";
export type { AndonBoardProps, AndonItem, AndonTileProps } from "./components/andon/andon";
export {
  ANDON_TONE_ORDER,
  DEFAULT_ANDON_STALE_MS,
  andonShowsClock,
  boardFreshness,
  sortAndonTiles,
} from "@algorisys/zen-ui-core/andon";
export type { AndonSortable } from "@algorisys/zen-ui-core/andon";
export { ReasonCodePicker } from "./components/reason-code-picker/reason-code-picker";
export type { ReasonCodePickerProps } from "./components/reason-code-picker/reason-code-picker";
export { filterReasons, reasonCategories } from "@algorisys/zen-ui-core/reason-codes";
export type { ReasonCode } from "@algorisys/zen-ui-core/reason-codes";
export { ScanInput } from "./components/scan-input/scan-input";
export type { ScanInputProps, ScanSource } from "./components/scan-input/scan-input";
export { DEFAULT_SCAN_OPTIONS, classifyEntry, createScanBuffer } from "@algorisys/zen-ui-core/scan";
export type { KeyAt, ScanBuffer, ScanOptions } from "@algorisys/zen-ui-core/scan";
export { ProductionProgress } from "./components/production-progress/production-progress";
export type { ProductionProgressProps } from "./components/production-progress/production-progress";
export { productionProgress, segmentFill } from "@algorisys/zen-ui-core/production-progress";
export type { ProductionCounts, ProductionProgressResult } from "@algorisys/zen-ui-core/production-progress";
export { MeasurementInput } from "./components/measurement-input/measurement-input";
export type { MeasurementInputProps } from "./components/measurement-input/measurement-input";
export { judgeMeasurement, measurementScale } from "@algorisys/zen-ui-core/measurement";
export type { MeasurementJudgement, MeasurementScale, MeasurementSpec, MeasurementVerdict } from "@algorisys/zen-ui-core/measurement";
export { StepRunner } from "./components/step-runner/step-runner";
export type { StepRunnerProps, StepRunnerStep } from "./components/step-runner/step-runner";
export { canCompleteStep, stepRunnerState } from "@algorisys/zen-ui-core/step-runner";
export { LiveIndicator } from "./components/live-indicator/live-indicator";
export type { LiveIndicatorProps } from "./components/live-indicator/live-indicator";
export { liveState } from "@algorisys/zen-ui-core/live";
export { ShiftNavigator } from "./components/shift-navigator/shift-navigator";
export type { ShiftNavigatorProps } from "./components/shift-navigator/shift-navigator";
export {
  addPlantDays,
  nextShift,
  plantDayOf,
  previousShift,
  shiftAt,
  shiftWindow,
  wallClockToInstant,
} from "@algorisys/zen-ui-core/shifts";
export type { ShiftDef, ShiftRef, ShiftWindow } from "@algorisys/zen-ui-core/shifts";
export { PlannedVsActual } from "./components/planned-vs-actual/planned-vs-actual";
export type { PlannedVsActualProps } from "./components/planned-vs-actual/planned-vs-actual";
export { planAt, plannedVsActual, readingAt } from "@algorisys/zen-ui-core/planned-vs-actual";
export type { CountPoint, PlannedVsActualInput, PlannedVsActualResult } from "@algorisys/zen-ui-core/planned-vs-actual";
export { RateBars } from "./components/rate-bars/rate-bars";
export type { RateBarsProps } from "./components/rate-bars/rate-bars";
export { rateBuckets } from "@algorisys/zen-ui-core/rate-bars";
export type { RateBucket, RateBucketsInput } from "@algorisys/zen-ui-core/rate-bars";
export { LineCard } from "./components/line-card/line-card";
export type { LineCardProps } from "./components/line-card/line-card";
export { lineEta } from "@algorisys/zen-ui-core/line-eta";
export type { LineEta } from "@algorisys/zen-ui-core/line-eta";
export { CapacityHeatmap } from "./components/capacity-heatmap/capacity-heatmap";
export type { CapacityHeatmapProps } from "./components/capacity-heatmap/capacity-heatmap";
export { capacityCell, capacityGrid } from "@algorisys/zen-ui-core/capacity";
export type { CapacityCell, CapacityGrid, CapacityGridInput, CapacityStatus } from "@algorisys/zen-ui-core/capacity";
export { ColumnMapper } from "./components/column-mapper/column-mapper";
export type { ColumnMapperProps } from "./components/column-mapper/column-mapper";
export { autoMap, detectDelimiter, parseDelimited, parseImportDate, validateMapping } from "@algorisys/zen-ui-core/column-mapper";
export type { CellErrorKind, ColumnMapping, MapperField, MappingValidation } from "@algorisys/zen-ui-core/column-mapper";
export { GenealogyGraph } from "./components/genealogy-graph/genealogy-graph";
export type { GenealogyGraphProps, GenealogyNode } from "./components/genealogy-graph/genealogy-graph";
export { traceGenealogy } from "@algorisys/zen-ui-core/genealogy";
export type { GenealogyEdge, GenealogyNodeInput, GenealogyTrace } from "@algorisys/zen-ui-core/genealogy";
export { RoutingGraph } from "./components/routing-graph/routing-graph";
export type { RoutingGraphProps, RoutingStep, RoutingStepStatus } from "./components/routing-graph/routing-graph";
export { canAddLink, effectiveLinks, routingLayout, startableSteps, wouldCreateCycle } from "@algorisys/zen-ui-core/routing";
export type { LinkRefusal, RoutingLayout, RoutingLink, RoutingStepInput } from "@algorisys/zen-ui-core/routing";
export type { LiveState } from "@algorisys/zen-ui-core/live";
export type { StepBlock, StepDef, StepRecord, StepRecordStatus, StepRunnerState, StepRunStatus } from "@algorisys/zen-ui-core/step-runner";
export type {
  StateSegment,
  StateSegmentInput,
  StateTimelineWindow,
  TimelineEvent,
  TimelineEventInput,
  TimelineTicks,
} from "@algorisys/zen-ui-core/state-timeline";
export { productionCriticalPath } from "@algorisys/zen-ui-core/critical-path";
export type {
  ProductionCriticalPath,
  ProductionCriticalPathOptions,
  ProductionFloat,
} from "@algorisys/zen-ui-core/critical-path";
export type {
  ProductionMove,
  ProductionProposal,
  ProductionRescheduleOptions,
  ProductionShift,
} from "@algorisys/zen-ui-core/reschedule";
export { UploadCollection } from "./components/upload-collection/upload-collection";
export type { UploadCollectionProps, UploadItem, UploadStatus } from "./components/upload-collection/upload-collection";
export { Timeline } from "./components/timeline/timeline";
export type { TimelineProps, TimelineItem, TimelineState } from "./components/timeline/timeline";
export type {
  MicroChartColor,
  MicroChartBaseProps,
  MicroLineChartProps,
  MicroBarChartProps,
  MicroBulletChartProps,
  MicroDeltaChartProps,
  MicroRadialChartProps,
} from "./components/micro-chart/micro-chart";
export type {
  TreeTableProps,
  TreeTableColumn,
  TreeTableCellContext,
} from "./components/tree-table/tree-table";
export type { DataTableProps, DataTableColumn, DataTableColumnMeta, DataTableCellContext, DataTableMenuTarget, SortingColumn, SortingState, DataTableManualPagination } from "./components/data-table/data-table";
export type { CellEditPayload, EditVariant } from "./components/data-table/edit-cell";
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption } from "./components/data-table/table";
export type { TableProps } from "./components/data-table/table";
export { createForm, FormItem, FormLabel, FormDescription, FormMessage, FormField } from "./components/form-builder/form";
export type { ValidationMode, FormErrors, Validator, FormSchema, FormOptions, FieldState, FormController, FormItemProps, FormLabelProps, FormDescriptionProps, FormMessageProps, FieldApi, FormFieldConfig } from "./components/form-builder/form";
export { BoundInput, BoundTextarea, BoundSelect, BoundCheckbox, BoundSwitch, BoundRadioGroup, BoundSlider } from "./components/form-builder/bound-fields";
export type { BoundSelectOption, BoundInputProps, BoundTextareaProps, BoundSelectProps, BoundCheckboxProps, BoundSwitchProps, BoundRadioGroupProps, BoundSliderProps } from "./components/form-builder/bound-fields";
export { PivotWorkbench, PivotGrid, PivotDropZone, PivotFieldChip, PivotFilterMenu } from "./components/pivot/pivot";
export type { PivotWorkbenchProps, PivotGridProps, PivotDropZoneProps, PivotFieldChipProps, PivotFilterMenuProps } from "./components/pivot/pivot";


// ---- shared core re-exports (framework-agnostic public API, same as React) ----
export type { ColorOption } from "@algorisys/zen-ui-core/color";
export type { DateRangeValue, DateRangeOperator, ResolvedRange, OperatorMeta } from "@algorisys/zen-ui-core/date-range";
export { resolveDateRange, formatDateRangeValue, DATE_RANGE_OPERATORS, parseISODate, toISODate } from "@algorisys/zen-ui-core/date-range";
export {
  normalizeFilterSelection, isFilterActive, isValueSelected, hasActiveFilters,
  describeFilterSelection, describeMove, PIVOT_ZONES, PIVOT_AGGREGATIONS,
} from "@algorisys/zen-ui-core/pivot";
export type {
  PivotLayout, PivotField, PivotFieldType, PivotValueField, PivotZone, PivotAggregation,
  PivotFilters, PivotFilterSelection, PivotFilterOptionsBody, PivotMembersRequest,
  PivotMembersResult, PivotSort, SortDirection,
} from "@algorisys/zen-ui-core/pivot";


// Theme primitives from core (framework-agnostic; React re-exports the same via
// its lib/theme wrapper). No useTheme hook here — there is no framework to hook.
export { applyTheme, getInitialTheme, THEMES } from "@algorisys/zen-ui-core/theme";
export type { ThemeName, ThemeDescriptor } from "@algorisys/zen-ui-core/theme";
export { COUNTRY_CODES, COUNTRY_NAMES } from "./components/form/phone-input/phone-input.constants";

// The contract every component returns, exported because a consumer holding a
// component in a variable needs to be able to name its type.
export type { ZenComponent, Child, BaseProps } from "./lib/component";

export { cn } from "./lib/cn";

// ---- Assessment components, and the four that were Solid-only -------------
// Ported from React; the pure logic underneath each one is core's, shared.

export { TimerBadge, TestCountdownBar } from "./components/countdown/countdown";
export type { TimerBadgeProps, TestCountdownBarProps, CountdownCore, CountdownLevel } from "./components/countdown/countdown";
export {
  remainingMs, formatCountdown, countdownLevel, crossedThresholds, DEFAULT_COUNTDOWN_THRESHOLDS,
} from "@algorisys/zen-ui-core/countdown";

export { CodeEditor, IDEWindow, CODE_LANGUAGES } from "./components/code-editor/code-editor";
export type { CodeEditorProps, IDEWindowProps, CodeFile, CodeLanguage } from "./components/code-editor/code-editor";

export { SpreadsheetGrid, SheetCalculator } from "./components/spreadsheet-grid/spreadsheet-grid";
export type { SpreadsheetGridProps, SheetCalculatorProps } from "./components/spreadsheet-grid/spreadsheet-grid";
export {
  parseRef, formatRef, expandRange, evaluateFormula, formatCellValue, isCellError, CELL_ERRORS,
} from "@algorisys/zen-ui-core/spreadsheet";
export type { CellMap, CellValue, CellRef, CellFormat, CellError } from "@algorisys/zen-ui-core/spreadsheet";

export { ProctorStreamGrid, ProctorFlagOverlay } from "./components/proctor/proctor";
export type {
  ProctorStreamGridProps, ProctorFlagOverlayProps, ProctorParticipant, ProctorFlag, ProctorFlagLevel,
} from "./components/proctor/proctor";

export { ChunkUploader } from "./components/chunk-uploader/chunk-uploader";
export type { ChunkUploaderProps, ChunkMeta, ChunkUploadStatus } from "./components/chunk-uploader/chunk-uploader";
export {
  planChunks, shouldRetry, nextAttemptDelay, uploadProgress, DEFAULT_CHUNK_SIZE, DEFAULT_MAX_ATTEMPTS,
} from "@algorisys/zen-ui-core/chunk-upload";
export type { ChunkPlanItem } from "@algorisys/zen-ui-core/chunk-upload";

export {
  DiagramCanvas, ArchitectureDraw, DEFAULT_DIAGRAM_EMBED_URL, DEFAULT_YAPPYDRAW_EMBED_URL,
} from "./components/diagram-canvas/diagram-canvas";
export type { DiagramCanvasProps, ArchitectureDrawProps, DiagramProvider } from "./components/diagram-canvas/diagram-canvas";

export { SortableList } from "./components/sortable-list/sortable-list";
export type { SortableListProps, SortableItemSpec } from "./components/sortable-list/sortable-list";
export {
  moveItem, reduceReorder, keyToReorderAction, DEFAULT_REORDER_ANNOUNCEMENTS,
} from "@algorisys/zen-ui-core/sortable";
export type {
  PickedUp, ReorderAction, ReorderIntent, ReorderResult, ReorderOrientation, ReorderAnnouncements,
} from "@algorisys/zen-ui-core/sortable";

export { Splitter } from "./components/splitter/splitter";
export type { SplitterProps, SplitterPanelSpec, SplitterOrientation } from "./components/splitter/splitter";
export {
  normalizeSizes, dragHandle, handleBounds, splitterKeyDelta, mirrorDelta,
  SPLITTER_STEP, SPLITTER_STEP_LARGE,
} from "@algorisys/zen-ui-core/splitter";
export type { SplitterPanelConstraint } from "@algorisys/zen-ui-core/splitter";

// Keyboard movement through rows and grid cells (DataTable's keyboard rows;
// any editable grid a consumer builds). Pure; shared by every binding.
export { rowKeyTarget, cellKeyTarget, ownsArrowKeys, ROW_PAGE_STEP } from "@algorisys/zen-ui-core/row-keys";
export type { GridCell } from "@algorisys/zen-ui-core/row-keys";

export { DocumentViewer } from "./components/document-viewer/document-viewer";
export type { DocumentViewerProps } from "./components/document-viewer/document-viewer";
export {
  inferDocumentKind, clampZoom, zoomStep, normalizeRotation, fitScale,
  DOCUMENT_ZOOM_MIN, DOCUMENT_ZOOM_MAX,
} from "@algorisys/zen-ui-core/document";
export type { DocumentKind, DocumentFit, DocumentSize } from "@algorisys/zen-ui-core/document";

export { DiffView } from "./components/diff-view/diff-view";
export type { DiffViewProps } from "./components/diff-view/diff-view";
export { computeDiff, parseSnapshot, isKeyed } from "@algorisys/zen-ui-core/diff";
export type { DiffRow, DiffKind, DiffOptions, DiffSnapshot } from "@algorisys/zen-ui-core/diff";
// Keyboard shortcuts: key caps, a registry with scopes, and the "?" overlay
export {
  ShortcutProvider,
  ShortcutHelp,
  Kbd,
  useShortcut,
  useShortcuts,
  keyshortcut,
  shortcutLabel,
  detectPlatform,
} from "./components/shortcuts/shortcuts";
export type {
  ShortcutOptions,
  ShortcutProviderProps,
  ShortcutHelpProps,
  ShortcutHelpGroup,
  ShortcutHelpHandle,
  KbdProps,
  ShortcutRegistry,
} from "./components/shortcuts/shortcuts";
