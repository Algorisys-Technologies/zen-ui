import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "./form/otp/otp";
import { CodeExample } from "./demo-helpers";

const NewOTPDemo: React.FC = () => {
  const [code, setCode] = useState("");
  return (
    <div className="demo-page">
      <h1>InputOTP</h1>
      <p className="lede">
        One-time-code input — one <code>&lt;input&gt;</code> per digit, zero
        dependencies. Handles paste, keyboard nav, mobile autocomplete (
        <code>one-time-code</code>), and backspace-across-slots. Themed via{" "}
        <code>--zen-*</code>.
      </p>

      <section className="demo-section">
        <h2>1. 6-digit OTP</h2>
        <CodeExample
          title="Basic 6-slot OTP, controlled"
          code={`const [code, setCode] = useState("");

<InputOTP maxLength={6} value={code} onChange={setCode}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <span style={{ fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
              value: "{code}"
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Grouped with separator</h2>
        <CodeExample
          title="Two 3-slot groups divided by a separator (like 123-456)"
          code={`<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>`}
        >
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. 4-digit PIN</h2>
        <CodeExample
          title="Any length"
          code={`<InputOTP maxLength={4}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
  </InputOTPGroup>
</InputOTP>`}
        >
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample
          title="disabled prop disables the whole input"
          code={`<InputOTP maxLength={4} disabled value="1234">…</InputOTP>`}
        >
          <InputOTP maxLength={4} disabled value="1234">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Auto-submit on complete</h2>
        <CodeExample
          title="onComplete fires when all slots are filled"
          code={`<InputOTP
  maxLength={6}
  onComplete={(value) => alert("Verifying " + value)}
>
  ...
</InputOTP>`}
        >
          <InputOTP
            maxLength={6}
            onComplete={(value) => alert(`Verifying ${value}`)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewOTPDemo;
