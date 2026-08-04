import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";

// Demo app configuration
// This is used for development and preview of the component library
// The library build uses vite.config.lib.ts instead
export default defineConfig({
  base: '/builder/',
  plugins: [react(), UnoCSS()],
  resolve: {
    // ONE React, whatever the hoisting did.
    //
    // Adding an optional peer that itself peer-depends on react (monaco) made
    // bun install a nested copy under packages/react — 19.2.8 beside the root's
    // 19.2.3. Monaco then resolved the nested one, so its hooks ran against a
    // second React instance and every render threw "Cannot read properties of
    // null (reading 'useState')". Nothing about that error names React
    // duplication, and the library build was unaffected, so only the demo
    // showed it. Deduping here fixes the class, not just monaco.
    dedupe: ["react", "react-dom"],
  },
  // Demo app entry point
  build: {
    copyPublicDir: true,
    // The demo must NOT build into dist/: that directory IS the published
    // package (package.json main/files point at it), so a demo build there
    // silently destroys the library artifacts and every consumer resolving
    // @algorisys/zen-ui-* breaks until build:lib is run again. dist-demo is
    // already gitignored.
    outDir: "dist-demo",
    // Demo app builds to a different directory to avoid conflicts with library build
  },
  server: {
    // Uncomment if needed for external access
    // host: "0.0.0.0",
    // port: 5173,
    // https: false,
  },
});
