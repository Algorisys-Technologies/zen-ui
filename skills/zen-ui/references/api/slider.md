<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# slider — API (React, the parity reference)

Exports: `Slider`, `SliderProps`, `SliderMark`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-slider>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Slider

- `marks?: SliderMark[] | undefined` — Tick marks along the track, with optional labels. Marks are decoration over the scale, not the scale itself: `step` still decides which values are reachable. Marks at values `step` cannot land on would draw a tick the thumb can never sit on. Horizontal only. A vertical slider needs the ticks laid out down the track, and nothing here needed that yet — rather than ship a broken half, marks are ignored when orientation="vertical".
- from `@radix-ui/react-slider`: `disabled?`, `form?`, `max?`, `min?`, `name?`, `step?`, `value?`, `defaultValue?`, `dir?`, `onValueChange?`, `orientation?`, `inverted?`, `minStepsBetweenThumbs?`, `onValueCommit?`
- from `@radix-ui/react-primitive`: `asChild?`
- …plus the underlying element's standard props (278 inherited).

### SliderMark (type)

- `value: number`
- `label?: React.ReactNode` — Rendered under the tick. A tick with no label is just a tick.

### Types

- `SliderProps` — type (see the component above)
