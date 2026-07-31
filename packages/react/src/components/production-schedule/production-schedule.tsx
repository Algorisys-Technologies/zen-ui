import * as React from "react";
import {
  flattenProductionResources,
  ganttConnectors,
  ganttFitRange,
  placeAppointment,
  productionLoad,
  type GanttBarAnchor,
  type GanttCalendar,
  type GanttDependency,
  type GanttTaskStatus,
  type GanttView,
  type PlanningColumn,
  type PlanningRange,
  type ProductionLoadBucket,
  type ProductionOperationNode,
  type ProductionPlacement,
  type ProductionResourceNode,
  type ProductionRow as ProductionRowData,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip/tooltip";
import {
  INDENT_PX,
  ROW_PX,
  ScheduleGrid,
  useScheduleAxis,
  useScrollerMetrics,
  type ScheduleColumn,
} from "../gantt/schedule-grid";

/**
 * ProductionSchedule — what each machine is doing, and whether it can.
 *
 *   <ProductionSchedule resources={cells} operations={jobs} calendar={plant} />
 *
 * The sibling of `Gantt`, and a SEPARATE component rather than a mode of it —
 * the decision, its reasoning and the three corrections to that reasoning are
 * in docs/production-scheduling-gap-analysis.md. The short version: a row here
 * is a work centre holding a sequence of operations, each with a changeover, a
 * capacity claim and a routing position. That is a different renderer contract
 * from a row holding one bar with a percentage and a baseline, and no flag
 * describes both without half the props becoming inapplicable.
 *
 * What the two DO share is everything that does not depend on what a row is:
 * ../gantt/schedule-grid renders the axis, the frozen pane, the windowing, the
 * connector overlay and the treegrid keyboard model for both, and
 * @algorisys/zen-ui-core/gantt does the working-time arithmetic underneath
 * both. Sharing in core and in one internal renderer is the point of the split;
 * two copies of either would be the thing it was supposed to avoid.
 *
 * THREE THINGS THIS SHOWS THAT A PROJECT GANTT CANNOT:
 *
 *  - **Lanes.** A machine double-booked at 10:00 draws two bars side by side
 *    rather than one over the other. Rows are a uniform height across the chart
 *    — the window and the connector routes both need that — so the height comes
 *    from the busiest row and every row uses it.
 *  - **Setup.** The changeover is drawn as its own leading block in its own
 *    hatch, because it occupies the machine and makes nothing. It counts in the
 *    load; a plant that measures only run time reports itself less busy than it
 *    is by exactly its changeovers.
 *  - **Load.** A histogram under the axis: booked working time over available
 *    working time, per column. Both sides are working quantities, which is why
 *    the calendar had to exist before this could.
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
 * READ-ONLY, and deliberately so for now. There is no drag-to-reschedule: the
 * decision (DECISION 2 in the gap analysis) is DEFERRED until there is an
 * overload on screen to drag at, not settled against. Two of its consequences
 * are honoured here already because they are cheaper kept than retrofitted —
 * the component is fully controlled, and conflicts are computed and REPORTED,
 * never enforced. Overtime gets authorised and due dates get renegotiated; a
 * component that refused a booking would be wrong in every plant whose rules
 * differ from the ones we guessed.
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
export type ProductionPaneColumn = "resource" | "jobs" | "capacity" | "load";

export interface ProductionScheduleProps {
  resources: ProductionResource[];
  operations: ProductionOperation[];
  /**
   * Routing links between operations — op 10 finishes, op 20 starts. Drawn with
   * the same four link types a Gantt dependency has.
   */
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

  onOperationClick?: (operation: ProductionOperation, row: ProductionRowData<ProductionResource, ProductionOperation>) => void;

  /**
   * How many operations may stack on one row before the rest are counted as
   * overflow. Default 3.
   *
   * Bounded because it sets the height of EVERY row: one badly double-booked
   * machine would otherwise make the whole chart tall.
   */
  maxLanes?: number;
  /** Draw the load histogram under the axis. Default true. */
  showLoad?: boolean;

  now?: Date;
  columnWidth?: number;
  hideToolbar?: boolean;
  /** Which pane columns, in preference order. Default all four. */
  columns?: ProductionPaneColumn[];

  loading?: boolean;
  loadingRows?: number;
  emptyState?: React.ReactNode;
  className?: string;
}

