/**
 * DOM contract for Gantt and ProductionSchedule — the half that `bun run check`
 * cannot reach.
 *
 *   node scripts/check-schedule-dom.mjs           # both routes, LTR then RTL
 *   node scripts/check-schedule-dom.mjs --ltr     # one direction
 *
 * check-gantt.ts and check-production.ts pin the arithmetic, and between them
 * that is 601 assertions of pure logic. None of it can tell you whether the
 * chart is one tab stop or ten thousand, whether a lane was drawn, whether
 * focus survived a windowed row unmounting under it, or whether the whole page
 * scrolls sideways. Every one of those has been wrong here, and every one of
 * them built green.
 *
 * Three of the assertions below exist because the thing they check was
 * SHIPPED broken and found later:
 *
 *  - **Page-level horizontal overflow.** A fit axis sizes itself from its
 *    scroller's measured width, so a content-sized container makes the two
 *    define each other. Identical data rendered at 516px in one demo section
 *    and 1800px in another; the 1800 one made the document scroll. Per-scroller
 *    overflow could not see it — each scroller was internally consistent.
 *  - **One tab stop per chart.** The first keyboard model was tab-through-bars,
 *    which is 10,000 stops between a reader and whatever follows the chart.
 *  - **Focus across the window boundary.** Moving to an unmounted row has to
 *    scroll it in, re-render and then focus it. Get it wrong and focus lands on
 *    <body>, from where the next Tab restarts at the top of the document.
 *
 * NOT part of `bun run check`, deliberately: that target is pure logic and must
 * run with no build and no browser. This needs `dist-demo` and Chromium, so it
 * belongs beside `visual-check.mjs` in the ship procedure — see CLAUDE.md.
 *
 * Every group reports the COUNT of what it examined. A DOM assertion that
 * matched nothing passes, and a pass with a zero denominator is not a pass.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const DIR = join("packages", "react");
const PORT = 4340;
const BASE = "/builder";

if (!existsSync(join(DIR, "dist-demo", "index.html"))) {
  console.error("no demo build — run `bun run build` first");
  process.exit(1);
}

const argv = process.argv.slice(2);
const DIRECTIONS = argv.includes("--ltr") ? ["ltr"] : argv.includes("--rtl") ? ["rtl"] : ["ltr", "rtl"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
let checks = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  checks += 1;
  if (!ok) failures += 1;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const server = spawn(
  "npx",
  ["vite", "preview", "--config", "vite.config.demo.ts", "--port", String(PORT), "--strictPort"],
  { cwd: DIR, stdio: "ignore", detached: true },
);
const stop = () => {
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
};

const origin = `http://localhost:${PORT}${BASE}/`;
let up = false;
for (let i = 0; i < 80; i++) {
  try {
    if ((await fetch(origin)).ok) {
      up = true;
      break;
    }
  } catch {
    /* not listening yet */
  }
  await sleep(300);
}
if (!up) {
  stop();
  console.error(`preview server never came up on ${PORT}`);
  process.exit(1);
}

const browser = await chromium.launch();

