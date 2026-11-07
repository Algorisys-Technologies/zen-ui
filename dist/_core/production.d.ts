/**
 * Layout maths for a production schedule — rows that are MACHINES rather than
 * tasks, and the arithmetic of whether they can do the work booked on them.
 *
 * This is tier (b) of docs/production-scheduling-gap-analysis.md, and it sits
 * on ./gantt rather than beside it: the axis, the connectors, the row window
 * and — critically — the working-time model are all shared, because every
 * number here is a working-time quantity. "Is this work centre overloaded?" is
 * *hours booked ÷ hours available*, and both come from `ganttWorkingMs`. That
 * dependency is the whole reason the tiers are in the order they are.
 *
 * Four things a production schedule has that a project one does not:
 *
 *  1. **Many operations per row.** A task owns its row; a machine's day is a
 *     sequence of jobs. They are packed into LANES so a double-booking is
 *     visible as two bars side by side rather than one drawn over the other.
 *  2. **Setup.** A changeover consumes the machine and produces nothing. It is
 *     part of the booking, drawn as a distinct leading stretch, and counted in
 *     the load — a plant that ignores setup reports itself 15% less busy than
 *     it is.
 *  3. **Finite capacity.** A resource runs `capacity` operations at once (two
 *     operators on one cell, four identical presses treated as one row). Past
 *     that it is overloaded, and overload is a fact about a BUCKET of time, not
 *     about a pair of bars.
 *  4. **Load as a quantity**, per axis column, so the overload has somewhere to
 *     be drawn.
 *
 * READ-ONLY, and that is a recorded decision rather than an omission — see
 * DECISION 2 in the gap analysis. Nothing here mutates a schedule or proposes
 * one. Conflicts are COMPUTED AND REPORTED, never enforced: overtime gets
 * authorised, due dates get renegotiated, and a supervisor may knowingly
 * double-book a machine that has two operators. A module that refused the
 * booking would be wrong in every plant whose rules differ from the ones we
 * guessed.
 *
 * As in ./gantt and ./planning, everything is the caller's local `Date`,
 * deliberately unconverted, and every failure here is silent — an operation
 * packed into the wrong lane is a plausible schedule, a load bucket that
 * forgot setup is a plausible number. scripts/check-production.ts is where
 * they are pinned.
 */
import { type GanttCalendar, type GanttDependency, type GanttSegmentOptions, type GanttSpan, type GanttTaskStatus } from "./gantt";
import type { PlanningColumn } from "./planning";
/**
 * The minimum an operation must have for the maths to work. A binding's own
 * type adds the display fields — name, order, lot, quantity — and extends this.
 */
export interface ProductionOperationNode {
    id: string;
    /** The resource it is booked on. Must name a resource in the tree. */
    resourceId: string;
    /** When the machine is claimed — the start of SETUP, not of the run. */
    start: Date;
    /**
     * Run time in WORKING minutes, resolved through the calendar. This is the
     * normal way to state an operation: how long the work takes is a property of
     * the job, and when it lands is a property of the plant's shifts.
     */
    runMinutes?: number;
    /**
     * An explicit end, which wins over `runMinutes` — a stated end is a
     * statement, a duration is a derivation. Measured from the end of setup.
     */
    end?: Date;
    /**
     * Changeover before the run, in working minutes. It occupies the machine and
     * makes nothing, which is exactly why it has to be counted rather than
     * assumed away.
     *
     * A stated number is a STATEMENT and wins over anything derived, the same way
     * `end` wins over `runMinutes`. Leave it off and a `ProductionSetupMatrix`
     * derives it from what ran before — see `setupFamily`.
     */
    setupMinutes?: number;
    /**
     * What this operation is, for changeover purposes — a product, a colour, a
     * material, a tooling set.
     *
     * Changeover is SEQUENCE-DEPENDENT and that is not a refinement: going from
     * white paint to black costs minutes, and black to white costs an hour of
     * washing out. A per-operation duration cannot express a cost that depends on
     * what the machine did before, so the matrix is keyed on the pair.
     */
    setupFamily?: string;
    /**
     * How much of the resource's capacity this consumes. Default 1. A job that
     * needs both operators on a two-operator cell is 2.
     */
    load?: number;
    percentComplete?: number;
    status?: GanttTaskStatus;
}
/**
 * A machine, a cell, a line, a whole plant. They nest, and a parent shows its
 * descendants' work when it is collapsed — the same projection `flattenGanttTasks`
 * makes, for the same reason: a folded row that showed nothing would read as a
 * line with no work on it.
 */
