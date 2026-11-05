/**
 * DataTable column management: what a column is called, and the keyboard half
 * of reordering and resizing. Pure, shared by every binding.
 *
 *   bun run check:columns
 *
 * A column's name is used where the header itself cannot be: the Columns
 * menu, the sort button's and resize handle's accessible names, and export
 * headers. A header given as a FUNCTION (to wrap the label in a span, align a
 * figure column, add an icon) has no text to read, so the name used to fall
 * back to the column id ("posting_date"). `meta.label` names it.
 */

/** The shape of a TanStack column this module reads: no table types needed. */
export interface NamedColumn {
  id: string;
  columnDef: { header?: unknown; meta?: unknown };
}

/** A column's plain-text name: `meta.label`, else a string header, else the id. */
export function columnLabel(column: NamedColumn): string {
  const meta = column.columnDef.meta as { label?: unknown } | undefined;
  if (typeof meta?.label === "string" && meta.label.trim() !== "") return meta.label;
  const header = column.columnDef.header;
  if (typeof header === "string" && header.trim() !== "") return header;
  return column.id;
}

/**
 * The column order after moving `id` one place `direction` ("earlier" is
 * towards the start), or null when it cannot move (already at that end, or not
 * in `order`).
 *
 * `order` is the FULL leaf order, DataTable's own columns (selection, expand,
 * drag) included; `movable` is the subset the user manages (what the Columns
 * menu lists). A move steps over everything else, so "Move later" always
 * changes the column's place among the columns the user can see in the menu,
 * rather than trading places with an invisible selection column and appearing
 * to do nothing.
 */
export function moveColumn(
  order: readonly string[],
  id: string,
  direction: "earlier" | "later",
  movable: readonly string[] = order,
): string[] | null {
  const from = order.indexOf(id);
  if (from < 0) return null;
  const can = new Set(movable);
  const step = direction === "earlier" ? -1 : 1;
  let to = from + step;
  while (to >= 0 && to < order.length && !can.has(order[to]!)) to += step;
  if (to < 0 || to >= order.length) return null;
  const next = order.slice();
  next.splice(from, 1);
  next.splice(to, 0, id);
  return next;
}

/** Arrow-key resize steps, in px. Shift takes the larger one. */
export const COLUMN_RESIZE_STEP = 16;
export const COLUMN_RESIZE_STEP_LARGE = 64;

/**
 * The width change a key on a column's resize handle asks for, or null when
 * the key is not a resize key (leave the event alone).
 *
 * The handle sits on the column's inline END, so the arrow that points away
 * from the column widens it: ArrowRight in left-to-right, ArrowLeft in
 * right-to-left. Home / End are not handled: a column has no natural minimum
 * or maximum a user would aim for.
 */
export function columnResizeDelta(key: string, opts: { shift?: boolean; rtl?: boolean } = {}): number | null {
  const step = opts.shift ? COLUMN_RESIZE_STEP_LARGE : COLUMN_RESIZE_STEP;
  const grow = opts.rtl ? "ArrowLeft" : "ArrowRight";
  const shrink = opts.rtl ? "ArrowRight" : "ArrowLeft";
  if (key === grow) return step;
  if (key === shrink) return -step;
  return null;
}

/** `size + delta`, kept inside the column's own limits. */
export function clampColumnSize(size: number, delta: number, min = 20, max = Number.MAX_SAFE_INTEGER): number {
  return Math.min(Math.max(Math.round(size + delta), min), max);
}
