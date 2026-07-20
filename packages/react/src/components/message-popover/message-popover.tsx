import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Icon } from "../icon/icon";
import type { IconName } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * MessagePopover — the aggregated validation summary a long form owes its user.
 *
 *   <MessagePopover messages={messages} />
 *
 * A form with twenty fields and three errors makes the user hunt for them. This
 * collects the messages into one button, counts them by severity, and lets the
 * user click one to be taken to the field it came from.
 *
 * The severity vocabulary is `ObjectState`'s, deliberately — the same four words
 * Alert, Banner and ObjectStatus already use — so a message reads the same
 * wherever it is rendered. There is no fifth kind of "error" in this library.
 *
 * WHAT THE CALLER OWNS: the messages. This does not read your form, subscribe to
 * a validation library, or decide when a field is invalid — it renders a list
 * you give it. That keeps it usable with react-hook-form, with the FormBuilder
 * in this package, or with a hand-rolled `useState` of errors.
 *
 * NAVIGATION: give a message a `targetId` and clicking it focuses and scrolls to
 * that element, which is the behaviour that makes the component worth having.
 * `onMessageSelect` overrides it if you need to open an accordion or switch a
 * tab first.
 */

/** Severity. Mirrors ObjectState minus "none" — a message always has one. */
export type MessageType = "error" | "warning" | "success" | "info";

export interface Message {
  id: string;
  type: MessageType;
  /** The message itself. Keep it short; it is a list row. */
  title: React.ReactNode;
  /** Usually the field label, so the user knows WHERE the problem is. */
  subtitle?: React.ReactNode;
  /** Longer explanation, shown under the title. */
  description?: React.ReactNode;
  /**
   * `id` of the form control this message belongs to. When set, activating the
   * row focuses and scrolls to it. The element does not need to be focusable —
   * a `tabindex="-1"` is applied for the duration if it is not.
   */
  targetId?: string;
}

export interface MessagePopoverProps {
  messages: Message[];
  /**
   * Called when a row is activated. Return nothing and the default navigation
   * still runs; the two are additive, so you can open a tab AND land on the
   * field.
   */
  onMessageSelect?: (message: Message) => void;
  /** Turn off the focus/scroll behaviour and handle it entirely yourself. */
  disableNavigation?: boolean;
  /** Shown when `messages` is empty. */
  emptyMessage?: React.ReactNode;
  /** Max scrollable body height. Default 320. */
  maxBodyHeight?: number;
  /** aria-label for the trigger. Default describes the counts. */
  triggerLabel?: string;
  className?: string;
}

/* Severity presentation, in one place. The ORDER is the priority order: the
 * trigger shows the worst thing present, because "3 messages" is useless when
 * one of them blocks submission. */
const SEVERITY: {
  type: MessageType;
  icon: IconName;
  label: string;
  plural: string;
  text: string;
  soft: string;
}[] = [
  { type: "error", icon: "error", label: "Error", plural: "Errors", text: "zen-text-zen-error", soft: "zen-bg-zen-error-soft" },
  { type: "warning", icon: "warn", label: "Warning", plural: "Warnings", text: "zen-text-zen-warning", soft: "zen-bg-zen-warning-soft" },
  { type: "success", icon: "check-circle", label: "Success", plural: "Successes", text: "zen-text-zen-success", soft: "zen-bg-zen-success-soft" },
  { type: "info", icon: "info", label: "Information", plural: "Information", text: "zen-text-zen-info", soft: "zen-bg-zen-info-soft" },
];

const meta = (type: MessageType) => SEVERITY.find((s) => s.type === type)!;

