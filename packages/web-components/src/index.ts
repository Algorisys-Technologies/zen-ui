/**
 * @algorisys/zen-ui-web-components — native custom elements over the zen-ui core.
 *
 * The design work is done: each <zen-*> element wraps the matching vanilla
 * factory and mounts its DOM in the LIGHT dom, so the shared global zen-* / --zen-*
 * stylesheet styles it exactly as in the other bindings. See PORTING.md and
 * IMPLEMENT-web-components.md.
 *
 * This file re-exports the vanilla binding's ENTIRE public surface verbatim (the
 * factories, variant tables, pure-logic helpers and types), so a consumer can use
 * either the declarative elements or the imperative factories, and so check:parity
 * sees the same names it sees for vanilla. Importing this module also REGISTERS
 * every <zen-*> element as a side effect (via "./elements").
 */

// Design tokens (defines --zen-color-* / --zen-radius-* / --zen-shadow-* per
// data-theme). MUST load before any UnoCSS utility is evaluated, else those
// classes resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "virtual:uno.css";

// Side effect: define every <zen-*> custom element.
import "./elements";

export {
  Accordion, Alert, AlertActions, AlertContent, AlertDescription, AlertDialog, AlertIcon,
  AlertTitle, Avatar, AvatarFallback, AvatarGroup, AvatarImage, BAR_DESIGN, Badge, Banner,
  BannerActions, BannerContent, BannerIcon, Bar, BoundCheckbox, BoundInput, BoundRadioGroup,
  BoundSelect, BoundSlider, BoundSwitch, BoundTextarea, Breadcrumb, BreadcrumbEllipsis,
  BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Button,
  CHART_PALETTE, COUNTRY_CODES, COUNTRY_NAMES, Calendar, Camera, Card, CardContent,
  CardDescription, CardFooter, CardHeader, CardTitle, Carousel, Chart, Checkbox, ColorPalette,
  MIN_MEDIA_RANGE, MediaTimeline, Waveform, formatMediaTime,
  ColorPicker, Combobox, DATE_RANGE_OPERATORS, DataTable, DatePicker, DateRangePicker,
  DateTimePicker, Dialog, DropdownMenu, DynamicDateRange, DynamicPage, DynamicPageFooter,
  DynamicPageHeader, DynamicPageTitle, EmptyState, EmptyStateActions, EmptyStateDescription,
  EmptyStateIcon, EmptyStateTitle, FAB, FileUpload, FilterBar, FlexibleColumnLayout,
  FormDescription, FormField, FormItem, FormLabel, FormMessage, INPUT_CLASS, Icon, Input,
  InputOTP, Likert, Link, Loading, Map, MaskInput, MultiCombobox, NPS, NotificationsInbox,
  NumberField, ObjectIdentifier, ObjectMarker, ObjectNumber, ObjectPageLayout, ObjectStatus,
  PIVOT_AGGREGATIONS, PIVOT_ZONES, Page, PageHeader, Pagination, PasswordInput, PhoneInput,
  PivotDropZone, PivotFieldChip, PivotFilterMenu, PivotGrid, PivotWorkbench, Popover, Progress,
  QRScanner, RadioGroup, RadioGroupItem, Rating, RichText, SKIP_TO_CONTENT_CLASS, ScrollArea,
  ScrollBar, Search, SegmentedButton, Select, SelectDialog, SelectableCardGroup, Separator,
  Sheet, ShellBar, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub,
  SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarTrigger, Skeleton,
  SkipToContent, Slider, SplitButton, Stack, StatCard, Stepper, Switch, TEXTAREA_CLASS, THEMES,
  Theme, DirectionProvider, MessagePopover,
  Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, Tabs,
  TagInput, Textarea, TimePicker, ToastAction, Toaster, MicroBarChart, MicroBulletChart, MicroDeltaChart, MicroLineChart, MicroRadialChart, Timeline, UploadCollection, PlanningCalendar,
  ToggleButton, Toolbar, Tooltip, Tree, TreeTable,
  ValueHelp, ViewSettingsDialog, VirtualizedItems, ZEN_ICON_NAMES, alertVariants, applyTheme,
  badgeVariants, bannerVariants, buttonVariants, cardVariants, cn, createForm,
  describeFilterSelection, describeMove, dismiss, emptyStateVariants, formatDateRangeValue,
  getInitialTheme, hasActiveFilters, isFilterActive, isValueSelected, linkVariants,
  normalizeFilterSelection, objectStatusVariants, paginationRange, parseISODate,
  resolveDateRange, sheetContentVariants, spinnerVariants, tabsListVariants, tabsTriggerVariants,
  toISODate, toast, toastVariants,
} from "@algorisys/zen-ui-vanilla";

