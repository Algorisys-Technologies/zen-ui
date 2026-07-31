/**
 * Layout maths for a project schedule — the arithmetic behind Gantt, with no
 * DOM and no framework in it.
 *
 * A Gantt is a PlanningCalendar whose rows nest and whose blocks know about
 * each other. The time axis is therefore NOT re-derived here: ranges, columns,
 * bar placement and the now line all come from ./planning, which four renderers
 * already agree on. What this module adds is the four things a schedule has
 * that a calendar does not:
 *
 *  1. a hierarchy that collapses, so the visible rows are a projection of the
 *     tree rather than the tree itself;
 *  2. summary bars — a parent with no dates of its own spans its children, and
 *     its percent-complete is their duration-weighted average;
 *  3. slip against a baseline, in whole calendar days;
 *  4. dependency connectors, as orthogonal routes between two bars.
 *
 * All four fail silently when wrong. A collapsed subtree that drops its
 * dependency arrows looks like a project with no dependencies. A parent bar
 * rolled up from the wrong children is a plausible date. A connector routed
 * through a bar is just an ugly line. Nothing throws, so scripts/check-gantt.ts
 * is where they are pinned.
 *
 * TIME ZONES: as in ./planning, everything is computed from the caller's local
 * `Date` objects, deliberately unconverted.
 */

import type { PlanningPlacement } from "./planning";

export type GanttTaskStatus = "not-started" | "on-track" | "delayed" | "complete";

/**
 * Which end of each bar a link joins.
 *
 * All four exist because they are the same two-line anchor choice, and adding
 * one later would be a change to a shipped `dependencies` array. Finish-to-start
 * is the default and by far the common one: B cannot begin until A is done.
 */
export type GanttDependencyType =
  | "finish-to-start"
  | "start-to-start"
  | "finish-to-finish"
  | "start-to-finish";

export interface GanttDependency {
  /** Id of the task that comes first. */
  from: string;
  /** Id of the task that waits. */
  to: string;
  /** Default "finish-to-start". */
  type?: GanttDependencyType;
}

/**
 * The minimum a task must have for the maths to work. A binding's own task type
 * adds the display fields (name, assignees) and extends this.
 */
export interface GanttTaskNode {
  id: string;
  /** Omit both dates on a summary row to have them rolled up from the children. */
  start?: Date;
  end?: Date;
  /** 0–100. Omit on a parent to have it averaged from the children. */
  percentComplete?: number;
  /** What the plan originally promised. Slip is measured against this. */
  baselineEnd?: Date;
  /** Overrides the derived status. */
  status?: GanttTaskStatus;
  children?: GanttTaskNode[];
}

export interface GanttSpan {
  start: Date;
  /** Inclusive of the last instant of work; half-open against the axis, as in ./planning. */
  end: Date;
}

/** One visible line of the chart: a task, plus everything derived about it. */
export interface GanttRow<T extends GanttTaskNode = GanttTaskNode> {
  task: T;
  /** 0 for a root. Drives the indent, not the layout. */
  depth: number;
  /** Position in the visible list. This is the row's y coordinate. */
  index: number;
  parentId: string | null;
  hasChildren: boolean;
  expanded: boolean;
  /** Its own dates, or the union of its descendants'. Null when nothing has dates. */
  span: GanttSpan | null;
  /** Its own percentComplete, or the descendants' weighted average. Null when unknown. */
  progress: number | null;
  status: GanttTaskStatus;
  /** Whole calendar days late (positive) or early (negative). Null with no baseline. */
  variance: number | null;
}

export interface GanttFlatten<T extends GanttTaskNode = GanttTaskNode> {
  rows: GanttRow<T>[];
  /**
   * EVERY task id, visible or not, mapped to the row that represents it.
   *
   * A task inside a collapsed parent has no row of its own, so it maps to the
   * nearest ancestor that does. That is what lets a dependency touching a hidden
   * task still be drawn — against the summary bar it collapsed into — instead of
   * disappearing and making the project look dependency-free.
   */
  rowIndexById: Map<string, number>;
}

