import { type JSX, createMemo, createSignal, For, Show } from "solid-js";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";
import {
  INDENT_PX,
  ScheduleGrid,
  createScheduleAxis,
  createScrollerMetrics,
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
 * windowing, the connector overlay and the treegrid keyboard model — lives in
 * ./schedule-grid, which knows nothing about tasks. What is here is what a
 * project schedule MEANS: the task shape, the four pane columns, the bar with
 * its progress fill and slip chip.
 *
 * All the arithmetic is in @algorisys/zen-ui-core, pinned by
 * scripts/check-gantt.ts, and this binding derives no dates of its own — which
 * is what lets it mirror the React one exactly rather than approximately. The
 * rendering is pinned too: `node scripts/check-schedule-dom.mjs solid` runs the
 * same assertions the React binding passes.
 *
 * It does NOT edit. Rescheduling a task in a real plan cascades through its
 * successors, and what should happen then is a policy question — does it push
 * the whole chain, does it need an approval, what does undo mean, who is
 * allowed. That belongs to the caller's domain. `onTaskClick` hands you the
 * task and its derived row; you open your own editor and hand back new `tasks`.
 *
 * The default view is `fit`: the axis range is the span of the tasks, so a plan
 * opens showing its own shape rather than whichever calendar month today falls
 * in. It is the only view that is never trivially wrong. Its range does not
 * depend on the anchor, so prev / next / today are HIDDEN while it is on — a
 * control that cannot change anything is worse than no control.
 *
 * ONE LAYOUT TRAP, and it is the caller's to avoid. The fit axis sizes itself
 * from the scroller's measured width, so it needs a container with a width of
 * its OWN. Drop the chart into a flex row or an inline-block whose width comes
 * from its content and the two define each other: measured on this repo's own
 * demo page, identical data rendered at 516px in one section and 1800px in
 * another, purely because the wrapper lacked `width: 100%`.
 *
 * Times are the caller's local `Date`s, deliberately unconverted.
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

  /** Uncontrolled starting view. Default "fit". */
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

  /** Ids of the parents that are open. Controlled; pair with `onExpandedChange`. */
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
  /** Hours per column in the DAY view. Default 1; 0.25 for quarter-hour columns. */
  hourStep?: number;
  /** Reference "now" for the marker, the today column and the derived status. */
  now?: Date;
  /**
   * Nominal pixel width of one column. In the quarter, year and fit views
   * columns differ in length, so this sets the average rather than the literal
   * width. Setting it also opts the FIT view out of sizing itself to the
   * container, which is the one thing that view exists to do.
   */
  columnWidth?: number;
  /** Hide the toolbar when your page already has one. */
  hideToolbar?: boolean;

  /**
   * Which columns the frozen pane carries, and in what order. Default all four.
   *
   * The order is a PREFERENCE order: what you list last is what the pane sheds
   * first when the container is too narrow to hold both it and a usable axis.
   * The first entry is never dropped.
   */
  columns?: GanttPaneColumn[];

  /** Show skeleton rows instead of the chart. */
  loading?: boolean;
  /** How many skeleton rows. Default 6. */
  loadingRows?: number;
  /** Replaces the whole no-tasks surface. */
  emptyState?: JSX.Element;

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

  class?: string;
}

import { ganttBarPx, scheduleRowPx, type Density } from "@algorisys/zen-ui-core/density";

/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — which is the y the connector routes are computed at. */
const barTop = (rowHeight: number, barPx: number) => (rowHeight - barPx) / 2;

/**
 * The frozen pane's columns. Fixed widths, because a sticky pane cannot be
 * sized by its content without moving as you scroll.
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
 * exactly what lets a partially rendered row be announced correctly.
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
 * Under ~44px of bar there is no room for "100%" and it clips to "10", so the
 * label moves out beside the bar. Past ~85% done the fill has reached the
 * inline end, so a label sitting there would be solid-on-solid — it moves to
 * the inline START instead, onto the fill, in the fill's own foreground colour.
 */
/** A caller's colour mixed into the background — the soft version of it, as the
 *  palette's `-soft` tokens are of theirs. */
