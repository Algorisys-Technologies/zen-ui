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
export declare const ROW_PAGE_STEP = 10;
/**
 * The row index `key` moves focus to, from `index` in `count` rows, or null
 * when the key is not a movement key (the caller then leaves the event alone).
 * Movement stops at the ends rather than wrapping: a list that wraps from its
 * last row to its first reads as having jumped to another page.
 */
export declare function rowKeyTarget(key: string, index: number, count: number, page?: number): number | null;
/**
 * Whether a keydown came from somewhere that owns the arrow keys itself: a
 * text field, a select, an editable region, a combobox or listbox. Those keep
 * their keys; the row does not move under the user's typing.
 */
export declare function ownsArrowKeys(target: EventTarget | null): boolean;
/** A cell of a grid, by row and column index. */
export interface GridCell {
    row: number;
    col: number;
}
/**
 * The cell `key` moves focus to in a grid of `rows` × `cols`, from `at`, or
 * null when the key is not a movement key. As in a spreadsheet: arrows move
 * one cell; Home and End go to the row's first and last cell; with Ctrl (or
 * Cmd), Home and End go to the grid's first and last cell. Movement stops at
 * the edges; it does not wrap to the next row (Tab does that, natively).
 */
export declare function cellKeyTarget(key: string, at: GridCell, rows: number, cols: number, ctrl?: boolean): GridCell | null;
