import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { setPresence } from "../../lib/presence";

/**
 * Toast — the vanilla port of the React reference (@radix-ui/react-toast).
 *
 *   import { Toaster, toast } from "@algorisys/zen-ui-vanilla";
 *
 *   // once, near the root:
 *   document.body.append(Toaster().el);
 *
 *   // anywhere:
 *   toast({ title: "Saved", description: "Profile updated." });
 *   toast({ variant: "destructive", title: "Couldn't save", description: err });
 *
 * ## What Radix did for us, and where it now lives
 *
 * React leans on @radix-ui/react-toast for the timer, hover-to-pause, swipe-to-
 * dismiss, the queue cap and the ARIA live region. There is no primitive library
 * here, so this file owns all of it:
 *
 *  - **The store** (`toast()` / `dismiss()` + the reducer) is ported almost
 *    verbatim from React's `use-toast.tsx`: a module-scoped list, a listener
 *    fan-out, the MAX_TOASTS cap and the REMOVE_DELAY cleanup.
 *  - **`Toaster()`** is the viewport. It subscribes to the store and reconciles a
 *    live DOM item per descriptor — the render that React's `<Toaster>` did with a
 *    `.map()`.
 *  - **Each item** owns its own auto-dismiss timer (pauses on hover/focus, exactly
 *    as Radix does), its close button, and pointer swipe-to-dismiss. It emits
 *    React's `data-state` / `data-swipe` vocabulary (see PORTING.md), and the swipe
 *    classes are copied verbatim from the React source — this sets the
 *    `--radix-toast-swipe-*` custom properties they interpolate.
 *
 * The imperative API is identical to React's: `toast()` returns
 * `{ id, update, dismiss }`, and the same prop names carry across.
 */

/* -------------------------------------------------------------------------- */
/* Variants                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Copied class-for-class from the React `toast.tsx`, so a toast rendered here is
 * styled by the identical string — the whole point of the third binding. The
 * `data-[swipe=…]` rules read `--radix-toast-swipe-*`, which the item's pointer
 * handler writes; nothing else in this binding names Radix, but keeping the string
 * identical is what lets `check:css-live` verify parity against React.
 */
