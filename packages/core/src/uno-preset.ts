/**
 * UnoCSS theme + prefix used by every zen-ui binding.
 *
 * Why this lives in core: the shared design tokens (--zen-color-*,
 * --zen-radius-*, --zen-shadow-*) apply identically regardless of which
 * framework the components are authored in. Each binding's uno.config.ts
 * assembles a defineConfig with these pieces + `presetUno()`, so the
 * binding (not core) owns the unocss dependency.
 */

/**
 * Utility prefix. Every generated class is emitted as `.zen-<util>` so the
 * library's CSS can never collide with a utility of the same name in the
 * consuming app. Without this, zen-ui's `.p-4` and Bootstrap's `.p-4`
 * (1.5rem) — or a custom Tailwind theme's `.p-4` — would fight, with the
 * winner decided by bundler CSS import order.
 *
 * Consumed by each binding's uno.config.ts as `presetUno({ prefix: ZEN_PREFIX })`
 * and by `cn()` via `extendTailwindMerge({ prefix: ZEN_PREFIX })`, so the two
 * must never drift apart.
 */
export const ZEN_PREFIX = "zen-";

/**
 * UnoCSS `theme` block — wires the design tokens declared in
 * `@algorisys/zen-ui-core/tokens.css` into the utility theme so classes
 * like `bg-zen-primary`, `text-zen-primary-fg`, `ring-zen-ring` resolve
 * to `var(--zen-color-*)` and consumers can retheme by overriding those
 * vars.
 */
const ZEN_DENSITY_SIZES = {
  "zen-control": "var(--zen-control-height)",
  "zen-head": "var(--zen-table-head-height)",
  "zen-anchor-bar": "var(--zen-anchor-bar-height)",
} as const;

const ZEN_DENSITY_SPACING = {
  ...ZEN_DENSITY_SIZES,
  "zen-control-x": "var(--zen-control-padding-x)",
  "zen-cell-y": "var(--zen-table-cell-padding-y)",
  "zen-section-x": "var(--zen-section-padding-x)",
  "zen-section-y": "var(--zen-section-padding-y)",
  "zen-bar-y": "var(--zen-bar-padding-y)",
  "zen-card": "var(--zen-card-padding)",
  "zen-menu-y": "var(--zen-menu-item-padding-y)",
} as const;

/**
 * Opacity modifiers on zen colours — `bg-zen-muted/40` — and why it takes two
 * halves. (Class names in these comments are written WITHOUT the zen- prefix on
 * purpose: vanilla's UnoCSS scans every .ts in its build, this file included,
 * comments and all, and a prefixed name here ships as a real rule.)
 *
 * Every zen colour is a bare `var(--zen-color-*)`, and UnoCSS cannot apply an
 * alpha to a value it cannot see inside, so for releases `/40` was dropped
 * without a word and the class rendered solid. A colour written with UnoCSS's
 * `%alpha` placeholder fixes that: `/40` becomes
 * `color-mix(in srgb, var(--zen-color-muted) calc(0.4 * 100%), transparent)`.
 *
 * But the placeholder also rewrites every PLAIN class — `bg-zen-muted` would
 * emit a color-mix through `var(--un-bg-opacity)` instead of the bare var. That
 * would make every zen colour in every app depend on color-mix support, and let
 * `bg-opacity-*` start fading zen colours, which it never did. So the second
 * half, ALPHA_POSTPROCESS below, folds a no-alpha color-mix straight back to the
 * value it wraps. Net effect: plain classes emit exactly the bytes they always
 * did, and only a class that asks for an alpha gets one.
 *
 * The two halves only work together, and `zenAnimationsPreset` carries the
 * second: a config using `zenUnoTheme` must include that preset (every binding,
 * the landing page and the documented consumer config do).
 */
const ZEN_COLOR_VALUES: string[] = [];
function withAlpha<T extends Record<string, string>>(colors: T): { [K in keyof T]: string } {
  const out = {} as { [K in keyof T]: string };
  for (const key of Object.keys(colors) as (keyof T)[]) {
    ZEN_COLOR_VALUES.push(colors[key]);
    out[key] = `color-mix(in srgb, ${colors[key]} calc(%alpha * 100%), transparent)`;
  }
  return out;
}

