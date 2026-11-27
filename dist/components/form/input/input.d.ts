import * as React from "react";
/**
 * Input — shadcn-style. A styled <input> with forwardRef.
 *
 *   <Input type="email" placeholder="you@algorisys.com" />
 *
 * No built-in label / error / icon scaffolding — compose those at the call
 * site (or via the Form primitive).
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
export { Input };
//# sourceMappingURL=input.d.ts.map