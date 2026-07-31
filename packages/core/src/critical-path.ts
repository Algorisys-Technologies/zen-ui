/**
 * Float, and the chain that has none — the rest of tier (c).
 *
 * "How much can I move this before it hurts?" is the question a planner asks
 * before every drag, and until it has an answer the reschedule cascade can only
 * tell them afterwards. Float is that answer, and the critical path is the set
 * of operations whose answer is *none*.
 *
 * MEASURED AGAINST THE SCHEDULE AS IT STANDS, not against a forward pass from
 * zero, and the difference matters. Classic CPM ignores where the jobs actually
 * are and computes where they COULD be — useful when you are building a plan
 * from durations and nothing else. Here the operations already have positions
 * somebody chose, and the useful question is how much slack those positions
 * leave. A job sitting two days after its predecessor has two days of float,
 * and a forward pass from zero would have reported none because it would have
 * moved the job.
 *
 * Two kinds of float, and conflating them is the classic error:
 *
 *  - **Free float** — how far this operation can slip before it delays an
 *    IMMEDIATE successor. Spending it is invisible to everything downstream.
 *  - **Total float** — how far before it delays the END. Spending total float
 *    that is not free float pushes other work, which is exactly what the
 *    reschedule cascade would then do.
 *
 * A planner who reads total float as though it were free will move a job into
 * its successor and be surprised by the cascade. Both are reported, always,
 * with `freeFloatMinutes <= totalFloatMinutes` as an invariant.
 *
 * Everything is WORKING minutes. Two hours of float on a single-shift plant at
 * 16:00 reaches 07:00 the next morning, not 18:00 tonight.
 */

import {
  ganttAddWorkingMs,
  ganttSubWorkingMs,
  ganttWorkingMs,
  type GanttCalendar,
  type GanttDependency,
  type GanttDependencyType,
} from "./gantt";
import {
  productionPlacement,
  productionSetupPlan,
  type ProductionOperationNode,
  type ProductionPlacement,
  type ProductionSetupMatrix,
} from "./production";

const MINUTE = 60_000;

export interface ProductionFloat {
  operationId: string;
  /** Working minutes it can slip before delaying an immediate successor. */
  freeFloatMinutes: number;
  /** …before delaying the project end. Never less than the free float. */
  totalFloatMinutes: number;
  /**
   * Zero total float — it is on the critical path.
   *
   * Negative float means the schedule is ALREADY past the end it is measured
   * against, and that counts as critical too: a job that cannot be moved
   * without making things worse is exactly what the flag is for.
   */
  critical: boolean;
  /** The latest it may finish without pushing the end out. */
  latestFinish: Date;
}

export interface ProductionCriticalPath {
  byOperation: Map<string, ProductionFloat>;
  /** Ids with no total float, earliest first. */
  critical: string[];
  /** The end the backward pass measured against. */
  projectEnd: Date;
  /**
   * Operations in a routing cycle. No float exists for them — a cycle has no
   * "latest" — so they are named and left out rather than given a number that
   * happens not to crash.
   */
  cycles: string[];
}

export interface ProductionCriticalPathOptions {
  calendar?: GanttCalendar;
  calendarFor?: (resourceId: string) => GanttCalendar | undefined;
  setupMatrix?: ProductionSetupMatrix;
  /**
   * The date everything is measured against — an order's due date, a shipping
   * window. Defaults to the latest finish in the schedule, which makes the
   * longest chain critical and everything else's float relative to it.
   *
   * Passing a real due date is the more useful reading and changes the answer:
   * against a due date, EVERY operation can have negative float, and that is
   * the plant being late rather than a bug.
   */
  until?: Date;
}

/** Which end of each operation a link constrains. */
const ENDS: Record<GanttDependencyType, { from: "start" | "end"; to: "start" | "end" }> = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" },
};

/**
 * Working minutes from `a` to `b`, negative when `b` is earlier.
 *
 * The sign is the whole point: `ganttWorkingMs` is half-open and returns 0 for
 * an inverted span, so using it directly would report a job that is already
 * late as having exactly no float — indistinguishable from one that is
 * perfectly critical, when the two want different colours and different
 * conversations.
 */
const signedMinutes = (from: Date, to: Date, calendar?: GanttCalendar): number => {
  const ms = calendar
    ? to.getTime() >= from.getTime()
      ? ganttWorkingMs(calendar, from, to)
      : -ganttWorkingMs(calendar, to, from)
    : to.getTime() - from.getTime();
  return ms / MINUTE;
};

/** `at` moved by a working duration. Negative goes backwards. */
const shift = (at: Date, minutes: number, calendar?: GanttCalendar): Date => {
  const ms = minutes * MINUTE;
  if (ms === 0) return at;
  if (!calendar) return new Date(at.getTime() + ms);
  return ms > 0 ? ganttAddWorkingMs(calendar, at, ms) : ganttSubWorkingMs(calendar, at, -ms);
};

/** …and the same thing read the other way, which is how a backward pass talks. */
const back = (at: Date, minutes: number, calendar?: GanttCalendar): Date =>
  shift(at, -minutes, calendar);

