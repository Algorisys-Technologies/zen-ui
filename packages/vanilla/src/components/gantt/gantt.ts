import {
  flattenGanttTasks,
  formatGanttVariance,
  ganttConnectors,
  nowPct,
  placeAppointment,
  planningColumns,
  planningRange,
  planningRangeLabel,
  shiftPlanningAnchor,
  type GanttBarAnchor,
  type GanttDependency,
  type GanttRow,
  type GanttTaskNode,
  type GanttTaskStatus,
  type PlanningPlacement,
  type PlanningView,
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
import { Tooltip } from "../tooltip/tooltip";
import {
  applyProps,
  Disposer,
  toNodes,
  type AnyZenComponent,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * Gantt — what the project is doing, and what is waiting on what.
 *
 *   Gantt({ tasks: plan, dependencies: links }).el
 *
 * Two panes over one clock: a task tree that collapses on the left, the same
 * rows as bars on a shared time axis on the right, dependency arrows between
 * them. They are ONE scroller — the task pane is stuck to the inline start and
 * the header to the top — so vertical scrolling can never take a row's name
 * away from its bar.
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 * All the arithmetic is imported from @algorisys/zen-ui-core/gantt and
 * /planning, pinned by scripts/check-gantt.ts and scripts/check-planning.ts, so
 * four renderers cannot drift on where a date is.
 *
 * It does NOT edit: no drag-to-move, no drag-to-resize, no pulling a new
 * dependency between two bars. `onTaskClick` hands you the task and its derived
 * row, and you hand back new `tasks`.
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
  defaultView?: PlanningView;
  view?: PlanningView;
  onViewChange?: (view: PlanningView) => void;
  /** Which views the switcher offers. Default all three. */
  views?: PlanningView[];

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

  /** Reference "now" for the marker, the today column and the derived status. */
  now?: Date;
  /** Pixel width of one column. Defaults to something readable per view. */
  columnWidth?: number;
  hideToolbar?: boolean;

  /** Show skeleton rows instead of the chart. */
  loading?: boolean;
  /** How many skeleton rows. Default 6. */
  loadingRows?: number;
  /** Replaces the whole no-tasks surface. */
  emptyState?: Child;
}

const VIEW_LABEL: Record<PlanningView, string> = { day: "Day", week: "Week", month: "Month" };
const ALL_VIEWS: PlanningView[] = ["day", "week", "month"];

/**
 * Column widths per view, because one number cannot serve all three. A week is
 * 7 columns and can afford to be wide; a month is 31 and cannot.
 */
const COLUMN_PX: Record<PlanningView, number> = { day: 56, week: 128, month: 44 };

const ROW_PX = 36;
const BAR_PX = 18;
/** Bars sit at a fixed offset rather than flex-centred, so a bar's centre is
 *  exactly ROW_PX / 2 — the y the connector routes are computed at. */
const BAR_TOP = (ROW_PX - BAR_PX) / 2;
const HEADER_PX = 44;

const NAME_PX = 188;
const ASSIGNEES_PX = 104;
const STATUS_PX = 96;
const VARIANCE_PX = 80;
const LEFT_PX = NAME_PX + ASSIGNEES_PX + STATUS_PX + VARIANCE_PX;

const INDENT_PX = 14;
const AVATAR_MAX = 3;

/**
 * Where the percent label goes, in the two places the obvious answer fails.
 * Under ~44px of bar there is no room for "100%" and it clips; past ~85% done
 * the fill has reached the inline end and a label there is solid-on-solid.
 */
const LABEL_MIN_PX = 44;
const LABEL_MAX_PCT = 85;

/** Half-height of the connector arrowhead, in the axis's pixel space. */
const ARROW_PX = 5;

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

const SVG_NS = "http://www.w3.org/2000/svg";

const initialsOf = (assignee: GanttAssignee): string =>
  assignee.initials ??
  assignee.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

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

export function Gantt(props: GanttProps): ZenComponent<GanttProps> {
  let current: GanttProps = { ...props };
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  /* The factory owns the uncontrolled view, date and expansion, because there is
     no state hook here — `update({ view })` is how a caller takes control.
     `innerExpanded` is null rather than an empty array for the same reason the
     other bindings hold null: it means "no answer given", which is everything
     open, and a resolved list would freeze that at construction and leave
     later-arriving tasks collapsed. */
  let innerView: PlanningView = props.defaultView ?? "week";
  let innerDate: Date = props.defaultDate ?? new Date();
  let innerExpanded: string[] | null = props.defaultExpanded ?? null;

  const root = el("div");

  /* Handles built by the CURRENT render, destroyed before the next one: a Button
     or a Tooltip holds real listeners on nodes this component created, and there
     is no unmount here to take them away. */
  let owned: AnyZenComponent[] = [];
  const keep = <T extends AnyZenComponent>(comp: T): T => {
    owned.push(comp);
    return comp;
  };

  /* Click listeners on plain <button>s this file builds, so no handle releases
     them. Per-render rather than pushed onto the Disposer, which only runs at
     destroy() and would therefore grow by one entry per bar on every render. */
  let cleanups: Array<() => void> = [];
  const on = (node: HTMLElement, type: string, handler: EventListener) => {
    node.addEventListener(type, handler);
    cleanups.push(() => node.removeEventListener(type, handler));
  };

  const viewOf = () => current.view ?? innerView;
  const dateOf = () => current.date ?? innerDate;
  const expandedOf = () => current.expanded ?? innerExpanded;
  const columnPxOf = () => current.columnWidth ?? COLUMN_PX[viewOf()];

  const setView = (next: PlanningView) => {
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

  function toolbar(view: PlanningView, anchor: Date, now: Date): HTMLElement {
    const bar = el("div", "zen-flex zen-flex-wrap zen-items-center zen-gap-2");

    const prev = keep(
      Button({
        variant: "outline",
        size: "sm",
        "aria-label": "Previous",
        // Logical, not physical: under RTL the axis runs the other way.
        children: keep(Icon({ name: "chevron-left", size: 14, class: "rtl:zen-rotate-180" })),
        onClick: () => setDate(shiftPlanningAnchor(view, anchor, -1)),
      }),
    );
    const today = keep(
      Button({ variant: "outline", size: "sm", children: "Today", onClick: () => setDate(now) }),
    );
    const next = keep(
      Button({
        variant: "outline",
        size: "sm",
        "aria-label": "Next",
        children: keep(Icon({ name: "chevron-right", size: 14, class: "rtl:zen-rotate-180" })),
        onClick: () => setDate(shiftPlanningAnchor(view, anchor, 1)),
      }),
    );

    const label = el(
      "span",
      "zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground",
      planningRangeLabel(view, anchor),
    );

    const switcher = el("div", "zen-ms-auto zen-flex zen-gap-1");
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "View");
    for (const v of current.views ?? ALL_VIEWS) {
      switcher.append(
        keep(
          Button({
            variant: view === v ? "solid" : "outline",
            size: "sm",
            "aria-pressed": view === v,
            children: VIEW_LABEL[v],
            onClick: () => setView(v),
          }),
        ).el,
      );
    }

    bar.append(prev.el, today.el, next.el, label, switcher);
    return bar;
  }

  function assignees(list: GanttAssignee[] | undefined): HTMLElement | null {
    if (!list || list.length === 0) return null;
    const group = keep(
      AvatarGroup({
        max: AVATAR_MAX,
        size: "xs",
        // "loose" is -4px: at xs an avatar is 24px, and the default -8px hides a
        // third of each initial pair behind the next one.
        spacing: "loose",
        children: list.map((assignee) =>
          keep(
            Avatar({
              size: "xs",
              children: [
                assignee.src ? keep(AvatarImage({ src: assignee.src, alt: assignee.name })) : null,
                keep(AvatarFallback({ children: initialsOf(assignee) })),
              ],
            }),
          ),
        ),
      }),
    );
    /* Focusable, so the full list is reachable without a pointer — the "+N" chip
       is the only place some names appear at all. */
    const trigger = el(
      "span",
      "zen-rounded-zen-full focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    );
    trigger.tabIndex = 0;
    trigger.append(group.el);
    keep(
      Tooltip({
        trigger,
        content: list.map((a) => a.name).join(", "),
        delayDuration: 200,
      }) as AnyZenComponent,
    );
    return trigger;
  }

  function render(): void {
    for (const comp of owned) comp.destroy();
    owned = [];
    for (const off of cleanups) off();
    cleanups = [];
    root.replaceChildren();

    const {
      tasks,
      emptyState,
      class: className,
      children: _children,
      dependencies: _deps,
      showDependencies: _sd,
      defaultView: _dv,
      defaultDate: _dd,
      defaultExpanded: _de,
      view: _v,
      date: _d,
      expanded: _e,
      views: _vs,
      now: _n,
      columnWidth: _cw,
      hideToolbar: _ht,
      loading: _l,
      loadingRows: _lr,
      onViewChange: _ovc,
      onDateChange: _odc,
      onExpandedChange: _oec,
      onTaskClick: _otc,
      ...rest
    } = current;

    if (current.loading) {
      root.className = cn(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        className,
      );
      root.setAttribute("role", "status");
      root.setAttribute("aria-label", "Loading schedule");
      for (let i = 0; i < (current.loadingRows ?? 6); i++) {
        const line = el("div", "zen-flex zen-items-center zen-gap-3");
        line.append(
          keep(Skeleton({ class: "zen-h-4", style: { width: `${NAME_PX - 24 - (i % 3) * INDENT_PX}px` } })).el,
          keep(Skeleton({ class: "zen-h-4 zen-w-16" })).el,
          keep(
            Skeleton({
              class: "zen-h-4",
              /* Staggered so the placeholder reads as a schedule rather than as
                 a table — the shape is the information here. */
              style: { marginInlineStart: `${(i * 37) % 45}%`, width: `${20 + ((i * 13) % 30)}%` },
            }),
          ).el,
        );
        root.append(line);
      }
      removeProps?.();
      removeProps = applyProps(root, rest as Record<string, unknown>);
      return;
    }

    root.removeAttribute("role");
    root.removeAttribute("aria-label");

    const view = viewOf();
    const anchor = dateOf();
    const now = current.now ?? new Date();
    const range = planningRange(view, anchor);
    const columns = planningColumns(view, anchor, { now });
    const columnPx = columnPxOf();
    const axisWidth = columns.length * columnPx;
    const marker = nowPct(range, now);

    const expandedIds = expandedOf();
    const expandedSet = expandedIds === null ? null : new Set(expandedIds);
    const { rows, rowIndexById } = flattenGanttTasks<GanttTask>(
      tasks ?? [],
      (task) => (expandedSet === null ? true : expandedSet.has(task.id)),
      now,
    );

    if (rows.length === 0) {
      root.className = cn("zen-w-full", className);
      root.append(
        ...toNodes(
          emptyState ??
            keep(
              EmptyState({
                bordered: true,
                children: [
                  keep(EmptyStateIcon({ children: keep(Icon({ name: "calendar", size: 22 })) })),
                  keep(EmptyStateTitle({ children: "Nothing scheduled" })),
                  keep(
                    EmptyStateDescription({
                      children:
                        "Add a task with a start and an end date and it will appear on the timeline.",
                    }),
                  ),
                ],
              }),
            ),
        ),
      );
      removeProps?.();
      removeProps = applyProps(root, rest as Record<string, unknown>);
      return;
    }

    root.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-3", className);

    const placements = new Map<number, PlanningPlacement>();
    for (const row of rows) {
      if (!row.span) continue;
      const placement = placeAppointment(row.span, range);
      if (placement) placements.set(row.index, placement);
    }

    if (!current.hideToolbar) root.append(toolbar(view, anchor, now));

    /* ONE scroller. The task pane is sticky at the inline start and the header
       sticky at the top, so vertical scroll moves both panes and horizontal
       scroll moves only the axis — with no scroll listener to fall out of sync. */
    const scroller = el(
      "div",
      "zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border",
    );
    const inner = el("div");
    inner.style.width = `${LEFT_PX + axisWidth}px`;

    const head = el(
      "div",
      "zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted",
    );
    head.style.height = `${HEADER_PX}px`;
    head.style.boxSizing = "border-box";

    const headLeft = el(
      "div",
      "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
    );
    headLeft.style.width = `${LEFT_PX}px`;
    headLeft.style.setProperty("inset-inline-start", "0");
    for (const [width, text] of [
      [NAME_PX, "Task"],
      [ASSIGNEES_PX, "Assignees"],
      [STATUS_PX, "Status"],
      [VARIANCE_PX, "Variance"],
    ] as Array<[number, string]>) {
      const cell = el("div", width === NAME_PX ? "zen-truncate zen-px-3" : "zen-truncate zen-px-2", text);
      cell.style.width = `${width}px`;
      headLeft.append(cell);
    }
    head.append(headLeft);

    const headCols = el("div", "zen-flex");
    headCols.style.width = `${axisWidth}px`;
    for (const column of columns) {
      const cell = el(
        "div",
        cn(
          "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-border-e zen-border-zen-border last:zen-border-e-0",
          column.nonWorking && "zen-bg-zen-muted",
          column.today && "zen-bg-zen-primary-soft",
        ),
      );
      cell.style.width = `${columnPx}px`;
      cell.append(el("span", "zen-text-xs zen-font-medium zen-text-zen-foreground", column.label));
      if (column.sublabel) {
        cell.append(el("span", "zen-text-[10px] zen-text-zen-muted-fg", column.sublabel));
      }
      headCols.append(cell);
    }
    head.append(headCols);
    inner.append(head);

    const body = el("div", "zen-relative");
    body.style.height = `${rows.length * ROW_PX}px`;

    for (const row of rows) {
      const placement = placements.get(row.index) ?? null;
      const progress = row.progress ?? 0;
      const widthPx = placement ? (placement.widthPct / 100) * axisWidth : 0;
      const labelOutside = widthPx < LABEL_MIN_PX;
      const labelOnFill = !labelOutside && progress >= LABEL_MAX_PCT;

      const rowEl = el("div", "zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0");
      rowEl.style.height = `${ROW_PX}px`;
      rowEl.style.boxSizing = "border-box";

      const left = el(
        "div",
        "zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background",
      );
      left.style.width = `${LEFT_PX}px`;
      left.style.setProperty("inset-inline-start", "0");

      const nameCell = el("div", "zen-flex zen-min-w-0 zen-items-center zen-gap-1 zen-pe-2");
      nameCell.style.width = `${NAME_PX}px`;
      nameCell.style.setProperty("padding-inline-start", `${8 + row.depth * INDENT_PX}px`);

      if (row.hasChildren) {
        const chevron = document.createElement("button");
        chevron.type = "button";
        chevron.className =
          "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring";
        chevron.setAttribute("aria-expanded", String(row.expanded));
        chevron.setAttribute(
          "aria-label",
          row.expanded ? `Collapse ${row.task.name}` : `Expand ${row.task.name}`,
        );
        chevron.append(
          keep(
            Icon({
              name: row.expanded ? "chevron-down" : "chevron-right",
              size: 14,
              class: row.expanded ? undefined : "rtl:zen-rotate-180",
            }),
          ).el,
        );
        on(chevron, "click", () => toggle(row.task.id));
        nameCell.append(chevron);
      } else {
        /* A spacer, not a hidden chevron: leaves must line up with their
           siblings' text, or every leaf reads as one level shallower. */
        const spacer = el("span", "zen-h-5 zen-w-5 zen-shrink-0");
        spacer.setAttribute("aria-hidden", "true");
        nameCell.append(spacer);
      }

      const names = el("span", "zen-min-w-0");
      const title = el(
        "span",
        cn(
          "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
          row.hasChildren && "zen-font-semibold",
        ),
        row.task.name,
      );
      title.title = row.task.name;
      names.append(title);
      if (row.task.subtitle) {
        names.append(el("span", "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", row.task.subtitle));
      }
      nameCell.append(names);
      left.append(nameCell);

      const assigneeCell = el("div", "zen-flex zen-items-center zen-px-2");
      assigneeCell.style.width = `${ASSIGNEES_PX}px`;
      const avatars = assignees(row.task.assignees);
      if (avatars) assigneeCell.append(avatars);
      left.append(assigneeCell);

      const statusCell = el("div", "zen-flex zen-items-center zen-px-2");
      statusCell.style.width = `${STATUS_PX}px`;
      statusCell.append(
        keep(
          Badge({
            variant: "soft",
            color: STATUS_COLOR[row.status],
            class: "zen-truncate",
            children: row.task.statusLabel ?? STATUS_LABEL[row.status],
          }),
        ).el,
      );
      left.append(statusCell);

      const varianceCell = el("div", "zen-flex zen-items-center zen-px-2");
      varianceCell.style.width = `${VARIANCE_PX}px`;
      const varianceText = formatGanttVariance(row.variance);
      if (varianceText) {
        const chip = keep(
          Badge({
            variant: "soft",
            color:
              row.variance === null || row.variance === 0
                ? "neutral"
                : row.variance > 0
                  ? "error"
                  : "success",
            children: varianceText,
          }),
        ).el;
        /* "+2d" is a signed number, and bidi reorders a leading sign to the far
           side in an RTL run — it renders as "2d+". */
        chip.setAttribute("dir", "ltr");
        varianceCell.append(chip);
      }
      left.append(varianceCell);
      rowEl.append(left);

      const track = el("div", "zen-relative zen-shrink-0");
      track.style.width = `${axisWidth}px`;

      // The column rules as a background layer rather than as parents of the
      // bar: a bar spanning four days cannot live inside one day's box.
      const rules = el("div", "zen-absolute zen-inset-0 zen-flex");
      rules.setAttribute("aria-hidden", "true");
      for (const column of columns) {
        const rule = el(
          "div",
          cn(
            "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
            column.nonWorking && "zen-bg-zen-muted/40",
            column.today && "zen-bg-zen-primary-soft/40",
          ),
        );
        rule.style.width = `${columnPx}px`;
        rules.append(rule);
      }
      track.append(rules);

      if (placement && row.span) {
        /* A real <button> whether or not a handler was passed: bars are the only
           things on the axis worth reaching by keyboard, and a plain div takes
           the whole chart out of the tab order. */
        const bar = document.createElement("button");
        bar.type = "button";
        bar.className = cn(
          "zen-absolute zen-overflow-hidden zen-rounded-zen-sm zen-border",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          BAR_CLASS[row.status],
          // Square off a cut edge so a bar continuing past the view does not
          // look like it ends there.
          placement.clippedStart && "zen-rounded-s-none zen-border-s-0",
          placement.clippedEnd && "zen-rounded-e-none zen-border-e-0",
          current.onTaskClick && "hover:zen-brightness-95",
        );
        bar.style.setProperty("inset-inline-start", `${placement.startPct}%`);
        bar.style.width = `${placement.widthPct}%`;
        bar.style.top = `${BAR_TOP}px`;
        bar.style.height = `${BAR_PX}px`;
        const dates = `${formatDay(row.span.start)} – ${formatDay(row.span.end)}`;
        bar.title = `${row.task.name} · ${dates}${row.progress === null ? "" : ` · ${Math.round(progress)}%`}`;
        bar.append(
          el(
            "span",
            "zen-sr-only",
            `${formatDay(row.span.start)} to ${formatDay(row.span.end)}, ${STATUS_LABEL[row.status]}${
              row.progress === null ? "" : `, ${Math.round(progress)} percent complete`
            }`,
          ),
        );

        if (row.progress !== null) {
          const fill = el("span", cn("zen-absolute zen-inset-y-0 zen-start-0", FILL_CLASS[row.status]));
          fill.setAttribute("aria-hidden", "true");
          fill.style.width = `${progress}%`;
          bar.append(fill);

          if (!labelOutside) {
            const label = el(
              "span",
              cn(
                "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-text-[10px] zen-font-medium",
                labelOnFill
                  ? cn("zen-start-1", FILL_TEXT_CLASS[row.status])
                  : "zen-end-1 zen-text-zen-foreground",
              ),
              `${Math.round(progress)}%`,
            );
            label.setAttribute("aria-hidden", "true");
            bar.append(label);
          }
        }

        const handler = current.onTaskClick;
        if (handler) on(bar, "click", () => handler(row.task, row));
        track.append(bar);

        if (row.progress !== null && labelOutside) {
          const outside = el(
            "span",
            "zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg",
            `${Math.round(progress)}%`,
          );
          outside.setAttribute("aria-hidden", "true");
          outside.style.setProperty(
            "inset-inline-start",
            `calc(${placement.startPct + placement.widthPct}% + 4px)`,
          );
          outside.style.top = `${BAR_TOP}px`;
          outside.style.height = `${BAR_PX}px`;
          track.append(outside);
        }
      }

      rowEl.append(track);
      body.append(rowEl);
    }

    if (marker !== null) {
      const line = el("div", "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error");
      line.setAttribute("aria-hidden", "true");
      line.style.height = `${rows.length * ROW_PX}px`;
      line.style.setProperty("inset-inline-start", `${LEFT_PX + (marker / 100) * axisWidth}px`);
      body.append(line);
    }

    const dependencies = current.dependencies;
    if (current.showDependencies !== false && dependencies && dependencies.length > 0) {
      const anchors = new Map<string, GanttBarAnchor>();
      for (const [id, index] of rowIndexById) {
        const placement = placements.get(index);
        if (placement) {
          anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
        }
      }
      const connectors = ganttConnectors(anchors, dependencies, { axisWidth, rowHeight: ROW_PX });
      if (connectors.length > 0) {
        const height = rows.length * ROW_PX;
        /* Mirrored under RTL rather than recomputed: the bars are placed with
           logical inset properties, so the axis is already flipped and the
           routes have to flip with it — arrowheads included. */
        const svg = document.createElementNS(SVG_NS, "svg");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("class", "zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100");
        svg.setAttribute("width", String(axisWidth));
        svg.setAttribute("height", String(height));
        svg.setAttribute("viewBox", `0 0 ${axisWidth} ${height}`);
        svg.style.setProperty("inset-inline-start", `${LEFT_PX}px`);
        for (const connector of connectors) {
          const path = document.createElementNS(SVG_NS, "path");
          path.setAttribute("d", connector.d);
          path.setAttribute("fill", "none");
          // zen-stroke-* / zen-fill-* generate nothing under this preset — the
          // token has to be named directly.
          path.setAttribute("stroke", "var(--zen-color-muted-fg)");
          path.setAttribute("stroke-width", "1.5");
          const head2 = document.createElementNS(SVG_NS, "polygon");
          head2.setAttribute(
            "points",
            [
              `${connector.arrow.x},${connector.arrow.y}`,
              `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y - ARROW_PX}`,
              `${connector.arrow.x - connector.arrow.dir * ARROW_PX * 1.6},${connector.arrow.y + ARROW_PX}`,
            ].join(" "),
          );
          head2.setAttribute("fill", "var(--zen-color-muted-fg)");
          svg.append(path, head2);
        }
        body.append(svg);
      }
    }

    inner.append(body);
    scroller.append(inner);
    root.append(scroller);

    removeProps?.();
    removeProps = applyProps(root, rest as Record<string, unknown>);
  }

  render();
  disposer.add(() => removeProps?.());
  disposer.add(() => {
    for (const comp of owned) comp.destroy();
    owned = [];
    for (const off of cleanups) off();
    cleanups = [];
  });

  return {
    el: root,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      root.remove();
    },
  };
}
