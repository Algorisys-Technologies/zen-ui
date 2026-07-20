import * as React from "react";
import { cn } from "../../../lib/cn";

/**
 * Search — a search input as a component, not a pattern reinvented per screen.
 *
 *   <Search value={q} onValueChange={setQ} placeholder="Search components" />
 *
 * zen-ui carried this exact affordance — magnifier, a field, a clear button —
 * inlined inside ShellBar, ValueHelp, SelectDialog, DataTable, the select list,
 * Combobox and MultiCombobox. Seven copies, each slightly different. This is the
 * one place it lives now.
 *
 *   - `type="search"` so the platform exposes role="searchbox" and Escape-to-clear
 *     where the OS does it; the native webkit clear affordance is hidden (below)
 *     because we render our own, which is keyboard-reachable and labelled.
 *   - Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 *   - The clear button shows only when there is text, resets to "", fires
 *     `onClear`, and returns focus to the field — a mouse clear should not drop
 *     you out of the input.
 */

export type SearchSize = "sm" | "md" | "lg";

export interface SearchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> {
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
  sm: { field: "zen-h-9 zen-text-sm", pad: "zen-ps-9 zen-pe-9", icon: "zen-left-2.5" },
  md: { field: "zen-h-10 zen-text-sm", pad: "zen-ps-10 zen-pe-10", icon: "zen-left-3" },
  lg: { field: "zen-h-11 zen-text-base", pad: "zen-ps-11 zen-pe-11", icon: "zen-left-3.5" },
};

const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    { className, value, defaultValue, onValueChange, onClear, size = "md", clearLabel = "Clear search", disabled, ...props },
    forwardedRef,
  ) => {
    const innerRef = React.useRef<HTMLInputElement>(null);
    React.useImperativeHandle(forwardedRef, () => innerRef.current as HTMLInputElement);

    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const current = isControlled ? value : internal;

    const setValue = (next: string) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const clear = () => {
      setValue("");
      onClear?.();
      innerRef.current?.focus();
    };

    const s = sizes[size];

    return (
      <div className={cn("zen-relative zen-w-full", className)}>
        <span
          aria-hidden
          className={cn(
            "zen-pointer-events-none zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
            s.icon,
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>

        <input
          ref={innerRef}
          type="search"
          value={current}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-py-2",
            s.field,
            s.pad,
            "placeholder:zen-text-zen-muted-fg",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
            // Hide the browser's own clear affordance — we render our own.
            "[&::-webkit-search-cancel-button]:zen-appearance-none",
          )}
          {...props}
        />

        {current.length > 0 && !disabled ? (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={clear}
            className={cn(
              "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-end-2.5",
              "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-full",
              "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    );
  },
);
Search.displayName = "Search";

export { Search };
