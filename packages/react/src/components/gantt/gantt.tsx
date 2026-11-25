import * as React from "react";
import {
  flattenGanttTasks,
  formatGanttVariance,
  GANTT_STATUS_COLOR,
  ganttActualLayout,
  ganttLabelFits,
  ganttLabelPx,
  ganttLegendItems,
  ganttConnectors,
  ganttFitRange,
  nowPct,
  placeAppointment,
  type GanttActualLayout,
  type GanttBarAnchor,
  type GanttLegendItem,
  type GanttCalendar,
  type GanttDependency,
  type GanttDependencyStyle,
  type GanttConnector,
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
  ScheduleGrid,
  useScheduleAxis,
  useScrollerMetrics,
  type ScheduleColumn,
} from "./schedule-grid";
import { useLocale, type MessageKey } from "../locale/locale";

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

import { ganttBarPx, scheduleRowPx, type Density } from "@algorisys/zen-ui-core/density";
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — which is the y the connector routes are computed at. */
const barTop = (rowHeight: number, barPx: number) => (rowHeight - barPx) / 2;

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

const PANE_LABEL: Record<GanttPaneColumn, MessageKey> = {
  name: "gantt.column.name",
  assignees: "gantt.column.assignees",
  status: "gantt.column.status",
  variance: "gantt.column.variance",
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
/** A caller's colour mixed into the background — the soft version of it, as the
 *  palette's `-soft` tokens are of theirs. */
const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--zen-color-background))`;
/** The planned bar's look in a caller's colour: soft fill, the colour as its border. */
const softSkin = (color: string): React.CSSProperties => ({ backgroundColor: tint(color, 18), borderColor: color });

/* A caller's label on a bar sits on a pill of the page background. The bar
   under it can be any colour — a caller's, a fill that stops halfway along the
   text — so no single text colour is readable on all of it; the pill makes the
   text sit on the one surface whose contrast the theme already guarantees. */
const LABEL_PILL_CLASS = "zen-inset-y-0.5 zen-start-1 zen-rounded-zen-sm zen-px-1 zen-text-zen-foreground";
const LABEL_PILL_STYLE: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, var(--zen-color-background) 80%, transparent)",
};

/** The chart's key: a swatch and a name per entry. A list, so it is read as one. */
const GanttLegend = ({ items }: { items: GanttLegendItem[] }) => {
  const loc = useLocale();
  return (
    <ul aria-label={loc.t("gantt.legend")} className="zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-items-center zen-gap-x-3 zen-gap-y-1 zen-p-0">
      {items.map((item) => (
        <li key={`${item.label}\u0000${item.color}`} className="zen-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg">
          {/* Bordered, so a light colour — the plan's grey — still reads as a swatch. */}
          <span
            aria-hidden="true"
            className="zen-inline-block zen-h-2.5 zen-w-2.5 zen-shrink-0 zen-rounded-full zen-border zen-border-zen-border"
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
};

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
  "on-track": "zen-bg-zen-info-soft zen-border-zen-info",
  delayed: "zen-bg-zen-error-soft zen-border-zen-error",
  complete: "zen-bg-zen-success-soft zen-border-zen-success",
};

const FILL_CLASS: Record<GanttTaskStatus, string> = {
  "not-started": "zen-bg-zen-neutral",
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

const STATUS_LABEL: Record<GanttTaskStatus, MessageKey> = {
  "not-started": "gantt.status.notStarted",
  "on-track": "gantt.status.onTrack",
  delayed: "gantt.status.delayed",
  complete: "gantt.status.complete",
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
  rowHeight: rowHeightProp,
  maxBodyHeight,
  headerClassName,
  headerGroups: headerGroupsProp,
  continuous,
  density,
  rowClassName,
  barClassName,
  barAccent,
  actualLayout = "strip",
  deriveFromActuals,
  actualBarClassName,
  actualBarColor,
  barLabel,
  actualBarLabel,
  progressOn = "planned",
  statusColor,
  legend,
  monthColumns,
  dependencyStyle,
  className,
}: GanttProps) => {
  const loc = useLocale();
  // Never shorter than a bar plus a few px, or the bar would overhang its row.
  // Density sets the row and bar; an explicit rowHeight wins over it.
  const barPx = ganttBarPx(density);
  const rowHeight = Math.max(barPx + 4, scheduleRowPx(density, rowHeightProp));
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
  /* The plan's padded span: what Fit shows, and what a continuous axis spans.
     Computed only when one of them needs it. */
  const planSpan = React.useMemo(
    () => (view === "fit" || continuous ? ganttFitRange(tasks ?? [], { calendar, now }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nowTime is `now`, by value
    [view, continuous, tasks, calendar, nowTime],
  );
  const fitRange = view === "fit" ? planSpan : null;
  // Continuous turns the date row on, because a scrolled axis needs it; an
  // explicit `headerGroups={false}` still wins.
  const headerGroups = headerGroupsProp ?? !!continuous;

  /* The pane's columns are DATA, which is what lets the grid underneath know
     nothing about tasks — and what a second schedule component will hand it a
     different list of. */
  const requestedPane = paneColumnsProp ?? DEFAULT_PANE;
  const paneColumns = React.useMemo<ScheduleColumn<Row>[]>(
    () =>
      requestedPane.map((key) => ({
        key,
        label: loc.t(PANE_LABEL[key]),
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
        render: (row: Row) => (
          <GanttPaneCell column={key} row={row} onToggle={toggle} tone={statusColor?.(row.task, row) || undefined} />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedPane.join(","), expandedIds, tasks, loc, statusColor],
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
    grouped: headerGroups,
    continuous,
    plan: planSpan,
    monthUnit: monthColumns,
  });
  const { range, axisWidth, minGapMs } = axis;

  const { rows, rowIndexById } = React.useMemo(
    () =>
      flattenGanttTasks<GanttTask>(
        tasks ?? [],
        (task) => (expandedSet === null ? true : expandedSet.has(task.id)),
        now,
        { calendar, minGapMs, deriveFromActuals },
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tasks, expandedSet, nowTime, calendar, minGapMs, deriveFromActuals],
  );

  /* The key. Built from the rows when asked for with `true`: the label each
     row's chip shows and the colour it is drawn in, once each. */
  const legendItems = React.useMemo((): GanttLegendItem[] => {
    if (!legend) return [];
    if (Array.isArray(legend)) return legend;
    return ganttLegendItems(rows, (row) => ({
      label: row.task.statusLabel ?? loc.t(STATUS_LABEL[row.status]),
      color: statusColor?.(row.task, row) || GANTT_STATUS_COLOR[row.status],
    }));
  }, [legend, rows, statusColor, loc]);

  /** One placement per row, and the same placements keyed by every task id —
   *  including ids folded into a collapsed parent, which is what keeps their
   *  dependency arrows pointing at the summary bar instead of vanishing. */
  const placements = React.useMemo(() => {
    const map = new Map<number, PlanningPlacement>();
    for (const row of rows) {
      if (!row.span) continue;
      // A milestone is a POINT: where its date falls on the axis, or nowhere.
      // placeAppointment would give it a minimum-width sliver of a bar.
      if (row.task.milestone) {
        const at = nowPct(range, row.span.start);
        if (at !== null) map.set(row.index, { startPct: at, widthPct: 0, clippedStart: false, clippedEnd: false });
        continue;
      }
      const placement = placeAppointment(row.span, range);
      if (placement) map.set(row.index, placement);
    }
    return map;
  }, [rows, range]);

  const connectors = React.useMemo(() => {
    if (!showDependencies || !dependencies || dependencies.length === 0) return [];
    const anchors = new Map<string, GanttBarAnchor>();
    /* A milestone's anchor spans the diamond, so an arrow meets its left or
       right tip instead of disappearing under it at the centre. */
    const halfPct = axisWidth > 0 ? (barPx / 2 / axisWidth) * 100 : 0;
    for (const [id, index] of rowIndexById) {
      const placement = placements.get(index);
      if (!placement) continue;
      if (rows[index]?.task.milestone) {
        anchors.set(id, { rowIndex: index, startPct: placement.startPct - halfPct, widthPct: 2 * halfPct });
      } else {
        anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
      }
    }
    return ganttConnectors(anchors, dependencies, { axisWidth, rowHeight });
  }, [showDependencies, dependencies, rowIndexById, placements, rows, axisWidth, rowHeight, barPx]);

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
        rowHeight={rowHeight}
        barPx={barPx}
        barClass={barClassName?.(row.task) || undefined}
        accent={barAccent?.(row.task) || undefined}
        tone={statusColor?.(row.task, row) || undefined}
        plannedLabel={barLabel?.(row.task, row) || undefined}
        actualLabel={actualBarLabel?.(row.task, row) || undefined}
        progressOn={progressOn}
        actualLayout={actualLayout}
        actualClass={actualBarClassName?.(row.task) || undefined}
        actualColor={actualBarColor?.(row.task) || undefined}
      />
    ),
    [
      range,
      placements,
      onTaskClick,
      rowHeight,
      barPx,
      barClassName,
      barAccent,
      actualLayout,
      actualBarClassName,
      actualBarColor,
      statusColor,
      barLabel,
      actualBarLabel,
      progressOn,
    ],
  );

  // Memoized so the grid's memoized connector layer is not rebuilt every render.
  const connectorStyle = React.useMemo(
    () => (dependencyStyle ? (c: GanttConnector) => dependencyStyle(c.dependency) : undefined),
    [dependencyStyle],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
          className,
        )}
        role="status"
        aria-label={loc.t("gantt.loadingSchedule")}
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
            <EmptyStateTitle>{loc.t("gantt.nothingScheduled")}</EmptyStateTitle>
            <EmptyStateDescription>
              {loc.t("gantt.addATaskWithA")}
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
        rowHeight={rowHeight}
        rowClass={rowClassName ? (row) => rowClassName(row.task, row) : undefined}
        maxBodyHeight={maxBodyHeight}
        headerClassName={headerClassName}
        headerGroups={headerGroups}
        view={view}
        anchor={anchor}
        now={now}
        connectors={connectors}
        connectorStyle={connectorStyle}
        views={views}
        hideToolbar={hideToolbar}
        legend={legendItems.length > 0 ? <GanttLegend items={legendItems} /> : undefined}
        onViewChange={setView}
        onDateChange={setDate}
        onToggle={(row) => toggle(row.task.id)}
        onActivate={(row) => onTaskClick?.(row.task, row)}
        ariaLabel={loc.t("gantt.projectSchedule")}
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
  tone,
}: {
  column: GanttPaneColumn;
  row: Row;
  onToggle: (id: string) => void;
  tone?: string;
}) => {
  const loc = useLocale();
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
            aria-label={loc.t(row.expanded ? "gantt.collapseTask" : "gantt.expandTask", { name: task.name })}
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
          {/* One line per entry: "Planned: 1–5 Jul" and "Actual: 1–4 Jul" under
              the name. Give the rows the height (`rowHeight`) for the lines. */}
          {(task.subtitle === undefined ? [] : ([] as string[]).concat(task.subtitle)).map((line, i) => (
            <span key={i} className="zen-block zen-truncate zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg">
              {line}
            </span>
          ))}
        </span>
      </>
    );
  }

  if (column === "assignees") return <GanttAssignees assignees={task.assignees} />;

  if (column === "status") {
    return (
      <Badge
        variant="soft"
        color={tone ? "neutral" : STATUS_COLOR[row.status]}
        className="zen-truncate"
        /* A caller's colour: a tint of it behind the foreground, so the text
           keeps its contrast whatever colour the caller picked. */
        style={tone ? { backgroundColor: tint(tone, 22), color: "var(--zen-color-foreground)" } : undefined}
      >
        {task.statusLabel ?? loc.t(STATUS_LABEL[row.status])}
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
  rowHeight,
  barPx,
  barClass,
  accent,
  actualLayout,
  actualClass,
  actualColor,
  tone,
  plannedLabel,
  actualLabel,
  progressOn,
}: {
  row: Row;
  range: PlanningRange;
  axisWidth: number;
  placement: PlanningPlacement | null;
  onTaskClick?: (task: GanttTask, row: Row) => void;
  rowHeight: number;
  barPx: number;
  barClass?: string;
  accent?: string;
  actualLayout: GanttActualLayout;
  actualClass?: string;
  actualColor?: string;
  /** A caller's colour for this row's status (`statusColor`), replacing the status palette. */
  tone?: string;
  /** Text on the planned bar (`barLabel`), replacing its "60%". */
  plannedLabel?: string;
  /** Text on the actual bar (`actualBarLabel`). */
  actualLabel?: string;
  progressOn: "planned" | "actual";
}) => {
  const loc = useLocale();
  const { task } = row;
  /* Where the planned and actual bars sit. In "strip" the planned bar is
     exactly where it always was; only "split" moves it, and only then. */
  const geo = ganttActualLayout(rowHeight, barPx, actualLayout);
  const actualPlacement = row.actual && !task.milestone ? placeAppointment(row.actual, range) : null;
  /** Said with the planned bar, so a row stays one name: the actual bar is drawn, not announced twice. */
  const actualText =
    !row.actual || task.milestone
      ? ""
      : row.actual.open
        ? loc.t("gantt.actualRunning", { start: formatDay(row.actual.start) })
        : loc.t("gantt.actualSpan", { start: formatDay(row.actual.start), end: formatDay(row.actual.end) });
  const progress = row.progress ?? 0;
  const pct = `${Math.round(progress)}%`;

  /* Which bar carries the progress — and with it the status colour. Moved to
     the actual bar, the plan becomes a neutral reference: two bars both
     shouting the status is one too many. */
  const progressOnActual = progressOn === "actual" && !!row.actual && !task.milestone;
  const plannedFill = row.progress !== null && !progressOnActual;
  /** The planned bar's skin: the status palette, a caller's colour, or — when the
   *  actual bar carries the progress — the neutral plan. */
  const plannedSkinClass = progressOnActual ? BAR_CLASS["not-started"] : tone ? "" : BAR_CLASS[row.status];
  const plannedSkinStyle: React.CSSProperties = !progressOnActual && tone ? softSkin(tone) : {};
  const fillClass = tone ? "" : FILL_CLASS[row.status];
  const fillStyle: React.CSSProperties = tone ? { backgroundColor: tone } : {};

  /* The planned bar's label: the caller's text, else the "60%" it always had. */
  const plannedText = plannedLabel ?? (plannedFill ? pct : null);
  const widthPx = placement ? (placement.widthPct / 100) * axisWidth : 0;
  const labelOutside = plannedLabel ? !ganttLabelFits(plannedLabel, widthPx) : widthPx < LABEL_MIN_PX;
  const labelOnFill = plannedFill && !labelOutside && progress >= LABEL_MAX_PCT;
  /* Which SIDE the outside label goes. After the bar normally; before it when
     the bar ends against the edge of the axis and there is nowhere after. */
  const endPct = placement ? placement.startPct + placement.widthPct : 0;
  const labelBefore =
    ((100 - endPct) / 100) * axisWidth < (plannedLabel ? ganttLabelPx(plannedLabel) : LABEL_OUTSIDE_PX);

  /**
   * The bar's working stretches, as percentages OF THE BAR, with the progress
   * fill handed out along them.
   *
   * The fill is distributed by working duration rather than given to each piece
   * equally: 40% complete on a job that runs an hour on Friday and seven on
   * Monday means the Friday piece is full and the Monday one has barely
   * started, not that both are 40% shaded.
   */
  const pieces = React.useMemo(() => {
    if (!row.segments || !row.span) return null;
    /* Percentages of the VISIBLE bar, not of the whole span. `placeAppointment`
       clips a bar to the range, so the button is only the part in view — and
       measuring against the full span would squash and shift every piece the
       moment a job started before the range. */
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

  /* The actual bar. Two skins. By default it is SOLID — the settled fact under
     the soft plan. When it carries the progress (`progressOn="actual"`) it
     takes the planned bar's look instead: soft, bordered, filled to its %. */
  const actualTone = actualColor ?? tone;
  const actualWidthPx = actualPlacement ? (actualPlacement.widthPct / 100) * axisWidth : 0;
  const actualFill = progressOnActual && row.progress !== null;
  const actualLabelText = actualLabel ?? (actualFill ? pct : null);
  /* Inside only when it fits AND the bar is tall enough to hold a line of
     text — a 6px strip never is. */
  const actualLabelInside = !!actualLabelText && geo.actualHeight >= 12 && ganttLabelFits(actualLabelText, actualWidthPx);
  const actualEndPct = actualPlacement ? actualPlacement.startPct + actualPlacement.widthPct : 0;
  const actualLabelBefore = ((100 - actualEndPct) / 100) * axisWidth < ganttLabelPx(actualLabelText ?? "");

  /* The actual bar: when the work really ran. A sibling of the planned bar,
     not inside it, because the two have different extents — it can start
     before the plan and run past it, or exist when the plan is off-screen.
     Hidden from assistive tech: its dates are already in the planned bar's
     name. An open (still running) end is squared off, like a bar cut by the
     range: it has not ended, it has reached now. */
  const actualBar = actualPlacement && (
    <>
      <span
        aria-hidden="true"
        data-gantt-actual=""
        data-gantt-actual-open={row.actual?.open ? "" : undefined}
        className={cn(
          "zen-pointer-events-none zen-absolute zen-overflow-hidden zen-rounded-zen-sm",
          progressOnActual
            ? cn("zen-border", !actualTone && BAR_CLASS[row.status])
            : !actualTone && FILL_CLASS[row.status],
          actualPlacement.clippedStart && "zen-rounded-s-none",
          (actualPlacement.clippedEnd || row.actual?.open) && "zen-rounded-e-none",
          actualClass,
        )}
        style={{
          insetInlineStart: `${actualPlacement.startPct}%`,
          width: `${actualPlacement.widthPct}%`,
          top: geo.actualTop,
          height: geo.actualHeight,
          ...(actualTone ? (progressOnActual ? softSkin(actualTone) : { backgroundColor: actualTone }) : {}),
        }}
      >
        {actualFill && (
          <span
            className={cn("zen-absolute zen-inset-y-0 zen-start-0", !actualTone && FILL_CLASS[row.status])}
            style={{ width: `${progress}%`, ...(actualTone ? { backgroundColor: actualTone } : {}) }}
          />
        )}
        {actualLabelInside && (
          <span
            className={cn(
              "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
              LABEL_PILL_CLASS,
            )}
            style={LABEL_PILL_STYLE}
          >
            {actualLabelText}
          </span>
        )}
      </span>
      {actualLabelText && !actualLabelInside && (
        <span
          aria-hidden="true"
          className="zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg"
          style={{
            ...(actualLabelBefore
              ? { insetInlineEnd: `calc(${100 - actualPlacement.startPct}% + 4px)` }
              : { insetInlineStart: `calc(${actualEndPct}% + 4px)` }),
            top: geo.actualTop,
            height: geo.actualHeight,
          }}
        >
          {actualLabelText}
        </span>
      )}
    </>
  );

  /* An empty gridcell is announced as "blank", which is correct for a cell with
     no data and wrong for THIS one: the reader arrowed to the timeline
     expecting a bar, and "blank" does not distinguish "no dates" from "starts
     after the range you are looking at". */
  if (!placement)
    return (
      <>
        <span className="zen-sr-only">
          {row.span ? loc.t("gantt.notInRange") : loc.t("gantt.noDates")}
          {actualText ? `, ${actualText}` : ""}
        </span>
        {actualBar}
      </>
    );

  /* A milestone: one date, drawn as a diamond centred on it. The same hooks as
     a bar — data-gantt-bar, not tabbable, the same click — so the keyboard
     model, the focus effect and the DOM checks treat it as one. The diamond is
     a square turned 45 degrees, sized so its diagonal is the bar height; its
     colour is the status FILL (solid), so a point stands out among soft bars.
     shrink-0 because the flex button would otherwise squeeze it to a sliver.
     An accent is a border INSIDE the diamond: a ring outside it would push
     past the tips the dependency arrows end on. */
  if (task.milestone) {
    const side = barPx / Math.SQRT2;
    return (
      <button
        type="button"
        onClick={() => onTaskClick?.(task, row)}
        tabIndex={-1}
        data-gantt-bar=""
        data-gantt-milestone=""
        className={cn(
          "zen-absolute zen-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        )}
        style={{
          insetInlineStart: `calc(${placement.startPct}% - ${barPx / 2}px)`,
          top: barTop(rowHeight, barPx),
          width: barPx,
          height: barPx,
        }}
        title={`${task.name} · ${formatDay(row.span!.start)}`}
      >
        <span className="zen-sr-only">
          {loc.t("gantt.milestone", {
            date: formatDay(row.span!.start),
            status: loc.t(STATUS_LABEL[row.status]),
          })}
        </span>
        <span
          aria-hidden="true"
          data-gantt-accent={accent ? "" : undefined}
          className={cn("zen-block zen-shrink-0 zen-rotate-45 zen-rounded-[2px]", fillClass, barClass)}
          style={{
            width: side,
            height: side,
            ...fillStyle,
            ...(accent ? { boxSizing: "border-box", borderWidth: 2, borderStyle: "solid", borderColor: accent } : {}),
          }}
        />
      </button>
    );
  }

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
          pieces === null && cn("zen-overflow-hidden zen-border", plannedSkinClass, barClass),
          /* Square off a cut edge so a bar continuing past the view does
             not look like it ends there. */
          pieces === null && placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
          pieces === null && placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          onTaskClick && "hover:zen-brightness-95",
        )}
        style={{
          insetInlineStart: `${placement.startPct}%`,
          width: `${placement.widthPct}%`,
          top: geo.barTop,
          height: geo.barHeight,
          ...(pieces === null ? plannedSkinStyle : {}),
        }}
        title={`${task.name} · ${formatDay(row.span!.start)} – ${formatDay(row.span!.end)}${
          row.progress === null ? "" : ` · ${pct}`
        }${actualText ? ` · ${actualText}` : ""}`}
      >
        <span className="zen-sr-only">
          {loc.t(row.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
            start: formatDay(row.span!.start),
            end: formatDay(row.span!.end),
            status: loc.t(STATUS_LABEL[row.status]),
            percent: Math.round(progress),
          })}
          {actualText ? `, ${actualText}` : ""}
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
              className={cn("zen-absolute zen-inset-y-0 zen-overflow-hidden", plannedSkinClass, "zen-rounded-zen-sm zen-border", barClass)}
              style={{ insetInlineStart: `${piece.startPct}%`, width: `${piece.widthPct}%`, ...plannedSkinStyle }}
            >
              {plannedFill && piece.fillPct > 0 && (
                <span
                  className={cn("zen-absolute zen-inset-y-0 zen-start-0", fillClass)}
                  style={{ width: `${piece.fillPct}%`, ...fillStyle }}
                />
              )}
            </span>
          ))}
        {pieces === null && plannedFill && (
          <span
            aria-hidden="true"
            className={cn("zen-absolute zen-inset-y-0 zen-start-0", fillClass)}
            style={{ width: `${progress}%`, ...fillStyle }}
          />
        )}
        {plannedText && !labelOutside && (
          <span
            aria-hidden="true"
            className={cn(
              "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
              plannedLabel
                ? LABEL_PILL_CLASS
                : labelOnFill
                  ? cn("zen-inset-y-0 zen-start-1", tone ? "zen-text-zen-foreground" : FILL_TEXT_CLASS[row.status])
                  : "zen-inset-y-0 zen-end-1 zen-text-zen-foreground",
            )}
            style={plannedLabel ? LABEL_PILL_STYLE : undefined}
          >
            {plannedText}
          </span>
        )}
        {/* Last, so it sits over the fill: the stripe is the row's identity
            and the fill its progress, and both have to stay visible. */}
        {accent && (
          <span
            aria-hidden="true"
            data-gantt-accent=""
            className="zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm"
            style={{ backgroundColor: accent }}
          />
        )}
      </button>

      {plannedText && labelOutside && (
        <span
          aria-hidden="true"
          className="zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg"
          style={{
            ...(labelBefore
              ? { insetInlineEnd: `calc(${100 - placement.startPct}% + 4px)` }
              : { insetInlineStart: `calc(${endPct}% + 4px)` }),
            top: geo.barTop,
            height: geo.barHeight,
          }}
        >
          {plannedText}
        </span>
      )}
      {actualBar}
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
