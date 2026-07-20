# Handoff

State at the end of the 2026-07-21 session (second half). Written for whoever
picks this up with no memory of it — including me.

This replaces the earlier 2026-07-21 handoff, which was written mid-Timeline and
is now entirely superseded.

## Where things stand

**9.5.0 is released and deployed.** `dev == main == fe3d7d3`, tagged `v9.5.0`,
tree clean, `gh-pages` published and verified by deploy's own checks. All four
demo builds have been rebuilt onto their dev bases after the deploy, so
`preview` serves working pages.

Everything in the previous handoff's "pick up here" list is done:

| what | state |
|---|---|
| Micro charts | shipped 9.4.0-era work, all four bindings |
| **Timeline** | **done, all four bindings** |
| **UploadCollection** | **done, all four bindings** |
| `bun run check` | **green** — parity included |

Gates as measured on `fe3d7d3`:

| command | state |
|---|---|
| `bun run check` | exit 0 |
| `lint` / `lint:solid` / `lint:vanilla` / `lint:wc` | **0 problems each** — 215 / 215 / 203 / 194 files linted |
| `check:dist` | Button 17 kB gzip React / 16 Solid / 17 vanilla (budget 30); nine components 57 (budget 80) |
| `visual-check react` / `solid` | 90 routes each; only failure is `i.pravatar.cc` DNS on `/avatar`, sandbox-only |

**The Solid lint baseline was genuinely 1, not 0, for the whole previous
session** — CLAUDE.md and the old handoff both claimed 0. It is 0 now, and
CLAUDE.md records how it was measured. The warning was a `solid/reactivity`
false positive on the callback `tree-table`'s `getSubRows` RETURNS; the getter is
the tracked scope, so the callback is a snapshot by design.

## Pick up here

**PlanningCalendar** — the last accepted item from the Fiori Tier 4 triage, and
by a wide margin the largest. It is a release of its own. Reasoning is in
`docs/fiori-gap-analysis.md`; the checklist is in `todo.md`.

Build order is unchanged: **Solid → React → vanilla → web-components**, one
binding finished and driven in a browser before the next starts. That order paid
for itself twice this session (see below).

One smaller item is queued and independent:

- **`Progress` renders `indeterminate` inconsistently and wrongly.** Kobalte
  sets no `--kb-progress-fill-width`, so Solid's fill spans 100% and a queued
  item reads as FINISHED; React's Radix version renders `translateX(-100%)`, an
  EMPTY track. Neither animates. The Solid doc comment already says
  `data-progress="indeterminate"` exists to be targeted; nothing targets it.
  Deliberately not folded into UploadCollection: it is a visual change to a
  shipped component, so a MAJOR bump and a four-binding change of its own.

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

## Open, needing a decision from Rajesh

- **VariantManagement / p13n** — still blocked on a persistence story. Both are
  storage questions wearing a component costume.
- **DataTable's RTL column-resize grips** — left physical deliberately; they
  share maths with column pinning and sticky offsets. Small, unblocked, just not
  chosen yet.
- **Solid demo section count** — coverage is complete (every demo in every
  binding has at least one code example); Solid's demos still have fewer
  sections than React's.
