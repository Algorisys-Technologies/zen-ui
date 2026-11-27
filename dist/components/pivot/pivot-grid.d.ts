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
    /**
     * Grand totals, asked for like the cells: a totals column per value (pinned
     * to the end edge) and a totals row (pinned to the bottom). The grid sums
     * nothing itself — an average's total is not the sum of averages, and the
     * data may live on a server — so each part is an accessor. Give only the
     * parts you want: `row` draws the totals columns, `column` the totals row.
     */
    totals?: PivotTotals;
    className?: string;
    style?: React.CSSProperties;
    /** The grid's height (px, or any CSS length). Default: fills its parent, as before. */
    height?: number | string;
    /** Classes for every column-header cell (the corner and the totals header too), after their own. */
    headerClassName?: string;
    /** Classes for every row-label cell, after their own. */
    rowHeaderClassName?: string;
    /** Keep the column headers at the top while the grid scrolls down. Default true. */
    stickyHeader?: boolean;
    /** Keep the row labels at the start edge while the grid scrolls sideways. Default true. */
    stickyRowHeaders?: boolean;
}
export type PivotTotalCell = {
    value: unknown;
    isLoading?: boolean;
} | null;
export interface PivotTotals {
    /** How many totals columns — usually one per value field. Default 1. */
    columns?: number;
    /** Totals column i's header. Default "Total". */
    columnHeader?: (i: number) => string;
    /** Row `row`'s total in totals column i. */
    row?: (row: number, i: number) => PivotTotalCell;
    /** Column `col`'s total, in the totals row. */
    column?: (col: number) => PivotTotalCell;
    /** Where the totals row meets totals column i. */
    grand?: (i: number) => PivotTotalCell;
    /** The totals row's label. Default "Total". */
    label?: string;
}
export declare const PivotGrid: React.FC<PivotGridProps>;
//# sourceMappingURL=pivot-grid.d.ts.map