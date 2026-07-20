import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  type BaseProps,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { setPresence, trackCollapsibleHeight, type CollapsibleHeight } from "../../lib/presence";
import { rovingFocus } from "../../lib/roving-focus";

/**
 * Accordion — the vanilla port of the React reference.
 *
 *   const acc = Accordion({
 *     type: "single",
 *     collapsible: true,
 *     defaultValue: "basic",
 *     items: [
 *       { value: "basic", trigger: "Basic info", content: "…" },
 *       { value: "address", trigger: "Address", content: "…" },
 *     ],
 *   });
 *
 * ## Why `items` rather than compound children
 *
 * React composes `<AccordionItem>/<AccordionTrigger>/<AccordionContent>` and wires
 * them through context. Context is what makes that work: a trigger deep in the
 * tree finds its root without being handed anything. With no context there are
 * only two honest options — thread the root into every sub-part by hand at the
 * call site, or take the data. The compound form here would be
 * `AccordionItem({ root: acc, … })`, which is worse than what it replaces: it
 * gives the caller a chance to wire it wrong, and it exists only to look like
 * React. So this takes the data, exactly as Solid's Select does for the same
 * reason (see check-parity's DIVERGENT list — this is that kind of decision, and
 * it belongs on that list).
 *
 * ## State vocabulary
 *
 * Emits React's `data-state="open" | "closed"`. See PORTING.md.
 */

export interface AccordionItemSpec {
  value: string;
  /** The clickable header. */
  trigger: string | Node;
  content: string | Node;
  disabled?: boolean;
}

