/**
 * What a consumer actually ships.
 *
 * The number on disk is not the answer: dist/index.js is ~1.1 MB because vite
 * deliberately keeps whitespace in lib+ES mode to preserve ~1600 @__PURE__
 * annotations. The consumer's bundler minifies and tree-shakes it. The only
 * honest measurement is to BE a consumer, so this builds three real apps against
 * the built dist and weighs the output.
 *
 * It exists because "how big is zen-ui" had a bad answer for a long time: a
 * single <Button> cost 151 kB gzipped — 59% of the entire library — and
 * importing nine components added 330 BYTES on top. Tree-shaking was not
 * happening at all. Two settings fix it and NEITHER WORKS ALONE:
 *
 *   - vite.config.lib.ts  preserveModules: true   (one file per module)
 *   - package.json        sideEffects: [...css]   (modules are droppable)
 *
 * Bundled into one module, sideEffects is all-or-nothing and the blob is used.
 * Split into modules without sideEffects, rollup assumes each might do something
 * on import and keeps them all. Together: 151 kB -> 17 kB for a Button.
 *
 * The budgets below are ceilings with headroom, not targets. If one trips, run
 * with --report to see what got pulled in. Do not raise a budget to make it pass
 * without knowing which import chain grew — that is the failure this catches.
 *
 * Usage: node scripts/check-bundle-size.mjs [--report]
 * Requires: bun run build:lib && bun run build:lib:solid
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { join, resolve } from "node:path";

const REPORT = process.argv.includes("--report");
const ROOT = resolve(import.meta.dirname, "..");

/** gzipped KB is what crosses the wire; that is the number worth budgeting. */
const CASES = [
  {
    binding: "react",
    name: "one Button",
    budgetKB: 30, // was 151 before tree-shaking worked
    code: `import { Button } from "@algorisys/zen-ui-react";
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<Button>Hi</Button>);`,
  },
  {
    binding: "react",
    name: "nine components",
    budgetKB: 80, // was 151 — indistinguishable from one Button, which was the tell
    code: `import { Button, Input, Card, Dialog, DialogContent, Select, Checkbox, Badge, Tabs } from "@algorisys/zen-ui-react";
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<Card><Button>a</Button><Input /><Checkbox /><Badge>b</Badge><Tabs /><Select /><Dialog><DialogContent>x</DialogContent></Dialog></Card>);`,
  },
  {
    binding: "solid",
    name: "one Button",
    budgetKB: 30, // was 83
    code: `import { Button } from "@algorisys/zen-ui-solid";
import { render } from "solid-js/web";
render(() => <Button>Hi</Button>, document.getElementById("root"));`,
  },
  {
    binding: "vanilla",
    name: "one Button",
    /**
     * 30, the same as the other two, because the measured number is the same: 17 kB.
     *
     * That is worth knowing rather than assuming. A binding with no framework
     * "obviously" ought to be smaller, and it is not — measured, 81 kB of the 92 kB
     * raw payload is tailwind-merge, which `cn()` requires. React and Solid pay the
     * identical bill and externalise their frameworks, so all three land at ~17 kB.
     * The framework was never the weight; the design system is.
     *
     * So this budget guards the same thing theirs do: if it trips, something got
     * pulled in that should not have been. Run with --report and find the chain.
     * Do not raise it to make it pass.
     */
    budgetKB: 30,
    code: `import { Button } from "@algorisys/zen-ui-vanilla";
document.getElementById("root").append(Button({ children: "Hi" }).el);`,
  },
];

const EXTERNAL = {
  react: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
  solid: ["solid-js", "solid-js/web", "solid-js/store"],
  // Empty on purpose, and it is the whole point of this binding: there is no
  // framework runtime to keep single-instance and no primitive library to
  // externalise. If this list ever grows, "zero runtime dependencies" has quietly
  // stopped being true and the number below stops meaning what it says.
  vanilla: [],
};

