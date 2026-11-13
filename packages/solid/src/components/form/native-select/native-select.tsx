import { type JSX, createEffect, onCleanup, onMount, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * NativeSelect — a styled `<select>`. Solid port of the React reference.
 *
 * Select (the listbox) is for options the platform control cannot draw.
 * This is the platform control: it submits inside a plain <form> with no
 * hidden input, and opens as the OS picker on a phone.
 *
 * One element, and no width of its own — the chevron is a background image
 * rather than an overlaid <svg>, so the caller's `class` lands on the control
 * and a select sizes to its widest option the way the platform intends.
 */

export type NativeSelectProps = Omit<
  JSX.SelectHTMLAttributes<HTMLSelectElement>,
  "class"
> & {
  class?: string;
};

const CHEVRON_URL =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")";

export const NativeSelect = (props: NativeSelectProps) => {
  const [local, rest] = splitProps(props, ["class", "style", "children", "value", "ref"]);
  /* `value` is applied here, not spread. Spread props land before the
     children are inserted, and a native <select> told to take a value it has
     no <option> for yet selects nothing — so a select whose options come from
     a <For> showed its FIRST option whatever the value. It is re-applied when
     the value changes and whenever the options do. */
  let el: HTMLSelectElement | undefined;
  const apply = () => {
    if (el && local.value !== undefined) el.value = String(local.value);
  };
  createEffect(apply);
  onMount(() => {
    if (!el) return;
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(el, { childList: true, subtree: true });
    onCleanup(() => mo.disconnect());
  });
  return (
    <select
      {...rest}
      ref={(node) => {
        el = node;
        const r = local.ref as unknown;
        if (typeof r === "function") (r as (n: HTMLSelectElement) => void)(node);
      }}
      class={cn(
        "zen-h-zen-control zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-zen-control-x zen-py-2 zen-text-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        "zen-appearance-none zen-pe-9",
        local.class,
      )}
      style={{
        "background-image": CHEVRON_URL,
        "background-repeat": "no-repeat",
        "background-position": "right 0.75rem center",
        "background-size": "1rem",
        ...(typeof local.style === "object" ? local.style : {}),
      }}
    >
      {local.children}
    </select>
  );
};
