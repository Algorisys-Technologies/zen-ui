import { Label } from "./form/label/label";
import { Input } from "./form/input/input";
import { Checkbox } from "./form/checkbox/checkbox";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewLabelDemo = () => (
  <DemoPage
    title="Label"
    description="The <label> for a control that is not inside a Form. Inside <Form>, FormLabel is the right one — it wires `for` to the field id and turns red on error."
  >
    <DemoSection
      title="With a control"
      codeTitle="`for` matches the control's id, so clicking the label focuses it"
      code={`<div class="zen-space-y-1.5 zen-w-72">
  <Label for="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>`}
    >
      <div class="zen-space-y-1.5 zen-w-72">
        <Label for="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    </DemoSection>

    <DemoSection
      title="Required"
      codeTitle="The asterisk is decorative; assistive tech is told the word instead"
      code={`<Label for="legal-name" required>Legal name</Label>
<Input id="legal-name" />`}
    >
      <div class="zen-space-y-1.5 zen-w-72">
        <Label for="legal-name" required>
          Legal name
        </Label>
        <Input id="legal-name" placeholder="As printed on your passport" />
      </div>
    </DemoSection>

    <DemoSection
      title="Sizes"
      codeTitle="sm / md / lg — md is the default and matches FormLabel"
      code={`<Label size="sm">Small</Label>
<Label size="md">Medium</Label>
<Label size="lg">Large</Label>`}
    >
      <div class="zen-flex zen-items-baseline zen-gap-6">
        <Label size="sm">Small</Label>
        <Label size="md">Medium</Label>
        <Label size="lg">Large</Label>
      </div>
    </DemoSection>

    <DemoSection
      title="Beside a disabled control"
      codeTitle="Pass `disabled` to the label too — Kobalte nests its control, so the label cannot detect it via CSS"
      code={`<div class="zen-flex zen-items-center zen-gap-2">
  <Checkbox id="terms" disabled />
  <Label for="terms" disabled>Accept the terms</Label>
</div>`}
    >
      <div class="zen-space-y-3">
        <div class="zen-flex zen-items-center zen-gap-2">
          <Checkbox id="terms-on" />
          <Label for="terms-on">Accept the terms</Label>
        </div>
        <div class="zen-flex zen-items-center zen-gap-2">
          <Checkbox id="terms-off" disabled />
          <Label for="terms-off" disabled>
            Accept the terms
          </Label>
        </div>
      </div>
    </DemoSection>

    <DemoSection
      title="Disabled"
      codeTitle="Dims the label. It disables nothing — a label takes no input"
      code={`<Label for="frozen" disabled>Employee ID</Label>
<Input id="frozen" value="EMP-0041" disabled />`}
    >
      <div class="zen-space-y-1.5 zen-w-72">
        <Label for="frozen" disabled>
          Employee ID
        </Label>
        <Input id="frozen" value="EMP-0041" disabled />
      </div>
    </DemoSection>
  </DemoPage>
);

export default NewLabelDemo;
