import { type JSX } from "solid-js";
/**
 * Table — thin styled wrappers around the native <table> elements,
 * shadcn-style. Use directly for hand-rolled tables, or via <DataTable>
 * for the headless-table-on-TanStack composition.
 *
 * Styling is calibrated to the Zen theme table spec:
 *   - Header label: text-xs, muted-fg
 *   - Cell padding: 8px horizontal, 12px vertical; min row height 48px
 *   - Row default: border-b, zen-border
 *   - Row hover: subtle bg tint + sm shadow
 *   - Row selected: soft primary background + sm shadow
 */
export type TableProps = Omit<JSX.HTMLAttributes<HTMLTableElement>, "class"> & {
    containerClass?: string;
    containerStyle?: JSX.CSSProperties;
    class?: string;
};
export declare const Table: (props: TableProps) => JSX.Element;
type SectionProps = Omit<JSX.HTMLAttributes<HTMLTableSectionElement>, "class"> & {
    class?: string;
};
export declare const TableHeader: (props: SectionProps) => JSX.Element;
export declare const TableBody: (props: SectionProps) => JSX.Element;
export declare const TableFooter: (props: SectionProps) => JSX.Element;
export declare const TableRow: (props: Omit<JSX.HTMLAttributes<HTMLTableRowElement>, "class"> & {
    class?: string;
}) => JSX.Element;
export declare const TableHead: (props: Omit<JSX.ThHTMLAttributes<HTMLTableCellElement>, "class"> & {
    class?: string;
}) => JSX.Element;
export declare const TableCell: (props: Omit<JSX.TdHTMLAttributes<HTMLTableCellElement>, "class"> & {
    class?: string;
}) => JSX.Element;
export declare const TableCaption: (props: Omit<JSX.HTMLAttributes<HTMLTableCaptionElement>, "class"> & {
    class?: string;
}) => JSX.Element;
export {};
//# sourceMappingURL=table.d.ts.map