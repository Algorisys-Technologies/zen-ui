import type { Message } from "@algorisys/zen-ui-vanilla";

function messagePopover(messages: Message[], emptyMessage?: string): HTMLElement {
  const el = document.createElement("zen-message-popover");
  (el as HTMLElement & { messages: Message[] }).messages = messages;
  if (emptyMessage) el.setAttribute("empty-message", emptyMessage);
  return el;
}

function input(id: string, label: string): HTMLElement {
  const el = document.createElement("zen-input");
  el.setAttribute("id", id);
  el.setAttribute("placeholder", label);
  return el;
}
import { DemoPage } from "./demo-helpers";

const FIELDS = [
  { id: "mp-name", label: "Company name", required: true },
  { id: "mp-vat", label: "VAT number", required: true },
  { id: "mp-iban", label: "IBAN", required: true },
  { id: "mp-contact", label: "Contact email", required: false },
];

const MESSAGES: Message[] = [
  { id: "1", type: "error", title: "VAT number is not valid", subtitle: "VAT number",
    description: "Expected 9 digits after the country code, got 7.", targetId: "mp-vat" },
  { id: "2", type: "error", title: "IBAN is required for EUR payment terms", subtitle: "IBAN",
    targetId: "mp-iban" },
  { id: "3", type: "warning", title: "Contact email is missing", subtitle: "Contact email",
    description: "Approvals will be sent to the account owner instead.", targetId: "mp-contact" },
  { id: "4", type: "info", title: "Payment terms default to NET 30", subtitle: "Payment terms" },
];

const SEVERITY_SAMPLE: Message[] = [
  { id: "a", type: "error", title: "Error", subtitle: "Blocks submission" },
  { id: "b", type: "warning", title: "Warning", subtitle: "Worth a look" },
  { id: "c", type: "success", title: "Success", subtitle: "Passed a check" },
  { id: "d", type: "info", title: "Information", subtitle: "Just so you know" },
];

function fieldGrid(makeInput: (id: string, label: string) => Node): HTMLElement {
  const grid = document.createElement("div");
  grid.className = "zen-grid zen-gap-3 sm:zen-grid-cols-2";
  for (const f of FIELDS) {
    const label = document.createElement("label");
    label.className = "zen-flex zen-flex-col zen-gap-1 zen-text-sm";
    const span = document.createElement("span");
    span.className = "zen-font-medium zen-text-zen-foreground";
    span.textContent = f.label + (f.required ? " *" : "");
    label.append(span, makeInput(f.id, f.label));
    grid.append(label);
  }
  return grid;
}

export default function MessagePopoverDemo(): HTMLElement {
  return DemoPage({
    title: "MessagePopover",
    description:
      "The validation summary a long form owes its user. Twenty fields and three errors means hunting; this collects the messages into one button, counts them by severity, and takes you to the field when you click one.",
    sections: [
      {
        title: "1. Click a message to land on the field",
        codeTitle: "The navigation is the point",
        codeDescription:
          "Open the popover and click a message: it closes, scrolls the offending field into view and focuses it. Focus matters as much as the scroll \u2014 scrollIntoView alone moves the page but leaves a keyboard user exactly where they were. A target that is not focusable gets a temporary tabindex, removed on blur.",
        code: `<zen-message-popover></zen-message-popover>
// messages is a PROPERTY, not an attribute:
el.messages = [
    { id: "1", type: "error", title: "VAT number is not valid",
      subtitle: "VAT number", targetId: "vat" },
  ],
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-4";
          const row = document.createElement("div");
          row.className = "zen-flex zen-items-center zen-gap-3";
          const hint = document.createElement("span");
          hint.className = "zen-text-sm zen-text-zen-muted-fg";
          hint.textContent = "\u2190 open this, then click a message";
          row.append(messagePopover(MESSAGES), hint);
          wrap.append(row, fieldGrid((id, label) => input(id, label)));
          return [wrap];
        },
      },
      {
        title: "2. The trigger reports the worst thing present",
        codeTitle: "Severity, not just a total",
        codeDescription:
          "The button shows the count and the icon of the HIGHEST severity in the list, because '4 messages' is useless when one of them blocks submission. The severity filter appears only when more than one kind is present.",
        code: `<!-- error > warning > success > info \u2014 the trigger shows the worst -->
<zen-message-popover></zen-message-popover>`,
        render: () => [messagePopover(MESSAGES)],
      },
      {
        title: "3. Severity vocabulary",
        codeTitle: "The same four words the rest of the library uses",
        codeDescription:
          "error, warning, success and info \u2014 ObjectState minus 'none'. Deliberately not a fifth scale: a message reads the same here as it does in Alert, Banner and ObjectStatus.",
        code: `type MessageType = "error" | "warning" | "success" | "info";`,
        render: () => [messagePopover(SEVERITY_SAMPLE)],
      },
      {
        title: "4. Empty",
        codeTitle: "Nothing to report",
        codeDescription:
          "An empty list still renders the trigger, so the control does not appear and disappear as the user fixes things \u2014 a button that vanishes takes its own affordance with it.",
        code: `<zen-message-popover empty-message="Nothing to fix"></zen-message-popover>`,
        render: () => [messagePopover([], "Nothing to fix")],
      },
    ],
  });
}
