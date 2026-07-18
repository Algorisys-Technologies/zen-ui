import {
  type JSX,
  type Accessor,
  createContext,
  createMemo,
  createSignal,
  useContext,
  For,
  Show,
} from "solid-js";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

/**
 * Stepper / Wizard — multi-step navigation with compound API.
 *
 * Driven by a flat `steps` array (each with a stable `value` + visible
 * label / description / optional override status). Composes with
 * @modular-forms/solid: render a `<StepperPanel>` per step with the
 * form subtree inside, and call `validate()` from `onBeforeNext` so
 * advancing only fires after the current step validates.
 *
 *   const steps = [
 *     { value: "basic",   label: "Basics" },
 *     { value: "address", label: "Address" },
 *     { value: "review",  label: "Review" },
 *   ];
 *
 *   <Stepper steps={steps} value={step()} onValueChange={setStep}>
 *     <StepperList />
 *     <StepperPanel value="basic">…<StepperNavigation /></StepperPanel>
 *     <StepperPanel value="address">…<StepperNavigation /></StepperPanel>
 *     <StepperPanel value="review">…<StepperNavigation onSubmit={send} /></StepperPanel>
 *   </Stepper>
 *
 * Linear mode (default) only allows clicking back into completed steps.
 * Non-linear mode lets the user jump to any step.
 */

export type StepStatus = "pending" | "current" | "completed" | "error";

export interface StepperStep {
  value: string;
  label?: string;
  description?: string;
  /** Override the auto-derived status. */
  status?: StepStatus;
  disabled?: boolean;
}

interface StepperContextValue {
  value: Accessor<string>;
  setValue: (v: string) => void;
  steps: Accessor<StepperStep[]>;
  orientation: Accessor<"horizontal" | "vertical">;
  linear: Accessor<boolean>;
  currentIndex: Accessor<number>;
  currentStep: Accessor<StepperStep | undefined>;
  isFirst: Accessor<boolean>;
  isLast: Accessor<boolean>;
  next: () => void;
  prev: () => void;
  goTo: (v: string) => void;
  statusFor: (step: StepperStep, index: number) => StepStatus;
}

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepper(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error(
      "useStepper / StepperList / StepperPanel / StepperNavigation must be rendered inside <Stepper>",
    );
  }
  return ctx;
}

export interface StepperProps {
  steps: StepperStep[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  orientation?: "horizontal" | "vertical";
  linear?: boolean;
  class?: string;
  children?: JSX.Element;
}

export const Stepper = (props: StepperProps) => {
  const stepsAccessor = createMemo(() => props.steps);
  const orientationAccessor = createMemo(() => props.orientation ?? "horizontal");
  const linearAccessor = createMemo(() => props.linear ?? true);

  const [inner, setInner] = createSignal<string>(
    props.defaultValue ?? props.steps[0]?.value ?? "",
  );
  const value = createMemo(() => props.value ?? inner());

  const setValue = (next: string) => {
    if (props.value === undefined) setInner(next);
    props.onValueChange?.(next);
  };

  const currentIndex = createMemo(() => {
    const idx = stepsAccessor().findIndex((s) => s.value === value());
    return Math.max(0, idx);
  });
  const currentStep = createMemo(() => stepsAccessor()[currentIndex()]);
  const isFirst = createMemo(() => currentIndex() === 0);
  const isLast = createMemo(() => currentIndex() === stepsAccessor().length - 1);

  const next = () => {
    const i = currentIndex();
    const arr = stepsAccessor();
    if (i < arr.length - 1) setValue(arr[i + 1].value);
  };
  const prev = () => {
    const i = currentIndex();
    if (i > 0) setValue(stepsAccessor()[i - 1].value);
  };
  const goTo = (v: string) => {
    const arr = stepsAccessor();
    const idx = arr.findIndex((s) => s.value === v);
    if (idx < 0) return;
    const target = arr[idx];
    if (target.disabled) return;
    // Linear: only forward to next, or back to already-completed.
    if (linearAccessor() && idx > currentIndex()) return;
    setValue(v);
  };
  const statusFor = (step: StepperStep, index: number): StepStatus => {
    if (step.status) return step.status;
    if (index < currentIndex()) return "completed";
    if (index === currentIndex()) return "current";
    return "pending";
  };

  const ctx: StepperContextValue = {
    value,
    setValue,
    steps: stepsAccessor,
    orientation: orientationAccessor,
    linear: linearAccessor,
    currentIndex,
    currentStep,
    isFirst,
    isLast,
    next,
    prev,
    goTo,
    statusFor,
  };

  return (
    <StepperContext.Provider value={ctx}>
      <div
        class={cn(
          "zen-w-full",
          orientationAccessor() === "vertical" ? "zen-flex zen-gap-6" : "zen-flex zen-flex-col zen-gap-6",
          props.class,
        )}
      >
        {props.children}
      </div>
    </StepperContext.Provider>
  );
};

export interface StepperListProps {
  class?: string;
}

export const StepperList = (props: StepperListProps) => {
  const ctx = useStepper();
  const horizontal = createMemo(() => ctx.orientation() === "horizontal");

  return (
    <ol
      class={cn(
        horizontal()
          ? "zen-flex zen-items-center zen-gap-2 zen-w-full"
          : "zen-flex zen-flex-col zen-gap-1 zen-min-w-[14rem] zen-shrink-0",
        props.class,
      )}
      aria-label="Steps"
    >
      <For each={ctx.steps()}>
        {(step, i) => {
          const status = createMemo(() => ctx.statusFor(step, i()));
          const isLast = createMemo(() => i() === ctx.steps().length - 1);
          const clickable = createMemo(
            () =>
              !step.disabled &&
              (!ctx.linear() || status() === "completed" || status() === "current"),
          );
          const label = step.label ?? step.value;
          return (
            <li
              class={cn(
                "zen-flex",
                horizontal()
                  ? "zen-items-center zen-flex-1 zen-min-w-0"
                  : "zen-flex-col zen-items-stretch",
              )}
              aria-current={status() === "current" ? "step" : undefined}
            >
              <button
                type="button"
                onClick={() => ctx.goTo(step.value)}
                disabled={!clickable()}
                aria-label={`${label}, step ${i() + 1} of ${ctx.steps().length}, ${status()}`}
                class={cn(
                  "zen-flex zen-items-start zen-gap-2 zen-text-left zen-min-w-0",
                  "zen-bg-transparent zen-border-0 zen-p-1 zen-rounded-zen-sm",
                  clickable()
                    ? "zen-cursor-pointer hover:zen-bg-zen-muted/50"
                    : "zen-cursor-default",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  "disabled:zen-opacity-100",
                )}
              >
                <StepperIndicator status={status()} index={i()} />
                <div class="zen-flex zen-flex-col zen-min-w-0">
                  <span
                    class={cn(
                      "zen-text-sm zen-font-medium zen-truncate",
                      status() === "error"
                        ? "zen-text-zen-error"
                        : status() === "pending"
                          ? "zen-text-zen-muted-fg"
                          : "zen-text-zen-foreground",
                    )}
                  >
                    {label}
                  </span>
                  <Show when={step.description}>
                    <span class="zen-text-xs zen-text-zen-muted-fg zen-truncate">
                      {step.description}
                    </span>
                  </Show>
                </div>
              </button>
              <Show when={!isLast()}>
                <div
                  aria-hidden="true"
                  class={cn(
                    horizontal()
                      ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]"
                      : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1",
                    status() === "completed" ? "zen-bg-zen-primary" : "zen-bg-zen-border",
                  )}
                />
              </Show>
            </li>
          );
        }}
      </For>
    </ol>
  );
};

