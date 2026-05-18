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
          "w-full",
          orientation === "vertical" ? "flex gap-6" : "flex flex-col gap-6",
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
          ? "flex items-center gap-2 w-full"
          : "flex flex-col gap-1 min-w-[14rem] shrink-0",
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
              "flex",
              horizontal
                ? "items-center flex-1 min-w-0"
                : "flex-col items-stretch",
            )}
            aria-current={status === "current" ? "step" : undefined}
          >
            <button
              type="button"
              onClick={() => ctx.goTo(step.value)}
              disabled={!clickable}
              aria-label={`${label}, step ${i + 1} of ${ctx.steps.length}, ${status}`}
              className={cn(
                "flex items-start gap-2 text-left min-w-0",
                "bg-transparent border-0 p-1 rounded-zen-sm",
                clickable
                  ? "cursor-pointer hover:bg-zen-muted/50"
                  : "cursor-default",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring",
                "disabled:opacity-100",
              )}
            >
              <StepperIndicator status={status} index={i} />
              <div className="flex flex-col min-w-0">
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    status === "current"
                      ? "text-zen-foreground"
                      : status === "completed"
                      ? "text-zen-foreground"
                      : status === "error"
                      ? "text-zen-error"
                      : "text-zen-muted-fg",
                  )}
                >
                  {label}
                </span>
                {step.description ? (
                  <span className="text-xs text-zen-muted-fg truncate">
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
                    ? "flex-1 h-px mx-2 min-w-[1rem]"
                    : "ml-[1.05rem] w-px h-4 my-1",
                  status === "completed" ? "bg-zen-primary" : "bg-zen-border",
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
    pending: "bg-zen-background border border-zen-border text-zen-muted-fg",
    current:
      "bg-zen-primary text-zen-primary-fg ring-2 ring-zen-primary-soft ring-offset-1",
    completed: "bg-zen-primary text-zen-primary-fg",
    error: "bg-zen-error text-zen-error-fg",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center flex-shrink-0",
        "h-7 w-7 rounded-zen-full",
        "text-xs font-semibold",
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
        ctx.orientation === "vertical" ? "flex-1 min-w-0" : "w-full",
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
        "flex items-center gap-2 mt-6",
        showBack ? "justify-between" : "justify-end",
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
