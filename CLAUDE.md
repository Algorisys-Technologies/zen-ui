# zen-ui

Bun workspace. A shadcn/Radix-style component library published as four
framework bindings that share one design core. The canonical binding list —
what every release, parity and packaging check drives from — is
[scripts/bindings.mjs](scripts/bindings.mjs); React is the reference the others
mirror.

| Package | What it is |
|---|---|
| `packages/core` — `@algorisys/zen-ui-core` | Framework-agnostic: design tokens, UnoCSS theme + prefix, `cn()`, theme primitives. Private, consumed via workspace link. |
| `packages/react` — `@algorisys/zen-ui-react` | React binding (Radix-backed) **+ the demo app** in the same `src/`. The reference implementation of the API. |
| `packages/solid` — `@algorisys/zen-ui-solid` | Solid binding (Kobalte-backed) + its demo. Mirrors the React API. Ships a server (SSR) build alongside the DOM one. |
| `packages/vanilla` — `@algorisys/zen-ui-vanilla` | No-framework binding + its demo. Data-driven factories rendering into the light DOM; data-driven families take `items` rather than compound children. |
| `packages/web-components` — `@algorisys/zen-ui-web-components` | Native custom elements (`<zen-button>`, …) — a declarative layer over the vanilla factories, re-exporting its surface verbatim. |
| `apps/landing` | Marketing page. Ships CSS to nobody; depends on `core` only. |

**Licensed PolyForm Noncommercial 1.0.0 — source-available, not open source.**
Free for personal, hobby, educational, research, charity and government use;
commercial use needs a separate licence. See [Licence](#licence) below before
describing this project anywhere.

## Development guidelines

**Read [LOOPS.md](LOOPS.md) before doing substantial work in this repo.** It is
the engineering contract: 40 rules across 7 tiers covering read-before-write,
scope lock, verification, TDD, deviation rules, comment style, and safety.

**It is also the reference for autonomous development over long periods** —
Tier 6 (Agent Loops, rules XXVII–XXXV) covers writing the loop rather than the
prompt, separating roles, negotiating the contract first, writing state to disk
instead of context, letting the loop restart, scoring subjective work, reading
traces, and deleting the harness. Tier 5 (XXIII–XXVI) covers the traceability
that makes a long unattended run recoverable: changelog, `IMPLEMENT.md`
tracking, and keeping state resumable.

**The design review is [impeccable](.claude/skills/impeccable), installed
project-scoped and version-controlled with the code it reviews.** LOOPS.md
governs whether the code is correct; impeccable governs whether the design is
*chosen* rather than defaulted-into. `/impeccable audit <target>` is the full
pass; a PostToolUse hook (`.claude/settings.json`) runs its deterministic
detectors after every Edit/Write/MultiEdit and reports as a system reminder.

Two notes on applying it here, because it is written for whole brands and this
is a component library:

- **Scope.** It bites hardest on [apps/landing](apps/landing) and on demo
  pages, which are compositions someone reads as a page. For a primitive, the
  live entries are the execution ones — centre what you meant to centre and
  prove it, clear the cut, no default all-around shadow, no glow, real
  contrast, no dead controls, and never hide content behind an entrance
  animation.
- **Its em-dash rule is about marketing prose, and this repo's docs, comments
  and commit messages deliberately use them.** Do not sweep them out of
  engineering writing on a design tool's authority. The `em-dash-overuse`
  detector cannot actually reach them — it reads rendered UI body text, not
  markdown or code comments (measured: a 53-em-dash CLAUDE.md and an
  11-em-dash .tsx both come back clean) — so if em dashes are ever "found" in
  this repo's prose, that is a human or an agent generalising, not the tool.
  Where a design rule and a direct instruction from the user conflict, the user
  wins; that applies to the conventions already established in this repo too.

## Commands

Run from the repo root (Bun workspaces; Node 22.12.0 via `.nvmrc`):

```bash
bun install

bun run dev:all          # every demo behind one URL -> localhost:5170

bun run dev              # React demo   (base /builder)
bun run dev:solid        # Solid demo   (base /builder-solid)
bun run dev:landing

bun run build:lib        # publishable React lib -> packages/react/dist
bun run build:lib:solid
bun run lint             # lint:solid for the Solid binding

bun run check            # every pure-logic contract + typechecks the scripts themselves

./deploy.sh              # build the whole site -> dist-site/, verify, publish nothing
./deploy.sh --preview    # …and serve it exactly as GitHub Pages will
./deploy.sh --publish    # …and push it to the gh-pages branch
```

`deploy.sh` assembles the landing page and both demos into one tree —
`/zen-ui/`, `/zen-ui/builder/`, `/zen-ui/builder-solid/` — and is the only place
that knows the deploy base. The three vite configs still say `/`, `/builder/`
and `/builder-solid/`, which are the right answers for `dev:all` and the wrong
ones for Pages; the apps read the real base back through
`import.meta.env.BASE_URL` for their router basenames and cross-links, so
nothing is hardcoded twice. Two things there will bite an edit:

- **A wrong base fails silently in three different ways** — the router matches
  nothing and renders a blank page inside a working shell, the landing page's
  demo links walk off the deployment, and the CSS 404s into an unstyled page.
  None of it fails the build. `scripts/check-site.mjs` drives the built tree for
  that reason; `scripts/serve-site.mjs` reproduces Pages' real semantics (serve
  the file, else the **root** `404.html` — not `index.html`, which is what every
  SPA dev server does and exactly what hides this).
