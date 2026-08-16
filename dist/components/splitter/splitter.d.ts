import * as React from "react";
import { type SplitterOrientation, type SplitterPanelConstraint } from "../../_core/index";
/**
 * Splitter — panes a user can resize by dragging the divider between them.
 *
 *   <Splitter defaultSizes={[30, 70]}>
 *     <SplitterPanel min={20} collapsible><Manuscript /></SplitterPanel>
 *     <SplitterHandle />
 *     <SplitterPanel min={30}><Preview /></SplitterPanel>
 *   </Splitter>
 *
 * The handle is EXPLICIT rather than injected between panels. An implicit one
 * leaves the caller nowhere to put a collapse button or a grab affordance.
 *
 * The geometry is `@algorisys/zen-ui-core/splitter`, shared by every binding —
 * see scripts/check-splitter.ts. `react-resizable-panels` was refused because it
 * has no Solid equivalent: the two bindings would then differ in BEHAVIOUR
 * rather than only in composition, which is what check-parity cannot see.
 *
 * It does NOT persist anything. `onSizesCommit` plus a controlled `sizes` gives
 * a caller everything they need to persist wherever they keep state.
 */
export type { SplitterOrientation };
export interface SplitterProps {
    orientation?: SplitterOrientation;
    /** Controlled. Percentages summing to 100. */
    sizes?: number[];
    /** Uncontrolled starting layout. Defaults to an even split. */
    defaultSizes?: number[];
    /** Fires during the drag, batched to one animation frame. */
    onSizesChange?: (sizes: number[]) => void;
    /** Fires once on release. This is what to persist. */
    onSizesCommit?: (sizes: number[]) => void;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}
export declare const Splitter: ({ orientation, sizes: sizesProp, defaultSizes, onSizesChange, onSizesCommit, disabled, className, children, }: SplitterProps) => React.JSX.Element;
export interface SplitterPanelProps extends SplitterPanelConstraint {
    className?: string;
    children?: React.ReactNode;
}
export declare const SplitterPanel: ({ min, max, collapsible, collapsedSize, className, children }: SplitterPanelProps) => React.JSX.Element;
export interface SplitterHandleProps {
    /** Required by the pattern: a separator with no name cannot be told from three others. */
    label?: string;
    disabled?: boolean;
    className?: string;
    children?: React.ReactNode;
}
/**
 * The divider. A WAI-ARIA window splitter: `role="separator"`, focusable, and
 * `aria-valuenow` describing the PRECEDING panel so a screen-reader user knows
 * which pane the arrows move.
 */
export declare const SplitterHandle: ({ label, disabled, className, children }: SplitterHandleProps) => React.JSX.Element;
//# sourceMappingURL=splitter.d.ts.map