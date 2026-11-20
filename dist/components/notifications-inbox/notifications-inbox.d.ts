import * as React from "react";
/**
 * NotificationsInbox — bell icon trigger that opens a Popover panel of
 * notifications grouped by day, with an unread-count badge, read/
 * unread visual states, and per-item actions.
 *
 *   <NotificationsInbox
 *     notifications={feed}
 *     onItemSelect={(n) => router.push(n.href ?? "/")}
 *     onMarkAllRead={markAll}
 *   />
 *
 * Caller owns the data + mutations (mark read, dismiss, fetch more);
 * the component is a pure presentation surface over a normalised
 * Notification[] shape. Use `unreadCount` to override the badge if
 * total unread > what's loaded in `notifications` (e.g. server says
 * 42 but the panel only shows the latest 10).
 */
export interface Notification {
    id: string;
    title: React.ReactNode;
    description?: React.ReactNode;
    /** Accepted as Date | ISO-string | epoch-ms. */
    timestamp: Date | string | number;
    /** Treated as unread when falsy. */
    read?: boolean;
    /** Leading icon (overrides the default unread dot when present). */
    icon?: React.ReactNode;
    /** Optional row of action buttons rendered below the description. */
    actions?: React.ReactNode;
    /** Renders the row as an <a> with this href. */
    href?: string;
}
export interface NotificationsInboxProps {
    notifications: Notification[];
    /**
     * Override the unread count badge. Defaults to the count of
     * notifications whose `read` is falsy.
     */
    unreadCount?: number;
    /** Header "Mark all as read" action. Shown when there are unread items. */
    onMarkAllRead?: () => void;
    /** Called when an individual notification row is activated (click / Enter). */
    onItemSelect?: (notification: Notification) => void;
    /** Footer "View all" link. Rendered when set. */
    onViewAll?: () => void;
    /** Body when notifications is empty. */
    emptyMessage?: React.ReactNode;
    /** aria-label for the bell trigger. Default "Notifications". */
    triggerLabel?: string;
    /** Max scrollable body height. Default 420. */
    maxHeight?: number;
    /** Popover alignment. Default "end" (anchors to the right of the trigger). */
    align?: "start" | "center" | "end";
    /** Controlled open state. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Panel width in px. Default 360. */
    width?: number;
    /** Cap for the badge — anything above renders as `${badgeMax}+`. Default 99. */
    badgeMax?: number;
    className?: string;
}
declare const NotificationsInbox: React.ForwardRefExoticComponent<NotificationsInboxProps & React.RefAttributes<HTMLButtonElement>>;
export { NotificationsInbox };
//# sourceMappingURL=notifications-inbox.d.ts.map