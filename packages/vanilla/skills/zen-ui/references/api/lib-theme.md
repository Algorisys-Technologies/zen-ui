<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# lib-theme — API (React, the parity reference)

Exports: `useTheme`, `applyTheme`, `getInitialTheme`, `THEMES`, `ThemeName`, `ThemeDescriptor`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-lib-theme>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ThemeDescriptor (type)

- `name: ThemeName`
- `label: string`
- `description: string`
- `preview: [string, string, string]`

### Other exports

- `useTheme(): { theme: ThemeName; setTheme: (next: ThemeName) => void; themes: import("/home/rajesh/work/algo/zen-ui/packages/core/src/theme").ThemeDescriptor[]; }`
- `applyTheme(name: ThemeName): void`
- `getInitialTheme(): ThemeName`
- `THEMES: ThemeDescriptor[]`
- `ThemeName` = `"default" | "zen-theme" | "dark"`
