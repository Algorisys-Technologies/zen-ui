import { Popover, type PopoverHandle } from "../popover/popover";
import { Icon } from "../icon/icon";
import type { IconName } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";
import { Disposer, type BaseProps, type ZenComponent } from "../../lib/component";

/**
 * MessagePopover — the aggregated validation summary a long form owes its user.
 *
 *   MessagePopover({ messages }).el
 *
 * Vanilla port of the React binding; see that file for the reasoning. Same API,
 * same behaviour: clicking a message closes the panel and lands focus on the
 * field it came from.
 */

/** Severity. Mirrors ObjectState minus "none" — a message always has one. */
export type MessageType = "error" | "warning" | "success" | "info";

export interface Message {
  id: string;
  type: MessageType;
  /** The message itself. Keep it short; it is a list row. */
  title: string;
  /** Usually the field label, so the user knows WHERE the problem is. */
  subtitle?: string;
  /** Longer explanation, shown under the title. */
  description?: string;
  /** `id` of the control this message belongs to; activating the row focuses it. */
  targetId?: string;
}

export interface MessagePopoverProps extends BaseProps {
  messages: Message[];
  onMessageSelect?: (message: Message) => void;
  /** Turn off the focus/scroll behaviour and handle it entirely yourself. */
  disableNavigation?: boolean;
  emptyMessage?: string;
  /** Max scrollable body height. Default 320. */
  maxBodyHeight?: number;
  triggerLabel?: string;
}

/* Severity presentation. The ORDER is the priority order: the trigger shows the
 * worst thing present, because "3 messages" is useless when one blocks submit. */
const SEVERITY: { type: MessageType; icon: IconName; label: string; text: string }[] = [
  { type: "error", icon: "error", label: "Error", text: "zen-text-zen-error" },
  { type: "warning", icon: "warn", label: "Warning", text: "zen-text-zen-warning" },
  { type: "success", icon: "check-circle", label: "Success", text: "zen-text-zen-success" },
  { type: "info", icon: "info", label: "Information", text: "zen-text-zen-info" },
];

const meta = (type: MessageType) => SEVERITY.find((s) => s.type === type)!;

/**
 * Focus and reveal the element a message points at. `scrollIntoView` alone
 * leaves focus behind, so a keyboard user is taken nowhere.
 */
const navigateTo = (targetId: string) => {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  if (el.tabIndex < 0 && !el.hasAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    el.addEventListener("blur", () => el.removeAttribute("tabindex"), { once: true });
  }
  el.focus({ preventScroll: true });
};

