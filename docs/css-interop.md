# CSS interop — using zen-ui alongside your own styles

**Applies to:** `@algorisys/zen-ui-react` ≥ 3.0.0, `@algorisys/zen-ui-solid` ≥ 1.0.0

zen-ui is built with UnoCSS, but **you never need UnoCSS to consume it**. The library ships precompiled CSS; the build engine is an implementation detail. Whether your app uses Tailwind, Bootstrap, CSS Modules, or plain CSS, importing zen-ui must not change how your own styles render.

That guarantee is the point of this document.

## The contract

> zen-ui's stylesheet may only touch elements zen-ui renders, and CSS variables under `--zen-*`. Nothing else.

Concretely, everything the library ships is one of:

| Kind | Example | Collision risk |
|---|---|---|
| Prefixed utilities | `.zen-p-4`, `.hover\:zen-bg-zen-primary` | None — the `zen-` namespace is ours |
| Design tokens | `--zen-color-primary`, `--zen-radius-md` | None — `--zen-*` custom properties |
| Hand-written animations | `.zen-anim-fade-in` + `@keyframes zen-fade-in` | None |
| Vendored dependency CSS | `.rdp-*` (react-day-picker, used by `DatePicker`) | Self-namespaced upstream |

There is exactly one global rule, from UnoCSS itself:

```css
*,:before,:after { --un-rotate: 0; --un-scale-x: 1; /* …50 declarations… */ }
```

All 50 are `--un-*` custom properties. It is **visually inert** — it initialises variables that transform/ring/shadow utilities read. It sets no visual property on your elements.

## Quick start

```ts
import "@algorisys/zen-ui-react/styles";   // required
import { Button } from "@algorisys/zen-ui-react";
```

That's it for Tailwind users, and for anyone whose CSS already ships a reset.

### If you have no CSS reset

zen-ui's components assume a Tailwind-v3-style element reset (borders default to width 0 / style solid, buttons have no native chrome). Tailwind's own preflight provides this, so Tailwind users need nothing. If your app has no reset, opt in:

```ts
import "@algorisys/zen-ui-react/preflight";  // BEFORE /styles
import "@algorisys/zen-ui-react/styles";
```

This is opt-in rather than automatic because it uses global element selectors (`*`, `button`, `input`, `:disabled`) — exactly the kind of reach a library shouldn't take without being asked. Don't import it if you already use Tailwind: you'd be applying the same reset twice.

## Overriding component styles

Pass `className` (React) / `class` (Solid) as usual. `cn()` runs tailwind-merge, so **your classes win over ours**, even though they're in different namespaces:

```tsx
// zen-ui's base is `zen-bg-zen-muted`; your Tailwind `bg-red-500` replaces it
<Skeleton className="h-4 w-32 bg-red-500" />
```

tailwind-merge is configured to strip the `zen-` prefix when resolving conflict groups, so `zen-bg-zen-muted` and `bg-red-500` are recognised as the same group (background-color) and the last one wins — yours. Sizing utilities like `h-4 w-32` don't conflict with anything we set, so they just apply.

You size zen-ui components with **your own** utilities. Don't write `zen-*` classes in your app: the shipped stylesheet only contains the `zen-*` classes the library itself uses, so `zen-w-99` would resolve to nothing.

## Theming

Override `--zen-*` custom properties. This is the supported theming surface and is unaffected by any of the above:

```css
:root { --zen-color-primary: #7c3aed; --zen-radius-md: 2px; }
```

