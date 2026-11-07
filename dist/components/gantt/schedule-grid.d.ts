import * as React from "react";
import { type GanttConnector, type GanttCalendar, type GanttView, type PlanningColumn, type PlanningRange } from "../../_core/index";
/**
 * ScheduleGrid — the chrome every schedule chart needs, and none of what any
 * particular one MEANS.
 *
 * This is the shared renderer behind `Gantt`, extracted so a second schedule
 * component can be built without a second copy of it. It is internal: nothing
 * here is exported from the package index, so its shape can change without a
 * major version.
 *
 * The split is by whether a thing depends on what a row IS. It does not:
 *
 *  - the axis — range, columns, per-column widths, the now marker, and the
 *    six views including `fit`, whose range comes from data the caller supplies;
 *  - the frozen pane — which columns survive the container width, and the
 *    sticky, scroll-locked geometry that holds them;
 *  - row windowing, and the spacers that keep the scrollbar honest;
 *  - the connector overlay, drawn whole rather than windowed;
 *  - the treegrid: roving tabindex, arrow-key navigation, expand/collapse,
 *    focus that survives a row unmounting under it;
 *  - the toolbar.
 *
 * What the caller brings is a list of rows, a `render` per pane column, and a
 * `renderTrack` for whatever goes on the axis — one bar for a project task, a
 * whole sequence of operations for a work centre. Neither shape is privileged
 * here.
 *
 * THE SPLIT IS NOT ARBITRARY. Everything above is a thing that was got wrong
 * once and pinned: bars land on gridlines only because widths come from each
 * column's own duration; the pane sheds a column only when shedding achieves a
 * fit; focus survives a windowed row unmounting only because the new scroll
 * position is pushed into state in the same commit. A second component
 * re-deriving any of that would re-derive the bugs with it.
 */
/**
 * Default pixel height of a row.
 *
 * A chart may raise it — a resource row holding three lanes of operations needs
 * more than a task row holding one bar — but every row in ONE chart is the same
 * height, and that is not negotiable: `ganttRowWindow` is arithmetic rather than
 * measurement, and `ganttConnectors` places an endpoint at
 * `rowIndex * rowHeight + rowHeight / 2`. Rows that varied would need a
 * measured offset table, and both of those would have to read it.
 */
export declare const ROW_PX = 36;
export declare const HEADER_PX = 44;
/** Indent per level of hierarchy, applied by the caller inside its first column. */
export declare const INDENT_PX = 14;
export declare const ALL_VIEWS: GanttView[];
/**
 * The minimum the chrome needs to know about a row. Everything else about it
 * reaches this module only through a column's `render`, which is the point.
 */
export interface ScheduleRowShape {
    /** Position in the visible list. This is the row's y coordinate. */
    index: number;
    /** 0 for a root. Drives `aria-level`; the visual indent is the caller's. */
    depth: number;
    hasChildren: boolean;
    expanded: boolean;
}
/** One column of the frozen pane. */
export interface ScheduleColumn<R> {
    key: string;
    /** Heading text, and what a screen reader calls the column. */
    label: string;
    /** Fixed, because a sticky pane cannot be sized by its content. */
    width: number;
    /**
     * Its place in the FULL column set, 1-based — not its place among the columns
     * that survived. `aria-colindex` names a column's position in the whole table,
     * which is exactly what lets a partially rendered row be announced correctly.
     */
    colIndex: number;
    render: (row: R) => React.ReactNode;
    /** Overrides the cell's accessible name, where the content cannot carry it. */
    ariaLabel?: (row: R) => string | undefined;
    /** Extra classes on the cell. Padding differs between a name column and the rest. */
    className?: string;
    /** Per-row inline style, for an indent that depends on depth. */
    style?: (row: R) => React.CSSProperties | undefined;
}
export interface ScheduleGridProps<R extends ScheduleRowShape> {
    rows: R[];
    /** Stable across renders, and the React key. */
    rowId: (row: R) => string;
    /**
     * The pane's columns, in PREFERENCE order: what is listed last is the first
     * to go when the container cannot hold both the pane and a usable axis. The
     * first is never dropped.
     */
    columns: ScheduleColumn<R>[];
    /** How many columns the table has in total, including the timeline. */
    colCount: number;
    /** `aria-colindex` for the timeline column. */
    timelineColIndex: number;
    /** What goes on the axis for this row — one bar, or a whole sequence. */
    renderTrack: (row: R, axisWidth: number) => React.ReactNode;
    /**
     * Uniform height for every row, defaulting to ROW_PX. Raise it for a chart
     * whose rows hold more than one bar; see ROW_PX for why it cannot vary
     * between rows.
     */
    rowHeight?: number;
    /**
     * A strip under the rows, aligned to the axis and stuck to the bottom of the
     * scroller — a load histogram, a capacity trace, a shift band.
     *
     * Outside the `treegrid` element rather than inside it, deliberately: a div
     * that is not a `row` inside a grid is invalid ARIA, and a fake row would be
     * counted by `aria-rowcount` and announced as data.
     */
    renderFooter?: (context: {
        columns: PlanningColumn[];
        columnWidths: number[];
        axisWidth: number;
        paneWidth: number;
    }) => React.ReactNode;
    view: GanttView;
    anchor: Date;
    now: Date;
    connectors?: GanttConnector[];
    /**
     * Which connectors are drawn as a problem rather than as a fact.
     *
     * The grid does not know what makes a link wrong — a Gantt dependency has no
     * notion of one, and a production routing's lag lives in a different module —
     * so the caller decides and this only draws it.
     */
    connectorAccent?: (connector: GanttConnector) => boolean;
    views?: GanttView[];
    hideToolbar?: boolean;
    onViewChange: (view: GanttView) => void;
    onDateChange: (date: Date) => void;
    onToggle: (row: R) => void;
    onActivate?: (row: R) => void;
    ariaLabel: string;
    className?: string;
}
/**
 * Everything the axis resolves to, and what the pane could afford after it.
 *
 * Exported because the caller needs `range` and `axisWidth` to place its own
 * bars, and needs them BEFORE it renders — a second pass measuring the DOM is
 * how two sources of truth for the same geometry get created.
 */
