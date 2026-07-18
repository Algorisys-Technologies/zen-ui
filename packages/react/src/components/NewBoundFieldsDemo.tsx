import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  BoundCheckbox,
  BoundInput,
  BoundRadioGroup,
  BoundSelect,
  BoundSlider,
  BoundSwitch,
  BoundTextarea,
} from "./form-builder/bound-fields";
import { Button } from "./button/button";
import { CodeExample } from "./demo-helpers";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  bio: z.string().max(160, "Keep it under 160 characters").optional(),
  plan: z.enum(["free", "pro", "team"]),
  priority: z.enum(["low", "medium", "high"]),
  volume: z.tuple([z.number().min(0).max(100)]),
  notifications: z.boolean(),
  newsletter: z.boolean(),
  agree: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms",
  }),
});

type Values = z.infer<typeof schema>;

const NewBoundFieldsDemo: React.FC = () => {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      bio: "",
      plan: "free",
      priority: "medium",
      volume: [50],
      notifications: true,
      newsletter: false,
      agree: false,
    },
    mode: "onTouched",
  });

  const onSubmit = (values: Values) => {
    alert(JSON.stringify(values, null, 2));
  };

  return (
    <div className="demo-page">
      <h1>Bound* fields (config-driven shortcut)</h1>
      <p className="lede">
        Thin adapters over the compound Form primitives that read from{" "}
        <code>useFormContext()</code> and render label + control + error in
        one shot. Same react-hook-form + Zod underneath as{" "}
        <code>&lt;FormField&gt;</code>; less boilerplate per field. Useful
        when your form is generated from a JSON / config schema.
      </p>

      <section className="demo-section">
        <h2>1. Every Bound* field in one form</h2>
        <CodeExample
          title="Pass name, label, rules — no Controller boilerplate"
          description="Each Bound* reads register / control / formState from FormProvider. Compose with the existing Form / FormField primitives if you need fully custom layout."
          code={`<FormProvider {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <BoundInput        name="email"         label="Email" required rules={{ required: "Required" }} />
    <BoundSelect       name="plan"          label="Plan"  options={planOptions} />
    <BoundRadioGroup   name="priority"      label="Priority" options={priorityOpts} orientation="horizontal" />
    <BoundSlider       name="volume"        label="Volume" min={0} max={100} />
    <BoundTextarea     name="bio"           label="Bio" />
    <BoundSwitch       name="notifications" label="Email notifications" />
    <BoundCheckbox     name="newsletter"    label="Subscribe to newsletter" />
    <BoundCheckbox     name="agree"         label="I agree to the terms" rules={{ required: "Required" }} />
    <Button type="submit">Submit</Button>
  </form>
</FormProvider>`}
        >
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              style={{ display: "grid", gap: "1rem", maxWidth: 520 }}
            >
              <BoundInput
                name="email"
                label="Email"
                required
                placeholder="you@algorisys.com"
                description="We'll never share it."
              />
              <BoundSelect
                name="plan"
                label="Plan"
                options={[
                  { value: "free", label: "Free" },
                  { value: "pro", label: "Pro" },
                  { value: "team", label: "Team" },
                ]}
              />
              <BoundRadioGroup
                name="priority"
                label="Priority"
                orientation="horizontal"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
              />
              <BoundSlider
                name="volume"
                label="Notification volume"
                min={0}
                max={100}
              />
              <BoundTextarea
                name="bio"
                label="Bio"
                rows={3}
                description="160 characters max."
              />
              <BoundSwitch
                name="notifications"
                label="Email notifications"
                description="Send a Monday summary."
              />
              <BoundCheckbox
                name="newsletter"
                label="Subscribe to the Algorisys newsletter"
              />
              <BoundCheckbox name="agree" label="I agree to the terms" />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit">Submit</Button>
                <Button
                  type="button"
                  variant="outline"
                  color="neutral"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </FormProvider>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. When to use Bound* vs the compound API</h2>
        <CodeExample
          title="Two valid idioms — pick what fits the call site"
          code={`// Bound* — config-driven, dense, fastest to write
<BoundInput name="email" label="Email" required />

// Compound (FormField + Slot) — when you want custom layout / per-field markup
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl><Input type="email" {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

Both wire to the same useForm() / FormProvider; mix freely in the same form.`}
        >
          <p style={{ color: "var(--zen-color-muted-fg)", fontSize: "0.8125rem", margin: 0 }}>
            See the code snippet for the rundown.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewBoundFieldsDemo;