export const zenUnoTheme = {
  colors: {
    zen: withAlpha({
      primary: "var(--zen-color-primary)",
      "primary-fg": "var(--zen-color-primary-fg)",
      "primary-soft": "var(--zen-color-primary-soft)",
      "primary-soft-fg": "var(--zen-color-primary-soft-fg)",
      neutral: "var(--zen-color-neutral)",
      "neutral-fg": "var(--zen-color-neutral-fg)",
      "neutral-soft": "var(--zen-color-neutral-soft)",
      "neutral-soft-fg": "var(--zen-color-neutral-soft-fg)",
      info: "var(--zen-color-info)",
      "info-fg": "var(--zen-color-info-fg)",
      "info-soft": "var(--zen-color-info-soft)",
      "info-soft-fg": "var(--zen-color-info-soft-fg)",
      success: "var(--zen-color-success)",
      "success-fg": "var(--zen-color-success-fg)",
      "success-soft": "var(--zen-color-success-soft)",
      "success-soft-fg": "var(--zen-color-success-soft-fg)",
      warning: "var(--zen-color-warning)",
      "warning-fg": "var(--zen-color-warning-fg)",
      "warning-soft": "var(--zen-color-warning-soft)",
      "warning-soft-fg": "var(--zen-color-warning-soft-fg)",
      // Warning as TEXT. Falls back to the warning colour itself, so nothing
      // changes unless an app sets --zen-color-warning-text. That colour is
      // 1.77:1 on white, too faint to read: set it to soft-fg (5.23:1) with
      //   :root { --zen-color-warning-text: var(--zen-color-warning-soft-fg); }
      // The fallback is resolved where it is used (not at :root), so a nested
      // data-theme region keeps its own warning colour.
      "warning-text": "var(--zen-color-warning-text, var(--zen-color-warning))",
      error: "var(--zen-color-error)",
      "error-fg": "var(--zen-color-error-fg)",
      "error-soft": "var(--zen-color-error-soft)",
      "error-soft-fg": "var(--zen-color-error-soft-fg)",
      // Machine-state tones (tokens.css, core/src/machine-state.ts).
      "state-running": "var(--zen-state-running)",
      "state-running-soft": "var(--zen-state-running-soft)",
      "state-running-soft-fg": "var(--zen-state-running-soft-fg)",
      "state-down": "var(--zen-state-down)",
      "state-down-soft": "var(--zen-state-down-soft)",
      "state-down-soft-fg": "var(--zen-state-down-soft-fg)",
      "state-setup": "var(--zen-state-setup)",
      "state-setup-soft": "var(--zen-state-setup-soft)",
      "state-setup-soft-fg": "var(--zen-state-setup-soft-fg)",
      "state-planned": "var(--zen-state-planned)",
      "state-planned-soft": "var(--zen-state-planned-soft)",
      "state-planned-soft-fg": "var(--zen-state-planned-soft-fg)",
      "state-idle": "var(--zen-state-idle)",
      "state-idle-soft": "var(--zen-state-idle-soft)",
      "state-idle-soft-fg": "var(--zen-state-idle-soft-fg)",
      "state-unknown": "var(--zen-state-unknown)",
      "state-unknown-soft": "var(--zen-state-unknown-soft)",
      "state-unknown-soft-fg": "var(--zen-state-unknown-soft-fg)",
      background: "var(--zen-color-background)",
      foreground: "var(--zen-color-foreground)",
      muted: "var(--zen-color-muted)",
      "muted-fg": "var(--zen-color-muted-fg)",
      border: "var(--zen-color-border)",
      ring: "var(--zen-color-ring)",
      // Named accents — surface ad-hoc brand colours (badges, decorative
      // highlights). Defined in tokens.css; alias here so utility classes
      // like bg-zen-accent-magenta / text-zen-accent-purple resolve.
      "accent-orange": "var(--zen-color-accent-orange)",
      "accent-purple": "var(--zen-color-accent-purple)",
      "accent-magenta": "var(--zen-color-accent-magenta)",
      "accent-cream": "var(--zen-color-accent-cream)",
      "accent-light-blue": "var(--zen-color-accent-light-blue)",
    }),
  },
  borderRadius: {
    "zen-sm": "var(--zen-radius-sm)",
    "zen-md": "var(--zen-radius-md)",
    "zen-lg": "var(--zen-radius-lg)",
    "zen-xl": "var(--zen-radius-xl)",
    "zen-2xl": "var(--zen-radius-2xl)",
    "zen-full": "var(--zen-radius-full)",
  },
  boxShadow: {
    "zen-xs": "var(--zen-shadow-xs)",
    "zen-sm": "var(--zen-shadow-sm)",
    "zen-md": "var(--zen-shadow-md)",
    "zen-lg": "var(--zen-shadow-lg)",
    "zen-xl": "var(--zen-shadow-xl)",
    "zen-2xl": "var(--zen-shadow-2xl)",
  },
  // Type + motion. These OVERRIDE the matching keys in presetUno's theme with
  // `var(--zen-*)` indirection — UnoCSS deep-merges, so keys not listed here
  // (text-6xl…9xl, the numeric duration scale) keep their built-in literals.
  // The var values in tokens.css equal those literals, so every existing
  // `zen-text-*` / `zen-font-*` / `zen-anim-*` renders identically; what changes
  // is that a consumer can now retheme type and motion through `--zen-*`, which
  // they could not before (there were no type or motion tokens at all).
  fontFamily: {
    sans: "var(--zen-font-sans)",
    serif: "var(--zen-font-serif)",
    mono: "var(--zen-font-mono)",
  },
  // Density keys (tokens.css "Density"): `zen-h-zen-control`,
  // `zen-px-zen-control-x`, `zen-py-zen-cell-y`, … resolve to the density
  // tokens, so `data-density="compact"` reaches every component that uses them.
  // Heights read `height`/`minHeight`; padding reads `spacing`.
  spacing: ZEN_DENSITY_SPACING,
  height: ZEN_DENSITY_SIZES,
  minHeight: ZEN_DENSITY_SIZES,
  // `as [string, string]`: the theme ends in `as const`, which would make these
  // tuples readonly, and UnoCSS's Theme types them mutable, so a config typed
  // `defineConfig<Theme>` rejected the whole theme. Core stays free of unocss
  // types; the plain tuple is all that compatibility needs.
  fontSize: {
    xs: ["var(--zen-font-size-xs)", "var(--zen-line-height-xs)"] as [string, string],
    sm: ["var(--zen-font-size-sm)", "var(--zen-line-height-sm)"] as [string, string],
    base: ["var(--zen-font-size-base)", "var(--zen-line-height-base)"] as [string, string],
    lg: ["var(--zen-font-size-lg)", "var(--zen-line-height-lg)"] as [string, string],
    xl: ["var(--zen-font-size-xl)", "var(--zen-line-height-xl)"] as [string, string],
    "2xl": ["var(--zen-font-size-2xl)", "var(--zen-line-height-2xl)"] as [string, string],
    "3xl": ["var(--zen-font-size-3xl)", "var(--zen-line-height-3xl)"] as [string, string],
    "4xl": ["var(--zen-font-size-4xl)", "var(--zen-line-height-4xl)"] as [string, string],
    "5xl": ["var(--zen-font-size-5xl)", "var(--zen-line-height-5xl)"] as [string, string],
    // A table body cell (tokens.css: defaults to the sm pair).
    "zen-cell": ["var(--zen-table-cell-font-size)", "var(--zen-table-cell-line-height)"] as [string, string],
  },
  fontWeight: {
    light: "var(--zen-font-weight-light)",
    normal: "var(--zen-font-weight-normal)",
    medium: "var(--zen-font-weight-medium)",
    semibold: "var(--zen-font-weight-semibold)",
    bold: "var(--zen-font-weight-bold)",
  },
  // Named motion keys added ALONGSIDE the numeric duration scale (deep-merge),
  // so `zen-duration-fast` / `zen-ease-standard` are available to authors while
  // `zen-duration-150` (used by variants.ts) keeps working.
  duration: {
    fast: "var(--zen-duration-fast)",
    moderate: "var(--zen-duration-moderate)",
  },
  easing: {
    standard: "var(--zen-ease-standard)",
    collapse: "var(--zen-ease-collapse)",
  },
} as const;

