/**
 * Every path a package.json promises must exist in dist.
 *
 * This exists because both bindings shipped `"types": "./dist/index.d.ts"` while
 * tsc emitted to `dist/src/index.d.ts` — so consumers installed the library and
 * got no TypeScript at all. It survived review, a release, and a published site
 * because `emptyOutDir: false` kept a stale index.d.ts alive on any machine that
 * had built the old layout once. A fresh clone never had one, and nothing looked
 * wrong until you cleaned dist.
 *
 * A package.json field pointing at a file that does not exist is not a typo, it
 * is a broken install. Nothing else in the repo checks this.
 *
 * Run AFTER build:lib and build:lib:solid, against a clean dist.
 */
import { existsSync, readFileSync } from "node:fs";
import { BINDINGS } from "./bindings.mjs";
import { join } from "node:path";

let f = 0;
const t = (ok, name, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(46)} ${ok ? "" : detail}`);
};

/** Collect every string in an exports subtree — conditions nest arbitrarily. */
const paths = (node, acc = []) => {
  if (typeof node === "string") acc.push(node);
  else if (node && typeof node === "object") for (const v of Object.values(node)) paths(v, acc);
  return acc;
};

// Every binding, from scripts/bindings.mjs. Both bindings once shipped a "types"
// path the build never wrote, and it survived a release because a stale file kept
// it alive locally — so a third binding checked by nobody is not hypothetical.
for (const { id: pkg, dir: base } of BINDINGS) {
  const json = JSON.parse(readFileSync(`${base}/package.json`, "utf8"));

  console.log(`\n${pkg}: every declared path resolves`);
  for (const field of ["main", "module", "types"]) {
    const rel = json[field];
    if (rel) t(existsSync(join(base, rel)), `${field} -> ${rel}`, "file does not exist");
  }
  for (const rel of new Set(paths(json.exports))) {
    t(existsSync(join(base, rel)), `exports -> ${rel}`, "file does not exist");
  }

  console.log(`${pkg}: the entry declaration is real`);
  const types = json.types && join(base, json.types);
  if (types && existsSync(types)) {
    const src = readFileSync(types, "utf8");
    // A .d.ts that exists but declares nothing is the same outage, quieter.
    t(/export\s/.test(src), "types file actually declares exports", "no export statements");
    t(src.length > 1000, "types file is not a stub", `${src.length} bytes`);
  }

  console.log(`${pkg}: tree-shaking prerequisites`);
  // These two only work together — see vite.config.lib.ts. Asserting both here
  // so a future edit cannot quietly drop one and undo the win.
  t(Array.isArray(json.sideEffects), "package.json declares sideEffects", "missing — barrel will not shake");
  t(
    JSON.stringify(json.sideEffects ?? []).includes(".css"),
    "sideEffects keeps CSS side-effectful",
    "a blanket false lets bundlers shake the stylesheet out",
  );
  const vite = readFileSync(`${base}/vite.config.lib.ts`, "utf8");
  t(/preserveModules:\s*true/.test(vite), "vite emits one file per module", "preserveModules is not true");
}

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
