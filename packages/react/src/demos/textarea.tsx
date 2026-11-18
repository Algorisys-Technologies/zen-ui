import { useState } from "react";
import { Textarea } from "../components/form/input/textarea";
import { CodeExample } from "./demo-helpers";

/**
 * Textarea demo — mirrors vanilla's and Solid's /textarea page. The same
 * shadcn-style primitive: a styled <textarea> with a taller minimum height and
 * no built-in label/counter/error scaffolding — those are composed at the call
 * site.
 */
const NewTextareaDemo: React.FC = () => {
  const [bio, setBio] = useState("");

  return (
    <div className="demo-page">
      <h1>Textarea</h1>
      <p className="lede">
        Plain styled &lt;textarea&gt; primitive. No config, no built-in
        label/error/counter scaffolding — compose those at the call site. Same
        primitive shape as Input, with a taller minimum height.
      </p>

      <section className="demo-section">
        <h2>1. Basic</h2>
        <CodeExample
          title="Same primitive shape, taller minimum height"
          code={`<Textarea placeholder="Tell us more…" rows={4} />   // just a <textarea>`}
        >
          <Textarea placeholder="Tell us more…" rows={4} style={{ maxWidth: 480 }} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. With label + counter</h2>
        <CodeExample
          title="Compose counter, helper text, error in the parent"
          description="The primitive ships no counter. Hold the value in state and read e.target.value on change; the counter renders from the same state."
          code={`const [bio, setBio] = useState("");

<label>
  <span>Bio</span>
  <Textarea
    rows={3}
    maxLength={120}
    placeholder="A short bio…"
    value={bio}
    onChange={(e) => setBio(e.target.value)}
  />
  <span>{bio.length} / 120</span>
</label>`}
        >
          <label
            style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 480, width: "100%" }}
          >
            <span className="zen-text-sm zen-font-medium">Bio</span>
            <Textarea
              rows={3}
              maxLength={120}
              placeholder="A short bio…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <span className="zen-text-xs zen-text-zen-muted-fg" style={{ alignSelf: "flex-end" }}>
              {bio.length} / 120
            </span>
          </label>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Disabled / readOnly</h2>
        <CodeExample
          title="Standard HTML attributes"
          code={`<Textarea disabled defaultValue="Disabled" />
<Textarea readOnly defaultValue="Read-only" />`}
        >
          <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 480 }}>
            <Textarea rows={2} disabled defaultValue="Disabled" />
            <Textarea rows={2} readOnly defaultValue="Read-only" />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTextareaDemo;
