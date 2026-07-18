import { NPS } from "./survey/nps";
import { DemoPage } from "./demo-helpers";

export default function NpsDemo(): HTMLElement {
  return DemoPage({
    title: "NPS",
    description:
      'Net Promoter Score input — the canonical "How likely are you to recommend us?" question rendered as an 0–10 strip. Buckets are color-coded per the standard NPS definition (0–6 detractors, 7–8 passives, 9–10 promoters); the selected score gets the saturated equivalent of its bucket.',
    sections: [
      {
        title: "1. Default — uncontrolled",
        codeTitle: "defaultValue + listen via onValueChange",
        code: `const nps = NPS({
  defaultValue: 8,
  onValueChange: (n) => console.log("nps:", n),
});
document.body.append(nps.el);`,
        render: () => NPS({ defaultValue: 8 }).el,
      },
      {
        title: "2. Controlled — feedback prompt",
        codeTitle: "value + onValueChange",
        code: `let score: number | undefined;
const nps = NPS({
  value: score,
  label: "Would you recommend Algorisys to a colleague?",
  onValueChange: (n) => {
    score = n;
    nps.update({ value: score });
  },
});`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const status = document.createElement("p");
          status.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";
          status.textContent = "(no answer yet)";

          let score: number | undefined;
          const nps = NPS({
            value: score,
            label: "Would you recommend Algorisys to a colleague?",
            onValueChange: (n) => {
              score = n;
              nps.update({ value: score });
              status.textContent = `User answered ${score}.`;
            },
          });

          wrap.append(nps.el, status);
          return wrap;
        },
      },
      {
        title: "3. Custom anchor labels",
        codeTitle: "Override the question and the low/high anchors",
        code: `NPS({
  label: "How satisfied were you with the onboarding?",
  lowLabel: "Very dissatisfied",
  highLabel: "Very satisfied",
})`,
        render: () =>
          NPS({
            label: "How satisfied were you with the onboarding?",
            lowLabel: "Very dissatisfied",
            highLabel: "Very satisfied",
            defaultValue: 9,
          }).el,
      },
      {
        title: "4. Without bucket caption",
        codeTitle: "showBucket: false hides the 'You're a Promoter' line",
        codeDescription:
          "Useful when the survey aggregates results and you don't want to nudge the user with bucket labels.",
        code: `NPS({ defaultValue: 6, showBucket: false })`,
        render: () => NPS({ defaultValue: 6, showBucket: false }).el,
      },
      {
        title: "5. Read-only (display)",
        codeTitle: "readOnly disables interaction; used for showing aggregated results",
        code: `NPS({ value: 9, readOnly: true })`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "14px";
          wrap.append(
            NPS({ value: 9, readOnly: true, label: "Q1 NPS — last quarter" }).el,
            NPS({ value: 5, readOnly: true, label: "Mobile NPS — last quarter" }).el,
          );
          return wrap;
        },
      },
      {
        title: "6. Disabled",
        codeTitle: "disabled + faded",
        code: `NPS({ value: 7, disabled: true })`,
        render: () => NPS({ value: 7, disabled: true }).el,
      },
    ],
  });
}
