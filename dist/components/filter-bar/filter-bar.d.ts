import * as React from "react";
/**
 * FilterBar — the structured filter area above a table. The gap analysis
 * calls the List Report unbuildable without it.
 *
 * Fields are data, not children: Solid cannot read a child's props the way
 * React.Children can, so a compound API could not build the "Adapt filters"
 * list in both bindings from the same source. `render` keeps the control itself
 * arbitrary.
 *
 *   <FilterBar
 *     fields={[{ id: "supplier", label: "Supplier", render: () => <Input /> }]}
 *     onGo={runQuery}
 *   />
 *
 * "Adapt filters" is a SelectDialog over the field labels — picking which
 * filters are visible is exactly a searchable multi-select, so it would be odd
 * to build a second one.
 *
 * This bar collects and reveals; it does not filter. `onGo` is the caller's cue
 * to run the query, because only the caller knows what the controls mean.
 */
export interface FilterBarField {
    id: string;
    label: string;
    /** The control for this filter. */
    render: () => React.ReactNode;
    /** Kept off the bar until the user adds it via Adapt filters. */
    hiddenByDefault?: boolean;
}
export interface FilterBarProps {
    fields: FilterBarField[];
    /** Run the query. Without it, the Go button is not rendered. */
    onGo?: () => void;
    /** Clear the controls. Without it, the Clear button is not rendered. */
    onClear?: () => void;
    /** Slot for a variant / saved-view control. */
    variant?: React.ReactNode;
    /** Controlled visible field ids. Uncontrolled default: everything not `hiddenByDefault`. */
    visibleIds?: string[];
    onVisibleIdsChange?: (ids: string[]) => void;
    /** The Adapt filters affordance. Default: true. */
    adaptable?: boolean;
    /** The collapse chevron. Default: true. */
    collapsible?: boolean;
    defaultExpanded?: boolean;
    goLabel?: string;
    clearLabel?: string;
    adaptLabel?: string;
    className?: string;
}
export declare const FilterBar: {
    ({ fields, onGo, onClear, variant, visibleIds: visibleProp, onVisibleIdsChange, adaptable, collapsible, defaultExpanded, goLabel, clearLabel, adaptLabel, className, }: FilterBarProps): React.JSX.Element;
    displayName: string;
};
//# sourceMappingURL=filter-bar.d.ts.map