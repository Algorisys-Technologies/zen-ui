/**
 * Searching a table of choices: the pure half of LookupField, shared by every
 * binding.
 *
 *   bun run check:lookup
 *
 * A clerk picking an item types whatever they remember of it: part of the
 * code, a word of the name, both ("bolt m8"). Every word typed must be found
 * somewhere in the row, in any column, in any order. Rows are ranked so the
 * likeliest pick is first:
 *
 *   1. the first column (the code) IS what was typed       "ITM-0042"
 *   2. the first column starts with what was typed         "ITM-00…"
 *   3. some column starts with each word                   "Hex Bolt M8" for "bo m8"
 *   4. the words are found anywhere                        "Carbolt" for "bolt"
 *
 * Ties keep the caller's order, so a list already sorted by use stays sorted.
 * Matching ignores case and accents ("cafe" finds "Café").
 */

/** Lower-cased, accents removed: what matching compares. Same length as the input for the common scripts. */
export function foldText(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The words of a query, folded. Empty for a blank query. */
export function queryWords(query: string): string[] {
  return foldText(query).split(/\s+/).filter(Boolean);
}

export interface LookupMatch {
  /** Lower is better. */
  rank: number;
}

/**
 * How well a row's cell texts match the words, or null if some word is in no
 * cell. A blank query matches every row at rank 0.
 */
export function matchLookupRow(cells: readonly string[], words: readonly string[]): LookupMatch | null {
  if (words.length === 0) return { rank: 0 };
  const folded = cells.map(foldText);
  let allPrefix = true;
  for (const w of words) {
    let found = false;
    let prefix = false;
    for (const c of folded) {
      const at = c.indexOf(w);
      if (at < 0) continue;
      found = true;
      // A word starts at the cell's start or after a non-letter, non-digit.
      if (at === 0 || startsWordAt(c, w)) prefix = true;
      if (prefix) break;
    }
    if (!found) return null;
    if (!prefix) allPrefix = false;
  }
  const first = folded[0] ?? "";
  const whole = words.join(" ");
  if (first === whole) return { rank: 1 };
  if (first.startsWith(whole)) return { rank: 2 };
  return { rank: allPrefix ? 3 : 4 };
}

function startsWordAt(cell: string, word: string): boolean {
  let from = 0;
  for (;;) {
    const at = cell.indexOf(word, from);
    if (at < 0) return false;
    if (at === 0 || !/[\p{L}\p{N}]/u.test(cell[at - 1])) return true;
    from = at + 1;
  }
}

/**
 * The rows that match, best first, at most `limit` of them. `cells` gives a
 * row's searchable texts, the first being its code (or whatever identifies it).
 */
export function filterLookup<T>(
  rows: readonly T[],
  cells: (row: T) => readonly string[],
  query: string,
  limit = Infinity,
): T[] {
  const words = queryWords(query);
  const hits: { row: T; rank: number; i: number }[] = [];
  rows.forEach((row, i) => {
    const m = matchLookupRow(cells(row), words);
    if (m) hits.push({ row, rank: m.rank, i });
  });
  hits.sort((a, b) => a.rank - b.rank || a.i - b.i);
  return hits.slice(0, limit).map((h) => h.row);
}

/**
 * Where the words fall in a text, as [start, end) ranges, merged and sorted:
 * for drawing matches bold. Offsets are into the original text, whatever
 * folding did to it (accents dropped, a letter lower-cased into two).
 */
export function highlightRanges(text: string, words: readonly string[]): [number, number][] {
  // Fold one code point at a time, remembering where each folded character came from.
  let folded = "";
  const from: number[] = [];
  let i = 0;
  for (const ch of text) {
    const f = foldText(ch);
    for (let k = 0; k < f.length; k++) from.push(i);
    folded += f;
    i += ch.length;
  }
  const ends = (at: number) => {
    // The source index just past the folded character at `at`.
    const src = from[at];
    const cp = text.codePointAt(src)!;
    let end = src + (cp > 0xffff ? 2 : 1);
    // An accent typed as a separate mark belongs to its letter: bold them together.
    while (end < text.length && /\p{M}/u.test(text[end])) end++;
    return end;
  };
  const ranges: [number, number][] = [];
  for (const w of words) {
    if (!w) continue;
    let at = folded.indexOf(w);
    while (at >= 0) {
      ranges.push([from[at], ends(at + w.length - 1)]);
      at = folded.indexOf(w, at + 1);
    }
  }
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}
