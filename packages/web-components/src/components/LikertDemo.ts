import type { LikertOption } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Likert demo — the web-components port. <zen-likert> takes its scale through the
 * `options` JS property (an option may carry a `renderOption` function that JSON
 * cannot express), and fires `zen-value-change` with the selected value.
 */

const FREQUENCY: LikertOption[] = [
  { value: "never", label: "Never" },
  { value: "rarely", label: "Rarely" },
  { value: "sometimes", label: "Sometimes" },
  { value: "often", label: "Often" },
  { value: "always", label: "Always" },
];

const IMPORTANCE: LikertOption[] = [
  { value: "not", label: "Not important" },
  { value: "slightly", label: "Slightly important" },
  { value: "moderately", label: "Moderately important" },
  { value: "very", label: "Very important" },
  { value: "critical", label: "Critical" },
];

/** The scale length is data. A 7-point scale is seven options, not a fork. */
const scalePoints = (n: number): LikertOption[] =>
  Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

const SENTIMENT: LikertOption[] = [
  { value: "1", label: "Very dissatisfied", renderOption: () => "😞" },
  { value: "2", label: "Dissatisfied", renderOption: () => "😐" },
  { value: "3", label: "Neutral", renderOption: () => "🙂" },
  { value: "4", label: "Satisfied", renderOption: () => "😊" },
  { value: "5", label: "Very satisfied", renderOption: () => "😄" },
];

const SHORT: LikertOption[] = [
  { value: "no", label: "No" },
  { value: "maybe", label: "Maybe" },
  { value: "yes", label: "Yes" },
];

