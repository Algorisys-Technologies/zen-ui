<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# step-runner-step-runner — API (React, the parity reference)

Exports: `StepRunner`, `StepRunnerProps`, `StepRunnerStep`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-step-runner-step-runner>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### StepRunner

- `steps: StepRunnerStep[]`
- `records?: Record<string, StepRecord | undefined> | undefined`
- `defaultRecords?: Record<string, StepRecord | undefined> | undefined`
- `onRecordsChange?: ((records: Record<string, StepRecord | undefined>) => void) | undefined`
- `onStepComplete?: ((step: StepRunnerStep, record: StepRecord) => void) | undefined`
- `onReportIssue?: ((step: StepRunnerStep) => void) | undefined`
- `onComplete?: ((records: Record<string, StepRecord | undefined>) => void) | undefined`
- `sequential?: boolean | undefined` — Allow steps out of order. Default false: later steps are locked.
- `allowFailedMeasurement?: boolean | undefined` — Let a step complete with an out-of-tolerance reading. Default false.
- `label?: string | undefined` — Names the list of steps. Defaults to "Steps".
- …plus the underlying element's standard props (279 inherited).

### Other exports

- `StepRunnerStep` = `StepDef & { instructions?: React.ReactNode; }`

### Types

- `StepRunnerProps` — type (see the component above)
