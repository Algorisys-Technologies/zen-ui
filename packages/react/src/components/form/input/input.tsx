import * as React from "react";
import { cn } from "../../../lib/cn";

/**
 * Input — shadcn-style. A styled <input> with forwardRef.
 *
 *   <Input type="email" placeholder="you@algorisys.com" />
 *
 * No built-in label / error / icon scaffolding — compose those at the call
 * site (or via the Form primitive).
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        "file:zen-border-0 file:zen-bg-transparent file:zen-text-sm file:zen-font-medium",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
