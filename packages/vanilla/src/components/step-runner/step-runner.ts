import {
  canCompleteStep,
  stepRunnerState,
  type StepDef,
  type StepRecord,
  type StepRunStatus,
} from "@algorisys/zen-ui-core/step-runner";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, setChildren, type BaseProps, type Child, type ZenComponent } from "../../lib/component";
import { useLocale, type MessageKey } from "../locale/locale";
import { Button } from "../button/button";
import { Icon } from "../icon/icon";
import { MeasurementInput, type MeasurementInputHandle } from "../measurement-input/measurement-input";

/**
 * StepRunner — an operator's work instructions, one step at a time.
 *
 *   const runner = StepRunner({
 *     steps: routingSteps,
 *     records,
 *     onRecordsChange: (next) => { save(next); runner.update({ records: next }); },
 *     onReportIssue: (step) => openIssueDialog(step),
 *     onComplete: (records) => closeBatch(records),
 *   });
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
 * Controlled with `records` / `onRecordsChange` (hand the new records back
 * through `update()`), or uncontrolled. Targets are 48px for gloved hands.
 *
 * The panel for the shown step is BUILT when the shown step changes and
 * updated in place after that, so a ticked box keeps focus and the reading
 * being typed is not rebuilt under the cursor. The rebuild is also what gives
 * each step its own measurement field: text that is not a number yet (and so
 * never reached the record) cannot follow the operator to the next step.
 */

export type StepRunnerStep = StepDef & {
  /** What to do, shown under the title. */
  instructions?: Child;
};

export interface StepRunnerProps extends Omit<BaseProps, "children"> {
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
}

export type StepRunnerHandle = ZenComponent<StepRunnerProps, HTMLDivElement>;

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

const dotClass = (status: StepRunStatus) =>
  cn(
    "zen-flex zen-h-8 zen-w-8 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-full zen-border-2 zen-border-solid zen-text-sm zen-font-semibold",
    status === "done" && "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg",
    status === "skipped" && "zen-border-zen-border zen-bg-zen-muted zen-text-zen-muted-fg",
    status === "issue" && "zen-border-zen-error zen-bg-zen-error-soft zen-text-zen-error-soft-fg",
    status === "current" && "zen-border-zen-primary zen-bg-zen-primary zen-text-zen-primary-fg",
    (status === "locked" || status === "open") && "zen-border-zen-border zen-bg-zen-background zen-text-zen-muted-fg",
  );

const NAV_BUTTON_CLASS = [
  "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-0 zen-bg-transparent zen-px-2 zen-py-1.5 zen-text-start zen-cursor-pointer",
  "hover:zen-bg-zen-muted disabled:zen-cursor-not-allowed disabled:hover:zen-bg-transparent",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
].join(" ");

const CHECK_BUTTON_CLASS = [
  "zen-flex zen-min-h-12 zen-w-full zen-items-center zen-gap-3 zen-rounded-zen-md zen-border-2 zen-border-solid zen-px-3 zen-text-start zen-text-base zen-cursor-pointer",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-default",
].join(" ");

/** One row of the step list, built once per `steps` and updated in place. */
type NavRow = { li: HTMLLIElement; button: HTMLButtonElement; dot: HTMLSpanElement; title: HTMLSpanElement; status: HTMLSpanElement };

/** The panel for one shown step: what render() updates while that step stays shown. */
type Frame = {
  id: string | undefined;
  nodes: Node[];
  disposer: Disposer;
  update: () => void;
};

let uid = 0;

