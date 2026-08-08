import * as React from "react";
import { cn } from "../../../lib/cn";

/**
 * NativeSelect — a styled `<select>`.
 *
 *   <NativeSelect name="dept_id" defaultValue={deptId}>
 *     <option value="">Choose a department</option>
 *     {departments.map((d) => (
 *       <option key={d.id} value={d.id}>{d.name}</option>
 *     ))}
 *   </NativeSelect>
 *
 * This is NOT a lesser Select. The two answer different questions:
 *
 * - **Select** (Radix) is a listbox. Reach for it when the options need
 *   anything the platform control cannot draw — icons, two-line rows, groups
 *   with sticky headers, a search field — or when the open state has to be
 *   controlled.
 *
 * - **NativeSelect** is the platform control. It submits inside a plain
 *   `<form>` with no hidden input and no JavaScript, it opens as the OS picker
 *   on a phone, and it costs nothing to render in a long list.
 *
 * ## One element, and no width of its own
 *
 * The chevron is a background image rather than an overlaid `<svg>`, so this
 * renders exactly one element. An earlier version wrapped the select in a
 * positioned `div` to hold the icon, and that wrapper broke layout: a `<select>`
 * sizes to its widest option, a `div` does not, so every select in a flex row
 * either stretched or collapsed. With no wrapper the caller's `className`
 * lands on the control itself and sizing behaves exactly as the platform's.
 *
 * For the same reason there is no `w-full` here, unlike Input: a text field
 * filling its container is right, a select changing width when its options
 * change is not. Pass `className="w-full"` when you want it.
 *
 * Deliberately no `size` prop either: on a `<select>` that attribute is the
 * number of visible rows, and shadowing it would break a caller passing it.
 */

export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

/** Inline so it needs no network request and no icon dependency. */
const CHEVRON_URL =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")";

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, style, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        // Everything Input has except the width.
        "zen-h-10 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
        "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
        // The platform arrow is drawn in the OS's colours and ignores the
        // theme, so it is suppressed and redrawn as the background chevron.
        "zen-appearance-none zen-pe-9",
        className,
      )}
      style={{
        backgroundImage: CHEVRON_URL,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "1rem",
        ...style,
      }}
      {...props}
    />
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
