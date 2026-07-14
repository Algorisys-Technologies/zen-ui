import * as React from "react";
import {
  Controller,
  useFormContext,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { cn } from "../../lib/cn";
import { Checkbox } from "../form/checkbox/checkbox";
import { Input, type InputProps } from "../form/input/input";
import { Textarea, type TextareaProps } from "../form/input/textarea";
import { RadioGroup, RadioGroupItem } from "../form/radio/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../form/select/select";
import { Slider } from "../form/slider/slider";
import { Switch } from "../form/switch/switch";

/**
 * Bound* field components — the "config-driven" idiom layered on top of
 * the compound Form primitives in ./form.tsx.
 *
 *   <Form {...form}>
 *     <BoundInput name="email" label="Email" rules={{ required: "Required" }} />
 *     <BoundSelect name="plan" label="Plan" options={planOptions} />
 *     <BoundCheckbox name="agree" label="I agree to the terms" />
 *     <Button type="submit">Submit</Button>
 *   </Form>
 *
 * Each Bound* component:
 *   1. Reads the surrounding form via useFormContext().
 *   2. Wires the value/onChange via react-hook-form (register for inputs,
 *      Controller for Radix-controlled primitives like Select/Switch).
 *   3. Renders label + control + helper + inline error in a vertical stack.
 *
 * For full control (custom layout, multiple controls per field), keep
 * using the compound API (<FormField>, <FormItem>, <FormLabel>,
 * <FormControl>, <FormMessage>). Bound* is the ergonomic default.
 *
 * All Bound* components require a parent <Form {...useForm()}> /
 * FormProvider. They will throw at runtime otherwise.
 */

/* ----------------------------- shared frame -------------------------- */

interface BoundFieldFrameProps {
  id: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

const BoundFieldFrame: React.FC<BoundFieldFrameProps> = ({
  id,
  label,
  description,
  error,
  required,
  className,
  children,
}) => (
  <div className={cn("zen-flex zen-flex-col zen-gap-1.5", className)}>
    {label ? (
      <label
        htmlFor={id}
        className={cn(
          "zen-text-sm zen-font-medium zen-leading-none",
          error ? "zen-text-zen-error" : "zen-text-zen-foreground",
        )}
      >
        {label}
        {required ? (
          <span aria-hidden className="zen-ml-0.5 zen-text-zen-error">
            *
          </span>
        ) : null}
      </label>
    ) : null}
    {children}
    {description && !error ? (
      <p className="zen-text-xs zen-text-zen-muted-fg">{description}</p>
    ) : null}
    {error ? (
      <p className="zen-text-xs zen-font-medium zen-text-zen-error" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

/* ----------------------------- helpers ------------------------------- */

const useFieldId = (name: string, idProp?: string) => {
  const auto = React.useId();
  return idProp ?? `${name}-${auto}`;
};

const getError = <T extends FieldValues>(
  errors: Record<string, unknown>,
  name: Path<T>,
): string | undefined => {
  const path = name.split(".");
  let cursor: unknown = errors;
  for (const key of path) {
    if (cursor && typeof cursor === "object" && key in cursor) {
      cursor = (cursor as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  const msg = (cursor as { message?: unknown } | undefined)?.message;
  return typeof msg === "string" ? msg : undefined;
};

/* ----------------------------- BoundInput ---------------------------- */

export interface BoundInputProps<TFields extends FieldValues = FieldValues>
  extends Omit<InputProps, "name" | "id"> {
  name: Path<TFields>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  fieldClassName?: string;
}

export function BoundInput<TFields extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  rules,
  fieldClassName,
  className,
  ...rest
}: BoundInputProps<TFields>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <BoundFieldFrame
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      className={fieldClassName}
    >
      <Input
        id={id}
        aria-invalid={!!error || undefined}
        aria-describedby={
          description || error ? `${id}-msg` : undefined
        }
        className={className}
        {...register(name, rules)}
        {...rest}
      />
    </BoundFieldFrame>
  );
}

/* ----------------------------- BoundTextarea ------------------------- */

export interface BoundTextareaProps<TFields extends FieldValues = FieldValues>
  extends Omit<TextareaProps, "name" | "id"> {
  name: Path<TFields>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  fieldClassName?: string;
}

export function BoundTextarea<TFields extends FieldValues = FieldValues>({
  name,
  label,
  description,
  required,
  rules,
  fieldClassName,
  className,
  ...rest
}: BoundTextareaProps<TFields>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <BoundFieldFrame
      id={id}
      label={label}
      description={description}
      required={required}
      error={error}
      className={fieldClassName}
    >
      <Textarea
        id={id}
        aria-invalid={!!error || undefined}
        className={className}
        {...register(name, rules)}
        {...rest}
      />
    </BoundFieldFrame>
  );
}

/* ----------------------------- BoundSelect --------------------------- */

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface BoundSelectProps<TFields extends FieldValues = FieldValues> {
  name: Path<TFields>;
  options: SelectOption[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  placeholder?: string;
  disabled?: boolean;
  fieldClassName?: string;
}

export function BoundSelect<TFields extends FieldValues = FieldValues>({
  name,
  options,
  label,
  description,
  required,
  rules,
  placeholder,
  disabled,
  fieldClassName,
}: BoundSelectProps<TFields>) {
  const { control, formState: { errors } } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <BoundFieldFrame
          id={id}
          label={label}
          description={description}
          required={required}
          error={error}
          className={fieldClassName}
        >
          <Select
            value={(field.value as string | undefined) ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger id={id} aria-invalid={!!error || undefined}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </BoundFieldFrame>
      )}
    />
  );
}

/* ----------------------------- BoundCheckbox ------------------------- */

export interface BoundCheckboxProps<TFields extends FieldValues = FieldValues> {
  name: Path<TFields>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  disabled?: boolean;
  fieldClassName?: string;
}

export function BoundCheckbox<TFields extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  disabled,
  fieldClassName,
}: BoundCheckboxProps<TFields>) {
  const { control, formState: { errors } } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }: { field: ControllerRenderProps<TFields, Path<TFields>> }) => (
        <div className={cn("zen-flex zen-flex-col zen-gap-1.5", fieldClassName)}>
          <label
            htmlFor={id}
            className="zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm"
          >
            <Checkbox
              id={id}
              checked={field.value as boolean | "indeterminate"}
              onCheckedChange={(v) => field.onChange(v === true)}
              disabled={disabled}
              aria-invalid={!!error || undefined}
            />
            <span>{label}</span>
          </label>
          {description && !error ? (
            <p className="zen-text-xs zen-text-zen-muted-fg zen-pl-6">{description}</p>
          ) : null}
          {error ? (
            <p className="zen-text-xs zen-font-medium zen-text-zen-error zen-pl-6" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}

/* ----------------------------- BoundSwitch --------------------------- */

export interface BoundSwitchProps<TFields extends FieldValues = FieldValues> {
  name: Path<TFields>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  disabled?: boolean;
  fieldClassName?: string;
}

export function BoundSwitch<TFields extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  disabled,
  fieldClassName,
}: BoundSwitchProps<TFields>) {
  const { control, formState: { errors } } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <div className={cn("zen-flex zen-items-center zen-justify-between zen-gap-3", fieldClassName)}>
          <div>
            {label ? (
              <label htmlFor={id} className="zen-text-sm zen-font-medium zen-cursor-pointer">
                {label}
              </label>
            ) : null}
            {description ? (
              <p className="zen-text-xs zen-text-zen-muted-fg">{description}</p>
            ) : null}
            {error ? (
              <p className="zen-text-xs zen-font-medium zen-text-zen-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <Switch
            id={id}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={disabled}
            aria-invalid={!!error || undefined}
          />
        </div>
      )}
    />
  );
}