See the token reference in the [README](../README.md#token-reference).

---

# Upgrading from 2.x — breaking changes

2.x had three defects that made zen-ui unsafe to combine with any other stylesheet. All are fixed; all are breaking.

### 1. The library no longer restyles your document

2.x shipped the demo app's page stylesheet inside `dist/style.css`:

```css
html { font-size: 62.5%; overflow-x: hidden }
body { margin: 0; font-family: …"Plus Jakarta Sans"…; width: 100% }
#root { height: 100% }
```

Importing zen-ui set **your** root font-size to 10px, which silently rendered every rem-based utility in your app — including all of Tailwind's — at 62.5% of its intended size. It also restyled `<body>` and an app-specific `#root` element the library has no business knowing about.

Those rules now live only in the demo app. **If you were compensating for them (e.g. re-setting `html { font-size: 16px }`), remove that workaround.**

### 2. Utilities are namespaced

Every utility now emits as `.zen-*`:

| 2.x | 3.x |
|---|---|
| `.p-4 { padding: 1.6rem }` | `.zen-p-4 { padding: 1rem }` |
| `.gap-2 { gap: .8rem }` | `.zen-gap-2 { gap: .5rem }` |

In 2.x these were unprefixed *and* rescaled, so zen-ui's `.p-4` (1.6rem) fought Bootstrap's `.p-4` (1.5rem) or a custom Tailwind theme's — with the winner decided by bundler CSS import order, which can differ between dev and production builds. Collisions are now structurally impossible.

**Rendered output is unchanged.** The `1.6×` rem rescale existed solely to compensate for the 62.5% rule; the two cancel out (`1.6rem × 10px` and `1rem × 16px` are both 16px). Removing them together is a visual no-op, verified rule-by-rule against a 2.x build.

If you referenced zen-ui's internal classes directly (never supported), they need the `zen-` prefix.

### 3. The element reset is opt-in

`preflight.css` was auto-imported and applied `*, ::before, ::after { border-width: 0 }` plus `button`/`input`/`select` resets to **your entire app**. It's now behind `@algorisys/zen-ui-react/preflight` — see [above](#if-you-have-no-css-reset).

---

# Contributor notes

### Authoring

Write utilities prefixed, with variants **outside** the prefix — that's the form UnoCSS matches:

```
zen-flex zen-items-center            ✅
hover:zen-bg-zen-primary             ✅   (not zen-hover:bg-…)
data-[state=open]:zen-rotate-180     ✅
-zen-mt-2   !zen-p-4                 ✅   (markers precede the prefix)
zen-group / zen-peer                 ✅   (anchors are prefixed too; `group-hover:` compiles to `.zen-group:hover .group-hover\:…`)
```

`ZEN_PREFIX` in [packages/core/src/uno-preset.ts](../packages/core/src/uno-preset.ts) is shared by every binding's `uno.config.ts` **and** by `cn()`. They must not drift apart.

### The shipped `style.css` is a CLOSED SET — read this before writing `zen-` classes in your own app

`dist/style.css` is what UnoCSS generated **from zen-ui's own source**. UnoCSS is
a scanner: it emits a rule only for a class it has actually seen in a file it was
told to read. It never saw your app.

So the utilities in that file are exactly the ones zen-ui's own components
happen to use — nothing else. A `zen-` class you write in your markup generates
nothing unless zen-ui already used the identical class somewhere. Measured
against the shipped `packages/solid/dist/style.css`:

```
zen-p-4        present   ← zen-ui uses it
zen-gap-2      present   ← zen-ui uses it
zen-p-7        ABSENT
zen-py-3.5     ABSENT
zen-p-[10px]   ABSENT
```

**This is not a gap in the preset**, and it is worth being precise because a
consumer hit exactly this and drew the wrong conclusion — that the preset
shipped no spacing scale and no arbitrary values, and that two-thirds of their
styles therefore had to become inline `style` attributes. Asked directly, the
generator emits all of them:

```
zen-p-7  zen-p-9  zen-p-11  zen-p-14  zen-p-16  zen-p-20  zen-p-24   all generate
zen-p-0.5  zen-py-1.5  zen-gap-1.5  zen-py-3.5  zen-mt-2.5           all generate
zen-p-[10px]  zen-text-[0.7rem]  zen-grid-cols-[1fr_1fr]             all generate
```

`presetUno` supplies the spacing scale and arbitrary-value support; zen-ui's
preset adds the theme on top. Nothing is missing. The stylesheet is just a
snapshot, not a library.

**If you want to author `zen-` utilities in your own app, run UnoCSS yourself**
over your own source, with zen-ui's preset so the theme and prefix match:

```ts
// uno.config.ts, in YOUR app
import { defineConfig, presetUno } from "unocss";
import { ZEN_PREFIX, zenUnoTheme, zenAnimationsPreset } from "@algorisys/zen-ui-core/uno-preset";

export default defineConfig({
  presets: [presetUno({ prefix: ZEN_PREFIX }), zenAnimationsPreset],
  theme: zenUnoTheme,
});
```

Then import zen-ui's stylesheet for the components **and** your own generated
CSS for your markup. The two do not conflict: same prefix, same theme, same
tokens.

Prefer plain unprefixed utilities in your own app if you already have Tailwind
or UnoCSS set up — the `zen-` prefix exists to stop zen-ui colliding with YOUR
CSS, not to be the vocabulary you write in.

A last check before blaming the preset: a class that generates nothing may
simply be misspelled against the theme. Two real ones from the same report —
`zen-text-zen-muted-foreground` (the token is `muted-fg`) and `zen-bg-zen-card`
(there is no `card` colour; use `background`) — were genuine bugs in the
consumer's markup, and no preset change would have fixed them. The token list is
in the [README](../README.md#token-reference).

### Two traps worth knowing

**`cn()` cannot use `extendTailwindMerge({ prefix })`.** That option follows Tailwind v4 semantics, where a prefix is a leading variant (`zen:p-4`). UnoCSS emits the v3 form (`zen-p-4`), so the built-in option silently matches nothing and every override breaks. [cn.ts](../packages/core/src/cn.ts) instead strips the prefix from the parsed base class via `experimentalParseClassName`.

**Hand-written animation classes are `zen-anim-*`, not `zen-animate-*`.** Under the prefix, `zen-animate-fade-in` parses as `animate-fade-in` — a real UnoCSS built-in — so Uno emitted a second, competing rule for the same selector. `zen-anim-*` matches no Uno rule, so tokens.css owns it outright. (`zen-animate-spin` / `zen-animate-pulse` are genuine Uno utilities and are correct.)

### `apps/landing` is deliberately unprefixed

It ships CSS to nobody and doesn't depend on `zen-ui-react`, so it has nothing to collide with and authors plain `p-4`.

### How the 3.x migration was done

For the record, since it's worth repeating if the rule set ever changes again:

1. **Codemod, AST-scoped.** Only string literals reachable from a `className`/`class` attribute or a `cn()`/`cva()` call were rewritten — a blanket string rewrite corrupts props like `position="fixed"` ("fixed" is a real utility).
2. **UnoCSS as the oracle.** A token was prefixed only if an *unprefixed* generator actually emitted CSS for it. That automatically left `sidebar`, `otp-slot` and other hand-written classes alone.
3. **A heuristic second pass** for class strings the AST can't reach — lookup tables like `const SIZES = { xl: "h-16 w-16" }` consumed via `cn(SIZES[size])`. Guarded to strings where *every* token is a utility, there are 2+ tokens, and at least one contains `-` (which keeps out CSS values like `transformOrigin: "top left"` — both `top` and `left` are utilities).
4. **Verified by diffing built CSS** against a 2.x baseline: strip the prefix, apply the old 1.6× rescale, and every rule must match byte-for-byte. Result: 0 value mismatches, 0 dropped classes. The ~40 rules that disappeared were dead CSS — UnoCSS's extractor had been scraping incidental source text (JSDoc examples, even `m[3]` array indexing) and generating classes nothing used.

Two traps that cost real time, in case they recur:

- **`ts.forEachChild` stops on a truthy return.** A `return add(node)` in the visitor meant only the *first* string in any subtree was seen: `collapsed ? "w-16" : "w-64"` prefixed `w-16` and silently left `w-64` behind.
- **A node reachable by two paths gets edited twice.** `class={cn("…")}` is found via both the attribute walk and the `cn()` walk; applying both splices at now-stale offsets fused tokens (`zen-bg-zen-muted` + `bg-zen-muted` → `zen-bg-zen-mutedbg-zen-muted`) across 116 files. Nodes are keyed by source span, and overlapping edits now throw rather than corrupt.
