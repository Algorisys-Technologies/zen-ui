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
 * Dialog — the vanilla port of the React reference.
 *
 *   const dlg = Dialog({
 *     title: "Confirm delete",
 *     description: "This cannot be undone.",
 *     children: form.el,
 *     footer: [cancel.el, confirm.el],
 *   });
 *   openBtn.el.addEventListener("click", () => dlg.open());
 *
 * Everything Radix supplies for free, this owns: portal, focus trap, scroll lock,
 * Escape, click-outside, and waiting for the exit animation before unmounting.
 * Those five modules in src/lib are the honest price of having no primitive
 * library — and they are most of what @radix-ui/react-dialog is.
 *
 * ## Why an imperative handle rather than a `<Dialog open>` prop
 *
 * React drives this by re-rendering with `open={true}`. There is no re-render
 * here, so `open()` / `close()` IS the API — and it is the one a vanilla caller
 * would write anyway. `onOpenChange` still fires, so the caller can mirror the
 * state if it keeps its own.
 *
 * For confirm-style dialogs that must be answered rather than dismissed, pass
 * `dismissable: false` — the equivalent of the React binding's <AlertDialog>.
 */
export interface DialogProps extends BaseProps {
  title?: string | Node;
  description?: string | Node;
  /** The body. */
  children?: Child;
  /** Action row, rendered bottom-right. */
  footer?: Child;
  /** Render the ✕ close affordance. Default true. */
  showCloseButton?: boolean;
  /** Allow Escape and click-outside. Default true. False = AlertDialog semantics. */
  dismissable?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const X_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

let uid = 0;

export interface DialogHandle extends ZenComponent<DialogProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

export function Dialog(props: DialogProps): DialogHandle {
  let current: DialogProps = { ...props };
  const id = `zen-dialog-${++uid}`;
  let open = false;
  /** Everything that must be released when the dialog closes, not when it dies. */
  let session: Disposer | null = null;

  const p = portal();

  const overlay = document.createElement("div");
  overlay.className = cn(
    "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );

  const content = document.createElement("div");
  content.id = id;
  content.setAttribute("role", "dialog");
  content.setAttribute("aria-modal", "true");

  const render = () => {
    const {
      class: className,
      title,
      description,
      children,
      footer,
      showCloseButton = true,
      ...rest
    } = current;

    content.className = cn(
      "zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2",
      "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
      // A surface that paints its own background MUST paint its own foreground.
      // This is portalled to <body>, so "inherit" means the consumer's body
      // colour, not the app's — with a dark theme the panel went dark and the
      // text stayed black, at about 1.2:1. The React binding shipped exactly that.
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
      "focus:zen-outline-none",
      "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
      className,
    );

    content.replaceChildren();

    if (title || description) {
      const header = document.createElement("div");
      header.className = "zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3 zen-pe-8";
      if (title) {
        const h2 = document.createElement("h2");
        h2.id = `${id}-title`;
        h2.className = "zen-text-lg zen-font-semibold zen-leading-tight zen-text-zen-foreground";
        h2.append(...toNodes(title as Child));
        header.append(h2);
        content.setAttribute("aria-labelledby", h2.id);
      }
      if (description) {
        const pEl = document.createElement("p");
        pEl.id = `${id}-desc`;
        pEl.className = "zen-text-sm zen-text-zen-muted-fg zen-leading-snug";
        pEl.append(...toNodes(description as Child));
        header.append(pEl);
        content.setAttribute("aria-describedby", pEl.id);
      }
      content.append(header);
    }

    content.append(...toNodes(children));

    if (footer) {
      const f = document.createElement("div");
      f.className = "zen-flex zen-flex-col-reverse sm:zen-flex-row sm:zen-justify-end zen-gap-2 zen-mt-5";
      f.append(...toNodes(footer));
      content.append(f);
    }

    if (showCloseButton) {
      const close = document.createElement("button");
      close.type = "button";
      close.setAttribute("aria-label", "Close");
      close.className = cn(
        "zen-absolute zen-end-3 zen-top-3 zen-h-7 zen-w-7 zen-inline-flex zen-items-center zen-justify-center",
        "zen-rounded-zen-sm zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg",
        "hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      );
      close.innerHTML = X_ICON;
      close.addEventListener("click", () => api.close());
      content.append(close);
    }

    applyProps(content, rest as Record<string, unknown>);
  };

  const api: DialogHandle = {
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
      // Set state AFTER mounting: the entrance animation is a CSS rule keyed on
      // data-state, and an element that is not in the document has no animation
      // to run.
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
      // Release the trap and the lock NOW, not after the animation: the surface
      // is on its way out and should not hold focus or the page hostage for
      // another 200ms.
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
