import { DemoPage } from "./demo-helpers";

/**
 * Dialog demo — the web-components mirror of the vanilla DialogDemo. The imperative
 * handle (open/close) is forwarded onto the <zen-dialog> element, so the trigger
 * calls `dlg.open()` directly. The dialog element is returned alongside the trigger
 * so it CONNECTS (and thus wires its handle) even though it portals itself on open.
 */

function el(tag: string, attrs: Record<string, string> = {}, text?: string): HTMLElement {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  if (text != null) n.textContent = text;
  return n;
}

type DialogEl = HTMLElement & { open(): void; close(): void };

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
        code: `<zen-dialog title="Confirm delete" description="This cannot be undone."></zen-dialog>

dlg.footer = [cancelBtn, confirmBtn];
openBtn.addEventListener("click", () => dlg.open());`,
        render: () => {
          const cancel = el("zen-button", { variant: "ghost" }, "Cancel");
          const confirm = el("zen-button", { color: "error" }, "Delete");
          const dlg = el("zen-dialog", {
            title: "Confirm delete",
            description: "This cannot be undone. The record and its history go with it.",
          }) as DialogEl;
          (dlg as unknown as { footer: Node[] }).footer = [cancel, confirm];
          cancel.addEventListener("click", () => dlg.close());
          confirm.addEventListener("click", () => dlg.close());
          const open = el("zen-button", {}, "Open dialog");
          open.addEventListener("click", () => dlg.open());
          return [open, dlg];
        },
      },
      {
        title: "2. Focus trap + scroll lock",
        description:
          "Tab cycles inside the surface and cannot reach the page behind. The body stops scrolling, and the scrollbar's width is compensated so nothing jumps sideways. Focus returns to the trigger on close.",
        codeTitle: "what Radix does for free",
        code: `<zen-dialog title="Try Tab, then Escape">
  <zen-button variant="outline">First</zen-button>
  <zen-button variant="outline">Second</zen-button>
  <zen-button variant="outline">Third</zen-button>
</zen-dialog>`,
        render: () => {
          const a = el("zen-button", { variant: "outline" }, "First");
          const b = el("zen-button", { variant: "outline" }, "Second");
          const c = el("zen-button", { variant: "outline" }, "Third");
          const dlg = el("zen-dialog", {
            title: "Try Tab, then Escape",
            description:
              "Tab cycles these three and wraps. Escape closes. Clicking the overlay closes. Focus goes back to the button you opened this with.",
          }) as DialogEl;
          dlg.append(a, b, c);
          const open = el("zen-button", { variant: "soft" }, "Open trap demo");
          open.addEventListener("click", () => dlg.open());
          return [open, dlg];
        },
      },
      {
        title: "3. Not dismissable (AlertDialog semantics)",
        description: "Escape and click-outside are off: the question must be answered.",
        codeTitle: "dismissable: false",
        code: `const dlg = document.createElement("zen-dialog");
dlg.dismissable = false;        // Escape / click-outside do nothing
dlg.showCloseButton = false;
dlg.footer = [keepBtn, deleteBtn];`,
        render: () => {
          const no = el("zen-button", { variant: "ghost" }, "Keep it");
          const yes = el("zen-button", { color: "error" }, "Delete anyway");
          const dlg = el("zen-dialog", {
            title: "This one you must answer",
            description: "Escape does nothing. Clicking outside does nothing. Pick one.",
          }) as DialogEl;
          (dlg as unknown as { dismissable: boolean }).dismissable = false;
          (dlg as unknown as { showCloseButton: boolean }).showCloseButton = false;
          (dlg as unknown as { footer: Node[] }).footer = [no, yes];
          no.addEventListener("click", () => dlg.close());
          yes.addEventListener("click", () => dlg.close());
          const open = el("zen-button", { color: "error", variant: "outline" }, "Open blocking dialog");
          open.addEventListener("click", () => dlg.open());
          return [open, dlg];
        },
      },
    ],
  });
}
