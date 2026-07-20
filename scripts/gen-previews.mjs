/**
 * Preview thumbnails for the demo catalogue.
 *
 *   node scripts/gen-previews.mjs                 # every binding
 *   node scripts/gen-previews.mjs react solid     # some of them
 *
 * Each demo's Welcome page lists every component from nav.ts as a text card.
 * This renders a picture for each one so the catalogue can be scanned by eye.
 *
 * WHY GENERATED RATHER THAN DRAWN. A hand-made set is stale by the next release
 * and nobody notices, because nothing checks a picture. These come from the
 * demos themselves, so they are wrong only if the demo is wrong.
 *
 * WHAT IS CAPTURED. The FIRST `.example-preview` on the page — the live
 * rendered component, not the page heading and not the code block under it. A
 * full-page shot is the wrong crop for a card: tall, mostly whitespace, and the
 * component itself ends up a hundred pixels of it.
 *
 * WHY NOT COMMITTED. Four bindings x ~85 routes of binary would be several MB
 * in git, re-written wholesale on every regeneration. They are gitignored and
 * built on demand; `deploy.sh` regenerates them so the published site always has
 * them, and the cards degrade to text when a file is missing (see Welcome.tsx).
 * That degradation is deliberate: a missing thumbnail should cost you a picture,
 * not a broken card.
 *
 * WHY THE DEV SERVER, not the built preview. Generating from a build would mean
 * build -> generate -> build again, because the images land in public/ and are
 * only copied on the NEXT build. Running against dev breaks that loop: this
 * works from source, and any build after it picks the images up.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const BINDINGS = {
  react: { dir: "packages/react", base: "/builder", port: 5310, navKey: "to" },
  solid: { dir: "packages/solid", base: "/builder-solid", port: 5311, navKey: "path" },
  vanilla: { dir: "packages/vanilla", base: "/builder-vanilla", port: 5312, navKey: "to" },
  "web-components": { dir: "packages/web-components", base: "/builder-wc", port: 5313, navKey: "to" },
};

// A CROP at card size, not the whole preview scaled down. Two earlier attempts
// are worth recording because both looked reasonable and neither was:
//
//   1. Shoot the full 1100px preview and let the card scale it. A Button became
//      an illegible speck — a 3.5x reduction.
//   2. Shrink the VIEWPORT to card width instead. The demo shell went to its
//      mobile layout, the sidebar became an overlay drawer, and the shot was of
//      the nav rather than the component.
//
// So: keep the desktop viewport, and clip a card-sized window anchored at the
// preview's top-left. The component is then captured at 1:1 and displayed at
// 1:1 — cropped rather than shrunk, which is legible.
//
// deviceScaleFactor 2 so it stays sharp on a retina screen; JPEG because
// Playwright writes png or jpeg only, and a UI screenshot at q72 is a fifth the
// size of the png with no visible difference.
const VIEWPORT_WIDTH = 1100;
const CLIP_W = 340;
const CLIP_H = 170;
const QUALITY = 72;

const argv = process.argv.slice(2);
const which = argv.length ? argv : Object.keys(BINDINGS);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, tries = 120) {
  for (let i = 0; i < tries; i++) {
    try {
      if ((await fetch(url)).ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  return false;
}

/** Catalogue entries only — an item without a description is not a component. */
function routesFor(binding) {
  const cfg = BINDINGS[binding];
  const src = readFileSync(join(cfg.dir, "src/nav.ts"), "utf8");
  const key = cfg.navKey;
  return [...src.matchAll(new RegExp(`\\{[^}]*?${key}: "([^"]+)"[^}]*?\\}`, "g"))]
    .filter((m) => m[0].includes("description:"))
    .map((m) => m[1]);
}

const slug = (route) => (route === "/" ? "_welcome" : route.replace(/^\//, "").replace(/\//g, "-"));

for (const binding of which) {
  const cfg = BINDINGS[binding];
  if (!cfg) {
    console.error(`unknown binding: ${binding}`);
    process.exit(1);
  }

  const routes = routesFor(binding);
  const outDir = join(cfg.dir, "public", "previews");
  // Wipe first: a route that was renamed would otherwise leave its old image
  // behind for ever, and a stale picture is worse than none.
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const server = spawn("npx", ["vite", "--config", "vite.config.demo.ts", "--port", String(cfg.port), "--strictPort"], {
    cwd: cfg.dir,
    stdio: "ignore",
  });

  const origin = `http://localhost:${cfg.port}${cfg.base}/`;
  if (!(await waitForServer(origin))) {
    server.kill();
    throw new Error(`${binding}: dev server never came up on ${cfg.port}`);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: VIEWPORT_WIDTH, height: 900 },
    deviceScaleFactor: 2,
  });

  let written = 0;
  const skipped = [];
  const failed = [];
  for (const route of routes) {
    await page.goto(`http://localhost:${cfg.port}${cfg.base}${route}`, { waitUntil: "networkidle" }).catch(() => {});
    await sleep(250);
    const el = await page.$(".example-preview");
    if (!el) {
      skipped.push(route);
      continue;
    }
    // Some demos (ObjectPage) render inside their own scroller, so the element
    // can sit outside the document box until it is scrolled to.
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await sleep(120);
    const box = await el.boundingBox();
    if (!box || box.width < 8 || box.height < 8) {
      skipped.push(route);
      continue;
    }
    // Take the TOP of the preview at a fixed ratio rather than the whole thing:
    // a tall demo would otherwise produce a skyscraper that a card has to squash.
    const doc = await page.evaluate(() => ({
      w: document.documentElement.scrollWidth,
      h: document.documentElement.scrollHeight,
      sx: window.scrollX,
      sy: window.scrollY,
    }));
    // boundingBox() is viewport-relative; a fullPage clip is document-relative.
    const clip = {
      x: Math.max(0, box.x + doc.sx),
      y: Math.max(0, box.y + doc.sy),
      width: Math.min(CLIP_W, box.width),
      height: Math.min(CLIP_H, box.height),
    };
    // Clamp into the document, or Playwright rejects the whole shot.
    clip.width = Math.max(8, Math.min(clip.width, doc.w - clip.x));
    clip.height = Math.max(8, Math.min(clip.height, doc.h - clip.y));
    try {
      // fullPage, because `clip` is measured against the captured image: without
      // it, any preview below the fold is "outside the resulting image" and
      // throws. Page coordinates are what boundingBox() already gave us.
      await page.screenshot({
        path: join(outDir, `${slug(route)}.jpg`),
        clip,
        fullPage: true,
        type: "jpeg",
        quality: QUALITY,
      });
      written++;
    } catch (err) {
      // One awkward route must not lose the other eighty — but it is reported
      // rather than swallowed, because a missing thumbnail is invisible.
      failed.push(`${route}: ${String(err.message).split("\n")[0]}`);
    }
  }

  await browser.close();
  server.kill();

  console.log(`${binding}: ${written}/${routes.length} previews -> ${outDir}`);
  if (skipped.length) {
    // Named, not silently dropped: a demo with no .example-preview is a demo
    // with nothing rendered in it, which is worth knowing about.
    console.log(`  ${skipped.length} without a rendered example: ${skipped.slice(0, 10).join(", ")}${skipped.length > 10 ? " …" : ""}`);
  }
  if (failed.length) {
    console.log(`  ${failed.length} FAILED:`);
    failed.slice(0, 10).forEach((f) => console.log(`    ${f}`));
  }
  if (!existsSync(outDir)) console.log("  (nothing written)");
}
