# Handoff

State at the end of the 2026-07-16 session. Written for whoever picks this up
with no memory of it — including me.

## Where things stand

`dev` is **4 commits ahead of `main` and of `origin/dev`**, all unpushed, tree
clean. `main` is still v5.0.0, tagged, and the site at
<https://algorisys-technologies.github.io/zen-ui/> serves 5.0.0 — so nothing
below is live yet.

The four: this handoff (twice), the impeccable install, and the pivot alignment.
**The pivot commit is breaking and unreleased**, so the next `ship it` is a
major, not a minor.

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

### 1. ~~Impeccable is installed GLOBALLY~~ — SETTLED, it is project-scoped now

Resolved 2026-07-16. It lives in `.claude/skills/impeccable`, is committed, and
the five global copies (`~/.claude`, `~/.gemini`, `~/.opencode`, `~/.pi`,
`~/.agents`) are gone. `/impeccable init` has still **not** been run, and
`/impeccable audit` on `apps/landing` is still worth doing.

**Two corrections to what this file used to say**, because both were wrong and
both would mislead:

- **The global install wrote no hooks.** This file claimed hooks were installed
  into `~/.claude` and `~/.agents` and "fire on every project". There was no
  hook wiring anywhere — no `hooks` key in `~/.claude/settings.json`, no
  `~/.claude/hooks/`. It was 102 inert skill files per directory. The alarm was
  unfounded; do not re-raise it from this file's history.
- **It was 102 files per directory, not 121/125.**

Making "project-scoped" real took two edits the installer does not make, and
neither is visible in its output:

- **`.gitignore`'s `*.md` swallowed 33 of the 102 files**, including `SKILL.md`
  and every `reference/<command>.md` — the ones that ARE the skill. A clone
  would have got 63 .mjs scripts and nothing that made them mean anything.
  Allowlisted at the bottom of `.gitignore`. Same trap as `release-notes/`.
- **The installer writes its hook to `.claude/settings.local.json`**, which the
  user's *global* gitignore (`~/.config/git/ignore`) excludes as the personal
  file. Moved to `.claude/settings.json` — the shared one — or it would not have
  travelled either.

**The hook is now live for anyone who clones**: PostToolUse on
`Edit|Write|MultiEdit`, 5s timeout, `.claude/skills/impeccable/scripts/hook.mjs`.
It works (driven, not assumed) and reports one finding today: `overused-font` on
`apps/landing`'s **Plus Jakarta Sans** — which is slop.md's "off-the-shelf
Google font carrying the brand", reached independently. Unfixed; it is a design
call, and a real one.

> `npx impeccable install --help` **is not a thing** — the flag is unparsed and
> it runs the real installer. That is how the project install happened. It also
> overwrote `.claude/settings.local.json`, whose prior contents are unrecoverable
> (gitignored, never read first). The user waived it.

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

### 3. ~~Pivot workbench layout differs between bindings~~ — SETTLED, aligned

Resolved 2026-07-16: the user ruled **align Solid to React's**, and it is done
(`4382900`). Solid now renders the toolbar in its own bar and Values | Rows |
Columns as three equal `sm:zen-grid-cols-3` columns. Its drag-and-drop survived —
`scripts/check-pivot-ui.mjs` passes fully on both bindings.

Aligning surfaced three divergences that were never about layout, all now closed:
a hardcoded `en-IN` locale in Solid's row/col counts, Solid counting an *empty*
filter selection as an active filter (it now uses core's `hasActiveFilters` /
`isLayoutRenderable`, as React does), and a remove button on Available chips that
moved a field into the zone it was already in.

It also found one bug going the **other** way: React's alerts passed
`<AlertIcon />` with no children, and AlertIcon is a pure slot — both warnings
rendered an empty box where the icon belongs. React was fixed to match Solid, not
the reverse.

**This is a breaking change and is unreleased.** A visual change is breaking
here; the next `ship it` is a major and needs a `release-notes/6.0.0.md` saying
the Solid workbench reflows.

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
- **Both of the above were live at the START of the 2026-07-16 session, and a
  blank page is what they look like.** `visual-check` on `/pivot` screenshotted
  pure white and reported a bare `404`, which reads exactly like "the change
  broke the route". It was neither route nor change: Solid's `dist` held the
  *library* build (`index100.js`, no `index.html`) because `check:dist` ran last,
  and React's `dist` held a *demo* build still carrying deploy.sh's
  `/zen-ui/builder/` asset URLs. **Diagnose with a control route** — if `/button`
  is blank too, it is the build, not the work. Cheapest tell: a real screenshot
  is 70–120 kB, a blank one is 5,289 bytes; and `grep -oE 'src="[^"]*"'
  packages/*/dist/index.html` shows the base immediately.
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
