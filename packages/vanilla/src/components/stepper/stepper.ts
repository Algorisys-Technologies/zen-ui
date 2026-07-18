import { cn } from "../../lib/cn";
import {
  applyProps,
  toNodes,
  Disposer,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";
import { controllable } from "../../lib/state";
import { Button } from "../button/button";

/**
 * Stepper / Wizard — the vanilla port of the React reference.
 *
 *   const stepper = Stepper({
 *     steps: [
 *       { value: "welcome", label: "Welcome",
 *         content: "Welcome screen content." },
 *       { value: "profile", label: "Profile",
 *         content: () => profileFields },
 *       { value: "done", label: "Done",
 *         content: "All done.",
 *         navigation: { submitLabel: "Finish", onSubmit: () => finish() } },
 *     ],
 *     value: step,
 *     onValueChange: setStep,
 *   });
 *   document.body.append(stepper.el);
 *
 * ## Why one factory rather than the compound parts
 *
 * React ships `<Stepper>/<StepperList>/<StepperPanel>/<StepperNavigation>` and
 * wires them through context — a `StepperNavigation` deep inside a panel finds
 * its root without being handed anything. With no context there are only two
 * honest options: thread the root into every sub-part by hand at the call site,
 * or take the data. This takes the data, exactly as Accordion and Solid's Select
 * do for the same reason. Each step carries its panel content and (optional)
 * navigation config; the factory renders the list, the panels and the
 * navigation bars, and the returned handle exposes what React's `useStepper`
 * returned: `currentIndex`, `isFirst`, `isLast`, `next()`, `prev()`, `goTo()`.
 *
 *   stepper.goTo("review");
 *   stepper.next();
 *
 * ## State vocabulary
 *
 * Panels emit React's `data-state="active" | "inactive"`. See PORTING.md.
 */

export type StepStatus = "pending" | "current" | "completed" | "error";

/** Navigation-bar options for a step's panel. Maps to React's `StepperNavigation` props. */
export interface StepperNavigationOptions {
  /** Run before advancing; return false to block. Validation goes here. */
  onBeforeNext?: () => boolean | Promise<boolean>;
  /** Called on the last step when the user clicks Submit. The Stepper does not
   *  advance past the last step on its own — the caller owns the submission. */
  onSubmit?: () => void | Promise<void>;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  /** Hide the Back button on the first step. Default true. */
  hideBackOnFirst?: boolean;
}

export interface StepperStep {
  value: string;
  label?: string;
  description?: string;
  /** Override the auto-derived status (e.g. mark a previous step as "error"
   *  after a downstream check failed). */
  status?: StepStatus;
  /** Lock this step out of navigation entirely. */
  disabled?: boolean;
  /** The panel body for this step. A function receives the live Stepper handle,
   *  so a panel can read + drive state (React's `useStepper`). Called once. */
  content?: Child | ((api: StepperApi) => Child);
  /** The navigation bar rendered under this step's content. Omit `navigation`
   *  for the default Back / Continue bar, or set it to `false` to render none. */
  navigation?: StepperNavigationOptions | false;
}

export interface StepperProps extends BaseProps {
  steps: StepperStep[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  /** When true (default), users can only click backward into completed steps.
   *  When false, any step header is clickable. */
  linear?: boolean;
}

/** The programmatic surface React exposed through `useStepper`. Available on the
 *  returned handle and passed to each step's `content` function. */
export interface StepperApi {
  readonly value: string;
  readonly steps: StepperStep[];
  readonly currentIndex: number;
  readonly isFirst: boolean;
  readonly isLast: boolean;
  next(): void;
  prev(): void;
  goTo(value: string): void;
}

export type StepperHandle = ZenComponent<StepperProps> & StepperApi;

const INDICATOR_BASE =
  "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0 zen-h-7 zen-w-7 zen-rounded-zen-full zen-text-xs zen-font-semibold";

const INDICATOR_STYLES: Record<StepStatus, string> = {
  pending: "zen-bg-zen-background zen-border zen-border-zen-border zen-text-zen-muted-fg",
  current:
    "zen-bg-zen-primary zen-text-zen-primary-fg zen-ring-2 zen-ring-zen-primary-soft zen-ring-offset-1",
  completed: "zen-bg-zen-primary zen-text-zen-primary-fg",
  error: "zen-bg-zen-error zen-text-zen-error-fg",
};

const LABEL_STYLES: Record<StepStatus, string> = {
  pending: "zen-text-zen-muted-fg",
  current: "zen-text-zen-foreground",
  completed: "zen-text-zen-foreground",
  error: "zen-text-zen-error",
};

const CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

const checkIcon = (): Node => {
  // Our own trusted markup, never a caller's string — see PORTING.md.
  const t = document.createElement("template");
  t.innerHTML = CHECK;
  return t.content.firstChild!;
};

export function Stepper(props: StepperProps): StepperHandle {
  let current: StepperProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();

  const horizontal = () => (current.orientation ?? "horizontal") === "horizontal";
  const linear = () => current.linear ?? true;

  const indexOf = (v: string) => {
    const i = current.steps.findIndex((s) => s.value === v);
    return i < 0 ? 0 : i;
  };

  const state = controllable<string>({
    value: current.value,
    defaultValue: current.defaultValue ?? current.steps[0]?.value ?? "",
    onChange: (v) => current.onValueChange?.(v),
  });

  const statusFor = (step: StepperStep, index: number): StepStatus => {
    if (step.status) return step.status;
    const ci = indexOf(state.get());
    if (index < ci) return "completed";
    if (index === ci) return "current";
    return "pending";
  };

  const next = () => {
    const ci = indexOf(state.get());
    if (ci < current.steps.length - 1) state.set(current.steps[ci + 1].value);
  };

  const prev = () => {
    const ci = indexOf(state.get());
    if (ci > 0) state.set(current.steps[ci - 1].value);
  };

  const goTo = (v: string) => {
    const idx = current.steps.findIndex((s) => s.value === v);
    if (idx < 0) return;
    const target = current.steps[idx];
    if (target.disabled) return;
    // Linear: only backward into completed steps (or staying put). Non-linear:
    // any step is fair game.
    if (linear() && idx > indexOf(state.get())) return;
    state.set(v);
  };

  const handle: StepperHandle = {
    el,
    get value() {
      return state.get();
    },
    get steps() {
      return current.steps;
    },
    get currentIndex() {
      return indexOf(state.get());
    },
    get isFirst() {
      return indexOf(state.get()) === 0;
    },
    get isLast() {
      return indexOf(state.get()) === current.steps.length - 1;
    },
    next,
    prev,
    goTo,
    update(nextProps) {
      const structural =
        nextProps.steps !== undefined ||
        nextProps.orientation !== undefined ||
        nextProps.linear !== undefined;
      current = { ...current, ...nextProps };
      if (nextProps.value !== undefined) state.sync(nextProps.value);
      if (structural) render();
      paint();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };

  /* --------------------------- rendered refs --------------------------- */

  interface ListRef {
    li: HTMLLIElement;
    button: HTMLButtonElement;
    indicator: HTMLSpanElement;
    label: HTMLSpanElement;
    connector?: HTMLDivElement;
    step: StepperStep;
    index: number;
  }
  interface PanelRef {
    panel: HTMLDivElement;
    value: string;
  }

  let listRefs: ListRef[] = [];
  let panelRefs: PanelRef[] = [];
  const cleanups = new Disposer();
  let removeProps: (() => void) | undefined;

  const paintIndicator = (span: HTMLSpanElement, status: StepStatus, index: number) => {
    span.className = cn(INDICATOR_BASE, INDICATOR_STYLES[status]);
    if (status === "completed") span.replaceChildren(checkIcon());
    else if (status === "error") span.replaceChildren(document.createTextNode("!"));
    else span.replaceChildren(document.createTextNode(String(index + 1)));
  };

  const render = () => {
    cleanups.dispose();
    listRefs = [];
    panelRefs = [];
    el.replaceChildren();

    el.className = cn(
      "zen-w-full",
      horizontal() ? "zen-flex zen-flex-col zen-gap-6" : "zen-flex zen-gap-6",
      current.class,
    );

    /* ------------------------------ list ------------------------------ */
    const ol = document.createElement("ol");
    ol.className = cn(
      horizontal()
        ? "zen-flex zen-items-center zen-gap-2 zen-w-full"
        : "zen-flex zen-flex-col zen-gap-1 zen-min-w-[14rem] zen-shrink-0",
    );
    ol.setAttribute("aria-label", "Steps");

    current.steps.forEach((step, i) => {
      const isLastStep = i === current.steps.length - 1;
      const label = step.label ?? step.value;

      const li = document.createElement("li");
      li.className = cn(
        "zen-flex",
        horizontal()
          ? "zen-items-center zen-flex-1 zen-min-w-0"
          : "zen-flex-col zen-items-stretch",
      );

      const button = document.createElement("button");
      button.type = "button";
      const indicator = document.createElement("span");
      indicator.setAttribute("aria-hidden", "true");

      const textWrap = document.createElement("div");
      textWrap.className = "zen-flex zen-flex-col zen-min-w-0";
      const labelSpan = document.createElement("span");
      labelSpan.className = "zen-text-sm zen-font-medium zen-truncate";
      labelSpan.append(...toNodes(label));
      textWrap.append(labelSpan);
      if (step.description) {
        const desc = document.createElement("span");
        desc.className = "zen-text-xs zen-text-zen-muted-fg zen-truncate";
        desc.append(...toNodes(step.description));
        textWrap.append(desc);
      }
      button.append(indicator, textWrap);

      const onClick = () => goTo(step.value);
      button.addEventListener("click", onClick);
      cleanups.add(() => button.removeEventListener("click", onClick));

      li.append(button);

      let connector: HTMLDivElement | undefined;
      if (!isLastStep) {
        connector = document.createElement("div");
        connector.setAttribute("aria-hidden", "true");
        connector.className = cn(
          horizontal()
            ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]"
            : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1",
        );
        li.append(connector);
      }

      ol.append(li);
      listRefs.push({ li, button, indicator, label: labelSpan, connector, step, index: i });
    });

    el.append(ol);

    /* ----------------------------- panels ----------------------------- */
    for (const step of current.steps) {
      const panel = document.createElement("div");
      panel.setAttribute("role", "tabpanel");
      panel.className = cn(horizontal() ? "zen-w-full" : "zen-flex-1 zen-min-w-0");

      const body =
        typeof step.content === "function"
          ? (step.content as (api: StepperApi) => Child)(handle)
          : step.content;
      panel.append(...toNodes(body));

      if (step.navigation !== false) {
        panel.append(buildNavigation(step));
      }

      el.append(panel);
      panelRefs.push({ panel, value: step.value });
    }

    // Leftover BaseProps (id, style, data-*, aria-*) the factory does not read.
    const {
      steps: _steps,
      value: _value,
      defaultValue: _dv,
      onValueChange: _ov,
      orientation: _o,
      linear: _l,
      class: _c,
      children: _ch,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);

    paint();
  };

  /* --------------------------- navigation --------------------------- */

  const buildNavigation = (step: StepperStep): HTMLElement => {
    // navigation !== false is guaranteed by the caller; undefined means defaults.
    const opts: StepperNavigationOptions = step.navigation || {};
    const {
      onBeforeNext,
      onSubmit,
      backLabel = "Back",
      nextLabel = "Continue",
      submitLabel = "Submit",
      hideBackOnFirst = true,
    } = opts;

    const index = current.steps.findIndex((s) => s.value === step.value);
    const isFirst = index === 0;
    const isLast = index === current.steps.length - 1;
    const showBack = !(isFirst && hideBackOnFirst);

    const bar = document.createElement("div");
    bar.className = cn(
      "zen-flex zen-items-center zen-gap-2 zen-mt-6",
      showBack ? "zen-justify-between" : "zen-justify-end",
    );

    let backBtn: ReturnType<typeof Button> | undefined;
    if (showBack) {
      backBtn = Button({
        type: "button",
        variant: "outline",
        color: "neutral",
        disabled: isFirst,
        children: backLabel,
        onClick: prev,
      });
      cleanups.add(() => backBtn!.destroy());
      bar.append(backBtn.el);
    }

    let busy = false;
    const nextBtn = Button({
      type: "button",
      children: isLast ? submitLabel : nextLabel,
      onClick: async () => {
        if (busy) return;
        busy = true;
        nextBtn.update({ loading: true });
        backBtn?.update({ disabled: true });
        try {
          if (onBeforeNext) {
            const ok = await onBeforeNext();
            if (!ok) return;
          }
          if (isLast) await onSubmit?.();
          else next();
        } finally {
          busy = false;
          nextBtn.update({ loading: false });
          backBtn?.update({ disabled: isFirst });
        }
      },
    });
    cleanups.add(() => nextBtn.destroy());
    bar.append(nextBtn.el);

    return bar;
  };

  /* ------------------------------ paint ------------------------------ */

  const paint = () => {
    const activeValue = state.get();

    for (const ref of listRefs) {
      const status = statusFor(ref.step, ref.index);
      const clickable =
        !ref.step.disabled &&
        (!linear() || status === "completed" || status === "current");

      if (status === "current") ref.li.setAttribute("aria-current", "step");
      else ref.li.removeAttribute("aria-current");

      ref.button.disabled = !clickable;
      ref.button.setAttribute(
        "aria-label",
        `${ref.step.label ?? ref.step.value}, step ${ref.index + 1} of ${current.steps.length}, ${status}`,
      );
      ref.button.className = cn(
        "zen-flex zen-items-start zen-gap-2 zen-text-left zen-min-w-0",
        "zen-bg-transparent zen-border-0 zen-p-1 zen-rounded-zen-sm",
        clickable ? "zen-cursor-pointer hover:zen-bg-zen-muted/50" : "zen-cursor-default",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        "disabled:zen-opacity-100",
      );

      paintIndicator(ref.indicator, status, ref.index);
      ref.label.className = cn("zen-text-sm zen-font-medium zen-truncate", LABEL_STYLES[status]);

      if (ref.connector) {
        ref.connector.className = cn(
          horizontal()
            ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]"
            : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1",
          status === "completed" ? "zen-bg-zen-primary" : "zen-bg-zen-border",
        );
      }
    }

    for (const ref of panelRefs) {
      const active = ref.value === activeValue;
      ref.panel.setAttribute("data-state", active ? "active" : "inactive");
      ref.panel.hidden = !active;
    }
  };

  render();
  disposer.add(state.subscribe(paint));
  disposer.add(() => cleanups.dispose());
  disposer.add(() => removeProps?.());

  return handle;
}
