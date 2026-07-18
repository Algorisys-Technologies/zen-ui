import { Button } from "./button/button";
import { AlertDialog } from "./dialog/alert-dialog";
import { DemoPage } from "./demo-helpers";

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
        code: `const cancel = Button({ variant: "ghost", color: "neutral", children: "Cancel" });
const del = Button({ color: "error", children: "Delete" });

const dlg = AlertDialog({
  title: "Delete account?",
  description: "Removes all data permanently. This cannot be undone.",
  footer: [cancel.el, del.el],
});
cancel.el.addEventListener("click", () => dlg.close());
del.el.addEventListener("click", () => { deleteAccount(); dlg.close(); });

trigger.el.addEventListener("click", () => dlg.open());`,
        render: () => {
          const status = document.createElement("span");
          status.style.fontSize = "0.8125rem";
          status.style.color = "var(--zen-color-success)";

          const cancel = Button({ variant: "ghost", color: "neutral", children: "Cancel" });
          const del = Button({ color: "error", children: "Delete" });
          const dlg = AlertDialog({
            title: "Delete account?",
            description: "Removes all data permanently. This cannot be undone.",
            footer: [cancel.el, del.el],
          });
          cancel.el.addEventListener("click", () => dlg.close());
          del.el.addEventListener("click", () => {
            status.textContent = "Action confirmed: deleted";
            dlg.close();
          });

          const open = Button({ color: "error", children: "Delete account" });
          open.el.addEventListener("click", () => dlg.open());

          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "12px";
          wrap.append(open.el, status);
          return wrap;
        },
      },
      {
        title: "2. Escape closes, click-outside does not",
        description:
          "Press Escape and it closes. Click the dimmed overlay and nothing happens — the difference from Dialog, and the whole reason to use this. There is no ✕ for the same reason: a stray corner click must not be able to answer.",
        codeTitle: "dismissable, minus the outside click",
        code: `dismissable(content, {
  disableOutside: true,   // click-outside is off
  onDismiss: () => close(), // Escape still routes here
});`,
        render: () => {
          const keep = Button({ variant: "ghost", color: "neutral", children: "Keep it" });
          const discard = Button({ color: "error", children: "Discard changes" });
          const dlg = AlertDialog({
            title: "Discard your changes?",
            description:
              "Try it: Escape closes this, clicking the dark overlay does not. You have to pick one of the two buttons.",
            footer: [keep.el, discard.el],
          });
          keep.el.addEventListener("click", () => dlg.close());
          discard.el.addEventListener("click", () => dlg.close());

          const open = Button({ variant: "outline", color: "error", children: "Try to dismiss it" });
          open.el.addEventListener("click", () => dlg.open());
          return open.el;
        },
      },
    ],
  });
}
