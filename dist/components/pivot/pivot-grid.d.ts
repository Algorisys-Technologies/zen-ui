import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
export interface PivotGridProps {
    layout: PivotLayout;
    totalRows: number;
    totalCols: number;
    rowHeaderDepth: number;
    colHeaderDepth: number;
    getCell: (row: number, col: number) => {
        value: unknown;
        isLoading?: boolean;
    } | null;
    getRowHeader: (row: number, depth: number) => {
        value: string;
        rowSpan?: number;
        isVisible?: boolean;
        isLoading?: boolean;
    } | null;
    getColHeader: (depth: number, col: number) => {
        value: string;
        colSpan?: number;
        isVisible?: boolean;
        isLoading?: boolean;
    } | null;
    rowHeight?: number;
    colWidth?: number;
    rowHeaderWidth?: number;
    /**
     * Names the grid for a screen reader. It was hardcoded to "Data Grid" — a
     * library component cannot know what its consumer's data is, and every pivot
     * on a page announcing the same generic name is no name at all.
     */
    label?: string;
    onVisibleRangeChange?: (range: {
        rowStart: number;
        rowEnd: number;
        colStart: number;
        colEnd: number;
    }) => void;
}
export declare function PivotGrid(props: PivotGridProps): import("solid-js").JSX.Element;
//# sourceMappingURL=pivot-grid.d.ts.map