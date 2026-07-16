import { cn } from "../../lib/cn";
import {
  Disposer,
  toNodes,
  type AnyZenComponent,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { dismissable } from "../../lib/dismissable";
import { setPresence } from "../../lib/presence";

/**
 * Tooltip — the vanilla port of the Radix-backed React reference.
 *
 *   const tip = Tooltip({
 *     trigger: Button({ children: "Hover me" }),
 *     content: "This is a basic tooltip",
 *   });
 *   document.body.append(tip.el);   // el IS the trigger; the bubble is portalled
 *
 * ## The divergence, and why this side of it
 *
 * React exposes Radix's compound parts — `<TooltipProvider>`, `<Tooltip>`,
 * `<TooltipTrigger asChild>`, `<TooltipContent>`. That form works because of the
 * React TREE: `<TooltipContent>` finds its trigger through context without the
 * caller wiring anything, and `<TooltipProvider>` shares one delay clock across
 * every tooltip under it. With no framework there is no tree and no context, so
 * the same shape would force the caller to hand-thread the trigger into the
 * content on every use, purely to look like React — which LOOPS XXXVI forbids.
 *
 * So this takes the data: one factory that owns a trigger and a content bubble,
 * landing on the same reasoning select.ts and Solid's Select followed. The trigger
 * is `el` — a caller always holds the node here, so there is nothing to portal it
 * *out of* — and the bubble is portalled to `document.body` exactly as Radix does.
 *
 * Everything Radix supplies for free, this owns: portal, viewport-collision
 * positioning, hover/focus open with a delay, Escape and pointer-down dismissal,
 * `aria-describedby` wiring, and waiting for the exit fade before unmounting.
 *
 * ## Delay, without a Provider
 *
 * React configures the open delay on `<TooltipProvider delayDuration>`, shared by
 * every tooltip beneath it. There is no provider here, so `delayDuration` is a
 * per-tooltip prop (default 200ms). Radix's own per-tooltip override maps to the
 * same prop. Focus opens instantly, matching Radix; only pointer hover waits.
 */

export type TooltipSide = "top" | "right" | "bottom" | "left";

export interface TooltipProps {
  /** The element the bubble anchors to and opens from. It becomes `el`. */
  trigger: Node | AnyZenComponent;
  /** The bubble body. Strings become text; a component contributes its `.el`. */
  content: Child;
  /** Preferred side. Flips to the opposite side on viewport collision. Default "top". */
  side?: TooltipSide;
  /** Distance in px from the trigger. Default 6. */
  sideOffset?: number;
  /** Render a small arrow pointing at the trigger. Default false. */
  arrow?: boolean;
  /** Pointer-hover delay before opening, in ms. Default 200. Focus is instant. */
  delayDuration?: number;
  /** Controlled open state. Present -> controlled; hover only reports via onOpenChange. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Extra classes on the bubble. Wins over the defaults (cn last). */
  class?: string;
  [key: `data-${string}`]: unknown;
}

export interface TooltipHandle extends ZenComponent<TooltipProps> {
  /** Open now, bypassing the delay. No-op when controlled and already open. */
  show(): void;
  /** Close now. */
  hide(): void;
  readonly isOpen: boolean;
}

let uid = 0;

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const resolveEl = (t: Node | AnyZenComponent): HTMLElement =>
  t instanceof Node ? (t as HTMLElement) : (t.el as HTMLElement);

export function Tooltip(props: TooltipProps): TooltipHandle {
  let current: TooltipProps = { ...props };
  const contentId = `zen-tooltip-${++uid}`;
  const disposer = new Disposer();
  /** Live only while the bubble is open: listeners, dismiss layer. */
  let session: Disposer | null = null;
  let shown = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const triggerEl = resolveEl(current.trigger);

  const content = document.createElement("div");
  content.id = contentId;
  content.setAttribute("role", "tooltip");
  content.hidden = true;

  const arrow = document.createElement("span");
  arrow.setAttribute("aria-hidden", "true");
  arrow.style.position = "absolute";
  arrow.style.width = "8px";
  arrow.style.height = "8px";
  arrow.style.transform = "rotate(45deg)";
  arrow.className = "zen-bg-zen-neutral";

  const renderContent = () => {
    content.className = cn(
      "zen-z-50 zen-max-w-xs zen-px-2.5 zen-py-1.5",
      "zen-rounded-zen-md zen-bg-zen-neutral zen-text-xs zen-text-zen-neutral-fg",
      "zen-shadow-md zen-pointer-events-none",
      // Radix keys the fade on data-state; open shows, closed fades out before unmount.
      "zen-transition-opacity zen-duration-100 data-[state=closed]:zen-opacity-0",
      current.class,
    );
    // position:fixed is set imperatively during positioning; keep it off the class
    // list so a caller's class cannot fight it.
    content.style.position = "fixed";
    content.replaceChildren(...toNodes(current.content));
    if (current.arrow) content.appendChild(arrow);
    for (const [k, v] of Object.entries(current)) {
      if (k.startsWith("data-")) content.setAttribute(k, String(v));
    }
  };

  const position = () => {
    const t = triggerEl.getBoundingClientRect();
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    const gap = current.sideOffset ?? 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const space: Record<TooltipSide, number> = {
      top: t.top,
      bottom: vh - t.bottom,
      left: t.left,
      right: vw - t.right,
    };
    const need = (s: TooltipSide) => ((s === "top" || s === "bottom" ? ch : cw) + gap);

    let side: TooltipSide = current.side ?? "top";
    // Flip to the opposite side only when it actually has more room; a tooltip that
    // overflows the bottom of the screen but has no room above should stay put.
    if (space[side] < need(side) && space[OPPOSITE[side]] > space[side]) {
      side = OPPOSITE[side];
    }

    let top: number;
    let left: number;
    if (side === "top") {
      top = t.top - ch - gap;
      left = t.left + t.width / 2 - cw / 2;
    } else if (side === "bottom") {
      top = t.bottom + gap;
      left = t.left + t.width / 2 - cw / 2;
    } else if (side === "left") {
      left = t.left - cw - gap;
      top = t.top + t.height / 2 - ch / 2;
    } else {
      left = t.right + gap;
      top = t.top + t.height / 2 - ch / 2;
    }

    // Keep the bubble on screen along its cross axis (4px viewport margin).
    const m = 4;
    left = clamp(left, m, Math.max(m, vw - cw - m));
    top = clamp(top, m, Math.max(m, vh - ch - m));

    content.style.top = `${top}px`;
    content.style.left = `${left}px`;
    content.setAttribute("data-side", side);

    if (current.arrow) {
      const half = 4; // half the 8px square
      if (side === "top" || side === "bottom") {
        const ax = clamp(t.left + t.width / 2 - left - half, m, cw - 8 - m);
        arrow.style.left = `${ax}px`;
        arrow.style.right = "";
        if (side === "top") {
          arrow.style.top = "";
          arrow.style.bottom = `-${half}px`;
        } else {
          arrow.style.bottom = "";
          arrow.style.top = `-${half}px`;
        }
      } else {
        const ay = clamp(t.top + t.height / 2 - top - half, m, ch - 8 - m);
        arrow.style.top = `${ay}px`;
        arrow.style.bottom = "";
        if (side === "left") {
          arrow.style.left = "";
          arrow.style.right = `-${half}px`;
        } else {
          arrow.style.right = "";
          arrow.style.left = `-${half}px`;
        }
      }
    }
  };

  const state = controllable<boolean>({
    value: current.open,
    defaultValue: current.defaultOpen ?? false,
    onChange: (o) => current.onOpenChange?.(o),
  });

  const show = () => {
    if (shown) return;
    shown = true;
    renderContent();
    document.body.appendChild(content);
    // Set state AFTER mounting: the transition is keyed on data-state and an
    // element outside the document paints no frame.
    setPresence(content, "open");
    position();
    triggerEl.setAttribute("aria-describedby", contentId);

    session = new Disposer();
    // Follow the trigger while open: any scroll or resize moves it under the bubble.
    const reflow = () => position();
    window.addEventListener("scroll", reflow, true);
    window.addEventListener("resize", reflow);
    session.add(() => {
      window.removeEventListener("scroll", reflow, true);
      window.removeEventListener("resize", reflow);
    });
    session.add(
      dismissable(content, {
        ignore: [triggerEl],
        onDismiss: () => request(false),
      }),
    );
  };

  const hide = () => {
    if (!shown) return;
    shown = false;
    triggerEl.removeAttribute("aria-describedby");
    session?.dispose();
    session = null;
    setPresence(content, "closed", () => content.remove());
  };

  /** Ask the state to change; it reports via onOpenChange and, when uncontrolled, moves. */
  const request = (open: boolean) => {
    clearTimer();
    state.set(open);
  };

  const clearTimer = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };

  // Hover waits out delayDuration; focus is instant (Radix's contract).
  const onEnter = () => {
    clearTimer();
    timer = setTimeout(() => request(true), current.delayDuration ?? 200);
  };
  const onLeave = () => request(false);
  const onFocus = () => request(true);
  const onBlur = () => request(false);

  triggerEl.addEventListener("pointerenter", onEnter);
  triggerEl.addEventListener("pointerleave", onLeave);
  triggerEl.addEventListener("focusin", onFocus);
  triggerEl.addEventListener("focusout", onBlur);

  disposer.add(() => {
    triggerEl.removeEventListener("pointerenter", onEnter);
    triggerEl.removeEventListener("pointerleave", onLeave);
    triggerEl.removeEventListener("focusin", onFocus);
    triggerEl.removeEventListener("focusout", onBlur);
  });
  disposer.add(state.subscribe((open) => (open ? show() : hide())));
  disposer.add(clearTimer);
  disposer.add(() => session?.dispose());

  return {
    el: triggerEl,
    get isOpen() {
      return shown;
    },
    show: () => request(true),
    hide: () => request(false),
    update(next) {
      current = { ...current, ...next };
      if (next.open !== undefined) state.sync(next.open);
      if (shown) {
        renderContent();
        position();
      }
    },
    destroy() {
      clearTimer();
      disposer.dispose();
      content.remove();
    },
  };
}
