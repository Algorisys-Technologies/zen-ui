import { cn } from "../../lib/cn";
import {
  applyProps,
  Disposer,
  toNodes,
  type AnyZenComponent,
  type BaseProps,
  type Child,
  type ZenComponent,
} from "../../lib/component";

/**
 * Form — the shadcn/react-hook-form pattern, ported to a binding with no
 * framework and no form library.
 *
 * ## What React leaned on, and what this writes out
 *
 * React's Form is `FormProvider` from react-hook-form: a Context carrying a
 * `useForm()` store, with `<FormField>` (a Radix-context wrapper around RHF's
 * `<Controller>`) reading a resolver's validation on every render. Zod plugs in
 * through `@hookform/resolvers`. None of that exists here — there is no render
 * loop to re-run, no context to read, and adding react-hook-form or zod as a
 * runtime dependency is forbidden (PORTING.md).
 *
 * So the store is written out as `createForm()`: a tiny controller that tracks
 * values / errors / touched, validates on the configured trigger, and reports
 * changes through `subscribe()`. It is the vanilla equivalent of `useForm()`.
 *
 *   const form = createForm<Values>({
 *     schema,                       // any zod schema, or any { safeParse } object
 *     defaultValues: { email: "" },
 *     mode: "onTouched",
 *   });
 *
 *   const email = FormField({
 *     form,
 *     name: "email",
 *     label: "Email",
 *     description: "We'll never share it.",
 *     control: (field) =>
 *       Input({
 *         type: "email",
 *         value: (field.value as string) ?? "",
 *         onInput: (e) => field.onChange((e.target as HTMLInputElement).value),
 *         onBlur: field.onBlur,
 *       }),
 *   });
 *
 *   formEl.addEventListener(
 *     "submit",
 *     form.handleSubmit((values) => save(values)),
 *   );
 *
 * ## Validation is resolver-agnostic
 *
 * `schema` is typed structurally as `{ safeParse }`, not as a zod import, so a
 * zod schema drops in with no adapter and no dependency — and so does anything
 * else that exposes the same shape. A plain `validate(values) => errors`
 * function is the other door, for logic a schema cannot express. Both may be
 * supplied; the custom validator's messages win.
 *
 * ## The FormControl "slot", without Slot
 *
 * React's `<FormControl>` is a Radix `Slot` that injects `id` /
 * `aria-describedby` / `aria-invalid` onto whichever input the caller nests.
 * With no render there is nothing to defer onto: `FormField` builds the control
 * itself (via the `control` callback) and wires those three attributes onto its
 * element directly, so label / description / message associate with the right
 * node for a screen reader exactly as they do in React.
 */

/* --------------------------------------------------------------------- */
/*  Controller                                                           */
/* --------------------------------------------------------------------- */

/**
 * When errors are computed and shown.
 *  - `onSubmit`  — only when the form is submitted (the default).
 *  - `onBlur`    — when a field is blurred, and on submit.
 *  - `onTouched` — first on blur, then on every change once the field is touched.
 *  - `onChange`  — on every change.
 * After the first submit, every mode re-validates on change (RHF's default
 * `reValidateMode`), so a corrected field clears its error as the user types.
 */
export type ValidationMode = "onSubmit" | "onBlur" | "onTouched" | "onChange";

/** One message per field, keyed by field name. */
export type FormErrors<T> = Partial<Record<keyof T & string, string>>;

/** A hand-written validator: values in, a message per invalid field out. */
export type Validator<T> = (values: T) => FormErrors<T>;

/**
 * The structural shape of a zod schema's `safeParse`. Declared here rather than
 * imported so the library takes no dependency on zod — any object with this
 * method (zod, valibot's wrapper, a hand-rolled one) works.
 */
export interface FormSchema<T> {
  safeParse(data: unknown):
    | { readonly success: true; readonly data: T }
    | {
        readonly success: false;
        readonly error: {
          readonly issues: ReadonlyArray<{
            readonly path: ReadonlyArray<PropertyKey>;
            readonly message: string;
          }>;
        };
      };
}

export interface FormOptions<T extends Record<string, unknown>> {
  /** The initial values. Every field the form owns must have an entry. */
  defaultValues: T;
  /** A zod (or zod-shaped) schema. Its parsed output is what `handleSubmit` receives. */
  schema?: FormSchema<T>;
  /** A custom validator, merged over the schema's errors (custom wins). */
  validate?: Validator<T>;
  /** When validation runs and errors surface. Defaults to `"onSubmit"`. */
  mode?: ValidationMode;
}

