import * as React from "react";
import type { DayPickerProps } from "react-day-picker";
/**
 * DateTimePicker — date-input button that opens a Popover containing a
 * Calendar (above) and a TimePicker (below).
 *
 *   const [when, setWhen] = useState<Date | undefined>();
 *   <DateTimePicker value={when} onValueChange={setWhen} />
 *
 * The trigger label combines the formatted date and time. Picking a day
 * preserves the current time-of-day; picking a time on an empty date
 * defaults the date to today. Pass `format="12h"` to display AM/PM in
 * the time portion; the emitted Date is always a real `Date` object.
 */
type Format = "24h" | "12h";
export interface DateTimePickerProps {
    value?: Date;
    defaultValue?: Date;
    onValueChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean | DayPickerProps["disabled"];
    className?: string;
    /** "24h" (default) or "12h" — controls only the displayed time format. */
    format?: Format;
    /** Show seconds segment in the time picker. */
    showSeconds?: boolean;
    /** Minute stepping for ArrowUp/Down on the minutes segment. Default 1. */
    minuteStep?: number;
    /** Render the date portion of the trigger label. */
    formatDate?: (date: Date) => string;
    /** Render the time portion of the trigger label. */
    formatTime?: (date: Date, format: Format) => string;
}
declare const DateTimePicker: React.FC<DateTimePickerProps>;
export { DateTimePicker };
//# sourceMappingURL=date-time-picker.d.ts.map