export interface ProductionResourceNode {
    id: string;
    /**
     * How many operations can run at once. Default 1.
     *
     * On a PARENT this is its own number, not the sum of its children's — a line
     * of four machines has whatever capacity the line itself has, which is
     * usually four but is a fact somebody has to state rather than one to infer.
     * Omit it on a parent and the sum of the children is used, because that is
     * the answer that is right more often than 1 is.
     */
    capacity?: number;
    /**
     * This resource's own working calendar, overriding the chart's. A furnace on
     * continuous run inside a plant on two shifts is the case this exists for.
     */
    calendar?: GanttCalendar;
    children?: ProductionResourceNode[];
}
/**
 * What a changeover costs, per (from, to) pair of setup families.
 *
 * `"*"` matches anything on either side, so a plant with one expensive
 * transition writes that one rule and a fallback rather than an N×N table it
 * has to maintain. Lookup is most-specific-first and pinned in
 * scripts/check-production.ts, because "which rule won" is exactly the kind of
 * thing that is invisible once it is drawn.
 */
export interface ProductionSetupMatrix {
    /** `minutes[fromFamily][toFamily]`, either key optionally `"*"`. */
    minutes: Record<string, Record<string, number>>;
    /** When nothing matches. Default 0 — no rule means no changeover, not a guess. */
    fallbackMinutes?: number;
}
/**
 * The changeover from `from` to `to`, in working minutes.
 *
 * `from` is null for the first operation on a resource: there is nothing to
 * change over FROM, and charging a full changeover for it would inflate every
 * shift's first job. A plant that really does pay a warm-up writes a `"*"` rule
 * against its own family and gets it that way, deliberately rather than by
 * default.
 */
export declare function productionSetupMinutes(matrix: ProductionSetupMatrix, from: string | null, to: string | null): number;
/**
 * Each operation's changeover, derived from what ran before it on the same
 * resource.
 *
 * TIME ORDER, not lane order. Lanes are a packing artefact — which lane a job
 * lands in depends on what else overlapped it — so attributing a changeover to
 * "the previous job in lane 1" would make the cost depend on how the chart drew
 * itself. The previous job in TIME on that machine is the physical answer, and
 * on a capacity-1 resource it is the only one. On a multi-capacity resource it
 * is an approximation, and a deliberate one: which spindle or operator picked
 * the job up is not modelled here, so neither is a per-spindle changeover.
 *
 * NOT CIRCULAR, though it looks it. Setup changes a span, spans decide lane
 * packing — but the ordering used here is by the caller's `start`, which is
 * given and which nothing derives. So: order by start, derive setups, build
 * spans, then pack.
 */
