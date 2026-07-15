/**
 * Drives the assembled site the way GitHub Pages will serve it.
 *
 * Everything this checks fails SILENTLY at build time: a wrong base still
 * builds, a router basename that matches nothing still builds and renders a
 * blank page, and a deep link that 404s only does so in someone else's browser
 * after the deploy. The build being green says nothing about any of it.
 *
 * Boots scripts/serve-site.mjs (Pages' file-or-root-404 semantics) and checks
 * the things a visitor actually does: open the landing page, follow a demo
 * link, deep-link into a route, refresh on it.
 *
 * Run by ./deploy.sh; needs playwright.
 */
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const base = process.env.ZEN_BASE ?? "/zen-ui/";
const out = process.env.ZEN_OUT ?? "dist-site";
const port = Number(process.env.ZEN_CHECK_PORT ?? 5188);
const origin = `http://localhost:${port}`;

const fails = [];
const ok = (n) => console.log(`  ok   ${n}`);
const bad = (n, d) => { fails.push(n); console.log(`  FAIL ${n}\n       ${d}`); };

const server = spawn(process.execPath, ["scripts/serve-site.mjs", String(port)], {
  env: { ...process.env, ZEN_BASE: base, ZEN_OUT: out },
  stdio: "ignore",
});
const stop = () => { try { server.kill(); } catch { /* already gone */ } };
process.on("exit", stop);

// Wait for the port rather than sleeping a guessed amount.
const ready = async () => {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(origin + base);
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
};
if (!(await ready())) { bad("server", "serve-site.mjs never came up"); stop(); process.exit(1); }

const browser = await chromium.launch();
const errorsFor = (page) => {
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  return errs;
};

// ---- the landing page ----------------------------------------------------
{
  const page = await browser.newPage();
  const errs = errorsFor(page);
  const res = await page.goto(origin + base, { waitUntil: "networkidle" });
  if (res?.status() === 200) ok(`landing page 200s at ${base}`);
  else bad("landing status", `got ${res?.status()}`);

  // A wrong base shows an unstyled page rather than an error, so check that CSS
  // actually arrived rather than that the HTML did.
  const styled = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  if (styled && styled !== "" ) ok(`landing CSS loaded (body font: ${styled.split(",")[0]})`);
  else bad("landing CSS", "body has no font-family — the stylesheet 404'd");

  // The links must point under the base, not at the origin root.
  const hrefs = await page.getByRole("link", { name: /demo/i }).evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  const demoLinks = hrefs.filter((h) => h && /builder/.test(h));
  const wrong = demoLinks.filter((h) => !h.startsWith(base));
  if (demoLinks.length >= 2 && wrong.length === 0) ok(`landing demo links are under the base (${[...new Set(demoLinks)].join(", ")})`);
  else bad("landing links", `expected links under ${base}, got ${JSON.stringify(hrefs)}`);

  if (errs.length === 0) ok("landing has no console errors");
  else bad("landing console", errs.slice(0, 2).join(" | "));
  await page.close();
}

// ---- each demo: root, deep link, and the 404 bounce -----------------------
for (const [app, marker] of [["builder", "Zen UI Component Library"], ["builder-solid", "Zen UI · Solid"]]) {
  const root = `${origin}${base}${app}/`;

  {
    const page = await browser.newPage();
    const errs = errorsFor(page);
    await page.goto(root, { waitUntil: "networkidle" });
    // The app shell has its own <h1 class="app-title">, so a bare h1.first()
    // matches the SITE HEADER on every page and would pass even with the router
    // dead. Chrome and routing are two claims, so they get two checks.
    const title = await page.locator(".app-title").first().innerText().catch(() => "");
    if (title.includes(marker.split(" ")[0])) ok(`${app}: the shell renders ("${title}")`);
    else bad(`${app} shell`, `app-title is "${title}" — expected ${marker}`);

    // The router only matches if its basename equals the served base. A
    // mismatch renders the shell with no route: the sidebar exists, the
    // content is empty. So check a link, not the chrome.
    const links = await page.locator("aside a, .sidebar a").count();
    if (links > 10) ok(`${app}: sidebar has ${links} routes`);
    else bad(`${app} sidebar`, `only ${links} links`);

    if (errs.length === 0) ok(`${app}: no console errors at root`);
    else bad(`${app} console`, errs.slice(0, 2).join(" | "));
    await page.close();
  }

  // The real test: a deep link nobody has a file for.
  {
    const page = await browser.newPage();
    const errs = errorsFor(page);
    const deep = `${root}carousel`;
    await page.goto(deep, { waitUntil: "networkidle" });
    await page.waitForTimeout(400); // the 404 bounce + the shim's replaceState

    const url = page.url();
    if (url === deep) ok(`${app}: deep link survives the 404 bounce (${url.replace(origin, "")})`);
    else bad(`${app} deep link`, `landed on ${url.replace(origin, "")}, expected ${deep.replace(origin, "")}`);

    const h1 = await page.locator(".demo-page h1").first().innerText().catch(() => "");
    if (/Carousel/i.test(h1)) ok(`${app}: the deep-linked route rendered ("${h1}")`);
    else bad(`${app} deep route`, `.demo-page h1 is "${h1}" — the route did not render`);

    // ?p= must not be left behind in the address bar.
    if (!url.includes("?p=")) ok(`${app}: the redirect query is cleaned up`);
    else bad(`${app} query cleanup`, url);

    // The first response to a deep link IS a 404 — that is the whole mechanism:
    // Pages serves 404.html, which bounces. Counting it as an error would make
    // a correct deploy unpassable. Anything else is a real error.
    const real = errs.filter((e) => !/Failed to load resource.*404/.test(e));
    if (real.length === 0) ok(`${app}: no console errors beyond the by-design 404`);
    else bad(`${app} deep console`, real.slice(0, 2).join(" | "));

    // And a refresh on that route must survive the same way.
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const h1b = await page.locator(".demo-page h1").first().innerText().catch(() => "");
    if (/Carousel/i.test(h1b)) ok(`${app}: refresh on a sub-route works`);
    else bad(`${app} refresh`, `.demo-page h1 is "${h1b}"`);
    await page.close();
  }
}

// ---- prefix safety -------------------------------------------------------
// "builder" is a prefix of "builder-solid". A 404 handler that matched on the
// prefix would send every Solid deep link to the React app — which renders,
// looks plausible, and is the wrong binding entirely.
{
  const page = await browser.newPage();
  await page.goto(`${origin}${base}builder-solid/carousel`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const title = await page.locator(".app-title").first().innerText().catch(() => "");
  const url = page.url();
  // Both the URL and the app that answered — a prefix bug would render the
  // React demo at a builder-solid URL, which looks entirely plausible.
  if (url.includes("builder-solid") && /Solid/.test(title)) ok(`a Solid deep link stays in Solid ("${title}")`);
  else bad("prefix trap", `builder-solid/carousel landed on ${url.replace(origin, "")} showing "${title}"`);
  await page.close();
}

// ---- a genuinely missing page --------------------------------------------
{
  const page = await browser.newPage();
  await page.goto(`${origin}${base}no-such-page`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  if (page.url().replace(/\/$/, "") === (origin + base).replace(/\/$/, "")) ok("an unknown path falls back to the landing page");
  else bad("404 fallback", `landed on ${page.url()}`);
  await page.close();
}

await browser.close();
stop();
console.log(fails.length ? `\n  FAILED (${fails.length}): ${fails.join(", ")}` : `\n  the site works`);
process.exit(fails.length ? 1 : 0);
