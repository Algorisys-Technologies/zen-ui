import { type JSX } from "solid-js";
/**
 * NumberField — shadcn-style number input with optional stepper buttons.
 *
 *   <NumberField value={n()} onValueChange={setN} min={0} max={100} />
 *
 * Buttons clamp to min/max, disabled state propagates, native keyboard
 * arrows still work. Pass `step="any"` to disable stepper logic.
 */
export type NumberFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type" | "onChange" | "onInput"> & {
    value?: number | null;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    /** Called with the new numeric value (null when input is cleared). */
    onValueChange?: (value: number | null) => void;
};
export declare const NumberField: (props: NumberFieldProps) => JSX.Element;
//# sourceMappingURL=number-field.d.ts.map