/** Everything measurable about every chart on the current page. */
const survey = (page) =>
  page.evaluate(() => {
    const charts = [...document.querySelectorAll('[role="treegrid"]')].map((grid) => {
      const scroller = grid.parentElement;
      const rows = [...grid.querySelectorAll('[role="row"][aria-rowindex]')].slice(1);
      const axisHeads = [...grid.querySelectorAll('[role="columnheader"][aria-label="Timeline"] > div')];
      return {
        pane: [...grid.querySelectorAll('[role="columnheader"]')].slice(0, -1).map((h) => h.textContent.trim()),
        colCount: Number(grid.getAttribute("aria-colcount")),
        rowCount: Number(grid.getAttribute("aria-rowcount")) - 1,
        mounted: rows.length,
        rowHeights: [...new Set(rows.map((r) => Math.round(r.getBoundingClientRect().height)))],
        levels: rows.filter((r) => r.getAttribute("aria-level")).length,
        axisColumns: axisHeads.length,
        shadedColumns: axisHeads.filter((h) => h.className.includes("zen-bg-zen-muted")).length,
        tabStops: grid.querySelectorAll('[tabindex="0"]').length,
        tabbableBars: grid.querySelectorAll('[data-gantt-bar][tabindex="0"]').length,
        bars: grid.querySelectorAll("[data-gantt-bar]").length,
        // Distinct bar offsets inside one row — the lanes actually drawn.
        lanes: Math.max(
          0,
          ...rows.map((r) => new Set([...r.querySelectorAll("[data-gantt-bar]")].map((b) => b.style.top)).size),
        ),
        setupHatch: grid.querySelectorAll('[style*="repeating-linear-gradient"]').length,
        clientWidth: scroller.clientWidth,
        /* Anything drawn past the grid's own width widens the scroller, so the
           chart scrolls sideways to reveal it. A percent label placed after a
           bar that ends at the edge of the range did exactly this. */
        overhangPx: Math.round(scroller.scrollWidth - Math.ceil(grid.getBoundingClientRect().width)),
        gridName: grid.getAttribute("aria-label"),
        /* PER GRID, not page-wide: `rows` above already drops this grid's own
           header row, and a page-wide slice drops only one of sixteen. */
        rowsWithoutLevel: rows.filter((r) => !r.getAttribute("aria-level")).length,
        /* aria-expanded belongs on parents only. On a leaf it tells a reader
           there is something to open when there is not. */
        expandedOnLeaves: rows.filter(
          (r) =>
            r.getAttribute("aria-expanded") !== null &&
            !r.querySelector("button[aria-label^='Collapse'],button[aria-label^='Expand']"),
        ).length,
        /* An empty gridcell is announced as "blank". Right for absent data,
           wrong for the timeline cell — the reader arrowed there expecting a
           bar, and "blank" does not separate "no dates" from "starts after the
           range you are looking at". */
        unnamedTimelineCells: [...grid.querySelectorAll('[role="gridcell"][aria-colindex="5"]')].filter(
          (c) => !(c.getAttribute("aria-label") || c.textContent || "").trim(),
        ).length,
      };
    });
    return {
      charts,
      pageOverflowX: Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth),
    };
  });

const activeCell = (page) =>
  page.evaluate(() => {
    const a = document.activeElement;
    const grid = a?.closest?.('[role="treegrid"]');
    const scroller = grid?.parentElement;
    const box = a?.getBoundingClientRect?.();
    const view = scroller?.getBoundingClientRect?.();
    return {
      cell: a?.getAttribute?.("data-gantt-cell") ?? null,
      role: a?.getAttribute?.("role") ?? a?.tagName ?? null,
      // Below the sticky header and inside the scroller — the failure the
      // scroll-then-focus dance exists to prevent.
      visible: box && view ? box.top >= view.top + 40 && box.bottom <= view.bottom + 1 : null,
      scrollTop: scroller ? Math.round(scroller.scrollTop) : null,
    };
  });

