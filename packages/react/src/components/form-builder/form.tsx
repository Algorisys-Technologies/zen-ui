import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { cn } from "../../lib/cn";

/**
 * Form primitives — shadcn pattern on react-hook-form.
 *
 *   const form = useForm<MyValues>({ resolver: zodResolver(schema) });
 *
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
 *       <FormField
 *         control={form.control}
 *         name="email"
 *         render={({ field }) => (
 *           <FormItem>
 *             <FormLabel>Email</FormLabel>
 *             <FormControl><Input type="email" {...field} /></FormControl>
 *             <FormDescription>We'll never share it.</FormDescription>
 *             <FormMessage />
 *           </FormItem>
 *         )}
 *       />
 *       <Button type="submit">Submit</Button>
 *     </form>
 *   </Form>
 *
 * FormControl is a Slot — it injects id / aria-describedby / aria-invalid
 * into whatever child you pass (Input, Textarea, Select, Switch, …) so
 * label/description/message wire up to the right element for screen
 * readers automatically.
 *
 * Works with any react-hook-form resolver (zod via @hookform/resolvers,
 * yup, valibot, joi, etc.). Both are already in the project's deps.
 */

/* ----------------------------- Form (root) ------------------------------ */
const Form = FormProvider;

/* ----------------------------- FormField ------------------------------- */
type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: ControllerProps<TFieldValues, TName>,
) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

/* ----------------------------- FormItem -------------------------------- */
type FormItemContextValue = { id: string };

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();
  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn("zen-space-y-1.5", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

/* ----------------------------- useFormField ---------------------------- */
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField must be used within <FormField>");
  }

  const fieldState = getFieldState(fieldContext.name, formState);
  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

/* ----------------------------- FormLabel ------------------------------- */
const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();
  return (
    <label
      ref={ref}
      htmlFor={formItemId}
      className={cn(
        "zen-text-sm zen-font-medium zen-leading-none",
        error ? "zen-text-zen-error" : "zen-text-zen-foreground",
        className,
      )}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

/* ----------------------------- FormControl ----------------------------- */
const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

/* ----------------------------- FormDescription ------------------------- */
const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("zen-text-xs zen-text-zen-muted-fg", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

/* ----------------------------- FormMessage ----------------------------- */
const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;
  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("zen-text-xs zen-font-medium zen-text-zen-error", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
