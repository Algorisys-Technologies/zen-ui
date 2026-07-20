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

/**
 * Kill the child's whole process GROUP, retrying through ESRCH.
 *
 * `server.kill()` signals the npx wrapper and leaves the real vite process
 * holding the port. Because this script health-checks the PORT rather than the
 * process, the next run then binds nothing, talks to the orphan, and
 * screenshots stale source — which is what made three consecutive runs disagree
 * about which routes had rendered.
 *
 * The ESRCH retry is not paranoia: `detached: true` makes the child call
 * setsid() AFTER the fork, so a kill fired moments after spawn races it, throws
 * ESRCH, and reaches nobody. Same trap and same fix as dev-all.mjs.
 */
async function killGroup(child) {
  for (let i = 0; i < 20; i++) {
    if (child.exitCode !== null || child.signalCode) return;
    try {
      process.kill(-child.pid, "SIGTERM");
      return;
    } catch (err) {
      if (err.code !== "ESRCH") return;
      await sleep(50);
    }
  }
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
    // detached, so killGroup() below can signal the whole group. Without it the
    // real vite process outlives the npx wrapper and keeps the port.
    detached: true,
  });

  const origin = `http://localhost:${cfg.port}${cfg.base}/`;
  if (!(await waitForServer(origin))) {
    await killGroup(server);
    throw new Error(`${binding}: dev server never came up on ${cfg.port}`);
  }

  const browser = await chromium.launch();
  const newPage = () =>
    browser.newPage({ viewport: { width: VIEWPORT_WIDTH, height: 900 }, deviceScaleFactor: 2 });
  let page = await newPage();

  let written = 0;
  const unrendered = [];
  const failed = [];
  const fellBack = [];
  // A hard ceiling per route. `networkidle` never settles on a page that keeps
  // the network or the event loop busy, and vanilla's /skip-to-content wedged
  // the whole run there — twice, holding the deploy indefinitely rather than
  // failing it. No single route may cost more than this; on timeout the route
  // is named and the loop moves on.
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(15000);

  // A wall-clock ceiling on the WHOLE route, not just on individual Playwright
  // calls. Per-call timeouts were not enough: vanilla's /skip-to-content still
  // wedged the loop, and a hang is worse than a failure — the deploy stops with
  // no output and no exit, and reads as slowness for as long as you will wait.
  // It cost three deploy attempts before I stopped assuming it was slow.
  //
  // Racing a timer means nothing Playwright does can exceed the budget: if the
  // work never settles, the race does, the route is named, and the loop moves
  // on. The abandoned promise leaks until the browser closes, which is a fair
  // price for a run that always terminates.
  const withCeiling = (work, ms = 25000) =>
    Promise.race([work, sleep(ms).then(() => "TIMEOUT")]);

  // Recycle the page every RECYCLE_EVERY routes.
  //
  // DIAGNOSED 2026-07-20, after two deploys were lost to it. vanilla's
  // /skip-to-content was blamed and is innocent: fresh, it renders in 355ms on
  // the dev server and 56ms on preview. What actually happens is that the vite
  // DEV server degrades over a long single-page crawl — a faithful replica
  // stalled at exactly the same place, route 78 of 82, having written 77 files,
  // while the identical crawl against `vite preview` sailed past it. Neither
  // the route nor its position is the cause; the accumulated dev session is.
  //
  // A fresh page resets that. It is cheaper than switching to the preview
  // server, which would put us back to build -> generate -> build.
  const RECYCLE_EVERY = 25;
  let sinceRecycle = 0;

  for (const route of routes) {
    if (sinceRecycle >= RECYCLE_EVERY) {
      await page.close().catch(() => {});
      page = await newPage();
      page.setDefaultTimeout(8000);
      page.setDefaultNavigationTimeout(15000);
      sinceRecycle = 0;
    }
    sinceRecycle++;
    const outcome = await withCeiling(
      (async () => {
    await page
      .goto(`http://localhost:${cfg.port}${cfg.base}${route}`, { waitUntil: "domcontentloaded" })
      .catch(() => {});
    // Wait for the demo to actually render. `networkidle` says the network went
    // quiet, not that the route mounted — and a fixed sleep is a race: the set
    // of routes that "had no rendered example" CHANGED between two runs, which
    // is what gave the race away.
    await page.waitForSelector(".demo-page", { timeout: 6000 }).catch(() => {});
    await page.waitForSelector(".example-preview", { timeout: 3000 }).catch(() => {});
    await sleep(250);
    // Fall back to the page itself when a demo renders no live example. Leaving
    // the file out instead means the card requests an image that 404s: the <img>
    // hides itself, but the browser still logs a console error, and check-site
    // fails the whole deploy on console errors at a demo's root. Three Solid
    // routes did exactly that. Every catalogue route gets a file.
    let el = await page.$(".example-preview");
    let fallback = false;
    if (!el) {
      el = await page.$(".demo-page");
      fallback = true;
    }
    // Some demos (ObjectPage) render inside their own scroller, so the element
    // can sit outside the document box until it is scrolled to.
    if (el) {
      await el.scrollIntoViewIfNeeded().catch(() => {});
      await sleep(120);
    }
    const box = el ? await el.boundingBox() : null;
    if (!box || box.width < 8 || box.height < 8) {
      // Last resort: shoot the viewport anyway. A file MUST exist for every
      // catalogue route — if one is missing the card requests it, the browser
      // logs a 404, and check-site fails the deploy on console errors at a
      // demo's root. That is not hypothetical: it blocked the 9.0.3 deploy.
      //
      // And "did it render?" is not a reliable question to build on. Three
      // consecutive runs named DIFFERENT routes as unrendered
      // (/fab,/tag-input,/phone-input, then /toast,/scroll-area,/select-dialog,
      // /value-help, then /toast,/tree), so it is dev-server timing, not
      // markup. Guaranteeing the file removes the whole class.
      unrendered.push(route);
      await page
        .screenshot({
          path: join(outDir, `${slug(route)}.jpg`),
          clip: { x: 0, y: 0, width: CLIP_W, height: CLIP_H },
          type: "jpeg",
          quality: QUALITY,
        })
        .catch((err) => failed.push(`${route}: ${String(err.message).split("\n")[0]}`));
      written++;
      return "OK";
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
      if (fallback) fellBack.push(route);
    } catch (err) {
      // One awkward route must not lose the other eighty — but it is reported
      // rather than swallowed, because a missing thumbnail is invisible.
      failed.push(`${route}: ${String(err.message).split("\n")[0]}`);
    }
        return "OK";
      })(),
    );
    if (outcome === "TIMEOUT") {
      unrendered.push(`${route} (hit the per-route ceiling)`);
      // A FRESH page for the placeholder. Screenshotting the wedged one hangs
      // too — that is what wedged it — and the .catch() then swallowed the
      // failure, so the file was never written and the card 404'd anyway,
      // which is the exact thing this fallback exists to prevent.
      const spare = await browser.newPage({ viewport: { width: CLIP_W, height: CLIP_H } });
      await spare
        .screenshot({ path: join(outDir, `${slug(route)}.jpg`), type: "jpeg", quality: QUALITY })
        .catch((err) => failed.push(`${route}: placeholder failed: ${String(err.message).split("\n")[0]}`));
      await spare.close().catch(() => {});
      written++;
    }
  }

  // A hero per binding for the LANDING page's cards — a shot of the demo
  // itself, which is what a card linking to it should show. One extra
  // screenshot per binding, written to apps/landing/public so the landing build
  // picks it up the same way each demo picks up its own.
  const landingDir = join("apps", "landing", "public", "previews");
  mkdirSync(landingDir, { recursive: true });
  const heroSlug = cfg.base.replace(/^\//, "");
  const hero = await browser.newPage({ viewport: { width: 1100, height: 720 }, deviceScaleFactor: 2 });
  await hero
    .goto(`http://localhost:${cfg.port}${cfg.base}/`, { waitUntil: "domcontentloaded" })
    .catch(() => {});
  await hero.waitForSelector(".demo-page", { timeout: 8000 }).catch(() => {});
  await sleep(400);
  await hero
    .screenshot({
      path: join(landingDir, `${heroSlug}.jpg`),
      clip: { x: 0, y: 0, width: 1100, height: 620 },
      type: "jpeg",
      quality: QUALITY,
    })
    .catch((err) => failed.push(`hero ${heroSlug}: ${String(err.message).split("\n")[0]}`));
  await hero.close().catch(() => {});

  await browser.close();
  await killGroup(server);

  console.log(`${binding}: ${written}/${routes.length} previews -> ${outDir}  (+ landing hero)`);
  if (fellBack.length) {
    // Named, because a demo with no rendered example is worth knowing about even
    // though it now gets a picture.
    console.log(`  ${fellBack.length} had no rendered example (page used instead): ${fellBack.join(", ")}`);
  }
  if (unrendered.length) {
    // Named, not silently dropped — a route that never rendered still got a
    // file, so this line is the only signal that anything was wrong.
    console.log(`  ${unrendered.length} did not render in time (viewport used): ${unrendered.join(", ")}`);
  }
  if (failed.length) {
    console.log(`  ${failed.length} FAILED:`);
    failed.slice(0, 10).forEach((f) => console.log(`    ${f}`));
  }
  if (!existsSync(outDir)) console.log("  (nothing written)");
}
