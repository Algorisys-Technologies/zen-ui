# Handoff

State at the end of the 2026-07-21 session. Written for whoever picks this up
with no memory of it — including me.

## Where things stand

**9.6.0 is released and deployed.** `dev == main == fc0c5ee`, tagged `v9.6.0`,
tree clean, `gh-pages` published. All four demo builds have been rebuilt onto
their dev bases after the deploy, so `preview` serves working pages.

Two releases went out this session: **9.5.0** (Timeline + UploadCollection) and
**9.6.0** (PlanningCalendar).

**The accepted Fiori Tier 4 list is now empty.** Micro charts, Timeline,
UploadCollection and PlanningCalendar are all shipped in all four bindings; the
rest of the tier was dropped on substance in the triage at `0902318`.

| what | state |
|---|---|
| Micro charts / Timeline / UploadCollection / PlanningCalendar | **done, all four bindings** |
| `bun run check` | **green** — parity and the new `check:planning` included |

Gates as measured on `fc0c5ee`:

| command | state |
|---|---|
| `bun run check` | exit 0 |
| `lint` / `lint:solid` / `lint:vanilla` / `lint:wc` | **0 problems each** — 215 / 215 / 203 / 194 files linted |
| `check:dist` | Button 17 kB gzip React / 16 Solid / 17 vanilla (budget 30); nine components 57 (budget 80) |
| `visual-check react` / `solid` | 91 routes each; only failure is `i.pravatar.cc` DNS on `/avatar`, sandbox-only |

**The Solid lint baseline was genuinely 1, not 0, for the whole previous
session** — CLAUDE.md and the old handoff both claimed 0. It is 0 now, and
CLAUDE.md records how it was measured. The warning was a `solid/reactivity`
false positive on the callback `tree-table`'s `getSubRows` RETURNS; the getter is
the tracked scope, so the callback is a snapshot by design.

## Pick up here

**Nothing is queued.** The roadmap item that drove the last three releases is
finished, so the next direction is a decision rather than a continuation — see
"Open, needing a decision" below, and `docs/fiori-gap-analysis.md` /
`docs/rp-shadcn-radix-gap.md` for what remains unbuilt.

The one piece of shippable work already scoped and agreed:

- **`Progress` renders `indeterminate` inconsistently and wrongly.** Kobalte
  sets no `--kb-progress-fill-width`, so Solid's fill spans 100% and a queued
  item reads as FINISHED; React's Radix version renders `translateX(-100%)`, an
  EMPTY track. Neither animates. The Solid doc comment already says
  `data-progress="indeterminate"` exists to be targeted; nothing targets it.
  Deliberately not folded into UploadCollection: it is a visual change to a
  shipped component, so a MAJOR bump — **10.0.0** — and a four-binding change of
  its own.

## What shipped, so a change does not undo the reasoning

### Timeline

Ordered list of events. `items`, `density` (`default | compact`),
`emptyMessage`. Four decisions are load-bearing rather than stylistic:

- **It is an `<ol>`.** Sequence is the whole subject.
- **The group heading is NOT an `<li>`.** It would inflate the announced count.
- **The rail is hidden on the LAST item.** A line past the final event reads as
  "more below".
- **Markers are `aria-hidden`.** They repeat the title.

Grouping is a `group` STRING on the item, not a `groupBy` function — deriving it
means guessing at the caller's timezone. `compact` DROPS the description rather
than shrinking type.

Vanilla deviates once, deliberately: the factory returns a wrapper `<div>`,
because `el` is handed out once and swapping the root between an `<ol>` and the
empty `<p>` on `update()` would leave the caller holding a detached node.

### UploadCollection

The list of files after they are picked. `items`, `onRemove`, `onRetry`,
`onRename`, `emptyMessage`, `disabled`.

- **Paired with FileUpload, not folded into it.** The drop zone is a control the
  user operates; the list is state the transport writes.
- **It does not own the upload.** No `url`, no `method`, no retry policy;
  `onRetry` hands the item back.
- **Actions are presence-gated** — in web-components, on the LISTENER, which
  `defineZenElement`'s opt-in event wiring gives for free.
- **It is a `<ul>`**, unlike Timeline: attachments have no sequence.
- `class` / `className` reaches the empty state as well as the list, so removing
  the last file does not resize the box.

### PlanningCalendar (9.6.0)

Resource-by-time grid. `rows`, `view`/`defaultView`/`onViewChange`, `views`,
`date`/`defaultDate`/`onDateChange`, `onAppointmentClick`, `now`, `hideToolbar`,
`emptyMessage`.

- **The maths is in `packages/core/src/planning.ts`**, pinned by
  `scripts/check-planning.ts` (60 assertions, in `bun run check`). Written FIRST,
  which is why three of the four ports were mechanical.
- **A month is ONE axis of 28–31 columns**, not a 6×7 page. Wrapping it into
  weeks gives each resource six rows and destroys the cross-row comparison the
  component exists for. A month page is `Calendar`.
- **Read-only by design.** Drag-to-move needs a conflict policy, an undo story
  and a permission model that belong to the caller.
- **Below ~3% width a block drops its label.** A 90-minute meeting is 0.9% of a
  week; a label there is an empty bordered pill that reads as a failed render,
  not as a clipped one. Name and time stay in the tooltip and accessible name.
- Times are the caller's local `Date`s, unconverted.

## Traps this session actually hit

All of these were green on tsc, eslint and the build.

