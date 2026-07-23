import { type JSX } from "solid-js";
/**
 * Input — shadcn-style styled <input>. No built-in label / error /
 * icon scaffolding — compose those at the call site or via the Form
 * primitive.
 *
 *   <Input type="email" placeholder="you@algorisys.com" />
 */
export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;
export declare const Input: (props: InputProps) => JSX.Element;
export type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;
export declare const Textarea: (props: TextareaProps) => JSX.Element;
//# sourceMappingURL=input.d.ts.map