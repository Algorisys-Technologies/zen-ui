# Production scheduling — what a manufacturing Gantt needs that a project one does not

**Written:** 2026-07-31 against `feat/gantt` @ `0c185c4` (`Gantt` is unreleased; it exists on that
branch only).
**Audience:** whoever decides whether zen-ui ships a production-scheduling view, and what shape it
takes.
**Status:** Tier (a) is **shipped** (React). Decisions 1 and 2 were **settled on 2026-07-31** — see
their sections; the analysis that led to each is kept because the reasoning is what a future
reversal has to argue against. Tier (b) is unblocked and not started.

## Executive summary

`Gantt` is a **project-management** Gantt: rows are tasks in a work-breakdown structure, bars are
date ranges, progress is a percentage someone types in. Manufacturing needs a **production
scheduling** Gantt, and the distance between the two is not a feature list. It is the time model.

The project Gantt assumes **time is linear and uniform**: every hour is as available as every other
hour, so a bar is a straight map from two dates onto an axis. A factory does not work that way. It
works two shifts, not three; it stops at the weekend; it stops for a public holiday; it stops for
planned maintenance on the third Tuesday. Once that is true, *every derived number in the component
is wrong* — not approximately, categorically.

The worked example, which is real and which the current code gets wrong: **a 6-hour job starting
Friday 16:00 on a single-shift plant.** Today the bar draws to Friday 22:00 and reports a 6-hour
duration. In reality the shift ends at 17:00, nothing happens over the weekend, and the job
finishes **Monday at 13:00**. Today's answer is off by two and a half days and looks entirely
plausible.

That is why working time is tier (a) and everything else is behind it. It is not the most visible
feature — resource rows and a load histogram are what a demo shows — but capacity, setup times,
float and slip are all *arithmetic over working time*. Building them first means building them on
a number that is wrong.

## The gap, grounded in the code

Three findings, each checked against the source rather than assumed:

| Claim | Verified | Where |
|---|---|---|
| `nonWorking` is **purely cosmetic** | Two uses in the whole binding, both CSS classes: `gantt.tsx:680` (header tint) and `:859` (body tint). Nothing reads it to compute anything. | `packages/react/src/components/gantt/gantt.tsx` |
| Placement is **linear wall-clock** | `placeAppointment` maps `(t − rangeStart) / span` with no notion of availability. Nothing in `planning.ts` models working time; the closest is `workingHours?: [number, number]`, which only *shades* day-view columns. | `packages/core/src/planning.ts` |
| Slip is in **calendar days** | `ganttVarianceDays` is `round((startOfDay(end) − startOfDay(baseline)) / MS_DAY)`. A job two working days late over a weekend reports `+4d`. | `packages/core/src/gantt.ts` |

Two more that this survey turned up and that are not in the original brief, both consequences of
the same root cause:

- **`ganttProgress` weights by wall-clock duration.** A parent's percent-complete is the
  duration-weighted mean of its children. Under a working calendar the weights should be *working*
  duration, or a child that happens to straddle a shutdown is counted as larger than the work it
  contains. Same bug class as the variance function, one level down.
- **`workingHours: [9, 18]` in `planning.ts` becomes a second source of truth.** It already shades
  the day view. Once a calendar exists, two mechanisms describe the same thing and can disagree.
  The calendar has to win where one is supplied, and that has to be stated somewhere, or the day
  view will shade 09:00–18:00 while the bars respect a 06:00–14:00 shift.

## The requirement set, and why it is in this order

Four tiers. The ordering is an argument, not a preference: **each tier is unsound until the one
before it exists.**

### (a) The time model — working calendars, sub-day granularity, split bars

Working-time calendars (shift patterns per weekday, plus dated exceptions for holidays, planned
maintenance and one-off overtime); durations that mean *working* hours; bars that break across
non-working time instead of drawing through it; an axis that can resolve below a day.