export declare function productionSetupPlan<O extends ProductionOperationNode>(operations: O[], matrix: ProductionSetupMatrix): Map<string, number>;
/** An operation resolved onto the clock: where setup ends and the run begins. */
export interface ProductionPlacement<O extends ProductionOperationNode = ProductionOperationNode> {
    operation: O;
    /** The changeover, or null when there is none. */
    setup: GanttSpan | null;
    /** The work itself. */
    run: GanttSpan;
    /** setup.start (or run.start) through run.end — what the machine is claimed for. */
    span: GanttSpan;
    /**
     * The stretches of `span` where the plant is actually open, or null when the
     * booking is drawn whole. Same contract as `GanttRow.segments`: whenever
     * segments exist, `span` has been clamped to them.
     */
    segments: GanttSpan[] | null;
}
/** One visible line of the chart: a resource, and the work packed onto it. */
export interface ProductionRow<R extends ProductionResourceNode = ProductionResourceNode, O extends ProductionOperationNode = ProductionOperationNode> {
    resource: R;
    depth: number;
    index: number;
    parentId: string | null;
    hasChildren: boolean;
    expanded: boolean;
    /** What the resource can run at once, resolved through the parent rule above. */
    capacity: number;
    /**
     * Operations packed so that no lane holds two that overlap. Lane 0 is the
     * one nearest the top.
     *
     * Packing rather than stacking-by-index: sorting into "first lane that is
     * free" keeps a busy machine's day on ONE line when nothing overlaps, which
     * is the common case, and only grows when there is a genuine double-booking
     * to show.
     */
    lanes: ProductionPlacement<O>[][];
    /**
     * Every placement in this resource's SUBTREE, regardless of expansion — what
     * the row is responsible for, as opposed to what it draws.
     *
     * They are not the same question and answering both with `lanes` gets one of
     * them wrong. An expanded parent draws nothing (its children draw its work
     * once each), so a load computed from `lanes` reports a busy cell as 0%
     * loaded — which reads as an idle machine rather than as a row that delegates.
     * Capacity and load are always about the subtree; the bars are about the row.
     */
    subtree: ProductionPlacement<O>[];
    /** Operations that did not fit inside `maxLanes`. Reported, never dropped silently. */
    overflow: number;
    /**
     * True where more capacity is consumed at some instant than the resource has.
     *
     * NOT the same as "has more than one lane": a two-operator cell running two
     * jobs at once is two lanes and perfectly fine. Overload is about `capacity`,
     * and conflating the two is how a correct schedule gets painted red.
     */
    overloaded: boolean;
}
export interface ProductionFlatten<R extends ProductionResourceNode = ProductionResourceNode, O extends ProductionOperationNode = ProductionOperationNode> {
    rows: ProductionRow<R, O>[];
    /**
     * EVERY resource id, visible or not, mapped to the row that represents it —
     * a resource inside a collapsed parent maps to the ancestor it folded into,
     * so a connector touching its work still has somewhere to point.
     */
    rowIndexById: Map<string, number>;
    /** Every operation id to the row it is drawn on, and the lane it landed in. */
    operationIndex: Map<string, {
        rowIndex: number;
        lane: number;
    }>;
}
/**
 * Where an operation actually sits, with setup resolved through the calendar.
 *
 * Setup FIRST, then the run — and both through working time, which is the
 * whole point. A 45-minute changeover starting at 16:30 on a shift that ends at
 * 17:00 does not finish at 17:15; it finishes at 06:15 the next morning, and
 * the run has not started yet. Wall-clock arithmetic reports this operation as
 * done before anybody arrives.
 *
 * Returns null when there is nothing to draw: no positive duration and no
 * explicit end. A zero-length booking is not a milestone here — a machine
 * claimed for no time is a data error, and inventing a width would hide it.
 */
export interface ProductionPlacementOptions extends GanttSegmentOptions {
    /**
     * Changeover derived from the sequence, used only when the operation does not
     * state its own. A stated `setupMinutes` is a statement and wins.
     */
    setupMinutes?: number;
}
export declare function productionPlacement<O extends ProductionOperationNode>(operation: O, calendar?: GanttCalendar, segmentOptions?: ProductionPlacementOptions): ProductionPlacement<O> | null;
/**
 * The most capacity consumed at any one instant, and when.
 *
 * A sweep over the endpoints rather than a pairwise overlap test: pairwise is
 * O(n²) and, worse, answers the wrong question — three jobs that overlap only
 * two-at-a-time never exceed a capacity of 2, and a pairwise check would flag
 * the resource anyway.
 */
export declare function productionPeakLoad(placements: ProductionPlacement[]): number;
/**
 * Pack placements into lanes, so no lane holds two that overlap.
 *
 * First-fit over lanes sorted by start. Anything past `maxLanes` is refused
 * rather than dropped — the caller reports the count, because a row that
 * quietly hid six jobs is the worst failure this module can have.
 */
export declare function packProductionLanes<O extends ProductionOperationNode>(placements: ProductionPlacement<O>[], maxLanes: number): {
    lanes: ProductionPlacement<O>[][];
    overflow: number;
};
export interface ProductionFlattenOptions extends GanttSegmentOptions {
    /** The plant's calendar. A resource's own `calendar` overrides it. */
    calendar?: GanttCalendar;
    /**
     * Sequence-dependent changeover. With one supplied, an operation that states
     * no `setupMinutes` gets one derived from what ran before it on the same
     * resource — see `productionSetupPlan`.
     */
    setupMatrix?: ProductionSetupMatrix;
    /**
     * How many lanes a row may grow to. Default 3.
     *
     * Bounded because rows are a FIXED height — the window and the connector
     * routes both depend on it — so lanes are drawn by dividing a row rather than
     * by growing one. Past three the bars are thinner than the gap between them.
     */
    maxLanes?: number;
}
/**
 * The resource tree, projected onto the rows on screen, with the work packed on.
 *
 * A collapsed parent carries every operation booked anywhere beneath it, which
 * is what makes folding a line up into one row show the line's actual load
 * rather than an empty strip.
 */
