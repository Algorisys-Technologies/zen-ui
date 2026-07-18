import { Sheet, type SheetSide } from "./sheet/sheet";
import { Button } from "./button/button";
import { Input } from "./form/input/input";
import { Checkbox } from "./form/checkbox/checkbox";
import { DemoPage } from "./demo-helpers";

const SIDES: SheetSide[] = ["right", "left", "top", "bottom"];

/** A labelled checkbox row, matching the React demo's filter list. */
function checkRow(label: string): HTMLElement {
  const row = document.createElement("label");
  row.className = "zen-flex zen-items-center zen-gap-2 zen-text-sm";
  const span = document.createElement("span");
  span.textContent = label;
  row.append(Checkbox({}).el, span);
  return row;
}

export default function SheetDemo(): HTMLElement {
  return DemoPage({
    title: "Sheet / Drawer",
    description:
      "Slide-in side panel, the vanilla port of React's Radix-Dialog Sheet. Reach for it over Dialog when a Dialog is too modal — long-form filter panels, edit screens that want the underlying list visible, KYC document review, onboarding, mobile bottom-sheets. Radix's compound tree collapses into one data-driven factory with an imperative open() / close() handle; portal, focus trap, scroll lock, Escape, click-outside and the exit slide are all hand-written. The overlay still dims the page so the user knows the sheet is the focus.",
    sections: [
      {
        title: "1. Default (right side)",
        codeTitle: 'Sheet({ side: "right", … }) — open() / close() IS the API',
        codeDescription:
          "React drives this by re-rendering a compound tree with open={true}. There is no re-render here, so the handle is imperative and the parts (title, description, footer) are data.",
        code: `const cancel = Button({ variant: "outline", color: "neutral", children: "Cancel" });
const apply = Button({ children: "Apply" });

const sheet = Sheet({
  side: "right",
  title: "Filters",
  description: "Narrow the dashboard down to just the rows you care about.",
  children: filterForm,          // any Node(s)
  footer: [cancel.el, apply.el],
});
cancel.el.addEventListener("click", () => sheet.close());

openBtn.el.addEventListener("click", () => sheet.open());`,
        render: () => {
          const search = document.createElement("label");
          search.className = "zen-text-sm";
          const searchLabel = document.createElement("span");
          searchLabel.className = "zen-block zen-text-xs zen-text-zen-muted-fg zen-mb-1";
          searchLabel.textContent = "Search";
          search.append(searchLabel, Input({ placeholder: "Type to filter…" }).el);

          const form = document.createElement("div");
          form.className = "zen-flex zen-flex-col zen-gap-3 zen-mt-2";
          form.append(search, checkRow("Active"), checkRow("Suspended"), checkRow("Invited"));

          const cancel = Button({ variant: "outline", color: "neutral", children: "Cancel" });
          const apply = Button({ children: "Apply" });
          const sheet = Sheet({
            side: "right",
            title: "Filters",
            description: "Narrow the dashboard down to just the rows you care about.",
            children: form,
            footer: [cancel.el, apply.el],
          });
          cancel.el.addEventListener("click", () => sheet.close());
          apply.el.addEventListener("click", () => sheet.close());

          const openBtn = Button({ children: "Open filters" });
          openBtn.el.addEventListener("click", () => sheet.open());
          return openBtn.el;
        },
      },
      {
        title: "2. Every side",
        codeTitle: 'side: "right" | "left" | "top" | "bottom"',
        codeDescription:
          "Right is the desktop default; bottom is the mobile-friendly bottom-sheet pattern. Each animates from / to its edge with a matching easing curve.",
        code: `for (const side of ["right", "left", "top", "bottom"]) {
  const sheet = Sheet({
    side,
    title: \`Sliding from \${side}\`,
    description: \`This panel slid in from the \${side} edge.\`,
    children: hint,
    footer: gotIt.el,
  });
  trigger.el.addEventListener("click", () => sheet.open());
}`,
        render: () =>
          SIDES.map((side) => {
            const hint = document.createElement("p");
            hint.className = "zen-text-sm zen-py-4 zen-m-0";
            hint.textContent = "Click outside, press Esc, or use the ✕ to close.";

            const gotIt = Button({ children: "Got it" });
            const sheet = Sheet({
              side,
              title: `Sliding from ${side}`,
              description: `This panel slid in from the ${side} edge.`,
              children: hint,
              footer: gotIt.el,
            });
            gotIt.el.addEventListener("click", () => sheet.close());

            const trigger = Button({ variant: "outline", color: "neutral", children: `side="${side}"` });
            trigger.el.addEventListener("click", () => sheet.open());
            return trigger.el;
          }),
      },
      {
        title: "3. Driving open state externally",
        codeTitle: "open() / close() + onOpenChange",
        codeDescription:
          "Something other than the trigger — a keyboard shortcut, a router event, a parent state-machine — can open the sheet. onOpenChange fires either way, so a caller keeping its own state stays in sync. This is the vanilla equivalent of React's controlled open / onOpenChange.",
        code: `const sheet = Sheet({
  title: "Controlled sheet",
  description: "Opened by a button outside its own trigger.",
  onOpenChange: (isOpen) => close.update({ disabled: !isOpen }),
});

open.el.addEventListener("click", () => sheet.open());
close.el.addEventListener("click", () => sheet.close());`,
        render: () => {
          const open = Button({ children: "Open (controlled)" });
          const close = Button({ variant: "outline", color: "neutral", disabled: true, children: "Close" });

          const body = document.createElement("p");
          body.className = "zen-text-sm zen-py-4 zen-m-0";
          body.textContent =
            "This sheet was opened by a button outside its own trigger, via onOpenChange.";

          const sheet = Sheet({
            side: "right",
            title: "Controlled sheet",
            description: "The caller owns the open state.",
            children: body,
            onOpenChange: (isOpen) => close.update({ disabled: !isOpen }),
          });
          open.el.addEventListener("click", () => sheet.open());
          close.el.addEventListener("click", () => sheet.close());

          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "0.5rem";
          row.append(open.el, close.el);
          return row;
        },
      },
      {
        title: "4. Without the close ✕",
        codeTitle: "showCloseButton: false",
        codeDescription:
          "For sheets where the only dismissal is via an explicit action button in the footer.",
        code: `const sheet = Sheet({
  showCloseButton: false,
  title: "Delete this workspace?",
  description: "This can't be undone. All data will be permanently removed.",
  footer: [cancel.el, del.el],
});`,
        render: () => {
          const cancel = Button({ variant: "outline", color: "neutral", children: "Cancel" });
          const del = Button({ color: "error", children: "Yes, delete" });
          const sheet = Sheet({
            side: "right",
            showCloseButton: false,
            title: "Delete this workspace?",
            description: "This can't be undone. All data will be permanently removed.",
            footer: [cancel.el, del.el],
          });
          cancel.el.addEventListener("click", () => sheet.close());
          del.el.addEventListener("click", () => sheet.close());

          const openBtn = Button({ color: "error", children: "Confirm destructive" });
          openBtn.el.addEventListener("click", () => sheet.open());
          return openBtn.el;
        },
      },
    ],
  });
}
