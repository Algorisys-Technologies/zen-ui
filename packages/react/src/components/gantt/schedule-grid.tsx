import * as React from "react";
import {
  ganttColumns,
  ganttColumnWidths,
  ganttColumnWindow,
  ganttContinuousRange,
  ganttFitHourStep,
  ganttFitUnit,
  ganttHeaderGroups,
  ganttViewUnit,
  ganttPaneColumns,
  ganttRange,
  ganttRangeColumns,
  ganttRangeLabel,
  ganttRowWindow,
  ganttSpanLabel,
  nowPct,
  shiftGanttAnchor,
  type GanttAnchoredView,
  type GanttColumnUnit,
  type GanttConnector,
  type GanttDependencyStyle,
  type GanttHeaderGroup,
  type GanttCalendar,
  type GanttView,
  type PlanningColumn,
  type PlanningRange,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { useLocale, type MessageKey } from "../locale/locale";

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
export const ROW_PX = 36;
export const HEADER_PX = 44;
/** The optional group row above the column labels (`headerGroups`). */
export const GROUP_PX = 22;
/** Indent per level of hierarchy, applied by the caller inside its first column. */
export const INDENT_PX = 14;

/**
 * NOMINAL column width per anchored view — the axis is `columns.length × this`,
 * and each column then takes its own share of that by duration
 * (`ganttColumnWidths`). For day, week and month every column is the same
 * length, so this is also the literal width; for quarter and year it is the
 * average.
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
 * "31", "13", "Sep". Below them the labels stop being labels, and scrolling is
 * the better failure.
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

/**
 * The narrowest each ANCHORED view survives at, measured against the label it
 * actually draws — "08:00", "Mon 12", "31", "13 Jul", "Sep".
 *
 * These exist so an anchored view can SHRINK toward its floor rather than
 * scroll. It never grows past COLUMN_PX above, and that asymmetry is the
 * point: stretching a week view to the window would make "how long is that
 * bar" a question about the browser, while shrinking it is simply the
 * alternative to dragging the chart sideways to see Thursday.
 */
/** A week column of a month drawn in weeks (`monthUnit: "week"`): wide enough
 *  for a label on a bar, which is why anyone asks for it. Floor, then ceiling. */
const MONTH_WEEK_PX = { min: 64, max: 180 };

const MIN_COLUMN_PX: Record<GanttAnchoredView, number> = {
  day: 34,
  week: 44,
  month: 20,
  quarter: 38,
  year: 30,
};

/**
 * A floor under what the pane will shed for. Nothing narrower than this is a
 * chart — it is a legend — so a view whose columns want less than this still
 * costs the pane this much.
 */
const MIN_AXIS_PX = 280;

/** Half-height of the connector arrowhead, in the axis's pixel space. */
const ARROW_PX = 5;

/** Matches `zen-max-h-[32rem]` on the scroller — 32rem at the 16px root. Used
 *  only to seed the window before the element has been measured. */
const SCROLLER_MAX_PX = 512;

/** Grid cells are focus targets, so they need a ring of their own. Inset,
 *  because a cell is flush against its neighbours and an outset ring is drawn
 *  under the next cell's background. */
const CELL_FOCUS_CLASS =
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-inset focus-visible:zen-ring-zen-ring";

const VIEW_LABEL: Record<GanttView, MessageKey> = {
  fit: "scheduleGrid.views.fit",
  day: "scheduleGrid.views.day",
  week: "scheduleGrid.views.week",
  month: "scheduleGrid.views.month",
  quarter: "scheduleGrid.views.quarter",
  year: "scheduleGrid.views.year",
};

/* Fit first: it is the default, and it is the one that answers "what does this
   plan look like" before you have decided which zoom to argue about. */
export const ALL_VIEWS: GanttView[] = ["fit", "day", "week", "month", "quarter", "year"];

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
  /** Classes for one row (the whole strip: pane and timeline). */
  rowClass?: (row: R) => string | undefined;
  /** The scroller's maximum height (px, or any CSS length). Default 32rem. */
  maxBodyHeight?: number | string;
  /**
   * Classes for the header: the row and its frozen pane, applied after their
   * own, so a caller's background and text colour win
   * (`"zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"`).
   */
  headerClassName?: string;
  /**
   * A second header row above the column labels giving their date context: the
   * date above hours, the month above days or weeks, the year above months.
   * Each group's label stays in view while the axis scrolls sideways. Off by
   * default — the header is then exactly the single row it always was.
   */
  headerGroups?: boolean;
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

  /* ---- the axis ----
     Only what the TOOLBAR needs. The axis itself arrives already resolved, in
     `axis`, because the caller has to run `useScheduleAxis` anyway: it needs
     `range` and `axisWidth` to place its own bars in the same render, and a
     second pass measuring the DOM is how two sources of truth for one geometry
     get created. */
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
  /** The caller's colour and dash for one arrow. An accented arrow keeps the dash but not the colour. */
  connectorStyle?: (connector: GanttConnector) => GanttDependencyStyle | undefined;

  /* ---- toolbar ---- */
  views?: GanttView[];
  hideToolbar?: boolean;
  /** A row of its own under the toolbar — the legend. Drawn even with the toolbar hidden. */
  legend?: React.ReactNode;
  onViewChange: (view: GanttView) => void;
  onDateChange: (date: Date) => void;

  /* ---- interaction ---- */
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
  /** What one column is: hour, day, week or month. What the header groups by. */
  unit: GanttColumnUnit;
  /** A continuous axis: the whole plan at the view's zoom, scrolled, not paged. */
  continuous: boolean;
  /** A continuous range that hit the column cap and was windowed round the anchor. */
  clamped: boolean;
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
export function useScheduleAxis(options: {
  view: GanttView;
  anchor: Date;
  fitRange: PlanningRange | null;
  now: Date;
  calendar?: GanttCalendar;
  hourStep?: number;
  columnWidth?: number;
  paneColumns: readonly { key: string; width: number }[];
  /** The scroller's measured `clientWidth`, or 0 before it has been measured. */
  available: number;
  /** The header draws a group row, so columns drop the context it carries. */
  grouped?: boolean;
  /** One scrolling timeline over the whole plan: the view sets the ZOOM. Fit ignores it. */
  continuous?: boolean;
  /** The plan's span, for a continuous axis; null when nothing has dates. */
  plan?: PlanningRange | null;
  /**
   * The month view's columns: "day" (default) or "week". Anchored month only —
   * a continuous axis zooms by its own unit and Fit chooses its own.
   */
  monthUnit?: "day" | "week";
}): ScheduleAxis & { paneKeys: string[] } {
  const { view, anchor, fitRange, now, calendar, hourStep, columnWidth, paneColumns, available, grouped, plan } = options;
  const continuous = !!options.continuous && view !== "fit";
  /** The anchored month, drawn in weeks. Sized as weeks, grouped as weeks. */
  const monthWeeks = options.monthUnit === "week" && view === "month" && !continuous;
  const monthUnit = monthWeeks ? ("week" as const) : undefined;

  const isFit = view === "fit";
  /* The one place the two view worlds meet. Every anchored function refuses
     `fit` at the TYPE level, so there is no path by which a fit view reaches
     `ganttRange` and silently gets a month. */
  const anchoredView: GanttAnchoredView = isFit ? "month" : view;

  /* Keyed on the INSTANT, not the Date object. A `Date` is a fresh identity on
     every render even when it names the same millisecond, so depending on the
     object defeats the memo entirely. */
  const anchorTime = anchor.getTime();
  const nowTime = now.getTime();

  const fitUnit = fitRange ? ganttFitUnit(fitRange.end.getTime() - fitRange.start.getTime()) : null;
  /* A fit hour axis picks its own step so 48 one-hour columns never happen —
     see `ganttFitHourStep`. A stated `hourStep` still wins: it is the caller
     saying what resolution they schedule at. */
  const effectiveHourStep =
    fitUnit === "hour" && hourStep === undefined && fitRange
      ? ganttFitHourStep(fitRange.end.getTime() - fitRange.start.getTime())
      : hourStep;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const anchoredRange = React.useMemo(() => ganttRange(anchoredView, anchor), [anchoredView, anchorTime]);
  /* Continuous: the whole plan at this zoom. It only CHANGES when the anchor
     leaves the plan or the range is capped: Previous / Next / Today otherwise
     scroll, they do not swap the window. */
  const planStart = plan?.start.getTime();
  const planEnd = plan?.end.getTime();
  const continuousRange = React.useMemo(
    () => (continuous ? ganttContinuousRange(anchoredView, plan ?? null, anchor) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [continuous, anchoredView, planStart, planEnd, anchorTime],
  );
  const range = fitRange ?? continuousRange?.range ?? anchoredRange;

  const columns = React.useMemo(
    () =>
      fitRange && fitUnit
        ? ganttRangeColumns(fitRange, fitUnit, { now, calendar, hourStep: effectiveHourStep, grouped })
        : continuousRange
          ? ganttRangeColumns(continuousRange.range, ganttViewUnit(anchoredView), { now, calendar, hourStep, grouped })
          : ganttColumns(anchoredView, anchor, { now, calendar, hourStep, grouped, monthUnit }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fitRange, fitUnit, anchoredView, anchorTime, nowTime, calendar, effectiveHourStep, grouped, continuousRange, monthUnit],
  );

  /* Two numbers, not one, and the pane negotiates against the SMALLER.
     
     `floorAxis` is the narrowest the axis survives at; `ceilingAxis` is the
     widest it will take. Fit has no ceiling — it spends whatever is left, which
     is what "the whole plan without scrolling" means. An anchored view's
     ceiling is its comfortable width and it will SHRINK below that rather than
     scroll, but never grow above it: stretching a week view to the window would
     make "how long is that bar" a question about the browser.
     
     Shedding pane columns against the floor rather than the ceiling is what
     lets a year axis at 1292px keep all four columns at 71px per month instead
     of losing two to buy 80px per month. Order matters: shrink first, shed only
     when even the floor will not fit. */
  // A continuous axis scrolls, so the pane negotiates only against a usable
  // viewport, not against the whole plan's width.
  const floorAxis = continuous
    ? MIN_AXIS_PX
    : columnWidth !== undefined
      ? columns.length * columnWidth
      : fitUnit
        ? columns.length * FIT_MIN_COLUMN_PX[fitUnit]
        : monthWeeks
          ? columns.length * MONTH_WEEK_PX.min
          : columns.length * MIN_COLUMN_PX[anchoredView];
  const ceilingAxis =
    columnWidth !== undefined
      ? columns.length * columnWidth
      : fitUnit
        ? Number.POSITIVE_INFINITY
        : monthWeeks
          ? columns.length * MONTH_WEEK_PX.max
          : columns.length * COLUMN_PX[anchoredView];

  const widths = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const column of paneColumns) map[column.key] = column.width;
    return map;
  }, [paneColumns]);
  const requestedKey = paneColumns.map((c) => c.key).join(",");
  const paneKeys = React.useMemo(
    () =>
      ganttPaneColumns(
        paneColumns.map((c) => c.key),
        widths,
        available,
        Math.max(MIN_AXIS_PX, floorAxis),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedKey, widths, available, floorAxis],
  );
  const paneWidth = paneKeys.reduce((sum, key) => sum + (widths[key] ?? 0), 0);

  /* Whatever the pane left over, clamped between the two. Below `floorAxis` the
     labels stop being labels and scrolling is the better failure; above
     `ceilingAxis` an anchored view would be stretching.
     
     UNMEASURED is not zero-width, here as in the pane: with no measurement an
     anchored view takes its comfortable width — exactly what it did before any
     of this existed — and a fit view takes its floor. `useLayoutEffect` measures
     before paint, so this only decides what a DOM-less render produces. */
  // Continuous: each column at the zoom's width; a short plan still fills the viewport.
  const naturalContinuous = columns.length * (columnWidth ?? COLUMN_PX[anchoredView]);
  const axisWidth = continuous
    ? available > 0
      ? Math.max(naturalContinuous, available - paneWidth)
      : naturalContinuous
    : available > 0
      ? Math.min(ceilingAxis, Math.max(floorAxis, available - paneWidth))
      : Number.isFinite(ceilingAxis)
        ? ceilingAxis
        : floorAxis;

  /* Per column, from its own duration — NOT axisWidth / columns.length. A year
     of 28-to-31-day months drawn at one uniform width walks every bar off its
     gridline by up to three days, and looks entirely reasonable doing it. */
  const columnWidths = React.useMemo(
    () => ganttColumnWidths(columns, range, axisWidth),
    [columns, range, axisWidth],
  );

  /* Splitting a bar is a GEOMETRY decision, not a data one: a gap that would
     draw narrower than a pixel is not worth a second DOM node, and at a year
     zoom that is every gap. */
  const minGapMs = React.useMemo(
    () => (axisWidth > 0 ? (range.end.getTime() - range.start.getTime()) / axisWidth : 0),
    [range, axisWidth],
  );

  const unit: GanttColumnUnit = fitUnit ?? (monthWeeks ? "week" : ganttViewUnit(anchoredView));

  const clamped = continuousRange?.clamped ?? false;

  return { range, columns, columnWidths, axisWidth, paneWidth, isFit, unit, continuous, clamped, minGapMs, paneKeys };
}

