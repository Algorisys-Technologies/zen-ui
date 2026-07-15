import { createSignal } from "solid-js";
import { Switch } from "./form/switch/switch";
import { DemoPage, DemoSection } from "./demo-helpers";

const NewSwitchDemo = () => {
  const [v, setV] = createSignal(false);
  return (
    <DemoPage
      title="Switch"
      description="Two-state toggle built on Kobalte Switch. Supports controlled + uncontrolled."
    >
      <DemoSection
        title="Sizes"
        codeTitle="sm · md · lg"
        codeDescription={
          <>
            Pass <code>label</code> and Kobalte wires up the{" "}
            <code>&lt;label&gt;</code> for you — no external{" "}
            <code>&lt;label for&gt;</code> needed.
          </>
        }
        code={`<Switch size="sm" defaultChecked label="Small" />
<Switch size="md" defaultChecked label="Medium" />
<Switch size="lg" defaultChecked label="Large" />`}
      >
        <Switch size="sm" defaultChecked label="Small" />
        <Switch size="md" defaultChecked label="Medium" />
        <Switch size="lg" defaultChecked label="Large" />
      </DemoSection>

      <DemoSection
        title="Controlled"
        codeTitle="checked + onChange"
        code={`const [v, setV] = createSignal(false);

<Switch checked={v()} onChange={setV} label={v() ? "On" : "Off"} />`}
      >
        <Switch checked={v()} onChange={setV} label={v() ? "On" : "Off"} />
      </DemoSection>

      <DemoSection
        title="Disabled"
        codeTitle="disabled prop"
        code={`<Switch disabled label="Off (disabled)" />
<Switch defaultChecked disabled label="On (disabled)" />`}
      >
        <Switch disabled label="Off (disabled)" />
        <Switch defaultChecked disabled label="On (disabled)" />
      </DemoSection>
    </DemoPage>
  );
};

export default NewSwitchDemo;
