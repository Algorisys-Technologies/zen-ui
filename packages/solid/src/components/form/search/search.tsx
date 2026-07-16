import { type JSX, splitProps, createSignal, Show } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * Search — a search input as a component, not a pattern reinvented per screen.
 * Solid port of the React binding's Search; same API, same behaviour.
 *
 *   <Search value={q()} onValueChange={setQ} placeholder="Search components" />
 *
 *   - `type="search"` so the platform exposes role="searchbox"; the native webkit
 *     clear affordance is hidden because we render our own, keyboard-reachable and
 *     labelled.
 *   - Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 *   - The clear button shows only when there is text, resets to "", fires
 *     `onClear`, and returns focus to the field.
 */

export type SearchSize = "sm" | "md" | "lg";

export interface SearchProps
  extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "onInput" | "size"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fired when the clear button empties the field. */
  onClear?: () => void;
  size?: SearchSize;
  /** Accessible label for the clear button. */
  clearLabel?: string;
}

const sizes: Record<SearchSize, { field: string; pad: string; icon: string }> = {
  sm: { field: "zen-h-9 zen-text-sm", pad: "zen-pl-9 zen-pr-9", icon: "zen-left-2.5" },
  md: { field: "zen-h-10 zen-text-sm", pad: "zen-pl-10 zen-pr-10", icon: "zen-left-3" },
  lg: { field: "zen-h-11 zen-text-base", pad: "zen-pl-11 zen-pr-11", icon: "zen-left-3.5" },
};

export const Search = (props: SearchProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "value",
    "defaultValue",
    "onValueChange",
    "onClear",
    "size",
    "clearLabel",
    "disabled",
  ]);

  let ref: HTMLInputElement | undefined;
  const [internal, setInternal] = createSignal(local.defaultValue ?? "");
  const isControlled = () => local.value !== undefined;
  const current = () => (isControlled() ? (local.value as string) : internal());

  const setValue = (next: string) => {
    if (!isControlled()) setInternal(next);
    local.onValueChange?.(next);
  };

  const clear = () => {
    setValue("");
    local.onClear?.();
    ref?.focus();
  };

  const s = () => sizes[local.size ?? "md"];

  return (
    <div class={cn("zen-relative zen-w-full", local.class)}>
      <span
        aria-hidden="true"
        class={cn(
          "zen-pointer-events-none zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
          s().icon,
        )}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>

      <input
        ref={ref}
        type="search"
        value={current()}
        disabled={local.disabled}
        onInput={(e) => setValue(e.currentTarget.value)}
        class={cn(
          "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-py-2",
          s().field,
          s().pad,
          "placeholder:zen-text-zen-muted-fg",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          "[&::-webkit-search-cancel-button]:zen-appearance-none",
        )}
        {...rest}
      />

      <Show when={current().length > 0 && !local.disabled}>
        <button
          type="button"
          aria-label={local.clearLabel ?? "Clear search"}
          onClick={clear}
          class={cn(
            "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-right-2.5",
            "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-full",
            "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          )}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </Show>
    </div>
  );
};
