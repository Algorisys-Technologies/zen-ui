import * as React from "react";
import {
  flattenProductionResources,
  ganttConnectors,
  ganttFitRange,
  placeAppointment,
  productionLoad,
  productionCriticalPath,
  productionReschedule,
  productionSequenceConflicts,
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
  type ProductionFloat,
  type ProductionMove,
  type ProductionProposal,
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
export type ProductionPaneColumn = "resource" | "jobs" | "capacity" | "load" | "float";

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

  /**
   * Sequence-dependent changeover, keyed on the pair of `setupFamily` values.
   *
   * With one supplied, an operation that states no `setupMinutes` gets one
   * derived from what ran before it on the same machine. This is the difference
   * between a changeover and a changeover *cost*: white to black is an hour of
   * washing out, black to white is fifteen minutes, and a single per-operation
   * duration cannot say so.
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

  onOperationClick?: (operation: ProductionOperation, row: ProductionRowData<ProductionResource, ProductionOperation>) => void;

  /**
   * Called with what WOULD happen if the user's move were made. Supplying it is
   * what turns rescheduling on.
   *
   * The component never applies it. It stays controlled: it renders the
   * `operations` it is given, hands you a proposal, and changes nothing until
   * you pass a new array. That is what keeps undo yours — a history of arrays
   * you already own — and it is why there is no internal pending state to get
   * out of sync with your ERP.
   *
   * `proposal.cascade` includes the operation the user dragged, first. Persist
   * only that one and you have written a schedule nobody saw. `conflicts` and
   * `cycles` are reported, never enforced: overtime gets authorised, and a
   * supervisor who knows both jobs can run may double-book deliberately.
   */
  onReschedule?: (proposal: ProductionProposal) => void;
  /**
   * Whether an operation may be moved at all. Default: everything may, once
   * `onReschedule` is supplied.
   *
   * This GATES THE AFFORDANCE rather than the outcome — a forbidden operation
   * simply is not draggable, so a user never does the work of moving something
   * and then gets told no. Returning a rejection after the drag is the version
   * that feels like a bug.
   */
  canReschedule?: (operation: ProductionOperation) => boolean;

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
  /**
   * Compute float and mark the critical path. Off by default: it is a graph
   * pass over every operation, and a schedule with no routing has nothing to
   * be critical about.
   *
   * With `until` supplied it is measured against a real due date, and every
   * operation can then have NEGATIVE float — which is the plant being late,
   * not a fault. Without it, the latest finish in the schedule is the end, so
   * the longest chain is critical by construction.
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
  emptyState?: React.ReactNode;
  className?: string;
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
     on it with the least room. Reporting an average would say a machine has
     four hours of slack while one of its jobs has none. */
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

export const ProductionSchedule = ({
  resources,
  operations,
  dependencies,
  showDependencies = true,
  calendar,
  hourStep,
  setupMatrix,
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
  onReschedule,
  canReschedule,
  maxLanes = 3,
  showLoad = true,
  showCriticalPath = false,
  until,
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
        { calendar, maxLanes, minGapMs, setupMatrix },
      ),
    [resources, operations, expandedSet, calendar, maxLanes, minGapMs, setupMatrix],
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

  /**
   * Float per operation, and which of them have none.
   *
   * Off unless asked for: it is a graph pass over every operation, and a
   * schedule with no routing has nothing to be critical about.
   */
  const cpa = React.useMemo(() => {
    if (!showCriticalPath) return null;
    return productionCriticalPath(operations ?? [], dependencies ?? [], {
      calendar,
      setupMatrix,
      until,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCriticalPath, operations, dependencies, calendar, setupMatrix, until?.getTime()]);

  /** The tightest float on each row — a row is only as movable as its worst job. */
  const rowFloat = React.useMemo(() => {
    const map = new Map<number, ProductionFloat>();
    if (!cpa) return map;
    for (const row of rows) {
      let worst: ProductionFloat | undefined;
      for (const placement of row.subtree) {
        const value = cpa.byOperation.get(placement.operation.id);
        if (!value) continue;
        if (!worst || value.totalFloatMinutes < worst.totalFloatMinutes) worst = value;
      }
      if (worst) map.set(row.index, worst);
    }
    return map;
  }, [cpa, rows]);

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
          <ProductionPaneCell
            column={key}
            row={row}
            load={rowLoad.get(row.index)}
            float={rowFloat.get(row.index)}
            onToggle={toggle}
          />
        ),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requestedPane.join(","), rowLoad, rowFloat, expandedIds, resources],
  );

  /**
   * Routing links whose lag the schedule does not respect.
   *
   * Reported, never enforced — a planner who knowingly overlaps two operations
   * because the first one's last pallet is already off the machine is making a
   * decision, not an error. The link is drawn in the error tone and thicker;
   * the bars stay exactly where the caller put them.
   */
  const violated = React.useMemo(() => {
    if (!showDependencies || !dependencies || dependencies.length === 0) return null;
    const byId = new Map<string, ProductionPlacement>();
    for (const [id, entry] of placements) byId.set(id, entry.placement);
    const found = productionSequenceConflicts(dependencies, byId, { calendar });
    return new Set(found.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
  }, [showDependencies, dependencies, placements, calendar]);

  const connectorAccent = React.useCallback(
    (connector: { from: string; to: string }) => violated?.has(`${connector.from}->${connector.to}`) ?? false,
    [violated],
  );

  /* ------------------------------------------------------------------ *
   * Rescheduling.
   *
   * The component proposes and never applies, so there is no pending move to
   * hold — only which operation is being dragged and by how far, which is
   * pixels and is discarded on release. `productionReschedule` does the
   * arithmetic; this decides what the pixels mean.
   * ------------------------------------------------------------------ */
  const editable = onReschedule !== undefined;
  const mayMove = React.useCallback(
    (operation: ProductionOperation) => editable && (canReschedule?.(operation) ?? true),
    [editable, canReschedule],
  );

  /** Milliseconds per pixel, so a drag reads as time rather than as distance. */
  const msPerPx = axisWidth > 0 ? (range.end.getTime() - range.start.getTime()) / axisWidth : 0;

  const calendarFor = React.useCallback(
    (resourceId: string) => {
      const find = (list: ProductionResource[]): GanttCalendar | undefined => {
        for (const resource of list) {
          if (resource.id === resourceId) return resource.calendar ?? calendar;
          const inner = resource.children ? find(resource.children) : undefined;
          if (inner) return inner;
        }
        return undefined;
      };
      return find(resources ?? []) ?? calendar;
    },
    [resources, calendar],
  );

  const propose = React.useCallback(
    (move: ProductionMove) => {
      if (!onReschedule) return;
      onReschedule(
        productionReschedule(operations, dependencies ?? [], move, {
          calendar,
          calendarFor,
          resources,
          setupMatrix,
        }),
      );
    },
    [onReschedule, operations, dependencies, calendar, calendarFor, resources, setupMatrix],
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

  const isCritical = React.useCallback(
    (id: string) => cpa?.byOperation.get(id)?.critical ?? false,
    [cpa],
  );

  const renderTrack = React.useCallback(
    (row: Row) => (
      <ProductionTrack
        row={row}
        range={range}
        laneTop={laneTop}
        onOperationClick={onOperationClick}
        mayMove={mayMove}
        msPerPx={msPerPx}
        onPropose={propose}
        isCritical={isCritical}
      />
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, onOperationClick, rowHeight, laneCount, mayMove, msPerPx, propose, isCritical],
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
        colCount={6}
        timelineColIndex={COL_INDEX.timeline}
        renderTrack={renderTrack}
        rowHeight={rowHeight}
        renderFooter={totalLoad ? renderFooter : undefined}
        view={view}
        anchor={anchor}
        now={now}
        connectors={connectors}
        connectorAccent={connectorAccent}
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

const ProductionPaneCell = ({
  column,
  row,
  load,
  float,
  onToggle,
}: {
  column: ProductionPaneColumn;
  row: Row;
  load?: ProductionLoadBucket;
  float?: ProductionFloat;
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
        {/* HERE, and not in the Capacity column where it started, because the
            pane sheds columns to give the axis room and Capacity is among the
            first to go. A conflict marker that vanishes when the container
            narrows is worse than no marker at all: the schedule then looks
            fine. The resource column is the one that is never dropped.
            (Found by check-schedule-dom, after the anchored views learned to
            shrink and section 3's pane shed down to one column.)
            Overload is about CAPACITY, not overlap — two jobs at once on a
            two-operator cell is fine and must not be flagged. */}
        {row.overloaded && (
          <Icon
            name="warn"
            size={13}
            className="zen-ms-auto zen-shrink-0 zen-text-zen-error"
            title="Over capacity"
          />
        )}
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
      </span>
    );
  }

  if (column === "float") {
    if (!float) return <span className="zen-text-sm zen-text-zen-muted-fg">—</span>;
    return (
      <Badge
        dir="ltr"
        variant="soft"
        color={float.totalFloatMinutes < 0 ? "error" : float.critical ? "warning" : "neutral"}
        /* The words, not only the colour: "Critical" and a negative number are
           different situations, and a chart that already uses red for overload
           cannot carry a third meaning on hue alone. */
        /* Negative FREE float is not "minus five hours of room" — it is an
           overlap that already exists, and phrasing it as a countdown reads as
           a rounding error rather than as a schedule that does not work. */
        title={
          float.totalFloatMinutes < 0
            ? `Past the date it is measured against by ${formatFloat(-float.totalFloatMinutes)}`
            : float.freeFloatMinutes < 0
              ? `Already overlaps the next operation by ${formatFloat(-float.freeFloatMinutes)}`
              : float.critical
                ? "On the critical path — no room to move"
                : `${formatFloat(float.freeFloatMinutes)} before it disturbs the next operation`
        }
      >
        {float.critical && float.totalFloatMinutes === 0 ? "Critical" : formatFloat(float.totalFloatMinutes)}
      </Badge>
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
  mayMove,
  msPerPx,
  onPropose,
  isCritical,
}: {
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
    {row.lanes.length === 0 && (
      /* An expanded parent draws nothing because its children draw its work —
         which is a fact worth saying, not a blank cell. */
      <span className="zen-sr-only">
        {row.hasChildren && row.expanded
          ? "Work shown on the rows below"
          : "Nothing booked in this range"}
      </span>
    )}
    {row.lanes.map((lane, laneIndex) =>
      lane.map((placement) => (
        <ProductionBar
          key={placement.operation.id}
          placement={placement}
          row={row}
          range={range}
          top={laneTop(laneIndex)}
          onOperationClick={onOperationClick}
          mayMove={mayMove}
          msPerPx={msPerPx}
          onPropose={onPropose}
          critical={isCritical(placement.operation.id)}
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
  mayMove,
  msPerPx,
  onPropose,
  critical,
}: {
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

  /* PHYSICAL pixels of drag, held here and discarded on release. It is the ONLY
     state this component keeps about a move, and deliberately: the proposal
     goes to the caller, who owns whether anything actually happens.
     
     Physical rather than direction-corrected, because it is fed to `translate`,
     which is a physical property — a logical value would send the preview the
     wrong way under RTL while the proposal went the right way, which is the
     kind of thing that looks like a rendering fault rather than a bug. The
     conversion to "later or earlier in time" happens once, at the proposal. */
  const [dragPx, setDragPx] = React.useState<number | null>(null);
  const movable = mayMove(operation);

  /** Where the booking would start, given a pixel offset. */
  const proposedStart = (px: number) => new Date(placement.span.start.getTime() + px * msPerPx);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!movable || event.button !== 0) return;
    const originX = event.clientX;
    const target = event.currentTarget;
    /* Captured so the gesture survives the pointer leaving the bar — which it
       does immediately, because the bar is what is moving. */
    target.setPointerCapture(event.pointerId);
    /* Direction-aware: under RTL the axis runs the other way, so dragging left
       moves a job LATER. Reading it from the element rather than from a prop
       keeps it correct inside a nested DirectionProvider. */
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
        onPropose({ operationId: operation.id, start: proposedStart(moved * (rtl ? -1 : 1)) });
      }
      else if (commit) onOperationClick?.(operation, row);
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    // Escape abandons the gesture, which is the only way out of a drag that
    // has gone somewhere the user did not mean.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish(false);
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
  };

  /**
   * The keyboard path, and it is not optional.
   *
   * A drag-only affordance is unreachable for anyone not using a pointer, and
   * "reschedule" is the component's primary action once it is switched on.
   * Alt+Arrow nudges by an hour, Shift+Alt+Arrow by a day — modified so the
   * plain arrows keep moving between cells, which is the grid's own navigation
   * and must not be captured by whatever bar happens to be focused.
   */
  const onBarKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!movable || !event.altKey) return;
    const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
    const forward = rtl ? "ArrowLeft" : "ArrowRight";
    const backward = rtl ? "ArrowRight" : "ArrowLeft";
    if (event.key !== forward && event.key !== backward) return;
    event.preventDefault();
    event.stopPropagation();
    const stepMs = (event.shiftKey ? 24 : 1) * 60 * 60_000 * (event.key === forward ? 1 : -1);
    onPropose({
      operationId: operation.id,
      start: new Date(placement.span.start.getTime() + stepMs),
    });
  };

  if (!placed) return null;

  const title = [
    operation.name,
    operation.order ? `Order ${operation.order}` : null,
    `${formatTime(placement.span.start)} – ${formatTime(placement.span.end)}`,
    placement.setup ? "incl. changeover" : null,
    critical ? "on the critical path" : null,
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
          data-gantt-movable={movable ? "" : undefined}
          /* One handler, guarded inside, rather than a conditional one. When a
             bar is movable the pointer gesture calls this itself once it has
             told a click from a drag by distance, so attaching it here too
             would fire on both. Kept identical to the Solid binding, where a
             conditional handler also trips solid/reactivity. */
          onClick={() => {
            if (!movable) onOperationClick?.(operation, row);
          }}
          onPointerDown={onPointerDown}
          onKeyDown={onBarKeyDown}
          className={cn(
            "zen-absolute zen-rounded-zen-sm",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            onOperationClick && "hover:zen-brightness-95",
            /* The affordance IS the gate: an operation the caller will not let
               move simply does not offer to. */
            movable && "zen-cursor-grab active:zen-cursor-grabbing",
            /* A RING, not a recolour. The bar's fill already carries status, so
               a critical operation cannot be signalled by hue without taking
               that meaning away — and the Float column says "Critical" in words
               beside it, because a ring on its own is not a legend. */
            critical && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
            dragPx !== null && "zen-z-20 zen-opacity-80 zen-shadow-zen-md",
          )}
          style={{
            insetInlineStart: `${placed.startPct}%`,
            width: `${placed.widthPct}%`,
            top,
            height: LANE_BAR_PX,
            /* Logical, so the preview follows the pointer under RTL too. */
            ...(dragPx !== null ? { translate: `${dragPx}px` } : null),
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