export function StepRunner(props: StepRunnerProps): StepRunnerHandle {
  let current: StepRunnerProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  const whyId = `zen-step-runner-${++uid}-why`;

  let own: Records = current.defaultRecords ?? {};
  let picked: string | undefined;
  // Work in progress on each step: ticks and the reading, before it is recorded.
  let drafts: Record<string, Draft> = {};

  const records = () => current.records ?? own;
  const isSequential = () => current.sequential ?? true;
  const getState = () => stepRunnerState(current.steps, records(), { sequential: isSequential() });
  const statusOf = (id: string) => getState().items.find((x) => x.id === id)?.status ?? "locked";
  // Which step the panel shows: the one picked from the list, else the current.
  const shownIdOf = () => picked ?? getState().current ?? undefined;
  const draft = (id: string) => draftOf(drafts, records(), id);
  const patchDraft = (id: string, patch: Partial<Draft>) => {
    drafts = { ...drafts, [id]: { ...draftOf(drafts, records(), id), ...patch } };
  };

  const write = (id: string, record: StepRecord, pick?: string) => {
    const next = { ...records(), [id]: record };
    own = next;
    // Set before the caller hears, so a controlled caller's update() renders
    // the panel this write leads to and not a step in between.
    picked = pick; // back to whatever is current now, unless told otherwise
    current.onRecordsChange?.(next);
    if (stepRunnerState(current.steps, next, { sequential: isSequential() }).complete) current.onComplete?.(next);
  };

  // ── DOM ──────────────────────────────────────────────────────────────
  const el = document.createElement("div");
  const nav = document.createElement("nav");
  const ol = document.createElement("ol");
  ol.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-1 zen-p-0";
  nav.append(ol);

  const section = document.createElement("section");
  section.className = "zen-flex zen-min-w-0 zen-flex-col zen-gap-4";
  const live = document.createElement("span");
  live.className = "zen-sr-only";
  live.setAttribute("aria-live", "polite");
  section.append(live);
  el.append(nav, section);

  // Per-render icons (the step dots); released at the next render.
  const transient = new Disposer();
  disposer.add(() => transient.dispose());

  // ── the step list ────────────────────────────────────────────────────
  let rows: NavRow[] = [];
  let rowsFor: StepRunnerStep[] | undefined;
  const navDisposer = new Disposer();
  disposer.add(() => navDisposer.dispose());

  const buildNav = () => {
    navDisposer.dispose();
    rowsFor = current.steps;
    rows = current.steps.map((step) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = NAV_BUTTON_CLASS;
      const dot = document.createElement("span");
      dot.setAttribute("aria-hidden", "true");
      const text = document.createElement("span");
      text.className = "zen-flex zen-min-w-0 zen-flex-col";
      const title = document.createElement("span");
      const status = document.createElement("span");
      status.className = "zen-text-xs zen-text-zen-muted-fg";
      text.append(title, status);
      button.append(dot, text);
      li.append(button);
      const onClick = () => {
        picked = step.id === getState().current ? undefined : step.id;
        render();
      };
      button.addEventListener("click", onClick);
      navDisposer.add(() => button.removeEventListener("click", onClick));
      return { li, button, dot, title, status };
    });
    ol.replaceChildren(...rows.map((r) => r.li));
  };

  // ── the panel ────────────────────────────────────────────────────────
  let frame: Frame | undefined;
  disposer.add(() => frame?.disposer.dispose());

  const buildAllDone = (): Frame => {
    const d = new Disposer();
    const p = document.createElement("p");
    p.className = "zen-m-0 zen-flex zen-items-center zen-gap-2 zen-text-lg zen-font-semibold zen-text-zen-success-soft-fg";
    const icon = Icon({ name: "check-circle", size: 24 });
    d.add(() => icon.destroy());
    const text = document.createTextNode("");
    p.append(icon.el, text);
    return {
      id: undefined,
      nodes: [p],
      disposer: d,
      update: () => {
        text.data = loc.t("stepRunner.allDone", { total: getState().total });
      },
    };
  };

  const buildStep = (step: StepRunnerStep): Frame => {
    const d = new Disposer();
    const nodes: Node[] = [];
    const index = () => current.steps.findIndex((s) => s.id === step.id);
    const editable = () => {
      const s = statusOf(step.id);
      return s === "current" || s === "issue" || s === "open";
    };

    const head = document.createElement("div");
    head.className = "zen-flex zen-flex-col zen-gap-1";
    const meta = document.createElement("span");
    meta.className = "zen-text-sm zen-text-zen-muted-fg";
    const h3 = document.createElement("h3");
    h3.className = "zen-m-0 zen-text-2xl zen-font-semibold zen-text-zen-foreground";
    h3.textContent = step.title;
    head.append(meta, h3);
    nodes.push(head);

    const issue = document.createElement("p");
    issue.className =
      "zen-m-0 zen-rounded-zen-md zen-border zen-border-solid zen-border-zen-error zen-bg-zen-error-soft zen-px-4 zen-py-3 zen-text-sm zen-font-medium zen-text-zen-error-soft-fg";
    issue.textContent = loc.t("stepRunner.issueReported");
    nodes.push(issue);

    if (step.instructions !== undefined && step.instructions !== null && step.instructions !== false && step.instructions !== "") {
      const instr = document.createElement("div");
      instr.className = "zen-text-base zen-leading-relaxed zen-text-zen-foreground";
      setChildren(instr, step.instructions);
      nodes.push(instr);
    }

    const checks: { item: { id: string; label: string }; button: HTMLButtonElement; box: HTMLSpanElement }[] = [];
    if (step.checklist?.length) {
      const ul = document.createElement("ul");
      ul.className = "zen-m-0 zen-flex zen-list-none zen-flex-col zen-gap-2 zen-p-0";
      for (const item of step.checklist) {
        const li = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("role", "checkbox");
        const box = document.createElement("span");
        box.setAttribute("aria-hidden", "true");
        button.append(box, document.createTextNode(item.label));
        li.append(button);
        ul.append(li);
        const onClick = () => {
          const cur = draft(step.id).checked;
          const on = cur.includes(item.id);
          patchDraft(step.id, { checked: on ? cur.filter((x) => x !== item.id) : [...cur, item.id] });
          render();
        };
        button.addEventListener("click", onClick);
        d.add(() => button.removeEventListener("click", onClick));
        checks.push({ item, button, box });
      }
      nodes.push(ul);
    }

    let field: MeasurementInputHandle | undefined;
    if (step.measure) {
      // One field per step: built with the panel, destroyed with it.
      field = MeasurementInput({
        label: step.measure.label ?? step.title,
        unit: step.measure.unit,
        spec: step.measure.spec,
        disabled: !editable(),
        value: draft(step.id).value,
        onChange: (v) => {
          patchDraft(step.id, { value: v });
          render();
        },
      });
      const f = field;
      d.add(() => f.destroy());
      nodes.push(f.el);
    }

    // The two things that can sit under the step: its actions while it can be
    // worked, or a way back to the current step while reviewing another.
    const slot = document.createElement("div");
    slot.style.display = "contents";
    nodes.push(slot);

    const actions = document.createElement("div");
    actions.className = "zen-flex zen-flex-col zen-gap-2";
    const buttons = document.createElement("div");
    buttons.className = "zen-flex zen-flex-wrap zen-gap-3";
    const completeBtn = Button({
      size: "xl",
      "aria-describedby": whyId,
      children: loc.t("stepRunner.complete"),
      onClick: () => complete(step),
    });
    d.add(() => completeBtn.destroy());
    buttons.append(completeBtn.el);
    if (step.optional) {
      const skipBtn = Button({
        size: "xl",
        variant: "outline",
        children: loc.t("stepRunner.skip"),
        onClick: () => {
          write(step.id, { status: "skipped", at: Date.now() });
          render();
        },
      });
      d.add(() => skipBtn.destroy());
      buttons.append(skipBtn.el);
    }
    const issueBtn = Button({
      size: "xl",
      variant: "outline",
      color: "error",
      children: loc.t("stepRunner.reportIssue"),
      onClick: () => {
        const dr = draft(step.id);
        write(step.id, { status: "issue", checked: dr.checked, value: dr.value, at: Date.now() }, step.id);
        current.onReportIssue?.(step);
        render();
      },
    });
    d.add(() => issueBtn.destroy());
    buttons.append(issueBtn.el);
    const why = document.createElement("p");
    why.id = whyId;
    why.className = "zen-m-0 zen-min-h-5 zen-text-sm zen-text-zen-muted-fg";
    actions.append(buttons, why);

    const goTo = Button({
      class: "zen-self-start",
      variant: "outline",
      size: "xl",
      children: loc.t("stepRunner.goToCurrent"),
      onClick: () => {
        picked = undefined;
        render();
      },
    });
    d.add(() => goTo.destroy());

    let shownSlot: Node | null = null;

    return {
      id: step.id,
      nodes,
      disposer: d,
      update: () => {
        const state = getState();
        const status = statusOf(step.id);
        const canEdit = editable();
        const dr = draft(step.id);
        meta.textContent = `${loc.t("stepRunner.stepOf", { n: index() + 1, total: state.total })} · ${loc.t(STATUS_KEY[status])}`;
        issue.hidden = status !== "issue";

        for (const c of checks) {
          const on = dr.checked.includes(c.item.id);
          c.button.setAttribute("aria-checked", String(on));
          c.button.disabled = !canEdit;
          c.button.className = cn(
            CHECK_BUTTON_CLASS,
            on ? "zen-border-zen-success zen-bg-zen-success-soft zen-text-zen-foreground" : "zen-border-zen-border zen-bg-zen-background zen-text-zen-foreground",
          );
          c.box.className = cn(
            "zen-flex zen-h-6 zen-w-6 zen-shrink-0 zen-items-center zen-justify-center zen-rounded-zen-sm zen-border-2 zen-border-solid",
            on ? "zen-border-zen-success zen-bg-zen-success zen-text-zen-success-fg" : "zen-border-zen-border",
          );
          if (on && !c.box.firstChild) {
            const tick = Icon({ name: "check", size: 16 });
            d.add(() => tick.destroy());
            c.box.append(tick.el);
          }
          else if (!on) c.box.replaceChildren();
        }

        field?.update({ disabled: !canEdit, value: dr.value });

        const check = canCompleteStep(step, dr, { allowFailedMeasurement: current.allowFailedMeasurement });
        completeBtn.update({ disabled: !check.ok });
        why.textContent = check.reason ? loc.t(BLOCK_KEY[check.reason as keyof typeof BLOCK_KEY]) : "";

        const nextSlot = canEdit ? actions : state.current && state.current !== step.id ? goTo.el : null;
        if (nextSlot !== shownSlot) {
          slot.replaceChildren(...(nextSlot ? [nextSlot] : []));
          shownSlot = nextSlot;
        }
      },
    };
  };

  const complete = (step: StepRunnerStep) => {
    const dr = draft(step.id);
    if (!canCompleteStep(step, dr, { allowFailedMeasurement: current.allowFailedMeasurement }).ok) return;
    const record: StepRecord = { status: "done", checked: dr.checked, value: dr.value, at: Date.now() };
    write(step.id, record);
    current.onStepComplete?.(step, record);
    render();
  };

  // ── render ───────────────────────────────────────────────────────────
  let removeProps: (() => void) | undefined;
  let prevShownId: string | undefined;
  let mounted = false;

  const render = () => {
    const {
      steps,
      records: _records,
      defaultRecords: _defaultRecords,
      onRecordsChange: _onRecordsChange,
      onStepComplete: _onStepComplete,
      onReportIssue: _onReportIssue,
      onComplete: _onComplete,
      sequential: _sequential,
      allowFailedMeasurement: _allowFailedMeasurement,
      label,
      class: className,
      ...rest
    } = current;
    transient.dispose();

    el.className = cn(
      "zen-grid zen-w-full zen-gap-6 zen-grid-cols-[minmax(0,1fr)] md:zen-grid-cols-[var(--zen-step-rail-width)_minmax(0,1fr)]",
      className,
    );
    nav.setAttribute("aria-label", label ?? loc.t("stepRunner.steps"));

    const stepsChanged = rowsFor !== steps;
    if (stepsChanged) buildNav();
    const state = getState();
    const shownId = shownIdOf();
    const shown = steps.find((s) => s.id === shownId);

    steps.forEach((step, i) => {
      const row = rows[i];
      const status = statusOf(step.id);
      row.button.disabled = status === "locked";
      if (state.current === step.id) row.button.setAttribute("aria-current", "step");
      else row.button.removeAttribute("aria-current");
      row.button.setAttribute("aria-pressed", String(shownId === step.id));
      row.button.className = cn(NAV_BUTTON_CLASS, shownId === step.id && "zen-bg-zen-muted");
      row.dot.className = dotClass(status);
      if (status === "done" || status === "issue") {
        const icon = Icon({ name: status === "done" ? "check" : "warn", size: 16 });
        transient.add(() => icon.destroy());
        row.dot.replaceChildren(icon.el);
      } else {
        row.dot.textContent = String(i + 1);
      }
      row.title.className = cn("zen-text-sm zen-font-medium", status === "locked" ? "zen-text-zen-muted-fg" : "zen-text-zen-foreground");
      row.title.textContent = step.title;
      row.status.textContent = loc.t(STATUS_KEY[status]);
    });

    // Rebuild the panel when the shown step changes (or the steps do).
    if (!frame || frame.id !== shown?.id || stepsChanged) {
      frame?.disposer.dispose();
      for (const n of frame?.nodes ?? []) n.parentNode?.removeChild(n);
      frame = shown ? buildStep(shown) : buildAllDone();
      section.append(...frame.nodes);
    }
    frame!.update();

    // Announce the step the panel moves to — not the whole panel on every tick.
    // Not on mount: only a MOVE is news.
    if (mounted && shownId !== prevShownId) {
      live.textContent = shown
        ? `${loc.t("stepRunner.stepOf", { n: steps.indexOf(shown) + 1, total: state.total })}: ${shown.title}`
        : loc.t("stepRunner.allDone", { total: state.total });
    }
    prevShownId = shownId;
    mounted = true;

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
