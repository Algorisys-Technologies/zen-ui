/**
 * Fixture for the Pivot demo — a fake backend, kept out of the demo file.
 *
 * A pivot is server-driven by design: the grid asks for the cells it can see and
 * the filter menus page their options in. None of that is the component's data,
 * so a demo has to stand one up. Left inline it was 130 of the demo's 187 lines,
 * which made the page look like it was about generating employees rather than
 * about using a pivot.
 *
 * Deterministic on purpose — the cells are a hash of (row, col), not random, so
 * the same coordinates always give the same number. A grid that reshuffles as
 * you scroll makes "did my filter work?" unanswerable.
 */
import type { PivotField, PivotMembersRequest, PivotMembersResult } from "@algorisys/zen-ui-core/pivot";
export declare const PIVOT_FIELDS: PivotField[];
export declare const memberCount: (fieldKey: string) => number;
/**
 * The filter menu's option source. Paged and searchable, like a real one — the
 * menu windows these, so handing it everything at once would prove nothing.
 */
export declare const loadMembers: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
/**
 * Which member a header shows at (index, depth).
 *
 * Nested headers repeat on a cycle: the innermost field changes every cell, the
 * one outside it every N cells, where N is the product of the field counts
 * inside it. That is the whole of a pivot's header maths.
 */
export declare const dimensionValueAt: (fieldKey: string, index: number, depth: number, fieldKeys: string[], measuresPerCol?: number) => string;
/** A stable pseudo-value for a cell. Same coordinates, same number, always. */
export declare const cellSeed: (row: number, col: number) => number;
export declare const formatMeasure: (measureId: string, seed: number) => string;
//# sourceMappingURL=pivot-demo-data.d.ts.map