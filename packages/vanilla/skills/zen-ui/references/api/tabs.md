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

- from `@radix-ui/react-tabs`: `value?`, `defaultValue?`, `onValueChange?`, `orientation?`, `dir?`, `activationMode?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (278 inherited).

### TabsList

- `orientation?: "horizontal" | "vertical" | null | undefined`
- `variant?: "underline" | "pills" | null | undefined`
- from `@radix-ui/react-primitive`: `asChild?`
- from `@radix-ui/react-tabs`: `loop?`
- …plus the underlying element's standard props (280 inherited).

### TabsTrigger

- `variant?: "underline" | "pills" | null | undefined`
- from `@radix-ui/react-tabs`: `value`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (289 inherited).

### TabsContent

- from `@radix-ui/react-tabs`: `value`, `forceMount?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (280 inherited).

### Other exports

- `tabsListVariants(props?: ({ variant?: "underline" | "pills" | null | undefined; orientation?: "horizontal" | "vertical" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`
- `tabsTriggerVariants(props?: ({ variant?: "underline" | "pills" | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `TabsListProps` — type (see the component above)
- `TabsTriggerProps` — type (see the component above)
