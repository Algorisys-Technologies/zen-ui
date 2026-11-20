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
import { type MeasurementSpec } from "./measurement";
export interface StepDef {
    id: string;
    title: string;
    /** Things to confirm before the step can complete. */
    checklist?: {
        id: string;
        label: string;
    }[];
    /** A reading to take. */
    measure?: {
        spec: MeasurementSpec;
        unit?: string;
        label?: string;
    };
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
    items: {
        id: string;
        status: StepRunStatus;
    }[];
    current: string | null;
    doneCount: number;
    total: number;
    complete: boolean;
}
export declare function stepRunnerState(steps: readonly StepDef[], records: Readonly<Record<string, StepRecord | undefined>>, options?: {
    sequential?: boolean;
}): StepRunnerState;
export type StepBlock = "checklist" | "measurement-missing" | "measurement-fail";
export declare function canCompleteStep(step: StepDef, draft: {
    checked?: readonly string[];
    value?: number | null;
}, options?: {
    allowFailedMeasurement?: boolean;
}): {
    ok: boolean;
    reason: StepBlock | null;
};
