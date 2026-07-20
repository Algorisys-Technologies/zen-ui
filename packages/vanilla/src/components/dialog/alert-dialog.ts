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
 * AlertDialog — the destructive-confirm modal, the vanilla port of the React
 * reference (@radix-ui/react-alert-dialog).
 *
 *   const cancel = Button({ variant: "ghost", children: "Cancel" });
 *   const del = Button({ color: "error", children: "Delete" });
 *   const dlg = AlertDialog({
 *     title: "Delete account?",
 *     description: "Removes all data permanently. This cannot be undone.",
 *     footer: [cancel.el, del.el],
 *   });
 *   cancel.el.addEventListener("click", () => dlg.close());
 *   del.el.addEventListener("click", () => { deleteAccount(); dlg.close(); });
 *   trigger.el.addEventListener("click", () => dlg.open());
 *
 * ## How it differs from Dialog, and why the difference is the whole point
 *
 * Every dismissal path EXCEPT an explicit footer action is blocked. Click-outside
 * does NOT close it — the user must answer. Escape still closes, because removing
 * the one keyboard route out of a modal is an a11y regression, not a feature. And
 * `role="alertdialog"` (not `dialog`) makes a screen reader announce the surface
 * the instant it opens rather than waiting for focus, which is what an irreversible
 * choice warrants. There is no ✕ affordance: a stray corner click must not be able
 * to answer a destructive question.
 *
 * Everything else — portal, focus trap, scroll lock, and waiting for the exit
 * animation before unmounting — it shares with Dialog. Those are the same five
 * src/lib modules Radix would otherwise supply.
 *
 * The React binding models this as a compound tree (Trigger/Content/Action/Cancel);
 * with no render and no context, this takes the same data the tree carried — title,
 * description, body, footer — up front, exactly as the vanilla Dialog does. The
 * footer buttons are the Action/Cancel: wire `close()` onto them.
 */
export interface AlertDialogProps extends BaseProps {
  title?: string | Node;
  description?: string | Node;
  /** The body, between the header and the footer. */
  children?: Child;
  /** Action row, rendered bottom-right — the Cancel / Action buttons. */
  footer?: Child;
  onOpenChange?: (open: boolean) => void;
}

let uid = 0;

export interface AlertDialogHandle extends ZenComponent<AlertDialogProps> {
  open(): void;
  close(): void;
  readonly isOpen: boolean;
}

export function AlertDialog(props: AlertDialogProps): AlertDialogHandle {
  let current: AlertDialogProps = { ...props };
  const id = `zen-alert-dialog-${++uid}`;
  let open = false;
  /** Everything released on close, not on death. */
  let session: Disposer | null = null;

  const p = portal();

  const overlay = document.createElement("div");
  overlay.className = cn(
    "zen-fixed zen-inset-0 zen-z-50 zen-bg-black/50",
    "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
  );

  const content = document.createElement("div");
  content.id = id;
  // alertdialog, not dialog: announce immediately, for an irreversible choice.
  content.setAttribute("role", "alertdialog");
  content.setAttribute("aria-modal", "true");

  const render = () => {
    const { class: className, title, description, children, footer, ...rest } = current;

    content.className = cn(
      "zen-fixed zen-left-1/2 zen-top-1/2 zen-z-50 -zen-translate-x-1/2 -zen-translate-y-1/2",
      "zen-w-full zen-max-w-lg zen-max-h-[85vh] zen-overflow-y-auto",
      // A surface that paints its own background MUST paint its own foreground:
      // portalled to <body>, "inherit" would be the consumer's body colour, and a
      // dark theme drove the React binding's dialog to ~1.2:1 for exactly this.
      "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground zen-p-6 zen-shadow-zen-lg",
      "focus:zen-outline-none",
      "data-[state=open]:zen-anim-fade-in data-[state=closed]:zen-anim-fade-out",
      className,
    );

    content.replaceChildren();

    if (title || description) {
      const header = document.createElement("div");
      header.className = "zen-flex zen-flex-col zen-gap-1 zen-text-start zen-mb-3";
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

    applyProps(content, rest as Record<string, unknown>);
  };

  const api: AlertDialogHandle = {
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
      // State AFTER mount: the entrance animation is a CSS rule keyed on
      // data-state, and a detached element has no animation to run.
      setPresence(overlay, "open");
      setPresence(content, "open");

      session = new Disposer();
      session.add(scrollLock());
      session.add(focusTrap(content));
      session.add(
        dismissable(content, {
          // Escape stays: it is the keyboard's only route out of a modal.
          // Click-outside is off: the question must be answered, not dodged.
          disableOutside: true,
          onDismiss: () => api.close(),
        }),
      );
      current.onOpenChange?.(true);
    },
    close() {
      if (!open) return;
      open = false;
      // Release the trap and lock NOW: the surface is leaving and should not hold
      // focus or the page for the length of the exit animation.
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
