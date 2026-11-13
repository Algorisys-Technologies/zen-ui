import { type JSX, For, Show, createEffect, createMemo, createSignal, createUniqueId, on, splitProps } from "solid-js";
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
 *     records={records()}
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
  instructions?: JSX.Element;
};

export type StepRunnerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
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

export const StepRunner = (props: StepRunnerProps) => {
  const [local, rest] = splitProps(props, [
    "steps",
    "records",
    "defaultRecords",
    "onRecordsChange",
    "onStepComplete",
    "onReportIssue",
    "onComplete",
    "sequential",
    "allowFailedMeasurement",
    "label",
    "class",
  ]);
  const loc = useLocale();
  const whyId = createUniqueId();
  const [own, setOwn] = createSignal<Record<string, StepRecord | undefined>>(local.defaultRecords ?? {});
  const records = () => local.records ?? own();
  const state = createMemo(() => stepRunnerState(local.steps, records(), { sequential: local.sequential ?? true }));
  const statusOf = (id: string) => state().items.find((x) => x.id === id)?.status ?? "locked";

  // Which step the panel shows: the one picked from the list, else the current.
  const [picked, setPicked] = createSignal<string | undefined>();
  const shownId = () => picked() ?? state().current ?? undefined;
  const shown = () => local.steps.find((s) => s.id === shownId());
  const shownIndex = () => local.steps.findIndex((s) => s.id === shownId());

  // Work in progress on each step: ticks and the reading, before it is recorded.
  const [drafts, setDrafts] = createSignal<Record<string, { checked: string[]; value: number | null }>>({});
  const draft = (id: string) => drafts()[id] ?? { checked: records()[id]?.checked ?? [], value: records()[id]?.value ?? null };
  const patchDraft = (id: string, patch: Partial<{ checked: string[]; value: number | null }>) =>
    setDrafts((d) => ({ ...d, [id]: { ...draft(id), ...patch } }));

  const write = (id: string, record: StepRecord) => {
    const next = { ...records(), [id]: record };
    setOwn(next);
    local.onRecordsChange?.(next);
    setPicked(undefined); // back to whatever is current now
    if (stepRunnerState(local.steps, next, { sequential: local.sequential ?? true }).complete) local.onComplete?.(next);
    return next;
  };

  // Announce the step the panel moves to — not the whole panel on every tick.
  const [announced, setAnnounced] = createSignal("");
  createEffect(
    on(
      shownId,
      () => {
        const s = shown();
        setAnnounced(
          s
            ? `${loc.t("stepRunner.stepOf", { n: shownIndex() + 1, total: state().total })}: ${s.title}`
            : loc.t("stepRunner.allDone", { total: state().total }),
        );
      },
      { defer: true },
    ),
  );

  const editable = () => {
    const s = statusOf(shownId() ?? "");
    return s === "current" || s === "issue" || s === "open";
  };
  const check = () => {
    const s = shown();
    return s ? canCompleteStep(s, draft(s.id), { allowFailedMeasurement: local.allowFailedMeasurement }) : { ok: false, reason: null };
  };

  const complete = () => {
    const s = shown();
    if (!s || !check().ok) return;
    const d = draft(s.id);
    const record: StepRecord = { status: "done", checked: d.checked, value: d.value, at: Date.now() };
    write(s.id, record);
    local.onStepComplete?.(s, record);
  };
  const skip = () => {
    const s = shown();
    if (s?.optional) write(s.id, { status: "skipped", at: Date.now() });
  };
  const reportIssue = () => {
    const s = shown();
    if (!s) return;
    const d = draft(s.id);
    write(s.id, { status: "issue", checked: d.checked, value: d.value, at: Date.now() });
    setPicked(s.id);
    local.onReportIssue?.(s);
  };

  const dot = (status: StepRunStatus, n: number) => (
    <span
      aria-hidden="true"
      class={cn(
        "zen-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-2 zen-border-solid zen-text-sm zen-font-semibold",
        status === "done" && "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg",
        status === "skipped" && "zen-border-zen-border zen-bg-zen-muted zen-text-zen-muted-fg",
        status === "issue" && "zen-border-zen-error zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
        status === "current" && "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg",
        (status === "locked" || status === "open") && "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg",
      )}
    >
      <Show when={status === "done"} fallback={status === "issue" ? <Icon name="warn" size={16} /> : n}>
        <Icon name="check" size={16} />
      </Show>
    </span>
  );

  return (
    <div
      class={cn(
        "zen-grid zen-w-full zen-gap-6 zen-grid-cols-[minmax(0,1fr)] md:zen-grid-cols-[var(--zen-step-rail-width)_minmax(0,1fr)]",
        local.class,
      )}
      {...rest}
    >
      <nav aria-label={local.label ?? loc.t("stepRunner.steps")}>
        <ol class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0">
          <For each={local.steps}>
            {(step, i) => {
              const status = () => statusOf(step.id);
              return (
                <li>
                  <button
                    type="button"
                    disabled={status() === "locked"}
                    aria-current={state().current === step.id ? "step" : undefined}
                    aria-pressed={shownId() === step.id}
                    class={cn(
                      "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-start zen-cursor-pointer",
                      "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:hover:zen-bg-transparent",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      shownId() === step.id && "zen-bg-zen-muted",
                    )}
                    onClick={() => setPicked(step.id === state().current ? undefined : step.id)}
                  >
                    {dot(status(), i() + 1)}
                    <span class="zen-flex zen-min-w-0 zen-flex-col">
                      <span class={cn("zen-text-sm zen-font-medium", status() === "locked" ? "zen-text-zen-muted-fg" : "zen-text-zen-foreground")}>
                        {step.title}
                      </span>
                      <span class="zen-text-xs zen-text-zen-muted-fg">{loc.t(STATUS_KEY[status()])}</span>
                    </span>
                  </button>
                </li>
              );
            }}
          </For>
        </ol>
      </nav>

      <section class="zen-flex zen-min-w-0 zen-flex-col zen-gap-4">
        <span class="zen-sr-only" aria-live="polite">
          {announced()}
        </span>
        <Show
          when={shown()}
          fallback={
            <p class="zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-lg zen-font-semibold zen-text-zen-success-soft-fg">
              <Icon name="check-circle" size={24} />
              {loc.t("stepRunner.allDone", { total: state().total })}
            </p>
          }
        >
          {(step) => (
            <>
              <div class="zen-flex zen-flex-col zen-gap-1">
                <span class="zen-text-sm zen-text-zen-muted-fg">
                  {loc.t("stepRunner.stepOf", { n: shownIndex() + 1, total: state().total })} · {loc.t(STATUS_KEY[statusOf(step().id)])}
                </span>
                <h3 class="zen-m-0 zen-text-2xl zen-font-semibold zen-text-zen-foreground">{step().title}</h3>
              </div>

              <Show when={statusOf(step().id) === "issue"}>
                <p class="zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-error zen-bg-zen-error-soft zen-px-4 zen-py-3 zen-text-sm zen-font-medium zen-text-zen-error-soft-fg">
                  {loc.t("stepRunner.issueReported")}
                </p>
              </Show>

              <Show when={step().instructions}>
                <div class="zen-text-base zen-leading-relaxed zen-text-zen-foreground">{step().instructions}</div>
              </Show>

              <Show when={step().checklist?.length}>
                <ul class="zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0">
                  <For each={step().checklist}>
                    {(item) => {
                      const on = () => draft(step().id).checked.includes(item.id);
                      return (
                        <li>
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={on()}
                            disabled={!editable()}
                            class={cn(
                              "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-text-start zen-text-base zen-cursor-pointer",
                              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                              "disabled:zen-cursor-default",
                              on() ? "zen-border-zen-success zen-bg-zen-success-soft zen-text-zen-foreground" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground",
                            )}
                            onClick={() => {
                              const cur = draft(step().id).checked;
                              patchDraft(step().id, { checked: on() ? cur.filter((x) => x !== item.id) : [...cur, item.id] });
                            }}
                          >
                            <span
                              aria-hidden="true"
                              class={cn(
                                "zen-flex zen-h-6 zen-w-6 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-2 zen-border-solid",
                                on() ? "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg" : "zen-border-zen-border",
                              )}
                            >
                              <Show when={on()}>
                                <Icon name="check" size={16} />
                              </Show>
                            </span>
                            {item.label}
                          </button>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </Show>

              {/* Keyed by step: one field per step, so text that is not a
                  number yet (and so never reached the record) cannot follow
                  the operator to the next step's reading. */}
              <Show when={step().id} keyed>
                {(id) => (
                  <Show when={step().measure}>
                    {(m) => (
                      <MeasurementInput
                        label={m().label ?? step().title}
                        unit={m().unit}
                        spec={m().spec}
                        disabled={!editable()}
                        value={draft(id).value}
                        onChange={(v) => patchDraft(id, { value: v })}
                      />
                    )}
                  </Show>
                )}
              </Show>

              <Show
                when={editable()}
                fallback={
                  <Show when={state().current && state().current !== step().id}>
                    <Button class="zen-self-start" variant="outline" size="xl" onClick={() => setPicked(undefined)}>
                      {loc.t("stepRunner.goToCurrent")}
                    </Button>
                  </Show>
                }
              >
                <div class="zen-flex zen-flex-col zen-gap-2">
                  <div class="zen-flex zen-flex-wrap zen-gap-3">
                    <Button size="xl" disabled={!check().ok} aria-describedby={whyId} onClick={complete}>
                      {loc.t("stepRunner.complete")}
                    </Button>
                    <Show when={step().optional}>
                      <Button size="xl" variant="outline" onClick={skip}>
                        {loc.t("stepRunner.skip")}
                      </Button>
                    </Show>
                    <Button size="xl" variant="outline" color="error" onClick={reportIssue}>
                      {loc.t("stepRunner.reportIssue")}
                    </Button>
                  </div>
                  <p id={whyId} class="zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-muted-fg">
                    {check().reason ? loc.t(BLOCK_KEY[check().reason as keyof typeof BLOCK_KEY]) : ""}
                  </p>
                </div>
              </Show>
            </>
          )}
        </Show>
      </section>
    </div>
  );
};
