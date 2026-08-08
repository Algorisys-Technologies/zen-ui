import { type JSX, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * NativeSelect — a styled `<select>`. Solid port of the React reference.
 *
 *   <NativeSelect name="dept_id" value={deptId} onChange={…}>
 *     <option value="">Choose a department</option>
 *     <For each={departments}>{(d) => <option value={d.id}>{d.name}</option>}</For>
 *   </NativeSelect>
 *
 * This is NOT a lesser Select. Select is a listbox — reach for it when the
 * options need what the platform control cannot draw (icons, two-line rows,
 * a search field) or when the open state must be controlled. NativeSelect is
 * the platform control: it submits inside a plain <form> with no hidden input
 * and no JavaScript, and it opens as the OS picker on a phone.
 *
 * Deliberately no `size` prop: on a `<select>` that attribute is the number of
 * visible rows, and shadowing it would break a caller already passing it.
 */

export type NativeSelectProps = Omit<
  JSX.SelectHTMLAttributes<HTMLSelectElement>,
  "class"
> & {
  class?: string;
};

export const NativeSelect = (props: NativeSelectProps) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div class="zen-relative zen-w-full">
      <select
        {...rest}
        class={cn(
          // Matches Input exactly, so the two line up in a form.
          "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          // The platform arrow ignores the theme, so it is replaced below.
          "zen-appearance-none zen-pe-9",
          local.class,
        )}
      >
        {local.children}
      </select>
      {/* Decorative: the select already announces itself. */}
      <svg
        aria-hidden="true"
        class="zen-pointer-events-none zen-absolute zen-end-3 zen-top-1/2 zen--translate-y-1/2 zen-text-zen-muted-fg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
};
