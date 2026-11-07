import * as React from "react";
import { type PivotFilterOptionsWindow } from "../../../_core/virtual-window";
/**
 * A listbox over values that are not all loaded.
 *
 * The windowing is VirtualizedItems' sparse mode — this file used to carry its
 * own createVirtualizer, its own absolute-positioned row layer and its own
 * visible-range reporting, all of which VirtualizedItems already had in dense
 * form. The only thing that was genuinely missing was "the list is longer than
 * what is loaded", so that went into VirtualizedItems where every other listbox
 * in the library can reach it, rather than staying here where nothing could.
 *
 * What is left is the part that IS about pivot filters: an option row, a
 * checkbox, and a skeleton for rows whose page has not arrived.
 *
 * Mirrors the Solid binding.
 */
export interface WindowedVirtualListProps {
    totalCount: number;
    optionsWindows: PivotFilterOptionsWindow[];
    isSelected: (value: string) => boolean;
    onToggle: (value: string) => void;
    onVisibleRange: (minIndex: number, maxIndex: number) => void;
    formatValue?: (value: string) => string;
    label: string;
    className?: string;
    /**
     * Draw the indicator as a radio rather than a checkbox. A square box is a
     * promise you can tick more than one; when the menu takes a single value that
     * promise is a lie, and the user only finds out by trying. Mirrors Solid.
     */
    singleSelect?: boolean;
}
export declare const WindowedVirtualList: React.FC<WindowedVirtualListProps>;
//# sourceMappingURL=windowed-virtual-list.d.ts.map