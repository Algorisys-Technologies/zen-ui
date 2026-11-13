/**
 * Step runner contract.
 *
 *   bun run check:step-runner
 *
 * The pure half of StepRunner: an operator's work instructions, one step at a
 * time. What must hold:
 *
 *  - Sequential by default: the current step is the first not yet done or
 *    skipped, and every step after it is locked. Process order exists to stop
 *    mistakes, so the UI must not let a later step be completed first.
 *  - An issue holds the line: a step with a reported issue stays current (and
 *    says so) until it is done.
 *  - Only optional steps can be skipped.
 *  - A step can be completed only when every checklist item is ticked and its
 *    measurement is entered; an out-of-tolerance reading blocks completion
 *    unless the caller allows it — the way forward is to report an issue.
 *  - The run is complete when every step is done or (optional and) skipped.
 */
import { stepRunnerState, canCompleteStep, type StepDef } from "../packages/core/src/step-runner";

let f = 0;
const t = (got: unknown, want: unknown, name: string) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) f++;
  console.log(`  ${ok ? "ok  " : "FAIL"} ${name.padEnd(62)} ${ok ? "" : `got=${JSON.stringify(got)} want=${JSON.stringify(want)}`}`);
};

const steps: StepDef[] = [
  { id: "a", title: "Load the blank" },
  { id: "b", title: "Check guards", checklist: [{ id: "g1", label: "Light curtain" }, { id: "g2", label: "Door interlock" }] },
  { id: "c", title: "Measure bore", measure: { spec: { lower: 9.9, upper: 10.1 } } },
  { id: "d", title: "Deburr", optional: true },
  { id: "e", title: "Unload" },
];
const statuses = (s: ReturnType<typeof stepRunnerState>) => s.items.map((x) => `${x.id}:${x.status}`).join(" ");

console.log("\nsequence");
t(statuses(stepRunnerState(steps, {})), "a:current b:locked c:locked d:locked e:locked", "start: the first step is current, the rest locked");
const mid = stepRunnerState(steps, { a: { status: "done" }, b: { status: "done" } });
t([statuses(mid), mid.current, mid.doneCount, mid.complete], ["a:done b:done c:current d:locked e:locked", "c", 2, false], "two done");
t(statuses(stepRunnerState(steps, {}, { sequential: false })), "a:current b:open c:open d:open e:open", "not sequential: later steps open, not locked");
t(
  statuses(stepRunnerState(steps, { a: { status: "done" }, c: { status: "done" } }, { sequential: false })),
  "a:done b:current c:done d:open e:open",
  "out of order (allowed): current is the first not done",
);

console.log("\nissues and skipping");
const held = stepRunnerState(steps, { a: { status: "done" }, b: { status: "issue" } });
t([statuses(held), held.current], ["a:done b:issue c:locked d:locked e:locked", "b"], "an issue holds the line and stays current");
const skipped = stepRunnerState(steps, { a: { status: "done" }, b: { status: "done" }, c: { status: "done" }, d: { status: "skipped" } });
t([skipped.current, skipped.items[3].status], ["e", "skipped"], "an optional step skipped: the next is current");
t(
  stepRunnerState(steps, { a: { status: "skipped" } }).items[0].status,
  "current",
  "a required step cannot be skipped: a 'skipped' record on it is ignored",
);
const all = { a: { status: "done" }, b: { status: "done" }, c: { status: "done" }, d: { status: "skipped" }, e: { status: "done" } } as const;
const end = stepRunnerState(steps, all);
t([end.complete, end.current, end.doneCount, end.total], [true, null, 4, 5], "all done or skipped: complete, nothing current");

console.log("\ncanCompleteStep");
t(canCompleteStep(steps[0], {}), { ok: true, reason: null }, "a plain step: always");
t(canCompleteStep(steps[1], { checked: ["g1"] }), { ok: false, reason: "checklist" }, "checklist not all ticked");
t(canCompleteStep(steps[1], { checked: ["g2", "g1", "zz"] }), { ok: true, reason: null }, "all ticked (order and extras do not matter)");
t(canCompleteStep(steps[2], {}), { ok: false, reason: "measurement-missing" }, "no reading yet");
t(canCompleteStep(steps[2], { value: 10.02 }), { ok: true, reason: null }, "in tolerance");
t(canCompleteStep(steps[2], { value: 10.3 }), { ok: false, reason: "measurement-fail" }, "out of tolerance blocks");
t(canCompleteStep(steps[2], { value: 10.3 }, { allowFailedMeasurement: true }), { ok: true, reason: null }, "…unless the caller allows it");

console.log(`\n${f === 0 ? "all passed" : `${f} FAILED`}`);
process.exit(f === 0 ? 0 : 1);
