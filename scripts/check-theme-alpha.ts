/**
 * No opacity modifier on a theme colour.
 *
 *   bun run check:theme-alpha
 *
 * The theme maps every zen colour to a bare `var(--zen-color-*)`. UnoCSS cannot
 * apply an alpha to a value it cannot see inside, so it drops the modifier
 * without a word: `zen-bg-zen-muted/40` generates exactly what `zen-bg-zen-muted`
 * does, fully opaque. About 145 such classes sat in component source for
 * releases, every one of them reading as translucent and rendering solid; the
 * one that surfaced it was a Gantt's weekend shading covering a row's tint.
 *
 * Making `/NN` work in the preset would turn all of them translucent at once and
 * change apps that write their own `zen-` classes with this preset — a major. So
 * the classes were rewritten to what they always rendered, and this check keeps
 * the misleading form out. For real translucency use color-mix, which does
 * work:  zen-bg-[color-mix(in_srgb,var(--zen-color-muted)_40%,transparent)]
 *
 * It asks the GENERATOR rather than pattern-matching names: a class fails only
 * when its CSS is identical to the same class without the modifier. A colour the
 * theme ever defines as a literal (where `/NN` does work) passes untouched.
 * Pure: no build, no browser.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createGenerator, presetUno, type UserConfig } from "unocss";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "../packages/core/src/uno-preset";

const ROOTS = [
  "packages/core/src/variants.ts",
  ...["react", "solid", "vanilla", "web-components"].map((b) => `packages/${b}/src`),
];

const files = (path: string): string[] => {
  if (/\.tsx?$/.test(path)) return [path];
  return readdirSync(path, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(join(path, e.name))
      : /\.tsx?$/.test(e.name) && !e.name.endsWith(".d.ts")
        ? [join(path, e.name)]
        : [],
  );
};

// Any variant chain, an optional `!`/`-`, then zen-<utility>-zen-<token>/<alpha>.
const CANDIDATE = /(?:[\w-]+(?:\[[^\]\s]*\])?:)*!?-?zen-[a-z-]+-zen-[a-z0-9-]+\/(?:\d+|\[[^\]\s]+\])/g;

// Typed as UserConfig, as each binding's defineConfig() does — inferring the
// generic from the literal-typed theme makes presetUno's Theme incompatible.
const config: UserConfig = {
  presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
  theme: zenUnoTheme,
};
const uno = await createGenerator(config);

/** The rule body only, so the selector (which differs by name) does not count. */
const body = async (cls: string): Promise<string | null> => {
  const { css } = await uno.generate(cls, { preflights: false });
  const m = css.match(/\{([^}]*)\}/);
  return m ? m[1].trim() : null;
};

const found = new Map<string, string[]>();
let scanned = 0;
for (const root of ROOTS) {
  for (const file of files(root)) {
    scanned++;
    for (const cls of readFileSync(file, "utf8").match(CANDIDATE) ?? []) {
      const at = found.get(cls) ?? [];
      at.push(file);
      found.set(cls, at);
    }
  }
}

let fails = 0;
let generated = 0;
for (const [cls, at] of [...found].sort()) {
  const withAlpha = await body(cls);
  if (withAlpha === null) continue; // not a real utility (a comment, a typo) — nothing ships
  generated++;
  const without = await body(cls.replace(/\/(?:\d+|\[[^\]\s]+\])$/, ""));
  if (withAlpha === without) {
    fails++;
    const where = [...new Set(at)];
    console.log(`  FAIL ${cls.padEnd(44)} alpha ignored (${where.length} file${where.length > 1 ? "s" : ""}: ${where[0]}${where.length > 1 ? ", …" : ""})`);
  }
}

console.log(
  `\n${scanned} files scanned, ${found.size} theme-colour classes with a modifier, ${generated} of them real utilities.`,
);
if (scanned === 0) {
  console.log("nothing scanned — the roots moved; a pass here would be a zero-denominator green");
  process.exit(1);
}
if (fails > 0) {
  console.log(`\n${fails} FAILED — drop the /NN (it renders opaque anyway), or use color-mix for real translucency.`);
  process.exit(1);
}
console.log("all passed");