const PLUGIN = {
  react: `import react from "@vitejs/plugin-react";\nconst plugins = [react()];`,
  solid: `import solid from "vite-plugin-solid";\nconst plugins = [solid()];`,
  // No JSX, so no transform — but `plugins` must still EXIST, because the
  // generated config references it unconditionally. Omitting this key threw
  // "ReferenceError: plugins is not defined" and reported it as "build failed",
  // which reads exactly like a size problem and is not one.
  vanilla: `const plugins = [];`,
};

// Every binding under test must have a built dist, named from the CASES rather
// than hardcoded — a case for a binding nobody built reports a bundling error
// instead of the truth.
for (const b of [...new Set(CASES.map((c) => c.binding))]) {
  if (!existsSync(join(ROOT, `packages/${b}/dist/index.js`))) {
    console.error(`\n  packages/${b}/dist is missing — run: bun run build:lib for ${b}\n`);
    process.exit(1);
  }
}

let f = 0;
// Scratch lives INSIDE the repo, not /tmp: the generated config imports
// @vitejs/plugin-react, and node resolves that from the config file's location.
// From /tmp it is ERR_MODULE_NOT_FOUND and every case "fails" for a reason that
// has nothing to do with bundle size. Gitignored via .zen-size-*.
const dir = mkdtempSync(join(ROOT, ".zen-size-"));
console.log("");

for (const [i, c] of CASES.entries()) {
  // .jsx for the JSX bindings; the vanilla case is plain JS and esbuild would
  // still parse .jsx fine, but naming it honestly keeps the failure legible.
  const entry = join(dir, `e${i}.${c.binding === "vanilla" ? "js" : "jsx"}`);
  writeFileSync(entry, c.code);
  const out = join(dir, `o${i}`);
  const cfg = join(dir, `v${i}.mjs`);
  writeFileSync(
    cfg,
    `${PLUGIN[c.binding]}
import { defineConfig } from "vite";
export default defineConfig({
  root: ${JSON.stringify(ROOT)},
  logLevel: "silent",
  plugins,
  build: {
    minify: "esbuild",
    lib: { entry: ${JSON.stringify(entry)}, formats: ["es"], fileName: "out" },
    rollupOptions: { external: ${JSON.stringify(EXTERNAL[c.binding])} },
    outDir: ${JSON.stringify(out)}, emptyOutDir: true, sourcemap: ${REPORT},
  },
});`,
  );

  try {
    execFileSync("npx", ["vite", "build", "--config", cfg], { cwd: ROOT, stdio: "pipe" });
  } catch (e) {
    // Print stderr, not stdout — vite writes config-load failures to stderr and
    // a "build failed" with no reason is how this script wasted its first run.
    console.log(`  FAIL ${c.binding}/${c.name}: build failed`);
    const why = String(e.stderr ?? "") || String(e.stdout ?? e);
    console.log(
      why
        .split("\n")
        .filter((l) => l.trim())
        .slice(0, 4)
        .map((l) => `       ${l}`)
        .join("\n"),
    );
    f++;
    continue;
  }

  const js = join(out, "out.js");
  const gz = Math.round(gzipSync(readFileSync(js)).length / 1024);
  const ok = gz <= c.budgetKB;
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${`${c.binding}: ${c.name}`.padEnd(30)} ${String(gz).padStart(4)} kB gzip  (budget ${c.budgetKB})`);

  if (REPORT && existsSync(js + ".map")) {
    const m = JSON.parse(readFileSync(js + ".map", "utf8"));
    const by = {};
    m.sources.forEach((s, k) => {
      const dep = s.match(/node_modules\/((@[^/]+\/)?[^/]+)/);
      const key = dep ? dep[1] : "zen-ui";
      by[key] = (by[key] ?? 0) + (m.sourcesContent?.[k]?.length ?? 0);
    });
    console.log(`       ${m.sources.length} modules; heaviest:`);
    Object.entries(by)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .forEach(([k, n]) => console.log(`         ${String(Math.round(n / 1024)).padStart(5)}K  ${k}`));
  }
}

rmSync(dir, { recursive: true, force: true });
console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
