// ============================================================================
// @algorisys/zen-ui-solid — public exports
// ============================================================================
// Side-effect CSS imports. Tokens must load before any UnoCSS utility
// (bg-zen-*, text-zen-*, …) is evaluated, otherwise those classes
// resolve to var(--zen-color-…) → empty.
import "@algorisys/zen-ui-core/tokens.css";
import "@algorisys/zen-ui-core/preflight.css";
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
export type { ButtonProps } from "./components/button/button";

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

export { Slider } from "./components/form/slider/slider";
export type { SliderProps } from "./components/form/slider/slider";

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
export type { VirtualizedItemsProps } from "./components/listbox/virtualized-items";

export { Combobox } from "./components/combobox/combobox";
export type { ComboboxProps, ComboboxOption } from "./components/combobox/combobox";
export { MultiCombobox } from "./components/combobox/multi-combobox";
export type { MultiComboboxProps } from "./components/combobox/multi-combobox";