const MS_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const clampPct = (n: number): number => Math.min(100, Math.max(0, n));

/**
 * A task's own span, or the union of its descendants'.
 *
 * BOTH dates are required for the explicit case. A task carrying only a start is
 * not a one-instant task, it is half-entered data, and drawing it as a milestone
 * would invent an end date the caller never gave.
 */
export function ganttSpan(task: GanttTaskNode): GanttSpan | null {
  if (task.start && task.end) {
    const a = task.start.getTime();
    const b = task.end.getTime();
    // Inverted, as in placeAppointment: normalised to its bounds rather than
    // swapped-and-believed.
    return { start: new Date(Math.min(a, b)), end: new Date(Math.max(a, b)) };
  }

  let from = Number.POSITIVE_INFINITY;
  let to = Number.NEGATIVE_INFINITY;
  for (const child of task.children ?? []) {
    const span = ganttSpan(child);
    if (!span) continue;
    from = Math.min(from, span.start.getTime());
    to = Math.max(to, span.end.getTime());
  }
  if (from === Number.POSITIVE_INFINITY) return null;
  return { start: new Date(from), end: new Date(to) };
}

/**
 * Percent complete, rolled up when the task does not state its own.
 *
 * Weighted by duration, because an unweighted mean lets a one-day task cancel
 * out a six-month one. A descendant that states no progress counts as 0 — it has
 * reported nothing done — but a subtree where NOBODY states progress returns
 * null rather than 0, which is the difference between "not started" and "we do
 * not track this".
 *
 * When every descendant is a milestone the weights are all zero, so it falls
 * back to a plain mean rather than dividing by nothing.
 */
export function ganttProgress(task: GanttTaskNode): number | null {
  if (typeof task.percentComplete === "number") return clampPct(task.percentComplete);

  let weighted = 0;
  let weight = 0;
  let plain = 0;
  let count = 0;
  let anyStated = false;

  const walk = (node: GanttTaskNode): void => {
    const children = node.children ?? [];
    if (children.length === 0) {
      const span = ganttSpan(node);
      const pct = typeof node.percentComplete === "number" ? clampPct(node.percentComplete) : 0;
      if (typeof node.percentComplete === "number") anyStated = true;
      const ms = span ? span.end.getTime() - span.start.getTime() : 0;
      weighted += pct * ms;
      weight += ms;
      plain += pct;
      count += 1;
      return;
    }
    // A parent that states its own progress is believed, and its subtree is not
    // re-derived: the caller has already answered the question for that branch.
    if (typeof node.percentComplete === "number") {
      anyStated = true;
      const span = ganttSpan(node);
      const pct = clampPct(node.percentComplete);
      const ms = span ? span.end.getTime() - span.start.getTime() : 0;
      weighted += pct * ms;
      weight += ms;
      plain += pct;
      count += 1;
      return;
    }
    for (const child of children) walk(child);
  };

  for (const child of task.children ?? []) walk(child);

  if (!anyStated || count === 0) return null;
  return weight > 0 ? weighted / weight : plain / count;
}

/**
 * Slip in whole calendar days: positive is late, negative is early.
 *
 * Days rather than milliseconds, and calendar days rather than 24-hour blocks —
 * "finishing on the 3rd instead of the 1st" is two days late whether the work
 * stops at 09:00 or at 18:00, and a DST boundary must not turn it into 1.96.
 */
export function ganttVarianceDays(end: Date, baselineEnd: Date): number {
  return Math.round((startOfDay(end).getTime() - startOfDay(baselineEnd).getTime()) / MS_DAY);
}

/** "On time", "+452d", "-3d" — the chip next to a row. Null passes through. */
export function formatGanttVariance(days: number | null): string | null {
  if (days === null) return null;
  if (days === 0) return "On time";
  return days > 0 ? `+${days}d` : `${days}d`;
}

