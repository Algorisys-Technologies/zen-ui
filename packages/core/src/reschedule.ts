/**
 * What moves when you move one thing — the cascade behind drag-to-reschedule.
 *
 * This is DECISION 2 from docs/production-scheduling-gap-analysis.md, settled:
 * `ProductionSchedule` becomes editable, and `Gantt` does not. The reasoning
 * there is that for a project Gantt the cascade policy, the undo story and the
 * permission model genuinely belong to the caller, while for production
 * scheduling interactive rescheduling *is* the job — a component that refuses
 * it is a report of a schedule someone else made.
 *
 * THREE THINGS THAT ARE NOT NEGOTIABLE, and are the whole shape of the module:
 *
 *  1. **It proposes; it never applies.** Nothing here mutates an operation. It
 *     returns what WOULD happen, and the caller hands back a new array or does
 *     not. That is what keeps undo the caller's — a history of arrays they
 *     already own — and it is why there is no internal "pending move" state to
 *     get out of sync. Optimistic internal mutation creates two sources of
 *     truth for the schedule, and every "the Gantt and the ERP disagree" bug
 *     for the rest of the component's life comes from there.
 *  2. **The cascade includes the operation the user dragged.** A caller that
 *     persists only the dragged one produces a schedule the user never saw.
 *     It is `cascade[0]`, and it is the same shape as everything it pushed.
 *  3. **Conflicts are computed and REPORTED, never enforced.** Overtime gets
 *     authorised, due dates get renegotiated, and a supervisor may knowingly
 *     double-book a cell that has two operators today. A module that refused
 *     those moves would be wrong in every plant whose rules differ from the
 *     ones we guessed, and wrong invisibly, because the schedule it drew would
 *     look fine.
 *
 * ONE CORRECTION TO THE SKETCH IN THE DESIGN DOC. It proposed
 * `onReschedule(proposal) => accepted | rejected`, with the rejection path
 * "for races". There is nothing for a rejection to undo: the component is
 * controlled and never moved anything, so `accepted: false` and never calling
 * back are the same thing to it. The result type is gone, and `canReschedule`
 * gating the affordance is what remains — a forbidden move is not offered
 * rather than refused after the work of dragging it.
 *
 * As everywhere else here, every duration is WORKING time. A cascade that
 * pushes a job four hours later on a single-shift plant pushes it to 06:00 the
 * next morning, not to 21:00 tonight.
 */

import {
  ganttAddWorkingMs,
  ganttSubWorkingMs,
  ganttWorkingMs,
  type GanttCalendar,
  type GanttDependency,
  type GanttDependencyType,
  type GanttSpan,
} from "./gantt";
import {
  productionConflicts,
  productionPlacement,
  productionSequenceConflicts,
  productionSetupPlan,
  flattenProductionResources,
  type ProductionConflict,
  type ProductionOperationNode,
  type ProductionPlacement,
  type ProductionResourceNode,
  type ProductionSetupMatrix,
} from "./production";

const MINUTE = 60_000;

/** What the user asked for: this operation, starting here. */
export interface ProductionMove {
  operationId: string;
  /** The new start of the BOOKING — where setup begins, not the run. */
  start: Date;
  /** A new resource, when the drag crossed rows. Omit to stay put. */
  resourceId?: string;
}

/** One operation's before and after. */
export interface ProductionShift {
  operationId: string;
  from: GanttSpan;
  to: GanttSpan;
  /**
   * `moved` is the one the user dragged; `pushed` is everything that had to
   * follow. Distinguished because a caller may well want to confirm the second
   * kind separately — "this also moves 6 other jobs" is the sentence a planner
   * needs before committing.
   */
  reason: "moved" | "pushed";
  /** Set only when the operation changed resource. */
  resourceId?: string;
}

export interface ProductionProposal {
  move: ProductionMove;
  /** Everything that moves, the dragged operation FIRST. Empty if nothing does. */
  cascade: ProductionShift[];
  /** What the proposed schedule violates. Reported; the caller decides. */
  conflicts: ProductionConflict[];
  /**
   * Operations sitting in a routing cycle, left exactly where they are.
   *
   * A cycle cannot be satisfied by pushing — every push makes the next link
   * worse — so the honest answer is to move nothing and say which operations
   * are involved. Silently iterating to a guard limit would produce a schedule
   * that is merely wrong more slowly.
   */
  cycles: string[];
}

export interface ProductionRescheduleOptions {
  calendar?: GanttCalendar;
  /** A resource's own calendar, when it has one. */
  calendarFor?: (resourceId: string) => GanttCalendar | undefined;
  /** Resources, so capacity conflicts can be computed on the proposed state. */
  resources?: ProductionResourceNode[];
  setupMatrix?: ProductionSetupMatrix;
}

