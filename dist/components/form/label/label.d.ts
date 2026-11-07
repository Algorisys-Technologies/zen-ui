import * as React from "react";
import { type VariantProps } from "class-variance-authority";
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
declare const labelVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    disabled?: boolean | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, Omit<VariantProps<typeof labelVariants>, "disabled"> {
    /** Appends a decorative asterisk plus screen-reader-only "(required)". */
    required?: boolean;
    /** Dims the label. Does not disable anything — labels take no input. */
    disabled?: boolean;
}
declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<HTMLLabelElement>>;
export { Label, labelVariants };
//# sourceMappingURL=label.d.ts.map