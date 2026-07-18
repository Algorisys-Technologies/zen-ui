import { useState } from "react";
import { NPS } from "./survey/nps";
import { CodeExample } from "./demo-helpers";

const NewNpsDemo: React.FC = () => {
  const [score, setScore] = useState<number | undefined>();

  return (
    <div className="demo-page">
      <h1>NPS</h1>
      <p className="lede">
        Net Promoter Score input — the canonical "How likely are you to
        recommend us?" question rendered as an 0–10 strip. Buckets are
        color-coded per the standard NPS definition (0–6 detractors,
        7–8 passives, 9–10 promoters); the selected score gets the
        saturated equivalent of its bucket.
      </p>

      <section className="demo-section">
        <h2>1. Default — uncontrolled</h2>
        <CodeExample
          title="defaultValue + listen via onValueChange"
          code={`<NPS
  defaultValue={8}
  onValueChange={(n) => console.log("nps:", n)}
/>`}
        >
          <NPS defaultValue={8} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled — feedback prompt</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [score, setScore] = useState<number | undefined>();
<NPS
  value={score}
  onValueChange={setScore}
  label="Would you recommend Algorisys to a colleague?"
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <NPS
              value={score}
              onValueChange={setScore}
              label="Would you recommend Algorisys to a colleague?"
            />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-m-0">
              {score === undefined
                ? "(no answer yet)"
                : `User answered ${score}.`}
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Custom anchor labels</h2>
        <CodeExample
          title="Override the question and the low/high anchors"
          code={`<NPS
  label="How satisfied were you with the onboarding?"
  lowLabel="Very dissatisfied"
  highLabel="Very satisfied"
/>`}
        >
          <NPS
            label="How satisfied were you with the onboarding?"
            lowLabel="Very dissatisfied"
            highLabel="Very satisfied"
            defaultValue={9}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Without bucket caption</h2>
        <CodeExample
          title="showBucket={false} hides the 'You're a Promoter' line"
          description="Useful when the survey aggregates results and you don't want to nudge the user with bucket labels."
          code={`<NPS defaultValue={6} showBucket={false} />`}
        >
          <NPS defaultValue={6} showBucket={false} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Read-only (display)</h2>
        <CodeExample
          title="readOnly disables interaction; used for showing aggregated results"
          code={`<NPS value={9} readOnly />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <NPS value={9} readOnly label="Q1 NPS — last quarter" />
            <NPS value={5} readOnly label="Mobile NPS — last quarter" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Disabled</h2>
        <CodeExample
          title="disabled + faded"
          code={`<NPS value={7} disabled />`}
        >
          <NPS value={7} disabled />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewNpsDemo;