export declare function flattenProductionResources<R extends ProductionResourceNode, O extends ProductionOperationNode>(resources: R[], operations: O[], isExpanded: (resource: R) => boolean, options?: ProductionFlattenOptions): ProductionFlatten<R, O>;
/** How busy a resource is over one column of the axis. */
export interface ProductionLoadBucket {
    start: Date;
    end: Date;
    /** Working milliseconds the resource offers here — open time × capacity. */
    availableMs: number;
    /** Working milliseconds booked, SETUP INCLUDED. */
    bookedMs: number;
    /**
     * `bookedMs / availableMs`, or null where nothing is available.
     *
     * Null rather than 0 or Infinity, and the distinction matters: a Sunday on a
     * 24/5 plant has no capacity and no work, which is not 0% utilised — it is
     * not a question. Drawing it as an empty bar says the plant was idle.
     */
    utilisation: number | null;
    /** Booked past what is available. Reported; never enforced. */
    overloaded: boolean;
}
export interface ProductionLoadOptions {
    calendar?: GanttCalendar;
    /** Parallel capacity. Default 1. */
    capacity?: number;
}
/**
 * Load per axis column — the number the histogram under the chart draws.
 *
 * Both sides are WORKING quantities, which is the whole argument for tier (a)
 * coming first. Available time is the plant's open hours in the column, times
 * capacity; booked time is the working part of each operation's span, setup
 * included. Measure either in wall clock and the answer is wrong on exactly the
 * columns that matter — the ones next to a shutdown, where wall-clock booking
 * runs through hours the plant did not have.
 *
 * Clipped to the column, so an operation spanning four days contributes each
 * day its own share rather than all of it to the first.
 */
export declare function productionLoad(placements: ProductionPlacement[], columns: PlanningColumn[], options?: ProductionLoadOptions): ProductionLoadBucket[];
/**
 * Routing links the schedule violates, as data.
 *
 * The earliest the successor MAY sit is the predecessor's anchor plus the lag,
 * measured in working time — four hours of cooling that starts at 16:00 on a
 * single-shift plant is not over at 20:00. A negative lag is a lead and walks
 * backwards through the calendar instead, which is why `ganttSubWorkingMs`
 * exists.
 *
 * REPORTED, NEVER ENFORCED, like everything else here. A planner who knowingly
 * overlaps two operations because the first one's last pallet is already off
 * the machine is not making an error the component should refuse; they are
 * making a decision it should show.
 *
 * A link naming an operation with no placement is skipped rather than reported:
 * "this link is violated" about a job that is not on the chart is noise, and
 * `unknown-resource` already covers work that vanished.
 */
export declare function productionSequenceConflicts(dependencies: GanttDependency[], placements: Map<string, ProductionPlacement>, options?: {
    calendar?: GanttCalendar;
}): ProductionConflict[];
/** What the schedule says is wrong. Reported to the caller, never acted on. */
export type ProductionConflictKind = 
/** More capacity consumed at once than the resource has. */
"over-capacity"
/** Booked into time the plant is shut — a holiday, a weekend, a shutdown. */
 | "non-working"
/** Booked on a resource id that is not in the tree. */
 | "unknown-resource"
/** A routing link's lag is not respected — the successor sits too early. */
 | "sequence";
export interface ProductionConflict {
    kind: ProductionConflictKind;
    /** The resource it is about, where there is one. */
    resourceId: string;
    /** The operations involved. Empty for a resource-level finding. */
    operationIds: string[];
}
/**
 * Everything the schedule can tell is wrong, as data.
 *
 * REPORTED, NOT ENFORCED — the recorded decision, and the one thing about this
 * module that must not drift. Overtime gets authorised, due dates get
 * renegotiated, and a supervisor may knowingly double-book a cell that has two
 * operators today. A module that refused those bookings would be wrong in every
 * plant whose rules differ from the ones we guessed, and it would be wrong
 * invisibly, because the schedule it drew would look fine.
 *
 * `unknown-resource` is the one that is nearly always a bug rather than a
 * choice: an operation naming a resource that does not exist is drawn nowhere
 * at all, so without this it vanishes from the chart in silence.
 */
export declare function productionConflicts<O extends ProductionOperationNode>(rows: ProductionRow<ProductionResourceNode, O>[], operations: O[], options?: {
    calendar?: GanttCalendar;
}): ProductionConflict[];