/**
 * The status a bar is coloured by, when the task does not state one.
 *
 * Order matters and is the whole content of this function. Finished beats late:
 * a task delivered two weeks after its baseline is COMPLETE, not delayed — the
 * slip is already said by the variance chip, and colouring it red would leave a
 * project that shipped looking like a project on fire. Late beats not-started,
 * because a task that is 0% done and a week past due is the most urgent row on
 * the chart and "not started" is the one reading that hides it.
 *
 * A task with no baseline is still late if its end has passed and it is not
 * finished. Requiring a baseline would mean most projects never show a slip.
 */
export function ganttTaskStatus(
  task: GanttTaskNode,
  span: GanttSpan | null,
  progress: number | null,
  now: Date = new Date(),
): GanttTaskStatus {
  if (task.status) return task.status;
  if (progress !== null && progress >= 100) return "complete";

  const overBaseline =
    task.baselineEnd && span ? ganttVarianceDays(span.end, task.baselineEnd) > 0 : false;
  const overdue = span ? span.end.getTime() < now.getTime() : false;
  if (overBaseline || overdue) return "delayed";

  if (progress === null || progress <= 0) return "not-started";
  return "on-track";
}

/**
 * The tree, projected onto the rows that are actually on screen.
 *
 * `isExpanded` is asked rather than a Set being passed in, so the caller can
 * default to open, closed, or open-to-depth-2 without this module having an
 * opinion. A leaf is never asked.
 */
export function flattenGanttTasks<T extends GanttTaskNode>(
  tasks: T[],
  isExpanded: (task: T) => boolean,
  now: Date = new Date(),
): GanttFlatten<T> {
  const rows: GanttRow<T>[] = [];
  const rowIndexById = new Map<string, number>();

  /** Every id under `task`, so a collapsed subtree can point at its summary row. */
  const claim = (task: GanttTaskNode, index: number): void => {
    rowIndexById.set(task.id, index);
    for (const child of task.children ?? []) claim(child, index);
  };

  const walk = (task: T, depth: number, parentId: string | null): void => {
    /* The node type is structural: a caller's richer task declares
       `children?: MyTask[]`, which is assignable to GanttTaskNode[] but does not
       infer back through the generic. The cast restores what the caller knows. */
    const children = (task.children ?? []) as T[];
    const hasChildren = children.length > 0;
    const expanded = hasChildren ? isExpanded(task) : false;
    const span = ganttSpan(task);
    const progress = ganttProgress(task);
    const index = rows.length;

    rows.push({
      task,
      depth,
      index,
      parentId,
      hasChildren,
      expanded,
      span,
      progress,
      status: ganttTaskStatus(task, span, progress, now),
      variance: task.baselineEnd && span ? ganttVarianceDays(span.end, task.baselineEnd) : null,
    });
    rowIndexById.set(task.id, index);

    if (!hasChildren) return;
    if (expanded) {
      for (const child of children) walk(child, depth + 1, task.id);
    } else {
      for (const child of children) claim(child, index);
    }
  };

  for (const task of tasks) walk(task, 0, null);
  return { rows, rowIndexById };
}

/** Where a bar sits: its row, and its placement on the shared axis. */
export interface GanttBarAnchor {
  rowIndex: number;
  /** 0–100 from the range start, as PlanningPlacement reports it. */
  startPct: number;
  widthPct: number;
}

export interface GanttConnectorOptions {
  /** Pixel width of the whole time axis — columns × column width. */
  axisWidth: number;
  /** Pixel height of one row. Rows are uniform; the routes assume it. */
  rowHeight: number;
  /** How far a link runs straight out of a bar before it turns. Default 12. */
  stub?: number;
}

export interface GanttConnector {
  /** Stable across renders: the dependency it came from, not the rows it hit. */
  id: string;
  from: string;
  to: string;
  type: GanttDependencyType;
  /** SVG path data, in the axis's own pixel space. */
  d: string;
  /** The arrowhead's tip, and which way it points: 1 = rightwards, -1 = leftwards. */
  arrow: { x: number; y: number; dir: 1 | -1 };
}

