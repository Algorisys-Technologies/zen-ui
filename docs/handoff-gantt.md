# Gantt — handoff

**Branch:** `feat/gantt`, ahead of `dev`, 0 behind.
**Date:** 2026-07-31. **State:** `bun run check` green except `check:parity`
(3 expected failures, deliberately not silenced — see below); `lint` 0 problems;
both tsconfigs clean; `bun run check:schedule-dom` green — **112 assertions**
over `/gantt` and `/production-schedule`, LTR and RTL.

**Three things now hold this in place rather than a memory of having checked:**

| | what it catches |
|---|---|
| `scripts/check-schedule-dom.mjs` | one tab stop per chart, no tabbable bars, uniform row heights, lanes drawn, focus surviving a move to an unmounted row, and **page-level** horizontal scroll |
| `check:size` budgets | the shared renderer being duplicated — see below |
| `dist-pkg/zen-ui-react.tgz` | re-packed, so the consuming app finally has fit, the keyboard, the pane and `ProductionSchedule` |

**The bundle, measured rather than assumed.** `Gantt` 55 kB gzipped,
`ProductionSchedule` 53 kB, **both together 60 kB** — five kilobytes more than
one, which is the extraction paying for itself in bytes. Budgets are 70/70/**75**,
and the pair is the one with teeth: duplicate `schedule-grid.tsx` and the pair
goes to ~108 kB, which nothing else in the repo would notice. The old
"468 kB / 145 kB gzipped" figure in earlier notes was never a tree-shaken
import and should not be quoted.

> **`check:schedule-dom` was proved to fail before being trusted.** Re-introducing
> the tab-through-bars regression (`tabIndex={0}` on the bar) turned it red:
> 149 tabbable bars, up to 22 tab stops in one chart, non-zero exit. A check
> that has never failed is not known to work.

> **`check:parity`'s failure list doubled, as predicted when Decision 1 was
> taken.** It now names `ProductionSchedule` and its 13 types alongside `Gantt`
> and its 12. That is the cost of two components, it was priced in, and it is
> still not silenced via `divergent` in `bindings.mjs`.

> **The default view changed.** It is `fit` now, not `month` — see the
> smaller-gaps section. Gantt has never been in a release, so no consumer's
> default moved, but the consuming app at `/home/rajesh/temp/demo/timeline`
> will open differently once the tarball is re-packed.

Read this alongside `docs/production-scheduling-gap-analysis.md`, which carries
the reasoning this file only summarises.

> **Why this is not the root `handoff.md`.** The repo's convention is a single
> root `handoff.md` rewritten each session, and the one on `dev` still describes
> the 9.6.0/10.0.0 release state — overwriting it here would mean merging this
> branch silently clobbers it. Root `*.md` is also gitignored behind a curated
> allowlist (`.gitignore:36`), which `docs/**/*.md` is exempt from. This file is
> branch-scoped and disposable: fold whatever still matters into `handoff.md`
> when the Gantt merges, and delete it.

---

## What exists

A `Gantt` and a `ProductionSchedule` for React, over one internal renderer,
plus their maths in `packages/core/src/{gantt,production}.ts`.

| Piece | Path |
|---|---|
| Core maths | `packages/core/src/gantt.ts` (+ `/gantt` subpath export) |
| Check script | `scripts/check-gantt.ts` — **479 assertions** (236 per run, twice), wired into `bun run check` |
| Shared renderer | `packages/react/src/components/gantt/schedule-grid.tsx` — internal, **not** exported from the index |
| React component | `packages/react/src/components/gantt/gantt.tsx` |
| React demo | `packages/react/src/components/NewGanttDemo.tsx`, route `/gantt` |
| Solid, vanilla | same shape under `packages/solid` / `packages/vanilla` — **stale, see drift** |
| Design doc | `docs/production-scheduling-gap-analysis.md` |
| Consumer tarball | `dist-pkg/zen-ui-react.tgz` + `scripts/pack-dist-pkg.sh` |

Shipped capabilities: nested task hierarchy with collapse; summary bars rolled
up from children; dependency connectors (all four link types) drawn as an SVG
overlay; slip against a baseline; assignee avatars; **six** views — `fit` plus
day / week / month / quarter / year — on duration-proportional columns; a
frozen pane that sheds columns rather than scrolling; row virtualization; APG
treegrid keyboard navigation; and a working-time model (shift calendars, dated
exceptions, split bars, sub-day columns).

Deliberately absent, with reasons in the component's doc comment: drag-to-move,
drag-to-resize, drag-to-create, drag-to-draw-dependencies. The stance is that
rescheduling cascades through successors, and the cascade policy, undo story
and permission model belong to the caller. `onTaskClick` hands back the task
and its derived row. **This stance is under review for manufacturing** —
DECISION 2 below.

---

## Start here: three facts that will cost you an hour if you learn them late

**1. The app consumes a committed tarball, not the source.**
Rebuilding `packages/react/dist` is NOT enough for the consuming app to see a
change. Run `./scripts/pack-dist-pkg.sh`, then commit and push
`dist-pkg/zen-ui-react.tgz`. A stale tarball fails **silently** — the app keeps
building against the last pack and simply lacks the new component. This exists
because npm cannot install a subdirectory of a git repo (it reads the monorepo
root and dies on `workspace:*`); `dist-pkg/README.md` has the full reasoning.

**2. Bar geometry is percentages of the range; columns are pixels.**
`placeAppointment` returns percentages of the whole range. That only aligns
with uniform pixel columns when every column has **equal duration** — true for
hours and days, false for months. This is why `ganttColumnWidths` derives each
column's width from its own share of the range. Measured: bar edges land within
**0.055px** of their true date; uniform widths were out by **4.82px ≈ 1.8 days**.
Any new view must preserve this.

**3. Everything here fails silently when wrong.**
A collapsed subtree that drops its arrows looks like a project with no
dependencies. A parent bar rolled up from the wrong children is a plausible
date. A connector routed through a bar is just an ugly line. Nothing throws.
That is why `check-gantt.ts` is heavy, and why it runs **twice** — ambient plus
`TZ=Europe/London`, because a dev box on `Asia/Calcutta` has no DST and the
whole DST section would be permanently vacuous.

---

## Public API

```ts
import { Gantt } from "@algorisys/zen-ui-react";

