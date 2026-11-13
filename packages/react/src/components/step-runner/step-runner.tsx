import * as React from "react";
import {
  canCompleteStep,
  stepRunnerState,
  type StepDef,
  type StepRecord,
  type StepRunStatus,
} from "@algorisys/zen-ui-core/step-runner";
import type { MessageKey } from "@algorisys/zen-ui-core/messages";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { MeasurementInput } from "../measurement-input/measurement-input";

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

const STATUS_KEY: Record<StepRunStatus, MessageKey> = {
  done: "stepRunner.status.done",
  skipped: "stepRunner.status.skipped",
  issue: "stepRunner.status.issue",
  current: "stepRunner.status.current",
  locked: "stepRunner.status.locked",
  open: "stepRunner.status.open",
};

const BLOCK_KEY = {
  checklist: "stepRunner.blockedChecklist",
  "measurement-missing": "stepRunner.blockedMeasurementMissing",
  "measurement-fail": "stepRunner.blockedMeasurementFail",
} as const satisfies Record<string, MessageKey>;

type Draft = { checked: string[]; value: number | null };
type Records = Record<string, StepRecord | undefined>;

const draftOf = (drafts: Record<string, Draft>, records: Records, id: string): Draft =>
  drafts[id] ?? { checked: records[id]?.checked ?? [], value: records[id]?.value ?? null };

const StatusDot = ({ status, n }: { status: StepRunStatus; n: number }) => (
  <span
    aria-hidden="true"
    className={cn(
      "zen-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-2 zen-border-solid zen-text-sm zen-font-semibold",
      status === "done" && "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg",
      status === "skipped" && "zen-border-zen-border zen-bg-zen-muted zen-text-zen-muted-fg",
      status === "issue" && "zen-border-zen-error zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
      status === "current" && "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg",
      (status === "locked" || status === "open") && "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg",
    )}
  >
    {status === "done" ? <Icon name="check" size={16} /> : status === "issue" ? <Icon name="warn" size={16} /> : n}
  </span>
);

