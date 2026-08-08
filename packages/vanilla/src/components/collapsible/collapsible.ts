import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { setPresence, trackCollapsibleHeight } from "../../lib/presence";

/**
 * Collapsible — one region that shows and hides. The vanilla port of the React
 * reference.
 *
 *   const c = Collapsible({
 *     trigger: "Advanced settings",
 *     content: "Retries, timeouts and backoff.",
 *     defaultOpen: true,
 *   });
 *   document.body.append(c.el);
 *
 * Accordion is for a SET of sections that coordinate. Collapsible is the single
 * independent disclosure — a "show more" on a card, an advanced-options block.
 *
 * ## Why `trigger` / `content` rather than compound children
 *
 * Same reason Accordion takes `items`: React wires its parts through context,
 * and with no context the compound form would be
 * `CollapsibleTrigger({ root: c, … })` — a call site that can be wired wrong and
 * exists only to look like React. Taking the data is the binding's idiom.
 *
 * ## State vocabulary
 *
 * Emits React's `data-state="open" | "closed"`. See PORTING.md.
 */

export interface CollapsibleProps extends BaseProps {
  /** The clickable disclosure control. */
  trigger: Child;
  content: Child;
  /** Controlled. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

let uid = 0;

export function Collapsible(props: CollapsibleProps): ZenComponent<CollapsibleProps> {
  let current: CollapsibleProps = { ...props };
  const id = `zen-collapsible-${++uid}`;

  const el = document.createElement("div");
  const trigger = document.createElement("button");
  const content = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  trigger.type = "button";
  trigger.id = `${id}-trigger`;
  trigger.setAttribute("aria-controls", `${id}-content`);

  content.id = `${id}-content`;
  content.setAttribute("role", "region");
  content.setAttribute("aria-labelledby", `${id}-trigger`);
  content.className =
    "zen-overflow-hidden zen-text-sm data-[state=closed]:zen-anim-accordion-up data-[state=open]:zen-anim-accordion-down";

  // Publishes --zen-collapsible-content-height for core's keyframes. Radix and
  // Kobalte each publish it under their own prefix and their binding maps it
  // across; with no primitive library, this binding measures it.
  const height = trackCollapsibleHeight(content);
  disposer.add(() => height.dispose());

  const state = controllable<boolean>({
    value: current.open,
    defaultValue: current.defaultOpen ?? false,
    onChange: (v) => current.onOpenChange?.(v),
  });

  /**
   * The content is `hidden` while closed, not removed: this binding animates the
   * exit, and a node taken out of the document never renders a frame of it. That
   * is what setPresence's `done` callback is for.
   */
  const paint = () => {
    const isOpen = state.get();
    el.setAttribute("data-state", isOpen ? "open" : "closed");
    trigger.setAttribute("data-state", isOpen ? "open" : "closed");
    trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      content.hidden = false;
      setPresence(content, "open");
    } else {
      setPresence(content, "closed", () => {
        content.hidden = true;
      });
    }
  };

  const onClick = () => {
    if (current.disabled) return;
    state.set(!state.get());
    paint();
  };
  trigger.addEventListener("click", onClick);
  disposer.add(() => trigger.removeEventListener("click", onClick));

  const render = () => {
    const {
      class: className,
      trigger: triggerChild,
      content: contentChild,
      open: _open,
      defaultOpen: _defaultOpen,
      onOpenChange: _onOpenChange,
      disabled,
      children: _children,
      ...rest
    } = current;

    el.className = cn(className);

    trigger.className = cn(
      "zen-bg-transparent zen-border-0 zen-p-0 zen-text-inherit zen-cursor-pointer",
      "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 zen-rounded-zen-sm",
    );
    trigger.disabled = Boolean(disabled);
    if (disabled) trigger.setAttribute("data-disabled", "");
    else trigger.removeAttribute("data-disabled");

    trigger.replaceChildren(...toNodes(triggerChild));
    content.replaceChildren(...toNodes(contentChild));

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  el.append(trigger, content);
  render();
  // Closed content must start hidden without animating an exit nobody watched.
  if (!state.get()) content.hidden = true;
  paint();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      // A controlled caller drives `open` through update(). `sync` is the way in:
      // `set` reports the request and then refuses to write when controlled, so
      // using it here would leave the component painting its old state forever.
      state.sync(next.open);
      render();
      paint();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
