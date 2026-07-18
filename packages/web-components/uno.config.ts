import { fileURLToPath } from "node:url";
import { defineConfig, presetUno } from "unocss";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "@algorisys/zen-ui-core/uno-preset";

// Mirror of packages/vanilla/uno.config.ts. Every binding emits the same `.zen-*`
// namespace so an app can load any of them alongside its own CSS.
//
// The twist for this binding: its OWN source (src/elements/*.ts) contains only
// custom-element tag names and adapter code — NOT a single `zen-*` class. The
// rendered class strings live in the VANILLA source (each element mounts a
// vanilla factory's `.el`) and in core's variant tables. So the generator must
// scan vanilla's src plus core/variants.ts, or every utility this binding renders
// silently generates no CSS and the page ships unstyled — a failure that builds,
// typechecks and passes check:parity all green. See docs/css-interop.md and the
// vanilla config's note.
export default defineConfig({
  presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
  theme: zenUnoTheme,
  content: {
    pipeline: {
      // .ts is MANDATORY: vanilla's components (and core/variants.ts) are plain
      // .ts, which Uno's default include (.vue|.svelte|.tsx|.jsx|.html) skips.
      include: [
        /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        /\.ts($|\?)/,
      ],
    },
    // Absolute paths: the glob runs with cwd = this package, and a "../" pattern
    // is not traversed out of it. The class strings this binding renders come
    // from vanilla's component source and core's variant table — neither of which
    // passes through this package's own build pipeline.
    filesystem: [
      fileURLToPath(new URL("../core/src/variants.ts", import.meta.url)),
      fileURLToPath(new URL("../vanilla/src/", import.meta.url)) + "**/*.ts",
    ],
  },
});
