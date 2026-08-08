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
 *   on a phone — a wheel on iOS, a bottom sheet on Android — and it costs
 *   nothing to render in a long list. For a form field whose options are plain
 *   text, that is the better control, and until now zen had no styled version
 *   of it, so apps either shipped an unstyled browser widget next to styled
 *   Inputs or paid the listbox tax for a plain dropdown.
 *
 * Deliberately no `size` prop: on a `<select>` that attribute is the number of
 * visible rows, and shadowing it to mean height would break the one thing a
 * caller may already be passing.
 */

export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="zen-relative zen-w-full">
      <select
        ref={ref}
        className={cn(
          // Matches Input exactly, so the two line up in a form.
          "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
          "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
          // The platform arrow is drawn in the OS's own colours and ignores the
          // theme, so it is replaced by the chevron below.
          "zen-appearance-none zen-pe-9",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {/* Decorative: the select itself is the control and already announces
          itself, so the chevron must not be reachable or described. */}
      <svg
        aria-hidden="true"
        className="zen-pointer-events-none zen-absolute zen-end-3 zen-top-1/2 zen--translate-y-1/2 zen-text-zen-muted-fg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  ),
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
