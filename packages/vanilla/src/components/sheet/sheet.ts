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
import { dismissable } from "../../lib/dismissable";
import { focusTrap } from "../../lib/focus-trap";
import { portal } from "../../lib/portal";
import { scrollLock } from "../../lib/scroll-lock";
import { setPresence } from "../../lib/presence";

/**
 * Sheet / Drawer — the vanilla port of the React reference.
 *
 *   const sheet = Sheet({
 *     side: "right",
 *     title: "Filters",
 *     description: "Narrow the dashboard.",
 *     children: filterForm,
 *     footer: [cancel.el, apply.el],
 *   });
 *   openBtn.el.addEventListener("click", () => sheet.open());
 *
 * A slide-in side panel. Reach for it over Dialog when a Dialog is too modal for
 * the task — long-form filter panels, edit screens that want the underlying list
 * visible as reference, KYC document review, onboarding tour content, mobile
 * bottom-sheets. The overlay still dims the rest of the page (Dialog semantics)
 * so the user knows the sheet is the focus; for a non-modal slide-in that lets
 * the page stay interactive, use Popover instead.
 *
 * React builds this on Radix Dialog and exposes it as compound parts
 * (`<Sheet><SheetTrigger><SheetContent side="…">…`). Like this binding's Dialog,
 * there is no render loop and no context to thread through provider/consumer, so
 * the compound tree collapses into one data-driven factory with an imperative
 * `open()` / `close()` handle — the API a vanilla caller would write anyway.
 * `onOpenChange` still fires, so a caller keeping its own state can mirror it,
 * which is the vanilla equivalent of React's `open` / `onOpenChange`.
 *
 * Everything Radix supplies for free, this owns: portal, focus trap, scroll lock,
 * Escape, click-outside, and waiting for the exit slide before unmounting.
 *
 * `side` controls which edge the panel slides from:
 *   - right (default) — desktop filters / details / edit forms
 *   - left — secondary navigation drawer
 *   - top — banner-style notifications, command palettes
 *   - bottom — mobile bottom-sheet
 */

export type SheetSide = "right" | "left" | "top" | "bottom";

/**
 * The exact class table React ships, kept as a cva so `sheetContentVariants({ side })`
 * matches the reference call and carries the same `data-[state=…]` slide vocabulary.
 */
