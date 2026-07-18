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
  /**
   * Offer to create the typed text when it matches no option's label.
   * Needs `onCreate` to do anything.
   */
  creatable?: boolean;
  /**
   * Called with the typed text when the create row is chosen. Adding the
   * option to your list is always yours — the component cannot know where the
   * list lives or what a new `value` should be.
   *
   * RETURN the new option and it is selected for you. Return nothing and the
   * value is left alone, so a caller who wants to select it later (after a
   * round trip to a server, say) stays in control. Both are supported on
   * purpose; returning is just the short path.
   */
  onCreate?: (label: string) => ComboboxOption | void;
  /** Verb on the create row — `Create "foo"`. Default "Create". */
  createLabel?: string;
  width?: number | string;
  disabled?: boolean;
  class?: string;
};

/**
 * Kobalte builds the listbox from `options`, so the create row is a synthetic
 * OPTION rather than a button under the list — that keeps it arrow-navigable
 * and selectable with Enter like every other row. React reaches the same place
 * through a cmdk item; the mechanism differs, the behaviour does not.
 */
const CREATE_SENTINEL = "__zen_create__";

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
    "creatable",
    "onCreate",
    "createLabel",
    "width",
    "disabled",
    "class",
  ]);

  const isAsync = () => typeof props.onSearch === "function";
  const [asyncOptions, setAsyncOptions] = createSignal<ComboboxOption[]>([]);
  const [asyncLoading, setAsyncLoading] = createSignal(false);
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let lastQueryToken = 0;

  const [query, setQuery] = createSignal("");

  const baseOptions = createMemo<ComboboxOption[]>(() => {
    if (isAsync()) return asyncOptions();
    return props.options ?? [];
  });

  // Compared against the LABEL, not the value: the user is typing what they
  // read, and "already exists" has to mean the same thing to them as to us.
  const typed = () => query().trim();
  const showCreate = createMemo(
    () =>
      Boolean(props.creatable && props.onCreate) &&
      typed().length > 0 &&
      !baseOptions().some((o) => o.label.trim().toLowerCase() === typed().toLowerCase()),
  );

  const effectiveOptions = createMemo<ComboboxOption[]>(() =>
    showCreate()
      ? [
          ...baseOptions(),
          {
            value: CREATE_SENTINEL,
            label: `${props.createLabel ?? "Create"} “${typed()}”`,
          },
        ]
      : baseOptions(),
  );

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
    // Tracked in both modes now: `creatable` needs the typed text to know
    // whether to offer it, and that is not an async-only concern.
    setQuery(q);
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
        // The create row is not a selection: hand the text back and leave the
        // value alone, or the sentinel becomes the answer.
        if (opt?.value === CREATE_SENTINEL) {
          const created = props.onCreate?.(typed());
          setQuery("");
          if (created) {
            if (!isControlled()) setInternalValue(created.value);
            props.onValueChange?.(created.value, created);
          }
          return;
        }
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
            "zen-relative zen-flex zen-cursor-default zen-select-none zen-items-center zen-rounded-zen-sm zen-py-1.5 zen-pl-8 zen-pr-2 zen-text-sm zen-outline-none",
            "data-[highlighted]:zen-bg-zen-muted",
            "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
          )}
        >
          <KCombobox.ItemIndicator class="zen-absolute zen-left-2 zen-flex zen-h-3.5 zen-w-3.5 zen-items-center zen-justify-center">
            <CheckIcon />
          </KCombobox.ItemIndicator>
          <KCombobox.ItemLabel>{itemProps.item.rawValue.label}</KCombobox.ItemLabel>
        </KCombobox.Item>
      )}
      class={props.class}
    >
      <KCombobox.Control<ComboboxOption>
        class={cn(
          "zen-inline-flex zen-items-center zen-gap-2 zen-h-10 zen-px-3",
          "zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background",
          "focus-within:zen-outline-none focus-within:zen-ring-2 focus-within:zen-ring-zen-ring focus-within:zen-ring-offset-2",
        )}
        style={{ width: typeof props.width === "number" ? `${props.width}px` : (props.width ?? "240px") }}
      >
        <KCombobox.Input
          class="zen-flex-1 zen-min-w-0 zen-bg-transparent zen-border-0 zen-outline-none zen-text-sm placeholder:zen-text-zen-muted-fg"
          placeholder={props.searchPlaceholder ?? "Search…"}
        />
        <KCombobox.Trigger class="zen-bg-transparent zen-border-0 zen-cursor-pointer zen-text-zen-muted-fg">
          <KCombobox.Icon>
            <ChevronDown />
          </KCombobox.Icon>
        </KCombobox.Trigger>
      </KCombobox.Control>
      <KCombobox.Portal>
        <KCombobox.Content
          class={cn(
            "zen-z-50 zen-min-w-44 zen-overflow-hidden zen-rounded-zen-md zen-border zen-bg-zen-background zen-p-1 zen-text-zen-foreground zen-shadow-md",
          )}
        >
          <Show when={asyncLoading()}>
            <div class="zen-py-1.5 zen-px-2 zen-text-sm zen-text-zen-muted-fg">Loading…</div>
          </Show>
          <KCombobox.Listbox class="zen-max-h-72 zen-overflow-y-auto" />
          <Show when={effectiveOptions().length === 0 && !asyncLoading()}>
            <div class="zen-py-1.5 zen-px-2 zen-text-sm zen-text-zen-muted-fg">
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
