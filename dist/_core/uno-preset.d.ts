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
export declare const ZEN_PREFIX = "zen-";
/**
 * UnoCSS `theme` block — wires the design tokens declared in
 * `@algorisys/zen-ui-core/tokens.css` into the utility theme so classes
 * like `bg-zen-primary`, `text-zen-primary-fg`, `ring-zen-ring` resolve
 * to `var(--zen-color-*)` and consumers can retheme by overriding those
 * vars.
 */
export declare const zenUnoTheme: {
    readonly colors: {
        readonly zen: {
            readonly primary: "var(--zen-color-primary)";
            readonly "primary-fg": "var(--zen-color-primary-fg)";
            readonly "primary-soft": "var(--zen-color-primary-soft)";
            readonly "primary-soft-fg": "var(--zen-color-primary-soft-fg)";
            readonly neutral: "var(--zen-color-neutral)";
            readonly "neutral-fg": "var(--zen-color-neutral-fg)";
            readonly "neutral-soft": "var(--zen-color-neutral-soft)";
            readonly "neutral-soft-fg": "var(--zen-color-neutral-soft-fg)";
            readonly info: "var(--zen-color-info)";
            readonly "info-fg": "var(--zen-color-info-fg)";
            readonly "info-soft": "var(--zen-color-info-soft)";
            readonly "info-soft-fg": "var(--zen-color-info-soft-fg)";
            readonly success: "var(--zen-color-success)";
            readonly "success-fg": "var(--zen-color-success-fg)";
            readonly "success-soft": "var(--zen-color-success-soft)";
            readonly "success-soft-fg": "var(--zen-color-success-soft-fg)";
            readonly warning: "var(--zen-color-warning)";
            readonly "warning-fg": "var(--zen-color-warning-fg)";
            readonly "warning-soft": "var(--zen-color-warning-soft)";
            readonly "warning-soft-fg": "var(--zen-color-warning-soft-fg)";
            readonly error: "var(--zen-color-error)";
            readonly "error-fg": "var(--zen-color-error-fg)";
            readonly "error-soft": "var(--zen-color-error-soft)";
            readonly "error-soft-fg": "var(--zen-color-error-soft-fg)";
            readonly background: "var(--zen-color-background)";
            readonly foreground: "var(--zen-color-foreground)";
            readonly muted: "var(--zen-color-muted)";
            readonly "muted-fg": "var(--zen-color-muted-fg)";
            readonly border: "var(--zen-color-border)";
            readonly ring: "var(--zen-color-ring)";
            readonly "accent-orange": "var(--zen-color-accent-orange)";
            readonly "accent-purple": "var(--zen-color-accent-purple)";
            readonly "accent-magenta": "var(--zen-color-accent-magenta)";
            readonly "accent-cream": "var(--zen-color-accent-cream)";
            readonly "accent-light-blue": "var(--zen-color-accent-light-blue)";
        };
    };
    readonly borderRadius: {
        readonly "zen-sm": "var(--zen-radius-sm)";
        readonly "zen-md": "var(--zen-radius-md)";
        readonly "zen-lg": "var(--zen-radius-lg)";
        readonly "zen-xl": "var(--zen-radius-xl)";
        readonly "zen-2xl": "var(--zen-radius-2xl)";
        readonly "zen-full": "var(--zen-radius-full)";
    };
    readonly boxShadow: {
        readonly "zen-xs": "var(--zen-shadow-xs)";
        readonly "zen-sm": "var(--zen-shadow-sm)";
        readonly "zen-md": "var(--zen-shadow-md)";
        readonly "zen-lg": "var(--zen-shadow-lg)";
        readonly "zen-xl": "var(--zen-shadow-xl)";
        readonly "zen-2xl": "var(--zen-shadow-2xl)";
    };
    readonly fontFamily: {
        readonly sans: "var(--zen-font-sans)";
        readonly serif: "var(--zen-font-serif)";
        readonly mono: "var(--zen-font-mono)";
    };
    readonly fontSize: {
        readonly xs: readonly ["var(--zen-font-size-xs)", "var(--zen-line-height-xs)"];
        readonly sm: readonly ["var(--zen-font-size-sm)", "var(--zen-line-height-sm)"];
        readonly base: readonly ["var(--zen-font-size-base)", "var(--zen-line-height-base)"];
        readonly lg: readonly ["var(--zen-font-size-lg)", "var(--zen-line-height-lg)"];
        readonly xl: readonly ["var(--zen-font-size-xl)", "var(--zen-line-height-xl)"];
        readonly "2xl": readonly ["var(--zen-font-size-2xl)", "var(--zen-line-height-2xl)"];
        readonly "3xl": readonly ["var(--zen-font-size-3xl)", "var(--zen-line-height-3xl)"];
        readonly "4xl": readonly ["var(--zen-font-size-4xl)", "var(--zen-line-height-4xl)"];
        readonly "5xl": readonly ["var(--zen-font-size-5xl)", "var(--zen-line-height-5xl)"];
    };
    readonly fontWeight: {
        readonly light: "var(--zen-font-weight-light)";
        readonly normal: "var(--zen-font-weight-normal)";
        readonly medium: "var(--zen-font-weight-medium)";
        readonly semibold: "var(--zen-font-weight-semibold)";
        readonly bold: "var(--zen-font-weight-bold)";
    };
    readonly duration: {
        readonly fast: "var(--zen-duration-fast)";
        readonly moderate: "var(--zen-duration-moderate)";
    };
    readonly easing: {
        readonly standard: "var(--zen-ease-standard)";
        readonly collapse: "var(--zen-ease-collapse)";
    };
};
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
export declare const ZEN_ANIMATIONS: Record<string, string>;
/** Structural mirror of UnoCSS's DynamicRule, declared here so core keeps its
 *  promise not to depend on unocss — the bindings own that dependency. */
type ZenRule = [RegExp, (match: RegExpMatchArray) => Record<string, string> | undefined];
/**
 * A preset rather than a `rules` entry in each binding's config, because
 * `presetUno({ prefix })` prefixes only ITS OWN rules — a config-level rule would
 * have to spell `zen-` into its own regex and could drift from ZEN_PREFIX.
 * `Preset.prefix` applies to every rule the preset declares.
 */
export declare const zenAnimationsPreset: {
    name: string;
    prefix: string;
    rules: ZenRule[];
};
export {};