/**
 * Animation utilities: `zen-anim-<name>` -> `animation: <name> <timing>`.
 *
 * These used to be hand-written classes in tokens.css, and every one of them was
 * dead. Both bindings only ever use them as VARIANTS
 * (`data-[state=open]:zen-anim-accordion-down`) — 24 usages across the two, zero
 * bare — and UnoCSS cannot generate a variant of a class it does not own. So Uno
 * emitted nothing for the variant, the plain `.zen-anim-*` rule in tokens.css
 * never matched anything, and the accordion, the Sheet's four slide directions
 * and the fades had never animated in either binding.
 *
 * Nothing could catch it. The class is spelled correctly, the keyframes are real,
 * the build is green, and a screenshot of an open accordion looks right — the bug
 * only exists during the 200ms nobody photographs. It is the `zen-animate-*` trap
 * documented in CLAUDE.md wearing the opposite face: that one is a hand-written
 * name Uno DOES own and fights over, this one is a name Uno does NOT own and so
 * silently declines to build.
 *
 * Making them real utilities is what allows a variant of them to exist at all.
 * The keyframes stay in tokens.css (CSS cannot be expressed in a theme); the
 * timings live here, so a name and its `@keyframes zen-<name>` are one edit apart.
 */
export const ZEN_ANIMATIONS: Record<string, string> = {
  "accordion-down": "zen-accordion-down var(--zen-duration-fast) var(--zen-ease-collapse)",
  "accordion-up": "zen-accordion-up var(--zen-duration-fast) var(--zen-ease-collapse)",
  "fade-in": "zen-fade-in var(--zen-duration-fast) var(--zen-ease-out)",
  "fade-out": "zen-fade-out var(--zen-duration-fast) var(--zen-ease-in)",
  "slide-in-right": "zen-slide-in-right var(--zen-duration-moderate) var(--zen-ease-standard)",
  "slide-out-right": "zen-slide-out-right var(--zen-duration-fast) var(--zen-ease-standard)",
  "slide-in-left": "zen-slide-in-left var(--zen-duration-moderate) var(--zen-ease-standard)",
  "slide-out-left": "zen-slide-out-left var(--zen-duration-fast) var(--zen-ease-standard)",
  "slide-in-top": "zen-slide-in-top var(--zen-duration-moderate) var(--zen-ease-standard)",
  "slide-out-top": "zen-slide-out-top var(--zen-duration-fast) var(--zen-ease-standard)",
  "slide-in-bottom": "zen-slide-in-bottom var(--zen-duration-moderate) var(--zen-ease-standard)",
  "slide-out-bottom": "zen-slide-out-bottom var(--zen-duration-fast) var(--zen-ease-standard)",
};

