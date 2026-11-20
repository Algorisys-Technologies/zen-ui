/**
 * Fixture for the List Report pattern demo. Shared by both bindings' copies.
 *
 * Deterministic on purpose — no Math.random. A demo that reshuffles itself on
 * every reload makes the visual check's screenshots differ for no reason, and
 * "is this row here because of my filter or because the data moved?" is not a
 * question anyone should have to ask while reading a demo.
 */
export type OrderStatus = "open" | "confirmed" | "shipped" | "invoiced" | "blocked";
export type Order = {
    id: string;
    supplier: string;
    city: string;
    status: OrderStatus;
    /** ISO yyyy-mm-dd. */
    date: string;
    amount: number;
};
/**
 * Dates are spread backwards from a FIXED day rather than from today, so the
 * demo's date filter has something to find whenever anyone opens it, and the
 * screenshots do not drift.
 */
export declare const AS_OF: Date;
export declare const ORDERS: Order[];
export declare const STATUS_OPTIONS: {
    value: string;
    label: string;
}[];
export declare const SUPPLIER_OPTIONS: {
    value: string;
    label: string;
}[];
/** Badge colour per status. Blocked is the only one that should alarm anyone. */
export declare const statusColor: (s: OrderStatus) => "neutral" | "info" | "success" | "warning" | "error";
export declare const money: (n: number) => string;
//# sourceMappingURL=list-report-data.d.ts.map