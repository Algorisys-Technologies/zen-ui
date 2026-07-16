import { z } from "zod";

import { createForm, FormField, type FormSchema } from "./form-builder/form";
import { Input } from "./form/input/input";
import { Textarea } from "./form/input/textarea";
import { Checkbox } from "./form/checkbox/checkbox";
import { Switch } from "./form/switch/switch";
import { Select } from "./form/select/select";
import { RadioGroup, RadioGroupItem } from "./form/radio/radio-group";
import { Slider } from "./form/slider/slider";
import { Button } from "./button/button";
import { DemoPage } from "./demo-helpers";

/**
 * FormDemo — mirrors React's NewFormDemo: one form composing every input, with
 * Zod validation, an onTouched mode, submit and reset. The controller here is
 * `createForm` (this binding's `useForm`); the resolver is any zod schema,
 * passed straight through with no adapter.
 */

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  plan: z.enum(["free", "pro", "team"]),
  priority: z.enum(["low", "medium", "high"]),
  bio: z.string().max(120, "Keep it under 120 characters").optional(),
  newsletter: z.boolean(),
  notifications: z.boolean(),
  volume: z.tuple([z.number().min(0).max(100)]),
  agree: z.boolean().refine((v) => v === true, { message: "You must accept the terms" }),
});

type Values = z.infer<typeof schema>;

const DEFAULTS: Values = {
  email: "",
  fullName: "",
  plan: "free",
  priority: "medium",
  bio: "",
  newsletter: false,
  notifications: true,
  volume: [50],
  agree: false,
};

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "team", label: "Team" },
];
const PRIORITIES: Array<Values["priority"]> = ["low", "medium", "high"];

