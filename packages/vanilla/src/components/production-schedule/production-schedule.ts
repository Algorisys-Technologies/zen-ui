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
import { toNodes, type AnyZenComponent, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import {
  INDENT_PX,
  ROW_PX,
  ScheduleGrid,
  resolveScheduleAxis,
  type ScheduleAxis,
  type ScheduleColumn,
  type ScheduleGridHandle,
} from "../gantt/schedule-grid";

/**
 * ProductionSchedule — what each machine is doing, and whether it can.
 *
 *   ProductionSchedule({ resources: cells, operations: jobs, calendar: plant }).el
 *
 * The no-framework port, mirroring React and Solid one-for-one and verified
 * against them: `check-schedule-dom.mjs vanilla` runs the same assertions and
 * `check-schedule-parity.mjs vanilla` compares the drawn charts against React's.
 *
 * The sibling of `Gantt`, and a SEPARATE component rather than a mode of it —
 * the decision is in docs/production-scheduling-gap-analysis.md. A row here is
 * a work centre holding a sequence of operations, each with a changeover, a
 * capacity claim and a routing position. That is a different renderer contract
 * from a row holding one bar with a percentage and a baseline.
 *
 * IT RESCHEDULES, and `Gantt` does not. The component proposes and never
 * applies: it renders the `operations` it is given, hands back what WOULD
 * happen, and changes nothing until the caller passes a new array through
 * `update({ operations })`. That is what keeps undo the caller's, and why there
 * is no internal pending state to fall out of sync with an ERP. Conflicts are
 * computed and REPORTED, never enforced.
 *
 * ONE THING THIS BINDING HAS TO DO BY HAND. A drag holds state — how far the
 * pointer has moved — and the other two keep it in a hook or a signal. Here it
 * lives in the closure of the bar that owns it and is written straight onto the
 * node's `translate`. Nothing rebuilds the row band mid-gesture (a scroll would,
 * and a drag is not a scroll), so the node the gesture started on is the node it
 * finishes on.
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
  /** The works order it belongs to. Shown in the bar's title. */
  order?: string;
  /** Overrides the derived status colour's words, not its colour. */
  statusLabel?: string;
}

/** Which columns the frozen pane can carry. */
export type ProductionPaneColumn = "resource" | "jobs" | "capacity" | "load" | "float";

export interface ProductionScheduleProps extends BaseProps {
  resources: ProductionResource[];
  operations: ProductionOperation[];
  /** Routing links between operations. Drawn with the same four link types. */
  dependencies?: GanttDependency[];
  /** Draw the routing layer. Default true. */
  showDependencies?: boolean;

  /**
   * When the plant is open. A resource's own `calendar` overrides it.
   * Strongly recommended here, unlike on `Gantt`: without one every duration is
   * wall-clock, so a changeover runs through the night and load is measured
   * against 24 hours a day the plant does not have.
   */
  calendar?: GanttCalendar;
  /** Hours per column in the DAY view. Default 1; 0.25 for quarter-hour columns. */
  hourStep?: number;
  /**
   * Sequence-dependent changeover, keyed on the pair of `setupFamily` values.
   * An operation that states no `setupMinutes` gets one derived from what ran
   * before it on the same machine.
   */
  setupMatrix?: ProductionSetupMatrix;

  /** Starting view. The factory owns it after that; `update({ view })` controls it. */
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
   * what turns rescheduling on. `proposal.cascade` includes the operation the
   * user dragged, FIRST — persist only that one and you have written a schedule
   * nobody saw.
   */
  onReschedule?: (proposal: ProductionProposal) => void;
  /**
   * Whether an operation may be moved at all. GATES THE AFFORDANCE rather than
   * the outcome: a forbidden operation is not draggable, so a user never does
   * the work of a drag and then gets told no.
   */
  canReschedule?: (operation: ProductionOperation) => boolean;

