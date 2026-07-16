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
export type { AccordionProps, AccordionItemSpec } from "./components/accordion/accordion";

export { Tabs, tabsListVariants, tabsTriggerVariants } from "./components/tabs/tabs";
export type { TabsProps, TabSpec } from "./components/tabs/tabs";

export { Dialog } from "./components/dialog/dialog";
export type { DialogProps, DialogHandle } from "./components/dialog/dialog";

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

// ---- Wave A: display primitives ------------------------------------------
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants } from "./components/card/card";
export type { CardProps } from "./components/card/card";

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

export { StatCard } from "./components/stat-card/stat-card";
export type { StatCardProps, StatCardColor, StatCardTrend } from "./components/stat-card/stat-card";

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
export { Carousel } from "./components/carousel/carousel";
export type { CarouselProps } from "./components/carousel/carousel";
export { DropdownMenu } from "./components/dropdown-menu/dropdown-menu";
export type { DropdownMenuProps, DropdownMenuHandle, DropdownMenuItemSpec, DropdownMenuActionItem, DropdownMenuLabelItem, DropdownMenuSeparatorItem, DropdownMenuCheckboxItemSpec, DropdownMenuRadioGroupSpec, DropdownMenuRadioOption, DropdownMenuSubSpec, DropdownMenuSide, DropdownMenuAlign } from "./components/dropdown-menu/dropdown-menu";
export { FileUpload } from "./components/file-upload/file-upload";
export type { FileUploadProps, FileRejection } from "./components/file-upload/file-upload";
export { ColorPicker, ColorPalette } from "./components/color-picker/color-picker";
export type { ColorPickerProps, ColorPaletteProps } from "./components/color-picker/color-picker";
export { MultiCombobox } from "./components/combobox/multi-combobox";
// ComboboxOption already re-exported from ./components/combobox/combobox above.
export type { MultiComboboxProps } from "./components/combobox/multi-combobox";
export { ShellBar } from "./components/shellbar/shellbar";
export type { ShellBarProps, ShellBarItem, ShellBarMenuItem, ShellBarProfile } from "./components/shellbar/shellbar";
export { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, SidebarTrigger } from "./components/sidebar/sidebar";
export type { SidebarContextValue, SidebarProviderProps, SidebarProviderHandle, SidebarProps, SidebarGroupLabelProps, SidebarMenuButtonProps, SidebarMenuSubProps, SidebarMenuSubButtonProps, SidebarTriggerProps } from "./components/sidebar/sidebar";

export { Calendar, DatePicker } from "./components/form/date-picker/date-picker";
export type { CalendarProps, CalendarMode, CalendarSelected, DateRange, DatePickerProps } from "./components/form/date-picker/date-picker";
export { NotificationsInbox } from "./components/notifications-inbox/notifications-inbox";
export type { NotificationsInboxProps, NotificationsInboxHandle, Notification } from "./components/notifications-inbox/notifications-inbox";
export { VirtualizedItems } from "./components/listbox/virtualized-items";
export type { VirtualizedItemsProps, VirtualizedItemsDenseProps, VirtualizedItemsSparseProps } from "./components/listbox/virtualized-items";
export { FilterBar } from "./components/filter-bar/filter-bar";
export type { FilterBarProps, FilterBarField } from "./components/filter-bar/filter-bar";
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
export { Map } from "./components/map/map";
export type { MapProps, MapMarker } from "./components/map/map";
export { Chart } from "./components/chart/chart";
export type { ChartProps, ChartSeries } from "./components/chart/chart";
export type { Slice } from "@algorisys/zen-ui-core/chart";
export { CHART_PALETTE } from "@algorisys/zen-ui-core/chart";
export { DataTable } from "./components/data-table/data-table";
export type { DataTableProps, DataTableColumn, DataTableCellContext, SortingColumn, SortingState, DataTableManualPagination } from "./components/data-table/data-table";
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
