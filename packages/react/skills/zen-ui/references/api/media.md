<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# media — API (React, the parity reference)

Exports: `formatMediaTime`, `MIN_MEDIA_RANGE`, `MediaRange`, `MediaRangeMode`, `WaveformClip`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-media>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MediaRange (type)

- `start: number`
- `end: number`

### WaveformClip (type)

- `offset: number`
- `start: number`
- `end: number`

### Other exports

- `formatMediaTime(seconds: number): string`
- `MIN_MEDIA_RANGE: 0.1`
- `MediaRangeMode` = `"partition" | "independent"`
