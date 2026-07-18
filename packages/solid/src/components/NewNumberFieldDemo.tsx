import { createSignal } from "solid-js";
import { NumberField } from "./form/number-field/number-field";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewNumberFieldDemo = () => {
  const [n, setN] = createSignal<number | null>(0);
  return (
    <DemoPage
      title="NumberField"
      description="Number input with stepper buttons. Native arrows still work."
    >
      <DemoSection
        title="Controlled"
        codeTitle="value + onValueChange — clamps to min/max"
        code={`const [n, setN] = createSignal<number | null>(0);

<NumberField value={n()} onValueChange={setN} min={0} max={100} step={5} />
<span>Value: {n() ?? "—"}</span>`}
      >
        <NumberField value={n()} onValueChange={setN} min={0} max={100} step={5} />
        <span class="zen-text-sm zen-text-zen-muted-fg">Value: {n() ?? "—"}</span>
      </DemoSection>
      <DemoSection
        title="Default + step"
        codeTitle="Uncontrolled, with a fractional step"
        code={`<NumberField defaultValue={2.5} step={0.5} />`}
      >
        <NumberField defaultValue={2.5} step={0.5} />
      </DemoSection>
      <DemoSection
        title="Disabled"
        codeTitle="disabled greys the input and both steppers"
        code={`<NumberField defaultValue={10} disabled />`}
      >
        <NumberField defaultValue={10} disabled />
      </DemoSection>
    </DemoPage>
  );
};

export default NewNumberFieldDemo;