type Row = ProductionRowData<ProductionResource, ProductionOperation>;

const PANE_PX: Record<ProductionPaneColumn, number> = {
  resource: 180,
  jobs: 60,
  capacity: 72,
  load: 84,
};

const PANE_LABEL: Record<ProductionPaneColumn, string> = {
  resource: "Resource",
  jobs: "Jobs",
  capacity: "Capacity",
  load: "Load",
};

/** Place in the FULL set, so a dropped column does not renumber the others. */
const COL_INDEX: Record<ProductionPaneColumn | "timeline", number> = {
  resource: 1,
  jobs: 2,
  capacity: 3,
  load: 4,
  timeline: 5,
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

export const ProductionSchedule = ({
  resources,
  operations,
  dependencies,
  showDependencies = true,
  calendar,
  hourStep,
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
  onOperationClick,
  maxLanes = 3,
  showLoad = true,
  now: nowProp,
  columnWidth,
  hideToolbar,
  columns: paneColumnsProp,
  loading,
  loadingRows = 6,
  emptyState,
  className,
}: ProductionScheduleProps) => {
  const [innerView, setInnerView] = React.useState<GanttView>(defaultView ?? "fit");
  const [innerDate, setInnerDate] = React.useState<Date>(defaultDate ?? new Date());
  const [innerExpanded, setInnerExpanded] = React.useState<string[] | null>(defaultExpanded ?? null);

  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const { metrics, setMetrics } = useScrollerMetrics(scrollerRef);

  const view = viewProp ?? innerView;
  const anchor = dateProp ?? innerDate;
  /* Read once per MOUNT, not per render — a fresh `now` every frame would
     invalidate every memo below on every scroll tick. */
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
    const base = expandedIds ?? parentIds(resources);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    if (expandedProp === undefined) setInnerExpanded(next);
    onExpandedChange?.(next);
  };

  /* Fit takes its range from the OPERATIONS, not the resources — a machine has
     no dates of its own, so the plan's span is the span of the work booked on
     it. Shaped as tasks for `ganttFitRange`, which asks only for start/end. */
  const fitRange = React.useMemo(() => {
    if (view !== "fit") return null;
    return ganttFitRange(
      operations.map((operation) => ({
        id: operation.id,
        start: operation.start,
        end: operation.end,
        /* Setup claims the machine too, so it belongs inside the range. Without
           it a chart whose first job opens with a two-hour changeover starts
           two hours after the work does. */
        workingMinutes:
          operation.end === undefined
            ? (operation.setupMinutes ?? 0) + (operation.runMinutes ?? 0)
            : undefined,
      })),
      { calendar },
    );
  }, [view, operations, calendar]);

  const requestedPane = paneColumnsProp ?? DEFAULT_PANE;

  /* Placeholder widths only — the real columns are built below, once `rows`
     exist. `useScheduleAxis` needs nothing but the keys and the widths. */
  const paneSpec = React.useMemo(
    () => requestedPane.map((key) => ({ key, width: PANE_PX[key] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedPane.join(",")],
  );

  const axis = useScheduleAxis({
    view,
    anchor,
    fitRange,
    now,
    calendar,
    hourStep,
    columnWidth,
    paneColumns: paneSpec,
    available: metrics.width,
  });
  const { range, columns, axisWidth, minGapMs } = axis;

  const { rows, rowIndexById, operationIndex } = React.useMemo(
    () =>
      flattenProductionResources<ProductionResource, ProductionOperation>(
        resources ?? [],
        operations ?? [],
        (resource) => (expandedSet === null ? true : expandedSet.has(resource.id)),
        { calendar, maxLanes, minGapMs },
      ),
    [resources, operations, expandedSet, calendar, maxLanes, minGapMs],
  );

  /* ONE height for the whole chart, from the busiest row. Rows that varied
     would break both the window (arithmetic, not measurement) and the connector
     routes (which place an endpoint at rowIndex * rowHeight + rowHeight / 2). */
  const laneCount = Math.max(1, ...rows.map((row) => row.lanes.length));
  const rowHeight = Math.max(
    ROW_PX,
    laneCount * LANE_BAR_PX + (laneCount - 1) * LANE_GAP_PX + LANE_PAD_PX,
  );
  const stackTop = (rowHeight - (laneCount * LANE_BAR_PX + (laneCount - 1) * LANE_GAP_PX)) / 2;
  const laneTop = (lane: number) => stackTop + lane * (LANE_BAR_PX + LANE_GAP_PX);

  /** Every operation placed on the axis, keyed by id — routing needs it. */
  const placements = React.useMemo(() => {
    const map = new Map<string, { placement: ProductionPlacement<ProductionOperation>; row: Row }>();
    for (const row of rows) {
      for (const lane of row.lanes) {
        for (const placement of lane) map.set(placement.operation.id, { placement, row });
      }
    }
    return map;
  }, [rows]);

  const connectors = React.useMemo(() => {
    if (!showDependencies || !dependencies || dependencies.length === 0) return [];
    const anchors = new Map<string, GanttBarAnchor>();
    for (const [id, entry] of placements) {
      const placed = placeAppointment(entry.placement.span, range);
      if (!placed) continue;
      const lane = operationIndex.get(id)?.lane ?? 0;
      anchors.set(id, {
        rowIndex: entry.row.index,
        startPct: placed.startPct,
        widthPct: placed.widthPct,
        /* The LANE's centre, not the row's. A routing arrow that pointed at the
           middle of a three-lane row would miss every bar in it. */
        yOffset: laneTop(lane) + LANE_BAR_PX / 2,
      });
    }
    /* Routing links name OPERATIONS, and a link whose endpoint folded into a
       collapsed parent still has an anchor because the operation is drawn on
       that parent's row. Ids that name a resource rather than an operation are
       resolved here too, so a link between two work centres still draws. */
    for (const [id, index] of rowIndexById) {
      if (anchors.has(id)) continue;
      const row = rows[index];
      const first = row?.lanes[0]?.[0];
      if (!first) continue;
      const placed = placeAppointment(first.span, range);
      if (placed) {
        anchors.set(id, {
          rowIndex: index,
          startPct: placed.startPct,
          widthPct: placed.widthPct,
          yOffset: laneTop(0) + LANE_BAR_PX / 2,
        });
      }
    }
    return ganttConnectors(anchors, dependencies, { axisWidth, rowHeight });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDependencies, dependencies, placements, rowIndexById, rows, range, axisWidth, rowHeight, laneCount]);

  /** Load for the WHOLE chart — every operation on every visible row. */
  const totalLoad = React.useMemo(() => {
    if (!showLoad) return null;
    /* Roots only, so an expanded tree does not count its own work once per
       level — every operation is inside exactly one root's subtree. */
    const roots = rows.filter((row) => row.parentId === null);
    const all = roots.flatMap((row) => row.subtree);
    const capacity = roots.reduce((sum, row) => sum + row.capacity, 0);
    return productionLoad(all, columns, { calendar, capacity: Math.max(1, capacity) });
  }, [showLoad, rows, columns, calendar]);

  /** Per row, over the visible range only — what the Load pane column shows. */
  const rowLoad = React.useMemo(() => {
    const map = new Map<number, ProductionLoadBucket>();
    const whole: PlanningColumn[] = [
      { start: range.start, end: range.end, label: "", sublabel: "", nonWorking: false, today: false },
    ];
    for (const row of rows) {
      map.set(
        row.index,
        productionLoad(row.subtree, whole, {
          calendar: row.resource.calendar ?? calendar,
          capacity: row.capacity,
        })[0],
      );
    }
    return map;
  }, [rows, range, calendar]);

  const paneColumns = React.useMemo<ScheduleColumn<Row>[]>(
    () =>
      requestedPane.map((key) => ({
        key,
        label: PANE_LABEL[key],
        width: PANE_PX[key],
        colIndex: COL_INDEX[key],
        className: key === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
        style:
          key === "resource"
            ? (row: Row) => ({ paddingInlineStart: 8 + row.depth * INDENT_PX })
            : undefined,
        render: (row: Row) => (
          <ProductionPaneCell column={key} row={row} load={rowLoad.get(row.index)} onToggle={toggle} />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedPane.join(","), rowLoad, expandedIds, resources],
  );

  const setView = (next: GanttView) => {
    /* Leaving fit re-anchors when the anchor is nowhere near the work, or
       clicking Day on next week's schedule lands on an empty shift. */
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
    (row: Row) => (
      <ProductionTrack
        row={row}
        range={range}
        laneTop={laneTop}
        onOperationClick={onOperationClick}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, onOperationClick, rowHeight, laneCount],
  );

  const renderFooter = React.useCallback(
    (context: { columns: PlanningColumn[]; columnWidths: number[]; axisWidth: number; paneWidth: number }) => (
      <ProductionLoadStrip {...context} buckets={totalLoad!} />
    ),
    [totalLoad],
  );

  if (loading) {
    return (
      <div
        className={cn(
          "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
          className,
        )}
        role="status"
        aria-label="Loading production schedule"
      >
        {Array.from({ length: loadingRows }, (_, i) => (
          <div key={i} className="zen-flex zen-items-center zen-gap-3">
            <Skeleton className="zen-h-4" style={{ width: PANE_PX.resource - 24 - (i % 3) * INDENT_PX }} />
            <Skeleton className="zen-h-4 zen-w-12" />
            {/* Two blocks per row, because a machine's day is a sequence — one
                long bar would read as the wrong component for a second. */}
            <Skeleton className="zen-h-4" style={{ marginInlineStart: `${(i * 29) % 40}%`, width: `${12 + ((i * 7) % 18)}%` }} />
            <Skeleton className="zen-h-4" style={{ width: `${10 + ((i * 11) % 20)}%` }} />
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
              <Icon name="cog" size={22} />
            </EmptyStateIcon>
            <EmptyStateTitle>No resources</EmptyStateTitle>
            <EmptyStateDescription>
              Add a work centre and book an operation on it, and the schedule will appear here.
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
        rowId={(row) => row.resource.id}
        columns={paneColumns}
        colCount={5}
        timelineColIndex={COL_INDEX.timeline}
        renderTrack={renderTrack}
        rowHeight={rowHeight}
        renderFooter={totalLoad ? renderFooter : undefined}
        view={view}
        anchor={anchor}
        now={now}
        connectors={connectors}
        views={views}
        hideToolbar={hideToolbar}
        onViewChange={setView}
        onDateChange={setDate}
        onToggle={(row) => toggle(row.resource.id)}
        onActivate={(row) => {
          const first = row.lanes[0]?.[0];
          if (first) onOperationClick?.(first.operation, row);
        }}
        ariaLabel="Production schedule"
        className={className}
        scrollerRef={scrollerRef}
        axis={axis}
        metrics={metrics}
        setMetrics={setMetrics}
      />
    </TooltipProvider>
  );
};

const ProductionPaneCell = ({
  column,
  row,
  load,
  onToggle,
}: {
  column: ProductionPaneColumn;
  row: Row;
  load?: ProductionLoadBucket;
  onToggle: (id: string) => void;
}) => {
  const { resource } = row;

  if (column === "resource") {
    return (
      <>
        {row.hasChildren ? (
          <button
            type="button"
            /* Out of the tab order, in the grid's — the chevron is reached by
               arrowing to the first column and pressing the forward arrow. */
            tabIndex={-1}
            onClick={() => onToggle(resource.id)}
            aria-label={row.expanded ? `Collapse ${resource.name}` : `Expand ${resource.name}`}
            className="zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring"
          >
            <Icon
              name={row.expanded ? "chevron-down" : "chevron-right"}
              size={14}
              className={row.expanded ? undefined : "rtl:zen-rotate-180"}
            />
          </button>
        ) : (
          <span aria-hidden="true" className="zen-h-5 zen-w-5 zen-shrink-0" />
        )}
        <span className="zen-min-w-0">
          <span
            className={cn(
              "zen-block zen-truncate zen-text-sm zen-text-zen-foreground",
              row.hasChildren && "zen-font-semibold",
            )}
            title={resource.name}
          >
            {resource.name}
          </span>
          {resource.subtitle && (
            <span className="zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg">
              {resource.subtitle}
            </span>
          )}
        </span>
      </>
    );
  }

  if (column === "jobs") {
    const count = row.subtree.length;
    return (
      <span className="zen-text-sm zen-text-zen-muted-fg">
        {count === 0 ? "—" : count}
        {/* Never silently dropped: a row that hid six jobs is the worst thing
            this component could do. */}
        {row.overflow > 0 && (
          <span className="zen-ms-1 zen-text-[10px] zen-text-zen-error">+{row.overflow}</span>
        )}
      </span>
    );
  }

  if (column === "capacity") {
    return (
      <span className="zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg">
        <span dir="ltr">×{row.capacity}</span>
        {/* Overload is about CAPACITY, not about overlap: two jobs at once on a
            two-operator cell is fine and must not be painted red. */}
        {row.overloaded && (
          <Icon name="warn" size={12} className="zen-text-zen-error" aria-label="Over capacity" />
        )}
      </span>
    );
  }

  /* A shut resource over the visible range has no utilisation — not 0%. An
     empty bar there would claim the machine was idle when it was closed. */
  if (!load || load.utilisation === null) {
    return <span className="zen-text-sm zen-text-zen-muted-fg">—</span>;
  }
  return (
    <Badge
      dir="ltr"
      variant="soft"
      color={load.overloaded ? "error" : load.utilisation >= 0.85 ? "warning" : "success"}
    >
      {pct(load.utilisation)}
    </Badge>
  );
};

/** Every operation on one resource row, in its lane. */
const ProductionTrack = ({
  row,
  range,
  laneTop,
  onOperationClick,
}: {
  row: Row;
  range: PlanningRange;
  laneTop: (lane: number) => number;
  onOperationClick?: (operation: ProductionOperation, row: Row) => void;
}) => (
  <>
    {row.lanes.map((lane, laneIndex) =>
      lane.map((placement) => (
        <ProductionBar
          key={placement.operation.id}
          placement={placement}
          row={row}
          range={range}
          top={laneTop(laneIndex)}
          onOperationClick={onOperationClick}
        />
      )),
    )}
  </>
);

const ProductionBar = ({
  placement,
  row,
  range,
  top,
  onOperationClick,
}: {
  placement: ProductionPlacement<ProductionOperation>;
  row: Row;
  range: PlanningRange;
  top: number;
  onOperationClick?: (operation: ProductionOperation, row: Row) => void;
}) => {
  const { operation } = placement;
  const placed = placeAppointment(placement.span, range);
  const status = operation.status ?? "on-track";
  const progress = operation.percentComplete ?? null;

  /**
   * The booking broken into the stretches the plant is open, with each stretch
   * split again at the point setup ends.
   *
   * Two things are being drawn at once and they are not the same thing: the
   * gaps (the plant is shut) and the changeover (the machine is busy making
   * nothing). Drawing setup as a single leading block would be wrong the moment
   * a changeover spans a lunch break — which is exactly when a planner cares.
   */
  const pieces = React.useMemo(() => {
    if (!placed) return [];
    const from = Math.max(placement.span.start.getTime(), range.start.getTime());
    const to = Math.min(placement.span.end.getTime(), range.end.getTime());
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
  }, [placed, placement, range]);

  if (!placed) return null;

  const title = [
    operation.name,
    operation.order ? `Order ${operation.order}` : null,
    `${formatTime(placement.span.start)} – ${formatTime(placement.span.end)}`,
    placement.setup ? "incl. changeover" : null,
    progress === null ? null : `${Math.round(progress)}%`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          /* Reachable, not tabbable: the timeline CELL carries the tab stop,
             and `data-gantt-bar` is how the keyboard scrolls this into view. */
          tabIndex={-1}
          data-gantt-bar=""
          onClick={() => onOperationClick?.(operation, row)}
          className={cn(
            "zen-absolute zen-rounded-zen-sm",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            onOperationClick && "hover:zen-brightness-95",
          )}
          style={{
            insetInlineStart: `${placed.startPct}%`,
            width: `${placed.widthPct}%`,
            top,
            height: LANE_BAR_PX,
          }}
          title={title}
        >
          <span className="zen-sr-only">
            {`${operation.name}, ${formatTime(placement.span.start)} to ${formatTime(placement.span.end)}${
              placement.setup ? ", including changeover" : ""
            }${progress === null ? "" : `, ${Math.round(progress)} percent complete`}`}
          </span>
          {pieces.map((piece) => (
            <span
              key={piece.key}
              aria-hidden="true"
              className={cn(
                "zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border",
                BAR_CLASS[status],
              )}
              style={{ insetInlineStart: `${piece.startPct}%`, width: `${piece.widthPct}%` }}
            >
              {/* The changeover, in a hatch rather than a colour: it is not a
                  lighter kind of work, it is not work. A second solid tone
                  would read as a second job. */}
              {piece.setupPct > 0 && (
                <span
                  className="zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70"
                  style={{
                    width: `${piece.setupPct}%`,
                    backgroundImage:
                      "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)",
                  }}
                />
              )}
              {progress !== null && piece.setupPct < 100 && (
                <span
                  className={cn("zen-absolute zen-inset-y-0", FILL_CLASS[status])}
                  style={{
                    insetInlineStart: `${piece.setupPct}%`,
                    width: `${((100 - piece.setupPct) * progress) / 100}%`,
                  }}
                />
              )}
            </span>
          ))}
        </button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
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
const ProductionLoadStrip = ({
  columns,
  columnWidths,
  axisWidth,
  paneWidth,
  buckets,
}: {
  columns: PlanningColumn[];
  columnWidths: number[];
  axisWidth: number;
  paneWidth: number;
  buckets: ProductionLoadBucket[];
}) => (
  <>
    <div
      className="zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg"
      style={{ width: paneWidth, insetInlineStart: 0, height: FOOTER_PX }}
    >
      Load
    </div>
    <div className="zen-flex" style={{ width: axisWidth, height: FOOTER_PX }}>
      {columns.map((column, i) => {
        const bucket = buckets[i];
        const utilisation = bucket?.utilisation ?? null;
        /* Null is not zero. A shut day has no utilisation to draw, and an empty
           bar there would say the plant was idle rather than closed. */
        const height = utilisation === null ? 0 : Math.min(1, utilisation);
        const over = utilisation === null ? 0 : Math.max(0, Math.min(1, utilisation - 1));
        return (
          <div
            key={column.start.getTime()}
            className={cn(
              "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
              utilisation === null && "zen-bg-zen-muted",
            )}
            style={{ width: columnWidths[i] }}
            title={
              utilisation === null
                ? "Closed"
                : `${pct(utilisation)} of capacity${bucket.overloaded ? " — over" : ""}`
            }
          >
            <span
              aria-hidden="true"
              className={cn(
                "zen-absolute zen-bottom-0 zen-start-0 zen-end-0",
                bucket?.overloaded ? "zen-bg-zen-error/70" : "zen-bg-zen-info/70",
              )}
              style={{ height: `${height * 100}%` }}
            />
            {over > 0 && (
              <span
                aria-hidden="true"
                className="zen-absolute zen-start-0 zen-end-0 zen-top-0 zen-bg-zen-error"
                style={{ height: `${Math.max(3, over * 100)}%` }}
              />
            )}
          </div>
        );
      })}
    </div>
  </>
);
