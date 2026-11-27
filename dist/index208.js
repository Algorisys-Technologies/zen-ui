const l = "zen-", o = {
  "zen-control": "var(--zen-control-height)",
  "zen-head": "var(--zen-table-head-height)",
  "zen-anchor-bar": "var(--zen-anchor-bar-height)"
}, t = {
  ...o,
  "zen-control-x": "var(--zen-control-padding-x)",
  "zen-cell-y": "var(--zen-table-cell-padding-y)",
  "zen-section-x": "var(--zen-section-padding-x)",
  "zen-section-y": "var(--zen-section-padding-y)",
  "zen-bar-y": "var(--zen-bar-padding-y)",
  "zen-card": "var(--zen-card-padding)",
  "zen-menu-y": "var(--zen-menu-item-padding-y)"
}, a = [];
function s(e) {
  const r = {};
  for (const n of Object.keys(e))
    a.push(e[n]), r[n] = `color-mix(in srgb, ${e[n]} calc(%alpha * 100%), transparent)`;
  return r;
}
const c = {
  colors: {
    zen: s({
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
      "accent-light-blue": "var(--zen-color-accent-light-blue)"
    })
  },
  borderRadius: {
    "zen-sm": "var(--zen-radius-sm)",
    "zen-md": "var(--zen-radius-md)",
    "zen-lg": "var(--zen-radius-lg)",
    "zen-xl": "var(--zen-radius-xl)",
    "zen-2xl": "var(--zen-radius-2xl)",
    "zen-full": "var(--zen-radius-full)"
  },
  boxShadow: {
    "zen-xs": "var(--zen-shadow-xs)",
    "zen-sm": "var(--zen-shadow-sm)",
    "zen-md": "var(--zen-shadow-md)",
    "zen-lg": "var(--zen-shadow-lg)",
    "zen-xl": "var(--zen-shadow-xl)",
    "zen-2xl": "var(--zen-shadow-2xl)"
  },
  // Density keys (tokens.css "Density"): `zen-h-zen-control`,
  // `zen-px-zen-control-x`, `zen-py-zen-cell-y`, … resolve to the density
  // tokens, so `data-density="compact"` reaches every component that uses them.
  // Heights read `height`/`minHeight`; padding reads `spacing`.
  spacing: t,
  // `as [string, string]`: the theme ends in `as const`, which would make these
  // tuples readonly, and UnoCSS's Theme types them mutable, so a config typed
  // `defineConfig<Theme>` rejected the whole theme. Core stays free of unocss
  // types; the plain tuple is all that compatibility needs.
  fontSize: {
    xs: ["var(--zen-font-size-xs)", "var(--zen-line-height-xs)"],
    sm: ["var(--zen-font-size-sm)", "var(--zen-line-height-sm)"],
    base: ["var(--zen-font-size-base)", "var(--zen-line-height-base)"],
    lg: ["var(--zen-font-size-lg)", "var(--zen-line-height-lg)"],
    xl: ["var(--zen-font-size-xl)", "var(--zen-line-height-xl)"],
    "2xl": ["var(--zen-font-size-2xl)", "var(--zen-line-height-2xl)"],
    "3xl": ["var(--zen-font-size-3xl)", "var(--zen-line-height-3xl)"],
    "4xl": ["var(--zen-font-size-4xl)", "var(--zen-line-height-4xl)"],
    "5xl": ["var(--zen-font-size-5xl)", "var(--zen-line-height-5xl)"],
    // A table body cell (tokens.css: defaults to the sm pair).
    "zen-cell": ["var(--zen-table-cell-font-size)", "var(--zen-table-cell-line-height)"]
  }
}, z = (e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
new RegExp(
  `color-mix\\(in srgb, (${a.map(z).join("|")}) calc\\((?:1|var\\(--un-[\\w-]+-opacity\\)) \\* 100%\\), transparent\\)`,
  "g"
);
export {
  l as ZEN_PREFIX,
  c as zenUnoTheme
};
//# sourceMappingURL=index208.js.map
