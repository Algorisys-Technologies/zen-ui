import { createSignal } from "solid-js";
import {
  Stepper,
  StepperList,
  StepperPanel,
  StepperNavigation,
  type StepperStep,
} from "./stepper/stepper";
import { Card, CardContent } from "./card/card";
import { DemoPage, DemoSection } from "./demo-helpers";

const steps: StepperStep[] = [
  { value: "basic", label: "Basics", description: "Name, email" },
  { value: "address", label: "Address", description: "Where do we ship?" },
  { value: "review", label: "Review", description: "Confirm + submit" },
];

const NewStepperDemo = () => {
  const [step, setStep] = createSignal("basic");
  const [submitted, setSubmitted] = createSignal(false);

  return (
    <DemoPage
      title="Stepper / Wizard"
      description="Multi-step navigation with linear progression. Compose with @modular-forms/solid via onBeforeNext for per-step validation."
    >
      <DemoSection
        title="Horizontal · linear"
        codeTitle="A flat steps array + one StepperPanel per step"
        codeDescription="Linear mode (the default) only lets the user click back into completed steps. StepperList renders the strip; StepperNavigation renders Back/Continue, and Submit on the last step."
        code={`const steps: StepperStep[] = [
  { value: "basic", label: "Basics", description: "Name, email" },
  { value: "address", label: "Address", description: "Where do we ship?" },
  { value: "review", label: "Review", description: "Confirm + submit" },
];

const [step, setStep] = createSignal("basic");
const [submitted, setSubmitted] = createSignal(false);

<Stepper steps={steps} value={step()} onValueChange={setStep}>
  <StepperList />
  <Card padding="md">
    <CardContent>
      <StepperPanel value="basic">
        <p class="zen-text-sm">Step 1 — collect name + email here.</p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="address">
        <p class="zen-text-sm">Step 2 — collect a shipping address here.</p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="review">
        <p class="zen-text-sm">Step 3 — show a summary and let the user confirm.</p>
        <StepperNavigation
          submitLabel="Submit application"
          onSubmit={() => setSubmitted(true)}
        />
      </StepperPanel>
    </CardContent>
  </Card>
</Stepper>
<Show when={submitted()}>
  <p class="zen-text-sm zen-text-zen-success zen-mt-3">Submitted — thanks!</p>
</Show>`}
      >
        <div class="zen-w-full zen-max-w-2xl">
          <Stepper steps={steps} value={step()} onValueChange={setStep}>
            <StepperList />
            <Card padding="md">
              <CardContent>
                <StepperPanel value="basic">
                  <p class="zen-text-sm">Step 1 — collect name + email here.</p>
                  <StepperNavigation />
                </StepperPanel>
                <StepperPanel value="address">
                  <p class="zen-text-sm">Step 2 — collect a shipping address here.</p>
                  <StepperNavigation />
                </StepperPanel>
                <StepperPanel value="review">
                  <p class="zen-text-sm">
                    Step 3 — show a summary and let the user confirm.
                  </p>
                  <StepperNavigation
                    submitLabel="Submit application"
                    onSubmit={() => {
                      setSubmitted(true);
                    }}
                  />
                </StepperPanel>
              </CardContent>
            </Card>
          </Stepper>
          {submitted() ? (
            <p class="zen-text-sm zen-text-zen-success zen-mt-3">Submitted — thanks!</p>
          ) : null}
        </div>
      </DemoSection>
    </DemoPage>
  );
};

export default NewStepperDemo;
