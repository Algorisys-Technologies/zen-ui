import { type JSX, splitProps } from "solid-js";
import { Switch as KSwitch } from "@kobalte/core/switch";
import { cn } from "../../../lib/cn";

/**
 * Switch — Solid port built on Kobalte's Switch primitive.
 *
 *   <Switch checked={value()} onChange={setValue} />
 *
 * Kobalte supplies controlled/uncontrolled state (`checked` /
 * `defaultChecked`), the `name` / `value` hidden input for native form
 * submission, keyboard (space), and ARIA (role="switch",
 * aria-checked). Theming via --zen-* tokens; size is a record-keyed
 * variant.
 */

export type SwitchSize = "sm" | "md" | "lg";

// `onChange` is omitted from the DOM attributes: our Switch reports the new
// checked boolean directly, which collides with the DOM's change event.
export type SwitchProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
  size?: SwitchSize;
  class?: string;
  /**
   * Forwarded to the underlying input so an external `<label for>` can toggle
   * it — React's Switch has always accepted this. BoundSwitch needs it to
   * render the settings-row layout with the label outside the control.
   */
  id?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  value?: string;
  /** Optional inline label rendered to the right of the switch. */
  label?: JSX.Element;
};

const TRACK_SIZES: Record<SwitchSize, string> = {
  sm: "zen-h-4 zen-w-7",
  md: "zen-h-5 zen-w-9",
  lg: "zen-h-6 zen-w-11",
};
const THUMB_SIZES: Record<SwitchSize, string> = {
  sm: "zen-h-3 zen-w-3 data-[checked]:zen-translate-x-3 zen-translate-x-0.5",
  md: "zen-h-4 zen-w-4 data-[checked]:zen-translate-x-4 zen-translate-x-0.5",
  lg: "zen-h-5 zen-w-5 data-[checked]:zen-translate-x-5 zen-translate-x-0.5",
};

export const Switch = (props: SwitchProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "id",
    "size",
    "checked",
    "defaultChecked",
    "onChange",
    "disabled",
    "required",
    "name",
    "value",
    "label",
  ]);
  const size = () => local.size ?? "md";
  return (
    // `id` is deliberately NOT forwarded here — it's routed to KSwitch.Input
    // below so `<label for>` targets the actual native input, not this
    // wrapping group div (Kobalte generates the Input's id from the root's,
    // which would produce a different string than what the caller passed).
    <KSwitch
      {...rest}
      checked={local.checked}
      defaultChecked={local.defaultChecked}
      onChange={local.onChange}
      disabled={local.disabled}
      required={local.required}
      name={local.name}
      value={local.value}
      class={cn("zen-inline-flex zen-items-center zen-gap-2", local.class)}
    >
      <KSwitch.Input id={local.id} />
      <KSwitch.Control
        class={cn(
          "zen-peer zen-inline-flex zen-shrink-0 zen-cursor-pointer zen-items-center zen-rounded-zen-full",
          "zen-transition-colors",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50",
          "data-[checked]:zen-bg-zen-primary zen-bg-zen-muted",
          TRACK_SIZES[size()],
        )}
      >
        <KSwitch.Thumb
          class={cn(
            "zen-block zen-rounded-zen-full zen-bg-zen-background zen-shadow-md zen-ring-0",
            "zen-transition-transform",
            THUMB_SIZES[size()],
          )}
        />
      </KSwitch.Control>
      {local.label ? <KSwitch.Label class="zen-text-sm">{local.label}</KSwitch.Label> : null}
    </KSwitch>
  );
};