const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--zen-color-background))`;
/** The planned bar's look in a caller's colour: soft fill, the colour as its border. */
const softSkin = (color: string): JSX.CSSProperties => ({ "background-color": tint(color, 18), "border-color": color });

/** The chart's key: a swatch and a name per entry. A list, so it is read as one. */
const GanttLegend = (props: { items: GanttLegendItem[] }) => {
  const loc = useLocale();
  return (
    <ul aria-label={loc.t("gantt.legend")} class="zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-items-center zen-gap-x-3 zen-gap-y-1 zen-p-0">
      <For each={props.items}>
        {(item) => (
          <li class="zen-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg">
            {/* Bordered, so a light colour — the plan's grey — still reads as a swatch. */}
            <span
              aria-hidden="true"
              class="zen-inline-block zen-h-2.5 zen-w-2.5 zen-shrink-0 zen-rounded-full zen-border zen-border-zen-border"
              style={{ "background-color": item.color }}
            />
            {item.label}
          </li>
        )}
      </For>
    </ul>
  );
};

/* A caller's label on a bar sits on a pill of the page background. The bar
   under it can be any colour — a caller's, a fill that stops halfway along the
   text — so no single text colour is readable on all of it; the pill makes the
   text sit on the one surface whose contrast the theme already guarantees. */
const LABEL_PILL_CLASS = "zen-inset-y-0.5 zen-start-1 zen-rounded-zen-sm zen-px-1 zen-text-zen-foreground";
const LABEL_PILL_STYLE: JSX.CSSProperties = {
  "background-color": "color-mix(in srgb, var(--zen-color-background) 80%, transparent)",
};

const LABEL_MIN_PX = 44;
const LABEL_MAX_PCT = 85;
/**
 * Room an outside label needs after the bar before it is put in front of it.
 * Without this a task finishing at the end of the range draws its label PAST
 * the axis, which widens the scroller and makes the chart scroll sideways to
 * reveal two characters of grey text.
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

export const Gantt = (props: GanttProps) => {
  const loc = useLocale();
  // Never shorter than a bar plus a few px, or the bar would overhang its row.
  // Density sets the row and bar; an explicit rowHeight wins over it. ROW_PX
  // stays the comfortable size (core/density agrees: check:density).
  const barPx = () => ganttBarPx(props.density);
  const rowHeight = () => Math.max(barPx() + 4, scheduleRowPx(props.density, props.rowHeight));
  /* Fit, not month, and certainly not week. A seven-day window is right for a
     calendar and wrong for a plan; a month is right for a plan that fits in one
     and wrong for the majority that do not. Fit is the only default that is
     never trivially wrong, because it is the only one derived from the data
     rather than from today's date. */
  const [innerView, setInnerView] = createSignal<GanttView>(props.defaultView ?? "fit");
  const [innerDate, setInnerDate] = createSignal<Date>(props.defaultDate ?? new Date());
  /* null is not "nothing open", it is "no answer given" — the default, which is
     everything open. Storing the resolved list instead would freeze the answer
     at mount and silently leave later-arriving tasks collapsed. */
  const [innerExpanded, setInnerExpanded] = createSignal<string[] | null>(props.defaultExpanded ?? null);

  const scroller = createScrollerMetrics();

  const view = () => props.view ?? innerView();
  const anchor = () => props.date ?? innerDate();
  /* Read once per MOUNT, not per read. Two `new Date()`s in one pass can
     straddle a millisecond and leave the marker and the today column
     disagreeing — and a fresh one per read would invalidate every memo below on
     every scroll tick. Pass `now` to control it. */
  const mountedAt = new Date();
  const now = () => props.now ?? mountedAt;

  const setDate = (next: Date) => {
    if (props.date === undefined) setInnerDate(next);
    props.onDateChange?.(next);
  };

  const expandedIds = () => props.expanded ?? innerExpanded();
  const expandedSet = createMemo(() => {
    const ids = expandedIds();
    return ids === null ? null : new Set(ids);
  });
  const toggle = (id: string) => {
    const base = expandedIds() ?? parentIds(props.tasks ?? []);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    if (props.expanded === undefined) setInnerExpanded(next);
    props.onExpandedChange?.(next);
  };

  /* Null when not fitting, and ALSO null when fitting a plan in which nothing
     has dates yet. Both fall through to the anchored month, so the axis and the
     toolbar still make sense while the dates are being filled in. */
  /* The plan's padded span: what Fit shows, and what a continuous axis spans.
     Computed only when one of them needs it. */
  const planSpan = createMemo(() =>
    view() === "fit" || props.continuous ? ganttFitRange(props.tasks ?? [], { calendar: props.calendar, now: now() }) : null,
  );
  const fitRange = () => (view() === "fit" ? planSpan() : null);
  // Continuous turns the date row on, because a scrolled axis needs it; an
  // explicit `headerGroups={false}` still wins.
  const headerGroups = () => props.headerGroups ?? !!props.continuous;

  /* The pane's columns are DATA, which is what lets the grid underneath know
     nothing about tasks. */
  const requestedPane = () => props.columns ?? DEFAULT_PANE;
  const paneSpec = createMemo(() => requestedPane().map((key) => ({ key, width: PANE_PX[key] })));

  const axis = createScheduleAxis(() => ({
    view: view(),
    anchor: anchor(),
    fitRange: fitRange(),
    now: now(),
    calendar: props.calendar,
    hourStep: props.hourStep,
    columnWidth: props.columnWidth,
    paneColumns: paneSpec(),
    available: scroller.metrics().width,
    grouped: headerGroups(),
    continuous: props.continuous,
    plan: planSpan(),
    monthUnit: props.monthColumns,
  }));

  const flat = createMemo(() => {
    const set = expandedSet();
    return flattenGanttTasks<GanttTask>(
      props.tasks ?? [],
      (task) => (set === null ? true : set.has(task.id)),
      now(),
      { calendar: props.calendar, minGapMs: axis.minGapMs(), deriveFromActuals: props.deriveFromActuals },
    );
  });
  const rows = () => flat().rows;

  /* The key. Built from the rows when asked for with `true`: the label each
     row's chip shows and the colour it is drawn in, once each. */
  const legendItems = createMemo((): GanttLegendItem[] => {
    const legend = props.legend;
    if (!legend) return [];
    if (Array.isArray(legend)) return legend;
    return ganttLegendItems(rows(), (row) => ({
      label: row.task.statusLabel ?? loc.t(STATUS_LABEL[row.status]),
      color: props.statusColor?.(row.task, row) || GANTT_STATUS_COLOR[row.status],
    }));
  });

  /** One placement per row, and the same placements keyed by every task id —
   *  including ids folded into a collapsed parent, which is what keeps their
   *  dependency arrows pointing at the summary bar instead of vanishing. */
  const placements = createMemo(() => {
    const map = new Map<number, PlanningPlacement>();
    for (const row of rows()) {
      if (!row.span) continue;
      // A milestone is a POINT: where its date falls on the axis, or nowhere.
      // placeAppointment would give it a minimum-width sliver of a bar.
      if (row.task.milestone) {
        const at = nowPct(axis.range(), row.span.start);
        if (at !== null) map.set(row.index, { startPct: at, widthPct: 0, clippedStart: false, clippedEnd: false });
        continue;
      }
      const placement = placeAppointment(row.span, axis.range());
      if (placement) map.set(row.index, placement);
    }
    return map;
  });

  const connectors = createMemo(() => {
    if (props.showDependencies === false) return [];
    const links = props.dependencies;
    if (!links || links.length === 0) return [];
    const anchors = new Map<string, GanttBarAnchor>();
    /* A milestone's anchor spans the diamond, so an arrow meets its left or
       right tip instead of disappearing under it at the centre. */
    const halfPct = axis.axisWidth() > 0 ? (barPx() / 2 / axis.axisWidth()) * 100 : 0;
    for (const [id, index] of flat().rowIndexById) {
      const placement = placements().get(index);
      if (!placement) continue;
      if (rows()[index]?.task.milestone) {
        anchors.set(id, { rowIndex: index, startPct: placement.startPct - halfPct, widthPct: 2 * halfPct });
      } else {
        anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
      }
    }
    return ganttConnectors(anchors, links, { axisWidth: axis.axisWidth(), rowHeight: rowHeight() });
  });

  const setView = (next: GanttView) => {
    /* Leaving fit re-anchors, when the anchor is nowhere near the plan.
       Otherwise the obvious gesture — open on fit, click Month to zoom in —
       lands on today's month, which for a plan that runs next spring is an
       empty axis and reads as the data having vanished. */
    const fit = fitRange();
    if (view() === "fit" && next !== "fit" && fit) {
      const from = fit.start.getTime();
      const to = fit.end.getTime();
      const anchorTime = anchor().getTime();
      if (anchorTime < from || anchorTime >= to) {
        const nowTime = now().getTime();
        setDate(nowTime >= from && nowTime < to ? now() : fit.start);
      }
    }
    if (props.view === undefined) setInnerView(next);
    props.onViewChange?.(next);
  };

  const paneColumns = createMemo<ScheduleColumn<Row>[]>(() =>
    requestedPane().map((key) => ({
      key,
      label: loc.t(PANE_LABEL[key]),
      width: PANE_PX[key],
      colIndex: COL_INDEX[key],
      class: key === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style:
        key === "name"
          ? (row: Row) => ({ "padding-inline-start": `${8 + row.depth * INDENT_PX}px` })
          : undefined,
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
        <GanttPaneCell column={key} row={row} onToggle={toggle} tone={props.statusColor?.(row.task, row) || undefined} />
      ),
    })),
  );

  return (
    <Show
      when={!props.loading}
      fallback={
        <div
          class={cn(
            "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
            props.class,
          )}
          role="status"
          aria-label={loc.t("gantt.loadingSchedule")}
        >
          <For each={Array.from({ length: props.loadingRows ?? 6 }, (_, i) => i)}>
            {(i) => (
              <div class="zen-flex zen-items-center zen-gap-3">
                <Skeleton class="zen-h-4" style={{ width: `${PANE_PX.name - 24 - (i % 3) * INDENT_PX}px` }} />
                <Skeleton class="zen-h-4 zen-w-16" />
                <Skeleton
                  class="zen-h-4"
                  /* Staggered so the placeholder reads as a schedule rather than
                     as a table — the shape is the information here. */
                  style={{ "margin-inline-start": `${(i * 37) % 45}%`, width: `${20 + ((i * 13) % 30)}%` }}
                />
              </div>
            )}
          </For>
        </div>
      }
    >
      <Show
        when={rows().length > 0}
        fallback={
          <div class={cn("zen-w-full", props.class)}>
            {props.emptyState ?? (
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
        }
      >
        <ScheduleGrid<Row>
          rows={rows()}
          rowId={(row) => row.task.id}
          columns={paneColumns()}
          colCount={5}
          timelineColIndex={COL_INDEX.timeline}
          renderTrack={(row, axisWidth) => (
            <GanttTrack
              row={row}
              range={axis.range()}
              axisWidth={axisWidth}
              placement={placements().get(row.index) ?? null}
              onTaskClick={props.onTaskClick}
              rowHeight={rowHeight()}
              barPx={barPx()}
              barClass={props.barClassName?.(row.task) || undefined}
              accent={props.barAccent?.(row.task) || undefined}
              tone={props.statusColor?.(row.task, row) || undefined}
              plannedLabel={props.barLabel?.(row.task, row) || undefined}
              actualLabel={props.actualBarLabel?.(row.task, row) || undefined}
              progressOn={props.progressOn ?? "planned"}
              actualLayout={props.actualLayout ?? "strip"}
              actualClass={props.actualBarClassName?.(row.task) || undefined}
              actualColor={props.actualBarColor?.(row.task) || undefined}
            />
          )}
          rowHeight={rowHeight()}
          rowClass={props.rowClassName ? (row) => props.rowClassName?.(row.task, row) : undefined}
          maxBodyHeight={props.maxBodyHeight}
          headerClassName={props.headerClassName}
          headerGroups={headerGroups()}
          view={view()}
          anchor={anchor()}
          now={now()}
          connectors={connectors()}
          connectorStyle={props.dependencyStyle ? (c) => props.dependencyStyle!(c.dependency) : undefined}
          views={props.views}
          hideToolbar={props.hideToolbar}
          legend={legendItems().length > 0 ? <GanttLegend items={legendItems()} /> : undefined}
          onViewChange={setView}
          onDateChange={setDate}
          onToggle={(row) => toggle(row.task.id)}
          onActivate={(row) => props.onTaskClick?.(row.task, row)}
          ariaLabel={loc.t("gantt.projectSchedule")}
          class={props.class}
          scrollerRef={scroller.ref}
          scroller={scroller.element}
          axis={axis}
          metrics={scroller.metrics}
          setMetrics={scroller.setMetrics}
        />
      </Show>
    </Show>
  );
};

/** What each of the four pane columns actually draws. */
const GanttPaneCell = (props: { column: GanttPaneColumn; row: Row; onToggle: (id: string) => void; tone?: string }) => {
  const loc = useLocale();
  const task = () => props.row.task;
  const varianceText = () => formatGanttVariance(props.row.variance);

  return (
    <>
      <Show when={props.column === "name"}>
        <Show
          when={props.row.hasChildren}
          fallback={
            /* A spacer, not a hidden chevron: leaves must line up with their
               siblings' text, or every leaf reads as one level shallower. */
            <span aria-hidden="true" class="zen-h-5 zen-w-5 zen-shrink-0" />
          }
        >
          <button
            type="button"
            /* Out of the tab order, in the grid's: the chevron is reached by
               arrowing to the first column and pressing the forward arrow, not
               by a tab stop per parent. */
            tabindex={-1}
            onClick={() => props.onToggle(task().id)}
            aria-label={loc.t(props.row.expanded ? "gantt.collapseTask" : "gantt.expandTask", { name: task().name })}
            class="zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
          >
            <Icon
              name={props.row.expanded ? "chevron-down" : "chevron-right"}
              size={14}
              class={props.row.expanded ? undefined : "rtl:zen-rotate-180"}
            />
          </button>
        </Show>
        <span class="zen-min-w-0">
          <span
            class={cn(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              props.row.hasChildren && "zen-font-semibold",
            )}
            title={task().name}
          >
            {task().name}
          </span>
          {/* One line per entry: "Planned: 1–5 Jul" and "Actual: 1–4 Jul" under
              the name. Give the rows the height (`rowHeight`) for the lines. */}
          <For each={task().subtitle === undefined ? [] : ([] as string[]).concat(task().subtitle!)}>
            {(line) => (
              <span class="zen-block zen-truncate zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg">{line}</span>
            )}
          </For>
        </span>
      </Show>

      <Show when={props.column === "assignees"}>
        <GanttAssignees assignees={task().assignees} />
      </Show>

      <Show when={props.column === "status"}>
        <Badge
          variant="soft"
          color={props.tone ? "neutral" : STATUS_COLOR[props.row.status]}
          class="zen-truncate"
          /* A caller's colour: a tint of it behind the foreground, so the text
             keeps its contrast whatever colour the caller picked. */
          style={props.tone ? { "background-color": tint(props.tone, 22), color: "var(--zen-color-foreground)" } : undefined}
        >
          {task().statusLabel ?? loc.t(STATUS_LABEL[props.row.status])}
        </Badge>
      </Show>

      <Show when={props.column === "variance" && varianceText()}>
        <Badge
          /* "+2d" is a signed number, and bidi reorders a leading sign to the
             far side in an RTL run — it renders as "2d+". */
          dir="ltr"
          variant="soft"
          color={
            props.row.variance === null || props.row.variance === 0
              ? "neutral"
              : props.row.variance > 0
                ? "error"
                : "success"
          }
        >
          {varianceText()}
        </Badge>
      </Show>
    </>
  );
};

/** The bar on the axis: one per row, broken into pieces where work stops. */
const GanttTrack = (props: {
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
  const task = () => props.row.task;
  /* Where the planned and actual bars sit. In "strip" the planned bar is
     exactly where it always was; only "split" moves it, and only then. */
  const geo = () => ganttActualLayout(props.rowHeight, props.barPx, props.actualLayout);
  const actualPlacement = () =>
    props.row.actual && !task().milestone ? placeAppointment(props.row.actual, props.range) : null;
  /** Said with the planned bar, so a row stays one name: the actual bar is drawn, not announced twice. */
  const actualText = () => {
    const a = props.row.actual;
    if (!a || task().milestone) return "";
    return a.open
      ? loc.t("gantt.actualRunning", { start: formatDay(a.start) })
      : loc.t("gantt.actualSpan", { start: formatDay(a.start), end: formatDay(a.end) });
  };
  const progress = () => props.row.progress ?? 0;
  const pct = () => `${Math.round(progress())}%`;

  /* Which bar carries the progress — and with it the status colour. Moved to
     the actual bar, the plan becomes a neutral reference: two bars both
     shouting the status is one too many. */
  const progressOnActual = () => props.progressOn === "actual" && !!props.row.actual && !task().milestone;
  const plannedFill = () => props.row.progress !== null && !progressOnActual();
  /** The planned bar's skin: the status palette, a caller's colour, or — when the
   *  actual bar carries the progress — the neutral plan. */
  const plannedSkinClass = () =>
    progressOnActual() ? BAR_CLASS["not-started"] : props.tone ? "" : BAR_CLASS[props.row.status];
  const plannedSkinStyle = (): JSX.CSSProperties =>
    !progressOnActual() && props.tone ? softSkin(props.tone) : {};
  const fillClass = () => (props.tone ? "" : FILL_CLASS[props.row.status]);
  const fillStyle = (): JSX.CSSProperties => (props.tone ? { "background-color": props.tone } : {});

  /* The planned bar's label: the caller's text, else the "60%" it always had. */
  const plannedText = () => props.plannedLabel ?? (plannedFill() ? pct() : null);
  const widthPx = () => (props.placement ? (props.placement.widthPct / 100) * props.axisWidth : 0);
  const labelOutside = () =>
    props.plannedLabel ? !ganttLabelFits(props.plannedLabel, widthPx()) : widthPx() < LABEL_MIN_PX;
  const labelOnFill = () => plannedFill() && !labelOutside() && progress() >= LABEL_MAX_PCT;
  const endPct = () => (props.placement ? props.placement.startPct + props.placement.widthPct : 0);
  /* Which SIDE the outside label goes. After the bar normally; before it when
     the bar ends against the edge of the axis and there is nowhere after. */
  const labelBefore = () =>
    ((100 - endPct()) / 100) * props.axisWidth <
    (props.plannedLabel ? ganttLabelPx(props.plannedLabel) : LABEL_OUTSIDE_PX);

  /**
   * The bar's working stretches, as percentages OF THE BAR, with the progress
   * fill handed out along them.
   *
   * The fill is distributed by working duration rather than given to each piece
   * equally: 40% complete on a job that runs an hour on Friday and seven on
   * Monday means the Friday piece is full and the Monday one has barely
   * started, not that both are 40% shaded.
   */
  const pieces = createMemo(() => {
    const row = props.row;
    if (!row.segments || !row.span) return null;
    /* Percentages of the VISIBLE bar, not of the whole span. `placeAppointment`
       clips a bar to the range, so the button is only the part in view — and
       measuring against the full span would squash and shift every piece the
       moment a job started before the range. */
    const from = Math.max(row.span.start.getTime(), props.range.start.getTime());
    const to = Math.min(row.span.end.getTime(), props.range.end.getTime());
    const total = to - from;
    if (total <= 0) return null;

    /* The fill is handed out over the segments the WHOLE job is worked in, not
       just the visible ones, or a job half-done off-screen would look untouched
       where you can see it. */
    const allDurations = row.segments.map((seg) => seg.end.getTime() - seg.start.getTime());
    const workingTotal = allDurations.reduce((a, b) => a + b, 0);
    let remaining = (workingTotal * progress()) / 100;

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
  });

  /* The actual bar. Two skins. By default it is SOLID — the settled fact under
     the soft plan. When it carries the progress (`progressOn="actual"`) it
     takes the planned bar's look instead: soft, bordered, filled to its %. */
  const actualTone = () => props.actualColor ?? props.tone;
  const actualWidthPx = () => {
    const ap = actualPlacement();
    return ap ? (ap.widthPct / 100) * props.axisWidth : 0;
  };
  const actualFill = () => progressOnActual() && props.row.progress !== null;
  const actualLabelText = () => props.actualLabel ?? (actualFill() ? pct() : null);
  /* Inside only when it fits AND the bar is tall enough to hold a line of
     text — a 6px strip never is. */
  const actualLabelInside = () => {
    const text = actualLabelText();
    return !!text && geo().actualHeight >= 12 && ganttLabelFits(text, actualWidthPx());
  };
  const actualEndPct = () => {
    const ap = actualPlacement();
    return ap ? ap.startPct + ap.widthPct : 0;
  };
  const actualLabelBefore = () =>
    ((100 - actualEndPct()) / 100) * props.axisWidth < ganttLabelPx(actualLabelText() ?? "");

  /* A milestone: one date, drawn as a diamond centred on it. The same hooks as
     a bar — data-gantt-bar, not tabbable, the same click — so the keyboard
     model, the focus effect and the DOM checks treat it as one. The diamond is
     a square turned 45 degrees, sized so its diagonal is the bar height; its
     colour is the status FILL (solid), so a point stands out among soft bars.
     An accent is a border INSIDE the diamond: a ring outside it would push
     past the tips the dependency arrows end on. */
  const diamondSide = () => props.barPx / Math.SQRT2;
  const milestone = () => (
    <Show
      when={props.placement}
      fallback={
        <span class="zen-sr-only">{props.row.span ? loc.t("gantt.notInRange") : loc.t("gantt.noDates")}</span>
      }
    >
      {(placement) => (
        <button
          type="button"
          onClick={() => props.onTaskClick?.(task(), props.row)}
          tabindex={-1}
          data-gantt-bar=""
          data-gantt-milestone=""
          class={cn(
            "zen-absolute zen-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          )}
          style={{
            "inset-inline-start": `calc(${placement().startPct}% - ${props.barPx / 2}px)`,
            top: `${barTop(props.rowHeight, props.barPx)}px`,
            width: `${props.barPx}px`,
            height: `${props.barPx}px`,
          }}
          title={`${task().name} · ${formatDay(props.row.span!.start)}`}
        >
          <span class="zen-sr-only">
            {loc.t("gantt.milestone", {
              date: formatDay(props.row.span!.start),
              status: loc.t(STATUS_LABEL[props.row.status]),
            })}
          </span>
          <span
            aria-hidden="true"
            data-gantt-accent={props.accent ? "" : undefined}
            class={cn("zen-block zen-shrink-0 zen-rotate-45 zen-rounded-[2px]", fillClass(), props.barClass)}
            style={{
              width: `${diamondSide()}px`,
              height: `${diamondSide()}px`,
              ...fillStyle(),
              ...(props.accent
                ? { "box-sizing": "border-box", "border-width": "2px", "border-style": "solid", "border-color": props.accent }
                : {}),
            }}
          />
        </button>
      )}
    </Show>
  );

  return (
    <Show when={!task().milestone} fallback={milestone()}>
    <Show
      when={props.placement}
      fallback={
        /* An empty gridcell is announced as "blank", which is right for a cell
           with no data and wrong for THIS one: the reader arrowed to the
           timeline expecting a bar, and "blank" does not distinguish "no dates"
           from "starts after the range you are looking at". */
        <span class="zen-sr-only">
          {props.row.span ? loc.t("gantt.notInRange") : loc.t("gantt.noDates")}
          {actualText() ? `, ${actualText()}` : ""}
        </span>
      }
    >
      {(placement) => (
        <>
          <button
            type="button"
            onClick={() => props.onTaskClick?.(task(), props.row)}
            /* Reachable, not tabbable. The timeline CELL carries the tab stop;
               the bar is what the keyboard scrolls into view once it does — see
               `data-gantt-bar`, which is how the focus effect finds it. */
            tabindex={-1}
            data-gantt-bar=""
            class={cn(
              "zen-absolute zen-rounded-zen-sm",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              /* Drawn as pieces, the button is only the hit area and the focus
                 ring — the skin moves onto each piece, or the gaps would be
                 filled by the button's own background. */
              pieces() === null && cn("zen-overflow-hidden zen-border", plannedSkinClass(), props.barClass),
              /* Square off a cut edge so a bar continuing past the view does not
                 look like it ends there. */
              pieces() === null && placement().clippedStart && "zen-rounded-s-none zen-border-s-0",
              pieces() === null && placement().clippedEnd && "zen-rounded-e-none zen-border-e-0",
              props.onTaskClick && "hover:zen-brightness-95",
            )}
            style={{
              "inset-inline-start": `${placement().startPct}%`,
              width: `${placement().widthPct}%`,
              top: `${geo().barTop}px`,
              height: `${geo().barHeight}px`,
              ...(pieces() === null ? plannedSkinStyle() : {}),
            }}
            title={`${task().name} · ${formatDay(props.row.span!.start)} – ${formatDay(props.row.span!.end)}${
              props.row.progress === null ? "" : ` · ${pct()}`
            }${actualText() ? ` · ${actualText()}` : ""}`}
          >
            <span class="zen-sr-only">
              {loc.t(props.row.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
                start: formatDay(props.row.span!.start),
                end: formatDay(props.row.span!.end),
                status: loc.t(STATUS_LABEL[props.row.status]),
                percent: Math.round(progress()),
              })}
              {actualText() ? `, ${actualText()}` : ""}
            </span>
            {/* The bar broken at the gaps where no work happens. The pieces sit
                INSIDE one button rather than being buttons themselves: the job
                is one thing to click, one thing to focus and one accessible
                name, however many stretches it is worked in. The gaps are left
                genuinely transparent so the shaded non-working column shows
                through — which is what makes the break read as "the plant is
                shut" rather than as a rendering fault. */}
            <Show when={pieces()}>
              <For each={pieces()!}>
                {(piece) => (
                  <span
                    aria-hidden="true"
                    class={cn(
                      "zen-absolute zen-inset-y-0 zen-overflow-hidden",
                      plannedSkinClass(),
                      "zen-rounded-zen-sm zen-border",
                      props.barClass,
                    )}
                    style={{ "inset-inline-start": `${piece.startPct}%`, width: `${piece.widthPct}%`, ...plannedSkinStyle() }}
                  >
                    <Show when={plannedFill() && piece.fillPct > 0}>
                      <span
                        class={cn("zen-absolute zen-inset-y-0 zen-start-0", fillClass())}
                        style={{ width: `${piece.fillPct}%`, ...fillStyle() }}
                      />
                    </Show>
                  </span>
                )}
              </For>
            </Show>
            <Show when={pieces() === null && plannedFill()}>
              <span
                aria-hidden="true"
                class={cn("zen-absolute zen-inset-y-0 zen-start-0", fillClass())}
                style={{ width: `${progress()}%`, ...fillStyle() }}
              />
            </Show>
            <Show when={plannedText() && !labelOutside()}>
              <span
                aria-hidden="true"
                class={cn(
                  "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
                  props.plannedLabel
                    ? LABEL_PILL_CLASS
                    : labelOnFill()
                      ? cn("zen-inset-y-0 zen-start-1", props.tone ? "zen-text-zen-foreground" : FILL_TEXT_CLASS[props.row.status])
                      : "zen-inset-y-0 zen-end-1 zen-text-zen-foreground",
                )}
                style={props.plannedLabel ? LABEL_PILL_STYLE : undefined}
              >
                {plannedText()}
              </span>
            </Show>
            {/* Last, so it sits over the fill: the stripe is the row's identity
                and the fill its progress, and both have to stay visible. */}
            <Show when={props.accent}>
              <span
                aria-hidden="true"
                data-gantt-accent=""
                class="zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm"
                style={{ "background-color": props.accent }}
              />
            </Show>
          </button>

          <Show when={plannedText() && labelOutside()}>
            <span
              aria-hidden="true"
              class="zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg"
              style={{
                ...(labelBefore()
                  ? { "inset-inline-end": `calc(${100 - placement().startPct}% + 4px)` }
                  : { "inset-inline-start": `calc(${endPct()}% + 4px)` }),
                top: `${geo().barTop}px`,
                height: `${geo().barHeight}px`,
              }}
            >
              {plannedText()}
            </span>
          </Show>
        </>
      )}
    </Show>
    {/* The actual bar: when the work really ran. A sibling of the planned bar,
        not inside it, because the two have different extents — it can start
        before the plan and run past it, or exist when the plan is off-screen.
        Hidden from assistive tech: its dates are already in the planned bar's
        name. An open (still running) end is squared off, like a bar cut by the
        range: it has not ended, it has reached now. */}
    <Show when={actualPlacement()}>
      {(ap) => (
        <>
          <span
            aria-hidden="true"
            data-gantt-actual=""
            data-gantt-actual-open={props.row.actual?.open ? "" : undefined}
            class={cn(
              "zen-pointer-events-none zen-absolute zen-overflow-hidden zen-rounded-zen-sm",
              progressOnActual()
                ? cn("zen-border", !actualTone() && BAR_CLASS[props.row.status])
                : !actualTone() && FILL_CLASS[props.row.status],
              ap().clippedStart && "zen-rounded-s-none",
              (ap().clippedEnd || props.row.actual?.open) && "zen-rounded-e-none",
              props.actualClass,
            )}
            style={{
              "inset-inline-start": `${ap().startPct}%`,
              width: `${ap().widthPct}%`,
              top: `${geo().actualTop}px`,
              height: `${geo().actualHeight}px`,
              ...(actualTone()
                ? progressOnActual()
                  ? softSkin(actualTone()!)
                  : { "background-color": actualTone() }
                : {}),
            }}
          >
            <Show when={actualFill()}>
              <span
                class={cn("zen-absolute zen-inset-y-0 zen-start-0", !actualTone() && FILL_CLASS[props.row.status])}
                style={{ width: `${progress()}%`, ...(actualTone() ? { "background-color": actualTone() } : {}) }}
              />
            </Show>
            <Show when={actualLabelInside()}>
              <span
                class={cn(
                  "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
                  LABEL_PILL_CLASS,
                )}
                style={LABEL_PILL_STYLE}
              >
                {actualLabelText()}
              </span>
            </Show>
          </span>
          <Show when={actualLabelText() && !actualLabelInside()}>
            <span
              aria-hidden="true"
              class="zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg"
              style={{
                ...(actualLabelBefore()
                  ? { "inset-inline-end": `calc(${100 - ap().startPct}% + 4px)` }
                  : { "inset-inline-start": `calc(${actualEndPct()}% + 4px)` }),
                top: `${geo().actualTop}px`,
                height: `${geo().actualHeight}px`,
              }}
            >
              {actualLabelText()}
            </span>
          </Show>
        </>
      )}
    </Show>
    </Show>
  );
};

const GanttAssignees = (props: { assignees?: GanttAssignee[] }) => (
  <Show when={props.assignees && props.assignees.length > 0}>
    <Tooltip>
      <TooltipTrigger
        as="span"
        /* Not a tab stop of its own — the grid is one — but the full list is
           still reachable without a pointer: the cell carries it as its
           accessible name, so arrowing onto the column reads every name even
           though the "+N" chip only draws three. */
        aria-hidden="true"
        class="zen-rounded-zen-full"
      >
        {/* "loose" is -4px: at xs an avatar is 24px, and the default -8px hides
            a third of each initial pair behind the next one. */}
        <AvatarGroup max={AVATAR_MAX} size="xs" spacing="loose">
          <For each={props.assignees}>
            {(assignee) => (
              <Avatar size="xs">
                <Show when={assignee.src}>
                  <AvatarImage src={assignee.src!} alt={assignee.name} />
                </Show>
                <AvatarFallback>{initialsOf(assignee)}</AvatarFallback>
              </Avatar>
            )}
          </For>
        </AvatarGroup>
      </TooltipTrigger>
      <TooltipContent>{props.assignees!.map((a) => a.name).join(", ")}</TooltipContent>
    </Tooltip>
  </Show>
);
