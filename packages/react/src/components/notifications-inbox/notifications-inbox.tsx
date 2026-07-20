import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../popover/popover";
import { cn } from "../../lib/cn";

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

const toDate = (t: Date | string | number): Date =>
  t instanceof Date ? t : new Date(t);

const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const daysBetween = (a: Date, b: Date): number =>
  Math.round(
    (startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000,
  );

const dayLabel = (d: Date, now: Date): string => {
  const diff = daysBetween(d, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) {
    return d.toLocaleDateString(undefined, { weekday: "long" });
  }
  const sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
};

const relativeTime = (d: Date, now: Date): string => {
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 45) return "just now";
  if (sec < 60 * 60) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 60 * 60 * 24) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 60 * 60 * 24 * 7) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleDateString();
};

interface Group {
  label: string;
  items: Notification[];
}

const groupByDay = (notifications: Notification[], now: Date): Group[] => {
  const groups: Group[] = [];
  for (const n of notifications) {
    const label = dayLabel(toDate(n.timestamp), now);
    const tail = groups[groups.length - 1];
    if (tail && tail.label === label) tail.items.push(n);
    else groups.push({ label, items: [n] });
  }
  return groups;
};

const NotificationsInbox = React.forwardRef<
  HTMLButtonElement,
  NotificationsInboxProps