- **Deep links need the 404 bounce.** `/zen-ui/builder/carousel` is not a file.
  The root `404.html` works out which app was wanted and re-enters it with the
  route in `?p=`. It matches on `builder/` **with the slash** — `builder` is a
  prefix of `builder-solid`, the same trap the dev hub's proxy table hit.

`dev:all` is the one to reach for when comparing the bindings: React and Solid
cannot share a vite server (the two JSX transforms fight over the same files),
so it runs one child server per app on an OS-assigned free port and routes to
them. You open one port; the split stays an implementation detail. Adding a
framework is one entry in [scripts/demos.mjs](scripts/demos.mjs) — the proxy
table and the spawned servers both derive from it.

It serves the same shape `./deploy.sh` publishes, one prefix down:

| dev:all | GitHub Pages | what |
|---|---|---|
| `/` | `/zen-ui/` | the landing page — the home |
| `/builder/` | `/zen-ui/builder/` | the React demo |
| `/builder-solid/` | `/zen-ui/builder-solid/` | the Solid demo |

**The landing page is the home in both, deliberately.** There used to be a
hand-written hub page at `/` instead, with the landing page linked on its own
port because the hub had already taken `/` — two home pages, one of which
nobody would remember to update. The hub is gone. The landing page is not
re-based to get here: it stays at `base: "/"` and its links to the demos resolve
against `import.meta.env.BASE_URL`, which is what lets the same page be the home
at `/` in dev and at `/zen-ui/` on Pages.

Three things that bit while building it, and will bite the next edit:

- **A base that is a prefix of another base silently mis-routes.** `/builder` is
  a prefix of `/builder-solid`, so a plain string proxy key sent every Solid URL
  to the React server, which answered with its own 404 — while the router
  started perfectly and the page looked right. The keys are anchored regexes
  (`^/builder(/|$)`) for that reason — do not "simplify" them back. `/` is the
  one exception: it is the catch-all (`^/`), because `^/(/|$)` would match only
  `/` itself and drop every asset. **The table is sorted longest-base-first** so
  the catch-all cannot swallow `/builder` before it is reached.
- **Killing a detached child right after spawning it races setsid().**
  `detached: true` means the child calls `setsid()` *after* the fork, so
  `process.kill(-pid)` fired milliseconds later throws `ESRCH`, the signal
  reaches nobody, and the child survives as an orphan holding its port — where
  it answers the next run's health check. The router failing on a taken port
  does exactly this, and stranded four vite servers. `killGroup()` retries through
  `ESRCH` for that reason.
- **Child ports are deliberately not pinned.** Vite's default 5173 is probably
  already taken by your own `bun run dev`, and nobody types the child ports
  anyway.

Note `build` (demo) and `build:lib` (library) both write to `packages/*/dist`
and clobber each other — rebuild the lib before inspecting `dist/style.css`.

### Verification traps — all three have produced false passes here

- **`tsconfig.lib.json` cannot see demos.** It excludes `src/**/*Demo.tsx`, so
  `tsc --project tsconfig.lib.json --noEmit` reports clean on a demo containing a
  hard type error. For demo files use `--project tsconfig.app.json`, which `npm
  run build` (`tsc -b`) also covers.
- **A solution-style `tsconfig.json` type-checks NOTHING.** `packages/vanilla`
  and `packages/web-components` have `{"files": [], "references": [...]}` at
  `tsconfig.json`, so `tsc --noEmit -p tsconfig.json` compiles an empty program
  and exits 0 — on any code, including a file with errors. Measured: a brand-new
  component came back clean twice before `--listFiles | grep -c <name>` showed
  **0**. Use `-p tsconfig.app.json`, or `tsc -b`, and confirm the file is in the
  program before believing the result.
- **A syntax error in ONE file silently disables type-checking for the whole
  project** — tsc bails before the semantic pass, so every other file reports
  clean. If a run looks suspiciously green, check for parse errors first.
