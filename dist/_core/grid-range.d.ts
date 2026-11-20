/**
 * Cell ranges and the clipboard, for a grid you work in like a spreadsheet.
 *
 * The pure half of DataTable's cell navigation, shared by every binding:
 * which cells a selection covers, the text a copy writes, how a paste is read
 * and where its values land.
 *
 *   bun run check:grid-range
 *
 * The clipboard format is the one spreadsheets exchange: cells separated by
 * tabs, rows by newlines, and a cell holding a tab, a newline or a quote is
 * quoted, with its quotes doubled. That is what Excel, Google Sheets and
 * LibreOffice write when you copy cells, and what they read when you paste.
 */
import type { GridCell } from "./row-keys";
export type { GridCell };
/** A selection: where it started (the anchor, the active cell) and where it reaches. */
export interface CellRange {
    anchor: GridCell;
    focus: GridCell;
}
/** A range's bounds, inclusive. */
export interface CellRect {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
export declare function rangeRect(range: CellRange): CellRect;
export declare function inRect(rect: CellRect, row: number, col: number): boolean;
export declare function rectSize(rect: CellRect): {
    rows: number;
    cols: number;
};
/** A range kept inside a grid of `rows` × `cols` (rows or columns may have gone). */
export declare function clampRange(range: CellRange, rows: number, cols: number): CellRange | null;
/** One cell as clipboard text: quoted, quotes doubled, when it holds a tab, newline or quote. */
export declare function tsvCell(value: string): string;
/** Rows of cell text as clipboard text. Rows are joined by "\r\n", as Excel writes them. */
export declare function toTsv(rows: string[][]): string;
/**
 * Clipboard text as rows of cells. Reads quoted cells (with tabs, newlines and
 * doubled quotes inside), CRLF or LF line ends, and drops the one trailing
 * line end Excel adds after the last row. A quote that does not open a cell is
 * plain text, as in a spreadsheet: `5" pipe` stays as typed.
 */
export declare function parseTsv(text: string): string[][];
/** One value a paste puts in one cell. */
export interface PasteTarget {
    row: number;
    col: number;
    value: string;
}
/**
 * Where pasted text lands. From the selection's top-left cell, row by row, as
 * far as the grid reaches: cells past its edge are dropped, not wrapped.
 * One value pasted into a selection of several cells fills all of them, as a
 * spreadsheet does.
 */
export declare function pastePlan(data: string[][], selection: CellRect, rows: number, cols: number): PasteTarget[];
