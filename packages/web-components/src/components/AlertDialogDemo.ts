import { DemoPage } from "./demo-helpers";

/**
 * AlertDialog demo — the web-components port. <zen-alert-dialog> forwards the
 * handle's open()/close() onto the element, so a trigger calls `dlg.open()`.
 * `title` / `description` are attributes; `footer` is a JS property holding the
 * action buttons. The element is appended to the page and portals itself when
 * opened. Unlike Dialog there is no ✕ and click-outside does nothing — a
 * destructive confirm must be answered.
 */

function button(attrs: Record<string, string>, text: string): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
}

export default function AlertDialogDemo(): HTMLElement {
  return DemoPage({
    title: "AlertDialog",
    description:
      "The destructive-confirm modal. It shares Dialog's whole behaviour spine — portal, focus trap, scroll lock, animation-aware unmount — and then closes every exit except an explicit answer: click-outside does nothing, there is no ✕, and role=\"alertdialog\" announces the moment it opens. Escape still closes, because that is the keyboard's only way out of a modal. Reach for it for irreversible / destructive confirmations; for generic modals use Dialog.",
    sections: [
      {
        title: "1. Destructive confirm",
        codeTitle: "Blocks click-outside dismissal; the user must answer",
        codeDescription:
          "role='alertdialog' announces immediately. Esc still closes for keyboard a11y. The footer buttons are the Action / Cancel — wire close() onto them.",
        code: `<zen-alert-dialog title="Delete account?" description="Removes all data permanently."></zen-alert-dialog>

const dlg = document.querySelector("zen-alert-dialog");
dlg.footer = [cancelBtn, deleteBtn];
cancelBtn.addEventListener("click", () => dlg.close());
deleteBtn.addEventListener("click", () => { deleteAccount(); dlg.close(); });
triggerBtn.addEventListener("click", () => dlg.open());`,
        render: () => {
          const status = document.createElement("span");
          status.style.fontSize = "0.8125rem";
          status.style.color = "var(--zen-color-success)";

          const cancel = button({ variant: "ghost", color: "neutral" }, "Cancel");
          const del = button({ color: "error" }, "Delete");
          const dlg = document.createElement("zen-alert-dialog") as HTMLElement & {
            footer: HTMLElement[];
            open(): void;
            close(): void;
          };
          dlg.setAttribute("title", "Delete account?");
          dlg.setAttribute("description", "Removes all data permanently. This cannot be undone.");
          dlg.footer = [cancel, del];
          cancel.addEventListener("click", () => dlg.close());
          del.addEventListener("click", () => {
            status.textContent = "Action confirmed: deleted";
            dlg.close();
          });

          const open = button({ color: "error" }, "Delete account");
          open.addEventListener("click", () => dlg.open());

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "12px";
          wrap.append(open, status, dlg);
          return wrap;
        },
      },
      {
        title: "2. Escape closes, click-outside does not",
        description:
          "Press Escape and it closes. Click the dimmed overlay and nothing happens — the difference from Dialog, and the whole reason to use this. There is no ✕ for the same reason: a stray corner click must not be able to answer.",
        codeTitle: "dismissable, minus the outside click",
        code: `// click-outside is disabled; Escape still routes to close()
triggerBtn.addEventListener("click", () => dlg.open());`,
        render: () => {
          const keep = button({ variant: "ghost", color: "neutral" }, "Keep it");
          const discard = button({ color: "error" }, "Discard changes");
          const dlg = document.createElement("zen-alert-dialog") as HTMLElement & {
            footer: HTMLElement[];
            open(): void;
            close(): void;
          };
          dlg.setAttribute("title", "Discard your changes?");
          dlg.setAttribute(
            "description",
            "Try it: Escape closes this, clicking the dark overlay does not. You have to pick one of the two buttons.",
          );
          dlg.footer = [keep, discard];
          keep.addEventListener("click", () => dlg.close());
          discard.addEventListener("click", () => dlg.close());

          const open = button({ variant: "outline", color: "error" }, "Try to dismiss it");
          open.addEventListener("click", () => dlg.open());

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "12px";
          wrap.append(open, dlg);
          return wrap;
        },
      },
    ],
  });
}
