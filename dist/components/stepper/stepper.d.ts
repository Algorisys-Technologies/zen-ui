import { type JSX, type Accessor } from "solid-js";
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
export declare function useStepper(): StepperContextValue;
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
export declare const Stepper: (props: StepperProps) => JSX.Element;
export interface StepperListProps {
    class?: string;
}
export declare const StepperList: (props: StepperListProps) => JSX.Element;
export interface StepperPanelProps {
    value: string;
    children?: JSX.Element;
    class?: string;
    /** When true, render the panel into the DOM even when inactive (hidden)
     *  so component state survives navigation. Default false. */
    forceMount?: boolean;
}
export declare const StepperPanel: (props: StepperPanelProps) => JSX.Element;
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
export declare const StepperNavigation: (props: StepperNavigationProps) => JSX.Element;
export {};
//# sourceMappingURL=stepper.d.ts.map