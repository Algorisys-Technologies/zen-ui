import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";
import { resolve } from "path";

// Demo app configuration for the web-components binding. Mirrors packages/vanilla/
// vite.config.demo.ts. The library build uses vite.config.lib.ts instead.
//
// NOTE `/builder` is a PREFIX of `/builder-wc`. deploy.sh's 404 shim and the dev
// hub's proxy table both match on anchored patterns and sort longest-base-first
// for exactly this reason — a plain prefix match sends every wc URL to the React
// demo, which answers with its own 404 while the page still looks right.
//
// Resolve @algorisys/zen-ui-vanilla to its SOURCE, not its built dist. This is the
// only binding whose demo depends on a sibling package, and that package's OWN demo
// build clobbers its dist/index.js (demo and lib builds share packages/*/dist — see
// CLAUDE.md). deploy.sh builds the vanilla demo before this one in a single loop, so
// by the time wc builds, vanilla's lib entry is gone and resolution fails with
// "Failed to resolve entry for package". Pointing at source makes this demo build
// independent of vanilla's dist state — the same source UnoCSS already scans for
// this binding's zen-* classes, and exactly what dev:wc wants too.
export default defineConfig({
  base: "/builder-wc/",
  plugins: [UnoCSS()],
  resolve: {
    alias: {
      "@algorisys/zen-ui-vanilla": resolve(__dirname, "../vanilla/src/index.ts"),
    },
  },
  build: {
    copyPublicDir: true,
    outDir: "dist",
  },
});
