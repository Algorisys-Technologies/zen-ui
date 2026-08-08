<!-- GENERATED FILE — do not edit by hand.
     Source: packages/react/src types (via scripts/gen-skill-api.ts)
     Regenerate: bun run gen:skill-api  (checked by `bun run check`) -->

# notifications-inbox — API (React, the parity reference)

Exports: `NotificationsInbox`, `NotificationsInboxProps`, `Notification`

Solid mirrors these props. Vanilla takes the same props as a factory argument
(handle out, `.el` is the node); web-components as `<zen-notifications-inbox>`-style
attributes/properties. Divergences (Select, Toast, data-driven families) are in
SKILL.md.

### NotificationsInbox

- `notifications: Notification[]`
- `unreadCount?: number | undefined` — Override the unread count badge. Defaults to the count of notifications whose `read` is falsy.
- `onMarkAllRead?: (() => void) | undefined` — Header "Mark all as read" action. Shown when there are unread items.
- `onItemSelect?: ((notification: Notification) => void) | undefined` — Called when an individual notification row is activated (click / Enter).
- `onViewAll?: (() => void) | undefined` — Footer "View all" link. Rendered when set.
- `emptyMessage?: React.ReactNode` — Body when notifications is empty.
- `triggerLabel?: string | undefined` — aria-label for the bell trigger. Default "Notifications".
- `maxHeight?: number | undefined` — Max scrollable body height. Default 420.
- `align?: "start" | "center" | "end" | undefined` — Popover alignment. Default "end" (anchors to the right of the trigger).
- `open?: boolean | undefined` — Controlled open state.
- `onOpenChange?: ((open: boolean) => void) | undefined`
- `width?: number | undefined` — Panel width in px. Default 360.
- `badgeMax?: number | undefined` — Cap for the badge — anything above renders as `${badgeMax}+`. Default 99.
- `className?: string | undefined`
- …plus the underlying element's standard props (2 inherited).

### Notification (type)

- `id: string`
- `title: React.ReactNode`
- `description?: React.ReactNode`
- `timestamp: string | number | Date` — Accepted as Date | ISO-string | epoch-ms.
- `read?: boolean | undefined` — Treated as unread when falsy.
- `icon?: React.ReactNode` — Leading icon (overrides the default unread dot when present).
- `actions?: React.ReactNode` — Optional row of action buttons rendered below the description.
- `href?: string | undefined` — Renders the row as an <a> with this href.

### Types

- `NotificationsInboxProps` — type (see the component above)
