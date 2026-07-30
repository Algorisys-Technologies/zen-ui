/**
 * Make a binding's published declarations self-contained.
 *
 * The problem this solves is invisible from inside the repo. Every binding's
 * emitted `.d.ts` says things like
 *
 *     import type { ColorOption } from "@algorisys/zen-ui-core/color";
 *
 * because core's `exports` point straight at `./src/*.ts` and TypeScript happily
 * resolves the source across the workspace. A consumer installing the tarball has
 * no core at all — it is `private: true` and never published — so every one of
 * those references dangles. Measured on the solid tarball with a strict consumer
 * (`skipLibCheck: false`): 69 TS errors, 37 of them unresolved siblings.
 *
 * It hides for two reasons. The runtime is fine — no binding externalises core, so
 * rollup inlines it and `dist/index.js` imports nothing from it — and the usual
 * consumer sets `skipLibCheck: true`, which suppresses errors *inside* declaration
 * files. So the types are broken and everything looks green.
 *
 * The fix is to vendor the declarations and point at them relatively:
 *
 *     dist/_core/color.d.ts                    <- copied from packages/core/dist
 *     dist/components/x/y.d.ts                 <- "../../_core/color"
 *
 * Rather than bundle every declaration into one file (rollup-plugin-dts), which
 * would rewrite the whole type graph of four bindings and can quietly reshape
 * complex generics. This keeps tsc's own output and only redirects specifiers, so
 * a mistake is a path that fails to resolve — loud, and caught by the acceptance
 * test — instead of a type that silently widens.
 *
 * Usage:  node scripts/vendor-core-types.mjs <binding>
 * Runs as part of each binding's `build:lib`, after `build:types`.
 */
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { BINDINGS } from "./bindings.mjs";

const id = process.argv[2];
const binding = BINDINGS.find((b) => b.id === id);
if (!binding) {
  console.error(`unknown binding "${id}" — expected one of ${BINDINGS.map((b) => b.id).join(", ")}`);
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
const dist = join(root, binding.dir, "dist");

let failed = 0;
const t = (ok, name, detail = "") => {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(54)} ${ok ? "" : detail}`);
};

/**
 * What gets vendored, and where from.
 *
 * web-components re-exports vanilla's entire surface verbatim, so its types need
 * vanilla's as well as core's. vanilla is processed before it (see the build
 * order in package.json), so by the time this runs vanilla's own declarations are
 * already self-contained and copying them cannot drag core back in.
 */
const VENDORED = [
  { pkg: "@algorisys/zen-ui-core", from: join(root, "packages/core/dist"), into: "_core" },
  ...(id === "web-components"
    ? [{ pkg: "@algorisys/zen-ui-vanilla", from: join(root, "packages/vanilla/dist"), into: "_vanilla" }]
    : []),
];

/** Every .d.ts under a directory, recursively. */
const declarations = (dir, acc = []) => {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) declarations(p, acc);
    else if (entry.name.endsWith(".d.ts")) acc.push(p);
  }
  return acc;
};

if (!existsSync(dist)) {
  t(false, `${id}: dist exists`, `${dist} is missing — run build:types first`);
  process.exit(1);
}

// 1. Copy the vendored declaration trees in.
for (const v of VENDORED) {
  if (!existsSync(v.from)) {
    t(false, `${id}: source declarations for ${v.pkg}`, `${v.from} missing — build it first`);
    continue;
  }
  const target = join(dist, v.into);
  rmSync(target, { recursive: true, force: true });
  cpSync(v.from, target, {
    recursive: true,
    filter: (src) => src.endsWith(".d.ts") || !src.includes("."),
  });
  const n = declarations(target).length;
  t(n > 0, `${id}: vendored ${n} declaration(s) into dist/${v.into}`, "copied nothing");
}

// 2. Rewrite specifiers in everything EXCEPT the vendored trees, which are
//    already internally relative.
const vendoredRoots = VENDORED.map((v) => join(dist, v.into));
const targets = declarations(dist).filter((f) => !vendoredRoots.some((r) => f.startsWith(r + "/")));

/**
 * Which lines carry a specifier worth rewriting.
 *
 * A blanket replace would also hit `declare module "@algorisys/zen-ui-vanilla/styles"`
 * (a module declaration, which must keep the bare specifier or it stops declaring
 * that module) and JSDoc examples like ` *   import { toast } from "…"`, which
 * would corrupt the docs. So comments are skipped and statements are anchored at
 * line start — `declare` is not `import`.
 *
 * The inline form matters and was missed the first time round. tsc writes a
 * dynamic-import type when a symbol is only reachable structurally:
 *
 *     themes: import("@algorisys/zen-ui-core").ThemeDescriptor[];
 *
 * which is not a statement and does not start the line. Three such references
 * existed (react 1, solid 2) and the first version of this script rewrote none of
 * them — worse, its leak check used the same anchor, so it reported 0 leaks while
 * the strict consumer still failed on one. The predicate is shared with the
 * assertion below now, precisely so the two cannot disagree again.
 */
const carriesSpecifier = (line) => {
  const trimmed = line.trimStart();
  if (trimmed.startsWith("*") || trimmed.startsWith("//")) return false;
  return /^(?:import|export)\b/.test(trimmed) || /\bimport\s*\(/.test(line);
};

const rewriteLine = (line, file) => {
  if (!carriesSpecifier(line)) return line;

  let out = line;
  for (const v of VENDORED) {
    const abs = join(dist, v.into);
    const rel = (sub) => {
      let r = relative(dirname(file), join(abs, sub));
      if (!r.startsWith(".")) r = `./${r}`;
      return r.split(/[\\/]/).join("/");
    };
    // Subpath first: the bare specifier is a prefix of every subpath, so replacing
    // it first would turn ".../color" into ".../index/color". Same prefix trap as
    // the alias ordering in README route 5 and dev:all's proxy table.
    out = out.replace(
      new RegExp(`(["'])${v.pkg.replace(/[/\-]/g, "\\$&")}/([A-Za-z0-9._-]+)\\1`, "g"),
      (_m, q, sub) => `${q}${rel(sub.replace(/\.css$/, ""))}${q}`,
    );
    out = out.replace(
      new RegExp(`(["'])${v.pkg.replace(/[/\-]/g, "\\$&")}\\1`, "g"),
      (_m, q) => `${q}${rel("index")}${q}`,
    );
  }
  return out;
};