/** Which end of each operation a link constrains. */
const ENDS: Record<GanttDependencyType, { from: "start" | "end"; to: "start" | "end" }> = {
  "finish-to-start": { from: "end", to: "start" },
  "start-to-start": { from: "start", to: "start" },
  "finish-to-finish": { from: "end", to: "end" },
  "start-to-finish": { from: "start", to: "end" },
};

/** `anchor` plus a lag, in working time. Negative is a lead and walks back. */
const offset = (anchor: Date, lagMinutes: number, calendar?: GanttCalendar): Date => {
  const ms = lagMinutes * MINUTE;
  if (ms === 0) return anchor;
  if (ms > 0) return calendar ? ganttAddWorkingMs(calendar, anchor, ms) : new Date(anchor.getTime() + ms);
  return calendar ? ganttSubWorkingMs(calendar, anchor, -ms) : new Date(anchor.getTime() + ms);
};

/**
 * Reposition a placement so its booking starts at `start`, preserving the
 * WORKING duration of the whole thing.
 *
 * Working, not elapsed: a four-hour job dragged from Tuesday morning to Friday
 * 16:00 is still four hours of work, which now finishes on Monday. Preserving
 * elapsed time instead would silently shorten every job dragged across a
 * weekend, and lengthen every one dragged off it.
 */
const repositioned = <O extends ProductionOperationNode>(
  operation: O,
  placement: ProductionPlacement<O>,
  start: Date,
  calendar: GanttCalendar | undefined,
  setupMinutes: number | undefined,
  /**
   * The calendar the operation is currently laid out against, when that differs
   * from where it is going.
   *
   * Measuring the work with the TARGET's calendar is wrong and looks right: a
   * four-hour job on a single-shift plant occupies 16:00 Monday to 09:00
   * Tuesday, and asking a continuous furnace how much work that envelope holds
   * answers seventeen hours. The job would arrive on the furnace four times
   * longer than it is. Measure on the source, replay on the target — work
   * content is a property of the job, not of the machine.
   */
  sourceCalendar: GanttCalendar | undefined = calendar,
): ProductionPlacement<O> | null => {
  const workingMs = sourceCalendar
    ? ganttWorkingMs(sourceCalendar, placement.span.start, placement.span.end)
    : placement.span.end.getTime() - placement.span.start.getTime();
  const setupMs = Math.max(0, (operation.setupMinutes ?? setupMinutes ?? 0) * MINUTE);
  /* The run is what is left after the changeover, and it is what `runMinutes`
     would have said. Rebuilding through `productionPlacement` rather than
     shifting the dates keeps one code path for "where does a booking sit". */
  const runMinutes = Math.max(0, (workingMs - setupMs) / MINUTE);
  return productionPlacement(
    { ...operation, start, end: undefined, runMinutes } as O,
    calendar,
    { setupMinutes },
  );
};

/**
 * What would move, if this move were made.
 *
 * A single FORWARD pass in topological order, pushing later and never earlier.
 * Pulling a successor forward would move work the planner did not ask about,
 * into a slot they have not looked at — the cascade's job is to keep the
 * routing satisfiable, not to optimise the schedule.
 *
 * CHANGEOVERS ARE HELD AT THEIR CURRENT VALUES through the cascade, and that is
 * a deliberate limit rather than an oversight. A changeover depends on the
 * order of jobs on a machine, the cascade is what changes that order, and
 * re-deriving inside it does not converge in one pass. The consequence is
 * bounded and worth stating: the PREVIEW may be a few minutes out where a move
 * reorders a machine, and the accepted result is exact, because the caller
 * hands back operations and everything is re-derived from scratch.
 */
