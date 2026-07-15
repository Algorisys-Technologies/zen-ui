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

// ---- the POINTER path -----------------------------------------------------
// The keyboard path above and the drag below must reach the same model. This
// section exists because a review that only drove the keyboard let a drag
// regression through: the detector matched the nearest chip rather than the one
// under the pointer, so every drop silently did nothing.
const dragChip = async (field, zoneTitle) => {
  // The CHIP, not its ⋮ handle — the handle swallows pointerdown so its menu can
  // open, so it is deliberately not a drag surface.
  const src = page.locator(`[data-pivot-chip="${field}"]`).first();
  const box = await src.boundingBox();
  const zt = await page.locator(`div:text-is("${zoneTitle}")`).first().boundingBox();
  if (!box || !zt) return bad("drag setup", `no box for ${field} -> ${zoneTitle}`);
  const to = { x: zt.x + 70, y: zt.y + 34 };
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 16; i++) {
    await page.mouse.move(
      box.x + box.width / 2 + ((to.x - box.x - box.width / 2) * i) / 16,
      box.y + box.height / 2 + ((to.y - box.y - box.height / 2) * i) / 16,
    );
    await page.waitForTimeout(20);
  }
  await page.mouse.up();
  await page.waitForTimeout(400);
};

await dragChip("Department", "Columns");
s = await zones();
if (s.Columns?.includes("Department")) ok(`DRAG: Department -> Columns (empty zone) — ${show(s)}`);
else bad("drag to an empty zone", show(s));

await dragChip("Gender", "Columns");
s = await zones();
if (s.Columns?.length === 2 && s.Columns.includes("Gender")) ok(`DRAG: a second field into a POPULATED zone — Columns[${s.Columns.join(",")}]`);
else bad("drag into a populated zone", show(s));

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

// The INVARIANT, not the tally: absolute counts depend on the grid's
// dimensions, which differ between runs. Every <th> that carries meaning must
// carry scope; the only ones that may not are the aria-hidden spacers used for
// column padding, which name nothing.
const unscoped = await page.locator("th:not([scope])").evaluateAll((els) =>
  els.filter((e) => e.getAttribute("aria-hidden") !== "true").length,
);
const ths = await page.locator("th").count();
if (ths > 0 && unscoped === 0) ok(`every meaningful header carries scope (${ths} <th>, ${unscoped} unscoped and not aria-hidden)`);
else bad("th scope", `${unscoped} of ${ths} <th> have no scope and are not aria-hidden — those headers are unassociated`);

const region = page.locator('[role="region"]').first();
const label = await region.getAttribute("aria-label");
if (label && label !== "Data Grid") ok(`the grid region is named ("${label}")`);
else bad("grid label", `aria-label is ${JSON.stringify(label)} — hardcoded/absent`);

// ---- the drag has to LOOK like a drag ------------------------------------
// LAST, deliberately: a half-way release lands wherever each demo's layout puts
// it, and Escape cancels a drag in dnd-kit but not in solid-dnd — so this check
// can end with the two layouts in different states. Running it after every
// state assertion makes that irrelevant instead of a false parity failure.
// Not decoration: without it a drag gives no feedback at all — you press, the
// chip stays put, and nothing says the gesture registered. The two bindings do
// it differently and both are correct: Solid translates the source element,
// React (dnd-kit) floats an overlay and dims the source, because dnd-kit does
// not displace a drag source across containers. So this asserts the behaviour a
// user sees — something follows the pointer — not the mechanism.
const midDrag = await (async () => {
  const src = page.locator('[data-pivot-chip="Country"]').first();
  const box = await src.boundingBox();
  const zt = await page.locator('div:text-is("Rows")').first().boundingBox();
  if (!box || !zt) return null;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) {
    await page.mouse.move(
      box.x + box.width / 2 + ((zt.x + 70 - box.x - box.width / 2) * i) / 16,
      box.y + box.height / 2 + ((zt.y + 34 - box.y - box.height / 2) * i) / 16,
    );
    await page.waitForTimeout(20);
  }
  await page.waitForTimeout(180);
  const m = await page.evaluate(() => {
    const el = document.querySelector('[data-pivot-chip="Country"]');
    const ov = document.querySelector("[data-pivot-drag-overlay]");
    return {
      source: el ? getComputedStyle(el).transform : "none",
      overlay: ov?.parentElement ? getComputedStyle(ov.parentElement).transform : null,
    };
  });
  // Cancel rather than drop. This check is about the visual feedback, and a
  // half-way release lands wherever the layout happens to put it — which is not
  // the same pixel in both demos, so it would mutate the layout differently in
  // each and the parity diff would flag a difference that is not one.
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await page.waitForTimeout(300);
  return m;
})();
const moves = (t) => Boolean(t) && t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)";
if (midDrag && (moves(midDrag.source) || moves(midDrag.overlay)))
  ok(`mid-drag, something follows the pointer (${moves(midDrag.source) ? "the chip itself" : "a drag overlay"})`);
else bad("drag feedback", `source=${midDrag?.source} overlay=${midDrag?.overlay} — the drag is invisible`);

// ---- Escape cancels ------------------------------------------------------
// A drag begun by accident must be abandonable. dnd-kit ships this; solid-dnd
// does not, so the Solid binding raises a flag its drop handler reads — and
// both announce the same sentence, because a cancel that is silent is
// indistinguishable from a drop that did nothing.
{
  const beforeCancel = JSON.stringify(await zones());
  const src = page.locator('[data-pivot-chip="Name"]').first();
  const box = await src.boundingBox();
  const zt = await page.locator('div:text-is("Rows")').first().boundingBox();
  if (box && zt) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 16; i++) {
      await page.mouse.move(
        box.x + box.width / 2 + ((zt.x + 70 - box.x - box.width / 2) * i) / 16,
        box.y + box.height / 2 + ((zt.y + 34 - box.y - box.height / 2) * i) / 16,
      );
      await page.waitForTimeout(18);
    }
    // Fully over the target: releasing here WOULD drop it.
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    await page.mouse.up();
    await page.waitForTimeout(320);

    const afterCancel = JSON.stringify(await zones());
    if (afterCancel === beforeCancel) ok("Escape mid-drag cancels — the layout is untouched");
    else bad("escape cancel", `the field moved anyway:\n       ${beforeCancel}\n    -> ${afterCancel}`);

    const said = (await page.locator('[aria-live="polite"]').first().innerText()).trim();
    if (/cancelled/i.test(said)) ok(`…and says so ("${said}")`);
    else bad("cancel announcement", `aria-live reads "${said}"`);
  } else bad("escape setup", "no drag surface");
}

// ---- clean ---------------------------------------------------------------
if (errors.length === 0) ok("no console/page errors");
else bad("console", errors.slice(0, 2).join(" | "));

await browser.close().catch(() => {});
clearTimeout(deadline);
console.log(fails.length ? `\n  FAILED (${fails.length}): ${fails.join(", ")}` : `\n  the pivot works`);
process.exit(fails.length ? 1 : 0);
