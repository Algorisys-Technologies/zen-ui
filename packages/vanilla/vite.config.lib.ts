import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import { resolve } from "path";

// Library build for @algorisys/zen-ui-vanilla. Bundles @algorisys/zen-ui-core
// inline so consumers do not need to install it, exactly as the other bindings do.
//
// `rollupOptions.external` is EMPTY, and that is the whole point of this binding:
// there is no framework runtime to keep single-instance and no primitive library
// to externalise. React externalises react/react-dom + five optional peers; Solid
// externalises solid-js + two. This one externalises nothing because it depends on
// nothing at runtime but the DOM.
export default defineConfig({
  plugins: [UnoCSS()],
  build: {
    // Don't empty dist: tsc writes the .d.ts files here too, and the demo build
    // shares this directory.
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ZenUIVanilla",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // Optional peer deps — lazy-loaded by Map/RichText only. Never bundled;
      // a consumer installs them only if they use those components (as React does).
      external: ["leaflet", "leaflet/dist/leaflet.css", "jodit"],
      output: {
        // Emit one file per module instead of a single bundle. This is half of
        // what makes the library tree-shakeable; the other half is `sideEffects`
        // in package.json, and NEITHER WORKS ALONE — see the React binding's
        // config for the full reasoning and the numbers (151 kB -> 17 kB for one
        // Button). Mirrors React: this is a parity-relevant build setting.
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
