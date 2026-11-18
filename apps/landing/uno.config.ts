import { defineConfig, presetUno } from "unocss";
import type { Theme } from "unocss/preset-uno";
import { zenAnimationsPreset, zenUnoTheme } from "@algorisys/zen-ui-core/uno-preset";

// Shares the zen theme with both component bindings so the landing page reads
// as part of the same design system.
//
// Deliberately UNPREFIXED, unlike the two bindings: the `zen-` prefix exists to
// stop the *published library* from colliding with a consumer's CSS. Landing is
// a leaf app that ships no CSS to anyone and does not depend on zen-ui-react,
// so it has nothing to collide with and authors plain `p-4`.
// zenAnimationsPreset is required wherever zenUnoTheme is used, even here with no
// zen- animations: it carries the half of the opacity fix that keeps a plain
// colour class emitting a bare var() (see withAlpha in core's uno-preset.ts).
// <Theme>: inferred from `theme:` instead, the generic becomes zen's literal theme
// type, and presetUno's rules (typed for UnoCSS's Theme) no longer fit it.
export default defineConfig<Theme>({
  presets: [presetUno(), zenAnimationsPreset],
  theme: zenUnoTheme,
});
