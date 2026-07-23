import { type Component } from "solid-js";
import type { PivotFilterSelection } from "@algorisys/zen-ui-core/pivot";
import type { PivotFilterOptionsWindow } from "@algorisys/zen-ui-core/virtual-window";
export interface PivotFilterVirtualListProps {
    label: string;
    totalCount: number;
    optionsWindows: PivotFilterOptionsWindow[];
    loadingWindow: boolean;
    selection: () => PivotFilterSelection | undefined;
    formatValue: (value: string) => string;
    onToggleValue: (value: string) => void;
    onVisibleRange: (minIndex: number, maxIndex: number) => void;
    singleSelect?: boolean;
}
/** Virtualized option list; remounts with the panel so scroll state stays fresh. */
export declare const PivotFilterVirtualList: Component<PivotFilterVirtualListProps>;
//# sourceMappingURL=pivot-filter-virtual-list.d.ts.map