import * as React from "react";
import { type GanttCalendar, type GanttDependency, type GanttView, type ProductionOperationNode, type ProductionResourceNode, type ProductionRow as ProductionRowData, type ProductionProposal, type ProductionSetupMatrix } from "../../_core/index";
/**
 * ProductionSchedule — what each machine is doing, and whether it can.
 *
 *   <ProductionSchedule resources={cells} operations={jobs} calendar={plant} />
 *
 * The sibling of `Gantt`, and a SEPARATE component rather than a mode of it —
 * the decision, its reasoning and the three corrections to that reasoning are
 * in docs/production-scheduling-gap-analysis.md. The short version: a row here
 * is a work centre holding a sequence of operations, each with a changeover, a
 * capacity claim and a routing position. That is a different renderer contract
 * from a row holding one bar with a percentage and a baseline, and no flag
 * describes both without half the props becoming inapplicable.
 *
 * What the two DO share is everything that does not depend on what a row is:
 * ../gantt/schedule-grid renders the axis, the frozen pane, the windowing, the
 * connector overlay and the treegrid keyboard model for both, and
 * @algorisys/zen-ui-core/gantt does the working-time arithmetic underneath
 * both. Sharing in core and in one internal renderer is the point of the split;
 * two copies of either would be the thing it was supposed to avoid.
 *
 * THREE THINGS THIS SHOWS THAT A PROJECT GANTT CANNOT:
 *
 *  - **Lanes.** A machine double-booked at 10:00 draws two bars side by side
 *    rather than one over the other. Rows are a uniform height across the chart
 *    — the window and the connector routes both need that — so the height comes
 *    from the busiest row and every row uses it.
 *  - **Setup.** The changeover is drawn as its own leading block in its own
 *    hatch, because it occupies the machine and makes nothing. It counts in the
 *    load; a plant that measures only run time reports itself less busy than it
 *    is by exactly its changeovers.
 *  - **Load.** A histogram under the axis: booked working time over available
 *    working time, per column. Both sides are working quantities, which is why
 *    the calendar had to exist before this could.
 *
 * ONE LAYOUT TRAP, and it is the caller's to avoid. The fit axis sizes itself
 * from the scroller's measured width, so it needs a container with a width of
 * its OWN. Drop the chart into a flex row or an inline-block whose width comes
 * from its content and the two define each other: measured on this repo's own
 * demo page, identical data rendered at 516px in one section and 1800px in
 * another, purely because the wrapper lacked `width: 100%`. Give the wrapper a
 * definite width — the component's root already carries `w-full` for exactly
 * this reason, but it cannot fix a parent that has none.
 *
 * READ-ONLY, and deliberately so for now. There is no drag-to-reschedule: the
 * decision (DECISION 2 in the gap analysis) is DEFERRED until there is an
 * overload on screen to drag at, not settled against. Two of its consequences
 * are honoured here already because they are cheaper kept than retrofitted —
 * the component is fully controlled, and conflicts are computed and REPORTED,
 * never enforced. Overtime gets authorised and due dates get renegotiated; a
 * component that refused a booking would be wrong in every plant whose rules
 * differ from the ones we guessed.
 */
