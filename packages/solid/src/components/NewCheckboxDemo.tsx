import { createSignal } from "solid-js";
import { Checkbox } from "./form/checkbox/checkbox";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewCheckboxDemo = () => {
  const [a, setA] = createSignal(false);
  return (
    <DemoPage
      title="Checkbox"
      description="Three-state checkbox (off / on / indeterminate) built on Kobalte Checkbox."
    >
      <DemoSection
        title="Sizes"
        codeTitle="sm · md · lg"
        codeDescription={
          <>
            <code>label</code> renders an inline Kobalte label to the right of
            the box — no wrapping <code>&lt;label&gt;</code> needed.
          </>
        }
        code={`<Checkbox size="sm" defaultChecked label="Small" />
<Checkbox size="md" defaultChecked label="Medium" />
<Checkbox size="lg" defaultChecked label="Large" />`}
      >
        <Checkbox size="sm" defaultChecked label="Small" />
        <Checkbox size="md" defaultChecked label="Medium" />
        <Checkbox size="lg" defaultChecked label="Large" />
      </DemoSection>

      <DemoSection
        title="External label association"
        codeTitle="<label for> targets the native control"
        codeDescription={
          <>
            A caller's <code>id</code> lands on the hidden native input, so a
            standalone <code>&lt;label for&gt;</code> associates with the box and
            toggles it — clicking the text checks it.
          </>
        }
        code={`<Checkbox id="terms" />
<label for="terms">I accept the terms</label>`}
      >
        <div class="zen-flex zen-items-center zen-gap-2">
          <Checkbox id="terms" />
          <label for="terms" class="zen-text-sm">I accept the terms</label>
        </div>
      </DemoSection>

      <DemoSection
        title="Controlled"
        codeTitle="checked + onChange"
        codeDescription={
          <>
            onChange hands you a plain boolean, so a setter can be passed
            straight through. Drop <code>checked</code> and use{" "}
            <code>defaultChecked</code> to go uncontrolled.
          </>
        }
        code={`const [a, setA] = createSignal(false);

<Checkbox
  checked={a()}
  onChange={setA}
  label={a() ? "Checked" : "Unchecked"}
/>`}
      >
        <Checkbox checked={a()} onChange={setA} label={a() ? "Checked" : "Unchecked"} />
      </DemoSection>

      <DemoSection
        title="Indeterminate"
        codeTitle="indeterminate is a first-class prop"
        codeDescription="Kobalte exposes indeterminate alongside checked, so the third state needs no DOM ref-poking. Typical use: a parent 'select all' box driven by how many children are ticked."
        code={`<Checkbox indeterminate label="Select all" />`}
      >
        <Checkbox indeterminate label="Select all" />
      </DemoSection>

      <DemoSection
        title="Disabled"
        codeTitle="disabled prop, checked or unchecked"
        code={`<Checkbox disabled label="Off (disabled)" />
<Checkbox defaultChecked disabled label="On (disabled)" />`}
      >
        <Checkbox disabled label="Off (disabled)" />
        <Checkbox defaultChecked disabled label="On (disabled)" />
      </DemoSection>
    </DemoPage>
  );
};

export default NewCheckboxDemo;
