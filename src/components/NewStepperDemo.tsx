import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Stepper,
  StepperList,
  StepperPanel,
  StepperNavigation,
  useStepper,
  type StepperStep,
} from "./stepper/stepper";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "./form-builder/form";
import { Input } from "./form/input/input";
import { Checkbox } from "./form/checkbox/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./form/select/select";
import { Alert, AlertDescription, AlertTitle } from "./alert/alert";
import { CodeExample } from "./demo-helpers";

/* -------------------------- shared types --------------------------- */
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  street: z.string().min(2, "Street is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Pick a country"),
  idType: z.enum(["passport", "drivers_license", "national_id"]),
  idNumber: z
    .string()
    .min(4, "ID number must be at least 4 characters")
    .max(40, "Too long"),
  agree: z
    .boolean()
    .refine((v) => v === true, "You must accept to continue"),
});

type FormValues = z.infer<typeof schema>;

const steps: StepperStep[] = [
  { value: "basic", label: "Basics", description: "Name + email" },
  { value: "address", label: "Address", description: "Where you live" },
  { value: "identity", label: "Identity", description: "Government ID" },
  { value: "review", label: "Review", description: "Confirm and submit" },
];

/* -------------------------- step subtrees -------------------------- */

function BasicsStep({ form }: { form: UseFormReturn<FormValues> }) {
  const stepper = useStepper();
  return (
    <>
      <h3 className="text-base font-semibold mb-3">Basic info</h3>
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="Ada Lovelace" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@algorisys.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We'll send your account verification here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <StepperNavigation
        onBeforeNext={() => form.trigger(["name", "email"])}
      />
      <p className="text-xs text-zen-muted-fg mt-3">
        Step {stepper.currentIndex + 1} of {stepper.steps.length}
      </p>
    </>
  );
}

function AddressStep({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <>
      <h3 className="text-base font-semibold mb-3">Address</h3>
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street</FormLabel>
              <FormControl>
                <Input placeholder="221B Baker Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick one" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <StepperNavigation
        onBeforeNext={() => form.trigger(["street", "city", "country"])}
      />
    </>
  );
}

function IdentityStep({ form }: { form: UseFormReturn<FormValues> }) {
  return (
    <>
      <h3 className="text-base font-semibold mb-3">Government ID</h3>
      <div className="grid gap-4">
        <FormField
          control={form.control}
          name="idType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID type</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pick one" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">
                    Driver's license
                  </SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID number</FormLabel>
              <FormControl>
                <Input placeholder="A1234567" {...field} />
              </FormControl>
              <FormDescription>
                Stored only after you submit on the final step.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <StepperNavigation
        onBeforeNext={() => form.trigger(["idType", "idNumber"])}
      />
    </>
  );
}

