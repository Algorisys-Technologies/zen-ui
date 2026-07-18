import { defineConfig, presetUno } from "unocss";
import { zenUnoTheme } from "@algorisys/zen-ui-core/uno-preset";

// Shares the zen theme with both component bindings so the landing page reads
// as part of the same design system.
//
// Deliberately UNPREFIXED, unlike the two bindings: the `zen-` prefix exists to
// stop the *published library* from colliding with a consumer's CSS. Landing is
// a leaf app that ships no CSS to anyone and does not depend on zen-ui-react,
// so it has nothing to collide with and authors plain `p-4`.
export default defineConfig({
  presets: [presetUno()],
  theme: zenUnoTheme,
});
