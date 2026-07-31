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
import { Tooltip } from "../tooltip/tooltip";
import { toNodes, type AnyZenComponent, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import {
  INDENT_PX,
  ROW_PX,
  ScheduleGrid,
  resolveScheduleAxis,
  type ScheduleAxis,
  type ScheduleColumn,
  type ScheduleGridHandle,
} from "./schedule-grid";

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
  subtitle?: string;
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
}

const BAR_PX = 18;
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — the y the connector routes are computed at. */
const BAR_TOP = (ROW_PX - BAR_PX) / 2;

/** The frozen pane's columns. Fixed, because a sticky pane cannot be sized by
 *  its content without moving as you scroll. */
const PANE_PX: Record<GanttPaneColumn, number> = {
  name: 180,
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
const LABEL_MIN_PX = 44;
const LABEL_MAX_PCT = 85;
/** Room an outside label needs after the bar before it is put in front of it —
 *  without this a task ending at the range edge draws its label PAST the axis. */
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

  const fitRangeOf = (): PlanningRange | null =>
    viewOf() === "fit" ? ganttFitRange(current.tasks ?? [], { calendar: current.calendar }) : null;

  /** The four pane columns, as DATA — which is what lets the grid know nothing about tasks. */
  const paneColumns = (): ScheduleColumn<Row>[] =>
    requestedPane().map((key) => ({
      key,
      label: PANE_LABEL[key],
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
          row.expanded ? `Collapse ${task.name}` : `Expand ${task.name}`,
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
      if (task.subtitle) {
        text.append(el("span", "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", task.subtitle));
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
      return [
        Badge({
          variant: "soft",
          color: STATUS_COLOR[row.status],
          class: "zen-truncate",
          children: task.statusLabel ?? STATUS_LABEL[row.status],
        }),
      ];
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
  function track(
    row: Row,
    axis: ScheduleAxis,
    placement: PlanningPlacement | null,
  ): Array<Node | AnyZenComponent> {
    if (!placement) {
      /* An empty gridcell is announced as "blank", which is right for a cell
         with no data and wrong for THIS one: the reader arrowed to the timeline
         expecting a bar, and "blank" does not distinguish "no dates" from
         "starts after the range you are looking at". */
      return [el("span", "zen-sr-only", row.span ? "Not scheduled in this range" : "No dates")];
    }

    const progress = row.progress ?? 0;
    const widthPx = (placement.widthPct / 100) * axis.axisWidth;
    const labelOutside = widthPx < LABEL_MIN_PX;
    const labelOnFill = !labelOutside && progress >= LABEL_MAX_PCT;
    const endPct = placement.startPct + placement.widthPct;
    /* Which SIDE the outside label goes. After the bar normally; before it when
       the bar ends against the edge of the axis and there is nowhere after. */
    const labelBefore = ((100 - endPct) / 100) * axis.axisWidth < LABEL_OUTSIDE_PX;

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
        pieces === null && cn("zen-overflow-hidden zen-border", BAR_CLASS[row.status]),
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
    bar.style.top = `${BAR_TOP}px`;
    bar.style.height = `${BAR_PX}px`;
    bar.title = `${row.task.name} · ${formatDay(row.span!.start)} – ${formatDay(row.span!.end)}${
      row.progress === null ? "" : ` · ${Math.round(progress)}%`
    }`;
    bar.addEventListener("click", () => current.onTaskClick?.(row.task, row));

    bar.append(
      el(
        "span",
        "zen-sr-only",
        `${formatDay(row.span!.start)} to ${formatDay(row.span!.end)}, ${STATUS_LABEL[row.status]}${
          row.progress === null ? "" : `, ${Math.round(progress)} percent complete`
        }`,
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
          cn("zen-absolute zen-inset-y-0 zen-overflow-hidden", BAR_CLASS[row.status], "zen-rounded-zen-sm zen-border"),
        );
        part.setAttribute("aria-hidden", "true");
        part.style.insetInlineStart = `${piece.startPct}%`;
        part.style.width = `${piece.widthPct}%`;
        if (row.progress !== null && piece.fillPct > 0) {
          const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", FILL_CLASS[row.status]));
          fill.style.width = `${piece.fillPct}%`;
          part.append(fill);
        }
        bar.append(part);
      }
    } else if (row.progress !== null) {
      const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", FILL_CLASS[row.status]));
      fill.setAttribute("aria-hidden", "true");
      fill.style.width = `${progress}%`;
      bar.append(fill);
    }

    if (row.progress !== null && !labelOutside) {
      const label = el(
        "span",
        cn(
          "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-text-[10px] zen-font-medium",
          labelOnFill ? cn("zen-start-1", FILL_TEXT_CLASS[row.status]) : "zen-end-1 zen-text-zen-foreground",
        ),
        `${Math.round(progress)}%`,
      );
      label.setAttribute("aria-hidden", "true");
      bar.append(label);
    }

    const out: Array<Node | AnyZenComponent> = [bar];
    if (row.progress !== null && labelOutside) {
      const outside = el(
        "span",
        "zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg",
        `${Math.round(progress)}%`,
      );
      outside.setAttribute("aria-hidden", "true");
      if (labelBefore) outside.style.insetInlineEnd = `calc(${100 - placement.startPct}% + 4px)`;
      else outside.style.insetInlineStart = `calc(${endPct}% + 4px)`;
      outside.style.top = `${BAR_TOP}px`;
      outside.style.height = `${BAR_PX}px`;
      out.push(outside);
    }
    return out;
  }

  function render(): void {
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
    });

    const expandedSet = expandedOf() === null ? null : new Set(expandedOf()!);
    const flat = flattenGanttTasks<GanttTask>(
      current.tasks ?? [],
      (task) => (expandedSet === null ? true : expandedSet.has(task.id)),
      now,
      { calendar: current.calendar, minGapMs: axis.minGapMs },
    );

    if (current.loading) {
      grid?.destroy();
      grid = null;
      root.className = cn(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        current.class,
      );
      root.setAttribute("role", "status");
      root.setAttribute("aria-label", "Loading schedule");
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
              EmptyStateTitle({ children: "Nothing scheduled" }),
              EmptyStateDescription({
                children:
                  "Add a task with a start and an end date and it will appear on the timeline.",
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
      const placement = placeAppointment(row.span, axis.range);
      if (placement) placements.set(row.index, placement);
    }

    let connectors = [] as ReturnType<typeof ganttConnectors>;
    if (current.showDependencies !== false && current.dependencies && current.dependencies.length > 0) {
      const anchors = new Map<string, GanttBarAnchor>();
      for (const [id, index] of flat.rowIndexById) {
        const placement = placements.get(index);
        if (placement) {
          anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
        }
      }
      connectors = ganttConnectors(anchors, current.dependencies, {
        axisWidth: axis.axisWidth,
        rowHeight: ROW_PX,
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
      axis,
      view: viewOf(),
      anchor: dateOf(),
      now,
      connectors,
      views: current.views,
      hideToolbar: current.hideToolbar,
      onViewChange: setView,
      onDateChange: setDate,
      onToggle: (row: Row) => toggle(row.task.id),
      onActivate: (row: Row) => current.onTaskClick?.(row.task, row),
      onMetrics: () => render(),
      ariaLabel: "Project schedule",
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
