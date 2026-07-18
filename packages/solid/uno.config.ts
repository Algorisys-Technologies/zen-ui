import { fileURLToPath } from "node:url";
import { defineConfig, presetUno } from "unocss";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "@algorisys/zen-ui-core/uno-preset";

// Mirror of packages/react/uno.config.ts — see the rationale for `prefix`
// there. Both bindings must emit the same `.zen-*` namespace so an app can
// load either (or both) alongside its own CSS without collisions.
export default defineConfig({
  presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
  theme: zenUnoTheme,
  // Uno only scans files that pass through the build pipeline, and
  // @algorisys/zen-ui-core resolves through a node_modules symlink — which the
  // default pipeline EXCLUDES. So the variant tables in core/src/variants.ts are
  // invisible to the generator unless named here, and every class used ONLY by
  // them silently stops being emitted: measured, 13 rules vanished from the
  // published stylesheet (`!zen-whitespace-normal`, `zen-duration-150`,
  // `zen-rounded-zen-lg`, `hover:zen-bg-zen-primary-soft`, …) while the build,
  // the typecheck and check:parity all stayed green.
  content: {
    pipeline: {
      // Uno's DEFAULT include covers .tsx but NOT plain .ts, so core/src/variants.ts
      // — the only file in core that declares real classes — is invisible to the
      // generator. That deleted 13 rules from the published stylesheet
      // (`!zen-whitespace-normal`, `zen-duration-150`, `zen-rounded-zen-lg`, …)
      // while the build, the typecheck and check:parity all stayed green.
      //
      // Scoped to that ONE file rather than all of .ts on purpose: Uno extracts
      // from raw text, comments included, so scanning core's other modules would
      // emit a rule for every class NAMED in a doc comment — cn.ts's
      // `cn("zen-p-4", "zen-p-8")` example alone added a dead `.zen-p-8`.
      // The first pattern is Uno's default, restated because `include` replaces it.
      include: [
        /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        /core\/src\/variants\.ts($|\?)/,
      ],
    },
    // Absolute: the glob runs with cwd = this package, and a "../" pattern is not
    // traversed out of it — it matches nothing and says nothing.
    filesystem: [fileURLToPath(new URL("../core/src/variants.ts", import.meta.url))],
  },
});
