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
import { type GanttCalendar, type GanttDependency, type GanttSpan } from "./gantt";
import { type ProductionConflict, type ProductionOperationNode, type ProductionResourceNode, type ProductionSetupMatrix } from "./production";
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
export declare function productionReschedule<O extends ProductionOperationNode>(operations: O[], dependencies: GanttDependency[], move: ProductionMove, options?: ProductionRescheduleOptions): ProductionProposal;
