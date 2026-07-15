import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import UnoCSS from "unocss/vite";

// The version the footer shows. Read from core rather than typed into the page:
// it was hardcoded "v0.1" and stayed there through 3.0.0, so the most public
// page in the repo advertised a version two majors old. A string a human must
// remember to update is a string that is wrong.
//
// Resolved against THIS FILE, not process.cwd(). `bun run build:landing` enters
// apps/landing first, so a relative "../../packages/core" reads correctly and
// every local build passes; deploy.sh runs vite from the repo root, where the
// same string points at a file that does not exist and the config throws before
// the build starts. The bug is invisible until the one command that publishes.
const corePkg = fileURLToPath(new URL("../../packages/core/package.json", import.meta.url));
const version = JSON.parse(readFileSync(corePkg, "utf8")).version;

// Landing app — served at the repo root path. When deployed to GH-Pages
// alongside the per-binding demos, this is the entry point at `/zen-ui/`,
// with `/zen-ui/builder/` and `/zen-ui/builder-solid/` linked from cards.
export default defineConfig({
  base: "/",
  define: { __ZEN_VERSION__: JSON.stringify(version) },
  plugins: [solid(), UnoCSS()],
  build: {
    copyPublicDir: true,
    outDir: "dist",
  },
});
