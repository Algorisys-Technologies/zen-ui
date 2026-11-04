# Handoff

State during the overnight parity pass of 2026-11-05. Written for whoever picks
this up with no memory of it — including me. The detailed, append-only record
is [docs/parity-pass.md](docs/parity-pass.md); this page is only "where are we".

## Where things stand

**12.2.0 is released** (tag `v12.2.0`, Pages published, dist-pkg tarballs and the
`npm-package-react` branch refreshed). Everything since is on `dev` and pushed,
**not released**. The next release is a minor (all additive, plus bug fixes):
12.3.0.

**`bun run check:parity` is green across all four bindings** — the first time
since 12.1. Every 12.2.0 Solid-only component and prop now exists in React,
vanilla and web components, each driven in a browser against the same scripts
that verified Solid.

| what | state |
|---|---|
| React | complete, at parity with Solid |
| vanilla + web components | complete except DataTable cell navigation and row virtualization (in progress: vanilla DataTable first needs inline editing) |
| strings (translation) | Solid 135/135, React 139/139 (both in `bun run check`); vanilla/WC in progress; S2 (words neither scan sees, both bindings) in progress |
| `<zen-locale-provider>` | in progress (with the vanilla/WC strings unit) |

## Found and fixed on the way (all in CHANGELOG [Unreleased])

- **A Solid 12.2.0 regression:** every StatCard figure 8px taller (`cn()`
  dropped `leading-none` after the new size class). Fixed; ships with 12.3.0.
- Vanilla `Disposer` ran its cleanups once, leaking every later opening's
  document listeners in ~25 components (since 7.0.0). Fixed; 116/116 routes
  identical.
- Vanilla Select dead after its first close; React DataTable select editor
  never saved; React MultiCombobox raw values as chips; React Calendar RTL;
  check:strings blind to attribute expressions (18 Solid places fixed).
- Tooling: `visual-check` screenshotted other sessions' servers on its fixed
  ports; `snapshot-routes` saw zero routes outside Solid; `vendor-core-types`
  vendored nothing under a dotted path.

## Decisions waiting for the owner

1. **Ship 12.3.0?** Not done: "ship it" was not said. CLAUDE.md's ship step
   `git merge --ff-only dev` cannot work any more (main has had merge commits
   since 12.0.1); 12.1.0–12.2.0 used "Merge dev into main". Choose: document
   `--no-ff`, or realign main and dev once.
2. **Two visible changes** the parity pass brings (CHANGELOG "Changed"): React
   and vanilla Inputs already `aria-invalid` now draw the error border (Solid's
   rule); a Sidebar `<button>` row takes the foreground colour without the
   preflight. Keep, or gate behind a prop?
3. **Label's `leading-none`** is dropped by its own size class in Solid (and
   likely React) since before 12.1.1; fixing it changes every label's height
   (todo.md, next major).

## Verify

```bash
bun run check            # all green, check:parity included
bun run lint && bun run lint:solid && bun run lint:vanilla && bun run lint:wc
node scripts/visual-check.mjs react   # builds needed first: bun run build etc.
```

## Next

Merge the three running units (vanilla DataTable editing / cell nav / virt;
React strings; vanilla + WC strings and `<zen-locale-provider>`), then the
full gate, then wait for "ship it".
