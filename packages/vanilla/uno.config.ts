import { fileURLToPath } from "node:url";
import { defineConfig, presetUno } from "unocss";
import { ZEN_PREFIX, zenAnimationsPreset, zenUnoTheme } from "@algorisys/zen-ui-core/uno-preset";

// Mirror of packages/react/uno.config.ts — see the rationale for `prefix` there.
// Every binding must emit the same `.zen-*` namespace so an app can load any of
// them (or several) alongside its own CSS without collisions.
//
// zenAnimationsPreset makes `zen-anim-*` real utilities. Without it they are
// plain classes and `data-[state=open]:zen-anim-accordion-down` — the only way
// any binding uses them — generates no CSS at all. Pinned by check:css-live.
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
      // .ts is MANDATORY here, unlike in the React and Solid configs.
      //
      // Uno's default include is `.vue|.svelte|.tsx|.jsx|.html` — every framework
      // that has a template syntax. This binding has no framework, so its
      // components are plain .ts, and on the default list NONE of their classes
      // are scanned: measured, the accordion, tabs and dialog generated zero CSS
      // while Button and Badge worked, because their variants live in a file the
      // config named explicitly. The build was green and the page was unstyled.
      //
      // The cost is that Uno extracts from raw text and does not know what a
      // comment is, so a class NAMED in a doc comment in this package gets
      // emitted. That is the trade for having any styles at all.
      include: [
        /\.(vue|svelte|[jt]sx|vine\.ts|mdx?|astro|elm|php|phtml|marko|html)($|\?)/,
        /\.ts($|\?)/,
      ],
    },
    // Absolute: the glob runs with cwd = this package, and a "../" pattern is not
    // traversed out of it — it matches nothing and says nothing.
    filesystem: [fileURLToPath(new URL("../core/src/variants.ts", import.meta.url))],
  },
});
