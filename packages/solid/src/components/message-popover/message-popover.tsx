import { type JSX, createMemo, createSignal, createEffect, For, Show } from "solid-js";
import { Popover, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Icon } from "../icon/icon";
import type { IconName } from "@algorisys/zen-ui-core";
import { cn } from "../../lib/cn";

/**
 * MessagePopover — the aggregated validation summary a long form owes its user.
 *
 *   <MessagePopover messages={messages()} />
 *
 * Solid port of the React binding; see that file for the reasoning. The API is
 * identical, and so is the behaviour that matters: clicking a message closes the
 * popover and lands focus on the field it came from.
 */

/** Severity. Mirrors ObjectState minus "none" — a message always has one. */
export type MessageType = "error" | "warning" | "success" | "info";

export interface Message {
  id: string;
  type: MessageType;
  /** The message itself. Keep it short; it is a list row. */
  title: JSX.Element;
  /** Usually the field label, so the user knows WHERE the problem is. */
  subtitle?: JSX.Element;
  /** Longer explanation, shown under the title. */
  description?: JSX.Element;
  /**
   * `id` of the form control this message belongs to. When set, activating the
   * row focuses and scrolls to it.
   */
  targetId?: string;
}

export interface MessagePopoverProps {
  messages: Message[];
  onMessageSelect?: (message: Message) => void;
  /** Turn off the focus/scroll behaviour and handle it entirely yourself. */
  disableNavigation?: boolean;
  emptyMessage?: JSX.Element;
  /** Max scrollable body height. Default 320. */
  maxBodyHeight?: number;
  triggerLabel?: string;
  class?: string;
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
 * Focus and reveal the element a message points at.
 *
 * `scrollIntoView` alone leaves focus behind, so a keyboard user is taken
 * nowhere. A non-focusable target gets a temporary tabindex, removed on blur.
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

export const MessagePopover = (props: MessagePopoverProps) => {
  const [open, setOpen] = createSignal(false);
  const [filter, setFilter] = createSignal<MessageType | "all">("all");

  const counts = createMemo(() => {
    const c: Record<MessageType, number> = { error: 0, warning: 0, success: 0, info: 0 };
    for (const m of props.messages) c[m.type]++;
    return c;
  });

  const worst = () => SEVERITY.find((s) => counts()[s.type] > 0);
  const present = () => SEVERITY.filter((s) => counts()[s.type] > 0);
  const shown = createMemo(() => {
    const f = filter();
    return f === "all" ? props.messages : props.messages.filter((m) => m.type === f);
  });

  // A filter for a severity that has just disappeared would show an empty list
  // with no way back except the "All" chip, so it resets itself.
  createEffect(() => {
    const f = filter();
    if (f !== "all" && counts()[f] === 0) setFilter("all");
  });

  const label = () => {
    if (props.triggerLabel) return props.triggerLabel;
    const n = props.messages.length;
    if (n === 0) return "No messages";
    const w = worst();
    return `${n} message${n === 1 ? "" : "s"}` + (w ? `, most severe: ${w.label.toLowerCase()}` : "");
  };

  /* Where to send focus once the popover has finished closing. */
  let pendingTarget: string | null = null;

  const activate = (m: Message) => {
    props.onMessageSelect?.(m);
    if (!props.disableNavigation && m.targetId) {
      pendingTarget = m.targetId;
      setOpen(false);
    }
  };

  /*
   * Navigate in onCloseAutoFocus, not after a frame. Kobalte restores focus to
   * the trigger when the popover closes, so focusing the field any earlier is
   * undone a tick later and the user lands back on the button — measured in the
   * React binding, where the first version did exactly that. preventDefault()
   * suppresses the restoration and this hook is the only place it can be done.
   */
  const handleCloseAutoFocus = (e: Event) => {
    const target = pendingTarget;
    pendingTarget = null;
    if (!target) return;
    e.preventDefault();
    navigateTo(target);
  };

  return (
    <Popover open={open()} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label()}
        class={cn(
          "zen-inline-flex zen-items-center zen-gap-2 zen-rounded-zen-md zen-border zen-border-zen-border",
          "zen-bg-zen-background zen-px-3 zen-py-1.5 zen-text-sm zen-cursor-pointer",
          "hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          props.class,
        )}
      >
        <Icon
          name={worst()?.icon ?? "info"}
          size={16}
          class={worst()?.text ?? "zen-text-zen-muted-fg"}
        />
        <span class="zen-font-medium">{props.messages.length}</span>
      </PopoverTrigger>

      <PopoverContent
        class="zen-w-80 zen-p-0"
        {...({ onCloseAutoFocus: handleCloseAutoFocus } as Record<string, unknown>)}
      >
        <Show when={present().length > 1}>
          <div
            role="group"
            aria-label="Filter by severity"
            class="zen-flex zen-flex-wrap zen-gap-1 zen-border-b zen-border-zen-border zen-p-2"
          >
            <FilterChip active={filter() === "all"} onClick={() => setFilter("all")}>
              All {props.messages.length}
            </FilterChip>
            <For each={present()}>
              {(s) => (
                <FilterChip active={filter() === s.type} onClick={() => setFilter(s.type)}>
                  <Icon name={s.icon} size={12} class={s.text} />
                  {counts()[s.type]}
                </FilterChip>
              )}
            </For>
          </div>
        </Show>

        <div class="zen-overflow-y-auto" style={{ "max-height": `${props.maxBodyHeight ?? 320}px` }}>
          <Show
            when={shown().length > 0}
            fallback={
              <p class="zen-m-0 zen-px-4 zen-py-6 zen-text-center zen-text-sm zen-text-zen-muted-fg">
                {props.emptyMessage ?? "No messages"}
              </p>
            }
          >
            <ul class="zen-m-0 zen-list-none zen-p-0">
              <For each={shown()}>
                {(m) => {
                  const s = meta(m.type);
                  const interactive = () => !props.disableNavigation && !!m.targetId;
                  return (
                    <li class="zen-border-b zen-border-zen-border last:zen-border-b-0">
                      <button
                        type="button"
                        onClick={() => activate(m)}
                        class={cn(
                          "zen-flex zen-w-full zen-items-start zen-gap-2.5 zen-border-0 zen-bg-transparent",
                          "zen-px-4 zen-py-2.5 zen-text-start zen-text-sm",
                          "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
                          interactive()
                            ? "zen-cursor-pointer hover:zen-bg-zen-muted"
                            : "zen-cursor-default",
                        )}
                      >
                        <Icon name={s.icon} size={16} class={cn("zen-mt-0.5 zen-shrink-0", s.text)} />
                        <span class="zen-min-w-0 zen-flex-1">
                          <span class="zen-block zen-font-medium zen-text-zen-foreground">
                            {m.title}
                          </span>
                          <Show when={m.subtitle}>
                            <span class="zen-block zen-text-xs zen-text-zen-muted-fg">
                              {m.subtitle}
                            </span>
                          </Show>
                          <Show when={m.description}>
                            <span class="zen-mt-1 zen-block zen-text-xs zen-leading-relaxed zen-text-zen-muted-fg">
                              {m.description}
                            </span>
                          </Show>
                        </span>
                        <Show when={interactive()}>
                          <Icon
                            name="chevron-right"
                            size={14}
                            class="zen-mt-0.5 zen-shrink-0 zen-text-zen-muted-fg"
                          />
                        </Show>
                      </button>
                    </li>
                  );
                }}
              </For>
            </ul>
          </Show>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const FilterChip = (props: { active: boolean; onClick: () => void; children: JSX.Element }) => (
  <button
    type="button"
    aria-pressed={props.active}
    onClick={() => props.onClick()}
    class={cn(
      "zen-inline-flex zen-items-center zen-gap-1 zen-rounded-zen-full zen-border zen-px-2 zen-py-0.5",
      "zen-text-xs zen-cursor-pointer focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      props.active
        ? "zen-border-zen-primary zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg"
        : "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg hover:zen-bg-zen-muted",
    )}
  >
    {props.children}
  </button>
);
