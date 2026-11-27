<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# toaster — API (React, the parity reference)

Exports: `Toaster`, `ToasterProps`, `ToasterPosition`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-toaster>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Toaster

- `position?: ToasterPosition | undefined` — Where the toasts stack. Default "top-right", as it always was.

### Other exports

- `ToasterPosition` = `"bottom-right" | "bottom-left" | "top-right" | "top-left" | "top-center" | "bottom-center"`

### Types

- `ToasterProps` — type (see the component above)
