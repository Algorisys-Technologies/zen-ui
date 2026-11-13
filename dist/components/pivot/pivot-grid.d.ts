import * as React from "react";
import type { PivotLayout } from "../../_core/pivot";
/**
 * PivotGrid — a table windowed in BOTH directions.
 *
 * Mirrors the Solid binding. It never sees your data: it works out which
 * coordinates are visible and asks for those, so what you return can come from
 * memory, a cache, or a request still in flight.
 *
 * Rows are virtualized by @tanstack/react-virtual; columns by hand, because a
 * pivot's columns are uniform and a second virtualizer buys nothing.
 *
 * Not role="grid". A native <table> means table semantics already, and
 * role="grid" is a CONTRACT — arrow-key cell navigation and a roving tabindex.
 * Claiming it without honouring it tells a screen-reader user to navigate a way
 * that does not work.
 */
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
    /** Names the grid for a screen reader. */
    label?: string;
    onVisibleRangeChange?: (range: {
        rowStart: number;
        rowEnd: number;
        colStart: number;
        colEnd: number;
    }) => void;
}
export declare const PivotGrid: React.FC<PivotGridProps>;
//# sourceMappingURL=pivot-grid.d.ts.map