function ReviewStep({
  form,
  onSubmit,
  submitted,
}: {
  form: UseFormReturn<FormValues>;
  onSubmit: () => Promise<void>;
  submitted: boolean;
}) {
  const v = form.getValues();
  return (
    <>
      <h3 className="text-base font-semibold mb-3">Review and submit</h3>
      {submitted ? (
        <Alert color="success">
          <AlertTitle>Submitted</AlertTitle>
          <AlertDescription>
            Your onboarding has been submitted. We'll email you when the
            review is complete.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm border border-zen-border rounded-zen-md p-4">
            <dt className="text-zen-muted-fg">Name</dt>
            <dd>{v.name || "—"}</dd>
            <dt className="text-zen-muted-fg">Email</dt>
            <dd>{v.email || "—"}</dd>
            <dt className="text-zen-muted-fg">Address</dt>
            <dd>
              {v.street || "—"}
              {v.city ? `, ${v.city}` : ""}
              {v.country ? `, ${v.country}` : ""}
            </dd>
            <dt className="text-zen-muted-fg">ID</dt>
            <dd>
              {v.idType ? `${v.idType} · ${v.idNumber || "—"}` : "—"}
            </dd>
          </dl>
          <FormField
            control={form.control}
            name="agree"
            render={({ field }) => (
              <FormItem
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 16,
                }}
              >
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(v) => field.onChange(v === true)}
                  />
                </FormControl>
                <FormLabel style={{ margin: 0 }}>
                  I confirm the details above are accurate.
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
      <StepperNavigation
        submitLabel={submitted ? "Submitted ✓" : "Submit application"}
        onBeforeNext={() => form.trigger("agree")}
        onSubmit={async () => {
          await onSubmit();
        }}
      />
    </>
  );
}

/* -------------------------- demo page ------------------------------ */

const OnboardingExample: React.FC<{ orientation: "horizontal" | "vertical" }> = ({
  orientation,
}) => {
  const [step, setStep] = useState("basic");
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      email: "",
      street: "",
      city: "",
      country: "",
      idType: undefined as unknown as FormValues["idType"],
      idNumber: "",
      agree: false,
    },
  });

  const handleSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
  };

  return (
    <Form {...form}>
      <Stepper
        steps={steps}
        value={step}
        onValueChange={setStep}
        orientation={orientation}
      >
        <StepperList />
        <StepperPanel value="basic">
          <BasicsStep form={form} />
        </StepperPanel>
        <StepperPanel value="address">
          <AddressStep form={form} />
        </StepperPanel>
        <StepperPanel value="identity">
          <IdentityStep form={form} />
        </StepperPanel>
        <StepperPanel value="review">
          <ReviewStep
            form={form}
            onSubmit={handleSubmit}
            submitted={submitted}
          />
        </StepperPanel>
      </Stepper>
    </Form>
  );
};

const SimpleHorizontalDemo: React.FC = () => {
  const [step, setStep] = useState("a");
  return (
    <Stepper
      steps={[
        { value: "a", label: "Welcome" },
        { value: "b", label: "Profile" },
        { value: "c", label: "Done" },
      ]}
      value={step}
      onValueChange={setStep}
    >
      <StepperList />
      <StepperPanel value="a">
        <p className="text-sm py-4">Welcome screen content.</p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="b">
        <p className="text-sm py-4">Profile fields would go here.</p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="c">
        <p className="text-sm py-4">All done — final screen.</p>
        <StepperNavigation
          submitLabel="Finish"
          onSubmit={() => alert("Finished!")}
        />
      </StepperPanel>
    </Stepper>
  );
};

const NonLinearDemo: React.FC = () => {
  const [step, setStep] = useState("planning");
  return (
    <Stepper
      steps={[
        { value: "planning", label: "Planning" },
        { value: "design", label: "Design" },
        { value: "build", label: "Build" },
        { value: "ship", label: "Ship" },
      ]}
      value={step}
      onValueChange={setStep}
      linear={false}
    >
      <StepperList />
      <StepperPanel value="planning">
        <p className="text-sm py-4">
          Click any step header — non-linear mode lets you jump around.
        </p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="design">
        <p className="text-sm py-4">Design content.</p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="build">
        <p className="text-sm py-4">Build content.</p>
        <StepperNavigation />
      </StepperPanel>
      <StepperPanel value="ship">
        <p className="text-sm py-4">Ship content.</p>
        <StepperNavigation submitLabel="Done" onSubmit={() => undefined} />
      </StepperPanel>
    </Stepper>
  );
};

const ErrorStateDemo: React.FC = () => {
  const [step, setStep] = useState("c");
  return (
    <Stepper
      steps={[
        { value: "a", label: "Account" },
        {
          value: "b",
          label: "Payment",
          description: "Card declined",
          status: "error",
        },
        { value: "c", label: "Confirmation" },
      ]}
      value={step}
      onValueChange={setStep}
      linear={false}
    >
      <StepperList />
      <StepperPanel value="c">
        <p className="text-sm py-4">
          The Payment step has{" "}
          <code>status: &quot;error&quot;</code>; its indicator turns
          red and the label uses <code>--zen-color-error</code>.
        </p>
        <StepperNavigation />
      </StepperPanel>
    </Stepper>
  );
};

