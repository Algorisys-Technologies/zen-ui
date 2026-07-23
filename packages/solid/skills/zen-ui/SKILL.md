---
name: zen-ui
description: Build UI with the zen-ui design system (@algorisys/zen-ui-react, -solid, -vanilla, -web-components). Use when adding or modifying ANY user interface in a project that depends on a zen-ui package — forms, dialogs, tables, date/time pickers, navigation, dashboards, app shells — or when theming or styling such a project. Covers picking the right component, required style imports, theming via --zen-* tokens, and the API differences between the four bindings.
---

<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src/nav.ts (via scripts/gen-agent-guide.ts)
     Regenerate: bun run gen:agent-guide  (checked by `bun run check`) -->

# Building UI with zen-ui

zen-ui is one shadcn/Radix-style design system shipped as four framework
bindings that share one design core. A component present in one binding exists
in all of them — roughly 80 families, from primitives (Button, Dialog, Select)
through data-heavy surfaces (DataTable, TreeTable, Pivot, PlanningCalendar) to
a full app frame (ShellBar, Sidebar, FlexibleColumnLayout, DynamicPage).

## Workflow

1. **Identify the binding** from the project's `package.json`:

   | Dependency | Binding | Idiom |
   |---|---|---|
   | `@algorisys/zen-ui-react` | React | JSX components (Radix-backed). The reference API. |
   | `@algorisys/zen-ui-solid` | Solid | JSX components (Kobalte-backed). Mirrors the React API. |
   | `@algorisys/zen-ui-vanilla` | Vanilla | Factories: props object in, handle out; `handle.el` is the DOM node. |
   | `@algorisys/zen-ui-web-components` | Web Components | `<zen-*>` custom elements; importing the package registers all of them. |

2. **Check the catalogue before building anything by hand.** Read
   [references/catalogue.md](references/catalogue.md) and match the task to a
   component's description. If zen-ui has it, use it — do not compose a
   date-range picker out of two inputs when `DateRangePicker` exists, and do
   not reach for raw shadcn/Radix alongside it.

3. **Read the component's API file before writing props.** Each family has
   [references/api/](references/api/)`<family>.md` — the real props with
   types and docs, extracted from the React source by the TypeScript compiler.
   [references/api/index.md](references/api/index.md) maps every export to its
   file. Do not guess prop names or variant values; guessed props fail
   silently as unknown attributes.

4. **Verify the setup rules below** — the failure they prevent is silent:
   the build passes and the page renders wrong.

## Setup rules (every binding)

- **The stylesheet import is mandatory.** Once, at the app entry:
  `import "<pkg>/styles";`. Without it components render completely unstyled —
  nothing errors, the build stays green.
- **The element reset is opt-in and separate**: `import "<pkg>/preflight";`.
  Do not add it to an app that has its own reset.
- **Heavy components need an optional peer dep**, lazy-loaded on use:
  Chart → `recharts`, RichText → jodit, Map → `leaflet` (+ `react-leaflet`
  in React), Camera → `react-webcam`. Install the dep when you use the
  component; without it the component has nothing to load.

## Binding divergences an agent must know

The bindings are one API with four renderers, but three differences are
structural — reaching for the React shape in another binding is a bug, not a
missing export:

- **Compound parts exist only in React and Solid.** `DialogContent`,
  `TabsList`, `AccordionItem`, `SelectTrigger` and the like are child
  components you compose. The **vanilla** and **web-components** bindings expose
  each family as ONE factory (or one `<zen-*>` element) that takes data — there
  is nothing to name the parts. Do not import `DialogContent` from
  `@algorisys/zen-ui-vanilla`; it does not exist by design.
- **Select.** React exports the Radix compound parts
  (`SelectTrigger`, `SelectContent`, `SelectItem`, …). Solid, vanilla and
  web-components export a single `Select` that takes an `options` array.
- **Toast.** React wraps Radix Toast primitives; Solid uses solid-toast. Both
  expose an imperative `toast()` plus a viewport, but the primitive API differs.

Same component, all four idioms:

```tsx
// React / Solid
import { Button } from "@algorisys/zen-ui-react"; // or -solid
import "@algorisys/zen-ui-react/styles";
<Button variant="solid" color="primary">Save</Button>;
```

```ts
// Vanilla
import { Button } from "@algorisys/zen-ui-vanilla";
import "@algorisys/zen-ui-vanilla/styles";
const btn = Button({ variant: "solid", color: "primary", children: "Save" });
document.body.append(btn.el);
```

```html
<!-- Web Components (import "@algorisys/zen-ui-web-components" once) -->
<zen-button variant="solid" color="primary">Save</zen-button>
```

## Theming and styling

- **Theming is `--zen-*` custom properties — that is the whole public
  surface.** Override them in the consuming app's CSS. Three built-in themes
  switch via `data-theme` on any ancestor: `default`, `zen-theme`, `dark`.
  Do not fork component source or patch generated CSS to restyle.
- **zen-ui's utilities are prefixed `zen-`** (`zen-p-4`,
  `hover:zen-bg-zen-primary`). The consuming app's Tailwind/UnoCSS does NOT
  generate these, so writing new `zen-*` classes in app code produces nothing.
  To adjust a component: pass `className`/`class` with the app's own
  utilities, or override `--zen-*` tokens.
- A dark panel inside a light page (or vice versa) is the `Theme` component /
  a nested `data-theme` — not manual color overrides.

## Pitfalls that fail silently

| Symptom | Cause |
|---|---|
| Everything renders unstyled, no errors | Missing `import "<pkg>/styles"` |
| Import error: `DialogContent` not exported (vanilla/wc) | Compound parts are React/Solid-only — use the family's single factory/element |
| Chart / RichText / Map / Camera renders nothing | Optional peer dep not installed |
| A `zen-*` class you wrote has no effect | Consumer builds don't generate prefixed utilities — use tokens or your own classes |
| Select code from a React example fails in Solid | API divergence — Solid's `Select` takes `options` |

## References

- [references/catalogue.md](references/catalogue.md) — the full component
  catalogue: every family, grouped, with a one-line "what it is for". Read it
  whenever choosing a component.
- [references/api/](references/api/) — one file per family with the real
  props (names, types, variant unions, JSDoc), generated from the React
  source types. `index.md` there maps every export to its file. Read the
  file for a component BEFORE using it; the props you remember from shadcn
  or Radix are not always the props here.
- Each installed package also ships `AGENTS.md` at its root (in
  `node_modules/@algorisys/zen-ui-<binding>/AGENTS.md`) with the same
  catalogue plus that binding's idiom.
