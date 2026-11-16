/**
 * Freezing and styling, measured in a browser: DataTable and PivotGrid.
 *
 *   node scripts/check-table-dom.mjs              # react
 *   node scripts/check-table-dom.mjs solid
 *   node scripts/check-table-dom.mjs all
 *
 * Needs each binding's demo BUILT (`bun run build:<binding>`); it serves the
 * build with `vite preview`. Like check:schedule-dom it is not in `bun run
 * check`, which must run with no build and no browser.
 *
 * What it asserts is geometry the pure checks cannot see, each of it a bug that
 * existed or a feature that could silently stop working:
 *
 *  - pinned rows hold under the header and above the footer at full scroll;
 *  - pinned columns, THEIR footer totals and the select column hold at a
 *    sideways scroll (the totals used to scroll away from their column);
 *  - in a right-to-left page a left-pinned column sticks on the RIGHT, through
 *    a negative scroll (it stuck on the left), with its edge shadow mirrored;
 *  - stickyFooter keeps a plain footer at the bottom of the scroller;
 *  - meta.className / headerClassName and the cell font tokens reach the cells,
 *    and a table that sets nothing still draws its cells at the sm size;
 *  - a pivot's frozen labels, totals column and totals row hold their edges
 *    through a full two-way scroll in both directions, and in RTL the column
 *    window follows the scroll (it never moved: scrollLeft is negative there).
 *
 * A binding whose demo lacks the sections is reported NOT PORTED and counts as
 * neither a pass nor a failure; if nothing at all was checked it exits non-zero,
 * because a pass with a zero denominator is not a pass.
 */
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { BINDINGS } from "./bindings.mjs";

const PORTS = { react: 4350, solid: 4351, vanilla: 4352, "web-components": 4353 };

const named = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const wanted = named.length === 0 ? ["react"] : named[0] === "all" ? BINDINGS.map((b) => b.id) : named;
const unknown = wanted.filter((id) => !BINDINGS.some((b) => b.id === id));
if (unknown.length > 0) {
  console.error(`unknown binding(s): ${unknown.join(", ")}; known: ${BINDINGS.map((b) => b.id).join(", ")}, or "all"`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
let checks = 0;
const t = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  checks += 1;
  if (!ok) failures += 1;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(64)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};
/** Within a pixel: sticky offsets land on half pixels at some zoom levels. */
const near = (a, b) => a !== null && b !== null && Math.abs(a - b) <= 1;
const notPorted = [];

const serve = async (binding) => {
  const port = PORTS[binding.id];
  const server = spawn("npx", ["vite", "preview", "--config", "vite.config.demo.ts", "--port", String(port), "--strictPort"], {
    cwd: binding.dir,
    stdio: "ignore",
    detached: true,
  });
  const stop = () => {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {
      /* already gone */
    }
  };
  const origin = `http://localhost:${port}${binding.base}`;
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(`${origin}/`)).ok) return { origin, stop };
    } catch {
      /* not listening yet */
    }
    await sleep(300);
  }
  stop();
  return { origin: null, stop };
};

/** Rects of what matters in one DataTable section; the scroller is the table's parent. */
const tableGeo = (page, id) =>
  page.$eval(`[data-testid="${id}"]`, (w) => {
    const sc = w.querySelector("table").parentElement;
    const R = (e) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom };
    };
    const heads = [...w.querySelectorAll("thead tr:first-child th")];
    const col = (name) => heads.findIndex((h) => h.textContent.trim().startsWith(name));
    const foot = [...w.querySelectorAll("tfoot td")];
    const body = w.querySelector("tbody tr:not([data-pinned-row])");
    const pinned = (id) => w.querySelector(`tr[data-pinned-row="${id}"]`);
    return {
      sc: R(sc),
      head: R(heads[0]),
      firstRow: w.querySelector("tbody tr")?.getAttribute("data-pinned-row") ?? null,
      L1: R(pinned("L1")),
      L60: R(pinned("L60")),
      footTop: foot[0] ? R(foot[0]).t : null,
      footBottom: foot[0] ? R(foot[0]).b : null,
      item: { head: R(heads[col("Item")]), foot: R(foot[col("Item")]), body: R(body?.children[col("Item")]) },
      amount: { head: R(heads[col("Amount")]), foot: R(foot[col("Amount")]) },
      select: R(body?.children[0]),
      shadowItem: heads[col("Item")] ? getComputedStyle(heads[col("Item")]).boxShadow : "",
    };
  });
