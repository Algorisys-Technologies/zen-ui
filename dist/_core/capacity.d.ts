/**
 * Capacity — the pure half of CapacityHeatmap.
 *
 *   bun run check:capacity
 *
 * Load is booked ÷ available. Over is strictly above 100% (with a
 * floating-point allowance); "high" from 85% by default. Work booked where
 * there is no capacity is "no-capacity" — the worst case, not a division by
 * zero. No work and no capacity is "closed". Totals sum hours, then divide.
 */
export type CapacityStatus = "free" | "ok" | "high" | "over" | "no-capacity" | "closed";
export interface CapacityCell {
    booked: number;
    available: number;
    /** booked ÷ available; null without capacity. */
    load: number | null;
    status: CapacityStatus;
}
export declare function capacityCell(booked: number, available: number, options?: {
    high?: number;
}): CapacityCell;
export interface CapacityGridInput {
    rows: {
        id: string;
    }[];
    periods: {
        id: string;
    }[];
    cells: {
        row: string;
        period: string;
        booked: number;
        available: number;
    }[];
    high?: number;
}
export interface CapacityGrid {
    cells: Record<string, Record<string, CapacityCell>>;
    rowTotals: Record<string, CapacityCell>;
    periodTotals: Record<string, CapacityCell>;
    total: CapacityCell;
    /** Cells over capacity or with work and no capacity. */
    overCount: number;
}
export declare function capacityGrid(i: CapacityGridInput): CapacityGrid;
