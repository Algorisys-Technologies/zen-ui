# Handoff

State at the end of the 2026-07-21 session. Written for whoever picks this up
with no memory of it — including me.

This file replaces the 2026-07-16 handoff, which was written at 6.0.0 and had
gone entirely stale (its lint baselines, route counts and open questions were
all superseded). Nothing in it is still live.

## Where things stand

`dev == origin/dev == d43b3e2`, tree clean, all four demo builds on their dev
bases. Last release is **9.4.0** (`13a5b5f`, tagged `v9.4.0`; `main` and
`gh-pages` both current; site deployed and verified by deploy's own checks).

**There is unreleased work on top of 9.4.0** — six commits, all additive:

| commit | what |
|---|---|
| `0902318` | Fiori Tier 4 triaged into dropped / accepted |
| `b9ad1c1` `f5e672d` `7a83728` | Micro charts — **complete, all four bindings** |
| `3579c35` `d43b3e2` | Timeline — **Solid and React only** |

`bun run check` is **red right now, and that is expected**: `check:parity`
reports Timeline as existing in two bindings of four. It goes green when the
vanilla and web-components ports land. Do not "fix" it by deleting anything.

## Pick up here

**Port Timeline to vanilla, then web-components.** Build order is
Solid → React → vanilla → web-components (CLAUDE.md, "Do ONE binding at a
time"). Solid and React are done and are the thing to port FROM.

1. `packages/vanilla/src/components/timeline/timeline.ts` — factory returning
   `ZenComponent`, mirroring `packages/react/src/components/timeline/timeline.tsx`.
   Data-driven: `items: TimelineItem[]`.
2. Export from `packages/vanilla/src/index.ts`; demo at
   `packages/vanilla/src/components/TimelineDemo.ts`; route in `main.ts`; entry
   in `nav.ts`.
3. `packages/web-components/src/elements/timeline.ts` — `<zen-timeline>` with
   `items` as a **json attr + property** (it is an array whose entries carry
   nodes). Register in `elements/index.ts`; re-export the names in `src/index.ts`.
4. **`bun run build:lib:vanilla` before typechecking web-components** — wc
   resolves vanilla through its `dist`, so a new export is invisible until the
   lib rebuilds. This bit once already this session.
5. `bun run gen:agent-guide`, then `bun run check` should be green again.

Then, in order: **UploadCollection**, then **PlanningCalendar** (large enough to
be its own release). Reasoning for the order is in
`docs/fiori-gap-analysis.md`; the checklist is in `todo.md`.

Suggested release shape: fold Timeline and UploadCollection into one **9.5.0**
rather than cutting a release per component.

## What Timeline is, so the port matches

An ordered list of events — audit trail, order history, ticket comments.
Data-driven, not compound. Props: `items`, `density` (`"default" | "compact"`),
`emptyMessage`, plus `class` / `className`.

`TimelineItem`: `id`, `title`, `description?`, `timestamp?` (display string),
`dateTime?` (machine-readable), `icon?`, `state?`
(`default | info | success | warning | error`), `group?`, `children?`.

Four decisions the port must preserve — each is load-bearing, not styling:

- **It is an `<ol>`.** A div stack tells a screen-reader user nothing about
  sequence or length, and sequence is the whole subject of the component.
- **The group heading is NOT an `<li>`.** It is not one of the events, and
  putting it in the list inflates the count a screen reader announces.
- **The rail is hidden on the LAST item.** A line running past the final event
  reads as "more below", which is exactly wrong at the end.
- **Markers are `aria-hidden`.** They repeat the title, and "image, check
  circle" before every entry is noise.

Grouping is a `group` **string on the item**, deliberately not a `groupBy`
function: the caller already knows whether two events fall on the same day, and
deriving it here means guessing at their timezone and their idea of "today".

`density="compact"` **drops** the description and body rather than shrinking
type. In a narrow sidebar a two-line description wraps to five and the sequence
stops being scannable, which was the only reason the timeline was there.

## Verification recipe

Every bug found this session was green on tsc, eslint and the build. Drive it:

```bash
cd packages/<binding> && npx vite build --config vite.config.demo.ts
setsid npx vite preview --config vite.config.demo.ts --port 5197 --strictPort &
# then run the playwright probe FROM THE REPO ROOT — playwright resolves there
```

The Timeline probe asserted, per binding: 5 events; headings
`TODAY / YESTERDAY / 18 JULY` **not** inside `<li>`; rail present on items 1–4
and absent on 5; every marker `aria-hidden`; `time[datetime]` machine-readable;
compact rendering 5 items and **zero** body `<p>`; the empty state rendering a
message and **no `<ol>`**; and under RTL the rail moving to the right-hand side
of the row. Reproduce those exact numbers in vanilla and web-components.

**Report the COUNT of things examined, not just failures.** A geometric
assertion that matches nothing passes.

One known false alarm, so it is not re-investigated: React's demo page reports
**6** `<ol>` where Solid reports 5. The extra is **Radix Toast's viewport**
(fixed, zero items, outside `.demo-page`). Solid uses solid-toast, which renders
no list. That is the Toast divergence already recorded in `scripts/bindings.mjs`.

## Traps this session actually hit

Each of these was green on tsc, eslint and the build:

- **`zen-fill-*` / `zen-stroke-*` DO NOT GENERATE** under this preset. The micro
  chart bullet track computed to black and the radial ring to `none` — invisible
  rather than obviously broken. Use `var(--zen-color-*)` directly in SVG.
- **React renames SVG attributes to camelCase**, and a missed rename renders as
  nothing at all. Assert computed `strokeWidth` / `strokeDasharray` /
  `textAnchor`, not the markup.
- **`document.createElement("svg")` yields an HTMLUnknownElement.** It parses,
  attaches, reports 0×0 and draws nothing, silently. Vanilla SVG must go through
  `createElementNS`; assert `namespaceURI` in the probe.
- **A solution-style `tsconfig.json`** (`{"files": [], "references": [...]}` — what
  `packages/vanilla` and `packages/web-components` have at their root) compiles an
  EMPTY program and exits 0 on any code. Use `-p tsconfig.app.json` and confirm
  with `--listFiles | grep -c <name>`. It passed twice on a broken file.
- **An absent boolean ATTRIBUTE resolves to `false`** in `defineZenElement`, so a
  default-TRUE flag declared as an attr silently inverts for every HTML author.
  Default-true booleans go in `props`. (`lib/define.ts:194` says so; I broke it
  anyway.)
- **Backticks inside `git commit -m "..."` are shell-interpreted** and silently
  delete the identifiers that make a message useful. Use `-F -` with a quoted
  heredoc.
- **`eslint-disable-next-line` must be the LAST line before the reported line**,
  and for a multi-line call the rule reports the INNER line — so a block
  `/* eslint-disable */` is the only form that reaches it.

## Standing rules (do not re-derive)

- **npm publishing is OUT OF SCOPE.** Do not mention unpublished-to-registry
  status. "Ship it" = release notes + version bump + tag + `main` sync +
  `./deploy.sh --publish`. That is the whole of it.
- **One binding at a time**, Solid → React → vanilla → web-components. React
  remains the parity *reference* even though Solid is built first. This rule
  caught four TreeTable bugs and three micro-chart bugs that existed only as
  differences between bindings.
- **Rebuild all four demos after `./deploy.sh`** — it leaves them on the
  `/zen-ui/` base, which renders a blank page inside a working shell with no
  console errors beyond 404s.

## Current baselines (measured 2026-07-21)

| command | state |
|---|---|
| `bun run lint` / `lint:solid` | **0 problems each.** Any finding is yours |
| `bun run check:dist` | Button 17 kB gzip React / 16 kB Solid / 17 kB vanilla (budget 30); nine components 57 (budget 80) |
| `visual-check react` / `solid` | 87 routes each; only failure is `i.pravatar.cc` DNS on `/avatar`, sandbox-only |

The Solid lint baseline was recorded in CLAUDE.md as 0 when it was actually 3.
It is genuinely 0 now. Measure before quoting a delta — including this table.

## Decisions settled this session

- **Fiori Tier 4 triaged** (`0902318`). ~60% dropped on substance rather than
  cost: smart controls are metadata-driven against OData V2 annotations, and
  without the annotations a SmartTable *is* `DataTable` — there is no UI idea
  left to port. Same for Launchpad tiles, SemanticPage, Analytical Card,
  T-Account, Calculation Builder. Accepted: micro charts ✅, Timeline (in
  progress), UploadCollection, PlanningCalendar.
- **TreeTable is a separate component from DataTable**, because hierarchy and
  grouping claim the same `subRows` / `expanded` / chevron slots — one table
  cannot hold both.
- **TreeTable pagination pages the ROOTS** (TanStack's
  `paginateExpandedRows: false`), so a page carries whole subtrees. Paging the
  flattened list orphans children on the next page.
- **Virtualization uses spacer rows, not a grid clone.** A treegrid is exactly
  where abandoning real `<table>` markup would cost the row and cell roles.
- **Delta micro chart derives its own colour** from direction; `color` overrides
  it only for the case where up is bad (cost, churn, latency).

## Open, needing a decision from Rajesh

- **VariantManagement / p13n** — still blocked on a persistence story. Both are
  storage questions wearing a component costume.
- **DataTable's RTL column-resize grips** — left physical deliberately; they
  share maths with column pinning and sticky offsets. Small, unblocked, just not
  chosen yet.
- **Solid demo section count** — 308 code snippets to React's 450. Coverage is
  complete (every demo in every binding has at least one); the section count is
  not.
