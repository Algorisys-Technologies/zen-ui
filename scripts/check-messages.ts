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
import { DEFAULT_MESSAGES, formatMessage, type MessageKey } from "../packages/core/src/messages";
import { encodeBarcode, encodeQr } from "../packages/core/src/barcode";
import { describeFilter, operatorLabel, operatorsFor, type FilterField, type FilterNode, type FilterFieldType } from "../packages/core/src/filter";
import { DATE_RANGE_OPERATORS, formatDateRangeValue, type DateRangeValue } from "../packages/core/src/date-range";

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

// Core's barcode errors carry a `code` + `values`; the catalogue's English for
// that code must say exactly what core's own `error` says, or an untranslated
// UI changes wording the moment it switches to the catalogue.
const barcodeErrors = [
  encodeBarcode("", "code128"), encodeBarcode("é", "code128"), encodeBarcode("123", "ean13"),
  encodeBarcode("4006381333932", "ean13"), encodeBarcode("ab", "code39"),
  encodeQr("x".repeat(4000), { ecc: "H" }), encodeQr("1".repeat(9000), { ecc: "H" }),
];
const codes = new Set<string>();
for (const e of barcodeErrors) {
  if (e.ok || !e.code) { eq("barcode error has a code", e, "an error with a code"); continue; }
  codes.add(e.code);
  eq(`barcode.error.${e.code} matches core`, formatMessage(DEFAULT_MESSAGES[`barcode.error.${e.code}` as MessageKey], e.values), e.error);
}
eq("every barcode error code exercised", codes.size, 7);

// Date-range words: the catalogue path must read exactly as core's own English,
// for every operator, so switching DynamicDateRange onto the catalogue changes
// nothing an untranslated app shows.
const t = (key: string, values?: Record<string, string | number>) =>
  formatMessage(DEFAULT_MESSAGES[key as MessageKey] ?? `MISSING ${key}`, values, "en");
const fd = (d: Date) => d.toISOString().slice(0, 10);
let dr = 0;
for (const o of DATE_RANGE_OPERATORS) {
  eq(`dateRange.op.${o.operator}`, t(`dateRange.op.${o.operator}`), o.label);
  eq(`dateRange.group.${o.group}`, t(`dateRange.group.${o.group}`), o.group);
  const values: DateRangeValue[] =
    o.arity === "count"
      ? [0, 1, 2, 7, 1.9, 1000, -3].flatMap((count) => [false, true].map((includeCurrent) => ({ operator: o.operator, count, includeCurrent }) as DateRangeValue))
      : o.arity === "date"
        ? [{ operator: o.operator, date: "2026-07-01" }, { operator: o.operator, date: "nonsense" }] as DateRangeValue[]
        : o.arity === "range"
          ? [{ operator: "BETWEEN", from: "2026-07-14", to: "2026-07-01" }, { operator: "BETWEEN", from: "", to: "2026-07-01" }] as DateRangeValue[]
          : [{ operator: o.operator } as DateRangeValue];
  for (const v of values) {
    dr++;
    eq(`formatDateRangeValue ${JSON.stringify(v)}`, formatDateRangeValue(v, fd, t), formatDateRangeValue(v, fd));
  }
}
eq("date-range values compared", dr > 150, true);

/** The selectors of a plural body's TOP-LEVEL forms: "one {Last {count} day} other {…}" is one, other — not "Last". */
function pluralCategories(body: string): string[] {
  const cats: string[] = [];
  let i = 0;
  while (i < body.length) {
    const open = body.indexOf("{", i);
    if (open < 0) break;
    cats.push(body.slice(i, open).trim());
    let depth = 0, j = open;
    for (; j < body.length; j++) { if (body[j] === "{") depth++; else if (body[j] === "}" && --depth === 0) break; }
    i = j + 1;
  }
  return cats;
}

// Filter words: same rule. Every operator of every field type, then summaries
// covering each sentence shape (no value, one, two, a list of one and of many,
// and/or, nested, negated).
for (const type of ["text", "number", "date", "enum", "boolean"] as FilterFieldType[])
  for (const op of operatorsFor(type)) eq(`operatorLabel ${type}.${op}`, operatorLabel(op, type, t), operatorLabel(op, type));
const FF: FilterField[] = [
  { id: "name", label: "Name", type: "text" }, { id: "amt", label: "Amount", type: "number" },
  { id: "due", label: "Due", type: "date" }, { id: "paid", label: "Paid", type: "boolean" },
  { id: "st", label: "Status", type: "enum", options: [{ value: "o", label: "Open" }, { value: "c", label: "Closed" }, { value: "x", label: "Void" }] },
];
let fid = 0;
const C = (field: string, op: string, value?: unknown, valueTo?: unknown) =>
  ({ kind: "condition", id: `c${fid++}`, field, op, value, valueTo }) as FilterNode;
const G = (join: "and" | "or", children: FilterNode[], not = false) => ({ kind: "group", id: `g${fid++}`, join, not, children }) as FilterNode;
const trees: FilterNode[] = [
  C("name", "contains", "  acme "), C("amt", "between", 10, 99), C("due", "lt", "2026-07-01"), C("paid", "isTrue"),
  C("name", "empty"), C("st", "in", ["o"]), C("st", "notIn", ["c"]), C("st", "in", ["o", "c", "x"]), C("st", "notIn", ["o", "x"]),
  G("and", [C("amt", "gte", 5), C("name", "starts", "A"), C("due", "between", "2026-01-01", "2026-02-01")]),
  G("or", [C("amt", "gt", 5), G("and", [C("paid", "isFalse"), C("st", "in", ["x"])])]),
  G("and", [C("name", "notEmpty"), G("or", [C("amt", "lt", 1), C("amt", "gt", 9)], true)], true),
];
const fmt = (v: string | number) => `<${v}>`;
for (const tree of trees) {
  const english = describeFilter(tree, FF, fmt);
  eq(`describeFilter ${english}`, describeFilter(tree, FF, fmt, t), english);
  eq(`describeFilter says something: ${english}`, english.length > 0, true);
}

// Every entry well formed.
const CATS = /^(=\d+|zero|one|two|few|many|other)$/;
for (const [key, value] of Object.entries(DEFAULT_MESSAGES)) {
  let depth = 0, ok = true;
  for (const ch of value) { if (ch === "{") depth++; else if (ch === "}") { depth--; if (depth < 0) ok = false; } }
  eq(`${key}: braces balance`, ok && depth === 0, true);
  for (const m of value.matchAll(/\{\s*\w+\s*,\s*plural\s*,(.*)\}/gs)) {
    const cats = pluralCategories(m[1]);
    eq(`${key}: plural categories are real`, cats.length > 0 && cats.every((c) => CATS.test(c)) && cats.includes("other"), true);
  }
  eq(`${key}: not empty`, value.trim().length > 0, true);
}
eq("catalogue size", Object.keys(DEFAULT_MESSAGES).length > 100, true);

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions, ${Object.keys(DEFAULT_MESSAGES).length} messages)`);
process.exit(failed ? 1 : 0);
