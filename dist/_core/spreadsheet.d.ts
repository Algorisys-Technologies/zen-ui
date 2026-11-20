/**
 * Spreadsheet maths — the pure half of SpreadsheetGrid.
 *
 * A1 references, a small formula evaluator, and number formatting. No DOM, so
 * every awkward case is testable: a circular reference, text in arithmetic, an
 * average of nothing.
 *
 * The evaluator is a RECURSIVE-DESCENT PARSER, not `new Function` and not
 * `eval`. That is not fastidiousness — a formula is text a candidate types, and
 * evaluating it as JavaScript hands them the page. It also means an unknown
 * name is `#NAME?` rather than a call into whatever happens to be in scope.
 *
 * It is small on purpose: arithmetic, references, ranges, and eight functions.
 * It is not Excel. What it must be is honest — anything it cannot work out
 * returns an error value that renders AS an error, because in an assessment a
 * plausible-looking wrong number is worse than a visible failure.
 */
/** What a cell holds: a literal, or a formula string beginning `=`. */
export type CellValue = number | string | boolean | null | undefined;
export type CellMap = Record<string, CellValue>;
/** The error values, spelled as a spreadsheet spells them. */
export declare const CELL_ERRORS: readonly ["#DIV/0!", "#VALUE!", "#NAME?", "#CIRCULAR!", "#ERROR!", "#REF!"];
export type CellError = (typeof CELL_ERRORS)[number];
export declare const isCellError: (v: unknown) => v is CellError;
export interface CellRef {
    col: number;
    row: number;
}
/** `A1` → `{col: 0, row: 0}`. `$` markers are stripped: they affect copying, not address. */
export declare const parseRef: (ref: string) => CellRef | null;
/** `{0, 0}` → `A1`. The inverse of parseRef, carrying past Z into AA. */
export declare const formatRef: (col: number, row: number) => string;
/**
 * `A1:B2` → every cell in the block, row-major.
 *
 * A reversed range is normalised rather than returning nothing: `B2:A1` is a
 * selection dragged up-left, which is a normal thing to do.
 */
export declare const expandRange: (range: string) => string[];
/**
 * Evaluate one formula against a sheet.
 *
 * Anything not starting with `=` is not a formula and is returned unchanged —
 * a cell containing `2+2` is the text "2+2", exactly as a spreadsheet treats it.
 *
 * `seen` carries the cells already being evaluated further up the stack, which
 * is what makes a circular reference an error value instead of a stack
 * overflow that takes the page down.
 */
export declare const evaluateFormula: (input: CellValue, cells: CellMap, seen?: ReadonlySet<string>) => CellValue;
export interface CellFormat {
    type?: "text" | "number" | "currency" | "percent";
    decimals?: number;
    /** ISO 4217, for `currency`. */
    currency?: string;
    /** BCP 47. Defaults to the runtime's. */
    locale?: string;
}
/**
 * A cell value as it should read.
 *
 * An empty cell formats as empty rather than `0` — a grid of zeros where the
 * data has not arrived is indistinguishable from a grid of real zeros. An error
 * value formats as itself, never as `NaN`.
 */
export declare const formatCellValue: (value: CellValue, format?: CellFormat) => string;
