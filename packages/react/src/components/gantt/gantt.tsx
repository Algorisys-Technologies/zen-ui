import * as React from "react";
import {
  flattenGanttTasks,
  formatGanttVariance,
  ganttColumns,
  ganttColumnWidths,
  ganttConnectors,
  ganttFitRange,
  ganttFitUnit,
  ganttPaneColumns,
  ganttRange,
  ganttRangeColumns,
  ganttRangeLabel,
  ganttRowWindow,
  ganttSpanLabel,
  nowPct,
  placeAppointment,
  shiftGanttAnchor,
  GANTT_PANE_COLUMNS,
  type GanttAnchoredView,
  type GanttBarAnchor,
  type GanttCalendar,
  type GanttColumnUnit,
  type GanttDependency,
  type GanttPaneColumn,
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
 * The default view is `fit`: the axis range is the span of the tasks, so a plan
 * opens showing its own shape rather than whichever calendar month today falls
 * in. It is the only view that is never trivially wrong. Its range does not
 * depend on the anchor, so prev / next / today are HIDDEN while it is on — a
 * control that cannot change anything is worse than no control.
 *
 * It is one TAB STOP with APG grid navigation inside: arrows move a cell,
 * Home/End and their Ctrl forms jump the row and the grid, PageUp/PageDown move
 * a screenful, and left/right on the first column collapse and expand the
 * hierarchy. Roving tabindex, so tabbing past the chart is one key press rather
 * than one per bar.
 *
 * Rows ARE windowed, always, at every size — only the screenful under the
 * viewport is in the DOM (`ganttRowWindow` in core, which is arithmetic rather
 * than measurement because rows are a fixed height). Measured: 10,000 rows
 * mount ~26 of them. Keyboard navigation has to cooperate with that: moving to
 * an unmounted row scrolls it in, re-renders, and focuses it on the next
 * commit, or focus lands on <body> and the next Tab restarts from the top of
 * the page.
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

const VIEW_LABEL: Record<GanttView, string> = {
  fit: "Fit",
  day: "Day",
  week: "Week",
  month: "Month",
  quarter: "Quarter",
  year: "Year",
};
/* Fit first: it is the default, and it is the one that answers "what does this
   plan look like" before you have decided which zoom to argue about. */
const ALL_VIEWS: GanttView[] = ["fit", "day", "week", "month", "quarter", "year"];

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
const COLUMN_PX: Record<GanttAnchoredView, number> = {
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

/**
 * Fit sizes its columns to the CONTAINER, because "the whole plan without
 * scrolling sideways" is the only thing the view is for and a table of fixed
 * widths cannot promise it. These are the FLOORS: the narrowest each unit's
 * label survives at, measured against the label it actually draws — "08:00",
 * "31", "13 Jul", "Sep". Below them the labels stop being labels, and
 * scrolling is the better failure.
 *
 * Tighter than COLUMN_PX above, deliberately. Those are widths chosen to
 * breathe; these are widths chosen to fit, and the difference is the whole
 * point of a view that adapts.
 */
const FIT_MIN_COLUMN_PX: Record<GanttColumnUnit, number> = {
  hour: 40,
  day: 20,
  /* 26, not the quarter view's 72: a fit week column draws "13" with the month
     only where it changes, not "13 Jul" twenty times over. */
  week: 26,
  month: 30,
};

const ROW_PX = 36;
const BAR_PX = 18;
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — which is the y the connector routes are computed at. */
const BAR_TOP = (ROW_PX - BAR_PX) / 2;
const HEADER_PX = 44;

/**
 * The frozen pane's columns. Fixed widths, because a sticky pane cannot be
 * sized by its content without moving as you scroll.
 *
 * Trimmed from 188/104/96/80 — 468px, which left a year axis needing ~1430px in
 * total and scrolling at any normal page width. The pane sheds columns from the
 * end when even 424 will not fit; see `columns` and `ganttPaneColumns`.
 */
const PANE_PX: Record<GanttPaneColumn, number> = {
  name: 180,
  /* Three xs avatars at "loose" spacing plus a "+N" chip is 84px, and the cell
     costs 16px of padding either side of it. */
  assignees: 96,
  status: 88,
  variance: 72,
};

/**
 * A floor under what the pane will shed for. Nothing narrower than this is a
 * chart — it is a legend — so a view whose columns want less than this still
 * costs the pane this much.
 */
const MIN_AXIS_PX = 280;

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

/**
 * The column each pane key reports as, and the one the timeline reports as.
 *
 * FIXED, not renumbered when a column is dropped: `aria-colindex` names a
 * column's place in the whole table, which is exactly what lets a partially
 * rendered row be announced correctly. `aria-colcount` stays 5 for the same
 * reason — a reader who is told "column 5 of 5" on the timeline is being told
 * the truth whether or not Variance was drawn.
 */
const COL_INDEX: Record<GanttPaneColumn | "timeline", number> = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5,
};

/** Every cell in a row, left to right, once the pane has decided its columns. */
type GanttCellKey = GanttPaneColumn | "timeline";

const PANE_LABEL: Record<GanttPaneColumn, string> = {
  name: "Task",
  assignees: "Assignees",
  status: "Status",
  variance: "Variance",
};

/** Grid cells are focus targets, so they need a ring of their own. Inset,
 *  because a cell is flush against its neighbours and an outset ring is drawn
 *  under the next cell's background. */
const CELL_FOCUS_CLASS =
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring";

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
  /* Seeded with the scroller's own max height rather than 0. At 0 the first
     paint mounts only the overscan and then visibly fills in a frame later;
     seeding it means the first paint is already the right screenful.
     `width` is seeded at 0, meaning UNMEASURED — which `ganttPaneColumns` reads
     as "keep every column" rather than as a zero-width container. */
  const [scroll, setScroll] = React.useState({ top: 0, height: SCROLLER_MAX_PX, width: 0 });

  const measure = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setScroll((prev) =>
      prev.top === el.scrollTop && prev.height === el.clientHeight && prev.width === el.clientWidth
        ? prev
        : { top: el.scrollTop, height: el.clientHeight, width: el.clientWidth },
    );
  }, []);

  /* Layout, not passive: the pane's columns and the fit axis's width are both
     computed FROM this measurement, so reading it after paint would draw a
     four-column pane and a floor-width axis for one frame and then replace
     them. That reads as a glitch rather than as a layout. */
  React.useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    /* Coalesced into one frame. A wheel gesture fires scroll far faster than
       React can render, and setState per event turns a smooth scroll into a
       queue of renders that arrive after the user has stopped. */
    let frame = 0;
    const read = () => {
      frame = 0;
      measure();
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(onScroll);
    observer.observe(el);
    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [measure]);

  /* Every commit, deliberately without a dependency list. A ResizeObserver
     watches the BORDER box, which does not move when a vertical scrollbar
     appears inside it — but `clientWidth` drops by the scrollbar's width, and
     the fit axis is sized from `clientWidth`. Expanding a phase past a
     screenful would otherwise leave the axis ~15px too wide and trade the
     vertical scrollbar for a horizontal one. `measure` bails when nothing
     changed, so this cannot loop. */
  React.useLayoutEffect(measure);

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

  const isFit = view === "fit";
  /* The one place the two worlds meet. Every anchored function refuses `fit` at
     the TYPE level, so there is no path by which a fit view reaches
     `ganttRange` and silently gets a month — which is exactly the trap
     `planningRange` still has, and the reason the two view types are split. */
  const anchoredView: GanttAnchoredView = isFit ? "month" : view;

  /* Null when not fitting, and ALSO null when fitting a plan in which nothing
     has dates yet. Both fall through to the anchored month below, so the axis
     and the toolbar still make sense while the dates are being filled in. */
  const fitRange = React.useMemo(
    () => (isFit ? ganttFitRange(tasks ?? [], { calendar }) : null),
    [isFit, tasks, calendar],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const anchoredRange = React.useMemo(() => ganttRange(anchoredView, anchor), [anchoredView, anchorTime]);
  const range = fitRange ?? anchoredRange;

  const fitUnit = fitRange ? ganttFitUnit(fitRange.end.getTime() - fitRange.start.getTime()) : null;

  const columns = React.useMemo(
    () =>
      fitRange && fitUnit
        ? ganttRangeColumns(fitRange, fitUnit, { now, calendar, hourStep })
        : ganttColumns(anchoredView, anchor, { now, calendar, hourStep }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fitRange, fitUnit, anchoredView, anchorTime, nowTime, calendar, hourStep],
  );

  /* What the axis WANTS: its comfortable width for an anchored view, its
     narrowest legible width for a fit one. Everything below negotiates against
     this number rather than against a constant. */
  const desiredAxis =
    columnWidth !== undefined
      ? columns.length * columnWidth
      : fitUnit
        ? columns.length * FIT_MIN_COLUMN_PX[fitUnit]
        : columns.length * COLUMN_PX[anchoredView];

  /* The pane sheds exactly as much as the axis needs, and no more.
     Shedding against a fixed minimum instead was the version that did not fix
     anything: a year axis wants 960px, so at 1292px the pane kept all four
     columns — 436 + 280 fits comfortably — and the chart scrolled 104px
     anyway, which is the bug this exists to remove.
     `columns` is a preference order, the caller's last choice goes first, and
     the first entry never goes — so this can still return more than fits, and
     then the chart scrolls as a genuinely last resort. */
  const requestedPane = paneColumnsProp ?? GANTT_PANE_COLUMNS;
  const requestedPaneKey = requestedPane.join(",");
  const paneKeys = React.useMemo(
    () => ganttPaneColumns(requestedPane, PANE_PX, scroll.width, Math.max(MIN_AXIS_PX, desiredAxis)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedPaneKey, scroll.width, desiredAxis],
  );
  const paneWidth = paneKeys.reduce((sum, key) => sum + PANE_PX[key], 0);
  const cellKeys = React.useMemo<GanttCellKey[]>(() => [...paneKeys, "timeline"], [paneKeys]);

  /* Fit then spends whatever the pane left over, so a container wider than the
     floors needs draws wider columns rather than a stripe of empty gutter. The
     anchored views keep their stated widths: a week view that stretched to the
     window would make "how long is that bar" a question about the browser. */
  const axisWidth =
    fitUnit && columnWidth === undefined
      ? Math.max(desiredAxis, scroll.width - paneWidth)
      : desiredAxis;
  /* Per column, from its own duration — NOT axisWidth / columns.length. A year
     of 28-to-31-day months drawn at one uniform width walks every bar off its
     gridline by up to three days, and looks entirely reasonable doing it. */
  const columnWidths = React.useMemo(
    () => ganttColumnWidths(columns, range, axisWidth),
    [columns, range, axisWidth],
  );
  const marker = nowPct(range, now);

  const setView = (next: GanttView) => {
    /* Leaving fit re-anchors, when the anchor is nowhere near the plan.
       Otherwise the obvious gesture — open on fit, click Month to zoom in —
       lands on today's month, which for a plan that runs next spring is an
       empty axis and reads as the data having vanished. `now` where the plan is
       running, the plan's start where it is not. */
    if (isFit && next !== "fit" && fitRange) {
      const from = fitRange.start.getTime();
      const to = fitRange.end.getTime();
      if (anchorTime < from || anchorTime >= to) {
        setDate(nowTime >= from && nowTime < to ? now : fitRange.start);
      }
    }
    if (viewProp === undefined) setInnerView(next);
    onViewChange?.(next);
  };

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
        style={{ insetInlineStart: paneWidth }}
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
  }, [connectors, axisWidth, bodyHeight, paneWidth]);

  /* ------------------------------------------------------------------ *
   * Keyboard: one tab stop, APG grid navigation inside.
   *
   * Before this the chart was tab-through-bars, which is not a navigation
   * model at 10,000 rows — it is 10,000 tab stops between the reader and
   * whatever comes after the chart. Roving tabindex fixes both halves: exactly
   * one cell is tabbable, and the arrows do the moving.
   * ------------------------------------------------------------------ */
  const [active, setActive] = React.useState({ row: 0, col: 0 });
  const activeRow = Math.min(Math.max(active.row, 0), Math.max(rows.length - 1, 0));
  const activeCol = Math.min(Math.max(active.col, 0), cellKeys.length - 1);

  /* The tab stop follows the VIEWPORT when the active row has been scrolled out
     of the window. Anchoring it to the active row instead would leave no cell
     with tabindex 0 at all — the row is not in the DOM — and Tab would skip the
     entire chart, which is a worse regression than the one this replaces. */
  const tabRow = Math.min(Math.max(activeRow, rowWindow.startIndex), Math.max(rowWindow.endIndex - 1, 0));

  /* Set when WE move focus, so the layout effect below knows the difference
     between "the row we asked for has finally mounted" and "the user scrolled
     away from a focused cell". */
  const pendingFocusRef = React.useRef<{ row: number; col: number } | null>(null);
  /* Whether focus has ever been inside the chart. Recorded from the event
     rather than from an effect: focusing a cell changes no React state, so no
     effect runs to notice it, and the rescue below would still think focus was
     outside when the row unmounts. */
  const hadFocusRef = React.useRef(false);

  const scrollRowIntoView = (rowIndex: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    /* The header is sticky and covers the top HEADER_PX of the viewport, so a
       row scrolled flush to the top is a row hidden behind the column titles. */
    const rowTop = HEADER_PX + rowIndex * ROW_PX;
    const upper = rowTop - HEADER_PX;
    const lower = rowTop + ROW_PX - el.clientHeight;
    const next = Math.max(0, Math.min(Math.max(el.scrollTop, lower), upper));
    if (next === el.scrollTop) return;
    el.scrollTop = next;
    /* Pushed into state in the same commit rather than waiting for the scroll
       event's rAF: the row has to be in the window on THIS render, or the
       effect that focuses it finds nothing and focus stays where it was. */
    setScroll((prev) => (prev.top === next ? prev : { ...prev, top: next }));
  };

  /* Bails on an unchanged position, so re-focusing the cell we just moved to
     does not queue a render whose only effect is to allocate a new object. */
  const focusCell = React.useCallback((row: number, col: number) => {
    setActive((prev) => (prev.row === row && prev.col === col ? prev : { row, col }));
  }, []);

  const moveTo = (row: number, col: number) => {
    setActive({ row, col });
    pendingFocusRef.current = { row, col };
    scrollRowIntoView(row);
  };

  React.useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    const el = scrollerRef.current;
    if (!pending || !el) return;
    const cell = el.querySelector<HTMLElement>(
      `[data-gantt-cell="${pending.row}:${pending.col}"]`,
    );
    // Not mounted yet — stay pending, and the next commit will find it.
    if (!cell) return;
    pendingFocusRef.current = null;
    hadFocusRef.current = true;
    /* preventScroll, then adjusted by hand. The browser's own scrolling would
       drag the timeline cell — which is the whole axis wide — fully into view,
       jumping the axis to a place nobody asked for. */
    cell.focus({ preventScroll: true });

    /* Sideways, from rects rather than from offsets, so RTL needs no special
       case: the pane is at the INLINE start in both directions and a relative
       `scrollLeft` nudge in physical pixels means the same thing under either
       of the browsers' two RTL scrollLeft conventions. The bar, not the cell —
       the cell spans the entire axis, so "bring the cell into view" is
       satisfied by any scroll position at all. */
    const bar = cell.querySelector<HTMLElement>("[data-gantt-bar]");
    if (!bar) return;
    const box = bar.getBoundingClientRect();
    const viewport = el.getBoundingClientRect();
    const rtl = getComputedStyle(el).direction === "rtl";
    const minX = rtl ? viewport.left : viewport.left + paneWidth;
    const maxX = rtl ? viewport.right - paneWidth : viewport.right;
    if (box.left < minX) el.scrollLeft -= minX - box.left;
    else if (box.right > maxX) el.scrollLeft += Math.min(box.right - maxX, box.left - minX);
  });

  const onGridKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.metaKey) return;
    const el = scrollerRef.current;
    /* Arrow keys follow the VISUAL direction, which is what APG specifies and
       what a reader expects from the key with an arrow drawn on it. */
    const rtl = el ? getComputedStyle(el).direction === "rtl" : false;
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    /* A screenful of rows, minus the header the sticky row covers. At least
       one, so a chart shorter than its own header still moves. */
    const page = Math.max(1, Math.floor((scroll.height - HEADER_PX) / ROW_PX));
    const last = rows.length - 1;
    const row = rows[activeRow];

    let nextRow = activeRow;
    let nextCol = activeCol;

    switch (event.key) {
      case "ArrowDown":
        nextRow = Math.min(last, activeRow + 1);
        break;
      case "ArrowUp":
        nextRow = Math.max(0, activeRow - 1);
        break;
      case forward:
        /* On the first column, forward EXPANDS a closed parent rather than
           moving — the treegrid pattern, and the only way to open a subtree
           without a pointer. It moves as usual once there is nothing to open. */
        if (activeCol === 0 && row?.hasChildren && !row.expanded) {
          event.preventDefault();
          toggle(row.task.id);
          return;
        }
        nextCol = Math.min(cellKeys.length - 1, activeCol + 1);
        break;
      case backward:
        if (activeCol === 0 && row?.hasChildren && row.expanded) {
          event.preventDefault();
          toggle(row.task.id);
          return;
        }
        nextCol = Math.max(0, activeCol - 1);
        break;
      case "Home":
        nextCol = 0;
        if (event.ctrlKey) nextRow = 0;
        break;
      case "End":
        nextCol = cellKeys.length - 1;
        if (event.ctrlKey) nextRow = last;
        break;
      case "PageDown":
        nextRow = Math.min(last, activeRow + page);
        break;
      case "PageUp":
        nextRow = Math.max(0, activeRow - page);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (row) onTaskClick?.(row.task, row);
        return;
      default:
        return;
    }

    // Swallowed even when the move is a no-op at an edge, or ArrowDown on the
    // last row scrolls the PAGE while the chart appears to ignore it.
    event.preventDefault();
    if (nextRow === activeRow && nextCol === activeCol) return;
    moveTo(nextRow, nextCol);
  };

  /* Focus rescue. Scrolling a focused cell out of the window unmounts it and
     the browser drops focus to <body> — so the next Tab restarts from the top
     of the PAGE, stranding a keyboard user who was reading row 4,000. This puts
     focus on the scroller instead: still inside the chart, still scrolled where
     they left it, and Tab continues from there, into the cell the roving
     tabindex has meanwhile moved to the visible band.
     Deliberately NOT "keep the focused row mounted": that row can be thousands
     of rows from the window, and mounting the span between them is the exact
     thing windowing exists to avoid. */
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    // A move of ours is mid-flight; the effect above owns focus this commit.
    if (pendingFocusRef.current) return;
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
      <div className={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className)}>
        {!hideToolbar && (
          <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
            {/* GONE under fit, not disabled and not left live. A fit axis has no
                anchor to move, so Previous, Today and Next have nothing to
                change — and three buttons that visibly do nothing are read as a
                broken chart, which is worse than three buttons that are not
                there. The range label stays: it is the one thing that still
                says something, and it says it about the plan instead. */}
            {!isFit && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  aria-label="Previous"
                  onClick={() => setDate(shiftGanttAnchor(anchoredView, anchor, -1))}
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
                  onClick={() => setDate(shiftGanttAnchor(anchoredView, anchor, 1))}
                >
                  <Icon name="chevron-right" size={14} className="rtl:zen-rotate-180" />
                </Button>
              </>
            )}

            <span
              /* "29 Jun – 31 Jul 2026" opens with a number, and bidi reorders a
                 leading number to the far side of an RTL run — it renders as
                 "Jun – 31 Jul 2026 29". `auto` rather than `ltr` because the
                 month names come from `toLocaleString`: under an Arabic locale
                 the label really is RTL, and pinning it would break the case
                 that is actually right. */
              dir="auto"
              className="zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground"
            >
              {isFit ? ganttSpanLabel(range) : ganttRangeLabel(anchoredView, anchor)}
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
          onFocus={() => {
            hadFocusRef.current = true;
          }}
          className="zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none"
        >
          <div
            style={{ width: paneWidth + axisWidth }}
            /* treegrid, not grid: the rows form a tree, and that is what makes
               left and right on the first column mean collapse and expand
               rather than nothing. `aria-level` and `aria-expanded` on each row
               are the other half of the same claim. */
            role="treegrid"
            /* The TRUE totals, not the windowed ones. This is the whole reason
               a virtualized grid needs explicit row semantics: without them a
               screen reader counts the DOM and announces "row 3 of 26" in a
               10,000-row plan. +1 for the header row. Colcount stays 5 even
               when the pane has shed a column — see COL_INDEX. */
            aria-rowcount={rows.length + 1}
            aria-colcount={5}
            aria-label="Project schedule"
            onKeyDown={onGridKeyDown}
          >
            <div
              role="row"
              aria-rowindex={1}
              className="zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted"
              style={{ height: HEADER_PX, boxSizing: "border-box" }}
            >
              <div
                className="zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg"
                style={{ width: paneWidth, insetInlineStart: 0 }}
              >
                {paneKeys.map((key) => (
                  <div
                    key={key}
                    role="columnheader"
                    aria-colindex={COL_INDEX[key]}
                    className={cn("zen-truncate", key === "name" ? "zen-px-3" : "zen-px-2")}
                    style={{ width: PANE_PX[key] }}
                  >
                    {PANE_LABEL[key]}
                  </div>
                ))}
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
                  paneWidth={paneWidth}
                  cellKeys={cellKeys}
                  range={range}
                  placement={placements.get(row.index) ?? null}
                  /* -1 on every row but one. The grid is a single tab stop, and
                     which cell holds it is the roving tabindex's whole job. */
                  tabCol={row.index === tabRow ? activeCol : -1}
                  onFocusCell={focusCell}
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
                    insetInlineStart: paneWidth + (marker / 100) * axisWidth,
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
  paneWidth: number;
  /** The pane's surviving columns, then "timeline". Also the arrow-key order. */
  cellKeys: GanttCellKey[];
  range: PlanningRange;
  placement: PlanningPlacement | null;
  /** Which cell of THIS row carries the grid's single tab stop, or -1. */
  tabCol: number;
  onFocusCell: (row: number, col: number) => void;
  onToggle: (id: string) => void;
  onTaskClick?: (task: GanttTask, row: GanttRow<GanttTask>) => void;
}

