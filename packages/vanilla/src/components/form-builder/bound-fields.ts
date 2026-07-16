import { cn } from "../../lib/cn";
import { Disposer, type Child, type ZenComponent } from "../../lib/component";
import { Input, type InputProps } from "../form/input/input";
import { Textarea, type TextareaProps } from "../form/input/textarea";
import { Checkbox } from "../form/checkbox/checkbox";
import { Switch } from "../form/switch/switch";
import { Select } from "../form/select/select";
import { RadioGroup, RadioGroupItem } from "../form/radio/radio-group";
import { Slider } from "../form/slider/slider";
import type { FormController } from "./form";

/**
 * Bound* fields — the config-driven idiom over the `createForm` controller, the
 * vanilla port of React's `bound-fields.tsx`.
 *
 * Where React's Bound* read the surrounding `<Form>` through
 * `useFormContext()`, here there is no context: each takes the `form` controller
 * explicitly. Otherwise the behaviour matches — read the value, wire the change
 * back, render label + control + helper + inline error in a vertical stack, and
 * stay in sync when the form resets.
 *
 *   const form = createForm<Values>({ schema, defaultValues });
 *   BoundInput({ form, name: "email", label: "Email", required: true });
 *   BoundSelect({ form, name: "plan", label: "Plan", options: planOptions });
 *   BoundCheckbox({ form, name: "agree", label: "I agree to the terms" });
 *
 * For full control (custom layout, several controls per field) use the compound
 * `FormField` primitive instead. Bound* is the ergonomic default.
 */

export interface BoundSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/* ----------------------------- shared frame -------------------------- */

interface FrameConfig {
  id: string;
  label?: Child;
  description?: Child;
  required?: boolean;
  class?: string;
}

/**
 * The vertical label / control / helper stack shared by the non-toggle fields,
 * matching React's `BoundFieldFrame`. Returns the wrapper plus a `paint` that
 * swaps helper text for the inline error and recolours the label.
 */
function frame(
  cfg: FrameConfig,
  controlEl: Element,
): { el: HTMLDivElement; paint: (error: string | undefined) => void } {
  const el = document.createElement("div");
  el.className = cn("zen-flex zen-flex-col zen-gap-1.5", cfg.class);

  let labelEl: HTMLLabelElement | null = null;
  if (cfg.label != null) {
    labelEl = document.createElement("label");
    labelEl.setAttribute("for", cfg.id);
    const span = document.createElement("span");
    span.append(...toChildNodes(cfg.label));
    labelEl.append(span);
    if (cfg.required) {
      const star = document.createElement("span");
      star.setAttribute("aria-hidden", "true");
      star.className = "zen-ml-0.5 zen-text-zen-error";
      star.textContent = "*";
      labelEl.append(star);
    }
    el.append(labelEl);
  }

  el.append(controlEl);

  const foot = document.createElement("p");
  foot.id = `${cfg.id}-msg`;
  el.append(foot);

  const paint = (error: string | undefined) => {
    if (labelEl) {
      labelEl.className = cn(
        "zen-text-sm zen-font-medium zen-leading-none",
        error ? "zen-text-zen-error" : "zen-text-zen-foreground",
      );
    }
    if (error) {
      foot.className = "zen-text-xs zen-font-medium zen-text-zen-error";
      foot.setAttribute("role", "alert");
      foot.textContent = error;
      foot.hidden = false;
    } else if (cfg.description != null) {
      foot.className = "zen-text-xs zen-text-zen-muted-fg";
      foot.removeAttribute("role");
      foot.replaceChildren(...toChildNodes(cfg.description));
      foot.hidden = false;
    } else {
      foot.textContent = "";
      foot.hidden = true;
    }
  };

  return { el, paint };
}

const toChildNodes = (c: Child): Node[] => {
  if (c == null || c === false) return [];
  if (typeof c === "string" || typeof c === "number") return [document.createTextNode(String(c))];
  if (c instanceof Node) return [c];
  return [];
};

let uid = 0;
const fieldId = (name: string) => `${name}-${++uid}`;

/** Wire a control's a11y attributes to the frame's helper/error message. */
function describe(controlEl: Element, id: string, hasHelper: boolean, error: string | undefined) {
  if (error) controlEl.setAttribute("aria-invalid", "true");
  else controlEl.removeAttribute("aria-invalid");
  if (hasHelper || error) controlEl.setAttribute("aria-describedby", `${id}-msg`);
  else controlEl.removeAttribute("aria-describedby");
}

/* ----------------------------- BoundInput ---------------------------- */

export interface BoundInputProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<InputProps, "name" | "id" | "value" | "onInput" | "onBlur"> {
  form: FormController<T>;
  name: keyof T & string;
  label?: Child;
  description?: Child;
  required?: boolean;
  fieldClass?: string;
}

