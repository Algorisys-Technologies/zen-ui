import { type JSX } from "solid-js";
export interface FilterBarField {
    id: string;
    label: string;
    /** The control for this filter. */
    render: () => JSX.Element;
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
    variant?: JSX.Element;
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
    class?: string;
}
export declare const FilterBar: (props: FilterBarProps) => JSX.Element;
//# sourceMappingURL=filter-bar.d.ts.map