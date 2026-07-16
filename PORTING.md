# Porting zen-ui to a binding with no framework

**React is the reference.** Where React and Solid disagree, vanilla follows React.
Where React relies on something only React has, this file says what to write instead.

Read [LOOPS.md](LOOPS.md) rule XXXVI first: the source is the spec, not the template.
Match what a component *does*, not the shape of the lines that do it. A transliterated
`forwardRef` is not a port.

## The call site comes first (LOOPS XL)

Every component is a factory: props in, a handle out.

```js
import { Button, Dialog, DialogContent, DialogTitle } from "@algorisys/zen-ui-vanilla";

const save = Button({ variant: "solid", color: "primary", children: "Save" });
document.querySelector("#toolbar").append(save.el);

save.update({ loading: true });   // no re-render: a targeted DOM write
save.destroy();                   // removes listeners, unmounts portals
```

The handle is the contract. Everything returns the same shape:

```ts
interface ZenComponent<P> {
  el: HTMLElement;                 // the root node; append it yourself
  update(next: Partial<P>): void;  // re-apply only what changed
  destroy(): void;                 // release listeners, observers, portals
}
```

`el` is a plain element, not a wrapper. Callers own where it goes.

## The mapping

| React | Vanilla | Why it differs |
|---|---|---|
| `React.forwardRef` | `handle.el` | The element is already the handle. There is nothing to forward a ref *to* — the caller holds the node. |
| `asChild` + Radix `Slot` | `as: "a"` / `as: element` | Slot exists to merge props onto an unknown child element at render time. With no render there is nothing to defer: take the tag (or a node) up front. Mirrors Solid's `as`. |
| `className` | `class` | DOM-native, and Solid already diverges here. `cn(base, props.class)` last, so the caller wins. |
| `{...props}` spread | `applyProps(el, rest)` | Splits `on*` handlers (→ `addEventListener`), `style` objects, `data-*`/`aria-*`, and booleans that must be *attributes* not properties. |
| `children: ReactNode` | `Child = Node \| string \| ZenComponent \| Child[] \| null` | Normalised by `toNodes()`. A `ZenComponent` contributes its `.el`. Strings become text nodes — never `innerHTML` (LOOPS XV). |
| React context | an explicit context object passed to sub-parts | Compound components (Dialog, Tabs, Accordion) take the root's context as a hidden prop. No provider, no lookup. |
| `useState` re-render | `update()` + `presence()` / direct writes | Nothing re-renders. State changes are DOM writes you make on purpose. |
| `value` / `defaultValue` / `onValueChange` | `controllable()` | Same prop names as React. Controlled when `value` is present, uncontrolled otherwise. Identical semantics, hand-written. |
| `useEffect` cleanup | `destroy()` | Every listener, observer, timer and portal registered by a factory is released here. If you add one and do not release it, you have a leak. |
| Radix `Portal` | `portal()` | |
| Radix focus trap / scroll lock / dismiss | `focusTrap()`, `scrollLock()`, `dismissable()` | Radix's actual content. See below. |
| `data-state` from Radix | `presence()` sets it | **Vanilla emits React's vocabulary**: `data-state="open" \| "closed" \| "active"`. |

## The state vocabulary is not cosmetic

The primitive library's vocabulary leaks into the shipped class strings. Measured:
React writes `data-[state=…]` 58 times and Kobalte's vocabulary 0 times; Solid is 7 vs 19.

```
React   data-[state=open]:zen-anim-accordion-down
Solid   data-[expanded]:zen-anim-accordion-down     ← same decision, different dialect
```

So a variant class is only shareable between bindings when it carries no state
vocabulary. Button, Badge, Alert and Card hoist cleanly. Tabs and Accordion do not.

Vanilla owns its own behaviour, so it has a free choice, and it picks React's. That
keeps vanilla's stateful variants identical to React's and confines the divergence to
Solid, where it is forced by Kobalte.

## What core gives you free

Do not reimplement any of it. It is already framework-agnostic and already pinned by
`bun run check`:

| From `@algorisys/zen-ui-core` | Use for |
|---|---|
| `cn` | class merging; understands the `zen-` prefix |
| `tokens.css`, `preflight.css` | the design tokens and the opt-in reset |
| `ZEN_PREFIX`, `zenUnoTheme`, `zenAnimationsPreset` | the whole Uno config |
| `ZEN_ICONS` | icon geometry — render it, do not redraw it |
| `mask`, `color`, `date-range`, `chart`, `pivot`, `virtual-window` | the pure logic. `applyMask` is the same function React calls. |

Core has zero framework imports, and that is a rule, not an accident. **Do not add one.**
Core also must not name a *primitive library*: `tokens.css` read
`var(--radix-accordion-content-height)` for a long time, which meant the shared
stylesheet only worked for the one binding whose library shared its vocabulary. It now
reads `--zen-collapsible-content-height`, and each binding maps its own measurement onto
it. Vanilla sets it directly, from its own `ResizeObserver`.

## What you have to write yourself

This is the honest cost of the port, and the honest measure of what Radix and Kobalte
were doing for us. Eight modules in `src/lib/`:

| Module | Replaces |
|---|---|
| `component.ts` | the render loop: the `{el, update, destroy}` contract, `toNodes()`, `applyProps()` |
| `state.ts` | controlled/uncontrolled resolution |
| `portal.ts` | `Radix.Portal` |
| `focus-trap.ts` | focus containment + restore-on-close |
| `dismissable.ts` | Escape and click-outside |
| `scroll-lock.ts` | body scroll lock, scrollbar-width compensation |
| `roving-focus.ts` | arrow-key navigation (Tabs, Accordion, Select) |
| `presence.ts` | `data-state` toggling + waiting for the exit animation before unmount |

Everything else — every colour, radius, shadow, variant and pure-logic model — is core's.

## Traps that already bit, and will again

- **A class that generates no CSS fails silently.** Twelve of them shipped. `bun run
  check:css-live` now catches the family in ~0.2s; run it before you believe a style
  works. Vanilla is covered by it the moment the package exists.
- **`zen-anim-*` are utilities now, not plain classes.** They come from
  `zenAnimationsPreset`. Adding a new one means adding it to `ZEN_ANIMATIONS` *and* a
  matching `@keyframes zen-<name>` in `tokens.css`.
- **`/builder` is a prefix of `/builder-vanilla`.** The dev-hub proxy table and the
  Pages `404.html` both match on anchored regexes and sort longest-base-first for
  exactly this reason. Do not "simplify" them.
- **Never `innerHTML` a caller's string.** `ZEN_ICONS` values are our own trusted SVG
  markup and are the one exception; everything else goes through `textContent`.
- **`preserveModules` + `sideEffects` only work together.** Measured here at 151 kB → 17 kB
  for one Button. Fixing either alone measures as a no-op, which is how it survived once
  already.
