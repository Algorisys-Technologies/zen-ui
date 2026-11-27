<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# live — API (React, the parity reference)

Exports: `liveState`, `LiveState`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-live>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Other exports

- `liveState(o: { lastUpdated?: Date | number; now: Date | number; staleAfterMs?: number; connected?: boolean; }): { state: LiveState; ageMs: number | null; }`
- `LiveState` = `"live" | "waiting" | "stale" | "offline"`
