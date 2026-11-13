import * as React from "react";
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
declare const NativeSelect: React.ForwardRefExoticComponent<NativeSelectProps & React.RefAttributes<HTMLSelectElement>>;
export { NativeSelect };
//# sourceMappingURL=native-select.d.ts.map