/**
 * Focus and reveal the element a message points at.
 *
 * `scrollIntoView` alone leaves focus behind, so a keyboard user is taken
 * nowhere — the whole point is to move the caret to the broken field. A
 * non-focusable target gets a temporary tabindex, removed on blur so the DOM is
 * left as it was found.
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

const MessagePopover = React.forwardRef<HTMLButtonElement, MessagePopoverProps>(
  (
    {
      messages,
      onMessageSelect,
      disableNavigation = false,
      emptyMessage = "No messages",
      maxBodyHeight = 320,
      triggerLabel,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [filter, setFilter] = React.useState<MessageType | "all">("all");

    const counts = React.useMemo(() => {
      const c: Record<MessageType, number> = { error: 0, warning: 0, success: 0, info: 0 };
      for (const m of messages) c[m.type]++;
      return c;
    }, [messages]);

    /* The worst severity present, which is what the trigger reports. */
    const worst = SEVERITY.find((s) => counts[s.type] > 0);
    const present = SEVERITY.filter((s) => counts[s.type] > 0);

    const shown = React.useMemo(
      () => (filter === "all" ? messages : messages.filter((m) => m.type === filter)),
      [messages, filter],
    );

    // A filter for a severity that has just disappeared would show an empty
    // list with no way back except the "All" chip, so it resets itself.
    React.useEffect(() => {
      if (filter !== "all" && counts[filter] === 0) setFilter("all");
    }, [counts, filter]);

    const label =
      triggerLabel ??
      (messages.length === 0
        ? "No messages"
        : `${messages.length} message${messages.length === 1 ? "" : "s"}` +
          (worst ? `, most severe: ${meta(worst.type).label.toLowerCase()}` : ""));

    /* Where to send focus once the popover has finished closing. */
    const pendingTarget = React.useRef<string | null>(null);

    const activate = (m: Message) => {
      onMessageSelect?.(m);
      if (!disableNavigation && m.targetId) {
        pendingTarget.current = m.targetId;
        setOpen(false);
      }
    };

    /*
     * Navigate in onCloseAutoFocus, not after a rAF.
     *
     * Radix restores focus to the trigger when the popover closes, and it does
     * so AFTER a frame — so focusing the field on rAF worked for one tick and
     * was then undone, landing the user back on the button. Measured: the first
     * version of this put document.activeElement on the trigger, not the field.
     *
     * preventDefault() is what suppresses that restoration, and this hook is the
     * only place it can be done, so the navigation belongs here rather than in
     * the click handler.
     */
    const handleCloseAutoFocus = (e: Event) => {
      const target = pendingTarget.current;
      pendingTarget.current = null;
      if (!target) return;
      e.preventDefault();
      navigateTo(target);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            ref={ref}
            type="button"
            aria-label={label}
            className={cn(
              "zen-inline-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border",
              "zen-bg-zen-background zen-px-3 zen-py-1.5 zen-text-sm zen-cursor-pointer",
              "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              className,
            )}
          >
            <Icon
              name={worst ? meta(worst.type).icon : "info"}
              size={16}
              className={worst ? meta(worst.type).text : "zen-text-zen-muted-fg"}
            />
            <span className="zen-font-medium">{messages.length}</span>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="zen-w-80 zen-p-0"
          onCloseAutoFocus={handleCloseAutoFocus}
        >
          {present.length > 1 ? (
            <div
              role="group"
              aria-label="Filter by severity"
              className="zen-flex zen-flex-wrap zen-gap-1 zen-border-b zen-border-zen-border zen-p-2"
            >
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
                All {messages.length}
              </FilterChip>
              {present.map((s) => (
                <FilterChip
                  key={s.type}
                  active={filter === s.type}
                  onClick={() => setFilter(s.type)}
                >
                  <Icon name={s.icon} size={12} className={s.text} />
                  {counts[s.type]}
                </FilterChip>
              ))}
            </div>
          ) : null}

          <div className="zen-overflow-y-auto" style={{ maxHeight: maxBodyHeight }}>
            {shown.length === 0 ? (
              <p className="zen-m-0 zen-px-4 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
                {emptyMessage}
              </p>
            ) : (
              <ul className="zen-m-0 zen-list-none zen-p-0">
                {shown.map((m) => {
                  const s = meta(m.type);
                  const interactive = !disableNavigation && !!m.targetId;
                  return (
                    <li key={m.id} className="zen-border-b zen-border-zen-border last:zen-border-b-0">
                      <button
                        type="button"
                        onClick={() => activate(m)}
                        className={cn(
                          "zen-flex zen-w-full zen-items-start zen-gap-2.5 zen-border-0 zen-bg-transparent",
                          "zen-px-4 zen-py-2.5 zen-text-start zen-text-sm",
                          "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                          interactive ? "zen-cursor-pointer hover:zen-bg-zen-muted" : "zen-cursor-default",
                        )}
                      >
                        <Icon name={s.icon} size={16} className={cn("zen-mt-0.5 zen-shrink-0", s.text)} />
                        <span className="zen-min-w-0 zen-flex-1">
                          <span className="zen-block zen-font-medium zen-text-zen-foreground">
                            {m.title}
                          </span>
                          {m.subtitle ? (
                            <span className="zen-block zen-text-xs zen-text-zen-muted-fg">
                              {m.subtitle}
                            </span>
                          ) : null}
                          {m.description ? (
                            <span className="zen-mt-1 zen-block zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg">
                              {m.description}
                            </span>
                          ) : null}
                        </span>
                        {interactive ? (
                          <Icon
                            name="chevron-right"
                            size={14}
                            className="zen-mt-0.5 zen-shrink-0 zen-text-zen-muted-fg"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
MessagePopover.displayName = "MessagePopover";

const FilterChip = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={cn(
      "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-px-2 zen-py-0.5",
      "zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      active
        ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
        : "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg hover:zen-bg-zen-muted",
    )}
  >
    {children}
  </button>
);

export { MessagePopover };
