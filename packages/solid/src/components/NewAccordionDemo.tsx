import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion/accordion";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewAccordionDemo = () => (
  <DemoPage
    title="Accordion"
    description="Collapsible-section list. Built on Kobalte Accordion."
  >
    <DemoSection
      title="Single (default — Kobalte)"
      codeTitle="collapsible — one section open at a time"
      codeDescription={
        <>
          Kobalte takes <code>collapsible</code> + <code>multiple</code> flags
          rather than Radix's type prop, and value / defaultValue are always
          string[].
        </>
      }
      code={`<Accordion collapsible defaultValue={["basic"]}>
  <AccordionItem value="basic">
    <AccordionTrigger>Basic info</AccordionTrigger>
    <AccordionContent>
      Name, email, contact preferences live here.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="address">
    <AccordionTrigger>Address</AccordionTrigger>
    <AccordionContent>
      Where do we ship things? Add a default + alternates.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="billing">
    <AccordionTrigger>Billing</AccordionTrigger>
    <AccordionContent>Saved cards and recent invoices.</AccordionContent>
  </AccordionItem>
</Accordion>`}
    >
      <div class="zen-w-full zen-max-w-xl">
        <Accordion collapsible defaultValue={["basic"]}>
          <AccordionItem value="basic">
            <AccordionTrigger>Basic info</AccordionTrigger>
            <AccordionContent>
              Name, email, contact preferences live here.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="address">
            <AccordionTrigger>Address</AccordionTrigger>
            <AccordionContent>
              Where do we ship things? Add a default + alternates.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="billing">
            <AccordionTrigger>Billing</AccordionTrigger>
            <AccordionContent>
              Saved cards and recent invoices.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoSection>

    <DemoSection
      title="Multiple"
      codeTitle="multiple — several sections open at once"
      code={`<Accordion multiple defaultValue={["a"]}>
  <AccordionItem value="a">
    <AccordionTrigger>First section</AccordionTrigger>
    <AccordionContent>Several can be open at once.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionTrigger>Second section</AccordionTrigger>
    <AccordionContent>Useful for forms with context.</AccordionContent>
  </AccordionItem>
</Accordion>`}
    >
      <div class="zen-w-full zen-max-w-xl">
        <Accordion multiple defaultValue={["a"]}>
          <AccordionItem value="a">
            <AccordionTrigger>First section</AccordionTrigger>
            <AccordionContent>Several can be open at once.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Second section</AccordionTrigger>
            <AccordionContent>Useful for forms with context.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewAccordionDemo;
