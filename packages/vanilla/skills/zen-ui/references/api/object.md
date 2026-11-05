<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# object — API (React, the parity reference)

Exports: `ObjectStatus`, `ObjectNumber`, `ObjectIdentifier`, `ObjectMarker`, `objectStatusVariants`, `ObjectStatusProps`, `ObjectNumberProps`, `ObjectIdentifierProps`, `ObjectMarkerProps`, `ObjectState`, `ObjectMarkerType`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-object>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### ObjectStatus

- `state?: ObjectState | undefined` — Semantic state. Drives colour and the default icon.
- `icon?: "file" | "search" | "filter" | "chevron-down" | "chevron-up" | "chevron-right" | "chevron-left" | "chevrons-up-down" | "arrow-right" | "arrow-left" | "arrow-up" | "arrow-down" | "external-link" | "menu" | "more" | "more-vertical" | "home" | "check" | "check-circle" | "x" | "x-circle" | "info" | "warn" | "error" | "dash" | "dot" | "pin" | "plus" | "minus" | "bell" | "calendar" | "clock" | "inbox" |…` — Override the state's default icon, or pass `null` for no icon.
- `stateAnnouncement?: string | undefined` — Screen-reader text naming the state, e.g. "Approved". Colour alone must not carry meaning — without this, a status reads as bare text to assistive tech.
- `stamp?: boolean | undefined` — A document's status as a stamp: a ruled box in the state's colour, uppercase and letter-spaced, never rotated (DRAFT, SUBMITTED, CANCELLED). No icon unless one is given. The neutral state is a muted grey.
- `inverted?: boolean | null | undefined`
- …plus the underlying element's standard props (279 inherited).

### ObjectNumber

- `value?: React.ReactNode` — Shown as given: pre-formatted for the user's locale. To have the number formatted here instead, pass `number` (and `currency`) and leave this out.
- `number?: number | undefined` — A number to format in the locale (the `locale` prop, else LocaleProvider's, else the browser's): at the currency's precision with `currency`, else at `precision`. Used only when `value` is not given.
- `currency?: string | undefined` — ISO 4217. Sets the precision (INR 2, JPY 0) and, without a `unit`, is shown as the unit: 1,250.00 INR.
- `precision?: number | undefined` — Decimal places for `number`. Default: the currency's, else as many as it has.
- `locale?: string | undefined`
- `unit?: React.ReactNode`
- `state?: ObjectState | undefined`
- `emphasized?: boolean | undefined` — Larger and bolder — for the headline figure on an object page.
- …plus the underlying element's standard props (279 inherited).

### ObjectIdentifier

- `title: React.ReactNode`
- `text?: React.ReactNode` — Secondary line — an ID, a category, whatever names the object.
- …plus the underlying element's standard props (279 inherited).

### ObjectMarker

- `type: ObjectMarkerType`
- `showLabel?: boolean | undefined` — Show the label next to the icon. Icon-only stays labelled for a11y.
- `label?: string | undefined` — Override the default label ("Flagged", "Draft", …).
- …plus the underlying element's standard props (280 inherited).

### Other exports

- `objectStatusVariants(props?: ({ inverted?: boolean | null | undefined; } & import("class-variance-authority/dist/types").ClassProp) | undefined): string`
- `ObjectState` = `"none" | "info" | "error" | "success" | "warning"`
- `ObjectMarkerType` = `"draft" | "flagged" | "favorite" | "locked" | "unsaved"`

### Types

- `ObjectStatusProps` — type (see the component above)
- `ObjectNumberProps` — type (see the component above)
- `ObjectIdentifierProps` — type (see the component above)
- `ObjectMarkerProps` — type (see the component above)
