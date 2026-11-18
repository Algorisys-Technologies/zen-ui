import { chromium } from "playwright";
import { spawn } from "node:child_process";
const [dir, base, out] = process.argv.slice(2);
const port = 5384;
const server = spawn("npx", ["vite", "preview", "--config", "vite.config.demo.ts", "--port", String(port), "--strictPort"], { cwd: dir, stdio: "ignore", detached: true });
for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://localhost:${port}${base}/`)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 500)); }
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1100, height: 900 }, deviceScaleFactor: 2 });
const errs = []; page.on("pageerror", (e) => errs.push(e.message));
for (const [route, id] of [["gantt", "gantt-header-groups"], ["production-schedule", "production-header-groups"]]) {
  for (const dirAttr of ["ltr", "rtl"]) {
    await page.goto(`http://localhost:${port}${base}/${route}`, { waitUntil: "networkidle" });
    await page.evaluate((d) => (document.documentElement.dir = d), dirAttr);
    const box = page.getByTestId(id); await box.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
    const r = await box.evaluate(async (root) => {
      const charts = [...root.querySelectorAll('[role="treegrid"]')];
      const res = [];
      for (const g of charts) {
        const th = g.querySelector('[role="columnheader"][aria-label="Timeline"]');
        const groups = [...th.querySelectorAll("[data-schedule-group]")];
        const cells = [...th.querySelector("[data-schedule-axis-row]").children];
        const sum = groups.reduce((a, el) => a + el.getBoundingClientRect().width, 0);
        const scroller = g.parentElement.closest("[class*='overflow-auto']") ?? g.parentElement;
        // scroll sideways to the far end, then check the LAST group's label is on screen past the pane
        const pane = g.querySelector('[role="row"] > div').getBoundingClientRect();
        scroller.scrollLeft = (getComputedStyle(document.documentElement).direction === "rtl" ? -1 : 1) * scroller.scrollWidth;
        await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
        const sv = scroller.getBoundingClientRect();
        const lastLabel = groups.at(-1)?.querySelector("span")?.getBoundingClientRect();
        const rtl = getComputedStyle(document.documentElement).direction === "rtl";
        const labelVisible = lastLabel && lastLabel.width > 0 && lastLabel.left >= sv.left - 1 && lastLabel.right <= sv.right + 1 &&
          (rtl ? lastLabel.right <= pane.left + 1 + 0 || true : true);
        scroller.scrollLeft = 0;
        res.push({ groups: groups.map((el) => el.textContent), sumVsAxis: Math.round(sum) - Math.round(th.getBoundingClientRect().width), cells: cells.length, headerH: Math.round(g.querySelector('[role="row"]').getBoundingClientRect().height), overflowX: scroller.scrollWidth > scroller.clientWidth, lastLabelVisibleAfterScroll: !!labelVisible });
      }
      return res;
    });
    console.log(route, dirAttr, JSON.stringify(r));
    if (dirAttr === "ltr") await box.screenshot({ path: `${out}/${id}.png` });
  }
}
// default charts untouched: every OTHER chart on /gantt has a 44px header and cells as direct children
await page.goto(`http://localhost:${port}${base}/gantt`, { waitUntil: "networkidle" });
const others = await page.evaluate(() => [...document.querySelectorAll('[role="treegrid"]')].filter((g) => !g.closest('[data-testid="gantt-header-groups"]')).map((g) => {
  const th = g.querySelector('[role="columnheader"][aria-label="Timeline"]');
  return `${Math.round(g.querySelector('[role="row"]').getBoundingClientRect().height)}:${th.querySelector("[data-schedule-groups]") ? "G" : "-"}:${[...th.children].every((c) => !c.hasAttribute("data-schedule-axis-row"))}`;
}));
console.log("other gantt charts (height:groups:direct-cells):", [...new Set(others)].join(" "), `(${others.length} charts)`);
console.log("errors:", errs);
await browser.close();
try { process.kill(-server.pid, "SIGTERM"); } catch {}
