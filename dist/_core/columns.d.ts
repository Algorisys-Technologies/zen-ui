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
    columnDef: {
        header?: unknown;
        meta?: unknown;
    };
}
/** A column's plain-text name: `meta.label`, else a string header, else the id. */
export declare function columnLabel(column: NamedColumn): string;
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
export declare function moveColumn(order: readonly string[], id: string, direction: "earlier" | "later", movable?: readonly string[]): string[] | null;
/** Arrow-key resize steps, in px. Shift takes the larger one. */
export declare const COLUMN_RESIZE_STEP = 16;
export declare const COLUMN_RESIZE_STEP_LARGE = 64;
/**
 * The width change a key on a column's resize handle asks for, or null when
 * the key is not a resize key (leave the event alone).
 *
 * The handle sits on the column's inline END, so the arrow that points away
 * from the column widens it: ArrowRight in left-to-right, ArrowLeft in
 * right-to-left. Home / End are not handled: a column has no natural minimum
 * or maximum a user would aim for.
 */
export declare function columnResizeDelta(key: string, opts?: {
    shift?: boolean;
    rtl?: boolean;
}): number | null;
/** `size + delta`, kept inside the column's own limits. */
export declare function clampColumnSize(size: number, delta: number, min?: number, max?: number): number;
/** A table's column layout state: TanStack's columnOrder / Visibility / Pinning. */
export interface ColumnLayoutState {
    /** Ids first, in this order; the rest follow in definition order. */
    order?: readonly string[];
    /** `false` hides a column; anything else (or absent) shows it. */
    visibility?: Readonly<Record<string, boolean>>;
    pinning?: {
        left?: readonly string[];
        right?: readonly string[];
    };
}
/**
 * Leaf ids in `order`, as TanStack orders them: the ids `order` names (that
 * exist), in that order, then every other id in definition order. Hidden and
 * pinned columns included: this is the Columns menu's order.
 */
export declare function orderedColumnIds(ids: readonly string[], order?: readonly string[]): string[];
/**
 * The visible columns, split the way they render: left-pinned (in the pin
 * list's order), then the rest in column order, then right-pinned. A column
 * pinned to both sides counts as left; a hidden pinned column is not shown.
 */
export declare function columnLayout(ids: readonly string[], state?: ColumnLayoutState): {
    left: string[];
    center: string[];
    right: string[];
};
/**
 * `respectColumnSizes` resolved: on when set, else on with pinning or resizing
 * (a pinned column's offset and a resized column's width both assume the
 * column really is that wide; squeezed, pinning misaligns and resizing does
 * nothing the moment the table is full).
 */
export declare function respectsColumnSizes(opts: {
    respectColumnSizes?: boolean;
    enableColumnPinning?: boolean;
    enableColumnResizing?: boolean;
}): boolean;
/**
 * The `min-width` a header cell gets so the browser cannot squeeze a column
 * below its size. A table's automatic layout treats `width` as a hint and
 * shrinks every column to fit the container; a minimum is the one width it
 * keeps, and a table whose minimums do not fit scrolls instead.
 *
 * Only columns with a width somebody chose: an explicit `size`, a width the
 * user resized to, or a pinned column (its sticky offset is computed from its
 * size). An unsized column stays automatic. Undefined when the table does not
 * respect sizes.
 */
export declare function columnMinWidth(respect: boolean, column: {
    size: number;
    explicitSize?: number;
    resized?: boolean;
    pinned?: boolean;
}): number | undefined;
