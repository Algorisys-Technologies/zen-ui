import * as React from "react";
import type { DayPickerProps, DateRange } from "react-day-picker";
/**
 * DateRangePicker — pair-of-dates input. Trigger button shows a
 * "From – To" summary, opens a two-month Calendar in a Popover with
 * range selection enabled (`mode="range"` on react-day-picker).
 *
 *   const [range, setRange] = useState<DateRange | undefined>();
 *   <DateRangePicker value={range} onValueChange={setRange} />
 *
 * The popover stays open while dates are selected. Use Done to apply and
 * close, or Cancel to discard changes.
 *
 * Defaults to a 2-month side-by-side calendar (the conventional
 * range-picker layout from Airbnb / Booking patterns); override via
 * `numberOfMonths`.
 */
export interface DateRangePickerProps {
    value?: DateRange;
    defaultValue?: DateRange;
    onValueChange?: (range: DateRange | undefined) => void;
    placeholder?: string;
    disabled?: boolean | DayPickerProps["disabled"];
    className?: string;
    /** How many months to show side-by-side. Default 2. */
    numberOfMonths?: number;
    /** Format used in the trigger label for each side. Defaults to
     *  toLocaleDateString(). */
    formatDate?: (date: Date) => string;
    /** Label for the cancel action in the popover footer. */
    cancelLabel?: string;
    /** Label for the apply action in the popover footer. */
    doneLabel?: string;
}
export declare const DateRangePicker: React.FC<DateRangePickerProps>;
export type { DateRange };
//# sourceMappingURL=date-range-picker.d.ts.map