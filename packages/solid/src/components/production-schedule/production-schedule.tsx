import { type JSX, createMemo, createSignal, For, Index, Show } from "solid-js";
import {
  flattenProductionResources,
  ganttConnectors,
  ganttFitRange,
  placeAppointment,
  productionCriticalPath,
  productionLoad,
  productionReschedule,
  productionSequenceConflicts,
  type GanttBarAnchor,
  type GanttCalendar,
  type GanttDependency,
  type GanttTaskStatus,
  type GanttView,
  type PlanningColumn,
  type PlanningRange,
  type ProductionFloat,
  type ProductionLoadBucket,
  type ProductionMove,
  type ProductionOperationNode,
  type ProductionPlacement,
  type ProductionProposal,
  type ProductionResourceNode,
  type ProductionRow as ProductionRowData,
  type ProductionSetupMatrix,
} from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Badge } from "../badge/badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "../empty-state/empty-state";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";
import {
  INDENT_PX,
  ROW_PX,
  ScheduleGrid,
  createScheduleAxis,
  createScrollerMetrics,
  type ScheduleColumn,
} from "../gantt/schedule-grid";

/**
 * ProductionSchedule — what each machine is doing, and whether it can.
 *
 *   <ProductionSchedule resources={cells} operations={jobs} calendar={plant} />
 *
 * The Solid port, mirroring the React binding one-for-one and verified against
 * it: `node scripts/check-schedule-parity.mjs solid` compares the two rendered
 * charts, not merely their export names.
 *
 * The sibling of `Gantt`, and a SEPARATE component rather than a mode of it —
 * the decision and its reasoning are in
 * docs/production-scheduling-gap-analysis.md. A row here is a work centre
 * holding a sequence of operations, each with a changeover, a capacity claim
 * and a routing position. That is a different renderer contract from a row
 * holding one bar with a percentage and a baseline.
 *
 * What the two DO share is everything that does not depend on what a row is:
 * ../gantt/schedule-grid renders the axis, the frozen pane, the windowing, the
 * connector overlay and the treegrid keyboard model for both, and
 * @algorisys/zen-ui-core does the arithmetic under both.
 *
 * IT RESCHEDULES, and `Gantt` does not — that asymmetry is DECISION 2, taken
 * rather than inherited. The component proposes and never applies: it renders
 * the `operations` it is given, hands back what WOULD happen, and changes
 * nothing until the caller passes a new array. That is what keeps undo the
 * caller's, and why there is no internal pending state to fall out of sync with
 * an ERP. Conflicts are computed and REPORTED, never enforced.
 */

/** A machine, a cell, a line. They nest; a collapsed one carries all its work. */
export interface ProductionResource extends ProductionResourceNode {
  name: string;
  /** Second line under the name — an asset number, a location. */
  subtitle?: string;
  children?: ProductionResource[];
}

export interface ProductionOperation extends ProductionOperationNode {
  name: string;
  /** The works order it belongs to. Shown in the tooltip. */
  order?: string;
  /** Overrides the derived status colour's words, not its colour. */
  statusLabel?: string;
}

/** Which columns the frozen pane can carry. */
export type ProductionPaneColumn = "resource" | "jobs" | "capacity" | "load" | "float";

export interface ProductionScheduleProps {
  resources: ProductionResource[];
  operations: ProductionOperation[];
  /** Routing links between operations. Drawn with the same four link types. */
  dependencies?: GanttDependency[];
  /** Draw the routing layer. Default true. */
  showDependencies?: boolean;

  /**
   * When the plant is open. A resource's own `calendar` overrides it.
   *
   * Strongly recommended here, unlike on `Gantt`: without one every duration is
   * wall-clock, so a changeover runs through the night, and load is measured
   * against 24 hours a day the plant does not have.
   */
  calendar?: GanttCalendar;
  /** Hours per column in the DAY view. Default 1; 0.25 for quarter-hour columns. */
  hourStep?: number;
  /**
   * Sequence-dependent changeover, keyed on the pair of `setupFamily` values.
   * With one supplied, an operation that states no `setupMinutes` gets one
   * derived from what ran before it on the same machine.
   */
  setupMatrix?: ProductionSetupMatrix;

  /** Uncontrolled starting view. Default "fit". */
  defaultView?: GanttView;
  view?: GanttView;
  onViewChange?: (view: GanttView) => void;
  views?: GanttView[];

  defaultDate?: Date;
  date?: Date;
  onDateChange?: (date: Date) => void;

