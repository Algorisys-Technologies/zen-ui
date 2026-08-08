import { type JSX, Show, mergeProps, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * Label — a standalone <label> for a control that is not inside a Form.
 *
 *   <Label for="email">Email</Label>
 *   <Input id="email" />
 *
 * FormLabel already exists and is the right choice INSIDE <Form>: it reads the
 * field context, wires `for` to the generated item id, and turns red on error.
 * This is the other half — the label for a control the form-builder does not
 * own, which every binding was inlining as a bare `<label class="zen-text-sm
 * zen-font-medium">` at each call site.
 *
 * `required` renders the asterisk as decoration and states the requirement in
 * text for assistive tech, because a bare "*" is not a word a screen reader
 * conveys as "required".
 *
 * `disabled` is how you dim the label, and in this binding it is the ONLY way.
 * The `peer-disabled:` rules below are carried for parity with React, where a
 * Radix Checkbox is itself the `zen-peer` element and a real `<button
 * disabled>`, so a sibling label dims on its own. Under Kobalte the class sits
 * on a control `<div>` nested inside the checkbox root — never a sibling of an
 * outside label, and a `<div>` never matches `:disabled` — so the rules cannot
 * fire here. Verified in a browser: the label stayed at opacity 1 beside a
 * disabled Kobalte checkbox. Pass `disabled` and do not rely on the peer.
 */

export type LabelProps = Omit<
  JSX.LabelHTMLAttributes<HTMLLabelElement>,
  "class" | "children"
> & {
  size?: "sm" | "md" | "lg";
  /** Appends a decorative asterisk plus screen-reader-only "(required)". */
  required?: boolean;
  /** Dims the label. Does not disable anything — labels take no input. */
  disabled?: boolean;
  class?: string;
  children?: JSX.Element;
};

const SIZES = {
  sm: "zen-text-xs",
  md: "zen-text-sm",
  lg: "zen-text-base",
} as const;

export const Label = (rawProps: LabelProps) => {
  const props = mergeProps({ size: "md" as const }, rawProps);
  const [local, rest] = splitProps(props, [
    "size",
    "required",
    "disabled",
    "class",
    "children",
  ]);
  return (
    <label
      {...rest}
      data-disabled={local.disabled ? "" : undefined}
      class={cn(
        "zen-font-medium zen-leading-none zen-text-zen-foreground",
        SIZES[local.size],
        local.disabled && "zen-cursor-not-allowed zen-opacity-70",
        // Applies when the labelled control is a sibling marked `zen-peer`,
        // which is how Checkbox and Switch render their control.
        "peer-disabled:zen-cursor-not-allowed peer-disabled:zen-opacity-70",
        local.class,
      )}
    >
      {local.children}
      <Show when={local.required}>
        <span aria-hidden="true" class="zen-ml-0.5 zen-text-zen-error">
          *
        </span>
        <span class="zen-sr-only"> (required)</span>
      </Show>
    </label>
  );
};