const scrollTable = (page, id, x, y) =>
  page.$eval(`[data-testid="${id}"]`, (w, [x, y]) => {
    const s = w.querySelector("table").parentElement;
    if (x !== null) s.scrollLeft = x;
    if (y !== null) s.scrollTop = y;
  }, [x, y]);
/** The x offset of the first shadow's inset line: its sign is the side it faces. */
const insetSign = (shadow) => {
  const m = /(-?\d+(?:\.\d+)?)px 0px 0px 0px inset/.exec(shadow);
  return m ? Math.sign(Number(m[1])) : 0;
};

const dataTable = async (page, origin) => {
  await page.goto(`${origin}/data-table`);
  await page.waitForSelector("table tbody tr");
  if (!(await page.$('[data-testid="frozen-rows"]'))) return false;
  await page.waitForSelector('[data-testid="frozen-rows"] tbody tr');

  console.log("  -- styling");
  const st = await page.$eval('[data-testid="styled-cells"]', (w) => {
    const heads = [...w.querySelectorAll("thead th")];
    const sal = heads.findIndex((h) => /Salary/.test(h.textContent));
    const rows = [...w.querySelectorAll("tbody tr")];
    const cells = rows.map((r) => r.children[sal]);
    const value = (c) => Number(c.textContent.replace(/[^\d]/g, ""));
    const ref = document.createElement("span");
    ref.className = "zen-text-sm";
    document.body.append(ref);
    const sm = getComputedStyle(ref).fontSize;
    ref.remove();
    const plain = document.querySelector("table:not([data-testid] table) tbody td") ?? document.querySelector("tbody td");
    return {
      rows: rows.length,
      greenWhereRich: cells.filter((c) => (value(c) >= 65000) === (getComputedStyle(c).fontWeight === "600")).length,
      headAlign: getComputedStyle(heads[sal]).textAlign,
      font: getComputedStyle(rows[0].children[0]).fontSize,
      lineHeight: getComputedStyle(rows[0].children[0]).lineHeight,
      defaultFont: getComputedStyle(plain).fontSize,
      sm,
    };
  });
  t(`meta.className (a function) styles exactly the rich rows (of ${st.rows})`, st.greenWhereRich, st.rows);
  t("meta.headerClassName reaches the header", st.headAlign, "end");
  t("--zen-table-cell-font-size / -line-height reach the cells", [st.font, st.lineHeight], ["13px", "18px"]);
  t("a table that sets nothing draws its cells at the sm size", st.defaultFont, st.sm);

  console.log("  -- frozen rows, pinned columns and their totals");
  const before = await tableGeo(page, "frozen-rows");
  t("a top-pinned row renders first", before.firstRow, "L1");
  await scrollTable(page, "frozen-rows", 400, 99999);
  await sleep(250);
  const g = await tableGeo(page, "frozen-rows");
  t("at full scroll, L1 sits right under the header", near(g.L1?.t, g.head?.b), true);
  t("…and L60 right above the totals", near(g.L60?.b, g.footTop), true);
  t("…and the totals at the scroller's bottom", near(g.footBottom, g.sc.b), true);
  t("scrolled 400px sideways, the pinned Item header stays", near(g.item.head?.l, before.item.head?.l), true);
  t("…its body cell stays", near(g.item.body?.l, before.item.body?.l), true);
  t("…its FOOTER cell stays with it", near(g.item.foot?.l, before.item.foot?.l), true);
  t("…the end-pinned Amount total holds the end edge", near(g.amount.foot?.r, g.sc.r), true);
  t("…the select column is pinned with the left pins", near(g.select?.l, before.select?.l), true);

  console.log("  -- right to left");
  const r0 = await tableGeo(page, "rtl-pinned");
  t("RTL: the left-pinned column sticks on the RIGHT edge", near(r0.item.head?.r, r0.sc.r), true);
  t("RTL: the right-pinned column on the LEFT edge", near(r0.amount.head?.l, r0.sc.l), true);
  await scrollTable(page, "rtl-pinned", -400, null);
  await sleep(200);
  const r1 = await tableGeo(page, "rtl-pinned");
  t("RTL: both hold through a negative scroll", [near(r1.item.head?.r, r1.sc.r), near(r1.amount.head?.l, r1.sc.l)], [true, true]);
  t("RTL: the edge shadow is mirrored", [insetSign(before.shadowItem), insetSign(r0.shadowItem)], [-1, 1]);

  console.log("  -- stickyFooter");
  const f = await tableGeo(page, "sticky-footer");
  t("a plain footer sits at the scroller's bottom before any scroll", near(f.footBottom, f.sc.b), true);
  await scrollTable(page, "sticky-footer", null, 300);
  await sleep(200);
  const f2 = await tableGeo(page, "sticky-footer");
  t("…and mid-scroll", near(f2.footBottom, f2.sc.b), true);
  // With row selection on, a footer without totals must still put a cell under
  // the checkbox column; vanilla's skipped it, and every footer cell sat one
  // column to the left of its column.
  const aligned = await page.$eval('[data-testid="sticky-footer"]', (w) => {
    const head = [...w.querySelectorAll("thead tr:first-child th")].find((h) => h.textContent.trim().startsWith("Item"));
    const foot = [...w.querySelectorAll("tfoot td")].find((c) => c.textContent.includes("60 lines"));
    return head && foot ? Math.abs(head.getBoundingClientRect().left - foot.getBoundingClientRect().left) <= 1 : null;
  });
  t("a plain footer sits under its own column (with row selection)", aligned, true);

  console.log("  -- the Columns menu, from the keyboard alone");
  const w = page.locator('[data-testid="frozen-rows"]');
  await w.scrollIntoViewIfNeeded();
  await w.getByRole("button", { name: "Columns" }).focus();
  await page.keyboard.press("Enter");
  await sleep(200);
  for (let i = 0; i < 12; i++) {
    if ((await page.evaluate(() => document.activeElement?.textContent?.trim())) === "Customer") break;
    await page.keyboard.press("ArrowDown");
    await sleep(50);
  }
  await page.keyboard.press("ArrowRight");
  await sleep(250);
  for (let i = 0; i < 6; i++) {
    if ((await page.evaluate(() => document.activeElement?.textContent?.trim())) === "Pin to right") break;
    await page.keyboard.press("ArrowDown");
    await sleep(50);
  }
  await page.keyboard.press("Enter");
  await sleep(250);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  const customer = await w.evaluate((el) => {
    const th = [...el.querySelectorAll("thead th")].find((h) => h.textContent.trim().startsWith("Customer"));
    return th ? getComputedStyle(th).position + ":" + (th.style.insetInlineEnd !== "" ? "end" : "-") : "missing";
  });
  t("Enter, ArrowDown…, ArrowRight, Pin to right pins the column", customer, "sticky:end");
  return true;
};

