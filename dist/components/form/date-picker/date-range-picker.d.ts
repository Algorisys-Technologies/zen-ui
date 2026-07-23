import { type DateRange } from "./date-picker";
/**
 * DateRangePicker — Solid port. Trigger shows "From – To" summary, opens
 * a two-month calendar (default) in a Popover. Returns the same
 * `{ from?, to? }` shape as the React binding.
 *
 * The popover stays open while dates are selected. Use Done to apply and
 * close, or Cancel to discard changes.
 */
export type DateRangePickerProps = {
    value?: DateRange;
    defaultValue?: DateRange;
    onValueChange?: (range: DateRange | undefined) => void;
    placeholder?: string;
    disabled?: boolean | ((d: Date) => boolean);
    class?: string;
    numberOfMonths?: number;
    formatDate?: (date: Date) => string;
    /** Label for the cancel action in the popover footer. */
    cancelLabel?: string;
    /** Label for the apply action in the popover footer. */
    doneLabel?: string;
};
export declare const DateRangePicker: (rawProps: DateRangePickerProps) => import("solid-js").JSX.Element;
export type { DateRange };
//# sourceMappingURL=date-range-picker.d.ts.map