interface LikertOpts {
  question?: string;
  options?: LikertOption[];
  layout?: string;
  minLabel?: string;
  maxLabel?: string;
  value?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

function likert(opts: LikertOpts): HTMLElement {
  const el = document.createElement("zen-likert");
  if (opts.question != null) el.setAttribute("question", opts.question);
  if (opts.layout != null) el.setAttribute("layout", opts.layout);
  if (opts.minLabel != null) el.setAttribute("min-label", opts.minLabel);
  if (opts.maxLabel != null) el.setAttribute("max-label", opts.maxLabel);
  if (opts.value != null) el.setAttribute("value", opts.value);
  if (opts.readOnly) el.setAttribute("read-only", "");
  if (opts.disabled) el.setAttribute("disabled", "");
  if (opts.options) (el as unknown as { options: LikertOption[] }).options = opts.options;
  return el;
}

/** A Likert wired to a live "answer → …" readout, echoing the value back on change. */
function controlledExample(opts: {
  likert: LikertOpts;
  format?: (v: string | undefined) => string;
  gap?: number;
}): Node {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.gap = `${opts.gap ?? 8}px`;
  wrap.style.width = "100%";

  const readout = document.createElement("p");
  readout.className = "zen-m-0 zen-text-xs zen-text-zen-muted-fg";

  const fmt = opts.format ?? ((v) => v ?? "—");
  const setReadout = (v: string | undefined) => {
    readout.replaceChildren();
    const code = document.createElement("code");
    code.textContent = fmt(v);
    readout.append(document.createTextNode("answer → "), code);
  };

  const el = likert(opts.likert);
  el.addEventListener("zen-value-change", (e) => {
    const v = (e as CustomEvent).detail as string;
    (el as unknown as { value: string }).value = v;
    setReadout(v);
  });
  setReadout(undefined);

  wrap.append(el, readout);
  return wrap;
}

export default function LikertDemo(): HTMLElement {
  return DemoPage({
    title: "Likert",
    description:
      "n-point attitudinal scale — the canonical \"Strongly disagree → Strongly agree\" question shape. Third leg of the survey triplet alongside Rating and NPS. Three layouts ship out of the box: a compact segmented pill strip, a more readable stacked radio list, and a scale with the mark above the dot.",
    sections: [
      {
        title: "1. Default — 5-point agree/disagree",
        codeTitle: "Segmented layout with the standard scale",
        code: `<zen-likert question="The onboarding was easy to follow."></zen-likert>`,
        render: () => likert({ question: "The onboarding was easy to follow." }),
      },
      {
        title: "2. Controlled",
        codeTitle: "value + zen-value-change",
        code: `<zen-likert question="…"></zen-likert>

q.addEventListener("zen-value-change", (e) => { q.value = e.detail; });`,
        render: () =>
          controlledExample({
            likert: { question: "Our support response time meets your expectations." },
          }),
      },
      {
        title: "3. Stacked layout",
        codeTitle: 'layout="stacked" — vertical radios with full labels',
        codeDescription:
          "Better for accessibility in narrow viewports and for long option labels that don't fit in a pill.",
        code: `<zen-likert layout="stacked" question="How often do you use the mobile app?"></zen-likert>
q.options = FREQUENCY_OPTIONS;`,
        render: () =>
          likert({
            layout: "stacked",
            question: "How often do you use the mobile app?",
            options: FREQUENCY,
          }),
      },
      {
        title: "4. Custom scale — importance",
        codeTitle: "Importance scale — Not important → Critical",
        codeDescription:
          "Pass your own options array for any attitudinal scale: agreement, frequency, importance, ease, satisfaction, comfort.",
        code: `q.options = [
  { value: "not",         label: "Not important" },
  { value: "slightly",    label: "Slightly important" },
  { value: "moderately",  label: "Moderately important" },
  { value: "very",        label: "Very important" },
  { value: "critical",    label: "Critical" },
];`,
        render: () =>
          likert({
            question: "How important is end-to-end encryption to you?",
            options: IMPORTANCE,
            layout: "stacked",
          }),
      },
      {
        title: "5. 3-point variant",
        codeTitle: "Custom 3-option scale",
        codeDescription:
          "Shorter scales reduce cognitive load when the spectrum doesn't have meaningful in-between gradations.",
        code: `q.options = [
  { value: "no",    label: "No" },
  { value: "maybe", label: "Maybe" },
  { value: "yes",   label: "Yes" },
];`,
        render: () => likert({ question: "Would you do this again?", options: SHORT }),
      },
      {
        title: '6. Numeric scale (layout="scale")',
        codeTitle: "A linear scale, anchored at both ends",
        codeDescription:
          "The mark sits above the control and min-label / max-label name the ends — a bare 1–5 row means nothing without them. They are captions only; the radiogroup's accessible name still comes from question.",
        code: `<zen-likert layout="scale" min-label="Strongly disagree" max-label="Strongly agree" question="…"></zen-likert>
q.options = [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }));`,
        render: () =>
          controlledExample({
            gap: 14,
            likert: {
              layout: "scale",
              options: scalePoints(5),
              minLabel: "Strongly disagree",
              maxLabel: "Strongly agree",
              question: "I understand what is expected of me at work.",
            },
          }),
      },
      {
        title: "7. Scale length is data, not markup",
        codeTitle: "A 7-point scale is seven options",
        codeDescription:
          "Nothing about the layout assumes five. Hardcoding [1,2,3,4,5] beside a variable-length data model is how a 7-point scale gets stored and rendered as 5, silently losing answers.",
        code: `const scalePoints = (n) =>
  Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

q.options = scalePoints(7);`,
        render: () =>
          controlledExample({
            gap: 14,
            likert: {
              layout: "scale",
              options: scalePoints(7),
              minLabel: "Never",
              maxLabel: "Always",
              question: "How often do you get feedback on your work?",
            },
          }),
      },
      {
        title: "8. Emoji scale (renderOption)",
        codeTitle: "A custom mark, with the answer still announced",
        codeDescription:
          "renderOption replaces the option's visible text with any node. It is rendered aria-hidden and label stays the accessible name — a screen reader announcing 'slightly smiling face' instead of 'Neutral' is not the answer the respondent gave. Keyboard nav is the same radiogroup as every other layout.",
        code: `q.options = [
  { value: "1", label: "Very dissatisfied", renderOption: () => "😞" },
  { value: "2", label: "Dissatisfied",      renderOption: () => "😐" },
  { value: "3", label: "Neutral",           renderOption: () => "🙂" },
  { value: "4", label: "Satisfied",         renderOption: () => "😊" },
  { value: "5", label: "Very satisfied",    renderOption: () => "😄" },
];`,
        render: () =>
          controlledExample({
            gap: 14,
            likert: {
              layout: "scale",
              options: SENTIMENT,
              question: "How was your onboarding experience?",
            },
            format: (v) => SENTIMENT.find((o) => o.value === v)?.label ?? "—",
          }),
      },
      {
        title: "9. Read-only / disabled",
        codeTitle: "Display existing answers or lock the control",
        code: `<zen-likert value="agree" read-only question="…"></zen-likert>
<zen-likert value="disagree" disabled question="…"></zen-likert>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "14px";
          wrap.append(
            likert({ value: "agree", readOnly: true, question: "Q1 — Read-only display" }),
            likert({ value: "disagree", disabled: true, question: "Q2 — Disabled" }),
          );
          return wrap;
        },
      },
    ],
  });
}
