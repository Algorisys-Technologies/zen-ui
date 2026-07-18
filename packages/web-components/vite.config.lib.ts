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
// `external` is leaflet + jodit ONLY — the optional peers that Map/RichText
// lazy-load through vanilla. Never bundled; a consumer installs them only if they
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
      external: ["leaflet", "leaflet/dist/leaflet.css", "jodit"],
      output: {
        // One file per module + `sideEffects` in package.json is what makes the
        // library tree-shakeable — NEITHER WORKS ALONE. See the React binding's
        // config for the numbers (151 kB -> 17 kB for one Button).
        preserveModules: true,
        preserveModulesRoot: "src",
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
