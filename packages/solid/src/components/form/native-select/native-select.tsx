import { type JSX, splitProps } from "solid-js";
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
  const [local, rest] = splitProps(props, ["class", "style", "children"]);
  return (
    <select
      {...rest}
      class={cn(
        "zen-h-10 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
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
