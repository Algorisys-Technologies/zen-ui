# @algorisys/zen-ui-vanilla

An experimental, unpublished zen-ui binding with no framework and no primitive
library. Props in, a DOM node out:

```js
import { Button } from "@algorisys/zen-ui-vanilla";
import "@algorisys/zen-ui-vanilla/styles";

const save = Button({ variant: "solid", color: "primary", children: "Save" });
document.querySelector("#toolbar").append(save.el);

save.update({ loading: true });   // no re-render: a targeted DOM write
save.destroy();                   // releases listeners, portals, observers
```

It exists to test whether `@algorisys/zen-ui-core` is really framework-agnostic.
See [PORTING.md](../../PORTING.md) for the React→vanilla idiom map. The rest of this
file is what it found.

---

## What a third binding proved about the seam

The vanilla binding was built to answer one question the repo had never tested:
**is `@algorisys/zen-ui-core` actually framework-agnostic?** Both existing bindings
are JSX over a Radix-style primitive library, so they could not tell — they share
the assumptions that would hide a leak. A binding with no framework and no
primitive library is the first real load on the seam.

The answer is no, it was not — and the ways it leaked were all invisible to the
build, the typecheck, and every screenshot. The binding paid for itself before its
first component rendered.

## What held

These reached a frameworkless binding unchanged, exactly as the design promised:

- **Design tokens** (`tokens.css`) and the **theme system** — CSS variables and a
  `data-theme` attribute need no framework.
- **`cn()` and the `zen-` prefix** — the Button rendered by vanilla is styled by
  the identical class string React produces.
- **The cva variant tables** — `buttonVariants` and `badgeVariants` moved into
  core and all three bindings import one object. Proven CSS-invisible by diffing
  the published stylesheet across the move.
- **Icon geometry** (`ZEN_ICONS`) — rendered straight, nothing redrawn.
- **The pure logic** — `MaskInput` calls `applyMask` / `extractRaw` /
  `isMaskComplete` from core directly. Driven in a browser: typing `123456` into
  `99-9999` gives `12-3456`, letters are rejected, backspace deletes data not the
  literal. Same engine, no reimplementation.

## What leaked — four shipped bugs

1. **The entire animation layer was dead CSS, in every binding, since it was
   written.** All twelve `zen-anim-*` classes. They were hand-written rules in
   `tokens.css`, used only behind a state variant
   (`data-[state=open]:zen-anim-accordion-down`) — 24 usages across the two
   bindings, zero bare. UnoCSS cannot build a variant of a class it does not own,
   so it emitted nothing and the rule matched no element on any page. The accordion,
   the Sheet's four slide directions, and the fades had never animated.

2. **Core named a Radix implementation detail.** The collapsible keyframes read
   `var(--radix-accordion-content-height)` in the one file shared by every binding.
   Kobalte publishes `--kb-…`; a frameworkless binding publishes neither. So the
   "agnostic" stylesheet only worked for the one binding whose primitive library
   happened to share its vocabulary.

3. **`zen-transition-[grid-template-rows]` generated nothing**, so DynamicPage's
   header collapsed instantly directly beneath a comment explaining how it
   animated. UnoCSS has no arbitrary-*value* form of `transition-*`.

4. **The build assumed a framework.** UnoCSS's default scan list is
   `.vue|.svelte|.tsx|.jsx|.html` — every framework that has a template syntax.
   Vanilla writes plain `.ts`, so on the default config *none* of its component
   classes were scanned and the whole binding rendered unstyled, green build and
   all. Only a frameworkless binding could surface this.

That same blind spot bit the variant hoist from the other side: moving the cva into
`core/src/variants.ts` (a `.ts` file) silently deleted **13 rules** from the
published stylesheet, and the build, the typecheck and `check:parity` all passed.
Only diffing the built CSS caught it.

## What is irreducibly per-binding

The eight modules in [`src/lib`](src/lib): the component contract, controlled/
uncontrolled state, portal, focus-trap, dismissable, scroll-lock, roving-focus,
and presence. That list is the honest measure of what Radix and Kobalte were doing
for the other two bindings. It is verified end-to-end by
`scripts/check-vanilla-ui.mjs` — 20 driven assertions covering focus containment,
scroll lock with scrollbar compensation, Escape and click-outside, roving arrow
navigation, and animation-aware unmount.

`@algorisys/zen-ui-vanilla` has **zero** runtime dependencies. React externalises
seven, Solid three. Yet a vanilla Button weighs the same 17 kB gzipped as React's —
because 81 kB of the 92 kB raw payload is tailwind-merge, which `cn()` needs. The
framework was never the weight; the design system is.

## What the exercise changed in the repo

- The four bugs, fixed in core, with the fix proven by a driven contract
  (`check-collapsible-var.mjs`) that goes red on the old code and green on the new,
  across all three bindings.
- A new static guard, `check:css-live`, wired into `bun run check`: it asks the real
  generator whether every `zen-` utility resolves, and catches the whole dead-class
  family in ~0.2s with no browser. It would have caught all twelve on day one.
- A binding registry, `scripts/bindings.mjs`. CLAUDE.md claimed "adding a framework
  is one entry in `scripts/demos.mjs`"; that was true for `dev:all` and nothing
  else. Eight scripts and `deploy.sh` hardcoded exactly two bindings. They now
  derive from the registry, and comparisons run against the reference binding
  (React) rather than pairwise.

## Status

A slice, not a finished binding: 8 component families against the other two's 76,
marked `partial` in the registry so the parity rule stays intact for the published
bindings. It is **not published** — a research result, not a product. Removing the
`partial` flag is the decision to make it real, and the checks will then demand all
76 components.