const StepperIndicator = (props: { status: StepStatus; index: number }) => {
  const styles: Record<StepStatus, string> = {
    pending: "zen-bg-zen-background zen-border zen-border-zen-border zen-text-zen-muted-fg",
    current:
      "zen-bg-zen-primary zen-text-zen-primary-fg zen-ring-2 zen-ring-zen-primary-soft zen-ring-offset-1",
    completed: "zen-bg-zen-primary zen-text-zen-primary-fg",
    error: "zen-bg-zen-error zen-text-zen-error-fg",
  };
  return (
    <span
      class={cn(
        "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
        "zen-h-7 zen-w-7 zen-rounded-zen-full",
        "zen-text-xs zen-font-semibold",
        styles[props.status],
      )}
      aria-hidden="true"
    >
      <Show
        when={props.status === "completed"}
        fallback={props.status === "error" ? "!" : props.index + 1}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </Show>
    </span>
  );
};

export interface StepperPanelProps {
  value: string;
  children?: JSX.Element;
  class?: string;
  /** When true, render the panel into the DOM even when inactive (hidden)
   *  so component state survives navigation. Default false. */
  forceMount?: boolean;
}

export const StepperPanel = (props: StepperPanelProps) => {
  const ctx = useStepper();
  const active = createMemo(() => ctx.value() === props.value);
  return (
    <Show when={active() || props.forceMount}>
      <div
        role="tabpanel"
        data-state={active() ? "active" : "inactive"}
        hidden={!active()}
        class={cn(
          ctx.orientation() === "vertical" ? "zen-flex-1 zen-min-w-0" : "zen-w-full",
          props.class,
        )}
      >
        {props.children}
      </div>
    </Show>
  );
};

export interface StepperNavigationProps {
  /** Run before advancing; return false to block. Validation goes here. */
  onBeforeNext?: () => boolean | Promise<boolean>;
  /** Called on the last step. The Stepper doesn't advance past the last
   *  step on its own — the caller owns submission. */
  onSubmit?: () => void | Promise<void>;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  class?: string;
  /** Hide the Back button on the first step. Default true. */
  hideBackOnFirst?: boolean;
}

export const StepperNavigation = (props: StepperNavigationProps) => {
  const ctx = useStepper();
  const [busy, setBusy] = createSignal(false);

  const handleNext = async () => {
    if (busy()) return;
    setBusy(true);
    try {
      if (props.onBeforeNext) {
        const ok = await props.onBeforeNext();
        if (!ok) return;
      }
      if (ctx.isLast()) {
        await props.onSubmit?.();
      } else {
        ctx.next();
      }
    } finally {
      setBusy(false);
    }
  };

  const showBack = createMemo(
    () => !(ctx.isFirst() && (props.hideBackOnFirst ?? true)),
  );

  return (
    <div
      class={cn(
        "zen-flex zen-items-center zen-gap-2 zen-mt-6",
        showBack() ? "zen-justify-between" : "zen-justify-end",
        props.class,
      )}
    >
      <Show when={showBack()}>
        <Button
          type="button"
          variant="outline"
          color="neutral"
          disabled={ctx.isFirst() || busy()}
          onClick={ctx.prev}
        >
          {props.backLabel ?? "Back"}
        </Button>
      </Show>
      <Button type="button" onClick={handleNext} loading={busy()}>
        {ctx.isLast() ? (props.submitLabel ?? "Submit") : (props.nextLabel ?? "Continue")}
      </Button>
    </div>
  );
};
