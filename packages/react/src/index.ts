// ============================================================================
// Component Exports
// ============================================================================
import "./index.css";
// Design tokens — public theming surface (override --zen-* CSS vars to retheme)
import "@algorisys/zen-ui-core/tokens.css";
// Minimal element reset that the shadcn-style utility classes depend on
// (UnoCSS preset-uno does not ship Tailwind v3's preflight)
import "@algorisys/zen-ui-core/preflight.css";
// Import UnoCSS generated styles for utility classes used in components
import "virtual:uno.css";
// Form Components - Input + Textarea (shadcn-style)
export { Input } from "./components/form/input/input";
export type { InputProps } from "./components/form/input/input";
export { Textarea } from "./components/form/input/textarea";
export type { TextareaProps } from "./components/form/input/textarea";
export { DEFAULT_EMAIL_DOMAINS } from "./components/form/input/input.constants";

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
export type { SliderProps } from "./components/form/slider/slider";

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
export { DataTable } from "./components/data-table/data-table";
export type {
  DataTableProps,
  DataTableManualPagination,
} from "./components/data-table/data-table";

// Listbox helpers (windowed rendering for large option lists)
export { VirtualizedItems } from "./components/listbox/virtualized-items";
export type { VirtualizedItemsProps } from "./components/listbox/virtualized-items";

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
