import { type PivotAggregation, type PivotField, type PivotFilterSelection, type PivotFilters, type PivotMembersRequest, type PivotMembersResult, type PivotZone } from "@algorisys/zen-ui-core/pivot";
export interface PivotFieldChipProps {
    fieldKey: string;
    fields: PivotField[];
    hasActiveFilter?: boolean;
    selection?: PivotFilterSelection;
    /** Typed now — this was `Record<string, PivotFilterSelection>` restated by hand. */
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
     * Dragging is a pointer gesture with no keyboard equivalent — solid-dnd ships
     * pointer sensors only — so without this a keyboard user could remove a field
     * and never add or move one, which is most of the component. WAI-ARIA's advice
     * for drag and drop is to provide an alternative rather than to emulate
     * dragging with arrow keys, so the ⋮ handle opens a menu. It is also faster
     * than dragging for everyone.
     */
    onMoveToZone?: (zone: PivotZone) => void;
    singleSelect?: boolean;
    disabled?: boolean;
}
export declare function PivotFieldChip(props: PivotFieldChipProps): import("solid-js").JSX.Element;
//# sourceMappingURL=pivot-field-chip.d.ts.map