export function productionReschedule<O extends ProductionOperationNode>(
  operations: O[],
  dependencies: GanttDependency[],
  move: ProductionMove,
  options: ProductionRescheduleOptions = {},
): ProductionProposal {
  const { calendar, calendarFor, resources, setupMatrix } = options;
  const calendarOf = (resourceId: string) => calendarFor?.(resourceId) ?? calendar;

  const setups = setupMatrix ? productionSetupPlan(operations, setupMatrix) : null;
  const byId = new Map<string, O>(operations.map((o) => [o.id, o]));

  /** Current placement per operation, then mutated in place as the pass runs. */
  const placed = new Map<string, ProductionPlacement<O>>();
  const before = new Map<string, GanttSpan>();
  const resourceOf = new Map<string, string>();
  for (const operation of operations) {
    const placement = productionPlacement(operation, calendarOf(operation.resourceId), {
      setupMinutes: setups?.get(operation.id),
    });
    if (!placement) continue;
    placed.set(operation.id, placement);
    before.set(operation.id, placement.span);
    resourceOf.set(operation.id, operation.resourceId);
  }

  const empty: ProductionProposal = { move, cascade: [], conflicts: [], cycles: [] };
  const dragged = byId.get(move.operationId);
  if (!dragged || !placed.has(move.operationId)) return empty;

  /* The move itself. A resource change takes the NEW resource's calendar with
     it — dragging a job from a two-shift cell onto a continuous furnace makes
     it finish earlier, and pretending otherwise would be the whole
     working-time argument abandoned at the last step. */
  const targetResource = move.resourceId ?? dragged.resourceId;
  resourceOf.set(move.operationId, targetResource);
  const movedPlacement = repositioned(
    { ...dragged, resourceId: targetResource },
    placed.get(move.operationId)!,
    move.start,
    calendarOf(targetResource),
    setups?.get(move.operationId),
    calendarOf(dragged.resourceId),
  );
  if (!movedPlacement) return empty;
  placed.set(move.operationId, movedPlacement);

  /* ---- topological order, and the cycles that have none ---- */
  const links = dependencies.filter(
    (d) => d.from !== d.to && placed.has(d.from) && placed.has(d.to),
  );
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
  /* Anything Kahn's algorithm could not reach is in a cycle. Reported and left
     alone: pushing round a cycle makes the next link worse forever. */
  const ordered = new Set(order);
  const cycles = [...placed.keys()].filter((id) => !ordered.has(id)).sort();

  /* ---- the forward pass ---- */
  const incoming = new Map<string, GanttDependency[]>();
  for (const link of links) {
    if (!ordered.has(link.from) || !ordered.has(link.to)) continue;
    const list = incoming.get(link.to);
    if (list) list.push(link);
    else incoming.set(link.to, [link]);
  }

  for (const id of order) {
    if (id === move.operationId) continue;
    const constraints = incoming.get(id);
    if (!constraints || constraints.length === 0) continue;

    const current = placed.get(id)!;
    const operation = byId.get(id)!;
    const cal = calendarOf(resourceOf.get(id) ?? operation.resourceId);

    let requiredStart = current.span.start;
    for (const link of constraints) {
      const predecessor = placed.get(link.from)!;
      const ends = ENDS[link.type ?? "finish-to-start"];
      const anchor = ends.from === "end" ? predecessor.span.end : predecessor.span.start;
      const earliest = offset(anchor, link.lagMinutes ?? 0, cal);
      const own = ends.to === "end" ? current.span.end : current.span.start;
      if (earliest.getTime() <= own.getTime()) continue;
      /* The link constrains one END of this operation, and the operation moves
         as a whole — so the start shifts by however much that end is short. */
      const deficitMs = cal
        ? ganttWorkingMs(cal, own, earliest)
        : earliest.getTime() - own.getTime();
      const candidate = cal
        ? ganttAddWorkingMs(cal, current.span.start, deficitMs)
        : new Date(current.span.start.getTime() + deficitMs);
      if (candidate.getTime() > requiredStart.getTime()) requiredStart = candidate;
    }

    if (requiredStart.getTime() <= current.span.start.getTime()) continue;
    const next = repositioned(operation, current, requiredStart, cal, setups?.get(id));
    if (next) placed.set(id, next);
  }

  /* ---- what changed, dragged operation first ---- */
  const cascade: ProductionShift[] = [];
  const moveShift = (id: string, reason: "moved" | "pushed") => {
    const from = before.get(id);
    const to = placed.get(id)?.span;
    if (!from || !to) return;
    if (from.start.getTime() === to.start.getTime() && from.end.getTime() === to.end.getTime()) {
      if (reason === "moved" && resourceOf.get(id) === byId.get(id)?.resourceId) return;
    }
    cascade.push({
      operationId: id,
      from,
      to,
      reason,
      ...(resourceOf.get(id) !== byId.get(id)?.resourceId ? { resourceId: resourceOf.get(id) } : null),
    });
  };
  moveShift(move.operationId, "moved");
  for (const id of order) {
    if (id === move.operationId) continue;
    const from = before.get(id);
    const to = placed.get(id)?.span;
    if (!from || !to) continue;
    if (from.start.getTime() !== to.start.getTime() || from.end.getTime() !== to.end.getTime()) {
      moveShift(id, "pushed");
    }
  }

  /* ---- what the proposed schedule violates ---- */
  const proposed = operations.map((operation) => {
    const placement = placed.get(operation.id);
    if (!placement) return operation;
    return {
      ...operation,
      resourceId: resourceOf.get(operation.id) ?? operation.resourceId,
      start: placement.span.start,
      end: placement.span.end,
      runMinutes: undefined,
      setupMinutes: operation.setupMinutes,
    } as O;
  });

  const conflicts: ProductionConflict[] = [];
  if (resources && resources.length > 0) {
    const flat = flattenProductionResources(resources, proposed, () => true, { calendar });
    conflicts.push(...productionConflicts(flat.rows, proposed, { calendar }));
  }
  const placementsById = new Map<string, ProductionPlacement>();
  for (const [id, placement] of placed) placementsById.set(id, placement as ProductionPlacement);
  conflicts.push(...productionSequenceConflicts(dependencies, placementsById, { calendar }));

  return { move, cascade, conflicts, cycles };
}