/** Structural mirror of UnoCSS's DynamicRule, declared here so core keeps its
 *  promise not to depend on unocss — the bindings own that dependency. */
type ZenRule = [RegExp, (match: RegExpMatchArray) => Record<string, string> | undefined];

/**
 * A preset rather than a `rules` entry in each binding's config, because
 * `presetUno({ prefix })` prefixes only ITS OWN rules — a config-level rule would
 * have to spell `zen-` into its own regex and could drift from ZEN_PREFIX.
 * `Preset.prefix` applies to every rule the preset declares.
 */
/** Structural mirror of UnoCSS's UtilObject — only the part postprocess touches. */
interface ZenUtil {
  // Uno's CSSEntry carries an optional third element (a selector override);
  // the rest spread keeps this assignable from it.
  entries: [string, string | number | undefined, ...unknown[]][];
}

/**
 * The second half of the opacity fix (see withAlpha). A colour with NO alpha
 * comes out of the placeholder as `color-mix(in srgb, V calc(<1 or an
 * --un-*-opacity var> * 100%), transparent)`; fold that back to `V`, and drop
 * the `--un-*-opacity: 1` that only it read. A real alpha (`calc(0.4 * 100%)`)
 * is left alone. Matched against the exact theme values, not a pattern of
 * them: `warning-text` nests a var() fallback that a generic regex would cut.
 */
const escapeRe = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const NO_ALPHA = new RegExp(
  `color-mix\\(in srgb, (${ZEN_COLOR_VALUES.map(escapeRe).join("|")}) calc\\((?:1|var\\(--un-[\\w-]+-opacity\\)) \\* 100%\\), transparent\\)`,
  "g",
);
const ALPHA_POSTPROCESS = (util: ZenUtil) => {
  let folded = false;
  for (const entry of util.entries) {
    if (typeof entry[1] !== "string" || !entry[1].includes("color-mix(")) continue;
    const next = entry[1].replace(NO_ALPHA, "$1");
    if (next !== entry[1]) {
      entry[1] = next;
      folded = true;
    }
  }
  if (!folded) return;
  // Drop the opacity vars nothing reads any more — only in a utility we just
  // folded: `bg-opacity-100` sets `--un-bg-opacity: 1` on its own, and that
  // one must survive. Repeated until stable, because the side-border utilities
  // CHAIN them (`--un-border-top-opacity: var(--un-border-opacity)`): removing
  // the outer one orphans the inner. check:theme-alpha caught exactly that.
  const isOpacityVar = (k: string) => /^--un-[\w-]+-opacity$/.test(k);
  for (let changed = true; changed; ) {
    changed = false;
    for (const [k] of util.entries) {
      if (!isOpacityVar(k)) continue;
      const readElsewhere = util.entries.some(([other, v]) => other !== k && String(v).includes(`var(${k})`));
      if (!readElsewhere) {
        util.entries = util.entries.filter(([other]) => other !== k);
        changed = true;
        break;
      }
    }
  }
};

export const zenAnimationsPreset = {
  name: "zen-animations",
  prefix: ZEN_PREFIX,
  // Not an animation: the opacity fix's second half rides on this preset because
  // every config that uses zenUnoTheme already includes it. See withAlpha.
  postprocess: [ALPHA_POSTPROCESS],
  rules: [
    [
      /^anim-(.+)$/,
      ([, name]) => {
        const animation = ZEN_ANIMATIONS[name];
        return animation ? { animation } : undefined;
      },
    ] as ZenRule,
  ],
};
