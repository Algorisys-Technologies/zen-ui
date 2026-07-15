/**
 * One driven contract, run against BOTH bindings.
 *
 *   node scripts/check-pivot-ui.mjs <url>
 *
 * The pivot's model is pinned by scripts/check-pivot.ts without a browser. This
 * pins what a browser owns, and it is deliberately the SAME file for React and
 * Solid: two contracts would drift exactly where parity matters, and every
 * assertion below is about behaviour both bindings owe, never about how either
 * one is built.
 *
 * Everything here failed at least once for real:
 *   - a second field into a populated zone silently did nothing (the drag
 *     resolved a field key as a zone name and the field was deleted)
 *   - there was no keyboard path to the builder at all
 *   - nothing was announced
 */
import { chromium } from "playwright";

const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/check-pivot-ui.mjs <url>");
  process.exit(2);
}

const fails = [];
const ok = (n) => console.log(`  ok   ${n}`);
const bad = (n, d) => { fails.push(n); console.log(`  FAIL ${n}\n       ${d}`); };

// node will not die on SIGTERM with a browser open, so the deadline is ours.
const deadline = setTimeout(() => { console.log("\n  TIMED OUT"); process.exit(2); }, 90_000);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).split("\n")[0].slice(0, 110)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 110)));

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

/** What each zone holds, read from the chips' own accessible names. */
const zones = async () =>
  await page.evaluate(() => {
    const NAMES = ["Available Fields", "Values", "Rows", "Columns"];
    const out = {};
    for (const el of document.querySelectorAll("div")) {
      const t = el.textContent?.trim();
      if (!NAMES.includes(t) || el.children.length) continue;
      const root = el.parentElement?.parentElement;
      if (root)
        out[t] = [...root.querySelectorAll('[aria-label^="Move "]')].map((c) =>
          c.getAttribute("aria-label").replace("Move ", ""),
        );
    }
    return out;
  });
const show = (s) => Object.entries(s).map(([k, v]) => `${k}[${v.join(",")}]`).join("  ");

const openMenu = async (field) => {
  // pointerdown, not click: it is what both dnd libraries listen for, and what
  // a menu trigger opens on.
  await page.evaluate((f) => {
    document
      .querySelector(`[aria-label="Move ${f}"]`)
      ?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
  }, field);
  await page.waitForTimeout(320);
};
const choose = async (label) => {
  await page.getByRole("menuitem", { name: label, exact: true }).first().click();
  await page.waitForTimeout(320);
};

// ---- the builder rendered -------------------------------------------------
const start = await zones();
if (Object.keys(start).length === 4) ok(`four zones: ${Object.keys(start).join(", ")}`);
else bad("zones", `found ${JSON.stringify(Object.keys(start))}`);
if (start["Available Fields"]?.length >= 6) ok(`${start["Available Fields"].length} fields available to start`);
else bad("fields", show(start));

// ---- the keyboard path ----------------------------------------------------
// solid-dnd has pointer sensors only and dnd-kit's keyboard sensor is a drag
// emulation; either way a menu is the alternative WAI-ARIA actually asks for.
const handle = page.locator('[aria-label="Move Country"]').first();
const tag = await handle.evaluate((e) => e.tagName);
if (tag === "BUTTON") ok("the move handle is a real <button>");
else bad("handle", `is <${tag}> — a keyboard user cannot reach it`);

