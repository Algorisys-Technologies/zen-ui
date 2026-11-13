import type { ReasonCode, StepRecord, StepRunnerStep } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * StepRunner demo — the web-components port. <zen-step-runner> takes `steps`
 * and `records` as properties (or JSON attributes); `zen-records-change`
 * carries the next records, which the page hands back through `el.records`.
 * The issue panel is a <zen-reason-code-picker>.
 */

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

const issueReasons: ReasonCode[] = [
  { id: "m07", code: "M07", label: "Tool breakage", category: "Mechanical" },
  { id: "m03", code: "M03", label: "Jam at infeed", category: "Mechanical" },
  { id: "q03", code: "Q03", label: "Dimension out of tolerance", category: "Quality" },
  { id: "s01", code: "S01", label: "No blanks", category: "Supply" },
];

type Records = Record<string, StepRecord | undefined>;
type ZenEl = HTMLElement & Record<string, unknown>;

function pressSetUp(): HTMLElement {
  let records: Records = {};
  let issueStep: string | undefined;
  let issueReason: string | undefined;

  const box = document.createElement("div");
  box.className = "zen-flex zen-w-full zen-flex-col zen-gap-6";

  // The issue panel: rebuilt when a step reports one, gone after "Start again".
  const issueSlot = document.createElement("div");
  issueSlot.style.display = "contents";
  const raised = document.createElement("p");
  raised.className = "zen-m-0 zen-text-sm";
  raised.setAttribute("role", "status");

  const paintRaised = () => {
    raised.hidden = !issueReason;
    raised.textContent = issueReason
      ? `Issue raised: ${issueReasons.find((r) => r.id === issueReason)?.label}. The supervisor is notified.`
      : "";
  };
  const paintIssue = () => {
    if (!issueStep) {
      issueSlot.replaceChildren();
      return;
    }
    const panel = document.createElement("div");
    panel.className = "zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-4";
    const title = steps.find((s) => s.id === issueStep)?.title;
    const picker = document.createElement("zen-reason-code-picker") as ZenEl;
    picker.setAttribute("label", `What is wrong at "${title}"?`);
    picker.reasons = issueReasons;
    picker.addEventListener("zen-change", (e) => {
      const [id] = (e as CustomEvent<[string, ReasonCode]>).detail;
      issueReason = id;
      picker.value = id;
      paintRaised();
    });
    panel.append(picker, raised);
    paintRaised();
    issueSlot.replaceChildren(panel);
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

  const runner = document.createElement("zen-step-runner") as ZenEl;
  runner.steps = steps;
  runner.records = records;
  runner.addEventListener("zen-records-change", (e) => {
    records = (e as CustomEvent<Records>).detail;
    runner.records = records;
    paintLog();
  });
  runner.addEventListener("zen-report-issue", (e) => {
    issueStep = (e as CustomEvent<StepRunnerStep>).detail.id;
    issueReason = undefined;
    paintIssue();
  });
  runner.addEventListener("zen-complete", () => {
    finished.textContent = "zen-complete fired.";
  });

  const reset = document.createElement("zen-button");
  reset.setAttribute("variant", "outline");
  reset.textContent = "Start again";
  reset.addEventListener("click", () => {
    records = {};
    issueStep = undefined;
    issueReason = undefined;
    finished.textContent = "";
    runner.records = records;
    paintIssue();
    paintLog();
  });
  const controls = document.createElement("div");
  controls.className = "zen-flex zen-flex-wrap zen-items-center zen-gap-3";
  controls.append(reset, finished);

  const details = document.createElement("details");
  details.className = "zen-text-sm";
  const summary = document.createElement("summary");
  summary.className = "zen-cursor-pointer";
  summary.textContent = "Recorded so far";
  details.append(summary, log);

  box.append(runner, issueSlot, controls, details);
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
        code: `<zen-step-runner id="runner"></zen-step-runner>

const runner = document.getElementById("runner");
runner.steps = steps;
runner.records = records;
runner.addEventListener("zen-records-change", (e) => {  // persist, so a run survives a reload
  records = e.detail;
  runner.records = records;
});
runner.addEventListener("zen-report-issue", (e) => openIssue(e.detail));
runner.addEventListener("zen-complete", (e) => closeOperation(e.detail));`,
        render: pressSetUp,
      },
    ],
  });
}
