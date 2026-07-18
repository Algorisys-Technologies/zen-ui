import { NotificationsInbox, type NotificationsInboxProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

// Bell trigger + popover panel, data-driven from `notifications`. That primary
// collection is authorable inline as JSON or set as `el.notifications = [...]`.
// `open` is a controlled boolean -> a JS property.
defineZenElement<NotificationsInboxProps>({
  tag: "zen-notifications-inbox",
  factory: NotificationsInbox,
  attrs: {
    notifications: "json",
    "unread-count": "number",
    "trigger-label": "string",
    "max-height": "number",
    align: "string",
    width: "number",
    "badge-max": "number",
  },
  props: ["notifications", "emptyMessage", "open"],
  events: {
    onMarkAllRead: "zen-mark-all-read",
    onItemSelect: "zen-item-select",
    onViewAll: "zen-view-all",
    onOpenChange: "zen-open-change",
  },
  childrenProp: false,
});