export function productionCriticalPath<O extends ProductionOperationNode>(
  operations: O[],
  dependencies: GanttDependency[],
  options: ProductionCriticalPathOptions = {},
): ProductionCriticalPath {
  const { calendar, calendarFor, setupMatrix, until } = options;
  const calendarOf = (resourceId: string) => calendarFor?.(resourceId) ?? calendar;

  const setups = setupMatrix ? productionSetupPlan(operations, setupMatrix) : null;
  const placed = new Map<string, ProductionPlacement<O>>();
  const resourceOf = new Map<string, string>();
  for (const operation of operations) {
    const placement = productionPlacement(operation, calendarOf(operation.resourceId), {
      setupMinutes: setups?.get(operation.id),
    });
    if (!placement) continue;
    placed.set(operation.id, placement);
    resourceOf.set(operation.id, operation.resourceId);
  }

  const empty: ProductionCriticalPath = {
    byOperation: new Map(),
    critical: [],
    projectEnd: until ?? new Date(0),
    cycles: [],
  };
  if (placed.size === 0) return empty;

  const projectEnd =
    until ??
    new Date(Math.max(...[...placed.values()].map((p) => p.span.end.getTime())));

  /* ---- graph, and the cycles that have no "latest" ---- */
  const links = dependencies.filter((d) => d.from !== d.to && placed.has(d.from) && placed.has(d.to));
  const indegree = new Map<string, number>();
  const outgoing = new Map<string, GanttDependency[]>();
  for (const id of placed.keys()) indegree.set(id, 0);
  for (const link of links) {
    indegree.set(link.to, (indegree.get(link.to) ?? 0) + 1);
    const list = outgoing.get(link.from);
    if (list) list.push(link);
    else outgoing.set(link.from, [link]);
  }
  const queue = [...indegree.entries()].filter(([, n]) => n === 0).map(([id]) => id);
  const order: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    order.push(id);
    for (const link of outgoing.get(id) ?? []) {
      const next = (indegree.get(link.to) ?? 0) - 1;
      indegree.set(link.to, next);
      if (next === 0) queue.push(link.to);
    }
  }
  const ordered = new Set(order);
  const cycles = [...placed.keys()].filter((id) => !ordered.has(id)).sort();

  /* ---- backward pass: the latest each operation may finish ---- */
  const latestFinish = new Map<string, Date>();
  for (let i = order.length - 1; i >= 0; i--) {
    const id = order[i];
    const placement = placed.get(id)!;
    const cal = calendarOf(resourceOf.get(id)!);
    const duration = signedMinutes(placement.span.start, placement.span.end, cal);

    let latest = projectEnd;
    for (const link of outgoing.get(id) ?? []) {
      if (!ordered.has(link.to)) continue;
      const successor = placed.get(link.to)!;
      const successorLatestFinish = latestFinish.get(link.to) ?? projectEnd;
      const successorDuration = signedMinutes(successor.span.start, successor.span.end, cal);
      const ends = ENDS[link.type ?? "finish-to-start"];

      /* The successor's latest ANCHOR, then the lag removed, then converted
         back to a finish for THIS operation. Doing it in one step per link
         rather than assuming finish-to-start is what keeps a start-to-start
         chain from reporting float it does not have. */
      const successorLatestAnchor =
        ends.to === "end"
          ? successorLatestFinish
          : back(successorLatestFinish, successorDuration, cal);
      const ownLatestAnchor = back(successorLatestAnchor, link.lagMinutes ?? 0, cal);
      const ownLatestFinish =
        ends.from === "end" ? ownLatestAnchor : shift(ownLatestAnchor, duration, cal);

      if (ownLatestFinish.getTime() < latest.getTime()) latest = ownLatestFinish;
    }
    latestFinish.set(id, latest);
  }

  /* ---- float ---- */
  const byOperation = new Map<string, ProductionFloat>();
  for (const id of order) {
    const placement = placed.get(id)!;
    const cal = calendarOf(resourceOf.get(id)!);
    const latest = latestFinish.get(id)!;
    const total = signedMinutes(placement.span.end, latest, cal);

    /* Free float is measured against where the successors ACTUALLY are, not
       against where they could be pushed to — that is the whole distinction.
       With no successors there is nothing to be free of, so it equals total. */
    let free = total;
    const successors = (outgoing.get(id) ?? []).filter((l) => ordered.has(l.to));
    if (successors.length > 0) {
      free = Number.POSITIVE_INFINITY;
      for (const link of successors) {
        const successor = placed.get(link.to)!;
        const ends = ENDS[link.type ?? "finish-to-start"];
        const successorAnchor = ends.to === "end" ? successor.span.end : successor.span.start;
        const allowed = back(successorAnchor, link.lagMinutes ?? 0, cal);
        const ownAnchor = ends.from === "end" ? placement.span.end : placement.span.start;
        free = Math.min(free, signedMinutes(ownAnchor, allowed, cal));
      }
      // Free float can never exceed total float: slipping past the end is not
      // made acceptable by a successor happening to sit further out.
      free = Math.min(free, total);
    }

    byOperation.set(id, {
      operationId: id,
      freeFloatMinutes: Math.round(free),
      totalFloatMinutes: Math.round(total),
      critical: Math.round(total) <= 0,
      latestFinish: latest,
    });
  }

  const critical = order
    .filter((id) => byOperation.get(id)?.critical)
    .sort((a, b) => placed.get(a)!.span.start.getTime() - placed.get(b)!.span.start.getTime());

  return { byOperation, critical, projectEnd, cycles };
}
