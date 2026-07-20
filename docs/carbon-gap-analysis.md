# IBM Carbon Design System — Gap Analysis

**Date:** 2026-07-15
**zen-ui version reviewed:** `@algorisys/zen-ui-react` 3.0.0 (branch `dev`, commit `b7b82b6`)
**Revised:** 2026-07-20 — re-checked against **8.0.0**, five releases later. Seven of the
thirteen shortlist items had shipped without the doc noticing, and four claims below were
simply false as written (type tokens, motion tokens, the icon count, the `id`-on-wrapper
a11y bug). Status is checked against each binding's `index.ts` and
`packages/core/styles/tokens.css`, not against memory. See
[Status at 8.0.0](#status-at-800) for the summary; individual sections are corrected in place.
**Reference:** [Carbon Design System](https://carbondesignsystem.com/) — `@carbon/react` 1.111.1, Carbon v11

## How this was compiled

`carbondesignsystem.com` renders fine in a browser but **truncates under every automated fetch** — WebFetch returned "[Content truncated due to length...]" for the colour, grid and accessibility pages alike. As with the Fiori analysis, the inventory below was therefore reconstructed from the machine-readable sources that back the guidelines rather than the guidelines themselves.

| Source | What it gave us |
|---|---|
| `carbon-design-system/carbon` — `packages/react/src/components` | The React component set (123 directories) |
| `packages/themes/src/{white,g10,g90,g100}.ts` + `tokens/v11TokenGroup.ts` | Exact token names, the four themes, the layer model |
| `packages/layout/src/index.ts` | Spacing scale **values** and breakpoints |
| `packages/type/src/{scale,styles,fontFamily,fluid}.ts` | The generated 23-step type scale, productive/expressive, fluid |
| `packages/motion/src/index.ts` | Duration + easing tokens |
| `packages/colors/src/colors.ts` | The grey/blue ramps |
| `carbon-design-system/ibm-products` — `packages/ibm-products/src/components` | Carbon for IBM Products (the product-pattern tier) |
| git tree of `carbon@main` (recursive, untruncated) | Exact icon/pictogram counts |
| `carbon-website/src/pages/**/*.mdx` | The guidance prose, at source, un-truncated |

Source notes worth recording, because they cost time and each one would have produced a wrong claim:

- **`packages/layout/src/tokens.ts` contains no values** — only an array of token *names*. The spacing values live in `index.ts`. Reading `tokens.ts` and reporting "Carbon spacing tokens: spacing01…spacing13" would have been technically true and useless.
- **`packages/type/src/scale.js` 404s** — the file is `scale.ts`. Several Carbon foundation files migrated to TS; guessing the extension silently yields nothing.
- **`aiGradientStart` / `aiGradientEnd` no longer exist.** Present in `@carbon/themes@11.30.0`, gone by `11.40.0` (the source marks it `// Linear gradient refactor`), replaced by the `aiAura*` family. Any blog post citing `aiGradient` is stale.
- **`Slug` was renamed `AILabel`.** React's `Slug` directory is deleted; `@carbon/web-components` still carries a deprecated `slug` alongside `ai-label`.
- **`<Grid>` defaults to CSS Grid, not FlexGrid.** `packages/react/src/feature-flags.js` sets `enable-css-grid: true`, and `Grid.tsx` is a dispatcher that returns `<CSSGrid>` unless the flag is off.
- Carbon has **no canonical numbered list of design principles**. The repo and website source contain none; `ibm.com/design/language/` 403s to fetchers. Carbon defers foundational principles to the IBM Design Language, a separate property. Any "Carbon's N principles" list in the wild is a paraphrase. This document does not invent one.

A methodological note on the zen-ui side: the first pass of "does zen-ui have X?" used a `grep -lE "export (const|function|\{)? ?X\b"` sweep, which reported `Tooltip`, `Select`, `Alert`, `Sheet`, `Listbox` and `DropdownMenu` as MISSING — all six plainly exist. The regex was wrong, not the library. Every "missing" claim below was re-verified with a plain word-boundary search across the whole package plus a control group of known-present components. `Link` and `Search` survive as gaps only after confirming their hits are react-router's `<Link>` and the string `"Search"` in placeholders.

## Executive summary

Carbon and zen-ui are the same *kind* of thing — an open-source, token-driven, multi-binding component library — far more so than Fiori was. That makes the comparison sharper and the gaps less excusable: where the Fiori analysis could dismiss most of its tail as "inseparable from SAP's backend", almost everything Carbon does is portable in principle.

The headline: **zen-ui's component coverage is respectable; its foundations are where the real gap is.** Counting components understates the distance, because Carbon's most valuable ideas are not components.

- **Component families** — ~70% covered *(at 3.0.0)*. The missing ones are mostly small and cheap (Link, Search, PasswordInput, CodeSnippet, ContentSwitcher, Toggletip, Tag, Tile, CopyButton). That zen-ui has no **Link** component is the single most surprising absence in the inventory. **→ At 8.0.0, Link, Search, PasswordInput and SkipToContent have shipped in all bindings, and `SegmentedButton` covers ContentSwitcher. CodeSnippet, Toggletip, Tag, Tile, CopyButton, AspectRatio and Heading/Section remain.**
- **The Layer model** — **0% covered**, and this is the deepest gap in the document. It is an architectural idea, not a component. Detail below. **→ Still 0% at 8.0.0. See the cost note in [Status at 8.0.0](#status-at-800) — the "decide now while the library is 3.0.0" framing has expired.**
- **The 2x Grid** — **0% covered**. zen-ui has `Stack` and nothing else. There is no grid, no column, no breakpoint system. **→ Still 0% at 8.0.0.**
- **Type scale** — ~~**0% covered**. zen-ui has **zero** `--zen-font-*` tokens.~~ **Closed.** 17 `--zen-font-*` and 9 `--zen-line-*` tokens now ship in `tokens.css`. The repo-rule contradiction described below is resolved.
- **Motion tokens** — ~~**0% covered**.~~ **Mostly closed.** `--zen-duration-{fast,moderate}` and `--zen-ease-{standard,in,out,collapse}` now ship — 2 durations and 4 easings against Carbon's 6 and 6.
- **Icons** — ~~38~~ **48** vs Carbon's **2,707**. Not a defect, but it bounds what zen-ui can be asked to render.
- **Themes** — 3 vs 4, but on a **different axis entirely** (see the theming section — this is a conceptual mismatch, not a count).
- **AI ecosystem, pictograms, Fluid form variants, `@carbon/ibm-products` tail** — 0% covered, and mostly **should stay that way**.

As with the Fiori document: **most of what is listed below should not be built.** The value is concentrated in Tier 1 and Tier 2.

## Status at 8.0.0

Added 2026-07-20. The [recommended shortlist](#recommended-shortlist) had thirteen items; seven
have shipped. This table is the reconciliation — it is the part to read if you are picking up work.

| # | Item | Status at 8.0.0 |
|---|---|---|
| 1 | `id`-on-wrapper a11y bug | ✅ **Fixed.** And the doc's claim was over-broad: measured, only Solid was affected — React and vanilla put the `id` on a `<button>`, which *is* labelable. Solid now routes it to the native control. See [CLAUDE.md](../CLAUDE.md). |
| 2 | `SkipToContent` | ✅ Shipped, all bindings (`components/skip-to-content/`). |
| 3 | Type tokens | ✅ Shipped. 17 `--zen-font-*`, 9 `--zen-line-*`. |
| 4 | Motion tokens | 🟡 Mostly. 2 durations + 4 easings vs Carbon's 6 + 6. No `prefers-reduced-motion` story yet — the tokens now give it somewhere to live, which was the point. |
| 5 | `<Theme>` scoping | ❌ **Open.** `tokens.css` still declares `:root[data-theme="…"]` (lines 26, 125, 295) and `theme.ts:60` still sets the attribute on `documentElement`. Global-only. Cheapest open item in the doc. |
| 6 | `Grid` / `Column` + breakpoints | ❌ **Open.** Zero breakpoint tokens in core; `Stack` is still the only layout primitive. |
| 7 | The Layer model | ❌ **Open, and the framing has expired.** |
| 8 | `Link` | ✅ Shipped, all bindings. |
| 9 | `Search` | ✅ Shipped, all bindings (7.1.0). |
| 10 | `ContentSwitcher` | ✅ Covered by `SegmentedButton` (+ `SegmentedButtonItem`), all bindings. Recorded as closed-by-equivalent, not built under Carbon's name. |
| 11 | `Toggletip` | ❌ Open. |
| 12 | `PasswordInput` / `CopyButton` / `AspectRatio` / `Tag` | 🟡 `PasswordInput` shipped, all bindings. The other three are open. |
| 13 | `Heading` / `Section` | ❌ Open. |

**The cost basis of every estimate above has changed, and it changes the recommendation.** This
document was written when zen-ui had two bindings. It now has four: vanilla landed in 7.0.0 and
web-components in 7.2.0. Because web-components is a declarative layer over the vanilla factories,
a new component family costs **three real implementations** plus three demos and three nav entries
— not two. Work in `packages/core` still costs one.

That asymmetry did not exist when the shortlist was ordered, and it pushes the same way for every
row: **core-level work got relatively cheaper, component-level work got 50% more expensive.**

It also retires this document's central argument for the Layer model. The claim was that it is
"worth deciding on **now**, while the library is 3.0.0, rather than at 5.0.0" — because retrofitting
means touching every component's surface tokens. That deadline passed. At 8.0.0 the retrofit spans
~57 component directories × 3 implementations, and per [CLAUDE.md](../CLAUDE.md) a visual change is
a major bump. The honest reading is that the window the doc identified has closed, and the choice
is now between a large deliberate migration and an explicit "no" — **not** the cheap early decision
originally on offer.

## What zen-ui has today

The [Fiori analysis](fiori-gap-analysis.md) enumerated 63 component families and reported the app frame at 0%. That is now **stale in zen-ui's favour** — commits `4f7322f` through `b7b82b6` landed ShellBar, FlexibleColumnLayout, ObjectPageLayout, Page/Bar, Toolbar, Tree, FilterBar, ViewSettingsDialog, SelectDialog and ValueHelp across both bindings. Several Carbon UIShell and table-ecosystem gaps are consequently already closed; they are marked as such below rather than re-listed as gaps.

Foundations, as they exist in `packages/core`:

- **Colour** — `--zen-color-*`: 8 semantic ramps (primary, error, warning, success, info, neutral, magenta, cream) each with a 10-step scale (`-20`…`-900`), plus semantic aliases (`background`, `foreground`, `muted`, `border`, `ring`) and `-fg` / `-soft` / `-soft-fg` triads.
- **Spacing** — `--zen-space-{0,1,2,3,4,5,6,8,10,12,16}` = 0/4/8/12/16/20/24/32/40/48/64px. A 4px-based Tailwind-shaped scale.
- **Radius** — `--zen-radius-{sm,md,lg,full}` = 4/6/8/9999px.
- **Shadow** — `--zen-shadow-{xs,sm,md,lg,xl,2xl}`.
- **Status** — `--zen-status-{online,away,busy,offline}`.
- **Type** — ~~none~~ *(corrected 2026-07-20)* `--zen-font-size-{xs,sm,base,lg,xl,2xl,3xl,4xl,5xl}`, `--zen-font-weight-{light,normal,medium,semibold,bold}`, `--zen-font-{sans,serif,mono}`, plus 9 `--zen-line-*`. A Tailwind-shaped scale, not a generated one.
- **Motion** — ~~none~~ *(corrected 2026-07-20)* `--zen-duration-{fast,moderate}`, `--zen-ease-{standard,in,out,collapse}`.
- **Breakpoints** — none. *(added 2026-07-20 — the original list omitted the row entirely, which read as "not applicable" rather than "missing".)*

## The framing: what each system is

Carbon's own description, from the repo README:

> "Carbon is IBM's open-source design system for products and experiences. This monorepo includes the React and web components libraries, Sass styles, design tokens, icons, pictograms, and tooling used to build with Carbon."

The relevant asymmetry is not size, it's **the direction guidance flows**. Carbon is downstream of the IBM Design Language and upstream of IBM's products; it encodes opinions it did not invent and cannot unilaterally change. zen-ui is a shadcn/Radix-style library that answers to its own consumers. So Carbon's *conclusions* (IBM Plex, blue60, productive/expressive) are worthless to zen-ui, while Carbon's *mechanisms* (contextual token indirection, a generated type scale, motion as tokens) are worth a great deal. **Read the rest of this document with that filter on**: port mechanisms, ignore conclusions.

---

## Tier 1 — Foundational gaps (architectural; components won't fix these)

### 1. The Layer model — the most valuable idea Carbon has that zen-ui lacks

This is the one thing in this document that would change how zen-ui components are written, so it gets the space.

**The problem it solves:** a token like "container background" cannot have one value, because a container's correct background depends on **what it is sitting on**. A card on the page body and a card nested inside another card must differ or the nesting boundary disappears. Every flat-token system hits this and resolves it by hand — the component author picks `--zen-color-background` or `--zen-color-muted` based on where they *expect* the component to be used, and it breaks the moment someone nests it differently.

**Carbon's solution** is a *contextual indirection*, not a palette. Three numbered steps, where the numbered sets are **theme-dependent alternations**:

| Token | `white` | `g10` | `g100` |
|---|---|---|---|
| `background` | white | gray10 | gray100 |
| `layer01` | gray10 | white | gray90 |
| `layer02` | white | gray10 | gray80 |
| `layer03` | gray10 | white | gray70 |

Light themes **alternate** (white→gray10→white→gray10); dark themes **ascend monotonically** (gray100→gray90→gray80→gray70). In light mode contrast comes from oscillation; in dark mode from progressive lightening — dark surfaces read as "closer to the light" as they nest. `white` and `g10` are the same alternation *phase-shifted by one step*, which is precisely why both exist.

The mechanism that makes it usable is the **Contextual token group** — unnumbered aliases:

```
layer, layer-hover, layer-active, layer-selected, layer-accent,
field, field-hover, border-subtle, border-strong, border-tile
```

A component author writes `$layer`, **never** `$layer-02`. The current layer context rebinds `$layer` to `layer-01/02/03` by nesting depth. Components are written once and are correct at any depth. That is the entire payoff.

The React implementation is ~15 lines (`packages/react/src/components/Layer/`):

```tsx
const contextLevel = React.useContext(LayerContext); // default: 1, not 0
const level = overrideLevel ?? contextLevel;
const className = cx(`${prefix}--layer-${levels[level]}`, …);
const value = clamp(level + 1, MIN_LEVEL, MAX_LEVEL); // saturates at 2
return <LayerContext.Provider value={value}>…</LayerContext.Provider>;
```

Three details worth stealing exactly:
- The context default is **1, not 0** — an un-wrapped page already counts as layer one, so the *first* `<Layer>` renders `layer-two`.
- Each `<Layer>` renders at the **incoming** level then provides `level + 1`. The `<Layer>` and its children sit on different steps.
- **`clamp` saturates rather than overflows.** A 4th nested `<Layer>` renders `layer-three` again. The model flattens instead of breaking, which is what makes it safe to use in a library where you don't control nesting depth.
- `border-subtle-**00**` exists because subtle borders alternate too — the `00` step is the border for content on `background` itself, before any `<Layer>`.

**zen-ui has no equivalent and no substitute.** `--zen-color-background` / `--zen-color-muted` are flat and absolute. Verified: zero occurrences of `Layer` in `packages/react/src`. This is not a missing component — it is a missing *capability*, and retrofitting it later means touching every component's surface tokens. It is worth deciding on **now**, while the library is 3.0.0, rather than at 5.0.0.

Note the honest counter-argument: the layer model earns its keep in dense enterprise UIs with deep nesting. A library whose consumers build flatter pages may reasonably decide the indirection isn't worth the cognitive cost. That's a legitimate call — but it should be a *decision*, not an omission by default.

### 2. The 2x Grid — zen-ui has no layout system at all

Carbon's grid and its spacing scale are **one system**, generated from a single constant:

```ts
export const miniUnit = 8;
export const miniUnits = (count) => rem(miniUnit * count);
```

> "The 2x Grid is the geometric foundation of all the visual elements of IBM Design, from typography to columns, boxes, icons, and illustrations." — *2x-grid/overview.mdx*

Breakpoints (code and docs agree exactly):

| Breakpoint | Width | Columns | Margin |
|---|---|---|---|
| `sm` | 320px / 20rem | **4** | **0** |
| `md` | 672px / 42rem | **8** | 16px |
| `lg` | 1056px / 66rem | **16** | 16px |
| `xlg` | 1312px / 82rem | **16** | 16px |
| `max` | 1584px / 99rem | **16** | 24px |

16 columns only from `lg` up — small is 4, medium is 8, *halving*, per the 2x concept. Small has zero margin (edge-to-edge on phones).

React ships `Grid` + `Column` (CSS Grid, no `Row`, with **subgrid** support via `GridSettings`) and the legacy flexbox `FlexGrid`/`Row`/`Column`. Props: `condensed` (1px gutter), `narrow` (hangs 16px into the gutter), `fullWidth`, `withRowGap`.

**zen-ui has `Stack` and nothing else.** No `Grid`, no `Column`, no breakpoint tokens, no responsive primitives. Verified zero occurrences of both. Consumers are hand-rolling UnoCSS grid classes, which means every zen-ui app's layout is bespoke and none of them agree.

zen-ui's spacing scale is also **4px-based** where Carbon's is 8px-derived-with-fractions:

| | zen-ui | Carbon |
|---|---|---|
| Base | 4px, flat | `miniUnit = 8`, with `.25/.5/1/1.5/2/3/4/5/6/8/10/12/20` multipliers |
| Steps | 11 | 13 |
| Values | 0/4/8/12/16/20/24/32/40/48/64 | 2/4/8/12/16/24/32/40/48/64/80/96/160 |

zen-ui's is fine and I'd not change it — Tailwind's scale is well-trodden. But note Carbon reaches **160px** and zen-ui stops at 64px, so page-level rhythm has no tokens at all; and Carbon's `spacing01` = 2px has no zen-ui equivalent for hairline adjustments. Worth adding both ends.

### 3. The type scale — ~~zero tokens, and this contradicts a stated repo rule~~ CLOSED (2026-07-20)

> **Status: closed.** Type tokens shipped between 3.0.0 and 8.0.0 — see [Status at 8.0.0](#status-at-800).
> The section is kept because Carbon's *generated* scale and the productive/expressive split are
> still ideas zen-ui has not taken, and because the contradiction it documents is the reason the
> tokens exist. Read it as rationale, not as an open gap.

Carbon's type scale is **generated, not authored** (`packages/type/src/scale.ts`):

```ts
export const getTypeSize = (step) => {
  if (step <= 1) return 12;
  // Yn = Yn-1 + {FLOOR[(n - 2) / 4] + 1} * 2
  return getTypeSize(step - 1) + Math.floor((step - 2) / 4 + 1) * 2;
};
// [12,14,16,18,20,24,28,32,36,42,48,54,60,68,76,84,92,102,112,122,132,144,156]
```

23 steps. The increment grows every 4 steps, so the scale is near-linear at text sizes and accelerates into display sizes. Weights: **only three** (light 300, regular 400, semibold 600).

**zen-ui had no type tokens whatsoever** at 3.0.0 — verified then, zero matches for `--zen-font`/`--zen-text`. *(As of 8.0.0 there are 17 `--zen-font-*` and 9 `--zen-line-*`; the paragraph below records why they were added.)* This mattered more than it looked, because [CLAUDE.md](../CLAUDE.md) states:

> **No raw `rem` literals in component source.** Use utilities or `--zen-*` tokens.

There were no type tokens to use. The rule was therefore unfollowable for typography, and the escape hatch — UnoCSS's built-in `zen-text-sm` etc. — silently reintroduced Tailwind's scale as a *de facto* dependency that no `--zen-*` override could retheme. **A consumer could not change zen-ui's type scale through the documented theming surface**, even though "override `--zen-*` custom properties; that is the whole public theming surface" is the stated contract. That was a live inconsistency in the token layer, not a hypothetical — and it is the one that got fixed.

**What is still not taken from Carbon here:** the scale is *authored*, not generated, and there is no productive/expressive (or compact/fluid) split. Neither is a defect; both are recorded so a future reader does not re-derive them as new findings.

Carbon's **productive vs expressive** distinction is the other half, and it is genuinely good thinking:

> "The productive type styles were developed for product design, and the expressive, more editorial type styles were developed for IBM.com website pages." — *style-strategies.mdx*

Productive: users "focused on getting a specific job done", KPI is "time needed to complete a task" → "**space efficiency is key**", headings **fixed**. Expressive: users "scanning and reading", KPI is "click-through rates" → larger sizes, **fluid** headings that interpolate by `calc()` across viewport width rather than jumping at breakpoints.

Note the v10→v11 aliasing trap: `bodyCompact01 = bodyShort01`, `headingCompact01 = productiveHeading01`, `fluidHeading03 = expressiveHeading03`. "Productive/expressive" is the v10 vocabulary and "compact/fluid" the v11 vocabulary **for identical values**. Don't port both.

Also worth stealing: `productiveHeading01` and `bodyShort01` differ **only in weight** — same size, same line-height. That is what lets headings stack without disturbing vertical rhythm.

`apps/landing` vs the component demos is exactly the productive/expressive split, incidentally — zen-ui already has the use case, just not the vocabulary.

### 4. Motion tokens — ~~none~~ MOSTLY CLOSED (2026-07-20)

> **Status: mostly closed.** `--zen-duration-{fast,moderate}` and
> `--zen-ease-{standard,in,out,collapse}` now ship — 2 durations and 4 easings against Carbon's 6
> and 6. **The `prefers-reduced-motion` story is still unwritten**, which was the concrete payoff
> the section argued for; the tokens now give it somewhere to live.

Carbon (`packages/motion/src/index.ts`):

```ts
fast01 = '70ms';   fast02 = '110ms';
moderate01 = '150ms';  moderate02 = '240ms';
slow01 = '400ms';  slow02 = '700ms';

easings = {
  standard: { productive: 'cubic-bezier(0.2, 0, 0.38, 0.9)',  expressive: 'cubic-bezier(0.4, 0.14, 0.3, 1)' },
  entrance: { productive: 'cubic-bezier(0, 0, 0.38, 0.9)',    expressive: 'cubic-bezier(0, 0, 0.3, 1)' },
  exit:     { productive: 'cubic-bezier(0.2, 0, 1, 0.9)',     expressive: 'cubic-bezier(0.4, 0.14, 1, 1)' },
};
```

The 3×2 easing matrix encodes a real rule: **entrance and exit are not symmetric**. Entrance decelerates from zero (`0, 0, …`); exit accelerates to one (`…, 1, 0.9`). Things arrive gently and leave briskly.

zen-ui had **twelve hand-written `zen-anim-*` classes** (`fade-in/out`, `slide-in/out-{top,bottom,left,right}`, `accordion-up/down`) with durations and easings inlined per keyframe, and no tokens. Consequence: a consumer could not retheme motion, could not slow it down, and — notably — **there was no `prefers-reduced-motion` story**, because there was no central place to put one. Tokenising duration/easing was cheap and gives that for free.

*(2026-07-20: the tokens landed; the `prefers-reduced-motion` block did not. That is now a one-file job rather than a systemic one — the remaining work is a media query that rebinds the duration tokens to `0s`, not a sweep of twelve keyframes.)*

### 5. `<Theme>` — theme scoping is all-or-nothing

Carbon ships a `<Theme>` component that scopes a theme to a **subtree** — a `g100` panel inside a `white` page, which is how Carbon builds dark side-panels and code blocks in light apps.

zen-ui's theming is `document.documentElement.setAttribute("data-theme", name)` (`packages/core/src/theme.ts`) — **global only**. Since the tokens are already `:root[data-theme="…"]` CSS blocks, scoping is nearly free: re-declare the block as `[data-theme="…"]` rather than `:root[data-theme="…"]` and ship a `<Theme name>` wrapper that sets the attribute on a div. This is a small change with a large capability payoff, and it composes with the Layer model if that ever lands.

---

## Tier 2 — Missing components (small, cheap, high value)

All verified absent from `packages/react/src` at 3.0.0 (zero word-boundary matches), against a control group of known-present components. **Status column added 2026-07-20, checked against all four bindings.**

| Carbon | What it is | Why it matters for zen-ui | 8.0.0 |
|---|---|---|---|
| **Link** | Styled `<a>` with visited/hover/inline/disabled states, `size`, icon slot | **The most surprising gap in the inventory.** Every app has links; zen-ui makes each one bespoke. `Button asChild` is not a substitute — a link is not a button, and conflating them is an a11y problem. | ✅ |
| **Search** / **ExpandableSearch** | Dedicated search input: `role="searchbox"`, clear button, expand-on-focus | zen-ui carries a search-input placeholder prop in **seven** components (ShellBar, ValueHelp, SelectDialog, DataTable, select-list, Combobox, MultiCombobox) — the pattern is already reimplemented seven times. Highest-value extraction in this table. | ✅ 7.1.0 |
| **PasswordInput** | Text input with show/hide toggle | Universally needed, trivially small. | ✅ |
| **CodeSnippet** | `inline` / `single` / `multi` variants, copy button, expand | zen-ui's own demos render code examples (~305 of them) — presumably hand-rolled. | ❌ |
| **ContentSwitcher** | Segmented control for switching content views | No zen-ui equivalent. Distinct from Tabs (Carbon is explicit about when to use which). Fiori's SegmentedButton gap is the same component — **two design systems now point at it**. | ✅ *as `SegmentedButton`* |
| **Toggletip** | Interactive, click-triggered tooltip that can hold focusable content | zen-ui has Tooltip (hover, non-interactive) and Popover (heavier). Toggletip is the accessible middle, and the distinction is a real a11y rule: content with interactive children must not live in a hover tooltip. | ❌ |
| **Tag** | Dismissible / filter / operational / selectable variants, `TagSet` overflow | zen-ui's `Badge` is display-only; `TagInput` is an input. The dismissible standalone Tag is neither. | ❌ |
| **Tile** | Clickable / Selectable / Expandable / Radio tiles, `TileGroup` | `Card` overlaps but is passive. `RadioTile`/`TileGroup` (card-shaped radio selection) has no equivalent — zen-ui has `SelectableCard`, which is the closest. | ❌ |
| **CopyButton** / **Copy** | Copy-to-clipboard with feedback animation | Tiny; pairs with CodeSnippet. | ❌ |
| **AspectRatio** | Ratio-locked container | Trivial, widely useful. | ❌ |
| **Heading** / **Section** | Auto-levelling headings via context — `<Section>` increments, `<Heading>` renders the right `<h1…h6>` | Genuinely clever and an **a11y win**: heading level becomes structural rather than hand-chosen, so a component can't emit an `<h3>` under an `<h1>`. Same context-increment shape as `<Layer>` — if you build one, the other is nearly free. | ❌ |
| **ContainedList** / **StructuredList** | List with contained styling / row-column list with selection | `Listbox` is interactive-select; these are display/structure. Moderate value. | ❌ |
| **IconIndicator** / **ShapeIndicator** / **BadgeIndicator** | Small status affordances | zen-ui has `--zen-status-*` tokens but **no component that renders them** — the tokens exist unused-in-public. | ❌ |
| **SkipToContent** | Keyboard skip-link to main content | **A11y gap.** zen-ui now has ShellBar + Sidebar + Page — a full app frame with no skip link. This is a WCAG bypass-blocks requirement and it's ~10 lines. | ✅ |
| **OrderedList** / **UnorderedList** / **ListItem** | Styled lists | Low value; the element reset is opt-in (`/preflight`), so consumers' `<ul>`s are unstyled by design. | ❌ *(and should stay so — see [What NOT to build](#what-not-to-build))* |

---

## Tier 3 — Family-level gaps (deliberate scope decisions)

### The `Fluid*` form family — 11 components

`FluidComboBox`, `FluidDatePicker`, `FluidDropdown`, `FluidForm`, `FluidMultiSelect`, `FluidNumberInput`, `FluidSearch`, `FluidSelect`, `FluidTextArea`, `FluidTextInput`, `FluidTimePicker`, `FluidTimePickerSelect`.

A parallel styling of every form control where the label sits *inside* the field boundary. **Recommendation: do not build.** This is an IBM house style with a 1:1 component cost, not a capability. If it were ever wanted, it should be a variant prop or a `<FluidForm>` context, not eleven components — which is arguably the lesson Carbon itself learned too late.

### Notification variants

Carbon: `Notification` with inline / toast / actionable / callout variants under one family.
zen-ui: `Alert` (inline), `Banner` (page-level), `Toast` (transient), `NotificationsInbox` (list) — **four separate families**.

zen-ui's decomposition is arguably better. Recorded as a **naming/structure divergence, not a gap**. The one genuinely missing piece is Carbon's *actionable* notification (a notification with a button that isn't dismissal).

Relevant caution from [CLAUDE.md](../CLAUDE.md): Toast is already zen-ui's only React/Solid API divergence (Radix Toast vs solid-toast). Don't add to that family without converging it first.

### Skeleton family

Carbon: `SkeletonText`, `SkeletonIcon`, `SkeletonPlaceholder`, `DataTableSkeleton`, `AISkeleton`.
zen-ui: one `Skeleton`.

zen-ui's single primitive composes to most of these. `DataTableSkeleton` is the one with real value — a table-shaped loading state is fiddly to hand-roll and zen-ui has a substantial `DataTable`.

### UIShell — largely closed already

Carbon's UIShell decomposes into `Header`, `HeaderName`, `HeaderNavigation`, `HeaderGlobalBar`, `HeaderGlobalAction`, `HeaderPanel`, `HeaderMenu`, `SideNav` (+ `SideNavItems`, `SideNavMenu`, `SideNavLink`, `SideNavDivider`, `SideNavFooter`, `SideNavSwitcher`), `Switcher`, `SkipToContent`, `Content`.

zen-ui's `ShellBar` + `Sidebar` (with sub-items and collapsed flyout, per `ed7b2ff`) + `Page` cover the substance. Remaining deltas: ~~**`SkipToContent`** (see Tier 2),~~ *(shipped 2026-07-20)* `Switcher` (the IBM product-switcher — IBM-specific, skip), and `HeaderPanel` (a right-side slide-over — zen-ui has `Sheet`). **UIShell is now fully closed** apart from the deliberate `Switcher` skip.

### `@carbon/ibm-products` — the product-pattern tier

~85 components: `Tearsheet`, `SidePanel`, `Datagrid`, `PageHeader`, `Coachmark*`, `CreateFullPage`, `CreateTearsheet`, `EditInPlace`, `ConditionBuilder`, `FilterPanel`, `NotificationsPanel`, `AboutModal`, `APIKeyModal`, `ExportModal`, `ImportModal`, `DataSpreadsheet`, `WebTerminal`, `UserProfileImage`, `TagOverflow`, `TruncatedText`…

Mostly **do not build** — this is IBM's product-team tier and much of it is Fiori-shaped work zen-ui has already done its own way (`FilterBar` ≈ `FilterPanel`, `DataTable` ≈ `Datagrid`, `ObjectPageLayout` ≈ `PageHeader`, `ViewSettingsDialog` ≈ `FilterPanel` + `Toolbar`).

Three worth noting as cross-system signals — a component that **both Carbon and Fiori ship** is one the market clearly expects:
- **`Tearsheet` / `SidePanel`** — zen-ui has `Sheet`; check whether it covers the multi-step create flow (`CreateTearsheet`).
- **`EditInPlace`** — no zen-ui equivalent, genuinely useful, small.
- **`ConditionBuilder`** — complex; only if a consumer asks.

---

## Tier 4 — Ecosystem (context, not a roadmap)

**Icons.** Carbon: **2,707 distinct icons** (2,809 SVG files; 32px is the master, with only 71 hand-optimised small-size overrides for icons that lose legibility when downscaled), published at 16/20/24/32. zen-ui: **38**. Not a defect — zen-ui isn't in the icon business and `Icon` accepts arbitrary children — but it bounds what can be asked of the library, and the 32px-master-plus-optical-overrides authoring model is the right one if the set ever grows.

**Pictograms.** 1,572, single-size, illustrative line art. No zen-ui equivalent; none needed.

**IBM Plex.** Five families (Sans, Mono, Serif, Sans Condensed, Sans Hebrew). Brand, not mechanism — irrelevant to zen-ui except as evidence that the type layer is expected to be tokenised.

**Carbon for AI.** `AILabel`, `AISkeleton`, `ChatButton`, and ~40 `ai*`/`chat*` tokens (`aiAuraStart`, `aiBorderStrong`, `aiPopoverBackground`, `chatBubbleUser`…). The stated purpose is **trust and transparency, not decoration** — the fourth principle is literally *"Don't use the Carbon for AI styling as decoration… strictly intended to identify any instances of AI being used"*. The visual language "uses light as a metaphor to 'illuminate' AI-generated content". Mechanically: AI tokens live *inside* the four normal themes (no separate theme needed), each AI component carries an embedded AI label and explainability popover, and there's a revert-to-AI affordance when a user overrides a suggestion.

Worth knowing about, not worth porting speculatively. But if zen-ui ever renders AI-generated content, the *disclosure* pattern is the part to copy, not the glow.

**Accessibility.** Carbon follows the **IBM Accessibility Checklist** — "based on WCAG AA, Section 508, and European standards" — not raw WCAG, and it links WCAG 2.1 (no 2.2 commitment found). Every component has a dedicated `accessibility.mdx`. Tooling: IBM Equal Access Toolkit.

This is the comparison zen-ui comes off worst in, and it isn't close. [CLAUDE.md](../CLAUDE.md) already records:

> Checkbox, RadioGroupItem and Select still land a caller's `id` on the wrapper rather than the native control, so `<label for>` will not associate.

That was a known, documented, unfixed a11y defect in three core form controls, plus no skip link and no per-component a11y documentation. **Carbon's real lesson here is not a component — it's that a11y is a stated, tooled, per-component commitment rather than a best-effort.** If any single item in this document gets acted on, it should probably be this one, and it's already in [todo.md](../todo.md) territory rather than needing new architecture.

**Update 2026-07-20 — two of the three are closed, and the quoted claim was wrong when written.**

- The `id` bug affected **Solid only**. React (Radix) and vanilla both land the `id` on a `<button role="checkbox|radio">`, and a `<button>` *is* a labelable element — so `<label for>` always worked there. CLAUDE.md has since been corrected. Solid now routes the caller's `id` to the native control (`Checkbox.Input`, `ItemInput`, and the Select `Trigger`), verified in a browser.
- `SkipToContent` shipped in all bindings.
- **Per-component a11y documentation is still absent**, and that was always the substantive half of this section. Carbon ships an `accessibility.mdx` per component; zen-ui ships none. That is the gap that survived.

Two Solid-specific defects found later remain open and are tracked in [todo.md](../todo.md) under *Known-latent*: a `Select` inside a `Dialog` has its options hidden from the accessibility tree (Kobalte's modality sweep vs. its portalled listbox), and `<Select aria-label>` still lands on the wrapper rather than the trigger — the same class of bug as the `id` one, fixed for `id` but not for `aria-label`. Verified 2026-07-20: `form/select/select.tsx` routes `id` to `KSelect.Trigger` and nothing else.

**Web components — the binding-parity precedent.** This is directly relevant to zen-ui's React/Solid contract. `@carbon/web-components` 2.58.1 (Lit 3) lives in the **same monorepo**, on the **same version train**, pinning the same `@carbon/styles` and `@carbon/icons`. Directory counts are React 126 vs wc 85, but **that diff overstates the gap and shouldn't be quoted** — React gives sub-components their own directories while wc declares them inside the parent, and several React entries (`ClassPrefix`, `IdPrefix`, `Portal`, `ErrorBoundary`, `Theme`, `LayoutDirection`, `Icons`, `Plex`) are React infra with no wc analogue by design.

The genuinely interesting finding: **web-components ships seven things React core does not** — `side-panel`, `tearsheet`, `floating-menu`, `fluid-password-input`, `list`, `skip-to-content`, `slug`. Neither binding is a strict subset of the other. Carbon does **not** treat its second binding as a port; it's a peer that is allowed to lead.

That's a useful precedent for zen-ui's stated rule ("A component added to one binding must be added to the other"). Carbon's model suggests the rule's *spirit* — one design system, one token core, one version train — matters more than mechanical symmetry, and that a binding leading in a few places is survivable. It also suggests Angular/Svelte/Vue-style community bindings can be a deliberate second tier rather than a burden.

---

## Naming collisions and API divergences

Worth tabulating, because anyone moving between the two systems will trip on these, and because at least one is a genuine hazard.

| Carbon | zen-ui | Note |
|---|---|---|
| **`Switch`** | — | ⚠️ **Genuine hazard.** Carbon's `Switch` is a **`ContentSwitcher` child** (a tab-like button). Carbon's on/off control is **`Toggle`**. |
| `Toggle` | **`Switch`** | zen-ui's `Switch` is Carbon's `Toggle`. The word means opposite things in the two systems. |
| `Dropdown` | `Select` | |
| `MultiSelect` | `MultiCombobox` | |
| `Modal` / `ComposedModal` | `Dialog` | |
| `Tag` | `Badge` (partial) | zen-ui's Badge is display-only; Carbon's Tag is dismissible/filterable |
| `Tile` | `Card` (partial) | |
| `ProgressBar` | `Progress` | |
| `ProgressIndicator` | `Stepper` | |
| `TreeView` | `Tree` | |
| `NumberInput` | `NumberField` | |
| `FileUploader` | `FileUpload` | |
| `TextInput` / `TextArea` | `Input` / `Textarea` | |
| `Notification` (variants) | `Alert` / `Banner` / `Toast` | zen-ui decomposes; Carbon unifies |
| `OverflowMenu` | `Toolbar` overflow (partial) | zen-ui's is bound to Toolbar, not standalone |
| `InlineLoading` | `Loading` (partial) | Carbon's carries success/error terminal states |

---

## What NOT to build

Stated explicitly, because the tables above are long and most of their rows are not work:

- **The entire `Fluid*` family** (11 components) — house style, not capability.
- **Pictograms**, **IBM Plex**, **`Switcher`**, **AI ecosystem** — IBM-specific or brand-specific.
- **`FeatureFlags`, `IdPrefix`, `ClassPrefix`, `Theme`-as-prefix-config, v10 compat, `carbon-components-react`** — solutions to Carbon's own migration and multi-tenancy history. zen-ui's build-time `ZEN_PREFIX` already covers the real need.
- **Most of `@carbon/ibm-products`** — `DataSpreadsheet`, `WebTerminal`, `Coachmark*`, `InterstitialScreen`, `NonLinearReading`, `Guidebanner`, `APIKeyModal`, `AboutModal` and friends are IBM product furniture.
- **`OrderedList`/`UnorderedList`/`ListItem`** — the element reset is opt-in by design; styling consumers' lists from a library entry would violate zen-ui's own CSS rule ("Never ship page-level or element-level CSS from a library entry").
- **The v10 `layout01…07` tokens** — marked `// Deprecated ☠️` in Carbon's own source. Mentioned only so nobody ports them from a stale tutorial.

---

## Recommended shortlist

Ordered by value-to-effort, and deliberately short. ~~Everything here is portable to both bindings.~~
*(2026-07-20: **four** bindings now — see the cost note in [Status at 8.0.0](#status-at-800). Each
✅ below was verified against every binding's `index.ts`, not React's alone.)*

**Fix first — these are defects, not gaps:**

1. ✅ ~~**The `id`-on-wrapper a11y bug** in Checkbox / RadioGroupItem / Select.~~ **Fixed.** The claim was also over-broad: only Solid was affected. React and vanilla put the `id` on a `<button>`, which is a labelable element.
2. ✅ ~~**`SkipToContent`** (~10 lines).~~ **Shipped**, all bindings.

**Foundations — ~~decide now, while the library is 3.0.0~~ two of four landed; the two that did not are the ones with a deadline:**

3. ✅ **Type tokens.** Shipped — 17 `--zen-font-*`, 9 `--zen-line-*`. The CLAUDE.md contradiction is resolved.
4. 🟡 **Motion tokens.** Shipped, at 2 durations + 4 easings (Carbon has 6 + 6). **`prefers-reduced-motion` is still unwritten** — that was the payoff, and it is now a media query rather than a sweep.
5. ❌ **`<Theme>` scoping.** Still `:root[data-theme]`, still global-only. Small change, large payoff. **Now the cheapest open item in the document, and it no longer depends on #7 landing.**
6. ❌ **`Grid` / `Column` + breakpoint tokens.** Untouched. zen-ui now ships a full app frame (`ShellBar`, `FlexibleColumnLayout`, `Page`) with no layout primitive under it, which is a stranger shape at 8.0.0 than it was at 3.0.0.
7. ❌ **The Layer model** — **the window this item described has closed.** It argued for deciding "now, while the library is 3.0.0" precisely because the retrofit cost scales with the component count. Five releases later that count is ~57 families × 3 implementations, and a visual change is a major bump. This is no longer "decide cheaply"; it is "fund a migration or write down a no". Writing down the no is a legitimate outcome and costs an hour.

**Components — cheap, and each one is currently being hand-rolled:**

8. ✅ **`Link`** — shipped, all bindings.
9. ✅ **`Search`** — shipped in 7.1.0, all bindings.
10. ✅ **`ContentSwitcher`** — closed by `SegmentedButton`. Both design systems pointed at it and it got built, under Fiori's name rather than Carbon's.
11. ❌ **`Toggletip`** — still the accessible middle between Tooltip and Popover.
12. 🟡 **`PasswordInput`** shipped; **`CopyButton`**, **`AspectRatio`**, **`Tag`** (dismissible) still open.
13. ❌ **`Heading` / `Section`** — auto-levelling headings. The "nearly free if #7 lands" note is now moot: #7 is not landing soon, so price this on its own. It is still a structural a11y win and still small.

The through-line ~~**zen-ui's component layer is in decent shape; its foundation layer is thin**~~ has half-corrected itself: **the token layer filled in (type, motion), the structural layer did not (Layer, Grid, Theme scoping).** That is the harder half, and it is the half that got more expensive — the doc's own argument that "foundation is the part that gets more expensive to retrofit the longer it waits" is now evidence about this document rather than a prediction.
