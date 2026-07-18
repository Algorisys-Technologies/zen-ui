import { useRef, useState } from "react";
import { Input } from "./form/input/input";
import { Textarea } from "./form/input/textarea";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const NewInputDemo: React.FC = () => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="demo-page">
      <h1>Input + Textarea (new — shadcn-style)</h1>
      <p className="lede">
        Plain styled <code>&lt;input&gt;</code> /{" "}
        <code>&lt;textarea&gt;</code> primitives. No config, no built-in
        label/error/icon scaffolding — compose those at the call site.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample
          title="Defaults"
          code={`<Input placeholder="Your name" />`}
        >
          <Input placeholder="Your name" />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled</h2>
        <CodeExample
          title="value + onChange"
          code={`const [name, setName] = useState("");
<Input value={name} onChange={(e) => setName(e.target.value)} />`}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Type here…" />
          <span style={{ marginLeft: 12, fontSize: "0.8125rem", color: "var(--zen-color-muted-fg)" }}>
            value: {name || "(empty)"}
          </span>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Input types</h2>
        <CodeExample
          title="Pass any native type attribute"
          code={`<Input type="email" placeholder="you@algorisys.com" />
<Input type="password" placeholder="Password" />
<Input type="search" placeholder="Search…" />
<Input type="number" placeholder="0" />
<Input type="date" />
<Input type="file" />`}
        >
          <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 360 }}>
            <Input type="email" placeholder="you@algorisys.com" />
            <Input type="password" placeholder="Password" />
            <Input type="search" placeholder="Search…" />
            <Input type="number" placeholder="0" />
            <Input type="date" />
            <Input type="file" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. With label + helper text</h2>
        <CodeExample
          title="Compose at the call site"
          code={`<label className="flex flex-col gap-1">
  <span className="text-sm font-medium">Email</span>
  <Input type="email" placeholder="you@algorisys.com" />
  <span className="text-xs text-zen-muted-fg">We'll never share your email.</span>
</label>`}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 360, width: "100%" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--zen-color-foreground)" }}>
              Email
            </span>
            <Input type="email" placeholder="you@algorisys.com" />
            <span style={{ fontSize: "0.75rem", color: "var(--zen-color-muted-fg)" }}>
              We'll never share your email.
            </span>
          </label>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Error state</h2>
        <CodeExample
          title="Compose with a className override on Input + helper text"
          code={`<Input
  type="email"
  aria-invalid
  className="border-zen-error focus-visible:ring-zen-error"
/>
<span className="text-xs text-zen-error">Not a valid email.</span>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 360, width: "100%" }}>
            <Input
              type="email"
              aria-invalid
              defaultValue="invalid@"
              className="zen-border-zen-error focus-visible:zen-ring-zen-error"
            />
            <span style={{ fontSize: "0.75rem", color: "var(--zen-color-error)" }}>
              Not a valid email.
            </span>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled / readOnly</h2>
        <CodeExample
          title="Standard HTML attributes"
          code={`<Input disabled defaultValue="Disabled" />
<Input readOnly defaultValue="Read-only" />`}
        >
          <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 360 }}>
            <Input disabled defaultValue="Disabled" />
            <Input readOnly defaultValue="Read-only" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. forwardRef</h2>
        <CodeExample
          title="Programmatic focus + integration with react-hook-form"
          code={`const ref = useRef<HTMLInputElement>(null);

<Input ref={ref} placeholder="Click button to focus" />
<Button onClick={() => ref.current?.focus()}>Focus input</Button>`}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center", maxWidth: 360, width: "100%" }}>
            <Input ref={inputRef} placeholder="Click button to focus" />
            <Button onClick={() => inputRef.current?.focus()}>Focus</Button>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. Textarea — basic</h2>
        <CodeExample
          title="Same primitive shape, taller minimum height"
          code={`<Textarea placeholder="Tell us more…" rows={4} />`}
        >
          <Textarea placeholder="Tell us more…" rows={4} style={{ maxWidth: 480 }} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>9. Textarea — with label + counter</h2>
        <CodeExample
          title="Compose counter, helper text, error in the parent"
          code={`<label className="flex flex-col gap-1">
  <span>Bio</span>
  <Textarea maxLength={120} rows={3} />
  <span className="text-xs">0 / 120</span>
</label>`}
        >
          <BioField />
        </CodeExample>
      </section>
    </div>
  );
};

const BioField: React.FC = () => {
  const [bio, setBio] = useState("");
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 480, width: "100%" }}>
      <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>Bio</span>
      <Textarea
        rows={3}
        maxLength={120}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="A short bio…"
      />
      <span style={{ fontSize: "0.75rem", color: "var(--zen-color-muted-fg)", alignSelf: "flex-end" }}>
        {bio.length} / 120
      </span>
    </label>
  );
};

export default NewInputDemo;
