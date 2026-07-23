import { type Component, type JSX } from "solid-js";
import type { PivotFilterOptionsBody, PivotFilterSelection, SortDirection } from "@algorisys/zen-ui-core/pivot";
export interface PivotFilterMenuProps {
    columnKey: string;
    label: string;
    selection: () => PivotFilterSelection | undefined;
    sortDirection?: SortDirection;
    formatValue?: (value: string) => string;
    onChange: (selection: PivotFilterSelection | null) => void;
    onSort?: (direction: SortDirection | null) => void;
    loadOptions?: (columnKey: string, optionSearch: string, pagination?: {
        offset: number;
        limit: number;
    }) => Promise<PivotFilterOptionsBody>;
    triggerClass?: string;
    triggerChildren?: JSX.Element;
    singleSelect?: boolean;
}
export declare const PivotFilterMenu: Component<PivotFilterMenuProps>;
//# sourceMappingURL=pivot-filter-menu.d.ts.map