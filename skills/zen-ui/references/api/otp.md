<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# otp — API (React, the parity reference)

Exports: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`, `InputOTPProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-otp>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### InputOTP

- `value?: string | undefined`
- `defaultValue?: string | undefined`
- `onValueChange?: ((value: string) => void) | undefined` — Primary change handler.
- `onChange?: ((value: string) => void) | undefined`
- `onComplete?: ((value: string) => void) | undefined`
- `maxLength?: number | undefined`
- `groupSizes?: number[] | undefined`
- `separator?: React.ReactNode`
- `children?: React.ReactNode`
- `className?: string | undefined`
- `containerClassName?: string | undefined`
- `disabled?: boolean | undefined`
- `pasteTransformer?: ((text: string) => string) | undefined` — Transform pasted text before extracting digits.
- `borderColor?: string | undefined` — CSS color for the default slot border. Defaults to `--zen-color-border` (theme-aware — visible in dark mode).
- `focusBorderColor?: string | undefined` — CSS color for the focused slot border. Defaults to `--zen-color-primary`.
- `slotClassName?: string | undefined` — Extra classes applied to every digit input.
- …plus the underlying element's standard props (276 inherited).

### InputOTPGroup

- …plus the underlying element's standard props (280 inherited).

### InputOTPSlot

- `index: number`
- …plus the underlying element's standard props (309 inherited).

### InputOTPSeparator

- …plus the underlying element's standard props (280 inherited).

### Types

- `InputOTPProps` — type (see the component above)
