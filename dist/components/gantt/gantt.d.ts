import * as React from "react";
import { type GanttActualLayout, type GanttLegendItem, type GanttCalendar, type GanttDependency, type GanttDependencyStyle, type GanttPaneColumn, type GanttRow, type GanttTaskNode, type GanttView } from "../../_core/index";
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
    subtitle?: string | string[];
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
     * The colour and dash of one dependency's arrow, from the caller's own data —
     * typically its `kind`: `(d) => d.kind === "sequence" ? { color: "var(--zen-color-info)" } : { dash: "4 3" }`.
     * Give each kind a dash as well as a colour; red already means late here.
     * A link the plan breaks is still drawn red.
     */
    dependencyStyle?: (dependency: GanttDependency) => GanttDependencyStyle | undefined;
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
    /**
     * Every row's height in px. Default 36. One value for all rows: the row
     * window and the dependency arrows place rows at index × height.
     */
    rowHeight?: number;
    /** The chart's maximum height before it scrolls (px, or any CSS length). Default 32rem. */
    maxBodyHeight?: number | string;
    /** Classes for a task's row — a tint for a critical or late task. */
    rowClassName?: (task: GanttTask, row: GanttRow<GanttTask>) => string | undefined;
    /**
     * Classes for a task's bar, applied after its status colours so they win:
     * `(t) => t.team === "Design" && "zen-bg-zen-accent-purple zen-border-zen-accent-purple"`.
     */
    barClassName?: (task: GanttTask) => string | undefined | false | null;
    /**
     * A CSS colour for a stripe on the bar's leading edge — a second channel
     * beside the status fill, for a shift, a line or a customer:
     * `(t) => shiftColour[t.shift]`. A value rather than a class, so the colour
     * can come from data. On a milestone it is a border inside the diamond, so
     * the arrows still meet its points.
     */
    barAccent?: (task: GanttTask) => string | undefined | false | null;
    /**
     * Planned vs actual. A task with `actualStart` (and, once done,
     * `actualEnd`) gets a second bar showing when the work really ran; its
     * `start`/`end` stay the plan. Running work's bar ends at now. Nothing
     * changes for a task without them.
     *
     * "strip" (default) keeps the planned bar where it always was and draws the
     * actual one slim beneath it. "split" draws two equal bars, plan above.
     * "primary" makes the actual bar the main one — status colour, % fill, the
     * click and the arrows — with the plan a slim dashed outline beneath; a task
     * with no actual dates is drawn as usual.
     */
    actualLayout?: GanttActualLayout;
    /**
     * Let the actual dates drive status and slip. Default true: an actual end
     * with no % stated is Complete, a running task is On track (or Delayed past
     * its plan), and with no `baselineEnd` the variance is the actual finish
     * against the planned end. An explicit `status`, `percentComplete` or
     * `baselineEnd` still wins. False draws the actual bar and changes nothing else.
     */
    deriveFromActuals?: boolean;
    /** Classes for a task's actual bar, applied after its own: `(t) => "zen-opacity-60"`. */
    actualBarClassName?: (task: GanttTask) => string | undefined | false | null;
    /**
     * A CSS colour for a task's actual bar. Default: the row's status colour.
     * A value rather than a class, so the colour can come from data.
     */
    actualBarColor?: (task: GanttTask) => string | undefined | false | null;
    /**
     * Text ON the planned bar, replacing its "60%": `(t, row) => \`Planned (6–12 Jul)\``.
     * Drawn inside when it fits, beside the bar when it does not. Hidden from
     * assistive tech — the bar's name already says its dates and progress.
     */
    barLabel?: (task: GanttTask, row: GanttRow<GanttTask>) => string | undefined | false | null;
    /** Text on the actual bar, as `barLabel`. A slim "strip" bar always puts it beside. */
    actualBarLabel?: (task: GanttTask, row: GanttRow<GanttTask>) => string | undefined | false | null;
    /**
     * Which bar carries the % fill — and with it the status colour. "planned"
     * (default) is how it has always been. "actual" fills the actual bar and
     * makes the plan a neutral reference; a task with no actual dates keeps its
     * fill on the planned bar, since there is nowhere else to put it.
     */
    progressOn?: "planned" | "actual";
    /**
     * A CSS colour for a row's status, replacing the four-colour palette on its
     * chip and bars — for statuses of your own ("On hold"), named with
     * `statusLabel`: `(t) => t.onHold && "var(--zen-color-accent-purple)"`.
     */
    statusColor?: (task: GanttTask, row: GanttRow<GanttTask>) => string | undefined | false | null;
    /**
     * A key in the toolbar. `true` builds it from the chart — one entry per
     * status label and colour on screen; an array draws exactly those entries
     * (add "Planned" and "Actual" yourself if you restyle the bars).
     */
    legend?: boolean | GanttLegendItem[];
    /**
     * What one column of the Month view is: "day" (default) or "week" — the
     * month in calendar weeks, room for a label on every bar. The other views,
     * Fit and a continuous axis are unaffected.
     */
    monthColumns?: "day" | "week";
    /**
     * Classes for the header: the row and its frozen pane, applied after their
     * own, so a caller's background and text colour win
     * (`"zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"`).
     */
    headerClassName?: string;
    /**
     * A second header row giving the columns their date context: the date above
     * hours, the month above days or weeks, the year above months. Each label
     * stays in view while the axis scrolls sideways, so a planner following an
     * order across weeks never has to look up to the toolbar for the month. Off
     * by default: the header is then the single row it always was.
     */
    headerGroups?: boolean;
    /**
     * One continuous timeline over the whole plan, scrolled sideways: Day, Week,
     * Month, Quarter and Year set the ZOOM instead of a one-period window, so a
     * bar is never cut at a period edge and an order can be followed across
     * weeks. Previous / Next / Today scroll; the title names the period in the
     * middle of the screen. Turns `headerGroups` on unless it is set to false.
     * Fit is continuous already and is unaffected. Off by default.
     */
    continuous?: boolean;
    /**
     * How much room a row and its bar takes: "compact", "comfortable" (the default, and the
     * size it always was) or "touch" (48px targets, for shop-floor tablets).
     * Opt-in: it does not follow data-density, so setting that on a page moves
     * nothing here. An explicit size prop wins over it.
     */
    density?: Density;
    className?: string;
}
import { type Density } from "../../_core/density";
export declare const Gantt: ({ tasks, dependencies, showDependencies, defaultView, view: viewProp, onViewChange, views, defaultDate, date: dateProp, onDateChange, expanded: expandedProp, defaultExpanded, onExpandedChange, onTaskClick, now: nowProp, calendar, hourStep, columnWidth, hideToolbar, columns: paneColumnsProp, loading, loadingRows, emptyState, rowHeight: rowHeightProp, maxBodyHeight, headerClassName, headerGroups: headerGroupsProp, continuous, density, rowClassName, barClassName, barAccent, actualLayout, deriveFromActuals, actualBarClassName, actualBarColor, barLabel, actualBarLabel, progressOn, statusColor, legend, monthColumns, dependencyStyle, className, }: GanttProps) => React.JSX.Element;
//# sourceMappingURL=gantt.d.ts.map