/**
 * The scroller's measurements, and the callback that refreshes them.
 *
 * Layout, not passive: the pane's columns and the fit axis's width are both
 * computed FROM this, so reading it after paint would draw a four-column pane
 * and a floor-width axis for one frame and then replace them.
 */
export function useScrollerMetrics(ref: React.RefObject<HTMLDivElement | null>) {
  /* `height` is seeded with the scroller's own max height rather than 0. At 0
     the first paint mounts only the overscan and then visibly fills in a frame
     later. `width` is seeded at 0, meaning UNMEASURED — which the pane reads as
     "keep every column" rather than as a zero-width container. */
  // `left`: horizontal scroll, LOGICAL (Chrome's RTL scrollLeft is negative).
  const [metrics, setMetrics] = React.useState({ top: 0, height: SCROLLER_MAX_PX, width: 0, left: 0 });

  const measure = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const left = Math.abs(el.scrollLeft);
    setMetrics((prev) =>
      prev.top === el.scrollTop && prev.height === el.clientHeight && prev.width === el.clientWidth && prev.left === left
        ? prev
        : { top: el.scrollTop, height: el.clientHeight, width: el.clientWidth, left },
    );
  }, [ref]);

  React.useLayoutEffect(() => {
    const el = ref.current;
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
  }, [ref, measure]);

  /* Every commit, deliberately without a dependency list. A ResizeObserver
     watches the BORDER box, which does not move when a vertical scrollbar
     appears inside it — but `clientWidth` drops by the scrollbar's width, and
     the fit axis is sized from `clientWidth`. Expanding a phase past a
     screenful would otherwise leave the axis ~15px too wide and trade the
     vertical scrollbar for a horizontal one. `measure` bails when nothing
     changed, so this cannot loop. */
  React.useLayoutEffect(measure);

  return { metrics, setMetrics, measure };
}