const GanttRowView = ({
  row,
  columns,
  columnWidths,
  axisWidth,
  paneWidth,
  cellKeys,
  range,
  placement,
  tabCol,
  onFocusCell,
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
      /* treegrid semantics, and the only place the tree is stated to a screen
         reader: the indent is a paddingInlineStart nobody can hear. */
      aria-level={row.depth + 1}
      aria-expanded={row.hasChildren ? row.expanded : undefined}
      className="zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0"
      style={{ height: ROW_PX, boxSizing: "border-box" }}
    >
      <div
        className="zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background"
        style={{ width: paneWidth, insetInlineStart: 0 }}
      >
        {cellKeys.map((key, col) =>
          key === "timeline" ? null : (
            <div
              key={key}
              role="gridcell"
              aria-colindex={COL_INDEX[key]}
              /* How the keyboard finds a cell that may not have been in the DOM
                 when the move was decided — see the focus effect. */
              data-gantt-cell={`${row.index}:${col}`}
              tabIndex={tabCol === col ? 0 : -1}
              onFocus={() => onFocusCell(row.index, col)}
              /* The avatars are decorative and the "+N" chip hides names
                 outright, so the cell says who — the tooltip is the pointer's
                 version of the same sentence. */
              aria-label={
                key === "assignees" && task.assignees && task.assignees.length > 0
                  ? task.assignees.map((a) => a.name).join(", ")
                  : undefined
              }
              className={cn(
                "zen-flex zen-items-center",
                key === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
                CELL_FOCUS_CLASS,
              )}
              style={{
                width: PANE_PX[key],
                ...(key === "name" ? { paddingInlineStart: 8 + row.depth * INDENT_PX } : null),
              }}
            >
              {key === "name" && (
                <>
                  {row.hasChildren ? (
                    <button
                      type="button"
                      /* Out of the tab order, in the grid's: the chevron is
                         reached by arrowing to the first column and pressing
                         the forward arrow, not by a tab stop per parent. */
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
                    /* A spacer, not a hidden chevron: leaves must line up with
                       their siblings' text, or every leaf reads as one level
                       shallower. */
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
              )}

              {key === "assignees" && <GanttAssignees assignees={task.assignees} />}

              {key === "status" && (
                <Badge variant="soft" color={STATUS_COLOR[row.status]} className="zen-truncate">
                  {task.statusLabel ?? STATUS_LABEL[row.status]}
                </Badge>
              )}

              {key === "variance" && varianceText && (
                <Badge
                  /* "+2d" is a signed number, and bidi reorders a leading sign
                     to the far side in an RTL run — it renders as "2d+". */
                  dir="ltr"
                  variant="soft"
                  color={row.variance === null || row.variance === 0 ? "neutral" : row.variance > 0 ? "error" : "success"}
                >
                  {varianceText}
                </Badge>
              )}
            </div>
          ),
        )}
      </div>

      <div
        role="gridcell"
        aria-colindex={COL_INDEX.timeline}
        data-gantt-cell={`${row.index}:${cellKeys.length - 1}`}
        tabIndex={tabCol === cellKeys.length - 1 ? 0 : -1}
        onFocus={() => onFocusCell(row.index, cellKeys.length - 1)}
        className={cn("zen-relative zen-shrink-0", CELL_FOCUS_CLASS)}
        style={{ width: axisWidth }}
      >
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
