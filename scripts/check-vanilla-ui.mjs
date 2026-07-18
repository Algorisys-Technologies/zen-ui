/**
 * What a browser owns for the vanilla binding.
 *
 *   node scripts/check-vanilla-ui.mjs <url-base>
 *
 * The other bindings get their behaviour from Radix and Kobalte, which are tested
 * upstream. This one wrote its own — focus trap, scroll lock, dismiss, roving
 * focus, presence, and a mask that drives core's engine — so the behaviour is only
 * as good as this file says it is.
 *
 * Everything here is a claim the demos make in prose. A screenshot cannot check
 * any of it: a Select that never opens photographs exactly like one that does.
 */
import { chromium } from "playwright";

const base = process.argv[2];
if (!base) {
  console.error("usage: node scripts/check-vanilla-ui.mjs <url-base>");
  process.exit(2);
}

const fails = [];
const ok = (n) => console.log(`  ok   ${n}`);
const bad = (n, d) => {
  fails.push(n);
  console.log(`  FAIL ${n}\n       ${d}`);
};

const deadline = setTimeout(() => {
  console.log("\n  TIMED OUT");
  process.exit(2);
}, 90_000);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
page.setDefaultTimeout(5000);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).split("\n")[0].slice(0, 110)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 110)));

/* ---------------------------------------------------------------- MaskInput */
console.log("\nMaskInput — core's engine, reached through the DOM");
await page.goto(`${base}/input`, { waitUntil: "networkidle" });

const mask = page.locator('input[inputmode="numeric"]').first();
await mask.click();
await mask.type("123456");
const masked = await mask.inputValue();
masked === "12-3456"
  ? ok(`typing 123456 into mask "99-9999" gives "${masked}"`)
  : bad("the mask formats as you type", `expected "12-3456", got "${masked}"`);

/* Letters must not land in a digit slot. applyMask decides this, not the DOM, and
 * the trailing literal is core's choice: applyMask("12", "99-9999") is "12-". */
await mask.fill("");
await mask.type("ab12");
const rejected = await mask.inputValue();
rejected === "12-"
  ? ok('letters are rejected by a digit mask ("ab12" -> "12-")')
  : bad("a digit mask rejects letters", `expected "12-", got "${rejected}"`);

/**
 * The backspace bug the React binding fixed: left to the browser, backspace
 * deletes the trailing LITERAL, applyMask puts it straight back, and the field
 * jams forever. Deleting must remove a DATA character.
 */
await mask.fill("");
await mask.type("123");
await mask.press("Backspace");
await mask.press("Backspace");
const afterDelete = await mask.inputValue();
afterDelete === "1"
  ? ok('backspace deletes data, not the literal ("12-3" -> two presses -> "1")')
  : bad("backspace deletes through the literal", `expected "1", got "${afterDelete}"`);

/* ------------------------------------------------------------------- Select */
console.log("\nSelect — the listbox this binding wrote by hand");
await page.goto(`${base}/select`, { waitUntil: "networkidle" });

const trigger = page.locator('button[role="combobox"]').first();
const listbox = page.locator('[role="listbox"]').first();

(await listbox.isVisible()) ? bad("the list starts closed", "it is visible on load") : ok("the list starts closed");

await trigger.click();
(await listbox.isVisible()) ? ok("clicking the trigger opens the list") : bad("the trigger opens the list", "still hidden");

await page.locator('[role="option"]', { hasText: "Cherry" }).first().click();
await page.waitForTimeout(320); // the list fades out over 200ms; assert after it
const chosen = (await trigger.textContent())?.trim();
chosen?.includes("Cherry")
  ? ok(`picking an option shows it on the trigger ("${chosen}")`)
  : bad("the trigger shows the choice", `got "${chosen}"`);
(await listbox.isVisible()) ? bad("picking closes the list", "still open") : ok("picking closes the list");

/* Escape and outside-click are DismissableLayer's whole job. */
await trigger.click();
await page.keyboard.press("Escape");
await page.waitForTimeout(320);
(await listbox.isVisible()) ? bad("Escape closes the list", "still open") : ok("Escape closes the list");

