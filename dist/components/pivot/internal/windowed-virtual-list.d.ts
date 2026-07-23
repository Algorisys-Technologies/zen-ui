import { type Component, type JSX } from "solid-js";
import { type PivotFilterOptionsWindow } from "@algorisys/zen-ui-core/virtual-window";
export type WindowedVirtualListProps = {
    label: string;
    totalCount: number;
    optionsWindows: PivotFilterOptionsWindow[];
    loadingWindow: boolean;
    onVisibleRange: (minIndex: number, maxIndex: number) => void;
    renderRow: (value: string) => JSX.Element;
    isSelected?: (value: string) => boolean;
};
export declare const WindowedVirtualList: Component<WindowedVirtualListProps>;
//# sourceMappingURL=windowed-virtual-list.d.ts.map