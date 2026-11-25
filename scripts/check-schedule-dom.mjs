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
/* The same browser with scrollbars that take room. Playwright hides them in
   headless mode, which is right for every geometric assertion above and makes
   the axis scrollbar unmeasurable — see where it is used. */
const barBrowser = await chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });

/** Everything measurable about every chart on the current page. */
const survey = (page) =>
  page.evaluate(() => {
    const charts = [...document.querySelectorAll('[role="treegrid"]')].map((grid) => {
      const scroller = grid.parentElement;
      const rows = [...grid.querySelectorAll('[role="row"][aria-rowindex]')].slice(1);
      // With `headerGroups` the cells sit in a marked row under the group row;
      // without, they are the header's direct children, as they always were.
      const timeline = grid.querySelector('[role="columnheader"][aria-label="Timeline"]');
      const axisHeads = [...(timeline?.querySelector("[data-schedule-axis-row]") ?? timeline)?.children ?? []];
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
    await barBrowser.close();
    process.exit(1);
  }

  for (const direction of DIRECTIONS) {
    for (const route of ["gantt", "production-schedule"]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      /*
       * The demos load Plus Jakarta Sans from fonts.gstatic.com, and that
       * request fails often enough to have made this check fail roughly three
       * runs in four — on an assertion named "no runtime errors", which is the
       * worst possible flake: the honest response is to re-run until green, and
       * a gate that gets re-run until green has stopped being a gate.
       *
       * So a THIRD-PARTY resource failure is not a runtime error of ours. The
       * discriminator is the origin, taken from the message's location rather
       * than its text — the text is the generic "Failed to load resource: … 404
       * ()" for every failed request, so matching on that would also swallow a
       * same-origin asset 404, which is exactly the failure CLAUDE.md records as
       * rendering a blank page inside a working shell with no other symptom.
       * Anything served from the preview origin still fails the check, as does
       * any console error with no location at all.
       *
       * Measured, not assumed: the first version of this filter excused
       * /favicon.ico, on the reasoning that no demo ships one. The flake
       * survived it. A probe printing each message's location named the real
       * culprit on the first hit.
       */
      const sameOrigin = new URL(origin).origin;
      page.on("console", (m) => {
        if (m.type() !== "error") return;
        const url = m.location()?.url ?? "";
        if (url && !url.startsWith(sameOrigin)) return;
        errors.push(m.text());
      });
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

      /* Continuous axes (`continuous`): one scrolling timeline over the whole
         plan. Found by the windowed header, so a binding that has not ported it
         reports 0 here and the assertions below are skipped, not passed. */
      const continuous = await page.evaluate(() =>
        [...document.querySelectorAll('[role="treegrid"]')]
          .map((g, index) => ({ g, index }))
          .filter(({ g }) => g.querySelector("[data-schedule-windowed]"))
          .map(({ g, index }) => {
            const sc = g.parentElement;
            const head = g.querySelector("[data-schedule-windowed]");
            const rows = [...g.querySelectorAll('[role="row"][aria-rowindex]')].slice(1);
            const perRow = rows.map((r) => r.querySelector('[role="gridcell"] > div[aria-hidden]')?.children.length ?? 0);
            return {
              index,
              scrolls: sc.scrollWidth > sc.clientWidth,
              headerCells: head.children.length,
              maxRowCells: Math.max(0, ...perRow),
              cutBars: g.querySelectorAll("[data-gantt-bar].zen-rounded-s-none, [data-gantt-bar].zen-rounded-e-none").length,
            };
          }),
      );
      if (continuous.length > 0) {
        t(`continuous charts scroll sideways inside their own scroller (${continuous.length})`, continuous.every((c) => c.scrolls), true);
        /* The point of windowing: a thousand-column axis must not mean a thousand
           nodes per row. 80 is generous for any viewport this suite uses. */
        t("…and draw only the header cells near the viewport", Math.max(...continuous.map((c) => c.headerCells)) <= 80, true);
        t("…and only the row columns near it", Math.max(...continuous.map((c) => c.maxRowCells)) <= 80, true);
        t("…and never cut a bar at a period edge", continuous.reduce((n, c) => n + c.cutBars, 0), 0);
        // Next must SCROLL the same axis, not swap it for the next period's.
        const stepped = await page.evaluate(async (index) => {
          const g = document.querySelectorAll('[role="treegrid"]')[index];
          const sc = g.parentElement;
          const toolbar = sc.parentElement.querySelector('button[aria-label="Next"]') ?? sc.previousElementSibling?.querySelector?.('button[aria-label="Next"]');
          // Re-found after the click, not held: a binding may legitimately
          // replace the grid element on render (vanilla does), and a held
          // reference would measure a detached node at 0px.
          const width = () =>
            sc.querySelector('[role="treegrid"] [role="columnheader"][aria-label="Timeline"]').getBoundingClientRect().width;
          const before = { left: Math.abs(sc.scrollLeft), width: width() };
          toolbar?.click();
          await new Promise((ok) => setTimeout(ok, 400));
          return { found: !!toolbar, moved: Math.abs(sc.scrollLeft) - before.left, sameAxis: Math.round(width()) === Math.round(before.width) };
        }, continuous[0].index);
        t("Next scrolls a continuous axis forward, not to another range", [stepped.found, stepped.moved > 0, stepped.sameAxis], [true, true, true]);
      } else {
        console.log("  (no continuous charts on this route — NOT PORTED for continuous)");
      }

      if (route === "gantt") {
        const windowed = charts.filter((c) => c.rowCount > c.mounted);
        t(`at least one chart is windowed (${windowed.length} of ${charts.length})`, windowed.length > 0, true);
        t("…and a windowed chart mounts far fewer rows than it reports", windowed.every((c) => c.mounted < c.rowCount / 2), true);
        t("a calendar-driven chart shades its non-working columns", charts.some((c) => c.shadedColumns > 0), true);

        /* Milestones: geometry is the whole feature, and every failure so far
           was invisible to a build — a flex parent squeezed the diamond to a
           6px sliver, and an anchor at the centre would hide the arrowheads
           under it. Measured on the demo's Month-view chart, where each day is
           one column and a milestone at 00:00 sits on its column's START edge. */
        const ms = await page.evaluate(() => {
          const root = document.querySelector('[data-testid="gantt-milestones"]');
          if (!root) return null;
          const grid = root.querySelector('[role="treegrid"]');
          const rtl = getComputedStyle(grid).direction === "rtl";
          const cells = [...grid.querySelector('[role="columnheader"][aria-label="Timeline"]').children];
          const edgeOf = (day) => {
            const c = cells.find((x) => x.querySelector("span")?.textContent === String(day));
            if (!c) return null;
            const r = c.getBoundingClientRect();
            return rtl ? r.right : r.left;
          };
          const markers = [...grid.querySelectorAll("[data-gantt-milestone]")].map((b) => {
            const r = b.getBoundingClientRect();
            const d = b.querySelector("[aria-hidden]");
            const cs = getComputedStyle(d);
            const day = Number(/· (\d+) /.exec(b.title)?.[1]);
            const edge = edgeOf(day);
            return {
              off: edge === null ? null : Math.abs((r.left + r.right) / 2 - edge),
              square: Math.abs(parseFloat(cs.width) - parseFloat(cs.height)) < 0.5,
              side: parseFloat(cs.width),
              expected: r.width / Math.SQRT2,
              tabbable: b.tabIndex >= 0,
              named: (b.querySelector(".zen-sr-only")?.textContent ?? "").startsWith("Milestone,"),
              // the point the arrows aim at: its start-side tip, and its row's centre
              tipX: rtl ? r.right : r.left,
              midY: (r.top + r.bottom) / 2,
              accent: d.hasAttribute("data-gantt-accent") ? cs.borderTopColor : null,
              accentWidth: parseFloat(cs.borderTopWidth),
              fill: cs.backgroundColor,
            };
          });
          // An arrowhead's first polygon point is its tip, in the svg's own space.
          const svg = [...grid.querySelectorAll("svg")].sort((x, y) => y.getBoundingClientRect().width - x.getBoundingClientRect().width)[0];
          const box = svg.getBoundingClientRect();
          const tips = [...svg.querySelectorAll("polygon")].map((p) => {
            const [x, y] = p.getAttribute("points").split(" ")[0].split(",").map(Number);
            return { x: rtl ? box.right - x : box.left + x, y: box.top + y };
          });
          const intoMilestones = tips
            .map((tip) => ({ tip, m: markers.find((m) => Math.abs(m.midY - tip.y) < 2) }))
            .filter((x) => x.m);
          return {
            markers,
            arrows: intoMilestones.length,
            arrowsOnTip: intoMilestones.filter(({ tip, m }) => Math.abs(tip.x - m.tipX) < 1.5).length,
            statuses: new Set(markers.map((m) => m.fill)).size,
          };
        });
        if (ms === null) {
          console.log("  (no milestone chart on this route — NOT PORTED for milestones)");
        } else {
          const n = ms.markers.length;
          t(`milestones are drawn (${n})`, n >= 5, true);
          t("…each a true diamond, not squeezed by its button", ms.markers.every((m) => m.square && Math.abs(m.side - m.expected) < 1), true);
          t("…centred on its date within 1px", ms.markers.every((m) => m.off !== null && m.off < 1), true);
          t("…none tabbable, each announced as a milestone", ms.markers.every((m) => !m.tabbable && m.named), true);
          t("…in three status colours (complete, late, ahead)", ms.statuses, 3);
          t(`arrows into milestones end on a tip (${ms.arrowsOnTip} of ${ms.arrows})`, ms.arrows > 0 && ms.arrowsOnTip === ms.arrows, true);
          const accented = ms.markers.filter((m) => m.accent !== null);
          t(`an accented milestone draws its border (${accented.length})`,
            accented.length > 0 && accented.every((m) => m.accentWidth >= 1 && m.accent !== m.fill && !/rgba\(.*, 0\)/.test(m.accent)), true);
        }

        /* Planned vs actual: the actual bar is ADDED. In the default strip
           layout the planned bar must not move — the arrows route at the row's
           middle — and the actual bar must sit below it, inside the row, and
           stay out of the accessibility tree (its dates are in the planned
           bar's name). Counted, so a section that drew nothing cannot pass. */
        const pva = await page.evaluate(() => {
          const root = document.querySelector('[data-testid="gantt-actuals"]');
          if (!root) return null;
          const charts = [...root.querySelectorAll('[role="treegrid"]')].map((grid) =>
            [...grid.querySelectorAll('[role="row"]')]
              .filter((r) => r.querySelector("[data-gantt-actual]"))
              .map((r) => {
                const row = r.getBoundingClientRect();
                const planned = r.querySelector("[data-gantt-bar]").getBoundingClientRect();
                const actual = r.querySelector("[data-gantt-actual]");
                const a = actual.getBoundingClientRect();
                return {
                  centred: Math.abs((planned.top + planned.bottom) / 2 - (row.top + row.bottom) / 2) < 1,
                  below: a.top >= planned.bottom - 0.5,
                  inside: a.top >= row.top - 0.5 && a.bottom <= row.bottom + 0.5,
                  hidden: actual.getAttribute("aria-hidden") === "true",
                  named: /actual/.test(r.querySelector("[data-gantt-bar] .zen-sr-only")?.textContent ?? ""),
                  open: actual.hasAttribute("data-gantt-actual-open"),
                };
              }),
          );
          const board = document.querySelector('[data-testid="gantt-board"]');
          let labels = null;
          if (board) {
            const scroller = board.querySelector('[role="treegrid"]').parentElement;
            const box = scroller.getBoundingClientRect();
            const spans = [...board.querySelectorAll("span")].filter(
              (x) => x.children.length === 0 && /^(Planned|Actual) \(/.test(x.textContent),
            );
            labels = {
              examined: spans.length,
              clipped: spans.filter((x) => {
                const r = x.getBoundingClientRect();
                return r.left < box.left - 0.5 || r.right > box.right + 0.5;
              }).length,
              legend: board.querySelectorAll("ul[aria-label] li").length,
              weekColumns: [...board.querySelectorAll('[role="columnheader"][aria-label="Timeline"] > *')].filter((c) =>
                /\d–\d/.test(c.textContent),
              ).length,
            };
          }
          /* "primary": the ACTUAL bar is the main one — the button, centred
             where the arrows route — and the plan a dashed outline beneath. */
          let primary = null;
          const third = root.querySelectorAll('[role="treegrid"]')[2];
          if (third) {
            const rowsP = [...third.querySelectorAll('[role="row"]')].filter((r) => r.querySelector("[data-gantt-bar]"));
            const bars = rowsP.map((r) => {
              const row = r.getBoundingClientRect();
              const main = r.querySelector("[data-gantt-bar]");
              const m = main.getBoundingClientRect();
              const plan = r.querySelector("[data-gantt-plan]")?.getBoundingClientRect() ?? null;
              return {
                actual: main.hasAttribute("data-gantt-actual"),
                centred: Math.abs((m.top + m.bottom) / 2 - (row.top + row.bottom) / 2) < 1,
                planBelow: plan === null ? null : plan.top >= m.bottom - 0.5 && plan.bottom <= row.bottom + 0.5,
                start: getComputedStyle(third).direction === "rtl" ? m.right : m.left,
                midY: (m.top + m.bottom) / 2,
              };
            });
            const rtl = getComputedStyle(third).direction === "rtl";
            const svg = [...third.querySelectorAll("svg")].sort((x, y) => y.getBoundingClientRect().width - x.getBoundingClientRect().width)[0];
            const box = svg.getBoundingClientRect();
            const tips = [...svg.querySelectorAll("polygon")].map((poly) => {
              const [x, y] = poly.getAttribute("points").split(" ")[0].split(",").map(Number);
              return { x: rtl ? box.right - x : box.left + x, y: box.top + y };
            });
            const landed = tips.map((tip) => bars.find((b) => Math.abs(b.midY - tip.y) < 2 && Math.abs(b.start - tip.x) < 1.5));
            primary = {
              actualMain: bars.filter((b) => b.actual).length,
              planOnly: bars.filter((b) => !b.actual).length,
              centred: bars.every((b) => b.centred),
              planBelow: bars.filter((b) => b.actual).every((b) => b.planBelow === true),
              arrows: tips.length,
              arrowsOnBar: landed.filter(Boolean).length,
            };
          }
          return { strip: charts[0] ?? [], split: charts[1] ?? [], labels, primary };
        });
        if (pva === null) {
          console.log("  (no planned-vs-actual chart on this route — NOT PORTED for actuals)");
        } else {
          const all = [...pva.strip, ...pva.split];
          t(`actual bars are drawn (${pva.strip.length} strip, ${pva.split.length} split)`, pva.strip.length >= 4 && pva.split.length >= 4, true);
          t("strip: the planned bar stays centred in its row", pva.strip.every((b) => b.centred), true);
          t("every actual bar sits below its planned bar, inside the row", all.every((b) => b.below && b.inside), true);
          t("…hidden from assistive tech, its dates in the planned bar's name", all.every((b) => b.hidden && b.named), true);
          t(`running work is marked open (${all.filter((b) => b.open).length})`, all.some((b) => b.open) && all.some((b) => !b.open), true);
          if (pva.primary === null) {
            console.log("  (no primary-layout chart on this route — NOT PORTED for actualLayout=primary)");
          } else {
            const p = pva.primary;
            t(`primary: the actual bar is the main one (${p.actualMain} rows; ${p.planOnly} plan-only)`, p.actualMain >= 4 && p.planOnly >= 1, true);
            t("primary: every main bar centred, its plan outlined beneath", p.centred && p.planBelow, true);
            t(`primary: arrows end on the main bar (${p.arrowsOnBar} of ${p.arrows})`, p.arrows > 0 && p.arrowsOnBar === p.arrows, true);
          }
          if (pva.labels === null) {
            console.log("  (no project-board chart on this route — NOT PORTED for bar labels)");
          } else {
            t(`bar labels stay inside the chart (${pva.labels.clipped} of ${pva.labels.examined} clipped)`,
              pva.labels.examined >= 8 && pva.labels.clipped === 0, true);
            t(`the legend draws its entries (${pva.labels.legend})`, pva.labels.legend, 6);
            t(`month-in-weeks headers read as ranges (${pva.labels.weekColumns})`, pva.labels.weekColumns >= 3, true);
          }
        }
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

          // Section 5's own undo — "Undo" or "Undo (n)" — not any button that
          // mentions undoing (the backlog section has "Undo placement").
          const undo = page.getByRole("button", { name: /^Undo( \(\d+\))?$/ });
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

      /* The frozen pane has to cover its row's bottom rule. It is the row's
         child, so its box stops a pixel short of that border, and anything
         drawn over the axis at that height showed through as it scrolled under
         the pane: a dependency line routed along a row boundary crossed the
         whole pane. Counted, because every row passing with none examined is
         not a pass. */
      const rules = await page.evaluate(() => {
        const panes = [...document.querySelectorAll('[role="treegrid"] [role="row"]:not([aria-rowindex="1"]):not(:last-child) > div:first-child')];
        return { examined: panes.length, bare: panes.filter((p) => getComputedStyle(p).boxShadow === "none").length };
      });
      t(`every frozen pane cell covers its row's rule (${rules.examined} examined)`, [rules.examined > 0, rules.bare], [true, 0]);

      /* The sideways scrollbar belongs to the axis, not to the frozen pane.
         Needs a browser whose scrollbars take room: headless Chromium hides
         them, the bar is then (correctly) not drawn, and every assertion here
         would pass over nothing. */
      {
        const barPage = await barBrowser.newPage({ viewport: { width: 1440, height: 1000 } });
        await barPage.goto(`${origin}${route}`, { waitUntil: "networkidle" });
        if (direction === "rtl") {
          await barPage.evaluate(() => {
            document.documentElement.dir = "rtl";
          });
        }
        await sleep(800);
        const bars = await barPage.evaluate(async () => {
          const frames = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
          const out = [];
          for (const g of document.querySelectorAll('[role="treegrid"]')) {
            const sc = g.parentElement;
            const native = sc.offsetHeight - sc.clientHeight - 2 * sc.clientTop;
            const node = sc.parentElement.querySelector(":scope > [data-schedule-scrollbar]");
            const bar = node && getComputedStyle(node).display !== "none" ? node : null;
            if (!bar) {
              out.push({ native, drawn: false });
              continue;
            }
            const track = bar.lastElementChild;
            const pane = g.querySelector('[role="row"]:not([aria-rowindex="1"]) > div').getBoundingClientRect();
            const box = sc.getBoundingClientRect();
            const br = bar.getBoundingClientRect();
            const tr = track.getBoundingClientRect();
            const rtl = getComputedStyle(sc).direction === "rtl";
            const max = sc.scrollWidth - sc.clientWidth;
            const sign = rtl ? -1 : 1;
            sc.scrollLeft = sign * Math.round(max / 3);
            await frames();
            const follows = Math.round(track.scrollLeft - sc.scrollLeft);
            track.scrollLeft = sign * Math.round(max * 0.8);
            await frames();
            const drives = Math.round(track.scrollLeft - sc.scrollLeft);
            out.push({
              native,
              drawn: true,
              // Starts where the pane ends…
              fromPane: Math.round(rtl ? pane.left - tr.right : tr.left - pane.right),
              // …sits exactly on the native bar…
              onNative: [Math.round(box.bottom - sc.clientTop - br.bottom), Math.round(br.height) - native, Math.round(br.width - sc.clientWidth)],
              // …scrolls the same distance, both ways…
              range: track.scrollWidth - track.clientWidth - max,
              follows,
              drives,
              // …and is not a second tab stop.
              tabIndex: track.tabIndex,
            });
          }
          return out;
        });
        await barPage.close();
        const wanted = bars.filter((b) => b.native > 0);
        const drawn = bars.filter((b) => b.drawn);
        if (wanted.length === 0) {
          console.log("  (no chart scrolls sideways on this route — axis scrollbar not examined)");
        } else {
          t(`a chart that scrolls sideways draws its scrollbar under the axis only (${wanted.length} of ${bars.length})`, [drawn.length, bars.filter((b) => b.drawn && b.native === 0).length], [wanted.length, 0]);
          t("…starting where the frozen pane ends", drawn.map((b) => b.fromPane).filter((v) => v !== 0), []);
          t("…exactly over the native scrollbar", drawn.filter((b) => b.onNative.some((v) => v !== 0)).map((b) => b.onNative), []);
          t("…with the scroller's own range", drawn.map((b) => b.range).filter((v) => v !== 0), []);
          t("…following the scroller, and driving it", drawn.filter((b) => b.follows !== 0 || b.drives !== 0).map((b) => [b.follows, b.drives]), []);
          t("…without becoming a tab stop", drawn.map((b) => b.tabIndex).filter((v) => v !== -1), []);
        }
      }

      t("no runtime errors", errors, []);
      await page.close();
    }
  }

  stop();
}

await browser.close();
await barBrowser.close();
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
