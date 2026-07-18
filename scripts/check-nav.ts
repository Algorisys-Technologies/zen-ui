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
 *   the router      route -> component -> imported file    (the truth)
 *   nav.ts          route -> source                        (the claim)
 *
 * Every binding, from scripts/bindings.mjs. This file used to hardcode two, which
 * is how a third binding could exist and be checked by nothing.
 */
import { existsSync, readFileSync } from "node:fs";
import { BINDINGS } from "./bindings.mjs";

let f = 0;
const t = (ok: boolean, name: string, detail = "") => {
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(52)} ${ok ? "" : detail}`);
};

for (const b of BINDINGS) {
  console.log(`\n${b.id}`);
  const router = readFileSync(b.router, "utf8");
  const nav = readFileSync(`${b.dir}/src/nav.ts`, "utf8");

  const imports = new Map<string, string>();
  for (const m of router.matchAll(b.importRe)) imports.set(m[1], m[2]);

  /** route -> the file the router really renders. */
  const truth = new Map<string, string>();
  for (const m of router.matchAll(b.routeRe)) {
    const file = imports.get(m[2]);
    if (file) truth.set(m[1], `${b.dir}/src/components/${file}.tsx`);
  }
  // The vanilla binding has no JSX, so its demos are .ts. Resolve whichever exists
  // rather than assuming the extension — guessing wrong would report every route
  // as broken, and a check that cries wolf is a check everyone turns off.
  for (const [route, file] of truth) {
    if (!existsSync(file) && existsSync(file.replace(/\.tsx$/, ".ts"))) {
      truth.set(route, file.replace(/\.tsx$/, ".ts"));
    }
  }

  /** route -> what nav.ts claims. */
  const claims: { route: string; source?: string }[] = [];
  for (const m of nav.matchAll(b.navRe)) {
    const src = /source:\s*"([^"]+)"/.exec(m[0]);
    claims.push({ route: m[1], source: src?.[1] });
  }

  const routed = claims.filter((c) => truth.has(c.route));
  // Every binding is a full binding now, held to one floor. vanilla was an
  // 8-component slice with its own smaller floor; that flag is gone.
  t(routed.length > 50, `${routed.length} routed nav entries found`, `only ${routed.length}, want > 50`);

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
