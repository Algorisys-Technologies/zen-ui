import { type JSX, splitProps, Show } from "solid-js";
import { Select as KSelect } from "@kobalte/core/select";
import { cn } from "../../../lib/cn";

/**
 * Select — Solid port built on Kobalte Select.
 *
 *   <Select
 *     options={[
 *       { value: "a", label: "Option A" },
 *       { value: "b", label: "Option B" },
 *     ]}
 *     value={v()}
 *     onChange={setV}
 *     placeholder="Pick one"
 *   />
 *
 * API delta from the React (Radix) binding: Kobalte Select is
 * data-driven — pass an `options` array instead of composing
 * <SelectItem> children manually. For the rare case where you need
 * the full compound API (groups, custom item rendering), Kobalte's
 * own Select.Item / Section primitives are re-exported as
 * SelectGroup, SelectItemPrimitive, etc. (advanced users).
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// `onChange` is omitted from the DOM attributes: our Select reports the new
// value string (or null) directly, which collides with the DOM's change event.
export type SelectProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  class?: string;
  /** Optional accessible label rendered above the trigger. */
  label?: string;
  /** Optional error message shown below the trigger. */
  errorMessage?: string;
};

export const Select = (props: SelectProps) => {
  const [local, rest] = splitProps(props, [
    "options",
    "value",
    "defaultValue",
    "onChange",
    "placeholder",
    "disabled",
    "required",
    "name",
    "class",
    "label",
    "errorMessage",
    "id",
  ]);

  return (
    <KSelect<SelectOption>
      {...rest}
      options={local.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      value={local.options.find((o) => o.value === local.value) ?? null}
      defaultValue={local.options.find((o) => o.value === local.defaultValue) ?? undefined}
      onChange={(opt) => local.onChange?.(opt?.value ?? null)}
      placeholder={local.placeholder}
      disabled={local.disabled}
      required={local.required}
      name={local.name}
      validationState={local.errorMessage ? "invalid" : "valid"}
      itemComponent={(itemProps) => (
        <KSelect.Item
          item={itemProps.item}
          class={cn(
            "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
            "data-[highlighted]:zen-bg-zen-muted",
            "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
          )}
        >
          <KSelect.ItemIndicator class="zen-absolute zen-start-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
            <CheckIcon />
          </KSelect.ItemIndicator>
          <KSelect.ItemLabel>{itemProps.item.rawValue.label}</KSelect.ItemLabel>
        </KSelect.Item>
      )}
      class={local.class}
    >
      <Show when={local.label}>
        <KSelect.Label class="zen-text-sm zen-font-medium zen-text-zen-foreground zen-block zen-mb-1">
          {local.label}
        </KSelect.Label>
      </Show>
      <KSelect.HiddenSelect />
      {/* The caller's `id` lands on the trigger (a labelable <button>), not the
          Kobalte root, so `<label for={id}>` associates and names the control. */}
      <KSelect.Trigger
        id={local.id}
        class={cn(
          "zen-flex zen-items-center zen-justify-between zen-gap-2 zen-h-10 zen-px-3 zen-w-full",
          "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-text-sm zen-text-zen-foreground",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "data-[disabled]:zen-cursor-not-allowed data-[disabled]:zen-opacity-50",
          "data-[invalid]:zen-border-zen-error",
        )}
      >
        <KSelect.Value<SelectOption> class="zen-truncate">
          {(state) => state.selectedOption()?.label ?? null}
        </KSelect.Value>
        <KSelect.Icon class="zen-text-zen-muted-fg">
          <ChevronDown />
        </KSelect.Icon>
      </KSelect.Trigger>
      <Show when={local.errorMessage}>
        <KSelect.ErrorMessage class="zen-text-xs zen-text-zen-error zen-mt-1">
          {local.errorMessage}
        </KSelect.ErrorMessage>
      </Show>
      <KSelect.Portal>
        <KSelect.Content
          class={cn(
            "zen-z-50 zen-min-w-32 zen-overflow-hidden",
            "zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
          )}
        >
          <KSelect.Listbox class="zen-overflow-y-auto zen-max-h-72" />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect>
  );
};

const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
