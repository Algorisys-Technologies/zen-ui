# @algorisys/zen-ui-react

A React component library shipping **shadcn-style primitives on top of
Radix UI**, themed via CSS custom properties. Every component forwards
a ref, supports `asChild` where it makes sense, and exposes a flat
React-idiomatic prop API.

```bash
npm install @algorisys/zen-ui-react
```

```tsx
import {
  Button,
  Dialog,
  DataTable,
  Combobox,
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@algorisys/zen-ui-react";

import "@algorisys/zen-ui-react/styles";   // tokens + utility classes
```

See the demo at `/builder/` for live examples of every component.

---

## Repository layout

This repo is a [bun workspaces](https://bun.sh/docs/install/workspaces)
monorepo. Each framework binding lives in its own publishable package
under `packages/`:

```
zen-ui/
├── package.json            # workspace root (private)
├── bun.lock
├── packages/
│   ├── core/               # @algorisys/zen-ui-core (framework-agnostic)
│   │   ├── package.json
│   │   ├── src/            # cn, theme primitives, UnoCSS preset
│   │   └── styles/         # tokens.css, preflight.css
│   ├── react/              # @algorisys/zen-ui-react
│   │   ├── package.json
│   │   ├── src/
│   │   ├── vite.config.lib.ts
│   │   ├── vite.config.demo.ts
│   │   └── uno.config.ts
│   └── solid/              # @algorisys/zen-ui-solid (same core, Solid binding)
│       ├── package.json
│       ├── src/
│       └── uno.config.ts
├── docs/
├── README.md
└── todo.md
```

`@algorisys/zen-ui-core` holds everything that is genuinely
framework-agnostic — design tokens (`tokens.css`), the preflight
reset, the `cn` helper, the UnoCSS theme + rem-rescale postprocess,
and the pure DOM-level theme primitives (`THEMES`, `applyTheme`,
`getInitialTheme`). The React binding depends on it via
`workspace:*` and layers the `useTheme` hook on top.

A SolidJS binding (`packages/solid` → `@algorisys/zen-ui-solid`)
ships alongside the React one, reusing the same core so both bindings
stay visually identical.

---

## Status

- 21 primitive components on the shadcn / Radix-style API.
- Higher-level primitives shipped: `Form` (RHF + Zod), `DataTable`
  (TanStack Table + Virtual), `Combobox` (cmdk; sync + async), `Alert`,
  `Popover`, `VirtualizedItems`.
- 3 built-in themes: **default** (Algorisys brand), **zen-theme**
  (Algorisys Zen palette), **dark**. Theme switcher in the demo shell
  header.

See [todo.md](./todo.md) for the deferred-work list (column drag /
resize on DataTable, async-validated form fields, high-contrast theme,
release housekeeping, etc.).

---

## Theming

All visual properties — colours, radii, shadows, spacing — are CSS
custom properties prefixed `--zen-*`, declared in
[`packages/core/styles/tokens.css`](./packages/core/styles/tokens.css). Components reference
the tokens via UnoCSS utility classes like `bg-zen-primary`,
`rounded-zen-md`, `shadow-zen-sm`.

### Built-in themes

| Theme | `data-theme` value | Notes |
|---|---|---|
| Default | `default` (or unset) | Algorisys brand palette — blue `#1C43B9`, red `#CE1010` |
| Zen | `zen-theme` | Algorisys Zen palette — full 10-step shade scales per role |
| Dark | `dark` | Inverted surfaces; falls out of the same mechanism |

Switch the active theme at runtime:

```tsx
import { useTheme } from "@algorisys/zen-ui-react";

function MyHeader() {
  const { theme, setTheme, themes } = useTheme();
  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
      {themes.map((t) => (
        <option key={t.name} value={t.name}>{t.label}</option>
      ))}
    </select>
  );
}
```

Or set the attribute directly on `<html>`:

```html
<html data-theme="zen-theme">
```

The choice is persisted to `localStorage` under the key `zen-ui-theme`.
For SSR-safe initial paint, apply the persisted theme **before** React
renders:

```tsx
// main.tsx
import { applyTheme, getInitialTheme } from "@algorisys/zen-ui-react";
applyTheme(getInitialTheme());

createRoot(document.getElementById("root")!).render(<App />);
```

### Creating a new theme

A theme is a single CSS block that re-binds the `--zen-*` variables on
a `:root[data-theme="<name>"]` selector. **No component code changes
are needed** — components only read the tokens.

#### Step 1 — pick a name

The name shows up in the URL-like attribute (`data-theme="..."`) and in
the `ThemeName` union type. Use a short, slug-style identifier.

```
sapphire    /* good */
my-new      /* good */
"Pretty"    /* avoid spaces and capitals */
```

#### Step 2 — add a CSS block to `packages/core/styles/tokens.css`

Copy the structure of an existing theme (default or zen-theme) and override
every token. The full token list:

```css
:root[data-theme="sapphire"] {
  /* Brand & status palette ----------------------------------------- */
  --zen-color-primary:        #1E40AF;
  --zen-color-primary-fg:     #ffffff;
  --zen-color-primary-soft:   #DBEAFE;
  --zen-color-primary-soft-fg: #1E40AF;

  --zen-color-neutral:        #1F2937;
  --zen-color-neutral-fg:     #ffffff;
  --zen-color-neutral-soft:   #F3F4F6;
  --zen-color-neutral-soft-fg: #1F2937;

  --zen-color-info:           #0369A1;
  --zen-color-info-fg:        #ffffff;
  --zen-color-info-soft:      #E0F2FE;
  --zen-color-info-soft-fg:   #075985;

  --zen-color-success:        #16A34A;
  --zen-color-success-fg:     #ffffff;
  --zen-color-success-soft:   #DCFCE7;
  --zen-color-success-soft-fg: #166534;

  --zen-color-warning:        #D97706;
  --zen-color-warning-fg:     #1F2937;
  --zen-color-warning-soft:   #FEF3C7;
  --zen-color-warning-soft-fg: #92400E;

  --zen-color-error:          #DC2626;
  --zen-color-error-fg:       #ffffff;
  --zen-color-error-soft:     #FEE2E2;
  --zen-color-error-soft-fg:  #991B1B;

  /* Surface & border ------------------------------------------------ */
  --zen-color-background:     #ffffff;
  --zen-color-foreground:     #1F2937;
  --zen-color-muted:          #F9FAFB;
  --zen-color-muted-fg:       #6B7280;
  --zen-color-border:         #E5E7EB;
  --zen-color-ring:           #1E40AF;

  /* Status indicators (used by Avatar etc.) ------------------------ */
  --zen-status-online:        #16A34A;
  --zen-status-offline:       #6B7280;
  --zen-status-away:          #D97706;
  --zen-status-busy:          #DC2626;

  /* (Optional) full shade scales if you want to expose them ---------
   * The zen-theme exposes --zen-color-primary-{20,50,…,900} etc. so
   * consumers can pick a specific shade. The role-based aliases
   * above are the minimum required set. */
}
```

#### Step 3 — register the theme in `packages/core/src/theme.ts`

Add an entry to the `THEMES` array so it appears in the switcher and
becomes a valid value for `ThemeName`. The React binding's
`packages/react/src/lib/theme.ts` re-exports these, so every binding
picks up the new theme automatically:

```ts
export type ThemeName = "default" | "zen-theme" | "dark" | "sapphire";

export const THEMES: ThemeDescriptor[] = [
  // ... existing themes
  {
    name: "sapphire",
    label: "Sapphire",
    description: "Deep blue + warm accents",
    preview: ["#1E40AF", "#DC2626", "#F3F4F6"],   // 3 swatch hexes
  },
];
```

That's it — the dropdown picks it up automatically.

#### Step 4 — verify contrast

Run the demo and switch to your new theme. Visit a handful of pages —
especially `/button-new`, `/alert`, `/data-table`, `/form-new` — and
check that:
- Text on every soft-bg variant is readable (aim for WCAG AA: 4.5:1
  for body text, 3:1 for ≥14 pt bold).
- Focus rings (`--zen-color-ring`) are visible on hover / keyboard
  focus.
- Status dots on Avatar look distinct from each other.

For a quick sanity check use a contrast-ratio tool like
[`whocanuse.com`](https://www.whocanuse.com).

#### Step 5 — (optional) override tokens at a sub-tree

`data-theme` doesn't have to live on `<html>`. Set it on any ancestor
to scope a theme to part of the tree:

```tsx
<main data-theme="default">…</main>
<aside data-theme="dark">…</aside>
```

Both panes use `--zen-*` tokens; CSS variable inheritance handles the
rest.

### Token reference

| Family | Tokens | Where it's used |
|---|---|---|
| Colour roles | `--zen-color-{primary, neutral, info, success, warning, error}` (+ `-fg`, `-soft`, `-soft-fg`) | Buttons, badges, alerts, switches, etc. |
| Surfaces | `--zen-color-{background, foreground, muted, muted-fg, border, ring}` | Cards, inputs, popovers, table rows |
| Status indicators | `--zen-status-{online, offline, away, busy}` | Avatar status dot |
| Radii | `--zen-radius-{sm, md, lg, full}` | `rounded-zen-*` utility |
| Shadows | `--zen-shadow-{xs, sm, md, lg, xl, 2xl}` | `shadow-zen-*` utility |
| Spacing | `--zen-space-{0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16}` | Reserved; not yet used by primitives |
| Zen-only scales | `--zen-color-<role>-{20, 50, 100, …, 900}` | Available for direct lookup when `data-theme="zen-theme"` |

---

## Component overview

See the demo app `/builder/` for live examples.

### Primitives

- Button · Tooltip · DropdownMenu · Separator · Switch · Checkbox
- RadioGroup · Progress · Avatar · Badge · Skeleton · Loading
- Select · Slider · ScrollArea · Input + Textarea · NumberField
- DatePicker · InputOTP · PhoneInput · FAB · Popover

### Higher-level primitives

- **Form** — react-hook-form + Zod with FormField / FormItem / FormLabel
  / FormControl / FormDescription / FormMessage. `/form-new` demo.
- **DataTable** — TanStack Table + Virtual. Big primitive with ~30
  opt-in capabilities (`/data-table` demo, 23 sections):
  - **Layout**: sorting / multi-sort, client + server pagination,
    column visibility / ordering / resizing / pinning (incl. virt),
    column separators, sticky header, virtualization to ~2 000 rows.
  - **Filtering**: global filter, per-column filter row with
    `meta.filterVariant` (text / number / numberRange / select /
    boolean) and operator menus, active-filter chips + clear-all,
    `manualFiltering`.
  - **Editing**: inline cell editing via `meta.editable` +
    `onCellEdit`; text / number / select editors with Enter / Esc /
    blur semantics.
  - **Selection**: row selection, bulk-action bar with selected count
    + dismiss + "Select all N matching" affordance.
  - **Hierarchy**: expandable rows via `renderSubRow`, row grouping
    with aggregations (`aggregationFn` + `aggregatedCell`).
  - **Hooks**: `rowClassName` for per-row tinting, `getRowId` for
    stable identity, `renderBulkActions`, `persistKey` for
    localStorage snapshot of column state.
  - **A11y**: aria-sort / aria-colcount / aria-busy / aria-live count.
  - **Server-driven**: `manualPagination` / `manualSorting` /
    `manualFiltering` all compose.
  - **Export**: CSV / JSON, filtered or selected rows.
- **Combobox** — cmdk-backed; sync (`options`) or async (`onSearch`).
  `/combobox` demo.
- **VirtualizedItems** — drop-in windowing for huge option lists inside
  `SelectContent` / `DropdownMenuContent`. `/lazy-options` demo.
- **Alert** — Zen-theme-spec banner; compound API (Icon / Title /
  Description / Actions / Close). `/alert` demo.

### Theme + utility exports

- `useTheme()` / `applyTheme()` / `getInitialTheme()` / `THEMES`
- `cn(...)` — `clsx + tailwind-merge`

---

## Distribution — sharing this library with other projects

Pick the channel that matches the stage of adoption:

| You want to…                                  | Use                                |
| --------------------------------------------- | ---------------------------------- |
| Hand a tarball to one team for a quick spike  | [`npm pack`](#1-tarball)           |
| Internal distribution across Algorisys teams  | [GitHub Packages](#2-github-packages) (already configured) |
| Public, world-readable installs               | [Public npm](#3-public-npm)        |
| Two repos open side-by-side, live reload      | [`npm link`](#4-local-dev-cross-project) |

The package is already configured to publish to the GitHub Packages
registry under the `@algorisys` scope (`packages/react/package.json` →
`publishConfig`). `"files": ["dist"]` means the published tarball
contains only the built output, not source. All publishing / packing
commands below run from inside `packages/react/`.

### 1. Tarball

Fastest way to share with one team without registry plumbing.

```bash
cd packages/react
bun run build:lib
npm pack
# → algorisys-zen-ui-2.1.1.tgz in packages/react/
```

Share the `.tgz` (Slack, internal artifact store, a GitHub release
attachment). Consumers install it directly:

```bash
npm install /absolute/path/to/algorisys-zen-ui-2.1.1.tgz
# or from a URL:
npm install https://github.com/Algorisys-Technologies/zen-ui/releases/download/v2.1.1/algorisys-zen-ui-2.1.1.tgz
```

Then in their app:

```tsx
import { Button, DataTable, Form } from "@algorisys/zen-ui-react";
import "@algorisys/zen-ui-react/styles";
```

Trade-off: no auto-updates — every new version is a fresh tarball.
Best for short-lived spikes; move to GitHub Packages once a team
commits to the library.

### 2. GitHub Packages

The default channel for this library, suited to internal use across
Algorisys teams and partners with GitHub access.

**Publishing (maintainer side):**

```bash
# One-time: log into the GitHub Packages registry under the @algorisys scope.
# Use a GitHub Personal Access Token with `write:packages` + `read:packages`.
npm login --scope=@algorisys --auth-type=legacy --registry=https://npm.pkg.github.com

# Each release (from packages/react/):
cd packages/react
npm version patch         # bumps version + creates a git tag (2.1.1 → 2.1.2)
npm run publish:lib       # builds the library and publishes
git push --follow-tags
```

**Consuming (each downstream project, one-time setup):**

Add an `.npmrc` to the consuming project (or to `~/.npmrc` for
user-wide):

```ini
@algorisys:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

`GITHUB_PACKAGES_TOKEN` is a GitHub PAT with `read:packages`. In CI,
inject it as a secret. Then:

```bash
npm install @algorisys/zen-ui-react
```

Pin a version in `package.json`:

```json
{
  "dependencies": {
    "@algorisys/zen-ui-react": "^2.1.1"
  }
}
```

### 3. Public npm

Reach: anyone with `npm install`. Caveat: once a version is published
to public npm it's there forever (you can `unpublish` within 72 h,
but treat it as permanent).

```bash
# package.json: remove or override `publishConfig` so it doesn't
# point at npm.pkg.github.com.
npm login                       # against npmjs.org
npm publish --access public
```

Consumers then `npm install @algorisys/zen-ui-react` with no auth.

### 4. Local dev — cross-project

When you're iterating on both zen-ui and a consuming app at the same
time, skip the publish loop entirely:

```bash
# In the zen-ui clone:
cd packages/react
bun run build:lib
npm link

# In the consuming app:
npm link @algorisys/zen-ui-react
```

`node_modules/@algorisys/zen-ui-react` in the consuming app becomes a
symlink to your local `packages/react/` working copy. Re-run
`bun run build:lib` whenever you change a component; the consuming
app picks up the new build on its next dev-server refresh.

To detach:

```bash
# In the consuming app:
npm unlink @algorisys/zen-ui-react
npm install                 # restores the published version
```

### Versioning conventions

- Patch (`2.1.x`) — bug fixes, internal refactors, demo-only changes
  that don't affect the published surface.
- Minor (`2.x.0`) — new components, new exports, new props with
  default values that preserve existing behaviour.
- Major (`x.0.0`) — removed exports, renamed props, breaking changes
  to a component's default rendering or behaviour.

Consuming teams pinning with `^2.1.0` will pick up everything up to
the next major safely.

---

## Architecture references

- **`docs/rp-review-1.md`** — initial library review (pre-refactor).
- **`docs/rp-shadcn-radix-gap.md`** — the migration rubric: shadcn /
  Radix patterns + how each component maps.
- **`docs/fiori-gap-analysis.md`** — component gap analysis against the SAP
  Fiori for Web design system; tiered by value, with a build shortlist.
- **`todo.md`** — deferred-work tracker (Phase 2 + release housekeeping).

---

## Local development

This repo uses bun workspaces. Run from the workspace root:

```bash
bun install
bun run dev:all      # every demo behind one URL -> localhost:5170
bun run dev          # React demo app, served at /builder/
bun run build:lib    # build packages/react/ to packages/react/dist/
bun run lint
```

### One URL for every demo

`bun run dev:all` is the one to reach for when comparing the bindings — it
starts everything and puts it behind a single page:

```
zen-ui demos  ->  http://localhost:5170/

  React         http://localhost:5170/builder/
  Solid         http://localhost:5170/builder-solid/
  Landing page  http://localhost:34063/     (own port; see below)
```

React and Solid cannot share one vite server — the two JSX transforms fight
over the same files — so `dev:all` runs a child server per app and proxies each
binding's base path to its child. You open one port; the split stays an
implementation detail. Child ports are OS-assigned rather than pinned, so
nothing collides with a `bun run dev` you already have on vite's default 5173.
`Ctrl-C` takes the whole tree down with it.

The **landing page** is the exception: its base is `/`, the same path the hub
itself occupies, so it cannot be mounted under a sub-path without breaking every
absolute asset URL it serves. It runs alongside the rest and its card (marked
`↗`) links straight to its own port.

Adding a framework is one entry in
[`scripts/demos.mjs`](scripts/demos.mjs) — the hub page, the proxy table and the
spawned servers all derive from it. If 5170 is taken, `ZEN_HUB_PORT=5180 bun run
dev:all`.

By default the workspace scripts target the **React** binding — `bun
run dev` forwards into `packages/react/` and serves the React demo. The
**Solid** binding has its own `:solid`-suffixed scripts:

```bash
bun run dev:solid        # Solid demo app
bun run build:solid      # build the Solid demo
bun run build:lib:solid  # build packages/solid/ to packages/solid/dist/
bun run lint:solid
```

Each script forwards into the matching package via `bun --filter`. If
you prefer to run inside a package directly:

```bash
cd packages/react      # or packages/solid
bun run dev
bun run build:lib
```

Typecheck: `bun --filter '@algorisys/zen-ui-react' exec tsc -b`. Tests: not
yet wired up — see `todo.md`.

---

## Repo map (repograph)

This workspace ships a committed, always-current **repo map** under
`.repograph/` — a compact `path | lang | lines | symbols` index of every
source file plus a human-readable `map.md`. It's generated by
[repograph](https://github.com/algorisys-oss/repograph) (a dev dependency)
and is handy for orienting in the codebase or feeding an LLM, since reading
the map costs a fraction of the tokens of reading the source.

Reading the map needs nothing — just open the files:

```bash
.repograph/index.txt   # terse one-line-per-file index (cheapest)
.repograph/map.md      # human-readable map with clickable path#Lnn links
.repograph/graph.json  # structured graph + incremental cache
```

The map is **scoped to `packages/*`** (excluding tests) and refreshes
automatically: `repograph init` installed a tracked `.githooks/pre-commit`
that regenerates `.repograph/` and `git add`s it on every commit, with
`core.hooksPath` pointed at `.githooks`. Refreshing needs Python 3.8+ on
PATH; the hook no-ops cleanly if repograph isn't installed, so it never
blocks a commit.

After a fresh clone, activate the hook once (or add the `prepare` script
below so it activates automatically on `bun install`):

```bash
git config core.hooksPath .githooks
```

```json
// package.json
"scripts": { "prepare": "git config core.hooksPath .githooks" }
```

To regenerate manually, or to re-scope the map (the globs are baked into the
hook at init time):

```bash
bunx repograph . --init --include 'packages/*' --exclude '*test*'
```
