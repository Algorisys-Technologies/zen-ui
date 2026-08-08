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
import { type GanttCalendar, type GanttDependency } from "./gantt";
import { type ProductionOperationNode, type ProductionSetupMatrix } from "./production";
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
export declare function productionCriticalPath<O extends ProductionOperationNode>(operations: O[], dependencies: GanttDependency[], options?: ProductionCriticalPathOptions): ProductionCriticalPath;
