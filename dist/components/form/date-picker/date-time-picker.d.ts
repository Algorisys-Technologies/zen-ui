/**
 * DateTimePicker — Solid port. Combines a single-month Calendar with a
 * segmented TimePicker inside a Popover. Picking a day preserves the
 * current time-of-day; picking a time on an empty date defaults to
 * today at the selected time.
 */
type Format = "24h" | "12h";
export type DateTimePickerProps = {
    value?: Date;
    defaultValue?: Date;
    onValueChange?: (date: Date | undefined) => void;
    placeholder?: string;
    disabled?: boolean | ((d: Date) => boolean);
    class?: string;
    format?: Format;
    showSeconds?: boolean;
    minuteStep?: number;
    formatDate?: (date: Date) => string;
    formatTime?: (date: Date, format: Format) => string;
};
export declare const DateTimePicker: (rawProps: DateTimePickerProps) => import("solid-js").JSX.Element;
export {};
//# sourceMappingURL=date-time-picker.d.ts.map