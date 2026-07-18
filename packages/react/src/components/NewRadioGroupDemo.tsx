import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "./form/radio/radio-group";
import { CodeExample } from "./demo-helpers";

const NewRadioGroupDemo: React.FC = () => {
  const [plan, setPlan] = useState("pro");

  return (
    <div className="demo-page">
      <h1>RadioGroup (new — Radix-backed)</h1>
      <p className="lede">
        Mutually-exclusive selection built on{" "}
        <code>@radix-ui/react-radio-group</code>. Radix provides roving
        tabindex, arrow-key navigation, ARIA, and form submission.
      </p>

      <section className="demo-section">
        <h2>1. Basic (controlled)</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [plan, setPlan] = useState("pro");

<RadioGroup value={plan} onValueChange={setPlan}>
  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <RadioGroupItem value="free" id="r-free" />
    <span>Free</span>
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <RadioGroupItem value="pro" id="r-pro" />
    <span>Pro</span>
  </label>
  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <RadioGroupItem value="team" id="r-team" />
    <span>Team</span>
  </label>
</RadioGroup>`}
        >
          <RadioGroup value={plan} onValueChange={setPlan}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <RadioGroupItem value="free" id="r-free" />
              <span>Free</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <RadioGroupItem value="pro" id="r-pro" />
              <span>Pro</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <RadioGroupItem value="team" id="r-team" />
              <span>Team</span>
            </label>
          </RadioGroup>
          <span style={{ marginLeft: "0.75rem", fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            selected: {plan}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Uncontrolled</h2>
        <CodeExample
          title="defaultValue"
          code={`<RadioGroup defaultValue="b">
  <RadioGroupItem value="a" id="ua" /> <label htmlFor="ua">A</label>
  <RadioGroupItem value="b" id="ub" /> <label htmlFor="ub">B</label>
</RadioGroup>`}
        >
          <RadioGroup defaultValue="b">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <RadioGroupItem value="a" id="ua" />
              <span>A</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <RadioGroupItem value="b" id="ub" />
              <span>B</span>
            </label>
          </RadioGroup>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="size sm · md · lg on RadioGroupItem"
          code={`<RadioGroupItem size="sm" value="a" />
<RadioGroupItem size="md" value="b" />
<RadioGroupItem size="lg" value="c" />`}
        >
          <RadioGroup defaultValue="b" style={{ display: "flex", flexDirection: "row", gap: "0.75rem" }}>
            <RadioGroupItem size="sm" value="a" id="sz-a" />
            <RadioGroupItem size="md" value="b" id="sz-b" />
            <RadioGroupItem size="lg" value="c" id="sz-c" />
          </RadioGroup>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Horizontal layout</h2>
        <CodeExample
          title="Override the default grid gap with a row layout"
          code={`<RadioGroup style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
  ...
</RadioGroup>`}
        >
          <RadioGroup
            defaultValue="opt2"
            style={{ display: "flex", flexDirection: "row", gap: "1rem" }}
          >
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
              <RadioGroupItem value="opt1" id="h1" /> Option 1
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
              <RadioGroupItem value="opt2" id="h2" /> Option 2
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
              <RadioGroupItem value="opt3" id="h3" /> Option 3
            </label>
          </RadioGroup>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled options</h2>
        <CodeExample
          title="Per-item disabled prop"
          code={`<RadioGroupItem value="locked" disabled />`}
        >
          <RadioGroup defaultValue="a">
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
              <RadioGroupItem value="a" id="d-a" /> Available
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.875rem", color: "var(--zen-color-muted-fg)" }}>
              <RadioGroupItem value="locked" id="d-b" disabled /> Locked
            </label>
          </RadioGroup>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Form submission</h2>
        <CodeExample
          title="name on RadioGroup serializes to a single FormData entry"
          code={`<form onSubmit={(e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  alert("priority = " + fd.get("priority"));
}}>
  <RadioGroup name="priority" defaultValue="medium">
    ...
  </RadioGroup>
  <button type="submit">Submit</button>
</form>`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              alert(`priority = ${fd.get("priority")}`);
            }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <RadioGroup
              name="priority"
              defaultValue="medium"
              style={{ display: "flex", flexDirection: "row", gap: "0.75rem" }}
            >
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                <RadioGroupItem value="low" id="p-low" /> Low
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                <RadioGroupItem value="medium" id="p-med" /> Medium
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem" }}>
                <RadioGroupItem value="high" id="p-high" /> High
              </label>
            </RadioGroup>
            <button
              type="submit"
              style={{
                width: "fit-content",
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

export default NewRadioGroupDemo;
