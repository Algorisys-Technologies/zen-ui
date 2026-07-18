import { createSignal } from "solid-js";
import { RadioGroup, RadioGroupItem } from "./form/radio/radio-group";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewRadioGroupDemo = () => {
  const [plan, setPlan] = createSignal("pro");
  return (
    <DemoPage
      title="RadioGroup"
      description="Mutually exclusive options, full keyboard nav. Built on Kobalte RadioGroup."
    >
      <DemoSection
        title="Vertical (default)"
        codeTitle="value + onChange — Kobalte's controlled API"
        code={`const [plan, setPlan] = createSignal("pro");

<RadioGroup value={plan()} onChange={setPlan}>
  <RadioGroupItem value="free">Free</RadioGroupItem>
  <RadioGroupItem value="pro">Pro</RadioGroupItem>
  <RadioGroupItem value="enterprise">Enterprise</RadioGroupItem>
</RadioGroup>`}
      >
        <RadioGroup value={plan()} onChange={setPlan}>
          <RadioGroupItem value="free">Free</RadioGroupItem>
          <RadioGroupItem value="pro">Pro</RadioGroupItem>
          <RadioGroupItem value="enterprise">Enterprise</RadioGroupItem>
        </RadioGroup>
      </DemoSection>

      <DemoSection
        title="External label association"
        codeTitle="<label for> targets each item's native input"
        codeDescription={
          <>
            Each item's <code>id</code> lands on its native radio input, so a
            standalone <code>&lt;label for&gt;</code> associates and selects it —
            clicking the text checks the radio.
          </>
        }
        code={`<RadioGroup>
  <RadioGroupItem value="a" id="opt-a" /> <label for="opt-a">Option A</label>
  <RadioGroupItem value="b" id="opt-b" /> <label for="opt-b">Option B</label>
</RadioGroup>`}
      >
        <RadioGroup>
          <div class="zen-flex zen-items-center zen-gap-2">
            <RadioGroupItem value="a" id="opt-a" />
            <label for="opt-a" class="zen-text-sm">Option A</label>
          </div>
          <div class="zen-flex zen-items-center zen-gap-2">
            <RadioGroupItem value="b" id="opt-b" />
            <label for="opt-b" class="zen-text-sm">Option B</label>
          </div>
        </RadioGroup>
      </DemoSection>

      <DemoSection
        title="Horizontal"
        codeTitle="orientation switches the group to a flex row"
        code={`<RadioGroup defaultValue="medium" orientation="horizontal">
  <RadioGroupItem value="small">Small</RadioGroupItem>
  <RadioGroupItem value="medium">Medium</RadioGroupItem>
  <RadioGroupItem value="large">Large</RadioGroupItem>
</RadioGroup>`}
      >
        <RadioGroup defaultValue="medium" orientation="horizontal">
          <RadioGroupItem value="small">Small</RadioGroupItem>
          <RadioGroupItem value="medium">Medium</RadioGroupItem>
          <RadioGroupItem value="large">Large</RadioGroupItem>
        </RadioGroup>
      </DemoSection>

      <DemoSection
        title="Sizes"
        codeTitle="size sm · md · lg on RadioGroupItem"
        code={`<RadioGroup defaultValue="md" orientation="horizontal">
  <RadioGroupItem size="sm" value="sm">SM</RadioGroupItem>
  <RadioGroupItem size="md" value="md">MD</RadioGroupItem>
  <RadioGroupItem size="lg" value="lg">LG</RadioGroupItem>
</RadioGroup>`}
      >
        <RadioGroup defaultValue="md" orientation="horizontal">
          <RadioGroupItem size="sm" value="sm">SM</RadioGroupItem>
          <RadioGroupItem size="md" value="md">MD</RadioGroupItem>
          <RadioGroupItem size="lg" value="lg">LG</RadioGroupItem>
        </RadioGroup>
      </DemoSection>

      <DemoSection
        title="Disabled"
        codeTitle="disabled on the group; RadioGroupItem takes it per-item too"
        code={`<RadioGroup defaultValue="b" disabled orientation="horizontal">
  <RadioGroupItem value="a">A</RadioGroupItem>
  <RadioGroupItem value="b">B</RadioGroupItem>
  <RadioGroupItem value="c">C</RadioGroupItem>
</RadioGroup>`}
      >
        <RadioGroup defaultValue="b" disabled orientation="horizontal">
          <RadioGroupItem value="a">A</RadioGroupItem>
          <RadioGroupItem value="b">B</RadioGroupItem>
          <RadioGroupItem value="c">C</RadioGroupItem>
        </RadioGroup>
      </DemoSection>
    </DemoPage>
  );
};

export default NewRadioGroupDemo;
