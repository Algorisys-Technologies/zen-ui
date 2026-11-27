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
export declare function foldText(text: string): string;
/** The words of a query, folded. Empty for a blank query. */
export declare function queryWords(query: string): string[];
export interface LookupMatch {
    /** Lower is better. */
    rank: number;
}
/**
 * How well a row's cell texts match the words, or null if some word is in no
 * cell. A blank query matches every row at rank 0.
 */
export declare function matchLookupRow(cells: readonly string[], words: readonly string[]): LookupMatch | null;
/**
 * The rows that match, best first, at most `limit` of them. `cells` gives a
 * row's searchable texts, the first being its code (or whatever identifies it).
 */
export declare function filterLookup<T>(rows: readonly T[], cells: (row: T) => readonly string[], query: string, limit?: number): T[];
/**
 * Where the words fall in a text, as [start, end) ranges, merged and sorted:
 * for drawing matches bold. Offsets are into the original text, whatever
 * folding did to it (accents dropped, a letter lower-cased into two).
 */
export declare function highlightRanges(text: string, words: readonly string[]): [number, number][];
