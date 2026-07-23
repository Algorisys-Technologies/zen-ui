<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# banner — API (React, the parity reference)

Exports: `Banner`, `BannerIcon`, `BannerContent`, `BannerTitle`, `BannerDescription`, `BannerActions`, `BannerClose`, `bannerVariants`, `BannerProps`, `BannerCloseProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-banner>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Banner

- `color?: "info" | "primary" | "neutral" | "success" | "warning" | "destructive" | null | undefined`
- `sticky?: boolean | null | undefined`
- …plus the underlying element's standard props (279 inherited).

### BannerIcon

- …plus the underlying element's standard props (280 inherited).

### BannerContent

- …plus the underlying element's standard props (280 inherited).

### BannerTitle

- …plus the underlying element's standard props (280 inherited).

### BannerDescription

- …plus the underlying element's standard props (280 inherited).

### BannerActions

- …plus the underlying element's standard props (280 inherited).

### BannerClose

- …plus the underlying element's standard props (290 inherited).

### Other exports

- `bannerVariants(props?: ({ color?: "info" | "primary" | "neutral" | "success" | "warning" | "destructive" | null | undefined; sticky?: boolean | null | undefined; } & import("/home/rajesh/work/algo/zen-ui/node_modules/class-variance-authority/dist/types").ClassProp) | undefined): string`

### Types

- `BannerProps` — type (see the component above)
- `BannerCloseProps` — type (see the component above)
