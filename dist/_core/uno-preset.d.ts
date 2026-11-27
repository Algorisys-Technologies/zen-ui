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
export declare const zenUnoTheme: {
    readonly colors: {
        readonly zen: {
            primary: string;
            "primary-fg": string;
            "primary-soft": string;
            "primary-soft-fg": string;
            neutral: string;
            "neutral-fg": string;
            "neutral-soft": string;
            "neutral-soft-fg": string;
            info: string;
            "info-fg": string;
            "info-soft": string;
            "info-soft-fg": string;
            success: string;
            "success-fg": string;
            "success-soft": string;
            "success-soft-fg": string;
            warning: string;
            "warning-fg": string;
            "warning-soft": string;
            "warning-soft-fg": string;
            "warning-text": string;
            error: string;
            "error-fg": string;
            "error-soft": string;
            "error-soft-fg": string;
            "state-running": string;
            "state-running-soft": string;
            "state-running-soft-fg": string;
            "state-down": string;
            "state-down-soft": string;
            "state-down-soft-fg": string;
            "state-setup": string;
            "state-setup-soft": string;
            "state-setup-soft-fg": string;
            "state-planned": string;
            "state-planned-soft": string;
            "state-planned-soft-fg": string;
            "state-idle": string;
            "state-idle-soft": string;
            "state-idle-soft-fg": string;
            "state-unknown": string;
            "state-unknown-soft": string;
            "state-unknown-soft-fg": string;
            background: string;
            foreground: string;
            muted: string;
            "muted-fg": string;
            border: string;
            ring: string;
            "accent-orange": string;
            "accent-purple": string;
            "accent-magenta": string;
            "accent-cream": string;
            "accent-light-blue": string;
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
    readonly spacing: {
        readonly "zen-control-x": "var(--zen-control-padding-x)";
        readonly "zen-cell-y": "var(--zen-table-cell-padding-y)";
        readonly "zen-section-x": "var(--zen-section-padding-x)";
        readonly "zen-section-y": "var(--zen-section-padding-y)";
        readonly "zen-bar-y": "var(--zen-bar-padding-y)";
        readonly "zen-card": "var(--zen-card-padding)";
        readonly "zen-menu-y": "var(--zen-menu-item-padding-y)";
        readonly "zen-control": "var(--zen-control-height)";
        readonly "zen-head": "var(--zen-table-head-height)";
        readonly "zen-anchor-bar": "var(--zen-anchor-bar-height)";
    };
    readonly height: {
        readonly "zen-control": "var(--zen-control-height)";
        readonly "zen-head": "var(--zen-table-head-height)";
        readonly "zen-anchor-bar": "var(--zen-anchor-bar-height)";
    };
    readonly minHeight: {
        readonly "zen-control": "var(--zen-control-height)";
        readonly "zen-head": "var(--zen-table-head-height)";
        readonly "zen-anchor-bar": "var(--zen-anchor-bar-height)";
    };
    readonly fontSize: {
        readonly xs: [string, string];
        readonly sm: [string, string];
        readonly base: [string, string];
        readonly lg: [string, string];
        readonly xl: [string, string];
        readonly "2xl": [string, string];
        readonly "3xl": [string, string];
        readonly "4xl": [string, string];
        readonly "5xl": [string, string];
        readonly "zen-cell": [string, string];
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
/** Structural mirror of UnoCSS's UtilObject — only the part postprocess touches. */
interface ZenUtil {
    entries: [string, string | number | undefined, ...unknown[]][];
}
export declare const zenAnimationsPreset: {
    name: string;
    prefix: string;
    postprocess: ((util: ZenUtil) => void)[];
    rules: ZenRule[];
};
export {};
