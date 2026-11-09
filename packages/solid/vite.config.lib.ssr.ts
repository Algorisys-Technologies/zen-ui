import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import UnoCSS from "unocss/vite";
import { resolve } from "path";

// Server (SSR) build for @algorisys/zen-ui-solid. Identical to vite.config.lib.ts
// except vite-plugin-solid emits Solid's SSR runtime (renderToString path) instead
// of the DOM runtime. Exposed to consumers via the "node" export condition so a
// SolidStart/Vinxi server renders these components to HTML, while the browser
// still loads the DOM build under "import". Both bundles are self-contained
// (zen-ui-core inlined); only solid-js is external, keeping a single Solid
// instance across the server/client boundary for hydration.
//
// hydratable must match vite.config.lib.ts. vite-plugin-solid already implies it
// under ssr: true, so this line is a statement of intent rather than a change —
// the bug was the DOM build, which cloned fresh templates instead of claiming
// the server's data-hk nodes ("Failed attempt to create new DOM elements during
// hydration").
export default defineConfig({
  plugins: [solid({ ssr: true, solid: { hydratable: true } }), UnoCSS()],
  // SSR builds externalise node_modules by default; force everything to be
  // bundled inline (mirrors the client lib build) so the server bundle is
  // self-contained. Only the explicit rollup `external` list stays out.
  ssr: {
    noExternal: true,
    // echarts: AnalyticChart's optional renderer, imported lazily on the client
    // only. Measured: without it here the server bundle inlined all of it.
    external: ["solid-js", "solid-js/web", "solid-js/store", "solid-js/h", "leaflet", "jodit", "echarts"],
  },
  build: {
    emptyOutDir: false,
    ssr: true,
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ZenUISolidServer",
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [
        "solid-js",
        "solid-js/web",
        "solid-js/store",
        "solid-js/h",
        "leaflet",
        "jodit",
        "echarts",
        /^echarts\//,
      ],
      output: {
        preserveModules: false,
        // Server bundle lives under dist/server so it never collides with the
        // client build's dist/index.js.
        assetFileNames: (assetInfo) =>
          assetInfo.name && assetInfo.name.endsWith(".css") ? "style.css" : assetInfo.name || "[name].[ext]",
      },
    },
    cssCodeSplit: false,
    outDir: "dist/server",
    sourcemap: false,
    minify: "esbuild",
  },
});
