import * as React from "react";
/**
 * LookupField — pick a row from a table of choices: an item, a customer, an
 * account, seeing several facts at once (code, name, stock, rate, GSTIN).
 *
 *   <LookupField
 *     columns={[
 *       { key: "code", header: "Code", width: "7rem" },
 *       { key: "name", header: "Item" },
 *       { key: "stock", header: "Stock", align: "end" },
 *     ]}
 *     rows={items} rowKey={(i) => i.code} rowLabel={(i) => `${i.code} · ${i.name}`}
 *     value={item} onValueChange={setItem} onValueHelp={openValueHelp}
 *   />
 *
 * Type any part of any column, words in any order ("bolt m8"); the likeliest
 * row comes first (the code as typed, then a code starting with it, then words
 * starting columns). The ranking is @algorisys/zen-ui-core/lookup
 * (check:lookup). With `onSearch` the rows come from you instead, as they are
 * typed for (debounced, the stale request aborted), in your order.
 *
 * The chosen row comes back whole, so the caller has its rate and UOM without
 * a second lookup. The field never holds text that is not a row: leaving it
 * puts back the chosen row's label (or clears it, if emptied).
 *
 * Keys: ↓ opens; ↑ ↓ PageUp PageDown move; Enter picks; Tab picks the active
 * row when you have typed a search, and moves on; Esc closes, then undoes the
 * typing; F4 calls `onValueHelp` with what is typed, to open the full search.
 * Mirrors solid/src/components/lookup-field/lookup-field.tsx.
 */
export interface LookupColumn<T> {
    /** Names the column; also the property read when there is no `value`. */
    key: string;
    header: string;
    /** The cell's text, shown and searched. Default: `row[key]` as text. */
    value?: (row: T) => string;
    /** A CSS grid track: "7rem", "minmax(0,2fr)". Default: an equal share. */
    width?: string;
    /** "end" for numbers. */
    align?: "start" | "end";
    /** Left out of the search (still shown). Default true. */
    searchable?: boolean;
}
export type LookupFieldProps<T> = {
    columns: LookupColumn<T>[];
    /** The rows to search here. Ignored when `onSearch` is given. */
    rows?: T[];
    /** Rows from you, for what is typed: a server search. Abort on the signal; the newest query wins. */
    onSearch?: (query: string, signal: AbortSignal) => Promise<T[]>;
    /** With onSearch: the fewest characters before searching. Default 1. */
    minQueryLength?: number;
    /** With onSearch: milliseconds to wait after typing stops. Default 200. */
    debounce?: number;
    rowKey: (row: T) => string;
    /** The closed field's text for a row. Default: its first column. */
    rowLabel?: (row: T) => string;
    value?: T | null;
    defaultValue?: T | null;
    /** The chosen row, whole, or null when the field is emptied. */
    onValueChange?: (row: T | null) => void;
    /** F4, or the button: open the full search (ValueHelp) with what is typed. The field shows a button when set. */
    onValueHelp?: (query: string) => void;
    /** The most rows listed. Default 50. */
    maxRows?: number;
    placeholder?: string;
    emptyMessage?: string;
    invalid?: boolean;
    disabled?: boolean;
    /** Lands on the input, so `<label htmlFor>` names it. */
    id?: string;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    /** Width of the field. Default 100%. */
    width?: string;
    /**
     * Width of the table under it. Default: as wide as its content needs, at
     * least the field and the --zen-lookup-list-width token, at most the
     * --zen-lookup-list-max-width token (and the window).
     */
    listWidth?: string;
    className?: string;
};
export declare function LookupField<T>({ columns, rows: rowsProp, onSearch, minQueryLength, debounce, rowKey, rowLabel, value: valueProp, defaultValue, onValueChange, onValueHelp, maxRows, placeholder, emptyMessage, invalid, disabled, id, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, width, listWidth, className, }: LookupFieldProps<T>): React.JSX.Element;
//# sourceMappingURL=lookup-field.d.ts.map