- **Lint baselines**: **all four bindings are clean — 0 problems each**
  (measured 2026-07-21 over 215 React, 215 Solid, 203 vanilla and 194
  web-components files; was React 29 and Solid 8 errors / 46 warnings). **Any
  finding is therefore yours.** Measure before you claim a delta; a stated
  baseline that is off by one turns "adds nothing" into "adds one" — this line
  itself claimed 0 for Solid through a session in which it was really 1
  (`tree-table.tsx`, a `solid/reactivity` false positive on the callback
  `getSubRows` RETURNS; the getter is the tracked scope, so the callback is a
  snapshot by design). It is disabled at the site with that reason now, which is
  what makes the 0 true rather than asserted.
  Getting Solid to zero was triage, not suppression, and the distinction is the
  point: 11 warnings were real and fixed (handlers bound once at setup; an early
  return reading a signal; a component prop captured in a const instead of
  `<Dynamic>`), and the rest are disabled INDIVIDUALLY with the reason at the
  site. A disable without one is just a louder way of ignoring it.
  Two rules are scoped in config rather than obeyed:
  `react-refresh/only-export-components` is off for library source (Fast Refresh
  is an app concern; the alternative was splitting 17 files so their `cva()`
  variants live elsewhere), and `solid/no-destructure` is off around DataTable's
  column factory (TanStack `ColumnDef` renderers destructure a plain cell
  CONTEXT, which the rule cannot tell from reactive props).
  **Two things the triage settled that are worth not re-deriving.** An IIFE
  returning JSX *is* reactive — Solid hoists its body into the arrow it passes to
  `insert()`, verified by compiling the pattern with `babel-preset-solid` against
  reactive and static controls. And an `eslint-disable-next-line` must be the
  LAST line before the reported line: prose between the two makes the directive
  unused AND leaves the warning firing, which reads as the fix not working.

- **A CSS import that resolves to nothing still builds green.** A dependency's
  `exports` map can block a subpath (`ERR_PACKAGE_PATH_NOT_EXPORTED`) and Vite
  drops the import silently rather than erroring — the build passes and the
  component renders unstyled. RichText shipped exactly this: jodit's toolbar
  icons have no width attribute, so with no stylesheet they expanded to a 930px
  chevron. If you import a dep's CSS, assert it reached the bundle
  (`grep <a-known-class> dist/assets/*.css`), not merely that the build passed.
- **A failed command looks identical to a clean one** when you grep its output
  for error lines. `lint:solid` returned "0 issues" for a long time purely
  because ESLint aborted on a missing config. Assert the tool actually ran.
- **`bun run build` builds REACT ONLY** — it is
  `bun --filter @algorisys/zen-ui-react build`, despite the bare name. The other
  three demos need `build:solid` / `build:vanilla` / `build:wc`. This bites
  hardest right after `./deploy.sh`, which rebuilds every demo with the
  `/zen-ui/` base: `bun run build` then restores React only, and the other three
  keep a base that 404s every asset. They render a **blank page inside a working
  shell** — no page errors, no console errors beyond the 404s — so
  `visual-check` reports the route count and "no runtime errors" for a demo that
  drew nothing. Measured 2026-07-20; it produced two false readings in one
  session. After any `deploy.sh`, rebuild all four, and check
  `grep -o 'src="[^"]*"' packages/*/dist-demo/index.html` before trusting a
  browser check.
- **A geometric or DOM assertion that finds nothing passes.** A check for
  "no overlapping elements" reported clean across four bindings while it had
  matched elements in only one. Always report the COUNT of things examined
  alongside the count of failures — a pass with a zero denominator is not a
  pass.

Green output is not evidence. Prefer running the thing: `node
scripts/visual-check.mjs <react|solid> [routes…]` boots the demo's preview
server, screenshots each route from `nav.ts`, and reports per-route console and
page errors. A build says nothing about whether a panel is clipped, a switch
landed on the wrong side, or a class silently generated no CSS — all three have
shipped here.

## CSS conventions — read before touching a component

The full rationale is in [docs/css-interop.md](docs/css-interop.md). The rules
that bite:

- **Utilities are prefixed `zen-`.** Variants sit *outside* the prefix:
  `hover:zen-bg-zen-primary`, `-zen-mt-2`, `!zen-p-4`, `data-[state=open]:zen-p-4`.
  Anchors are prefixed too (`zen-group`, `zen-peer`).
- **`ZEN_PREFIX`** in `packages/core/src/uno-preset.ts` is shared by every
  binding's `uno.config.ts` *and* by `cn()`. They must not drift apart.