export function BoundInput<T extends Record<string, unknown>>(
  props: BoundInputProps<T>,
): ZenComponent<never> {
  const { form, name, label, description, required, fieldClass, class: className, ...rest } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const control = Input({
    id,
    class: className,
    value: (form.getValue(name) as string | undefined) ?? "",
    onInput: (e) => form.setValue(name, (e.target as HTMLInputElement).value as T[typeof name]),
    onBlur: () => form.blur(name),
    ...rest,
  });
  disposer.add(() => control.destroy());

  const { el, paint } = frame({ id, label, description, required, class: fieldClass }, control.el);

  const sync = () => {
    const error = form.getError(name);
    describe(control.el, id, description != null, error);
    paint(error);
    const v = (form.getValue(name) as string | undefined) ?? "";
    if (control.el.value !== v) control.update({ value: v });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}

/* ----------------------------- BoundTextarea ------------------------- */

export interface BoundTextareaProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<TextareaProps, "name" | "id" | "value" | "onInput" | "onBlur"> {
  form: FormController<T>;
  name: keyof T & string;
  label?: Child;
  description?: Child;
  required?: boolean;
  fieldClass?: string;
}

export function BoundTextarea<T extends Record<string, unknown>>(
  props: BoundTextareaProps<T>,
): ZenComponent<never> {
  const { form, name, label, description, required, fieldClass, class: className, ...rest } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const control = Textarea({
    id,
    class: className,
    value: (form.getValue(name) as string | undefined) ?? "",
    onInput: (e) => form.setValue(name, (e.target as HTMLTextAreaElement).value as T[typeof name]),
    onBlur: () => form.blur(name),
    ...rest,
  });
  disposer.add(() => control.destroy());

  const { el, paint } = frame({ id, label, description, required, class: fieldClass }, control.el);

  const sync = () => {
    const error = form.getError(name);
    describe(control.el, id, description != null, error);
    paint(error);
    const v = (form.getValue(name) as string | undefined) ?? "";
    if (control.el.value !== v) control.update({ value: v });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}

/* ----------------------------- BoundSelect --------------------------- */

export interface BoundSelectProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form: FormController<T>;
  name: keyof T & string;
  options: BoundSelectOption[];
  label?: Child;
  description?: Child;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  fieldClass?: string;
}

export function BoundSelect<T extends Record<string, unknown>>(
  props: BoundSelectProps<T>,
): ZenComponent<never> {
  const { form, name, options, label, description, required, placeholder, disabled, fieldClass } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const control = Select({
    id,
    options,
    placeholder,
    disabled,
    value: (form.getValue(name) as string | undefined) ?? "",
    onValueChange: (v) => form.setValue(name, v as T[typeof name]),
  });
  disposer.add(() => control.destroy());

  const { el, paint } = frame({ id, label, description, required, class: fieldClass }, control.el);

  const sync = () => {
    const error = form.getError(name);
    describe(control.el, id, description != null, error);
    paint(error);
    control.update({ value: (form.getValue(name) as string | undefined) ?? "" });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}

/* ----------------------------- BoundRadioGroup ----------------------- */

export interface BoundRadioGroupProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form: FormController<T>;
  name: keyof T & string;
  options: BoundSelectOption[];
  label?: Child;
  description?: Child;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  fieldClass?: string;
}

export function BoundRadioGroup<T extends Record<string, unknown>>(
  props: BoundRadioGroupProps<T>,
): ZenComponent<never> {
  const { form, name, options, label, description, required, orientation = "vertical", disabled, fieldClass } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const optionRows: Child[] = options.map((opt) => {
    const optId = `${id}-${opt.value}`;
    const lab = document.createElement("label");
    lab.setAttribute("for", optId);
    lab.className = "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm";
    const item = RadioGroupItem({ id: optId, value: opt.value, disabled: opt.disabled });
    disposer.add(() => item.destroy());
    const span = document.createElement("span");
    span.textContent = opt.label;
    lab.append(item.el, span);
    return lab;
  });

  const control = RadioGroup({
    value: (form.getValue(name) as string | undefined) ?? "",
    onValueChange: (v) => form.setValue(name, v as T[typeof name]),
    disabled,
    orientation,
    style:
      orientation === "horizontal"
        ? { display: "flex", flexDirection: "row", gap: "var(--zen-space-3)" }
        : undefined,
    children: optionRows,
  });
  disposer.add(() => control.destroy());

  const { el, paint } = frame({ id, label, description, required, class: fieldClass }, control.el);

  const sync = () => {
    const error = form.getError(name);
    describe(control.el, id, description != null, error);
    paint(error);
    control.update({ value: (form.getValue(name) as string | undefined) ?? "" });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}

/* ----------------------------- BoundSlider --------------------------- */

export interface BoundSliderProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form: FormController<T>;
  name: keyof T & string;
  label?: Child;
  description?: Child;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  fieldClass?: string;
}

export function BoundSlider<T extends Record<string, unknown>>(
  props: BoundSliderProps<T>,
): ZenComponent<never> {
  const { form, name, label, description, min = 0, max = 100, step = 1, disabled, fieldClass } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const asArray = (v: unknown): number[] =>
    Array.isArray(v) ? (v as number[]) : [Number(v ?? min)];

  const control = Slider({
    id,
    value: asArray(form.getValue(name)),
    onValueChange: (v) => form.setValue(name, v as T[typeof name]),
    min,
    max,
    step,
    disabled,
  });
  disposer.add(() => control.destroy());

  const { el, paint } = frame({ id, label, description, class: fieldClass }, control.el);

  const sync = () => {
    const error = form.getError(name);
    describe(control.el, id, description != null, error);
    paint(error);
    control.update({ value: asArray(form.getValue(name)) });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}

/* ----------------------------- BoundCheckbox ------------------------- */

export interface BoundCheckboxProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form: FormController<T>;
  name: keyof T & string;
  label?: Child;
  description?: Child;
  disabled?: boolean;
  fieldClass?: string;
}

export function BoundCheckbox<T extends Record<string, unknown>>(
  props: BoundCheckboxProps<T>,
): ZenComponent<never> {
  const { form, name, label, description, disabled, fieldClass } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const el = document.createElement("div");
  el.className = cn("zen-flex zen-flex-col zen-gap-1.5", fieldClass);

  const control = Checkbox({
    id,
    checked: Boolean(form.getValue(name)),
    onCheckedChange: (v) => form.setValue(name, (v === true) as T[typeof name]),
    disabled,
  });
  disposer.add(() => control.destroy());

  const lab = document.createElement("label");
  lab.setAttribute("for", id);
  lab.className = "zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm";
  const span = document.createElement("span");
  span.append(...toChildNodes(label ?? null));
  lab.append(control.el, span);
  el.append(lab);

  const foot = document.createElement("p");
  el.append(foot);

  const paint = (error: string | undefined) => {
    if (error) {
      foot.className = "zen-text-xs zen-font-medium zen-text-zen-error zen-pl-6";
      foot.setAttribute("role", "alert");
      foot.textContent = error;
      foot.hidden = false;
    } else if (description != null) {
      foot.className = "zen-text-xs zen-text-zen-muted-fg zen-pl-6";
      foot.removeAttribute("role");
      foot.replaceChildren(...toChildNodes(description));
      foot.hidden = false;
    } else {
      foot.textContent = "";
      foot.hidden = true;
    }
  };

  const sync = () => {
    const error = form.getError(name);
    if (error) control.el.setAttribute("aria-invalid", "true");
    else control.el.removeAttribute("aria-invalid");
    paint(error);
    control.update({ checked: Boolean(form.getValue(name)) });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}

/* ----------------------------- BoundSwitch --------------------------- */

export interface BoundSwitchProps<T extends Record<string, unknown> = Record<string, unknown>> {
  form: FormController<T>;
  name: keyof T & string;
  label?: Child;
  description?: Child;
  disabled?: boolean;
  fieldClass?: string;
}

export function BoundSwitch<T extends Record<string, unknown>>(
  props: BoundSwitchProps<T>,
): ZenComponent<never> {
  const { form, name, label, description, disabled, fieldClass } = props;
  const id = fieldId(name);
  const disposer = new Disposer();

  const el = document.createElement("div");
  el.className = cn("zen-flex zen-items-center zen-justify-between zen-gap-3", fieldClass);

  const textCol = document.createElement("div");
  let labelEl: HTMLLabelElement | null = null;
  if (label != null) {
    labelEl = document.createElement("label");
    labelEl.setAttribute("for", id);
    labelEl.className = "zen-text-sm zen-font-medium zen-cursor-pointer";
    labelEl.append(...toChildNodes(label));
    textCol.append(labelEl);
  }
  let descEl: HTMLParagraphElement | null = null;
  if (description != null) {
    descEl = document.createElement("p");
    descEl.className = "zen-text-xs zen-text-zen-muted-fg";
    descEl.append(...toChildNodes(description));
    textCol.append(descEl);
  }
  const errEl = document.createElement("p");
  errEl.className = "zen-text-xs zen-font-medium zen-text-zen-error";
  errEl.setAttribute("role", "alert");
  errEl.hidden = true;
  textCol.append(errEl);

  const control = Switch({
    id,
    checked: Boolean(form.getValue(name)),
    onCheckedChange: (v) => form.setValue(name, v as T[typeof name]),
    disabled,
  });
  disposer.add(() => control.destroy());

  el.append(textCol, control.el);

  const sync = () => {
    const error = form.getError(name);
    if (error) {
      control.el.setAttribute("aria-invalid", "true");
      errEl.textContent = error;
      errEl.hidden = false;
    } else {
      control.el.removeAttribute("aria-invalid");
      errEl.textContent = "";
      errEl.hidden = true;
    }
    control.update({ checked: Boolean(form.getValue(name)) });
  };
  sync();
  disposer.add(form.subscribe(sync));

  return { el, update() {}, destroy() { disposer.dispose(); el.remove(); } };
}
