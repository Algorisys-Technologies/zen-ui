import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import UnoCSS from "unocss/vite";
import { resolve } from "path";

// Library build for @algorisys/zen-ui-solid. Externalises solid-js (peer
// dep) so consumers' Solid runtime is single-instance. Bundles
// @algorisys/zen-ui-core inline so consumers do not need to install it.
export default defineConfig({
  plugins: [solid(), UnoCSS()],
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ZenUISolid",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "solid-js/store",
        "solid-js/h",
        // Optional peer deps — lazy-loaded by Map/RichText. Never bundled;
        // consumers install them only if they use those components.
        "leaflet",
        "jodit",
      ],
      output: {
        globals: {
          "solid-js": "Solid",
        },
        // One file per module. Half of what makes the library tree-shakeable;
        // the other half is `sideEffects` in package.json, and NEITHER WORKS
        // ALONE — see the React binding's config for the full reasoning and the
        // numbers. Mirrors React: this is a parity-relevant build setting.
        preserveModules: true,
        preserveModulesRoot: "src",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "style.css";
          }
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
