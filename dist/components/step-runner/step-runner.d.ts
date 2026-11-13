import * as React from "react";
import { type StepDef, type StepRecord } from "../../_core/step-runner";
/**
 * StepRunner — an operator's work instructions, one step at a time.
 *
 *   <StepRunner
 *     steps={routingSteps}
 *     records={records}
 *     onRecordsChange={setRecords}        // persist: a run survives a reload
 *     onReportIssue={(step) => openIssueDialog(step)}
 *     onComplete={(records) => closeBatch(records)}
 *   />
 *
 * Sequential by default: later steps are locked until the current one is done,
 * because process order exists to stop mistakes. A step can carry a checklist
 * (every item ticked before it completes) and a measurement (entered, and in
 * tolerance unless `allowFailedMeasurement`). When completing is blocked the
 * reason is written under the button, not left to a greyed-out control.
 *
 * Reporting an issue records it on the step and calls `onReportIssue`; the step
 * stays current, marked, until it is completed. Only optional steps can be
 * skipped. Done steps can be opened to review what was recorded.
 *
 * Controlled with `records` / `onRecordsChange`, or uncontrolled. Targets are
 * 48px for gloved hands.
 */
export type StepRunnerStep = StepDef & {
    /** What to do, shown under the title. */
    instructions?: React.ReactNode;
};
export type StepRunnerProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    steps: StepRunnerStep[];
    records?: Record<string, StepRecord | undefined>;
    defaultRecords?: Record<string, StepRecord | undefined>;
    onRecordsChange?: (records: Record<string, StepRecord | undefined>) => void;
    onStepComplete?: (step: StepRunnerStep, record: StepRecord) => void;
    onReportIssue?: (step: StepRunnerStep) => void;
    onComplete?: (records: Record<string, StepRecord | undefined>) => void;
    /** Allow steps out of order. Default false: later steps are locked. */
    sequential?: boolean;
    /** Let a step complete with an out-of-tolerance reading. Default false. */
    allowFailedMeasurement?: boolean;
    /** Names the list of steps. Defaults to "Steps". */
    label?: string;
};
export declare const StepRunner: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    steps: StepRunnerStep[];
    records?: Record<string, StepRecord | undefined>;
    defaultRecords?: Record<string, StepRecord | undefined>;
    onRecordsChange?: (records: Record<string, StepRecord | undefined>) => void;
    onStepComplete?: (step: StepRunnerStep, record: StepRecord) => void;
    onReportIssue?: (step: StepRunnerStep) => void;
    onComplete?: (records: Record<string, StepRecord | undefined>) => void;
    /** Allow steps out of order. Default false: later steps are locked. */
    sequential?: boolean;
    /** Let a step complete with an out-of-tolerance reading. Default false. */
    allowFailedMeasurement?: boolean;
    /** Names the list of steps. Defaults to "Steps". */
    label?: string;
} & React.RefAttributes<HTMLDivElement>>;
//# sourceMappingURL=step-runner.d.ts.map