function buildForm(): HTMLElement {
  const form = createForm<Values>({
    schema: schema as unknown as FormSchema<Values>,
    validate: undefined,
    defaultValues: { ...DEFAULTS },
    mode: "onTouched",
  });

  const el = document.createElement("form");
  Object.assign(el.style, { display: "grid", gap: "1rem", width: "100%", maxWidth: "520px" });

  // Email
  el.append(
    FormField({
      form,
      name: "email",
      label: "Email",
      description: "We'll never share it.",
      control: (field) => {
        const input = Input({
          type: "email",
          placeholder: "you@algorisys.com",
          value: (field.value as string) ?? "",
          onInput: (e) => field.onChange((e.target as HTMLInputElement).value),
          onBlur: field.onBlur,
        });
        field.onExternalChange((v) => input.update({ value: (v as string) ?? "" }));
        return input;
      },
    }).el,
  );

  // Full name
  el.append(
    FormField({
      form,
      name: "fullName",
      label: "Full name",
      control: (field) => {
        const input = Input({
          placeholder: "Jane Doe",
          value: (field.value as string) ?? "",
          onInput: (e) => field.onChange((e.target as HTMLInputElement).value),
          onBlur: field.onBlur,
        });
        field.onExternalChange((v) => input.update({ value: (v as string) ?? "" }));
        return input;
      },
    }).el,
  );

  // Plan (Select)
  el.append(
    FormField({
      form,
      name: "plan",
      label: "Plan",
      control: (field) => {
        const select = Select({
          options: PLAN_OPTIONS,
          value: field.value as string,
          onValueChange: (v) => field.onChange(v),
        });
        field.onExternalChange((v) => select.update({ value: v as string }));
        return select;
      },
    }).el,
  );

  // Priority (RadioGroup, horizontal)
  el.append(
    FormField({
      form,
      name: "priority",
      label: "Priority",
      control: (field) => {
        const group = RadioGroup({
          value: field.value as string,
          onValueChange: (v) => field.onChange(v),
          style: { display: "flex", flexDirection: "row", gap: "0.75rem" },
          children: PRIORITIES.map((v) => {
            const lab = document.createElement("label");
            lab.className = "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm";
            const span = document.createElement("span");
            span.className = "zen-capitalize";
            span.textContent = v;
            lab.append(RadioGroupItem({ value: v }).el, span);
            return lab;
          }),
        });
        field.onExternalChange((v) => group.update({ value: v as string }));
        return group;
      },
    }).el,
  );

  // Volume (Slider)
  el.append(
    FormField({
      form,
      name: "volume",
      label: "Notification volume",
      description: "0 – 100",
      control: (field) => {
        const slider = Slider({
          value: field.value as number[],
          onValueChange: (v) => field.onChange(v),
          min: 0,
          max: 100,
          step: 1,
        });
        field.onExternalChange((v) => slider.update({ value: v as number[] }));
        return slider;
      },
    }).el,
  );

  // Bio (Textarea)
  el.append(
    FormField({
      form,
      name: "bio",
      label: "Bio",
      description: "Up to 120 characters",
      control: (field) => {
        const area = Textarea({
          rows: 3,
          maxLength: 120,
          value: (field.value as string) ?? "",
          onInput: (e) => field.onChange((e.target as HTMLTextAreaElement).value),
          onBlur: field.onBlur,
        });
        field.onExternalChange((v) => area.update({ value: (v as string) ?? "" }));
        return area;
      },
    }).el,
  );

  // Notifications (Switch, inline row wired straight to the controller)
  el.append(switchRow(form, "notifications", "Email notifications", "Send a summary every Monday morning."));

  // Newsletter (Checkbox)
  el.append(checkboxRow(form, "newsletter", "Subscribe to the Algorisys newsletter", false));

  // Agree (Checkbox with error)
  el.append(checkboxRow(form, "agree", "I agree to the terms of service", true));

  // Actions
  const actions = document.createElement("div");
  Object.assign(actions.style, { display: "flex", gap: "0.5rem", marginTop: "0.25rem" });
  const submit = Button({ type: "submit", children: "Submit" });
  const reset = Button({ type: "button", variant: "outline", color: "neutral", children: "Reset" });
  actions.append(submit.el, reset.el);
  el.append(actions);

  // Submitted-values readout — the vanilla demo shows it inline rather than alert().
  const result = document.createElement("pre");
  result.className = "zen-text-xs";
  Object.assign(result.style, {
    margin: "0",
    padding: "0.75rem",
    borderRadius: "var(--zen-radius-md)",
    background: "var(--zen-color-muted)",
    color: "var(--zen-color-foreground)",
    whiteSpace: "pre-wrap",
    display: "none",
  });

  el.addEventListener(
    "submit",
    form.handleSubmit((values) => {
      result.style.display = "block";
      result.textContent = JSON.stringify(values, null, 2);
    }),
  );
  reset.el.addEventListener("click", () => {
    form.reset();
    result.style.display = "none";
    result.textContent = "";
  });

  const wrap = document.createElement("div");
  Object.assign(wrap.style, { display: "grid", gap: "1rem", width: "100%", maxWidth: "520px" });
  wrap.append(el, result);
  return wrap;
}

/** A switch on the right, label + description on the left, wired to the form. */
function switchRow(
  form: ReturnType<typeof createForm<Values>>,
  name: "notifications",
  label: string,
  description: string,
): HTMLElement {
  const row = document.createElement("div");
  row.className = "zen-flex zen-items-center zen-justify-between zen-gap-3";
  const text = document.createElement("div");
  const lab = document.createElement("div");
  lab.className = "zen-text-sm zen-font-medium";
  lab.textContent = label;
  const desc = document.createElement("p");
  desc.className = "zen-text-xs zen-text-zen-muted-fg";
  desc.textContent = description;
  text.append(lab, desc);

  const control = Switch({
    checked: Boolean(form.getValue(name)),
    onCheckedChange: (v) => form.setValue(name, v),
  });
  form.subscribe(() => control.update({ checked: Boolean(form.getValue(name)) }));
  row.append(text, control.el);
  return row;
}