for (const direction of DIRECTIONS) {
  for (const route of ["gantt", "production-schedule"]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    if (direction === "rtl") {
      await page.evaluate(() => {
        document.documentElement.dir = "rtl";
      });
    }
    await sleep(800);

    const { charts, pageOverflowX } = await survey(page);
    console.log(`\n/${route} (${direction}) — ${charts.length} charts examined`);

    t("at least one chart rendered", charts.length > 0, true);
    /* A fit axis sized from a content-sized container makes the page scroll,
       and no per-scroller measurement can see it. */
    t("the page does not scroll sideways", pageOverflowX, 0);
    t("every chart is exactly ONE tab stop", [...new Set(charts.map((c) => c.tabStops))], [1]);
    t("no bar is tabbable", charts.reduce((n, c) => n + c.tabbableBars, 0), 0);
    t("every chart reports 5 columns", [...new Set(charts.map((c) => c.colCount))], [5]);
    /* One height per chart is not cosmetic: ganttRowWindow is arithmetic, and
       ganttConnectors places endpoints at rowIndex * rowHeight + offset. */
    t("rows are a uniform height within each chart", charts.every((c) => c.rowHeights.length <= 1), true);
    t("every mounted row states its level", charts.every((c) => c.levels === c.mounted), true);
    t("every chart draws axis columns", charts.every((c) => c.axisColumns > 0), true);
    t("nothing is drawn past the grid's own width", charts.filter((c) => c.overhangPx > 0).length, 0);
    t("every chart names itself", charts.every((c) => (c.gridName ?? "").length > 0), true);
    t("every data row states its level", charts.reduce((n, c) => n + c.rowsWithoutLevel, 0), 0);
    t("aria-expanded appears on no leaf row", charts.reduce((n, c) => n + c.expandedOnLeaves, 0), 0);
    t("no timeline cell is announced as blank", charts.reduce((n, c) => n + c.unnamedTimelineCells, 0), 0);
    t("charts with rows have a pane column", charts.every((c) => c.rowCount === 0 || c.pane.length > 0), true);

    if (route === "gantt") {
      const windowed = charts.filter((c) => c.rowCount > c.mounted);
      t(`at least one chart is windowed (${windowed.length} of ${charts.length})`, windowed.length > 0, true);
      t("…and a windowed chart mounts far fewer rows than it reports", windowed.every((c) => c.mounted < c.rowCount / 2), true);
      t("a calendar-driven chart shades its non-working columns", charts.some((c) => c.shadedColumns > 0), true);
    } else {
      t("a row draws more than one lane", Math.max(...charts.map((c) => c.lanes)), 3);
      t("a changeover is drawn as its own block", charts.some((c) => c.setupHatch > 0), true);
      t("the load strip is rendered outside the grid", await page.evaluate(() =>
        [...document.querySelectorAll('[role="treegrid"]')].every((g) => {
          const last = g.parentElement.lastElementChild;
          return last !== g && !last.getAttribute("role");
        })), true);
      t("an over-capacity resource is reported", await page.evaluate(() =>
        document.querySelector('[aria-label="Over capacity"]') !== null), true);
    }

    /* ---- keyboard, on the biggest chart the route has ---- */
    const target = charts.reduce((best, c, i) => (c.rowCount > charts[best].rowCount ? i : best), 0);
    const grid = page.locator('[role="treegrid"]').nth(target);
    const rowCount = charts[target].rowCount;
    console.log(`  — keyboard on chart ${target + 1}, ${rowCount} rows`);

    const rtl = direction === "rtl";
    const FWD = rtl ? "ArrowLeft" : "ArrowRight";
    const BACK = rtl ? "ArrowRight" : "ArrowLeft";

    await grid.locator('[data-gantt-cell="0:0"]').focus();
    t("focus enters on a gridcell", (await activeCell(page)).role, "gridcell");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    t("ArrowDown twice moves two rows", (await activeCell(page)).cell, "2:0");
    await page.keyboard.press(FWD);
    t(`${FWD} moves a column (visual direction)`, (await activeCell(page)).cell, "2:1");
    await page.keyboard.press("End");
    t("End reaches the timeline cell", (await activeCell(page)).cell?.endsWith(":4"), true);
    await page.keyboard.press("Home");
    t("Home returns to the first column", (await activeCell(page)).cell, "2:0");

    await page.keyboard.press("Control+Home");
    t("Ctrl+Home is the first cell of the plan", (await activeCell(page)).cell, "0:0");
    const before = Number(await grid.getAttribute("aria-rowcount"));
    await page.keyboard.press(BACK);
    await sleep(150);
    const collapsed = Number(await grid.getAttribute("aria-rowcount"));
    t(`${BACK} on the first column collapses a parent`, collapsed < before, true);
    await page.keyboard.press(FWD);
    await sleep(150);
    t(`…and ${FWD} opens it again`, Number(await grid.getAttribute("aria-rowcount")), before);

    await page.keyboard.press("Control+End");
    await sleep(250);
    const end = await activeCell(page);
    /* The one that strands a keyboard user when it breaks: the last row of a
       windowed plan is not in the DOM when the move is decided. */
    t("Ctrl+End lands on a cell, not on <body>", end.role, "gridcell");
    t("…on the LAST row of the plan", Number(end.cell?.split(":")[0]), rowCount - 1);
    t("…scrolled clear of the sticky header", end.visible, true);
    if (rowCount * 36 > 512) t("…and the scroller really moved", end.scrollTop > 0, true);

    await page.keyboard.press("PageUp");
    await sleep(250);
    const up2 = await activeCell(page);
    t("PageUp keeps focus on a cell", up2.role, "gridcell");
    t("…and moves it up a screenful", Number(up2.cell?.split(":")[0]) < rowCount - 1, true);
    t("…still visible", up2.visible, true);

    t("no runtime errors", errors, []);
    await page.close();
  }
}

await browser.close();
stop();
console.log(
  failures === 0
    ? `\nall passed — ${checks} assertions over ${DIRECTIONS.length} direction(s)\n`
    : `\n${failures} of ${checks} FAILED\n`,
);
process.exit(failures === 0 ? 0 : 1);
