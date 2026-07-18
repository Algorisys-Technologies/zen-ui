import { type JSX, splitProps, Show } from "solid-js";
import { Checkbox as KCheckbox } from "@kobalte/core/checkbox";
import { cn } from "../../../lib/cn";

/**
 * Checkbox — Solid port built on Kobalte's Checkbox primitive.
 *
 *   <Checkbox checked={value()} onChange={setValue} />
 *   <Checkbox indeterminate />
 *
 * Kobalte exposes both `checked` and `indeterminate` props natively (no
 * DOM ref-poking), keyboard activation (space), and ARIA. Themed via
 * --zen-* tokens.
 */

export type CheckboxSize = "sm" | "md" | "lg";

// `onChange` is omitted from the DOM attributes: our Checkbox reports the new
// checked boolean directly, which collides with the DOM's change event.
export type CheckboxProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
  size?: CheckboxSize;
  class?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  /** Optional inline label rendered to the right of the box. */
  label?: JSX.Element;
};

const BOX_SIZES: Record<CheckboxSize, string> = {
  sm: "zen-h-3.5 zen-w-3.5",
  md: "zen-h-4 zen-w-4",
  lg: "zen-h-5 zen-w-5",
};

export const Checkbox = (props: CheckboxProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "size",
    "checked",
    "defaultChecked",
    "indeterminate",
    "onChange",
    "disabled",
    "required",
    "name",
    "value",
    "label",
    "id",
  ]);
  return (
    <KCheckbox
      {...rest}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      indeterminate={local.indeterminate}
      onChange={local.onChange}
      disabled={local.disabled}
      required={local.required}
      name={local.name}
      value={local.value}
      class={cn("zen-inline-flex zen-items-center zen-gap-2", local.class)}
    >
      {/* The caller's `id` goes on the native <input>, not the root. Kobalte puts
          a group id on the root <div> and derives `${id}-input` for the control,
          so a caller's `<label for={id}>` would point at a non-labelable div and
          never associate. Landing it on the input restores `<label for>`. */}
      <KCheckbox.Input id={local.id} class="zen-sr-only" />
      <KCheckbox.Control
        class={cn(
          "zen-peer zen-shrink-0 zen-rounded-zen-sm zen-border zen-border-zen-border zen-bg-zen-background",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50",
          "data-[checked]:zen-bg-zen-primary data-[checked]:zen-border-zen-primary data-[checked]:zen-text-zen-primary-fg",
          "data-[indeterminate]:zen-bg-zen-primary data-[indeterminate]:zen-border-zen-primary data-[indeterminate]:zen-text-zen-primary-fg",
          BOX_SIZES[local.size ?? "md"],
        )}
      >
        <KCheckbox.Indicator class="zen-flex zen-items-center zen-justify-center zen-text-current zen-h-full zen-w-full">
          <Show when={local.indeterminate} fallback={<CheckIcon />}>
            <DashIcon />
          </Show>
        </KCheckbox.Indicator>
      </KCheckbox.Control>
      {local.label ? <KCheckbox.Label class="zen-text-sm">{local.label}</KCheckbox.Label> : null}
    </KCheckbox>
  );
};

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="100%" height="100%">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const DashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" width="100%" height="100%">
    <line x1="6" y1="12" x2="18" y2="12" />
  </svg>
);