**Why first:** it is the denominator of everything else. "Is this work centre overloaded?" is
*hours of work ÷ hours available* — both working-time quantities. "How long is the changeover?" is
a duration added in working time. "What is the float on this operation?" is a difference of working
durations. Build capacity on wall-clock time and the histogram is wrong on exactly the days that
matter — the ones next to a shutdown.

### (b) The shop-floor model — resource rows, finite capacity, load, setup, lag

Rows become work centres or machines rather than tasks; a row can hold many operations; capacity is
finite and overload is visible; a load histogram under the axis; sequence-dependent setup and
changeover; dependency lag and lead ("start 4 hours after the previous operation finishes, for
cooling").

**Why second:** this changes what a *row* is, which is the largest data-model change in the
document, and every number in it is a tier (a) quantity. Sequence-dependent setup is the clearest
case: the changeover from product A to product B is a duration, and a duration that ignores the
shift end is the Friday-16:00 bug again with an extra step.

### (c) Planning as an activity — rescheduling, constraint propagation, critical path, scenarios

Drag an operation and have downstream work reflow; conflicts light up; critical path and float;
planned-vs-actual as two bars on one row; compare two scenarios before committing.

**Why third, and not second:** this is the tier that makes the component a *tool* rather than a
report, so it is tempting to pull forward. It should not be. The value of dragging an operation is
resolving a problem — an overload, a late order — and until (b) exists the component cannot show
the problem, so the drag has nothing to aim at. Rescheduling without capacity is rearranging bars
for aesthetic reasons. It also depends on (a) twice over: the reflow is working-time arithmetic,
and float is a working-time difference.

### (d) The live plant — quantity progress, MES/SCADA feeds, material availability

Progress by quantity produced (740 of 1,000 units) rather than a typed percentage; live updates
from the floor; material and tooling availability gating what can start.

**Why last:** this is integration work, not model work. It is also the most site-specific tier in
the document — every plant's MES is different — so it is the one most likely to belong in the
consuming application rather than in a component library. The part that does belong here is small:
a progress input expressed as *quantity produced ÷ quantity ordered*, which is a two-field change
to the task shape and which composes with the existing percent-complete fill.

## DECISION 1 — one component, or two? **SETTLED 2026-07-31: two, over one internal renderer.**

> **The decision.** `ProductionSchedule` is a separate component with its own props, demo, nav
> entry and editing stance. It does **not** get its own renderer: the generic shell — toolbar,
> frozen pane, row windowing, connector overlay, keyboard, the fit axis — is extracted once and
> shared, alongside `packages/core/src/gantt.ts` which both already share by construction.
>
> **Decided on the DATA MODEL, deliberately, and not on the editing stance.** A row that holds many
> operations — each with a work centre, an order and lot, a quantity, a setup time and a routing
> sequence — is a different renderer contract from a row that holds one bar with a percentage and a
> baseline. That is true whether or not anything is ever draggable, which matters because
> Decision 2 is deferred (below) and the two must not deadlock.
>
> Three corrections to the analysis below, found when the decision was actually made. They are
> recorded because the analysis reads more confidently than it should:
>
> - **The `TreeTable` precedent is weaker here than the recommendation claims.** TreeTable's
>   argument is a hard impossibility — hierarchy and grouping both claim `subRows`, the `expanded`
>   state and the chevron column, so DataTable's synthesized group rows would nest inside a real
>   hierarchy and mean nothing. One table *cannot* hold both. There is no such conflict here: "one
>   bar per row" is the degenerate case of "many bars per row", and a work centre holding one
>   operation *is* a task row. The precedent supports a split; it does not force one, and calling it
>   "the strongest argument" oversold it.
> - **The reasoning below is circular.** It makes the editing stance an argument for "two", but the
>   editing stance is Decision 2 — which the tier ordering says should not be decided until (b)
>   exists, and (b) was blocked on Decision 1. Deciding on the data model is what breaks the loop.
> - **The extraction cost is much smaller than "real work" suggests, and got smaller.** Measured on
>   `packages/react/src/components/gantt/gantt.tsx` (1,535 lines): ~556 lines of the `Gantt`
>   function (measurement, view/fit resolution, pane columns, memos, connectors, keyboard) and ~193
>   lines of JSX shell (toolbar, sticky header, spacers, now-marker, overlay mount) are generic —
>   about **750 lines that get written once, not twice**. The seam already exists: making the frozen
>   pane column-driven meant `GanttRowView` takes `cellKeys` as DATA rather than hardcoding four
>   cells, so finishing it is a per-column render function. The duplication the analysis warns about
>   is precisely the part that is shared.
>
> **What actually doubles** is the public surface: props, demo, nav entry, `AGENTS.md` catalogue
> line, and the `check:parity` entry across every binding. With three bindings already deferred that
> is six entries instead of three, and it is the real cost of this decision.

The analysis that led there, kept as written:

Both are defensible and the consequences are asymmetric, so here is each honestly.

### Option A — extend `Gantt` with production props

- Callers learn one component. One demo, one nav entry, one API reference.
- Toolbar, axis, virtualization, connector overlay, sticky panes: shared with no work.
- Parity debt does not double. `check:parity` is already red for `Gantt` across three deferred
  bindings; a second component makes that six entries instead of three.

Against:

- **The data models diverge hard.** A project task has children, a percentage and a baseline. A
  production operation has a work centre, an order and lot, a quantity, a setup time, a routing
  sequence and a status from the floor. These are not the same row with extra fields.
- **Half the props become inapplicable in each mode.** `tasks` versus `operations`,
  `dependencies` versus `routing`, `percentComplete` versus `quantityProduced`. Mutually exclusive
  props are a documentation problem that never gets solved — every prop needs a sentence saying
  which mode it belongs to, and the type system cannot express it without a discriminated union
  that splits the component anyway.
- **The editing stance cannot be shared.** `Gantt` is read-only *by design* and says so in its doc
  comment. Production scheduling is editable by design. One component cannot hold both stances
  coherently; it would need a mode flag that changes what half the callbacks mean.

### Option B — a separate `ProductionSchedule`, sharing `packages/core/src/gantt.ts`

- Every prop on each component applies to that component.
- The sharing happens in **core**, which is the architecture this repo already commits to. The
  module's whole reason for existing is that renderers must not re-derive the maths; two components
  sharing one core module is that rule working, not a workaround.
- Each component keeps a coherent editing stance.

Against:

- Two components to maintain, and with Solid, vanilla and web-components deferred the port debt
  doubles before it has been paid once.
- Genuine renderer duplication: toolbar, frozen pane, row windowing, connector overlay. Extracting
  shared internals is real work and is the main cost of this option.

### Recommendation: **two**, but weakly enough that the user should overrule it freely if the port
debt is the binding constraint.

The strongest argument is not mine — **this repo has already decided this exact question, on the
same grounds, and wrote down why.** `TreeTable` is a separate component from `DataTable` rather
than a mode of it, and the reasoning recorded in its doc comment is structural: hierarchy and
grouping claim the same three slots, so one component cannot carry both, and adding the flag
"would have needed a fifth mutual-exclusion gate to describe a combination nobody can use". Replace
"hierarchy and grouping" with "WBS tasks and shop-floor operations" and the paragraph survives
unchanged.

The second argument is the editing stance, which is a property of the whole component rather than
of one prop. A component that is read-only by design and a component that is editable by design are
two different promises to the caller.

## DECISION 2 — the read-only stance. **SETTLED 2026-07-31: deferred until tier (b) exists.**

> **The decision.** Not "keep it" and not "drop it" — *decide it later, with something real to
> drag at.* Build the shop-floor model read-only first: resource rows, finite capacity, load,
> setup, lag. Then revisit.
>
> **This is the tier ordering applied to itself.** Section (c) argues that rescheduling should not
> be pulled forward because "the value of dragging an operation is resolving a problem — an
> overload, a late order — and until (b) exists the component cannot show the problem, so the drag
> has nothing to aim at". That argument applies just as well to *designing* the drag as to shipping
> it. Committing now to the `onReschedule` shape below would be guessing at a contract whose job is
> to resolve conflicts the component cannot yet compute.
>
> **What this does NOT license.** Tier (b) must not be built in a way that assumes rows never move.
> The sketch below is deferred, not rejected, and two of its three load-bearing choices constrain
> (b) already: the component stays **controlled** (it renders what it is given and never mutates
> optimistically), and conflicts are **computed and reported, never enforced**. Both are cheaper to
> honour from the start than to retrofit — an internally-mutating component with a second source of
> truth for the schedule is where every "the Gantt and the ERP disagree" bug comes from, and that is
> true before anything is draggable.
>
> `Gantt` itself is unaffected: it stays read-only by design, and that stance is not under review.

The analysis that led there, kept as written:

`Gantt` refuses drag-to-reschedule on purpose. Its doc comment argues that rescheduling cascades
through successors, and that the cascade policy, the undo story and the permission model belong to
the caller's domain. **For a project-management Gantt that reasoning is sound and should stand.**

For production scheduling it is the wrong answer, because **interactive rescheduling is the job**.
A planner's work is: see the overload, drag the job, watch downstream reflow, see what broke,
compare, commit or discard. A component that refuses to do this is not a scheduling tool; it is a
report of a schedule someone else made. The stance does not need softening or a compromise — it
needs revisiting for a different component with a different purpose, which is another argument for
Decision 1 landing on "two".

What the contract should look like. **This is a sketch to argue about, not an implementation
plan** — nothing here is being built.

```ts
/** What the component believes would happen. The caller decides if it may. */
export interface GanttRescheduleProposal {
  /** The operation the user actually dragged. */
  operationId: string;
  to: { start: Date; end: Date; resourceId?: string };
  /**
   * Everything the constraint engine moved as a consequence, INCLUDING the
   * dragged operation. A caller that persists only the dragged one produces a
   * schedule the user never saw.
   */
  cascade: Array<{ operationId: string; from: GanttSpan; to: GanttSpan }>;
  /** Constraints the proposal violates. Reported, not enforced — see below. */
  conflicts: GanttConflict[];
}

export type GanttRescheduleResult =
  | { accepted: true }
  | { accepted: false; reason?: string };

onReschedule?: (p: GanttRescheduleProposal) => GanttRescheduleResult | Promise<GanttRescheduleResult>;
```

Where the three hard problems land, and why:

- **Conflict policy — the component computes, the caller decides.** The component knows the
  arithmetic: this operation now overlaps that one, this one runs past the order's due date, this
  work centre is over capacity on Tuesday. It does not know whether any of that is *allowed* —
  overtime gets authorised, due dates get renegotiated, a supervisor may knowingly double-book a
  machine that has two operators. So conflicts travel in the proposal as data and the component
  never silently refuses a move. Enforcing them internally would make the component wrong in every
  plant whose rules differ from the ones we guessed.
- **Undo — the caller's, and this is the load-bearing decision.** The component must stay
  **controlled**: it renders the `operations` it is given, proposes a change, and re-renders only
  when the caller hands back a new array. Undo is then a caller-side history of those arrays and
  costs the component nothing. The alternative — optimistic internal mutation — creates two sources
  of truth for the schedule, and every "the Gantt and the ERP disagree" bug for the rest of the
  component's life comes from there.
- **Permissions — the caller's, but gate the affordance, not the outcome.** Returning
  `{ accepted: false }` after a drag is a bad experience: the user did the work and got a rejection.
  A `canReschedule?: (op) => boolean` predicate that suppresses the drag handle means a forbidden
  move is never offered. The rejection path stays for races (someone else locked the order while
  you dragged), which is the case a predicate cannot cover.

## DECISION 3 — wall-clock axis, non-working shaded. Settled here, with reasoning.

Both exist in real tools. A **wall-clock** axis shows every hour and shades the closed ones; a
**compressed** axis removes non-working time entirely, so Friday 17:00 sits immediately left of
Monday 06:00. This one is settled rather than escalated because it is a geometry question and the
geometry code is the part just rebuilt.

**Wall-clock, with non-working time shaded and bars split across it.** Four reasons, strongest
first:

1. **Compression makes every date lookup piecewise.** Today the map from an instant to an x
   position is one linear expression: `(t − rangeStart) / span`. It is used by bar placement, by
   every connector endpoint, by the now-marker and by the gridlines. Under compression, x becomes a
   *step function* of t, and every one of those call sites needs a search over the working
   intervals. That is not merely slower — it is a second geometry that has to stay in agreement
   with the first, which is precisely the failure this module exists to prevent, turned inward.
2. **Compression degenerates the column model.** `ganttColumnWidths` gives each column a width
   proportional to its own duration, which is what makes bars land on gridlines. Under compression
   the proportion would be *working* duration, so a Sunday column in a month view has width zero: a
   gridline with no label and nothing between it and its neighbour. The month and year views stop
   being readable at exactly the point the plant is closed.
3. **The weekend genuinely exists.** A planner reconciles the schedule against a delivery date, a
   shipping window, a customer promise. Those are calendar facts. An axis where 20 October is not
   at a fixed position makes every one of those comparisons a mental conversion.
4. **It is the reversible choice.** Wall-clock plus segments can gain a compressed *mode* later —
   it is an alternative x-mapping over data that already knows where the working intervals are.
   Starting compressed and adding wall-clock means maintaining both mappings from that day on.

The honest argument against, which is real: **a 24/5 two-shift plant spends about 60% of the axis
on white space.** That is the case compression exists to serve, and on a month view it is a lot of
nothing. Two mitigations, neither requiring the decision to be reopened now: the day and week views
already zoom past the problem, and a future `compress` mode is a change to *one function* —
`ganttColumnWidths`, plus the placement map it pairs with — because the duration-proportional
column work already separated "how long is this column" from "how wide is it drawn". That
separation did not exist a week ago; **the choice is technically open in a way it would not have
been**, which is worth recording, because it means deferring costs nothing.

## What tier (a) changes in the data model

The part worth arguing about before writing it, because getting it wrong is silent.

**Segments are a row concern, not a span concern.** `GanttSpan` stays `{ start, end }`. A split bar
becomes `GanttRow.segments: GanttSpan[] | null` alongside the existing `GanttRow.span`. The
alternative — making `GanttSpan` recursive by giving it its own `segments` — would force every
existing consumer of a span to decide whether it meant the envelope or the pieces, at ten call
sites, to express something only the renderer needs.

**The envelope must be reconciled with the segments, or connectors point at nothing.** This is the
trap. `ganttConnectors` anchors to the start or the end of a bar depending on the dependency type.
If a job is entered as starting Saturday 09:00 on a plant that is closed at weekends, its first
*working* segment starts Monday 06:00 — so the drawn bar begins on Monday while the envelope still
says Saturday, and a finish-to-start arrow lands in empty space two days to the left of the bar it
points at. It would look like a rendering bug and be a data-model bug.

The fix is to make one of them authoritative: **when a calendar produces segments, the envelope is
clamped to them** — `span.start` becomes the first segment's start and `span.end` the last
segment's end. Then placement, connectors, status and variance all read the same numbers and cannot
disagree. Pinned in `check-gantt.ts` rather than left as a comment.

**A job scheduled entirely inside non-working time keeps its bar.** If every minute of a span falls
in a shutdown, there are no segments to clamp to. Returning "no span" would make the bar vanish,
which reads as data that failed to load. It draws unsplit, on the raw dates, against shaded
background — the planner sees that they have scheduled work into a closed plant, which is the
information they need.

**Splitting has to be bounded by geometry, not by data.** A 6-hour job across a weekend is two
segments and that is the point. A three-month summary bar under a 24/5 calendar is about 65
segments, none of them more than a pixel or two wide in a year view — 65 DOM nodes to render a
dashed line. So the renderer passes a **minimum gap duration** derived from the axis scale: gaps
that would draw narrower than roughly a pixel are absorbed rather than split. At a day zoom the
lunch break splits; at a year zoom nothing does. A hard cap sits behind it so a pathological
calendar cannot hang the renderer.

## What was built, and what comes next

**Tier (a) shipped** in React: working calendars, shift patterns, dated exceptions, working
durations, split bars and sub-day columns, all in `packages/core/src/gantt.ts` and pinned by
`scripts/check-gantt.ts`. It did not prejudge Decision 1, and that turned out to be right — the
answer is two components, and every one of those functions is shared by both with the same
signature. None of it is thrown away; it is the module `ProductionSchedule` is built on.

**Next, in order**, now that Decision 1 is settled:

1. ~~**Extract the generic renderer.**~~ **Done.**
   `packages/react/src/components/gantt/schedule-grid.tsx` (980 lines) holds the axis, the frozen
   pane, windowing, the connector overlay, the treegrid keyboard model and the toolbar;
   `gantt.tsx` (861) holds the project half. Internal — deliberately absent from the package index,
   so its shape can change without a major version. `ganttPaneColumns` is generic over the column
   key now, so a second component sheds its own columns by the same rule. Verified as a refactor
   rather than asserted: a DOM fingerprint of all 16 charts on `/gantt`, plus 12 keyboard
   interactions, is byte-identical before and after in both LTR and RTL. The seam is written up in
   `docs/handoff-gantt.md`.
2. **Tier (b), read-only**: resource rows, finite capacity, load, setup, lag. Keep the component
   controlled and report conflicts rather than enforcing them — see Decision 2.
3. **Revisit Decision 2** with an overload on screen to drag at.

Backward compatibility on tier (a) is absolute: a caller who passes no calendar gets the
pre-calendar behaviour exactly, because the working-time path is not entered at all. That was
verified against the consuming application rather than asserted.

Backward compatibility is absolute: a caller who passes no calendar gets today's behaviour exactly,
because the working-time path is not entered at all. That is verified against the consuming
application rather than asserted.

## Rejected alternatives

- **Model working time as a list of non-working *intervals* rather than a recurring pattern plus
  exceptions.** Simpler to implement and to test. Rejected because a year of a 24/5 two-shift plant
  is roughly 600 intervals that the caller has to generate, and the pattern is the thing that
  actually changes ("we're going to three shifts in March"). Callers would end up writing the
  recurrence expander themselves, once per caller, which is the definition of something that
  belongs in core.
- **Store the calendar in UTC and convert.** Rejected for the reason `planning.ts` already gives
  for the whole module: a shift is defined in *local wall-clock* terms. "The early shift is 06:00
  to 14:00" stays true across a daylight-saving change, and the day it crosses one is genuinely 23
  or 25 hours long. Converting would have to be told which zone to convert to, and getting that
  wrong moves every bar by an hour with nothing looking broken.
- **A global calendar with no path to per-resource calendars.** Rejected on shape rather than on
  scope: every working-time function takes its calendar as an explicit argument rather than reading
  an ambient one, so growing to per-resource is adding a lookup at the call site instead of
  rewriting the module. There is one calendar today because there is one row type today.
- **Deriving working time from the existing `workingHours: [9, 18]` option in `planning.ts`.**
  Rejected because it cannot express two shifts, a Saturday morning, a public holiday, or planned
  maintenance — and because widening it would change `PlanningCalendar`, which is a shipped
  component that never asked for any of this.

## References

- [packages/core/src/gantt.ts](../packages/core/src/gantt.ts) — the maths, and where tier (a) lands
- [packages/core/src/planning.ts](../packages/core/src/planning.ts) — the axis, shared with `PlanningCalendar`
- [scripts/check-gantt.ts](../scripts/check-gantt.ts) — the contract these decisions get pinned in
- [todo.md](../todo.md) — the binding-parity drift this work adds to
- [docs/fiori-gap-analysis.md](fiori-gap-analysis.md) — the `PlanningCalendar` survey this component grew out of
