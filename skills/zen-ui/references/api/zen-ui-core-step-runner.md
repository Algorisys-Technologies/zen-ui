<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# zen-ui-core-step-runner — API (React, the parity reference)

Exports: `canCompleteStep`, `stepRunnerState`, `StepBlock`, `StepDef`, `StepRecord`, `StepRecordStatus`, `StepRunnerState`, `StepRunStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-zen-ui-core-step-runner>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StepDef (type)

- `id: string`
- `title: string`
- `checklist?: { id: string; label: string; }[] | undefined` — Things to confirm before the step can complete.
- `measure?: { spec: MeasurementSpec; unit?: string; label?: string; } | undefined` — A reading to take.
- `optional?: boolean | undefined` — May be skipped.

### StepRecord (type)

- `status: StepRecordStatus`
- `checked?: string[] | undefined` — Ticked checklist item ids.
- `value?: number | null | undefined`
- `at?: number | undefined` — When it happened, for the record.
- `note?: string | undefined`

### StepRunnerState (type)

- `items: { id: string; status: StepRunStatus; }[]`
- `current: string | null`
- `doneCount: number`
- `total: number`
- `complete: boolean`

### Other exports

- `canCompleteStep(step: StepDef, draft: { checked?: readonly string[]; value?: number | null; }, options?: { allowFailedMeasurement?: boolean; }): { ok: boolean; reason: StepBlock | null; }`
- `stepRunnerState(steps: readonly StepDef[], records: Readonly<Record<string, StepRecord | undefined>>, options?: { sequential?: boolean; }): StepRunnerState`
- `StepBlock` = `"checklist" | "measurement-missing" | "measurement-fail"`
- `StepRecordStatus` = `"done" | "skipped" | "issue"`
- `StepRunStatus` = `"open" | "done" | "locked" | "current" | "skipped" | "issue"`
