import { useState } from "react";
import { Likert } from "./survey/likert";
import { CodeExample } from "./demo-helpers";

const FREQUENCY = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
  { value: "always", label: "Always" },
];

const IMPORTANCE = [
  { value: "not", label: "Not important" },
  { value: "slightly", label: "Slightly important" },
  { value: "moderately", label: "Moderately important" },
  { value: "very", label: "Very important" },
  { value: "critical", label: "Critical" },
];

/** The scale length is data. A 7-point scale is seven options, not a fork. */
const scalePoints = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

const SENTIMENT = [
  { value: "1", label: "Very dissatisfied", renderOption: () => "😞" },
  { value: "2", label: "Dissatisfied", renderOption: () => "😐" },
  { value: "3", label: "Neutral", renderOption: () => "🙂" },
  { value: "4", label: "Satisfied", renderOption: () => "😊" },
  { value: "5", label: "Very satisfied", renderOption: () => "😄" },
];

const SHORT = [
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
  { value: "yes", label: "Yes" },
];

const NewLikertDemo: React.FC = () => {
  const [answer, setAnswer] = useState<string | undefined>();
  const [scale, setScale] = useState<string | undefined>();
  const [sentiment, setSentiment] = useState<string | undefined>();
  const [seven, setSeven] = useState<string | undefined>();

  return (
    <div className="demo-page">
      <h1>Likert</h1>
      <p className="lede">
        n-point attitudinal scale — the canonical "Strongly disagree →
        Strongly agree" question shape. Third leg of the survey
        triplet alongside <a href="#/rating">Rating</a> and{" "}
        <a href="#/nps">NPS</a>. Two layouts ship out of the box: a
        compact <code>segmented</code> pill strip and a more readable{" "}
        <code>stacked</code> radio list.
      </p>

      <section className="demo-section">
        <h2>1. Default — 5-point agree/disagree</h2>
        <CodeExample
          title="Segmented layout with the standard scale"
          code={`<Likert
  question="The onboarding was easy to follow."
  onValueChange={(v) => console.log(v)}
/>`}
        >
          <Likert question="The onboarding was easy to follow." />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Controlled</h2>
        <CodeExample
          title="value + onValueChange"
          code={`const [answer, setAnswer] = useState<string | undefined>();
<Likert
  value={answer}
  onValueChange={setAnswer}
  question="Our support response time meets your expectations."
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Likert
              value={answer}
              onValueChange={setAnswer}
              question="Our support response time meets your expectations."
            />
            <p className="zen-text-xs zen-text-zen-muted-fg zen-m-0">
              Answer: <code>{answer ?? "(none)"}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Stacked layout</h2>
        <CodeExample
          title='layout="stacked" — vertical radios with full labels'
          description="Better for accessibility in narrow viewports and for long option labels that don't fit in a pill."
          code={`<Likert
  layout="stacked"
  question="How often do you use the mobile app?"
  options={FREQUENCY_OPTIONS}
/>`}
        >
          <Likert
            layout="stacked"
            question="How often do you use the mobile app?"
            options={FREQUENCY}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Custom scale — importance</h2>
        <CodeExample
          title="Importance scale — Not important → Critical"
          description="Pass your own options array for any attitudinal scale: agreement, frequency, importance, ease, satisfaction, comfort."
          code={`const IMPORTANCE = [
  { value: "not",         label: "Not important" },
  { value: "slightly",    label: "Slightly important" },
  { value: "moderately",  label: "Moderately important" },
  { value: "very",        label: "Very important" },
  { value: "critical",    label: "Critical" },
];

<Likert
  question="How important is end-to-end encryption to you?"
  options={IMPORTANCE}
  layout="stacked"
/>`}
        >
          <Likert
            question="How important is end-to-end encryption to you?"
            options={IMPORTANCE}
            layout="stacked"
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. 3-point variant</h2>
        <CodeExample
          title="Custom 3-option scale"
          description="Shorter scales reduce cognitive load when the spectrum doesn't have meaningful in-between gradations."
          code={`<Likert
  question="Would you do this again?"
  options={[
    { value: "no",    label: "No" },
    { value: "maybe", label: "Maybe" },
    { value: "yes",   label: "Yes" },
  ]}
/>`}
        >
          <Likert
            question="Would you do this again?"
            options={SHORT}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Numeric scale (layout="scale")</h2>
        <CodeExample
          title="A linear scale, anchored at both ends"
          description="The mark sits above the control and minLabel / maxLabel name the ends — a bare 1–5 row means nothing without them. They are captions only; the radiogroup's accessible name still comes from question."
          code={`<Likert
  layout="scale"
  options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
  minLabel="Strongly disagree"
  maxLabel="Strongly agree"
  question="I understand what is expected of me at work."
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
            <Likert
              layout="scale"
              options={scalePoints(5)}
              minLabel="Strongly disagree"
              maxLabel="Strongly agree"
              value={scale}
              onValueChange={setScale}
              question="I understand what is expected of me at work."
            />
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              answer → <code>{scale ?? "—"}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>7. Scale length is data, not markup</h2>
        <CodeExample
          title="A 7-point scale is seven options"
          description="Nothing about the layout assumes five. Hardcoding [1,2,3,4,5] beside a variable-length data model is how a 7-point scale gets stored and rendered as 5, silently losing answers."
          code={`const scalePoints = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

<Likert layout="scale" options={scalePoints(7)} minLabel="Never" maxLabel="Always" />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
            <Likert
              layout="scale"
              options={scalePoints(7)}
              minLabel="Never"
              maxLabel="Always"
              value={seven}
              onValueChange={setSeven}
              question="How often do you get feedback on your work?"
            />
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              answer → <code>{seven ?? "—"}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>8. Emoji scale (renderOption)</h2>
        <CodeExample
          title="A custom mark, with the answer still announced"
          description="renderOption replaces the option's visible text with any node. It is rendered aria-hidden and label stays the accessible name — a screen reader announcing 'slightly smiling face' instead of 'Neutral' is not the answer the respondent gave. Keyboard nav is the same radiogroup as every other layout."
          code={`<Likert
  layout="scale"
  options={[
    { value: "1", label: "Very dissatisfied", renderOption: () => "😞" },
    { value: "2", label: "Dissatisfied",      renderOption: () => "😐" },
    { value: "3", label: "Neutral",           renderOption: () => "🙂" },
    { value: "4", label: "Satisfied",         renderOption: () => "😊" },
    { value: "5", label: "Very satisfied",    renderOption: () => "😄" },
  ]}
  question="How was your onboarding experience?"
/>`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
            <Likert
              layout="scale"
              options={SENTIMENT}
              value={sentiment}
              onValueChange={setSentiment}
              question="How was your onboarding experience?"
            />
            <p className="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
              answer → <code>{SENTIMENT.find((o) => o.value === sentiment)?.label ?? "—"}</code>
            </p>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>9. Read-only / disabled</h2>
        <CodeExample
          title="Display existing answers or lock the control"
          code={`<Likert value="agree" readOnly question="…" />
<Likert value="disagree" disabled question="…" />`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Likert
              value="agree"
              readOnly
              question="Q1 — Read-only display"
            />
            <Likert
              value="disagree"
              disabled
              question="Q2 — Disabled"
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewLikertDemo;
