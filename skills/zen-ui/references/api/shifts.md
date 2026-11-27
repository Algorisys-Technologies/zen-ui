<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# shifts — API (React, the parity reference)

Exports: `addPlantDays`, `nextShift`, `plantDayOf`, `previousShift`, `shiftAt`, `shiftWindow`, `wallClockToInstant`, `ShiftDef`, `ShiftRef`, `ShiftWindow`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-shifts>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ShiftDef (type)

- `id: string`
- `start: string` — "HH:MM", 24-hour, wall clock in the plant's zone.
- `end: string` — "HH:MM". At or before `start` means it ends the next day.
- `label?: string | undefined` — Shown instead of the id ("Night").

### ShiftRef (type)

- `id: string`
- `day: string` — The plant's calendar day the shift starts on.

### ShiftWindow (type)

- `start: number`
- `end: number`

### Other exports

- `addPlantDays(day: string, n: number): string`
- `nextShift(ref: ShiftRef, shifts: readonly ShiftDef[]): ShiftRef | null`
- `plantDayOf(t: number, timeZone?: string): string`
- `previousShift(ref: ShiftRef, shifts: readonly ShiftDef[]): ShiftRef | null`
- `shiftAt(at: Date | number, shifts: readonly ShiftDef[], timeZone?: string, options?: { orNext?: boolean; orPrevious?: boolean; }): ShiftRef | null`
- `shiftWindow(ref: ShiftRef, shifts: readonly ShiftDef[], timeZone?: string): ShiftWindow | null`
- `wallClockToInstant(day: string, hhmm: string, timeZone?: string): number`
