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
        "zen-flex zen-h-zen-control zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // Marked invalid by the form (aria-invalid="true"): the error border,
        // as Select and Combobox show theirs.
        "aria-[invalid=true]:zen-border-zen-error",
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
        "zen-flex zen-min-h-20 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "placeholder:zen-text-zen-muted-fg",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
};
