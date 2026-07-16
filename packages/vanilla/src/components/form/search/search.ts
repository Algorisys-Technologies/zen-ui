import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";

/**
 * Search — a search input as a component, not a pattern reinvented per screen.
 * Vanilla port of the React/Solid Search; same props, same behaviour.
 *
 *   const s = Search({ placeholder: "Search components", onValueChange: (v) => … });
 *   document.body.append(s.el);
 *
 *   - type="search" so the platform exposes role="searchbox"; the native webkit
 *     clear affordance is hidden because we render our own, keyboard-reachable and
 *     labelled.
 *   - Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 *   - The clear button shows only when there is text, resets to "", fires
 *     `onClear`, and returns focus to the field.
 */

export type SearchSize = "sm" | "md" | "lg";

export interface SearchProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onClear?: () => void;
  size?: SearchSize;
  clearLabel?: string;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  class?: string;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

export type SearchHandle = ZenComponent<SearchProps, HTMLDivElement>;

const SIZES: Record<SearchSize, { field: string; pad: string; icon: string }> = {
  sm: { field: "zen-h-9 zen-text-sm", pad: "zen-pl-9 zen-pr-9", icon: "zen-left-2.5" },
  md: { field: "zen-h-10 zen-text-sm", pad: "zen-pl-10 zen-pr-10", icon: "zen-left-3" },
  lg: { field: "zen-h-11 zen-text-base", pad: "zen-pl-11 zen-pr-11", icon: "zen-left-3.5" },
};

const MAGNIFIER = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const CLEAR = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;

const FIELD_BASE =
  "zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-py-2 placeholder:zen-text-zen-muted-fg focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-cursor-not-allowed disabled:zen-opacity-50 [&::-webkit-search-cancel-button]:zen-appearance-none";

export function Search(props: SearchProps): SearchHandle {
  let current: SearchProps = { ...props };
  let internal = current.defaultValue ?? "";

  const isControlled = () => current.value !== undefined;
  const valueOf = () => (isControlled() ? (current.value as string) : internal);

  const el = document.createElement("div");
  const icon = document.createElement("span");
  const input = document.createElement("input");
  const clearBtn = document.createElement("button");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  icon.setAttribute("aria-hidden", "true");
  icon.innerHTML = MAGNIFIER;

  input.type = "search";

  clearBtn.type = "button";
  clearBtn.innerHTML = CLEAR;
  clearBtn.className = cn(
    "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-right-2.5",
    "zen-inline-flex zen-items-center zen-justify-center zen-h-5 zen-w-5 zen-rounded-zen-full",
    "zen-text-zen-muted-fg hover:zen-text-zen-foreground hover:zen-bg-zen-muted",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
  );

  const setValue = (next: string) => {
    if (!isControlled()) internal = next;
    current.onValueChange?.(next);
    render();
  };

  input.addEventListener("input", () => setValue(input.value));
  clearBtn.addEventListener("click", () => {
    setValue("");
    current.onClear?.();
    input.focus();
  });

  const render = () => {
    const { class: className, size, placeholder, disabled, name, id, clearLabel } = current;
    const s = SIZES[size ?? "md"];
    const v = valueOf();

    el.className = cn("zen-relative zen-w-full", className);
    icon.className = cn(
      "zen-pointer-events-none zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-text-zen-muted-fg",
      s.icon,
    );
    input.className = cn(FIELD_BASE, s.field, s.pad);

    if (input.value !== v) input.value = v;
    input.disabled = Boolean(disabled);
    if (placeholder !== undefined) input.placeholder = placeholder;
    if (name !== undefined) input.name = name;
    if (id !== undefined) input.id = id;

    clearBtn.setAttribute("aria-label", clearLabel ?? "Clear search");
    // Inline style, not the `hidden` attribute: `hidden` sets display:none via the
    // UA stylesheet, and the button's own `zen-inline-flex` class is an author rule
    // that beats it — so `hidden` would leave the × visible on an empty field.
    clearBtn.style.display = v.length > 0 && !disabled ? "" : "none";

    // Everything the factory interprets itself is peeled off; only genuine
    // passthrough (data-*, aria-*) reaches the input via applyProps.
    const {
      value: _v,
      defaultValue: _dv,
      onValueChange: _ovc,
      onClear: _oc,
      size: _sz,
      class: _cl,
      placeholder: _ph,
      disabled: _d,
      name: _n,
      id: _id,
      clearLabel: _clbl,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(input, rest as Record<string, unknown>);
  };

  el.append(icon, input, clearBtn);
  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