export type {
  AccordionItemSpec, AccordionProps, AlertDialogHandle, AlertDialogProps, AlertProps,
  AvatarGroupProps, AvatarImageProps, AvatarProps, AvatarSize, BadgeProps, BannerProps, BarProps,
  BaseProps, BoundCheckboxProps, BoundInputProps, BoundRadioGroupProps, BoundSelectOption,
  BoundSelectProps, BoundSliderProps, BoundSwitchProps, BoundTextareaProps,
  BreadcrumbEllipsisProps, BreadcrumbLinkProps, BreadcrumbProps, BreadcrumbSeparatorProps,
  ButtonProps, CalendarMode, CalendarProps, CalendarSelected, CameraHandle, CameraProps,
  CardProps, CarouselProps, ChartProps, ChartSeries, CheckboxHandle, CheckboxProps, CheckboxSize,
  MediaRange, MediaRangeMode, MediaTimelineProps, WaveformClip, WaveformProps,
  CheckedState, Child, ColorOption, ColorPaletteProps, ColorPickerProps, ComboboxOption,
  ComboboxProps, DataTableCellContext, DataTableColumn, DataTableManualPagination,
  DataTableProps, DatePickerProps, DateRange, DateRangeOperator, DateRangePickerProps,
  DateRangeValue, DateTimePickerHandle, DateTimePickerProps, DialogHandle, DialogProps,
  DropdownMenuActionItem, DropdownMenuAlign, DropdownMenuCheckboxItemSpec, DropdownMenuHandle,
  DropdownMenuItemSpec, DropdownMenuLabelItem, DropdownMenuProps, DropdownMenuRadioGroupSpec,
  DropdownMenuRadioOption, DropdownMenuSeparatorItem, DropdownMenuSide, DropdownMenuSubSpec,
  DynamicDateRangeProps, DynamicPageFooterProps, DynamicPageHeaderProps, DynamicPageProps,
  DynamicPageTitleProps, EmptyStateProps, FABProps, FieldApi, FieldState, FileRejection,
  FileUploadProps, FilterBarField, FilterBarProps, FlexibleColumnLayoutChangeDetail,
  FlexibleColumnLayoutProps, FlexibleColumnLayoutType, FlexibleColumnName, FormController,
  FormDescriptionProps, FormErrors, FormFieldConfig, FormItemProps, FormLabelProps,
  FormMessageProps, FormOptions, FormSchema, IconHandle, IconName, IconProps, InputHandle,
  InputOTPProps, InputProps, LikertOption, LikertProps, LinkProps, LoadingProps, MapMarker,
  MapProps, MaskInputHandle, MaskInputProps, MaskRules, MultiComboboxProps, NPSProps,
  Notification, NotificationsInboxHandle, NotificationsInboxProps, NumberFieldHandle,
  NumberFieldProps, ObjectIdentifierProps, ObjectMarkerProps, ObjectMarkerType,
  ObjectNumberProps, ObjectPageLayoutProps, ObjectPageSection, ObjectPageSubSection, ObjectState,
  ObjectStatusProps, OperatorMeta, PageHeaderProps, PageProps, PaginationProps,
  PasswordInputHandle, PasswordInputProps, PhoneInputProps, PhoneValue, PivotAggregation,
  PivotDropZoneProps, PivotField, PivotFieldChipProps, PivotFieldType, PivotFilterMenuProps,
  PivotFilterOptionsBody, PivotFilterSelection, PivotFilters, PivotGridProps, PivotLayout,
  PivotMembersRequest, PivotMembersResult, PivotSort, PivotValueField, PivotWorkbenchProps,
  PivotZone, PopoverAlign, PopoverHandle, PopoverProps, PopoverSide, ProgressColor,
  ProgressProps, ProgressSize, QRScannerProps, QRScannerScan, RadioGroupItemProps,
  RadioGroupProps, RadioSize, RatingProps, RatingSize, ResolvedRange, RichTextProps,
  ScrollAreaProps, ScrollBarProps, SearchHandle, SearchProps, SearchSize, SegmentedButtonItem,
  SegmentedButtonProps, SelectDialogHandle, SelectDialogItem, SelectDialogProps, SelectOption,
  SelectProps, SelectableCardGroupProps, SelectableCardItemSpec, SeparatorProps, SheetHandle,
  SheetProps, SheetSide, ShellBarItem, ShellBarMenuItem, ShellBarProfile, ShellBarProps,
  SidebarContextValue, SidebarGroupLabelProps, SidebarMenuButtonProps, SidebarMenuSubButtonProps,
  SidebarMenuSubProps, SidebarProps, SidebarProviderHandle, SidebarProviderProps,
  SidebarTriggerProps, SkeletonProps, SkipToContentHandle, SkipToContentProps, Slice, SliderMark,
  SliderProps, SortDirection, SortingColumn, SortingState, SplitButtonMenuItem, SplitButtonProps,
  StackProps, StatCardColor, StatCardProps, StatCardTrend, StepStatus, StepperApi, StepperHandle,
  StepperNavigationOptions, StepperProps, StepperStep, SwitchProps, SwitchSize, TabSpec,
  TableProps, TabsProps, TagInputProps, TextareaHandle, TextareaProps, ThemeDescriptor,
  ThemeProps, Direction, DirectionProviderProps, Message, MessageType, MessagePopoverProps,
  ThemeName, TimePickerHandle, TimePickerProps, ToastActionProps, ToastDescriptor, ToastInput,
  ToastVariant, ToasterProps, ToggleButtonProps, ToolbarAction, ToolbarProps, TooltipHandle,
  TooltipProps, TooltipSide, TreeNode, TreeProps, TreeTableCellContext, TreeTableColumn, TreeTableProps,
  MicroChartColor, MicroChartBaseProps, MicroLineChartProps, MicroBarChartProps,
  MicroBulletChartProps, MicroDeltaChartProps, MicroRadialChartProps,
  TimelineProps, TimelineItem, TimelineState,
  UploadCollectionProps, UploadItem, UploadStatus,
  PlanningCalendarProps, PlanningRow, PlanningAppointment, PlanningAppointmentState, PlanningView,
  ValidationMode, Validator, ValueHelpCondition,
  ValueHelpItem, ValueHelpOperator, ValueHelpProps, ValueHelpResult, ViewSettingsDialogHandle,
  ViewSettingsDialogProps, ViewSettingsFilterGroup, ViewSettingsItem, ViewSettingsValue,
  VirtualizedItemsDenseProps, VirtualizedItemsProps, VirtualizedItemsSparseProps, ZenComponent,
} from "@algorisys/zen-ui-vanilla";

// The custom-element layer's own surface.
export { defineZenElement } from "./lib/define";
export type { ElementDef, AttrType } from "./lib/define";
export { defineZenElements } from "./elements";