export interface FieldState {
  /** The message for this field, or `undefined` when valid / not yet shown. */
  error: string | undefined;
  /** True when the field has an error currently shown. */
  invalid: boolean;
  /** True once the field has been blurred. */
  touched: boolean;
}

export interface FormController<T extends Record<string, unknown>> {
  /** All current values. With a schema, `handleSubmit` hands the parsed shape instead. */
  getValues(): T;
  getValue<K extends keyof T>(name: K): T[K];
  /** Write a value. Fires validation per the mode, and notifies subscribers. */
  setValue<K extends keyof T>(name: K, value: T[K]): void;
  /** The currently shown error for a field, if any. */
  getError(name: keyof T & string): string | undefined;
  getFieldState(name: keyof T & string): FieldState;
  /** Mark a field blurred; validates per the mode. Fields call this on blur. */
  blur(name: keyof T & string): void;
  /**
   * Wrap a submit handler. Returns a listener that validates everything, shows
   * every error, and — only when the form is valid — calls `onValid` with the
   * parsed values (the schema's output when a schema is set, else the raw values).
   */
  handleSubmit(
    onValid: (values: T) => void,
    onInvalid?: (errors: FormErrors<T>) => void,
  ): (e?: Event) => void;
  /** Restore values (to `next`, or the original defaults) and clear all errors / touched. */
  reset(next?: Partial<T>): void;
  /** Validate now, show every error, and return whether the form is valid. */
  validate(): boolean;
  /** Run `fn` on any change to values, errors or touched. Returns an unsubscribe. */
  subscribe(fn: () => void): () => void;
  /** True once `handleSubmit` has run at least once. */
  readonly isSubmitted: boolean;
}

