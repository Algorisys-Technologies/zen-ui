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
export const zenUnoTheme = {
  colors: {
    zen: {
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
      error: "var(--zen-color-error)",
      "error-fg": "var(--zen-color-error-fg)",
      "error-soft": "var(--zen-color-error-soft)",
      "error-soft-fg": "var(--zen-color-error-soft-fg)",
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
    },
  },
  borderRadius: {
    "zen-sm": "var(--zen-radius-sm)",
    "zen-md": "var(--zen-radius-md)",
    "zen-lg": "var(--zen-radius-lg)",
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
  "accordion-down": "zen-accordion-down 200ms cubic-bezier(0.87, 0, 0.13, 1)",
  "accordion-up": "zen-accordion-up 200ms cubic-bezier(0.87, 0, 0.13, 1)",
  "fade-in": "zen-fade-in 200ms ease-out",
  "fade-out": "zen-fade-out 200ms ease-in",
  "slide-in-right": "zen-slide-in-right 250ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-out-right": "zen-slide-out-right 200ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-in-left": "zen-slide-in-left 250ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-out-left": "zen-slide-out-left 200ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-in-top": "zen-slide-in-top 250ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-out-top": "zen-slide-out-top 200ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-in-bottom": "zen-slide-in-bottom 250ms cubic-bezier(0.32, 0.72, 0, 1)",
  "slide-out-bottom": "zen-slide-out-bottom 200ms cubic-bezier(0.32, 0.72, 0, 1)",
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
export const zenAnimationsPreset = {
  name: "zen-animations",
  prefix: ZEN_PREFIX,
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