- **Never ship page-level or element-level CSS from a library entry.** The
  published stylesheet may only touch elements zen-ui renders and `--zen-*`
  custom properties. `index.css` belongs to the demo (`main.tsx`), not to
  `index.ts`. The element reset is opt-in via the `/preflight` export.
- **No raw `rem` literals in component source.** Use utilities or `--zen-*`
  tokens. The repo used to assume `html { font-size: 62.5% }` (1rem = 10px);
  that rule is gone, so any bare `1.4rem` is a magic number that no longer means
  what it says.
- **Hand-written animation classes are `zen-anim-*`, not `zen-animate-*`** —
  under the prefix, `zen-animate-fade-in` parses as `animate-fade-in`, a real
  UnoCSS built-in, and Uno emits a competing rule. (`zen-animate-spin` /
  `zen-animate-pulse` *are* genuine Uno utilities.)
- `apps/landing` is deliberately unprefixed — it has nothing to collide with.

## Binding parity — React and Solid must stay in sync

**A component added to one binding must be added to the other.** The two are one
design system with two renderers; a component that exists only in React is a
bug, not a roadmap item. The same applies to props, variants and behaviour: if
you change a component's API in one binding, change it in the other in the same
change.

### Do ONE binding at a time

Parity is about where you finish, not how you get there. **Build and verify a
feature completely in one binding before starting the next.**

**Build order is Solid → React → vanilla → web-components.** Solid is the most
constrained renderer — fine-grained reactivity means a prop read outside a
tracked scope silently freezes, and Kobalte's primitives are the ones that most
often lack an escape hatch React's Radix equivalents have. Those constraints are
discovered, not predicted. Hitting them first shapes an API that survives the
port; hitting them fourth means redesigning something already shipped three
times.

Finish means: it works, you have driven it in a browser, and the checks pass.
Only then port it.

**`check:parity` is red for the whole port, by construction.** A component that
exists in one binding and not the others is exactly what it reports, so it will
fail from the first binding until the last. That is the rule working, not a
break — but it means `bun run check` cannot be your green light mid-port, and a
commit landed in that window should say so. Get it green before shipping.

**This is the build order, not the authority order.** React is still the parity
REFERENCE — `scripts/bindings.mjs` says so and `check-parity.ts` drives from it,
so where two bindings disagree about what an API *should be*, React's shape
wins. Building Solid first is about finding the constraints early; it does not
promote Solid to the arbiter. If Solid's implementation pushes toward an API
React would not naturally have, that is the moment to reconcile — before the
React port, not after.

The failure mode this exists to prevent is editing all four at once and
verifying none of them. It is seductive because the edits look identical, and
that is exactly the trap: they are four different renderers, so "the same
change" is a claim, not a fact. A four-binding sweep that turns out to be wrong
is also four times the diff to unpick, and the mistake is usually in the one you
looked at least.

It costs a little more wall-clock and it buys a working reference to port FROM,
which is the thing that makes the port mechanical instead of speculative.

The demos must match too — same routes, same sections, same code examples.

Current state (was: 10 families missing from Solid, and code examples in 1/48 of
its demos):

- **Exports**: React 521, Solid 530, vanilla 495, web-components 499 (measured
  2026-07-21 by `check:parity`, which prints all four — read them from there
  rather than from this line). Every binding ships the same components. The real
  deltas:
  - **Toast** — a genuine API divergence, not a missing port: React wraps Radix
    Toast primitives, Solid uses solid-toast. Decide whether to converge the API
    before "porting" it.
  - **Select** — React exports the Radix compound parts (`SelectTrigger`,
    `SelectContent`, …); Solid exports a single `Select` with `options`. Also a
    divergence rather than a gap.
  - **Prop types** — closed. The gap read as ~33 names, but only **6** were
    real (a type that existed and was simply not exported: `TableProps` in
    React; `CameraProps`, `MapProps`, `PaginationProps`, `RichTextProps`,
    `SidebarProviderProps` in Solid). The other 27 are Solid-only because React
    declares no equivalent — it types its Radix wrappers with
    `React.ComponentPropsWithoutRef<typeof X>` rather than a named interface.
    That is a structural difference between the two libraries, not a gap, and
    "export it" is not the fix. Measure with the script below before believing
    a number here, including this one.
- **Code examples** (measured 2026-07-20, `grep -c 'code:\|code={'`): React
  450, vanilla 407, web-components 407, Solid 308. **Every demo in every binding
  now has at least one**; the last two without were Solid's FAB and BoundFields,
  which were 22- and 18-line stubs with no `DemoSection` at all — BoundFields
  rendered the whole Form demo inside itself, second `<h1>` and all.
  The remaining spread is section COUNT, not coverage: Solid's demos have fewer
  sections than React's. Measure before quoting a number here — the previous
  version of this line said "React 54/54, Solid 55/57" and had not counted
  vanilla or web-components at all, which turned out to be ahead of Solid.
