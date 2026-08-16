import * as React from "react";
import { type ControllerProps, type FieldPath, type FieldValues } from "react-hook-form";
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
declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>({ children, watch, getValues, getFieldState, setError, clearErrors, setValue, setValues, trigger, formState, resetField, reset, handleSubmit, unregister, control, register, setFocus, subscribe, }: import("react-hook-form").FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React.JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>(props: ControllerProps<TFieldValues, TName>) => React.JSX.Element;
declare const FormItem: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>>;
declare const useFormField: () => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: import("react-hook-form").FieldError;
    id: string;
    name: string;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
};
declare const FormLabel: React.ForwardRefExoticComponent<React.LabelHTMLAttributes<HTMLLabelElement> & React.RefAttributes<HTMLLabelElement>>;
declare const FormControl: React.ForwardRefExoticComponent<Omit<React.HTMLAttributes<HTMLElement> & {
    children?: React.ReactNode;
} & React.RefAttributes<HTMLElement>, "ref"> & React.RefAttributes<HTMLElement>>;
declare const FormDescription: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
declare const FormMessage: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLParagraphElement> & React.RefAttributes<HTMLParagraphElement>>;
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, };
//# sourceMappingURL=form.d.ts.map