  /** How many operations may stack on one row. Default 3; it sets EVERY row's height. */
  maxLanes?: number;
  /** Draw the load histogram under the axis. Default true. */
  showLoad?: boolean;
  /** Compute float and mark the critical path. Off by default: a graph pass. */
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
  emptyState?: Child;
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

export function ProductionSchedule(
  props: ProductionScheduleProps,
): ZenComponent<ProductionScheduleProps> {
  let current: ProductionScheduleProps = { ...props };

  let innerView: GanttView = props.defaultView ?? "fit";
  let innerDate: Date = props.defaultDate ?? new Date();
  let innerExpanded: string[] | null = props.defaultExpanded ?? null;
  /* Read once per CONSTRUCTION: two `new Date()`s in one pass can straddle a
     millisecond and leave the marker and the today column disagreeing. */
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

  const setDate = (next: Date) => {
    if (current.date === undefined) innerDate = next;
    current.onDateChange?.(next);
    render();
  };
  const setView = (next: GanttView) => {
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
  const toggle = (id: string) => {
    const base = expandedOf() ?? parentIds(current.resources ?? []);
    const next = base.includes(id) ? base.filter((x) => x !== id) : [...base, id];
    if (current.expanded === undefined) innerExpanded = next;
    current.onExpandedChange?.(next);
    render();
  };

  /* Fit takes its range from the OPERATIONS, not the resources — a machine has
     no dates of its own. Setup claims the machine too, so it belongs inside. */
  const fitRangeOf = () =>
    viewOf() === "fit"
      ? ganttFitRange(
          (current.operations ?? []).map((operation) => ({
            id: operation.id,
            start: operation.start,
            end: operation.end,
            workingMinutes:
              operation.end === undefined
                ? (operation.setupMinutes ?? 0) + (operation.runMinutes ?? 0)
                : undefined,
          })),
          { calendar: current.calendar },
        )
      : null;

  const calendarFor = (resourceId: string): GanttCalendar | undefined => {
    const find = (list: ProductionResource[]): GanttCalendar | undefined => {
      for (const resource of list) {
        if (resource.id === resourceId) return resource.calendar ?? current.calendar;
        const inner = resource.children ? find(resource.children) : undefined;
        if (inner) return inner;
      }
      return undefined;
    };
    return find(current.resources ?? []) ?? current.calendar;
  };

  const propose = (move: ProductionMove) => {
    const handler = current.onReschedule;
    if (!handler) return;
    handler(
      productionReschedule(current.operations ?? [], current.dependencies ?? [], move, {
        calendar: current.calendar,
        calendarFor,
        resources: current.resources,
        setupMatrix: current.setupMatrix,
      }),
    );
  };

  function paneCell(
    column: ProductionPaneColumn,
    row: Row,
    load: ProductionLoadBucket | undefined,
    float: ProductionFloat | undefined,
  ): Array<Node | AnyZenComponent> {
    const resource = row.resource;

    if (column === "resource") {
      const out: Array<Node | AnyZenComponent> = [];
      if (row.hasChildren) {
        const chevron = el(
          "button",
          "zen-flex zen-h-5 zen-w-5 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-text-zen-muted-fg hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        );
        chevron.type = "button";
        /* Out of the tab order, in the grid's: reached by arrowing to the first
           column and pressing the forward arrow, not by a tab stop per parent. */
        chevron.tabIndex = -1;
        chevron.setAttribute(
          "aria-label",
          row.expanded ? `Collapse ${resource.name}` : `Expand ${resource.name}`,
        );
        chevron.addEventListener("click", () => toggle(resource.id));
        const icon = Icon({
          name: row.expanded ? "chevron-down" : "chevron-right",
          size: 14,
          class: row.expanded ? undefined : "rtl:zen-rotate-180",
        });
        chevron.append(icon.el);
        out.push(chevron, icon);
      } else {
        const spacer = el("span", "zen-h-5 zen-w-5 zen-shrink-0");
        spacer.setAttribute("aria-hidden", "true");
        out.push(spacer);
      }

      const text = el("span", "zen-min-w-0");
      const name = el(
        "span",
        cn("zen-block zen-truncate zen-text-sm zen-text-zen-foreground", row.hasChildren && "zen-font-semibold"),
        resource.name,
      );
      name.title = resource.name;
      text.append(name);
      if (resource.subtitle) {
        text.append(el("span", "zen-block zen-truncate zen-text-[10px] zen-text-zen-muted-fg", resource.subtitle));
      }
      out.push(text);

      /* HERE, and not in the Capacity column where it started, because the pane
         sheds columns to give the axis room and Capacity is among the first to
         go. A conflict marker that vanishes when the container narrows is worse
         than no marker: the schedule then looks fine. Overload is about
         CAPACITY, not overlap — two jobs at once on a two-operator cell is fine
         and must not be flagged. */
      if (row.overloaded) {
        const warn = Icon({
          name: "warn",
          size: 13,
          class: "zen-ms-auto zen-shrink-0 zen-text-zen-error",
          title: "Over capacity",
        });
        out.push(warn);
      }
      return out;
    }

    if (column === "jobs") {
      const count = row.subtree.length;
      const span = el("span", "zen-text-sm zen-text-zen-muted-fg", count === 0 ? "—" : String(count));
      /* Never silently dropped: a row that hid six jobs is the worst thing this
         component could do. */
      if (row.overflow > 0) {
        span.append(el("span", "zen-ms-1 zen-text-[10px] zen-text-zen-error", `+${row.overflow}`));
      }
      return [span];
    }

    if (column === "capacity") {
      const span = el("span", "zen-flex zen-items-center zen-gap-1 zen-text-sm zen-text-zen-muted-fg");
      const n = el("span", undefined, `×${row.capacity}`);
      n.setAttribute("dir", "ltr");
      span.append(n);
      return [span];
    }

    if (column === "load") {
      /* A shut resource over the visible range has no utilisation — not 0%. An
         empty bar there would claim the machine was idle when it was closed. */
      if (!load || load.utilisation === null) {
        return [el("span", "zen-text-sm zen-text-zen-muted-fg", "—")];
      }
      const chip = Badge({
        variant: "soft",
        color: load.overloaded ? "error" : load.utilisation >= 0.85 ? "warning" : "success",
        children: pct(load.utilisation),
      });
      chip.el.setAttribute("dir", "ltr");
      return [chip];
    }

    if (!float) return [el("span", "zen-text-sm zen-text-zen-muted-fg", "—")];
    const chip = Badge({
      variant: "soft",
      color: float.totalFloatMinutes < 0 ? "error" : float.critical ? "warning" : "neutral",
      children:
        float.critical && float.totalFloatMinutes === 0 ? "Critical" : formatFloat(float.totalFloatMinutes),
    });
    chip.el.setAttribute("dir", "ltr");
    /* The words, not only the colour: a negative float and a critical one are
       different situations, and a chart that already uses red for overload
       cannot carry a third meaning on hue alone. */
    chip.el.setAttribute(
      "title",
      float.totalFloatMinutes < 0
        ? `Past the date it is measured against by ${formatFloat(-float.totalFloatMinutes)}`
        : float.freeFloatMinutes < 0
          ? `Already overlaps the next operation by ${formatFloat(-float.freeFloatMinutes)}`
          : float.critical
            ? "On the critical path — no room to move"
            : `${formatFloat(float.freeFloatMinutes)} before it disturbs the next operation`,
    );
    return [chip];
  }

  /** One operation's bar, with the drag gesture and the keyboard nudge on it. */
  function bar(
    placement: ProductionPlacement<ProductionOperation>,
    row: Row,
    axis: ScheduleAxis,
    top: number,
    critical: boolean,
    msPerPx: number,
  ): HTMLElement | null {
    const placed = placeAppointment(placement.span, axis.range);
    if (!placed) return null;
    const operation = placement.operation;
    const status = operation.status ?? "on-track";
    const progress = operation.percentComplete ?? null;
    const movable =
      current.onReschedule !== undefined && (current.canReschedule?.(operation) ?? true);

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

    const node = el(
      "button",
      cn(
        "zen-absolute zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        current.onOperationClick && "hover:zen-brightness-95",
        /* The affordance IS the gate: an operation the caller will not let move
           simply does not offer to. */
        movable && "zen-cursor-grab active:zen-cursor-grabbing",
        /* A RING, not a recolour. The bar's fill already carries status, so a
           critical operation cannot be signalled by hue without taking that
           meaning away — and the Float column says "Critical" in words. */
        critical && "zen-ring-2 zen-ring-zen-warning zen-ring-offset-1",
      ),
    );
    node.type = "button";
    /* Reachable, not tabbable: the timeline CELL carries the tab stop, and
       `data-gantt-bar` is how the keyboard scrolls this into view. */
    node.tabIndex = -1;
    node.setAttribute("data-gantt-bar", "");
    if (movable) node.setAttribute("data-gantt-movable", "");
    node.style.insetInlineStart = `${placed.startPct}%`;
    node.style.width = `${placed.widthPct}%`;
    node.style.top = `${top}px`;
    node.style.height = `${LANE_BAR_PX}px`;
    /* No tooltip component here, deliberately, and the other two bindings
       agree: a tooltip trigger installs pointer handlers on a bar that is
       DRAGGABLE, and they compete with the pointer capture the drag needs. */
    node.title = title;

    node.append(
      el(
        "span",
        "zen-sr-only",
        `${operation.name}, ${formatTime(placement.span.start)} to ${formatTime(placement.span.end)}${
          placement.setup ? ", including changeover" : ""
        }${progress === null ? "" : `, ${Math.round(progress)} percent complete`}`,
      ),
    );

    /**
     * The booking broken into the stretches the plant is open, each split again
     * where setup ends.
     *
     * Two things are drawn at once and they are not the same: the gaps (the
     * plant is shut) and the changeover (the machine is busy making nothing).
     * A single leading block would be wrong the moment a changeover spans a
     * lunch break — which is exactly when a planner cares.
     */
    const from = Math.max(placement.span.start.getTime(), axis.range.start.getTime());
    const to = Math.min(placement.span.end.getTime(), axis.range.end.getTime());
    const total = to - from;
    if (total > 0) {
      const setupEnd = placement.setup ? placement.setup.end.getTime() : from;
      for (const part of placement.segments ?? [placement.span]) {
        const start = Math.max(part.start.getTime(), from);
        const end = Math.min(part.end.getTime(), to);
        if (end <= start) continue;
        const width = end - start;
        const setupWithin = Math.max(0, Math.min(setupEnd, end) - start);
        const setupPct = (setupWithin / width) * 100;

        const piece = el(
          "span",
          cn("zen-absolute zen-inset-y-0 zen-overflow-hidden zen-rounded-zen-sm zen-border", BAR_CLASS[status]),
        );
        piece.setAttribute("aria-hidden", "true");
        piece.style.insetInlineStart = `${((start - from) / total) * 100}%`;
        piece.style.width = `${(width / total) * 100}%`;

        /* The changeover, in a hatch rather than a colour: it is not a lighter
           kind of work, it is not work. A second solid tone would read as a
           second job. */
        if (setupPct > 0) {
          const hatch = el("span", "zen-absolute zen-inset-y-0 zen-start-0 zen-opacity-70");
          hatch.style.width = `${setupPct}%`;
          hatch.style.backgroundImage =
            "repeating-linear-gradient(45deg, var(--zen-color-muted-fg) 0 2px, transparent 2px 5px)";
          piece.append(hatch);
        }
        if (progress !== null && setupPct < 100) {
          const fill = el("span", cn("zen-absolute zen-inset-y-0", FILL_CLASS[status]));
          fill.style.insetInlineStart = `${setupPct}%`;
          fill.style.width = `${((100 - setupPct) * progress) / 100}%`;
          piece.append(fill);
        }
        node.append(piece);
      }
    }

    if (!movable) {
      node.addEventListener("click", () => current.onOperationClick?.(operation, row));
      return node;
    }

    /* PHYSICAL pixels of drag, written straight onto the node. It is the ONLY
       state kept about a move — the proposal goes to the caller, who owns
       whether anything happens. Physical rather than direction-corrected,
       because `translate` is a physical property: a logical value would send
       the preview the wrong way under RTL while the proposal went the right
       way. Nothing rebuilds the row band mid-gesture, so this node survives. */
    node.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const originX = event.clientX;
      node.setPointerCapture(event.pointerId);
      /* Under RTL the axis runs the other way, so dragging left moves a job
         LATER. Read from the element so a nested DirectionProvider is honoured. */
      const rtl = getComputedStyle(node).direction === "rtl";

      let moved = 0;
      const onMove = (e: PointerEvent) => {
        moved = e.clientX - originX;
        node.style.translate = `${moved}px`;
        node.classList.add("zen-z-20", "zen-opacity-80", "zen-shadow-zen-md");
      };
      const finish = (commit: boolean) => {
        node.releasePointerCapture?.(event.pointerId);
        node.removeEventListener("pointermove", onMove);
        node.removeEventListener("pointerup", onUp);
        node.removeEventListener("pointercancel", onCancel);
        window.removeEventListener("keydown", onKey);
        node.style.translate = "";
        node.classList.remove("zen-z-20", "zen-opacity-80", "zen-shadow-zen-md");
        /* A few pixels is a click, not a drag. Without this every click on a
           bar proposes a move of about ninety seconds. */
        if (commit && Math.abs(moved) > 3) {
          propose({
            operationId: operation.id,
            start: new Date(placement.span.start.getTime() + moved * (rtl ? -1 : 1) * msPerPx),
          });
        } else if (commit) {
          current.onOperationClick?.(operation, row);
        }
      };
      const onUp = () => finish(true);
      const onCancel = () => finish(false);
      // Escape abandons the gesture — the only way out of a drag that has gone
      // somewhere the user did not mean.
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") finish(false);
      };
      node.addEventListener("pointermove", onMove);
      node.addEventListener("pointerup", onUp);
      node.addEventListener("pointercancel", onCancel);
      window.addEventListener("keydown", onKey);
    });

    /* The keyboard path, and it is not optional: a drag-only affordance is
       unreachable without a pointer, and rescheduling is the component's
       primary action once it is on. Alt+Arrow nudges an hour, Shift+Alt a day —
       modified so the plain arrows keep moving between cells. */
    node.addEventListener("keydown", (event) => {
      if (!event.altKey) return;
      const rtl = getComputedStyle(node).direction === "rtl";
      const forward = rtl ? "ArrowLeft" : "ArrowRight";
      const backward = rtl ? "ArrowRight" : "ArrowLeft";
      if (event.key !== forward && event.key !== backward) return;
      event.preventDefault();
      event.stopPropagation();
      const stepMs = (event.shiftKey ? 24 : 1) * 60 * 60_000 * (event.key === forward ? 1 : -1);
      propose({
        operationId: operation.id,
        start: new Date(placement.span.start.getTime() + stepMs),
      });
    });

    return node;
  }

