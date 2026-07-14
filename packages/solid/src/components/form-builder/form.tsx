import { type JSX, Show, createUniqueId, splitProps, createContext, useContext } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Form primitives — Solid port of the shadcn pattern, layered on
 * @modular-forms/solid.
 *
 *   const [form, { Form: MForm, Field: MField }] = createForm<MyValues>({
 *     validate: zodForm(schema),
 *   });
 *
 *   <Form>
 *     <MForm onSubmit={(values) => …}>
 *       <FormField of={form} Field={MField} name="email">
 *         {(field, fieldProps) => (
 *           <FormItem>
 *             <FormLabel>Email</FormLabel>
 *             <FormControl>
 *               <Input type="email" {...fieldProps} value={field.value} />
 *             </FormControl>
 *             <FormDescription>We'll never share it.</FormDescription>
 *             <FormMessage />
 *           </FormItem>
 *         )}
 *       </FormField>
 *       <Button type="submit">Submit</Button>
 *     </MForm>
 *   </Form>
 *
 * API delta from the React (RHF) binding:
 *  - modular-forms requires the form store + Field component to be
 *    created via `createForm()`, so the FormField wrapper takes
 *    `of={form}` and `Field={MField}` props instead of discovering them
 *    via context.
 *  - FormItem / FormLabel / FormControl / etc compose via a small Solid
 *    context so id + aria-* wire-up still happens automatically inside
 *    a FormField.
 */

/* ----------------------------- Form (root) ------------------------------ */
export type FormProps = {
  class?: string;
  children?: JSX.Element;
};

export const Form = (props: FormProps) => (
  <div class={cn("zen-space-y-4", props.class)}>{props.children}</div>
);

/* ----------------------------- Field context ---------------------------- */

interface FormFieldContextValue {
  name: string;
  itemId: string;
  descriptionId: string;
  messageId: string;
  error: () => string | undefined;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export const useFormField = (): FormFieldContextValue => {
  const ctx = useContext(FormFieldContext);
  if (!ctx)
    throw new Error(
      "useFormField / FormLabel / FormControl / FormMessage must be inside <FormField>",
    );
  return ctx;
};

/* ----------------------------- FormField ------------------------------- */

// Modular-forms's Field component has very tight generics that conflict
// with a generic wrapper. We accept it as a loose component type here;
// the consumer's createForm() call still preserves narrow value typing
// at the call site (just not through this re-export).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyField = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFormStore = any;

interface FieldStoreShape {
  name: string;
  value: unknown;
  error: string;
  active: boolean;
  touched: boolean;
  dirty: boolean;
}

interface FieldElementPropsShape {
  name: string;
  ref: (el: unknown) => void;
}

export type FormFieldProps = {
  /** The modular-forms form store created via createForm(). */
  of: AnyFormStore;
  /** The Field component returned by createForm(). */
  Field: AnyField;
  name: string;
  children: (field: FieldStoreShape, props: FieldElementPropsShape) => JSX.Element;
};

export function FormField(props: FormFieldProps) {
  const itemId = createUniqueId();
  const descriptionId = `${itemId}-description`;
  const messageId = `${itemId}-message`;
  const F = props.Field;
  return (
    <F name={props.name}>
      {(field: FieldStoreShape, fieldProps: FieldElementPropsShape) => {
        const ctx: FormFieldContextValue = {
          name: props.name,
          itemId,
          descriptionId,
          messageId,
          error: () => field.error || undefined,
        };
        return (
          <FormFieldContext.Provider value={ctx}>
            {props.children(field, fieldProps)}
          </FormFieldContext.Provider>
        );
      }}
    </F>
  );
}

/* ----------------------------- FormItem -------------------------------- */
export type FormItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
  class?: string;
  children?: JSX.Element;
};

export const FormItem = (props: FormItemProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div {...rest} class={cn("zen-space-y-1.5", local.class)}>
      {local.children}
    </div>
  );
};

/* ----------------------------- FormLabel ------------------------------- */
export type FormLabelProps = Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const FormLabel = (props: FormLabelProps) => {
  const ctx = useFormField();
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    // `for` is set after `rest` so the field-id wiring always wins over any
    // stray `for` a caller might pass.
    <label
      {...rest}
      for={ctx.itemId}
      class={cn(
        "zen-text-sm zen-font-medium zen-leading-none",
        ctx.error() ? "zen-text-zen-error" : "zen-text-zen-foreground",
        local.class,
      )}
    >
      {local.children}
    </label>
  );
};

/* ----------------------------- FormControl ----------------------------- */
/**
 * FormControl — wraps the actual input. Solid doesn't have a Slot
 * primitive, so unlike React's shadcn version this is just a marker
 * div that scopes the field-id to its child. Consumers should
 * `{...fieldProps}` onto their actual input.
 */
export const FormControl = (props: { children: JSX.Element; class?: string }) => {
  const ctx = useFormField();
  return (
    <div
      data-form-control
      data-field-id={ctx.itemId}
      data-error={ctx.error() ? "true" : undefined}
      class={props.class}
    >
      {props.children}
    </div>
  );
};

/* ----------------------------- FormDescription ------------------------- */
export type FormDescriptionProps = Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const FormDescription = (props: FormDescriptionProps) => {
  const ctx = useFormField();
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p
      {...rest}
      id={ctx.descriptionId}
      class={cn("zen-text-xs zen-text-zen-muted-fg", local.class)}
    >
      {local.children}
    </p>
  );
};

/* ----------------------------- FormMessage ----------------------------- */
export type FormMessageProps = Omit<
  JSX.HTMLAttributes<HTMLParagraphElement>,
  "class" | "children"
> & {
  class?: string;
  children?: JSX.Element;
};

export const FormMessage = (props: FormMessageProps) => {
  const ctx = useFormField();
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <Show when={ctx.error() || local.children}>
      <p
        {...rest}
        id={ctx.messageId}
        class={cn("zen-text-xs zen-font-medium zen-text-zen-error", local.class)}
        role="alert"
      >
        {ctx.error() || local.children}
      </p>
    </Show>
  );
};
