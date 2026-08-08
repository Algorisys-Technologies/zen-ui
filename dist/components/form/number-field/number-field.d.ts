import * as React from "react";
/**
 * NumberField — shadcn-style. Number input with optional increment /
 * decrement stepper buttons. No Radix primitive needed — Radix has no
 * NumberField yet (slated, but not shipped).
 *
 *   <NumberField value={n} onValueChange={setN} min={0} max={100} step={1} />
 *
 * Forwards a ref to the underlying <input>. Buttons clamp to min/max,
 * disabled state propagates, keyboard arrows on the input still work
 * natively. Pass `step="any"` to disable stepper logic.
 */
export interface NumberFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type" | "onChange"> {
    value?: number | null;
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    /** Called with the new numeric value (or null when input is cleared). */
    onValueChange?: (value: number | null) => void;
}
declare const NumberField: React.ForwardRefExoticComponent<NumberFieldProps & React.RefAttributes<HTMLInputElement>>;
export { NumberField };
//# sourceMappingURL=number-field.d.ts.map