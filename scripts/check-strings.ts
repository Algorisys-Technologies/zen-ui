/**
 * No hard-coded user-visible strings in a binding's components (review B1).
 *
 *   bun run check:strings            # Solid
 *   bun run check:strings react      # React (bun run check:strings:react)
 *   bun run check:strings vanilla    # vanilla; web components render through it
 *
 * Every string a component shows or announces comes from the message
 * catalogue (@algorisys/zen-ui-core/messages, through useLocale().t), so an
 * app can translate all of them. This scans component source (not the demo
 * pages) for the shapes such strings take: a text attribute with words in it
 * (aria-label, title, placeholder, label, description, emptyText, alt), an
 * English `?? "default"`, and words as JSX text. A line carrying
 * `// i18n-ignore (why)` is a deliberate exception (a brand, a selector);
 * `{/* i18n-ignore-start (why) *\/}` … `{/* i18n-ignore-end *\/}` excuses a block
 * (a developer install notice spread over several lines of JSX).
 *
 * The attribute shapes are not enough on their own. The React sweep left words
 * the first version could not see, because they were never written next to an
 * attribute: built in a helper and returned ("just now", "Today"), chosen by a
 * ternary three lines from the JSX that shows them ("Uploaded" : "Paused"),
 * kept in a data table (colour names, Likert's scale, a Gantt's column and
 * status labels), or mixed with an expression in JSX text ("{n} selected",
 * "Page {p} of {n}"). The second group of PATTERNS reads those shapes: a
 * capitalised English literal after `?`, `:` or `||` (which covers object
 * values: `label: "Red"`), a literal returned from a function, English words
 * in a template literal, JSX text around an `{expression}`, a sentence passed
 * to a call (`setError("Could not …")`), and an array of capitalised words.
 * Tuned on both bindings: what it still meets that is not a word for a user
 * (key names like "ArrowLeft", class strings, console warnings and thrown
 * errors, which are for developers) is excluded by shape, not by file.
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

// The binding to scan. Each keeps its library components one folder each under
// src/components/. Solid and React write JSX (.tsx; React's `className` is not
// a text attribute: no pattern names it); vanilla writes DOM calls (.ts) and
// has its own patterns.
const BINDINGS = ["solid", "react", "vanilla"] as const;
const binding = (process.argv[2] ?? "solid") as (typeof BINDINGS)[number];
if (!BINDINGS.includes(binding)) {
  console.error(`usage: bun run scripts/check-strings.ts [${BINDINGS.join("|")}]  (got ${binding})`);
  process.exit(2);
}
const BINDING = binding;
const jsx = binding !== "vanilla";
const ROOT = `packages/${binding}/src/components`;
// Swept in later batches (B1, 2026-11-04). Delete a line when its component is swept.
const NOT_YET_SWEPT = new Set<string>(
  binding !== "vanilla"
    ? []
    : [
      ],
);

// Text attributes, as JSX spells them and as a prop forwarding one does (`ariaLabel=`).
const SOLID_PATTERNS: [string, RegExp][] = [
  ["text attribute", /\b(aria-label|ariaLabel|aria-description|aria-roledescription|title|placeholder|label|description|emptyText|emptyMessage|alt|fallback)="[^"]*[A-Za-z]{2}[^"]*"/],
  ["templated text attribute", /\b(aria-label|title|placeholder|label|description)=\{`[^`]*[A-Za-z]{3}[^`]*`\}/],
  ["English default", /\?\? "[A-Z][a-z][^"]*"/],
  // Found by the React DocumentTabs port: words inside an attribute EXPRESSION
  // (a ternary of literals, a template after ??) and lowercase JSX text
  // (", unsaved changes" in an sr-only span) slipped past the three above.
  ["text in an attribute expression", /\b(aria-label|aria-description|aria-roledescription|title|placeholder|label|description|alt)=\{[^}]*(?:"[A-Z][a-z]+(?: [a-z]+)*"|`[^`]*\b[A-Za-z][a-z]{2,}\b[^`]*`)/],
  ["English template default", /\?\? `[^`]*[A-Za-z][a-z]{2,} [^`]*`/],
  ["lowercase JSX text", />\s*[,(]?\s*[a-z]+ [a-z]+(?: [a-z]+)*[.…:!?)]?\s*<\//],
  ["JSX text", />\s*[A-Z][a-z]+(?:[ ,'’.:…-]+[A-Za-z]+)*[.…:!?]?\s*<\//],
  // React's idiom for a default: a destructured prop default (`placeholder = "Search"`),
  // where Solid writes `local.placeholder ?? loc.t(…)`. Only label-like names; a
  // variant (`variant = "solid"`) or a displayName is not text, and `==` is a comparison.
  ["English prop default", /(?:^|[\s{,(])\w*(?:[Ll]abel|[Tt]ext|[Mm]essage|[Pp]laceholder|[Tt]itle|[Dd]escription|[Hh]eading|children) = "[^"]*[A-Za-z]{2}[^"]*"\s*(?:[,})]|$)/],
  // Capitalised words after the first ("View Data") and abbreviations ("RO") are text too.
  ["JSX text line", /^\s+[A-Z][A-Za-z]*(?:[ ,'’.:;…-]+[A-Za-z]+)*[.…:!?]?\s*$/],

  // --- Words away from an attribute (S2) -----------------------------------
  // `cond ? "Uploaded" : "Paused"`, `x || "Details"`, and object values: `label: "Red"`.
  ["literal chosen by an expression", /(?:[?:]|\|\|)\s*"[A-Z][a-z]+(?:[ ,'’.:;…-]+[A-Za-z]+)*[.…:!?]?"/],
  // A helper that returns words: `return "Today"`, `return "just now"`.
  ["returned literal", /\breturn\s+"(?:[A-Z][a-z]+(?:[ ,'’.:;…]+[A-Za-z]+)*|[a-z]+(?: [a-z]+)+)[.…!?]?"/],
  // Words in a template literal: `${n} remaining`, `Edit ${col}`, `${n}m ago`.
  ["text in a template literal", /`[^`]*(?:\$\{\} [a-z]{2,}\b|(?<![}\d])\b[A-Za-z][a-z]+ \$\{\}|\b[a-z]+ [a-z]{2,}\b)[^`]*`/],
  // The opening line of a template that runs on: aria-label={`Edit ${
  ["templated attribute, multi-line", /\b(aria-label|ariaLabel|title|placeholder|label|description)=\{`[A-Za-z][a-z]+ /],
  // JSX text around an expression: "Select all {n} matching", "{n} selected", "Move {label} to".
  ["JSX text with an expression", /(?:^|>)\s*[A-Z][a-z]+(?:[ ,.]+[A-Za-z]+)* \{[^{}]*\}|(?:^|>)\s*\{[^{}]*\} [a-z]{2,}(?: [a-z]+)*\s*(?:<|$)/],
  // A sentence handed to a call: setError("Could not load this image.").
  ["sentence passed to a call", /\(\s*(["'])[A-Z][a-z]+(?: [A-Za-z]+){2,}[^"']*\1/],
  // A table of capitalised words: ["Su", "Mo", …].
  ["array of words", /\[\s*"[A-Z][a-z]+"\s*,\s*"[A-Z][a-z]+"/],
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
const PATTERNS = jsx ? SOLID_PATTERNS : VANILLA_PATTERNS;
// Text a person never reads. Not exemptions by file: shapes that are code, or are
// for the developer (a console warning, a thrown error, "[DataTable] …").
const NOT_TEXT = [
  /\bconsole\.(?:warn|error|log|info|debug)\(/,
  /\bthrow new\b|\bnew Error\(/,
  /^\s*["'`]\[[A-Za-z][\w -]*\]/, // a "[Component] …" developer message continued from the line above
];
// A literal that is a name, not a word: key names ("ArrowLeft"), CSS, a class list.
const CODE_LITERAL = /"(?:Arrow|Page|Home|End|Enter|Escape|Tab|Backspace|Delete)[A-Za-z]*"|zen-|\b(?:var|calc|color-mix|translate\w*|rotate|scale|max|min|clamp|rgba?|hsla?)\(/;
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
    else if (p.endsWith(jsx ? ".tsx" : ".ts") && relative(ROOT, p).includes("/") && !/\.demo\./.test(p)) files.push(p);
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
  let ignoring = false;
  const hits: string[] = [];
  lines.forEach((line, i) => {
    const t = line.trim();
    if (/i18n-ignore-start\b/.test(line)) { ignoring = true; return; }
    if (/i18n-ignore-end\b/.test(line)) { ignoring = false; return; }
    if (ignoring) return;
    if (inComment) { if (t.includes("*/")) inComment = false; return; }
    // A JSX comment `{/* … */}` that runs over several lines is a comment too.
    if (t.startsWith("/*") || t.startsWith("{/*")) { if (!t.includes("*/")) inComment = true; return; }
    if (t.startsWith("//") || t.startsWith("*")) return;
    if (/\/\/ i18n-ignore\b/.test(line)) return;
    if (jsx && NOT_TEXT.some((re) => re.test(line))) return;
    // A JSX child cannot carry a // comment: {/* i18n-ignore-next-line (why) */} on the line above.
    if (/i18n-ignore-next-line\b/.test(lines[i - 1] ?? "")) return;
    if (BINDING === "vanilla" && VANILLA_SKIP.test(line)) return;
    // What a person could read: not the code inside ${…}, not a catalogue key being built.
    // (Vanilla also reads words through `localeOf(el).t(…)`, hence any `.t(` there.)
    const keyCall = jsx ? /loc\.t\((?:[^()]|\([^()]*\))*\)/g : /\.t\((?:[^()]|\([^()]*\))*\)/g;
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
    if (jsx) {
      raw = raw
        .replace(/(^|\s)\/\/\s.*$/, "$1") // a trailing comment is not shown
        .replace(/\/\*.*?\*\//g, ""); // nor an inline one
    }
    const scan = raw.replace(/\$\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g, "${}");
    for (const [kind, re] of PATTERNS) {
      if (kind === "JSX text line" && !/>\s*$/.test(lines[i - 1] ?? "")) continue; // only text between tags
      // Vanilla builds labels in templates: `${current.createLabel ?? "Create"} “${typed}”` hides its default inside ${…}.
      if (BINDING === "vanilla" && kind === "English default" && re.test(raw)) { hits.push(`${rel}:${i + 1}  ${kind}: ${t.slice(0, 100)}`); break; }
      const m = re.exec(scan);
      if (!m || (jsx && CODE_LITERAL.test(m[0]))) continue;
      hits.push(`${rel}:${i + 1}  ${kind}: ${t.slice(0, 100)}`);
      break;
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
// A scan of nothing is not a pass.
if (files.length === 0) { console.error(`FAIL no component files under ${ROOT}`); process.exit(1); }
console.log(`${binding}: ${swept - dirty} of ${swept} components clean of hard-coded strings${dirty ? ` (${offences} strings in ${dirty})` : ""}; ${NOT_YET_SWEPT.size} not yet swept (${pending} strings waiting)`);
process.exit(offences || stale.length ? 1 : 0);
