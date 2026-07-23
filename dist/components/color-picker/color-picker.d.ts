import { type ColorOption } from "@algorisys/zen-ui-core/color";
/**
 * ColorPicker — a swatch that opens a palette, a hex field and the platform's
 * own picker.
 *
 * The gradient area is the OS picker (`<input type="color">`) rather than a
 * hand-rolled saturation/value canvas: the native one is keyboard-accessible,
 * screen-reader-labelled, eyedropper-equipped and localised on every platform,
 * for free and with no dependency. `allowCustom={false}` removes it when a
 * brand palette is the whole point.
 *
 * Mirrors the React binding's API.
 */
export type ColorPickerProps = {
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
    class?: string;
};
export declare const ColorPicker: (props: ColorPickerProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=color-picker.d.ts.map