export const toastVariants = cva(
  [
    "zen-group zen-pointer-events-auto zen-relative zen-flex zen-w-full zen-items-start zen-gap-3",
    "zen-overflow-hidden zen-rounded-zen-md zen-border zen-p-4 zen-shadow-zen-lg",
    "data-[swipe=cancel]:zen-translate-x-0",
    "data-[swipe=end]:zen-translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:zen-translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:zen-transition-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "zen-bg-zen-background zen-border-zen-border zen-text-zen-foreground",
        success:
          "zen-bg-zen-success-soft zen-border-zen-success zen-text-zen-success-soft-fg",
        warning:
          "zen-bg-zen-warning-soft zen-border-zen-warning zen-text-zen-warning-soft-fg",
        destructive:
          "zen-bg-zen-error-soft zen-border-zen-error zen-text-zen-error-soft-fg",
        info: "zen-bg-zen-info-soft zen-border-zen-info zen-text-zen-info-soft-fg",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type ToastVariant = NonNullable<VariantProps<typeof toastVariants>["variant"]>;

/* -------------------------------------------------------------------------- */
/* ToastAction — the inline action button                                     */
/* -------------------------------------------------------------------------- */

export interface ToastActionProps extends BaseProps {
  /**
   * A short text alternative announced to screen readers, mirroring Radix's
   * required `altText`. Falls back to nothing if the button's own text is enough.
   */
  altText?: string;
  onClick?: (e: MouseEvent) => void;
  children?: Child;
}

/**
 * The button passed as a toast's `action` (Undo / Retry). Same classes as React's
 * `ToastAction`. Returns a component so it composes into `action:` the way every
 * other vanilla child does.
 */
export function ToastAction(props: ToastActionProps): ZenComponent<ToastActionProps> {
  let current: ToastActionProps = { ...props };
  const el = document.createElement("button");
  el.type = "button";
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, altText, children, ...rest } = current;
    el.className = cn(
      "zen-ml-auto zen-inline-flex zen-h-8 zen-shrink-0 zen-items-center zen-justify-center",
      "zen-rounded-zen-sm zen-border zen-border-current/30 zen-bg-transparent zen-px-3 zen-text-sm zen-font-medium",
      "hover:zen-bg-current/10",
      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      className,
    );
    if (altText) el.setAttribute("aria-label", altText);
    else el.removeAttribute("aria-label");
    el.replaceChildren(...toNodes(children));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* The module-scoped store — ported from React's use-toast.tsx                */
/* -------------------------------------------------------------------------- */

/** What a caller hands to `toast()`. */
export interface ToastInput {
  title?: string | Node;
  description?: string | Node;
  /** An inline action, e.g. `ToastAction({ children: "Undo", onClick })`. */
  action?: Child;
  variant?: ToastVariant;
  /** Time before auto-dismiss, ms. Default 5000. Pass `Infinity` for sticky. */
  duration?: number;
  /** Extra class on the toast surface. */
  class?: string;
}

/** A toast as it lives in the store — the input plus its lifecycle fields. */
export interface ToastDescriptor extends ToastInput {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface State {
  toasts: ToastDescriptor[];
}

type Action =
  | { type: "ADD"; toast: ToastDescriptor }
  | { type: "UPDATE"; toast: Partial<ToastDescriptor> & { id: string } }
  | { type: "DISMISS"; id?: string }
  | { type: "REMOVE"; id?: string };

const MAX_TOASTS = 5;
const REMOVE_DELAY_MS = 1_000;
const DEFAULT_DURATION_MS = 5_000;

let state: State = { toasts: [] };
const listeners: Array<(s: State) => void> = [];

const removeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

function setState(next: State) {
  state = next;
  for (const l of listeners) l(state);
}

function queueRemove(id: string) {
  if (removeTimeouts.has(id)) return;
  const t = setTimeout(() => {
    removeTimeouts.delete(id);
    setState({ ...state, toasts: state.toasts.filter((x) => x.id !== id) });
  }, REMOVE_DELAY_MS);
  removeTimeouts.set(id, t);
}

function reducer(action: Action) {
  switch (action.type) {
    case "ADD":
      setState({
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, MAX_TOASTS),
      });
      break;
    case "UPDATE":
      setState({
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      });
      break;
    case "DISMISS": {
      const { id } = action;
      if (id) queueRemove(id);
      else state.toasts.forEach((t) => queueRemove(t.id));
      setState({
        ...state,
        toasts: state.toasts.map((t) =>
          id === undefined || t.id === id ? { ...t, open: false } : t,
        ),
      });
      break;
    }
    case "REMOVE":
      if (action.id === undefined) setState({ ...state, toasts: [] });
      else setState({ ...state, toasts: state.toasts.filter((t) => t.id !== action.id) });
      break;
  }
}

let counter = 0;
const nextId = () => {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return String(counter);
};

/**
 * Fire a toast. Returns a handle to update or dismiss it — identical to React's
 * `toast()`.
 *
 *   const t = toast({ title: "Uploading…", duration: Infinity });
 *   t.update({ description: "50%" });
 *   t.update({ variant: "success", title: "Uploaded", duration: 4000 });
 */
export function toast(input: ToastInput) {
  const id = nextId();
  const update = (next: ToastInput) => reducer({ type: "UPDATE", toast: { ...next, id } });
  const dismiss = () => reducer({ type: "DISMISS", id });

  reducer({
    type: "ADD",
    toast: {
      ...input,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return { id, update, dismiss };
}

/** Dismiss one toast, or all of them when called with no id. */
export function dismiss(id?: string) {
  reducer({ type: "DISMISS", id });
}

/* -------------------------------------------------------------------------- */
/* A single live toast item — the timer, swipe and close a Toaster renders    */
/* -------------------------------------------------------------------------- */

const CLOSE_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

/** How far a rightward drag must travel to dismiss, matching Radix's default. */
const SWIPE_THRESHOLD_PX = 50;

interface ToastItem {
  readonly el: HTMLElement;
  update(desc: ToastDescriptor): void;
  destroy(): void;
}

function createToastItem(initial: ToastDescriptor): ToastItem {
  let desc = initial;
  let closed = false;

  const root = document.createElement("div");
  root.setAttribute("role", "status");
  root.setAttribute("aria-atomic", "true");
  // Open BEFORE the timer starts, so data-state is set on the node the moment it
  // enters the viewport (the vocabulary React's Radix emits).
  setPresence(root, "open");

  // The title/description column. Inline styles mirror the React <Toaster>'s
  // wrapper div exactly (grid, gap 4, flex 1, min-width 0 so long text wraps
  // instead of shoving the close button off the edge).
  const body = document.createElement("div");
  Object.assign(body.style, {
    display: "grid",
    gap: "4px",
    flex: "1",
    minWidth: "0",
  } satisfies Partial<CSSStyleDeclaration>);

  const titleEl = document.createElement("div");
  titleEl.className = "zen-text-sm zen-font-semibold zen-leading-tight";

  const descEl = document.createElement("div");
  descEl.className = "zen-text-sm zen-opacity-90 zen-leading-snug";

  // Persistent so its content can be swapped without re-adding listeners.
  const actionWrap = document.createElement("div");
  actionWrap.style.display = "contents";

  const close = document.createElement("button");
  close.type = "button";
  close.setAttribute("aria-label", "Close");
  close.className = cn(
    "zen-absolute zen-end-2 zen-top-2 zen-inline-flex zen-h-6 zen-w-6 zen-items-center zen-justify-center",
    "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-opacity-70",
    "hover:zen-opacity-100 hover:zen-bg-current/10",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
  );
  close.innerHTML = CLOSE_ICON; // our own trusted markup — never a caller's string
  close.addEventListener("click", () => desc.onOpenChange(false));

  root.append(body, actionWrap, close);

  /* --- the auto-dismiss timer, with hover/focus pause (Radix's behaviour) --- */

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let remaining = 0;
  let startedAt = 0;
  let running = false;

  const durationOf = () => desc.duration ?? DEFAULT_DURATION_MS;

  const clearTimer = () => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    timeoutId = undefined;
    running = false;
  };

  const startTimer = () => {
    clearTimer();
    const d = durationOf();
    if (!Number.isFinite(d)) return; // Infinity => sticky, no timer
    remaining = d;
    startedAt = Date.now();
    running = true;
    timeoutId = setTimeout(() => desc.onOpenChange(false), remaining);
  };

  const pause = () => {
    if (!running) return;
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    remaining -= Date.now() - startedAt;
    running = false;
  };

  const resume = () => {
    if (running || closed) return;
    if (!Number.isFinite(durationOf())) return;
    startedAt = Date.now();
    running = true;
    timeoutId = setTimeout(() => desc.onOpenChange(false), Math.max(remaining, 0));
  };

  root.addEventListener("pointerenter", pause);
  root.addEventListener("pointerleave", resume);
  root.addEventListener("focusin", pause);
  root.addEventListener("focusout", resume);

  /* --- swipe-to-dismiss (right), the gesture Radix ships --- */

  let swipeStartX: number | null = null;

  root.addEventListener("pointerdown", (e) => {
    // Never start a swipe from an interactive control: capturing the pointer
    // would swallow the close/action button's own click.
    if (e.button !== 0 || (e.target as Element).closest("button")) return;
    swipeStartX = e.clientX;
    root.setPointerCapture(e.pointerId);
    pause();
  });

  root.addEventListener("pointermove", (e) => {
    if (swipeStartX === null) return;
    const dx = Math.max(0, e.clientX - swipeStartX); // rightward only
    root.setAttribute("data-swipe", "move");
    root.style.setProperty("--radix-toast-swipe-move-x", `${dx}px`);
  });

  const endSwipe = (e: PointerEvent, cancelled: boolean) => {
    if (swipeStartX === null) return;
    const dx = e.clientX - swipeStartX;
    swipeStartX = null;
    if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    if (!cancelled && dx > SWIPE_THRESHOLD_PX) {
      root.setAttribute("data-swipe", "end");
      root.style.setProperty("--radix-toast-swipe-end-x", `${dx}px`);
      desc.onOpenChange(false);
    } else {
      root.setAttribute("data-swipe", "cancel");
      root.style.removeProperty("--radix-toast-swipe-move-x");
      resume();
    }
  };

  root.addEventListener("pointerup", (e) => endSwipe(e, false));
  root.addEventListener("pointercancel", (e) => endSwipe(e, true));

  /* --- rendering the interpreted content --- */

  const render = () => {
    root.className = cn(toastVariants({ variant: desc.variant }), desc.class);
    // Foreground/attention: a destructive or warning toast interrupts; the rest
    // announce politely. Mirrors Radix's foreground/background split.
    root.setAttribute(
      "aria-live",
      desc.variant === "destructive" || desc.variant === "warning" ? "assertive" : "polite",
    );

    if (desc.title != null && desc.title !== "") {
      titleEl.replaceChildren(...toNodes(desc.title as Child));
      if (!titleEl.parentNode) body.append(titleEl);
    } else {
      titleEl.remove();
    }

    if (desc.description != null && desc.description !== "") {
      descEl.replaceChildren(...toNodes(desc.description as Child));
      if (!descEl.parentNode) body.append(descEl);
    } else {
      descEl.remove();
    }

    actionWrap.replaceChildren(...toNodes(desc.action));
  };

  render();
  startTimer();

  return {
    el: root,
    update(next) {
      const wasOpen = desc.open;
      const prevDuration = desc.duration;
      desc = next;

      if (!desc.open && wasOpen) {
        // Closing: drop the timer now and let presence remove the node once the
        // (currently absent) exit animation has run. With no animation this is
        // immediate — matching React, whose toast.tsx defines no exit keyframe.
        closed = true;
        clearTimer();
        setPresence(root, "closed", () => root.remove());
        return;
      }
      if (closed) return;

      render();
      // A changed duration restarts the countdown — the upload demo flips a sticky
      // toast to `duration: 4000` and expects it to then auto-dismiss.
      if (desc.duration !== prevDuration) startTimer();
    },
    destroy() {
      clearTimer();
      root.remove();
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Toaster — the viewport, mounted once near the root                         */
/* -------------------------------------------------------------------------- */

export interface ToasterProps extends BaseProps {
  class?: string;
}

/**
 * The viewport. Append `Toaster().el` once near the root of the app; it subscribes
 * to the module store and renders every open toast. This is the render React's
 * `<Toaster>` component did — a live DOM item per descriptor, reconciled on each
 * store change, with newest on top (the store prepends).
 */
export function Toaster(props: ToasterProps = {}): ZenComponent<ToasterProps> {
  let current: ToasterProps = { ...props };
  const viewport = document.createElement("div");
  viewport.setAttribute("role", "region");
  viewport.setAttribute("aria-label", "Notifications");
  viewport.setAttribute("tabindex", "-1");

  const applyClass = () => {
    viewport.className = cn(
      "zen-fixed zen-top-0 zen-right-0 zen-z-[100] zen-flex zen-max-h-screen zen-w-full zen-flex-col zen-p-4",
      "md:zen-max-w-sm",
      current.class,
    );
  };
  applyClass();

  const items = new Map<string, ToastItem>();

  const sync = (s: State) => {
    const live = new Set(s.toasts.map((t) => t.id));

    // Retire anything the store dropped.
    for (const [id, item] of items) {
      if (!live.has(id)) {
        item.destroy();
        items.delete(id);
      }
    }

    // Create the newcomers (prepend => newest on top) and refresh the rest.
    for (const desc of s.toasts) {
      let item = items.get(desc.id);
      if (!item) {
        item = createToastItem(desc);
        items.set(desc.id, item);
        viewport.prepend(item.el);
      } else {
        item.update(desc);
      }
    }
  };

  listeners.push(sync);
  sync(state);

  return {
    el: viewport,
    update(next) {
      current = { ...current, ...next };
      applyClass();
    },
    destroy() {
      const idx = listeners.indexOf(sync);
      if (idx >= 0) listeners.splice(idx, 1);
      for (const item of items.values()) item.destroy();
      items.clear();
      viewport.remove();
    },
  };
}
