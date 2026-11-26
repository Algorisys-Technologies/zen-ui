#!/usr/bin/env node
/**
 * Every gate a ONE-BINDING release must pass, in the order that avoids the
 * build-clobbering traps CLAUDE.md lists. What "ship solid" runs.
 *
 *   bun run ship:check solid
 *   bun run ship:check react --skip-browser     # no Chromium on this box
 *
 * WHY ONE BINDING AT A TIME
 * Since 13.8.0 each binding is versioned on its own: Solid is in production and
 * ships first, and the others are brought to parity behind it
 * (scripts/port-queue.mjs). The old "ship it" ran every binding's lint, browser
 * checks and dist build, which is what made a Solid fix wait on three bindings
 * nobody had changed.
 *
 * THE ONE CROSS-BINDING GATE THAT STAYS
 * core is inlined into every binding. A Solid release that changes core leaves
 * React, vanilla and web-components picking that change up on their NEXT build —
 * so a Solid release must not leave any of them failing to type-check. It is
 * cheap and needs no browser, so it runs for all four, whatever is being shipped.
 *
 * Stops at the first failing step and says which. A summary counts the steps
 * that ran: a run that skipped everything is not a pass.
 */
import { spawnSync } from "node:child_process";
import { BINDINGS, byId } from "./bindings.mjs";

const argv = process.argv.slice(2);
const SKIP_BROWSER = argv.includes("--skip-browser");
const id = argv.find((a) => !a.startsWith("--"));
const b = id && byId(id);
if (!b) {
  console.error(`usage: bun run ship:check <${BINDINGS.map((x) => x.id).join("|")}> [--skip-browser]`);
  process.exit(2);
}

const ran = [];
const step = (name, cmd, args, opts = {}) => {
  console.log(`\n\x1b[1m==> [${ran.length + 1}] ${name}\x1b[0m   (${[cmd, ...args].join(" ")})`);
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  if (r.status !== 0) {
    console.error(`\n\x1b[31mship:check ${b.id} FAILED at step ${ran.length + 1}: ${name} (exit ${r.status ?? r.signal})\x1b[0m`);
    console.error(`passed before it: ${ran.join(", ") || "nothing"}`);
    process.exit(1);
  }
  ran.push(name);
};
const filter = (pkg, script) => ["--filter", pkg, script];

// 1. Pure logic: every core contract, plus release coherence for EVERY binding
//    against its own version (check:release with no argument) and the port queue.
step("bun run check", "bun", ["run", "check"]);
step(`check:release ${b.id}`, "bun", ["run", "scripts/check-release.ts", b.id]);

// 2. core is shared: no binding may be left failing to type-check.
for (const other of BINDINGS) {
  step(`typecheck ${other.id} (tsc -b)`, "npx", ["tsc", "-b"], { cwd: other.dir });
}

// 3. The binding being shipped: lint, demo build, browser checks.
step(`lint ${b.id}`, "bun", filter(b.pkg, "lint"));
step(`demo build ${b.id}`, "bun", filter(b.pkg, "build"));
if (SKIP_BROWSER) {
  console.log("\n--skip-browser: visual-check, schedule-dom and table-dom NOT run — do not ship on this alone");
} else {
  step(`visual-check ${b.id}`, "node", ["scripts/visual-check.mjs", b.id]);
  step(`check:schedule-dom ${b.id}`, "node", ["scripts/check-schedule-dom.mjs", b.id]);
  step(`check:table-dom ${b.id}`, "node", ["scripts/check-table-dom.mjs", b.id]);
}

// 4. The library last: build:lib and the demo build share no folder any more
//    (dist vs dist-demo), but check:size wants a fresh dist and it goes last by
//    convention. web-components vendors vanilla's declarations, so vanilla's lib
//    must be built first or wc vendors stale types.
if (b.id === "web-components") step("build:lib vanilla (wc vendors it)", "bun", filter(byId("vanilla").pkg, "build:lib"));
step(`build:lib ${b.id}`, "bun", filter(b.pkg, "build:lib"));
step(`check:package ${b.id}`, "node", ["scripts/check-package-artifacts.mjs", b.id]);
step(`check:size ${b.id}`, "node", ["scripts/check-bundle-size.mjs", b.id]);

console.log(`\n\x1b[32mship:check ${b.id}: ${ran.length} steps passed\x1b[0m${SKIP_BROWSER ? "  (browser checks skipped)" : ""}`);
