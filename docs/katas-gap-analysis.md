# The katas corpus — UI Component Gap Analysis

**Date:** 2026-07-15
**zen-ui version reviewed:** `@algorisys/zen-ui-react` 3.0.0 (branch `dev`, commit `ba655a0`)
**Reference:** `/home/rajesh/lab/katas` — 24 kata repositories, surveyed from a UI component/element perspective

## How this was compiled

One agent per kata folder — 24 of them, each reading only its own folder — plus a 25th cross-cutting pass whose only job was to count how many folders share a pattern. That split is deliberate: a widget appearing in 14 repos is a different kind of argument from one appearing in 1, and a per-folder agent cannot see the difference.

Of the 24 folders, **23 have a web UI**; `learn-rust-in-tweets-author-edition` has none at all (verified four ways) and is excluded from every count below.

Unlike the [Fiori](fiori-gap-analysis.md) and [Carbon](carbon-gap-analysis.md) analyses, nothing here was blocked behind a 403 or a truncating fetcher. Every claim below comes from reading source on disk. That makes this document's *kata-side* evidence unusually strong: these are not published inventories describing what a design system says it has, they are 24 independent applications that each hit a wall and hand-wrote something to get past it.

The methodological note worth recording is the inverse of Carbon's. There, the tooling produced false "missing" verdicts about the *reference* system. Here, the agents were accurate about the katas and **repeatedly wrong about zen-ui**:

| Claim | Reality |
|---|---|
| "zen-ui exports no Accordion" (cloud-katas, qa-labs, webrtc-katas) | **False.** `packages/react/src/index.ts:470`, `packages/solid/src/index.ts:291` |
| "zen-ui has no directional arrows at all" (netsec-katas) | **False.** `arrow-left/right/up/down` all present |
| "zen-ui ships 30 icons" / "38 icons" | **Both wrong.** 47 |
| "Button is not in the inventory" (python-katas, rabbitmq-katas) | **False.** It exists |

Three of those trace to a single root cause: the briefing file handed to the agents was a hand-written summary that **omitted Accordion and Button**, and two agents then "verified" the omission with a single-line `export {` regex that cannot match zen-ui's multi-line export blocks. Two agents independently reporting the same false negative is not corroboration when they inherited the same bad premise. Every zen-ui-side claim in this document was consequently re-checked against source, and the ones that survived are cited by file and line. **There is no standalone `Collapsible`** — that part was right; Accordion serves the need.

Verified true, by direct grep over `packages/`:

- **No `--zen-font-*` tokens of any kind.** Not a size scale, not a family. Zero.
- **No motion tokens.** No duration, no easing.
- **No `prefers-color-scheme` anywhere.** The only media query in the library is `prefers-reduced-motion`, in `object-page.tsx` alone.
- **`FlexibleColumnLayout` has zero drag-resize.** `grep -cE 'mousedown|pointerdown|col-resize|onDrag'` → `0`. It is breakpoint-driven.
- **`RichText` is a jodit WYSIWYG** (`rich-text.tsx:5`), and an *optional peer dep* at that.
- **`Chart` is `"line" | "area" | "bar"`**, row-oriented (`data` + `series` + `xKey`), with a 6-colour palette.
- **`Stepper` is a form wizard** (`StepperPanel` + `onBeforeNext` + `form.trigger`), not a content pager.
- **`Stack` is the only layout primitive.** No `Grid`.

## Executive summary

The katas are 24 teaching applications. That is a narrow genre, and this document should be read as evidence from one genre rather than a general verdict — but it is a genre zen-ui is currently **poorly equipped for, in a way that is concentrated rather than diffuse**.

Counting components understates it, exactly as it did for Carbon. The finding is not "zen-ui is missing N widgets." It is that **zen-ui has no answer for the developer-tool surface** — code, prose, and program output — and that this single hole accounts for nearly every gap below.

