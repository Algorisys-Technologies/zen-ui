import { createSignal, Show } from "solid-js";
import { createForm } from "@modular-forms/solid";
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
import { DemoPage, DemoSection } from "./demo-helpers";

/**
 * This route used to render the whole Form demo inside itself, so it had no
 * code of its own and put a second <h1> and a nested demo page on the screen.
 * It now shows the adapters directly — the thing the route is named after.
 */
const NewBoundFieldsDemo = () => {
  // `any` for the same reason NewFormDemo does it: the demo does not carry a
  // generated Values type, and typing the store here would not make the
  // adapters any better checked.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, { Form: MForm, Field }] = createForm<any>();
  const [submitted, setSubmitted] = createSignal<string | null>(null);

  return (
    <DemoPage
      title="BoundFields"
      description={
        <>
          One line per field instead of five. Each <code>Bound*</code> adapter
          renders the label, the control and the error message from a single
          call, reading everything it needs out of the form store.
        </>
      }
    >
      <DemoSection
        title="1. What an adapter replaces"
        codeTitle="Label, control, error — from one line"
        codeDescription="Pass the form store as `of` and modular-forms' Field component as `Field`. The adapter reads field.error itself, so whatever validator you wire into createForm({ validate }) surfaces without any per-field plumbing. That is the whole trade: you give up direct control of the markup and get a form you can read."
        code={`const [form, { Form: MForm, Field }] = createForm<Values>();

<BoundInput of={form} Field={Field} name="email" label="Email" required />

// versus, by hand:
<Field name="email">
  {(field, props) => (
    <div>
      <label for="email">Email</label>
      <Input {...props} id="email" value={field.value} />
      <Show when={field.error}>{(e) => <p role="alert">{e()}</p>}</Show>
    </div>
  )}
</Field>`}
      >
        <MForm onSubmit={(v: unknown) => setSubmitted(JSON.stringify(v, null, 2))}>
          <div class="zen-flex zen-max-w-md zen-flex-col zen-gap-3">
            <BoundInput
              of={form}
              Field={Field}
              name="email"
              label="Email"
              type="email"
              required
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
            <Button type="submit" size="sm">
              Submit
            </Button>
            <Show when={submitted()}>
              <pre class="zen-m-0 zen-overflow-x-auto zen-rounded-zen-sm zen-bg-zen-muted zen-p-3 zen-text-xs">
                {submitted()}
              </pre>
            </Show>
          </div>
        </MForm>
      </DemoSection>

      <DemoSection
        title="2. The full set"
        codeTitle="Seven adapters, one shape"
        codeDescription="Every adapter takes the same three props — of, Field, name — plus whatever its own control needs. BoundSelect takes options, BoundSlider takes min/max, and so on. The uniformity is the point: once you have written one you have written all of them, and a config-driven form can generate them from a schema."
        code={`<BoundInput      of={form} Field={Field} name="name"   label="Name" />
<BoundTextarea   of={form} Field={Field} name="bio"    label="Bio" rows={3} />
<BoundSelect     of={form} Field={Field} name="plan"   label="Plan"
                 options={[{ label: "Free", value: "free" }]} />
<BoundRadioGroup of={form} Field={Field} name="tier"   label="Tier"
                 options={[{ label: "Low", value: "low" }]} />
<BoundCheckbox   of={form} Field={Field} name="agree"  label="I agree" />
<BoundSwitch     of={form} Field={Field} name="notify" label="Notifications" />
<BoundSlider     of={form} Field={Field} name="volume" label="Volume" />`}
      >
        <div class="zen-flex zen-max-w-md zen-flex-col zen-gap-3">
          <BoundSelect
            of={form}
            Field={Field}
            name="plan"
            label="Plan"
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro" },
              { label: "Team", value: "team" },
            ]}
          />
          <BoundRadioGroup
            of={form}
            Field={Field}
            name="priority"
            label="Priority"
            options={[
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
            ]}
          />
          <BoundSlider of={form} Field={Field} name="volume" label="Volume" />
          <BoundSwitch of={form} Field={Field} name="notifications" label="Notifications" />
          <BoundCheckbox of={form} Field={Field} name="agree" label="I accept the terms" />
        </div>
      </DemoSection>

      <DemoSection
        title="3. Why the store is a prop"
        codeTitle="`of` and `Field`, rather than a context"
        codeDescription="modular-forms hands you the store and the Field component from createForm(); the adapters take both explicitly rather than reaching for a context. That keeps two forms on one page from interfering, and means an adapter works anywhere you can pass a value — including inside a table row or a dialog rendered through a portal, where a context provider would have to be threaded through by hand."
        code={`// Two independent forms on one page, no ambiguity about which store:
const [signUp, { Field: SignUpField }] = createForm<SignUpValues>();
const [invite, { Field: InviteField }] = createForm<InviteValues>();

<BoundInput of={signUp} Field={SignUpField} name="email" label="Email" />
<BoundInput of={invite} Field={InviteField} name="email" label="Invitee" />`}
      >
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          The Form demo renders exactly this — two <code>createForm</code> stores
          side by side on one page.
        </p>
      </DemoSection>
    </DemoPage>
  );
};

export default NewBoundFieldsDemo;
