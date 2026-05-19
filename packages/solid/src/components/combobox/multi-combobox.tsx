import { For, Show, createMemo, createSignal, splitProps } from "solid-js";
import { Combobox as KCombobox } from "@kobalte/core/combobox";
import { cn } from "../../lib/cn";
import type { ComboboxOption } from "./combobox";

/**
 * MultiCombobox — searchable multi-select built on Kobalte Combobox
 * with `multiple`. Selected values render as removable chips inside the
 * trigger.
 *
 *   const [picks, setPicks] = createSignal<string[]>([]);
 *   <MultiCombobox
 *     options={…}
 *     value={picks()}
 *     onValueChange={setPicks}
 *     placeholder="Pick some"
 *   />
 */

export type MultiComboboxProps = {
  options?: ComboboxOption[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  width?: number | string;
  disabled?: boolean;
  class?: string;
};

export const MultiCombobox = (rawProps: MultiComboboxProps) => {
  const [props] = splitProps(rawProps, [
    "options",
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "searchPlaceholder",
    "emptyMessage",
    "width",
    "disabled",
    "class",
  ]);

  const isControlled = () => props.value !== undefined;
  const [internalValues, setInternalValues] = createSignal<string[]>(
    props.defaultValue ?? [],
  );
  const selectedValues = createMemo<string[]>(() =>
    isControlled() ? (props.value as string[]) : internalValues(),
  );
  const selectedOptions = createMemo<ComboboxOption[]>(() => {
    const set = new Set(selectedValues());
    return (props.options ?? []).filter((o) => set.has(o.value));
  });

  const setValues = (next: string[]) => {
    if (!isControlled()) setInternalValues(next);
    props.onValueChange?.(next);
  };

  const remove = (v: string) => setValues(selectedValues().filter((x) => x !== v));

  return (
    <KCombobox<ComboboxOption, ComboboxOption>
      multiple
      options={props.options ?? []}
      optionValue="value"
      optionTextValue="label"
      optionLabel="label"
      optionDisabled="disabled"
      value={selectedOptions()}
      onChange={(opts) => setValues((opts ?? []).map((o) => o.value))}
      disabled={props.disabled}
      placeholder={props.placeholder ?? "Select…"}
      itemComponent={(itemProps) => (
        <KCombobox.Item
          item={itemProps.item}
          class={cn(
            "relative flex cursor-default select-none items-center rounded-zen-sm py-1.5 pl-8 pr-2 text-sm outline-none",
            "data-[highlighted]:bg-zen-muted",
            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          )}
        >
          <KCombobox.ItemIndicator class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <CheckIcon />
          </KCombobox.ItemIndicator>
          <KCombobox.ItemLabel>{itemProps.item.rawValue.label}</KCombobox.ItemLabel>
        </KCombobox.Item>
      )}
      class={props.class}
    >
      <KCombobox.Control<ComboboxOption>
        class={cn(
          "inline-flex flex-wrap items-center gap-1 min-h-10 px-2 py-1",
          "rounded-zen-md border border-zen-border bg-zen-background",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-zen-ring focus-within:ring-offset-2",
        )}
        style={{ width: typeof props.width === "number" ? `${props.width}px` : (props.width ?? "320px") }}
      >
        <For each={selectedOptions()}>
          {(opt) => (
            <span
              class={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium",
                "rounded-zen-full bg-zen-primary-soft text-zen-primary-soft-fg",
              )}
            >
              <span>{opt.label}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(opt.value);
                }}
                aria-label={`Remove ${opt.label}`}
                class="inline-flex items-center justify-center h-4 w-4 rounded-zen-full bg-transparent border-0 cursor-pointer opacity-70 hover:opacity-100"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          )}
        </For>
        <KCombobox.Input
          class="flex-1 min-w-[6rem] bg-transparent border-0 outline-none text-sm placeholder:text-zen-muted-fg"
          placeholder={
            selectedValues().length === 0
              ? (props.searchPlaceholder ?? "Search…")
              : ""
          }
        />
        <KCombobox.Trigger class="bg-transparent border-0 cursor-pointer text-zen-muted-fg">
          <KCombobox.Icon>
            <ChevronDown />
          </KCombobox.Icon>
        </KCombobox.Trigger>
      </KCombobox.Control>
      <KCombobox.Portal>
        <KCombobox.Content
          class={cn(
            "z-50 min-w-44 overflow-hidden rounded-zen-md border bg-zen-background p-1 text-zen-foreground shadow-md",
          )}
        >
          <KCombobox.Listbox class="max-h-72 overflow-y-auto" />
          <Show when={(props.options ?? []).length === 0}>
            <div class="py-1.5 px-2 text-sm text-zen-muted-fg">
              {props.emptyMessage ?? "No results."}
            </div>
          </Show>
        </KCombobox.Content>
      </KCombobox.Portal>
    </KCombobox>
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
