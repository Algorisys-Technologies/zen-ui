import { createSignal } from "solid-js";
import { Textarea } from "../components/form/input/input";
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * Solid port of the vanilla Textarea demo (itself mirroring the Textarea
 * sections of React's Input + Textarea demo). The same shadcn-style primitive:
 * a styled <textarea> with a taller minimum height and no built-in
 * label/counter/error scaffolding — those are composed at the call site.
 */
const NewTextareaDemo = () => {
  const [length, setLength] = createSignal(0);

  return (
    <DemoPage
      title="Textarea"
      description="Plain styled <textarea> primitive. No config, no built-in label/error/counter scaffolding — compose those at the call site. Same primitive shape as Input, with a taller minimum height."
    >
      <DemoSection
        title="1. Basic"
        codeTitle="Same primitive shape, taller minimum height"
        code={`<Textarea placeholder="Tell us more…" rows={4} />   // just a <textarea>`}
      >
        <Textarea placeholder="Tell us more…" rows={4} style={{ "max-width": "480px" }} />
      </DemoSection>

      <DemoSection
        title="2. With label + counter"
        codeTitle="Compose counter, helper text, error in the parent"
        codeDescription="The primitive ships no counter. Keep the length in a signal the textarea's onInput writes, and read it in the counter."
        code={`const [length, setLength] = createSignal(0);

<label>
  <span>Bio</span>
  <Textarea
    rows={3}
    maxLength={120}
    placeholder="A short bio…"
    onInput={(e) => setLength(e.currentTarget.value.length)}
  />
  <span>{length()} / 120</span>
</label>`}
      >
        <label
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "6px",
            "max-width": "480px",
            width: "100%",
          }}
        >
          <span style={{ "font-size": "0.8125rem", "font-weight": "500" }}>Bio</span>
          <Textarea
            rows={3}
            maxLength={120}
            placeholder="A short bio…"
            onInput={(e) => setLength(e.currentTarget.value.length)}
          />
          <span
            style={{
              "font-size": "0.75rem",
              color: "var(--zen-color-muted-fg)",
              "align-self": "flex-end",
            }}
          >
            {length()} / 120
          </span>
        </label>
      </DemoSection>

      <DemoSection
        title="3. Disabled / readOnly"
        codeTitle="Standard HTML attributes"
        code={`<Textarea disabled value="Disabled" />
<Textarea readOnly value="Read-only" />`}
      >
        <div style={{ display: "grid", gap: "10px", width: "100%", "max-width": "480px" }}>
          <Textarea rows={2} disabled value="Disabled" />
          <Textarea rows={2} readOnly value="Read-only" />
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewTextareaDemo;
