/**
 * LookupField contract.
 *
 *   bun run check:lookup
 *
 * The pure half of picking a row from a table of choices: which rows match a
 * query typed across the columns, in what order, and where the matches fall
 * for drawing bold. Invariants re-checked over a generated sweep, each against
 * a brute-force version written independently of the module: the set matched,
 * the order (rank, then the caller's), and every highlight range.
 */
import { foldText, queryWords, matchLookupRow, filterLookup, highlightRanges } from "../packages/core/src/lookup";

let failed = 0, checked = 0;
const eq = (label: string, got: unknown, want: unknown) => {
  checked++;
  if (JSON.stringify(got) !== JSON.stringify(want)) { failed++; if (failed < 30) console.error(`FAIL ${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); }
};

type Item = { code: string; name: string; uom: string };
const ITEMS: Item[] = [
  { code: "ITM-0042", name: "Hex Bolt M8 x 40", uom: "Nos" },
  { code: "ITM-0043", name: "Hex Nut M8", uom: "Nos" },
  { code: "ITM-0100", name: "Carbolt Adhesive", uom: "Kg" },
  { code: "BOLT-01", name: "Anchor Bolt", uom: "Nos" },
  { code: "CAF-1", name: "Café Crème", uom: "Kg" },
  { code: "ITM-0042A", name: "Hex Bolt M8 x 50", uom: "Nos" },
];
const cells = (i: Item) => [i.code, i.name, i.uom];
const codes = (q: string, limit?: number) => filterLookup(ITEMS, cells, q, limit).map((i) => i.code);

// Worked examples.
eq("blank query: every row, in order", codes(""), ITEMS.map((i) => i.code));
eq("spaces only: every row", codes("   "), ITEMS.map((i) => i.code));
eq("exact code first, then code prefix", codes("itm-0042"), ["ITM-0042", "ITM-0042A"]);
eq("code prefix beats a word in the name", codes("bolt"), ["BOLT-01", "ITM-0042", "ITM-0042A", "ITM-0100"]);
eq("two words, any columns, any order", codes("m8 bolt"), ["ITM-0042", "ITM-0042A"]);
eq("a word must be found: none", codes("bolt m10"), []);
eq("case ignored", codes("HEX NUT"), ["ITM-0043"]);
eq("accents ignored", codes("cafe creme"), ["CAF-1"]);
eq("accented query finds plain text too", codes("crème"), ["CAF-1"]);
eq("other columns searched (uom)", codes("kg"), ["ITM-0100", "CAF-1"]);
eq("limit", codes("", 2), ["ITM-0042", "ITM-0043"]);
eq("limit 0", codes("", 0), []);
eq("words", queryWords("  Hex  BOLT\tm8 "), ["hex", "bolt", "m8"]);
eq("fold", foldText("Café CRÈME"), "cafe creme");
eq("rank: exact code", matchLookupRow(["ITM-0042", "x"], ["itm-0042"]), { rank: 1 });
eq("rank: code prefix", matchLookupRow(["ITM-0042", "x"], ["itm"]), { rank: 2 });
eq("rank: word starts", matchLookupRow(["X1", "Hex Bolt"], ["bo"]), { rank: 3 });
eq("rank: anywhere", matchLookupRow(["X1", "Carbolt"], ["bolt"]), { rank: 4 });
eq("rank: after punctuation is a word start", matchLookupRow(["X1", "M8/bolt"], ["bolt"]), { rank: 3 });
eq("rank: one word mid-word makes it 4", matchLookupRow(["X1", "Hex Carbolt"], ["hex", "bolt"]), { rank: 4 });
eq("rank: same word twice, one a word start", matchLookupRow(["X1", "carbolt bolt"], ["bolt"]), { rank: 3 });
eq("no cells, a word: no match", matchLookupRow([], ["a"]), null);
eq("highlight: two words", highlightRanges("Hex Bolt M8", ["bolt", "m8"]), [[4, 8], [9, 11]]);
eq("highlight: overlapping merge", highlightRanges("aaaa", ["aa"]), [[0, 4]]);
eq("highlight: accents keep source offsets", highlightRanges("Café Crème", ["cafe", "creme"]), [[0, 4], [5, 10]]);
eq("highlight: decomposed accents", highlightRanges("Café x", ["cafe"]), [[0, 5]]);
eq("highlight: astral characters", highlightRanges("😀bolt", ["bolt"]), [[2, 6]]);
eq("highlight: nothing", highlightRanges("abc", ["z"]), []);
eq("highlight: adjacent ranges merge", highlightRanges("abcd", ["ab", "cd"]), [[0, 4]]);

// Independent brute force.
const bf = {
  fold: (s: string) => [...s.normalize("NFD")].filter((c) => !/\p{M}/u.test(c)).join("").toLowerCase(),
  matches(cs: string[], ws: string[]) { return ws.every((w) => cs.some((c) => bf.fold(c).includes(w))); },
  rank(cs: string[], ws: string[]) {
    if (ws.length === 0) return 0;
    const f = cs.map(bf.fold);
    const whole = ws.join(" ");
    if (f[0] === whole) return 1;
    if ((f[0] ?? "").startsWith(whole)) return 2;
    // A word start: position 0, or just after something that is not a letter or digit.
    const wordStart = (c: string, w: string) =>
      [...Array(c.length).keys()].some((i) => (i === 0 || !/[\p{L}\p{N}]/u.test(c[i - 1])) && c.startsWith(w, i));
    return ws.every((w) => f.some((c) => wordStart(c, w))) ? 3 : 4;
  },
  // Every source [a,b) whose folded slice equals a word exactly, smallest b for each a.
  covered(text: string, ws: string[]) {
    const cov = new Set<number>();
    const starts: number[] = [];
    for (let i = 0; i < text.length; ) { starts.push(i); i += text.codePointAt(i)! > 0xffff ? 2 : 1; }
    starts.push(text.length);
    for (const w of ws) for (let s = 0; s < starts.length - 1; s++) {
      if (/\p{M}/u.test(text[starts[s]])) continue; // a match starts on a letter, not on an accent mark
      for (let e = s + 1; e < starts.length; e++) {
      const f = bf.fold(text.slice(starts[s], starts[e]));
      if (f.length > w.length) break;
      if (f === w) {
        let end = starts[e];
        while (end < text.length && /\p{M}/u.test(text[end])) end++; // a trailing accent mark goes with its letter
        for (let k = starts[s]; k < end; k++) cov.add(k);
        break;
      }
      }
    }
    return cov;
  },
};

// Sweep: rows of short words over a small alphabet, so matches are frequent.
const ALPHA = ["a", "b", "ab", "ba", "é", "e\u0301", "A-b", "b a", "aB", "x", "😀", ""];
let seed = 7;
// A 32-bit LCG. Math.imul, not *: the plain product overflows a double, loses its
// low bits, and the sequence sticks (it picked 3 of 12 entries, so this sweep once
// saw 12 distinct cells of 144 and never a decomposed accent or an emoji).
const rnd = (n: number) => ((seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) >>> 8) % n;
const rows: string[][] = [];
for (let r = 0; r < 60; r++) rows.push([0, 1, 2].map(() => ALPHA[rnd(ALPHA.length)] + ALPHA[rnd(ALPHA.length)]));
eq("the sweep varies: most cells distinct, every alphabet entry used", [new Set(rows.flat()).size > 80, ALPHA.every((x) => x === "" || rows.flat().some((c) => c.includes(x)))], [true, true]);
const QUERIES = ["", "a", "b", "ab", "a b", "ba a", "e", "é", "x", "-", "ab ba", "A", "zz", "b-", "a  b  x"];
for (const q of QUERIES) {
  const ws = queryWords(q);
  const got = filterLookup(rows, (r) => r, q);
  const want = rows.map((r, i) => ({ r, i })).filter(({ r }) => bf.matches(r, ws))
    .sort((a, b) => bf.rank(a.r, ws) - bf.rank(b.r, ws) || a.i - b.i).map(({ r }) => r);
  eq(`sweep "${q}": set and order`, got, want);
  for (const r of rows) {
    const m = matchLookupRow(r, ws);
    eq(`sweep "${q}" ${JSON.stringify(r)}: rank`, m ? m.rank : null, bf.matches(r, ws) ? bf.rank(r, ws) : null);
    for (const c of r) {
      const ranges = highlightRanges(c, ws);
      const cov = new Set<number>();
      for (const [a, b] of ranges) for (let k = a; k < b; k++) cov.add(k);
      eq(`sweep "${q}" "${c}": highlight covers exactly the matches`, [...cov].sort((x, y) => x - y), [...bf.covered(c, ws)].sort((x, y) => x - y));
      const ok = ranges.every(([a, b], i) => a < b && b <= c.length && (i === 0 || a > ranges[i - 1][1]));
      eq(`sweep "${q}" "${c}": ranges sorted, disjoint, in bounds`, ok, true);
    }
  }
}

console.log(failed ? `${failed} of ${checked} FAILED` : `all passed (${checked} assertions)`);
process.exit(failed ? 1 : 0);
