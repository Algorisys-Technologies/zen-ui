import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
} from "solid-js";
import { Combobox as KCombobox } from "@kobalte/core/combobox";
import { cn } from "../../lib/cn";

/**
 * Combobox — searchable single-select built on Kobalte Combobox.
 *
 * Sync (in-memory):
 *
 *   <Combobox
 *     options={[{ value: "a", label: "Alpha" }, …]}
 *     value={picked()}
 *     onValueChange={setPicked}
 *   />
 *
 * Async (server-driven):
 *
 *   <Combobox
 *     value={picked()}
 *     onValueChange={setPicked}
 *     onSearch={async (q) => { const r = await fetch(...); return r.json(); }}
 *     debounceMs={250}
 *   />
 *
 * API delta from the React (cmdk) binding: filtering is provided by
 * Kobalte's built-in default text filter for sync mode, or by your
 * onSearch loader for async mode. The shape `{value, label, keywords}`
 * is the same.
 */

export interface ComboboxOption {
  value: string;
  label: string;
  keywords?: string[];
  disabled?: boolean;
}

export type ComboboxProps = {
  options?: ComboboxOption[];
  onSearch?: (query: string) => Promise<ComboboxOption[]>;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, option: ComboboxOption | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  debounceMs?: number;
  width?: number | string;
  disabled?: boolean;
  class?: string;
};

export const Combobox = (rawProps: ComboboxProps) => {
  const [props] = splitProps(rawProps, [
    "options",
    "onSearch",
    "value",
    "defaultValue",
    "onValueChange",
    "placeholder",
    "searchPlaceholder",
    "emptyMessage",
    "debounceMs",
    "width",
    "disabled",
    "class",
  ]);

  const isAsync = () => typeof props.onSearch === "function";
  const [asyncOptions, setAsyncOptions] = createSignal<ComboboxOption[]>([]);
  const [asyncLoading, setAsyncLoading] = createSignal(false);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let lastQueryToken = 0;

  const effectiveOptions = createMemo<ComboboxOption[]>(() => {
    if (isAsync()) return asyncOptions();
    return props.options ?? [];
  });

  const runSearch = (q: string) => {
    if (!props.onSearch) return;
    const token = ++lastQueryToken;
    setAsyncLoading(true);
    void props
      .onSearch(q)
      .then((res) => {
        if (token !== lastQueryToken) return;
        setAsyncOptions(res);
      })
      .finally(() => {
        if (token === lastQueryToken) setAsyncLoading(false);
      });
  };

  const onInputChange = (q: string) => {
    if (!isAsync()) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => runSearch(q), props.debounceMs ?? 250);
  };

  createEffect(() => {
    if (isAsync()) runSearch("");
  });

  const isControlled = () => props.value !== undefined;
  const [internalValue, setInternalValue] = createSignal<string>(
    props.defaultValue ?? "",
  );
  const selectedValue = createMemo<string>(() =>
    isControlled() ? (props.value as string) : internalValue(),
  );
  const selectedOption = createMemo<ComboboxOption | null>(() => {
    const v = selectedValue();
    return effectiveOptions().find((o) => o.value === v) ?? null;
  });

  return (
    <KCombobox<ComboboxOption>
      options={effectiveOptions()}
      optionValue="value"
      optionTextValue="label"
      optionLabel="label"
      optionDisabled="disabled"
      value={selectedOption()}
      onChange={(opt) => {
        const next = opt?.value ?? "";
        if (!isControlled()) setInternalValue(next);
        props.onValueChange?.(next, opt);
      }}
      onInputChange={onInputChange}
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
          "inline-flex items-center gap-2 h-10 px-3",
          "rounded-zen-md border border-zen-border bg-zen-background",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-zen-ring focus-within:ring-offset-2",
        )}
        style={{ width: typeof props.width === "number" ? `${props.width}px` : (props.width ?? "240px") }}
      >
        <KCombobox.Input
          class="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm placeholder:text-zen-muted-fg"
          placeholder={props.searchPlaceholder ?? "Search…"}
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
          <Show when={asyncLoading()}>
            <div class="py-1.5 px-2 text-sm text-zen-muted-fg">Loading…</div>
          </Show>
          <KCombobox.Listbox class="max-h-72 overflow-y-auto" />
          <Show when={effectiveOptions().length === 0 && !asyncLoading()}>
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
