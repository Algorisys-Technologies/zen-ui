import { createSignal } from "solid-js";
import { Likert, type LikertOption } from "./survey/likert";
import { DemoPage, DemoSection } from "./demo-helpers";

const frequencyOptions: LikertOption[] = [
  { value: "never", label: "Never", shortLabel: "N" },
  { value: "rarely", label: "Rarely", shortLabel: "R" },
  { value: "sometimes", label: "Sometimes", shortLabel: "S" },
  { value: "often", label: "Often", shortLabel: "O" },
  { value: "always", label: "Always", shortLabel: "A" },
];

/** The scale length is data. A 7-point scale is seven options, not a fork. */
const scalePoints = (n: number): LikertOption[] =>
  Array.from({ length: n }, (_, i) => ({
    value: String(i + 1),
    label: String(i + 1),
  }));

const SENTIMENT: LikertOption[] = [
  { value: "1", label: "Very dissatisfied", renderOption: () => "😞" },
  { value: "2", label: "Dissatisfied", renderOption: () => "😐" },
  { value: "3", label: "Neutral", renderOption: () => "🙂" },
  { value: "4", label: "Satisfied", renderOption: () => "😊" },
  { value: "5", label: "Very satisfied", renderOption: () => "😄" },
];

const NewLikertDemo = () => {
  const [a1, setA1] = createSignal<string | undefined>();
  const [a2, setA2] = createSignal<string | undefined>();
  const [scale, setScale] = createSignal<string | undefined>();
  const [seven, setSeven] = createSignal<string | undefined>();
  const [sentiment, setSentiment] = createSignal<string | undefined>();

  return (
    <DemoPage
      title="Likert"
      description="Attitudinal scale. Three layouts: segmented (default), stacked and scale."
    >
      <DemoSection
        title="5-point · segmented"
        codeTitle="Controlled — value + onValueChange"
        codeDescription="Defaults to a 5-point Strongly disagree → Strongly agree scale in the segmented pill strip."
        code={`const [answer, setAnswer] = createSignal<string | undefined>();

<Likert
  value={answer()}
  onValueChange={setAnswer}
  question="The onboarding was easy to follow."
/>`}
      >
        <Likert
          value={a1()}
          onValueChange={setA1}
          question="The onboarding was easy to follow."
        />
      </DemoSection>

      <DemoSection
        title="5-point · stacked"
        codeTitle={`layout="stacked" with a custom scale`}
        codeDescription="Stacked renders a vertical radio list with full labels — better for long option text and narrow viewports. Pass your own options for any attitudinal scale."
        code={`const frequencyOptions: LikertOption[] = [
  { value: "never", label: "Never", shortLabel: "N" },
  { value: "rarely", label: "Rarely", shortLabel: "R" },
  { value: "sometimes", label: "Sometimes", shortLabel: "S" },
  { value: "often", label: "Often", shortLabel: "O" },
  { value: "always", label: "Always", shortLabel: "A" },
];

const [answer, setAnswer] = createSignal<string | undefined>();

<Likert
  value={answer()}
  onValueChange={setAnswer}
  question="How often do you use the dashboard?"
  options={frequencyOptions}
  layout="stacked"
/>`}
      >
        <Likert
          value={a2()}
          onValueChange={setA2}
          question="How often do you use the dashboard?"
          options={frequencyOptions}
          layout="stacked"
        />
      </DemoSection>

      <DemoSection
        title="Numeric scale (layout=&quot;scale&quot;)"
        codeTitle="A linear scale, anchored at both ends"
        codeDescription={
          <>
            The mark sits above the control and <code>minLabel</code> /{" "}
            <code>maxLabel</code> name the ends — a bare 1–5 row means nothing without
            them. They are captions only; the radiogroup's accessible name still comes
            from <code>question</code>.
          </>
        }
        code={`<Likert
  layout="scale"
  options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
  minLabel="Strongly disagree"
  maxLabel="Strongly agree"
  question="I understand what is expected of me at work."
/>`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px", width: "100%" }}>
          <Likert
            layout="scale"
            options={scalePoints(5)}
            minLabel="Strongly disagree"
            maxLabel="Strongly agree"
            value={scale()}
            onValueChange={setScale}
            question="I understand what is expected of me at work."
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            answer → <code>{scale() ?? "—"}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Scale length is data, not markup"
        codeTitle="A 7-point scale is seven options"
        codeDescription="Nothing about the layout assumes five. Hardcoding [1,2,3,4,5] beside a variable-length data model is how a 7-point scale gets stored and rendered as 5, silently losing answers."
        code={`const scalePoints = (n: number): LikertOption[] =>
  Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

<Likert layout="scale" options={scalePoints(7)} minLabel="Never" maxLabel="Always" />`}
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px", width: "100%" }}>
          <Likert
            layout="scale"
            options={scalePoints(7)}
            minLabel="Never"
            maxLabel="Always"
            value={seven()}
            onValueChange={setSeven}
            question="How often do you get feedback on your work?"
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            answer → <code>{seven() ?? "—"}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="Emoji scale (renderOption)"
        codeTitle="A custom mark, with the answer still announced"
        codeDescription={
          <>
            <code>renderOption</code> replaces the option's visible text with any node. It
            is rendered <code>aria-hidden</code> and <code>label</code> stays the
            accessible name — a screen reader announcing "slightly smiling face" instead
            of "Neutral" is not the answer the respondent gave. Keyboard nav is the same
            radiogroup as every other layout.
          </>
        }
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
        <div style={{ display: "flex", "flex-direction": "column", gap: "14px", width: "100%" }}>
          <Likert
            layout="scale"
            options={SENTIMENT}
            value={sentiment()}
            onValueChange={setSentiment}
            question="How was your onboarding experience?"
          />
          <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
            answer →{" "}
            <code>{SENTIMENT.find((o) => o.value === sentiment())?.label ?? "—"}</code>
          </p>
        </div>
      </DemoSection>

      <DemoSection
        title="States"
        codeTitle="Lock the control or display an existing answer"
        codeDescription="Both stop interaction; readOnly keeps the normal styling, disabled dims it. Use defaultValue for uncontrolled usage."
        code={`<Likert defaultValue="agree" disabled question="Disabled" />
<Likert defaultValue="strongly_agree" readOnly question="Read-only" />`}
      >
        <Likert defaultValue="agree" disabled question="Disabled" />
        <Likert defaultValue="strongly_agree" readOnly question="Read-only" />
      </DemoSection>
    </DemoPage>
  );
};

export default NewLikertDemo;
