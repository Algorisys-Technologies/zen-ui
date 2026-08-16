<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# message-popover — API (React, the parity reference)

Exports: `MessagePopover`, `Message`, `MessageType`, `MessagePopoverProps`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-message-popover>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### MessagePopover

- `messages: Message[]`
- `onMessageSelect?: ((message: Message) => void) | undefined` — Called when a row is activated. Return nothing and the default navigation still runs; the two are additive, so you can open a tab AND land on the field.
- `disableNavigation?: boolean | undefined` — Turn off the focus/scroll behaviour and handle it entirely yourself.
- `emptyMessage?: React.ReactNode` — Shown when `messages` is empty.
- `maxBodyHeight?: number | undefined` — Max scrollable body height. Default 320.
- `triggerLabel?: string | undefined` — aria-label for the trigger. Default describes the counts.
- `className?: string | undefined`
- …plus the underlying element's standard props (2 inherited).

### Message (type)

- `id: string`
- `type: MessageType`
- `title: React.ReactNode` — The message itself. Keep it short; it is a list row.
- `subtitle?: React.ReactNode` — Usually the field label, so the user knows WHERE the problem is.
- `description?: React.ReactNode` — Longer explanation, shown under the title.
- `targetId?: string | undefined` — `id` of the form control this message belongs to. When set, activating the row focuses and scrolls to it. The element does not need to be focusable — a `tabindex="-1"` is applied for the duration if it is not.

### Other exports

- `MessageType` = `"info" | "error" | "success" | "warning"`

### Types

- `MessagePopoverProps` — type (see the component above)
