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

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * "#abc" / "abc" / "#AABBCC" -> "#aabbcc". null when it is not a hex colour.
 *
 * Expanding the shorthand here rather than at each call site means every
 * comparison downstream is between two six-digit lowercase strings — "#FFF"
 * and "#ffffff" are the same colour and must not read as two swatches.
 */
export const normalizeHex = (value: string): string | null => {
  const m = HEX.exec(value.trim());
  if (!m) return null;
  const body = m[1].toLowerCase();
  const full = body.length === 3 ? [...body].map((c) => c + c).join("") : body;
  return `#${full}`;
};

export const isValidHex = (value: string): boolean => normalizeHex(value) !== null;

export const hexToRgb = (value: string): Rgb | null => {
  const hex = normalizeHex(value);
  if (!hex) return null;
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

export const rgbToHex = ({ r, g, b }: Rgb): string => {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, "0")).join("")}`;
};

/**
 * WCAG relative luminance. Not the naive (r+g+b)/3: the channels are weighted
 * because the eye is far more sensitive to green than blue, and each is
 * linearised first. Averaging picks white ink on colours you cannot read it on.
 */
export const luminance = (value: string): number => {
  const rgb = hexToRgb(value);
  if (!rgb) return 0;
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
};

/**
 * Black or white — whichever is readable ON `value`.
 *
 * A selected swatch needs a tick drawn on it, and a fixed colour fails at one
 * end of the palette: white on yellow, black on navy. 0.179 is where the
 * contrast against black and against white cross over.
 */
export const contrastingInk = (value: string): "#000000" | "#ffffff" =>
  luminance(value) > 0.179 ? "#000000" : "#ffffff";

/** Accepts a bare hex or a {value,label}, so callers may pass either. */
export const toColorOption = (c: string | ColorOption): ColorOption =>
  typeof c === "string" ? { value: c } : c;

/** What a swatch is called: its label, or its hex if it was never named. */
export const colorLabel = (c: string | ColorOption): string => {
  const o = toColorOption(c);
  return o.label ?? (normalizeHex(o.value) ?? o.value);
};
