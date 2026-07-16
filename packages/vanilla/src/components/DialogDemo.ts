import { Button } from "./button/button";
import { Dialog } from "./dialog/dialog";
import { DemoPage } from "./demo-helpers";

export default function DialogDemo(): HTMLElement {
  return DemoPage({
    title: "Dialog",
    description:
      "The behaviour spine. Radix supplies portal, focus trap, scroll lock, Escape, click-outside and animation-aware unmount for free; with no primitive library this binding writes all six. They are five small modules in src/lib, and they are the honest price of the port.",
    sections: [
      {
        title: "1. Basic",
        codeTitle: "open() / close() IS the API",
        codeDescription:
          "React drives this by re-rendering with open={true}. There is no re-render here, so the handle is imperative — which is what a vanilla caller would write anyway.",
        code: `const dlg = Dialog({
  title: "Confirm delete",
  description: "This cannot be undone.",
  footer: [cancel.el, confirm.el],
});
openBtn.el.addEventListener("click", () => dlg.open());`,
        render: () => {
          const cancel = Button({ variant: "ghost", children: "Cancel" });
          const confirm = Button({ color: "error", children: "Delete" });
          const dlg = Dialog({
            title: "Confirm delete",
            description: "This cannot be undone. The record and its history go with it.",
            footer: [cancel.el, confirm.el],
          });
          cancel.el.addEventListener("click", () => dlg.close());
          confirm.el.addEventListener("click", () => dlg.close());
          const open = Button({ children: "Open dialog" });
          open.el.addEventListener("click", () => dlg.open());
          return open.el;
        },
      },
      {
        title: "2. Focus trap + scroll lock",
        description:
          "Tab cycles inside the surface and cannot reach the page behind. The body stops scrolling, and the scrollbar's width is compensated so nothing jumps sideways. Focus returns to the trigger on close.",
        codeTitle: "what Radix does for free",
        code: `session.add(scrollLock());
session.add(focusTrap(content));
session.add(dismissable(content, { onDismiss: () => close() }));`,
        render: () => {
          const a = Button({ variant: "outline", children: "First" });
          const b = Button({ variant: "outline", children: "Second" });
          const c = Button({ variant: "outline", children: "Third" });
          const dlg = Dialog({
            title: "Try Tab, then Escape",
            description:
              "Tab cycles these three and wraps. Escape closes. Clicking the overlay closes. Focus goes back to the button you opened this with.",
            children: [a.el, b.el, c.el],
          });
          const open = Button({ variant: "soft", children: "Open trap demo" });
          open.el.addEventListener("click", () => dlg.open());
          return open.el;
        },
      },
      {
        title: "3. Not dismissable (AlertDialog semantics)",
        description: "Escape and click-outside are off: the question must be answered.",
        codeTitle: "dismissable: false",
        code: `Dialog({ dismissable: false, showCloseButton: false, title: "…", footer: [...] })`,
        render: () => {
          const no = Button({ variant: "ghost", children: "Keep it" });
          const yes = Button({ color: "error", children: "Delete anyway" });
          const dlg = Dialog({
            dismissable: false,
            showCloseButton: false,
            title: "This one you must answer",
            description: "Escape does nothing. Clicking outside does nothing. Pick one.",
            footer: [no.el, yes.el],
          });
          no.el.addEventListener("click", () => dlg.close());
          yes.el.addEventListener("click", () => dlg.close());
          const open = Button({ color: "error", variant: "outline", children: "Open blocking dialog" });
          open.el.addEventListener("click", () => dlg.open());
          return open.el;
        },
      },
    ],
  });
}