const NewStepperDemo: React.FC = () => {
  return (
    <div className="demo-page">
      <h1>Stepper / Wizard</h1>
      <p className="lede">
        Multi-step navigation built for onboarding and data-collection
        journey apps. Compound API: a flat <code>steps</code> array
        feeds <code>&lt;Stepper&gt;</code>, <code>&lt;StepperList&gt;</code>{" "}
        auto-renders the visual strip, and each step's content lives in a{" "}
        <code>&lt;StepperPanel&gt;</code>. Composes with{" "}
        <code>react-hook-form</code> by calling <code>form.trigger()</code>{" "}
        from <code>onBeforeNext</code> to gate forward navigation on
        per-step validation.
      </p>

      <section className="demo-section">
        <h2>1. Minimal</h2>
        <CodeExample
          title="Three steps, no validation, default linear mode"
          code={`<Stepper steps={[
  { value: "a", label: "Welcome" },
  { value: "b", label: "Profile" },
  { value: "c", label: "Done" },
]} value={step} onValueChange={setStep}>
  <StepperList />
  <StepperPanel value="a">…<StepperNavigation /></StepperPanel>
  <StepperPanel value="b">…<StepperNavigation /></StepperPanel>
  <StepperPanel value="c">…<StepperNavigation submitLabel="Finish" /></StepperPanel>
</Stepper>`}
        >
          <div style={{ width: "100%" }}>
            <SimpleHorizontalDemo />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Onboarding flow with RHF + Zod</h2>
        <CodeExample
          title="Per-step validation via onBeforeNext + form.trigger()"
          description={`Continue only fires after the current step's fields pass validation. The last step's Submit waits on form.handleSubmit. State is preserved across navigation because the inactive panels unmount but RHF holds the data.`}
          code={`<Form {...form}>
  <Stepper steps={steps} value={step} onValueChange={setStep}>
    <StepperList />
    <StepperPanel value="basic">
      <FormField name="name" .../>
      <FormField name="email" .../>
      <StepperNavigation
        onBeforeNext={() => form.trigger(["name", "email"])}
      />
    </StepperPanel>
    {/* …address, identity, review… */}
  </Stepper>
</Form>`}
        >
          <div style={{ width: "100%" }}>
            <OnboardingExample orientation="horizontal" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Vertical orientation</h2>
        <CodeExample
          title='orientation="vertical"'
          description="The list sits to the left of the panels; useful when the form is short per step but you want the full journey visible."
          code={`<Stepper steps={steps} orientation="vertical">…</Stepper>`}
        >
          <div style={{ width: "100%" }}>
            <OnboardingExample orientation="vertical" />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Non-linear navigation</h2>
        <CodeExample
          title='linear={false} — any header is clickable'
          description="In linear mode (default) only completed + current steps are clickable. Setting linear={false} lets the user jump to any step."
          code={`<Stepper steps={steps} linear={false}>…</Stepper>`}
        >
          <div style={{ width: "100%" }}>
            <NonLinearDemo />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Error state on a step</h2>
        <CodeExample
          title='Override status: "error" on any step to surface a problem'
          description="Useful when a downstream check fails (card declined, identity rejected) and you want the step header to flag it even after the user has moved past it."
          code={`const steps = [
  { value: "a", label: "Account" },
  { value: "b", label: "Payment",
    description: "Card declined", status: "error" },
  { value: "c", label: "Confirmation" },
];`}
        >
          <div style={{ width: "100%" }}>
            <ErrorStateDemo />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Programmatic control via useStepper</h2>
        <CodeExample
          title="Read + drive Stepper state from any descendant"
          description="useStepper() inside a panel exposes the same API the navigation buttons use: currentIndex, isFirst, isLast, next(), prev(), goTo(value)."
          code={`function MyPanel() {
  const stepper = useStepper();
  return (
    <>
      <p>Step {stepper.currentIndex + 1} of {stepper.steps.length}</p>
      <Button onClick={() => stepper.goTo("review")}>
        Skip to review
      </Button>
    </>
  );
}`}
        >
          <p className="text-xs text-zen-muted-fg">
            The "Step N of M" caption under section 2's Basics step is rendered
            via <code>useStepper()</code>.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewStepperDemo;
