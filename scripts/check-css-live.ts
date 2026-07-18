/**
 * Every `zen-` utility a binding writes must actually generate CSS.
 *
 * This exists because twelve of them did not, and nothing noticed for the life of
 * the library. `zen-anim-accordion-down` and friends were hand-written classes in
 * tokens.css, and both bindings only ever used them as VARIANTS
 * (`data-[state=open]:zen-anim-accordion-down`) — 24 usages, zero bare. UnoCSS
 * cannot build a variant of a class it does not own, so it emitted nothing, the
 * plain rule in tokens.css never matched an element, and the accordion, the
 * Sheet's four slide directions and the fades had never animated in either
 * binding. `zen-transition-[grid-template-rows]` was the same shape: Uno has no
 * arbitrary-value form of `transition-*`, so DynamicPage's header collapsed
 * instantly while the comment beside it explained how it animated.
 *
 * That is the family this guards: a `zen-` class that resolves to no CSS fails
 * silently and looks exactly like one that works — correct spelling, real
 * keyframes, green build, and a screenshot that looks right because the bug is
 * only visible while the animation should be running. CLAUDE.md already warns
 * that "a class silently generated no CSS" has shipped here more than once. This
 * is that warning with teeth.
 *
 * It asks the real generator, through the same exports the bindings' uno.config.ts
 * files use, so it cannot quietly disagree with the build.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createGenerator, type UserConfig } from "@unocss/core";
import presetUno from "@unocss/preset-uno";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "../packages/core/src/uno-preset";

let f = 0;
const t = (ok: boolean, name: string, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : detail}`);
};

/**
 * `zen-`-prefixed names that are deliberately NOT utilities. Each is either a
 * marker a selector hunts for, or an identifier that merely shares the prefix.
 * They generate no CSS by design.
 *
 * Adding a name here is a claim that nothing styles it directly. Do not use it to
 * silence a utility that has stopped resolving — that is the bug this file exists
 * to catch.
 */
const NOT_UTILITIES = new Set([
  // Markers: a component stamps these on an element purely so another rule's
  // selector can find it.
  "zen-acc-chevron", // `[&[data-state=open]>svg.zen-acc-chevron]:zen-rotate-180`
  "zen-calendar", // react-day-picker slot hook
  "zen-otp-slot", // otp.css styles this directly
  "zen-sidebar-collapsed", // sidebar state hook
  // Uno's own anchors. They name a scope for `group-*` / `peer-*` variants and
  // intentionally emit nothing themselves. CLAUDE.md: "Anchors are prefixed too".
  "zen-group",
  "zen-peer",
  // Identifiers that merely start with the prefix: a theme name, a storage key,
  // the package/deploy slug.
  "zen-theme",
  "zen-ui",
  "zen-ui-theme",
]);

const walk = (dir: string, out: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(entry)) out.push(p);
  }
  return out;
};

/**
 * A token is one of ours when, after any variants, the utility itself starts with
 * the prefix: `zen-p-4`, `hover:zen-bg-zen-primary`, `-zen-mt-2`, `!zen-p-4`,
 * `data-[state=open]:zen-anim-accordion-down`.
 *
 * Deliberately NOT matched: `bg-zen-error` (a theme ALIAS with no utility prefix —
 * a different bug, and one that appears legitimately in JSDoc examples), and
 * `--zen-color-primary` (a custom property, not a class).
 */
const ZEN_UTILITY = /^(?:[^:\s]*:)*!?-?zen-/;

/**
 * Prose and identifiers that merely start with the prefix, rejected by SHAPE
 * rather than by name so the list cannot quietly become an allowlist for real
 * dead classes: a glob (`zen-text-*` in a demo title), a sentence ending on the
 * prefix ("Utilities are prefixed zen-."), a storage-key prefix (`zen-dt:`).
 * A real utility never ends on a separator and never contains `*`.
 */
const isProse = (tok: string) =>
  tok.includes("*") ||
  /[-.:,]$/.test(tok) ||
  // A template interpolation: `zen-acc-${++uid}` is an ID prefix, not a class.
  // This does hide a genuine footgun — a DYNAMIC class like `zen-p-${size}` can
  // never be extracted by Uno either, so it is dead — but this extractor cannot
  // tell an id string from a class string, and flagging every generated id is
  // noise that would get the whole check switched off.
  tok.includes("${");

/** Comments are stripped first: JSDoc usage examples are full of class strings
 *  that are documentation, not code, and flagging them is noise. */
const stripComments = (src: string) => src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/.*$/gm, "$1");

