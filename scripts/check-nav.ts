/**
 * Guards nav.ts's `source` paths — the files "View code" opens.
 *
 * These were derived from the routers once. Left alone, they rot: a demo gets
 * renamed, a route is repointed at a different component, and the link keeps
 * working — it just opens the wrong file, or 404s on GitHub for a visitor and
 * nobody else. Neither shows up in a build, a typecheck or a screenshot.
 *
 * So this re-derives the truth from the routers and compares, rather than
 * trusting the values to have stayed correct:
 *
 *   App.tsx / main.tsx  route -> component -> imported file    (the truth)
 *   nav.ts              route -> source                        (the claim)
 */
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";

let f = 0;
const t = (ok: boolean, name: string, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : detail}`);
};

type Binding = {
  label: string;
  router: string;
  nav: string;
  pkg: string;
  routeRe: RegExp;
  navRe: RegExp;
};

const BINDINGS: Binding[] = [
  {
    label: "react",
    router: "packages/react/src/App.tsx",
    nav: "packages/react/src/nav.ts",
    pkg: "packages/react",
    routeRe: /<Route\s+path="([^"]+)"\s+element=\{<(\w+)\s*\/>\}/g,
    navRe: /\{[^{}\n]*to:\s*"([^"]+)"[^{}\n]*\}/g,
  },
  {
    label: "solid",
    router: "packages/solid/src/main.tsx",
    nav: "packages/solid/src/nav.ts",
    pkg: "packages/solid",
    routeRe: /<Route\s+path="([^"]+)"\s+component=\{(\w+)\}/g,
    navRe: /\{[^{}\n]*path:\s*"([^"]+)"[^{}\n]*\}/g,
  },
];

for (const b of BINDINGS) {
  console.log(`\n${b.label}`);
  const router = readFileSync(b.router, "utf8");
  const nav = readFileSync(b.nav, "utf8");

  const imports = new Map<string, string>();
  for (const m of router.matchAll(/import\s+(\w+)\s+from\s+"\.\/components\/([^"]+)"/g)) {
    imports.set(m[1], m[2]);
  }

  /** route -> the file the router really renders. */
  const truth = new Map<string, string>();
  for (const m of router.matchAll(b.routeRe)) {
    const file = imports.get(m[2]);
    if (file) truth.set(m[1], `${b.pkg}/src/components/${file}.tsx`);
  }

  /** route -> what nav.ts claims. */
  const claims: { route: string; source?: string }[] = [];
  for (const m of nav.matchAll(b.navRe)) {
    const entry = m[0];
    const src = /source:\s*"([^"]+)"/.exec(entry);
    claims.push({ route: m[1], source: src?.[1] });
  }

  const routed = claims.filter((c) => truth.has(c.route));
  t(routed.length > 50, `${routed.length} routed nav entries found`, `only ${routed.length}`);

  const missing = routed.filter((c) => !c.source);
  t(missing.length === 0, "every routed nav entry has a source", `missing: ${missing.map((m) => m.route).join(", ")}`);

  const gone = routed.filter((c) => c.source && !existsSync(c.source));
  t(gone.length === 0, "every source file exists on disk", gone.map((g) => `${g.route} -> ${g.source}`).join(", "));

  const wrong = routed.filter((c) => c.source && c.source !== truth.get(c.route));
  t(
    wrong.length === 0,
    "every source matches the component the route renders",
    wrong.map((w) => `${w.route}: nav says ${w.source}, router renders ${truth.get(w.route)}`).join(" | "),
  );
}

console.log(f ? `\n${f} FAILED\n` : "\nall passed\n");
process.exit(f ? 1 : 0);
