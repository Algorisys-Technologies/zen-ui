import { defineConfig } from "vite";
import UnoCSS from "unocss/vite";

// Demo app configuration for the vanilla binding. Mirrors packages/react/
// vite.config.demo.ts. The library build uses vite.config.lib.ts instead.
//
// NOTE `/builder` is a PREFIX of `/builder-vanilla`. deploy.sh's 404 shim and the
// dev hub's proxy table both match on anchored patterns and sort longest-base-first
// for exactly this reason — a plain prefix match sends every vanilla URL to the
// React demo, which answers with its own 404 while the page still looks right.
export default defineConfig({
  base: "/builder-vanilla/",
  plugins: [UnoCSS()],
  build: {
    copyPublicDir: true,
    outDir: "dist",
  },
});
