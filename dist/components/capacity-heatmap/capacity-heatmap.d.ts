import * as React from "react";
import { type CapacityCell } from "../../_core/capacity";
/**
 * CapacityHeatmap — booked hours against available hours, resource by period.
 *
 *   <CapacityHeatmap
 *     rows={lines} periods={weeks}
 *     cells={[{ row: "A", period: "w46", booked: 36, available: 40 }, …]}
 *     onCellClick={(row, period) => openDrillDown(row, period)}
 *   />
 *
 * A real table: every cell prints its load and hours, the colour repeats them.
 * The wash deepens with load up to full; over capacity, and work booked where
 * there is no capacity at all (a line shut that week), are drawn as alarms —
 * the second is the worse of the two and the easiest to miss, because a naive
 * percentage would divide by zero or call it free. Totals sum hours, then
 * divide.
 *
 * `onCellClick` makes each cell a button, for a drill-down into the orders
 * behind it.
 */
export type CapacityHeatmapProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    rows: {
        id: string;
        label?: string;
    }[];
    periods: {
        id: string;
        label?: string;
    }[];
    cells: {
        row: string;
        period: string;
        booked: number;
        available: number;
    }[];
    /** Where "high" starts. Default 0.85. */
    high?: number;
    /** Names the table. Defaults to "Capacity". */
    label?: string;
    /** Row and column totals. Default true. */
    showTotals?: boolean;
    onCellClick?: (row: string, period: string, cell: CapacityCell) => void;
};
export declare const CapacityHeatmap: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    rows: {
        id: string;
        label?: string;
    }[];
    periods: {
        id: string;
        label?: string;
    }[];
    cells: {
        row: string;
        period: string;
        booked: number;
        available: number;
    }[];
    /** Where "high" starts. Default 0.85. */
    high?: number;
    /** Names the table. Defaults to "Capacity". */
    label?: string;
    /** Row and column totals. Default true. */
    showTotals?: boolean;
    onCellClick?: (row: string, period: string, cell: CapacityCell) => void;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=capacity-heatmap.d.ts.map