- **Prose / markdown rendering** — **13 folders** render markdown in-app. **5 hand-rolled a parser from scratch.** Two of those (`golang-katas`, `nodejs-katas`) are **byte-identical files** (md5 `8e1320bf…`), as are their theme toggles (md5 `3b8cda63…`). That is copy-paste across repos, which is precisely the duplication a library exists to absorb.
- **Code display** — **24/24 folders** have fenced code (~11,600 fences). **14** ship a highlighter, and no two agree on the engine (10 CodeMirror, 2 highlight.js, 1 shiki, 1 Prism).
- **Type scale** — **0% covered, and it is the blocker.** Prose, CodeSnippet, and console output are all downstream of it. This directly undercuts the repo's own rule that there be *"no raw `rem` literals in component source"* — the katas have nothing to use instead, so they invent magic numbers by the dozen.
- **The app frame is genuinely well covered.** 21 folders have a sidebar catalogue nav; `Sidebar` + `Tree` cover it. 11 have a theme toggle; `useTheme` covers it (modulo a missing `system` mode). **4 folders re-implement a shadcn `ui/` subset** (badge/button/card/input/tabs) that zen-ui already ships in full. That is adoption headroom, not a gap.
- **Most of what follows should not be built** — and the reason is specific to this corpus rather than the usual scope caveat. In a teaching repo, **coverage can be an argument against adoption**: `react-katas` teaches building ~90% of zen-ui's catalogue from scratch, and `elixir-katas`' 257 katas exist to build modals and accordions by hand. Importing the components deletes the lessons. Six of the 24 folders are in this category.

The corollary matters for reading the counts: the gaps concentrate in the **app shells** these repos built to *host* their teaching content — the part nobody set out to write — not in the content itself.

## The strongest evidence: zen-ui already has a consumer, and it is in this corpus

`system-design` is not a hypothetical adopter. It **vendors zen-ui as a git submodule** (`vendor/zen-ui`, aliased in `frontend/vite.config.ts:11-29`), and its `CLAUDE.md` mandates zen-ui as the only UI library with an unusually strong instruction:

> "If a zen-ui component is missing or wrong, **fix it directly in the zen-ui source**."

It did exactly that, and the loop worked:

- **`Button` gained `shape="block"` and `multiline`** — pushed upstream, now living at `button.tsx:59-68`.
- **`Tabs` clipped at 4+ tabs** — fixed at `tabs.tsx:50-52` via `zen-flex-wrap`. The kata's compensating override at `index.css:352-361` is now **stale** and can be deleted.
- **Its entire `hacker` theme is ~40 `--zen-*` rebinds** under `:root[data-theme="hacker"]`, with **zero component forks**. This is the token system's best available proof.

So the gaps below are not speculative. They are the same feedback loop's unfinished queue — the things this consumer hit and worked around instead of fixing, because they were too big to fix in passing:

| Widget | Invocations across its 166 chapters |
|---|---|
| ```reveal (disclosure) | **470** |
| ```quiz | **365** |
| ```flashcards | **166** |
| ```compare | 95 |
| ```tradeoff | 89 |
| ```calc | 59 |
| ```match | 16 |
| ```stepper | 15 |

Stated plainly, because it cuts against the argument: **these fences exist in one folder only.** By folder count they rank last. `reveal` has independent corroboration — `<details>`-style disclosure appears in 5 folders — and zen-ui's `Accordion` likely already covers it. `quiz` and `flashcards` have none. They are a signal about *direction* from the one team that adopted zen-ui and documented what it lacked, on a sample of one.

## Tier 1 — Foundations (architectural; no component fixes these)

### 1. Type scale tokens — 0% covered, and everything else waits on it

zen-ui has **no `--zen-font-*` tokens at all**. Not sizes, not families, not line-heights. 17 folders needed them and each invented its own:

- **`system-design`** — ~50 raw `font-size` literals from `0.65rem` to `1.9rem`. It also sets `:root { font-size: 15px }` (`index.css:71`) while **its own `CLAUDE.md:113` documents 18px**. The values have already drifted from their own spec, in the one repo that mandates zen-ui.
- **`qa-labs`** — `globals.css:60-190` is a from-scratch typographic system (h1 2.25rem → h2 1.5rem → h3 1.25rem, 1.75 line-height, 75ch measure).
- **`design-patterns`** — three font families, including a **serif** for headings, plus 8 hardcoded px steps.
- **`c-katas`** — ~10 raw px sizes. **`llm-katas`** — 10 distinct sizes (11.5/12/12.5/13/13.5/14/15/16/19/25px).

The repo rule says *"No raw `rem` literals in component source. Use utilities or `--zen-*` tokens."* For type, **there is no token to use**. The rule currently cannot be followed.

