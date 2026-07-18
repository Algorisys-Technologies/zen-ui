/**
 * Visual check harness.
 *
 * Boots a demo's preview server and screenshots routes, so a change can be
 * verified by looking at it rather than by trusting that the build passed.
 * Building green says nothing about whether a panel is clipped or a switch
 * landed on the wrong side — both real bugs this repo shipped.
 *
 *   node scripts/visual-check.mjs react                 # all routes
 *   node scripts/visual-check.mjs solid bound-fields notifications-inbox
 *   node scripts/visual-check.mjs both --theme dark
 *
 * Shots land in .visual/<binding>/<route>.png. Pair routes across bindings to
 * eyeball parity.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BINDINGS = {
  react: { dir: "packages/react", base: "/builder", port: 4319 },
  solid: { dir: "packages/solid", base: "/builder-solid", port: 4320 },
  vanilla: { dir: "packages/vanilla", base: "/builder-vanilla", port: 4321 },
  "web-components": { dir: "packages/web-components", base: "/builder-wc", port: 4322 },
};

const argv = process.argv.slice(2);
const which = argv[0] === "both" ? Object.keys(BINDINGS) : [argv[0] ?? "react"];
const themeIdx = argv.indexOf("--theme");
const theme = themeIdx > -1 ? argv[themeIdx + 1] : "default";
const routes = argv.slice(1).filter((a) => !a.startsWith("--") && a !== theme);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  return false;
}

/** Route list comes from the binding's nav.ts — the single source of truth. */
async function routesFor(binding) {
  const navPath = join(process.cwd(), BINDINGS[binding].dir, "src/nav.ts");
  const src = await import("node:fs").then((fs) => fs.readFileSync(navPath, "utf8"));
  // nav.ts uses `to` in React and vanilla, `path` in Solid.
  const key = binding === "solid" ? "path" : "to";
  return [...src.matchAll(new RegExp(`${key}: "([^"]+)"`, "g"))].map((m) => m[1]);
}

for (const binding of which) {
  const cfg = BINDINGS[binding];
  if (!existsSync(join(cfg.dir, "dist", "index.html"))) {
    console.error(`${binding}: no demo build — run \`npm run build\` in ${cfg.dir} first`);
    process.exit(1);
  }

  const server = spawn(
    "npx",
    ["vite", "preview", "--config", "vite.config.demo.ts", "--port", String(cfg.port), "--strictPort"],
    { cwd: cfg.dir, stdio: "ignore" },
  );

  const origin = `http://localhost:${cfg.port}${cfg.base}/`;
  if (!(await waitForServer(origin))) {
    server.kill();
    throw new Error(`${binding}: preview server never came up on ${cfg.port}`);
  }

  const targets = routes.length ? routes.map((r) => (r.startsWith("/") ? r : `/${r}`)) : await routesFor(binding);
  const outDir = join(".visual", binding);
  mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const failures = [];

  // Surface render-time crashes: a blank page still screenshots "fine".
  page.on("pageerror", (e) => failures.push(`${page.url()} :: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") failures.push(`${page.url()} :: console: ${m.text().slice(0, 120)}`);
  });

  for (const route of targets) {
    const url = `http://localhost:${cfg.port}${cfg.base}${route}`;
    await page.goto(url, { waitUntil: "networkidle" });
    await page.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
    await sleep(250);
    const name = route === "/" ? "_welcome" : route.replace(/^\//, "").replace(/\//g, "-");
    await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
  }

  await browser.close();
  server.kill();

  console.log(`${binding}: ${targets.length} routes -> ${outDir}/`);
  if (failures.length) {
    console.log(`  ${failures.length} runtime error(s):`);
    [...new Set(failures)].slice(0, 12).forEach((f) => console.log(`    ${f}`));
  } else {
    console.log("  no runtime errors");
  }
}