let rewritten = 0;
let cssStripped = 0;
for (const file of targets) {
  const before = readFileSync(file, "utf8");
  const after = before
    .split("\n")
    // A bare `import "….css";` in a declaration file declares nothing and, under
    // `noUncheckedSideEffectImports`, is an unresolvable module. tsc emits it
    // because the source imports the stylesheet for its side effect.
    .filter((line) => {
      const isCss = /^\s*import\s+["'][^"']+\.css["'];?\s*$/.test(line);
      if (isCss) cssStripped++;
      return !isCss;
    })
    .map((line) => rewriteLine(line, file))
    .join("\n");
  if (after !== before) {
    writeFileSync(file, after);
    rewritten++;
  }
}
t(true, `${id}: rewrote ${rewritten} file(s), stripped ${cssStripped} css import(s)`);

// 3. Assert the result. A check that examined nothing is not a pass, so the count
//    of files walked is reported next to the count of leaks.
const leaks = [];
for (const file of declarations(dist)) {
  for (const [i, line] of readFileSync(file, "utf8").split("\n").entries()) {
    if (!carriesSpecifier(line)) continue;
    for (const v of VENDORED.map((x) => x.pkg)) {
      if (new RegExp(`["']${v.replace(/[/\-]/g, "\\$&")}(?:/|["'])`).test(line)) {
        leaks.push(`${relative(root, file)}:${i + 1}`);
      }
    }
  }
}
t(
  leaks.length === 0,
  `${id}: 0 sibling specifiers across ${declarations(dist).length} declaration(s)`,
  `${leaks.length} leak(s): ${leaks.slice(0, 5).join(", ")}`,
);

console.log(failed ? `\n${failed} FAILED\n` : "");
process.exit(failed ? 1 : 0);