export function createForm<T extends Record<string, unknown>>(
  options: FormOptions<T>,
): FormController<T> {
  const mode: ValidationMode = options.mode ?? "onSubmit";
  const initial = { ...options.defaultValues };
  let values: T = { ...options.defaultValues };
  let allErrors: FormErrors<T> = {};
  const touched = new Set<string>();
  const shown = new Set<string>();
  let submitted = false;
  const subs = new Set<() => void>();
  const emit = () => {
    for (const fn of subs) fn();
  };

  const names = () => Object.keys(values) as Array<keyof T & string>;

  /** Run schema + custom validator over `vals`; return messages and parsed output. */
  const run = (vals: T): { errors: FormErrors<T>; parsed: T } => {
    const errors: FormErrors<T> = {};
    let parsed: T = vals;
    if (options.schema) {
      const result = options.schema.safeParse(vals);
      if (result.success) {
        parsed = result.data;
      } else {
        for (const issue of result.error.issues) {
          const key = String(issue.path[0] ?? "") as keyof T & string;
          // First message per field, like react-hook-form's default.
          if (key && errors[key] === undefined) errors[key] = issue.message;
        }
      }
    }
    if (options.validate) {
      const custom = options.validate(vals);
      for (const k of Object.keys(custom) as Array<keyof T & string>) {
        if (custom[k] !== undefined) errors[k] = custom[k];
      }
    }
    return { errors, parsed };
  };

  const recompute = () => {
    allErrors = run(values).errors;
  };

  const shouldValidateOnChange = (name: string): boolean => {
    if (submitted) return true;
    if (mode === "onChange") return true;
    if (mode === "onTouched") return touched.has(name);
    return false;
  };
  const shouldValidateOnBlur = (): boolean =>
    submitted || mode === "onBlur" || mode === "onTouched";

  return {
    get isSubmitted() {
      return submitted;
    },
    getValues: () => ({ ...values }),
    getValue: (name) => values[name],
    setValue(name, value) {
      values = { ...values, [name]: value };
      const key = String(name);
      if (shouldValidateOnChange(key)) {
        shown.add(key);
        recompute();
      }
      emit();
    },
    getError(name) {
      return shown.has(name) ? allErrors[name] : undefined;
    },
    getFieldState(name) {
      const error = shown.has(name) ? allErrors[name] : undefined;
      return { error, invalid: Boolean(error), touched: touched.has(name) };
    },
    blur(name) {
      touched.add(name);
      if (shouldValidateOnBlur()) {
        shown.add(name);
        recompute();
      }
      emit();
    },
    validate() {
      recompute();
      for (const n of names()) shown.add(n);
      emit();
      return Object.keys(allErrors).length === 0;
    },
    handleSubmit(onValid, onInvalid) {
      return (e) => {
        e?.preventDefault?.();
        submitted = true;
        const { errors, parsed } = run(values);
        allErrors = errors;
        for (const n of names()) shown.add(n);
        emit();
        if (Object.keys(errors).length === 0) onValid(parsed);
        else onInvalid?.(errors);
      };
    },
    reset(next) {
      values = next ? { ...initial, ...next } : { ...initial };
      allErrors = {};
      touched.clear();
      shown.clear();
      submitted = false;
      emit();
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

/* --------------------------------------------------------------------- */
/*  Display primitives                                                   */
/* --------------------------------------------------------------------- */

export type FormItemProps = BaseProps;

/** The vertical field wrapper — `zen-space-y-1.5`, matching React's FormItem. */
export function FormItem(props: FormItemProps = {}): ZenComponent<FormItemProps> {
  let current: FormItemProps = { ...props };
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children, style: _s, ...rest } = current;
    el.className = cn("zen-space-y-1.5", className);
    el.replaceChildren(...toNodes(children as Child));
    removeProps?.();
    removeProps = applyProps(el, { style: current.style, ...rest } as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  return {
    el,
    update(nextProps) {
      current = { ...current, ...nextProps };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface FormLabelProps extends BaseProps {
  /** The id of the control this labels (`<label for>`). */
  for?: string;
  /** Colour the label as an error. */
  error?: boolean;
}

/** A field label — medium, tight-leading, red when `error`. Matches React's FormLabel. */
export function FormLabel(props: FormLabelProps = {}): ZenComponent<FormLabelProps> {
  let current: FormLabelProps = { ...props };
  const el = document.createElement("label");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children, for: htmlFor, error, ...rest } = current;
    el.className = cn(
      "zen-text-sm zen-font-medium zen-leading-none",
      error ? "zen-text-zen-error" : "zen-text-zen-foreground",
      className,
    );
    if (htmlFor !== undefined) el.setAttribute("for", htmlFor);
    else el.removeAttribute("for");
    el.replaceChildren(...toNodes(children as Child));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  return {
    el,
    update(nextProps) {
      current = { ...current, ...nextProps };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export type FormDescriptionProps = BaseProps;

/** Helper text under a control — muted and small. Matches React's FormDescription. */
export function FormDescription(
  props: FormDescriptionProps = {},
): ZenComponent<FormDescriptionProps> {
  let current: FormDescriptionProps = { ...props };
  const el = document.createElement("p");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children, ...rest } = current;
    el.className = cn("zen-text-xs zen-text-zen-muted-fg", className);
    el.replaceChildren(...toNodes(children as Child));
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  return {
    el,
    update(nextProps) {
      current = { ...current, ...nextProps };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

export interface FormMessageProps extends BaseProps {
  /** The error text. When empty and there are no children, the element hides itself. */
  message?: string;
}

/**
 * The inline validation message. Like React's FormMessage it renders nothing
 * (here: hides itself) when there is no error and no fallback child, so an empty
 * message reserves no space.
 */
export function FormMessage(props: FormMessageProps = {}): ZenComponent<FormMessageProps> {
  let current: FormMessageProps = { ...props };
  const el = document.createElement("p");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, children, message, ...rest } = current;
    el.className = cn("zen-text-xs zen-font-medium zen-text-zen-error", className);
    const body: Child = message ? message : (children as Child);
    const nodes = toNodes(body);
    el.replaceChildren(...nodes);
    el.hidden = nodes.length === 0;
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());
  return {
    el,
    update(nextProps) {
      current = { ...current, ...nextProps };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}

/* --------------------------------------------------------------------- */
/*  FormField                                                            */
/* --------------------------------------------------------------------- */

/**
 * What a `control` builder receives — the vanilla equivalent of react-hook-form's
 * `field` render-prop argument, plus the ids `FormField` wired for a11y.
 */
export interface FieldApi<V = unknown> {
  readonly name: string;
  /** The field's value at build time. Read it to seed the control. */
  readonly value: V;
  /** The current error, or `undefined`. */
  readonly error: string | undefined;
  /** True when the field currently shows an error. */
  readonly invalid: boolean;
  readonly formItemId: string;
  readonly formDescriptionId: string;
  readonly formMessageId: string;
  /** Push a value into the form (wire to the control's change event). */
  onChange(value: V): void;
  /** Mark the field blurred (wire to the control's blur event). */
  onBlur(): void;
  /**
   * Register to receive the value when the FORM changes it (a `reset()`, or an
   * external `setValue`). Lets a control stay in sync without a render loop.
   */
  onExternalChange(fn: (value: V) => void): void;
}

export interface FormFieldConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  form: FormController<T>;
  name: keyof T & string;
  label?: Child;
  description?: Child;
  /** Class on the FormItem wrapper. */
  class?: string;
  /** Builds the control, given its field binding. Return a component or a node. */
  control: (field: FieldApi) => AnyZenComponent | Node;
}

let fieldUid = 0;

/**
 * A complete field: FormItem wrapper → label, control, description, message —
 * with the control's `id` / `aria-describedby` / `aria-invalid` wired to the
 * label and message, and the message / label colour repainted whenever the
 * form's errors change.
 */
export function FormField<T extends Record<string, unknown>>(
  config: FormFieldConfig<T>,
): ZenComponent<never> {
  const { form, name } = config;
  const uid = `zen-form-${++fieldUid}`;
  const formItemId = `${uid}-form-item`;
  const formDescriptionId = `${uid}-form-item-description`;
  const formMessageId = `${uid}-form-item-message`;

  const el = document.createElement("div");
  el.className = cn("zen-space-y-1.5", config.class);

  const disposer = new Disposer();
  const externalSubs: Array<(v: unknown) => void> = [];

  const label = config.label != null ? document.createElement("label") : null;
  if (label) {
    label.setAttribute("for", formItemId);
    label.replaceChildren(...toNodes(config.label));
  }

  const description = config.description != null ? document.createElement("p") : null;
  if (description) {
    description.id = formDescriptionId;
    description.className = "zen-text-xs zen-text-zen-muted-fg";
    description.replaceChildren(...toNodes(config.description));
  }

  const message = document.createElement("p");
  message.id = formMessageId;
  message.className = "zen-text-xs zen-font-medium zen-text-zen-error";

  const field: FieldApi = {
    name,
    value: form.getValue(name),
    get error() {
      return form.getError(name);
    },
    get invalid() {
      return Boolean(form.getError(name));
    },
    formItemId,
    formDescriptionId,
    formMessageId,
    onChange: (value) => form.setValue(name, value as T[typeof name]),
    onBlur: () => form.blur(name),
    onExternalChange: (fn) => externalSubs.push(fn as (v: unknown) => void),
  };

  const control = config.control(field);
  const isComponent = !(control instanceof Node);
  const controlEl = (isComponent ? (control as AnyZenComponent).el : control) as Element;
  if (isComponent) disposer.add(() => (control as AnyZenComponent).destroy());

  // The FormControl "slot": the control element carries the id the label points
  // at, and its describedby names the description (always) and the message (only
  // when there is an error), matching React's FormControl exactly.
  controlEl.setAttribute("id", formItemId);

  const paint = () => {
    const error = form.getError(name);
    if (label) {
      label.className = cn(
        "zen-text-sm zen-font-medium zen-leading-none",
        error ? "zen-text-zen-error" : "zen-text-zen-foreground",
      );
    }
    const described = error
      ? `${formDescriptionId} ${formMessageId}`
      : formDescriptionId;
    controlEl.setAttribute("aria-describedby", described);
    if (error) controlEl.setAttribute("aria-invalid", "true");
    else controlEl.removeAttribute("aria-invalid");

    if (error) {
      message.textContent = error;
      message.hidden = false;
    } else {
      message.textContent = "";
      message.hidden = true;
    }
  };

  el.replaceChildren(
    ...(label ? [label] : []),
    controlEl,
    ...(description ? [description] : []),
    message,
  );
  paint();

  // Only push a value into the control when THIS field's value actually moved
  // (a reset, or an external setValue) — not on every unrelated keystroke, which
  // would rebuild Select/Slider needlessly.
  let lastValue = form.getValue(name);
  disposer.add(
    form.subscribe(() => {
      paint();
      const v = form.getValue(name);
      if (!Object.is(v, lastValue)) {
        lastValue = v;
        for (const fn of externalSubs) fn(v);
      }
    }),
  );

  return {
    el,
    update() {
      /* config is static; state flows through the controller, not props */
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
