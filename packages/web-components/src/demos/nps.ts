import { DemoPage } from "./demo-helpers";

/**
 * NPS demo — the web-components port. <zen-nps> is the 0–10 recommend-strip.
 * `value` / `default-value` and the anchor labels are attributes; `showBucket`
 * (default true) is a JS property; `zen-value-change` fires with the score.
 */

interface NpsOpts {
  value?: number;
  defaultValue?: number;
  label?: string;
  lowLabel?: string;
  highLabel?: string;
  showBucket?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

function nps(opts: NpsOpts): HTMLElement {
  const el = document.createElement("zen-nps");
  if (opts.value != null) el.setAttribute("value", String(opts.value));
  if (opts.defaultValue != null) el.setAttribute("default-value", String(opts.defaultValue));
  if (opts.label != null) el.setAttribute("label", opts.label);
  if (opts.lowLabel != null) el.setAttribute("low-label", opts.lowLabel);
  if (opts.highLabel != null) el.setAttribute("high-label", opts.highLabel);
  if (opts.disabled) el.setAttribute("disabled", "");
  if (opts.readOnly) el.setAttribute("read-only", "");
  if (opts.showBucket === false) (el as unknown as { showBucket: boolean }).showBucket = false;
  return el;
}

export default function NpsDemo(): HTMLElement {
  return DemoPage({
    title: "NPS",
    description:
      'Net Promoter Score input — the canonical "How likely are you to recommend us?" question rendered as an 0–10 strip. Buckets are color-coded per the standard NPS definition (0–6 detractors, 7–8 passives, 9–10 promoters); the selected score gets the saturated equivalent of its bucket.',
    sections: [
      {
        title: "1. Default — uncontrolled",
        codeTitle: "default-value + listen via zen-value-change",
        code: `<zen-nps default-value="8"></zen-nps>

el.addEventListener("zen-value-change", (e) => console.log("nps:", e.detail));`,
        render: () => nps({ defaultValue: 8 }),
      },
      {
        title: "2. Controlled — feedback prompt",
        codeTitle: "value + zen-value-change",
        code: `<zen-nps label="Would you recommend Algorisys to a colleague?"></zen-nps>

el.addEventListener("zen-value-change", (e) => { el.value = e.detail; });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "8px";

          const status = document.createElement("p");
          status.className = "zen-text-xs zen-text-zen-muted-fg zen-m-0";
          status.textContent = "(no answer yet)";

          const el = nps({ label: "Would you recommend Algorisys to a colleague?" });
          el.addEventListener("zen-value-change", (e) => {
            const score = (e as CustomEvent).detail as number;
            (el as unknown as { value: number }).value = score;
            status.textContent = `User answered ${score}.`;
          });

          wrap.append(el, status);
          return wrap;
        },
      },
      {
        title: "3. Custom anchor labels",
        codeTitle: "Override the question and the low/high anchors",
        code: `<zen-nps
  label="How satisfied were you with the onboarding?"
  low-label="Very dissatisfied"
  high-label="Very satisfied"
></zen-nps>`,
        render: () =>
          nps({
            label: "How satisfied were you with the onboarding?",
            lowLabel: "Very dissatisfied",
            highLabel: "Very satisfied",
            defaultValue: 9,
          }),
      },
      {
        title: "4. Without bucket caption",
        codeTitle: "showBucket = false hides the 'You're a Promoter' line",
        codeDescription:
          "Useful when the survey aggregates results and you don't want to nudge the user with bucket labels.",
        code: `const el = document.querySelector("zen-nps");
el.showBucket = false;`,
        render: () => nps({ defaultValue: 6, showBucket: false }),
      },
      {
        title: "5. Read-only (display)",
        codeTitle: "read-only disables interaction; used for showing aggregated results",
        code: `<zen-nps value="9" read-only></zen-nps>`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.display = "flex";
          wrap.style.flexDirection = "column";
          wrap.style.gap = "14px";
          wrap.append(
            nps({ value: 9, readOnly: true, label: "Q1 NPS — last quarter" }),
            nps({ value: 5, readOnly: true, label: "Mobile NPS — last quarter" }),
          );
          return wrap;
        },
      },
      {
        title: "6. Disabled",
        codeTitle: "disabled + faded",
        code: `<zen-nps value="7" disabled></zen-nps>`,
        render: () => nps({ value: 7, disabled: true }),
      },
    ],
  });
}