await trigger.click();
await page.mouse.click(5, 5);
await page.waitForTimeout(320);
(await listbox.isVisible()) ? bad("an outside click closes the list", "still open") : ok("an outside click closes the list");

/* A disabled option must be unreachable, not merely grey. */
await trigger.click();
const durian = page.locator('[role="option"][aria-disabled="true"]').first();
(await durian.count())
  ? ok("the disabled option is marked aria-disabled")
  : bad("the disabled option is marked", "no aria-disabled option found");
await page.keyboard.press("Escape");

/* The hidden native select is what makes `name` true rather than decorative. */
const hidden = await page.locator('select[name="fruit"]').count();
hidden
  ? ok("a real <select name> backs the component, so a form submits it")
  : bad("the hidden native select exists", "no select[name=fruit] found");

/* ------------------------------------------------------------------- Dialog */
console.log("\nDialog — portal, focus trap, scroll lock, dismiss");
await page.goto(`${base}/dialog`, { waitUntil: "networkidle" });

const openBtn = page.locator("button", { hasText: "Open trap demo" }).first();
await openBtn.click();
const dialog = page.locator('[role="dialog"]').first();
(await dialog.isVisible()) ? ok("the dialog opens") : bad("the dialog opens", "not visible");

/* Portalled to <body>: an ancestor with overflow/transform would otherwise clip
 * it or steal its containing block. */
const portalled = await page.evaluate(
  () => document.querySelector('[role="dialog"]')?.parentElement === document.body,
);
portalled ? ok("it is portalled to <body>") : bad("it is portalled to <body>", "it rendered in place");

/* Assert the INLINE style, not the computed one. This demo's own index.css sets
 * `body { overflow: hidden }` by design — the shell scrolls its panes, not the
 * page — so the computed value is "hidden" whether the lock ran or not, and a
 * check on it passes for the wrong reason. The inline style is what scrollLock
 * owns and the only thing that proves it fired. */
const locked = await page.evaluate(() => document.body.style.overflow);
locked === "hidden" ? ok("the page behind is scroll-locked (inline)") : bad("scroll lock", `inline overflow is "${locked || "(none)"}"`);

/* Tab must cycle WITHIN the surface. Press it more times than there are
 * focusables: if focus can escape, it will have by now. */
let escaped = false;
for (let i = 0; i < 8; i++) {
  await page.keyboard.press("Tab");
  const inside = await page.evaluate(() =>
    document.querySelector('[role="dialog"]')?.contains(document.activeElement),
  );
  if (!inside) escaped = true;
}
escaped ? bad("focus is trapped", "Tab escaped the dialog") : ok("focus is trapped across 8 tabs");

await page.keyboard.press("Escape");
await page.waitForTimeout(320);
(await dialog.isVisible()) ? bad("Escape closes it", "still open") : ok("Escape closes it");

const unlocked = await page.evaluate(() => document.body.style.overflow);
unlocked === "" ? ok("closing releases the scroll lock") : bad("scroll lock released", `inline overflow is still "${unlocked}"`);

const refocused = await page.evaluate(
  () => document.activeElement?.textContent?.includes("Open trap demo") ?? false,
);
refocused ? ok("focus returns to the trigger") : bad("focus returns to the trigger", "it went elsewhere");

/* The blocking dialog must NOT be dismissable — AlertDialog semantics. */
await page.locator("button", { hasText: "Open blocking dialog" }).first().click();
await page.keyboard.press("Escape");
(await page.locator('[role="dialog"]').first().isVisible())
  ? ok("dismissable:false ignores Escape")
  : bad("dismissable:false ignores Escape", "Escape closed a blocking dialog");

clearTimeout(deadline);
await browser.close();

if (errors.length) {
  console.log("\nconsole / page errors");
  for (const e of [...new Set(errors)]) bad("no runtime errors", e);
}

console.log(fails.length ? `\n${fails.length} FAILED\n` : "\nall passed\n");
process.exit(fails.length ? 1 : 0);
