import { type JSX, For, Show, splitProps } from "solid-js";
import { setValue } from "@modular-forms/solid";
import { cn } from "../../lib/cn";
import { Checkbox } from "../form/checkbox/checkbox";
import { Input, Textarea, type InputProps, type TextareaProps } from "../form/input/input";
import { RadioGroup, RadioGroupItem } from "../form/radio/radio-group";
import { Select, type SelectOption } from "../form/select/select";
import { Slider } from "../form/slider/slider";
import { Switch } from "../form/switch/switch";

// modular-forms's Field generics are tight (PathValue conditional on
// FieldType). Rather than re-thread those generics through every
// Bound* wrapper, we type-erase Field/FormStore here. Consumers keep
// the narrow types at their createForm() call site; this wrapper
// trusts the runtime shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyField = any;
type FieldValues = Record<string, unknown>;
type FieldPath<T> = keyof T & string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormStore<_T = unknown> = any;

/**
 * Bound* field components — Solid port of the React shadcn binding's
 * config-driven adapters, retargeted at @modular-forms/solid.
 *
 *   const [form, { Form, Field }] = createForm<MyValues>({
 *     validate: zodForm(schema),
 *   });
 *
 *   <Form onSubmit={…}>
 *     <BoundInput of={form} Field={Field} name="email" label="Email" />
 *     <BoundSelect of={form} Field={Field} name="plan" label="Plan" options={…} />
 *     <BoundCheckbox of={form} Field={Field} name="agree" label="I agree" />
 *     <Button type="submit">Submit</Button>
 *   </Form>
 *
 * Each Bound* component:
 *   1. Renders a Field from modular-forms;
 *   2. Pulls field.value / field.error;
 *   3. Renders label + control + helper + inline error in a vertical stack.
 *
 * API delta from React (RHF):
 *   - The form store + Field component come in via `of` and `Field` props
 *     (modular-forms doesn't have an ambient form context).
 *   - Validation lives on the form via the `validate` option to createForm,
 *     not as per-field `rules` props.
 */

/* ----------------------------- shared frame -------------------------- */

const Frame = (props: {
  id: string;
  label?: JSX.Element;
  description?: JSX.Element;
  error?: string;
  required?: boolean;
  class?: string;
  children: JSX.Element;
}) => (
  <div class={cn("zen-flex zen-flex-col zen-gap-1.5", props.class)}>
    <Show when={props.label}>
      <label
        for={props.id}
        class={cn(
          "zen-text-sm zen-font-medium zen-leading-none",
          props.error ? "zen-text-zen-error" : "zen-text-zen-foreground",
        )}
      >
        {props.label}
        <Show when={props.required}>
          <span aria-hidden class="zen-ml-0.5 zen-text-zen-error">*</span>
        </Show>
      </label>
    </Show>
    {props.children}
    <Show when={props.description && !props.error}>
      <p class="zen-text-xs zen-text-zen-muted-fg">{props.description}</p>
    </Show>
    <Show when={props.error}>
      <p class="zen-text-xs zen-font-medium zen-text-zen-error" role="alert">{props.error}</p>
    </Show>
  </div>
);

/* ----------------------------- common bound props -------------------- */

type BoundCommon<TFields extends FieldValues> = {
  of: FormStore<TFields>;
  Field: AnyField;
  name: FieldPath<TFields>;
  label?: JSX.Element;
  description?: JSX.Element;
  required?: boolean;
  fieldClass?: string;
};

/* ----------------------------- BoundInput ---------------------------- */
export type BoundInputProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & Omit<InputProps, "name" | "id">;