export interface AccordionProps extends BaseProps {
  items: AccordionItemSpec[];
  /** "single": one open at a time. "multiple": any number. Default "single". */
  type?: "single" | "multiple";
  /** single only: allow closing the open item. Default false, matching Radix. */
  collapsible?: boolean;
  /** Controlled. A string for "single", string[] for "multiple". */
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

const CHEVRON = `<svg class="zen-acc-chevron zen-transition-transform zen-duration-200 zen-text-zen-muted-fg zen-flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>`;

let uid = 0;

export function Accordion(props: AccordionProps): ZenComponent<AccordionProps> {
  let current: AccordionProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const multiple = () => current.type === "multiple";

  /** Normalised to a Set internally; the caller's shape is restored on the way out. */
  const toSet = (v: string | string[] | undefined): Set<string> =>
    v === undefined ? new Set() : new Set(Array.isArray(v) ? v : v ? [v] : []);

  const fromSet = (s: Set<string>): string | string[] =>
    multiple() ? [...s] : ([...s][0] ?? "");

  const state = controllable<Set<string>>({
    value: current.value === undefined ? undefined : toSet(current.value),
    defaultValue: toSet(current.defaultValue),
    onChange: (s) => current.onValueChange?.(fromSet(s)),
    // Sets are compared by identity by default, so every toggle would look like a
    // change to the same object and the callback would fire forever.
    equals: (a, b) => a.size === b.size && [...a].every((v) => b.has(v)),
  });

  /**
   * Real references, held rather than re-queried. `trigger.closest("[data-state]")`
   * looks like the way to the wrapper and is not: the trigger carries data-state
   * itself, so closest() returns the trigger and every wrapper update silently
   * writes to the wrong element.
   */
  interface ItemRefs {
    value: string;
    wrapper: HTMLDivElement;
    trigger: HTMLButtonElement;
    content: HTMLDivElement;
    height: CollapsibleHeight;
  }
  let refs: ItemRefs[] = [];
  const cleanups = new Disposer();

  const render = () => {
    const { items, class: className, type: _t, collapsible: _c, value: _v, defaultValue: _dv, onValueChange: _ov, children: _ch, ...rest } = current;

    cleanups.dispose();
    refs = [];
    el.className = cn(className);
    el.replaceChildren();

    const open = state.get();

    for (const item of items) {
      const id = `zen-acc-${++uid}`;
      const isOpen = open.has(item.value);

      const wrapper = document.createElement("div");
      wrapper.className = "zen-border-b zen-border-zen-border last:zen-border-b-0";
      wrapper.setAttribute("data-state", isOpen ? "open" : "closed");

      const header = document.createElement("h3");
      header.className = "zen-flex";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.id = `${id}-trigger`;
      trigger.className = cn(
        "zen-flex zen-flex-1 zen-items-center zen-justify-between zen-gap-2",
        "zen-py-3 zen-px-1 zen-text-sm zen-font-medium zen-text-start",
        "zen-bg-transparent zen-border-0 zen-cursor-pointer",
        "zen-transition-colors hover:zen-text-zen-foreground",
        "zen-text-zen-foreground",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset zen-rounded-zen-sm",
        "[&[data-state=open]>svg.zen-acc-chevron]:zen-rotate-180",
      );
      trigger.setAttribute("data-state", isOpen ? "open" : "closed");
      trigger.setAttribute("aria-expanded", String(isOpen));
      trigger.setAttribute("aria-controls", `${id}-content`);
      if (item.disabled) {
        trigger.disabled = true;
        trigger.setAttribute("data-disabled", "");
      }
      trigger.append(
        ...(typeof item.trigger === "string" ? [document.createTextNode(item.trigger)] : [item.trigger]),
      );
      const chev = document.createElement("template");
      chev.innerHTML = CHEVRON;
      trigger.append(chev.content.firstChild!);

      const content = document.createElement("div");
      content.id = `${id}-content`;
      content.setAttribute("role", "region");
      content.setAttribute("aria-labelledby", `${id}-trigger`);
      content.className =
        "zen-overflow-hidden zen-text-sm data-[state=closed]:zen-anim-accordion-up data-[state=open]:zen-anim-accordion-down";
      content.setAttribute("data-state", isOpen ? "open" : "closed");
      if (!isOpen) content.hidden = true;

      const inner = document.createElement("div");
      inner.className = "zen-pb-3 zen-px-1 zen-pt-0 zen-text-zen-foreground";
      inner.append(
        ...(typeof item.content === "string" ? [document.createTextNode(item.content)] : [item.content]),
      );
      content.append(inner);

      // Publishes --zen-collapsible-content-height, which core's keyframes
      // interpolate to. Radix and Kobalte each publish this under their own
      // prefix and their binding maps it across; with no primitive library, this
      // binding measures it.
      const height = trackCollapsibleHeight(content);
      cleanups.add(() => height.dispose());

      const onClick = () => {
        const next = new Set(state.get());
        const wasOpen = next.has(item.value);
        if (wasOpen) {
          // single + !collapsible: the open item cannot be closed, matching Radix.
          if (!multiple() && !current.collapsible) return;
          next.delete(item.value);
        } else {
          if (!multiple()) next.clear();
          next.add(item.value);
        }
        state.set(next);
      };
      trigger.addEventListener("click", onClick);
      cleanups.add(() => trigger.removeEventListener("click", onClick));

      header.append(trigger);
      wrapper.append(header, content);
      el.append(wrapper);
      refs.push({ value: item.value, wrapper, trigger, content, height });
    }

    // A disabled trigger is not navigable; re-read every key, since `items` and
    // their disabled flags can change under update().
    cleanups.add(
      rovingFocus(el, {
        items: () => refs.map((r) => r.trigger).filter((t) => !t.disabled),
        orientation: "vertical",
      }),
    );

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  /**
   * Toggling re-reads state rather than re-rendering the whole list: a full
   * re-render would replace the content element mid-animation, and the exit
   * animation would never draw a frame.
   */
  const paint = (open: Set<string>) => {
    for (const { value, wrapper, trigger, content, height } of refs) {
      const isOpen = open.has(value);

      trigger.setAttribute("data-state", isOpen ? "open" : "closed");
      trigger.setAttribute("aria-expanded", String(isOpen));
      wrapper.setAttribute("data-state", isOpen ? "open" : "closed");

      if (isOpen) {
        // Re-read the natural height BEFORE the animation starts. The content may
        // have changed size since it was last measured, and the keyframe reads the
        // var at the moment it runs.
        height.measure();
        content.hidden = false;
        setPresence(content, "open");
      } else {
        setPresence(content, "closed", () => {
          // Re-check: the user may have re-opened it during the 200ms exit, in
          // which case hiding it now would erase a section that is on screen.
          if (content.getAttribute("data-state") === "closed") content.hidden = true;
        });
      }
    }
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      const structural = next.items !== undefined || next.type !== undefined;
      current = { ...current, ...next };
      if (next.value !== undefined) state.sync(toSet(next.value));
      if (structural) render();
      paint(state.get());
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
