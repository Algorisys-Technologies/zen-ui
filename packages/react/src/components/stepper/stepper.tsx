import * as React from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button/button";

/**
 * Stepper / Wizard — multi-step navigation with compound API.
 *
 * Driven by a flat `steps` array (each with a stable `value` + visible
 * label / description / optional override status). Composes with
 * react-hook-form: render a `<StepperPanel>` per step with the form
 * subtree inside, and call `form.trigger()` from `onBeforeNext` so
 * advancing only fires after the current step validates.
 *
 *   const steps = [
 *     { value: "basic",    label: "Basics" },
 *     { value: "address",  label: "Address" },
 *     { value: "review",   label: "Review" },
 *   ];
 *
 *   <Stepper steps={steps} value={step} onValueChange={setStep}>
 *     <StepperList />
 *
 *     <StepperPanel value="basic">
 *       <NameField /> <EmailField />
 *       <StepperNavigation onBeforeNext={() => form.trigger(['name', 'email'])} />
 *     </StepperPanel>
 *     <StepperPanel value="address">
 *       <AddressFields />
 *       <StepperNavigation onBeforeNext={() => form.trigger('address')} />
 *     </StepperPanel>
 *     <StepperPanel value="review">
 *       <Summary />
 *       <StepperNavigation
 *         submitLabel="Submit application"
 *         onSubmit={form.handleSubmit(send)}
 *       />
 *     </StepperPanel>
 *   </Stepper>
 *
 * Linear mode (default) only allows clicking back into completed
 * steps. Non-linear mode lets the user jump to any step.
 */

export type StepStatus = "pending" | "current" | "completed" | "error";

export interface StepperStep {
  value: string;
  label?: string;
  description?: string;
  /** Override the auto-derived status (e.g. mark a previous step as
   *  "error" after a downstream check failed). */
  status?: StepStatus;
  /** Lock this step out of navigation entirely. */
  disabled?: boolean;
}

interface StepperContextValue {
  value: string;
  setValue: (v: string) => void;
  steps: StepperStep[];
  orientation: "horizontal" | "vertical";
  linear: boolean;
  currentIndex: number;
  currentStep: StepperStep | undefined;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  goTo: (v: string) => void;
  statusFor: (step: StepperStep, index: number) => StepStatus;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

export function useStepper() {
  const ctx = React.useContext(StepperContext);
  if (!ctx) {
    throw new Error(
      "useStepper / StepperList / StepperPanel / StepperNavigation must be rendered inside <Stepper>",
    );
  }
  return ctx;
}

/* ----------------------------- Stepper root -------------------------- */

export interface StepperProps {
  steps: StepperStep[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  orientation?: "horizontal" | "vertical";
  /** When true (default), users can only click backward into completed
   *  steps. When false, any step header is clickable. */
  linear?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  value: valueProp,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  linear = true,
  className,
  children,
}) => {
  const [valueInner, setValueInner] = React.useState<string>(
    () => defaultValue ?? steps[0]?.value ?? "",
  );
  const value = valueProp ?? valueInner;
  const setValue = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setValueInner(next);
      onValueChange?.(next);
    },
    [valueProp, onValueChange],
  );

  const currentIndex = Math.max(
    0,
    steps.findIndex((s) => s.value === value),
  );
  const currentStep = steps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === steps.length - 1;

  const next = React.useCallback(() => {
    if (currentIndex < steps.length - 1) {
      setValue(steps[currentIndex + 1].value);
    }
  }, [currentIndex, steps, setValue]);

  const prev = React.useCallback(() => {
    if (currentIndex > 0) {
      setValue(steps[currentIndex - 1].value);
    }
  }, [currentIndex, steps, setValue]);

  const goTo = React.useCallback(
    (v: string) => {
      const idx = steps.findIndex((s) => s.value === v);
      if (idx < 0) return;
      const target = steps[idx];
      if (target.disabled) return;
      /* Linear: can only move forward to the next step, or backward to
       * already-completed ones. Non-linear: any step is fair game. */
      if (linear && idx > currentIndex) return;
      setValue(v);
    },
    [steps, linear, currentIndex, setValue],
  );

  const statusFor = React.useCallback(
    (step: StepperStep, index: number): StepStatus => {
      if (step.status) return step.status;
      if (index < currentIndex) return "completed";
      if (index === currentIndex) return "current";
      return "pending";
    },
    [currentIndex],
  );

  const ctx: StepperContextValue = {
    value,
    setValue,
    steps,
    orientation,
    linear,
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
        className={cn(
          "zen-w-full",
          orientation === "vertical" ? "zen-flex zen-gap-6" : "zen-flex zen-flex-col zen-gap-6",
          className,
        )}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
};

/* ----------------------------- Stepper list -------------------------- */

export interface StepperListProps {
  className?: string;
}

