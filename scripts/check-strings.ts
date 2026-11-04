/**
 * No hard-coded user-visible strings in a binding's components (review B1).
 *
 *   bun run check:strings            (Solid)
 *   bun run check:strings:vanilla    (vanilla; web-components renders through it)
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
 *
 * Vanilla writes its words through the DOM rather than JSX, so it has its own
 * patterns (VANILLA_PATTERNS below), each drawn from a real hit in the sweep:
 * `x.textContent = "…"`, `setAttribute("aria-label", "…")`, a factory option
 * (`children: "Go"`, `"aria-label": "Search"`), an English `?? "default"`, a
 * sentence or a capitalised word as a literal argument or ternary branch.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const BINDING = process.argv[2] ?? "solid";
if (BINDING !== "solid" && BINDING !== "vanilla") {
  console.error(`usage: bun run scripts/check-strings.ts [solid|vanilla]  (got ${BINDING})`);
  process.exit(2);
}
const ROOT = `packages/${BINDING}/src/components`;
// Swept in later batches (B1, 2026-11-04). Delete a line when its component is swept.
const NOT_YET_SWEPT = new Set<string>(
  BINDING === "solid"
    ? []
    : [
        // Being edited by the vanilla DataTable port at the time of the vanilla sweep (unit S).
        "data-table/data-table.ts",
        "data-table/table.ts",
      ],
);

const SOLID_PATTERNS: [string, RegExp][] = [
  ["text attribute", /\b(aria-label|aria-description|aria-roledescription|title|placeholder|label|description|emptyText|emptyMessage|alt|fallback)="[^"]*[A-Za-z]{2}[^"]*"/],
  ["templated text attribute", /\b(aria-label|title|placeholder|label|description)=\{`[^`]*[A-Za-z]{3}[^`]*`\}/],
  ["English default", /\?\? "[A-Z][a-z][^"]*"/],
  // Found by the React DocumentTabs port: words inside an attribute EXPRESSION
  // (a ternary of literals, a template after ??) and lowercase JSX text
  // (", unsaved changes" in an sr-only span) slipped past the three above.
  ["text in an attribute expression", /\b(aria-label|aria-description|aria-roledescription|title|placeholder|label|description|alt)=\{[^}]*(?:"[A-Z][a-z]+(?: [a-z]+)*"|`[^`]*\b[A-Za-z][a-z]{2,}\b[^`]*`)/],
  ["English template default", /\?\? `[^`]*[A-Za-z][a-z]{2,} [^`]*`/],
  ["lowercase JSX text", />\s*[,(]?\s*[a-z]+ [a-z]+(?: [a-z]+)*[.…:!?)]?\s*<\//],
  ["JSX text", />\s*[A-Z][a-z]+(?:[ ,'’.:…-]+[A-Za-z]+)*[.…:!?]?\s*<\//],
  ["JSX text line", /^\s+[A-Z][a-z]+(?:[ ,'’-]+[a-z]+)*[.…:!?]?\s*$/],
];

// The text-bearing attributes, as vanilla names them in setAttribute and in factory options.
const ATTR = "aria-label|aria-description|aria-roledescription|aria-valuetext|aria-placeholder|title|placeholder|alt";
// Factory options that render as words (Button's children, EmptyState's title, a Loading label…).
const OPTION = "title|placeholder|label|description|emptyMessage|emptyText|alt|children|message|menuLabel|ariaLabel|header|captureLabel";
const VANILLA_PATTERNS: [string, RegExp][] = [
  // el.textContent = "No file selected." / input.placeholder = cond ? "…" : "…"
  ["text assignment", /\.(?:textContent|innerText|title|placeholder|alt|ariaLabel|ariaRoleDescription|ariaValueText|ariaDescription)\s*=\s*(?:[^;]*?[?:]\s*)?(["'`])[^"'`]*[A-Za-z]{2}/],
  // btn.setAttribute("aria-label", dir === "prev" ? "Previous slide" : "Next slide")
  ["text attribute", new RegExp(`setAttribute\\(\\s*"(?:${ATTR})"\\s*,\\s*[^)]*?(["'\`])[^"'\`]*[A-Za-z]{2}`)],
  // Button({ children: "Retry" }), { "aria-label": `Remove ${name}` }, { label: "Strongly agree" }
  ["text option", new RegExp(`(?:"(?:${ATTR})"|\\b(?:${OPTION}))\\s*:\\s*(?:[^,{}]*?[?:]\\s*)?(["'\`])(?!zen-)[^"'\`]*[A-Za-z]{2}`)],
  // current.placeholder ?? "Pick a date" / ?? `${n} selected`
  ["English default", /\?\?\s*(?:"OK"|"[A-Z][a-z]+(?:[\s.,…!?:'’]|")|"[a-z]+ [a-z]+|`[^`]*\b[A-Za-z][a-z]{2,} )/],
  // showStatus("Loading camera…"), iconButton(MINUS, "Zoom out", …), TREND = { up: "Trending up" }
  ["English sentence", /(["'`])[A-Z][a-z]+(?:[ ,.;:'’()]+[A-Za-z’']+)+[.…!?:]?\s?\1/],
  // `${file.name} uploaded`, `Failed: ${error}`: words beside a value, wherever the template goes
  ["words around a value", /`[^`]*(?:\$\{\}[a-z]{0,2} [a-z]{3,}(?![-\w:(])|(?<![}\w-])[A-Za-z][a-z]+:? \$\{\})[^`]*`/],
  // const { label = "Carousel", menuLabel = "More actions" } = props
  ["text default", /\b(?:label|title|placeholder|description|message|\w+(?:Label|Message|Text|Title|Placeholder))\s*=\s*(["'`])[^"'`]*[A-Za-z]{2}/],
  // status === "done" ? "Uploaded" : …, { delayed: "Delayed" }, el("span", "zen-sr-only", "Row")
  // el("div", "zen-…",\n  "Resource",\n) — an argument on a line of its own
  ["literal line", /^\s*(["'`])(?:[A-Z][a-z]+|[a-z]+ [a-z]+)(?:[ ,.'’][A-Za-z’']*)*[.…!?:]?\1,?\s*$/],
  // critical ? "on the critical path" : null, [name, "incl. changeover"]
  ["lowercase words", /(?:[?:(,[]|\?\?)\s*"[a-z]+\.? [a-z]+[^"]*"/],
  // return "Today" / return "just now"
  ["returned words", /\breturn\s+"(?:[A-Z][a-z]+|[a-z]+ [a-z]+)[^"]*"/],
  ["capitalised literal", /(?:[?:]|[(,])\s*"(?!(?:Enter|Escape|Tab|Home|End|Backspace|Delete|Space|Shift|Control|Alt|Meta|PageUp|PageDown|Arrow[A-Za-z]+)")[A-Z][a-z]+[.…]?"/],
];
const PATTERNS = BINDING === "solid" ? SOLID_PATTERNS : VANILLA_PATTERNS;
// Vanilla lines that cannot be user-visible: developer errors, imports, DOM plumbing.
const VANILLA_SKIP = /\b(?:throw|console\.\w+|new Error|import|displayName)\b/;
// DOM plumbing whose string arguments are selectors, event names and tags, never words.
const VANILLA_PLUMBING = /\b(?:querySelector(?:All)?|closest|matches|addEventListener|removeEventListener|createElement(?:NS)?)\([^)]*\)/g;

const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    // Library components live in a folder each (components/<name>/…); the files at the top of
    // components/ are the demo site's pages (New*Demo, Welcome, ReleaseNotes…), not shipped.
    else if (p.endsWith(BINDING === "solid" ? ".tsx" : ".ts") && relative(ROOT, p).includes("/") && !/\.demo\./.test(p)) files.push(p);
  }
};
walk(ROOT);

let swept = 0, offences = 0, pending = 0;
const report: string[] = [];
for (const file of files.sort()) {
  const rel = relative(ROOT, file);
  // Only lines of component code: JSDoc examples and comments are not shown to anyone.
  const lines = readFileSync(file, "utf8").split("\n");
  // A whole file of data rather than UI (an exported lookup table) says so once, at the top.
  if (lines.slice(0, 5).some((l) => /^\/\/ i18n-ignore-file \(.+\)/.test(l))) {
    swept++;
    continue;
  }
  let inComment = false;
  const hits: string[] = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (inComment) { if (t.includes("*/")) inComment = false; return; }
    if (t.startsWith("/*")) { if (!t.includes("*/")) inComment = true; return; }
    if (t.startsWith("//") || t.startsWith("*") || t.startsWith("{/*")) return;
    if (/\/\/ i18n-ignore\b/.test(line)) return;
    // A JSX child cannot carry a // comment: {/* i18n-ignore-next-line (why) */} on the line above.
    if (/i18n-ignore-next-line\b/.test(lines[i - 1] ?? "")) return;
    if (BINDING === "vanilla" && VANILLA_SKIP.test(line)) return;
    // What a person could read: not the code inside ${…}, not a catalogue key being built.
    // (Vanilla also reads words through `localeOf(el).t(…)`, hence any `.t(` there.)
    const keyCall = BINDING === "solid" ? /loc\.t\((?:[^()]|\([^()]*\))*\)/g : /\.t\((?:[^()]|\([^()]*\))*\)/g;
    let raw = line.replace(keyCall, "loc.t()");
    // A trailing comment is prose for the next reader, not text for a user. Nor are an
    // index (`current["aria-label"]`), a comparison (`=== "string"`) or a catalogue key.
    if (BINDING === "vanilla") {
      raw = raw
        .replace(/\s\/\/ .*$/, "")
        .replace(VANILLA_PLUMBING, "plumbing()")
        .replace(/\[\s*"[^"]*"\s*\]/g, "[]")
        .replace(/[!=]==?\s*"[^"]*"/g, "=== STR")
        .replace(/"[a-z][A-Za-z]*(?:\.[A-Za-z0-9]+)+"/g, "KEY");
    }
    const scan = raw.replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, "${}");
    for (const [kind, re] of PATTERNS) {
      if (kind === "JSX text line" && !/>\s*$/.test(lines[i - 1] ?? "")) continue; // only text between tags
      // Vanilla builds labels in templates: `${current.createLabel ?? "Create"} “${typed}”` hides its default inside ${…}.
      if (BINDING === "vanilla" && kind === "English default" && re.test(raw)) { hits.push(`${rel}:${i + 1}  ${kind}: ${t.slice(0, 100)}`); break; }
      if (re.test(scan)) { hits.push(`${rel}:${i + 1}  ${kind}: ${t.slice(0, 100)}`); break; }
    }
  });
  if (NOT_YET_SWEPT.has(rel)) { pending += hits.length; continue; }
  swept++;
  if (hits.length) { offences += hits.length; report.push(...hits); }
}
const stale = [...NOT_YET_SWEPT].filter((f) => !files.some((p) => relative(ROOT, p) === f));
for (const r of report) console.error(`FAIL ${r}`);
for (const s of stale) console.error(`FAIL NOT_YET_SWEPT names a file that does not exist: ${s}`);
const dirty = new Set(report.map((r) => r.split(":")[0])).size;
console.log(`${swept - dirty} of ${swept} components clean of hard-coded strings${dirty ? ` (${offences} strings in ${dirty})` : ""}; ${NOT_YET_SWEPT.size} not yet swept (${pending} strings waiting)`);
process.exit(offences || stale.length ? 1 : 0);
