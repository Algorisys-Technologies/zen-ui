import { StepRunner, type StepRunnerStep } from "./step-runner/step-runner";
import { ReasonCodePicker, type ReasonCodePickerHandle } from "./reason-code-picker/reason-code-picker";
import type { StepRecord } from "@algorisys/zen-ui-core/step-runner";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

const steps: StepRunnerStep[] = [
  { id: "load", title: "Load the blank", instructions: "Seat the blank against both locating pins, burr side down." },
  {
    id: "guards",
    title: "Check the guards",
    instructions: "Confirm each before cycling the press.",
    checklist: [
      { id: "curtain", label: "Light curtain stops the ram when broken" },
      { id: "door", label: "Rear door interlock closed" },
      { id: "twohand", label: "Two-hand control responds" },
    ],
  },
  {
    id: "first-off",
    title: "First-off measurement",
    instructions: "Measure the bore of the first part with the plug gauge's digital twin.",
    measure: { label: "Bore diameter", unit: "mm", spec: { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 } },
  },
  { id: "deburr", title: "Deburr edges", optional: true, instructions: "Only for the export variant." },
  { id: "unload", title: "Unload and stack", instructions: "Stack ten to a tray, label side up." },
];

const issueReasons = [
  { id: "m07", code: "M07", label: "Tool breakage", category: "Mechanical" },
  { id: "m03", code: "M03", label: "Jam at infeed", category: "Mechanical" },
  { id: "q03", code: "Q03", label: "Dimension out of tolerance", category: "Quality" },
  { id: "s01", code: "S01", label: "No blanks", category: "Supply" },
];

type Records = Record<string, StepRecord | undefined>;

function pressSetUp(): HTMLElement {
  let records: Records = {};
  let issueStep: string | undefined;
  let issueReason: string | undefined;

  const box = document.createElement("div");
  box.className = "zen-flex zen-w-full zen-flex-col zen-gap-6";

  // The issue panel: rebuilt when a step reports one, gone after "Start again".
  const issueSlot = document.createElement("div");
  issueSlot.style.display = "contents";
  let picker: ReasonCodePickerHandle<(typeof issueReasons)[number]> | undefined;
  const raised = document.createElement("p");
  raised.className = "zen-m-0 zen-text-sm";
  raised.setAttribute("role", "status");

  const paintIssue = () => {
    picker?.destroy();
    picker = undefined;
    if (!issueStep) {
      issueSlot.replaceChildren();
      return;
    }
    const panel = document.createElement("div");
    panel.className = "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-4";
    const title = steps.find((s) => s.id === issueStep)?.title;
    const p = ReasonCodePicker({
      label: `What is wrong at "${title}"?`,
      reasons: issueReasons,
      value: issueReason,
      onChange: (id) => {
        issueReason = id;
        p.update({ value: id });
        paintRaised();
      },
    });
    picker = p;
    panel.append(p.el, raised);
    paintRaised();
    issueSlot.replaceChildren(panel);
  };
  const paintRaised = () => {
    raised.hidden = !issueReason;
    raised.textContent = issueReason
      ? `Issue raised: ${issueReasons.find((r) => r.id === issueReason)?.label}. The supervisor is notified.`
      : "";
  };

  const finished = document.createElement("span");
  finished.className = "zen-text-sm";
  finished.setAttribute("role", "status");

  const log = document.createElement("ul");
  log.className = "zen-m-0 zen-mt-2 zen-ps-5 zen-tabular-nums";
  const paintLog = () => {
    log.replaceChildren(
      ...Object.entries(records).map(([id, r]) => {
        const li = document.createElement("li");
        li.textContent =
          `${id}: ${r?.status}` +
          (r?.value != null ? ` · ${r.value}` : "") +
          (r?.checked?.length ? ` · ${r.checked.length} checked` : "");
        return li;
      }),
    );
  };

  const runner = StepRunner({
    steps,
    records,
    onRecordsChange: (next) => {
      records = next;
      runner.update({ records });
      paintLog();
    },
    onReportIssue: (s) => {
      issueStep = s.id;
      issueReason = undefined;
      paintIssue();
    },
    onComplete: () => {
      finished.textContent = "onComplete fired.";
    },
  });

  const reset = Button({
    variant: "outline",
    children: "Start again",
    onClick: () => {
      records = {};
      issueStep = undefined;
      issueReason = undefined;
      finished.textContent = "";
      runner.update({ records });
      paintIssue();
      paintLog();
    },
  });
  const controls = document.createElement("div");
  controls.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-3";
  controls.append(reset.el, finished);

  const details = document.createElement("details");
  details.className = "zen-text-sm";
  const summary = document.createElement("summary");
  summary.className = "zen-cursor-pointer";
  summary.textContent = "Recorded so far";
  details.append(summary, log);

  box.append(runner.el, issueSlot, controls, details);
  return box;
}

export default function StepRunnerDemo(): HTMLElement {
  return DemoPage({
    title: "StepRunner",
    description:
      "An operator's work instructions, one step at a time. Order is enforced, checklists must be ticked, measurements must be in tolerance — and when a step cannot complete yet, the reason is written under the button rather than left to a greyed-out control.",
    sections: [
      {
        title: "1. A press set-up",
        codeTitle: "steps, records, and what happens on an issue",
        codeDescription:
          "Later steps are locked. The guard check needs every box; the first-off reading must be within 9.90–10.10 mm — enter 10.3 and completing is blocked, with the reason. Report an issue and pick a reason below; the step stays marked until it is completed. Done steps can be opened again to review.",
        code: `const runner = StepRunner({
  steps,
  records,
  onRecordsChange: (next) => {     // persist, so a run survives a reload
    records = next;
    runner.update({ records });
  },
  onReportIssue: (step) => openIssue(step),
  onComplete: (records) => closeOperation(records),
});`,
        render: pressSetUp,
      },
    ],
  });
}
