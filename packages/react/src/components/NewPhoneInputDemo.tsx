import { useState } from "react";
import { PhoneInput, type PhoneValue } from "./form/phone-input/phone-input";
import { CodeExample } from "./demo-helpers";

const NewPhoneInputDemo: React.FC = () => {
  const [phone, setPhone] = useState<PhoneValue>({ country: "+91", number: "" });

  return (
    <div className="demo-page">
      <h1>PhoneInput (new — composition)</h1>
      <p className="lede">
        Country dial-code <code>Select</code> + national-number{" "}
        <code>Input</code>. No god-component: the same building blocks you'd
        use anywhere else. Forwards a ref to the number input.
      </p>

      <section className="demo-section">
        <h2>1. Basic (controlled)</h2>
        <CodeExample
          title="value = { country, number }"
          code={`const [phone, setPhone] = useState({ country: "+91", number: "" });

<PhoneInput value={phone} onValueChange={setPhone} />`}
        >
          <div style={{ width: 360 }}>
            <PhoneInput value={phone} onValueChange={setPhone} />
          </div>
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            {phone.country} {phone.number || "(empty)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Uncontrolled</h2>
        <CodeExample
          title="defaultValue"
          code={`<PhoneInput defaultValue={{ country: "+1", number: "555-0100" }} />`}
        >
          <div style={{ width: 360 }}>
            <PhoneInput defaultValue={{ country: "+1", number: "555-0100" }} />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Restricted country list</h2>
        <CodeExample
          title="Pass a custom countries prop"
          code={`<PhoneInput
  countries={[
    { dialCode: "+91", name: "India" },
    { dialCode: "+1", name: "United States" },
    { dialCode: "+44", name: "United Kingdom" },
  ]}
/>`}
        >
          <div style={{ width: 360 }}>
            <PhoneInput
              countries={[
                { dialCode: "+91", name: "India" },
                { dialCode: "+1", name: "United States" },
                { dialCode: "+44", name: "United Kingdom" },
              ]}
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="disabled prop applies to both children"
          code={`<PhoneInput defaultValue={{ country: "+91", number: "9876543210" }} disabled />`}
        >
          <div style={{ width: 360 }}>
            <PhoneInput
              defaultValue={{ country: "+91", number: "9876543210" }}
              disabled
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewPhoneInputDemo;
