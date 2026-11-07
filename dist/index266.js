const a = "zen-", n = {
  "zen-control": "var(--zen-control-height)",
  "zen-head": "var(--zen-table-head-height)",
  "zen-anchor-bar": "var(--zen-anchor-bar-height)"
}, e = {
  ...n,
  "zen-control-x": "var(--zen-control-padding-x)",
  "zen-cell-y": "var(--zen-table-cell-padding-y)",
  "zen-section-x": "var(--zen-section-padding-x)",
  "zen-section-y": "var(--zen-section-padding-y)",
  "zen-bar-y": "var(--zen-bar-padding-y)",
  "zen-card": "var(--zen-card-padding)",
  "zen-menu-y": "var(--zen-menu-item-padding-y)"
}, z = {
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
  spacing: e
};
export {
  a as ZEN_PREFIX,
  z as zenUnoTheme
};
//# sourceMappingURL=index266.js.map
