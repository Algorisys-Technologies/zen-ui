import * as React from "react";
import { type DayPickerProps } from "react-day-picker";
/**
 * Calendar — bare react-day-picker, styled. Use directly when you want an
 * inline calendar (no popover), or compose inside <DatePicker /> below.
 */
export type CalendarProps = DayPickerProps;
declare const Calendar: React.FC<CalendarProps>;
/**
 * DatePicker — date-input button that opens a Calendar inside a Popover.
 *
 *   const [date, setDate] = useState<Date | undefined>();
 *   <DatePicker value={date} onValueChange={setDate} />
 *
 * For range selection use Calendar directly with mode="range".
 */
export interface DatePickerProps {
    value?: Date;
    defaultValue?: Date;
    onValueChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean | DayPickerProps["disabled"];
    className?: string;
    /** Format displayed in the trigger. Defaults to toLocaleDateString(). */
    formatDate?: (date: Date) => string;
}
declare const DatePicker: React.FC<DatePickerProps>;
export { Calendar, DatePicker };
//# sourceMappingURL=date-picker.d.ts.map