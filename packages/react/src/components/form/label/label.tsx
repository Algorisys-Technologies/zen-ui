import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";

/**
 * Label — a standalone <label> for a control that is not inside a Form.
 *
 *   <Label htmlFor="email">Email</Label>
 *   <Input id="email" />
 *
 * FormLabel already exists and is the right choice INSIDE <Form>: it reads the
 * field context, wires `htmlFor` to the generated item id, and turns red on
 * error. This is the other half — the label for a control the form-builder does
 * not own, which every binding was inlining as a bare `<label className="zen-
 * text-sm zen-font-medium">` at each call site.
 *
 * `required` renders the asterisk as decoration and states the requirement in
 * text for assistive tech, because a bare "*" is not a word a screen reader
 * conveys as "required".
 *
 * Plain <label>, not @radix-ui/react-label: that primitive exists to stop a
 * double-click selecting the label's text, which is not worth a dependency the
 * package does not already carry, and the Solid binding is a plain element too.
 *
 * The `peer-disabled:` rules fire when the labelled control is a sibling
 * carrying `zen-peer` AND is genuinely disableable — Checkbox and Switch here
 * are Radix buttons, so they are. They do NOT fire in the Solid binding, where
 * Kobalte nests its control inside a wrapper; `disabled` is the portable way to
 * dim a label in both.
 */

const labelVariants = cva("zen-font-medium zen-leading-none zen-text-zen-foreground", {
  variants: {
    size: {
      sm: "zen-text-xs",
      md: "zen-text-sm",
      lg: "zen-text-base",
    },
    disabled: {
      true: "zen-cursor-not-allowed zen-opacity-70",
      false: "",
    },
  },
  defaultVariants: { size: "md", disabled: false },
});

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    Omit<VariantProps<typeof labelVariants>, "disabled"> {
  /** Appends a decorative asterisk plus screen-reader-only "(required)". */
  required?: boolean;
  /** Dims the label. Does not disable anything — labels take no input. */
  disabled?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, size, required, disabled, children, ...props }, ref) => (
    <label
      ref={ref}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        labelVariants({ size, disabled: Boolean(disabled) }),
        "peer-disabled:zen-cursor-not-allowed peer-disabled:zen-opacity-70",
        className,
      )}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="zen-ml-0.5 zen-text-zen-error">
            *
          </span>
          <span className="zen-sr-only"> (required)</span>
        </>
      ) : null}
    </label>
  ),
);
Label.displayName = "Label";

export { Label, labelVariants };
