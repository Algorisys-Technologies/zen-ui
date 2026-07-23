<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# bound-fields — API (React, the parity reference)

Exports: `BoundInput`, `BoundTextarea`, `BoundSelect`, `BoundCheckbox`, `BoundSwitch`, `BoundRadioGroup`, `BoundSlider`, `BoundInputProps`, `BoundTextareaProps`, `BoundSelectProps`, `BoundCheckboxProps`, `BoundSwitchProps`, `BoundRadioGroupProps`, `BoundSliderProps`, `BoundSelectOption`, `SelectOption`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-bound-fields>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### BoundInput

- `name: Path<TFields>`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `required?: boolean | undefined`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `fieldClassName?: string | undefined`
- …plus the underlying element's standard props (305 inherited).

### BoundTextarea

- `name: Path<TFields>`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `required?: boolean | undefined`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `fieldClassName?: string | undefined`
- …plus the underlying element's standard props (289 inherited).

### BoundSelect

- `name: Path<TFields>`
- `options: SelectOption[]`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `required?: boolean | undefined`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `placeholder?: string | undefined`
- `disabled?: boolean | undefined`
- `fieldClassName?: string | undefined`

### BoundCheckbox

- `name: Path<TFields>`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `disabled?: boolean | undefined`
- `fieldClassName?: string | undefined`

### BoundSwitch

- `name: Path<TFields>`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `disabled?: boolean | undefined`
- `fieldClassName?: string | undefined`

### BoundRadioGroup

- `name: Path<TFields>`
- `options: SelectOption[]`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `required?: boolean | undefined`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `orientation?: "horizontal" | "vertical" | undefined`
- `disabled?: boolean | undefined`
- `fieldClassName?: string | undefined`

### BoundSlider

- `name: Path<TFields>`
- `label?: React.ReactNode`
- `description?: React.ReactNode`
- `rules?: RegisterOptions<TFields, Path<TFields>> | undefined`
- `min?: number | undefined`
- `max?: number | undefined`
- `step?: number | undefined`
- `disabled?: boolean | undefined`
- `fieldClassName?: string | undefined`

### SelectOption (type)

- `value: string`
- `label: React.ReactNode`
- `disabled?: boolean | undefined`

### Other exports

- `BoundSelectOption` = `SelectOption`

### Types

- `BoundInputProps` — type (see the component above)
- `BoundTextareaProps` — type (see the component above)
- `BoundSelectProps` — type (see the component above)
- `BoundCheckboxProps` — type (see the component above)
- `BoundSwitchProps` — type (see the component above)
- `BoundRadioGroupProps` — type (see the component above)
- `BoundSliderProps` — type (see the component above)
