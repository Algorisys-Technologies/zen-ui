import { useState } from "react";
import { Checkbox } from "./form/checkbox/checkbox";
import { CodeExample } from "./demo-helpers";

const TOPICS = ["Updates", "Promotions", "Security"] as const;

const NewCheckboxDemo: React.FC = () => {
  const [agreed, setAgreed] = useState(false);
  const [selected, setSelected] = useState<string[]>(["Updates"]);

  const all = selected.length === TOPICS.length;
  const some = selected.length > 0 && !all;
  const parent: boolean | "indeterminate" = all ? true : some ? "indeterminate" : false;

  return (
    <div className="demo-page">
      <h1>Checkbox (new — Radix-backed)</h1>
      <p className="lede">
        Built on <code>@radix-ui/react-checkbox</code> with native tri-state
        (true / false / <code>"indeterminate"</code>) — no DOM ref-poking
        needed. Keyboard (Space), ARIA, and form submission are handled by
        Radix.
      </p>

      <section className="demo-section">
        <h2>1. Basic (controlled)</h2>
        <CodeExample
          title="checked + onCheckedChange"
          code={`const [agreed, setAgreed] = useState(false);

<label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
  <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
  <span>I agree to the terms</span>
</label>`}
        >
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "0.875rem" }}>
            <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
            <span>I agree to the terms</span>
          </label>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Uncontrolled</h2>
        <CodeExample
          title="defaultChecked"
          code={`<Checkbox defaultChecked />`}
        >
          <Checkbox defaultChecked />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Sizes</h2>
        <CodeExample
          title="sm · md · lg"
          code={`<Checkbox size="sm" defaultChecked />
<Checkbox size="md" defaultChecked />
<Checkbox size="lg" defaultChecked />`}
        >
          <Checkbox size="sm" defaultChecked />
          <Checkbox size="md" defaultChecked />
          <Checkbox size="lg" defaultChecked />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="disabled prop"
          code={`<Checkbox disabled />
<Checkbox disabled defaultChecked />
<Checkbox disabled checked="indeterminate" />`}
        >
          <Checkbox disabled />
          <Checkbox disabled defaultChecked />
          <Checkbox disabled checked="indeterminate" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Indeterminate / parent-child pattern</h2>
        <CodeExample
          title={`checked="indeterminate" — tri-state with a single prop`}
          description="Parent checkbox is true / false / indeterminate based on children. Toggling parent flips all children."
          code={`const all = selected.length === topics.length;
const some = selected.length > 0 && !all;
const parent = all ? true : some ? "indeterminate" : false;

<Checkbox
  checked={parent}
  onCheckedChange={(v) => setSelected(v === true ? topics : [])}
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Checkbox
                checked={parent}
                onCheckedChange={(v) =>
                  setSelected(v === true ? [...TOPICS] : [])
                }
              />
              <strong>All topics</strong>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: "1.5rem" }}>
              {TOPICS.map((t) => (
                <label key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    checked={selected.includes(t)}
                    onCheckedChange={(v) =>
                      setSelected((prev) =>
                        v === true ? [...prev, t] : prev.filter((x) => x !== t),
                      )
                    }
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Custom colors via className</h2>
        <CodeExample
          title="Override the checked-state colors with utility classes"
          code={`<Checkbox
  defaultChecked
  className="data-[state=checked]:bg-zen-success data-[state=checked]:border-zen-success"
/>`}
        >
          <Checkbox defaultChecked className="data-[state=checked]:zen-bg-zen-success data-[state=checked]:zen-border-zen-success" />
          <Checkbox defaultChecked className="data-[state=checked]:zen-bg-zen-warning data-[state=checked]:zen-border-zen-warning" />
          <Checkbox defaultChecked className="data-[state=checked]:zen-bg-zen-error data-[state=checked]:zen-border-zen-error" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Form submission</h2>
        <CodeExample
          title="name + value participate in a native form"
          code={`<form onSubmit={(e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  alert(fd.getAll("interests").join(", "));
}}>
  <Checkbox name="interests" value="design" /> Design
  <Checkbox name="interests" value="dev" />    Dev
  <button type="submit">Submit</button>
</form>`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              alert(`interests = ${fd.getAll("interests").join(", ") || "(none)"}`);
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem" }}
          >
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Checkbox name="interests" value="design" /> Design
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Checkbox name="interests" value="dev" /> Dev
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

export default NewCheckboxDemo;