await handle.focus();
if ((await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === "Move Country")
  ok("…and it takes focus");
else bad("focus", "the handle does not take focus");

await openMenu("Country");
const items = await page.getByRole("menuitem").allInnerTexts();
if (items.slice(0, 3).join(",") === "Rows,Columns,Values") ok(`it offers every zone but its own: [${items.join(", ")}]`);
else bad("menu", JSON.stringify(items));
if ((await handle.getAttribute("aria-expanded")) === "true") ok("aria-expanded tracks the menu");
else bad("aria-expanded", "not reflected");

// ---- moving, without a drag ----------------------------------------------
await choose("Rows");
let s = await zones();
if (s.Rows?.includes("Country")) ok(`Country -> Rows — ${show(s)}`);
else bad("move", show(s));

// THE BUG THAT SHIPPED: the second field into a populated zone did nothing.
await openMenu("City");
await choose("Rows");
s = await zones();
if (s.Rows?.length === 2 && s.Rows.includes("City")) ok(`a SECOND field into a populated zone — Rows[${s.Rows.join(",")}]`);
else bad("second field into a populated zone", show(s));

await openMenu("Salary");
await choose("Values");
s = await zones();
if (s.Values?.includes("Salary")) ok(`Salary -> Values — ${show(s)}`);
else bad("values", show(s));

// ---- a field lives in exactly one zone -----------------------------------
await openMenu("Country");
await choose("Columns");
s = await zones();
if (s.Columns?.includes("Country") && !s.Rows?.includes("Country")) ok("moving a field takes it out of its old zone");
else bad("one zone", show(s));

// ---- announcements --------------------------------------------------------
const live = page.locator('[aria-live="polite"]').first();
const text = (await live.innerText()).trim();
if (/Country moved to Columns/.test(text)) ok(`announced: "${text}"`);
else bad("announcement", `aria-live reads "${text}"`);
const liveMeta = await live.evaluate((e) => {
  const cs = getComputedStyle(e);
  const r = e.getBoundingClientRect();
  return { atomic: e.getAttribute("aria-atomic"), w: Math.round(r.width), h: Math.round(r.height), display: cs.display };
});
// sr-only is a 1x1 CLIPPED box, not display:none and not 0x0 — either of those
// would hide it from the screen readers it exists for.
if (liveMeta.atomic === "true" && liveMeta.display !== "none" && liveMeta.w <= 1 && liveMeta.h <= 1)
  ok(`the live region is atomic and sr-only (${liveMeta.w}x${liveMeta.h}px, not display:none)`);
else bad("live region", JSON.stringify(liveMeta));

// ---- removal --------------------------------------------------------------
await openMenu("Country");
await choose("Remove from layout");
s = await zones();
if (s["Available Fields"]?.includes("Country")) ok("a field can be removed the same way");
else bad("remove", show(s));

// ---- the grid -------------------------------------------------------------
await openMenu("Country");
await choose("Rows");
await page.getByRole("button", { name: "View Data" }).first().click();
await page.waitForTimeout(700);

const grid = page.locator("table").first();
if (await grid.count()) ok("View Data renders a grid");
else bad("grid", "no <table>");

// role="grid" is a CONTRACT — arrow-key navigation and a roving tabindex. It
// claimed it and had neither, which tells a screen-reader user to navigate a
// way that does not work.
const gridRole = await grid.getAttribute("role");
if (gridRole !== "grid") ok(`the table does not claim role="grid" without grid navigation (role=${gridRole ?? "implicit table"})`);
else bad("role=grid", "claims grid semantics but has no arrow-key navigation");

const scoped = await page.locator("th[scope]").count();
const ths = await page.locator("th").count();
if (ths > 0 && scoped > 0) ok(`${scoped}/${ths} headers carry scope`);
else bad("th scope", `${scoped} of ${ths} <th> have scope — headers are unassociated`);

const region = page.locator('[role="region"]').first();
const label = await region.getAttribute("aria-label");
if (label && label !== "Data Grid") ok(`the grid region is named ("${label}")`);
else bad("grid label", `aria-label is ${JSON.stringify(label)} — hardcoded/absent`);

// ---- clean ---------------------------------------------------------------
if (errors.length === 0) ok("no console/page errors");
else bad("console", errors.slice(0, 2).join(" | "));

await browser.close().catch(() => {});
clearTimeout(deadline);
console.log(fails.length ? `\n  FAILED (${fails.length}): ${fails.join(", ")}` : `\n  the pivot works`);
process.exit(fails.length ? 1 : 0);
