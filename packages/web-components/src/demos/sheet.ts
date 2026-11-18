import { DemoPage } from "./demo-helpers";

/**
 * Sheet demo — the web-components port. <zen-sheet> slides a panel in from an
 * edge; its open()/close() handle is forwarded onto the element. `children` are
 * slotted light-DOM; `footer` is a JS property (an array of Nodes).
 * `showCloseButton` / `dismissable` default TRUE and are JS properties.
 */

type SheetEl = HTMLElement & { open(): void; close(): void };

const SIDES = ["right", "left", "top", "bottom"] as const;

function button(text: string, attrs: Record<string, string> = {}): HTMLElement {
  const b = document.createElement("zen-button");
  for (const [k, v] of Object.entries(attrs)) b.setAttribute(k, v);
  b.textContent = text;
  return b;
}

function input(placeholder: string): HTMLElement {
  const i = document.createElement("zen-input");
  i.setAttribute("placeholder", placeholder);
  return i;
}

/** A labelled checkbox row, matching the React demo's filter list. */
function checkRow(label: string): HTMLElement {
  const row = document.createElement("label");
  row.className = "zen-flex zen-items-center zen-gap-2 zen-text-sm";
  const span = document.createElement("span");
  span.textContent = label;
  row.append(document.createElement("zen-checkbox"), span);
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
        codeTitle: "open() / close() IS the API",
        codeDescription:
          "React drives this by re-rendering a compound tree with open={true}. There is no re-render here, so the handle is imperative and the parts (title, description, footer) are data.",
        code: `const sheet = document.createElement("zen-sheet");
sheet.setAttribute("side", "right");
sheet.setAttribute("title", "Filters");
sheet.append(filterForm);            // any Node(s) — slotted children
sheet.footer = [cancelBtn, applyBtn];
document.body.append(sheet);

openBtn.addEventListener("click", () => sheet.open());`,
        render: () => {
          const search = document.createElement("label");
          search.className = "zen-text-sm";
          const searchLabel = document.createElement("span");
          searchLabel.className = "zen-block zen-text-xs zen-text-zen-muted-fg zen-mb-1";
          searchLabel.textContent = "Search";
          search.append(searchLabel, input("Type to filter…"));

          const form = document.createElement("div");
          form.className = "zen-flex zen-flex-col zen-gap-3 zen-mt-2";
          form.append(search, checkRow("Active"), checkRow("Suspended"), checkRow("Invited"));

          const cancel = button("Cancel", { variant: "outline", color: "neutral" });
          const apply = button("Apply");
          const sheet = document.createElement("zen-sheet") as SheetEl;
          sheet.setAttribute("side", "right");
          sheet.setAttribute("title", "Filters");
          sheet.setAttribute("description", "Narrow the dashboard down to just the rows you care about.");
          sheet.append(form);
          Object.assign(sheet, { footer: [cancel, apply] });
          cancel.addEventListener("click", () => sheet.close());
          apply.addEventListener("click", () => sheet.close());

          const openBtn = button("Open filters");
          openBtn.addEventListener("click", () => sheet.open());

          const host = document.createElement("div");
          host.append(openBtn, sheet);
          return host;
        },
      },
      {
        title: "2. Every side",
        codeTitle: 'side: "right" | "left" | "top" | "bottom"',
        codeDescription:
          "Right is the desktop default; bottom is the mobile-friendly bottom-sheet pattern. Each animates from / to its edge with a matching easing curve.",
        code: `<zen-sheet side="right"></zen-sheet>
<zen-sheet side="left"></zen-sheet>
<zen-sheet side="top"></zen-sheet>
<zen-sheet side="bottom"></zen-sheet>`,
        render: () =>
          SIDES.map((side) => {
            const hint = document.createElement("p");
            hint.className = "zen-text-sm zen-py-4 zen-m-0";
            hint.textContent = "Click outside, press Esc, or use the ✕ to close.";

            const gotIt = button("Got it");
            const sheet = document.createElement("zen-sheet") as SheetEl;
            sheet.setAttribute("side", side);
            sheet.setAttribute("title", `Sliding from ${side}`);
            sheet.setAttribute("description", `This panel slid in from the ${side} edge.`);
            sheet.append(hint);
            Object.assign(sheet, { footer: [gotIt] });
            gotIt.addEventListener("click", () => sheet.close());

            const trigger = button(`side="${side}"`, { variant: "outline", color: "neutral" });
            trigger.addEventListener("click", () => sheet.open());

            const host = document.createElement("span");
            host.append(trigger, sheet);
            return host;
          }),
      },
      {
        title: "3. Driving open state externally",
        codeTitle: "open() / close() + zen-open-change",
        codeDescription:
          "Something other than the trigger — a keyboard shortcut, a router event, a parent state-machine — can open the sheet. zen-open-change fires either way, so a caller keeping its own state stays in sync. This is the vanilla equivalent of React's controlled open / onOpenChange.",
        code: `sheet.addEventListener("zen-open-change", (e) => {
  closeBtn.toggleAttribute("disabled", !e.detail);
});
openBtn.addEventListener("click", () => sheet.open());
closeBtn.addEventListener("click", () => sheet.close());`,
        render: () => {
          const open = button("Open (controlled)");
          const close = button("Close", { variant: "outline", color: "neutral", disabled: "" });

          const body = document.createElement("p");
          body.className = "zen-text-sm zen-py-4 zen-m-0";
          body.textContent =
            "This sheet was opened by a button outside its own trigger, via zen-open-change.";

          const sheet = document.createElement("zen-sheet") as SheetEl;
          sheet.setAttribute("side", "right");
          sheet.setAttribute("title", "Controlled sheet");
          sheet.setAttribute("description", "The caller owns the open state.");
          sheet.append(body);
          sheet.addEventListener("zen-open-change", (e) => {
            close.toggleAttribute("disabled", !((e as CustomEvent).detail as boolean));
          });
          open.addEventListener("click", () => sheet.open());
          close.addEventListener("click", () => sheet.close());

          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.gap = "0.5rem";
          row.append(open, close, sheet);
          return row;
        },
      },
      {
        title: "4. Without the close ✕",
        codeTitle: "showCloseButton: false",
        codeDescription:
          "For sheets where the only dismissal is via an explicit action button in the footer.",
        code: `const sheet = document.createElement("zen-sheet");
sheet.showCloseButton = false;         // default is true → set the JS property
sheet.footer = [cancelBtn, deleteBtn];`,
        render: () => {
          const cancel = button("Cancel", { variant: "outline", color: "neutral" });
          const del = button("Yes, delete", { color: "error" });
          const sheet = document.createElement("zen-sheet") as SheetEl;
          sheet.setAttribute("side", "right");
          sheet.setAttribute("title", "Delete this workspace?");
          sheet.setAttribute("description", "This can't be undone. All data will be permanently removed.");
          Object.assign(sheet, { showCloseButton: false, footer: [cancel, del] });
          cancel.addEventListener("click", () => sheet.close());
          del.addEventListener("click", () => sheet.close());

          const openBtn = button("Confirm destructive", { color: "error" });
          openBtn.addEventListener("click", () => sheet.open());

          const host = document.createElement("div");
          host.append(openBtn, sheet);
          return host;
        },
      },
    ],
  });
}