interface GanttTask {
  id: string; name: string; subtitle?: string;
  start?: Date; end?: Date;          // BOTH or neither; omit on a parent to roll up
  percentComplete?: number;          // 0–100
  workingMinutes?: number;           // end derived through the calendar
  baselineEnd?: Date;                // drives the slip chip
  status?: "not-started" | "on-track" | "delayed" | "complete";
  assignees?: { id: string; name: string; src?: string; initials?: string }[];
  statusLabel?: string;              // overrides the chip's words, not its colour
  children?: GanttTask[];
}
type GanttDependency = { from: string; to: string;
  type?: "finish-to-start" | "start-to-start" | "finish-to-finish" | "start-to-finish" };
type GanttAnchoredView = "day" | "week" | "month" | "quarter" | "year";
type GanttView = GanttAnchoredView | "fit";        // "fit" is the DEFAULT
type GanttPaneColumn = "name" | "assignees" | "status" | "variance";
```

`GanttProps`: `tasks` · `dependencies?` · `showDependencies?` · `calendar?` ·
`hourStep?` · `view?`/`defaultView?`/`onViewChange?`/`views?` ·
`date?`/`defaultDate?`/`onDateChange?` ·
`expanded?`/`defaultExpanded?`/`onExpandedChange?` · `onTaskClick?(task, row)` ·
`now?` · `columnWidth?` · `columns?` · `hideToolbar?` ·
`loading?`/`loadingRows?` · `emptyState?` · `className?`

Fit API: `ganttFitRange(tasks, opts?)`, `ganttFitUnit(spanMs)`,
`ganttRangeColumns(range, unit, opts?)`, `ganttSpanLabel(range)`. Pane API:
`ganttPaneColumns(requested, widths, available, minAxisWidth)`,
`GANTT_PANE_COLUMNS`.

Working-time API: `GanttCalendar` (`week: GanttWorkingPeriod[][]`, `week[0]` is
Sunday; `exceptions?`), `GanttCalendarException` (`periods: []` means closed),
`GANTT_CALENDAR_24_7`, `ganttWorkingMs`, `ganttAddWorkingMs`,
`ganttWorkingSegments`, `ganttWorkingPeriodsOn`, `ganttIsWorking`. Rows expose
`segments: GanttSpan[] | null`.

**Backward compatibility is absolute:** no `calendar` means the pre-calendar
behaviour exactly. Verified by rebuilding the pre-change lib and comparing the
consuming app across all five views — 3 views byte-identical, week 2px, month
3px, every difference a ±1/255 grey on rounded corners.

---

## The two decisions — settled 2026-07-31

Both are argued in full, with the reasoning and its corrections, in
`docs/production-scheduling-gap-analysis.md`. Tier (b) is unblocked.

**DECISION 1 — two components, over ONE internal renderer.** (§107)
`ProductionSchedule` gets its own props, demo, nav entry and editing stance. It
does not get its own renderer: the generic shell is extracted once and shared.
Decided on the **data model** — a row holding many operations, each with a work
centre, an order and lot, a quantity, a setup time and a routing sequence, is a
different contract from a row holding one bar with a percentage and a baseline —
and deliberately NOT on the editing stance, because that is Decision 2 and the
two would otherwise deadlock.

> Three things the doc got wrong, now recorded there. The `TreeTable` precedent
> is **weaker** here than it claimed: TreeTable's is a hard impossibility (two
> features claiming the same three TanStack slots), and "one bar per row" is
> merely the degenerate case of "many bars per row". The reasoning was
> **circular** — it used the editing stance to argue for two, while the tier
> ordering says the editing stance cannot be decided until (b) exists, and (b)
> was blocked on this. And the extraction is **~750 measured lines** of shared
> shell, not the open-ended "real work" it reads as.

**DECISION 2 — deferred until tier (b) exists.** (§163)
Not kept and not dropped. Section (c)'s own argument — the drag has nothing to
aim at until the component can show the overload — applies to *designing* the
contract as much as to shipping it. Two of the sketch's three load-bearing
choices constrain tier (b) anyway and are cheaper honoured than retrofitted:
the component stays **controlled**, and conflicts are **computed and reported,
never enforced**. `Gantt`'s own read-only stance is not under review.

### Step 1 is DONE: the renderer is extracted

`schedule-grid.tsx` (980 lines) now holds everything that does not depend on
what a row *is*; `gantt.tsx` (861) holds the project half. It is **internal** —
absent from `packages/react/src/index.ts` on purpose, so its shape can change
without a major version.

The seam, for whoever writes `ProductionSchedule`:

```tsx
const { metrics, setMetrics } = useScrollerMetrics(scrollerRef);
const axis = useScheduleAxis({ view, anchor, fitRange, now, calendar,
                               paneColumns, available: metrics.width });