  function loadStrip(axis: ScheduleAxis, buckets: ProductionLoadBucket[]): Array<Node> {
    const label = el(
      "div",
      "zen-sticky zen-z-40 zen-flex zen-shrink-0 zen-items-center zen-border-e zen-border-zen-border zen-bg-zen-muted zen-px-3 zen-text-xs zen-font-semibold zen-text-zen-muted-fg",
      "Load",
    );
    label.style.width = `${axis.paneWidth}px`;
    label.style.insetInlineStart = "0";
    label.style.height = `${FOOTER_PX}px`;

    const strip = el("div", "zen-flex");
    strip.style.width = `${axis.axisWidth}px`;
    strip.style.height = `${FOOTER_PX}px`;

    axis.columns.forEach((_column, i) => {
      const bucket = buckets[i];
      const utilisation = bucket?.utilisation ?? null;
      /* Null is not zero. A shut day has no utilisation to draw, and an empty
         bar there would say the plant was idle rather than closed. */
      const height = utilisation === null ? 0 : Math.min(1, utilisation);
      const over = utilisation === null ? 0 : Math.max(0, Math.min(1, utilisation - 1));
      const cell = el(
        "div",
        cn(
          "zen-relative zen-shrink-0 zen-border-e zen-border-zen-border last:zen-border-e-0",
          utilisation === null && "zen-bg-zen-muted",
        ),
      );
      cell.style.width = `${axis.columnWidths[i]}px`;
      cell.title =
        utilisation === null
          ? "Closed"
          : `${pct(utilisation)} of capacity${bucket?.overloaded ? " — over" : ""}`;

      /* Bars grow from the BOTTOM and are clipped at 100%, with the overflow
         drawn above the line — so 140% reads as "40% more than there is" rather
         than as a taller bar the eye has to compare against nothing. */
      const filled = el(
        "span",
        cn("zen-absolute zen-bottom-0 zen-start-0 zen-end-0", bucket?.overloaded ? "zen-bg-zen-error/70" : "zen-bg-zen-info/70"),
      );
      filled.setAttribute("aria-hidden", "true");
      filled.style.height = `${height * 100}%`;
      cell.append(filled);
      if (over > 0) {
        const spill = el("span", "zen-absolute zen-start-0 zen-end-0 zen-top-0 zen-bg-zen-error");
        spill.setAttribute("aria-hidden", "true");
        spill.style.height = `${Math.max(3, over * 100)}%`;
        cell.append(spill);
      }
      strip.append(cell);
    });

    return [label, strip];
  }