export function MessagePopover(props: MessagePopoverProps): ZenComponent<MessagePopoverProps> {
  let current = { ...props };
  const disposer = new Disposer();
  let filter: MessageType | "all" = "all";

  const countsOf = (messages: Message[]) => {
    const c: Record<MessageType, number> = { error: 0, warning: 0, success: 0, info: 0 };
    for (const m of messages) c[m.type]++;
    return c;
  };

  /* ---- trigger ---- */
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = cn(
    "zen-inline-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border",
    "zen-bg-zen-background zen-px-3 zen-py-1.5 zen-text-sm zen-cursor-pointer",
    "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    current.class,
  );

  const body = document.createElement("div");

  const chip = (label: string, active: boolean, icon: IconName | null, iconClass: string, onClick: () => void) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-pressed", String(active));
    b.className = cn(
      "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-px-2 zen-py-0.5",
      "zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      active
        ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
        : "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg hover:zen-bg-zen-muted",
    );
    if (icon) b.append(Icon({ name: icon, size: 12, class: iconClass }).el);
    b.append(document.createTextNode(label));
    b.addEventListener("click", onClick);
    return b;
  };

  const activate = (m: Message) => {
    current.onMessageSelect?.(m);
    if (current.disableNavigation || !m.targetId) return;
    // close() restores focus to the trigger SYNCHRONOUSLY (popover.ts doClose),
    // so navigating afterwards wins. The React and Solid bindings need their
    // primitive's onCloseAutoFocus hook for the same reason; here the ordering
    // is enough, and doing it any earlier would be undone.
    handle?.close();
    navigateTo(m.targetId);
  };

  const renderBody = () => {
    body.replaceChildren();
    const messages = current.messages ?? [];
    const counts = countsOf(messages);
    const present = SEVERITY.filter((s) => counts[s.type] > 0);
    if (filter !== "all" && counts[filter] === 0) filter = "all";

    if (present.length > 1) {
      const bar = document.createElement("div");
      bar.setAttribute("role", "group");
      bar.setAttribute("aria-label", "Filter by severity");
      bar.className = "zen-flex zen-flex-wrap zen-gap-1 zen-border-b zen-border-zen-border zen-p-2";
      bar.append(
        chip(`All ${messages.length}`, filter === "all", null, "", () => {
          filter = "all";
          renderBody();
        }),
      );
      for (const s of present) {
        bar.append(
          chip(String(counts[s.type]), filter === s.type, s.icon, s.text, () => {
            filter = s.type;
            renderBody();
          }),
        );
      }
      body.append(bar);
    }

    const scroller = document.createElement("div");
    scroller.className = "zen-overflow-y-auto";
    scroller.style.maxHeight = `${current.maxBodyHeight ?? 320}px`;

    const shown = filter === "all" ? messages : messages.filter((m) => m.type === filter);
    if (shown.length === 0) {
      const p = document.createElement("p");
      p.className = "zen-m-0 zen-px-4 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg";
      p.textContent = current.emptyMessage ?? "No messages";
      scroller.append(p);
    } else {
      const ul = document.createElement("ul");
      ul.className = "zen-m-0 zen-list-none zen-p-0";
      for (const m of shown) {
        const s = meta(m.type);
        const interactive = !current.disableNavigation && !!m.targetId;
        const li = document.createElement("li");
        li.className = "zen-border-b zen-border-zen-border last:zen-border-b-0";
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = cn(
          "zen-flex zen-w-full zen-items-start zen-gap-2.5 zen-border-0 zen-bg-transparent",
          "zen-px-4 zen-py-2.5 zen-text-start zen-text-sm",
          "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
          interactive ? "zen-cursor-pointer hover:zen-bg-zen-muted" : "zen-cursor-default",
        );
        btn.append(Icon({ name: s.icon, size: 16, class: cn("zen-mt-0.5 zen-shrink-0", s.text) }).el);

        const text = document.createElement("span");
        text.className = "zen-min-w-0 zen-flex-1";
        const title = document.createElement("span");
        title.className = "zen-block zen-font-medium zen-text-zen-foreground";
        title.textContent = m.title;
        text.append(title);
        if (m.subtitle) {
          const sub = document.createElement("span");
          sub.className = "zen-block zen-text-xs zen-text-zen-muted-fg";
          sub.textContent = m.subtitle;
          text.append(sub);
        }
        if (m.description) {
          const d = document.createElement("span");
          d.className = "zen-mt-1 zen-block zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg";
          d.textContent = m.description;
          text.append(d);
        }
        btn.append(text);
        if (interactive) {
          btn.append(
            Icon({ name: "chevron-right", size: 14, class: "zen-mt-0.5 zen-shrink-0 zen-text-zen-muted-fg" }).el,
          );
        }
        btn.addEventListener("click", () => activate(m));
        li.append(btn);
        ul.append(li);
      }
      scroller.append(ul);
    }
    body.append(scroller);
  };

  const renderTrigger = () => {
    const messages = current.messages ?? [];
    const counts = countsOf(messages);
    const worst = SEVERITY.find((s) => counts[s.type] > 0);
    trigger.replaceChildren();
    trigger.append(
      Icon({
        name: worst ? worst.icon : "info",
        size: 16,
        class: worst ? worst.text : "zen-text-zen-muted-fg",
      }).el,
    );
    const n = document.createElement("span");
    n.className = "zen-font-medium";
    n.textContent = String(messages.length);
    trigger.append(n);
    trigger.setAttribute(
      "aria-label",
      current.triggerLabel ??
        (messages.length === 0
          ? "No messages"
          : `${messages.length} message${messages.length === 1 ? "" : "s"}` +
            (worst ? `, most severe: ${worst.label.toLowerCase()}` : "")),
    );
  };

  renderTrigger();
  renderBody();

  const handle: PopoverHandle = Popover({
    trigger,
    children: body,
    align: "start",
    class: "zen-w-80 zen-p-0",
  });
  disposer.add(() => handle.destroy());

  return {
    el: handle.el,
    update(next) {
      current = { ...current, ...next };
      renderTrigger();
      renderBody();
    },
    destroy() {
      disposer.dispose();
    },
  };
}