<ScheduleGrid
  rows={rows} rowId={…}
  columns={paneColumns}          // ScheduleColumn<R>[] — label, width, colIndex, render
  renderTrack={(row, axisWidth) => …}   // one bar, or a whole sequence
  connectors={…} axis={axis} scrollerRef={scrollerRef}
  metrics={metrics} setMetrics={setMetrics} … />
```

- **`useScheduleAxis` runs in the CALLER, not inside the grid**, and that is
  deliberate: the caller needs `range` and `axisWidth` to place its own bars in
  the same render, and a second pass measuring the DOM is exactly how two
  sources of truth for one geometry get created.
- **The chain inside it has an order that is easy to reverse.** The pane sheds
  against what the axis *wants*; a fit axis then spends whatever the pane left
  over. Pane-first-at-a-fixed-minimum is the version that did not fix anything.
- `ganttPaneColumns` in core is now generic over the column key, so a second
  component sheds *its* columns — work centre, order, quantity — by the same
  rule.
- `ScheduleRowShape` is the whole contract: `index`, `depth`, `hasChildren`,
  `expanded`. Everything else about a row reaches the grid only through a
  column's `render` or through `renderTrack`.

**Verified as a refactor, not asserted.** A DOM probe fingerprinted all 16
charts on `/gantt` — pane columns, `aria-colindex` sets, column counts and first
labels, client/content widths, horizontal overflow, `aria-rowcount`/`colcount`,
mounted row counts, `aria-level`/`aria-expanded`, tab stops, bar and connector
counts, toolbar buttons, range label — plus 12 keyboard interactions including
Ctrl+End across the window boundary. Captured before, re-run after: **byte
identical in both LTR and RTL.**

### Step 2 is under way: `ProductionSchedule` exists

The first tier-(b) slice shipped, React + core only, and it is the thing that
PROVES the extraction was generic — the seam was written against one component
and is now carrying two.

| Piece | Path |
|---|---|
| Core maths | `packages/core/src/production.ts` (+ `/production` subpath) |
| Check script | `scripts/check-production.ts` — 122 assertions, two timezones, wired into `bun run check` |
| React component | `packages/react/src/components/production-schedule/production-schedule.tsx` |
| Demo | `packages/react/src/components/NewProductionScheduleDemo.tsx`, route `/production-schedule` |

What the second component needed that the first did not, and what it cost:

- **`rowHeight` as a prop** on `ScheduleGrid` (lanes need taller rows). Rows
  still have ONE height per chart — `ganttRowWindow` is arithmetic and
  `ganttConnectors` places its endpoints from it, so varying heights would need
  a measured offset table both would have to read.
- **`renderFooter`**, for the load histogram. Rendered OUTSIDE the `treegrid`
  element: a div that is not a `row` inside a grid is invalid ARIA, and a fake
  row would be counted by `aria-rowcount` and announced as data.
- **`yOffset` on `GanttBarAnchor`**, so a routing arrow arrives at the LANE
  rather than at the row's middle, which in a three-lane row is between the bars.
- **`ganttPaneColumns` generic over the column key** — already done during the
  extraction, and it paid off immediately: the production pane is
  resource/jobs/capacity/load and sheds by the same rule.

Nothing else changed in `schedule-grid.tsx`. The axis, pane shedding, windowing,
keyboard model and connector overlay were used as-is.

> **The layout trap this turned up, which applies to BOTH components and was
> already live on the Gantt page.** A fit axis sizes itself from the scroller's
> measured width, so a container whose width comes from its own content makes
> the two define each other. `.example-preview` is a flex row, so a demo wrapper
> without `w-full` is content-sized: identical data rendered at **516px** in one
> section and **1800px** in another, and the 1800 one made the whole page scroll
> sideways. Per-scroller overflow checks cannot see it — the scroller was
> internally consistent. The probe now asserts `document.scrollWidth` too.

**Next:** the rest of tier (b) — sequence-dependent setup (a changeover matrix,
rather than today's per-operation duration) and dependency lag/lead — then
revisit Decision 2, which now has a real overload to drag at.

**DECISION 3 — axis: settled, wall-clock with non-working shaded.** (§225)
Compression would turn one linear date→x map into a piecewise one at every call
site — placement, every connector endpoint, the now-marker, gridlines — a second
geometry that must agree with the first. It also collapses month columns to zero
width. Recorded as reversible: duration-proportional columns make compression a
one-function change later.

---

## The smaller gaps — done (2026-07-31, React + core only)

All three landed. Decisions taken by the user where the previous handoff flagged
them: fit is a `GanttView` member and it is the **default**; the pane takes both
caller choice and auto-drop.

**1. `view="fit"` — an axis whose range comes from the data.**
`ganttFitRange(tasks)` unions **every** node's own span (not just the roots — a
parent that states dates is believed, so a root-only union cuts a child in
half), pads by 4% with a one-day floor, and snaps outward to whole units.
`ganttFitUnit(spanMs)` picks the unit against pinned thresholds — `≤2d` hour,
`≤45d` day, `≤315d` week, else month — chosen so each band tops out near 48
columns. `ganttRangeColumns(range, unit)` tiles an arbitrary range, holding the
same no-gap-no-overlap invariant the anchored views hold.

> **The type split is load-bearing.** `GanttAnchoredView` is the five views
> whose range is a function of the anchor; `GanttView` is that plus `"fit"`.
> `ganttRange` / `ganttColumns` / `ganttRangeLabel` / `shiftGanttAnchor` take
> the **narrow** type, so passing `"fit"` is a compile error rather than the
> silent month `planningRange` would hand back. Port the two types together or
> the trap comes straight back.

Prev / Today / Next are **hidden** under fit, not disabled. Leaving fit
re-anchors the date to `now` (or the plan's start) when the anchor is outside
the plan, or clicking "Month" on a plan running next spring lands on an empty
axis. Degenerate cases return null and fall through to the anchored month: zero
tasks, no dates, a start with no end. A single milestone gets a real axis from
the padding floor.

**2. The frozen pane sheds columns.** Widths trimmed 468 → 436px, and
`columns?: GanttPaneColumn[]` states which columns and in what **preference**
order — what you list last goes first. `ganttPaneColumns` drops from the end
until the axis has the width it wants, never dropping the first entry.

> **Shed only when shedding achieves a fit.** The greedy version measured worse
> than doing nothing: a month axis wanting 1364px in a 1008px container dropped
> three columns, got the scroll from 792px down to 536px, and still scrolled —
> the reader lost Assignees, Status and Variance *and* still had to drag. It now
> bails when the narrowest possible pane still cannot fit.

The reported case is fixed and pinned: a year axis at 1292px keeps Task and
Assignees and no longer scrolls. Anchored views in a container too small for
them keep all four columns and scroll, which is the honest outcome — their axis
width is fixed and the pane cannot rescue it.

**3. Keyboard: `role="treegrid"`, one tab stop, roving tabindex.** Arrows move a
cell; Home/End the row, Ctrl+Home/End the plan; PageUp/PageDown a screenful;
forward/backward on the first column expand and collapse; Enter/Space calls
`onTaskClick`. Arrows follow **visual** direction, so they still point the way
they are drawn under RTL. Bars, chevrons and the assignee tooltip trigger are
all `tabIndex={-1}`; the assignee cell carries the names as its accessible name
because the "+N" chip hides some outright.

> **Focus vs virtualization is the part that breaks.** A move to an unmounted
> row sets a pending target, scrolls the row in, pushes the new `scrollTop`
> into state in the **same commit** (waiting for the scroll event's rAF is one
> render too late), and a layout effect focuses it by `data-gantt-cell` once it
> mounts. If it is still not there, the target stays pending for the next
> commit. The tab stop follows the **viewport**, not the active row — anchoring
> it to a row that is not in the DOM leaves the grid with no tabbable cell at
> all and Tab skips the whole chart.

Verified in a browser rather than by building green: a DOM probe drove the keys
on an 840-row chart and reported **21/21 in both LTR and RTL**, including
Ctrl+End landing on a `gridcell` (not `<body>`) at row 839, scrolled clear of
the sticky header. A second probe measured all 14 charts on the demo page —
pane columns, column count, container width, horizontal overflow, tab stops.
Both probes were deleted; the numbers above are what they reported.

`check-gantt.ts` is now **479 assertions** — 236 per run, still run twice (ambient +
`TZ=Europe/London`).

**Still explicitly not done:** bundle size (468kB / 145kB gzipped). Real, but it
is zen-ui's barrel export failing to tree-shake for any consumer using a handful
of components — a library-wide packaging change, not a Gantt gap.

**Not re-packed.** `dist-pkg/zen-ui-react.tgz` is from before this batch, so the
consuming app still has the old component. Run `./scripts/pack-dist-pkg.sh` and
commit the tarball when you want it there — see fact 1 above.

---

## Known drift and debt

**Solid and vanilla are four drifts behind** (`todo.md:910` onwards) — quarter
and year views, virtualization, the working-time model, split bars.
Web-components has no Gantt at all. The user has explicitly deferred all ports.

> **Trap, not merely a gap:** Solid and vanilla still call `planningRange`,
> whose final branch returns a **month** for any unrecognised view. So
> `view="year"` there type-checks and silently draws the wrong axis. This is
> why `GanttView` was deliberately **not** re-exported from those indexes to
> quiet parity — the red is load-bearing.

`check:parity` reports 3 expected failures — `Gantt` plus 21 types and constants
for web-components, 12 for Solid and vanilla. Not added to `divergent` in
`bindings.mjs`, because `check-parity.ts` says that list is for convergence
decisions and "do not use it to silence a component that is merely missing".

Other open items: rows are windowed but **not** the connector layer, which is
deliberate — measured at 10k rows, keeping it whole costs ~55ms of first paint
and nothing per frame, and culling would make connectors pop at the band edge.

**Two commits touch shared surface beyond Gantt** and deserve a reviewer's
attention: `7db6cff` (agent-guide stylesheet import order) and the
`planning.ts` working-hours interaction inside `c18f645`.

---

## The consuming app

`/home/rajesh/temp/demo/timeline` — Vite 8 + React 19 + react-router v8, **not a
git repo**. Renders the Gantt at `/timeline` from `src/data/schedule.ts` (11
tasks, 4 months, nested phases, 6 dependencies) through an adapter at
`src/data/toGantt.ts`. Useful as a real-world smoke test; treat as read-only
unless asked.

Two things it revealed that are worth remembering:

- **Duplicate React instances.** When zen-ui was a `file:` symlink dep, the
  bare `react` specifier resolved through the symlink's realpath into zen-ui's
  own `node_modules` — two dispatchers, hooks throwing. Correct fix is
  consumer-side `resolve.dedupe`; zen-ui already externalises react correctly.
  Now moot for this app (tarball installs as a real directory), but it will hit
  the next person who uses a `file:` dep.
- **CSS import order is load-bearing.** `preflight` must be imported **before**
  `styles`. Preflight resets `background-color: transparent` on
  `[type="button"]`; an attribute selector ties on specificity with
  `.zen-bg-zen-primary`, and zen-ui's `<Button>` defaults to `type="button"` —
  so with preflight second, source order wins and every solid button renders
  invisible while still occupying layout. Documented in
  `scripts/gen-agent-guide.ts`; the CSS itself was left alone as that is a
  visual change to a shipped stylesheet.

The app's data has no `assignees` and no `baselineEnd`, so the **Assignees and
Variance columns render empty** — the two most distinctive parts of the user's
reference screenshot. That is an app-side data gap, not a component one.

---

## Recommendation before merging

This branch is 11 commits of unreviewed work — new views, variable column
geometry, virtualization, a new time model — and `dev` has not moved, so this is
the cheapest moment it will ever be to review. The Solid/vanilla silent-wrong-
axis trap is exactly the kind of thing a tired reviewer waves through at commit
11. Consider splitting into more than one PR.
