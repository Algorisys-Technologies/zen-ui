<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-andon — API (React, the parity reference)

Exports: `ANDON_TONE_ORDER`, `DEFAULT_ANDON_STALE_MS`, `andonShowsClock`, `boardFreshness`, `sortAndonTiles`, `AndonSortable`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-andon>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### AndonSortable (type)

- `state: "running" | "idle" | "stopped" | "fault" | "waiting" | "setup" | "cleaning" | "maintenance" | "unknown"`
- `tone?: MachineStateTone | undefined`
- `since?: Time | undefined` — When the tile entered its current state.

### Other exports

- `ANDON_TONE_ORDER: readonly MachineStateTone[]`
- `DEFAULT_ANDON_STALE_MS: 120000`
- `andonShowsClock(state: MachineState): boolean`
- `boardFreshness(lastUpdated: Time | undefined, now: Time, staleAfterMs?: number): { stale: boolean; ageMs: number | null; }`
- `sortAndonTiles<T extends AndonSortable>(tiles: readonly T[]): T[]`
