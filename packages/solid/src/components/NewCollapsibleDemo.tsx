import { createSignal } from "solid-js";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible/collapsible";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewCollapsibleDemo = () => {
  const [open, setOpen] = createSignal(false);

  return (
    <DemoPage
      title="Collapsible"
      description="One region that shows and hides. Use Accordion when several sections coordinate; use this when the disclosure has no siblings."
    >
      <DemoSection
        title="Basic"
        codeTitle="The trigger is unstyled — it inherits whatever you put inside it"
        code={`<Collapsible>
  <CollapsibleTrigger class="zen-text-sm zen-font-medium">
    Advanced settings
  </CollapsibleTrigger>
  <CollapsibleContent class="zen-pt-2 zen-text-zen-muted-fg">
    Retries, timeouts and backoff.
  </CollapsibleContent>
</Collapsible>`}
      >
        <div class="zen-w-80">
          <Collapsible>
            <CollapsibleTrigger class="zen-text-sm zen-font-medium">
              Advanced settings
            </CollapsibleTrigger>
            <CollapsibleContent class="zen-pt-2 zen-text-zen-muted-fg">
              Retries, timeouts and backoff.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DemoSection>

      <DemoSection
        title="Open by default"
        codeTitle="defaultOpen — uncontrolled, the component owns the state after mount"
        code={`<Collapsible defaultOpen>
  <CollapsibleTrigger>What is included</CollapsibleTrigger>
  <CollapsibleContent>Two seats, 10 GB, email support.</CollapsibleContent>
</Collapsible>`}
      >
        <div class="zen-w-80">
          <Collapsible defaultOpen>
            <CollapsibleTrigger class="zen-text-sm zen-font-medium">
              What is included
            </CollapsibleTrigger>
            <CollapsibleContent class="zen-pt-2 zen-text-zen-muted-fg">
              Two seats, 10 GB, email support.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled"
        codeTitle="open + onOpenChange — the caller owns the state and can drive it from elsewhere"
        code={`const [open, setOpen] = createSignal(false);

<Button size="sm" variant="outline" onClick={() => setOpen(!open())}>
  {open() ? "Hide" : "Show"} the payload
</Button>

<Collapsible open={open()} onOpenChange={setOpen}>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}
      >
        <div class="zen-w-80 zen-space-y-2">
          <Button size="sm" variant="outline" onClick={() => setOpen(!open())}>
            {open() ? "Hide" : "Show"} the payload
          </Button>
          <Collapsible open={open()} onOpenChange={setOpen}>
            <CollapsibleContent class="zen-rounded-zen-md zen-bg-zen-muted zen-p-3 zen-font-mono zen-text-xs">
              {'{ "employee_id": 41, "status": "active" }'}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DemoSection>

      <DemoSection
        title="Disabled"
        codeTitle="disabled on the root — the trigger stops responding to click and Enter"
        code={`<Collapsible disabled>
  <CollapsibleTrigger>Locked section</CollapsibleTrigger>
  <CollapsibleContent>Never reachable.</CollapsibleContent>
</Collapsible>`}
      >
        <div class="zen-w-80">
          <Collapsible disabled>
            <CollapsibleTrigger class="zen-text-sm zen-font-medium">
              Locked section
            </CollapsibleTrigger>
            <CollapsibleContent class="zen-pt-2 zen-text-zen-muted-fg">
              Never reachable.
            </CollapsibleContent>
          </Collapsible>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewCollapsibleDemo;