export function ScheduleGrid<R extends ScheduleRowShape>({
  rows,
  rowId,
  columns: paneColumns,
  colCount,
  timelineColIndex,
  renderTrack,
  rowHeight = ROW_PX,
  rowClass,
  maxBodyHeight,
  headerClassName,
  headerGroups,
  renderFooter,
  view,
  anchor,
  now,
  connectors,
  connectorAccent,
  connectorStyle,
  views,
  hideToolbar,
  legend,
  onViewChange,
  onDateChange,
  onToggle,
  onActivate,
  ariaLabel,
  className,
  scrollerRef,
  axis,
  metrics,
  setMetrics,
}: ScheduleGridProps<R> & {
  /** Owned by the caller, because the caller measures it to resolve the axis. */
  scrollerRef: React.RefObject<HTMLDivElement | null>;
  axis: ScheduleAxis & { paneKeys: string[] };
  metrics: { top: number; height: number; width: number; left: number };
  setMetrics: React.Dispatch<React.SetStateAction<{ top: number; height: number; width: number; left: number }>>;
}) {
  const loc = useLocale();
  const { range, columns, columnWidths, axisWidth, paneWidth, isFit, paneKeys } = axis;
  /* The header's height, read by everything that has to clear it: the sticky
     row itself, scrolling a row into view, and the keyboard's page size. */
  const headerPx = HEADER_PX + (headerGroups ? GROUP_PX : 0);
  const groups = React.useMemo(
    () => (headerGroups ? ganttHeaderGroups(columns, axis.unit) : []),
    [headerGroups, columns, axis.unit],
  );
  /** A group's width: the sum of its columns', so it lines up to the pixel. */
  const groupWidth = (g: GanttHeaderGroup) =>
    columnWidths.slice(g.firstColumn, g.firstColumn + g.columnCount).reduce((a, b) => a + b, 0);
  /* "July 2026" where it fits, "Jul" where it does not: two narrow days of June
     at the start of a week truncated "June 2026" to "Ju…", which names no month
     at all. Estimated (about 7px a character at text-xs, plus the padding)
     rather than measured, so the choice is stable and costs no layout read;
     the truncation stays as the last resort. */
  const groupLabel = (g: GanttHeaderGroup) => (groupWidth(g) >= g.label.length * 7 + 16 ? g.label : g.shortLabel);
  /** The per-column header cells: label, and the sublabel when there is one. */
  /* Only the columns near the viewport are drawn on a continuous axis: an hourly
     zoom over six weeks is about a thousand columns, and every mounted row
     drawing all of them is tens of thousands of nodes. One viewport of overscan
     each side keeps a fast scroll from showing bare rows. */
  const viewportPx = Math.max(0, metrics.width - paneWidth);
  const columnWindow = React.useMemo(
    () => (axis.continuous ? ganttColumnWindow(columnWidths, metrics.left, viewportPx, Math.max(viewportPx, 400)) : null),
    [axis.continuous, columnWidths, metrics.left, viewportPx],
  );
  const headerCell = (column: PlanningColumn, width: number, offset?: number) => (
    <div
      key={column.start.getTime()}
      className={cn(
        "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-overflow-hidden zen-border-e zen-border-zen-border last:zen-border-e-0",
        offset !== undefined && "zen-absolute zen-inset-y-0",
        column.nonWorking && "zen-bg-zen-muted",
        column.today && "zen-bg-zen-primary-soft",
      )}
      style={offset !== undefined ? { width, insetInlineStart: offset } : { width }}
    >
      <span className="zen-text-xs zen-font-medium zen-text-zen-foreground">
        {column.label}
      </span>
      {column.sublabel && (
        <span className="zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg">{column.sublabel}</span>
      )}
    </div>
  );
  const axisCells = columnWindow ? (
    // Windowed: positioned cells in a full-width box, so the header still spans
    // the whole axis and lines up with the rows below it.
    <div data-schedule-windowed="" className="zen-relative zen-h-full zen-w-full">
      {columnWindow.offsets.map((offset, k) => {
        const i = columnWindow.first + k;
        return headerCell(columns[i], columnWidths[i], offset);
      })}
    </div>
  ) : (
    columns.map((column, i) => headerCell(column, columnWidths[i]))
  );
  /* Narrowed from `view` rather than from `axis.isFit`, so the compiler can see
     that "fit" cannot reach an anchored function. That refusal is the whole
     point of the two view types. */
  const anchoredView: GanttAnchoredView = view === "fit" ? "month" : view;

  /* ---- continuous axis: scrolled, not paged --------------------------------- */
  const offsetOf = (t: Date) => (axis.minGapMs > 0 ? (t.getTime() - range.start.getTime()) / axis.minGapMs : 0);
  /** The instant under the middle of the visible axis. What the title names. */
  const centreTime = new Date(range.start.getTime() + (metrics.left + viewportPx / 2) * axis.minGapMs);
  /** Where Previous / Next step from: the middle of the screen when continuous. */
  const stepFrom = axis.continuous ? centreTime : anchor;
  /* Bring the anchor's period to the inline start whenever the ANCHOR, the view
     or the range changes: that is what Previous / Next / Today and a zoom
     change all come down to. Keyed, so the user's own scrolling (which changes
     none of them) is never fought. Waits for the first measurement. */
  const scrolledFor = React.useRef("");
  const scrollKey = `${view}|${anchor.getTime()}|${range.start.getTime()}|${range.end.getTime()}`;
  React.useEffect(() => {
    if (!axis.continuous || metrics.width === 0 || scrolledFor.current === scrollKey) return;
    scrolledFor.current = scrollKey;
    const target = offsetOf(ganttRange(anchoredView, anchor).start);
    const frame = requestAnimationFrame(() => {
      const el = scrollerRef.current;
      if (!el) return;
      const x = Math.max(0, target);
      el.scrollLeft = getComputedStyle(el).direction === "rtl" ? -x : x;
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axis.continuous, metrics.width > 0, scrollKey]);

  /* ---- the sideways scrollbar, kept to the axis ------------------------------ */
  /* One scroller means one native scrollbar, and it runs the scroller's whole
     width — under the frozen pane too, where it promises a pane that scrolls
     and then does not move it. The thumb's travel also reads against a track
     longer than the thing it scrolls.

     So a second scrollbar is laid exactly OVER the native one: blank under the
     pane, and a real scrollbar under the axis whose content is the axis' width.
     Both have the same scroll range (pane + axis - viewport on one side, axis -
     (viewport - pane) on the other), so `scrollLeft` copies across unscaled and
     under RTL keeps whatever sign the browser gives it.

     Over, not instead of: nothing is hidden or clipped, so the layout is the
     one it always was. Where scrollbars take no room (macOS, touch) the
     measured thickness is 0, nothing is drawn, and the native overlay bar is
     left alone. */
  const [bars, setBars] = React.useState({ x: 0, y: 0, edge: 0 });
  /* Every commit, like `measure`: a scrollbar appears and goes with the rows
     and the axis, not with anything a dependency list could name. Bails when
     nothing changed, so it cannot loop — which is the chain the rule warns of. */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const edge = el.clientTop;
    const x = Math.max(0, el.offsetHeight - el.clientHeight - edge * 2);
    const y = Math.max(0, el.offsetWidth - el.clientWidth - edge * 2);
    setBars((prev) => (prev.x === x && prev.y === y && prev.edge === edge ? prev : { x, y, edge }));
  });
  const axisBar = bars.x > 0 && paneWidth > 0 && viewportPx > 0;
  const axisBarRef = React.useRef<HTMLDivElement | null>(null);
  /* Compared before it is written: an equal write fires no scroll event, and
     that is the whole of what stops the two from answering each other. */
  const copyScroll = (from: HTMLElement | null, to: HTMLElement | null) => {
    if (from && to && Math.abs(to.scrollLeft - from.scrollLeft) >= 1) to.scrollLeft = from.scrollLeft;
  };
  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!axisBar || !el) return;
    const follow = () => copyScroll(el, axisBarRef.current);
    el.addEventListener("scroll", follow, { passive: true });
    return () => el.removeEventListener("scroll", follow);
  }, [axisBar, scrollerRef]);
  /* The bar mounts, or its range changes, with the chart already scrolled. */
  React.useLayoutEffect(() => {
    if (axisBar) copyScroll(scrollerRef.current, axisBarRef.current);
  }, [axisBar, axisWidth, metrics.width, scrollerRef]);

  const marker = nowPct(range, now);
  const bodyHeight = rows.length * rowHeight;

  const visibleColumns = React.useMemo(
    () => paneKeys.map((key) => paneColumns.find((c) => c.key === key)!).filter(Boolean),
    [paneKeys, paneColumns],
  );
  const cellCount = visibleColumns.length + 1;

  /* Which rows actually go in the DOM. Always on: a threshold would mean the
     windowed path is the one no demo and no check ever runs, and production is
     the first thing to try it. Below a screenful the window covers every row,
     so small plans render exactly as they did. */
  const rowWindow = ganttRowWindow(rows.length, rowHeight, metrics.top, metrics.height);
  const visibleRows = rows.slice(rowWindow.startIndex, rowWindow.endIndex);

  /* The connector layer is memoized as an ELEMENT, not just as data. It is one
     SVG of up to several thousand paths, it does not depend on scroll, and
     without this React reconciles every one of those nodes on each scroll frame
     — measured at 13ms per frame of pure diffing for 3,000 links. It is
     deliberately NOT windowed: a link between two off-screen tasks still routes
     through the visible band, and culling it would blink connectors in and out
     as their endpoints scrolled away. */
  const connectorLayer = React.useMemo(() => {
    if (!connectors || connectors.length === 0) return null;
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
        {connectors.map((connector) => {
          /* zen-stroke-* / zen-fill-* generate nothing under this preset — the
             token has to be named directly. */
          const accented = connectorAccent?.(connector) ?? false;
          const styled = connectorStyle?.(connector);
          /* A broken link stays red whatever its kind: that is the one arrow
             the reader has to act on. Its dash survives, so it still says
             which kind it was. */
          const tone = accented
            ? "var(--zen-color-error)"
            : (styled?.color ?? "var(--zen-color-muted-fg)");
          return (
            <g key={connector.id}>
              <path
                d={connector.d}
                fill="none"
                stroke={tone}
                strokeDasharray={styled?.dash}
                /* Thicker as well as red: colour alone is not a signal, and a
                   red line on a chart that already uses red for delay needs a
                   second channel to be read as "this link is broken". */
                strokeWidth={accented ? 2.25 : 1.5}
              />
              <polygon
                points={[
                  `${connector.arrow.x},${connector.arrow.y}`,
                  `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y - ARROW_PX}`,
                  `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y + ARROW_PX}`,
                ].join(" ")}
                fill={tone}
              />
            </g>
          );
        })}
      </svg>
    );
  }, [connectors, connectorAccent, connectorStyle, axisWidth, bodyHeight, paneWidth]);

  /* ------------------------------------------------------------------ *
   * Keyboard: one tab stop, APG grid navigation inside.
   *
   * Tab-through-the-bars is not a navigation model at 10,000 rows — it is
   * 10,000 tab stops between the reader and whatever comes after the chart.
   * Roving tabindex fixes both halves: exactly one cell is tabbable, and the
   * arrows do the moving.
   * ------------------------------------------------------------------ */
  const [active, setActive] = React.useState({ row: 0, col: 0 });
  const activeRow = Math.min(Math.max(active.row, 0), Math.max(rows.length - 1, 0));
  const activeCol = Math.min(Math.max(active.col, 0), cellCount - 1);

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

  /* Bails on an unchanged position, so re-focusing the cell we just moved to
     does not queue a render whose only effect is to allocate a new object. */
  const focusCell = React.useCallback((row: number, col: number) => {
    setActive((prev) => (prev.row === row && prev.col === col ? prev : { row, col }));
  }, []);

  const scrollRowIntoView = (rowIndex: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    /* The header is sticky and covers the top headerPx of the viewport, so a
       row scrolled flush to the top is a row hidden behind the column titles. */
    const rowTop = headerPx + rowIndex * rowHeight;
    const upper = rowTop - headerPx;
    const lower = rowTop + rowHeight - el.clientHeight;
    const next = Math.max(0, Math.min(Math.max(el.scrollTop, lower), upper));
    if (next === el.scrollTop) return;
    el.scrollTop = next;
    /* Pushed into state in the same commit rather than waiting for the scroll
       event's rAF: the row has to be in the window on THIS render, or the
       effect that focuses it finds nothing and focus stays where it was. */
    setMetrics((prev) => (prev.top === next ? prev : { ...prev, top: next }));
  };

  const moveTo = (row: number, col: number) => {
    setActive({ row, col });
    pendingFocusRef.current = { row, col };
    scrollRowIntoView(row);
  };

  React.useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    const el = scrollerRef.current;
    if (!pending || !el) return;
    const cell = el.querySelector<HTMLElement>(`[data-gantt-cell="${pending.row}:${pending.col}"]`);
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
    const page = Math.max(1, Math.floor((metrics.height - headerPx) / rowHeight));
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
          onToggle(row);
          return;
        }
        nextCol = Math.min(cellCount - 1, activeCol + 1);
        break;
      case backward:
        if (activeCol === 0 && row?.hasChildren && row.expanded) {
          event.preventDefault();
          onToggle(row);
          return;
        }
        nextCol = Math.max(0, activeCol - 1);
        break;
      case "Home":
        nextCol = 0;
        if (event.ctrlKey) nextRow = 0;
        break;
      case "End":
        nextCol = cellCount - 1;
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
        if (row) onActivate?.(row);
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
  }, [rowWindow.startIndex, rowWindow.endIndex, scrollerRef]);

  return (
    /* Positioned only so the axis scrollbar can be pinned to the foot of the
       scroller, which is always the last thing in here. A sibling of the
       scroller rather than a wrapper around it: the scroller stays the grid's
       parent and the toolbar's next sibling, which is how callers find it. */
    <div className={cn("zen-relative zen-flex zen-w-full zen-flex-col zen-gap-3", className)}>
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
                aria-label={loc.t("scheduleGrid.previous")}
                /* Continuous: a period back from what is ON SCREEN, not from an
                   anchor the user may have scrolled a month away from. */
                onClick={() => onDateChange(shiftGanttAnchor(anchoredView, stepFrom, -1))}
              >
                {/* Logical, not physical: under RTL the axis runs the other way. */}
                <Icon name="chevron-left" size={14} className="rtl:zen-rotate-180" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDateChange(now)}>
                {loc.t("scheduleGrid.today")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label={loc.t("scheduleGrid.next")}
                onClick={() => onDateChange(shiftGanttAnchor(anchoredView, stepFrom, 1))}
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
            {isFit ? ganttSpanLabel(range) : ganttRangeLabel(anchoredView, axis.continuous ? centreTime : anchor)}
          </span>

          <div className="zen-ms-auto zen-flex zen-gap-1" role="group" aria-label={loc.t("scheduleGrid.view")}>
            {(views ?? ALL_VIEWS).map((v) => (
              <Button
                key={v}
                variant={view === v ? "solid" : "outline"}
                size="sm"
                aria-pressed={view === v}
                onClick={() => {
                  /* A continuous zoom change re-anchors to the middle of what is
                     on screen first, so zooming keeps the reader's place. */
                  if (axis.continuous && v !== "fit") onDateChange(centreTime);
                  onViewChange(v);
                }}
              >
                {loc.t(VIEW_LABEL[v])}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Its own row, not squeezed into the toolbar: a key of five or six
          entries beside the view switcher wrapped the switcher onto a line of
          its own at ordinary widths. */}
      {legend}

      {/* ONE scroller. The frozen pane is sticky at the inline start and the
          header sticky at the top, so vertical scroll moves both panes and
          horizontal scroll moves only the axis — with no scroll listener to
          fall out of sync. */}
      <div
        ref={scrollerRef}
        /* Focusable so the focus rescue has somewhere to land, and so a
           keyboard user can scroll the chart without first tabbing to a cell. */
        tabIndex={-1}
        onFocus={() => {
          hadFocusRef.current = true;
        }}
        className={cn(
          "zen-relative zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border focus-visible:zen-outline-none",
          maxBodyHeight === undefined && "zen-max-h-[32rem]",
        )}
        style={maxBodyHeight === undefined ? undefined : { maxHeight: maxBodyHeight }}
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
             10,000-row plan. +1 for the header row. `aria-colcount` does not
             shrink when the pane sheds a column — see ScheduleColumn.colIndex. */
          aria-rowcount={rows.length + 1}
          aria-colcount={colCount}
          aria-label={ariaLabel}
          onKeyDown={onGridKeyDown}
        >
          <div
            role="row"
            aria-rowindex={1}
            className={cn("zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted", headerClassName)}
            style={{ height: headerPx, boxSizing: "border-box" }}
          >
            <div
              className={cn(
                "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
                headerClassName,
              )}
              style={{ width: paneWidth, insetInlineStart: 0 }}
            >
              {visibleColumns.map((column) => (
                <div
                  key={column.key}
                  role="columnheader"
                  aria-colindex={column.colIndex}
                  className={cn("zen-truncate", column.className ?? "zen-px-2")}
                  style={{ width: column.width }}
                >
                  {column.label}
                </div>
              ))}
            </div>

            <div
              role="columnheader"
              aria-colindex={timelineColIndex}
              aria-label={loc.t("scheduleGrid.timeline")}
              className={headerGroups ? "zen-flex zen-flex-col" : "zen-flex"}
              style={{ width: axisWidth }}
            >
              {/* Without groups the cells are the header's direct children,
                  exactly as before; with them, the group row sits above and the
                  cells move into a marked row of their own. */}
              {headerGroups ? (
                <>
                  {/* aria-hidden: the column labels and the toolbar's range title
                      already say the date to a screen reader. */}
                  <div
                    aria-hidden="true"
                    data-schedule-groups=""
                    className="zen-flex zen-shrink-0 zen-border-b zen-border-zen-border"
                    style={{ height: GROUP_PX, boxSizing: "border-box" }}
                  >
                    {groups.map((g) => (
                      /* No overflow clipping here: a clipping ancestor becomes the
                         label's scroll container and `sticky` stops working. */
                      <div
                        key={g.start.getTime()}
                        data-schedule-group=""
                        className="zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0"
                        style={{ width: groupWidth(g) }}
                      >
                        {/* Sticky just past the frozen pane, so the month or the
                            date stays on screen while its columns scroll by. */}
                        <span
                          className="zen-sticky zen-inline-block zen-max-w-full zen-truncate zen-px-2 zen-align-top zen-text-xs zen-font-semibold zen-text-zen-foreground"
                          style={{ insetInlineStart: paneWidth, lineHeight: `${GROUP_PX - 1}px` }}
                        >
                          {groupLabel(g)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div data-schedule-axis-row="" className="zen-flex zen-min-h-0 zen-flex-1">
                    {axisCells}
                  </div>
                </>
              ) : (
                axisCells
              )}
            </div>
          </div>

          <div className="zen-relative" style={{ height: bodyHeight }}>
            {/* Spacers stand in for the rows that are not mounted, so the
                scrollbar measures the whole plan rather than the window.
                Spacers rather than a transform on purpose: a transformed
                ancestor makes `position: sticky` resolve against IT instead
                of the scroll container, and the frozen pane would come
                unstuck the moment the window moved. */}
            {rowWindow.paddingTop > 0 && (
              <div aria-hidden="true" style={{ height: rowWindow.paddingTop }} />
            )}
            {visibleRows.map((row) => (
              <ScheduleRow
                key={rowId(row)}
                row={row}
                columns={visibleColumns}
                axisColumns={columns}
                columnWidths={columnWidths}
                columnWindow={columnWindow}
                axisWidth={axisWidth}
                paneWidth={paneWidth}
                timelineColIndex={timelineColIndex}
                renderTrack={renderTrack}
                rowHeight={rowHeight}
                rowClass={rowClass?.(row)}
                /* -1 on every row but one. The grid is a single tab stop, and
                   which cell holds it is the roving tabindex's whole job. */
                tabCol={row.index === tabRow ? activeCol : -1}
                onFocusCell={focusCell}
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

        {renderFooter && (
          <div
            className="zen-sticky zen-bottom-0 zen-z-30 zen-flex zen-border-t zen-border-zen-border zen-bg-zen-muted"
            style={{ width: paneWidth + axisWidth }}
          >
            {renderFooter({ columns, columnWidths, axisWidth, paneWidth })}
          </div>
        )}
      </div>

      {axisBar && (
        <div
          /* Decoration over a scrollbar the keyboard and a screen reader
             already have: the scroller itself is what they scroll. */
          aria-hidden="true"
          data-schedule-scrollbar=""
          className="zen-absolute zen-z-40 zen-flex zen-bg-zen-background"
          style={{
            bottom: bars.edge,
            insetInlineStart: bars.edge,
            /* Short of the corner the vertical scrollbar ends in. */
            insetInlineEnd: bars.edge + bars.y,
            height: bars.x,
          }}
        >
          <div
            className="zen-shrink-0 zen-border-e zen-border-zen-border"
            style={{ width: paneWidth, boxSizing: "border-box" }}
          />
          <div
            ref={axisBarRef}
            /* A scroller with nothing focusable in it is a tab stop of its own
               in Chrome, and the chart is exactly one. */
            tabIndex={-1}
            onScroll={() => copyScroll(axisBarRef.current, scrollerRef.current)}
            className="zen-min-w-0 zen-flex-1 zen-overflow-x-scroll zen-overflow-y-hidden"
          >
            <div style={{ width: axisWidth, height: 1 }} />
          </div>
        </div>
      )}
    </div>
  );
}

interface ScheduleRowProps<R extends ScheduleRowShape> {
  row: R;
  columns: ScheduleColumn<R>[];
  axisColumns: PlanningColumn[];
  columnWidths: number[];
  /** A continuous axis draws only these columns, positioned; null draws all. */
  columnWindow: { first: number; last: number; offsets: number[] } | null;
  axisWidth: number;
  paneWidth: number;
  timelineColIndex: number;
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
  rowClass?: string;
  /** Which cell of THIS row carries the grid's single tab stop, or -1. */
  tabCol: number;
  onFocusCell: (row: number, col: number) => void;
}

function ScheduleRow<R extends ScheduleRowShape>({
  row,
  columns,
  axisColumns,
  columnWindow,
  columnWidths,
  axisWidth,
  paneWidth,
  timelineColIndex,
  renderTrack,
  rowHeight,
  rowClass,
  tabCol,
  onFocusCell,
}: ScheduleRowProps<R>) {
  const timelineCol = columns.length;
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
      className={cn(
        "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0",
        /* The frozen pane is the row's CHILD, so it covers the row's content
           box and stops one pixel short of its bottom border. Whatever is drawn
           over the axis at that height then shows through the pane as it
           scrolls under: a dependency line routed along a row boundary crossed
           the whole pane, and the today marker left a dot on every rule. The
           pane redraws the rule itself, one pixel below its own box and at its
           own stacking level. Not on the last row, which has no rule to cover. */
        "[&:not(:last-child)>div:first-child]:zen-shadow-[0_1px_0_0_var(--zen-color-border)]",
        rowClass,
      )}
      style={{ height: rowHeight, boxSizing: "border-box" }}
    >
      <div
        className="zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background"
        style={{ width: paneWidth, insetInlineStart: 0 }}
      >
        {columns.map((column, col) => (
          <div
            key={column.key}
            role="gridcell"
            aria-colindex={column.colIndex}
            /* How the keyboard finds a cell that may not have been in the DOM
               when the move was decided — see the focus effect. */
            data-gantt-cell={`${row.index}:${col}`}
            tabIndex={tabCol === col ? 0 : -1}
            onFocus={() => onFocusCell(row.index, col)}
            aria-label={column.ariaLabel?.(row)}
            className={cn("zen-flex zen-items-center", column.className ?? "zen-px-2", CELL_FOCUS_CLASS)}
            style={{ width: column.width, ...column.style?.(row) }}
          >
            {column.render(row)}
          </div>
        ))}
      </div>

      <div
        role="gridcell"
        aria-colindex={timelineColIndex}
        data-gantt-cell={`${row.index}:${timelineCol}`}
        tabIndex={tabCol === timelineCol ? 0 : -1}
        onFocus={() => onFocusCell(row.index, timelineCol)}
        className={cn("zen-relative zen-shrink-0", CELL_FOCUS_CLASS)}
        style={{ width: axisWidth }}
      >
        {/* The column rules as a background layer rather than as parents of the
            bar: a bar spanning four days cannot live inside one day's box.

            On a row the caller has tinted (a rowClassName band) the shading
            turns TRANSLUCENT, so the band still shows on a weekend or on today.
            Only there: an untinted row keeps the shade it always had, because
            40% of a pale grey over white all but disappears. color-mix rather
            than `/40`: the theme colours are bare var()s, and UnoCSS drops an
            alpha modifier on those without a word — `/40` has always come out
            fully opaque, which is the look every untinted chart has today. */}
        <div aria-hidden="true" className="zen-absolute zen-inset-0 zen-flex">
          {(columnWindow ? columnWindow.offsets.map((_, k) => columnWindow.first + k) : axisColumns.map((_, i) => i)).map((i) => {
            const column = axisColumns[i];
            const offset = columnWindow ? columnWindow.offsets[i - columnWindow.first] : undefined;
            return (
              <div
                key={column.start.getTime()}
                className={cn(
                  "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                  offset !== undefined && "zen-absolute zen-inset-y-0",
                  column.nonWorking &&
                    (rowClass
                      ? "zen-bg-[color-mix(in_srgb,var(--zen-color-muted)_40%,transparent)]"
                      : "zen-bg-zen-muted"),
                  column.today &&
                    (rowClass
                      ? "zen-bg-[color-mix(in_srgb,var(--zen-color-primary-soft)_40%,transparent)]"
                      : "zen-bg-zen-primary-soft"),
                )}
                style={offset !== undefined ? { width: columnWidths[i], insetInlineStart: offset } : { width: columnWidths[i] }}
              />
            );
          })}
        </div>

        {renderTrack(row, axisWidth)}
      </div>
    </div>
  );
}
