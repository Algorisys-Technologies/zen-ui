import { type JSX } from "solid-js";
import { type ColorOption } from "@algorisys/zen-ui-core/color";
/**
 * ColorPalette — a grid of predefined swatches.
 *
 * Semantically a radiogroup, like Rating and Likert: "pick one of these" is the
 * same question whatever the options look like, so it gets the same keyboard
 * contract — arrows move, Home/End jump.
 *
 * Pass bare hex strings or {value,label}. A bare hex is announced AS its hex,
 * which is why `label` exists.
 *
 * The colour maths is shared via @algorisys/zen-ui-core/color, so this and the
 * React binding cannot disagree about what a colour is.
 *
 * Mirrors the React binding's API.
 */
export type ColorPaletteProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "class"> & {
    colors: (string | ColorOption)[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (hex: string) => void;
    /** The radiogroup's accessible name. */
    label?: string;
    /** Swatch size. Default "md". */
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    class?: string;
};
export declare const ColorPalette: (props: ColorPaletteProps) => JSX.Element;
//# sourceMappingURL=color-palette.d.ts.map