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
import { readFileSync } from "node:fs";
import { BINDINGS } from "./bindings.mjs";

/**
 * A real non-root route for each binding, read from its OWN nav.ts.
 *
 * This used to be the literal "carousel" for every binding — a route only React
 * and Solid have. The vanilla slice has no Carousel, so the deep-link and refresh
 * checks were testing a route it never claimed and failing for the wrong reason.
 * The point of the check is that SOME deep link survives the 404 bounce; which
 * one is per binding.
 */
const deepRouteFor = (b) => {
  const src = readFileSync(`${b.dir}/src/nav.ts`, "utf8");
  const re = new RegExp(`${b.navKey}:\\s*"(/[^"]+)"`, "g");
  for (const m of src.matchAll(re)) if (m[1] !== "/") return m[1].replace(/^\//, "");
  throw new Error(`no non-root route found in ${b.dir}/src/nav.ts`);
};
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
// Every binding, from scripts/bindings.mjs. This used to be a two-entry literal,
// so a third demo could ship to the site and be driven by nothing.
for (const b of BINDINGS) {
  const { base: appBase, title: marker } = b;
  const app = appBase.replace(/^\//, "");
  const root = `${origin}${base}${app}/`;
  const deepRoute = deepRouteFor(b);
  // A slice legitimately has fewer routes; the floor is only there to catch a
  // dead router (sidebar present, zero links). Per-binding rather than one number.
  const linkFloor = b.partial ? 5 : 10;

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
    if (links > linkFloor) ok(`${app}: sidebar has ${links} routes`);
    else bad(`${app} sidebar`, `only ${links} links, want > ${linkFloor}`);

    if (errs.length === 0) ok(`${app}: no console errors at root`);
    else bad(`${app} console`, errs.slice(0, 2).join(" | "));
    await page.close();
  }

  // The real test: a deep link nobody has a file for.
  {
    const page = await browser.newPage();
    const errs = errorsFor(page);
    const deep = `${root}${deepRoute}`;
    await page.goto(deep, { waitUntil: "networkidle" });
    await page.waitForTimeout(400); // the 404 bounce + the shim's replaceState

    const url = page.url();
    if (url === deep) ok(`${app}: deep link survives the 404 bounce (${url.replace(origin, "")})`);
    else bad(`${app} deep link`, `landed on ${url.replace(origin, "")}, expected ${deep.replace(origin, "")}`);

    // The route rendered SOMETHING other than the shell title — the demo-page h1 is
    // present and is not the app-title. Matching a specific word would just re-hardcode
    // carousel; the claim under test is "the deep link resolves to its route", not which.
    const h1 = await page.locator(".demo-page h1").first().innerText().catch(() => "");
    if (h1 && h1 !== marker) ok(`${app}: the deep-linked route "${deepRoute}" rendered ("${h1}")`);
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
    if (h1b && h1b !== marker) ok(`${app}: refresh on "${deepRoute}" works`);
    else bad(`${app} refresh`, `.demo-page h1 is "${h1b}"`);
    await page.close();
  }
}

// ---- prefix safety -------------------------------------------------------
// "builder" is a prefix of BOTH "builder-solid" and "builder-vanilla". A 404
// handler that matched on the prefix would send every Solid and vanilla deep link
// to the React app — which renders, looks plausible, and is the wrong binding
// entirely.
//
// Derived rather than hardcoded: every binding whose slug is a strict prefix of
// another's is a trap, and adding a fourth must not require remembering this.
{
  const slugs = BINDINGS.map((b) => b.base.replace(/^\//, ""));
  const victims = BINDINGS.filter((b) => {
    const slug = b.base.replace(/^\//, "");
    return slugs.some((other) => other !== slug && slug.startsWith(other));
  });
  if (victims.length === 0) bad("prefix trap", "no binding shadows another — did the registry change?");
  for (const v of victims) {
    const slug = v.base.replace(/^\//, "");
    const page = await browser.newPage();
    await page.goto(`${origin}${base}${slug}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const title = await page.locator(".app-title").first().innerText().catch(() => "");
    const url = page.url();
    // Both the URL and the app that answered — a prefix bug renders the React
    // demo at a builder-solid URL, which looks entirely plausible.
    const word = v.title.split(" ").pop();
    if (url.includes(slug) && title.includes(word)) ok(`a ${v.label} deep link stays in ${v.label} ("${title}")`);
    else bad("prefix trap", `${slug}/ landed on ${url.replace(origin, "")} showing "${title}"`);
    await page.close();
  }
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
