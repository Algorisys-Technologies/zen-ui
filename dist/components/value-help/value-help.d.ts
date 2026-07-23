import { type SelectListItem } from "../select-list/select-list";
/**
 * ValueHelp — the F4 lookup dialog. SelectDialog answers "which of these?";
 * ValueHelp also answers "everything matching these rules", which is the whole
 * reason it is a separate component:
 *
 * - **Select** tab — the same searchable list SelectDialog uses.
 * - **Conditions** tab — a rule builder: include/exclude, an operator, and one
 *   or two values. This is what a caller turns into a query.
 *
 * Unlike SelectDialog, picking a row never commits on its own, even in single
 * mode: there is a second tab whose rules also need committing, so OK is the
 * only way out. Cancel restores whatever was there on open.
 *
 * Both halves come back together from `onConfirm`, since a filter is usually
 * "these three, plus anything starting with X".
 *
 * Mirrors the React binding's API.
 */
export type ValueHelpOperator = "EQ" | "Contains" | "StartsWith" | "EndsWith" | "BT" | "LT" | "LE" | "GT" | "GE";
export interface ValueHelpCondition {
    /** Stable row identity. Generated when a row is added. */
    id: string;
    /** The exclude flag: the rule subtracts instead of adds. */
    exclude: boolean;
    operator: ValueHelpOperator;
    value: string;
    /** Upper bound. Only meaningful for `BT`. */
    valueTo?: string;
}
export interface ValueHelpResult {
    ids: string[];
    conditions: ValueHelpCondition[];
}
export interface ValueHelpProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    /** Optional subtitle. Also the dialog's accessible description. */
    description?: string;
    items: SelectListItem[];
    /** Checkbox rows instead of single-pick rows. Default: single. */
    multiple?: boolean;
    /** The selection the dialog opens with. Read when `open` becomes true. */
    selectedIds?: string[];
    /** The conditions the dialog opens with. Read when `open` becomes true. */
    conditions?: ValueHelpCondition[];
    /** The only way anything escapes. Blank-valued rules are dropped first. */
    onConfirm: (result: ValueHelpResult) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    /** Take over filtering. When set, `items` is rendered as given. */
    onSearch?: (query: string) => void;
    emptyText?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    selectTabLabel?: string;
    conditionsTabLabel?: string;
    addConditionLabel?: string;
    class?: string;
}
export declare const ValueHelp: (props: ValueHelpProps) => import("solid-js").JSX.Element;
//# sourceMappingURL=value-help.d.ts.map