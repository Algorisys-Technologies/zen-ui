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

export function rangeRect(range: CellRange): CellRect {
  return {
    top: Math.min(range.anchor.row, range.focus.row),
    left: Math.min(range.anchor.col, range.focus.col),
    bottom: Math.max(range.anchor.row, range.focus.row),
    right: Math.max(range.anchor.col, range.focus.col),
  };
}

export function inRect(rect: CellRect, row: number, col: number): boolean {
  return row >= rect.top && row <= rect.bottom && col >= rect.left && col <= rect.right;
}

export function rectSize(rect: CellRect): { rows: number; cols: number } {
  return { rows: rect.bottom - rect.top + 1, cols: rect.right - rect.left + 1 };
}

/** A range kept inside a grid of `rows` × `cols` (rows or columns may have gone). */
export function clampRange(range: CellRange, rows: number, cols: number): CellRange | null {
  if (rows <= 0 || cols <= 0) return null;
  const clamp = (c: GridCell): GridCell => ({
    row: Math.min(Math.max(c.row, 0), rows - 1),
    col: Math.min(Math.max(c.col, 0), cols - 1),
  });
  return { anchor: clamp(range.anchor), focus: clamp(range.focus) };
}

/* ------------------------------ clipboard -------------------------------- */

const needsQuotes = /[\t\n\r"]/;

/** One cell as clipboard text: quoted, quotes doubled, when it holds a tab, newline or quote. */
export function tsvCell(value: string): string {
  return needsQuotes.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Rows of cell text as clipboard text. Rows are joined by "\r\n", as Excel writes them. */
export function toTsv(rows: string[][]): string {
  return rows.map((r) => r.map(tsvCell).join("\t")).join("\r\n");
}

/**
 * Clipboard text as rows of cells. Reads quoted cells (with tabs, newlines and
 * doubled quotes inside), CRLF or LF line ends, and drops the one trailing
 * line end Excel adds after the last row. A quote that does not open a cell is
 * plain text, as in a spreadsheet: `5" pipe` stays as typed.
 */
export function parseTsv(text: string): string[][] {
  if (text === "") return [];
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let i = 0;
  let atCellStart = true;
  while (i < text.length) {
    const ch = text[i];
    if (atCellStart && ch === '"') {
      // A quoted cell: read to the closing quote, "" being a literal quote.
      let j = i + 1;
      let value = "";
      let closed = false;
      while (j < text.length) {
        if (text[j] === '"') {
          if (text[j + 1] === '"') {
            value += '"';
            j += 2;
            continue;
          }
          closed = true;
          j++;
          break;
        }
        value += text[j++];
      }
      const next = text[j];
      if (closed && (j >= text.length || next === "\t" || next === "\n" || next === "\r")) {
        cell = value;
        i = j;
        atCellStart = false;
        continue;
      }
      // Not a well-formed quoted cell: the quote is ordinary text.
    }
    atCellStart = false;
    if (ch === "\t") {
      row.push(cell);
      cell = "";
      atCellStart = true;
      i++;
    } else if (ch === "\r" || ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      atCellStart = true;
      i += ch === "\r" && text[i + 1] === "\n" ? 2 : 1;
    } else {
      cell += ch;
      i++;
    }
  }
  // The text ended mid-row: that row counts. Ending on a line end (Excel's
  // trailing newline) leaves nothing pending.
  if (!atCellStart || cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

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
export function pastePlan(
  data: string[][],
  selection: CellRect,
  rows: number,
  cols: number,
): PasteTarget[] {
  const out: PasteTarget[] = [];
  if (data.length === 0 || rows <= 0 || cols <= 0) return out;
  const single = data.length === 1 && data[0].length === 1;
  if (single) {
    for (let r = selection.top; r <= Math.min(selection.bottom, rows - 1); r++) {
      for (let c = selection.left; c <= Math.min(selection.right, cols - 1); c++) {
        out.push({ row: r, col: c, value: data[0][0] });
      }
    }
    return out;
  }
  for (let dr = 0; dr < data.length; dr++) {
    const r = selection.top + dr;
    if (r >= rows) break;
    for (let dc = 0; dc < data[dr].length; dc++) {
      const c = selection.left + dc;
      if (c >= cols) break;
      out.push({ row: r, col: c, value: data[dr][dc] });
    }
  }
  return out;
}
