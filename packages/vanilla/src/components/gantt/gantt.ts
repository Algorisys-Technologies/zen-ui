import {
  flattenGanttTasks,
  formatGanttVariance,
  GANTT_STATUS_COLOR,
  ganttActualLayout,
  ganttConnectors,
  ganttFitRange,
  ganttLabelFits,
  ganttLabelPx,
  ganttLegendItems,
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
import { Tooltip } from "../tooltip/tooltip";
import { toNodes, type AnyZenComponent, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import {
  INDENT_PX,
  ScheduleGrid,
  resolveScheduleAxis,
  type ScheduleAxis,
  type ScheduleColumn,
  type ScheduleGridHandle,
} from "./schedule-grid";
import { useLocale, withLocale, type MessageKey } from "../locale/locale";

/**
 * Gantt — what the project is doing, and what is waiting on what.
 *
 *   Gantt({ tasks: plan, dependencies: links }).el
 *
 * Two panes over one clock. On the left a task tree that collapses; on the
 * right the same rows as bars on a shared time axis, with dependency arrows
 * between them.
 *
 * This file is the PROJECT half only. The chrome underneath it — the scroller,
 * the axis and its six views, the frozen pane that sheds columns, row
 * windowing, the connector overlay and the treegrid keyboard model — lives in
 * ./schedule-grid, which knows nothing about tasks.
 *
 * All the arithmetic is in @algorisys/zen-ui-core, pinned by
 * scripts/check-gantt.ts, and this binding derives no dates of its own. The
 * rendering is pinned too: `node scripts/check-schedule-dom.mjs vanilla` runs
 * the same assertions React and Solid pass, and
 * `check-schedule-parity.mjs vanilla` compares the drawn chart against React's.
 *
 * It does NOT edit. Rescheduling cascades through successors, and the cascade
 * policy, the undo story and the permission model belong to the caller's
 * domain. `onTaskClick` hands you the task and its derived row.
 * (`ProductionSchedule` is the component that DOES edit, deliberately.)
 *
 * The default view is `fit`: the axis range is the span of the tasks, so a plan
 * opens showing its own shape rather than whichever calendar month today falls
 * in. Its range does not depend on the anchor, so prev / next / today are
 * HIDDEN while it is on — a control that cannot change anything is worse than
 * no control.
 *
 * ONE LAYOUT TRAP, and it is the caller's to avoid. The fit axis sizes itself
 * from the scroller's measured width, so it needs a container with a width of
 * its OWN. Drop the chart into a flex row whose width comes from its content
 * and the two define each other.
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

export interface GanttProps extends BaseProps {
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

  /** Starting view. The factory owns it after that; `update({ view })` controls it. */
  defaultView?: GanttView;
  view?: GanttView;
  onViewChange?: (view: GanttView) => void;
  /** Which views the switcher offers. Default all six. */
  views?: GanttView[];

  /** Any date inside the range to open on. Default today. */
  defaultDate?: Date;
  date?: Date;
  onDateChange?: (date: Date) => void;

  /** Ids of the parents that are open. Controlled; pair with `onExpandedChange`. */
  expanded?: string[];
  /** Uncontrolled starting set. Omit it and everything opens. */
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;

  onTaskClick?: (task: GanttTask, row: GanttRow<GanttTask>) => void;

  /**
   * When work can happen — shift patterns per weekday plus dated exceptions.
   * With one supplied, durations become WORKING durations and bars break across
   * non-working time. Omit it and nothing changes: no calendar means a 24/7 one.
   */
  calendar?: GanttCalendar;
  /** Hours per column in the DAY view. Default 1; 0.25 for quarter-hour columns. */
  hourStep?: number;
  /** Reference "now" for the marker, the today column and the derived status. */
  now?: Date;
  /**
   * Nominal pixel width of one column. Setting it also opts the FIT view out of
   * sizing itself to the container, which is the one thing that view exists for.
   */
  columnWidth?: number;
  hideToolbar?: boolean;
  /**
   * Which columns the frozen pane carries, in PREFERENCE order: what you list
   * last is what it sheds first. The first entry is never dropped.
   */
  columns?: GanttPaneColumn[];

  /** Show skeleton rows instead of the chart. */
  loading?: boolean;
  /** How many skeleton rows. Default 6. */
  loadingRows?: number;
  /** Replaces the whole no-tasks surface. */
  emptyState?: Child;

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
}

import { ganttBarPx, scheduleRowPx, type Density } from "@algorisys/zen-ui-core/density";
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — the y the connector routes are computed at. */
const barTop = (rowHeight: number, barPx: number) => (rowHeight - barPx) / 2;

/** The frozen pane's columns. Fixed, because a sticky pane cannot be sized by
 *  its content without moving as you scroll. */
const PANE_PX: Record<GanttPaneColumn, number> = {
  name: 180,
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

/** Each column's place in the FULL set — fixed, not renumbered when one drops. */
const COL_INDEX: Record<GanttPaneColumn | "timeline", number> = {
  name: 1,
  assignees: 2,
  status: 3,
  variance: 4,
  timeline: 5,
};

const DEFAULT_PANE: GanttPaneColumn[] = ["name", "assignees", "status", "variance"];

const AVATAR_MAX = 3;

/**
 * Where the percent label goes, in the two places the obvious answer fails.
 * Under ~44px there is no room for "100%" at all; past ~85% the fill has
 * reached the inline end and a label there is solid-on-solid.
 */
/** A caller's colour mixed into the background — the soft version of it, as the
 *  palette's `-soft` tokens are of theirs. */
const tint = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, var(--zen-color-background))`;
/** The planned bar's look in a caller's colour: soft fill, the colour as its border. */
const softSkin = (node: HTMLElement, color: string): void => {
  node.style.backgroundColor = tint(color, 18);
  node.style.borderColor = color;
};

/* A caller's label on a bar sits on a pill of the page background. The bar
   under it can be any colour — a caller's, a fill that stops halfway along the
   text — so no single text colour is readable on all of it; the pill makes the
   text sit on the one surface whose contrast the theme already guarantees. */
const pill = (text: string): HTMLElement => {
  const node = document.createElement("span");
  node.className =
    "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-inset-y-0.5 zen-start-1 zen-rounded-zen-sm zen-px-1 zen-text-zen-foreground";
  node.style.backgroundColor = "color-mix(in srgb, var(--zen-color-background) 80%, transparent)";
  node.textContent = text;
  return node;
};

const LABEL_MIN_PX = 44;
const LABEL_MAX_PCT = 85;
/** Room an outside label needs after the bar before it is put in front of it —
 *  without this a task ending at the range edge draws its label PAST the axis. */
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

const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

type Row = GanttRow<GanttTask>;

export function Gantt(props: GanttProps): ZenComponent<GanttProps> {
  let current: GanttProps = { ...props };
  const loc = useLocale();

  /* The factory owns the uncontrolled view, date and expansion, because there
     is no state hook here — `update({ view })` is how a caller takes control.
     `innerExpanded` is null rather than an empty array: it means "no answer
     given", which is everything open, and a resolved list would freeze that at
     construction and leave later-arriving tasks collapsed. */
  let innerView: GanttView = props.defaultView ?? "fit";
  let innerDate: Date = props.defaultDate ?? new Date();
  let innerExpanded: string[] | null = props.defaultExpanded ?? null;

  /* Read once per CONSTRUCTION, not per render. Two `new Date()`s in one pass
     can straddle a millisecond and leave the marker and the today column
     disagreeing. Pass `now` to control it. */
  const constructedAt = new Date();

  const root = el("div");
  let grid: ScheduleGridHandle<Row> | null = null;
  let owned: AnyZenComponent[] = [];
  const keep = <T extends AnyZenComponent>(comp: T): T => {
    owned.push(comp);
    return comp;
  };

  const viewOf = () => current.view ?? innerView;
  const dateOf = () => current.date ?? innerDate;
  const nowOf = () => current.now ?? constructedAt;
  const expandedOf = () => current.expanded ?? innerExpanded;
  const requestedPane = () => current.columns ?? DEFAULT_PANE;

  const setView = (next: GanttView) => {
    /* Leaving fit re-anchors, when the anchor is nowhere near the plan.
       Otherwise the obvious gesture — open on fit, click Month to zoom in —
       lands on today's month, which for a plan that runs next spring is an
       empty axis and reads as the data having vanished. */
    const fit = fitRangeOf();
    if (viewOf() === "fit" && next !== "fit" && fit) {
      const from = fit.start.getTime();
      const to = fit.end.getTime();
      const anchorTime = dateOf().getTime();
      if (anchorTime < from || anchorTime >= to) {
        const nowTime = nowOf().getTime();
        setDate(nowTime >= from && nowTime < to ? nowOf() : fit.start);
      }
    }
    if (current.view === undefined) innerView = next;
    current.onViewChange?.(next);
    render();
  };
  const setDate = (next: Date) => {
    if (current.date === undefined) innerDate = next;
    current.onDateChange?.(next);
    render();
  };
  const toggle = (id: string) => {
    const base = expandedOf() ?? parentIds(current.tasks ?? []);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    if (current.expanded === undefined) innerExpanded = next;
    current.onExpandedChange?.(next);
    render();
  };

  /* The plan's padded span: what Fit shows, and what a continuous axis spans.
     Computed only when one of them needs it. */
  const planSpanOf = (): PlanningRange | null =>
    viewOf() === "fit" || current.continuous ? ganttFitRange(current.tasks ?? [], { calendar: current.calendar, now: nowOf() }) : null;
  const fitRangeOf = (): PlanningRange | null => (viewOf() === "fit" ? planSpanOf() : null);
  // Continuous turns the date row on, because a scrolled axis needs it; an
  // explicit `headerGroups: false` still wins.
  const headerGroupsOf = () => current.headerGroups ?? !!current.continuous;

  /** The four pane columns, as DATA — which is what lets the grid know nothing about tasks. */
  const paneColumns = (): ScheduleColumn<Row>[] =>
    requestedPane().map((key) => ({
      key,
      label: loc.t(PANE_LABEL[key]),
      width: PANE_PX[key],
      colIndex: COL_INDEX[key],
      class: key === "name" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style:
        key === "name"
          ? (row: Row) => [["padding-inline-start", `${8 + row.depth * INDENT_PX}px`]] as Array<[string, string]>
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
      render: (row: Row) => paneCell(key, row),
    }));

  function paneCell(column: GanttPaneColumn, row: Row): Array<Node | AnyZenComponent> {
    const task = row.task;

    if (column === "name") {
      const out: Array<Node | AnyZenComponent> = [];
      if (row.hasChildren) {
        const chevron = el(
          "button",
          "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        );
        chevron.type = "button";
        /* Out of the tab order, in the grid's: the chevron is reached by
           arrowing to the first column and pressing the forward arrow, not by a
           tab stop per parent. */
        chevron.tabIndex = -1;
        chevron.setAttribute(
          "aria-label",
          loc.t(row.expanded ? "gantt.collapseTask" : "gantt.expandTask", { name: task.name }),
        );
        chevron.addEventListener("click", () => toggle(task.id));
        const icon = Icon({
          name: row.expanded ? "chevron-down" : "chevron-right",
          size: 14,
          class: row.expanded ? undefined : "rtl:zen-rotate-180",
        });
        chevron.append(icon.el);
        out.push(chevron, icon);
      } else {
        /* A spacer, not a hidden chevron: leaves must line up with their
           siblings' text, or every leaf reads as one level shallower. */
        const spacer = el("span", "zen-h-5 zen-w-5 zen-shrink-0");
        spacer.setAttribute("aria-hidden", "true");
        out.push(spacer);
      }

      const text = el("span", "zen-min-w-0");
      const name = el(
        "span",
        cn("zen-block zen-truncate zen-text-sm zen-text-zen-foreground", row.hasChildren && "zen-font-semibold"),
        task.name,
      );
      name.title = task.name;
      text.append(name);
      /* One line per entry: "Planned: 1–5 Jul" and "Actual: 1–4 Jul" under the
         name. Give the rows the height (`rowHeight`) for the lines. */
      for (const line of task.subtitle === undefined ? [] : ([] as string[]).concat(task.subtitle)) {
        text.append(el("span", "zen-block zen-truncate zen-[font-size:var(--zen-schedule-label-font-size)] zen-text-zen-muted-fg", line));
      }
      out.push(text);
      return out;
    }

    if (column === "assignees") {
      const people = task.assignees;
      if (!people || people.length === 0) return [];
      /* "loose" is -4px: at xs an avatar is 24px, and the default -8px hides a
         third of each initial pair behind the next one. */
      const group = AvatarGroup({
        max: AVATAR_MAX,
        size: "xs",
        spacing: "loose",
        children: people.map((assignee) =>
          Avatar({
            size: "xs",
            children: [
              assignee.src ? AvatarImage({ src: assignee.src, alt: assignee.name }) : null,
              AvatarFallback({ children: initialsOf(assignee) }),
            ],
          }),
        ),
      });
      /* Not a tab stop of its own — the grid is one — but the full list is
         still reachable: the cell carries it as its accessible name. */
      const wrap = el("span", "zen-rounded-zen-full");
      wrap.setAttribute("aria-hidden", "true");
      wrap.append(group.el);
      const tip = Tooltip({ trigger: wrap, content: people.map((a) => a.name).join(", ") });
      return [tip, group];
    }

    if (column === "status") {
      const tone = current.statusColor?.(task, row) || undefined;
      const chip = Badge({
        variant: "soft",
        color: tone ? "neutral" : STATUS_COLOR[row.status],
        class: "zen-truncate",
        children: task.statusLabel ?? loc.t(STATUS_LABEL[row.status]),
      });
      /* A caller's colour: a tint of it behind the foreground, so the text
         keeps its contrast whatever colour the caller picked. */
      if (tone) {
        (chip.el as HTMLElement).style.backgroundColor = tint(tone, 22);
        (chip.el as HTMLElement).style.color = "var(--zen-color-foreground)";
      }
      return [chip];
    }

    const varianceText = formatGanttVariance(row.variance);
    if (!varianceText) return [];
    const chip = Badge({
      variant: "soft",
      color:
        row.variance === null || row.variance === 0
          ? "neutral"
          : row.variance > 0
            ? "error"
            : "success",
      children: varianceText,
    });
    /* "+2d" is a signed number, and bidi reorders a leading sign to the far side
       in an RTL run — it renders as "2d+". Set on the node rather than passed as
       a prop, because vanilla's BaseProps does not carry arbitrary attributes;
       the other two bindings spell it `dir="ltr"` on the component. */
    chip.el.setAttribute("dir", "ltr");
    return [chip];
  }

  /** The bar on the axis: one per row, broken into pieces where work stops. */
  // Never shorter than a bar plus a few px, or the bar would overhang its row.
  // Density sets the row and bar; an explicit rowHeight wins over it.
  const barPxOf = (): number => ganttBarPx(current.density);
  const rowHeightOf = (): number => Math.max(barPxOf() + 4, scheduleRowPx(current.density, current.rowHeight));

  function track(
    row: Row,
    axis: ScheduleAxis,
    placement: PlanningPlacement | null,
  ): Array<Node | AnyZenComponent> {
    const task = row.task;
    /* "primary": the actual bar IS the bar — its own builder, so the default
       path below stays exactly as it was. Only rows with actual dates take it. */
    if (current.actualLayout === "primary" && row.actual && !task.milestone) return primaryTrack(row, axis, placement);
    /* Where the planned and actual bars sit. In "strip" the planned bar is
       exactly where it always was; only "split" moves it, and only then. */
    const geo = ganttActualLayout(rowHeightOf(), barPxOf(), current.actualLayout ?? "strip");
    const actualPlacement = row.actual && !task.milestone ? placeAppointment(row.actual, axis.range) : null;
    /** Said with the planned bar, so a row stays one name: the actual bar is drawn, not announced twice. */
    const actualText =
      !row.actual || task.milestone
        ? ""
        : row.actual.open
          ? loc.t("gantt.actualRunning", { start: formatDay(row.actual.start) })
          : loc.t("gantt.actualSpan", { start: formatDay(row.actual.start), end: formatDay(row.actual.end) });
    const tone = current.statusColor?.(task, row) || undefined;
    const plannedLabel = current.barLabel?.(task, row) || undefined;
    const actualLabel = current.actualBarLabel?.(task, row) || undefined;
    const progress = row.progress ?? 0;
    const pct = `${Math.round(progress)}%`;

    /* Which bar carries the progress — and with it the status colour. Moved to
       the actual bar, the plan becomes a neutral reference: two bars both
       shouting the status is one too many. */
    const progressOnActual = current.progressOn === "actual" && !!row.actual && !task.milestone;
    const plannedFill = row.progress !== null && !progressOnActual;
    const plannedSkinClass = progressOnActual ? BAR_CLASS["not-started"] : tone ? "" : BAR_CLASS[row.status];
    const applyPlannedSkin = (node: HTMLElement) => {
      if (!progressOnActual && tone) softSkin(node, tone);
    };
    const fillClass = tone ? "" : FILL_CLASS[row.status];
    const applyFill = (node: HTMLElement) => {
      if (tone) node.style.backgroundColor = tone;
    };

    /* The actual bar: when the work really ran. A sibling of the planned bar,
       not inside it, because the two have different extents — it can start
       before the plan and run past it, or exist when the plan is off-screen.
       Hidden from assistive tech: its dates are already in the planned bar's
       name. Two skins: SOLID by default, the settled fact under the soft plan;
       soft, bordered and filled to its % when it carries the progress. An open
       (still running) end is squared off: it has not ended, it has reached now. */
    const actualNodes: Node[] = [];
    if (actualPlacement) {
      const actualTone = current.actualBarColor?.(task) || tone;
      const actualWidthPx = (actualPlacement.widthPct / 100) * axis.axisWidth;
      const actualFill = progressOnActual && row.progress !== null;
      const actualLabelText = actualLabel ?? (actualFill ? pct : null);
      /* Inside only when it fits AND the bar is tall enough to hold a line of
         text — a 6px strip never is. */
      const actualLabelInside =
        !!actualLabelText && geo.actualHeight >= 12 && ganttLabelFits(actualLabelText, actualWidthPx);
      const actualEndPct = actualPlacement.startPct + actualPlacement.widthPct;
      const actualLabelBefore = ((100 - actualEndPct) / 100) * axis.axisWidth < ganttLabelPx(actualLabelText ?? "");

      const bar = el(
        "span",
        cn(
          "zen-pointer-events-none zen-absolute zen-overflow-hidden zen-rounded-zen-sm",
          progressOnActual
            ? cn("zen-border", !actualTone && BAR_CLASS[row.status])
            : !actualTone && FILL_CLASS[row.status],
          actualPlacement.clippedStart && "zen-rounded-s-none",
          (actualPlacement.clippedEnd || row.actual?.open) && "zen-rounded-e-none",
          current.actualBarClassName?.(task),
        ),
      );
      bar.setAttribute("aria-hidden", "true");
      bar.setAttribute("data-gantt-actual", "");
      if (row.actual?.open) bar.setAttribute("data-gantt-actual-open", "");
      bar.style.insetInlineStart = `${actualPlacement.startPct}%`;
      bar.style.width = `${actualPlacement.widthPct}%`;
      bar.style.top = `${geo.actualTop}px`;
      bar.style.height = `${geo.actualHeight}px`;
      if (actualTone) {
        if (progressOnActual) softSkin(bar, actualTone);
        else bar.style.backgroundColor = actualTone;
      }
      if (actualFill) {
        const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", !actualTone && FILL_CLASS[row.status]));
        fill.style.width = `${progress}%`;
        if (actualTone) fill.style.backgroundColor = actualTone;
        bar.append(fill);
      }
      if (actualLabelInside) bar.append(pill(actualLabelText!));
      actualNodes.push(bar);
      if (actualLabelText && !actualLabelInside) {
        const outside = el(
          "span",
          "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
          actualLabelText,
        );
        outside.setAttribute("aria-hidden", "true");
        if (actualLabelBefore) outside.style.insetInlineEnd = `calc(${100 - actualPlacement.startPct}% + 4px)`;
        else outside.style.insetInlineStart = `calc(${actualEndPct}% + 4px)`;
        outside.style.top = `${geo.actualTop}px`;
        outside.style.height = `${geo.actualHeight}px`;
        actualNodes.push(outside);
      }
    }

    if (!placement) {
      /* An empty gridcell is announced as "blank", which is right for a cell
         with no data and wrong for THIS one: the reader arrowed to the timeline
         expecting a bar, and "blank" does not distinguish "no dates" from
         "starts after the range you are looking at". */
      return [
        el(
          "span",
          "zen-sr-only",
          `${loc.t(row.span ? "gantt.notInRange" : "gantt.noDates")}${actualText ? `, ${actualText}` : ""}`,
        ),
        ...actualNodes,
      ];
    }

    /* A milestone: one date, drawn as a diamond centred on it. The same hooks
       as a bar — data-gantt-bar, not tabbable, the same click — so the keyboard
       model, the focus effect and the DOM checks treat it as one. The diamond
       is a square turned 45 degrees, sized so its diagonal is the bar height;
       its colour is the status FILL (solid), so a point stands out among soft
       bars. shrink-0 because the flex button would otherwise squeeze it.
       An accent is a border INSIDE the diamond: a ring outside it would push
       past the tips the dependency arrows end on. */
    if (task.milestone) {
      const barPx = barPxOf();
      const side = barPx / Math.SQRT2;
      const marker = el(
        "button",
        cn(
          "zen-absolute zen-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        ),
      );
      marker.type = "button";
      marker.tabIndex = -1;
      marker.setAttribute("data-gantt-bar", "");
      marker.setAttribute("data-gantt-milestone", "");
      marker.style.insetInlineStart = `calc(${placement.startPct}% - ${barPx / 2}px)`;
      marker.style.top = `${barTop(rowHeightOf(), barPx)}px`;
      marker.style.width = `${barPx}px`;
      marker.style.height = `${barPx}px`;
      marker.title = `${task.name} · ${formatDay(row.span!.start)}`;
      marker.addEventListener("click", () => current.onTaskClick?.(task, row));
      const diamond = el(
        "span",
        cn("zen-block zen-shrink-0 zen-rotate-45 zen-rounded-[2px]", fillClass, current.barClassName?.(task)),
      );
      diamond.setAttribute("aria-hidden", "true");
      diamond.style.width = `${side}px`;
      diamond.style.height = `${side}px`;
      applyFill(diamond);
      const accent = current.barAccent?.(task);
      if (accent) {
        diamond.setAttribute("data-gantt-accent", "");
        diamond.style.boxSizing = "border-box";
        diamond.style.borderWidth = "2px";
        diamond.style.borderStyle = "solid";
        diamond.style.borderColor = accent;
      }
      marker.append(
        el(
          "span",
          "zen-sr-only",
          loc.t("gantt.milestone", {
            date: formatDay(row.span!.start),
            status: loc.t(STATUS_LABEL[row.status]),
          }),
        ),
        diamond,
      );
      return [marker];
    }

    /* The planned bar's label: the caller's text, else the "60%" it always had. */
    const plannedText = plannedLabel ?? (plannedFill ? pct : null);
    const widthPx = (placement.widthPct / 100) * axis.axisWidth;
    const labelOutside = plannedLabel ? !ganttLabelFits(plannedLabel, widthPx) : widthPx < LABEL_MIN_PX;
    const labelOnFill = plannedFill && !labelOutside && progress >= LABEL_MAX_PCT;
    const endPct = placement.startPct + placement.widthPct;
    /* Which SIDE the outside label goes. After the bar normally; before it when
       the bar ends against the edge of the axis and there is nowhere after. */
    const labelBefore =
      ((100 - endPct) / 100) * axis.axisWidth < (plannedLabel ? ganttLabelPx(plannedLabel) : LABEL_OUTSIDE_PX);

    /**
     * The bar's working stretches, as percentages OF THE BAR, with the progress
     * fill handed out along them by working duration — 40% complete on a job
     * that runs an hour on Friday and seven on Monday means the Friday piece is
     * full and the Monday one has barely started.
     */
    let pieces: Array<{ startPct: number; widthPct: number; fillPct: number }> | null = null;
    if (row.segments && row.span) {
      /* Percentages of the VISIBLE bar, not of the whole span: `placeAppointment`
         clips a bar to the range, and measuring against the full span would
         squash and shift every piece the moment a job started before it. */
      const from = Math.max(row.span.start.getTime(), axis.range.start.getTime());
      const to = Math.min(row.span.end.getTime(), axis.range.end.getTime());
      const total = to - from;
      if (total > 0) {
        const allDurations = row.segments.map((s) => s.end.getTime() - s.start.getTime());
        const workingTotal = allDurations.reduce((a, b) => a + b, 0);
        let remaining = (workingTotal * progress) / 100;
        const out: Array<{ startPct: number; widthPct: number; fillPct: number }> = [];
        row.segments.forEach((seg, i) => {
          const done = Math.max(0, Math.min(remaining, allDurations[i]));
          remaining -= done;
          const segStart = Math.max(seg.start.getTime(), from);
          const segEnd = Math.min(seg.end.getTime(), to);
          if (segEnd <= segStart) return;
          const visible = segEnd - segStart;
          const fillVisible = Math.max(0, Math.min(done - (segStart - seg.start.getTime()), visible));
          out.push({
            startPct: ((segStart - from) / total) * 100,
            widthPct: (visible / total) * 100,
            fillPct: visible > 0 ? (fillVisible / visible) * 100 : 0,
          });
        });
        pieces = out.length > 0 ? out : null;
      }
    }

    const bar = el(
      "button",
      cn(
        "zen-absolute zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        /* Drawn as pieces, the button is only the hit area and the focus ring —
           the skin moves onto each piece, or the gaps would be filled by the
           button's own background. */
        pieces === null && cn("zen-overflow-hidden zen-border", plannedSkinClass, current.barClassName?.(task)),
        /* Square off a cut edge so a bar continuing past the view does not look
           like it ends there. */
        pieces === null && placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
        pieces === null && placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
        current.onTaskClick && "hover:zen-brightness-95",
      ),
    );
    bar.type = "button";
    /* Reachable, not tabbable. The timeline CELL carries the tab stop; the bar
       is what the keyboard scrolls into view once it does. */
    bar.tabIndex = -1;
    bar.setAttribute("data-gantt-bar", "");
    bar.style.insetInlineStart = `${placement.startPct}%`;
    bar.style.width = `${placement.widthPct}%`;
    bar.style.top = `${geo.barTop}px`;
    bar.style.height = `${geo.barHeight}px`;
    if (pieces === null) applyPlannedSkin(bar);
    bar.title = `${task.name} · ${formatDay(row.span!.start)} – ${formatDay(row.span!.end)}${
      row.progress === null ? "" : ` · ${pct}`
    }${actualText ? ` · ${actualText}` : ""}`;
    bar.addEventListener("click", () => current.onTaskClick?.(task, row));

    bar.append(
      el(
        "span",
        "zen-sr-only",
        `${loc.t(row.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
          start: formatDay(row.span!.start),
          end: formatDay(row.span!.end),
          status: loc.t(STATUS_LABEL[row.status]),
          percent: Math.round(progress),
        })}${actualText ? `, ${actualText}` : ""}`,
      ),
    );

    /* The bar broken at the gaps where no work happens. The pieces sit INSIDE
       one button rather than being buttons themselves: the job is one thing to
       click, one thing to focus and one accessible name, however many stretches
       it is worked in. The gaps are left genuinely transparent so the shaded
       non-working column shows through. */
    if (pieces !== null) {
      for (const piece of pieces) {
        const part = el(
          "span",
          cn("zen-absolute zen-inset-y-0 zen-overflow-hidden", plannedSkinClass, "zen-rounded-zen-sm zen-border", current.barClassName?.(task)),
        );
        part.setAttribute("aria-hidden", "true");
        part.style.insetInlineStart = `${piece.startPct}%`;
        part.style.width = `${piece.widthPct}%`;
        applyPlannedSkin(part);
        if (plannedFill && piece.fillPct > 0) {
          const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", fillClass));
          fill.style.width = `${piece.fillPct}%`;
          applyFill(fill);
          part.append(fill);
        }
        bar.append(part);
      }
    } else if (plannedFill) {
      const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", fillClass));
      fill.setAttribute("aria-hidden", "true");
      fill.style.width = `${progress}%`;
      applyFill(fill);
      bar.append(fill);
    }

    if (plannedText && !labelOutside) {
      let label: HTMLElement;
      if (plannedLabel) {
        label = pill(plannedLabel);
      } else {
        label = el(
          "span",
          cn(
            "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium",
            labelOnFill
              ? cn("zen-start-1", tone ? "zen-text-zen-foreground" : FILL_TEXT_CLASS[row.status])
              : "zen-end-1 zen-text-zen-foreground",
          ),
          plannedText,
        );
      }
      label.setAttribute("aria-hidden", "true");
      bar.append(label);
    }

    /* Last, so it sits over the fill: the stripe is the row's identity and the
       fill its progress, and both have to stay visible. */
    const accent = current.barAccent?.(task);
    if (accent) {
      const stripe = el("span", "zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm");
      stripe.setAttribute("aria-hidden", "true");
      stripe.setAttribute("data-gantt-accent", "");
      stripe.style.backgroundColor = accent;
      bar.append(stripe);
    }

    const out: Array<Node | AnyZenComponent> = [bar];
    if (plannedText && labelOutside) {
      const outside = el(
        "span",
        "zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
        plannedText,
      );
      outside.setAttribute("aria-hidden", "true");
      if (labelBefore) outside.style.insetInlineEnd = `calc(${100 - placement.startPct}% + 4px)`;
      else outside.style.insetInlineStart = `calc(${endPct}% + 4px)`;
      outside.style.top = `${geo.barTop}px`;
      outside.style.height = `${geo.barHeight}px`;
      out.push(outside);
    }
    out.push(...actualNodes);
    return out;
  }

  /**
   * A row in the "primary" layout: the ACTUAL bar is the main one — the button,
   * full size on the row's middle where the arrows meet it, in the status colour
   * with the % fill — and the plan is a slim dashed outline beneath, a reference
   * rather than a second bar to read. The same hooks as any bar (data-gantt-bar,
   * not tabbable, the same click, one accessible name with both sets of dates).
   */
  function primaryTrack(
    row: Row,
    axis: ScheduleAxis,
    placement: PlanningPlacement | null,
  ): Array<Node | AnyZenComponent> {
    const task = row.task;
    const actual = row.actual!;
    // The strip's places: the main bar at barTop, the slim one beneath.
    const geo = ganttActualLayout(rowHeightOf(), barPxOf(), "primary");
    const main = placeAppointment(actual, axis.range);
    const actualText = actual.open
      ? loc.t("gantt.actualRunning", { start: formatDay(actual.start) })
      : loc.t("gantt.actualSpan", { start: formatDay(actual.start), end: formatDay(actual.end) });
    const tone = current.statusColor?.(task, row) || undefined;
    const color = current.actualBarColor?.(task) || tone;
    const plannedLabel = current.barLabel?.(task, row) || undefined;
    const actualLabel = current.actualBarLabel?.(task, row) || undefined;
    const progress = row.progress ?? 0;
    const mainLabel = actualLabel ?? (row.progress !== null ? `${Math.round(progress)}%` : null);
    const beside = (node: HTMLElement, startPct: number, widthPct: number, text: string) => {
      if (((100 - startPct - widthPct) / 100) * axis.axisWidth < ganttLabelPx(text)) {
        node.style.insetInlineEnd = `calc(${100 - startPct}% + 4px)`;
      } else {
        node.style.insetInlineStart = `calc(${startPct + widthPct}% + 4px)`;
      }
    };
    const out: Array<Node | AnyZenComponent> = [];

    // The plan, as an outline: where the work was meant to sit.
    if (placement) {
      const plan = el(
        "span",
        cn(
          "zen-pointer-events-none zen-absolute zen-rounded-zen-sm zen-border zen-border-dashed zen-border-zen-muted-fg",
          placement.clippedStart && "zen-rounded-s-none",
          placement.clippedEnd && "zen-rounded-e-none",
          current.barClassName?.(task),
        ),
      );
      plan.setAttribute("aria-hidden", "true");
      plan.setAttribute("data-gantt-plan", "");
      plan.style.insetInlineStart = `${placement.startPct}%`;
      plan.style.width = `${placement.widthPct}%`;
      plan.style.top = `${geo.actualTop}px`;
      plan.style.height = `${geo.actualHeight}px`;
      out.push(plan);
      if (plannedLabel) {
        const label = el(
          "span",
          "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
          plannedLabel,
        );
        label.setAttribute("aria-hidden", "true");
        beside(label, placement.startPct, placement.widthPct, plannedLabel);
        label.style.top = `${geo.actualTop}px`;
        label.style.height = `${geo.actualHeight}px`;
        out.push(label);
      }
    }

    if (!main) {
      out.push(el("span", "zen-sr-only", `${loc.t(row.span ? "gantt.notInRange" : "gantt.noDates")}, ${actualText}`));
      return out;
    }

    const bar = el(
      "button",
      cn(
        "zen-absolute zen-overflow-hidden zen-rounded-zen-sm zen-border",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        !color && BAR_CLASS[row.status],
        main.clippedStart && "zen-rounded-s-none zen-border-s-0",
        (main.clippedEnd || actual.open) && "zen-rounded-e-none",
        current.onTaskClick && "hover:zen-brightness-95",
        current.actualBarClassName?.(task),
      ),
    );
    bar.type = "button";
    bar.tabIndex = -1;
    bar.setAttribute("data-gantt-bar", "");
    bar.setAttribute("data-gantt-actual", "");
    if (actual.open) bar.setAttribute("data-gantt-actual-open", "");
    bar.style.insetInlineStart = `${main.startPct}%`;
    bar.style.width = `${main.widthPct}%`;
    bar.style.top = `${geo.barTop}px`;
    bar.style.height = `${geo.barHeight}px`;
    if (color) softSkin(bar, color);
    // The tooltip: the task, what actually happened, then the plan — every part already translated.
    bar.title = [
      task.name,
      actualText,
      row.span
        ? loc.t("gantt.barSpan", {
            start: formatDay(row.span.start),
            end: formatDay(row.span.end),
            status: loc.t(STATUS_LABEL[row.status]),
          })
        : null,
    ]
      .filter(Boolean)
      .join(" · ");
    bar.addEventListener("click", () => current.onTaskClick?.(task, row));
    bar.append(
      el(
        "span",
        "zen-sr-only",
        `${
          row.span
            ? loc.t(row.progress === null ? "gantt.barSpan" : "gantt.barSpanProgress", {
                start: formatDay(row.span.start),
                end: formatDay(row.span.end),
                status: loc.t(STATUS_LABEL[row.status]),
                percent: Math.round(progress),
              })
            : loc.t("gantt.noDates")
        }, ${actualText}`,
      ),
    );
    if (row.progress !== null) {
      const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", !color && FILL_CLASS[row.status]));
      fill.setAttribute("aria-hidden", "true");
      fill.style.width = `${progress}%`;
      if (color) fill.style.backgroundColor = color;
      bar.append(fill);
    }
    const mainWidthPx = (main.widthPct / 100) * axis.axisWidth;
    const labelInside =
      !!mainLabel && (actualLabel ? ganttLabelFits(mainLabel, mainWidthPx) : mainWidthPx >= LABEL_MIN_PX);
    if (mainLabel && labelInside) {
      const label = pill(mainLabel);
      label.setAttribute("aria-hidden", "true");
      bar.append(label);
    }
    const accent = current.barAccent?.(task);
    if (accent) {
      const stripe = el("span", "zen-absolute zen-inset-y-0 zen-start-0 zen-w-1 zen-rounded-s-zen-sm");
      stripe.setAttribute("aria-hidden", "true");
      stripe.setAttribute("data-gantt-accent", "");
      stripe.style.backgroundColor = accent;
      bar.append(stripe);
    }
    out.push(bar);
    if (mainLabel && !labelInside) {
      const label = el(
        "span",
        "zen-pointer-events-none zen-absolute zen-flex zen-items-center zen-whitespace-nowrap zen-[font-size:var(--zen-schedule-label-font-size)] zen-font-medium zen-text-zen-muted-fg",
        mainLabel,
      );
      label.setAttribute("aria-hidden", "true");
      beside(label, main.startPct, main.widthPct, mainLabel);
      label.style.top = `${geo.barTop}px`;
      label.style.height = `${geo.barHeight}px`;
      out.push(label);
    }
    return out;
  }

  /* The key. Built from the rows when asked for with `true`: the label each
     row's chip shows and the colour it is drawn in, once each. A list, so it
     is read as one. */
  function legendNode(rows: Row[]): Node | null {
    const legend = current.legend;
    if (!legend) return null;
    const items: GanttLegendItem[] = Array.isArray(legend)
      ? legend
      : ganttLegendItems(rows, (row) => ({
          label: row.task.statusLabel ?? loc.t(STATUS_LABEL[row.status]),
          color: current.statusColor?.(row.task, row) || GANTT_STATUS_COLOR[row.status],
        }));
    if (items.length === 0) return null;
    const list = el("ul", "zen-m-0 zen-flex zen-list-none zen-flex-wrap zen-items-center zen-gap-x-3 zen-gap-y-1 zen-p-0");
    list.setAttribute("aria-label", loc.t("gantt.legend"));
    for (const item of items) {
      const entry = el("li", "zen-flex zen-items-center zen-gap-1.5 zen-text-xs zen-text-zen-muted-fg");
      // Bordered, so a light colour — the plan's grey — still reads as a swatch.
      const swatch = el("span", "zen-inline-block zen-h-2.5 zen-w-2.5 zen-shrink-0 zen-rounded-full zen-border zen-border-zen-border");
      swatch.setAttribute("aria-hidden", "true");
      swatch.style.backgroundColor = item.color;
      entry.append(swatch, document.createTextNode(item.label));
      list.append(entry);
    }
    return list;
  }

  // Built later than the factory call, so inside the locale it was built in (see withLocale).
  function render(): void {
    withLocale(loc, renderNow);
  }
  function renderNow(): void {
    for (const handle of owned) handle.destroy();
    owned = [];

    const now = nowOf();
    const spec = requestedPane().map((key) => ({ key, width: PANE_PX[key] }));
    /* Resolved TWICE on the first pass and once after: the axis needs the
       scroller's width, and the scroller does not exist until the grid is
       built. The grid reports the measurement back through `onMetrics`, which
       lands here as an update — the same measure/recompute/redraw loop the
       other bindings run through a signal. */
    const axis = resolveScheduleAxis({
      view: viewOf(),
      anchor: dateOf(),
      fitRange: fitRangeOf(),
      now,
      calendar: current.calendar,
      hourStep: current.hourStep,
      columnWidth: current.columnWidth,
      paneColumns: spec,
      available: grid?.metrics().width ?? 0,
      grouped: headerGroupsOf(),
      continuous: current.continuous,
      plan: planSpanOf(),
      monthUnit: current.monthColumns,
    });

    const expandedSet = expandedOf() === null ? null : new Set(expandedOf()!);
    const flat = flattenGanttTasks<GanttTask>(
      current.tasks ?? [],
      (task) => (expandedSet === null ? true : expandedSet.has(task.id)),
      now,
      { calendar: current.calendar, minGapMs: axis.minGapMs, deriveFromActuals: current.deriveFromActuals },
    );

    if (current.loading) {
      grid?.destroy();
      grid = null;
      root.className = cn(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        current.class,
      );
      root.setAttribute("role", "status");
      root.setAttribute("aria-label", loc.t("gantt.loadingSchedule"));
      root.replaceChildren();
      for (let i = 0; i < (current.loadingRows ?? 6); i++) {
        const line = el("div", "zen-flex zen-items-center zen-gap-3");
        const a = keep(Skeleton({ class: "zen-h-4" }));
        (a.el as HTMLElement).style.width = `${PANE_PX.name - 24 - (i % 3) * INDENT_PX}px`;
        const b = keep(Skeleton({ class: "zen-h-4 zen-w-16" }));
        /* Staggered so the placeholder reads as a schedule rather than as a
           table — the shape is the information here. */
        const c = keep(Skeleton({ class: "zen-h-4" }));
        (c.el as HTMLElement).style.marginInlineStart = `${(i * 37) % 45}%`;
        (c.el as HTMLElement).style.width = `${20 + ((i * 13) % 30)}%`;
        line.append(a.el, b.el, c.el);
        root.append(line);
      }
      return;
    }

    if (flat.rows.length === 0) {
      grid?.destroy();
      grid = null;
      root.className = cn("zen-w-full", current.class);
      root.removeAttribute("role");
      root.removeAttribute("aria-label");
      root.replaceChildren();
      if (current.emptyState !== undefined) {
        root.append(...toNodes(current.emptyState));
      } else {
        const empty = keep(
          EmptyState({
            bordered: true,
            children: [
              EmptyStateIcon({ children: Icon({ name: "calendar", size: 22 }) }),
              EmptyStateTitle({ children: loc.t("gantt.nothingScheduled") }),
              EmptyStateDescription({
                children: loc.t("gantt.addATaskWithA"),
              }),
            ],
          }),
        );
        root.append(empty.el);
      }
      return;
    }

    const placements = new Map<number, PlanningPlacement>();
    for (const row of flat.rows) {
      if (!row.span) continue;
      // A milestone is a POINT: where its date falls on the axis, or nowhere.
      // placeAppointment would give it a minimum-width sliver of a bar.
      if (row.task.milestone) {
        const at = nowPct(axis.range, row.span.start);
        if (at !== null) placements.set(row.index, { startPct: at, widthPct: 0, clippedStart: false, clippedEnd: false });
        continue;
      }
      const placement = placeAppointment(row.span, axis.range);
      if (placement) placements.set(row.index, placement);
    }

    let connectors = [] as ReturnType<typeof ganttConnectors>;
    if (current.showDependencies !== false && current.dependencies && current.dependencies.length > 0) {
      const anchors = new Map<string, GanttBarAnchor>();
      /* A milestone's anchor spans the diamond, so an arrow meets its left or
         right tip instead of disappearing under it at the centre. */
      const halfPct = axis.axisWidth > 0 ? (barPxOf() / 2 / axis.axisWidth) * 100 : 0;
      for (const [id, index] of flat.rowIndexById) {
        /* In the "primary" layout the arrows meet the ACTUAL bar — it is the
           main one, on the row's middle. A row with no actual (or one
           off-screen) keeps its planned bar, as everywhere else. */
        const row = flat.rows[index];
        const placement =
          (current.actualLayout === "primary" && row?.actual && !row.task.milestone
            ? placeAppointment(row.actual, axis.range)
            : null) ?? placements.get(index);
        if (!placement) continue;
        if (flat.rows[index]?.task.milestone) {
          anchors.set(id, { rowIndex: index, startPct: placement.startPct - halfPct, widthPct: 2 * halfPct });
        } else {
          anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
        }
      }
      connectors = ganttConnectors(anchors, current.dependencies, {
        axisWidth: axis.axisWidth,
        rowHeight: rowHeightOf(),
      });
    }

    /* `w-full` and `min-w-0`, and they are load-bearing rather than tidy. This
       root wraps the grid so the loading and empty states have somewhere stable
       to swap into — but a bare <div> inside a flex row is sized by its CONTENT,
       and the fit axis is sized from the container, so the two define each
       other. Measured before this line existed: identical data drew at 1096px,
       1800px and 930px in different sections of this very page, where React and
       Solid drew 1008 throughout. The other bindings avoid it by having the
       grid's own root BE the component's root, which already carries w-full. */
    root.className = "zen-w-full zen-min-w-0";
    root.removeAttribute("role");
    root.removeAttribute("aria-label");

    const options = {
      rows: flat.rows,
      rowId: (row: Row) => row.task.id,
      columns: paneColumns(),
      colCount: 5,
      timelineColIndex: COL_INDEX.timeline,
      renderTrack: (row: Row) => track(row, axis, placements.get(row.index) ?? null),
      rowHeight: rowHeightOf(),
      rowClass: current.rowClassName ? (row: Row) => current.rowClassName?.(row.task, row) : undefined,
      maxBodyHeight: current.maxBodyHeight,
      headerClassName: current.headerClassName,
      headerGroups: headerGroupsOf(),
      axis,
      view: viewOf(),
      anchor: dateOf(),
      now,
      connectors,
      connectorStyle: current.dependencyStyle
        ? (connector: GanttConnector) => current.dependencyStyle?.(connector.dependency)
        : undefined,
      views: current.views,
      hideToolbar: current.hideToolbar,
      legend: legendNode(flat.rows),
      onViewChange: setView,
      onDateChange: setDate,
      onToggle: (row: Row) => toggle(row.task.id),
      onActivate: (row: Row) => current.onTaskClick?.(row.task, row),
      onMetrics: () => render(),
      ariaLabel: loc.t("gantt.projectSchedule"),
      class: current.class,
    };

    if (grid) {
      grid.update(options);
    } else {
      grid = ScheduleGrid<Row>(options);
      root.replaceChildren(grid.el);
    }
  }

  render();

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      for (const handle of owned) handle.destroy();
      owned = [];
      grid?.destroy();
      grid = null;
      root.remove();
    },
  };
}
