import { type JSX } from "solid-js";
import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
import type { PivotField, PivotMembersRequest, PivotMembersResult } from "@algorisys/zen-ui-core/pivot";
import type { PivotFilterSelection } from "@algorisys/zen-ui-core/pivot";
export type { PivotField, PivotMembersRequest, PivotMembersResult, PivotFilterSelection };
export interface PivotWorkbenchProps {
    fields: PivotField[];
    initialLayout?: PivotLayout;
    onLayoutApply?: (layout: PivotLayout) => void;
    class?: string;
    children?: JSX.Element;
    totalRows?: number;
    totalCols?: number;
    onClearFilters?: () => void;
    showBuilder?: boolean;
    loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
}
export declare function PivotWorkbench(props: PivotWorkbenchProps): JSX.Element;
//# sourceMappingURL=pivot-workbench.d.ts.map