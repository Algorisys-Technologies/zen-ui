import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";

/**
 * Input — a styled <input>.
 *
 *   Input({ type: "email", placeholder: "you@algorisys.com" })
 *
 * No built-in label / error / icon scaffolding — compose those at the call site.
 * The React reference forwards a ref so the caller can reach the node; here the
 * node IS the handle, so there is nothing to forward.
 */
export interface InputProps {
  type?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  inputMode?: string;
  autocomplete?: string;
  class?: string;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

export const INPUT_CLASS = [
  "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-px-3 zen-py-2 zen-text-sm",
  "placeholder:zen-text-zen-muted-fg",
  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
  "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  "file:zen-border-0 file:zen-bg-transparent file:zen-text-sm file:zen-font-medium",
].join(" ");

export type InputHandle = ZenComponent<InputProps, HTMLInputElement>;

export function Input(props: InputProps): InputHandle {
  let current: InputProps = { ...props };
  const el = document.createElement("input");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, value, defaultValue, disabled, readOnly, required, ...rest } = current;

    el.className = cn(INPUT_CLASS, className);

    // `value` is a PROPERTY, not an attribute. setAttribute("value") sets the
    // DEFAULT value: it updates the field only until the user types once, and
    // then silently stops doing anything — the classic "controlled input that
    // works until you touch it" bug.
    if (value !== undefined && el.value !== value) el.value = value;
    else if (value === undefined && defaultValue !== undefined && el.value === "") el.value = defaultValue;

    el.disabled = Boolean(disabled);
    el.readOnly = Boolean(readOnly);
    el.required = Boolean(required);

    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
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
