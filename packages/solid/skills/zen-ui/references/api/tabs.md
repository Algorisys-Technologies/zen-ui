<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# tabs — API (React, the parity reference)

Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`, `tabsListVariants`, `tabsTriggerVariants`, `TabsListProps`, `TabsTriggerProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-tabs>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Tabs

- from `.bun`: `value?`, `defaultValue?`, `onValueChange?`, `orientation?`, `dir?`, `activationMode?`, `asChild?`
- …plus the underlying element's standard props (278 inherited).

### TabsList

- `orientation?: "horizontal" | "vertical" | null | undefined`
- `variant?: "underline" | "pills" | null | undefined`
- from `.bun`: `asChild?`, `loop?`
- …plus the underlying element's standard props (280 inherited).

### TabsTrigger

- `variant?: "underline" | "pills" | null | undefined`
- from `.bun`: `value`, `asChild?`
- …plus the underlying element's standard props (289 inherited).

### TabsContent

- from `.bun`: `value`, `asChild?`, `forceMount?`
- …plus the underlying element's standard props (280 inherited).

### Other exports

- `tabsListVariants(…)`
- `tabsTriggerVariants(props?: ({ variant?: "underline" | "pills" | null | undefined; } & import("/home/jaiprakash/jaiprakash/algorisys/code/zen-ui/node_modules/.bun/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `TabsListProps` — type (see the component above)
- `TabsTriggerProps` — type (see the component above)
