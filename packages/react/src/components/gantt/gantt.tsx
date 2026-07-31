import * as React from "react";
import {
  flattenGanttTasks,
  formatGanttVariance,
  ganttConnectors,
  ganttFitRange,
  placeAppointment,
  type GanttBarAnchor,
  type GanttCalendar,
  type GanttDependency,
  type GanttPaneColumn,
  type GanttRow,
  type GanttTaskNode,
  type GanttTaskStatus,
  type GanttView,
  type PlanningPlacement,
  type PlanningRange,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "../empty-state/empty-state";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip/tooltip";
import {
  INDENT_PX,
  ROW_PX,
  ScheduleGrid,
  useScheduleAxis,
  useScrollerMetrics,
  type ScheduleColumn,
} from "./schedule-grid";

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

const BAR_PX = 18;
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — which is the y the connector routes are computed at. */
const BAR_TOP = (ROW_PX - BAR_PX) / 2;

/**
 * The frozen pane's columns. Fixed widths, because a sticky pane cannot be
 * sized by its content without moving as you scroll.
 *
 * Trimmed from 188/104/96/80 — 468px, which left a year axis needing ~1430px in
 * total and scrolling at any normal page width. The pane sheds columns from the
 * end when even 436 will not fit; see `columns` and `ganttPaneColumns`.
 */
const PANE_PX: Record<GanttPaneColumn, number> = {
  name: 180,
  /* Three xs avatars at "loose" spacing plus a "+N" chip is 84px, and the cell
     costs 16px of padding either side of it. */
  assignees: 96,
  status: 88,
  variance: 72,
};

const PANE_LABEL: Record<GanttPaneColumn, string> = {
  name: "Task",
  assignees: "Assignees",
  status: "Status",
  variance: "Variance",
};

/**
 * Each pane column's place in the FULL set — fixed, not renumbered when one is
 * dropped. `aria-colindex` names a column's place in the whole table, which is
 * exactly what lets a partially rendered row be announced correctly, and
 * `aria-colcount` stays 5 for the same reason.
 */
const COL_INDEX: Record<GanttPaneColumn | "timeline", number> = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5,
};

const DEFAULT_PANE: GanttPaneColumn[] = ["name", "assignees", "status", "variance"];

/** How many avatars before the group collapses to "+N". */
const AVATAR_MAX = 3;

/**
 * Where the percent label goes, in the two places the obvious answer fails.
 *
 * Under ~44px of bar there is no room for "100%" at all and it clips to "10",
 * so the label moves out beside the bar. Past ~85% done the fill has reached
 * the inline end, so a label sitting there would be solid-on-solid — it moves
 * to the inline START instead, onto the fill, in the fill's own foreground
 * colour. Putting it outside in that case is what the first version did, and
 * it landed exactly where a finish-to-start connector leaves the bar.
 */
const LABEL_MIN_PX = 44;
const LABEL_MAX_PCT = 85;
/**
 * Room an outside label needs after the bar before it is put in front of it
 * instead.
 *
 * Without this a task finishing at the end of the range draws its label PAST
 * the axis, which widens the scroller and makes the chart scroll sideways to
 * reveal two characters of grey text. Measured: 26px of overhang on the year
 * view, which is a horizontal scrollbar on a chart that otherwise fits.
 */
const LABEL_OUTSIDE_PX = 30;

const BAR_CLASS: Record<GanttTaskStatus, string> = {
  "not-started": "zen-bg-zen-muted zen-border-zen-border",
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info/40",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error/40",
  complete: "zen-bg-zen-success-soft zen-border-zen-success/40",
};

const FILL_CLASS: Record<GanttTaskStatus, string> = {
  "not-started": "zen-bg-zen-neutral/30",
  "on-track": "zen-bg-zen-info",
  delayed: "zen-bg-zen-error",
  complete: "zen-bg-zen-success",
};

/** Readable ON the fill, for the label that sits over it past LABEL_MAX_PCT. */
const FILL_TEXT_CLASS: Record<GanttTaskStatus, string> = {
  "not-started": "zen-text-zen-foreground",
  "on-track": "zen-text-zen-info-fg",
  delayed: "zen-text-zen-error-fg",
  complete: "zen-text-zen-success-fg",
};

