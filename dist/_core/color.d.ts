/**
 * Colour maths — framework-agnostic, so React and Solid cannot disagree about
 * what a colour is.
 *
 * Lives in core for the same reason the mask engine and the icon geometry do:
 * pure logic, no rendering, and a copy per binding is how the two drift.
 */
/** A swatch. A bare hex is allowed; `label` is how it gets announced. */
export interface ColorOption {
    value: string;
    /**
     * What a screen reader says. Without it the hex is read out, and "#3b82f6"
     * tells a listener nothing — which is the whole reason this exists.
     */
    label?: string;
}
export interface Rgb {
    r: number;
    g: number;
    b: number;
}
/**
 * "#abc" / "abc" / "#AABBCC" -> "#aabbcc". null when it is not a hex colour.
 *
 * Expanding the shorthand here rather than at each call site means every
 * comparison downstream is between two six-digit lowercase strings — "#FFF"
 * and "#ffffff" are the same colour and must not read as two swatches.
 */
export declare const normalizeHex: (value: string) => string | null;
export declare const isValidHex: (value: string) => boolean;
export declare const hexToRgb: (value: string) => Rgb | null;
export declare const rgbToHex: ({ r, g, b }: Rgb) => string;
/**
 * WCAG relative luminance. Not the naive (r+g+b)/3: the channels are weighted
 * because the eye is far more sensitive to green than blue, and each is
 * linearised first. Averaging picks white ink on colours you cannot read it on.
 */
export declare const luminance: (value: string) => number;
/**
 * Black or white — whichever is readable ON `value`.
 *
 * A selected swatch needs a tick drawn on it, and a fixed colour fails at one
 * end of the palette: white on yellow, black on navy. 0.179 is where the
 * contrast against black and against white cross over.
 */
export declare const contrastingInk: (value: string) => "#000000" | "#ffffff";
/** Accepts a bare hex or a {value,label}, so callers may pass either. */
export declare const toColorOption: (c: string | ColorOption) => ColorOption;
/** What a swatch is called: its label, or its hex if it was never named. */
export declare const colorLabel: (c: string | ColorOption) => string;
