import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import { resolve } from "path";

// Library build for @algorisys/zen-ui-web-components.
//
// This binding is a thin custom-element layer OVER the vanilla factories, so it
// bundles @algorisys/zen-ui-vanilla (and core, transitively) inline exactly as
// the other bindings bundle core: a consumer installs the package and gets the
// elements registered, with nothing to wire up.
//
// `external` is the optional peers ONLY — leaflet, jodit, katex (RichText's
// `math` / renderMath) and echarts, which Map/RichText/AnalyticChart lazy-load
// through vanilla. Never bundled; a consumer installs them only if they
// use those elements. Same list vanilla externalises, for the same reason.
export default defineConfig({
  plugins: [UnoCSS()],
  build: {
    // tsc writes the .d.ts files here too, and the demo build shares this dir.
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ZenUIWebComponents",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // echarts: AnalyticChart's renderer, loaded on first chart, every subpath.
      // katex: RichText's `math` preview / renderMath, loaded only when used.
      external: ["leaflet", "leaflet/dist/leaflet.css", "jodit", /^jodit\//, "katex", "echarts", /^echarts\//],
      output: {
        // One file per module + `sideEffects` in package.json is what makes the
        // library tree-shakeable — NEITHER WORKS ALONE. See the React binding's
        // config for the numbers (151 kB -> 17 kB for one Button).
        preserveModules: true,
        preserveModulesRoot: "src",
        // Keep each module's own path. Without this, lib mode's `fileName: "index"`
        // names EVERY preserved module index, so they came out as index1.js …
        // index350.js — and `sideEffects: ["./dist/elements/**"]` matched no JS at
        // all. A bundler then dropped every element module: a consumer's
        // `import "@algorisys/zen-ui-web-components"` defined NO <zen-*> element
        // (measured: 0 customElements.define calls in a bundled app). The demo
        // never showed it because it imports src/, which the src glob does match.
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) return "style.css";
          return assetInfo.name || "[name].[ext]";
        },
      },
    },
    cssCodeSplit: false,
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",
  },
});
