/**
 * No hard-coded user-visible strings in a binding's components (review B1).
 *
 *   bun run check:strings            # Solid
 *   bun run check:strings react      # React (bun run check:strings:react)
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

// The binding to scan. Both keep their library components one folder each under
// src/components/, and spell the text attributes the same way (React's
// `className` is not one of them: none of the patterns below name it).
const BINDINGS = ["solid", "react"] as const;
const binding = (process.argv[2] ?? "solid") as (typeof BINDINGS)[number];
if (!BINDINGS.includes(binding)) {
  console.error(`usage: bun run scripts/check-strings.ts [${BINDINGS.join("|")}]`);
  process.exit(2);
}
const ROOT = `packages/${binding}/src/components`;
// Swept in later batches (B1, 2026-11-04). Delete a line when its component is swept.
const NOT_YET_SWEPT = new Set<string>(binding === "solid" ? [] : []);

const PATTERNS: [string, RegExp][] = [
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
  // React's idiom for a default: a destructured prop default (`placeholder = "Search"`),
  // where Solid writes `local.placeholder ?? loc.t(…)`. Only label-like names; a
  // variant (`variant = "solid"`) or a displayName is not text, and `==` is a comparison.
  ["English prop default", /(?:^|[\s{,(])\w*(?:[Ll]abel|[Tt]ext|[Mm]essage|[Pp]laceholder|[Tt]itle|[Dd]escription|[Hh]eading) = "[^"]*[A-Za-z]{2}[^"]*"\s*(?:[,})]|$)/],
  ["JSX text line", /^\s+[A-Z][a-z]+(?:[ ,'’-]+[a-z]+)*[.…:!?]?\s*$/],
];

const files: string[] = [];
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    // Library components live in a folder each (components/<name>/…); the files at the top of
    // components/ are the demo site's pages (New*Demo, Welcome, ReleaseNotes…), not shipped.
    else if (p.endsWith(".tsx") && relative(ROOT, p).includes("/") && !/\.demo\./.test(p)) files.push(p);
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
    // A JSX child cannot carry a // comment: {/* i18n-ignore-next-line (why) */} on the line above.
    if (/i18n-ignore-next-line\b/.test(lines[i - 1] ?? "")) return;
    // What a person could read: not the code inside ${…}, not a catalogue key being built.
    const scan = line.replace(/loc\.t\((?:[^()]|\([^()]*\))*\)/g, "loc.t()").replace(/\$\{(?:[^{}]|\{[^{}]*\})*\}/g, "${}");
    for (const [kind, re] of PATTERNS) {
      if (kind === "JSX text line" && !/>\s*$/.test(lines[i - 1] ?? "")) continue; // only text between tags
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
// A scan of nothing is not a pass.
if (files.length === 0) { console.error(`FAIL no component files under ${ROOT}`); process.exit(1); }
console.log(`${binding}: ${swept - dirty} of ${swept} components clean of hard-coded strings${dirty ? ` (${offences} strings in ${dirty})` : ""}; ${NOT_YET_SWEPT.size} not yet swept (${pending} strings waiting)`);
process.exit(offences || stale.length ? 1 : 0);
