import { type JSX, createMemo, createSignal, For, Show } from "solid-js";
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
  type PlanningColumn,
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
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/tooltip";

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
 * Rows are not virtualized. The connector overlay is one SVG spanning every
 * row, so windowing the rows would mean windowing the routes as well, and a
 * plan large enough to need it is one that wants a filter rather than a longer
 * scroll. A few hundred rows render fine.
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

  /** Uncontrolled starting view. Default "week". */
  defaultView?: PlanningView;
  /** Controlled view; pair with `onViewChange`. */
  view?: PlanningView;
  onViewChange?: (view: PlanningView) => void;
  /** Which views the switcher offers. Default all three. */
  views?: PlanningView[];

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

  /** Reference "now" for the marker, the today column and the derived status. */
  now?: Date;
  /** Pixel width of one column. Defaults to something readable per view. */
  columnWidth?: number;
  /** Hide the toolbar when your page already has one. */
  hideToolbar?: boolean;

  /** Show skeleton rows instead of the chart. */
  loading?: boolean;
  /** How many skeleton rows. Default 6. */
  loadingRows?: number;
  /** Replaces the whole no-tasks surface. */
  emptyState?: JSX.Element;

  class?: string;
}

const VIEW_LABEL: Record<PlanningView, string> = { day: "Day", week: "Week", month: "Month" };
const ALL_VIEWS: PlanningView[] = ["day", "week", "month"];

/**
 * Column widths per view, because one number cannot serve all three. A week is
 * 7 columns and can afford to be wide; a month is 31 and cannot, or every plan
 * opens scrolled halfway off its own axis.
 */
const COLUMN_PX: Record<PlanningView, number> = { day: 56, week: 128, month: 44 };

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