export interface ScheduleAxis {
    range: PlanningRange;
    columns: PlanningColumn[];
    columnWidths: number[];
    axisWidth: number;
    paneWidth: number;
    isFit: boolean;
    /** Milliseconds worth roughly one pixel — what a split-bar gap is judged against. */
    minGapMs: number;
}
/**
 * Resolve the axis and the pane together, in the one order that works.
 *
 * The chain has a real dependency in it and it is easy to get backwards: the
 * pane sheds against what the axis WANTS, and then a fit axis spends whatever
 * the pane left over. Doing it the other way round — pane first at a fixed
 * minimum — is the version that left a year axis at 1292px keeping all four
 * columns and scrolling anyway.
 *
 * The caller runs this itself rather than reading it back out of the grid,
 * because it needs `range` and `axisWidth` to place bars in the same render.
 */
export declare function useScheduleAxis(options: {
    view: GanttView;
    anchor: Date;
    fitRange: PlanningRange | null;
    now: Date;
    calendar?: GanttCalendar;
    hourStep?: number;
    columnWidth?: number;
    paneColumns: readonly {
        key: string;
        width: number;
    }[];
    /** The scroller's measured `clientWidth`, or 0 before it has been measured. */
    available: number;
}): ScheduleAxis & {
    paneKeys: string[];
};
/**
 * The scroller's measurements, and the callback that refreshes them.
 *
 * Layout, not passive: the pane's columns and the fit axis's width are both
 * computed FROM this, so reading it after paint would draw a four-column pane
 * and a floor-width axis for one frame and then replace them.
 */
export declare function useScrollerMetrics(ref: React.RefObject<HTMLDivElement | null>): {
    metrics: {
        top: number;
        height: number;
        width: number;
    };
    setMetrics: React.Dispatch<React.SetStateAction<{
        top: number;
        height: number;
        width: number;
    }>>;
    measure: () => void;
};
export declare function ScheduleGrid<R extends ScheduleRowShape>({ rows, rowId, columns: paneColumns, colCount, timelineColIndex, renderTrack, rowHeight, renderFooter, view, anchor, now, connectors, connectorAccent, views, hideToolbar, onViewChange, onDateChange, onToggle, onActivate, ariaLabel, className, scrollerRef, axis, metrics, setMetrics, }: ScheduleGridProps<R> & {
    /** Owned by the caller, because the caller measures it to resolve the axis. */
    scrollerRef: React.RefObject<HTMLDivElement | null>;
    axis: ScheduleAxis & {
        paneKeys: string[];
    };
    metrics: {
        top: number;
        height: number;
        width: number;
    };
    setMetrics: React.Dispatch<React.SetStateAction<{
        top: number;
        height: number;
        width: number;
    }>>;
}): React.JSX.Element;
//# sourceMappingURL=schedule-grid.d.ts.map