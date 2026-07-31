/**
 * DOM contract for Gantt and ProductionSchedule, in ANY binding — the half that
 * `bun run check` cannot reach.
 *
 *   node scripts/check-schedule-dom.mjs                 # react, LTR then RTL
 *   node scripts/check-schedule-dom.mjs solid --ltr
 *   node scripts/check-schedule-dom.mjs all
 *
 * Parameterised by binding BEFORE the ports were written, deliberately. The
 * seven drifts this repo is carrying happened because each binding was verified
 * by looking at it, and a Gantt that draws the wrong axis looks exactly like one
 * that draws the right one. Every port now lands against the same assertions the
 * React one passes.
 *
 * A binding that has not ported a component is REPORTED as not ported, loudly,
 * and counts as neither a pass nor a failure. A harness that quietly finds no
 * charts and exits 0 is the "pass with a zero denominator" this repo has been
 * bitten by twice.
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
import { BINDINGS } from "./bindings.mjs";

/* Ports, and only ports, are local to this script — everything else comes from
   the binding registry, so adding a fifth binding is an entry there and nothing
   here. Deliberately not vite's 5173 range: a `bun run dev` may already own it. */
const PORTS = { react: 4340, solid: 4341, vanilla: 4342, "web-components": 4343 };

const argv = process.argv.slice(2);
const DIRECTIONS = argv.includes("--ltr") ? ["ltr"] : argv.includes("--rtl") ? ["rtl"] : ["ltr", "rtl"];
const named = argv.filter((a) => !a.startsWith("--"));
const wanted = named.length === 0 ? ["react"] : named[0] === "all" ? BINDINGS.map((b) => b.id) : named;

const unknown = wanted.filter((id) => !BINDINGS.some((b) => b.id === id));
if (unknown.length > 0) {
  console.error(`unknown binding(s): ${unknown.join(", ")}`);
  console.error(`known: ${BINDINGS.map((b) => b.id).join(", ")}, or "all"`);
  process.exit(1);
}

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

let notPorted = 0;
const skipped = [];

/** Boot one binding's preview server and wait for it. */
const serve = async (binding) => {
  const port = PORTS[binding.id];
  const server = spawn(
    "npx",
    ["vite", "preview", "--config", "vite.config.demo.ts", "--port", String(port), "--strictPort"],
    { cwd: binding.dir, stdio: "ignore", detached: true },
  );
  const stop = () => {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  };
  const origin = `http://localhost:${port}${binding.base}/`;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(origin)).ok) return { origin, stop };
    } catch {
      /* not listening yet */
    }
    await sleep(300);
  }
  stop();
  return { origin: null, stop };
};

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

