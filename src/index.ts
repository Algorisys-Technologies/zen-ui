// ============================================================================
// Component Exports
// ============================================================================
import "./index.css";
// Design tokens — public theming surface (override --zen-* CSS vars to retheme)
import "./styles/tokens.css";
// Minimal element reset that the shadcn-style utility classes depend on
// (UnoCSS preset-uno does not ship Tailwind v3's preflight)
import "./styles/preflight.css";
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

// Form Components - InputOTP (shadcn-style on top of input-otp)
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./components/form/otp/otp";

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
