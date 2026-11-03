/**
 * Moving between rows with the keyboard: which row a key lands on.
 *
 * The pure half of DataTable's keyboard navigation, shared by every binding.
 *
 *   bun run check:row-keys
 *
 * Rows, not cells: a list is read and opened a record at a time, so focus moves
 * a row at a time (the WAI-ARIA treegrid's row focus, without the tree). Cell
 * by cell is the editing grid's job, not a list's.
 */

/** How far PageUp and PageDown move when the caller does not say. */
export const ROW_PAGE_STEP = 10;

/**
 * The row index `key` moves focus to, from `index` in `count` rows, or null
 * when the key is not a movement key (the caller then leaves the event alone).
 * Movement stops at the ends rather than wrapping: a list that wraps from its
 * last row to its first reads as having jumped to another page.
 */
export function rowKeyTarget(key: string, index: number, count: number, page = ROW_PAGE_STEP): number | null {
  if (count <= 0) return null;
  const from = Math.min(Math.max(index, 0), count - 1);
  switch (key) {
    case "ArrowDown": return Math.min(from + 1, count - 1);
    case "ArrowUp": return Math.max(from - 1, 0);
    case "Home": return 0;
    case "End": return count - 1;
    case "PageDown": return Math.min(from + page, count - 1);
    case "PageUp": return Math.max(from - page, 0);
    default: return null;
  }
}

/**
 * Whether a keydown came from somewhere that owns the arrow keys itself: a
 * text field, a select, an editable region, a combobox or listbox. Those keep
 * their keys; the row does not move under the user's typing.
 */
export function ownsArrowKeys(target: EventTarget | null): boolean {
  const el = target as (Element & { isContentEditable?: boolean }) | null;
  if (!el || typeof el.tagName !== "string") return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable) return true;
  const role = el.getAttribute?.("role");
  return role === "combobox" || role === "listbox" || role === "slider" || role === "spinbutton" || role === "menu";
}

/** A cell of a grid, by row and column index. */
export interface GridCell { row: number; col: number }

/**
 * The cell `key` moves focus to in a grid of `rows` × `cols`, from `at`, or
 * null when the key is not a movement key. As in a spreadsheet: arrows move
 * one cell; Home and End go to the row's first and last cell; with Ctrl (or
 * Cmd), Home and End go to the grid's first and last cell. Movement stops at
 * the edges; it does not wrap to the next row (Tab does that, natively).
 */
export function cellKeyTarget(
  key: string, at: GridCell, rows: number, cols: number, ctrl = false,
): GridCell | null {
  if (rows <= 0 || cols <= 0) return null;
  const row = Math.min(Math.max(at.row, 0), rows - 1);
  const col = Math.min(Math.max(at.col, 0), cols - 1);
  switch (key) {
    case "ArrowDown": return { row: Math.min(row + 1, rows - 1), col };
    case "ArrowUp": return { row: Math.max(row - 1, 0), col };
    case "ArrowRight": return { row, col: Math.min(col + 1, cols - 1) };
    case "ArrowLeft": return { row, col: Math.max(col - 1, 0) };
    case "Home": return ctrl ? { row: 0, col: 0 } : { row, col: 0 };
    case "End": return ctrl ? { row: rows - 1, col: cols - 1 } : { row, col: cols - 1 };
    case "PageDown": return { row: Math.min(row + ROW_PAGE_STEP, rows - 1), col };
    case "PageUp": return { row: Math.max(row - ROW_PAGE_STEP, 0), col };
    default: return null;
  }
}
