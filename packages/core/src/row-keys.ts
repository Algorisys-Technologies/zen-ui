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