/** Which end of each bar a type joins, and which way the line leaves and arrives. */
const ENDS: Record<GanttDependencyType, { fromEnd: boolean; toEnd: boolean }> = {
  "finish-to-start": { fromEnd: true, toEnd: false },
  "start-to-start": { fromEnd: false, toEnd: false },
  "finish-to-finish": { fromEnd: true, toEnd: true },
  "start-to-finish": { fromEnd: false, toEnd: true },
};

const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Orthogonal routes between dependent bars.
 *
 * `anchors` must carry an entry for every task id a dependency names, including
 * ids hidden inside a collapsed parent — `flattenGanttTasks`'s `rowIndexById` is
 * what resolves those to the summary row they folded into. A dependency naming a
 * task with no bar at all (no dates, or entirely outside the visible range) is
 * dropped: there is nothing to point at, and a line to the edge of the chart
 * reads as a task that starts off-screen.
 *
 * Two links that resolve to the same pair of rows collapse to one. Collapsing a
 * parent otherwise stacks a dozen identical arrows between the same two summary
 * bars.
 *
 * The route is three segments when the target is far enough downstream to reach
 * directly, and five when it is not — a finish-to-start link to a task that
 * begins BEFORE its predecessor ends has to double back, and a straight line
 * through the intervening bars would be unreadable. The turn happens in the
 * gutter between the two rows.
 */
export function ganttConnectors(
  anchors: Map<string, GanttBarAnchor>,
  dependencies: GanttDependency[],
  options: GanttConnectorOptions,
): GanttConnector[] {
  const { axisWidth, rowHeight } = options;
  const stub = options.stub ?? 12;
  const out: GanttConnector[] = [];
  const seen = new Set<string>();

  for (const dependency of dependencies) {
    const type = dependency.type ?? "finish-to-start";
    if (dependency.from === dependency.to) continue;

    const a = anchors.get(dependency.from);
    const b = anchors.get(dependency.to);
    if (!a || !b) continue;
    // Both ends folded into the same summary bar: a link from a task to itself.
    if (a.rowIndex === b.rowIndex) continue;

    const key = `${a.rowIndex}:${b.rowIndex}:${type}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const { fromEnd, toEnd } = ENDS[type];
    const px = (pct: number) => (pct / 100) * axisWidth;
    const x1 = px(fromEnd ? a.startPct + a.widthPct : a.startPct);
    const x2 = px(toEnd ? b.startPct + b.widthPct : b.startPct);
    const y1 = a.rowIndex * rowHeight + rowHeight / 2;
    const y2 = b.rowIndex * rowHeight + rowHeight / 2;

    // Leaving a bar's finish runs right; leaving its start runs left. Arriving at
    // a start comes in from the left, so the head points right, and vice versa.
    const s = fromEnd ? 1 : -1;
    const dir: 1 | -1 = toEnd ? -1 : 1;

    const bx = x1 + s * stub;
    const ax = x2 - dir * stub;

    const points: Array<[number, number]> =
      s === dir && dir * (ax - bx) >= 0
        ? [
            [x1, y1],
            [ax, y1],
            [ax, y2],
            [x2, y2],
          ]
        : (() => {
            const my = (y1 + y2) / 2;
            return [
              [x1, y1],
              [bx, y1],
              [bx, my],
              [ax, my],
              [ax, y2],
              [x2, y2],
            ] as Array<[number, number]>;
          })();

    const d = points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${r2(x)} ${r2(y)}`)
      .join(" ");

    out.push({
      id: `${dependency.from}->${dependency.to}:${type}`,
      from: dependency.from,
      to: dependency.to,
      type,
      d,
      arrow: { x: r2(x2), y: r2(y2), dir },
    });
  }

  return out;
}

/** Turn a placement into an anchor. Sugar over ./planning's `placeAppointment`. */
export function ganttAnchor(rowIndex: number, placement: PlanningPlacement): GanttBarAnchor {
  return { rowIndex, startPct: placement.startPct, widthPct: placement.widthPct };
}
