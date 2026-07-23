<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# button-family — API (React, the parity reference)

Exports: `ToggleButton`, `SegmentedButton`, `SegmentedButtonItem`, `SplitButton`, `ToggleButtonProps`, `SegmentedButtonProps`, `SegmentedButtonItemProps`, `SplitButtonProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-button-family>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ToggleButton

- `pressed?: boolean | undefined` — Controlled pressed state.
- `defaultPressed?: boolean | undefined`
- `onPressedChange?: ((pressed: boolean) => void) | undefined`
- `size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `asChild?: boolean | undefined` — Render the variant styles onto the child element (Radix Slot pattern).
- `loading?: boolean | undefined` — When true, shows a spinner and disables the button.
- `variant?: "link" | "solid" | "outline" | "soft" | "ghost" | null | undefined`
- `shape?: "circle" | "default" | "square" | "block" | null | undefined`
- `multiline?: boolean | null | undefined`
- `iconLeft?: React.ReactNode` — Icon node placed before children.
- `iconRight?: React.ReactNode` — Icon node placed after children.
- …plus the underlying element's standard props (288 inherited).

### SegmentedButton

- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((value: string) => void) | undefined`
- `size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined`
- `aria-label?: string | undefined` — Accessible name for the group — it is a radiogroup, so it needs one.
- …plus the underlying element's standard props (277 inherited).

### SegmentedButtonItem

- `value: string`
- `size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `asChild?: boolean | undefined` — Render the variant styles onto the child element (Radix Slot pattern).
- `loading?: boolean | undefined` — When true, shows a spinner and disables the button.
- `variant?: "link" | "solid" | "outline" | "soft" | "ghost" | null | undefined`
- `shape?: "circle" | "default" | "square" | "block" | null | undefined`
- `multiline?: boolean | null | undefined`
- `iconLeft?: React.ReactNode` — Icon node placed before children.
- `iconRight?: React.ReactNode` — Icon node placed after children.
- …plus the underlying element's standard props (288 inherited).

### SplitButton

- `menu: React.ReactNode` — Menu contents — pass DropdownMenuItem children.
- `menuLabel?: string | undefined` — Accessible name for the arrow half.
- `menuAlign?: "start" | "center" | "end" | undefined`
- `asChild?: boolean | undefined` — Render the variant styles onto the child element (Radix Slot pattern).
- `loading?: boolean | undefined` — When true, shows a spinner and disables the button.
- `iconLeft?: React.ReactNode` — Icon node placed before children.
- `iconRight?: React.ReactNode` — Icon node placed after children.
- `size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined`
- `color?: "info" | "error" | "primary" | "neutral" | "success" | "warning" | null | undefined`
- `variant?: "link" | "solid" | "outline" | "soft" | "ghost" | null | undefined`
- `shape?: "circle" | "default" | "square" | "block" | null | undefined`
- `multiline?: boolean | null | undefined`
- …plus the underlying element's standard props (289 inherited).

### Types

- `ToggleButtonProps` — type (see the component above)
- `SegmentedButtonProps` — type (see the component above)
- `SegmentedButtonItemProps` — type (see the component above)
- `SplitButtonProps` — type (see the component above)