export function BoundInput<TFields extends FieldValues = FieldValues>(
  props: BoundInputProps<TFields>,
) {
  const [local, inputRest] = splitProps(props, [
    "of",
    "Field",
    "name",
    "label",
    "description",
    "required",
    "fieldClass",
  ]);
  return (
    <local.Field name={local.name}>
      {(
        field: { name: string; value: unknown; error: string },
        fieldProps: Record<string, unknown>,
      ) => {
        const id = `${local.name}-${field.name}`;
        return (
          <Frame
            id={id}
            label={local.label}
            description={local.description}
            error={field.error}
            required={local.required}
            class={local.fieldClass}
          >
            <Input
              id={id}
              value={field.value as string | number | undefined}
              {...fieldProps}
              aria-invalid={!!field.error || undefined}
              {...inputRest}
            />
          </Frame>
        );
      }}
    </local.Field>
  );
}

/* ----------------------------- BoundTextarea ------------------------- */
export type BoundTextareaProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & Omit<TextareaProps, "name" | "id">;

export function BoundTextarea<TFields extends FieldValues = FieldValues>(
  props: BoundTextareaProps<TFields>,
) {
  const [local, rest] = splitProps(props, [
    "of",
    "Field",
    "name",
    "label",
    "description",
    "required",
    "fieldClass",
  ]);
  return (
    <local.Field name={local.name}>
      {(
        field: { name: string; value: unknown; error: string },
        fieldProps: Record<string, unknown>,
      ) => {
        const id = `${local.name}-${field.name}`;
        return (
          <Frame
            id={id}
            label={local.label}
            description={local.description}
            error={field.error}
            required={local.required}
            class={local.fieldClass}
          >
            <Textarea
              id={id}
              value={field.value as string | undefined}
              {...fieldProps}
              aria-invalid={!!field.error || undefined}
              {...rest}
            />
          </Frame>
        );
      }}
    </local.Field>
  );
}

/* ----------------------------- BoundSelect --------------------------- */
export type { SelectOption as BoundSelectOption };

export type BoundSelectProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & {
    options: SelectOption[];
    placeholder?: string;
    disabled?: boolean;
  };

export function BoundSelect<TFields extends FieldValues = FieldValues>(
  props: BoundSelectProps<TFields>,
) {
  return (
    <props.Field name={props.name}>
      {(field: { name: string; value: unknown; error: string }) => (
        <Frame
          id={`${props.name}-${field.name}`}
          label={props.label}
          description={props.description}
          error={field.error}
          required={props.required}
          class={props.fieldClass}
        >
          <Select
            options={props.options}
            value={(field.value as string | undefined) ?? undefined}
            onChange={(v) => {
              // Kobalte Select doesn't drive modular-forms's hidden input;
              // push the value into the form store directly.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setValue(props.of as never, props.name as never, (v ?? "") as never);
            }}
            placeholder={props.placeholder}
            disabled={props.disabled}
            errorMessage={field.error}
          />
        </Frame>
      )}
    </props.Field>
  );
}

/* ----------------------------- BoundCheckbox ------------------------- */
export type BoundCheckboxProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & {
    inlineLabel?: JSX.Element;
    disabled?: boolean;
  };

export function BoundCheckbox<TFields extends FieldValues = FieldValues>(
  props: BoundCheckboxProps<TFields>,
) {
  return (
    <props.Field name={props.name} type="boolean">
      {(field: { name: string; value: unknown; error: string }) => (
        <Frame
          id={`${props.name}-${field.name}`}
          label={props.label}
          description={props.description}
          error={field.error}
          required={props.required}
          class={props.fieldClass}
        >
          <div class="zen-flex zen-items-center zen-gap-2">
            <Checkbox
              checked={(field.value as boolean | undefined) ?? false}
              onChange={(v) => {
                setValue(props.of as never, props.name as never, v as never);
              }}
              disabled={props.disabled}
              name={props.name}
            />
            <Show when={props.inlineLabel}>
              <span class="zen-text-sm">{props.inlineLabel}</span>
            </Show>
          </div>
        </Frame>
      )}
    </props.Field>
  );
}

/* ----------------------------- BoundSwitch --------------------------- */
export type BoundSwitchProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & {
    inlineLabel?: JSX.Element;
    disabled?: boolean;
  };

