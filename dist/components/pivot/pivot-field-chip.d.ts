import * as React from "react";
import { type PivotAggregation, type PivotField, type PivotFilterSelection, type PivotFilters, type PivotMembersRequest, type PivotMembersResult, type PivotZone } from "../../_core/pivot";
/**
 * PivotFieldChip — one field, in one zone.
 *
 * Mirrors the Solid binding. The chip label, the filter summary and the move
 * menu's wording all come from @algorisys/zen-ui-core/pivot, so the two cannot
 * describe the same state differently.
 */
export interface PivotFieldChipProps {
    fieldKey: string;
    fields: PivotField[];
    hasActiveFilter?: boolean;
    selection?: PivotFilterSelection;
    filters?: PivotFilters;
    loadMembers?: (request: PivotMembersRequest) => Promise<PivotMembersResult>;
    onSelectionChange?: (selection: PivotFilterSelection | null) => void;
    onRemove?: () => void;
    zone?: PivotZone;
    aggregation?: PivotAggregation;
    onAggregationChange?: (aggregation: PivotAggregation) => void;
    /**
     * Move this field to another zone. THE KEYBOARD PATH.
     *
     * dnd-kit does ship a KeyboardSensor, but it emulates a drag with arrow keys —
     * which for a four-bin builder means memorising a spatial layout you cannot
     * see. WAI-ARIA asks for an ALTERNATIVE to dragging rather than a keyboard
     * mime of it, so the ⋮ handle opens a menu of zones. The Solid binding has no
     * keyboard sensor at all, so this is also what makes the two behave alike.
     */
    onMoveToZone?: (zone: PivotZone) => void;
    singleSelect?: boolean;
    disabled?: boolean;
    /** Drag handle props from the sortable wrapper. */
    dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}
export declare const PivotFieldChip: React.FC<PivotFieldChipProps>;
//# sourceMappingURL=pivot-field-chip.d.ts.map