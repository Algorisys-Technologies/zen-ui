import { useState } from "react";
import { PasswordInput } from "./form/password-input/password-input";
import { Input } from "./form/input/input";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const PasswordInputDemo: React.FC = () => {
  const [pw, setPw] = useState("");
  const strong = pw.length >= 8;

  return (
    <div className="demo-page">
      <h1>PasswordInput</h1>
      <p className="lede">
        A password field with a show/hide toggle. The toggle is a real <code>&lt;button&gt;</code> —
        keyboard reachable, labelled, and <code>aria-pressed</code> reflects whether the value is visible —
        rather than an icon only a mouse can hit. It wraps a native <code>&lt;input&gt;</code>, so{" "}
        <code>name</code>, <code>required</code>, <code>autoComplete</code> and form submission all work
        unchanged.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample title="Defaults" code={`<PasswordInput placeholder="Password" />`}>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <PasswordInput placeholder="Password" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled, with a strength hint</h2>
        <CodeExample
          title="value + onChange"
          code={`const [pw, setPw] = useState("");
<PasswordInput value={pw} onChange={(e) => setPw(e.target.value)} />`}
        >
          <div style={{ width: "100%", maxWidth: 320 }}>
            <PasswordInput
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Choose a password"
              autoComplete="new-password"
            />
            <span
              style={{
                display: "block",
                marginTop: 8,
                fontSize: "0.8125rem",
                color: strong ? "var(--zen-color-success)" : "var(--zen-color-muted-fg)",
              }}
            >
              {pw.length === 0 ? "At least 8 characters." : strong ? "Looks good." : `${8 - pw.length} more to go.`}
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. In a sign-in form</h2>
        <CodeExample
          title="Composes with Input and native form semantics"
          code={`<form>
  <Input type="email" placeholder="you@algorisys.com" autoComplete="username" />
  <PasswordInput placeholder="Password" autoComplete="current-password" required />
  <Button type="submit">Sign in</Button>
</form>`}
        >
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{ display: "grid", gap: 10, width: "100%", maxWidth: 320 }}
          >
            <Input type="email" placeholder="you@algorisys.com" autoComplete="username" />
            <PasswordInput placeholder="Password" autoComplete="current-password" required />
            <Button type="submit">Sign in</Button>
          </form>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Disabled</h2>
        <CodeExample title="disabled" code={`<PasswordInput disabled defaultValue="secret" />`}>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <PasswordInput disabled defaultValue="secret" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default PasswordInputDemo;
