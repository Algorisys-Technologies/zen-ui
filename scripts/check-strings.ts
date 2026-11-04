/**
 * No hard-coded user-visible strings in the Solid components (review B1).
 *
 *   bun run check:strings
 *
 * Every string a component shows or announces comes from the message
 * catalogue (@algorisys/zen-ui-core/messages, through useLocale().t), so an
 * app can translate all of them. This scans component source (not the demo
 * pages) for the shapes such strings take: a text attribute with words in it
 * (aria-label, title, placeholder, label, description, emptyText, alt), an
 * English `?? "default"`, and words as JSX text. A line carrying
 * `// i18n-ignore (why)` is a deliberate exception (a brand, a selector).
 *
 * Components not yet swept are listed in NOT_YET_SWEPT and only warned about;
 * the list shrinks to empty batch by batch, and a NEW component is never on it,
 * so it must use the catalogue from the start.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "packages/solid/src/components";
// Swept in later batches (B1, 2026-11-04). Delete a line when its component is swept.
const NOT_YET_SWEPT = new Set<string>([
  "alert/alert.tsx",
  "banner/banner.tsx",
  "barcode/barcode.tsx",
  "breadcrumb/breadcrumb.tsx",
  "button/button-family.tsx",
  "carousel/carousel.tsx",
  "chart/chart.tsx",
  "chunk-uploader/chunk-uploader.tsx",
  "code-editor/code-editor.tsx",
  "color-picker/color-picker.tsx",
  "command/command.tsx",
  "countdown/countdown.tsx",
  "data-table/data-table.tsx",
  "data-table/filters.tsx",
  "diagram-canvas/diagram-canvas.tsx",
  "diff-view/diff-view.tsx",
  "document-tabs/document-tabs.tsx",
  "document-viewer/document-viewer.tsx",
  "dynamic-page/dynamic-page.tsx",
  "file-upload/file-upload.tsx",
  "flexible-column-layout/flexible-column-layout.tsx",
  "form/dynamic-date-range/dynamic-date-range.tsx",
  "form/otp/otp.tsx",
  "gantt/gantt.tsx",
  "gantt/schedule-grid.tsx",
  "media-timeline/media-timeline.tsx",
  "message-popover/message-popover.tsx",
  "notifications-inbox/notifications-inbox.tsx",
  "object-page/object-page.tsx",
  "page-header/page-header.tsx",
  "pagination/pagination.tsx",
  "PasswordInputDemo.tsx",
  "pivot/internal/windowed-virtual-list.tsx",
  "pivot/pivot-drop-zone.tsx",
  "pivot/pivot-field-chip.tsx",
  "pivot/pivot-filter-menu.tsx",
  "pivot/pivot-grid.tsx",
  "pivot/pivot-workbench.tsx",
  "planning-calendar/planning-calendar.tsx",
  "proctor/proctor.tsx",
  "production-schedule/production-schedule.tsx",
  "qr-scanner/qr-scanner.tsx",
  "ReleaseNotes.tsx",
  "rich-text/rich-text.tsx",
  "SearchDemo.tsx",
  "sheet/sheet.tsx",
  "shellbar/shellbar.tsx",
  "shortcuts/shortcuts.tsx",
  "sidebar/sidebar.tsx",
  "SkipToContentDemo.tsx",
  "skip-to-content/skip-to-content.tsx",
  "sortable-list/sortable-list.tsx",
  "splitter/splitter.tsx",
  "spreadsheet-grid/spreadsheet-grid.tsx",
  "stepper/stepper.tsx",
  "survey/nps.tsx",
  "tile/tile.tsx",
  "timeline/timeline.tsx",
  "toolbar/toolbar.tsx",
  "tree-table/tree-table.tsx",
  "upload-collection/upload-collection.tsx",
  "url-data-table/url-data-table.tsx",
  "waveform/waveform.tsx",
  "Welcome.tsx",
]);

const PATTERNS: [string, RegExp][] = [
  ["text attribute", /\b(aria-label|aria-description|aria-roledescription|title|placeholder|label|description|emptyText|emptyMessage|alt)="[^"]*[A-Za-z]{2}[^"]*"/],
  ["templated text attribute", /\b(aria-label|title|placeholder|label|description)=\{`[^`]*[A-Za-z]{3}[^`]*`\}/],
  ["English default", /\?\? "[A-Z][a-z][^"]*"/],
  ["JSX text", />\s*[A-Z][a-z]+(?:[ ,'’.:…-]+[A-Za-z]+)*[.…:!?]?\s*<\//],
  ["JSX text line", /^\s+[A-Z][a-z]+(?:[ ,'’-]+[a-z]+)*[.…:!?]?\s*$/],
];

const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (p.endsWith(".tsx") && !/\/New[A-Z]\w*Demo\.tsx$/.test(p) && !/demo-helpers|NavTag|\.demo\./.test(p)) files.push(p);
  }
};
walk(ROOT);

let swept = 0, offences = 0, pending = 0;
const report: string[] = [];
for (const file of files.sort()) {
  const rel = relative(ROOT, file);
  // Only lines of component code: JSDoc examples and comments are not shown to anyone.
  const lines = readFileSync(file, "utf8").split("\n");
  let inComment = false;
  const hits: string[] = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (inComment) { if (t.includes("*/")) inComment = false; return; }
    if (t.startsWith("/*")) { if (!t.includes("*/")) inComment = true; return; }
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("{/*")) return;
    if (/\/\/ i18n-ignore\b/.test(line)) return;
    for (const [kind, re] of PATTERNS) {
      if (kind === "JSX text line" && !/>\s*$/.test(lines[i - 1] ?? "")) continue; // only text between tags
      if (re.test(line)) { hits.push(`${rel}:${i + 1}  ${kind}: ${t.slice(0, 100)}`); break; }
    }
  });
  if (NOT_YET_SWEPT.has(rel)) { pending += hits.length; continue; }
  swept++;
  if (hits.length) { offences += hits.length; report.push(...hits); }
}
const stale = [...NOT_YET_SWEPT].filter((f) => !files.some((p) => relative(ROOT, p) === f));
for (const r of report) console.error(`FAIL ${r}`);
for (const s of stale) console.error(`FAIL NOT_YET_SWEPT names a file that does not exist: ${s}`);
console.log(`${swept} components clean of hard-coded strings; ${NOT_YET_SWEPT.size} not yet swept (${pending} strings waiting)`);
process.exit(offences || stale.length ? 1 : 0);
