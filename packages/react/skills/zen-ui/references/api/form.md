<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# form — API (React, the parity reference)

Exports: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `useFormField`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-form>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### Form

- from `react-hook-form`: `children`, `watch`, `getValues`, `getFieldState`, `setError`, `clearErrors`, `setValue`, `trigger`, `formState`, `resetField`, `reset`, `handleSubmit`, `unregister`, `control`, `register`, `setFocus`, `subscribe`

### FormField

- from `react-hook-form`: `render`, `name`, `rules?`, `shouldUnregister?`, `defaultValue?`, `control?`, `disabled?`, `exact?`

### FormItem

- …plus the underlying element's standard props (280 inherited).

### FormLabel

- …plus the underlying element's standard props (282 inherited).

### FormControl

- from `@radix-ui/react-slot`: `children?`
- …plus the underlying element's standard props (279 inherited).

### FormDescription

- …plus the underlying element's standard props (280 inherited).

### FormMessage

- …plus the underlying element's standard props (280 inherited).

### Other exports

- `useFormField(): { invalid: boolean; isDirty: boolean; isTouched: boolean; isValidating: boolean; error?: import("/home/rajesh/work/algo/zen-ui/node_modules/react-hook-form/dist/index").FieldError; ... 4 more ...; formMessageId: string; }`