Adjacent and equally absent:

- **Monospace family token** — needed by **13 folders**. `c-katas` repeats `'SF Mono','Fira Code','Consolas'` **verbatim 5 times** in one file; `golang-katas` repeats an identical stack 3×; `wasm-by-hand-instructor` hardcodes a mono stack on 16 of 25 pages. Every code editor, console, and code block in the corpus is blocked on this.
- **Measure token** — `support-katas` uses `max-width: 78ch`, `qa-labs` 75ch, `cloud-katas` 980px. No `--zen-measure`.
- **Syntax/code token colour roles** — **zero.** `grep -riE 'syntax|hljs|token-|--zen-code'` over `packages/core` returns nothing. `c-katas` needs 9 semantic roles (`kw/type/func/str/num/cmt/prep/inc/op`); `python-ai-katas` already threads 36 `var(--…)` refs through its CodeMirror chrome but has nowhere token-shaped to land the lezer tag→colour map. **A CodeSnippet cannot be themed across the three `data-theme` values without this.**

### 2. The prose problem — and why it collides with zen-ui's own CSS rule

13 folders render markdown. The parser is not zen-ui's business — it should never vendor `marked`. **The styling half is**, and that is where the duplication lives: every one of those folders reimplements `.markdown-body h1/h2/p/pre/code` by hand.

This runs directly into the repo's rule: *"Never ship page-level or element-level CSS from a library entry. The published stylesheet may only touch elements zen-ui renders."* A prose container styles elements `marked` emitted, which zen-ui did not render. Four separate agents independently flagged this as a blocker.

**It is not a blocker, and the precedent is already in the repo.** `packages/core/styles/preflight.css` **is** element-level CSS — it resets `button`, form controls, and borders — and it is legitimate because it ships as a **separate opt-in export** (`"./preflight.css"` in `packages/core/package.json:13`, `"./preflight"` in `packages/react/package.json:18`) rather than from `index.ts`. Its header says it is *"deliberately surgical… Heading / list / margin resets are intentionally omitted to preserve browser-default typography for consumer content."*

A `.zen-prose` scope shipped the same way — opt-in export, scoped to a container class, never touching the global document — honours the rule's intent exactly. The rule forbids a library entry silently restyling a consumer's page. It does not forbid a consumer opting into a prose scope. **`/preflight` is the pattern; prose is its second instance.**

### 3. Motion tokens — 0% covered, with a live accessibility consequence

10 folders hand-pick durations. `todo.md:172` already tracks gating animations behind `prefers-reduced-motion`, and the kata evidence gives it weight: **`system-design` ships a fixed CRT scanline overlay and a 400ms wrong-answer flash, and `prefers-reduced-motion` appears nowhere in that repo.** zen-ui honours it in exactly one component (`object-page.tsx`) and offers consumers no token to do better.

### 4. Theme: a mechanism mismatch, and a missing `system` mode

`nodejs-katas`, `golang-katas`, `python-ai-katas`, `design-patterns`, `netsec-katas`, `qa-labs` (via next-themes), and `support-katas` all drive a **`.dark` / `.light` class on `documentElement`**. zen-ui keys off `data-theme`. Both work; they are simply different, so every one of those apps must rewrite its theme context — including its pre-paint script — to adopt zen-ui. That is an adoption tax, not a capability gap.

