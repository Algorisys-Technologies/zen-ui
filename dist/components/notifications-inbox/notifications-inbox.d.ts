import { type JSX } from "solid-js";
/**
 * NotificationsInbox — Solid port. Bell trigger that opens a Popover
 * panel with notifications grouped by day, unread-count badge,
 * read/unread visual states, optional per-item actions.
 */
export interface Notification {
    id: string;
    title: JSX.Element;
    description?: JSX.Element;
    timestamp: Date | string | number;
    read?: boolean;
    icon?: JSX.Element;
    actions?: JSX.Element;
    href?: string;
}
export type NotificationsInboxProps = {
    notifications: Notification[];
    unreadCount?: number;
    onMarkAllRead?: () => void;
    onItemSelect?: (notification: Notification) => void;
    onViewAll?: () => void;
    emptyMessage?: JSX.Element;
    triggerLabel?: string;
    maxHeight?: number;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    width?: number;
    badgeMax?: number;
    class?: string;
};
export declare const NotificationsInbox: (props: NotificationsInboxProps) => JSX.Element;
//# sourceMappingURL=notifications-inbox.d.ts.map