/* ----------------------------- BoundRadioGroup ----------------------- */

export interface BoundRadioGroupProps<TFields extends FieldValues = FieldValues> {
  name: Path<TFields>;
  options: SelectOption[];
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  fieldClassName?: string;
}

export function BoundRadioGroup<TFields extends FieldValues = FieldValues>({
  name,
  options,
  label,
  description,
  required,
  rules,
  orientation = "vertical",
  disabled,
  fieldClassName,
}: BoundRadioGroupProps<TFields>) {
  const { control, formState: { errors } } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <BoundFieldFrame
          id={id}
          label={label}
          description={description}
          required={required}
          error={error}
          className={fieldClassName}
        >
          <RadioGroup
            value={(field.value as string | undefined) ?? ""}
            onValueChange={field.onChange}
            disabled={disabled}
            style={
              orientation === "horizontal"
                ? { display: "flex", flexDirection: "row", gap: "var(--zen-space-3)" }
                : undefined
            }
          >
            {options.map((opt) => {
              const optId = `${id}-${opt.value}`;
              return (
                <label
                  key={opt.value}
                  htmlFor={optId}
                  className="zen-inline-flex zen-items-center zen-gap-2 zen-cursor-pointer zen-text-sm"
                >
                  <RadioGroupItem
                    id={optId}
                    value={opt.value}
                    disabled={opt.disabled}
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </RadioGroup>
        </BoundFieldFrame>
      )}
    />
  );
}

/* ----------------------------- BoundSlider --------------------------- */

export interface BoundSliderProps<TFields extends FieldValues = FieldValues> {
  name: Path<TFields>;
  label?: React.ReactNode;
  description?: React.ReactNode;
  rules?: RegisterOptions<TFields, Path<TFields>>;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  fieldClassName?: string;
}

export function BoundSlider<TFields extends FieldValues = FieldValues>({
  name,
  label,
  description,
  rules,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  fieldClassName,
}: BoundSliderProps<TFields>) {
  const { control, formState: { errors } } = useFormContext<TFields>();
  const id = useFieldId(name);
  const error = getError<TFields>(errors as Record<string, unknown>, name);
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => {
        const value = Array.isArray(field.value)
          ? (field.value as number[])
          : [Number(field.value ?? min)];
        return (
          <BoundFieldFrame
            id={id}
            label={label}
            description={description}
            error={error}
            className={fieldClassName}
          >
            <Slider
              value={value}
              onValueChange={field.onChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
            />
          </BoundFieldFrame>
        );
      }}
    />
  );
}