/** A machine, a cell, a line. They nest; a collapsed one carries all its work. */
export interface ProductionResource extends ProductionResourceNode {
    name: string;
    /** Second line under the name — an asset number, a location. */
    subtitle?: string;
    children?: ProductionResource[];
}
export interface ProductionOperation extends ProductionOperationNode {
    name: string;
    /** The works order it belongs to. Shown in the tooltip. */
    order?: string;
    /** Overrides the derived status colour's words, not its colour. */
    statusLabel?: string;
}
/** Which columns the frozen pane can carry. */
export type ProductionPaneColumn = "resource" | "jobs" | "capacity" | "load" | "float";
export interface ProductionScheduleProps {
    resources: ProductionResource[];
    operations: ProductionOperation[];
    /**
     * Routing links between operations — op 10 finishes, op 20 starts. Drawn with
     * the same four link types a Gantt dependency has.
     */
    dependencies?: GanttDependency[];
    /** Draw the routing layer. Default true. */
    showDependencies?: boolean;
    /**
     * When the plant is open. A resource's own `calendar` overrides it.
     *
     * Strongly recommended here, unlike on `Gantt`: without one every duration is
     * wall-clock, so a changeover runs through the night, and load is measured
     * against 24 hours a day the plant does not have.
     */
    calendar?: GanttCalendar;
    /** Hours per column in the DAY view. Default 1; 0.25 for quarter-hour columns. */
    hourStep?: number;
    /**
     * Sequence-dependent changeover, keyed on the pair of `setupFamily` values.
     *
     * With one supplied, an operation that states no `setupMinutes` gets one
     * derived from what ran before it on the same machine. This is the difference
     * between a changeover and a changeover *cost*: white to black is an hour of
     * washing out, black to white is fifteen minutes, and a single per-operation
     * duration cannot say so.
     */
    setupMatrix?: ProductionSetupMatrix;
    /** Uncontrolled starting view. Default "fit". */
    defaultView?: GanttView;
    view?: GanttView;
    onViewChange?: (view: GanttView) => void;
    views?: GanttView[];
    defaultDate?: Date;
    date?: Date;
    onDateChange?: (date: Date) => void;
    /** Ids of the open parents. Controlled; pair with `onExpandedChange`. */
    expanded?: string[];
    /** Uncontrolled starting set. Omit it and everything opens. */
    defaultExpanded?: string[];
    onExpandedChange?: (ids: string[]) => void;
    onOperationClick?: (operation: ProductionOperation, row: ProductionRowData<ProductionResource, ProductionOperation>) => void;
    /**
     * Called with what WOULD happen if the user's move were made. Supplying it is
     * what turns rescheduling on.
     *
     * The component never applies it. It stays controlled: it renders the
     * `operations` it is given, hands you a proposal, and changes nothing until
     * you pass a new array. That is what keeps undo yours — a history of arrays
     * you already own — and it is why there is no internal pending state to get
     * out of sync with your ERP.
     *
     * `proposal.cascade` includes the operation the user dragged, first. Persist
     * only that one and you have written a schedule nobody saw. `conflicts` and
     * `cycles` are reported, never enforced: overtime gets authorised, and a
     * supervisor who knows both jobs can run may double-book deliberately.
     */
    onReschedule?: (proposal: ProductionProposal) => void;
    /**
     * Whether an operation may be moved at all. Default: everything may, once
     * `onReschedule` is supplied.
     *
     * This GATES THE AFFORDANCE rather than the outcome — a forbidden operation
     * simply is not draggable, so a user never does the work of moving something
     * and then gets told no. Returning a rejection after the drag is the version
     * that feels like a bug.
     */
    canReschedule?: (operation: ProductionOperation) => boolean;
    /**
     * How many operations may stack on one row before the rest are counted as
     * overflow. Default 3.
     *
     * Bounded because it sets the height of EVERY row: one badly double-booked
     * machine would otherwise make the whole chart tall.
     */
    maxLanes?: number;
    /** Draw the load histogram under the axis. Default true. */
    showLoad?: boolean;
    /**
     * Compute float and mark the critical path. Off by default: it is a graph
     * pass over every operation, and a schedule with no routing has nothing to
     * be critical about.
     *
     * With `until` supplied it is measured against a real due date, and every
     * operation can then have NEGATIVE float — which is the plant being late,
     * not a fault. Without it, the latest finish in the schedule is the end, so
     * the longest chain is critical by construction.
     */
    showCriticalPath?: boolean;
    /** The date float is measured against. Default: the schedule's own last finish. */
    until?: Date;
    now?: Date;
    columnWidth?: number;
    hideToolbar?: boolean;
    /** Which pane columns, in preference order. Default all four. */
    columns?: ProductionPaneColumn[];
    loading?: boolean;
    loadingRows?: number;
    emptyState?: React.ReactNode;
    className?: string;
}
export declare const ProductionSchedule: ({ resources, operations, dependencies, showDependencies, calendar, hourStep, setupMatrix, defaultView, view: viewProp, onViewChange, views, defaultDate, date: dateProp, onDateChange, expanded: expandedProp, defaultExpanded, onExpandedChange, onOperationClick, onReschedule, canReschedule, maxLanes, showLoad, showCriticalPath, until, now: nowProp, columnWidth, hideToolbar, columns: paneColumnsProp, loading, loadingRows, emptyState, className, }: ProductionScheduleProps) => React.JSX.Element;
//# sourceMappingURL=production-schedule.d.ts.map