for (const id of wanted) {
  const binding = BINDINGS.find((b) => b.id === id);
  if (!existsSync(join(binding.dir, "dist-demo", "index.html"))) {
    console.error(`\n${id}: no demo build — run its build first`);
    process.exit(1);
  }
  const { origin, stop } = await serve(binding);
  if (!origin) {
    console.error(`\n${id}: preview server never came up on ${PORTS[id]}`);
    await browser.close();
    process.exit(1);
  }

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

      /* NOT PORTED is reported, never silently passed. A harness that finds no
         charts and moves on is the zero-denominator pass this repo has shipped
         twice — and with three bindings mid-port it would be the normal case. */
      if (charts.length === 0) {
        console.log(`\n${id} /${route} (${direction}) — NOT PORTED, 0 charts`);
        skipped.push(`${id}/${route} (${direction})`);
        notPorted += 1;
        await page.close();
        continue;
      }
      console.log(`\n${id} /${route} (${direction}) — ${charts.length} charts examined`);
      /* A fit axis sized from a content-sized container makes the page scroll,
         and no per-scroller measurement can see it. */
      t("the page does not scroll sideways", pageOverflowX, 0);
      t("every chart is exactly ONE tab stop", [...new Set(charts.map((c) => c.tabStops))], [1]);
      t("no bar is tabbable", charts.reduce((n, c) => n + c.tabbableBars, 0), 0);
      /* Per route, not one number for both: a Gantt has four pane columns plus
         the timeline, and a ProductionSchedule five plus it. Asserting a single
         value would either be wrong for one of them or be loosened to nothing. */
      const expectedColumns = route === "gantt" ? 5 : 6;
      t(`every chart reports ${expectedColumns} columns`, [...new Set(charts.map((c) => c.colCount))], [expectedColumns]);
      /* `aria-colcount` must not shrink when the pane sheds a column — it names
         the whole table, which is what lets a partial row be announced right. */
      t("…even the charts whose pane has shed one", charts.some((c) => c.pane.length < expectedColumns - 1), true);
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

      /* ---- rescheduling: the component's primary action, and until now the
         only part of it nothing drove. Both paths are exercised, because they
         are separate code in every binding — the pointer gesture and the
         keyboard nudge share only the proposal they build. The section owns its
         own state, so the assertion is on what the DEMO did with the proposal:
         a component that silently applied the move would look identical here
         and be wrong, which is why the note is read rather than the bars. ---- */
      if (route === "production-schedule") {
        const found = await page.evaluate(() => {
          const grids = [...document.querySelectorAll('[role="treegrid"]')];
          /* The rescheduling section is the only chart whose bars offer to
             move — no flag to read, and no reliance on section order. */
          const index = grids.findIndex((g) => g.querySelector("[data-gantt-movable]"));
          if (index < 0) return null;
          const grid = grids[index];
          let wrap = grid.parentElement;
          while (wrap && !wrap.querySelector('[aria-live="polite"]')) wrap = wrap.parentElement;
          return {
            index,
            bars: grid.querySelectorAll("[data-gantt-bar]").length,
            movable: grid.querySelectorAll("[data-gantt-movable]").length,
            note: wrap?.querySelector('[aria-live="polite"]')?.textContent ?? null,
          };
        });
        t("one chart offers rescheduling", found !== null, true);

        if (found) {
          /* Permission gates the AFFORDANCE, not the outcome: the inspection is
             fixed by an audit window, so its bars never offer to be dragged. */
          t("…and some of its bars are withheld", found.movable < found.bars && found.movable > 0, true);

          const liveNote = () =>
            page.evaluate((i) => {
              const grid = [...document.querySelectorAll('[role="treegrid"]')][i];
              let wrap = grid?.parentElement;
              while (wrap && !wrap.querySelector('[aria-live="polite"]')) wrap = wrap.parentElement;
              return wrap?.querySelector('[aria-live="polite"]')?.textContent ?? null;
            }, found.index);
          const firstMovable = () =>
            page.locator('[role="treegrid"]').nth(found.index).locator("[data-gantt-movable]").first();

          const bar = firstMovable();
          await bar.scrollIntoViewIfNeeded();
          await bar.evaluate((b) => b.focus());
          await page.keyboard.press(`Alt+${FWD}`);
          await sleep(250);
          t("Alt+arrow on a bar proposes a move", (await liveNote())?.startsWith("Moved"), true);

          const undo = page.getByRole("button", { name: /Undo/ });
          t("…and the caller can undo it", await undo.isEnabled(), true);
          await undo.click();
          await sleep(250);
          t("…which the caller, not the component, does", await liveNote(), "Undone");

          /* The pointer path. Coordinates are VIEWPORT ones, so the bar has to
             be scrolled into view first — a probe that skips this quietly
             clicks whatever happens to be at those coordinates instead. */
          const drag = firstMovable();
          await drag.scrollIntoViewIfNeeded();
          const box = await drag.boundingBox();
          t("a movable bar has a hit area", box !== null && box.width > 0, true);
          if (box) {
            const y = box.y + box.height / 2;
            const x = box.x + box.width / 2;
            /* A few pixels is a CLICK, not a drag. Without the threshold every
               click on a bar proposes a move of about ninety seconds. */
            await page.mouse.move(x, y);
            await page.mouse.down();
            await page.mouse.move(x + 2, y, { steps: 2 });
            await page.mouse.up();
            await sleep(200);
            t("a 2px twitch is a click, not a reschedule", (await liveNote())?.startsWith("Moved"), false);

            /* VISUALLY forward, which under RTL is leftwards — and the
               direction matters to the assertion rather than only to the
               arithmetic. Dragged the other way this first bar does not move at
               all, correctly: it starts at 06:00, exactly the shift boundary,
               so "earlier" is non-working time and the calendar snaps it
               straight back to where it was. That makes a wrong RTL sign fail
               here rather than pass by proposing something in the wrong
               direction. */
            const dx = rtl ? -90 : 90;
            await page.mouse.move(x, y);
            await page.mouse.down();
            await page.mouse.move(x + dx, y, { steps: 8 });
            await page.mouse.up();
            await sleep(250);
            t("…and dragging it 90px does propose one", (await liveNote())?.startsWith("Moved"), true);
            /* The bar follows the pointer. Stated this way it holds in both
               directions without the probe knowing which way time runs. */
            const moved = await firstMovable().boundingBox();
            t("…and the bar follows the pointer", moved && Math.sign(moved.x - box.x) === Math.sign(dx), true);
          }
        }
      }

      t("no runtime errors", errors, []);
      await page.close();
    }
  }

  stop();
}

await browser.close();
if (skipped.length > 0) {
  console.log(`\nNOT PORTED (${notPorted}): ${skipped.join(", ")}`);
}

/* ZERO ASSERTIONS IS NOT A PASS, and this script very nearly shipped claiming
   it was: run against an unported binding it printed "all passed — 0
   assertions" and exited 0. That is precisely the zero-denominator green its
   own header warns about, reproduced in the harness written to prevent it.
   Nothing checked is a failure, and it turns green the moment a port lands. */
const summary =
  checks === 0
    ? `\nNOTHING WAS CHECKED — ${notPorted} route(s) not ported, 0 assertions run\n`
    : failures === 0
      ? `\nall passed — ${checks} assertions over ${wanted.length} binding(s), ` +
        `${DIRECTIONS.length} direction(s)` +
        (notPorted > 0 ? `, ${notPorted} route(s) not ported` : "") +
        "\n"
      : `\n${failures} of ${checks} FAILED\n`;
console.log(summary);
process.exit(failures === 0 && checks > 0 ? 0 : 1);
