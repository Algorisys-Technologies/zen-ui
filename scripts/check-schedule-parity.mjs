/**
 * Do the bindings actually RENDER the same chart?
 *
 *   node scripts/check-schedule-parity.mjs            # every ported binding vs react
 *   node scripts/check-schedule-parity.mjs solid
 *
 * `check-parity.ts` compares EXPORT NAMES, which is a real check and a narrow
 * one: two bindings can export identical surfaces and draw different charts.
 * That is not hypothetical here — the Solid and vanilla Gantts exported the same
 * names as React's for months while silently drawing a month wherever a quarter
 * was asked for, because `planningRange`'s last branch returns a month for any
 * view it does not recognise.
 *
 * This drives both demo pages and compares what came out, chart by chart: the
 * pane columns that survived, how many axis columns were drawn and what the
 * first one says, the row count a screen reader is told, how many rows are
 * actually mounted, how many bars and connectors, and the range label. React is
 * the reference, as scripts/bindings.mjs says.
 *
 * A binding with no charts on the route is reported as NOT PORTED and is
 * neither a pass nor a failure — but if nothing at all was compared the exit is
 * non-zero, for the same reason check-schedule-dom.mjs does it: a green on an
 * empty comparison is worse than a red.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { BINDINGS } from "./bindings.mjs";

const PORTS = { react: 4360, solid: 4361, vanilla: 4362, "web-components": 4363 };
const ROUTES = ["gantt", "production-schedule"];

const argv = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const others = argv.length > 0 ? argv : BINDINGS.map((b) => b.id).filter((id) => id !== "react");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Everything about a chart that both bindings must agree on. */
const survey = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('[role="treegrid"]')].map((g) => ({
      pane: [...g.querySelectorAll('[role="columnheader"]')].slice(0, -1).map((h) => h.textContent.trim()).join(","),
      axisColumns: g.querySelectorAll('[role="columnheader"][aria-label="Timeline"] > div').length,
      firstColumn: (g.querySelector('[role="columnheader"][aria-label="Timeline"] > div') ?? {}).textContent?.trim(),
      rowCount: g.getAttribute("aria-rowcount"),
      colCount: g.getAttribute("aria-colcount"),
      mounted: g.querySelectorAll('[role="row"][aria-rowindex]').length - 1,
      bars: g.querySelectorAll("[data-gantt-bar]").length,
      connectors: g.querySelectorAll('svg[aria-hidden="true"][viewBox] > g > path').length,
      label: g.parentElement.previousElementSibling?.querySelector("span[dir]")?.textContent?.trim(),
    })),
  );

const open = async (browser, id, route) => {
  const binding = BINDINGS.find((b) => b.id === id);
  if (!existsSync(join(binding.dir, "dist-demo", "index.html"))) {
    console.error(`${id}: no demo build — run its build first`);
    process.exit(1);
  }
  const port = PORTS[id];
  const server = spawn(
    "npx",
    ["vite", "preview", "--config", "vite.config.demo.ts", "--port", String(port), "--strictPort"],
    { cwd: binding.dir, stdio: "ignore", detached: true },
  );
  const origin = `http://localhost:${port}${binding.base}/`;
  let up = false;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(origin)).ok) { up = true; break; }
    } catch { /* not listening yet */ }
    await sleep(300);
  }
  const stop = () => { try { process.kill(-server.pid, "SIGTERM"); } catch { /* gone */ } };
  if (!up) { stop(); console.error(`${id}: preview server never came up on ${port}`); process.exit(1); }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
  await sleep(900);
  const result = await survey(page);
  await page.close();
  stop();
  return result;
};

const browser = await chromium.launch();
let compared = 0;
let differences = 0;
const skipped = [];

for (const route of ROUTES) {
  const reference = await open(browser, "react", route);
  for (const id of others) {
    const actual = await open(browser, id, route);
    if (actual.length === 0) {
      console.log(`\n/${route}: ${id} — NOT PORTED`);
      skipped.push(`${id}/${route}`);
      continue;
    }
    console.log(`\n/${route}: react ${reference.length} charts vs ${id} ${actual.length}`);
    if (reference.length !== actual.length) {
      differences += 1;
      console.log(`  FAIL chart COUNT differs — react ${reference.length}, ${id} ${actual.length}`);
    }
    for (let i = 0; i < Math.min(reference.length, actual.length); i++) {
      compared += 1;
      const a = JSON.stringify(reference[i]);
      const b = JSON.stringify(actual[i]);
      if (a === b) continue;
      differences += 1;
      console.log(`  FAIL chart ${i + 1}\n    react: ${a}\n    ${id.padEnd(5)}: ${b}`);
    }
    if (differences === 0) console.log(`  ok   all ${actual.length} charts identical to react`);
  }
}

await browser.close();
if (skipped.length > 0) console.log(`\nNOT PORTED: ${skipped.join(", ")}`);
console.log(
  compared === 0
    ? `\nNOTHING WAS COMPARED — ${skipped.length} route(s) not ported\n`
    : differences === 0
      ? `\nall passed — ${compared} charts compared against react\n`
      : `\n${differences} difference(s) over ${compared} charts compared\n`,
);
process.exit(differences === 0 && compared > 0 ? 0 : 1);
