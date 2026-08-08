import * as React from "react";
import { type PivotFilterOptionsBody, type PivotFilterSelection } from "../../_core/pivot";
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
 */
export interface PivotFilterMenuProps {
    columnKey: string;
    label: string;
    selection?: PivotFilterSelection;
    formatValue?: (value: string) => string;
    onChange: (selection: PivotFilterSelection | null) => void;
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