export const Gantt = (props: GanttProps) => {
  const [innerView, setInnerView] = createSignal<PlanningView>(props.defaultView ?? "week");
  const [innerDate, setInnerDate] = createSignal<Date>(props.defaultDate ?? new Date());
  /* null is not "nothing open", it is "no answer given" — the default, which is
     everything open. Storing the resolved list instead would freeze the answer
     at mount and silently leave later-arriving tasks collapsed. */
  const [innerExpanded, setInnerExpanded] = createSignal<string[] | null>(props.defaultExpanded ?? null);

  const view = () => props.view ?? innerView();
  const anchor = () => props.date ?? innerDate();
  const now = () => props.now ?? new Date();
  const columnPx = () => props.columnWidth ?? COLUMN_PX[view()];

  const setView = (next: PlanningView) => {
    if (props.view === undefined) setInnerView(next);
    props.onViewChange?.(next);
  };
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

  const range = createMemo(() => planningRange(view(), anchor()));
  const columns = createMemo(() => planningColumns(view(), anchor(), { now: now() }));
  const axisWidth = createMemo(() => columns().length * columnPx());
  const marker = createMemo(() => nowPct(range(), now()));

  const flat = createMemo(() => {
    const set = expandedSet();
    return flattenGanttTasks<GanttTask>(
      props.tasks ?? [],
      (task) => (set === null ? true : set.has(task.id)),
      now(),
    );
  });
  const rows = () => flat().rows;

  /** One placement per row, and the same placements keyed by every task id —
   *  including ids folded into a collapsed parent, which is what keeps their
   *  dependency arrows pointing at the summary bar instead of vanishing. */
  const placements = createMemo(() => {
    const map = new Map<number, PlanningPlacement>();
    for (const row of rows()) {
      if (!row.span) continue;
      const placement = placeAppointment(row.span, range());
      if (placement) map.set(row.index, placement);
    }
    return map;
  });

  const connectors = createMemo(() => {
    const dependencies = props.dependencies;
    if (props.showDependencies === false || !dependencies || dependencies.length === 0) return [];
    const placed = placements();
    const anchors = new Map<string, GanttBarAnchor>();
    for (const [id, index] of flat().rowIndexById) {
      const placement = placed.get(index);
      if (placement) {
        anchors.set(id, { rowIndex: index, startPct: placement.startPct, widthPct: placement.widthPct });
      }
    }
    return ganttConnectors(anchors, dependencies, { axisWidth: axisWidth(), rowHeight: ROW_PX });
  });

  const bodyHeight = () => rows().length * ROW_PX;

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
          aria-label="Loading schedule"
        >
          <For each={Array.from({ length: props.loadingRows ?? 6 }, (_, i) => i)}>
            {(i) => (
              <div class="zen-flex zen-items-center zen-gap-3">
                <Skeleton class="zen-h-4" style={{ width: `${NAME_PX - 24 - (i % 3) * INDENT_PX}px` }} />
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
                <EmptyStateTitle>Nothing scheduled</EmptyStateTitle>
                <EmptyStateDescription>
                  Add a task with a start and an end date and it will appear on the timeline.
                </EmptyStateDescription>
              </EmptyState>
            )}
          </div>
        }
      >
        <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-3", props.class)}>
          <Show when={!props.hideToolbar}>
            <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-2">
              <Button
                variant="outline"
                size="sm"
                aria-label="Previous"
                onClick={() => setDate(shiftPlanningAnchor(view(), anchor(), -1))}
              >
                {/* Logical, not physical: under RTL the axis runs the other way. */}
                <Icon name="chevron-left" size={14} class="rtl:zen-rotate-180" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setDate(now())}>
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                aria-label="Next"
                onClick={() => setDate(shiftPlanningAnchor(view(), anchor(), 1))}
              >
                <Icon name="chevron-right" size={14} class="rtl:zen-rotate-180" />
              </Button>

              <span class="zen-mx-1 zen-text-sm zen-font-medium zen-text-zen-foreground">
                {planningRangeLabel(view(), anchor())}
              </span>

              <div class="zen-ms-auto zen-flex zen-gap-1" role="group" aria-label="View">
                <For each={props.views ?? ALL_VIEWS}>
                  {(v) => (
                    <Button
                      variant={view() === v ? "solid" : "outline"}
                      size="sm"
                      aria-pressed={view() === v}
                      onClick={() => setView(v)}
                    >
                      {VIEW_LABEL[v]}
                    </Button>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* ONE scroller. The task pane is sticky at the inline start and the
              header sticky at the top, so vertical scroll moves both panes and
              horizontal scroll moves only the axis — with no scroll listener to
              fall out of sync. */}
          <div class="zen-relative zen-max-h-[32rem] zen-overflow-auto zen-rounded-zen-md zen-border zen-border-zen-border">
            <div style={{ width: `${LEFT_PX + axisWidth()}px` }}>
              <div
                class="zen-sticky zen-top-0 zen-z-30 zen-flex zen-border-b zen-border-zen-border zen-bg-zen-muted"
                style={{ height: `${HEADER_PX}px`, "box-sizing": "border-box" }}
              >
                <div
                  class="zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-text-xs zen-font-semibold zen-text-zen-muted-fg"
                  style={{ width: `${LEFT_PX}px`, "inset-inline-start": "0" }}
                >
                  <div class="zen-truncate zen-px-3" style={{ width: `${NAME_PX}px` }}>
                    Task
                  </div>
                  <div class="zen-truncate zen-px-2" style={{ width: `${ASSIGNEES_PX}px` }}>
                    Assignees
                  </div>
                  <div class="zen-truncate zen-px-2" style={{ width: `${STATUS_PX}px` }}>
                    Status
                  </div>
                  <div class="zen-truncate zen-px-2" style={{ width: `${VARIANCE_PX}px` }}>
                    Variance
                  </div>
                </div>

                <div class="zen-flex" style={{ width: `${axisWidth()}px` }}>
                  <For each={columns()}>
                    {(column) => (
                      <div
                        class={cn(
                          "zen-flex zen-shrink-0 zen-flex-col zen-items-center zen-justify-center zen-border-e zen-border-zen-border last:zen-border-e-0",
                          column.nonWorking && "zen-bg-zen-muted",
                          column.today && "zen-bg-zen-primary-soft",
                        )}
                        style={{ width: `${columnPx()}px` }}
                      >
                        <span class="zen-text-xs zen-font-medium zen-text-zen-foreground">
                          {column.label}
                        </span>
                        <Show when={column.sublabel}>
                          <span class="zen-text-[10px] zen-text-zen-muted-fg">{column.sublabel}</span>
                        </Show>
                      </div>
                    )}
                  </For>
                </div>
              </div>

              <div class="zen-relative" style={{ height: `${bodyHeight()}px` }}>
                <For each={rows()}>
                  {(row) => (
                    <GanttRowView
                      row={row}
                      columns={columns()}
                      columnPx={columnPx()}
                      axisWidth={axisWidth()}
                      placement={placements().get(row.index) ?? null}
                      onToggle={toggle}
                      onTaskClick={props.onTaskClick}
                    />
                  )}
                </For>

                <Show when={marker() !== null}>
                  <div
                    aria-hidden="true"
                    class="zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 zen-w-px zen-bg-zen-error"
                    style={{
                      height: `${bodyHeight()}px`,
                      "inset-inline-start": `${LEFT_PX + ((marker() ?? 0) / 100) * axisWidth()}px`,
                    }}
                  />
                </Show>

                <Show when={connectors().length > 0}>
                  {/* Mirrored under RTL rather than recomputed: the bars are
                      placed with logical inset properties, so the axis is already
                      flipped and the routes have to flip with it — arrowheads
                      included. */}
                  <svg
                    aria-hidden="true"
                    class="zen-pointer-events-none zen-absolute zen-top-0 zen-z-10 rtl:-zen-scale-x-100"
                    width={axisWidth()}
                    height={bodyHeight()}
                    viewBox={`0 0 ${axisWidth()} ${bodyHeight()}`}
                    style={{ "inset-inline-start": `${LEFT_PX}px` }}
                  >
                    <For each={connectors()}>
                      {(connector) => (
                        <g>
                          <path
                            d={connector.d}
                            fill="none"
                            /* zen-stroke-* / zen-fill-* generate nothing under
                               this preset — the token has to be named directly. */
                            stroke="var(--zen-color-muted-fg)"
                            stroke-width={1.5}
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
                      )}
                    </For>
                  </svg>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
};

