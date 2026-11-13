import * as React from "react";
import { type DayPickerProps } from "react-day-picker";
/**
 * Calendar — bare react-day-picker, styled. Use directly when you want an
 * inline calendar (no popover), or compose inside <DatePicker /> below.
 *
 * Keys between days are react-day-picker's: ← → a day, ↑ ↓ a week, Home / End
 * the week's ends, PageUp / PageDown a month (Shift: a year), turning the page
 * when they cross it.
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
    /**
     * Where focus lands when the calendar opens. "first" (default, as before):
     * the first control, "Previous month". "selected": the chosen day (else
     * today), so the arrow keys move between days at once; the calendar then
     * opens on the chosen day's month. "selected" becomes the default in the
     * next major version.
     */
    initialFocus?: "first" | "selected";
}
declare const DatePicker: React.FC<DatePickerProps>;
/**
 * The day a calendar panel should open on: the chosen one, else today. The
 * cells react-day-picker marks, not a label, so it holds in any language.
 */
export declare const focusableDay: (panel: HTMLElement) => HTMLButtonElement | null;
export { Calendar, DatePicker };
//# sourceMappingURL=date-picker.d.ts.map