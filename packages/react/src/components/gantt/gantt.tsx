import * as React from "react";
import {
  flattenGanttTasks,
  formatGanttVariance,
  ganttColumns,
  ganttColumnWidths,
  ganttConnectors,
  ganttRange,
  ganttRangeLabel,
  ganttRowWindow,
  nowPct,
  placeAppointment,
  shiftGanttAnchor,
  type GanttBarAnchor,
  type GanttCalendar,
  type GanttDependency,
  type GanttRow,
  type GanttTaskNode,
  type GanttTaskStatus,
  type GanttView,
  type PlanningColumn,
  type PlanningPlacement,
  type PlanningRange,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "../empty-state/empty-state";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip/tooltip";

/**
 * Gantt — what the project is doing, and what is waiting on what.
 *
 *   <Gantt tasks={plan} dependencies={links} />
 *
 * Two panes over one clock. On the left a task tree that collapses; on the
 * right the same rows as bars on a shared time axis, with dependency arrows
 * between them. They are ONE scroller, not two: the left pane is stuck to the
 * inline start and the header to the top, so vertical scrolling can never take
 * a row's name away from its bar. Two panes scrolled in sync by JavaScript is
 * the version that drifts by a row the first time a scrollbar appears.
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
 * Rows ARE windowed, always, at every size — only the screenful under the
 * viewport is in the DOM (`ganttRowWindow` in core, which is arithmetic rather
 * than measurement because rows are a fixed height). Measured: 10,000 rows
 * mount ~26 of them.
 *
 * The connector overlay is deliberately NOT windowed. It is one SVG spanning
 * every row, sitting beside the row list rather than inside it, so the routes
 * survive their endpoints unmounting — a link between two off-screen tasks
 * still draws its elbow through the visible band, which is exactly when you
 * need to see it. `ganttConnectors` is pure maths and cheap next to DOM, so
 * computing all of them and mounting none of the rows is the right trade.
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

  /** Uncontrolled starting view. Default "month". */
  defaultView?: GanttView;
  /** Controlled view; pair with `onViewChange`. */
  view?: GanttView;
  onViewChange?: (view: GanttView) => void;
  /** Which views the switcher offers. Default all five. */
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
   * quarter and year views columns differ in length (a 28-day February is
   * narrower than a 31-day January), so this sets the average rather than the
   * literal width. Defaults to something readable per view.
   */
  columnWidth?: number;
  /** Hide the toolbar when your page already has one. */
  hideToolbar?: boolean;

  /** Show skeleton rows instead of the chart. */
  loading?: boolean;
  /** How many skeleton rows. Default 6. */
  loadingRows?: number;
  /** Replaces the whole no-tasks surface. */
  emptyState?: React.ReactNode;

  className?: string;
}

const VIEW_LABEL: Record<GanttView, string> = {
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};
const ALL_VIEWS: GanttView[] = ["day", "week", "month", "quarter", "year"];

/**
 * NOMINAL column width per view — the axis is `columns.length × this`, and each
 * column then takes its own share of that by duration (`ganttColumnWidths`).
 * For day, week and month every column is the same length, so this is also the
 * literal width; for quarter and year it is the average.
 *
 * One number cannot serve all five. A week is 7 columns and can afford to be
 * wide; a month is 31 and cannot, or every plan opens scrolled halfway off its
 * own axis. Quarter is ~14 weeks and year is 12 months, both of which want the
 * whole span to fit a normal screen — that is the entire point of having them.
 */
const COLUMN_PX: Record<GanttView, number> = {
  day: 56,
  week: 128,
  month: 44,
  /* Sized to FIT, not to breathe: a year you have to scroll sideways to reach
     December in is not showing you the year, which is the only reason the view
     exists. 14 × 72 and 12 × 80 both land near 1000px — inside a normal content
     column — and "13 Jul" and "Sep" are comfortable at those widths. */
  quarter: 72,
  year: 80,
};

const ROW_PX = 36;
const BAR_PX = 18;
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — which is the y the connector routes are computed at. */
const BAR_TOP = (ROW_PX - BAR_PX) / 2;
const HEADER_PX = 44;

/** The frozen pane, and the columns inside it. Fixed, because a sticky pane
 *  cannot be sized by its content without moving as you scroll. */