interface GanttRowViewProps {
  row: GanttRow<GanttTask>;
  columns: PlanningColumn[];
  columnPx: number;
  axisWidth: number;
  placement: PlanningPlacement | null;
  onToggle: (id: string) => void;
  onTaskClick?: (task: GanttTask, row: GanttRow<GanttTask>) => void;
}

const GanttRowView = (props: GanttRowViewProps) => {
  const task = () => props.row.task;
  const progress = () => props.row.progress ?? 0;
  const varianceText = () => formatGanttVariance(props.row.variance);
  const widthPx = () => (props.placement ? (props.placement.widthPct / 100) * props.axisWidth : 0);
  const labelOutside = () => widthPx() < LABEL_MIN_PX;
  const labelOnFill = () => !labelOutside() && progress() >= LABEL_MAX_PCT;
  const span = () => props.row.span;

  return (
    <div
      class="zen-flex zen-border-b zen-border-zen-border last:zen-border-b-0"
      style={{ height: `${ROW_PX}px`, "box-sizing": "border-box" }}
    >
      <div
        class="zen-sticky zen-z-20 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-background"
        style={{ width: `${LEFT_PX}px`, "inset-inline-start": "0" }}
      >
        <div
          class="zen-flex zen-min-w-0 zen-items-center zen-gap-1 zen-pe-2"
          style={{
            width: `${NAME_PX}px`,
            "padding-inline-start": `${8 + props.row.depth * INDENT_PX}px`,
          }}
        >
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
              onClick={() => props.onToggle(task().id)}
              aria-expanded={props.row.expanded}
              aria-label={props.row.expanded ? `Collapse ${task().name}` : `Expand ${task().name}`}
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
            <Show when={task().subtitle}>
              <span class="zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg">
                {task().subtitle}
              </span>
            </Show>
          </span>
        </div>

        <div class="zen-flex zen-items-center zen-px-2" style={{ width: `${ASSIGNEES_PX}px` }}>
          <GanttAssignees assignees={task().assignees} />
        </div>

        <div class="zen-flex zen-items-center zen-px-2" style={{ width: `${STATUS_PX}px` }}>
          <Badge variant="soft" color={STATUS_COLOR[props.row.status]} class="zen-truncate">
            {task().statusLabel ?? STATUS_LABEL[props.row.status]}
          </Badge>
        </div>

        <div class="zen-flex zen-items-center zen-px-2" style={{ width: `${VARIANCE_PX}px` }}>
          <Show when={varianceText()}>
            <Badge
              /* "+2d" is a signed number, and bidi reorders a leading sign to
                 the far side in an RTL run — it renders as "2d+". */
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
        </div>
      </div>

      <div class="zen-relative zen-shrink-0" style={{ width: `${props.axisWidth}px` }}>
        {/* The column rules as a background layer rather than as parents of the
            bar: a bar spanning four days cannot live inside one day's box. */}
        <div aria-hidden="true" class="zen-absolute zen-inset-0 zen-flex">
          <For each={props.columns}>
            {(column) => (
              <div
                class={cn(
                  "zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                  column.nonWorking && "zen-bg-zen-muted/40",
                  column.today && "zen-bg-zen-primary-soft/40",
                )}
                style={{ width: `${props.columnPx}px` }}
              />
            )}
          </For>
        </div>

        <Show when={props.placement}>
          {(placement) => (
            <button
              type="button"
              onClick={() => props.onTaskClick?.(task(), props.row)}
              /* A button whether or not a handler was passed: bars are the only
                 things on the axis worth reaching by keyboard, and a plain div
                 takes the whole chart out of the tab order. */
              class={cn(
                "zen-absolute zen-overflow-hidden zen-rounded-zen-sm zen-border",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                BAR_CLASS[props.row.status],
                /* Square off a cut edge so a bar continuing past the view does
                   not look like it ends there. */
                placement().clippedStart && "zen-rounded-s-none zen-border-s-0",
                placement().clippedEnd && "zen-rounded-e-none zen-border-e-0",
                props.onTaskClick && "hover:zen-brightness-95",
              )}
              style={{
                "inset-inline-start": `${placement().startPct}%`,
                width: `${placement().widthPct}%`,
                top: `${BAR_TOP}px`,
                height: `${BAR_PX}px`,
              }}
              title={`${task().name} · ${formatDay(span()!.start)} – ${formatDay(span()!.end)}${
                props.row.progress === null ? "" : ` · ${Math.round(progress())}%`
              }`}
            >
              <span class="zen-sr-only">
                {`${formatDay(span()!.start)} to ${formatDay(span()!.end)}, ${STATUS_LABEL[props.row.status]}${
                  props.row.progress === null ? "" : `, ${Math.round(progress())} percent complete`
                }`}
              </span>
              <Show when={props.row.progress !== null}>
                <span
                  aria-hidden="true"
                  class={cn(
                    "zen-absolute zen-inset-y-0 zen-start-0",
                    FILL_CLASS[props.row.status],
                  )}
                  style={{ width: `${progress()}%` }}
                />
              </Show>
              <Show when={props.row.progress !== null && !labelOutside()}>
                <span
                  aria-hidden="true"
                  class={cn(
                    "zen-absolute zen-inset-y-0 zen-flex zen-items-center zen-text-[10px] zen-font-medium",
                    labelOnFill()
                      ? cn("zen-start-1", FILL_TEXT_CLASS[props.row.status])
                      : "zen-end-1 zen-text-zen-foreground",
                  )}
                >
                  {Math.round(progress())}%
                </span>
              </Show>
            </button>
          )}
        </Show>

        <Show when={props.placement && props.row.progress !== null && labelOutside()}>
          <span
            aria-hidden="true"
            class="zen-absolute zen-flex zen-items-center zen-text-[10px] zen-font-medium zen-text-zen-muted-fg"
            style={{
              "inset-inline-start": `calc(${(props.placement?.startPct ?? 0) + (props.placement?.widthPct ?? 0)}% + 4px)`,
              top: `${BAR_TOP}px`,
              height: `${BAR_PX}px`,
            }}
          >
            {Math.round(progress())}%
          </span>
        </Show>
      </div>
    </div>
  );
};

const GanttAssignees = (props: { assignees?: GanttAssignee[] }) => (
  <Show when={props.assignees && props.assignees.length > 0}>
    {/* Kobalte needs no provider — the delay is a prop on each Tooltip. */}
    <Tooltip openDelay={200}>
      {/* Focusable, so the full list is reachable without a pointer — the "+N"
          chip is the only place some names appear at all. */}
      <TooltipTrigger
        as="span"
        tabindex={0}
        class="zen-rounded-zen-full focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
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
      <TooltipContent>{(props.assignees ?? []).map((a) => a.name).join(", ")}</TooltipContent>
    </Tooltip>
  </Show>
);
