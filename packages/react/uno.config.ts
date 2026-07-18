import { fileURLToPath } from "node:url";
import { defineConfig, presetUno } from "unocss";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "@algorisys/zen-ui-core/uno-preset";

// The theme (--zen-color-* → zen-bg-zen-*, etc.) and the `zen-` utility prefix
// are shared with every other zen-ui binding via @algorisys/zen-ui-core.
// Only the unocss wiring (presetUno + defineConfig) lives here.
//
// `prefix` is what keeps the published stylesheet from colliding with the
// consuming app's own CSS: every class emits as `.zen-*`, so zen-ui's
// `.zen-p-4` can never fight Bootstrap's `.p-4` (1.5rem) or a custom Tailwind
// theme's. Variants are authored OUTSIDE the prefix (`hover:zen-bg-zen-primary`)
// — that is the form UnoCSS matches. `cn()` mirrors this prefix via
// extendTailwindMerge; the two must not drift apart.
// zenAnimationsPreset makes `zen-anim-*` real utilities. Without it they are
// plain classes in tokens.css, and `data-[state=open]:zen-anim-accordion-down`
// — the only way either binding uses them — generates no CSS at all.
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
