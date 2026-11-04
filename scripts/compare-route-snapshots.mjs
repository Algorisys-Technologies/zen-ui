/**
 * Compare two snapshot-routes.mjs runs. Every route in the baseline must be
 * identical, or "extended at the end" (only lines added after its last line: a
 * new section at a page's end). Anything else is reported with its first
 * differing lines and fails. Bare "- img" lines are ignored (the welcome page's
 * lazy previews). Exit 1 if any route changed or went missing.
 *
 *   node scripts/compare-route-snapshots.mjs before.json after.json
 */
import { readFileSync } from "node:fs";
const [basePath, nowPath] = process.argv.slice(2);
const base = JSON.parse(readFileSync(basePath, "utf8")), now = JSON.parse(readFileSync(nowPath, "utf8"));
const clean = (s) => s.split("\n").filter((l) => !/^\s*- img\s*$/.test(l)).join("\n");
const same = [], extended = [], changed = [], added = Object.keys(now).filter((k) => !(k in base)), gone = Object.keys(base).filter((k) => !(k in now));
// "Extended": every old line is still there, in order, and new lines were only added after
// the old content's last line (a new section at a page's end).
const isExtension = (a, b) => { const x = a.split("\n"), y = b.split("\n"); let i = 0; while (i < x.length && x[i] === y[i]) i++; return i >= x.length - 1 && y.length > x.length && x.slice(i).every((l, k) => y.slice(-(x.length - i))[k] === l); };
for (const k of Object.keys(base)) if (k in now) (clean(base[k]) === clean(now[k]) ? same : isExtension(clean(base[k]), clean(now[k])) ? extended : changed).push(k);
console.log(`baseline routes ${Object.keys(base).length}: identical ${same.length}, extended at the end ${extended.length} ${extended.join(" ")}, changed ${changed.length} ${changed.join(" ")}`);
console.log(`new routes: ${added.join(" ") || "none"}; missing: ${gone.join(" ") || "none"}`);
for (const k of changed) {
  const a = clean(base[k]).split("\n"), b = clean(now[k]).split("\n");
  let shown = 0;
  for (let i = 0; i < Math.max(a.length, b.length) && shown < 6; i++) if (a[i] !== b[i]) { console.log(`  ${k} line ${i}\n    was: ${a[i]}\n    now: ${b[i]}`); shown++; }
}
process.exit(changed.length || gone.length ? 1 : 0);
