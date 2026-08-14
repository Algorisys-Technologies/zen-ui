<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# command — API (React, the parity reference)

Exports: `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandLoading`, `CommandGroup`, `CommandItem`, `CommandSeparator`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-command>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Command

- from `cmdk`: `value?`, `children?`, `onValueChange?`, `label?`, `filter?`, `asChild?`, `loop?`, `shouldFilter?`, `disablePointerSelection?`, `vimBindings?`
- …plus the underlying element's standard props (279 inherited).

### CommandInput

- from `cmdk`: `value?`, `onValueChange?`, `asChild?`
- …plus the underlying element's standard props (307 inherited).

### CommandList

- from `cmdk`: `children?`, `label?`, `asChild?`
- …plus the underlying element's standard props (279 inherited).

### CommandEmpty

- from `cmdk`: `children?`, `asChild?`
- …plus the underlying element's standard props (279 inherited).

### CommandLoading

- from `cmdk`: `children?`, `label?`, `asChild?`, `progress?`
- …plus the underlying element's standard props (279 inherited).

### CommandGroup

- from `cmdk`: `value?`, `children?`, `asChild?`, `heading?`, `forceMount?`
- …plus the underlying element's standard props (279 inherited).

### CommandItem

- from `cmdk`: `disabled?`, `value?`, `children?`, `onSelect?`, `asChild?`, `forceMount?`, `keywords?`
- …plus the underlying element's standard props (278 inherited).

### CommandSeparator

- from `cmdk`: `asChild?`, `alwaysRender?`
- …plus the underlying element's standard props (280 inherited).
