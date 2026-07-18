# SkillsEngine Admin — Component Gap Analysis

**Date:** 2026-07-15
**zen-ui version reviewed:** `@algorisys/zen-ui-react` 3.0.0 (branch `dev`, commit `8e7a744`)
**Consumer reviewed:** `skillsengine-admin-re` (commit `7bd58fb`) — `/home/rajesh/work/algo/products/skillsengine-admin-re`

> **This is a planning document. No zen-ui code was changed to produce it**, and none of the
> APIs sketched below exist yet. Everything here is a proposal to be argued with before it is
> built. The repo was read-only throughout.

## How this was compiled

Read directly from the SkillsEngine source tree: `package.json`, all 123 files in `app/routes/`,
all of `app/components/`, and `app/models/types.ts`. Cross-referenced against zen-ui's
[`packages/react/src/nav.ts`](../packages/react/src/nav.ts) (the component catalogue),
`packages/react/src/index.ts` / `packages/solid/src/index.ts` (exports), and the component
sources themselves — because the exports list alone does not tell you whether `Rating` supports
half-stars or whether `Chart` can draw a pie. Both can now — see the Revised note below.

Two findings from the survey materially reshape the brief and are worth stating before the tables:

### 1. SkillsEngine does not have a Likert scale, and zen-ui already ships one

The brief for this document named the Likert scale as the headline gap. Both halves of that turn
out to be wrong, in opposite directions:

- **`grep -ril likert` over the entire SkillsEngine repo returns zero matches.** The string does
  not appear in source, comments, types, or data.
- **zen-ui already ships `Likert`** in *both* bindings —
  [`packages/react/src/components/survey/likert.tsx`](../packages/react/src/components/survey/likert.tsx)
  and the Solid mirror — with segmented/stacked layouts, custom option sets, roving-tabindex
  keyboard nav, and a `/likert` demo route.

What SkillsEngine actually has are two *members of the Likert family* under different names, in a
hardcoded 11-entry union at `app/routes/admin.createsurvey.$id.tsx:109-122`:

```
"short answer", "paragraph", "multiple choice", "checkboxes",
"multiple choice grid", "checkboxes grid", "dropdown",
"linear scale", "date", "email", "emoji"
```

