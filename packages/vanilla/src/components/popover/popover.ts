import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { dismissable } from "../../lib/dismissable";
import { portal } from "../../lib/portal";
import { setPresence } from "../../lib/presence";

/**
 * Popover — an anchored panel on a trigger.
 *
 *   const pop = Popover({
 *     trigger: Button({ variant: "outline", children: "Open" }),
 *     children: profilePanel,
 *     side: "bottom",
 *     align: "center",
 *   });
 *   document.body.append(pop.el);
 *
 * Radix supplies positioning, collision detection, click-outside dismissal,
 * Escape-to-close and ARIA to the React binding. With no primitive library this
 * one writes them: `portal` mounts the panel to <body> (so no ancestor's
 * `overflow`/`transform`/`z-index` can clip or trap it), `dismissable` gives
 * Escape + click-outside, and the placement/flip logic below is what Radix's
 * floating middleware did.
 *
 * ## The divergence, and why this side of it
 *
 * React exposes Radix's compound parts — `<Popover>` / `<PopoverTrigger asChild>` /
 * `<PopoverContent>` / `<PopoverAnchor>` — wired to each other through React
 * context. With no framework there is no tree and no context, so the same shape
 * would force the caller to hand-thread the root into every part
 * (`PopoverContent({ root: pop })`) purely to look like React. That is
 * syntax-porting, which LOOPS XXXVI forbids, and it is the same call `select.ts`
 * made against the same primitive.
 *
 * So this takes the parts as data on one factory. Every capability of the
 * compound API survives: `trigger` is React's `PopoverTrigger` (any element or
 * component, the `asChild` case is the only case here), `children` is
 * `PopoverContent`, and `anchor` is `PopoverAnchor` — a separate element to
 * position against, so a button can open a panel that hangs off the field it
 * belongs to. `class` merges onto the content panel, exactly as React's
 * `PopoverContent className` does.
 *
 * These exports belong on check-parity's DIVERGENT list for the same reason
 * Select's do.
 */

export type PopoverSide = "top" | "right" | "bottom" | "left";
export type PopoverAlign = "start" | "center" | "end";

export interface PopoverProps {
  /** The element that opens the panel; also the default anchor. React's PopoverTrigger. */
  trigger: Child;
  /** The panel body. React's PopoverContent children. */
  children?: Child;
  /** Position against this instead of the trigger. React's PopoverAnchor. */
  anchor?: Child;
  /** Preferred side. Flips to the opposite when it would leave the viewport. Default "bottom". */
  side?: PopoverSide;
  /** Alignment along the chosen side. Default "center". */
  align?: PopoverAlign;
  /** Gap between the anchor and the panel, in px. Default 4. */
  sideOffset?: number;
  /** Controlled open state. Present -> the caller owns it. */
  open?: boolean;
  /** Uncontrolled initial state. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Merged onto the content panel. React's PopoverContent className. */
  class?: string;
  id?: string;
  [key: `data-${string}`]: unknown;
}

export interface PopoverHandle extends ZenComponent<PopoverProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

/** Distance the panel is kept from the viewport edge when collision-clamped. */
const VIEWPORT_PADDING = 8;

const OPPOSITE: Record<PopoverSide, PopoverSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

let uid = 0;

/** Pull the interactive element out of a trigger/anchor child (a component's `.el` or a raw node). */
function elementOf(child: Child, role: string): HTMLElement {
  const el = toNodes(child).find((n): n is HTMLElement => n instanceof HTMLElement);
  if (!el) throw new Error(`Popover ${role} must render an element`);
  return el;
}