The capability gap sits next to it: **zen-ui has no `prefers-color-scheme` handling at all**, and `ThemeName` is `"default" | "zen-theme" | "dark"` (`core/src/theme.ts:16`) — there is **no `system` state**. Two folders implement three-state light/dark/**system** themselves: `support-katas` (`theme.tsx:36-50`) and `react-katas`, which listens live to `matchMedia('(prefers-color-scheme: dark)')` (`hooks/use-theme.ts:45-52`). "Follow the OS until the user chooses" is the default behaviour users expect, and `useTheme` cannot express it.

### 5. Grid — 0% covered

8 folders hand-write `grid-template-columns`. The recurring shape is `repeat(auto-fill, minmax(240–280px, 1fr))` for card catalogues (`python-katas`, `c-katas`, `system-design`, `dotnet-katas`). `Stack` is the only layout primitive. Same conclusion as the Carbon analysis, reached independently.

Worth noting the counter-evidence: `react-katas` explicitly does **not** need it (7 `display:grid` sites, flexbox throughout), and `opencv-python-katas` and `redis-katas` are flex-only too. Grid is real but less universal than the type scale.

### 6. Z-index scale — 0% covered

The one foundation gap this corpus surfaced that the Carbon analysis did not. `react-katas` defines a **7-step named scale** (`--z-dropdown: 1000` … `--z-tooltip: 1600`, `index.css:123-129`) because its splitter, portal modals, and console panel all depend on stacking order. `python-katas` gets by with a bare `z-index: 1000` (`style.css:399`). zen-ui ships overlays (`Dialog`, `Popover`, `Sheet`, `Tooltip`, `DropdownMenu`) but exposes **no ordering contract** for consumers composing their own layers alongside them. Two folders — modest evidence, but it is a foundation, and overlay-heavy libraries are exactly where an undocumented z-index bites.

## Tier 2 — The developer-tool surface (the real finding)

These four cluster into one unserved domain. zen-ui's catalogue is broad on enterprise/form/data widgets and **empty here**.

### CodeSnippet — 14 folders, ~11,600 fences

The highest-frequency component gap in the corpus. Needed: read-only, language-labelled, line-numbered, horizontally scrollable, copy-enabled, themed across all three `data-theme` values.

Two design constraints the evidence dictates:

- **It must be highlighter-agnostic.** The 14 folders split 10 CodeMirror / 2 highlight.js / 1 shiki / 1 Prism. Take pre-highlighted HTML *or* a `highlight` hook; do not vendor an engine.
- **It must not wrap.** `netsec-katas` has **1,615 fences**, most of them ASCII network diagrams — `prose-pre:overflow-x-auto` is what keeps them legible, and wrapping silently destroys the teaching content.

Frequency: `elixir-katas` 1,665 · `netsec-katas` 1,615 · `system-design` 1,423 · `design-patterns` 1,076 · `opencv-python-katas` 973 · `webrtc-katas` 751 · `cloud-katas` 285 · `llm-katas` 84 blocks + 212 inline · `qa-labs` 74 pages · `react-katas` 42 of 48 lesson files.

Two data points sharpen this:

- **`system-design`'s own `CLAUDE.md:115` requires syntax highlighting, and it silently never shipped** — `markdown.tsx:46` emits a bare `<pre class="code-block">`. The zen-ui consumer asked for this in writing and went without.
- **`react-katas` ships no highlighter at all** — 42 of its 48 lesson files render code as raw template literals in bare `<pre><code>`. So the 14-folder "ships a highlighter" count *understates* demand: some folders don't have highlighting because it was too much work, not because they didn't want it.

`CopyButton` (3 folders) belongs **inside** CodeSnippet, not standalone.

### Prose / typography container — 13 folders

Covered in Tier 1. Restated here because it is a component as well as a foundation: a `.zen-prose` container styling `h1–h6, p, ul/ol, table, blockquote, pre, code, a` from `--zen-*`. Blocked on the type scale; unblocks 13 folders at once. **The single highest-leverage item in this document.**

One extra requirement, from `netsec-katas`: markdown tables need `display: block; overflow-x: auto` to survive 4-column comparison tables on mobile. zen-ui's `Table` cannot help — it cannot reach elements it did not render.

### Console / output pane — 12 folders

Append-only, monospace, `white-space: pre-wrap`, stdout/stderr/error severity styling, status + timing header, empty state, scroll-pinned to bottom.

This is **distinct from CodeSnippet** — it appends over time and must stay pinned. `wasm-by-hand-instructor` uses one on **20 of its 25 pages**, making it that repo's single most repeated element. `rabbitmq-katas` is 179 lines of UI and *two* of its panes are this. `nlp-katas` shows where it goes next: typed output segments (text/html/svg/image/chart).

### Resizable / split pane — 7 folders

Drag handle, controlled sizes, min-size clamping, keyboard resize, programmatic maximize/restore.

**`FlexibleColumnLayout` is not this**, and the check matters because the names invite the assumption: zero `mousedown`/`pointerdown`/`col-resize`/`onDrag` across its 253 lines. It snaps to named breakpoint ratios. Three folders pay for `@corvu/resizable`; four hand-roll the drag math. `python-katas` wants a variant worth noting — *minimize-to-header-strip*, where the collapsed panel keeps its header and its sibling expands.

### Code editor (editable) — 9 folders — **recommended against**

Listed here because it is the most-cited gap in the corpus (`elixir-katas` 257 katas, `python-ai-katas` 125, `opencv-python-katas` 128, `llm-katas` 140 cells), and because `RichText` is emphatically not a substitute — jodit is a WYSIWYG prose editor, a different category.

**Do not build it.** It means vendoring CodeMirror 6 or Monaco, language grammars, and a theme bridge — a dependency and maintenance burden far outside a shadcn-style library's remit, and every one of these folders already integrates one directly in ~40 lines. The *right* move is to ship the **mono font token and syntax colour roles** (Tier 1) so those integrations can theme against zen-ui, and stop there. Shipping CodeSnippet gets ~80% of the value at ~5% of the cost.

## Tier 3 — Small, cheap, corroborated

Each is small and each has multi-folder evidence:

| Component | Folders | Note |
|---|---|---|
| **Link** | 12 | The Carbon doc already called this "the single most surprising absence." Half this corpus independently agrees. `nodejs-katas` restyles a router `<A>` by hand in 5 files. `react-katas` needs the **whole-card-is-a-link** case (8 sites) — `SelectableCard` is selection state, not navigation. Needs `asChild` for react-router / `@solidjs/router`. |
| **Search** | 6 | Not `Combobox`. `elastic-search-katas` is the precise case: a **free-text** box with an *advisory* suggestion dropdown that never blocks submitting unlisted text. `Combobox` is a picker — it commits to an option. Different component. |
| **ContentSwitcher** | 6 | Segmented control. Already on the Carbon list; confirmed in real use. `react-katas` (27 lessons) pins the exact shape: a `role="tablist"` selector **decoupled from panels** — it remounts a keyed child rather than pairing triggers to content, which is what `Tabs` does. Not a `Tabs` variant. |
| **Tag** | 5 | Display chip, distinct from `TagInput`. `opencv-python-katas` renders one per sidebar row (×128); `support-katas` ~30 on its tag index. Often wraps `<code>`, so `Badge` (status-shaped) does not fit. |
| **Stat tile** | 7 | Number + label. Composable from Card + Stack today, just verbose. Already on the Carbon list. |
| **Kbd** | 5 | Shortcut hint. Pairs naturally with the existing `Command`. |
| **Highlight / `<mark>`** | 2 | `elastic-search-katas` renders server-returned `<mark>` on every result row; `netsec-katas` for search hits. Unthemed UA yellow today — there is no `--zen-color-highlight`. |
| **Progress: completion semantics** | 9 | 9 folders track localStorage progress. `Progress` covers the bar; missing is the "12/48 complete" in-track label and a per-item done/in-progress/locked marker for a nav list. Cheapest item here. |

### Icons — the closed set is the structural problem

47 icons (**not** the 38 the [Carbon doc](carbon-gap-analysis.md) claims — that figure is stale and should be corrected there). 7 folders hit the ceiling. Genuinely absent and repeatedly wanted: **`sun`, `moon`, `copy`, `play`, `maximize`/`minimize`, `panel-left-close`/`panel-left-open`**.

The pointed one: **zen-ui ships `useTheme` and three themes but has no `sun`/`moon` icon**, so every one of the 11 folders with a theme toggle drew its own or imported lucide.

But adding glyphs does not fix it. `Icon` accepts an `IconName` union — a **closed set with no custom-SVG passthrough**. `qa-labs` needs 22 arbitrary lucide icons, `cloud-katas` 18, `netsec-katas` 15. No plausible built-in set covers that. **The fix is an escape hatch** — let callers pass their own SVG — not a bigger union. Otherwise adopters run two icon systems side by side, which is what they all do today.

## Tier 4 — Domain-specific (record, do not build)

- **Heatmap / matrix** — 2 folders, but *defining* for both. `nlp-katas` has 20 call sites across 15 katas (attention weights, confusion matrices, cosine similarity) and hand-wrote a 230-line canvas renderer; `python-ai-katas` renders tensors. `Chart` cannot express it — verified: it takes rows + series keys, not `x_labels`/`y_labels`/`data[][]`. A real gap, but a chart-library-shaped one.
- **WebRTC media family** — `webrtc-katas` alone: video tile bound to a remote `srcObject` (15/51 exercises), call-controls cluster, gallery grid, audio level meter, stats overlay, frame capture. `Camera` covers *local capture only*. One folder; a whole vertical.
- **Sparkline** — 3 folders. recharts cannot do the inline, axis-less size.
- **Categorical palette beyond 6** — `Chart`'s `PALETTE` has 6 entries; `qa-labs` needs 19 phase colours, `system-design` hand-builds a series palette from accent tokens. A documented ordered scale would help both.
- **Mermaid** — 3 folders, and only **18 fences repo-wide, all in `cloud-katas`**. Hand-rolled SVG dominates instead (`design-patterns` 101 generated diagrams, `system-design` 626 lines of custom SVG). Diagram needs are too bespoke to systematize. Do not build.
- **Drag-and-drop / sortable list** — `react-katas` (`07-machine-coding/DragAndDrop.tsx`, an HTML5 DnD kanban). zen-ui has **no DnD or sortable primitive anywhere**. One folder, but it is an entire machine-coding chapter with no zen-ui answer, and DnD is a well-known hole in shadcn-style libraries generally. Worth recording as a known absence rather than a roadmap item.
- **Infinite-scroll list** — `react-katas` (`InfiniteScroll.tsx`, IntersectionObserver sentinel with hasMore/end states). `VirtualizedItems` is windowing over a *known* array — load-on-scroll is a different contract.
- **Math typesetting** (`llm-katas`, 41 blocks), **hex/byte inspector** (`webrtc-katas`, `wasm-by-hand-instructor`), **SVG pan/zoom + step-reveal** (`llm-katas`, 21 diagrams), **live cursors**, **audio player**, **masked input** — one folder each. Genuinely out of scope.

## Premises that did not survive contact

Recorded because each would have produced a wrong roadmap, and because the folder names actively mislead:

- **`netsec-katas` has no security UI.** No hex viewer, no log stream, no terminal, no severity badges, no mermaid. Its `destructive` Badge variant is defined and **never used**. 1,408 bare fences of ASCII art. It renders prose.
- **`support-katas` has no helpdesk UI.** "Support" means *support-engineer training*. No tickets, SLA timers, threads, or composers. Its `mermaid` dependency is declared and **imported nowhere**.
- **`cloud-katas` is not a cloud console.** No resource tables, cost charts, log viewers, or region pickers. A docs reader.
- **`llm-katas` is not a chat app.** No transcript, streaming, model picker, or feedback UI.
- **`redis-katas` has nothing live.** No `EventSource`/`WebSocket`/`setInterval`. Every demo's command and output is a hardcoded literal; 16 of 20 katas are wired in.
- **`rabbitmq-katas` has no messaging UI** — no queue gauges, no topology. Deliberately delegated to RabbitMQ's own Management UI on `:15672`.
- **`nlp-katas` has no span annotators or token highlighters.** Its `show_html`/`show_svg` helpers are implemented in both backends and the frontend and have **zero call sites**. Do not build entity annotators for it.
- **`opencv-python-katas`' `demo_controls`** (`slider|toggle|dropdown`) is **dead code** — `db.py:107` hardcodes `[]`, 0 of 128 katas define it.

## What NOT to build, and why

Six folders' UI is hand-made **on purpose**, and adopting zen-ui would damage them. This is the corpus's most important structural fact, and it cuts against a naive reading of every count above: **in a teaching repo, coverage is sometimes an argument against adoption.**

- **`react-katas`** — the irony worth stating, since it is React and would otherwise be the most natural adopter in the corpus. Its first principle is *"No external UI libraries — all components built from scratch"* (`CLAUDE.md:18`), and its 46 lessons teach exactly the vocabulary zen-ui ships: Tabs (4 separate implementations), Accordion, Modal, Tooltip, Dropdown, Toast, Autocomplete (→ `Combobox`), file explorer (→ `Tree`, whose `TreeNode.icon` even has `folder`/`folder-open`/`file`), virtualized list (→ `VirtualizedItems`), command palette (→ `Command`), and Slot/`asChild` (Radix-backed on 20+ zen components). **~90% of what it teaches, zen-ui already has** — which is precisely why its lesson content must not use it.
  Its **app shell**, however, is fair game and is where its 10 gaps come from: CodeSnippet (42 of 48 files), the CodeMirror viewer/editor, the splitter, Link, ContentSwitcher, the console panel.
- **`elixir-katas`** — the sharpest case. Its 257 katas *teach building the widgets*: `kata_54` exists to build a modal from an overlay div; `kata_08` teaches accordion state via `grid-rows-[1fr]/[0fr]`. Importing `<Dialog>` and `<Accordion>` **deletes the lesson**. That zen-ui covers these is precisely why it must not be used. Applicability is nil for three independent reasons anyway: pedagogical; architectural (HEEx renders server-side and diffs over a WebSocket — no React bridge installed); and redundant (daisyUI is already used in 131 of 323 files and has won).
- **`qa-labs`' 48 playground fixtures** — "no external dependencies, no CDN" is the stated contract, and several are **deliberately defective**: `39-accessibility-testing` ships six intentional axe violations; `59-core-web-vitals` ships an intentional 800ms INP stall. They are the *test target*. A component library adopting them breaks the kata.
- **`js-web-katas`** — its thesis is "prefer the platform API over the library." It never reaches for a data grid, pagination, or combobox by design.
- **`dotnet-katas`** (Blazor Server) — no npm toolchain; mounting React via JS interop would fight Blazor's own diffing. The token layer is transferable; the components are not.
- **`c-katas`** — the C programs render to a terminal or write PPM/BMP files. Only `site/index.html` is in scope, and that site is **~6 of 32 modules functional** (its hand-maintained id list has drifted from disk).
- **`learn-rust-in-tweets-author-edition`** — **no UI at all.** Verified four ways. A genuine zero; it carries no weight in any count above.

## Recommended shortlist

Ordered by leverage, not by folder count. The first item unblocks the next two.

1. **Type scale + font-family tokens** (`--zen-font-*`: sizes, line-heights, sans/mono families) — 17 folders. Unblocks prose, CodeSnippet, and console simultaneously, and makes the repo's own "no raw rem literals" rule followable for the first time. **Nothing else on this list should ship first.**
2. **Syntax colour roles** (`--zen-syntax-{keyword,string,comment,number,…}`) — small, and the prerequisite for theming any code surface across the three themes.
3. **`Prose` container**, shipped as an opt-in export scoped to `.zen-prose`, following the `/preflight` precedent exactly — 13 folders, 5 of them currently hand-rolling both parser and CSS, 2 byte-identically.
4. **`CodeSnippet`** — highlighter-agnostic (accept pre-highlighted HTML or a hook), no-wrap, language label, copy affordance — 14 folders, ~11,600 fences.
5. **`ConsoleOutput`** — append, mono, severity, scroll-pinned — 12 folders.
6. **`Link`** — 11 folders, and already the Carbon doc's most surprising absence.
7. **Icon escape hatch** — accept a caller's SVG; add `sun`/`moon`/`copy` while there. Fixes a structural limit, not a count.
8. **`Resizable`** — 7 folders. Larger than the rest; genuinely absent; `FlexibleColumnLayout` verified not to substitute.

Deliberately excluded: the **code editor** (9 folders, highest raw demand — but vendoring CodeMirror/Monaco is outside this library's remit; ship the tokens and let consumers integrate), **mermaid** (18 fences, one folder), and the **teaching interactions** (`quiz`/`flashcards` — one folder, no corroboration, despite being the loudest single voice in the corpus).

## Corrections owed to sibling documents

- [carbon-gap-analysis.md](carbon-gap-analysis.md) states **"Icons — 38 vs Carbon's 2,707."** The real count is **47** (`packages/core/src/icons.ts`). The gap's shape is unchanged; the number is stale.
- The same document's Tier 2 lists `Link`, `Search`, `CodeSnippet`, `ContentSwitcher`, `Tag`, `Tile`, `CopyButton` as "small, cheap, high value" on Carbon's authority alone. This corpus supplies **independent, multi-folder, real-usage evidence** for every one of them. They should be treated as confirmed rather than inferred.
- `system-design`'s `index.css:352-361` carries an override for a `Tabs` clipping bug **that zen-ui has since fixed** (`tabs.tsx:50-52`). That override is dead code in the consumer and can be deleted — worth telling them.
