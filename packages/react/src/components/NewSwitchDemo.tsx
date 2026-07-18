import { useState } from "react";
import { Switch } from "./form/switch/switch";
import { CodeExample } from "./demo-helpers";

const NewSwitchDemo: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [autosave, setAutosave] = useState(true);

  return (
    <div className="demo-page">
      <h1>Switch (new — Radix-backed)</h1>
      <p className="lede">
        Boolean toggle built on <code>@radix-ui/react-switch</code>. Radix
        handles controlled / uncontrolled state, keyboard (space &amp; enter),
        ARIA (<code>role="switch"</code>, <code>aria-checked</code>), and form
        submission via <code>name</code>/<code>value</code>.
      </p>

      <section className="demo-section">
        <h2>1. Basic (controlled)</h2>
        <CodeExample
          title="checked + onCheckedChange"
          code={`const [enabled, setEnabled] = useState(false);

<Switch checked={enabled} onCheckedChange={setEnabled} />`}
        >
          <Switch checked={enabled} onCheckedChange={setEnabled} />
          <span style={{ marginLeft: "0.75rem", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            {enabled ? "On" : "Off"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Uncontrolled with defaultChecked</h2>
        <CodeExample
          title="Internal state"
          code={`<Switch defaultChecked />`}
        >
          <Switch defaultChecked />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="sm · md · lg"
          code={`<Switch size="sm" defaultChecked />
<Switch size="md" defaultChecked />
<Switch size="lg" defaultChecked />`}
        >
          <Switch size="sm" defaultChecked />
          <Switch size="md" defaultChecked />
          <Switch size="lg" defaultChecked />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With label</h2>
        <CodeExample
          title="Use a native <label> for proper a11y"
          description="Radix Switch is keyboard-focusable; pairing with a label gives click-to-toggle behaviour and screen-reader text."
          code={`<label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
  <Switch checked={autosave} onCheckedChange={setAutosave} />
  <span>Autosave drafts</span>
</label>`}
        >
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
            <Switch checked={autosave} onCheckedChange={setAutosave} />
            <span>Autosave drafts</span>
          </label>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled</h2>
        <CodeExample
          title="disabled prop"
          code={`<Switch disabled />
<Switch disabled defaultChecked />`}
        >
          <Switch disabled />
          <Switch disabled defaultChecked />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Custom colors via className</h2>
        <CodeExample
          title="Override token defaults with utility classes"
          code={`<Switch
  defaultChecked
  className="data-[state=checked]:bg-zen-success"
/>
<Switch
  defaultChecked
  className="data-[state=checked]:bg-zen-error"
/>`}
        >
          <Switch defaultChecked className="data-[state=checked]:zen-bg-zen-success" />
          <Switch defaultChecked className="data-[state=checked]:zen-bg-zen-error" />
          <Switch defaultChecked className="data-[state=checked]:zen-bg-zen-warning" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Form submission</h2>
        <CodeExample
          title="name + value lets Switch participate in a native form"
          description="Radix Switch mounts a hidden checkbox internally so the form submission includes its state."
          code={`<form onSubmit={(e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  alert("notifications = " + fd.get("notifications"));
}}>
  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
    <Switch name="notifications" value="on" defaultChecked />
    <span>Email notifications</span>
  </label>
  <button type="submit">Submit</button>
</form>`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              alert(`notifications = ${fd.get("notifications") || "(unchecked)"}`);
            }}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem" }}
          >
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <Switch name="notifications" value="on" defaultChecked />
              <span>Email notifications</span>
            </label>
            <button
              type="submit"
              style={{
                padding: "0.375rem 0.75rem",
                background: "var(--zen-color-primary)",
                color: "white",
                border: 0,
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.8125rem",
              }}
            >
              Submit
            </button>
          </form>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewSwitchDemo;
