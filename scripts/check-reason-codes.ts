/**
 * Reason-code contract.
 *
 *   bun run check:reason-codes
 *
 * The pure half of ReasonCodePicker: an operator, often in gloves, saying why a
 * machine stopped or a part was scrapped. Lists run to fifty or more reasons,
 * so the picker filters by category and by typing. What must hold:
 *
 *  - Categories come out in the order the plant listed them, not alphabetised:
 *    plants put the common ones first on purpose.
 *  - Search matches the label, the code, and the description, ignoring case
 *    and accents — "Maquina" must find "Máquina", and an operator who knows
 *    the code "M12" types that, not the words.
 *  - Every word typed must match somewhere ("hyd low" finds "Hydraulic
 *    pressure low"), in any order.
 *  - Filtering never drops the selected reason out of reach silently: the
 *    caller can ask whether it is still visible.
 */
import { reasonCategories, filterReasons } from "../packages/core/src/reason-codes";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(
    `  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`,
  );
};

const reasons = [
  { id: "1", code: "M12", label: "Hydraulic pressure low", category: "Mechanical" },
  { id: "2", code: "M07", label: "Tool breakage", category: "Mechanical" },
  { id: "3", code: "Q01", label: "Dimension out of tolerance", category: "Quality", description: "Measured outside the drawing limits" },
  { id: "4", code: "S03", label: "No blanks", category: "Supply" },
  { id: "5", code: "E02", label: "Máquina sin energía", category: "Electrical" },
  { id: "6", code: "X00", label: "Other" },
];

console.log("\ncategories");
t(
  reasonCategories(reasons),
  [
    { id: "Mechanical", count: 2 },
    { id: "Quality", count: 1 },
    { id: "Supply", count: 1 },
    { id: "Electrical", count: 1 },
  ],
  "in the order first listed, with counts; uncategorised left out",
);

console.log("\nfilter");
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);
t(ids(filterReasons(reasons, {})), ["1", "2", "3", "4", "5", "6"], "no filter: everything, in order");
t(ids(filterReasons(reasons, { category: "Mechanical" })), ["1", "2"], "by category");
t(ids(filterReasons(reasons, { query: "hyd low" })), ["1"], "every word must match, in any order");
t(ids(filterReasons(reasons, { query: "low hyd" })), ["1"], "order of words does not matter");
t(ids(filterReasons(reasons, { query: "m12" })), ["1"], "by code, case-insensitive");
t(ids(filterReasons(reasons, { query: "maquina" })), ["5"], "accents ignored");
t(ids(filterReasons(reasons, { query: "drawing" })), ["3"], "by description");
t(ids(filterReasons(reasons, { query: "  " })), ["1", "2", "3", "4", "5", "6"], "whitespace is no query");
t(ids(filterReasons(reasons, { category: "Quality", query: "tool" })), [], "category and query together");
t(ids(filterReasons(reasons, { query: "zzz" })), [], "nothing matches: empty, not everything");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