const NAME_PX = 188;
const ASSIGNEES_PX = 104;
const STATUS_PX = 96;
const VARIANCE_PX = 80;
const LEFT_PX = NAME_PX + ASSIGNEES_PX + STATUS_PX + VARIANCE_PX;

/** Indent per level of hierarchy. */
const INDENT_PX = 14;

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

/** Half-height of the connector arrowhead, in the axis's pixel space. */
const ARROW_PX = 5;

/** Matches `zen-max-h-[32rem]` on the scroller — 32rem at the 16px root. Used
 *  only to seed the window before the element has been measured. */
const SCROLLER_MAX_PX = 512;

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
  loading,
  loadingRows = 6,
  emptyState,
  className,
}: GanttProps) => {
  /* Month, not week. A seven-day window is the right default for a calendar and
     the wrong one for a plan: most projects run for months, so `week` opened on
     an axis where every phase but one was off-screen. */
  const [innerView, setInnerView] = React.useState<GanttView>(defaultView ?? "month");
  const [innerDate, setInnerDate] = React.useState<Date>(defaultDate ?? new Date());
  /* null is not "nothing open", it is "no answer given" — the default, which is
     everything open. Storing the resolved list instead would freeze the answer
     at mount and silently leave later-arriving tasks collapsed. */
  const [innerExpanded, setInnerExpanded] = React.useState<string[] | null>(defaultExpanded ?? null);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  /* Seeded with the scroller's own max height rather than 0. At 0 the first
     paint mounts only the overscan and then visibly fills in a frame later;
     seeding it means the first paint is already the right screenful. */
  const [scroll, setScroll] = React.useState({ top: 0, height: SCROLLER_MAX_PX });

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    /* Coalesced into one frame. A wheel gesture fires scroll far faster than
       React can render, and setState per event turns a smooth scroll into a
       queue of renders that arrive after the user has stopped. */
    let frame = 0;
    const read = () => {
      frame = 0;
      setScroll((prev) =>
        prev.top === el.scrollTop && prev.height === el.clientHeight
          ? prev
          : { top: el.scrollTop, height: el.clientHeight },
      );
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };
    read();
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(el);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

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

  const setView = (next: GanttView) => {
    if (viewProp === undefined) setInnerView(next);
    onViewChange?.(next);
  };
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

  /* Everything below is memoized on the values it actually depends on, and none
     of those is the scroll position. Without this, scrolling one row re-runs the
     hierarchy flattening and a placeAppointment for all 10,000 rows — measured
     at 32ms per frame before, 8ms after. */
  /* Keyed on the INSTANT, not the Date object. A `Date` is a fresh identity on
     every render even when it names the same millisecond, so depending on the
     object defeats the memo entirely — which is the bug these memos exist to
     fix, reintroduced by the linter's own advice. */
  const anchorTime = anchor.getTime();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const range = React.useMemo(() => ganttRange(view, anchor), [view, anchorTime]);
  const columns = React.useMemo(
    () => ganttColumns(view, anchor, { now, calendar, hourStep }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view, anchorTime, nowTime, calendar, hourStep],
  );
  const axisWidth = columns.length * (columnWidth ?? COLUMN_PX[view]);
  /* Per column, from its own duration — NOT axisWidth / columns.length. A year
     of 28-to-31-day months drawn at one uniform width walks every bar off its
     gridline by up to three days, and looks entirely reasonable doing it. */
  const columnWidths = React.useMemo(
    () => ganttColumnWidths(columns, range, axisWidth),
    [columns, range, axisWidth],
  );
  const marker = nowPct(range, now);

  /* Splitting is a GEOMETRY decision, not a data one: a gap that would draw
     narrower than a pixel is not worth a second DOM node, and at a year zoom
     that is every gap. Derived from the axis so the day view breaks at lunch
     and the year view does not. */
  const minGapMs = React.useMemo(
    () => (axisWidth > 0 ? (range.end.getTime() - range.start.getTime()) / axisWidth : 0),
    [range, axisWidth],
  );

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

  const bodyHeight = rows.length * ROW_PX;

  /* Which rows actually go in the DOM. Always on: a threshold would mean the
     windowed path is the one no demo and no check ever runs, and production is
     the first thing to try it. Below a screenful the window covers every row,
     so small plans render exactly as they did. */
  const rowWindow = ganttRowWindow(rows.length, ROW_PX, scroll.top, scroll.height);
  const visibleRows = rows.slice(rowWindow.startIndex, rowWindow.endIndex);

  /* The connector layer is memoized as an ELEMENT, not just as data. It is one
     SVG of up to several thousand paths, it does not depend on scroll, and
     without this React reconciles every one of those nodes on each scroll frame
     — measured at 13ms per frame of pure diffing for 3,000 links. It is
     deliberately NOT windowed: a link between two off-screen tasks still routes
     through the visible band, and culling it would blink connectors in and out
     as their endpoints scrolled away. */
  const connectorLayer = React.useMemo(() => {
    if (connectors.length === 0) return null;
    return (
      /* Mirrored under RTL rather than recomputed: the bars are placed with
         logical inset properties, so the axis is already flipped and the routes
         have to flip with it — arrowheads included. */
      <svg
        aria-hidden="true"
        className="zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100"
        width={axisWidth}
        height={bodyHeight}
        viewBox={`0 0 ${axisWidth} ${bodyHeight}`}
        style={{ insetInlineStart: LEFT_PX }}
      >
        {connectors.map((connector) => (
          <g key={connector.id}>
            <path
              d={connector.d}
              fill="none"
              /* zen-stroke-* / zen-fill-* generate nothing under this preset —
                 the token has to be named directly. */
              stroke="var(--zen-color-muted-fg)"
              strokeWidth={1.5}
            />
            <polygon
              points={[
                `${connector.arrow.x},${connector.arrow.y}`,
                `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y - ARROW_PX}`,
                `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y + ARROW_PX}`,
              ].join(" ")}
              fill="var(--zen-color-muted-fg)"
            />
          </g>
        ))}
      </svg>
    );
  }, [connectors, axisWidth, bodyHeight]);

  /* Focus rescue. Scrolling a focused bar out of the window unmounts the button
     under it and the browser drops focus to <body> — so the next Tab restarts
     from the top of the PAGE, stranding a keyboard user who was reading row
     4,000. This puts focus on the scroller instead: still inside the chart,
     still scrolled where they left it, and Tab continues from there.
     Deliberately NOT "keep the focused row mounted": that row can be thousands
     of rows from the window, and mounting the span between them is the exact
     thing this change exists to avoid. */
  const hadFocusRef = React.useRef(false);
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (el.contains(document.activeElement)) return;
    /* Only rescue when focus fell to <body>, which is what unmounting the
       focused node does. If it went to some other element the user moved it
       deliberately and stealing it back would be worse than the problem. */
    if (hadFocusRef.current && document.activeElement === document.body) {
      el.focus({ preventScroll: true });
      return;
    }
    hadFocusRef.current = false;
  }, [rowWindow.startIndex, rowWindow.endIndex]);

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
            <Skeleton className="zen-h-4" style={{ width: NAME_PX - 24 - i % 3 * INDENT_PX }} />
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
      <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className)}>
        {!hideToolbar && (
          <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-label="Previous"
              onClick={() => setDate(shiftGanttAnchor(view, anchor, -1))}
            >
              {/* Logical, not physical: under RTL the axis runs the other way. */}
              <Icon name="chevron-left" size={14} className="rtl:zen-rotate-180" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setDate(now)}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-label="Next"
              onClick={() => setDate(shiftGanttAnchor(view, anchor, 1))}
            >
              <Icon name="chevron-right" size={14} className="rtl:zen-rotate-180" />
            </Button>

            <span className="zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground">
              {ganttRangeLabel(view, anchor)}
            </span>

            <div className="zen-ms-auto zen-flex zen-gap-1" role="group" aria-label="View">
              {(views ?? ALL_VIEWS).map((v) => (
                <Button
                  key={v}
                  variant={view === v ? "solid" : "outline"}
                  size="sm"
                  aria-pressed={view === v}
                  onClick={() => setView(v)}
                >
                  {VIEW_LABEL[v]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* ONE scroller. The task pane is sticky at the inline start and the
            header sticky at the top, so vertical scroll moves both panes and
            horizontal scroll moves only the axis — with no scroll listener to
            fall out of sync. */}
        <div
          ref={scrollerRef}
          /* Focusable so the focus rescue has somewhere to land, and so a
             keyboard user can scroll the chart without first tabbing to a bar. */
          tabIndex={-1}
          /* Recorded from the event, not from the effect: focusing a bar changes
             no React state, so the effect never runs to notice it and would
             still think focus was outside when the row unmounts. */
          onFocus={() => {
            hadFocusRef.current = true;
          }}
          className="zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none"
        >
          <div
            style={{ width: LEFT_PX + axisWidth }}
            role="grid"
            /* The TRUE totals, not the windowed ones. This is the whole reason
               a virtualized grid needs explicit row semantics: without them a
               screen reader counts the DOM and announces "row 3 of 26" in a
               10,000-row plan. +1 for the header row. */
            aria-rowcount={rows.length + 1}
            aria-colcount={5}
            aria-label="Project schedule"
          >
            <div
              role="row"
              aria-rowindex={1}
              className="zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted"
              style={{ height: HEADER_PX, boxSizing: "border-box" }}
            >
              <div
                className="zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg"
                style={{ width: LEFT_PX, insetInlineStart: 0 }}
              >
                <div role="columnheader" aria-colindex={1} className="zen-truncate zen-px-3" style={{ width: NAME_PX }}>
                  Task
                </div>
                <div role="columnheader" aria-colindex={2} className="zen-truncate zen-px-2" style={{ width: ASSIGNEES_PX }}>
                  Assignees
                </div>
                <div role="columnheader" aria-colindex={3} className="zen-truncate zen-px-2" style={{ width: STATUS_PX }}>
                  Status
                </div>
                <div role="columnheader" aria-colindex={4} className="zen-truncate zen-px-2" style={{ width: VARIANCE_PX }}>
                  Variance
                </div>
              </div>

              <div role="columnheader" aria-colindex={5} aria-label="Timeline" className="zen-flex" style={{ width: axisWidth }}>
                {columns.map((column, i) => (
                  <div
                    key={column.start.getTime()}
                    className={cn(
                      "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
                      column.nonWorking && "zen-bg-zen-muted",
                      column.today && "zen-bg-zen-primary-soft",
                    )}
                    style={{ width: columnWidths[i] }}
                  >
                    <span className="zen-text-xs zen-font-medium zen-text-zen-foreground">
                      {column.label}
                    </span>
                    {column.sublabel && (
                      <span className="zen-text-[10px] zen-text-zen-muted-fg">{column.sublabel}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="zen-relative" style={{ height: bodyHeight }}>
              {/* Spacers stand in for the rows that are not mounted, so the
                  scrollbar measures the whole plan rather than the window.
                  Spacers rather than a transform on purpose: a transformed
                  ancestor makes `position: sticky` resolve against IT instead
                  of the scroll container, and the frozen task pane would come
                  unstuck the moment the window moved. */}
              {rowWindow.paddingTop > 0 && (
                <div aria-hidden="true" style={{ height: rowWindow.paddingTop }} />
              )}
              {visibleRows.map((row) => (
                <GanttRowView
                  key={row.task.id}
                  row={row}
                  columns={columns}
                  columnWidths={columnWidths}
                  axisWidth={axisWidth}
                  range={range}
                  placement={placements.get(row.index) ?? null}
                  onToggle={toggle}
                  onTaskClick={onTaskClick}
                />
              ))}
              {rowWindow.paddingBottom > 0 && (
                <div aria-hidden="true" style={{ height: rowWindow.paddingBottom }} />
              )}

              {marker !== null && (
                <div
                  aria-hidden="true"
                  className="zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error"
                  style={{
                    height: bodyHeight,
                    insetInlineStart: LEFT_PX + (marker / 100) * axisWidth,
                  }}
                />
              )}

              {connectorLayer}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

interface GanttRowViewProps {
  row: GanttRow<GanttTask>;
  columns: PlanningColumn[];
  columnWidths: number[];
  axisWidth: number;
  range: PlanningRange;
  placement: PlanningPlacement | null;
  onToggle: (id: string) => void;
  onTaskClick?: (task: GanttTask, row: GanttRow<GanttTask>) => void;
}

const GanttRowView = ({
  row,
  columns,
  columnWidths,
  axisWidth,
  range,
  placement,
  onToggle,
  onTaskClick,
}: GanttRowViewProps) => {
  const { task } = row;
  const progress = row.progress ?? 0;
  const varianceText = formatGanttVariance(row.variance);
  const widthPx = placement ? (placement.widthPct / 100) * axisWidth : 0;
  const labelOutside = widthPx < LABEL_MIN_PX;
  const labelOnFill = !labelOutside && progress >= LABEL_MAX_PCT;

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

  return (
    <div
      role="row"
      /* The row's TRUE position in the plan, +1 for the header. A windowed grid
         that numbers rows from the DOM tells a screen-reader user they are on
         row 3 of 26 when they are on row 4,812 of 10,000. */
      aria-rowindex={row.index + 2}
      className="zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0"
      style={{ height: ROW_PX, boxSizing: "border-box" }}
    >
      <div
        className="zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background"
        style={{ width: LEFT_PX, insetInlineStart: 0 }}
      >
        <div
          role="gridcell"
          aria-colindex={1}
          className="zen-flex zen-min-w-0 zen-items-center zen-gap-1 zen-pe-2"
          style={{ width: NAME_PX, paddingInlineStart: 8 + row.depth * INDENT_PX }}
        >
          {row.hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(task.id)}
              aria-expanded={row.expanded}
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
        </div>

        <div role="gridcell" aria-colindex={2} className="zen-flex zen-items-center zen-px-2" style={{ width: ASSIGNEES_PX }}>
          <GanttAssignees assignees={task.assignees} />
        </div>

        <div role="gridcell" aria-colindex={3} className="zen-flex zen-items-center zen-px-2" style={{ width: STATUS_PX }}>
          <Badge variant="soft" color={STATUS_COLOR[row.status]} className="zen-truncate">
            {task.statusLabel ?? STATUS_LABEL[row.status]}
          </Badge>
        </div>

        <div role="gridcell" aria-colindex={4} className="zen-flex zen-items-center zen-px-2" style={{ width: VARIANCE_PX }}>
          {varianceText && (
            <Badge
              /* "+2d" is a signed number, and bidi reorders a leading sign to
                 the far side in an RTL run — it renders as "2d+". */
              dir="ltr"
              variant="soft"
              color={row.variance === null || row.variance === 0 ? "neutral" : row.variance > 0 ? "error" : "success"}
            >
              {varianceText}
            </Badge>
          )}
        </div>
      </div>

      <div role="gridcell" aria-colindex={5} className="zen-relative zen-shrink-0" style={{ width: axisWidth }}>
        {/* The column rules as a background layer rather than as parents of the
            bar: a bar spanning four days cannot live inside one day's box. */}
        <div aria-hidden="true" className="zen-absolute zen-inset-0 zen-flex">
          {columns.map((column, i) => (
            <div
              key={column.start.getTime()}
              className={cn(
                "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                column.nonWorking && "zen-bg-zen-muted/40",
                column.today && "zen-bg-zen-primary-soft/40",
              )}
              style={{ width: columnWidths[i] }}
            />
          ))}
        </div>

        {placement && (
          <button
            type="button"
            onClick={() => onTaskClick?.(task, row)}
            /* A button whether or not a handler was passed: bars are the only
               things on the axis worth reaching by keyboard, and a plain div
               takes the whole chart out of the tab order. */
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
        )}

        {placement && row.progress !== null && labelOutside && (
          <span
            aria-hidden="true"
            className="zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg"
            style={{
              insetInlineStart: `calc(${placement.startPct + placement.widthPct}% + 4px)`,
              top: BAR_TOP,
              height: BAR_PX,
            }}
          >
            {Math.round(progress)}%
          </span>
        )}
      </div>
    </div>
  );
};

const GanttAssignees = ({ assignees }: { assignees?: GanttAssignee[] }) => {
  if (!assignees || assignees.length === 0) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Focusable, so the full list is reachable without a pointer — the
            "+N" chip is the only place some names appear at all. */}
        <span tabIndex={0} className="zen-rounded-zen-full focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring">
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
