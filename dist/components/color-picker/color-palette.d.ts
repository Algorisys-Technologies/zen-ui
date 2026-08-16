import * as React from "react";
import { type ColorOption } from "../../_core/color";
/**
 * ColorPalette — a grid of predefined swatches.
 *
 *   <ColorPalette colors={["#3b82f6", "#ef4444"]} onValueChange={setBrand} />
 *   <ColorPalette colors={[{ value: "#3b82f6", label: "Ocean" }]} />
 *
 * Semantically a radiogroup, like Rating and Likert: "pick one of these" is
 * the same question whatever the options look like, so it gets the same
 * keyboard contract — arrows move, Home/End jump.
 *
 * Pass bare hex strings or {value,label}. A bare hex is announced AS its hex,
 * which is why `label` exists: "#3b82f6" tells a listener nothing.
 */
export interface ColorPaletteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    colors: (string | ColorOption)[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (hex: string) => void;
    /** The radiogroup's accessible name. */
    label?: string;
    /** Swatch size. Default "md". */
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    className?: string;
}
export declare const ColorPalette: React.ForwardRefExoticComponent<ColorPaletteProps & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=color-palette.d.ts.map