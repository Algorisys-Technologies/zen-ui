import { cn } from "../../lib/cn";
import { toNodes, type Child, type ZenComponent } from "../../lib/component";
import { Popover, type PopoverProps } from "../popover/popover";

/**
 * NotificationsInbox — bell-icon trigger that opens a Popover panel of
 * notifications grouped by day, with an unread-count badge, read/unread visual
 * states, and per-item actions.
 *
 *   const inbox = NotificationsInbox({
 *     notifications: feed,
 *     onItemSelect: (n) => router.push(n.href ?? "/"),
 *     onMarkAllRead: markAll,
 *   });
 *   document.querySelector("#shellbar").append(inbox.el);
 *   inbox.update({ notifications: nextFeed });   // no re-render: a DOM write
 *
 * Caller owns the data + mutations (mark read, dismiss, fetch more); the
 * component is a pure presentation surface over a normalised Notification[]
 * shape. Use `unreadCount` to override the badge if total unread > what's loaded
 * in `notifications` (e.g. server says 42 but the panel only shows the latest
 * 10).
 *
 * ## The port
 *
 * React composes Radix's `<Popover>` / `<PopoverTrigger asChild>` /
 * `<PopoverContent>`; vanilla composes the one `Popover` factory that already
 * absorbed that compound API (see popover.ts). The bell button is the Popover
 * `trigger`, the header/list/footer is its `children`, and `align` / `sideOffset`
 * / the panel `class` / `width` are forwarded exactly as React sets them. The
 * day-grouping, relative-time and badge-cap logic is React's, transliterated to
 * plain functions since none of it was ever framework-bound.
 */

export interface Notification {
  id: string;
  title: Child;
  description?: Child;
  /** Accepted as Date | ISO-string | epoch-ms. */
  timestamp: Date | string | number;
  /** Treated as unread when falsy. */
  read?: boolean;
  /** Leading icon (overrides the default unread dot when present). */
  icon?: Child;
  /** Optional row of action nodes rendered below the description. */
  actions?: Child;
  /** Renders the row as an <a> with this href. */
  href?: string;
}

export interface NotificationsInboxProps {
  notifications: Notification[];
  /**
   * Override the unread count badge. Defaults to the count of notifications
   * whose `read` is falsy.
   */
  unreadCount?: number;
  /** Header "Mark all as read" action. Shown when there are unread items. */
  onMarkAllRead?: () => void;
  /** Called when an individual notification row is activated (click / Enter). */
  onItemSelect?: (notification: Notification) => void;
  /** Footer "View all" link. Rendered when set. */
  onViewAll?: () => void;
  /** Body when notifications is empty. */
  emptyMessage?: Child;
  /** aria-label for the bell trigger. Default "Notifications". */
  triggerLabel?: string;
  /** Max scrollable body height, in px. Default 420. */
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
  /** Merged onto the bell trigger button, exactly as React's className is. */
  class?: string;
}

export type NotificationsInboxHandle = ZenComponent<NotificationsInboxProps>;

const toDate = (t: Date | string | number): Date =>
  t instanceof Date ? t : new Date(t);

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

