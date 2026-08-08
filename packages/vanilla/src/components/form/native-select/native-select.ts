import { cn } from "../../../lib/cn";
import {
  applyProps,
  Disposer,
  type BaseProps,
  type ZenComponent,
} from "../../../lib/component";

/**
 * NativeSelect — a styled `<select>`. The vanilla port of the React reference.
 *
 *   const s = NativeSelect({
 *     name: "dept_id",
 *     value: deptId,
 *     options: [
 *       { value: "", label: "Choose a department" },
 *       ...departments.map((d) => ({ value: d.id, label: d.name })),
 *     ],
 *     onChange: (v) => setDept(v),
 *   });
 *
 * Options are DATA here rather than slotted <option> children, matching how
 * every data-driven family in this binding works — there is no context to wire
 * children through. See PORTING.md.
 *
 * Select (the listbox) is the component for options that need what the platform
 * control cannot draw. This is the platform control: it submits inside a plain
 * <form> with no hidden input and opens as the OS picker on a phone.
 */

export interface NativeSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NativeSelectProps extends BaseProps {
  options: NativeSelectOption[];
  /** Controlled. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
  required?: boolean;
}

export const NATIVE_SELECT_CLASS = [
  // Everything INPUT_CLASS has except the width: a text field filling its
  // container is right, a select changing width with its options is not.
  "zen-h-10 zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  // The platform arrow ignores the theme, so it is suppressed and redrawn as
  // a background image — one element, so the caller's layout classes land on
  // the control itself.
  "zen-appearance-none zen-pe-9",
].join(" ");

/** Inline so it needs no network request and no icon dependency. */
const CHEVRON_URL =
  "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'/%3e%3c/svg%3e\")";

export function NativeSelect(
  props: NativeSelectProps,
): ZenComponent<NativeSelectProps> {
  let current: NativeSelectProps = { ...props };
  const select = document.createElement("select");
  const el = select;
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  select.style.backgroundImage = CHEVRON_URL;
  select.style.backgroundRepeat = "no-repeat";
  select.style.backgroundPosition = "right 0.75rem center";
  select.style.backgroundSize = "1rem";

  const onChange = () => current.onChange?.(select.value);
  select.addEventListener("change", onChange);
  disposer.add(() => select.removeEventListener("change", onChange));

  const render = () => {
    const {
      class: className,
      options,
      value,
      defaultValue,
      onChange: _onChange,
      children: _children,
      ...rest
    } = current;

    select.className = cn(NATIVE_SELECT_CLASS, className);

    select.replaceChildren(
      ...options.map((o) => {
        const opt = document.createElement("option");
        opt.value = o.value;
        opt.textContent = o.label;
        if (o.disabled) opt.disabled = true;
        return opt;
      }),
    );

    // `value` is a PROPERTY. Setting it as an attribute would only seed the
    // default and then silently stop tracking — the same trap Input documents.
    const next = value ?? defaultValue;
    if (next !== undefined && select.value !== next) select.value = next;

    removeProps?.();
    removeProps = applyProps(select, rest as Record<string, unknown>);
  };

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
