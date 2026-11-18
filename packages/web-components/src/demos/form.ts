import { z } from "zod";
import { createForm, type FormSchema } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * Form demo — the web-components port. It mirrors the vanilla FormDemo, but where
 * that file wires each control through the compound FormField, this uses the
 * ergonomic Bound* elements: <zen-bound-input>, <zen-bound-select>, … Each binds
 * to one `createForm` controller — set as the `form` JS property (a live object
 * shared across every field, so it can never be an attribute) — and names its
 * field through the `name` attribute. The controller does the wiring, validation
 * and error rendering; this file just lays the fields out and drives submit/reset.
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
const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

type FormController = ReturnType<typeof createForm<Values>>;

/** Create one Bound* element: set its form, name, and the Child/data props. */
function boundField(
  tag: string,
  form: FormController,
  name: string,
  opts: {
    label?: string;
    description?: string;
    options?: Array<{ value: string; label: string }>;
    attrs?: Record<string, string>;
  } = {},
): HTMLElement {
  const el = document.createElement(tag);
  el.setAttribute("name", name);
  for (const [k, v] of Object.entries(opts.attrs ?? {})) el.setAttribute(k, v);
  const p = el as unknown as Record<string, unknown>;
  if (opts.label != null) p.label = opts.label;
  if (opts.description != null) p.description = opts.description;
  if (opts.options) p.options = opts.options;
  p.form = form;
  return el;
}

function buildForm(): HTMLElement {
  const form = createForm<Values>({
    schema: schema as unknown as FormSchema<Values>,
    defaultValues: { ...DEFAULTS },
    mode: "onTouched",
  });

  const el = document.createElement("form");
  Object.assign(el.style, { display: "grid", gap: "1rem", width: "100%", maxWidth: "520px" });

  el.append(
    boundField("zen-bound-input", form, "email", {
      label: "Email",
      description: "We'll never share it.",
      attrs: { type: "email", placeholder: "you@algorisys.com" },
    }),
    boundField("zen-bound-input", form, "fullName", {
      label: "Full name",
      attrs: { placeholder: "Jane Doe" },
    }),
    boundField("zen-bound-select", form, "plan", { label: "Plan", options: PLAN_OPTIONS }),
    boundField("zen-bound-radio-group", form, "priority", {
      label: "Priority",
      options: PRIORITY_OPTIONS,
      attrs: { orientation: "horizontal" },
    }),
    boundField("zen-bound-slider", form, "volume", {
      label: "Notification volume",
      description: "0 – 100",
      attrs: { min: "0", max: "100", step: "1" },
    }),
    boundField("zen-bound-textarea", form, "bio", {
      label: "Bio",
      description: "Up to 120 characters",
      attrs: { rows: "3" },
    }),
    boundField("zen-bound-switch", form, "notifications", {
      label: "Email notifications",
      description: "Send a summary every Monday morning.",
    }),
    boundField("zen-bound-checkbox", form, "newsletter", {
      label: "Subscribe to the Algorisys newsletter",
    }),
    boundField("zen-bound-checkbox", form, "agree", {
      label: "I agree to the terms of service",
    }),
  );

  // Actions
  const actions = document.createElement("div");
  Object.assign(actions.style, { display: "flex", gap: "0.5rem", marginTop: "0.25rem" });
  const submit = document.createElement("zen-button");
  submit.setAttribute("type", "submit");
  submit.textContent = "Submit";
  const reset = document.createElement("zen-button");
  reset.setAttribute("type", "button");
  reset.setAttribute("variant", "outline");
  reset.setAttribute("color", "neutral");
  reset.textContent = "Reset";
  actions.append(submit, reset);
  el.append(actions);

  // Submitted-values readout — shown inline rather than alert().
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
  reset.addEventListener("click", () => {
    form.reset();
    result.style.display = "none";
    result.textContent = "";
  });

  const wrap = document.createElement("div");
  Object.assign(wrap.style, { display: "grid", gap: "1rem", width: "100%", maxWidth: "520px" });
  wrap.append(el, result);
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
        code: `const form = createForm({
  schema,                 // any zod schema — passed through, no adapter
  defaultValues: { email: "", plan: "free", volume: [50], agree: false /* … */ },
  mode: "onTouched",
});

// Each Bound* element binds to the controller. Set it as the \`form\` property:
const email = document.createElement("zen-bound-input");
email.setAttribute("name", "email");
email.label = "Email";
email.description = "We'll never share it.";
email.form = form;
formEl.append(email /*, …every other field */);

// handleSubmit validates everything and only fires on a clean form.
formEl.addEventListener("submit", form.handleSubmit((values) => save(values)));`,
        render: () => buildForm(),
      },
      {
        title: "2. Notes",
        codeTitle: "What createForm + Bound* give you",
        code: `createForm() + Bound* →

- createForm()   is useForm: values / errors / touched, validation
                 on the configured trigger, subscribe() for changes.
- schema         is any { safeParse } object (a zod schema drops in
                 with no adapter and no runtime dependency). Its
                 parsed output is what a valid handleSubmit receives.
- validate       is the escape hatch for logic a schema can't express;
                 its messages win over the schema's.
- Bound*         wire id / aria-describedby / aria-invalid onto the
                 control, recolour the label, and render the error
                 message — hidden until there is one — all from the
                 controller, no per-field glue.
- form property  the controller is a live object, so every field is set
                 el.form = form (never an attribute) and stays in sync
                 through the form's subscribe(), including on reset().

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
