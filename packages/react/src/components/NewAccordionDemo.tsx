import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion/accordion";
import { Badge } from "./badge/badge";
import { CodeExample } from "./demo-helpers";

const FAQ = [
  {
    q: "When will my account be approved?",
    a: "Most accounts are approved within one business day. KYC documents are reviewed by a real human, so we'll email you the moment the review finishes.",
  },
  {
    q: "Can I change my email later?",
    a: "Yes — go to Settings → Security → Email and follow the verification link sent to the new address.",
  },
  {
    q: "What if my document is rejected?",
    a: "We'll send you a specific reason (e.g. blurry photo, expired ID) and let you re-upload. There's no limit on retries.",
  },
  {
    q: "Is my data shared with anyone?",
    a: "No — KYC documents are encrypted at rest, accessed only by the review team, and deleted after the legally-mandated retention window (5 years).",
  },
];

const NewAccordionDemo: React.FC = () => {
  return (
    <div className="demo-page">
      <h1>Accordion</h1>
      <p className="lede">
        Radix-backed collapsible-section list. Use for FAQ-style
        disclosures, long forms split into expandable sections,
        settings pages with grouped subsections, and "review your
        details" screens where the user wants to drill into specific
        groups without losing the surrounding context.
      </p>

      <section className="demo-section">
        <h2>1. Single (default) — one open at a time</h2>
        <CodeExample
          title='type="single" collapsible'
          description={`Only one section can be open. \`collapsible\` lets the user click the active section to close it (without it, one is always open).`}
          code={`<Accordion type="single" collapsible defaultValue="0">
  <AccordionItem value="0">
    <AccordionTrigger>When will my account be approved?</AccordionTrigger>
    <AccordionContent>Most accounts are approved within…</AccordionContent>
  </AccordionItem>
  …
</Accordion>`}
        >
          <div style={{ width: "100%" }}>
            <Accordion type="single" collapsible defaultValue="0">
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={String(i)}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Multiple — many open simultaneously</h2>
        <CodeExample
          title='type="multiple"'
          description="Useful when the user might want context from multiple sections at once — e.g. a review screen that shows Basic info, Address, and ID side-by-side."
          code={`<Accordion type="multiple" defaultValue={["0", "1"]}>
  …
</Accordion>`}
        >
          <div style={{ width: "100%" }}>
            <Accordion type="multiple" defaultValue={["0", "1"]}>
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={String(i)}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Trigger with rich content</h2>
        <CodeExample
          title="Anything goes in the trigger — Badge, icons, status indicators"
          description="The chevron is appended automatically and rotates on open."
          code={`<AccordionTrigger>
  <span className="inline-flex items-center gap-2">
    Personal info <Badge color="success" variant="soft">Complete</Badge>
  </span>
</AccordionTrigger>`}
        >
          <div style={{ width: "100%" }}>
            <Accordion type="single" collapsible defaultValue="basic">
              <AccordionItem value="basic">
                <AccordionTrigger>
                  <span className="zen-inline-flex zen-items-center zen-gap-2">
                    Basic info{" "}
                    <Badge color="success" variant="soft">
                      Complete
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  Name, email, phone — all filled in.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="address">
                <AccordionTrigger>
                  <span className="zen-inline-flex zen-items-center zen-gap-2">
                    Address{" "}
                    <Badge color="warning" variant="soft">
                      2 missing
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  Add your street and pin code to continue.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="id">
                <AccordionTrigger>
                  <span className="zen-inline-flex zen-items-center zen-gap-2">
                    Identity{" "}
                    <Badge color="error" variant="soft">
                      Rejected
                    </Badge>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  Re-upload your ID — the previous photo was too blurry.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled item</h2>
        <CodeExample
          title="disabled on AccordionItem locks the section closed"
          code={`<AccordionItem value="locked" disabled>
  <AccordionTrigger>Pro feature</AccordionTrigger>
  <AccordionContent>Upgrade to view.</AccordionContent>
</AccordionItem>`}
        >
          <div style={{ width: "100%" }}>
            <Accordion type="single" collapsible>
              <AccordionItem value="basic">
                <AccordionTrigger>Available section</AccordionTrigger>
                <AccordionContent>This one opens.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="locked" disabled>
                <AccordionTrigger>Locked section (Pro)</AccordionTrigger>
                <AccordionContent>Pro-only content.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewAccordionDemo;
