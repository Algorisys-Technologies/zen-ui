import { For, Show, createSignal } from "solid-js";
import { StepRunner, type StepRunnerStep } from "./step-runner/step-runner";
import { ReasonCodePicker } from "./reason-code-picker/reason-code-picker";
import type { StepRecord } from "@algorisys/zen-ui-core/step-runner";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

const steps: StepRunnerStep[] = [
  { id: "load", title: "Load the blank", instructions: <>Seat the blank against both locating pins, burr side down.</> },
  {
    id: "guards",
    title: "Check the guards",
    instructions: <>Confirm each before cycling the press.</>,
    checklist: [
      { id: "curtain", label: "Light curtain stops the ram when broken" },
      { id: "door", label: "Rear door interlock closed" },
      { id: "twohand", label: "Two-hand control responds" },
    ],
  },
  {
    id: "first-off",
    title: "First-off measurement",
    instructions: <>Measure the bore of the first part with the plug gauge's digital twin.</>,
    measure: { label: "Bore diameter", unit: "mm", spec: { nominal: 10, lower: 9.9, upper: 10.1, warnLower: 9.95, warnUpper: 10.05 } },
  },
  { id: "deburr", title: "Deburr edges", optional: true, instructions: <>Only for the export variant.</> },
  { id: "unload", title: "Unload and stack", instructions: <>Stack ten to a tray, label side up.</> },
];

const issueReasons = [
  { id: "m07", code: "M07", label: "Tool breakage", category: "Mechanical" },
  { id: "m03", code: "M03", label: "Jam at infeed", category: "Mechanical" },
  { id: "q03", code: "Q03", label: "Dimension out of tolerance", category: "Quality" },
  { id: "s01", code: "S01", label: "No blanks", category: "Supply" },
];

const NewStepRunnerDemo = () => {
  const [records, setRecords] = createSignal<Record<string, StepRecord | undefined>>({});
  const [issueStep, setIssueStep] = createSignal<string>();
  const [issueReason, setIssueReason] = createSignal<string>();
  const [finished, setFinished] = createSignal(false);
  const reset = () => {
    setRecords({});
    setIssueStep(undefined);
    setIssueReason(undefined);
    setFinished(false);
  };
  return (
    <DemoPage
      title="StepRunner"
      description={
        <>
          An operator's work instructions, one step at a time. Order is enforced, checklists
          must be ticked, measurements must be in tolerance — and when a step cannot complete
          yet, the reason is written under the button rather than left to a greyed-out control.
        </>
      }
    >
      <DemoSection
        title="1. A press set-up"
        codeTitle="steps, records, and what happens on an issue"
        codeDescription={
          <>
            Later steps are locked. The guard check needs every box; the first-off reading must
            be within 9.90–10.10 mm — enter <code>10.3</code> and completing is blocked, with
            the reason. Report an issue and pick a reason below; the step stays marked until it
            is completed. Done steps can be opened again to review.
          </>
        }
        code={`<StepRunner
  steps={steps}
  records={records()}
  onRecordsChange={setRecords}   // persist, so a run survives a reload
  onReportIssue={(step) => openIssue(step)}
  onComplete={(records) => closeOperation(records)}
/>`}
      >
        <div class="zen-flex zen-w-full zen-flex-col zen-gap-6">
          <StepRunner
            steps={steps}
            records={records()}
            onRecordsChange={setRecords}
            onReportIssue={(s) => {
              setIssueStep(s.id);
              setIssueReason(undefined);
            }}
            onComplete={() => setFinished(true)}
          />
          <Show when={issueStep()}>
            <div class="zen-flex zen-flex-col zen-gap-3 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-border zen-p-4">
              <ReasonCodePicker
                label={`What is wrong at "${steps.find((s) => s.id === issueStep())?.title}"?`}
                reasons={issueReasons}
                value={issueReason()}
                onChange={(id) => setIssueReason(id)}
              />
              <Show when={issueReason()}>
                <p class="zen-m-0 zen-text-sm" role="status">
                  Issue raised: {issueReasons.find((r) => r.id === issueReason())?.label}. The supervisor is notified.
                </p>
              </Show>
            </div>
          </Show>
          <div class="zen-flex zen-flex-wrap zen-items-center zen-gap-3">
            <Button variant="outline" onClick={reset}>
              Start again
            </Button>
            <Show when={finished()}>
              <span class="zen-text-sm" role="status">
                onComplete fired.
              </span>
            </Show>
          </div>
          <details class="zen-text-sm">
            <summary class="zen-cursor-pointer">Recorded so far</summary>
            <ul class="zen-m-0 zen-mt-2 zen-ps-5 zen-tabular-nums">
              <For each={Object.entries(records())}>
                {([id, r]) => (
                  <li>
                    {id}: {r?.status}
                    {r?.value != null ? ` · ${r.value}` : ""}
                    {r?.checked?.length ? ` · ${r.checked.length} checked` : ""}
                  </li>
                )}
              </For>
            </ul>
          </details>
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewStepRunnerDemo;