export const StepperList: React.FC<StepperListProps> = ({ className }) => {
  const ctx = useStepper();
  const horizontal = ctx.orientation === "horizontal";

  return (
    <ol
      className={cn(
        horizontal
          ? "zen-flex zen-items-center zen-gap-2 zen-w-full"
          : "zen-flex zen-flex-col zen-gap-1 zen-min-w-[14rem] zen-shrink-0",
        className,
      )}
      aria-label="Steps"
    >
      {ctx.steps.map((step, i) => {
        const status = ctx.statusFor(step, i);
        const isLast = i === ctx.steps.length - 1;
        const clickable =
          !step.disabled &&
          (!ctx.linear || status === "completed" || status === "current");
        const label = step.label ?? step.value;
        return (
          <li
            key={step.value}
            className={cn(
              "zen-flex",
              horizontal
                ? "zen-items-center zen-flex-1 zen-min-w-0"
                : "zen-flex-col zen-items-stretch",
            )}
            aria-current={status === "current" ? "step" : undefined}
          >
            <button
              type="button"
              onClick={() => ctx.goTo(step.value)}
              disabled={!clickable}
              aria-label={`${label}, step ${i + 1} of ${ctx.steps.length}, ${status}`}
              className={cn(
                "zen-flex zen-items-start zen-gap-2 zen-text-start zen-min-w-0",
                "zen-bg-transparent zen-border-0 zen-p-1 zen-rounded-zen-sm",
                clickable
                  ? "zen-cursor-pointer hover:zen-bg-zen-muted/50"
                  : "zen-cursor-default",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                "disabled:zen-opacity-100",
              )}
            >
              <StepperIndicator status={status} index={i} />
              <div className="zen-flex zen-flex-col zen-min-w-0">
                <span
                  className={cn(
                    "zen-text-sm zen-font-medium zen-truncate",
                    status === "current"
                      ? "zen-text-zen-foreground"
                      : status === "completed"
                      ? "zen-text-zen-foreground"
                      : status === "error"
                      ? "zen-text-zen-error"
                      : "zen-text-zen-muted-fg",
                  )}
                >
                  {label}
                </span>
                {step.description ? (
                  <span className="zen-text-xs zen-text-zen-muted-fg zen-truncate">
                    {step.description}
                  </span>
                ) : null}
              </div>
            </button>
            {!isLast ? (
              <div
                aria-hidden
                className={cn(
                  horizontal
                    ? "zen-flex-1 zen-h-px zen-mx-2 zen-min-w-[1rem]"
                    : "zen-ml-[1.05rem] zen-w-px zen-h-4 zen-my-1",
                  status === "completed" ? "zen-bg-zen-primary" : "zen-bg-zen-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
};

/* ----------------------------- Step indicator ------------------------ */

const StepperIndicator: React.FC<{ status: StepStatus; index: number }> = ({
  status,
  index,
}) => {
  const styles: Record<StepStatus, string> = {
    pending: "zen-bg-zen-background zen-border zen-border-zen-border zen-text-zen-muted-fg",
    current:
      "zen-bg-zen-primary zen-text-zen-primary-fg zen-ring-2 zen-ring-zen-primary-soft zen-ring-offset-1",
    completed: "zen-bg-zen-primary zen-text-zen-primary-fg",
    error: "zen-bg-zen-error zen-text-zen-error-fg",
  };
  return (
    <span
      className={cn(
        "zen-inline-flex zen-items-center zen-justify-center zen-flex-shrink-0",
        "zen-h-7 zen-w-7 zen-rounded-zen-full",
        "zen-text-xs zen-font-semibold",
        styles[status],
      )}
      aria-hidden
    >
      {status === "completed" ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : status === "error" ? (
        "!"
      ) : (
        index + 1
      )}
    </span>
  );
};

/* ----------------------------- Stepper panel ------------------------- */

export interface StepperPanelProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  /** When true, render the panel into the DOM even when inactive
   *  (display:none) so React state inside survives navigation. Default
   *  false — inactive panels unmount. */
  forceMount?: boolean;
}

export const StepperPanel: React.FC<StepperPanelProps> = ({
  value,
  children,
  className,
  forceMount,
}) => {
  const ctx = useStepper();
  const active = ctx.value === value;
  if (!active && !forceMount) return null;
  return (
    <div
      role="tabpanel"
      data-state={active ? "active" : "inactive"}
      hidden={!active}
      className={cn(
        ctx.orientation === "vertical" ? "zen-flex-1 zen-min-w-0" : "zen-w-full",
        className,
      )}
    >
      {children}
    </div>
  );
};

/* ----------------------------- Navigation ---------------------------- */

export interface StepperNavigationProps {
  /** Run before advancing; return false to block. Validation goes
   *  here — e.g. `() => form.trigger(['name', 'email'])` with RHF. */
  onBeforeNext?: () => boolean | Promise<boolean>;
  /** Called on the last step when the user clicks Submit. The Stepper
   *  doesn't advance past the last step on its own — the caller owns
   *  the submission semantic. */
  onSubmit?: () => void | Promise<void>;
  backLabel?: string;
  nextLabel?: string;
  submitLabel?: string;
  className?: string;
  /** Hide the Back button on the first step. Default true. */
  hideBackOnFirst?: boolean;
}

export const StepperNavigation: React.FC<StepperNavigationProps> = ({
  onBeforeNext,
  onSubmit,
  backLabel = "Back",
  nextLabel = "Continue",
  submitLabel = "Submit",
  className,
  hideBackOnFirst = true,
}) => {
  const ctx = useStepper();
  const [busy, setBusy] = React.useState(false);

  const handleNext = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (onBeforeNext) {
        const ok = await onBeforeNext();
        if (!ok) return;
      }
      if (ctx.isLast) {
        await onSubmit?.();
      } else {
        ctx.next();
      }
    } finally {
      setBusy(false);
    }
  };

  const showBack = !(ctx.isFirst && hideBackOnFirst);

  return (
    <div
      className={cn(
        "zen-flex zen-items-center zen-gap-2 zen-mt-6",
        showBack ? "zen-justify-between" : "zen-justify-end",
        className,
      )}
    >
      {showBack ? (
        <Button
          type="button"
          variant="outline"
          color="neutral"
          disabled={ctx.isFirst || busy}
          onClick={ctx.prev}
        >
          {backLabel}
        </Button>
      ) : null}
      <Button type="button" onClick={handleNext} loading={busy}>
        {ctx.isLast ? submitLabel : nextLabel}
      </Button>
    </div>
  );
};
