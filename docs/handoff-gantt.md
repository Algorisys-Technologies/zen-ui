# Gantt — handoff

**Branch:** `feat/gantt`, 11 commits ahead of `dev`, 0 behind, all pushed.
**Date:** 2026-07-31. **State:** clean tree, `bun run check` green except
`check:parity` (3 expected failures, deliberately not silenced — see below).

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

A `Gantt` component for React, plus its maths in `packages/core/src/gantt.ts`.

| Piece | Path |
|---|---|
| Core maths | `packages/core/src/gantt.ts` (+ `/gantt` subpath export) |
| Check script | `scripts/check-gantt.ts` — **375 assertions**, wired into `bun run check` |
| React component | `packages/react/src/components/gantt/gantt.tsx` |
| React demo | `packages/react/src/components/NewGanttDemo.tsx`, route `/gantt` |
| Solid, vanilla | same shape under `packages/solid` / `packages/vanilla` — **stale, see drift** |
| Design doc | `docs/production-scheduling-gap-analysis.md` |
| Consumer tarball | `dist-pkg/zen-ui-react.tgz` + `scripts/pack-dist-pkg.sh` |

Shipped capabilities: nested task hierarchy with collapse; summary bars rolled
up from children; dependency connectors (all four link types) drawn as an SVG
overlay; slip against a baseline; assignee avatars; five views (day / week /
month / quarter / year) on duration-proportional columns; row virtualization;
and a working-time model (shift calendars, dated exceptions, split bars,
sub-day columns).

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
type GanttView = "day" | "week" | "month" | "quarter" | "year";
```

`GanttProps`: `tasks` · `dependencies?` · `showDependencies?` · `calendar?` ·
`hourStep?` · `view?`/`defaultView?`/`onViewChange?`/`views?` ·
`date?`/`defaultDate?`/`onDateChange?` ·
`expanded?`/`defaultExpanded?`/`onExpandedChange?` · `onTaskClick?(task, row)` ·
`now?` · `columnWidth?` · `hideToolbar?` · `loading?`/`loadingRows?` ·
`emptyState?` · `className?`

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

## Two decisions blocking manufacturing work

Both are argued in full in `docs/production-scheduling-gap-analysis.md`. Neither
is mine to settle.

**DECISION 1 — one component or two?** (§107)
Production props on `Gantt`, versus a separate `ProductionSchedule` sharing
`packages/core/src/gantt.ts`. Recommendation: **two, weakly held.** The
strongest argument is precedent — this repo already split `TreeTable` from
`DataTable` for the same reason, and wrote down that a flag "would have needed a
fifth mutual-exclusion gate to describe a combination nobody can use". Against
it: parity debt doubles before it has been paid once, and the renderer
duplication (toolbar, frozen pane, windowing, overlay) is real.
**Everything in tier (b) and beyond is blocked on this.**

**DECISION 2 — the read-only stance.** (§163)
Sound for a PM Gantt, wrong for production, where interactive rescheduling *is*
the job. Sketched but not implemented: `onReschedule(proposal) → accepted |
rejected`. The load-bearing part is that **undo stays the caller's**, by keeping
the component controlled — optimistic internal mutation creates two sources of
truth, and that is where every "the Gantt and the ERP disagree" bug comes from.
Conflicts are computed and **reported, never enforced** (overtime gets
authorised, due dates get renegotiated). Permissions **gate the affordance** via
`canReschedule`, so a forbidden move is never offered.

**DECISION 3 — axis: settled, wall-clock with non-working shaded.** (§225)
Compression would turn one linear date→x map into a piecewise one at every call
site — placement, every connector endpoint, the now-marker, gridlines — a second
geometry that must agree with the first. It also collapses month columns to zero
width. Recorded as reversible: duration-proportional columns make compression a
one-function change later.

---

## Next up: the smaller gaps (the user's stated priority)

This was briefed and then paused; nothing was written. Do these **before** tier
(b), and stay React + core only.

**1. A fit-to-project view — the important one.**
`year` technically solved "see the whole plan" but badly: a calendar year is a
fixed window, so a Jul–Oct plan fills ~40% of the axis and Jan–Jun is empty.
Add a view whose range comes from the **data** — the span of all tasks, padded.
Open questions: whether it is a `GanttView` member or a separate prop (as a
member it breaks the invariant that range depends on `anchor`, so **prev / next
/ today become meaningless** — disable or hide them, do not leave them live and
inert); how column granularity is chosen from the span (make it a pure function
in core with pinned thresholds, not a ternary in the renderer); degenerate cases
— zero tasks, one task, tasks with no dates, a zero-width range; and whether it
should become the default view (my instinct is yes, it is the only view never
trivially wrong, but that changes a shipped default so flag it).

**2. The frozen pane is too wide.**
Year view needs ~1430px to avoid horizontal scroll: 468px of frozen pane
(Task / Assignees / Status / Variance) + 960px of axis. At the app's 1292px it
scrolls ~136px. Attack the pane — let callers choose columns, narrow the
defaults, collapse below a container width, or make it resizable. It should
degrade gracefully rather than just scroll.

**3. Keyboard navigation.**
`role="grid"`, `aria-rowcount` and `aria-rowindex` are in; APG arrow-key grid
navigation is not — today it is tab-through-bars, which is not a navigation
model at 10,000 rows. Implement arrows, Home/End, PageUp/PageDown, and **roving
tabindex so the grid is one tab stop**; expand/collapse must be keyboard
reachable. The hard part is the interaction with virtualization: moving focus to
an unmounted row must scroll it into view *and* survive the remount, or focus
lands on `<body>`. A focus-rescue mechanism already exists — make the two
cooperate rather than fight.

**Explicitly not in that batch:** bundle size (468kB / 145kB gzipped). Real, but
it is zen-ui's barrel export failing to tree-shake for any consumer using a
handful of components — a library-wide packaging change, not a Gantt gap.

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

`check:parity` reports 3 expected failures (`Gantt` + 10 types for
web-components; the view functions for Solid/vanilla). Not added to `divergent`
in `bindings.mjs`, because `check-parity.ts` says that list is for convergence
decisions and "do not use it to silence a component that is merely missing".

Other open items: no fit view (above); year needs ~1430px (above); partial a11y
(above); rows are windowed but **not** the connector layer, which is
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