export function Popover(props: PopoverProps): PopoverHandle {
  let current: PopoverProps = { ...props };
  const id = current.id ?? `zen-popover-${++uid}`;

  const p = portal();

  // The wrapper stays inline where the caller drops it and holds the anchor (if
  // any) and the trigger. The panel itself lives in the portal, not here.
  const wrapper = document.createElement("span");
  wrapper.className = "zen-inline-flex zen-items-center zen-gap-2";

  const anchorEl = current.anchor ? elementOf(current.anchor, "anchor") : null;
  const triggerEl = elementOf(current.trigger, "trigger");

  triggerEl.setAttribute("aria-haspopup", "dialog");
  triggerEl.setAttribute("aria-expanded", "false");
  triggerEl.setAttribute("aria-controls", id);
  triggerEl.setAttribute("data-state", "closed");
  if (anchorEl) wrapper.append(anchorEl);
  wrapper.append(triggerEl);

  const content = document.createElement("div");
  content.id = id;
  content.setAttribute("role", "dialog");
  content.tabIndex = -1;
  // Positioned in viewport coordinates, which is exactly what getBoundingClientRect
  // returns — so no scroll-offset bookkeeping. The panel is portalled to <body>,
  // so `fixed` also escapes any clipping/transform ancestor.
  content.style.position = "fixed";
  content.style.margin = "0";

  let removeProps: (() => void) | undefined;

  const renderContent = () => {
    const { class: className, children, ...rest } = current;
    // These are consumed by the factory, never forwarded to the panel element.
    delete (rest as Record<string, unknown>).trigger;
    delete (rest as Record<string, unknown>).anchor;
    delete (rest as Record<string, unknown>).side;
    delete (rest as Record<string, unknown>).align;
    delete (rest as Record<string, unknown>).sideOffset;
    delete (rest as Record<string, unknown>).open;
    delete (rest as Record<string, unknown>).defaultOpen;
    delete (rest as Record<string, unknown>).onOpenChange;

    content.className = cn(
      "zen-z-50 zen-w-72 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-p-4 zen-text-zen-foreground zen-shadow-md zen-outline-none",
      className,
    );
    content.replaceChildren(...toNodes(children));

    removeProps?.();
    removeProps = applyProps(content, rest as Record<string, unknown>);
    // applyProps must not clobber the identity/position the factory owns.
    content.id = id;
    content.style.position = "fixed";
  };

  /**
   * Place the panel against the anchor for the preferred side, flipping to the
   * opposite side when the preferred one would run off-screen, then clamping the
   * cross-axis into the viewport. This is Radix's floating middleware at the size
   * this library needs.
   */
  const reposition = () => {
    const anchor = anchorEl ?? triggerEl;
    const a = anchor.getBoundingClientRect();
    const cw = content.offsetWidth;
    const ch = content.offsetHeight;
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const offset = current.sideOffset ?? 4;
    const align: PopoverAlign = current.align ?? "center";

    const fits = (s: PopoverSide): boolean => {
      if (s === "top") return a.top - offset - ch >= VIEWPORT_PADDING;
      if (s === "bottom") return a.bottom + offset + ch <= vh - VIEWPORT_PADDING;
      if (s === "left") return a.left - offset - cw >= VIEWPORT_PADDING;
      return a.right + offset + cw <= vw - VIEWPORT_PADDING;
    };

    let side: PopoverSide = current.side ?? "bottom";
    if (!fits(side) && fits(OPPOSITE[side])) side = OPPOSITE[side];

    let top: number;
    let left: number;
    if (side === "top" || side === "bottom") {
      top = side === "top" ? a.top - offset - ch : a.bottom + offset;
      left =
        align === "start" ? a.left : align === "end" ? a.right - cw : a.left + a.width / 2 - cw / 2;
    } else {
      left = side === "left" ? a.left - offset - cw : a.right + offset;
      top =
        align === "start" ? a.top : align === "end" ? a.bottom - ch : a.top + a.height / 2 - ch / 2;
    }

    left = Math.max(VIEWPORT_PADDING, Math.min(left, vw - cw - VIEWPORT_PADDING));
    top = Math.max(VIEWPORT_PADDING, Math.min(top, vh - ch - VIEWPORT_PADDING));

    content.style.left = `${left}px`;
    content.style.top = `${top}px`;
    content.dataset.side = side;
    content.dataset.align = align;
  };

  let mounted = false;
  let session: Disposer | null = null;

  const state = controllable<boolean>({
    value: current.open,
    defaultValue: current.defaultOpen ?? false,
    onChange: (o) => current.onOpenChange?.(o),
  });

  const doOpen = () => {
    if (mounted) return;
    mounted = true;
    renderContent();
    p.mount(content);
    // Measure and place while the panel is in the document but before the state
    // flips — offsetWidth/Height are 0 for an unmounted node.
    reposition();
    setPresence(content, "open");
    triggerEl.setAttribute("aria-expanded", "true");
    triggerEl.setAttribute("data-state", "open");

    session = new Disposer();
    const onReflow = () => reposition();
    // Capture the scroll so a scrolling ancestor (not just the window) re-places
    // the panel; passive because we only read layout.
    window.addEventListener("scroll", onReflow, { capture: true, passive: true });
    window.addEventListener("resize", onReflow);
    session.add(() => window.removeEventListener("scroll", onReflow, { capture: true } as EventListenerOptions));
    session.add(() => window.removeEventListener("resize", onReflow));
    session.add(
      dismissable(content, {
        // The trigger toggles the panel itself; a press on it must not also read
        // as an outside click, or the two cancel and the panel never opens.
        ignore: [triggerEl, anchorEl ?? undefined].filter(Boolean) as HTMLElement[],
        onDismiss: () => state.set(false),
      }),
    );
    // Radix's Popover is non-modal: it moves focus into the panel but does not
    // trap it. Match that — focus the panel, restore the trigger on close.
    content.focus();
  };

  const doClose = () => {
    if (!mounted) return;
    mounted = false;
    session?.dispose();
    session = null;
    triggerEl.setAttribute("aria-expanded", "false");
    triggerEl.setAttribute("data-state", "closed");
    setPresence(content, "closed", () => content.remove());
    triggerEl.focus();
  };

  const disposer = new Disposer();
  disposer.add(state.subscribe((o) => (o ? doOpen() : doClose())));

  const onTriggerClick = () => state.set(!mounted);
  triggerEl.addEventListener("click", onTriggerClick);
  disposer.add(() => triggerEl.removeEventListener("click", onTriggerClick));
  disposer.add(() => session?.dispose());
  disposer.add(() => removeProps?.());

  // Honour defaultOpen / a controlled open=true on first build.
  if (state.get()) doOpen();

  const api: PopoverHandle = {
    el: wrapper,
    get isOpen() {
      return mounted;
    },
    open() {
      state.set(true);
    },
    close() {
      state.set(false);
    },
    update(next) {
      current = { ...current, ...next };
      if (next.open !== undefined) state.sync(next.open);
      if (mounted) {
        renderContent();
        reposition();
      }
    },
    destroy() {
      disposer.dispose();
      p.destroy();
      wrapper.remove();
    },
  };

  return api;
}