- **Closing an inline editor removes a FOCUSED input, so the browser fires
  `blur` DURING the removal and re-enters the handler mid-call.** Two distinct
  bugs from one fact: Escape's discard was undone by the following commit, and
  Enter committed TWICE (in vanilla the second `replaceWith` also threw
  `NotFoundError`). **The guard must be set BEFORE the DOM is touched.**
  `input.isConnected` does NOT work — at blur time the node is still a child, so
  it reads `true`; that was measured doing exactly the wrong thing. It must also
  be per editing session, not per row: a stale `true` swallows the next edit.
- **Radix and Kobalte disagree about `indeterminate` Progress** (empty track vs
  full). Caught at the React port, which is what building Solid first is for —
  the same divergence found at binding four would have been three rewrites.
- **`showFileList` is a PROPERTY, not an attribute** on `<zen-file-upload>`,
  because it defaults TRUE and an absent boolean attribute resolves to `false`
  in `defineZenElement`. `setAttribute("show-file-list", "false")` is silently
  ignored.
- **A demo section whose handlers are no-ops demonstrates the opposite of its
  own point.** UploadCollection's "actions are presence-gated" section was wired
  with `() => {}` at first — controls that draw and do nothing, which is exactly
  what the section argues against. Every such section is live now, retry
  included.
- **A probe assertion can be wrong about a binding rather than the binding being
  wrong.** "No `<ul>` when empty" counted vanilla's `FileUpload` list, which
  stays in the DOM at `display:none` rather than being removed. Counting VISIBLE
  lists — and reporting both numbers — made all four agree.
- **JSON HAS NO DATE TYPE.** A `rows` json attribute on
  `<zen-planning-calendar>` carries ISO strings; unrevived, every appointment is
  `Invalid Date`, every placement returns `null`, and the grid renders an empty
  axis with no error anywhere. The element wraps the factory to revive them, and
  tolerates real `Date`s so the property route is not corrupted by the same code.
- **A dead toolbar over an empty list.** PlanningCalendar drew Previous / Today /
  Next and the view switcher with no resources, where none of them can change
  anything visible. Gated on rows now.
- **A grid that shrink-wraps is unreadable.** The calendar reported a 490px week
  whose columns were too narrow to read, because the demo container is a
  centring flex row. `w-full` on the root; the caller cannot fix it from outside
  without knowing the internals.
- **`cd packages/x && …` inside a chained command silently runs the rest
  somewhere else** when the `cd` fails because the shell is already there. One
  edit was written to the wrong package and a build ran in the wrong one. Use
  absolute paths.

## Verification recipe

Both components were verified by driving the built demo, not by reading it:

```bash
cd packages/<binding> && npx vite build --config vite.config.demo.ts
setsid npx vite preview --config vite.config.demo.ts --port 52xx --strictPort &
# run the playwright probe FROM THE REPO ROOT — playwright resolves there
```

Counts, so a future run can tell a real regression from a changed demo:

- **PlanningCalendar, 19 assertions x 4 bindings.** 7 Monday-first day columns;
  6 toolbar controls; the label `20 – 26 July 2026`; 10 blocks placed; the now
  line at 21.131% (35.5h into a 168h week) drawn once per row and GONE after
  Next; 31 month columns; 24 hour columns; an overlapping block in lane 2 while
  a touching one stays in lane 1; both clipped edges squared off, one summing to
  exactly 100%; a zero-length block still 0.5% wide; the click reporting
  appointment AND row; the empty state rendering neither grid nor toolbar. Plus
  a direct check that a `rows` json attribute of ISO strings revives into real
  `Date`s.
- **Timeline, 15 assertions x 4 bindings.** 5 events; headings
  `Today / Yesterday / 18 July`, 0 of 3 inside an `<li>`; rails `[1,1,1,1,0]`;
  5 of 5 markers `aria-hidden`; 5 machine-readable `<time>`; compact 5 items and
  0 body `<p>`; empty state 0 `<ol>`; RTL rail 7px → 437px of a 445px row.
- **UploadCollection, 18 assertions x 4 bindings.** 6 sections; 3 rows in a
  `<ul>` and 0 `<ol>`; 2 links across 3 rows; 0 buttons where no handler was
  passed; 1 progressbar across 5 lifecycle rows, `aria-valuenow ["63"]`;
  `Uploading… · 9.0 MB` and `Queued · 86.0 KB` in words; rename committing
  trimmed on Enter and discarding on Escape; empty → 2 rows → 1 after Remove;
  2 thumbnails with `alt=""` and non-zero natural size; empty state 0 `<ul>`.

**Report the COUNT of things examined, not just failures.** A geometric or DOM
assertion that matches nothing passes.

## Standing rules (do not re-derive)

- **npm publishing is OUT OF SCOPE.** Do not mention unpublished-to-registry
  status. "Ship it" = release notes + version bump + tag + `main` sync +
  `./deploy.sh --publish`.
- **One binding at a time**, Solid → React → vanilla → web-components. React
  remains the parity *reference* even though Solid is built first.
- **Rebuild all four demos after `./deploy.sh`** — it leaves them on the
  `/zen-ui/` base, which renders a blank page inside a working shell. Done for
  this deploy already.
- **Pure logic goes in `packages/core` with a `check:*` contract**, not in a
  binding. `planning.ts` is the fourth module to follow `chart` / `pivot` /
  `virtual-window`, and writing it first is what made three of four ports
  mechanical.

## Open, needing a decision from Rajesh

- **VariantManagement / p13n** — still blocked on a persistence story. Both are
  storage questions wearing a component costume.
- **DataTable's RTL column-resize grips** — left physical deliberately; they
  share maths with column pinning and sticky offsets. Small, unblocked, just not
  chosen yet.
- **Solid demo section count** — coverage is complete (every demo in every
  binding has at least one code example); Solid's demos still have fewer
  sections than React's.