`linear scale` is a numeric 1–5 agreement scale; `emoji` is a 5-point sentiment scale. Both are
Likert-shaped. Neither is served by today's `Likert`, for reasons detailed in the
[Linear scale](#linear-scale--the-numeric-likert) section — but the fix is *props on an existing
component*, not a new component. That reclassifies the headline item from "build a Likert" to
"extend Likert", which is roughly a day rather than a week.

**The actual largest gap is the matrix/grid question** (`multiple choice grid` /
`checkboxes grid`), which zen-ui has nothing resembling.

### 2. SkillsEngine is not a react-bootstrap app, which limits what zen-ui can displace

`react-bootstrap` is in `package.json`, but only **8 of 175 `.tsx` files** import from it, and
those imports are thin (`Button`, `Form`, `Card`, `ProgressBar`). The real styling system is
**raw Bootstrap 5 CSS classes hand-written on plain JSX in ~96 files**, against a CDN stylesheet
loaded at `app/root.tsx:206` plus a vendored SCSS fork (`app/styles/custom-bs.scss`,
`_variable.scss`).

This matters for scoping. A zen-ui component can replace a `<Modal>` import cleanly; it cannot
replace `className="card shadow-sm p-3"` without a file-by-file rewrite. Some code is worse than
class strings — `app/components/disc/personality-card.tsx:13-15` *computes* them
(`` `bg-${color}-subtle text-${color}` ``). So the adoption story is **new surfaces and
high-importer primitives first**, not a sweep.

## Executive summary

SkillsEngine is a Remix 2 + React 18 assessment/survey platform: authoring (tests, coding
questions, DISC/Johari instruments, AI-generated question sets), delivery (timed test runner,
proctoring via mediasoup + mediapipe, Monaco/Sandpack code execution), and analysis (response
dashboards, PDF export).

Measured against it, zen-ui is in much better shape than the Fiori comparison suggested — the
survey triplet (`Rating` · `NPS` · `Likert`) already exists, as do `DataTable`, `Stepper`,
`Dialog`, `Tabs`, `Combobox`, `InputOTP`, `RichText`, `FileUpload` and `Chart`. Roughly:

- **Survey question types** — ~60% covered. 7 of 11 map to existing components. The hard gaps are
  **matrix/grid** (nothing), **ranking** (nothing, and unimplemented in the app too), and
  **emoji scale** (nothing).
- **Form controls** — ~90% covered. Real gaps are narrow: `Rating` has no half-star, `Slider` has
  no tick marks/labels, `Combobox` has no creatable mode.
- **Charts** — ~~partial and blocking~~ **closed**. `Chart` now does line/bar/area/**pie**/**donut**
  in both bindings, so the two analysis screens are unblocked and chart.js can go.
- **Drag-to-reorder** — **0% covered**. SkillsEngine needs it in 4 places (3 authoring, 1 runtime)
  and currently uses the unmaintained `react-beautiful-dnd` with a StrictMode shim.
- **Page-level chrome** — `title/title.tsx` has **61 importers**, the most-used component in the
  app, and zen-ui has no simple equivalent (`DynamicPage`/`ObjectPageLayout` are Fiori-weight).

A scoping caveat mirroring the Fiori doc: **not everything below should be built.** Proctoring,
Monaco/Sandpack, mediasoup, PDF export and the DISC/Johari report cards encode SkillsEngine's
domain and belong in its own tree, not in a general-purpose design system. The value here is
Tiers 1–2.

## Gap table

| Component | SkillsEngine usage | zen-ui status | Proposed action | Priority |
|---|---|---|---|---|
| **MatrixQuestion** | `multiple choice grid` + `checkboxes grid`; hand-rolled `<table>` 3× (builder, preview, runtime) | ❌ **missing** | Build `Matrix` + `Matrix.Row` | **P0** |
| **Likert (numeric)** | `linear scale`, hardcoded 1–5 | ⚠️ **partial** — no numeric layout, no endpoint labels | Add `layout="scale"`, `minLabel`/`maxLabel` | **P0** |
| **Likert (emoji)** | `emoji` 5-point sentiment | ⚠️ **partial** — no custom option rendering | Add `renderOption` to `LikertOption` | **P0** |
| **Chart pie/doughnut** | `admin.surveyresponses.$id.tsx:21` (Pie), `admin.joharireport.$id.tsx:12` (Doughnut), `DashboardCharts.tsx:15` (recharts Pie) | ✅ **built** — `type="pie" \| "donut"` in both bindings; slice maths in `core/chart` | — | done |
| **SortableList** | `react-beautiful-dnd` ×3: `addquestion.tsx:964,1193`, `admin.createtest.$testId.tsx:300`, `admin.createsurvey.$id.tsx:568` (nested) | ❌ **missing** | Build `SortableList` (+ nested) | **P1** |
| **Ranking question** | `question-components/ranking.tsx` — a stub returning `<div>Ranking</div>` | ❌ **missing** | `Ranking` on top of `SortableList` | **P1** |
| **PageHeader** | `title/title.tsx` — **61 importers** | ❌ **missing** (`DynamicPage` is too heavy) | Build `PageHeader` | **P1** |
| **StatCard** | `card/card.tsx` (22), `assessmentcard.tsx` (14), `detailed-card.tsx` (1) — triplicated | ⚠️ **partial** — `Card` is a bare surface | Add `StatCard` | **P1** |
| **Rating half-star** | `question-components/rating.tsx:8-19` — 0.5 steps | ⚠️ **partial** — integer-only | Add `allowHalf` / `precision` | **P1** |
| **Slider marks** | `question-components/slider.tsx:10-13` — rc-slider labeled marks, snap-to-step | ⚠️ **partial** — bare Radix pass-through | Add `marks` | **P1** |
| **Combobox creatable** | `CreatableSelectComponent.tsx:2-3`, `admin.ai-test.tsx:39` | ⚠️ **partial** — no create affordance | Add `creatable` / `onCreate` | **P1** |
| **QuestionCard** | question text + required asterisk + control, repeated 3× | ❌ missing | Consider; may be app-domain | P2 |
| **SurveyProgress** | `ProgressBar` + theme colour, `survey-preview.tsx:204` | ✅ `Progress` | Adopt | P2 |
| **Stepper** | Hand-rolled ×2: `admin.ai-test.tsx:512`, `home.landing.subscribe.$planId.tsx:577` | ✅ **present** | Adopt — no build | — |
| **DataTable** | `table/Table.tsx` (370 L, **25 importers**) — sort/search/filter/paginate | ✅ **present** | Adopt | — |
| **ConfirmationDialog** | `confirmationdialog.tsx` — **31 importers** | ✅ `AlertDialog` | Adopt | — |
| **Input (labelled)** | `input/input.tsx` (14) — label + password toggle + error | ✅ `Input` + `Form` | Adopt | — |
| **Checkbox** | `checkbox/checkbox.tsx` (14) | ✅ `Checkbox` | Adopt | — |
| **InfoTooltip** | `infotooltip/infotooltip.tsx` (10) | ✅ `Tooltip` | Adopt | — |
| **OTP** | `OtpInput.tsx` (107 L) | ✅ `InputOTP` | Adopt | — |
| **RichText** | `RichTextEditor.tsx` — Quill + SSR dynamic-import hack | ✅ `RichText` (jodit) | Engine differs; evaluate | P2 |
| **Toast** | `react-hot-toast` — **63 files** | ⚠️ present, **known React/Solid divergence** | See parity note | P2 |
| **Modal** | `modal/Modal.tsx` — no focus trap, no Esc | ✅ `Dialog` | Adopt — fixes an a11y bug | — |
| **Pagination** | `pagination/pagination.tsx` (141 L) | ✅ `Pagination` | Adopt | — |
| **Icon** | lucide (**70 files**) + react-icons/fa (15) + FA CSS (~10) | ⚠️ `Icon` — 48 glyphs | Insufficient set; see note | P2 |
| **Monaco / Sandpack / proctoring / PDF export / DISC & Johari cards** | Code execution, mediasoup, html2pdf, domain reports | ❌ | **Out of scope** — domain | — |

## Tier 1 — Survey question types (the reason this document exists)

SkillsEngine's 11 question types are the concrete requirement. Mapped against zen-ui:

| Type | zen-ui | Note |
|---|---|---|
| `short answer` | ✅ `Input` | |
| `paragraph` | ✅ `Textarea` | |
| `multiple choice` | ✅ `RadioGroup` | |
| `checkboxes` | ✅ `Checkbox` | |
| `dropdown` | ✅ `Select` | |
| `date` | ✅ `DatePicker` | |
| `email` | ✅ `Input type="email"` | |
| `linear scale` | ⚠️ `Likert` — needs `layout="scale"` | |
| `emoji` | ⚠️ `Likert` — needs `renderOption` | |
| `multiple choice grid` | ❌ **nothing** | |
| `checkboxes grid` | ❌ **nothing** | |

### Matrix — the real gap

The single largest omission. SkillsEngine hand-rolls the same `<table>` three times
(`survey-preview.tsx:120-158`, `client.survey.$id.tsx:478-526`, and the builder), and all three
copies share the same accessibility defects:

- **No `scope` on `<th>`** — column headers are not programmatically associated with cells, so a
  screen reader reading a cell announces a bare radio with no indication of which column
  ("Agree"?) or row ("Communication"?) it belongs to. This is the defining a11y requirement of a
  matrix question and it is absent.
- **No `<caption>`** and no accessible name on the table.
- Row grouping *is* correct (`name={`grid-${q.id}-${rowIdx}`}`, `client.survey.$id.tsx:509`) —
  radios group per row, which is the one thing that works.

Proposed API, consistent with zen-ui's compound-component convention:

```tsx
export interface MatrixColumn { value: string; label: string; }
export interface MatrixRowDef  { value: string; label: string; }

export interface MatrixProps {
  columns: MatrixColumn[];
  rows: MatrixRowDef[];
  /** "single" → radio per row (multiple choice grid) — value is Record<rowValue, colValue>
   *  "multiple" → checkbox per row (checkboxes grid) — value is Record<rowValue, colValue[]> */
  selectionMode?: "single" | "multiple";
  value?: Record<string, string | string[]>;
  defaultValue?: Record<string, string | string[]>;
  onValueChange?: (value: Record<string, string | string[]>) => void;
  /** Renders above the matrix; becomes the table's accessible name. */
  question?: string;
  /** Require an answer in every row; surfaces per-row error styling. */
  requireAllRows?: boolean;
  /** Below `stackAt`, collapse to one titled radiogroup per row. Default "md". */
  stackAt?: "sm" | "md" | "lg" | false;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  name?: string;
}
```

**Variants:** `selectionMode` single/multiple is the axis that matters; it is the only difference
between SkillsEngine's two grid types and should not be two components.

**A11y notes** (the reason to own this centrally rather than let each app re-fail):

- `role="radiogroup"` per `<tr>` with `aria-labelledby` pointing at the row-header cell, so each
  row is a self-contained group. In `multiple` mode each row is a `role="group"` instead.
- `<th scope="col">` on every column header and `<th scope="row">` on every row label — the fix
  for the defect above.
- Each cell control needs an accessible name combining row + column
  ("Communication, Agree"), via `aria-label` — a visually-hidden `<label>` per cell is the
  fallback, but `aria-label` composes better with the roving tabindex.
- Roving tabindex within a row (Left/Right); Up/Down moves between rows at the same column index —
  a 2-D extension of the pattern `Likert` already implements at
  [`likert.tsx:97-117`](../packages/react/src/components/survey/likert.tsx).
- **Responsive collapse is an a11y requirement, not a nicety.** A 6-column matrix on a phone is
  unusable; `stackAt` degrades each row to a labelled radiogroup. Note zen-ui's own `Likert`
  already swaps to `shortLabel` below `md` (`likert.tsx:218-221`) — same instinct, and `Matrix`
  should reuse the convention rather than invent one.

**Parity:** must ship in React *and* Solid (hard rule). The 2-D roving tabindex is the risk — it
is real logic, not markup, and it is exactly the kind of thing that gets ported syntactically and
then behaves differently. Port the *behaviour*, and cover both with the same keyboard test matrix
(LOOPS.md rule XXXVI). Solid's version takes `class`, not `className`, and must forward the rest
of the props — the `PopoverContent` bug called out in CLAUDE.md is precisely this failure mode.

### Linear scale — the numeric Likert

`Likert` is close but cannot express it today. Three concrete blockers, plus a bug worth
inheriting knowledge from:

1. **No endpoint labels.** A numeric scale is meaningless without "1 = Strongly disagree,
   5 = Strongly agree" anchoring the ends. `LikertProps` has no slot for this.
2. **No numeric layout.** SkillsEngine renders the number *above* the radio
   (`client.survey.$id.tsx:427-441`); `Likert`'s `segmented` layout renders labels *inside*
   connected pills. Different shape.
3. **Scale length is data, not markup.** The builder seeds `options: ["1","2","3","4","5"]`
   (`admin.createsurvey.$id.tsx:317-319`).

**A bug to design out.** That seeded `options` array is **never read**. All three render sites
hardcode `[1, 2, 3, 4, 5].map(...)` — builder (`admin.createsurvey.$id.tsx:1057`), preview
(`survey-preview.tsx:65`), runtime (`client.survey.$id.tsx:429`) — and the builder's label even
says `"Rating (1 to 5)"` (`:1054`). The data model supports a variable-length scale; the UI
silently does not. A 7-point scale would be stored and then rendered as 5, losing responses. This
is exactly the class of defect a shared component eliminates: one implementation, driven by
`options`, and the bug is unrepresentable.

Proposed additions to the existing `LikertProps` — additive, no breaking change:

```tsx
export interface LikertOption {
  value: string;
  label: string;
  shortLabel?: string;
  /** NEW — custom mark for the option (emoji, icon, number).
   *  Replaces the pill's text; `label` remains the accessible name. */
  renderOption?: () => ReactNode;   // Solid: () => JSX.Element
}

export interface LikertProps {
  // …existing…
  /** NEW — "scale": numeric/marked layout, mark above control, endpoint captions below. */
  layout?: "segmented" | "stacked" | "scale";
  /** NEW — captions anchoring the ends. Only rendered by layout="scale". */
  minLabel?: string;
  maxLabel?: string;
}
```

Then both SkillsEngine types collapse into the component that already exists:

```tsx
// linear scale
<Likert
  layout="scale"
  options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
  minLabel="Strongly disagree"
  maxLabel="Strongly agree"
  question="I understand what is expected of me at work."
/>

// emoji
<Likert
  layout="scale"
  options={[
    { value: "1", label: "Very dissatisfied", renderOption: () => "😞" },
    { value: "2", label: "Dissatisfied",      renderOption: () => "😐" },
    { value: "3", label: "Neutral",           renderOption: () => "🙂" },
    { value: "4", label: "Satisfied",         renderOption: () => "😊" },
    { value: "5", label: "Very satisfied",    renderOption: () => "😄" },
  ]}
/>
```

**A11y notes.** `renderOption` output must be `aria-hidden` with `label` carrying the accessible
name — an emoji's own announcement ("slightly smiling face") is not the answer text ("Neutral"),
and a bare emoji span is what SkillsEngine ships today. Its emoji scale is in fact **entirely
keyboard-inaccessible**: `<span onClick>` with no `role`, no `tabIndex`, no `aria-checked`
(`client.survey.$id.tsx:447-453`, `survey-preview.tsx:83-88`). Routing it through `Likert`'s
existing radiogroup fixes that for free — the single strongest argument for this whole exercise.
`minLabel`/`maxLabel` are captions only; the radiogroup's name still comes from `question`.

**Parity:** `renderOption` is the one to watch. React takes `ReactNode`; Solid must take a
`() => JSX.Element` thunk rather than a value, or it will be evaluated eagerly and lose
reactivity. Same prop name, framework-appropriate type — mirror the API, not the syntax.

### Ranking

`app/components/survey/question-components/ranking.tsx` is a stub — nine lines returning
`<div>Ranking</div>`. It is an *acknowledged* unbuilt question type, so this is a gap in both
products simultaneously. It needs drag-to-reorder, which zen-ui does not have in any form
(`FileUpload`'s drag-drop is file-drop, and `DataTable`'s is column reorder — neither
generalises).

Proposed as a thin wrapper over the `SortableList` primitive in Tier 2:

```tsx
export interface RankingProps {
  items: { value: string; label: string }[];
  value?: string[];              // ordered value list
  onValueChange?: (order: string[]) => void;
  question?: string;
  /** Show 1..N position numbers beside each item. Default true. */
  showRank?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
}
```

**A11y:** drag-and-drop must have a keyboard equivalent — Space to lift, Arrow to move, Space to
drop, Esc to cancel — with an `aria-live` region announcing "Communication, moved to position 2 of
5". A pointer-only ranking question is not shippable.

## Tier 2 — General primitives (high value, tractable)

### SortableList

Needed by `Ranking` (runtime) *and* by SkillsEngine's authoring UI in three places. Today all
three use **`react-beautiful-dnd`, which is unmaintained and StrictMode-incompatible** — the app
already carries a local `StrictModeDroppable` shim (`admin.createtest.$testId.tsx:47-63`) to work
around it. The hardest case is nested: `admin.createsurvey.$id.tsx:568` drags sections
(`type="SECTION"`) with questions dragging inside them (`` `questions-${sIndex}` ``, `:676`).

```tsx
export interface SortableListProps<T> {
  items: T[];
  getKey: (item: T) => string;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, state: { isDragging: boolean }) => ReactNode;
  /** Drag only by an explicit handle. Default false (whole row draggable). */
  handle?: boolean;
  orientation?: "vertical" | "horizontal";
  /** Shared group id enables cross-list dragging (nested sections). */
  group?: string;
  disabled?: boolean;
}
```

**Dependency decision required before building.** zen-ui ships no dnd dependency. Options:
`@dnd-kit` (the de-facto successor, keyboard sensor built in, ~10kb) as an **optional peer dep**
behind a lazy boundary — consistent with how `Chart`/`RichText`/`Map` already handle heavy deps
(see nav.ts's "Heavy / optional (lazy peer deps)" group) — or a hand-rolled Pointer Events
implementation. Recommend `@dnd-kit` for React; **note that `@dnd-kit` is React-only, so Solid
needs a different engine** (`@thisbeyond/solid-dnd`). That makes this the one item where binding
parity costs real design work rather than a port: the *API* must match even though the engines
cannot. Settle that before writing code.

### Chart — pie and doughnut

> **Revised 2026-07-15 — built.** `type="pie" | "donut"` ships in both
> bindings. It needed no new concepts: `xKey` already names the slice label and
> `series[0]` already names the value, so a pie is the existing props asking a
> different question. `colors` was the one addition — a pie is one series and
> many colours, which per-series `color` cannot express.
>
> The doc's "~1 day, recharts supports it, this is a wiring job" was true of the
> React binding only. Solid has no pie primitive, so its arcs are hand-built;
> the shared maths lives in `@algorisys/zen-ui-core/chart` and is pinned by
> `bun run check:chart` (43 checks). That sharing is load-bearing rather than
> tidy: the bindings have no renderer in common, so it is the only place they
> can be made to agree about what a percentage is.
>
> Two divergences the wiring introduced and the driven contract caught, both
> invisible to a build: recharts starts a pie at 3 o'clock and sweeps
> ANTICLOCKWISE (core starts at 12, clockwise), and recharts orders a pie legend
> alphabetically and ignores an explicit payload — so both bindings hand-build
> the legend now. Same props had been drawing the same data in different places.
>
> Beyond the ask: every pie ships a visually-hidden data table. The shape
> carries all the meaning and none of it survives into audio, and an aria-label
> is a sentence a listener cannot navigate or compare within.

`Chart` (`components/chart/chart.tsx:97`) resolves exactly three roots:

```tsx
const ChartRoot = type === "area" ? AreaChart : type === "bar" ? BarChart : LineChart;
```

SkillsEngine's two most visible analysis surfaces need what this cannot draw — response
breakdowns (`admin.surveyresponses.$id.tsx:21`, chart.js `Pie`), the Johari report
(`admin.joharireport.$id.tsx:12`, `Doughnut`), and the dashboard (`DashboardCharts.tsx:15`,
recharts `Pie`). Note SkillsEngine currently runs **two chart libraries at once** (chart.js in 4
files, recharts in 1) — zen-ui's `Chart` is already recharts-backed, so adding `pie`/`donut` lets
it delete a whole dependency, not just some code.

Add `type?: "line" | "bar" | "area" | "pie" | "donut"`. Pie/donut take a single categorical
series rather than x/y — needs care that `ChartSeries` degrades sensibly, plus `innerRadius` for
the donut hole and a legend. Recharts supports all of it; this is a wiring job.

### PageHeader

`title/title.tsx` is the **most-imported component in SkillsEngine (61 files)**: title, subtitle,
back button, info popover, checkbox, right-hand action. zen-ui has `DynamicPage` and
`ObjectPageLayout`, but those are Fiori-weight (snapping headers, anchored sections) and wrong for
"a heading with a back button and one action".

```tsx
export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Renders a back affordance. */
  onBack?: () => void;
  backLabel?: string;
  /** Right-aligned actions. */
  actions?: ReactNode;
  /** Optional info tooltip beside the title. */
  info?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
}
```

The existing `title.tsx` is overloaded (a checkbox in a page header is a smell) — the port should
drop that, not reproduce it. This is a small component with an outsized adoption footprint: the
single best beachhead for zen-ui in this app.

### StatCard

SkillsEngine has the same card three times — `card/card.tsx` (22 importers), `assessmentcard.tsx`
(14), `detailed-card.tsx` (1) — all "icon + label + big number + optional trend + navigate on
click". zen-ui's `Card` is a bare surface and does not cover it.

```tsx
export interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  icon?: ReactNode;
  /** Semantic tint. Default "default". */
  tone?: "default" | "primary" | "success" | "warning" | "danger";
  /** Delta indicator, e.g. { value: "+12%", direction: "up" }. */
  trend?: { value: ReactNode; direction: "up" | "down" | "flat" };
  onClick?: () => void;
  href?: string;
  loading?: boolean;
  className?: string;
}
```

`tone` should map to `--zen-*` tokens, **not** to Bootstrap's `bg-${color}-subtle` — which is what
`personality-card.tsx:13-15` computes at runtime today, a pattern that breaks under any CSS
purging and is the kind of thing zen-ui exists to prevent.

### Small extensions to existing components

| Component | Missing | Evidence |
|---|---|---|
| **`Rating`** | Half-stars. SkillsEngine's `CustomRating` implements 0.5 steps with a three-state click cycle (`question-components/rating.tsx:8-19`); zen-ui's is integer-only. Add `allowHalf?: boolean` (or `precision?: 1 \| 0.5`). A11y: keep the radiogroup; half-steps double the option count, so announce "2.5 of 5". | `rating.tsx:20-40` |
| **`Slider`** | Tick marks with labels + snap-to-mark. zen-ui's `Slider` is a bare Radix pass-through (`SliderProps extends ComponentPropsWithoutRef<typeof SliderPrimitive.Root>` — literally no own props, `slider.tsx:14-15`). SkillsEngine uses rc-slider purely for `marks` (`question-components/slider.tsx:10-13`). Add `marks?: { value: number; label?: ReactNode }[]`. | `slider.tsx:14` |
| **`Combobox`** | Creatable mode. No `create`/`onCreate` anywhere in zen-ui (verified by grep). SkillsEngine uses react-select's `CreatableSelect` in 3 files. Add `creatable?: boolean` + `onCreate?: (label: string) => void` to `Combobox` **and** `MultiCombobox`. | `combobox.tsx:59-74` |
| **`Icon`** | Coverage. zen-ui ships 48 glyphs; SkillsEngine uses lucide in **70 files** plus react-icons/fa in 15 plus Font Awesome CSS classes in ~10. 48 glyphs will not displace that. Decide: grow the set, or document `Icon` as a slot that accepts any node (the latter is cheaper and probably right). | nav.ts `/icon` |

## Tier 3 — Out of scope (record, don't build)

Domain-specific to SkillsEngine or inseparable from its backend. Listed so the boundary is
explicit rather than relitigated:

- **Assessment domain** — DISC profile cards, Johari report, personality cards, competency
  summaries, `assessmentsummary.tsx`. These are *reports*, not primitives.
- **Code execution** — Monaco (6 files), Sandpack (5), coderunners, `api.evaluate`.
- **Proctoring** — mediasoup + mediasoup-client, `@mediapipe/tasks-vision`, `react-draggable`
  participant tiles, `websocket.js`.
- **Export** — html2pdf, jspdf, react-to-pdf, exceljs, xlsx, `algo-excel`.
- **AI authoring** — LangChain (Anthropic/OpenAI/Google), `promptTemplates.ts`, `admin.ai-test.tsx`.
- **Commerce** — Razorpay subscription cards.
- **`react-confetti`** (8 files) — completion celebration. Cheap, but a novelty; not a design
  system concern.

Two bugs noted in passing, for SkillsEngine's tracker rather than zen-ui's:
`subscription-plan/plan-card.tsx:4` imports `~/services/razorpay.server` into a client component
(a real layering violation); `detailed-card/detailed-card.tsx:4` imports a type-only html2canvas
internal path (`.../css/property-descriptors/background-clip`), unused — an IDE auto-import
accident.

## Build shortlist

Ordered by (SkillsEngine unblocking × general reusability) ÷ effort. Items 1–3 are the actual
brief; 4–6 are the force multipliers.

1. **`Likert` — `layout="scale"` + `minLabel`/`maxLabel` + `renderOption`.** Additive props on a
   component that already exists in both bindings. Unblocks **two** of SkillsEngine's 11 question
   types and fixes a keyboard-inaccessible emoji scale. Smallest change, highest ratio. **~1 day.**
2. **`Matrix`.** The genuine hole, and the largest one. Two of 11 types, three hand-rolled copies
   deleted, and the a11y story (`scope`, per-row radiogroups, 2-D roving tabindex) is the whole
   point of centralising it. **~3–4 days incl. Solid.**
3. ~~**`Chart` — `pie` / `donut`.**~~ **Done** — shipped in both bindings; see the section above.
   Unblocks the two most visible analysis screens and lets SkillsEngine drop chart.js entirely.
   **~1 day.**
4. **`PageHeader`.** 61 importers. The cheapest real adoption beachhead in the app. **~1 day.**
5. **`StatCard`.** Collapses a triplicated card and kills the runtime-computed Bootstrap class
   strings. **~1 day.**
6. **`SortableList`** → then **`Ranking`**. Highest effort and the only item with a genuine
   cross-binding design problem (React `@dnd-kit` vs Solid `solid-dnd`). Retires an unmaintained
   dependency and its StrictMode shim, and unblocks a question type *neither* product has built.
   **Settle the dependency question before starting.** **~1 week.**
7. **Small extensions** — `Rating.allowHalf`, `Slider.marks`, `Combobox.creatable`. Independent,
   parallelisable, each roughly half a day. Good filler work.

Deliberately **not** recommended: `QuestionCard` (likely app-domain — a question's text and
required-asterisk are survey semantics, not UI primitives), an icon-set expansion (make `Icon` a
slot instead), and anything in Tier 3.

### A note on adoption

Even after all seven items, zen-ui displaces maybe 15% of SkillsEngine's UI — because ~96 files
hand-write Bootstrap classes on plain JSX, and no component library can displace a class string
without a rewrite. The realistic path is **new surfaces first** (the survey builder's next question
type), then the high-importer primitives (`PageHeader`, `StatCard`, `ConfirmationDialog` →
`AlertDialog`). Judge this work by whether new SkillsEngine code reaches for zen-ui, not by how
much old code changes.

## References

- SkillsEngine question types — `app/routes/admin.createsurvey.$id.tsx:109-122`
- SkillsEngine survey runtime — `app/routes/client.survey.$id.tsx:368-526`
- SkillsEngine survey preview — `app/components/survey/survey-preview/survey-preview.tsx:16-163`
- zen-ui `Likert` — [`packages/react/src/components/survey/likert.tsx`](../packages/react/src/components/survey/likert.tsx)
- zen-ui component catalogue — [`packages/react/src/nav.ts`](../packages/react/src/nav.ts)
- [docs/fiori-gap-analysis.md](fiori-gap-analysis.md) — the companion analysis; overlaps here on `Tree`, `Toolbar`, icons
- [LOOPS.md](../LOOPS.md) — rule XXXVI (port behaviour, not syntax) governs every Solid port above
