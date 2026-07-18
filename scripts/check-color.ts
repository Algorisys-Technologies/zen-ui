/**
 * Colour maths contract.
 *
 *   bun run check:color
 *
 * Pure logic shared by both bindings, so it is cheap to pin. The two that
 * matter: shorthand hex must normalise or "#FFF" and "#ffffff" read as two
 * different swatches, and the ink chosen for a selected swatch must be
 * readable ON it — a fixed tick colour fails at one end of every palette.
 */
import {
  normalizeHex,
  isValidHex,
  hexToRgb,
  rgbToHex,
  contrastingInk,
  colorLabel,
} from "../packages/core/src/color";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(44)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

console.log("\nnormalizeHex — one colour, one string");
t(normalizeHex("#aabbcc"), "#aabbcc", "already normal");
t(normalizeHex("#ABC"), "#aabbcc", "shorthand expands and lowercases");
t(normalizeHex("abc"), "#aabbcc", "the hash is optional");
t(normalizeHex("  #FFF  "), "#ffffff", "trims");
t(normalizeHex("#ffff"), null, "4 digits is not a colour");
t(normalizeHex("#gggggg"), null, "non-hex rejected");
t(normalizeHex(""), null, "empty rejected");
t(isValidHex("#3b82f6"), true, "isValidHex");
t(isValidHex("rgb(1,2,3)"), false, "isValidHex rejects rgb()");

console.log("\nhex <-> rgb round trip");
t(hexToRgb("#3b82f6"), { r: 59, g: 130, b: 246 }, "hexToRgb");
t(hexToRgb("#000"), { r: 0, g: 0, b: 0 }, "shorthand black");
t(hexToRgb("nope"), null, "invalid -> null");
t(rgbToHex({ r: 59, g: 130, b: 246 }), "#3b82f6", "rgbToHex");
t(rgbToHex({ r: 0, g: 0, b: 0 }), "#000000", "pads each channel");
t(rgbToHex({ r: 300, g: -5, b: 128 }), "#ff0080", "clamps out-of-range channels");
t(rgbToHex(hexToRgb("#7c3aed")!), "#7c3aed", "round trips");

console.log("\ncontrastingInk — readable ON the swatch");
t(contrastingInk("#ffffff"), "#000000", "black on white");
t(contrastingInk("#000000"), "#ffffff", "white on black");
t(contrastingInk("#facc15"), "#000000", "black on yellow — the case naive averaging fails");
t(contrastingInk("#1e3a8a"), "#ffffff", "white on navy");
t(contrastingInk("#00ff00"), "#000000", "green is bright: weighting matters");
t(contrastingInk("#0000ff"), "#ffffff", "blue is dark at the same 'average'");

console.log("\ncolorLabel — a hex is not an accessible name, but it beats nothing");
t(colorLabel({ value: "#3b82f6", label: "Ocean" }), "Ocean", "label wins");
t(colorLabel("#ABC"), "#aabbcc", "bare hex falls back to the normalised hex");

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