  /** Ids of the open parents. Controlled; pair with `onExpandedChange`. */
  expanded?: string[];
  /** Uncontrolled starting set. Omit it and everything opens. */
  defaultExpanded?: string[];
  onExpandedChange?: (ids: string[]) => void;

  onOperationClick?: (
    operation: ProductionOperation,
    row: ProductionRowData<ProductionResource, ProductionOperation>,
  ) => void;

  /**
   * Called with what WOULD happen if the user's move were made. Supplying it is
   * what turns rescheduling on.
   *
   * The component never applies it. `proposal.cascade` includes the operation
   * the user dragged, FIRST — persist only that one and you have written a
   * schedule nobody saw.
   */
  onReschedule?: (proposal: ProductionProposal) => void;
  /**
   * Whether an operation may be moved at all. This GATES THE AFFORDANCE rather
   * than the outcome — a forbidden operation simply is not draggable, so a user
   * never does the work of a drag and then gets told no.
   */
  canReschedule?: (operation: ProductionOperation) => boolean;

  /**
   * How many operations may stack on one row before the rest are counted as
   * overflow. Default 3. Bounded because it sets the height of EVERY row.
   */
  maxLanes?: number;
  /** Draw the load histogram under the axis. Default true. */
  showLoad?: boolean;
  /**
   * Compute float and mark the critical path. Off by default: it is a graph
   * pass over every operation, and a schedule with no routing has nothing to be
   * critical about.
   */
  showCriticalPath?: boolean;
  /** The date float is measured against. Default: the schedule's own last finish. */
  until?: Date;

  now?: Date;
  columnWidth?: number;
  hideToolbar?: boolean;
  /** Which pane columns, in preference order. Default all four. */
  columns?: ProductionPaneColumn[];

  loading?: boolean;
  loadingRows?: number;
  emptyState?: JSX.Element;
  class?: string;
}

type Row = ProductionRowData<ProductionResource, ProductionOperation>;

const PANE_PX: Record<ProductionPaneColumn, number> = {
  resource: 180,
  jobs: 60,
  capacity: 72,
  load: 84,
  float: 84,
};

const PANE_LABEL: Record<ProductionPaneColumn, string> = {
  resource: "Resource",
  jobs: "Jobs",
  capacity: "Capacity",
  load: "Load",
  /* The row's TIGHTEST operation, because a row is only as movable as the job
     on it with the least room. An average would say a machine has four hours of
     slack while one of its jobs has none. */
  float: "Float",
};

/** Place in the FULL set, so a dropped column does not renumber the others. */
const COL_INDEX: Record<ProductionPaneColumn | "timeline", number> = {
  resource: 1,
  jobs: 2,
  capacity: 3,
  load: 4,
  float: 5,
  timeline: 6,
};

const DEFAULT_PANE: ProductionPaneColumn[] = ["resource", "jobs", "capacity", "load"];

/** One lane's bar, and the gap to the next. Row height is derived from these. */
const LANE_BAR_PX = 16;
const LANE_GAP_PX = 4;
/** Space above and below the stack, so bars never touch the row border. */
const LANE_PAD_PX = 14;

const FOOTER_PX = 40;

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

const parentIds = (resources: ProductionResource[]): string[] => {
  const out: string[] = [];
  const walk = (list: ProductionResource[]) => {
    for (const resource of list) {
      if (resource.children && resource.children.length > 0) {
        out.push(resource.id);
        walk(resource.children);
      }
    }
  };
  walk(resources);
  return out;
};

const formatTime = (d: Date): string =>
  `${d.getDate()} ${d.toLocaleString(undefined, { month: "short" })} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** "4h 30m", "0", "-2h" — float is minutes, and nobody reads minutes past 90. */
const formatFloat = (minutes: number): string => {
  const sign = minutes < 0 ? "-" : "";
  const total = Math.abs(minutes);
  if (total === 0) return "0";
  if (total < 60) return `${sign}${total}m`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${sign}${hours}h` : `${sign}${hours}h ${rest}m`;
};

