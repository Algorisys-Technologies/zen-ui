import * as React from "react";
import { type PivotFilterOptionsBody, type PivotFilterSelection, type SortDirection } from "../../_core/pivot";
/**
 * PivotFilterMenu — pick values for one field, paged in from the server.
 *
 * Mirrors the Solid binding's API. `selection` is a value here where Solid takes
 * an accessor — the same framework-idiom split as className/class, and the only
 * one.
 *
 * Built on this binding's Popover rather than a hand-positioned panel: it brings
 * placement, collision flipping, Escape, click-outside and focus return with it,
 * all of which the panel would otherwise reimplement.
 *
 * Sorting is opt-in: pass `onSort` and the panel gains "Sort ascending" /
 * "Sort descending" above the search. Picking the direction already in
 * `sortDirection` clears it — `onSort(null)` — so the same item toggles the
 * sort off. The menu does not sort anything itself; the caller owns the order.
 */
export interface PivotFilterMenuProps {
    columnKey: string;
    label: string;
    selection?: PivotFilterSelection;
    /** The current sort on this field, shown as a check on the matching item and an arrow on the trigger. */
    sortDirection?: SortDirection;
    formatValue?: (value: string) => string;
    onChange: (selection: PivotFilterSelection | null) => void;
    /**
     * Adds the sort items. Called with the picked direction, or `null` when the
     * picked direction is the current one (a second pick clears the sort).
     */
    onSort?: (direction: SortDirection | null) => void;
    loadOptions?: (columnKey: string, optionSearch: string, pagination?: {
        offset: number;
        limit: number;
    }) => Promise<PivotFilterOptionsBody>;
    triggerClassName?: string;
    triggerChildren?: React.ReactNode;
    singleSelect?: boolean;
}
export declare const PivotFilterMenu: React.FC<PivotFilterMenuProps>;
//# sourceMappingURL=pivot-filter-menu.d.ts.map