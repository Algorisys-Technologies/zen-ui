<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# stepper — API (React, the parity reference)

Exports: `Stepper`, `StepperList`, `StepperPanel`, `StepperNavigation`, `useStepper`, `StepperProps`, `StepperListProps`, `StepperPanelProps`, `StepperNavigationProps`, `StepperStep`, `StepStatus`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-stepper>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Stepper

- `steps: StepperStep[]`
- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((v: string) => void) | undefined`
- `orientation?: "horizontal" | "vertical" | undefined`
- `linear?: boolean | undefined` — When true (default), users can only click backward into completed steps. When false, any step header is clickable.
- `className?: string | undefined`
- `children: React.ReactNode`

### StepperList

- `className?: string | undefined`

### StepperPanel

- `value: string`
- `children: React.ReactNode`
- `className?: string | undefined`
- `forceMount?: boolean | undefined` — When true, render the panel into the DOM even when inactive (display:none) so React state inside survives navigation. Default false — inactive panels unmount.

### StepperNavigation

- `onBeforeNext?: (() => boolean | Promise<boolean>) | undefined` — Run before advancing; return false to block. Validation goes here — e.g. `() => form.trigger(['name', 'email'])` with RHF.
- `onSubmit?: (() => void | Promise<void>) | undefined` — Called on the last step when the user clicks Submit. The Stepper doesn't advance past the last step on its own — the caller owns the submission semantic.
- `backLabel?: string | undefined`
- `nextLabel?: string | undefined`
- `submitLabel?: string | undefined`
- `className?: string | undefined`
- `hideBackOnFirst?: boolean | undefined` — Hide the Back button on the first step. Default true.

### StepperStep (type)

- `value: string`
- `label?: string | undefined`
- `description?: string | undefined`
- `status?: StepStatus | undefined` — Override the auto-derived status (e.g. mark a previous step as "error" after a downstream check failed).
- `disabled?: boolean | undefined` — Lock this step out of navigation entirely.

### Other exports

- `useStepper(): StepperContextValue`
- `StepStatus` = `"error" | "current" | "pending" | "completed"`

### Types

- `StepperProps` — type (see the component above)
- `StepperListProps` — type (see the component above)
- `StepperPanelProps` — type (see the component above)
- `StepperNavigationProps` — type (see the component above)
