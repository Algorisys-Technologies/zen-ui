import * as React from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible/collapsible";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const NewCollapsibleDemo: React.FC = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="demo-page">
      <h1>Collapsible</h1>
      <p className="lede">
        One region that shows and hides. Accordion is for a <em>set</em> of
        sections that coordinate — one open at a time, or several. Collapsible is
        the single independent disclosure: a "show more" on a card, an
        advanced-options block, a raw payload under a summary. Reaching for a
        one-item Accordion instead brings a value prop, a heading and an item
        wrapper for a region that has no siblings to coordinate with.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample
          title="Trigger + Content"
          description="The trigger renders unstyled — the disclosure surface is usually your own row or heading, not a button we should paint. It still gets the button reset, the focus ring and the cursor."
          code={`<Collapsible>
  <CollapsibleTrigger className="zen-text-sm zen-font-medium">
    Advanced settings
  </CollapsibleTrigger>
  <CollapsibleContent className="zen-pt-2 zen-text-zen-muted-fg">
    Retries, timeouts and backoff.
  </CollapsibleContent>
</Collapsible>`}
        >
          <div className="zen-w-80">
            <Collapsible>
              <CollapsibleTrigger className="zen-text-sm zen-font-medium">
                Advanced settings
              </CollapsibleTrigger>
              <CollapsibleContent className="zen-pt-2 zen-text-zen-muted-fg">
                Retries, timeouts and backoff.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Open by default</h2>
        <CodeExample
          title="defaultOpen"
          description="Uncontrolled — the component owns the state after mount. Use when the content is the point of the section and collapsing is the exception."
          code={`<Collapsible defaultOpen>
  <CollapsibleTrigger>What is included</CollapsibleTrigger>
  <CollapsibleContent>Two seats, 10 GB, email support.</CollapsibleContent>
</Collapsible>`}
        >
          <div className="zen-w-80">
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="zen-text-sm zen-font-medium">
                What is included
              </CollapsibleTrigger>
              <CollapsibleContent className="zen-pt-2 zen-text-zen-muted-fg">
                Two seats, 10 GB, email support.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Controlled</h2>
        <CodeExample
          title="open + onOpenChange"
          description="The caller owns the state, so anything on the page can drive it — here a Button outside the Collapsible entirely."
          code={`const [open, setOpen] = React.useState(false);

<Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
  {open ? "Hide" : "Show"} the payload
</Button>

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
        >
          <div className="zen-w-80 zen-space-y-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
              {open ? "Hide" : "Show"} the payload
            </Button>
            <Collapsible open={open} onOpenChange={setOpen}>
              <CollapsibleContent className="zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-font-mono zen-text-xs">
                {'{ "employee_id": 41, "status": "active" }'}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="disabled"
          description="On the root, so the trigger stops responding to both click and Enter — a section gated behind a permission or a plan."
          code={`<Collapsible disabled>
  <CollapsibleTrigger>Locked section</CollapsibleTrigger>
  <CollapsibleContent>Never reachable.</CollapsibleContent>
</Collapsible>`}
        >
          <div className="zen-w-80">
            <Collapsible disabled>
              <CollapsibleTrigger className="zen-text-sm zen-font-medium">
                Locked section
              </CollapsibleTrigger>
              <CollapsibleContent className="zen-pt-2 zen-text-zen-muted-fg">
                Never reachable.
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewCollapsibleDemo;