const pivotGeo = (page, id) =>
  page.$eval(`[data-testid="${id}"]`, (w) => {
    const sc = w.querySelector('[role="region"]');
    const R = (e) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { l: r.left, r: r.right, t: r.top, b: r.bottom };
    };
    return {
      sc: R(sc),
      label: R(w.querySelector("tbody th[scope=row]")),
      total: R(w.querySelector('th[data-pivot-total="column"]')),
      grand: R(w.querySelector('td[data-pivot-total="grand"]')),
    };
  });

const pivot = async (page, origin) => {
  await page.goto(`${origin}/pivot`);
  if (!(await page.waitForSelector('[data-testid="pivot-totals"] tbody td', { timeout: 8000 }).catch(() => null))) return false;
  for (const [id, rtl] of [["pivot-totals", false], ["pivot-rtl", true]]) {
    const tag = rtl ? "RTL" : "LTR";
    await page.$eval(`[data-testid="${id}"]`, (e) => e.scrollIntoView({ block: "center" }));
    for (const where of ["before", "full scroll"]) {
      if (where === "full scroll") {
        await page.$eval(`[data-testid="${id}"] [role="region"]`, (s, rtl) => {
          s.scrollLeft = rtl ? -99999 : 99999;
          s.scrollTop = 99999;
        }, rtl);
        await sleep(300);
      }
      const g = await pivotGeo(page, id);
      const start = rtl ? near(g.label?.r, g.sc.r - 1) || near(g.label?.r, g.sc.r) : near(g.label?.l, g.sc.l + 1) || near(g.label?.l, g.sc.l);
      const end = rtl ? near(g.total?.l, g.sc.l + 1) || near(g.total?.l, g.sc.l) : near(g.total?.r, g.sc.r);
      t(`pivot ${tag} ${where}: labels on the start edge`, start, true);
      t(`pivot ${tag} ${where}: the totals column on the end edge`, end, true);
      t(`pivot ${tag} ${where}: the grand total at the bottom`, near(g.grand?.b, g.sc.b), true);
    }
  }
  // RTL windowing: what is painted at the centre is a value, at every offset.
  const painted = await page.$eval('[data-testid="pivot-rtl"] [role="region"]', async (sc) => {
    const out = [];
    for (const x of [0, -700, -1400, -99999]) {
      sc.scrollLeft = x;
      await new Promise((r) => setTimeout(r, 250));
      const b = sc.getBoundingClientRect();
      const el = document.elementFromPoint(b.left + b.width * 0.4, b.top + b.height * 0.5);
      out.push(/^\$/.test(el?.textContent?.trim() ?? ""));
    }
    return out;
  });
  t("pivot RTL: the cells under the viewport are drawn at every scroll", painted, [true, true, true, true]);

  // Header classes, and the freeze switched off: the headers scroll away.
  if (await page.$('[data-testid="pivot-unfrozen"]')) {
    await page.$eval('[data-testid="pivot-unfrozen"]', (e) => e.scrollIntoView({ block: "center" }));
    const primarySoft = await page.evaluate(() => {
      const ref = document.createElement("span");
      ref.className = "zen-bg-zen-primary-soft";
      document.body.append(ref);
      const bg = getComputedStyle(ref).backgroundColor;
      ref.remove();
      return bg;
    });
    const look = await page.$eval('[data-testid="pivot-unfrozen"]', (w) => ({
      head: getComputedStyle(w.querySelector("thead th[scope=col]:not([aria-hidden])")).backgroundColor,
      label: getComputedStyle(w.querySelector("tbody th[scope=row]")).fontWeight,
    }));
    t("pivot headerClassName reaches the column headers", look.head, primarySoft);
    t("pivot rowHeaderClassName reaches the row labels", look.label, "600");
    const moved = await page.$eval('[data-testid="pivot-unfrozen"] [role="region"]', async (sc) => {
      const at = () => {
        const h = sc.querySelector("thead th[scope=col]:not([aria-hidden])").getBoundingClientRect();
        const l = sc.querySelector("tbody th[scope=row]").getBoundingClientRect();
        return { top: h.top, left: l.left };
      };
      const before = at();
      sc.scrollTop = 200;
      sc.scrollLeft = 300;
      await new Promise((r) => setTimeout(r, 250));
      const after = at();
      return { headerScrolled: after.top < before.top - 100, labelScrolled: after.left < before.left - 100 };
    });
    t("pivot stickyHeader={false}: the column headers scroll away", moved.headerScrolled, true);
    t("pivot stickyRowHeaders={false}: the row labels scroll away", moved.labelScrolled, true);
  } else {
    console.log("  NOT PORTED pivot header styling / freeze switches");
    notPorted.push("pivot header styling");
  }
  return true;
};

