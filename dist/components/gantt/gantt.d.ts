import * as React from "react";
import { type GanttCalendar, type GanttDependency, type GanttPaneColumn, type GanttRow, type GanttTaskNode, type GanttView } from "../../_core/index";
/**
 * Gantt — what the project is doing, and what is waiting on what.
 *
 *   <Gantt tasks={plan} dependencies={links} />
 *
 * Two panes over one clock. On the left a task tree that collapses; on the
 * right the same rows as bars on a shared time axis, with dependency arrows
 * between them.
 *
 * This file is the PROJECT half only. The chrome underneath it — the scroller,
 * the axis and its six views, the frozen pane that sheds columns, row
 * windowing, the connector overlay, and the treegrid keyboard model — lives in
 * ./schedule-grid, which knows nothing about tasks. What is here is what a
 * project schedule MEANS: the task shape, the four pane columns, the bar with
 * its progress fill and slip chip, and the rollups that feed them.
 *
 * All the arithmetic — the range, the columns, bar placement, the now line, the
 * hierarchy projection, summary rollups, slip and the connector routes — is in
 * @algorisys/zen-ui-core/gantt and @algorisys/zen-ui-core/planning, pinned by
 * scripts/check-gantt.ts and scripts/check-planning.ts. The component is a
 * renderer over those functions and derives no dates of its own.
 *
 * It does NOT edit, and that is the same decision PlanningCalendar made for the
 * same reason. There is no drag-to-move, no drag-to-resize, no drag-to-create
 * and no way to redraw a dependency by pulling on it. Rescheduling a task in a
 * real plan cascades through its successors, and what should happen then is a
 * policy question — does it push the whole chain, does it need an approval,
 * what does undo mean, who is allowed. That belongs to the caller's domain.
 * `onTaskClick` hands you the task and its derived row; you open your own
 * editor and hand back new `tasks`.
 *
 * The default view is `fit`: the axis range is the span of the tasks, so a plan
 * opens showing its own shape rather than whichever calendar month today falls
 * in. It is the only view that is never trivially wrong.
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
 * Times are the caller's local `Date`s, deliberately unconverted — see the
 * module note in core.
 */
/** Someone the work is assigned to. */
export interface GanttAssignee {
    id: string;
    name: string;
    /** Avatar image. Falls back to initials when absent or broken. */
    src?: string;
    /** Overrides the initials derived from `name`. */
    initials?: string;
}
export interface GanttTask extends GanttTaskNode {
    name: string;
    /** Second line under the name. */
    subtitle?: string;
    assignees?: GanttAssignee[];
    /** Overrides the status chip's words. The colour still follows `status`. */
    statusLabel?: string;
    children?: GanttTask[];
}
export interface GanttProps {
    tasks: GanttTask[];
    /** Links between tasks. Finish-to-start unless the link says otherwise. */
    dependencies?: GanttDependency[];
    /** Draw the connector layer. Default true. */
    showDependencies?: boolean;
    /**
     * Uncontrolled starting view. Default "fit" — the axis takes its range from
     * the tasks, so the plan opens whole instead of showing whichever calendar
     * month today happens to fall in.
     */
    defaultView?: GanttView;
    /** Controlled view; pair with `onViewChange`. */
    view?: GanttView;
    onViewChange?: (view: GanttView) => void;
    /** Which views the switcher offers. Default all six. */
    views?: GanttView[];
    /** Any date inside the range to open on. Default today. */
    defaultDate?: Date;
    /** Controlled anchor date; pair with `onDateChange`. */
    date?: Date;
    onDateChange?: (date: Date) => void;
    /**
     * Ids of the parents that are open. Controlled; pair with
     * `onExpandedChange`. A parent not in the list is closed.
     */
    expanded?: string[];
    /** Uncontrolled starting set. Omit it and everything opens. */
    defaultExpanded?: string[];
    onExpandedChange?: (ids: string[]) => void;
    onTaskClick?: (task: GanttTask, row: GanttRow<GanttTask>) => void;
    /**
     * When work can happen — shift patterns per weekday plus dated exceptions for
     * holidays, planned maintenance and one-off overtime.
     *
     * With one supplied, durations become WORKING durations, bars break across
     * non-working time instead of drawing through it, and the shaded columns are
     * decided by this rather than by the weekend-and-nine-to-five default.
     * Omit it and nothing changes: no calendar means a 24/7 one.
     */
    calendar?: GanttCalendar;
    /**
     * Hours per column in the DAY view. Default 1. Set 0.25 for quarter-hour
     * columns, which is the resolution a shop floor schedules at.
     */
    hourStep?: number;
    /** Reference "now" for the marker, the today column and the derived status. */
    now?: Date;
    /**
     * Nominal pixel width of one column — the axis is `columns × this`. In the
     * quarter, year and fit views columns differ in length (a 28-day February is
     * narrower than a 31-day January), so this sets the average rather than the
     * literal width. Defaults to something readable per view.
     *
     * Setting it also opts the FIT view out of sizing itself to the container,
     * which is the one thing that view exists to do — so pass it there only when
     * you would rather scroll than let the columns choose their own width.
     */
    columnWidth?: number;
    /** Hide the toolbar when your page already has one. */
    hideToolbar?: boolean;
    /**
     * Which columns the frozen pane carries, and in what order. Default all four:
     * `["name", "assignees", "status", "variance"]`.
     *
     * The order is a PREFERENCE order, not just a set. Four columns at their
     * natural widths plus a year axis need about 1430px, so what you list last is
     * what the pane sheds first when the container is too narrow to hold both it
     * and a usable axis. The first entry is never dropped, and if even that plus
     * the axis does not fit, the chart scrolls sideways as a last resort. Drop the
     * two your data cannot fill and the pane stops costing you the timeline.
     */
    columns?: GanttPaneColumn[];
    /** Show skeleton rows instead of the chart. */
    loading?: boolean;
    /** How many skeleton rows. Default 6. */
    loadingRows?: number;
    /** Replaces the whole no-tasks surface. */
    emptyState?: React.ReactNode;
    className?: string;
}
export declare const Gantt: ({ tasks, dependencies, showDependencies, defaultView, view: viewProp, onViewChange, views, defaultDate, date: dateProp, onDateChange, expanded: expandedProp, defaultExpanded, onExpandedChange, onTaskClick, now: nowProp, calendar, hourStep, columnWidth, hideToolbar, columns: paneColumnsProp, loading, loadingRows, emptyState, className, }: GanttProps) => React.JSX.Element;
//# sourceMappingURL=gantt.d.ts.map