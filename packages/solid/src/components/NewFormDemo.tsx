import { createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "./form-builder/form";
import {
  BoundInput,
  BoundTextarea,
  BoundSelect,
  BoundCheckbox,
  BoundSwitch,
  BoundRadioGroup,
} from "./form-builder/bound-fields";
import { Input } from "./form/input/input";
import { Button } from "./button/button";
import { DemoPage, DemoSection } from "./demo-helpers";

// Note on validation: this demo doesn't wire a schema validator since
// the repo's Zod is on v4 and modular-forms's zodForm() helper targets
// Zod v3. Plug your preferred validator into createForm({validate}) at
// the call site — the Bound* adapters surface `field.error` regardless
// of where the validation comes from.
type SignUpValues = {
  name: string;
  email: string;
  bio?: string;
  plan: string;
  newsletter?: boolean;
  marketing?: boolean;
  preferred: string;
};

// modular-forms's FieldValues constraint is recursive — passing a
// strictly-typed interface trips deep type-equality checks. Cast at the
// createForm call site keeps the demo strictly typed below the boundary.
const NewFormDemo = () => {
  const [submitted, setSubmitted] = createSignal<SignUpValues | null>(null);
  // Capture the form store (first tuple element) — Bound* needs it to
  // call setValue() for Kobalte primitives that don't drive a native input.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, { Form: MForm, Field }] = createForm<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form2, { Form: MForm2, Field: Field2 }] = createForm<any>();

  return (
    <DemoPage
      title="Form + BoundFields"
      description="Compound primitives + config-driven Bound* adapters on top of @modular-forms/solid + Zod."
    >
      <DemoSection
        title="BoundFields — config-driven form"
        codeTitle="Each Bound* adapter renders label + control + error from one line"
        codeDescription={
          <>
            Pass the form store as <code>of</code> and modular-forms' Field
            component as <code>Field</code>. The adapters read{" "}
            <code>field.error</code>, so any validator you wire into{" "}
            {"createForm({ validate })"} surfaces automatically.
          </>
        }
        code={`const [form, { Form: MForm, Field }] = createForm<SignUpValues>();

<Form>
  <MForm onSubmit={(values) => setSubmitted(values)}>
    <BoundInput
      of={form}
      Field={Field}
      name="name"
      label="Name"
      required
      placeholder="Ada Lovelace"
    />
    <BoundInput
      of={form}
      Field={Field}
      name="email"
      label="Email"
      required
      type="email"
      placeholder="ada@algorisys.com"
    />
    <BoundTextarea
      of={form}
      Field={Field}
      name="bio"
      label="Bio"
      description="A short tagline."
      rows={3}
    />
    <BoundSelect
      of={form}
      Field={Field}
      name="plan"
      label="Plan"
      required
      options={[
        { value: "free", label: "Free" },
        { value: "pro", label: "Pro" },
        { value: "enterprise", label: "Enterprise" },
      ]}
      placeholder="Choose"
    />
    <BoundRadioGroup
      of={form}
      Field={Field}
      name="preferred"
      label="Preferred contact"
      required
      orientation="horizontal"
      options={[
        { value: "email", label: "Email" },
        { value: "phone", label: "Phone" },
        { value: "sms", label: "SMS" },
      ]}
    />
    <BoundCheckbox
      of={form}
      Field={Field}
      name="newsletter"
      inlineLabel="Subscribe to the newsletter"
    />
    <BoundSwitch
      of={form}
      Field={Field}
      name="marketing"
      inlineLabel="Receive marketing updates"
    />
    <Button type="submit">Submit</Button>
  </MForm>
</Form>`}
      >
        <Form class="zen-w-full zen-max-w-md">
          <MForm
            class="zen-space-y-4"
            onSubmit={(values) => setSubmitted(values as SignUpValues)}
          >
            <BoundInput
              of={form}
              Field={Field}
              name="name"
              label="Name"
              required
              placeholder="Ada Lovelace"
            />
            <BoundInput
              of={form}
              Field={Field}
              name="email"
              label="Email"
              required
              type="email"
              placeholder="ada@algorisys.com"
            />
            <BoundTextarea
              of={form}
              Field={Field}
              name="bio"
              label="Bio"
              description="A short tagline."
              rows={3}
            />
            <BoundSelect
              of={form}
              Field={Field}
              name="plan"
              label="Plan"
              required
              options={[
                { value: "free", label: "Free" },
                { value: "pro", label: "Pro" },
                { value: "enterprise", label: "Enterprise" },
              ]}
              placeholder="Choose"
            />
            <BoundRadioGroup
              of={form}
              Field={Field}
              name="preferred"
              label="Preferred contact"
              required
              orientation="horizontal"
              options={[
                { value: "email", label: "Email" },
                { value: "phone", label: "Phone" },
                { value: "sms", label: "SMS" },
              ]}
            />
            <BoundCheckbox
              of={form}
              Field={Field}
              name="newsletter"
              inlineLabel="Subscribe to the newsletter"
            />
            <BoundSwitch
              of={form}
              Field={Field}
              name="marketing"
              inlineLabel="Receive marketing updates"
            />
            <div class="zen-flex zen-gap-2 zen-pt-2">
              <Button type="submit">Submit</Button>
            </div>
          </MForm>
        </Form>
        <Show when={submitted()}>
          <pre class="zen-text-xs zen-mt-4 zen-p-3 zen-rounded-zen-sm zen-bg-zen-muted zen-text-zen-foreground">
            {JSON.stringify(submitted(), null, 2)}
          </pre>
        </Show>
      </DemoSection>

      <DemoSection
        title="Compound API — FormField / FormItem / FormLabel / FormControl / FormMessage"
        codeTitle="Drop to the primitives when a field needs custom markup"
        codeDescription="FormField's children get (field, fieldProps) — spread fieldProps onto your control. FormItem wires the id/aria links, and FormMessage renders field.error on its own."
        code={`const [form, { Form: MForm, Field }] = createForm<{ email: string }>();

<Form>
  <MForm onSubmit={(values) => alert(\`Submitted: \${values.email}\`)}>
    <FormField of={form} Field={Field} name="email">
      {(_field, fieldProps) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="you@algorisys.com"
              {...fieldProps}
            />
          </FormControl>
          <FormDescription>We'll never share it.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    </FormField>
    <Button type="submit">Save</Button>
  </MForm>
</Form>`}
      >
        <Form class="zen-w-full zen-max-w-md">
          <MForm2
            class="zen-space-y-4"
            onSubmit={(values) => alert(`Submitted: ${values.email}`)}
          >
            <FormField of={form2} Field={Field2} name="email">
              {(_field, fieldProps) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@algorisys.com" {...fieldProps} />
                  </FormControl>
                  <FormDescription>We'll never share it.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            </FormField>
            <div class="zen-mt-3">
              <Button type="submit">Save</Button>
            </div>
          </MForm2>
        </Form>
      </DemoSection>
    </DemoPage>
  );
};

export default NewFormDemo;
