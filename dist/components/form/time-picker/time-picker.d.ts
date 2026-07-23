import { type JSX } from "solid-js";
/**
 * TimePicker — segmented HH:MM[:SS] input. 24h emitted regardless of
 * display format. Solid port — somewhat tighter than the React version
 * (skips the AM/PM toggle styled affordance; uses inline numeric inputs
 * with arrow-key step instead).
 */
type Format = "24h" | "12h";
export type TimePickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "id" | "aria-label"> & {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string | undefined) => void;
    format?: Format;
    showSeconds?: boolean;
    minuteStep?: number;
    disabled?: boolean;
    readOnly?: boolean;
    name?: string;
    id?: string;
    class?: string;
    "aria-label"?: string;
};
export declare const TimePicker: (rawProps: TimePickerProps) => JSX.Element;
export {};
//# sourceMappingURL=time-picker.d.ts.map