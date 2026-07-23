import { type JSX } from "solid-js";
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
export type FormProps = {
    class?: string;
    children?: JSX.Element;
};
export declare const Form: (props: FormProps) => JSX.Element;
interface FormFieldContextValue {
    name: string;
    itemId: string;
    descriptionId: string;
    messageId: string;
    error: () => string | undefined;
}
export declare const useFormField: () => FormFieldContextValue;
type AnyField = any;
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
export declare function FormField(props: FormFieldProps): JSX.Element;
export type FormItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const FormItem: (props: FormItemProps) => JSX.Element;
export type FormLabelProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const FormLabel: (props: FormLabelProps) => JSX.Element;
/**
 * FormControl — wraps the actual input. Solid doesn't have a Slot
 * primitive, so unlike React's shadcn version this is just a marker
 * div that scopes the field-id to its child. Consumers should
 * `{...fieldProps}` onto their actual input.
 */
export declare const FormControl: (props: {
    children: JSX.Element;
    class?: string;
}) => JSX.Element;
export type FormDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const FormDescription: (props: FormDescriptionProps) => JSX.Element;
export type FormMessageProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "class" | "children"> & {
    class?: string;
    children?: JSX.Element;
};
export declare const FormMessage: (props: FormMessageProps) => JSX.Element;
export {};
//# sourceMappingURL=form.d.ts.map