- **`<label for>` association — fixed in Solid, was never broken in React or
  vanilla.** The old note here claimed all three bindings landed a caller's `id`
  on a wrapper. Measured, that was only true of **Solid**: Kobalte puts the
  caller's `id` on the root `<div role="group">` and derives `${id}-input` for the
  control, so `<label for={id}>` pointed at a non-labelable div. React (Radix) and
  vanilla put the `id` on a `<button role="checkbox|radio">`, and a `<button>` **is**
  a labelable element — verified in a browser that `<label for>` both names and
  toggles it. The Solid fix routes the caller's `id` to the native control:
  Checkbox → `Checkbox.Input`, RadioGroupItem → `ItemInput`, Select → the
  `Trigger` button. Verified: clicking the external label now toggles/selects the
  Solid control.

Before adding anything new, check the delta:

```bash
# component exports present in one binding but not the other
diff <(grep -oE 'export \{ [A-Z][A-Za-z]+' packages/react/src/index.ts | sort -u) \
     <(grep -oE 'export \{ [A-Z][A-Za-z]+' packages/solid/src/index.ts | sort -u)
```

When porting, port behaviour rather than syntax, and mirror the React API —
see LOOPS.md rule XXXVI. Solid's `PopoverContent` once accepted only
`class`/`children` while React's forwarded everything, which silently dropped
`style` and clipped the NotificationsInbox panel. That class of bug is what
parity prevents.

## Demo conventions

Each binding has one `src/nav.ts` — the single source of truth for **both** the
sidebar and the landing-page catalogue. Adding a component means: add it to
`nav.ts`, add its `<Route>`. Nothing else. (They were previously two hand-kept
lists and drifted 16 entries apart.)

`AGENTS.md` (repo root, plus one per package, published in each package's
`files`) is the guide a consumer's LLM agent reads to pick the right component
and binding. It is **generated from the React `nav.ts` `description` fields** by
`scripts/gen-agent-guide.ts` — never hand-edit it. After changing `nav.ts`, run
`bun run gen:agent-guide`; `bun run check:agent-guide` (part of `bun run check`)
fails if the committed files are stale, so a new component cannot land in the
catalogue without also landing in the agent guide. Per-binding *idiom* and the
*divergences* section (Select, Toast, data-driven factories) are edited in the
generator itself, not in the output.

## "Ship it" — the release procedure

When the user says **"ship it"**, that is the whole instruction. It means: write
the release notes, bump the version, sync `main`. Do all of it; do not ask which
part.

### 1. Decide the version

All published packages carry **one** version and bump together, including the
ones with no changes — that is `core` plus every binding in
[scripts/bindings.mjs](scripts/bindings.mjs) (currently five: `core`, `react`,
`solid`, `vanilla`, `web-components`; `check:release` drives the set from that
registry, so bump whatever it lists, not a number hardcoded here). They ship one
API — two version numbers describing it would only diverge, and force every
question to start by naming a binding. `apps/landing` is exempt: it is an
unpublished page, its `0.0.0` is deliberate, and it *displays* core's version
rather than owning one.

Pick it from what actually changed, not from how big the diff felt:

| Bump | When |
|---|---|
| **major** | A consumer's working code stops working, or starts looking different. Renamed or removed prop, changed default, new required peer, altered visual output. |
| **minor** | New component, new prop, new variant — additive only. |
| **patch** | A bug fix that changes nothing anyone was relying on. |

**A visual change is breaking.** A component library's output *is* its API; a
restyle that reflows someone's page breaks them as surely as a renamed prop.
3.0.0 was major because the element reset became opt-in.

### 2. Write `release-notes/<version>.md`

This is the part with no shortcut. It is prose for **someone who uses zen-ui and
does not work on it** — they do not know the file you touched or the issue
number, and "misc fixes" tells them nothing.

- **Lead with what breaks**, and show the upgrade in code. A breaking change
  with no migration line is a bug report from every consumer.
- **Name the bug, not the commit.** "Dialogs were unreadable in dark mode —
  about 1.2:1" beats "fix dialog tokens".
- **Say what a thing is for**, not that it exists. "Pick 'Last 7 days' and the
  filter stores the period, not the two dates it means today" beats "added
  `DynamicDateRange`."
- **Skip the churn.** Refactors, tests and internal renames go in
  `CHANGELOG.md`. A reader who upgrades cannot act on them.
- Follow [3.0.0.md](release-notes/3.0.0.md).

