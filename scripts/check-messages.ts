/**
 * Message catalogue contract.
 *
 *   bun run check:messages
 *
 * formatMessage fills {placeholders} and chooses plural forms by the locale's
 * own rules (Intl.PluralRules): English has one/other, Hindi counts 0 as
 * "one", Arabic has zero/one/two/few/many/other. Every catalogue entry must be
 * well formed (balanced braces, known plural categories), because a broken
 * translation shows its braces to a user.
 */
import { DEFAULT_MESSAGES, formatMessage } from "../packages/core/src/messages";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};
const RES = "{count, plural, one {# result} other {# results}}";
eq("plain", formatMessage("Close"), "Close");
eq("placeholder", formatMessage("Remove {tag}", { tag: "urgent" }), "Remove urgent");
eq("two placeholders", formatMessage("{label}: {name}", { label: "View", name: "Mine" }), "View: Mine");
eq("a missing value stays visible, not blank", formatMessage("Remove {tag}"), "Remove {tag}");
eq("a number value", formatMessage("Type {count} or more", { count: 3 }), "Type 3 or more");
eq("en plural one", formatMessage(RES, { count: 1 }, "en"), "1 result");
eq("en plural other", formatMessage(RES, { count: 2 }, "en"), "2 results");
eq("en plural zero is other", formatMessage(RES, { count: 0 }, "en"), "0 results");
eq("# is grouped in the locale", formatMessage(RES, { count: 125000 }, "en-IN"), "1,25,000 results");
eq("hi: 0 is 'one'", formatMessage("{n, plural, one {# परिणाम} other {# परिणाम (बहु)}}", { n: 0 }, "hi"), "0 परिणाम");
const AR = "{n, plural, zero {Z} one {O} two {T} few {F} many {M} other {X}}";
eq("ar: six forms", [0, 1, 2, 3, 11, 100].map((n) => formatMessage(AR, { n }, "ar")), ["Z", "O", "T", "F", "M", "X"]);
eq("=0 beats the category", formatMessage("{n, plural, =0 {none} one {# item} other {# items}}", { n: 0 }, "en"), "none");
eq("a placeholder inside a plural form", formatMessage("{n, plural, one {# view by {who}} other {# views by {who}}}", { n: 2, who: "Asha" }, "en"), "2 views by Asha");
eq("# inside a nested placeholder is not the number", formatMessage("{n, plural, other {# x {tag}}}", { n: 2, tag: "#1" }, "en"), "2 x #1");
eq("unbalanced braces are left as they are", formatMessage("Oops {name", { name: "x" }), "Oops {name");
eq("no matching form falls back to other", formatMessage("{n, plural, other {# things}}", { n: 1 }, "en"), "1 things");
eq("an unknown locale does not throw", formatMessage(RES, { count: 1 }, "zz-invalid-!!"), "1 results");

// Every entry well formed.
const CATS = /^(=\d+|zero|one|two|few|many|other)$/;
for (const [key, value] of Object.entries(DEFAULT_MESSAGES)) {
  let depth = 0, ok = true;
  for (const ch of value) { if (ch === "{") depth++; else if (ch === "}") { depth--; if (depth < 0) ok = false; } }
  eq(`${key}: braces balance`, ok && depth === 0, true);
  for (const m of value.matchAll(/\{\s*\w+\s*,\s*plural\s*,(.*)\}/gs)) {
    const cats = [...m[1].matchAll(/(\S+)\s*\{/g)].map((x) => x[1]).filter((c) => !c.includes("{"));
    eq(`${key}: plural categories are real`, cats.length > 0 && cats.every((c) => CATS.test(c)) && cats.includes("other"), true);
  }
  eq(`${key}: not empty`, value.trim().length > 0, true);
}
eq("catalogue size", Object.keys(DEFAULT_MESSAGES).length > 100, true);

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions, ${Object.keys(DEFAULT_MESSAGES).length} messages)`);
process.exit(failed ? 1 : 0);
