import * as React from "react";
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
export declare function useStepper(): StepperContextValue;
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
export declare const Stepper: React.FC<StepperProps>;
export interface StepperListProps {
    className?: string;
}
export declare const StepperList: React.FC<StepperListProps>;
export interface StepperPanelProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    /** When true, render the panel into the DOM even when inactive
     *  (display:none) so React state inside survives navigation. Default
     *  false — inactive panels unmount. */
    forceMount?: boolean;
}
export declare const StepperPanel: React.FC<StepperPanelProps>;
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
export declare const StepperNavigation: React.FC<StepperNavigationProps>;
export {};
//# sourceMappingURL=stepper.d.ts.map