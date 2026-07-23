<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# link — API (React, the parity reference)

Exports: `Link`, `linkVariants`, `LinkProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-link>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Link

- `external?: boolean | undefined` — Opens in a new tab, says so, and renders the mark that means it.
- `disabled?: boolean | undefined` — An anchor cannot be disabled — the attribute does not exist and a pointer-events trick still leaves it in the tab order. A disabled Link renders a <span> instead, so there is nothing to click or focus.
- `asChild?: boolean | undefined`
- `size?: "sm" | "md" | "lg" | null | undefined`
- `inline?: boolean | null | undefined` — A link in running prose is underlined and takes the sentence's colour and size — colour alone is not an accessible way to say "link" when the link sits inside text.
- …plus the underlying element's standard props (287 inherited).

### Other exports

- `linkVariants(props?: ({ size?: "sm" | "md" | "lg" | null | undefined; inline?: boolean | null | undefined; disabled?: boolean | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `LinkProps` — type (see the component above)
