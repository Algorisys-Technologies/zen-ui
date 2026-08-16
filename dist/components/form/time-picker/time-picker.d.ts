import * as React from "react";
/**
 * TimePicker — segmented numeric time input.
 *
 *   const [time, setTime] = useState<string | undefined>();      // "HH:MM" 24h
 *   <TimePicker value={time} onValueChange={setTime} />
 *
 * Segments behave like Apple / Google date-time inputs: type two digits,
 * focus auto-advances; arrow up/down increment with wrap; backspace clears.
 * The emitted value is ALWAYS 24-hour `HH:MM` (or `HH:MM:SS` with
 * `showSeconds`), regardless of the displayed 12h/24h format. A hidden
 * <input> mirrors the value so the picker submits inside native forms.
 */
type Format = "24h" | "12h";
export interface TimePickerProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string | undefined) => void;
    /** "24h" (default) or "12h" — controls what the user sees, not the emitted value. */
    format?: Format;
    /** Render seconds segment. Emitted value becomes "HH:MM:SS". */
    showSeconds?: boolean;
    /** Step in minutes for ArrowUp/Down on the minutes segment. Default 1. */
    minuteStep?: number;
    disabled?: boolean;
    readOnly?: boolean;
    /** Name for the hidden input so the value submits with native forms. */
    name?: string;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
}
declare const TimePicker: React.ForwardRefExoticComponent<TimePickerProps & React.RefAttributes<HTMLDivElement>>;
export { TimePicker };
//# sourceMappingURL=time-picker.d.ts.map