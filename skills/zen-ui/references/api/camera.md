<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# camera — API (React, the parity reference)

Exports: `Camera`, `CameraProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-camera>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Camera

- `onCapture?: ((dataUrl: string) => void) | undefined`
- `width?: number | undefined`
- `height?: number | undefined`
- `facingMode?: "user" | "environment" | undefined`
- `screenshotFormat?: "image/jpeg" | "image/png" | "image/webp" | undefined`
- `mirrored?: boolean | undefined`
- `captureLabel?: React.ReactNode`
- `className?: string | undefined`

### Types

- `CameraProps` — type (see the component above)
