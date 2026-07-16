import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";

/**
 * PasswordInput — a password field with a show/hide toggle. Vanilla port of the
 * React/Solid PasswordInput; same props, same behaviour.
 *
 *   const pw = PasswordInput({ placeholder: "Password", autocomplete: "current-password" });
 *   document.body.append(pw.el);
 *
 * The toggle is a real <button> (keyboard reachable, labelled, `aria-pressed`
 * reflecting state), and toggling never moves focus out of the field. `type` is
 * owned by the component — it flips between "password" and "text" — so it is not
 * a prop; every other input prop passes through.
 */

export interface PasswordInputProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  autocomplete?: string;
  class?: string;
  showLabel?: string;
  hideLabel?: string;
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

export type PasswordInputHandle = ZenComponent<PasswordInputProps, HTMLDivElement>;

const EYE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;

const FIELD_BASE =
  "zen-flex zen-h-10 zen-w-full zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-pl-3 zen-pr-10 zen-py-2 zen-text-sm placeholder:zen-text-zen-muted-fg focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2 disabled:zen-cursor-not-allowed disabled:zen-opacity-50";

export function PasswordInput(props: PasswordInputProps): PasswordInputHandle {
  let current: PasswordInputProps = { ...props };
  let visible = false;

  const el = document.createElement("div");
  el.className = "zen-relative zen-w-full";
  const input = document.createElement("input");
  const toggle = document.createElement("button");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  toggle.type = "button";
  toggle.className = cn(
    "zen-absolute zen-top-1/2 -zen-translate-y-1/2 zen-right-2",
    "zen-inline-flex zen-items-center zen-justify-center zen-h-6 zen-w-6 zen-rounded-zen-sm",
    "zen-text-zen-muted-fg hover:zen-text-zen-foreground",
    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
    "disabled:zen-cursor-not-allowed disabled:zen-opacity-50",
  );
  toggle.addEventListener("click", () => {
    visible = !visible;
    render();
    input.focus();
  });

  const render = () => {
    const { class: className, value, defaultValue, disabled, required, showLabel, hideLabel } = current;

    input.className = cn(FIELD_BASE, className);
    input.type = visible ? "text" : "password";

    if (value !== undefined && input.value !== value) input.value = value;
    else if (value === undefined && defaultValue !== undefined && input.value === "") input.value = defaultValue;

    input.disabled = Boolean(disabled);
    input.required = Boolean(required);

    toggle.disabled = Boolean(disabled);
    toggle.setAttribute("aria-label", visible ? hideLabel ?? "Hide password" : showLabel ?? "Show password");
    toggle.setAttribute("aria-pressed", String(visible));
    toggle.innerHTML = visible ? EYE_OFF : EYE;

    const {
      class: _c,
      value: _v,
      defaultValue: _dv,
      disabled: _d,
      required: _r,
      showLabel: _sl,
      hideLabel: _hl,
      ...rest
    } = current;
    removeProps?.();
    removeProps = applyProps(input, rest as Record<string, unknown>);
  };

  el.append(input, toggle);
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
