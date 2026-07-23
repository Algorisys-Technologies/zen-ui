import { type IconName } from "../icon/icon";
/**
 * The searchable item list shared by the pickers — SelectDialog's whole body,
 * and ValueHelp's "Select" tab. Not exported from the package: it is the
 * innards of those components, not a control anyone should reach for directly.
 *
 * Split into a search field and a list body rather than one component because
 * SelectDialog puts them in different containers: the field sits in the bordered
 * header while the body owns the scroller, so a single wrapper could not produce
 * that layout.
 *
 * Query state stays with the caller. A picker resets its search when it opens,
 * and that rule belongs to whoever owns "open", not to the list.
 *
 * Mirrors the React binding.
 */
export interface SelectListItem {
    id: string;
    label: string;
    /** Secondary line under the label. */
    description?: string;
    /** Right-aligned trailing text — the "info", e.g. a status or amount. */
    info?: string;
    icon?: IconName;
    disabled?: boolean;
}
export declare const SelectSearchField: (props: {
    value: string;
    onValueChange: (v: string) => void;
    placeholder?: string;
    class?: string;
}) => import("solid-js").JSX.Element;
export declare const SelectListBody: (props: {
    items: SelectListItem[];
    multiple?: boolean;
    /** ids that are ticked (multi) or current (single) */
    selected: string[];
    onToggle: (id: string) => void;
    onPick: (id: string) => void;
    emptyText?: string;
}) => import("solid-js").JSX.Element;
//# sourceMappingURL=select-list.d.ts.map