>(
  (
    {
      notifications,
      unreadCount,
      onMarkAllRead,
      onItemSelect,
      onViewAll,
      emptyMessage = "You're all caught up.",
      triggerLabel = "Notifications",
      maxHeight = 420,
      align = "end",
      open,
      onOpenChange,
      width = 360,
      badgeMax = 99,
      className,
    },
    ref,
  ) => {
    /* Bucket the feed into day-groups once per render. `now` is captured
     * at render time so all relative-time calcs in this pass agree. */
    const now = React.useMemo(() => new Date(), [notifications]);
    const groups = React.useMemo(
      () => groupByDay(notifications, now),
      [notifications, now],
    );

    const computedUnread =
      unreadCount ?? notifications.filter((n) => !n.read).length;
    const hasUnread = computedUnread > 0;
    const badgeText =
      computedUnread > badgeMax ? `${badgeMax}+` : String(computedUnread);

    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            aria-label={
              hasUnread
                ? `${triggerLabel}, ${computedUnread} unread`
                : triggerLabel
            }
            className={cn(
              "zen-relative zen-inline-flex zen-h-10 zen-w-10 zen-items-center zen-justify-center zen-rounded-zen-full",
              "zen-text-zen-foreground zen-bg-transparent",
              "hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              "zen-transition-colors",
              className,
            )}
          >
            <BellIcon />
            {hasUnread && (
              <span
                aria-hidden
                className={cn(
                  "zen-absolute -zen-top-0.5 -zen-end-0.5 zen-inline-flex zen-items-center zen-justify-center",
                  "zen-min-w-[1.25rem] zen-h-5 zen-px-1 zen-rounded-zen-full",
                  "zen-text-[0.65rem] zen-font-semibold zen-leading-none",
                  "zen-bg-zen-error zen-text-zen-error-fg",
                  "zen-ring-2 zen-ring-zen-background",
                )}
              >
                {badgeText}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align={align}
          sideOffset={8}
          className="zen-p-0 zen-overflow-hidden"
          style={{ width }}
        >
          <div className="zen-flex zen-items-center zen-justify-between zen-px-4 zen-py-2.5 zen-border-b zen-border-zen-border">
            <h3 className="zen-text-sm zen-font-semibold zen-text-zen-foreground zen-m-0">
              {triggerLabel}
              {hasUnread && (
                <span className="zen-ml-1.5 zen-text-xs zen-font-normal zen-text-zen-muted-fg">
                  ({computedUnread})
                </span>
              )}
            </h3>
            {hasUnread && onMarkAllRead && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className={cn(
                  "zen-text-xs zen-font-medium zen-text-zen-primary",
                  "hover:zen-underline focus-visible:zen-outline-none focus-visible:zen-underline",
                  "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-p-0",
                )}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div
            role="list"
            aria-label={triggerLabel}
            style={{ maxHeight, overflowY: "auto" }}
          >
            {groups.length === 0 ? (
              <EmptyState message={emptyMessage} />
            ) : (
              groups.map((g) => (
                <section key={g.label} aria-label={g.label}>
                  <h4 className="zen-px-4 zen-pt-3 zen-pb-1 zen-text-[0.65rem] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-m-0">
                    {g.label}
                  </h4>
                  <ul className="zen-list-none zen-p-0 zen-m-0">
                    {g.items.map((n) => (
                      <Row
                        key={n.id}
                        notification={n}
                        now={now}
                        onSelect={onItemSelect}
                      />
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>

          {onViewAll && (
            <div className="zen-border-t zen-border-zen-border">
              <button
                type="button"
                onClick={onViewAll}
                className={cn(
                  "zen-block zen-w-full zen-px-4 zen-py-2.5 zen-text-center zen-text-sm zen-font-medium zen-text-zen-primary",
                  "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                  "zen-bg-transparent zen-border-0 zen-cursor-pointer",
                )}
              >
                View all
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    );
  },
);
NotificationsInbox.displayName = "NotificationsInbox";

const Row: React.FC<{
  notification: Notification;
  now: Date;
  onSelect?: (n: Notification) => void;
}> = ({ notification, now, onSelect }) => {
  const { title, description, timestamp, read, icon, actions, href } =
    notification;

  const activate = () => onSelect?.(notification);
  const interactive = !!onSelect || !!href;

  const rowContent = (
    <>
      <span
        aria-hidden
        className={cn(
          "zen-mt-1.5 zen-shrink-0 zen-flex zen-items-center zen-justify-center",
          icon ? "zen-h-5 zen-w-5 zen-text-zen-muted-fg" : "zen-h-2 zen-w-2 zen-rounded-zen-full",
          !icon && !read && "zen-bg-zen-primary",
          !icon && read && "zen-bg-transparent",
        )}
      >
        {icon}
      </span>
      <div className="zen-min-w-0 zen-flex-1">
        <div
          className={cn(
            "zen-text-sm zen-leading-snug",
            read ? "zen-text-zen-muted-fg" : "zen-font-medium zen-text-zen-foreground",
          )}
        >
          {title}
        </div>
        {description && (
          <div className="zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg zen-leading-snug">
            {description}
          </div>
        )}
        <div className="zen-mt-1 zen-flex zen-items-center zen-justify-between zen-gap-2">
          <span className="zen-text-[0.65rem] zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
            {relativeTime(toDate(timestamp), now)}
          </span>
          {actions && (
            <div className="zen-flex zen-items-center zen-gap-1.5">{actions}</div>
          )}
        </div>
      </div>
    </>
  );

  const baseClass = cn(
    "zen-flex zen-items-start zen-gap-3 zen-px-4 zen-py-2.5 zen-text-start zen-w-full",
    "zen-border-l-2",
    read ? "zen-border-transparent" : "zen-border-zen-primary zen-bg-zen-primary-soft/30",
    interactive &&
      "zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none",
  );

  return (
    <li
      role="listitem"
      aria-current={!read ? "true" : undefined}
      className="zen-border-b zen-border-zen-border last:zen-border-b-0"
    >
      {href ? (
        <a
          href={href}
          onClick={(e) => {
            // Let onSelect own navigation (e.g. router push); fall through
            // to the native href if no handler is wired.
            if (onSelect) {
              e.preventDefault();
              activate();
            }
          }}
          className={cn(baseClass, "zen-no-underline zen-text-inherit")}
        >
          {rowContent}
        </a>
      ) : interactive ? (
        <button
          type="button"
          onClick={activate}
          className={cn(baseClass, "zen-bg-transparent")}
        >
          {rowContent}
        </button>
      ) : (
        <div className={baseClass}>{rowContent}</div>
      )}
    </li>
  );
};

const EmptyState: React.FC<{ message: React.ReactNode }> = ({ message }) => (
  <div className="zen-flex zen-flex-col zen-items-center zen-justify-center zen-px-6 zen-py-10 zen-text-center">
    <span className="zen-text-zen-muted-fg/60 zen-mb-2">
      <BellIcon size={28} />
    </span>
    <p className="zen-text-sm zen-text-zen-muted-fg zen-m-0">{message}</p>
  </div>
);

const BellIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export { NotificationsInbox };