/**
 * The opt-in `density` prop, measured: touch reaches 48px targets, compact is
 * smaller than comfortable. (Comfortable itself is check:schedule-dom's and the
 * other sections' territory: they assert today's sizes.)
 */
const densities = async (page, origin) => {
  let any = false;
  const sizes = (id, sel, prop = "height") =>
    page.$eval(`[data-testid="${id}"]`, (w, [sel, prop]) => [...new Set([...w.querySelectorAll(sel)].map((e) => Math.round(e.getBoundingClientRect()[prop])))].sort((a, b) => a - b), [sel, prop]);
  const has = async (route, id) => {
    await page.goto(`${origin}/${route}`);
    return !!(await page.waitForSelector(`[data-testid="${id}"]`, { timeout: 8000 }).catch(() => null));
  };
  const ROWS = '[role="treegrid"] [role="row"]:not([aria-rowindex="1"])';
  if (await has("gantt", "gantt-touch")) {
    any = true;
    await page.waitForSelector('[data-testid="gantt-touch"] [data-gantt-bar]');
    t("gantt touch: rows 48, bars 32", [await sizes("gantt-touch", ROWS), await sizes("gantt-touch", "[data-gantt-bar]")], [[48], [32]]);
    t("gantt compact: rows 28, bars 14", [await sizes("gantt-compact", ROWS), await sizes("gantt-compact", "[data-gantt-bar]")], [[28], [14]]);
  }
  if (await has("production-schedule", "production-touch")) {
    any = true;
    await page.waitForSelector('[data-testid="production-touch"] [data-gantt-bar]');
    const touchRows = await sizes("production-touch", ROWS);
    t("production touch: one row height, at least 48", touchRows.length === 1 && touchRows[0] >= 48, true);
    t("production touch: lane bars 32", await sizes("production-touch", "[data-gantt-bar]"), [32]);
    t("production compact: lane bars 12", await sizes("production-compact", "[data-gantt-bar]"), [12]);
  }
  if (await has("planning-calendar", "lanes-touch")) {
    any = true;
    const block = '[style*="top"]:is(button, [role="button"])';
    t("calendar touch: appointments 48", await sizes("lanes-touch", block), [48]);
    t("calendar compact: appointments 18", await sizes("lanes-compact", block), [18]);
  }
  if (await has("spreadsheet-grid", "sheet-touch")) {
    any = true;
    const touch = await sizes("sheet-touch", '[role="gridcell"]');
    const compact = await sizes("sheet-compact", '[role="gridcell"]');
    t("sheet touch: cells at least 48", touch.every((h) => h >= 48) && touch.length > 0, true);
    t("sheet compact: cells under 24", compact.every((h) => h < 24) && compact.length > 0, true);
  }
  if (await has("tree", "tree-touch")) {
    any = true;
    const touch = await sizes("tree-touch", '[role="treeitem"] > div');
    const compact = await sizes("tree-compact", '[role="treeitem"] > div');
    t("tree touch: rows at least 48", touch.every((h) => h >= 48) && touch.length > 0, true);
    t("tree compact: rows under 28", compact.every((h) => h < 28) && compact.length > 0, true);
  }
  return any;
};

