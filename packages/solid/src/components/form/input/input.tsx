import { type JSX, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * Input — shadcn-style styled <input>. No built-in label / error /
 * icon scaffolding — compose those at the call site or via the Form
 * primitive.
 *
 *   <Input type="email" placeholder="you@algorisys.com" />
 */

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export const Input = (props: InputProps) => {
  const [local, rest] = splitProps(props, ["class", "type"]);
  return (
    <input
      type={local.type}
      class={cn(
        "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        "file:zen-border-0 file:zen-bg-transparent file:zen-text-sm file:zen-font-medium",
        local.class,
      )}
      {...rest}
    />
  );
};

export type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = (props: TextareaProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <textarea
      class={cn(
        "zen-flex zen-min-h-20 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
};
