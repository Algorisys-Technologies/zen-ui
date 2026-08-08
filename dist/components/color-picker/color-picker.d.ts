import * as React from "react";
import { type ColorOption } from "../../_core/color";
/**
 * ColorPicker — a swatch that opens a palette, a hex field and the platform's
 * own picker.
 *
 *   <ColorPicker value={brand} onValueChange={setBrand} />
 *   <ColorPicker colors={BRAND} allowCustom={false} />
 *
 * The gradient area is the OS picker (`<input type="color">`) rather than a
 * hand-rolled saturation/value canvas. That is a deliberate trade: the native
 * one is keyboard-accessible, screen-reader-labelled, eyedropper-equipped and
 * localised on every platform, for free and with no dependency. A canvas would
 * be a drag-maths reimplementation of all of it, worse. `allowCustom={false}`
 * removes it when a brand palette is the whole point.
 *
 * The hex field takes what people actually paste: "3b82f6", "#ABC", " #fff ".
 * It commits only a colour that parses, so the value can never be nonsense —
 * and it does not fight you while typing.
 */
export interface ColorPickerProps {
    value?: string;
    defaultValue?: string;
    onValueChange?: (hex: string) => void;
    /** The palette inside the popover. Omit for none. */
    colors?: (string | ColorOption)[];
    /** The hex field + the platform picker. Default true. */
    allowCustom?: boolean;
    /** Accessible name for the trigger. */
    label?: string;
    /** Text when nothing is chosen yet. */
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}
export declare const ColorPicker: React.FC<ColorPickerProps>;
//# sourceMappingURL=color-picker.d.ts.map