const classTokens = (file: string): Set<string> => {
  const src = stripComments(readFileSync(file, "utf8"));
  const found = new Set<string>();
  for (const m of src.matchAll(/["'`]([^"'`\n]*)["'`]/g)) {
    for (const raw of m[1].split(/\s+/)) {
      const tok = raw.trim();
      if (!tok || !ZEN_UTILITY.test(tok)) continue;
      if (isProse(tok) || NOT_UTILITIES.has(tok)) continue;
      found.add(tok);
    }
  }
  return found;
};

/**
 * The same expression each binding's uno.config.ts writes.
 *
 * The cast is real and worth explaining: `zenUnoTheme` is `as const`, so TS infers
 * the generator's Theme as that literal readonly shape, while `presetUno()` carries
 * its own `Theme`. UnoCSS's `Rule<Theme>` is invariant, so the two never unify. The
 * bindings get away with the identical expression only because **no tsconfig
 * includes uno.config.ts** — those files are typechecked by nothing. This script is
 * checked (scripts/tsconfig.json), so it has to say out loud what they hide.
 */
const makeUno = () =>
  createGenerator({
    presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
    theme: zenUnoTheme,
  } as unknown as UserConfig);

/**
 * vanilla is the binding this matters most for. Its components are plain .ts —
 * there is no JSX — and Uno's default scan list is every framework's template
 * extension, so on the default config NONE of its classes are emitted and the
 * whole binding renders unstyled with a green build.
 */
const BINDINGS = ["react", "solid", "vanilla"];

/**
 * core/src/variants.ts declares the shared Button/Badge variant tables, so its
 * classes are every binding's classes and belong in every binding's sweep.
 *
 * What this check CANNOT see, and what does cover it: it asks the generator
 * whether a class *can* resolve. It does not know which files a binding's
 * uno.config.ts actually scans. When the variants moved here, Uno's default
 * pipeline did not scan plain .ts and 13 rules silently vanished from the
 * published stylesheet — every token still resolved perfectly when asked, so this
 * file stayed green throughout. Only diffing the BUILT style.css caught it.
 * Treat that diff as the guard for "the build scans it", and this as the guard
 * for "the class exists at all".
 */
const SHARED = ["packages/core/src/variants.ts"];

for (const binding of BINDINGS) {
  console.log(`\n${binding}`);
  const tokens = new Set<string>();
  for (const file of [...walk(`packages/${binding}/src`), ...SHARED]) {
    for (const tok of classTokens(file)) tokens.add(tok);
  }

  // A floor, not a target: it catches the extractor silently matching nothing,
  // which is the failure mode that let `lint:solid` report "0 issues" for months
  // while ESLint was aborting on a missing config. vanilla is a 6-component slice
  // and legitimately has far fewer than the other two.
  t(tokens.size > 100, `${tokens.size} zen- utilities used in source`, `only ${tokens.size}`);

  const uno = await makeUno();
  const list = [...tokens];
  const { matched } = await uno.generate(new Set(list), { preflights: false });

  const dead = list.filter((tok) => !matched.has(tok)).sort();
  if (process.env.ZEN_CSS_LIVE_VERBOSE && dead.length) console.log("    dead:", dead.join("\n          "));
  t(
    dead.length === 0,
    "every zen- utility used generates CSS",
    dead.length ? `${dead.length} generate nothing: ${dead.slice(0, 6).join(", ")}${dead.length > 6 ? " …" : ""}` : "",
  );
}

/* The two regressions that prompted this, pinned by name so a refactor that
 * un-fixes them says so here rather than in a browser six months later. */
console.log("\nthe classes that were dead");
const uno = await makeUno();
const probes = [
  "zen-anim-accordion-down",
  "data-[state=open]:zen-anim-accordion-down", // React's vocabulary
  "data-[expanded]:zen-anim-accordion-down", // Solid's
  "data-[state=closed]:zen-anim-slide-out-right",
  "data-[closed]:zen-anim-fade-out",
  "zen-[transition-property:grid-template-rows]",
];
const { matched: hits } = await uno.generate(new Set(probes), { preflights: false });
for (const p of probes) t(hits.has(p), `${p} generates CSS`);

/* Negative control: if an unknown name also "generated CSS", every assertion
 * above would be matching everything and proving nothing. */
for (const bogus of ["zen-anim-not-a-real-animation", "zen-transition-[grid-template-rows]"]) {
  const { matched } = await uno.generate(new Set([bogus]), { preflights: false });
  t(!matched.has(bogus), `${bogus} correctly generates nothing`);
}

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