  function render(): void {
    for (const handle of owned) handle.destroy();
    owned = [];

    const now = nowOf();
    const spec = requestedPane().map((key) => ({ key, width: PANE_PX[key] }));
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
    const flat = flattenProductionResources<ProductionResource, ProductionOperation>(
      current.resources ?? [],
      current.operations ?? [],
      (resource) => (expandedSet === null ? true : expandedSet.has(resource.id)),
      {
        calendar: current.calendar,
        maxLanes: current.maxLanes ?? 3,
        minGapMs: axis.minGapMs,
        setupMatrix: current.setupMatrix,
      },
    );

    if (current.loading) {
      grid?.destroy();
      grid = null;
      root.className = cn(
        "zen-flex zen-w-full zen-flex-col zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border zen-p-3",
        current.class,
      );
      root.setAttribute("role", "status");
      root.setAttribute("aria-label", "Loading production schedule");
      root.replaceChildren();
      for (let i = 0; i < (current.loadingRows ?? 6); i++) {
        const line = el("div", "zen-flex zen-items-center zen-gap-3");
        const a = keep(Skeleton({ class: "zen-h-4" }));
        (a.el as HTMLElement).style.width = `${PANE_PX.resource - 24 - (i % 3) * INDENT_PX}px`;
        const b = keep(Skeleton({ class: "zen-h-4 zen-w-12" }));
        /* Two blocks per row, because a machine's day is a sequence — one long
           bar reads as the wrong component for a second. */
        const c = keep(Skeleton({ class: "zen-h-4" }));
        (c.el as HTMLElement).style.marginInlineStart = `${(i * 29) % 40}%`;
        (c.el as HTMLElement).style.width = `${12 + ((i * 7) % 18)}%`;
        const d = keep(Skeleton({ class: "zen-h-4" }));
        (d.el as HTMLElement).style.width = `${10 + ((i * 11) % 20)}%`;
        line.append(a.el, b.el, c.el, d.el);
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
              EmptyStateIcon({ children: Icon({ name: "cog", size: 22 }) }),
              EmptyStateTitle({ children: "No resources" }),
              EmptyStateDescription({
                children:
                  "Add a work centre and book an operation on it, and the schedule will appear here.",
              }),
            ],
          }),
        );
        root.append(empty.el);
      }
      return;
    }

    /* ONE height for the whole chart, from the busiest row. Rows that varied
       would break both the window (arithmetic, not measurement) and the
       connector routes (which place an endpoint from rowHeight). */
    const laneCount = Math.max(1, ...flat.rows.map((row) => row.lanes.length));
    const rowHeight = Math.max(
      ROW_PX,
      laneCount * LANE_BAR_PX + (laneCount - 1) * LANE_GAP_PX + LANE_PAD_PX,
    );
    const stackTop = (rowHeight - (laneCount * LANE_BAR_PX + (laneCount - 1) * LANE_GAP_PX)) / 2;
    const laneTop = (lane: number) => stackTop + lane * (LANE_BAR_PX + LANE_GAP_PX);

    const cpa = current.showCriticalPath
      ? productionCriticalPath(current.operations ?? [], current.dependencies ?? [], {
          calendar: current.calendar,
          setupMatrix: current.setupMatrix,
          until: current.until,
        })
      : null;

    /** The tightest float on each row — a row is only as movable as its worst job. */
    const rowFloat = new Map<number, ProductionFloat>();
    if (cpa) {
      for (const row of flat.rows) {
        let worst: ProductionFloat | undefined;
        for (const placement of row.subtree) {
          const value = cpa.byOperation.get(placement.operation.id);
          if (!value) continue;
          if (!worst || value.totalFloatMinutes < worst.totalFloatMinutes) worst = value;
        }
        if (worst) rowFloat.set(row.index, worst);
      }
    }

    /** Per row, over the visible range only — what the Load pane column shows. */
    const whole: PlanningColumn[] = [
      { start: axis.range.start, end: axis.range.end, label: "", sublabel: "", nonWorking: false, today: false },
    ];
    const rowLoad = new Map<number, ProductionLoadBucket>();
    for (const row of flat.rows) {
      rowLoad.set(
        row.index,
        productionLoad(row.subtree, whole, {
          calendar: row.resource.calendar ?? current.calendar,
          capacity: row.capacity,
        })[0],
      );
    }

    /* Load for the WHOLE chart — roots only, so nothing is counted twice. */
    const roots = flat.rows.filter((row) => row.parentId === null);
    const totalLoad =
      current.showLoad === false
        ? null
        : productionLoad(
            roots.flatMap((row) => row.subtree),
            axis.columns,
            {
              calendar: current.calendar,
              capacity: Math.max(1, roots.reduce((sum, row) => sum + row.capacity, 0)),
            },
          );

    let connectors = [] as ReturnType<typeof ganttConnectors>;
    let violated: Set<string> | null = null;
    if (current.showDependencies !== false && current.dependencies && current.dependencies.length > 0) {
      const anchors = new Map<string, GanttBarAnchor>();
      const byId = new Map<string, ProductionPlacement>();
      for (const row of flat.rows) {
        for (const lane of row.lanes) {
          for (const placement of lane) {
            byId.set(placement.operation.id, placement);
            const placed = placeAppointment(placement.span, axis.range);
            if (!placed) continue;
            const laneIndex = flat.operationIndex.get(placement.operation.id)?.lane ?? 0;
            anchors.set(placement.operation.id, {
              rowIndex: row.index,
              startPct: placed.startPct,
              widthPct: placed.widthPct,
              /* The LANE's centre, not the row's. An arrow pointed at the middle
                 of a three-lane row would miss every bar in it. */
              yOffset: laneTop(laneIndex) + LANE_BAR_PX / 2,
            });
          }
        }
      }
      /* Ids that name a RESOURCE rather than an operation are resolved too, so a
         link between two work centres still draws. */
      for (const [id, index] of flat.rowIndexById) {
        if (anchors.has(id)) continue;
        const first = flat.rows[index]?.lanes[0]?.[0];
        if (!first) continue;
        const placed = placeAppointment(first.span, axis.range);
        if (placed) {
          anchors.set(id, {
            rowIndex: index,
            startPct: placed.startPct,
            widthPct: placed.widthPct,
            yOffset: laneTop(0) + LANE_BAR_PX / 2,
          });
        }
      }
      connectors = ganttConnectors(anchors, current.dependencies, {
        axisWidth: axis.axisWidth,
        rowHeight,
      });
      const found = productionSequenceConflicts(current.dependencies, byId, {
        calendar: current.calendar,
      });
      violated = new Set(found.map((c) => `${c.operationIds[0]}->${c.operationIds[1]}`));
    }

    const msPerPx =
      axis.axisWidth > 0
        ? (axis.range.end.getTime() - axis.range.start.getTime()) / axis.axisWidth
        : 0;

    /* See the note in gantt.ts: a bare <div> in a flex row is content-sized, and
       the fit axis is sized from the container, so the two define each other. */
    root.className = "zen-w-full zen-min-w-0";
    root.removeAttribute("role");
    root.removeAttribute("aria-label");

    const paneColumns: ScheduleColumn<Row>[] = requestedPane().map((key) => ({
      key,
      label: PANE_LABEL[key],
      width: PANE_PX[key],
      colIndex: COL_INDEX[key],
      class: key === "resource" ? "zen-min-w-0 zen-gap-1 zen-pe-2" : "zen-px-2",
      style:
        key === "resource"
          ? (row: Row) => [["padding-inline-start", `${8 + row.depth * INDENT_PX}px`]] as Array<[string, string]>
          : undefined,
      render: (row: Row) => paneCell(key, row, rowLoad.get(row.index), rowFloat.get(row.index)),
    }));

    const options = {
      rows: flat.rows,
      rowId: (row: Row) => row.resource.id,
      columns: paneColumns,
      colCount: 6,
      timelineColIndex: COL_INDEX.timeline,
      rowHeight,
      renderTrack: (row: Row): Array<Node | AnyZenComponent> => {
        if (row.lanes.length === 0) {
          /* An expanded parent draws nothing because its children draw its work
             — which is a fact worth saying, not a blank cell. */
          return [
            el(
              "span",
              "zen-sr-only",
              row.hasChildren && row.expanded
                ? "Work shown on the rows below"
                : "Nothing booked in this range",
            ),
          ];
        }
        const out: Array<Node | AnyZenComponent> = [];
        row.lanes.forEach((lane, laneIndex) => {
          for (const placement of lane) {
            const node = bar(
              placement,
              row,
              axis,
              laneTop(laneIndex),
              cpa?.byOperation.get(placement.operation.id)?.critical ?? false,
              msPerPx,
            );
            if (node) out.push(node);
          }
        });
        return out;
      },
      renderFooter: totalLoad ? (a: ScheduleAxis) => loadStrip(a, totalLoad) : undefined,
      axis,
      view: viewOf(),
      anchor: dateOf(),
      now,
      connectors,
      connectorAccent: (connector: { from: string; to: string }) =>
        violated?.has(`${connector.from}->${connector.to}`) ?? false,
      views: current.views,
      hideToolbar: current.hideToolbar,
      onViewChange: setView,
      onDateChange: setDate,
      onToggle: (row: Row) => toggle(row.resource.id),
      onActivate: (row: Row) => {
        const first = row.lanes[0]?.[0];
        if (first) current.onOperationClick?.(first.operation, row);
      },
      onMetrics: () => render(),
      ariaLabel: "Production schedule",
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