> **`.gitignore` has `*.md`, and it matches at any depth.** The folder is
> allowlisted (`!release-notes/**/*.md`). If you rename or move it, allowlist the
> new path or the notes are silently untracked — a release note that does not
> ship is the one failure mode this folder exists to prevent.

### 3. Update the other three places, because a release lives in four

Nothing generates these from each other; they are four audiences and merging
them would lose the distinction. `bun run check:release` asserts they name the
same version — it will not tell you the prose is stale.

| File | Audience | What it wants |
|---|---|---|
| `release-notes/<v>.md` | users upgrading | the prose above |
| `CHANGELOG.md` | maintainers | Keep a Changelog, the churn included |
| `packages/core/src/release-notes.ts` | the demo footer chip | one line per change; one copy in core, every binding re-exports it |
| every published `package.json` | consumers | the number — `core` + each binding in [scripts/bindings.mjs](scripts/bindings.mjs) (five today) |

`release-notes.ts` is capped at 10 entries but sorts breaking-first via
`KIND_PRIORITY`, so a breaking change cannot fall off the end.

### 4. Ship

```bash
bun run check          # pure-logic contracts, incl. check:release
bun run check:dist     # builds both libs, then check:package + check:size
bun run lint           # and lint:solid / lint:vanilla / lint:wc — 0 problems each
node scripts/visual-check.mjs react && node scripts/visual-check.mjs solid

git commit && git tag v<version>
git checkout main && git merge --ff-only dev && git push origin main --tags
git checkout dev && git push origin dev

./deploy.sh --publish
```

**`git push origin dev` is not optional, and it is the step that gets
forgotten.** This block used to end at `git checkout dev`, which pushes `main`
and the tags and leaves the remote's `dev` exactly where it was. Nothing is lost
— the commits are on `main` and under the tag — but the branch everyone treats
as the tip is the one that silently falls behind, and it fails quietly: `git
status` on your machine says nothing, because it compares against a remote you
have not pushed to. Measured 2026-07-21: `origin/dev` was **22 commits** behind,
across two releases, before anyone looked.

`deploy.sh` rebuilds `packages/*/dist` with the `/zen-ui/` base — **it clobbers
your local demo builds.** Rebuild after deploying, or the next `preview` serves
a demo whose asset URLs all point at `/zen-ui/`.

**`check:dist` and `visual-check` want opposite `dist` contents**, because
`build` (demo) and `build:lib` (library) write to the same folder. Run
`check:dist` last, or re-run whichever build the other clobbered — a
`check:size` failure that says "dist is missing" usually means a demo build
overwrote the library.

### What the dist checks are for

Both guard failures that were invisible to every other check in the repo, and
both shipped:

