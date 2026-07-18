import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./form/select/select";
import { CodeExample } from "./demo-helpers";

const NewSelectDemo: React.FC = () => {
  const [fruit, setFruit] = useState("");
  return (
    <div className="demo-page">
      <h1>Select (new — Radix-backed)</h1>
      <p className="lede">
        Form-input single-select built on <code>@radix-ui/react-select</code>.
        Radix supplies positioning, keyboard navigation (Arrow / typeahead /
        Home / End), focus trap, dismissal, and form submission. Note:
        Radix Select is single-select; multi-select is a deferred Combobox
        primitive (see todo.md).
      </p>

      <section className="demo-section">
        <h2>1. Basic (controlled)</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [fruit, setFruit] = useState("");

<Select value={fruit} onValueChange={setFruit}>
  <SelectTrigger><SelectValue placeholder="Pick a fruit" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="cherry">Cherry</SelectItem>
  </SelectContent>
</Select>`}
        >
          <div style={{ width: 240 }}>
            <Select value={fruit} onValueChange={setFruit}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a fruit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="cherry">Cherry</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            value: {fruit || "(none)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Uncontrolled</h2>
        <CodeExample
          title="defaultValue"
          code={`<Select defaultValue="b">
  <SelectTrigger><SelectValue /></SelectTrigger>
  <SelectContent>
    <SelectItem value="a">A</SelectItem>
    <SelectItem value="b">B</SelectItem>
  </SelectContent>
</Select>`}
        >
          <div style={{ width: 240 }}>
            <Select defaultValue="b">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectItem value="b">B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Grouped options</h2>
        <CodeExample
          title="SelectGroup + SelectLabel for category headers"
          code={`<SelectContent>
  <SelectGroup>
    <SelectLabel>Fruits</SelectLabel>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
  </SelectGroup>
  <SelectSeparator />
  <SelectGroup>
    <SelectLabel>Vegetables</SelectLabel>
    <SelectItem value="carrot">Carrot</SelectItem>
    <SelectItem value="potato">Potato</SelectItem>
  </SelectGroup>
</SelectContent>`}
        >
          <div style={{ width: 240 }}>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick an item" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Fruits</SelectLabel>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Vegetables</SelectLabel>
                  <SelectItem value="carrot">Carrot</SelectItem>
                  <SelectItem value="potato">Potato</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled items</h2>
        <CodeExample
          title="Per-item disabled prop"
          code={`<SelectItem value="x" disabled>Sold out</SelectItem>`}
        >
          <div style={{ width: 240 }}>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick a plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team" disabled>Team (waitlist)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Disabled trigger</h2>
        <CodeExample
          title="disabled on the Select root"
          code={`<Select disabled>
  <SelectTrigger><SelectValue placeholder="Locked" /></SelectTrigger>
  <SelectContent>...</SelectContent>
</Select>`}
        >
          <div style={{ width: 240 }}>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder="Locked" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Form submission</h2>
        <CodeExample
          title="name on Select participates in form submission"
          code={`<form onSubmit={(e) => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  alert("plan = " + fd.get("plan"));
}}>
  <Select name="plan" defaultValue="pro">...</Select>
  <button type="submit">Submit</button>
</form>`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              alert(`plan = ${fd.get("plan")}`);
            }}
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ width: 200 }}>
              <Select name="plan" defaultValue="pro">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

export default NewSelectDemo;
