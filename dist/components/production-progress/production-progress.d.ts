import * as React from "react";
/**
 * ProductionProgress — a work order's good and scrap against its target.
 *
 *   <ProductionProgress label="WO-10042" target={500} good={361} scrap={19} />
 *   // ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  361 of 500 good · 19 scrap · 139 to go
 *
 * Scrap is drawn and counted separately: it does not count toward the target,
 * so 440 good with 40 scrap is 60 to go, not 20. Good past the target is
 * reported ("12 over target"), not clamped away. Work that has started but not
 * yet earned a visible width still gets a 2px sliver — "nobody has begun" is
 * what an empty bar means, and 3 of 5,000 is not that.
 *
 * Colour says what parts are, not how far along: good is primary until the
 * order is done, then success; scrap is error. Whether 60% is on time is the
 * schedule's question, not the bar's.
 *
 * `segments` adds a row of units — cartons, pallets, trays — each full, partly
 * full or empty, for packing where the count that matters is boxes.
 */
export type ProductionProgressProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    target: number;
    good: number;
    scrap?: number;
    /** Names the bar, visibly and for assistive tech: the work order, the step. */
    label?: string;
    /** Units the good count fills, e.g. `{ size: 12, count: 42, unit: "cartons" }`. */
    segments?: {
        size: number;
        count: number;
        unit: string;
    };
    size?: "sm" | "md";
    /** Hide the counts line (the label and the bar's accessible text stay). */
    hideText?: boolean;
};
export declare const ProductionProgress: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    target: number;
    good: number;
    scrap?: number;
    /** Names the bar, visibly and for assistive tech: the work order, the step. */
    label?: string;
    /** Units the good count fills, e.g. `{ size: 12, count: 42, unit: "cartons" }`. */
    segments?: {
        size: number;
        count: number;
        unit: string;
    };
    size?: "sm" | "md";
    /** Hide the counts line (the label and the bar's accessible text stay). */
    hideText?: boolean;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=production-progress.d.ts.map