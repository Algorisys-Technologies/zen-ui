import * as React from "react";
import { MessagePopover, type Message } from "./message-popover/message-popover";
import { Input } from "./form/input/input";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const FIELDS = [
  { id: "mp-name", label: "Company name", required: true },
  { id: "mp-vat", label: "VAT number", required: true },
  { id: "mp-iban", label: "IBAN", required: true },
  { id: "mp-contact", label: "Contact email", required: false },
];

const MESSAGES: Message[] = [
  {
    id: "1",
    type: "error",
    title: "VAT number is not valid",
    subtitle: "VAT number",
    description: "Expected 9 digits after the country code, got 7.",
    targetId: "mp-vat",
  },
  {
    id: "2",
    type: "error",
    title: "IBAN is required for EUR payment terms",
    subtitle: "IBAN",
    targetId: "mp-iban",
  },
  {
    id: "3",
    type: "warning",
    title: "Contact email is missing",
    subtitle: "Contact email",
    description: "Approvals will be sent to the account owner instead.",
    targetId: "mp-contact",
  },
  {
    id: "4",
    type: "info",
    title: "Payment terms default to NET 30",
    subtitle: "Payment terms",
  },
];

const NewMessagePopoverDemo: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(MESSAGES);

  return (
    <div className="demo-page">
      <h1>MessagePopover</h1>
      <p className="lede">
        The validation summary a long form owes its user. Twenty fields and three
        errors means hunting; this collects the messages into one button, counts
        them by severity, and takes you to the field when you click one.
      </p>

      <section className="demo-section">
        <h2>1. Click a message to land on the field</h2>
        <CodeExample
          title="The navigation is the point"
          description="Open the popover and click a message: it closes, scrolls the offending field into view and focuses it. Focus matters as much as the scroll — scrollIntoView alone moves the page but leaves a keyboard user exactly where they were, which defeats the purpose. A target that is not focusable gets a temporary tabindex, removed on blur, so the DOM is left as it was found."
          code={`const messages = [
  { id: "1", type: "error", title: "VAT number is not valid",
    subtitle: "VAT number", targetId: "vat" },
  { id: "3", type: "warning", title: "Contact email is missing",
    subtitle: "Contact email", targetId: "contact" },
];

<MessagePopover messages={messages} />`}
        >
          <div className="zen-flex zen-flex-col zen-gap-4">
            <div className="zen-flex zen-items-center zen-gap-3">
              <MessagePopover messages={messages} />
              <span className="zen-text-sm zen-text-zen-muted-fg">
                ← open this, then click a message
              </span>
            </div>

            <div className="zen-grid zen-gap-3 sm:zen-grid-cols-2">
              {FIELDS.map((f) => (
                <label key={f.id} className="zen-flex zen-flex-col zen-gap-1 zen-text-sm">
                  <span className="zen-font-medium zen-text-zen-foreground">
                    {f.label}
                    {f.required ? <span className="zen-text-zen-error"> *</span> : null}
                  </span>
                  <Input id={f.id} placeholder={f.label} />
                </label>
              ))}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. The trigger reports the worst thing present</h2>
        <CodeExample
          title="Severity, not just a total"
          description="The button shows the count and the icon of the HIGHEST severity in the list, because '4 messages' is useless when one of them blocks submission. The severity filter appears only when more than one kind is present — a list of four errors does not need a chip that says 'Errors 4'. Clear the errors below and watch both the icon and the filter row change."
          code={`// error > warning > success > info — the trigger shows the worst.
<MessagePopover messages={messages} />`}
        >
          <div className="zen-flex zen-flex-wrap zen-items-center zen-gap-3">
            <MessagePopover messages={messages} />
            <Button size="sm" variant="outline" onClick={() => setMessages(MESSAGES)}>
              Reset
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMessages(messages.filter((m) => m.type !== "error"))}
            >
              Fix the errors
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMessages([])}>
              Clear all
            </Button>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Severity vocabulary</h2>
        <CodeExample
          title="The same four words the rest of the library uses"
          description="error, warning, success and info — ObjectState minus 'none'. Deliberately not a fifth scale: a message reads the same here as it does in Alert, Banner and ObjectStatus, and a caller mapping their own validation output only has to learn it once."
          code={`type MessageType = "error" | "warning" | "success" | "info";`}
        >
          <MessagePopover
            messages={[
              { id: "a", type: "error", title: "Error", subtitle: "Blocks submission" },
              { id: "b", type: "warning", title: "Warning", subtitle: "Worth a look" },
              { id: "c", type: "success", title: "Success", subtitle: "Passed a check" },
              { id: "d", type: "info", title: "Information", subtitle: "Just so you know" },
            ]}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Empty</h2>
        <CodeExample
          title="Nothing to report"
          description="An empty list still renders the trigger, so the control does not appear and disappear as the user fixes things — a button that vanishes takes its own affordance with it."
          code={`<MessagePopover messages={[]} emptyMessage="Nothing to fix" />`}
        >
          <MessagePopover messages={[]} emptyMessage="Nothing to fix" />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewMessagePopoverDemo;
