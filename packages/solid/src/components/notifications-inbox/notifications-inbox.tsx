import { type JSX, For, Show, createMemo } from "solid-js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { cn } from "../../lib/cn";

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

const toDate = (t: Date | string | number): Date => (t instanceof Date ? t : new Date(t));

const startOfDay = (d: Date): Date => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const daysBetween = (a: Date, b: Date): number =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000);

const dayLabel = (d: Date, now: Date): string => {
  const diff = daysBetween(d, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString(undefined, { weekday: "long" });
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

export const NotificationsInbox = (props: NotificationsInboxProps) => {
  const now = createMemo(() => {
    void props.notifications;
    return new Date();
  });
  const groups = createMemo(() => groupByDay(props.notifications, now()));
  const computedUnread = () =>
    props.unreadCount ?? props.notifications.filter((n) => !n.read).length;
  const hasUnread = () => computedUnread() > 0;
  const badgeMax = () => props.badgeMax ?? 99;
  const badgeText = () =>
    computedUnread() > badgeMax() ? `${badgeMax()}+` : String(computedUnread());
  const triggerLabel = () => props.triggerLabel ?? "Notifications";

  return (
    <Popover open={props.open} onOpenChange={props.onOpenChange}>
      <PopoverTrigger
        aria-label={
          hasUnread()
            ? `${triggerLabel()}, ${computedUnread()} unread`
            : triggerLabel()
        }
        class={cn(
          "zen-relative zen-inline-flex zen-h-10 zen-w-10 zen-items-center zen-justify-center zen-rounded-zen-full",
          "zen-text-zen-foreground zen-bg-transparent zen-border-0 zen-cursor-pointer",
          "hover:zen-bg-zen-muted",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          "zen-transition-colors",
          props.class,
        )}
      >
        <BellIcon size={18} />
        <Show when={hasUnread()}>
          <span
            aria-hidden="true"
            class={cn(
              "zen-absolute -zen-top-0.5 -zen-end-0.5 zen-inline-flex zen-items-center zen-justify-center",
              "zen-min-w-[1.25rem] zen-h-5 zen-px-1 zen-rounded-zen-full",
              "zen-text-[0.65rem] zen-font-semibold zen-leading-none",
              "zen-bg-zen-error zen-text-zen-error-fg",
              "zen-ring-2 zen-ring-zen-background",
            )}
          >
            {badgeText()}
          </span>
        </Show>
      </PopoverTrigger>
      {/*
        Width goes on PopoverContent, not on an inner div — matching the React
        binding. PopoverContent defaults to `w-72` (288px) and clips overflow, so
        a 360px inner div was cut off mid-word. An inline style beats the class.
      */}
      <PopoverContent
        class="zen-p-0 zen-overflow-hidden"
        style={{ width: `${props.width ?? 360}px` }}
      >
        <div class="zen-flex zen-items-center zen-justify-between zen-px-4 zen-py-2.5 zen-border-b zen-border-zen-border">
          <h3 class="zen-text-sm zen-font-semibold zen-text-zen-foreground zen-m-0">
            {triggerLabel()}
            <Show when={hasUnread()}>
              <span class="zen-ml-1.5 zen-text-xs zen-font-normal zen-text-zen-muted-fg">
                ({computedUnread()})
              </span>
            </Show>
          </h3>
          <Show when={hasUnread() && props.onMarkAllRead}>
            <button
              type="button"
              onClick={props.onMarkAllRead}
              class={cn(
                "zen-text-xs zen-font-medium zen-text-zen-primary",
                "hover:zen-underline focus-visible:zen-outline-none focus-visible:zen-underline",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-p-0",
              )}
            >
              Mark all as read
            </button>
          </Show>
        </div>
        <div
          role="list"
          aria-label={triggerLabel()}
          style={{ "max-height": `${props.maxHeight ?? 420}px`, "overflow-y": "auto" }}
        >
          <Show
            when={groups().length > 0}
            fallback={
              <EmptyState
                message={props.emptyMessage ?? "You're all caught up."}
              />
            }
          >
            <For each={groups()}>
              {(g) => (
                <section aria-label={g.label}>
                  <h4 class="zen-px-4 zen-pt-3 zen-pb-1 zen-text-[0.65rem] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-m-0">
                    {g.label}
                  </h4>
                  <ul class="zen-list-none zen-p-0 zen-m-0">
                    <For each={g.items}>
                      {(n) => <Row notification={n} now={now()} onSelect={props.onItemSelect} />}
                    </For>
                  </ul>
                </section>
              )}
            </For>
          </Show>
        </div>
        <Show when={props.onViewAll}>
          <div class="zen-border-t zen-border-zen-border">
            <button
              type="button"
              onClick={props.onViewAll}
              class={cn(
                "zen-block zen-w-full zen-px-4 zen-py-2.5 zen-text-center zen-text-sm zen-font-medium zen-text-zen-primary",
                "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                "zen-bg-transparent zen-border-0 zen-cursor-pointer",
              )}
            >
              View all
            </button>
          </div>
        </Show>
      </PopoverContent>
    </Popover>
  );
};

const Row = (props: {
  notification: Notification;
  now: Date;
  onSelect?: (n: Notification) => void;
}) => {
  const n = () => props.notification;
  const interactive = () => !!props.onSelect || !!n().href;
  const activate = () => props.onSelect?.(n());
  const rowContent = (
    <>
      <span
        aria-hidden="true"
        class={cn(
          "zen-mt-1.5 zen-shrink-0 zen-flex zen-items-center zen-justify-center",
          n().icon ? "zen-h-5 zen-w-5 zen-text-zen-muted-fg" : "zen-h-2 zen-w-2 zen-rounded-zen-full",
          !n().icon && !n().read && "zen-bg-zen-primary",
          !n().icon && n().read && "zen-bg-transparent",
        )}
      >
        {n().icon}
      </span>
      <div class="zen-min-w-0 zen-flex-1">
        <div
          class={cn(
            "zen-text-sm zen-leading-snug",
            n().read ? "zen-text-zen-muted-fg" : "zen-font-medium zen-text-zen-foreground",
          )}
        >
          {n().title}
        </div>
        <Show when={n().description}>
          <div class="zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg zen-leading-snug">
            {n().description}
          </div>
        </Show>
        <div class="zen-mt-1 zen-flex zen-items-center zen-justify-between zen-gap-2">
          <span class="zen-text-[0.65rem] zen-uppercase zen-tracking-wide zen-text-zen-muted-fg">
            {relativeTime(toDate(n().timestamp), props.now)}
          </span>
          <Show when={n().actions}>
            <div class="zen-flex zen-items-center zen-gap-1.5">{n().actions}</div>
          </Show>
        </div>
      </div>
    </>
  );
  const baseClass = () =>
    cn(
      "zen-flex zen-items-start zen-gap-3 zen-px-4 zen-py-2.5 zen-text-start zen-w-full",
      "zen-border-l-2",
      n().read ? "zen-border-transparent" : "zen-border-zen-primary zen-bg-zen-primary-soft/30",
      interactive() &&
        "zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none",
    );
  return (
    <li
      role="listitem"
      aria-current={!n().read ? "true" : undefined}
      class="zen-border-b zen-border-zen-border last:zen-border-b-0"
    >
      <Show
        when={n().href}
        fallback={
          <Show
            when={interactive()}
            fallback={<div class={baseClass()}>{rowContent}</div>}
          >
            <button type="button" onClick={activate} class={cn(baseClass(), "zen-bg-transparent zen-border-0")}>
              {rowContent}
            </button>
          </Show>
        }
      >
        <a
          href={n().href}
          onClick={(e) => {
            if (props.onSelect) {
              e.preventDefault();
              activate();
            }
          }}
          class={cn(baseClass(), "zen-no-underline zen-text-inherit")}
        >
          {rowContent}
        </a>
      </Show>
    </li>
  );
};

const EmptyState = (props: { message: JSX.Element }) => (
  <div class="zen-flex zen-flex-col zen-items-center zen-justify-center zen-px-6 zen-py-10 zen-text-center">
    <span class="zen-text-zen-muted-fg/60 zen-mb-2">
      <BellIcon size={28} />
    </span>
    <p class="zen-text-sm zen-text-zen-muted-fg zen-m-0">{props.message}</p>
  </div>
);

const BellIcon = (props: { size?: number }) => (
  <svg
    width={props.size ?? 18}
    height={props.size ?? 18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
