import { useState } from "react";
import { NumberField } from "./form/number-field/number-field";
import { CodeExample } from "./demo-helpers";

const NewNumberFieldDemo: React.FC = () => {
  const [qty, setQty] = useState<number | null>(1);

  return (
    <div className="demo-page">
      <h1>NumberField (new — shadcn-style)</h1>
      <p className="lede">
        Stepper input: number <code>&lt;input&gt;</code> with −/+ buttons.
        No Radix primitive yet (planned upstream); forwardRef'd, clamps to
        min/max, keyboard arrows on the input still work natively.
      </p>

      <section className="demo-section">
        <h2>1. Basic (controlled)</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [qty, setQty] = useState<number | null>(1);

<NumberField value={qty} onValueChange={setQty} min={0} max={10} />`}
        >
          <NumberField value={qty} onValueChange={setQty} min={0} max={10} />
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            qty: {qty ?? "(empty)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Uncontrolled</h2>
        <CodeExample
          title="defaultValue"
          code={`<NumberField defaultValue={5} min={0} max={20} />`}
        >
          <NumberField defaultValue={5} min={0} max={20} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Custom step</h2>
        <CodeExample
          title="step=5 snaps to 0/5/10/15/20"
          code={`<NumberField defaultValue={0} min={0} max={20} step={5} />`}
        >
          <NumberField defaultValue={0} min={0} max={20} step={5} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Decimal step</h2>
        <CodeExample
          title="step=0.1 for fractional values"
          code={`<NumberField defaultValue={0.5} min={0} max={1} step={0.1} />`}
        >
          <NumberField defaultValue={0.5} min={0} max={1} step={0.1} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Min / max clamping</h2>
        <CodeExample
          title="−/+ disable at bounds; typing past max clamps back"
          code={`<NumberField defaultValue={5} min={0} max={5} />`}
        >
          <NumberField defaultValue={5} min={0} max={5} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled</h2>
        <CodeExample
          title="disabled prop on the wrapper"
          code={`<NumberField defaultValue={3} disabled />`}
        >
          <NumberField defaultValue={3} disabled />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewNumberFieldDemo;
