/**
 * One driven contract, run against EVERY binding: does the accordion actually
 * animate open, or does it snap?
 *
 *   node scripts/check-collapsible-var.mjs <binding> <url>
 *
 * core/styles/tokens.css owns the accordion keyframes and is shared by every
 * binding. Two things were wrong with it, and each one alone was enough to kill
 * the animation — which is why neither was ever noticed:
 *
 *  1. `.zen-anim-accordion-down` was a hand-written CSS class. Both bindings only
 *     ever use it as a VARIANT (`data-[state=open]:zen-anim-accordion-down`) —
 *     24 usages across the two, zero bare — and UnoCSS cannot build a variant of
 *     a class it does not own, so the variant generated no CSS at all.
 *  2. The keyframe interpolated height to `var(--radix-accordion-content-height)`,
 *     a Radix-specific name, in the one file that is meant to be framework-agnostic.
 *     Kobalte publishes `--kb-accordion-content-height`; a binding with no
 *     primitive library publishes neither.
 *
 * So the library's animation layer had never run, in either binding. Nothing could
 * see it: the class is spelled correctly, the keyframes are real, the build is
 * green, and a screenshot of an open accordion looks perfect. The bug lives only
 * in the 200ms nobody photographs.
 *
 * This asserts the BEHAVIOUR — the height interpolates — rather than a class name
 * or a variable name, so it cannot be satisfied by a binding that merely defines
 * either, and it stays honest if the implementation changes again.
 */
import { chromium } from "playwright";

const [binding, url] = process.argv.slice(2);
if (!url) {
  console.error("usage: node scripts/check-collapsible-var.mjs <binding> <url>");
  process.exit(2);
}

const deadline = setTimeout(() => {
  console.log("\n  TIMED OUT");
  process.exit(2);
}, 60_000);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
page.setDefaultTimeout(5000);
await page.goto(url, { waitUntil: "networkidle" });

const fail = async (msg) => {
  clearTimeout(deadline);
  await browser.close();
  console.log(`  FAIL ${msg}\n`);
  process.exit(1);
};

console.log(`\n${binding} — accordion open transition`);

/* Anchor on the CONTENT, not on a trigger.
 *
 * Two traps here, both of which produced a confident wrong answer:
 *  - `button[aria-expanded=false]` is not an accordion trigger. The first one on
 *    the page is the app shell's theme switcher.
 *  - The first `[data-state=open]` is not the section you opened. React's demo
 *    starts section 0 expanded (`defaultValue="0"`), and an item that MOUNTS open
 *    legitimately carries an inline `animation-name: none` — both Radix and
 *    Kobalte suppress the mount animation on purpose. Measuring it reports a
 *    false failure against a component that works.
 *
 * The content element is the one carrying our animation class. That class is a
 * VARIANT, so it lives in the class ATTRIBUTE but never as a bare class — hence
 * the substring match rather than a class selector, which matches nothing. */
const CONTENT = '[class*="zen-anim-accordion-down"]';

/* Click and sample in ONE page evaluation. Kobalte UNMOUNTS closed content where
 * Radix keeps it and toggles `hidden`, so the element does not exist until the
 * click — and a round trip back to node to locate it would spend some of the
 * 200ms we came to measure. */
const t = await page.evaluate(async (sel) => {
  /* Scope to the demo body: the app shell's theme switcher is also a
   * `button[aria-expanded=false]`, and it is the first one on the page. */
  const trigger = document.querySelector('.demo-page button[aria-expanded="false"]');
  if (!trigger) return { err: "no closed accordion trigger inside .demo-page" };

  trigger.click();
  await new Promise((r) => requestAnimationFrame(r));

  /* Walk up from the trigger to the nearest ancestor that contains a content
   * element — that ancestor is the accordion Item, which holds exactly one.
   * Works whichever primitive library is underneath, and does not depend on
   * aria-controls (Radix sets it; Kobalte does not). */
  let node = trigger;
  let el = null;
  while (node && !el) {
    node = node.parentElement;
    el = node?.querySelector(sel) ?? null;
  }
  if (!el) return { err: "no content element appeared after clicking the trigger" };

  const cs = getComputedStyle(el);
  const out = {
    anim: cs.animationName,
    inlineAnim: el.style.animationName || "",
    zen: cs.getPropertyValue("--zen-collapsible-content-height").trim(),
    heights: [],
  };
  const t0 = performance.now();
  while (performance.now() - t0 < 260) {
    out.heights.push(Math.round(parseFloat(getComputedStyle(el).height) || 0));
    await new Promise((r) => requestAnimationFrame(r));
  }
  return out;
}, CONTENT);

if (t.err) await fail(t.err);

const distinct = new Set(t.heights).size;
console.log(`  animation-name                   ${t.anim}${t.inlineAnim ? ` (inline: ${t.inlineAnim})` : ""}`);
console.log(`  --zen-collapsible-content-height ${t.zen || "(unset)"}`);
console.log(`  height over 260ms                ${distinct} distinct value(s), settling at ${t.heights.at(-1)}px`);

clearTimeout(deadline);
await browser.close();

/* A real 200ms height animation produces a dozen-plus distinct values; a snap
 * produces one or two. There is no honest middle. */
const animates = distinct > 2;
console.log(
  animates
    ? `\n  ok   the content height interpolates — the accordion slides\n`
    : `\n  FAIL the height never interpolates — the accordion snaps open\n`,
);
process.exit(animates ? 0 : 1);
