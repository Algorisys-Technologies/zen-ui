import { type JSX, splitProps } from "solid-js";
import { RadioGroup as KRadioGroup } from "@kobalte/core/radio-group";
import { cn } from "../../../lib/cn";

/**
 * RadioGroup + RadioGroupItem — Solid port built on Kobalte's
 * RadioGroup primitive.
 *
 *   <RadioGroup value={x()} onChange={setX}>
 *     <RadioGroupItem value="a">A</RadioGroupItem>
 *     <RadioGroupItem value="b">B</RadioGroupItem>
 *   </RadioGroup>
 *
 * Kobalte supplies roving tabindex, arrow-key nav, keyboard activation,
 * ARIA, and form submission (name + value). Themed via --zen-* tokens.
 */

export type RadioSize = "sm" | "md" | "lg";

// `onChange` is omitted from the DOM attributes: our RadioGroup reports the
// new value string directly, which collides with the DOM's change event.
export type RadioGroupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children" | "onChange"
> & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  orientation?: "horizontal" | "vertical";
  class?: string;
  children?: JSX.Element;
};

export const RadioGroup = (props: RadioGroupProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "value",
    "defaultValue",
    "onChange",
    "name",
    "disabled",
    "required",
    "orientation",
    "children",
  ]);
  return (
    <KRadioGroup
      {...rest}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      name={local.name}
      disabled={local.disabled}
      required={local.required}
      orientation={local.orientation}
      class={cn(
        local.orientation === "horizontal" ? "zen-flex zen-gap-3" : "zen-grid zen-gap-2",
        local.class,
      )}
    >
      {local.children}
    </KRadioGroup>
  );
};

const ITEM_SIZES: Record<RadioSize, string> = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5",
};
const DOT_SIZES: Record<RadioSize, string> = {
  sm: "zen-h-1.5 zen-w-1.5",
  md: "zen-h-2 zen-w-2",
  lg: "zen-h-2.5 zen-w-2.5",
};

export type RadioGroupItemProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "children"
> & {
  value: string;
  disabled?: boolean;
  size?: RadioSize;
  class?: string;
  children?: JSX.Element;
};

export const RadioGroupItem = (props: RadioGroupItemProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "value",
    "disabled",
    "size",
    "children",
    "id",
  ]);
  const size = () => local.size ?? "md";
  return (
    <KRadioGroup.Item
      {...rest}
      value={local.value}
      disabled={local.disabled}
      class={cn("zen-inline-flex zen-items-center zen-gap-2", local.class)}
    >
      {/* The caller's `id` goes on the item's native <input>, not the item root:
          Kobalte derives the input id from the root, so `<label for={id}>` on the
          root (a non-labelable div) would never associate. */}
      <KRadioGroup.ItemInput id={local.id} />
      <KRadioGroup.ItemControl
        class={cn(
          "zen-aspect-square zen-rounded-zen-full zen-border zen-border-zen-border zen-text-zen-primary zen-bg-zen-background",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50",
          "data-[checked]:zen-border-zen-primary",
          "zen-flex zen-items-center zen-justify-center",
          ITEM_SIZES[size()],
        )}
      >
        <KRadioGroup.ItemIndicator>
          <span class={cn("zen-block zen-rounded-zen-full zen-bg-zen-primary", DOT_SIZES[size()])} />
        </KRadioGroup.ItemIndicator>
      </KRadioGroup.ItemControl>
      {local.children ? (
        <KRadioGroup.ItemLabel class="zen-text-sm">{local.children}</KRadioGroup.ItemLabel>
      ) : null}
    </KRadioGroup.Item>
  );
};