export const StepRunner = React.forwardRef<HTMLDivElement, StepRunnerProps>(
  (
    {
      steps,
      records: recordsProp,
      defaultRecords,
      onRecordsChange,
      onStepComplete,
      onReportIssue,
      onComplete,
      sequential,
      allowFailedMeasurement,
      label,
      className,
      ...rest
    },
    ref,
  ) => {
    const loc = useLocale();
    const whyId = React.useId();
    const [own, setOwn] = React.useState<Records>(() => defaultRecords ?? {});
    const records = recordsProp ?? own;
    const isSequential = sequential ?? true;
    const state = React.useMemo(() => stepRunnerState(steps, records, { sequential: isSequential }), [steps, records, isSequential]);
    const statusOf = (id: string) => state.items.find((x) => x.id === id)?.status ?? "locked";

    // Which step the panel shows: the one picked from the list, else the current.
    const [picked, setPicked] = React.useState<string | undefined>();
    const shownId = picked ?? state.current ?? undefined;
    const shown = steps.find((s) => s.id === shownId);
    const shownIndex = steps.findIndex((s) => s.id === shownId);

    // Work in progress on each step: ticks and the reading, before it is recorded.
    const [drafts, setDrafts] = React.useState<Record<string, Draft>>({});
    const draft = (id: string) => draftOf(drafts, records, id);
    const patchDraft = (id: string, patch: Partial<Draft>) =>
      setDrafts((d) => ({ ...d, [id]: { ...draftOf(d, records, id), ...patch } }));

    const write = (id: string, record: StepRecord) => {
      const next = { ...records, [id]: record };
      setOwn(next);
      onRecordsChange?.(next);
      setPicked(undefined); // back to whatever is current now
      if (stepRunnerState(steps, next, { sequential: isSequential }).complete) onComplete?.(next);
      return next;
    };

    // Announce the step the panel moves to — not the whole panel on every tick.
    // Not on mount: only a MOVE is news.
    const [announced, setAnnounced] = React.useState("");
    const [prevShownId, setPrevShownId] = React.useState(shownId);
    if (shownId !== prevShownId) {
      setPrevShownId(shownId);
      setAnnounced(
        shown
          ? `${loc.t("stepRunner.stepOf", { n: shownIndex + 1, total: state.total })}: ${shown.title}`
          : loc.t("stepRunner.allDone", { total: state.total }),
      );
    }

    const shownStatus = statusOf(shownId ?? "");
    const editable = shownStatus === "current" || shownStatus === "issue" || shownStatus === "open";
    const check = shown
      ? canCompleteStep(shown, draft(shown.id), { allowFailedMeasurement })
      : { ok: false, reason: null };

    const complete = () => {
      if (!shown || !check.ok) return;
      const d = draft(shown.id);
      const record: StepRecord = { status: "done", checked: d.checked, value: d.value, at: Date.now() };
      write(shown.id, record);
      onStepComplete?.(shown, record);
    };
    const skip = () => {
      if (shown?.optional) write(shown.id, { status: "skipped", at: Date.now() });
    };
    const reportIssue = () => {
      if (!shown) return;
      const d = draft(shown.id);
      write(shown.id, { status: "issue", checked: d.checked, value: d.value, at: Date.now() });
      setPicked(shown.id);
      onReportIssue?.(shown);
    };

    return (
      <div
        ref={ref}
        className={cn(
          "zen-grid zen-w-full zen-gap-6 zen-grid-cols-[minmax(0,1fr)] md:zen-grid-cols-[var(--zen-step-rail-width)_minmax(0,1fr)]",
          className,
        )}
        {...rest}
      >
        <nav aria-label={label ?? loc.t("stepRunner.steps")}>
          <ol className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0">
            {steps.map((step, i) => {
              const status = statusOf(step.id);
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={status === "locked"}
                    aria-current={state.current === step.id ? "step" : undefined}
                    aria-pressed={shownId === step.id}
                    className={cn(
                      "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-start zen-cursor-pointer",
                      "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:hover:zen-bg-transparent",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      shownId === step.id && "zen-bg-zen-muted",
                    )}
                    onClick={() => setPicked(step.id === state.current ? undefined : step.id)}
                  >
                    <StatusDot status={status} n={i + 1} />
                    <span className="zen-flex zen-min-w-0 zen-flex-col">
                      <span className={cn("zen-text-sm zen-font-medium", status === "locked" ? "zen-text-zen-muted-fg" : "zen-text-zen-foreground")}>
                        {step.title}
                      </span>
                      <span className="zen-text-xs zen-text-zen-muted-fg">{loc.t(STATUS_KEY[status])}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        <section className="zen-flex zen-min-w-0 zen-flex-col zen-gap-4">
          <span className="zen-sr-only" aria-live="polite">
            {announced}
          </span>
          {shown ? (
            <>
              <div className="zen-flex zen-flex-col zen-gap-1">
                <span className="zen-text-sm zen-text-zen-muted-fg">
                  {loc.t("stepRunner.stepOf", { n: shownIndex + 1, total: state.total })} · {loc.t(STATUS_KEY[shownStatus])}
                </span>
                <h3 className="zen-m-0 zen-text-2xl zen-font-semibold zen-text-zen-foreground">{shown.title}</h3>
              </div>

              {shownStatus === "issue" ? (
                <p className="zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-error zen-bg-zen-error-soft zen-px-4 zen-py-3 zen-text-sm zen-font-medium zen-text-zen-error-soft-fg">
                  {loc.t("stepRunner.issueReported")}
                </p>
              ) : null}

              {shown.instructions ? (
                <div className="zen-text-base zen-leading-relaxed zen-text-zen-foreground">{shown.instructions}</div>
              ) : null}

              {shown.checklist?.length ? (
                <ul className="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0">
                  {shown.checklist.map((item) => {
                    const on = draft(shown.id).checked.includes(item.id);
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          disabled={!editable}
                          className={cn(
                            "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-text-start zen-text-base zen-cursor-pointer",
                            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                            "disabled:zen-cursor-default",
                            on ? "zen-border-zen-success zen-bg-zen-success-soft zen-text-zen-foreground" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground",
                          )}
                          onClick={() => {
                            const cur = draft(shown.id).checked;
                            patchDraft(shown.id, { checked: on ? cur.filter((x) => x !== item.id) : [...cur, item.id] });
                          }}
                        >
                          <span
                            aria-hidden="true"
                            className={cn(
                              "zen-flex zen-h-6 zen-w-6 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-2 zen-border-solid",
                              on ? "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg" : "zen-border-zen-border",
                            )}
                          >
                            {on ? <Icon name="check" size={16} /> : null}
                          </span>
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}

              {shown.measure ? (
                // Keyed by step: one field per step, so text that is not a
                // number yet (and so never reached the record) cannot follow
                // the operator to the next step's reading.
                <MeasurementInput
                  key={shown.id}
                  label={shown.measure.label ?? shown.title}
                  unit={shown.measure.unit}
                  spec={shown.measure.spec}
                  disabled={!editable}
                  value={draft(shown.id).value}
                  onChange={(v) => patchDraft(shown.id, { value: v })}
                />
              ) : null}

              {editable ? (
                <div className="zen-flex zen-flex-col zen-gap-2">
                  <div className="zen-flex zen-flex-wrap zen-gap-3">
                    <Button size="xl" disabled={!check.ok} aria-describedby={whyId} onClick={complete}>
                      {loc.t("stepRunner.complete")}
                    </Button>
                    {shown.optional ? (
                      <Button size="xl" variant="outline" onClick={skip}>
                        {loc.t("stepRunner.skip")}
                      </Button>
                    ) : null}
                    <Button size="xl" variant="outline" color="error" onClick={reportIssue}>
                      {loc.t("stepRunner.reportIssue")}
                    </Button>
                  </div>
                  <p id={whyId} className="zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-muted-fg">
                    {check.reason ? loc.t(BLOCK_KEY[check.reason as keyof typeof BLOCK_KEY]) : ""}
                  </p>
                </div>
              ) : state.current && state.current !== shown.id ? (
                <Button className="zen-self-start" variant="outline" size="xl" onClick={() => setPicked(undefined)}>
                  {loc.t("stepRunner.goToCurrent")}
                </Button>
              ) : null}
            </>
          ) : (
            <p className="zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-lg zen-font-semibold zen-text-zen-success-soft-fg">
              <Icon name="check-circle" size={24} />
              {loc.t("stepRunner.allDone", { total: state.total })}
            </p>
          )}
        </section>
      </div>
    );
  },
);
StepRunner.displayName = "StepRunner";
