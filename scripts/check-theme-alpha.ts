/**
 * Opacity modifiers on zen colours: `/40` must work, and nothing else may move.
 *
 *   bun run check:theme-alpha
 *
 * Every zen colour is a bare `var(--zen-color-*)`, which UnoCSS cannot fade, so
 * for releases `zen-bg-zen-muted/40` silently rendered solid. The fix has two
 * halves in core's uno-preset.ts (see `withAlpha`): theme colours carry UnoCSS's
 * `%alpha` placeholder, and a postprocess in `zenAnimationsPreset` folds the
 * no-alpha form back to the bare var. Either half alone is wrong — the first
 * would put a color-mix behind EVERY plain colour class in every app, and the
 * second does nothing — so this pins both:
 *
 *   1. every plain colour class is BYTE-IDENTICAL to what the old theme
 *      generated, checked against an oracle built from the old bare-var theme,
 *      for every zen colour across every colour utility;
 *   2. `/40` really fades — a color-mix at 0.4, of the right token;
 *   3. the postprocess drops only the opacity var it orphaned, not a
 *      standalone `zen-bg-opacity-100`.
 *
 * Pure: no build, no browser. The built stylesheets are compared separately
 * (they must be byte-identical before and after, since component source uses no
 * `/NN`); this is the contract that keeps the next edit from undoing it.
 */
import { createGenerator, presetUno, type UserConfig } from "unocss";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "../packages/core/src/uno-preset";

let fails = 0;
let checks = 0;
const ok = (pass: boolean, name: string, detail = "") => {
  checks++;
  if (!pass) fails++;
  if (!pass) console.log(`  FAIL ${name}${detail ? `\n       ${detail}` : ""}`);
};

// The oracle: the theme as it was, bare var()s, and no postprocess.
const WRAPPED = /^color-mix\(in srgb, (.*) calc\(%alpha \* 100%\), transparent\)$/;
const tokens = Object.entries(zenUnoTheme.colors.zen as Record<string, string>);
const bare: Record<string, string> = {};
for (const [name, value] of tokens) {
  const m = value.match(WRAPPED);
  ok(!!m, `theme colour "${name}" carries the %alpha placeholder`, value);
  bare[name] = m ? m[1] : value;
}

// Typed as UserConfig, as each binding's defineConfig() does — inferring the
// generic from the literal-typed theme makes presetUno's Theme incompatible.
const current: UserConfig = {
  presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
  theme: zenUnoTheme,
};
const oracle: UserConfig = {
  presets: [presetUno({ prefix: ZEN_PREFIX })],
  theme: { ...zenUnoTheme, colors: { zen: bare } },
};
const now = await createGenerator(current);
const was = await createGenerator(oracle);
const css = async (gen: typeof now, cls: string) => (await gen.generate(cls, { preflights: false })).css;

// Every utility that takes a colour.
const UTILITIES = [
  "bg", "text", "border", "border-t", "border-s", "ring", "ring-offset", "outline", "divide",
  "fill", "stroke", "shadow", "from", "via", "to", "decoration", "caret", "accent", "placeholder",
];

console.log("\n1. a plain colour class emits exactly what it always did\n");
let plain = 0;
for (const [name] of tokens) {
  for (const u of UTILITIES) {
    const cls = `zen-${u}-zen-${name}`;
    const a = await css(now, cls);
    const b = await css(was, cls);
    plain++;
    ok(a === b, `${cls} unchanged`, `now: ${a.trim()}\n       was: ${b.trim()}`);
    ok(!a.includes("color-mix"), `${cls} has no color-mix`, a.trim());
  }
}
console.log(`  ${plain} classes (${tokens.length} colours x ${UTILITIES.length} utilities) compared to the oracle`);

console.log("\n2. an opacity modifier really fades\n");
const faded = [
  ["zen-bg-zen-muted/40", "background-color", "var(--zen-color-muted)", "0.4"],
  ["zen-text-zen-muted-fg/60", "color", "var(--zen-color-muted-fg)", "0.6"],
  ["zen-border-zen-border/50", "border-color", "var(--zen-color-border)", "0.5"],
  ["hover:zen-bg-zen-primary-soft/30", "background-color", "var(--zen-color-primary-soft)", "0.3"],
  ["zen-ring-zen-primary/50", "--un-ring-color", "var(--zen-color-primary)", "0.5"],
  ["zen-bg-zen-muted/[0.33]", "background-color", "var(--zen-color-muted)", "0.33"],
  // The nested-fallback token: the one a generic regex would cut in half.
  ["zen-text-zen-warning-text/50", "color", "var(--zen-color-warning-text, var(--zen-color-warning))", "0.5"],
] as const;
for (const [cls, prop, token, alpha] of faded) {
  const out = await css(now, cls);
  const want = `${prop}:color-mix(in srgb, ${token} calc(${alpha} * 100%), transparent)`;
  ok(out.includes(want), `${cls} -> ${alpha}`, `want ${want}\n       got  ${out.trim()}`);
}
console.log(`  ${faded.length} modifiers checked`);

console.log("\n3. the postprocess removes only what it orphaned\n");
const standalone = await css(now, "zen-bg-opacity-100");
ok(standalone.includes("--un-bg-opacity:1"), "zen-bg-opacity-100 keeps --un-bg-opacity:1", standalone.trim());
const literal = await css(now, "zen-bg-[#123456]/40");
ok(literal === (await css(was, "zen-bg-[#123456]/40")), "a literal colour's /40 is untouched", literal.trim());

console.log(`\n${checks} assertions`);
if (checks === 0 || plain === 0) {
  console.log("nothing checked — a pass here would be a zero-denominator green");
  process.exit(1);
}
if (fails > 0) {
  console.log(`${fails} FAILED`);
  process.exit(1);
}
console.log("all passed");
