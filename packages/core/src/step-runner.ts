/**
 * Step runner — the pure half of StepRunner.
 *
 *   bun run check:step-runner
 *
 * Sequential by default: the current step is the first not done or skipped,
 * and later steps are locked. A reported issue holds the line. Only optional
 * steps can be skipped. A step completes when its checklist is all ticked and
 * its measurement is entered and in tolerance (unless the caller allows a
 * failed one).
 */
import { judgeMeasurement, type MeasurementSpec } from "./measurement";

export interface StepDef {
  id: string;
  title: string;
  /** Things to confirm before the step can complete. */
  checklist?: { id: string; label: string }[];
  /** A reading to take. */
  measure?: { spec: MeasurementSpec; unit?: string; label?: string };
  /** May be skipped. */
  optional?: boolean;
}

export type StepRecordStatus = "done" | "skipped" | "issue";

export interface StepRecord {
  status: StepRecordStatus;
  /** Ticked checklist item ids. */
  checked?: string[];
  value?: number | null;
  /** When it happened, for the record. */
  at?: number;
  note?: string;
}

export type StepRunStatus = "done" | "skipped" | "issue" | "current" | "locked" | "open";

export interface StepRunnerState {
  items: { id: string; status: StepRunStatus }[];
  current: string | null;
  doneCount: number;
  total: number;
  complete: boolean;
}

const settled = (step: StepDef, r: StepRecord | undefined) =>
  r?.status === "done" || (r?.status === "skipped" && step.optional === true);

export function stepRunnerState(
  steps: readonly StepDef[],
  records: Readonly<Record<string, StepRecord | undefined>>,
  options: { sequential?: boolean } = {},
): StepRunnerState {
  const sequential = options.sequential ?? true;
  const currentIndex = steps.findIndex((s) => !settled(s, records[s.id]));
  const items = steps.map((s, i) => {
    const r = records[s.id];
    let status: StepRunStatus;
    if (r?.status === "done") status = "done";
    else if (r?.status === "skipped" && s.optional) status = "skipped";
    else if (i === currentIndex) status = r?.status === "issue" ? "issue" : "current";
    else if (r?.status === "issue") status = "issue";
    else status = sequential && currentIndex >= 0 && i > currentIndex ? "locked" : "open";
    return { id: s.id, status };
  });
  return {
    items,
    current: currentIndex < 0 ? null : steps[currentIndex].id,
    doneCount: items.filter((x) => x.status === "done").length,
    total: steps.length,
    complete: currentIndex < 0,
  };
}

export type StepBlock = "checklist" | "measurement-missing" | "measurement-fail";

export function canCompleteStep(
  step: StepDef,
  draft: { checked?: readonly string[]; value?: number | null },
  options: { allowFailedMeasurement?: boolean } = {},
): { ok: boolean; reason: StepBlock | null } {
  if (step.checklist?.length) {
    const ticked = new Set(draft.checked ?? []);
    if (!step.checklist.every((c) => ticked.has(c.id))) return { ok: false, reason: "checklist" };
  }
  if (step.measure) {
    const v = draft.value;
    if (v === undefined || v === null || !Number.isFinite(v)) return { ok: false, reason: "measurement-missing" };
    if (!options.allowFailedMeasurement && judgeMeasurement(v, step.measure.spec).verdict === "fail") {
      return { ok: false, reason: "measurement-fail" };
    }
  }
  return { ok: true, reason: null };
}