export function BoundSwitch<TFields extends FieldValues = FieldValues>(
  props: BoundSwitchProps<TFields>,
) {
  return (
    <props.Field name={props.name} type="boolean">
      {(field: { name: string; value: unknown; error: string }) => (
        // Settings-row layout, mirroring the React binding: label + description
        // on the left, Switch pushed right. It previously used Frame (label
        // stacked above, switch below-left) like a checkbox, which is not what
        // a switch means and did not match React.
        <div
          class={cn(
            "zen-flex zen-items-center zen-justify-between zen-gap-3",
            props.fieldClass,
          )}
        >
          <div>
            <Show when={props.label}>
              <label
                for={`${props.name}-${field.name}`}
                class="zen-text-sm zen-font-medium zen-cursor-pointer"
              >
                {props.label}
                <Show when={props.required}>
                  <span class="zen-ml-0.5 zen-text-zen-error">*</span>
                </Show>
              </label>
            </Show>
            <Show when={props.inlineLabel && !props.label}>
              <span class="zen-text-sm zen-font-medium">{props.inlineLabel}</span>
            </Show>
            <Show when={props.description}>
              <p class="zen-m-0 zen-text-xs zen-text-zen-muted-fg">
                {props.description}
              </p>
            </Show>
            <Show when={field.error}>
              <p
                class="zen-m-0 zen-text-xs zen-font-medium zen-text-zen-error"
                role="alert"
              >
                {field.error}
              </p>
            </Show>
          </div>
          <Switch
            id={`${props.name}-${field.name}`}
            checked={(field.value as boolean | undefined) ?? false}
            onChange={(v) => {
              setValue(props.of as never, props.name as never, v as never);
            }}
            disabled={props.disabled}
            name={props.name}
          />
        </div>
      )}
    </props.Field>
  );
}

/* ----------------------------- BoundRadioGroup ----------------------- */
export type BoundRadioGroupProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & {
    options: { value: string; label: JSX.Element }[];
    orientation?: "horizontal" | "vertical";
    disabled?: boolean;
  };

export function BoundRadioGroup<TFields extends FieldValues = FieldValues>(
  props: BoundRadioGroupProps<TFields>,
) {
  return (
    <props.Field name={props.name}>
      {(field: { name: string; value: unknown; error: string }) => (
        <Frame
          id={`${props.name}-${field.name}`}
          label={props.label}
          description={props.description}
          error={field.error}
          required={props.required}
          class={props.fieldClass}
        >
          <RadioGroup
            value={(field.value as string | undefined) ?? ""}
            onChange={(v) => {
              setValue(props.of as never, props.name as never, v as never);
            }}
            orientation={props.orientation}
            disabled={props.disabled}
          >
            <For each={props.options}>
              {(opt) => <RadioGroupItem value={opt.value}>{opt.label}</RadioGroupItem>}
            </For>
          </RadioGroup>
        </Frame>
      )}
    </props.Field>
  );
}

/* ----------------------------- BoundSlider --------------------------- */
export type BoundSliderProps<TFields extends FieldValues = FieldValues> =
  BoundCommon<TFields> & {
    minValue?: number;
    maxValue?: number;
    step?: number;
    disabled?: boolean;
  };

export function BoundSlider<TFields extends FieldValues = FieldValues>(
  props: BoundSliderProps<TFields>,
) {
  return (
    <props.Field name={props.name} type="number">
      {(field: { name: string; value: unknown; error: string }) => (
        <Frame
          id={`${props.name}-${field.name}`}
          label={props.label}
          description={props.description}
          error={field.error}
          required={props.required}
          class={props.fieldClass}
        >
          <Slider
            value={[(field.value as number | undefined) ?? 0]}
            onChange={(vs) => {
              const v = vs[0] ?? 0;
              setValue(props.of as never, props.name as never, v as never);
            }}
            minValue={props.minValue}
            maxValue={props.maxValue}
            step={props.step}
            disabled={props.disabled}
          />
        </Frame>
      )}
    </props.Field>
  );
}
