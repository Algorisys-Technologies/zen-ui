# Handoff

State at the end of the 2026-07-16 session. Written for whoever picks this up
with no memory of it — including me.

## Where things stand

`main == dev == 256a51e`, tagged **v5.0.0**, tree clean, site live at
<https://algorisys-technologies.github.io/zen-ui/> serving 5.0.0 (verified by
fetching the deployed bundle, not by assuming the deploy worked).

Three releases shipped this session: **4.0.0** (tree-shaking + types), **5.0.0**
(pivot single-select). Both are described in `release-notes/`.

Gates, all green as of the last run:

| command | state |
|---|---|
| `bun run check` | 343 checks |
| `bun run check:dist` | Button 17 kB React / 16 kB Solid |
| `bun run lint` / `lint:solid` | React 29 problems; Solid 8 errors / 46 warnings — **on baseline, not zero** |
| `visual-check` both bindings | 79 routes each; 3 errors, all an offline avatar CDN (`i.pravatar.cc`) — pre-existing, not ours |

## Open — decide before continuing

### 1. Impeccable is installed GLOBALLY, and that was a mistake

<https://github.com/pbakaus/impeccable> — an AI design-guidance skill (23
commands, 46 deterministic detectors) the user asked to add **to this project**.

`npx impeccable install` prompts `project or global? [global]` and, run
unattended, took the default. It wrote **121 files each into `~/.claude`,
`~/.gemini`, `~/.opencode`, `~/.pi`, 125 into `~/.agents`, plus hooks into
`~/.claude` and `~/.agents`**. Those hooks fire on every project, not just this
one. The repo itself is untouched (a stray `.codex/hooks.json` was removed).

`/impeccable init` was **blocked on purpose** — running it would activate an
unreviewed global mechanism installed by accident. Do not run it until scope is
settled. Nothing is active until then; impeccable is inert.

**The user was asked to choose and has not yet:**

- **A (recommended)** — remove the global install, reinstall with `project`
  scope so it and its hooks live in `zen-ui/.claude` and travel with the repo.
  Matches what was actually asked.
- **B** — keep it global deliberately, but review the hooks first rather than
  inherit them from an accepted default.

Then run init and `/impeccable audit` on `apps/landing`.

### 2. Do NOT delete slop.md yet

The user said "if impeccable is good you can remove slop.md". That is a real
question, but it has not been answered — impeccable's README has been read, its
46 rules have not.

Arguments against a straight swap, for whoever evaluates it:

- **slop.md is repo doctrine, not a generic guide.** CLAUDE.md carves out how it
  applies *here*: which entries are live for a primitive vs a landing page, and
  an explicit override that its "no em dash" rule does not apply to this repo's
  engineering prose. Impeccable knows none of that.
- **Different kinds of thing.** slop.md is prose law; impeccable is tooling.
  Detectors catch what they pattern-match; they do not encode "centre what you
  meant to centre and prove it."
- The overlap is real but partial. Before deleting 1,599 lines and 157 sections,
  find which slop.md rules have **no** detector equivalent — those would lose
  their only home.

Recommendation: keep both, doing different jobs. Revisit with evidence from a
real audit.

### 3. Pivot workbench layout differs between bindings (design call)

Not a demo bug — the demos' sections match. `PivotWorkbench` itself differs:

- **React**: toolbar (`n rows · n cols` + View Data) in its own bar above
  Available Fields; then Values | Rows | Columns as three equal columns
  (`sm:zen-grid-cols-3`, `pivot-workbench.tsx:280`).
- **Solid**: toolbar folded into the Available Fields header; Values | Columns
  on one row, Rows below-left.

My read: **align Solid to React's** — three equal zones is the conventional
pivot-builder shape and it is a real responsive grid, where Solid's arrangement
looks incidental. Not done: it is a design decision, and Solid's drag-and-drop
works — worth not rewriting on a guess. User has not ruled.

## Traps that cost real time this session

Every one of these produced a false pass or a wrong conclusion. They are in
CLAUDE.md too; repeated here because they bite fastest.

- **`.gitignore` has `*.md`, matching at ANY depth.** `release-notes/` and this
  file both needed explicit allowlists. A new doc is silently untracked.
- **`build` (demo) and `build:lib` write to the same `dist/` and clobber each
  other.** `visual-check` needs the demo build; `check:dist` needs the lib
  build. Run `check:dist` last. "dist is missing" means a demo build won.
- **`deploy.sh` rebuilds `packages/*/dist` with the `/zen-ui/` base** — rebuild
  the libs afterwards or `preview` serves broken asset URLs.
- **`rm -rf dist` before believing dist.** `emptyOutDir: false` kept a stale
  `index.d.ts` alive for who knows how long, hiding the fact that consumers got
  no types at all. A clean clone never had one.
- **Relative paths in a vite config resolve against `process.cwd()`, not the
  config file.** `bun --filter` enters the package dir so it works; `deploy.sh`
  runs from the repo root so it throws. The one command that publishes was the
  one that failed.
- **`treeshake` belongs in `build.rollupOptions`, not `build`.** Vite silently
  ignores it there — this produced two confident, wrong "it's not side effects"
  conclusions.
- **Vite lib+ES mode does not minify whitespace**, deliberately, to preserve
  `@__PURE__` annotations. `dist/index.js` at ~1.1 MB is not a shipping size.
  Measure with `check:size`, which builds real consumer apps.
- **Scripts that spawn vite must write scratch configs INSIDE the repo** — from
  `/tmp`, plugin imports are `ERR_MODULE_NOT_FOUND` and every case "fails" for
  reasons unrelated to what is being tested.
- **`vite preview` in `packages/*` needs `--config vite.config.demo.ts`** —
  there is no default `vite.config.ts`, so without it the base is wrong and the
  page renders blank.
- **`h1.first()` matches the site header**, not the page title. `sr-only` is
  1×1 clipped, not zero-size.
- Roughly half of the apparent failures this session were my own harness. Verify
  the harness before believing a finding.

## The rule that keeps being right

Green output is not evidence. Every significant bug this session — the 151 kB
button, the missing types, the v0.1 footer, the pivot single-select — was green
in every existing check and looked fine. Drive the thing.
