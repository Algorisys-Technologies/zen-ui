import * as React from "react";
import { type PivotField, type PivotLayout, type PivotMembersRequest, type PivotMembersResult } from "../../_core/pivot";
/**
 * PivotWorkbench — drag fields into zones, press View Data, get a layout.
 *
 * Mirrors the Solid binding's API exactly. Every layout rule comes from
 * @algorisys/zen-ui-core/pivot, so the two bindings cannot disagree about what a
 * drop means — which matters here more than anywhere, because they share no drag
 * library: @dnd-kit here, @thisbeyond/solid-dnd there.
 *
 * It computes nothing and holds no data. You get a PivotLayout; answering for
 * the cells is yours.
 */
export interface PivotWorkbenchProps {
    fields: PivotField[];
    initialLayout?: PivotLayout;
    /** Fires on "View Data", not on every drag. */
    onLayoutApply?: (layout: PivotLayout) => void;
    className?: string;
    /** The grid. Rendered, never talked to. */
    children?: React.ReactNode;
    totalRows?: number;
    totalCols?: number;
    onClearFilters?: () => void;
    showBuilder?: boolean;
    loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
}
export declare const PivotWorkbench: React.FC<PivotWorkbenchProps>;
//# sourceMappingURL=pivot-workbench.d.ts.map