/** headerClassName on the schedules: the header row and its frozen pane take it. */
const scheduleHeaders = async (page, origin) => {
  let any = false;
  for (const [route, id] of [["gantt", "gantt-styled"], ["production-schedule", "production-styled"]]) {
    await page.goto(`${origin}/${route}`);
    if (!(await page.waitForSelector(`[data-testid="${id}"] [role="row"]`, { timeout: 8000 }).catch(() => null))) continue;
    any = true;
    const r = await page.$eval(`[data-testid="${id}"]`, (w) => {
      const ref = document.createElement("span");
      ref.className = "zen-bg-zen-primary-soft";
      document.body.append(ref);
      const want = getComputedStyle(ref).backgroundColor;
      ref.remove();
      const header = w.querySelector('[role="row"][aria-rowindex="1"]');
      const pane = header?.firstElementChild;
      return { want, row: header && getComputedStyle(header).backgroundColor, pane: pane && getComputedStyle(pane).backgroundColor };
    });
    t(`${route} headerClassName reaches the header row and its pane`, [r.row, r.pane], [r.want, r.want]);
  }
  return any;
};

const browser = await chromium.launch();
for (const id of wanted) {
  const binding = BINDINGS.find((b) => b.id === id);
  console.log(`\n${id}`);
  const { origin, stop } = await serve(binding);
  if (!origin) {
    console.log(`  FAIL preview server never came up (build the demo first: bun run build:${id === "react" ? "" : id})`);
    failures += 1;
    continue;
  }
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const [name, run] of [["DataTable", dataTable], ["PivotGrid", pivot], ["schedule headers", scheduleHeaders], ["density", densities]]) {
      if (!(await run(page, origin))) {
        notPorted.push(`${id} ${name}`);
        console.log(`  NOT PORTED ${name}`);
      }
    }
    t(`${id}: no page errors`, errors, []);
    await page.close();
  } finally {
    stop();
  }
}
await browser.close();

if (notPorted.length) console.log(`\nnot ported (neither pass nor fail): ${notPorted.join(", ")}`);
if (checks <= wanted.length) {
  console.log("\nnothing was checked: every section was missing");
  process.exit(1);
}
console.log(failures ? `\n${failures} of ${checks} FAILED` : `\nall passed — ${checks} assertions over ${wanted.length} binding(s)`);
process.exit(failures ? 1 : 0);