const STATUS_COLOR: Record<GanttTaskStatus, "neutral" | "info" | "error" | "success"> = {
  "not-started": "neutral",
  "on-track": "info",
  delayed: "error",
  complete: "success",
};

const STATUS_LABEL: Record<GanttTaskStatus, string> = {
  "not-started": "Not started",
  "on-track": "On track",
  delayed: "Delayed",
  complete: "Complete",
};

const initialsOf = (assignee: GanttAssignee): string =>
  assignee.initials ??
  assignee.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

/** Every parent's id, for the "everything is open" default. */
const parentIds = (tasks: GanttTask[]): string[] => {
  const out: string[] = [];
  const walk = (list: GanttTask[]) => {
    for (const task of list) {
      if (task.children && task.children.length > 0) {
        out.push(task.id);
        walk(task.children);
      }
    }
  };
  walk(tasks);
  return out;
};

const formatDay = (d: Date): string =>
  `${d.getDate()} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;

type Row = GanttRow<GanttTask>;

export const Gantt = ({
  tasks,
  dependencies,
  showDependencies = true,
  defaultView,
  view: viewProp,
  onViewChange,
  views,
  defaultDate,
  date: dateProp,
  onDateChange,
  expanded: expandedProp,
  defaultExpanded,
  onExpandedChange,
  onTaskClick,
  now: nowProp,
  calendar,
  hourStep,
  columnWidth,
  hideToolbar,
  columns: paneColumnsProp,
  loading,
  loadingRows = 6,
  emptyState,
  className,
}: GanttProps) => {
  /* Fit, not month, and certainly not week. A seven-day window is right for a
     calendar and wrong for a plan; a month is right for a plan that fits in one
     and wrong for the majority that do not. Fit is the only default that is
     never trivially wrong, because it is the only one derived from the data
     rather than from today's date. */
  const [innerView, setInnerView] = React.useState<GanttView>(defaultView ?? "fit");
  const [innerDate, setInnerDate] = React.useState<Date>(defaultDate ?? new Date());
  /* null is not "nothing open", it is "no answer given" — the default, which is
     everything open. Storing the resolved list instead would freeze the answer
     at mount and silently leave later-arriving tasks collapsed. */
  const [innerExpanded, setInnerExpanded] = React.useState<string[] | null>(defaultExpanded ?? null);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const { metrics, setMetrics } = useScrollerMetrics(scrollerRef);

  const view = viewProp ?? innerView;
  const anchor = dateProp ?? innerDate;
  /* Read once per MOUNT, not per render. Two `new Date()`s in one render can
     straddle a millisecond and leave the marker and the today column
     disagreeing — but a fresh one per render is worse now that scrolling
     re-renders: `now` feeds the row flattening (a task is "delayed" against
     it), so a new value every frame invalidates the memo below and re-derives
     10,000 rows per scroll tick. Pass `now` to control it. */
  const nowFallback = React.useRef<Date>(null);
  if (nowFallback.current === null) nowFallback.current = new Date();
  const now = nowProp ?? nowFallback.current;
  const nowTime = now.getTime();
  const anchorTime = anchor.getTime();

  const setDate = (next: Date) => {
    if (dateProp === undefined) setInnerDate(next);
    onDateChange?.(next);
  };

  const expandedIds = expandedProp ?? innerExpanded;
  const expandedSet = React.useMemo(
    () => (expandedIds === null ? null : new Set(expandedIds)),
    [expandedIds],
  );
  const toggle = (id: string) => {
    const base = expandedIds ?? parentIds(tasks);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    if (expandedProp === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
  };

  /* Null when not fitting, and ALSO null when fitting a plan in which nothing
     has dates yet. Both fall through to the anchored month, so the axis and the
     toolbar still make sense while the dates are being filled in. */
  const fitRange = React.useMemo(
    () => (view === "fit" ? ganttFitRange(tasks ?? [], { calendar }) : null),
    [view, tasks, calendar],
  );

  /* The pane's columns are DATA, which is what lets the grid underneath know
     nothing about tasks — and what a second schedule component will hand it a
     different list of. */
  const requestedPane = paneColumnsProp ?? DEFAULT_PANE;
  const paneColumns = React.useMemo<ScheduleColumn<Row>[]>(
    () =>
      requestedPane.map((key) => ({
        key,
        label: PANE_LABEL[key],
        width: PANE_PX[key],
        colIndex: COL_INDEX[key],
        className: key === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
        style: key === "name" ? (row: Row) => ({ paddingInlineStart: 8 + row.depth * INDENT_PX }) : undefined,
        /* The avatars are decorative and the "+N" chip hides names outright, so
           the cell says who — the tooltip is the pointer's version of it. */
        ariaLabel:
          key === "assignees"
            ? (row: Row) =>
                row.task.assignees && row.task.assignees.length > 0
                  ? row.task.assignees.map((a) => a.name).join(", ")
                  : undefined
            : undefined,
        render: (row: Row) => <GanttPaneCell column={key} row={row} onToggle={toggle} />,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedPane.join(","), expandedIds, tasks],
  );

  const axis = useScheduleAxis({
    view,
    anchor,
    fitRange,
    now,
    calendar,
    hourStep,
    columnWidth,
    paneColumns,
    available: metrics.width,
  });
  const { range, axisWidth, minGapMs } = axis;

  const { rows, rowIndexById } = React.useMemo(
    () =>
      flattenGanttTasks<GanttTask>(
        tasks ?? [],
        (task) => (expandedSet === null ? true : expandedSet.has(task.id)),
        now,
        { calendar, minGapMs },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, expandedSet, nowTime, calendar, minGapMs],
  );

  /** One placement per row, and the same placements keyed by every task id —
   *  including ids folded into a collapsed parent, which is what keeps their
   *  dependency arrows pointing at the summary bar instead of vanishing. */
  const placements = React.useMemo(() => {
    const map = new Map<number, PlanningPlacement>();
    for (const row of rows) {
      if (!row.span) continue;
      const placement = placeAppointment(row.span, range);
      if (placement) map.set(row.index, placement);
    }
    return map;
  }, [rows, range]);

  const connectors = React.useMemo(() => {
    if (!showDependencies || !dependencies || dependencies.length === 0) return [];
    const anchors = new Map<string, GanttBarAnchor>();
    for (const [id, index] of rowIndexById) {
      const placement = placements.get(index);
      if (placement) {
        anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
      }
    }
    return ganttConnectors(anchors, dependencies, { axisWidth, rowHeight: ROW_PX });
  }, [showDependencies, dependencies, rowIndexById, placements, axisWidth]);

  const setView = (next: GanttView) => {
    /* Leaving fit re-anchors, when the anchor is nowhere near the plan.
       Otherwise the obvious gesture — open on fit, click Month to zoom in —
       lands on today's month, which for a plan that runs next spring is an
       empty axis and reads as the data having vanished. `now` where the plan is
       running, the plan's start where it is not. */
    if (view === "fit" && next !== "fit" && fitRange) {
      const from = fitRange.start.getTime();
      const to = fitRange.end.getTime();
      if (anchorTime < from || anchorTime >= to) {
        setDate(nowTime >= from && nowTime < to ? now : fitRange.start);
      }
    }
    if (viewProp === undefined) setInnerView(next);
    onViewChange?.(next);
  };

  const renderTrack = React.useCallback(
    (row: Row, width: number) => (
      <GanttTrack
        row={row}
        range={range}
        axisWidth={width}
        placement={placements.get(row.index) ?? null}
        onTaskClick={onTaskClick}
      />
    ),
    [range, placements, onTaskClick],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
          className,
        )}
        role="status"
        aria-label="Loading schedule"
      >
        {Array.from({ length: loadingRows }, (_, i) => (
          <div key={i} className="zen-flex zen-items-center zen-gap-3">
            <Skeleton className="zen-h-4" style={{ width: PANE_PX.name - 24 - (i % 3) * INDENT_PX }} />
            <Skeleton className="zen-h-4 zen-w-16" />
            <Skeleton
              className="zen-h-4"
              /* Staggered so the placeholder reads as a schedule rather than as
                 a table — the shape is the information here. */
              style={{ marginInlineStart: `${(i * 37) % 45}%`, width: `${20 + ((i * 13) % 30)}%` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={cn("zen-w-full", className)}>
        {emptyState ?? (
          <EmptyState bordered>
            <EmptyStateIcon>
              <Icon name="calendar" size={22} />
            </EmptyStateIcon>
            <EmptyStateTitle>Nothing scheduled</EmptyStateTitle>
            <EmptyStateDescription>
              Add a task with a start and an end date and it will appear on the timeline.
            </EmptyStateDescription>
          </EmptyState>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <ScheduleGrid<Row>
        rows={rows}
        rowId={(row) => row.task.id}
        columns={paneColumns}
        colCount={5}
        timelineColIndex={COL_INDEX.timeline}
        renderTrack={renderTrack}
        view={view}
        anchor={anchor}
        now={now}
        connectors={connectors}
        views={views}
        hideToolbar={hideToolbar}
        onViewChange={setView}
        onDateChange={setDate}
        onToggle={(row) => toggle(row.task.id)}
        onActivate={(row) => onTaskClick?.(row.task, row)}
        ariaLabel="Project schedule"
        className={className}
        scrollerRef={scrollerRef}
        axis={axis}
        metrics={metrics}
        setMetrics={setMetrics}
      />
    </TooltipProvider>
  );
};

/** What each of the four pane columns actually draws. */
const GanttPaneCell = ({
  column,
  row,
  onToggle,
}: {
  column: GanttPaneColumn;
  row: Row;
  onToggle: (id: string) => void;
}) => {
  const { task } = row;

  if (column === "name") {
    return (
      <>
        {row.hasChildren ? (
          <button
            type="button"
            /* Out of the tab order, in the grid's: the chevron is reached by
               arrowing to the first column and pressing the forward arrow, not
               by a tab stop per parent. */
            tabIndex={-1}
            onClick={() => onToggle(task.id)}
            aria-label={row.expanded ? `Collapse ${task.name}` : `Expand ${task.name}`}
            className="zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
          >
            <Icon
              name={row.expanded ? "chevron-down" : "chevron-right"}
              size={14}
              className={row.expanded ? undefined : "rtl:zen-rotate-180"}
            />
          </button>
        ) : (
          /* A spacer, not a hidden chevron: leaves must line up with their
             siblings' text, or every leaf reads as one level shallower. */
          <span aria-hidden="true" className="zen-h-5 zen-w-5 zen-shrink-0" />
        )}
        <span className="zen-min-w-0">
          <span
            className={cn(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              row.hasChildren && "zen-font-semibold",
            )}
            title={task.name}
          >
            {task.name}
          </span>
          {task.subtitle && (
            <span className="zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg">
              {task.subtitle}
            </span>
          )}
        </span>
      </>
    );
  }

  if (column === "assignees") return <GanttAssignees assignees={task.assignees} />;

  if (column === "status") {
    return (
      <Badge variant="soft" color={STATUS_COLOR[row.status]} className="zen-truncate">
        {task.statusLabel ?? STATUS_LABEL[row.status]}
      </Badge>
    );
  }

  const varianceText = formatGanttVariance(row.variance);
  if (!varianceText) return null;
  return (
    <Badge
      /* "+2d" is a signed number, and bidi reorders a leading sign to the far
         side in an RTL run — it renders as "2d+". */
      dir="ltr"
      variant="soft"
      color={row.variance === null || row.variance === 0 ? "neutral" : row.variance > 0 ? "error" : "success"}
    >
      {varianceText}
    </Badge>
  );
};

/** The bar on the axis: one per row, broken into pieces where work stops. */
const GanttTrack = ({
  row,
  range,
  axisWidth,
  placement,
  onTaskClick,
}: {
  row: Row;
  range: PlanningRange;
  axisWidth: number;
  placement: PlanningPlacement | null;
  onTaskClick?: (task: GanttTask, row: Row) => void;
}) => {
  const { task } = row;
  const progress = row.progress ?? 0;
  const widthPx = placement ? (placement.widthPct / 100) * axisWidth : 0;
  const labelOutside = widthPx < LABEL_MIN_PX;
  const labelOnFill = !labelOutside && progress >= LABEL_MAX_PCT;
  /* Which SIDE the outside label goes. After the bar normally; before it when
     the bar ends against the edge of the axis and there is nowhere after. */
  const endPct = placement ? placement.startPct + placement.widthPct : 0;
  const labelBefore = ((100 - endPct) / 100) * axisWidth < LABEL_OUTSIDE_PX;

  /**
   * The bar's working stretches, as percentages OF THE BAR, with the progress
   * fill handed out along them.
   *
   * The fill is distributed by working duration rather than given to each piece
   * equally or drawn as one overlay: 40% complete on a job that runs an hour on
   * Friday and seven on Monday means the Friday piece is full and the Monday one
   * has barely started, not that both are 40% shaded. Percentages of the bar,
   * not of the axis, so the pieces move with the bar and need no second
   * placement pass.
   */
  const pieces = React.useMemo(() => {
    if (!row.segments || !row.span) return null;
    /* Percentages of the VISIBLE bar, not of the whole span. `placeAppointment`
       clips a bar to the range, so the button is only the part in view — and
       measuring the pieces against the full span would squash and shift every
       one of them the moment a job started before the range. That is invisible
       until you look at a bar that spans the left edge. */
    const from = Math.max(row.span.start.getTime(), range.start.getTime());
    const to = Math.min(row.span.end.getTime(), range.end.getTime());
    const total = to - from;
    if (total <= 0) return null;

    /* The fill is handed out over the segments the WHOLE job is worked in, not
       just the visible ones, or a job half-done off-screen would look untouched
       where you can see it. */
    const allDurations = row.segments.map((seg) => seg.end.getTime() - seg.start.getTime());
    const workingTotal = allDurations.reduce((a, b) => a + b, 0);
    let remaining = (workingTotal * progress) / 100;

    const out: Array<{ key: number; startPct: number; widthPct: number; fillPct: number }> = [];
    row.segments.forEach((seg, i) => {
      const done = Math.max(0, Math.min(remaining, allDurations[i]));
      remaining -= done;

      const segStart = Math.max(seg.start.getTime(), from);
      const segEnd = Math.min(seg.end.getTime(), to);
      if (segEnd <= segStart) return;
      const visible = segEnd - segStart;
      /* `done` counts filled milliseconds from the segment's own start, so a
         segment cut by the left edge shows only the part of its fill in view. */
      const fillVisible = Math.max(0, Math.min(done - (segStart - seg.start.getTime()), visible));
      out.push({
        key: segStart,
        startPct: ((segStart - from) / total) * 100,
        widthPct: (visible / total) * 100,
        fillPct: visible > 0 ? (fillVisible / visible) * 100 : 0,
      });
    });
    return out.length > 0 ? out : null;
  }, [row.segments, row.span, progress, range]);

  /* An empty gridcell is announced as "blank", which is correct for a cell with
     no data and wrong for THIS one: the reader arrowed to the timeline
     expecting a bar, and "blank" does not distinguish "no dates" from "starts
     after the range you are looking at". */
  if (!placement)
    return (
      <span className="zen-sr-only">
        {row.span ? "Not scheduled in this range" : "No dates"}
      </span>
    );

  return (
    <>
      <button
        type="button"
        onClick={() => onTaskClick?.(task, row)}
        /* Reachable, not tabbable. The timeline CELL carries the tab stop;
           the bar is what the keyboard scrolls into view once it does — see
           `data-gantt-bar`, which is how the focus effect finds it. A
           button rather than a div so a pointer user still gets a real
           control, and so the accessible name below has somewhere to live. */
        tabIndex={-1}
        data-gantt-bar=""
        className={cn(
          "zen-absolute zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          /* Drawn as pieces, the button is only the hit area and the focus
             ring — the skin moves onto each piece, or the gaps would be
             filled by the button's own background. */
          pieces === null && cn("zen-overflow-hidden zen-border", BAR_CLASS[row.status]),
          /* Square off a cut edge so a bar continuing past the view does
             not look like it ends there. */
          pieces === null && placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
          pieces === null && placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          onTaskClick && "hover:zen-brightness-95",
        )}
        style={{
          insetInlineStart: `${placement.startPct}%`,
          width: `${placement.widthPct}%`,
          top: BAR_TOP,
          height: BAR_PX,
        }}
        title={`${task.name} · ${formatDay(row.span!.start)} – ${formatDay(row.span!.end)}${
          row.progress === null ? "" : ` · ${Math.round(progress)}%`
        }`}
      >
        <span className="zen-sr-only">
          {`${formatDay(row.span!.start)} to ${formatDay(row.span!.end)}, ${STATUS_LABEL[row.status]}${
            row.progress === null ? "" : `, ${Math.round(progress)} percent complete`
          }`}
        </span>
        {/* The bar broken at the gaps where no work happens. The pieces sit
            INSIDE one button rather than being buttons themselves: the job
            is one thing to click, one thing to focus and one accessible
            name, however many stretches it is worked in. The gaps are left
            genuinely transparent so the shaded non-working column shows
            through — which is what makes the break read as "the plant is
            shut" rather than as a rendering fault. */}
        {pieces !== null &&
          pieces.map((piece) => (
            <span
              key={piece.key}
              aria-hidden="true"
              className={cn("zen-absolute zen-inset-y-0 zen-overflow-hidden", BAR_CLASS[row.status], "zen-rounded-zen-sm zen-border")}
              style={{ insetInlineStart: `${piece.startPct}%`, width: `${piece.widthPct}%` }}
            >
              {row.progress !== null && piece.fillPct > 0 && (
                <span
                  className={cn("zen-absolute zen-inset-y-0 zen-start-0", FILL_CLASS[row.status])}
                  style={{ width: `${piece.fillPct}%` }}
                />
              )}
            </span>
          ))}
        {pieces === null && row.progress !== null && (
          <span
            aria-hidden="true"
            className={cn("zen-absolute zen-inset-y-0 zen-start-0", FILL_CLASS[row.status])}
            style={{ width: `${progress}%` }}
          />
        )}
        {row.progress !== null && !labelOutside && (
          <span
            aria-hidden="true"
            className={cn(
              "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-text-[10px] zen-font-medium",
              labelOnFill
                ? cn("zen-start-1", FILL_TEXT_CLASS[row.status])
                : "zen-end-1 zen-text-zen-foreground",
            )}
          >
            {Math.round(progress)}%
          </span>
        )}
      </button>

      {row.progress !== null && labelOutside && (
        <span
          aria-hidden="true"
          className="zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg"
          style={{
            ...(labelBefore
              ? { insetInlineEnd: `calc(${100 - placement.startPct}% + 4px)` }
              : { insetInlineStart: `calc(${endPct}% + 4px)` }),
            top: BAR_TOP,
            height: BAR_PX,
          }}
        >
          {Math.round(progress)}%
        </span>
      )}
    </>
  );
};

const GanttAssignees = ({ assignees }: { assignees?: GanttAssignee[] }) => {
  if (!assignees || assignees.length === 0) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Not a tab stop of its own — the grid is one — but the full list is
            still reachable without a pointer: the cell carries it as its
            accessible name, so arrowing onto the column reads every name even
            though the "+N" chip only draws three. */}
        <span aria-hidden="true" className="zen-rounded-zen-full">
          {/* "loose" is -4px: at xs an avatar is 24px, and the default -8px
              hides a third of each initial pair behind the next one. */}
          <AvatarGroup max={AVATAR_MAX} size="xs" spacing="loose">
            {assignees.map((assignee) => (
              <Avatar key={assignee.id} size="xs">
                {assignee.src && <AvatarImage src={assignee.src} alt={assignee.name} />}
                <AvatarFallback>{initialsOf(assignee)}</AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </span>
      </TooltipTrigger>
      <TooltipContent>{assignees.map((a) => a.name).join(", ")}</TooltipContent>
    </Tooltip>
  );
};