- **`check:size`** builds real consumer apps and weighs the gzipped output. A
  `<Button>` cost 151 kB — 59% of the whole library — because the package was
  one bundled module with no `sideEffects`, so nothing could be dropped. A build
  log cannot see this; the number on disk cannot either (`dist/index.js` is
  ~1.1 MB by design, whitespace preserved so `@__PURE__` annotations survive for
  the consumer's bundler). **The two settings only work together** — fixing
  either alone measures as a no-op, which is exactly how it survived. If a budget
  trips, run `node scripts/check-bundle-size.mjs --report` and find which import
  chain grew. Do not raise the budget to make it pass.
- **`check:package`** asserts every path `package.json` promises exists on a
  **clean** `dist`. Both bindings shipped `"types"` pointing at a file the build
  never wrote, so consumers got no TypeScript at all — and it survived a release
  because `emptyOutDir: false` kept a stale `index.d.ts` alive on any machine
  that had built the old layout once. `rm -rf dist` before believing `dist`.

**Neither of them checks that the package can actually be INSTALLED, and that
broke every distribution route at once.** `@algorisys/zen-ui-core` sat in each
binding's `dependencies` as `workspace:*` — a protocol that resolves only inside
this monorepo. Outside it every installer fails hard (`npm`:
`EUNSUPPORTEDPROTOCOL Unsupported URL Type "workspace:"`; `bun`: `failed to
resolve`), and `packages/core` is `private: true`, so the range could never have
pointed at anything publishable either. Tarball, `file:`, GitHub Packages and
git-URL installs were all dead, while `bun install`, every demo, `check`, `lint`
and `check:package` stayed green — because inside the workspace it resolves
perfectly.

It is fixed by declaring it where it belongs: no binding externalises core, so
rollup inlines it and `dist/index.js` imports nothing from it (measured: **0
sibling imports across all four entries**), which makes it a build-time
dependency and it now lives in `devDependencies`. Two ways to undo that
silently:

- **Putting core back in `dependencies`.** Nothing in the repo will complain.
- **Adding core to a binding's `rollupOptions.external`.** Then `dist` stops
  being self-contained, which also breaks the bundler-alias consumers (they
  alias `@algorisys/zen-ui-<binding>` only, never core) — see README route 5.

Verify by installing, not by building:

```bash
cd packages/react && bun run build:lib && npm pack --pack-destination /tmp
mkdir -p /tmp/zt && cd /tmp/zt && npm init -y >/dev/null
npm install /tmp/algorisys-zen-ui-react-*.tgz react react-dom   # must not EUNSUPPORTEDPROTOCOL
```

One asymmetry worth knowing: `bun add file:<a package directory>` installs that
directory's `devDependencies`, so it still trips on `workspace:*` where npm and
both tarball paths do not. Use a tarball or a bundler alias for bun.

**The TYPES had the same disease, one level down, and `skipLibCheck` hides it.**
Fixing the runtime left every binding's emitted `.d.ts` saying
`from "@algorisys/zen-ui-core/color"` — core's `exports` point at `./src/*.ts`, so
tsc resolves the source inside the workspace and writes the bare specifier out.
A consumer has no core. Measured on the solid tarball with a strict consumer:
**69 TS errors, 37 unresolved siblings**. It survives because the usual consumer
sets `skipLibCheck: true`, which suppresses errors *inside* declaration files —
erpnext does, which is why nobody noticed.

`scripts/vendor-core-types.mjs` fixes it: core gets a declaration-only build
(`packages/core/tsconfig.types.json`), its `.d.ts` are copied into each binding's
`dist/_core/`, and every specifier is rewritten to a relative path. Wired into
each `build:lib` after `build:types`. Four things it has to get right, three of
which bit during the build:

- **Subpath before bare.** `@algorisys/zen-ui-core` is a prefix of
  `@algorisys/zen-ui-core/color`, so replacing the bare form first yields
  `_core/index/color`. Same prefix trap as `dev:all`'s proxy table.
- **Inline `import()` types are not statements.** tsc writes
  `themes: import("@algorisys/zen-ui-core").ThemeDescriptor[]` when a symbol is
  only reachable structurally. The first version anchored on lines starting with
  `import`/`export`, missed all three (react 1, solid 2), **and used the same
  anchor for its own leak check — so it reported "0 sibling specifiers" while the
  strict consumer still failed.** The predicate is shared between rewrite and
  assertion now, so the two cannot disagree again.
- **`declare module "…/styles"` must keep the bare specifier** — it is what
  declares that subpath for consumers. `vanilla/dist/styles.d.ts` relies on it.
  JSDoc mentions must survive untouched too (26 of them do).
- **vanilla is built before web-components**, which vendors vanilla's
  declarations as well as core's. Build them out of order and wc vendors a
  vanilla whose types still point at core.

`clsx` and `class-variance-authority` are now real `dependencies` of every
binding: the vendored `_core/cn.d.ts` and `_core/variants.d.ts` import
`ClassValue` and `VariantProps` from them, so they are part of the public **type**
surface even though the JS inlines them.

Verify with a strict consumer, because a lax one cannot tell a self-contained
declaration from a broken one:

```bash
cd packages/solid && bun run build:lib && npm pack --pack-destination /tmp
mkdir -p /tmp/zt && cd /tmp/zt && npm init -y >/dev/null
npm install /tmp/algorisys-zen-ui-solid-*.tgz solid-js typescript
printf '{"compilerOptions":{"module":"ESNext","moduleResolution":"bundler","strict":true,"skipLibCheck":false,"noEmit":true},"include":["s"]}' > tsconfig.json
mkdir -p s && echo 'import type * as Z from "@algorisys/zen-ui-solid"; export type P = keyof typeof Z;' > s/p.ts
npx tsc -p tsconfig.json   # errors under @algorisys/** must be 0
```

Expect noise from third-party declarations — `@kobalte/core` ships 27
"only refers to a type but is being used as a value" errors and `solid-toast`
wants `@types/node`. Neither is ours; count only `@algorisys/**`.

**`dist/assets/` was shipping 7.1 MB of stale demo output.** The demo build moved
to `dist-demo` long ago, but `emptyOutDir: false` kept the old bundles alive on
any machine that had built the previous layout, and `files: ["dist"]` published
them — 36% of the react tarball, and the only remaining files that still imported
core. `build:lib` now starts with `rm -rf dist/assets`. Unpacked sizes went react
9.92 → 6.36 MB, vanilla 5.82 → 4.13, web-components 5.28 → 3.54.

**Neither of them checks the licence files either, and a new binding is where
that bites.** `LICENSE` and `COMMERCIAL.md` are listed in every published package's
`files` array by hand. npm auto-includes a `LICENSE` from a package's own
directory only when `files` is ABSENT — every binding here has one, so an
unlisted licence is silently dropped from the tarball, and the licence's
`Required Notice:` line names `COMMERCIAL.md` explicitly, so dropping that ships
a notice pointing at nothing. Add a binding, add both to its `files` and copy
both into its directory, then prove it:

```bash
# per package: the tarball must contain both, not merely the repo
(cd packages/<binding> && npm pack --dry-run --json) \
  | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
      const f=JSON.parse(s)[0].files.map(x=>x.path);
      console.log(["LICENSE","COMMERCIAL.md"].map(n=>`${n}: ${f.includes(n)}`).join("  "))})'
```

## Licence

zen-ui is copyright **Algorisys Technologies Pvt. Ltd** (authored by Rajesh Pillai) and
**source-available, not open source**: PolyForm Noncommercial 1.0.0
(SPDX `PolyForm-Noncommercial-1.0.0`) — free for personal, hobby, educational,
research, charity and government use; commercial use needs a separate licence.
[COMMERCIAL.md](COMMERCIAL.md) is how one is asked for, and it is the file to
edit when the terms or the contact change.

**The licensor is the company, not the individual, and that is deliberate.** The
author owns Algorisys, so either name would grant valid licences — but a
commercial licensee needs an entity to contract with and invoice, and a personal
copyright line on a repo under the company org invites the question of whether
the company had the right to license it at all. The authorship is recorded in a
second `Required Notice:` line rather than dropped. If the copyright ever moves,
it moves in `LICENSE`, `COMMERCIAL.md`, `README.md`, this file, and the
`LICENSING` block in `scripts/gen-agent-guide.ts` — five places, none generated
from another.

Three things that will bite an edit here:

- **The distinction is not pedantry, and this repo's own docs are the most
  likely place to lose it.** The Open Source Definition forbids restricting the
  field of use, so a noncommercial condition disqualifies a licence from being
  open source no matter how public the source is — SPDX agrees, and marks the id
  `isOsiApproved: false`. Do not let "open source" into the README, the landing
  page, a release note or a commit message. It is the kind of claim a consumer
  can later argue was relied on.
- **The licence text is verbatim upstream and must stay that way.** It is the
  raw file from `polyformproject.org`'s repo, not the rendered page — the
  rendered page transcribes differently ("To receive any license" for "In order
  to get any license", a dropped `Required Notice:` example). The only additions
  are the two `Required Notice:` lines at the top, which is the mechanism the
  licence itself provides for licensor-supplied notices that must travel with
  copies. Diff against upstream rather than editing prose:

  ```bash
  curl -sfL https://raw.githubusercontent.com/polyformproject/polyform-licenses/1.0.0/PolyForm-Noncommercial-1.0.0.md \
    -o /tmp/pf.md
  diff <(grep -v '^Required Notice:' LICENSE | cat -s) <(cat -s /tmp/pf.md)
  ```

- **`.gitignore` has `*.md` at any depth**, so `COMMERCIAL.md` is allowlisted
  (`!COMMERCIAL.md`). A bare pattern matches at any depth, so that one line
  covers the per-package copies too — unlike the `!AGENTS.md` /
  `!packages/**/AGENTS.md` pair above it, whose second line is redundant. Verify
  with `git add -n`, not `git check-ignore -v`: with `-v` a NEGATION counts as a
  match and the command exits 0, which reads as "ignored" and is the opposite of
  the truth.

The agent-facing guides state the licence too, and are **generated** — the block
lives in `scripts/gen-agent-guide.ts` (`LICENSING`), not in the 15 files it
writes. It is there because `AGENTS.md` and the zen-ui skill are what a
consumer's agent reads before recommending a dependency: with nothing said, an
agent will add zen-ui to a for-profit product and call it open source in the PR
description, and no other check in this repo can see either mistake.

## Theming

Override `--zen-*` custom properties; that is the whole public theming surface.
Three built-in themes via `data-theme`: `default`, `zen-theme`, `dark`. Token
reference is in the [README](README.md#token-reference).

## Other references

- [.claude/skills/impeccable](.claude/skills/impeccable) — the design review. Part of reviewing any UI; see [Development guidelines](#development-guidelines) for how it applies to a component library.
- [docs/fiori-gap-analysis.md](docs/fiori-gap-analysis.md) — component gaps vs SAP Fiori, tiered with a build shortlist.
- [docs/rp-shadcn-radix-gap.md](docs/rp-shadcn-radix-gap.md) — the shadcn/Radix migration rubric.
- [todo.md](todo.md) — deferred-work tracker.