/** A checkbox followed by its label, wired to the form, with an inline error. */
function checkboxRow(
  form: ReturnType<typeof createForm<Values>>,
  name: "newsletter" | "agree",
  label: string,
  showError: boolean,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "zen-space-y-1.5";

  const rowLabel = document.createElement("label");
  rowLabel.className = "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm";
  const control = Checkbox({
    checked: Boolean(form.getValue(name)),
    onCheckedChange: (v) => form.setValue(name, v === true),
  });
  const span = document.createElement("span");
  span.textContent = label;
  rowLabel.append(control.el, span);
  wrap.append(rowLabel);

  const err = document.createElement("p");
  err.className = "zen-text-xs zen-font-medium zen-text-zen-error";
  err.setAttribute("role", "alert");
  err.hidden = true;
  if (showError) wrap.append(err);

  form.subscribe(() => {
    control.update({ checked: Boolean(form.getValue(name)) });
    if (showError) {
      const e = form.getError(name);
      err.textContent = e ?? "";
      err.hidden = !e;
    }
  });
  return wrap;
}

export default function FormDemo(): HTMLElement {
  return DemoPage({
    title: "Form (RHF + Zod)",
    description:
      "The shadcn / react-hook-form pattern with no framework and no form library. createForm() is this binding's useForm: it tracks values / errors / touched and validates on the configured trigger. A zod schema is passed straight through — typed structurally as { safeParse }, so the library takes no dependency on zod — and its parsed output is what a valid submit receives.",
    sections: [
      {
        title: "1. Composing every primitive",
        codeTitle: "One form, every input, Zod validation, onTouched",
        codeDescription:
          "Blur a field to see its error; fix it and the message clears as you type. Submit with invalid values to light up every field. A valid submit shows the parsed values. Reset restores the defaults.",
        code: `const schema = z.object({
  email: z.string().email("Enter a valid email"),
  plan: z.enum(["free", "pro", "team"]),
  volume: z.tuple([z.number().min(0).max(100)]),
  agree: z.boolean().refine((v) => v === true, { message: "You must accept the terms" }),
  // …
});

const form = createForm<Values>({
  schema,                 // any zod schema — passed through, no adapter
  defaultValues: { email: "", plan: "free", volume: [50], agree: false /* … */ },
  mode: "onTouched",
});

// A field wires its control to the binding it is handed.
const email = FormField({
  form,
  name: "email",
  label: "Email",
  description: "We'll never share it.",
  control: (field) => {
    const input = Input({
      type: "email",
      value: field.value ?? "",
      onInput: (e) => field.onChange(e.target.value),
      onBlur: field.onBlur,
    });
    field.onExternalChange((v) => input.update({ value: v ?? "" }));
    return input;
  },
});
formEl.append(email.el /*, …every other field */);

// handleSubmit validates everything and only fires on a clean form.
formEl.addEventListener(
  "submit",
  form.handleSubmit((values) => save(values)),
);`,
        render: () => buildForm(),
      },
      {
        title: "2. Notes",
        codeTitle: "What createForm + FormField give you",
        code: `createForm() + FormField →

- createForm()   is useForm: values / errors / touched, validation
                 on the configured trigger, subscribe() for changes.
- schema         is any { safeParse } object (a zod schema drops in
                 with no adapter and no runtime dependency). Its
                 parsed output is what a valid handleSubmit receives.
- validate       is the escape hatch for logic a schema can't express;
                 its messages win over the schema's.
- FormField      wires id / aria-describedby / aria-invalid onto the
                 control (React's FormControl Slot, without a Slot),
                 recolours the label, and renders the error message —
                 hidden until there is one.
- onExternalChange keeps a control in sync when the form resets, with
                 no render loop.

Swap the schema for valibot, a hand-rolled { safeParse }, or a plain
validate(values) function any time — createForm doesn't care.`,
        render: () => {
          const p = document.createElement("p");
          p.style.margin = "0";
          p.style.fontSize = "0.8125rem";
          p.style.color = "var(--zen-color-muted-fg)";
          p.textContent = "See the code snippet for the rundown.";
          return p;
        },
      },
    ],
  });
}
