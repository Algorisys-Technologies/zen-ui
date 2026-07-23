/**
 * Calendar — custom month-grid built for the Solid binding (no
 * react-day-picker port exists). Single, multiple, and range selection
 * supported via `mode`. Keyboard nav: arrows move focus, Enter selects.
 *
 * For inline use, render <Calendar> directly. For the typical
 * popover-anchored picker, use <DatePicker>.
 */
export type CalendarMode = "single" | "multiple" | "range";
export type DateRange = {
    from?: Date;
    to?: Date;
};
export type CalendarProps = (CommonCalendarProps & {
    mode?: "single";
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
}) | (CommonCalendarProps & {
    mode: "multiple";
    selected?: Date[];
    onSelect?: (dates: Date[]) => void;
}) | (CommonCalendarProps & {
    mode: "range";
    selected?: DateRange;
    onSelect?: (range: DateRange | undefined) => void;
    numberOfMonths?: number;
});
interface CommonCalendarProps {
    /** Disable specific dates (or all when boolean true). */
    disabled?: boolean | ((d: Date) => boolean);
    /**
     * The month on screen, CONTROLLED. Pass it with `onMonthChange` to drive
     * navigation yourself — and to make the view follow a `selected` that moves to
     * another month, which it does not do on its own.
     */
    month?: Date;
    /** Called with the new month when the user navigates. */
    onMonthChange?: (month: Date) => void;
    /**
     * The month to open on, UNCONTROLLED. Read once. Defaults to the month of
     * `selected`, then to today.
     */
    defaultMonth?: Date;
    class?: string;
}
export declare const Calendar: (props: CalendarProps) => import("solid-js").JSX.Element;
export type DatePickerProps = {
    value?: Date;
    defaultValue?: Date;
    onValueChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean | ((d: Date) => boolean);
    class?: string;
    formatDate?: (date: Date) => string;
};
export declare const DatePicker: (rawProps: DatePickerProps) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=date-picker.d.ts.map