/** Our own trusted SVG markup — never a caller's string. See PORTING.md. */
const bellSvg = (size: number): string =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`;

const bellIcon = (size = 18): Node => {
  const t = document.createElement("template");
  t.innerHTML = bellSvg(size);
  return t.content.firstChild!;
};

const emptyState = (message: Child): HTMLElement => {
  const wrap = document.createElement("div");
  wrap.className =
    "zen-flex zen-flex-col zen-items-center zen-justify-center zen-px-6 zen-py-10 zen-text-center";
  const bell = document.createElement("span");
  bell.className = "zen-text-zen-muted-fg/60 zen-mb-2";
  bell.append(bellIcon(28));
  const p = document.createElement("p");
  p.className = "zen-text-sm zen-text-zen-muted-fg zen-m-0";
  p.append(...toNodes(message));
  wrap.append(bell, p);
  return wrap;
};

/** One notification row — an <a>, a <button> or a <div> per its interactivity. */
const buildRow = (
  n: Notification,
  now: Date,
  onSelect?: (n: Notification) => void,
): HTMLElement => {
  const interactive = !!onSelect || !!n.href;

  const iconSpan = document.createElement("span");
  iconSpan.setAttribute("aria-hidden", "true");
  iconSpan.className = cn(
    "zen-mt-1.5 zen-shrink-0 zen-flex zen-items-center zen-justify-center",
    n.icon
      ? "zen-h-5 zen-w-5 zen-text-zen-muted-fg"
      : "zen-h-2 zen-w-2 zen-rounded-zen-full",
    !n.icon && !n.read && "zen-bg-zen-primary",
    !n.icon && n.read && "zen-bg-transparent",
  );
  if (n.icon) iconSpan.append(...toNodes(n.icon));

  const body = document.createElement("div");
  body.className = "zen-min-w-0 zen-flex-1";

  const titleEl = document.createElement("div");
  titleEl.className = cn(
    "zen-text-sm zen-leading-snug",
    n.read
      ? "zen-text-zen-muted-fg"
      : "zen-font-medium zen-text-zen-foreground",
  );
  titleEl.append(...toNodes(n.title));
  body.append(titleEl);

  if (n.description) {
    const desc = document.createElement("div");
    desc.className =
      "zen-mt-0.5 zen-text-xs zen-text-zen-muted-fg zen-leading-snug";
    desc.append(...toNodes(n.description));
    body.append(desc);
  }

  const meta = document.createElement("div");
  meta.className =
    "zen-mt-1 zen-flex zen-items-center zen-justify-between zen-gap-2";
  const time = document.createElement("span");
  time.className =
    "zen-text-[0.65rem] zen-uppercase zen-tracking-wide zen-text-zen-muted-fg";
  time.textContent = relativeTime(toDate(n.timestamp), now);
  meta.append(time);
  if (n.actions) {
    const actionsWrap = document.createElement("div");
    actionsWrap.className = "zen-flex zen-items-center zen-gap-1.5";
    actionsWrap.append(...toNodes(n.actions));
    meta.append(actionsWrap);
  }
  body.append(meta);

  const baseClass = cn(
    "zen-flex zen-items-start zen-gap-3 zen-px-4 zen-py-2.5 zen-text-left zen-w-full",
    "zen-border-l-2",
    n.read
      ? "zen-border-transparent"
      : "zen-border-zen-primary zen-bg-zen-primary-soft/30",
    interactive &&
      "zen-cursor-pointer hover:zen-bg-zen-muted focus-visible:zen-bg-zen-muted focus-visible:zen-outline-none",
  );

  let inner: HTMLElement;
  if (n.href) {
    const a = document.createElement("a");
    a.href = n.href;
    a.className = cn(baseClass, "zen-no-underline zen-text-inherit");
    a.addEventListener("click", (e) => {
      // Let onSelect own navigation (e.g. router push); fall through to the
      // native href if no handler is wired.
      if (onSelect) {
        e.preventDefault();
        onSelect(n);
      }
    });
    inner = a;
  } else if (interactive) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = cn(baseClass, "zen-bg-transparent");
    b.addEventListener("click", () => onSelect?.(n));
    inner = b;
  } else {
    const d = document.createElement("div");
    d.className = baseClass;
    inner = d;
  }
  inner.append(iconSpan, body);

  const li = document.createElement("li");
  li.setAttribute("role", "listitem");
  if (!n.read) li.setAttribute("aria-current", "true");
  li.className = "zen-border-b zen-border-zen-border last:zen-border-b-0";
  li.append(inner);
  return li;
};

export function NotificationsInbox(
  props: NotificationsInboxProps,
): NotificationsInboxHandle {
  let current: NotificationsInboxProps = { ...props };

  const trigger = document.createElement("button");
  trigger.type = "button";

  const label = () => current.triggerLabel ?? "Notifications";
  const badgeMax = () => current.badgeMax ?? 99;
  const computedUnread = () =>
    current.unreadCount ?? current.notifications.filter((n) => !n.read).length;

  /** Repaint the bell button: class, aria-label and the red unread badge. */
  const renderTrigger = (): void => {
    const unread = computedUnread();
    const hasUnread = unread > 0;

    trigger.className = cn(
      "zen-relative zen-inline-flex zen-h-10 zen-w-10 zen-items-center zen-justify-center zen-rounded-zen-full",
      "zen-text-zen-foreground zen-bg-transparent",
      "hover:zen-bg-zen-muted",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      "zen-transition-colors",
      current.class,
    );
    trigger.setAttribute(
      "aria-label",
      hasUnread ? `${label()}, ${unread} unread` : label(),
    );

    trigger.replaceChildren(bellIcon());
    if (hasUnread) {
      const badge = document.createElement("span");
      badge.setAttribute("aria-hidden", "true");
      badge.className = cn(
        "zen-absolute -zen-top-0.5 -zen-right-0.5 zen-inline-flex zen-items-center zen-justify-center",
        "zen-min-w-[1.25rem] zen-h-5 zen-px-1 zen-rounded-zen-full",
        "zen-text-[0.65rem] zen-font-semibold zen-leading-none",
        "zen-bg-zen-error zen-text-zen-error-fg",
        "zen-ring-2 zen-ring-zen-background",
      );
      badge.textContent =
        unread > badgeMax() ? `${badgeMax()}+` : String(unread);
      trigger.append(badge);
    }
  };

  /** Build the header / day-grouped list / footer that fills the popover panel. */
  const buildPanel = (): Node[] => {
    // Captured once so every relative-time calc in this pass agrees.
    const now = new Date();
    const groups = groupByDay(current.notifications, now);
    const unread = computedUnread();
    const hasUnread = unread > 0;

    const header = document.createElement("div");
    header.className =
      "zen-flex zen-items-center zen-justify-between zen-px-4 zen-py-2.5 zen-border-b zen-border-zen-border";
    const h3 = document.createElement("h3");
    h3.className =
      "zen-text-sm zen-font-semibold zen-text-zen-foreground zen-m-0";
    h3.append(document.createTextNode(label()));
    if (hasUnread) {
      const count = document.createElement("span");
      count.className =
        "zen-ml-1.5 zen-text-xs zen-font-normal zen-text-zen-muted-fg";
      count.textContent = `(${unread})`;
      h3.append(count);
    }
    header.append(h3);
    if (hasUnread && current.onMarkAllRead) {
      const markBtn = document.createElement("button");
      markBtn.type = "button";
      markBtn.className = cn(
        "zen-text-xs zen-font-medium zen-text-zen-primary",
        "hover:zen-underline focus-visible:zen-outline-none focus-visible:zen-underline",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-p-0",
      );
      markBtn.textContent = "Mark all as read";
      markBtn.addEventListener("click", () => current.onMarkAllRead?.());
      header.append(markBtn);
    }

    const list = document.createElement("div");
    list.setAttribute("role", "list");
    list.setAttribute("aria-label", label());
    list.style.maxHeight = `${current.maxHeight ?? 420}px`;
    list.style.overflowY = "auto";

    if (groups.length === 0) {
      list.append(emptyState(current.emptyMessage ?? "You're all caught up."));
    } else {
      for (const g of groups) {
        const section = document.createElement("section");
        section.setAttribute("aria-label", g.label);
        const h4 = document.createElement("h4");
        h4.className =
          "zen-px-4 zen-pt-3 zen-pb-1 zen-text-[0.65rem] zen-font-semibold zen-uppercase zen-tracking-wide zen-text-zen-muted-fg zen-m-0";
        h4.textContent = g.label;
        const ul = document.createElement("ul");
        ul.className = "zen-list-none zen-p-0 zen-m-0";
        for (const n of g.items) ul.append(buildRow(n, now, current.onItemSelect));
        section.append(h4, ul);
        list.append(section);
      }
    }

    const nodes: Node[] = [header, list];

    if (current.onViewAll) {
      const footer = document.createElement("div");
      footer.className = "zen-border-t zen-border-zen-border";
      const viewBtn = document.createElement("button");
      viewBtn.type = "button";
      viewBtn.className = cn(
        "zen-block zen-w-full zen-px-4 zen-py-2.5 zen-text-center zen-text-sm zen-font-medium zen-text-zen-primary",
        "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer",
      );
      viewBtn.textContent = "View all";
      viewBtn.addEventListener("click", () => current.onViewAll?.());
      footer.append(viewBtn);
      nodes.push(footer);
    }

    return nodes;
  };

  // `style` is forwarded by Popover through applyProps but is not named on
  // PopoverProps (it types only class/children/data-*); the assertion carries
  // the width through exactly as React's `style={{ width }}` does.
  const popoverPatch = (): Partial<PopoverProps> =>
    ({
      children: buildPanel(),
      align: current.align ?? "end",
      open: current.open,
      style: { width: `${current.width ?? 360}px` },
    }) as Partial<PopoverProps>;

  renderTrigger();

  const popover = Popover({
    trigger,
    sideOffset: 8,
    class: "zen-p-0 zen-overflow-hidden",
    onOpenChange: (o) => current.onOpenChange?.(o),
    ...popoverPatch(),
  } as PopoverProps);

  return {
    el: popover.el,
    update(next) {
      current = { ...current, ...next };
      renderTrigger();
      popover.update(popoverPatch());
    },
    destroy() {
      popover.destroy();
    },
  };
}