export const sheetContentVariants = cva(
  [
    "zen-fixed zen-z-50 zen-flex zen-flex-col zen-gap-4 zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
    "zen-transition zen-ease-in-out",
    "focus-visible:zen-outline-none",
  ].join(" "),
  {
    variants: {
      side: {
        right: [
          "zen-inset-y-0 zen-right-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-l zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-right",
          "data-[state=closed]:zen-anim-slide-out-right",
        ].join(" "),
        left: [
          "zen-inset-y-0 zen-left-0 zen-h-full zen-w-3/4 zen-max-w-md zen-border-r zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-left",
          "data-[state=closed]:zen-anim-slide-out-left",
        ].join(" "),
        top: [
          "zen-inset-x-0 zen-top-0 zen-w-full zen-max-h-[80vh] zen-border-b zen-border-zen-border",
          "data-[state=open]:zen-anim-slide-in-top",
          "data-[state=closed]:zen-anim-slide-out-top",
        ].join(" "),
        bottom: [
          "zen-inset-x-0 zen-bottom-0 zen-w-full zen-max-h-[80vh] zen-border-t zen-border-zen-border",
          "zen-rounded-t-zen-lg",
          "data-[state=open]:zen-anim-slide-in-bottom",
          "data-[state=closed]:zen-anim-slide-out-bottom",
        ].join(" "),
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

export interface SheetProps extends BaseProps, VariantProps<typeof sheetContentVariants> {
  /** Which edge the panel slides from. Default "right". */
  side?: SheetSide;
  title?: string | Node;
  description?: string | Node;
  /** The body. */
  children?: Child;
  /** Action row, rendered at the bottom. */
  footer?: Child;
  /** Show a built-in close ✕ in the top-right. Default true. */
  showCloseButton?: boolean;
  /** Allow Escape and click-outside. Default true. */
  dismissable?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// strokeWidth 2.5 and 14px, matching React's SheetContent close glyph exactly.
const X_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

let uid = 0;

export interface SheetHandle extends ZenComponent<SheetProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

export function Sheet(props: SheetProps): SheetHandle {
  let current: SheetProps = { ...props };
  const id = `zen-sheet-${++uid}`;
  let open = false;
  /** Everything released when the sheet closes, not when it dies. */
  let session: Disposer | null = null;

  const p = portal();

  const overlay = document.createElement("div");
  overlay.className = cn(
    "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/40",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );

  const content = document.createElement("div");
  content.id = id;
  content.setAttribute("role", "dialog");
  content.setAttribute("aria-modal", "true");

  const render = () => {
    const {
      class: className,
      side = "right",
      title,
      description,
      children,
      footer,
      showCloseButton = true,
      // Interpreted here, never spread onto the element.
      dismissable: _dismissable,
      onOpenChange: _onOpenChange,
      ...rest
    } = current;

    content.className = cn(sheetContentVariants({ side }), className);

    content.replaceChildren();
    content.removeAttribute("aria-labelledby");
    content.removeAttribute("aria-describedby");

    if (title || description) {
      const header = document.createElement("div");
      header.className = "zen-flex zen-flex-col zen-gap-1.5";
      if (title) {
        const h2 = document.createElement("h2");
        h2.id = `${id}-title`;
        h2.className = "zen-text-base zen-font-semibold zen-leading-tight zen-text-zen-foreground zen-m-0";
        h2.append(...toNodes(title as Child));
        header.append(h2);
        content.setAttribute("aria-labelledby", h2.id);
      }
      if (description) {
        const pEl = document.createElement("p");
        pEl.id = `${id}-desc`;
        pEl.className = "zen-text-sm zen-text-zen-muted-fg zen-m-0";
        pEl.append(...toNodes(description as Child));
        header.append(pEl);
        content.setAttribute("aria-describedby", pEl.id);
      }
      content.append(header);
    }

    content.append(...toNodes(children));

    if (footer) {
      const f = document.createElement("div");
      f.className = "zen-mt-auto zen-flex zen-flex-col-reverse zen-gap-2 sm:zen-flex-row sm:zen-justify-end";
      f.append(...toNodes(footer));
      content.append(f);
    }

    if (showCloseButton) {
      const close = document.createElement("button");
      close.type = "button";
      close.setAttribute("aria-label", "Close sheet");
      close.className = cn(
        "zen-absolute zen-top-3 zen-right-3 zen-inline-flex zen-items-center zen-justify-center",
        "zen-h-7 zen-w-7 zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer",
        "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      );
      close.innerHTML = X_ICON;
      close.addEventListener("click", () => api.close());
      content.append(close);
    }

    applyProps(content, rest as Record<string, unknown>);
  };

  const api: SheetHandle = {
    el: content,
    get isOpen() {
      return open;
    },
    open() {
      if (open) return;
      open = true;
      render();

      p.mount(overlay);
      p.mount(content);
      // Set state AFTER mounting: the entrance slide is a CSS rule keyed on
      // data-state, and an element not yet in the document has no animation to run.
      setPresence(overlay, "open");
      setPresence(content, "open");

      session = new Disposer();
      session.add(scrollLock());
      session.add(focusTrap(content));
      session.add(
        dismissable(content, {
          disableEscape: current.dismissable === false,
          disableOutside: current.dismissable === false,
          onDismiss: () => api.close(),
        }),
      );
      current.onOpenChange?.(true);
    },
    close() {
      if (!open) return;
      open = false;
      // Release the trap and the lock NOW, not after the slide: the surface is on
      // its way out and should not hold focus or the page hostage for another 200ms.
      session?.dispose();
      session = null;

      setPresence(overlay, "closed", () => overlay.remove());
      setPresence(content, "closed", () => content.remove());
      current.onOpenChange?.(false);
    },
    update(next) {
      current = { ...current, ...next };
      if (open) render();
    },
    destroy() {
      session?.dispose();
      session = null;
      open = false;
      p.destroy();
    },
  };

  return api;
}