export const ProductionSchedule = (props: ProductionScheduleProps) => {
  const [innerView, setInnerView] = createSignal<GanttView>(props.defaultView ?? "fit");
  const [innerDate, setInnerDate] = createSignal<Date>(props.defaultDate ?? new Date());
  const [innerExpanded, setInnerExpanded] = createSignal<string[] | null>(props.defaultExpanded ?? null);

  const scroller = createScrollerMetrics();

  const view = () => props.view ?? innerView();
  const anchor = () => props.date ?? innerDate();
  /* Read once per MOUNT, not per read — a fresh `now` every read would
     invalidate every memo below on every scroll tick. */
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
    const base = expandedIds() ?? parentIds(props.resources ?? []);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    if (props.expanded === undefined) setInnerExpanded(next);
    props.onExpandedChange?.(next);
  };

  /* Fit takes its range from the OPERATIONS, not the resources — a machine has
     no dates of its own, so the plan's span is the span of the work booked on
     it. Setup claims the machine too, so it belongs inside the range. */
  const fitRange = createMemo(() => {
    if (view() !== "fit") return null;
    return ganttFitRange(
      (props.operations ?? []).map((operation) => ({
        id: operation.id,
        start: operation.start,
        end: operation.end,
        workingMinutes:
          operation.end === undefined
            ? (operation.setupMinutes ?? 0) + (operation.runMinutes ?? 0)
            : undefined,
      })),
      { calendar: props.calendar },
    );
  });

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
  }));

  const flat = createMemo(() => {
    const set = expandedSet();
    return flattenProductionResources<ProductionResource, ProductionOperation>(
      props.resources ?? [],
      props.operations ?? [],
      (resource) => (set === null ? true : set.has(resource.id)),
      {
        calendar: props.calendar,
        maxLanes: props.maxLanes ?? 3,
        minGapMs: axis.minGapMs(),
        setupMatrix: props.setupMatrix,
      },
    );
  });
  const rows = () => flat().rows;

  /* ONE height for the whole chart, from the busiest row. Rows that varied
     would break both the window (arithmetic, not measurement) and the connector
     routes (which place an endpoint at rowIndex * rowHeight + rowHeight / 2). */
  const laneCount = () => Math.max(1, ...rows().map((row) => row.lanes.length));
  const rowHeight = () =>
    Math.max(ROW_PX, laneCount() * LANE_BAR_PX + (laneCount() - 1) * LANE_GAP_PX + LANE_PAD_PX);
  const laneTop = (lane: number) => {
    const stackTop =
      (rowHeight() - (laneCount() * LANE_BAR_PX + (laneCount() - 1) * LANE_GAP_PX)) / 2;
    return stackTop + lane * (LANE_BAR_PX + LANE_GAP_PX);
  };

  /** Every operation placed on the axis, keyed by id — routing needs it. */
  const placements = createMemo(() => {
    const map = new Map<string, { placement: ProductionPlacement<ProductionOperation>; row: Row }>();
    for (const row of rows()) {
      for (const lane of row.lanes) {
        for (const placement of lane) map.set(placement.operation.id, { placement, row });
      }
    }
    return map;
  });

  const connectors = createMemo(() => {
    if (props.showDependencies === false) return [];
    const links = props.dependencies;
    if (!links || links.length === 0) return [];
    const anchors = new Map<string, GanttBarAnchor>();
    for (const [id, entry] of placements()) {
      const placed = placeAppointment(entry.placement.span, axis.range());
      if (!placed) continue;
      const lane = flat().operationIndex.get(id)?.lane ?? 0;
      anchors.set(id, {
        rowIndex: entry.row.index,
        startPct: placed.startPct,
        widthPct: placed.widthPct,
        /* The LANE's centre, not the row's. A routing arrow that pointed at the
           middle of a three-lane row would miss every bar in it. */
        yOffset: laneTop(lane) + LANE_BAR_PX / 2,
      });
    }
    /* Ids that name a RESOURCE rather than an operation are resolved too, so a
       link between two work centres still draws. */
    for (const [id, index] of flat().rowIndexById) {
      if (anchors.has(id)) continue;
      const first = rows()[index]?.lanes[0]?.[0];
      if (!first) continue;
      const placed = placeAppointment(first.span, axis.range());
      if (placed) {
        anchors.set(id, {
          rowIndex: index,
          startPct: placed.startPct,
          widthPct: placed.widthPct,
          yOffset: laneTop(0) + LANE_BAR_PX / 2,
        });
      }
    }
    return ganttConnectors(anchors, links, { axisWidth: axis.axisWidth(), rowHeight: rowHeight() });
  });

  /**
   * Routing links whose lag the schedule does not respect. Reported, never
   * enforced — a planner who knowingly overlaps two operations because the
   * first one's last pallet is already off the machine is making a decision.
   */
  const violated = createMemo(() => {
    if (props.showDependencies === false) return null;
    const links = props.dependencies;
    if (!links || links.length === 0) return null;
    const byId = new Map<string, ProductionPlacement>();
    for (const [id, entry] of placements()) byId.set(id, entry.placement);
    const found = productionSequenceConflicts(links, byId, { calendar: props.calendar });
    return new Set(found.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
  });

  /**
   * Float per operation, and which of them have none. Off unless asked for: a
   * graph pass over every operation, and a schedule with no routing has nothing
   * to be critical about.
   */
  const cpa = createMemo(() => {
    if (!props.showCriticalPath) return null;
    return productionCriticalPath(props.operations ?? [], props.dependencies ?? [], {
      calendar: props.calendar,
      setupMatrix: props.setupMatrix,
      until: props.until,
    });
  });

  /** The tightest float on each row — a row is only as movable as its worst job. */
  const rowFloat = createMemo(() => {
    const map = new Map<number, ProductionFloat>();
    const analysis = cpa();
    if (!analysis) return map;
    for (const row of rows()) {
      let worst: ProductionFloat | undefined;
      for (const placement of row.subtree) {
        const value = analysis.byOperation.get(placement.operation.id);
        if (!value) continue;
        if (!worst || value.totalFloatMinutes < worst.totalFloatMinutes) worst = value;
      }
      if (worst) map.set(row.index, worst);
    }
    return map;
  });

  /** Load for the WHOLE chart — roots only, so nothing is counted twice. */
  const totalLoad = createMemo(() => {
    if (props.showLoad === false) return null;
    const roots = rows().filter((row) => row.parentId === null);
    const all = roots.flatMap((row) => row.subtree);
    const capacity = roots.reduce((sum, row) => sum + row.capacity, 0);
    return productionLoad(all, axis.columns(), {
      calendar: props.calendar,
      capacity: Math.max(1, capacity),
    });
  });

  /** Per row, over the visible range only — what the Load pane column shows. */
  const rowLoad = createMemo(() => {
    const map = new Map<number, ProductionLoadBucket>();
    const whole: PlanningColumn[] = [
      {
        start: axis.range().start,
        end: axis.range().end,
        label: "",
        sublabel: "",
        nonWorking: false,
        today: false,
      },
    ];
    for (const row of rows()) {
      map.set(
        row.index,
        productionLoad(row.subtree, whole, {
          calendar: row.resource.calendar ?? props.calendar,
          capacity: row.capacity,
        })[0],
      );
    }
    return map;
  });

  /* ------------------------------------------------------------------ *
   * Rescheduling. The component proposes and never applies, so there is no
   * pending move to hold — only which bar is being dragged and by how far,
   * which is pixels and is discarded on release.
   * ------------------------------------------------------------------ */
  const editable = () => props.onReschedule !== undefined;
  const mayMove = (operation: ProductionOperation) =>
    editable() && (props.canReschedule?.(operation) ?? true);

  /** Milliseconds per pixel, so a drag reads as time rather than as distance. */
  const msPerPx = () =>
    axis.axisWidth() > 0
      ? (axis.range().end.getTime() - axis.range().start.getTime()) / axis.axisWidth()
      : 0;

  const calendarFor = (resourceId: string): GanttCalendar | undefined => {
    const find = (list: ProductionResource[]): GanttCalendar | undefined => {
      for (const resource of list) {
        if (resource.id === resourceId) return resource.calendar ?? props.calendar;
        const inner = resource.children ? find(resource.children) : undefined;
        if (inner) return inner;
      }
      return undefined;
    };
    return find(props.resources ?? []) ?? props.calendar;
  };

  const propose = (move: ProductionMove) => {
    const handler = props.onReschedule;
    if (!handler) return;
    handler(
      productionReschedule(props.operations ?? [], props.dependencies ?? [], move, {
        calendar: props.calendar,
        calendarFor,
        resources: props.resources,
        setupMatrix: props.setupMatrix,
      }),
    );
  };

  const isCritical = (id: string) => cpa()?.byOperation.get(id)?.critical ?? false;

  const setView = (next: GanttView) => {
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
      label: PANE_LABEL[key],
      width: PANE_PX[key],
      colIndex: COL_INDEX[key],
      class: key === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style:
        key === "resource"
          ? (row: Row) => ({ "padding-inline-start": `${8 + row.depth * INDENT_PX}px` })
          : undefined,
      render: (row: Row) => (
        <ProductionPaneCell
          column={key}
          row={row}
          load={rowLoad().get(row.index)}
          float={rowFloat().get(row.index)}
          onToggle={toggle}
        />
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
          aria-label="Loading production schedule"
        >
          <For each={Array.from({ length: props.loadingRows ?? 6 }, (_, i) => i)}>
            {(i) => (
              <div class="zen-flex zen-items-center zen-gap-3">
                <Skeleton
                  class="zen-h-4"
                  style={{ width: `${PANE_PX.resource - 24 - (i % 3) * INDENT_PX}px` }}
                />
                <Skeleton class="zen-h-4 zen-w-12" />
                {/* Two blocks per row, because a machine's day is a sequence —
                    one long bar reads as the wrong component for a second. */}
                <Skeleton
                  class="zen-h-4"
                  style={{ "margin-inline-start": `${(i * 29) % 40}%`, width: `${12 + ((i * 7) % 18)}%` }}
                />
                <Skeleton class="zen-h-4" style={{ width: `${10 + ((i * 11) % 20)}%` }} />
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
                  <Icon name="cog" size={22} />
                </EmptyStateIcon>
                <EmptyStateTitle>No resources</EmptyStateTitle>
                <EmptyStateDescription>
                  Add a work centre and book an operation on it, and the schedule will appear here.
                </EmptyStateDescription>
              </EmptyState>
            )}
          </div>
        }
      >
        <ScheduleGrid<Row>
          rows={rows()}
          rowId={(row) => row.resource.id}
          columns={paneColumns()}
          colCount={6}
          timelineColIndex={COL_INDEX.timeline}
          rowHeight={rowHeight()}
          renderTrack={(row) => (
            <ProductionTrack
              row={row}
              range={axis.range()}
              laneTop={laneTop}
              onOperationClick={props.onOperationClick}
              mayMove={mayMove}
              msPerPx={msPerPx()}
              onPropose={propose}
              isCritical={isCritical}
            />
          )}
          renderFooter={
            totalLoad()
              ? (context) => <ProductionLoadStrip {...context} buckets={totalLoad()!} />
              : undefined
          }
          view={view()}
          anchor={anchor()}
          now={now()}
          connectors={connectors()}
          connectorAccent={(connector) =>
            violated()?.has(`${connector.from}->${connector.to}`) ?? false
          }
          views={props.views}
          hideToolbar={props.hideToolbar}
          onViewChange={setView}
          onDateChange={setDate}
          onToggle={(row) => toggle(row.resource.id)}
          onActivate={(row) => {
            const first = row.lanes[0]?.[0];
            if (first) props.onOperationClick?.(first.operation, row);
          }}
          ariaLabel="Production schedule"
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

const ProductionPaneCell = (props: {
  column: ProductionPaneColumn;
  row: Row;
  load?: ProductionLoadBucket;
  float?: ProductionFloat;
  onToggle: (id: string) => void;
}) => {
  const resource = () => props.row.resource;
  const jobCount = () => props.row.subtree.length;

  return (
    <>
      <Show when={props.column === "resource"}>
        <Show
          when={props.row.hasChildren}
          fallback={<span aria-hidden="true" class="zen-h-5 zen-w-5 zen-shrink-0" />}
        >
          <button
            type="button"
            /* Out of the tab order, in the grid's — the chevron is reached by
               arrowing to the first column and pressing the forward arrow. */
            tabindex={-1}
            onClick={() => props.onToggle(resource().id)}
            aria-label={props.row.expanded ? `Collapse ${resource().name}` : `Expand ${resource().name}`}
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
            title={resource().name}
          >
            {resource().name}
          </span>
          <Show when={resource().subtitle}>
            <span class="zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg">
              {resource().subtitle}
            </span>
          </Show>
        </span>
        {/* HERE, and not in the Capacity column where it started, because the
            pane sheds columns to give the axis room and Capacity is among the
            first to go. A conflict marker that vanishes when the container
            narrows is worse than no marker: the schedule then looks fine.
            Overload is about CAPACITY, not overlap — two jobs at once on a
            two-operator cell is fine and must not be flagged. */}
        <Show when={props.row.overloaded}>
          <Icon
            name="warn"
            size={13}
            class="zen-ms-auto zen-shrink-0 zen-text-zen-error"
            title="Over capacity"
          />
        </Show>
      </Show>

      <Show when={props.column === "jobs"}>
        <span class="zen-text-sm zen-text-zen-muted-fg">
          {jobCount() === 0 ? "—" : jobCount()}
          {/* Never silently dropped: a row that hid six jobs is the worst thing
              this component could do. */}
          <Show when={props.row.overflow > 0}>
            <span class="zen-ms-1 zen-text-[10px] zen-text-zen-error">+{props.row.overflow}</span>
          </Show>
        </span>
      </Show>

      <Show when={props.column === "capacity"}>
        <span class="zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg">
          <span dir="ltr">×{props.row.capacity}</span>
        </span>
      </Show>

      <Show when={props.column === "load"}>
        {/* A shut resource over the visible range has no utilisation — not 0%.
            An empty bar there would claim the machine was idle when it was
            closed. */}
        <Show
          when={props.load && props.load.utilisation !== null}
          fallback={<span class="zen-text-sm zen-text-zen-muted-fg">—</span>}
        >
          <Badge
            dir="ltr"
            variant="soft"
            color={
              props.load!.overloaded ? "error" : props.load!.utilisation! >= 0.85 ? "warning" : "success"
            }
          >
            {pct(props.load!.utilisation!)}
          </Badge>
        </Show>
      </Show>

      <Show when={props.column === "float"}>
        <Show when={props.float} fallback={<span class="zen-text-sm zen-text-zen-muted-fg">—</span>}>
          <Badge
            dir="ltr"
            variant="soft"
            color={
              props.float!.totalFloatMinutes < 0
                ? "error"
                : props.float!.critical
                  ? "warning"
                  : "neutral"
            }
            /* The words, not only the colour: a negative float and a critical
               one are different situations, and a chart that already uses red
               for overload cannot carry a third meaning on hue alone. */
            title={
              props.float!.totalFloatMinutes < 0
                ? `Past the date it is measured against by ${formatFloat(-props.float!.totalFloatMinutes)}`
                : props.float!.freeFloatMinutes < 0
                  ? `Already overlaps the next operation by ${formatFloat(-props.float!.freeFloatMinutes)}`
                  : props.float!.critical
                    ? "On the critical path — no room to move"
                    : `${formatFloat(props.float!.freeFloatMinutes)} before it disturbs the next operation`
            }
          >
            {props.float!.critical && props.float!.totalFloatMinutes === 0
              ? "Critical"
              : formatFloat(props.float!.totalFloatMinutes)}
          </Badge>
        </Show>
      </Show>
    </>
  );
};

/** Every operation on one resource row, in its lane. */
const ProductionTrack = (props: {
  row: Row;
  range: PlanningRange;
  laneTop: (lane: number) => number;
  onOperationClick?: (operation: ProductionOperation, row: Row) => void;
  mayMove: (operation: ProductionOperation) => boolean;
  msPerPx: number;
  onPropose: (move: ProductionMove) => void;
  isCritical: (id: string) => boolean;
}) => (
  <>
    <Show when={props.row.lanes.length === 0}>
      {/* An expanded parent draws nothing because its children draw its work —
          which is a fact worth saying, not a blank cell. */}
      <span class="zen-sr-only">
        {props.row.hasChildren && props.row.expanded
          ? "Work shown on the rows below"
          : "Nothing booked in this range"}
      </span>
    </Show>
    <Index each={props.row.lanes}>
      {(lane, laneIndex) => (
        <Index each={lane()}>
          {(placement) => (
            <ProductionBar
              placement={placement()}
              row={props.row}
              range={props.range}
              top={props.laneTop(laneIndex)}
              onOperationClick={props.onOperationClick}
              mayMove={props.mayMove}
              msPerPx={props.msPerPx}
              onPropose={props.onPropose}
              critical={props.isCritical(placement().operation.id)}
            />
          )}
        </Index>
      )}
    </Index>
  </>
);

const ProductionBar = (props: {
  placement: ProductionPlacement<ProductionOperation>;
  row: Row;
  range: PlanningRange;
  top: number;
  onOperationClick?: (operation: ProductionOperation, row: Row) => void;
  mayMove: (operation: ProductionOperation) => boolean;
  msPerPx: number;
  onPropose: (move: ProductionMove) => void;
  critical: boolean;
}) => {
  const operation = () => props.placement.operation;
  const placed = () => placeAppointment(props.placement.span, props.range);
  const status = () => operation().status ?? "on-track";
  const progress = () => operation().percentComplete ?? null;

  /* PHYSICAL pixels of drag, held here and discarded on release. It is the ONLY
     state this component keeps about a move: the proposal goes to the caller,
     who owns whether anything actually happens.

     Physical rather than direction-corrected, because it is fed to `translate`,
     which is a physical property — a logical value would send the preview the
     wrong way under RTL while the proposal went the right way. */
  const [dragPx, setDragPx] = createSignal<number | null>(null);
  const movable = () => props.mayMove(operation());

  const proposedStart = (px: number) =>
    new Date(props.placement.span.start.getTime() + px * props.msPerPx);

  const onPointerDown = (event: PointerEvent & { currentTarget: HTMLButtonElement }) => {
    if (!movable() || event.button !== 0) return;
    const originX = event.clientX;
    const target = event.currentTarget;
    /* Captured so the gesture survives the pointer leaving the bar — which it
       does immediately, because the bar is what is moving. */
    target.setPointerCapture(event.pointerId);
    /* Direction-aware: under RTL the axis runs the other way, so dragging left
       moves a job LATER. */
    const rtl = getComputedStyle(target).direction === "rtl";

    let moved = 0;
    const onMove = (e: PointerEvent) => {
      moved = e.clientX - originX;
      setDragPx(moved);
    };
    const finish = (commit: boolean) => {
      target.releasePointerCapture?.(event.pointerId);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      setDragPx(null);
      /* A few pixels is a click, not a drag. Without this every click on a bar
         proposes a move of about ninety seconds. */
      if (commit && Math.abs(moved) > 3) {
        props.onPropose({ operationId: operation().id, start: proposedStart(moved * (rtl ? -1 : 1)) });
      } else if (commit) {
        props.onOperationClick?.(operation(), props.row);
      }
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    // Escape abandons the gesture, the only way out of a drag that has gone
    // somewhere the user did not mean.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
  };

  /**
   * The keyboard path, and it is not optional. A drag-only affordance is
   * unreachable for anyone not using a pointer, and "reschedule" is the
   * component's primary action once it is switched on. Alt+Arrow nudges by an
   * hour, Shift+Alt+Arrow by a day — modified so the plain arrows keep moving
   * between cells, which is the grid's own navigation.
   */
  const onBarKeyDown = (event: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
    if (!movable() || !event.altKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key !== forward && event.key !== backward) return;
    event.preventDefault();
    event.stopPropagation();
    const stepMs = (event.shiftKey ? 24 : 1) * 60 * 60_000 * (event.key === forward ? 1 : -1);
    props.onPropose({
      operationId: operation().id,
      start: new Date(props.placement.span.start.getTime() + stepMs),
    });
  };

  /**
   * The booking broken into the stretches the plant is open, with each stretch
   * split again at the point setup ends.
   *
   * Two things are drawn at once and they are not the same: the gaps (the plant
   * is shut) and the changeover (the machine is busy making nothing). Drawing
   * setup as a single leading block would be wrong the moment a changeover
   * spans a lunch break — which is exactly when a planner cares.
   */
  const pieces = createMemo(() => {
    const placement = props.placement;
    if (!placed()) return [];
    const from = Math.max(placement.span.start.getTime(), props.range.start.getTime());
    const to = Math.min(placement.span.end.getTime(), props.range.end.getTime());
    const total = to - from;
    if (total <= 0) return [];

    const setupEnd = placement.setup ? placement.setup.end.getTime() : from;
    const parts = placement.segments ?? [placement.span];
    const out: Array<{ key: number; startPct: number; widthPct: number; setupPct: number }> = [];
    for (const part of parts) {
      const start = Math.max(part.start.getTime(), from);
      const end = Math.min(part.end.getTime(), to);
      if (end <= start) continue;
      const width = end - start;
      // How much of THIS stretch is still changeover.
      const setupWithin = Math.max(0, Math.min(setupEnd, end) - start);
      out.push({
        key: start,
        startPct: ((start - from) / total) * 100,
        widthPct: (width / total) * 100,
        setupPct: (setupWithin / width) * 100,
      });
    }
    return out;
  });

  const title = () =>
    [
      operation().name,
      operation().order ? `Order ${operation().order}` : null,
      `${formatTime(props.placement.span.start)} – ${formatTime(props.placement.span.end)}`,
      props.placement.setup ? "incl. changeover" : null,
      props.critical ? "on the critical path" : null,
      progress() === null ? null : `${Math.round(progress()!)}%`,
    ]
      .filter(Boolean)
      .join(" · ");

  return (
    <Show when={placed()}>
      {(box) => (
        <button
          type="button"
          /* Reachable, not tabbable: the timeline CELL carries the tab stop, and
             `data-gantt-bar` is how the keyboard scrolls this into view. */
          tabindex={-1}
          data-gantt-bar=""
          data-gantt-movable={movable() ? "" : undefined}
          /* One handler, guarded inside, rather than a conditional one. When a
             bar is movable the pointer gesture calls this itself once it has
             told a click from a drag by distance, so attaching it here too
             would fire on both. A ternary would also build the handler in a
             reactive expression, which is what solid/reactivity flags. */
          onClick={() => {
            if (!movable()) props.onOperationClick?.(operation(), props.row);
          }}
          onPointerDown={onPointerDown}
          onKeyDown={onBarKeyDown}
          class={cn(
            "zen-absolute zen-rounded-zen-sm",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            props.onOperationClick && "hover:zen-brightness-95",
            /* The affordance IS the gate: an operation the caller will not let
               move simply does not offer to. */
            movable() && "zen-cursor-grab active:zen-cursor-grabbing",
            /* A RING, not a recolour. The bar's fill already carries status, so
               a critical operation cannot be signalled by hue without taking
               that meaning away — and the Float column says "Critical" in words
               beside it, because a ring on its own is not a legend. */
            props.critical && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
            dragPx() !== null && "zen-z-20 zen-opacity-80 zen-shadow-zen-md",
          )}
          style={{
            "inset-inline-start": `${box().startPct}%`,
            width: `${box().widthPct}%`,
            top: `${props.top}px`,
            height: `${LANE_BAR_PX}px`,
            ...(dragPx() !== null ? { translate: `${dragPx()}px` } : null),
          }}
          title={title()}
        >
          <span class="zen-sr-only">
            {`${operation().name}, ${formatTime(props.placement.span.start)} to ${formatTime(props.placement.span.end)}${
              props.placement.setup ? ", including changeover" : ""
            }${progress() === null ? "" : `, ${Math.round(progress()!)} percent complete`}`}
          </span>
          <Index each={pieces()}>
            {(piece) => (
              <span
                aria-hidden="true"
                class={cn(
                  "zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border",
                  BAR_CLASS[status()],
                )}
                style={{
                  "inset-inline-start": `${piece().startPct}%`,
                  width: `${piece().widthPct}%`,
                }}
              >
                {/* The changeover, in a hatch rather than a colour: it is not a
                    lighter kind of work, it is not work. A second solid tone
                    would read as a second job. */}
                <Show when={piece().setupPct > 0}>
                  <span
                    class="zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70"
                    style={{
                      width: `${piece().setupPct}%`,
                      "background-image":
                        "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)",
                    }}
                  />
                </Show>
                <Show when={progress() !== null && piece().setupPct < 100}>
                  <span
                    class={cn("zen-absolute zen-inset-y-0", FILL_CLASS[status()])}
                    style={{
                      "inset-inline-start": `${piece().setupPct}%`,
                      width: `${((100 - piece().setupPct) * progress()!) / 100}%`,
                    }}
                  />
                </Show>
              </span>
            )}
          </Index>
        </button>
      )}
    </Show>
  );
};

/**
 * The load histogram: booked working time over available working time, column
 * by column.
 *
 * Bars grow from the BOTTOM and are clipped at 100%, with the overflow drawn in
 * the error tone above the line — so 140% reads as "40% more than there is"
 * rather than as a taller bar the eye has to compare against nothing.
 */
const ProductionLoadStrip = (props: {
  columns: PlanningColumn[];
  columnWidths: number[];
  axisWidth: number;
  paneWidth: number;
  buckets: ProductionLoadBucket[];
}) => (
  <>
    <div
      class="zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg"
      style={{ width: `${props.paneWidth}px`, "inset-inline-start": "0", height: `${FOOTER_PX}px` }}
    >
      Load
    </div>
    <div class="zen-flex" style={{ width: `${props.axisWidth}px`, height: `${FOOTER_PX}px` }}>
      <Index each={props.columns}>
        {(_column, i) => {
          const bucket = () => props.buckets[i];
          const utilisation = () => bucket()?.utilisation ?? null;
          /* Null is not zero. A shut day has no utilisation to draw, and an
             empty bar there would say the plant was idle rather than closed. */
          const height = () => (utilisation() === null ? 0 : Math.min(1, utilisation()!));
          const over = () => (utilisation() === null ? 0 : Math.max(0, Math.min(1, utilisation()! - 1)));
          return (
            <div
              class={cn(
                "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
                utilisation() === null && "zen-bg-zen-muted",
              )}
              style={{ width: `${props.columnWidths[i]}px` }}
              title={
                utilisation() === null
                  ? "Closed"
                  : `${pct(utilisation()!)} of capacity${bucket()?.overloaded ? " — over" : ""}`
              }
            >
              <span
                aria-hidden="true"
                class={cn(
                  "zen-absolute zen-bottom-0 zen-start-0 zen-end-0",
                  bucket()?.overloaded ? "zen-bg-zen-error/70" : "zen-bg-zen-info/70",
                )}
                style={{ height: `${height() * 100}%` }}
              />
              <Show when={over() > 0}>
                <span
                  aria-hidden="true"
                  class="zen-absolute zen-start-0 zen-end-0 zen-top-0 zen-bg-zen-error"
                  style={{ height: `${Math.max(3, over() * 100)}%` }}
                />
              </Show>
            </div>
          );
        }}
      </Index>
    </div>
  </>
);
