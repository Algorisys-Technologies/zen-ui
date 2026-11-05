/**
 * The "nothing else broke" check: snapshot every demo route's accessibility
 * tree (the text, names, roles and states a user and a screen reader get) of a
 * running demo, before a change and after; then compare-route-snapshots.mjs.
 *
 *   node scripts/snapshot-routes.mjs http://localhost:5173/builder-solid before.json [solid|react|vanilla|web-components]
 *
 * Any binding: Solid's nav.ts names routes `path:`, the others `to:`.
 *
 * Deterministic on purpose: a fixed clock and Math.random, a cleared
 * localStorage, generated ids masked. Two runs of unchanged code agree on every
 * route except the welcome page's lazily loaded preview images, which the
 * comparer ignores. A sweeping change (B1's strings, 25 components at a time)
 * was proven with it: every pre-existing route identical.
 */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
const require = createRequire(new URL("../package.json", import.meta.url));
const { chromium } = require("playwright");
const [base, out, binding = "solid"] = process.argv.slice(2);
if (!base || !out) {
  console.error("usage: node scripts/snapshot-routes.mjs <demo base url> <out.json> [solid|react|vanilla|web-components]");
  process.exit(2);
}
const nav = readFileSync(new URL(`../packages/${binding}/src/nav.ts`, import.meta.url), "utf8");
const routes = [...new Set([...nav.matchAll(/\b(?:path|to): "(\/[^"]*)"/g)].map((m) => m[1]))];
// A snapshot of nothing compares "identical" to another snapshot of nothing.
if (routes.length === 0) {
  console.error(`no routes found in packages/${binding}/src/nav.ts`);
  process.exit(1);
}
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1366, height: 1000 }, locale: "en-US", timezoneId: "Asia/Kolkata" });
// A fixed clock: demos that show "today" must snapshot the same on both runs.
await ctx.addInitScript(() => {
  const fixed = new Date(2026, 10, 4, 10, 0, 0).getTime();
  const RealDate = Date;
  class FixedDate extends RealDate { constructor(...a) { super(...(a.length ? a : [fixed])); } static now() { return fixed; } }
  globalThis.Date = FixedDate;
  Math.random = (() => { let s = 42; return () => ((s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 2 ** 32); })();
  try { localStorage.clear(); } catch {}
});
const snaps = {};
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
for (const r of routes) {
  try {
    await page.goto(`${base}${r}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(400);
    const main = page.locator("main").first();
    const aria = await main.ariaSnapshot({ timeout: 15000 });
    // Generated ids and media timings vary run to run; mask the obvious ones.
    snaps[r] = aria.replace(/\b(cl|kb|zen)-[\w-]*\d[\w-]*/g, "<id>").replace(/\d+:\d{2}(:\d{2})?/g, "<time>");
  } catch (e) {
    snaps[r] = `<<error: ${String(e.message).split("\n")[0]}>>`;
  }
}
writeFileSync(out, JSON.stringify(snaps, null, 1));
console.log(`${Object.keys(snaps).length} routes, ${Object.values(snaps).filter((s) => s.startsWith("<<error")).length} errors -> ${out}`);
await browser.close();
