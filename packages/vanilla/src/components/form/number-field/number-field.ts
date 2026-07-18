import { cn } from "../../../lib/cn";
import { applyProps, Disposer, type ZenComponent } from "../../../lib/component";
import { controllable } from "../../../lib/state";

/**
 * NumberField — shadcn-style. A number <input> flanked by −/+ stepper buttons.
 *
 *   NumberField({ value: n, onValueChange: setN, min: 0, max: 100, step: 1 })
 *
 * There is no Radix/Kobalte NumberField (slated upstream, not shipped), so the
 * React reference hand-writes clamp + controlled state and so does this. The
 * buttons clamp to min/max and disable at the bounds; typing past a bound clamps
 * back; native keyboard arrows on the input still work. `disabled` propagates.
 *
 * The React reference forwards a ref to the <input>; here the handle's `el` is
 * the wrapper, and the caller already holds it, so there is nothing to forward.
 */
export interface NumberFieldProps {
  value?: number | null;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  class?: string;
  /** Called with the new numeric value (or null when the input is cleared). */
  onValueChange?: (value: number | null) => void;
  [key: `data-${string}`]: unknown;
  [key: `aria-${string}`]: unknown;
}

const WRAPPER_CLASS =
  "zen-inline-flex zen-h-10 zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-overflow-hidden";

const BUTTON_CLASS = [
  "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
  "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
  "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
].join(" ");

const INPUT_CLASS = [
  "zen-min-w-0 zen-flex-1 zen-text-center zen-text-sm zen-bg-transparent",
  "zen-border-x zen-border-zen-border",
  "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft",
  "disabled:zen-cursor-not-allowed",
  // hide native spinners
  "zen-[appearance:textfield] [&::-webkit-inner-spin-button]:zen-appearance-none [&::-webkit-outer-spin-button]:zen-appearance-none",
].join(" ");

export type NumberFieldHandle = ZenComponent<NumberFieldProps, HTMLDivElement>;

export function NumberField(props: NumberFieldProps): NumberFieldHandle {
  let current: NumberFieldProps = { ...props };
  const disposer = new Disposer();

  const state = controllable<number | null>({
    value: current.value,
    defaultValue: current.defaultValue ?? null,
    onChange: (v) => current.onValueChange?.(v),
  });

  const clamp = (n: number) => {
    const { min, max } = current;
    if (typeof min === "number" && n < min) return min;
    if (typeof max === "number" && n > max) return max;
    return n;
  };

  const el = document.createElement("div");

  const dec = document.createElement("button");
  dec.type = "button";
  dec.setAttribute("aria-label", "Decrement");
  dec.className = BUTTON_CLASS;
  dec.textContent = "−"; // U+2212 MINUS SIGN

  const input = document.createElement("input");
  input.type = "number";
  input.inputMode = "decimal";
  input.className = INPUT_CLASS;

  const inc = document.createElement("button");
  inc.type = "button";
  inc.setAttribute("aria-label", "Increment");
  inc.className = BUTTON_CLASS;
  inc.textContent = "+";

  el.append(dec, input, inc);

  const step = () => current.step ?? 1;

  const onDec = () => {
    const base = state.get() ?? current.min ?? 0;
    state.set(clamp(base - step()));
  };
  const onInc = () => {
    const base = state.get() ?? current.min ?? 0;
    state.set(clamp(base + step()));
  };
  const onInput = () => {
    const v = input.value;
    if (v === "") {
      state.set(null);
      return;
    }
    const n = Number(v);
    if (Number.isFinite(n)) state.set(clamp(n));
  };

  dec.addEventListener("click", onDec);
  inc.addEventListener("click", onInc);
  input.addEventListener("input", onInput);
  disposer.add(() => dec.removeEventListener("click", onDec));
  disposer.add(() => inc.removeEventListener("click", onInc));
  disposer.add(() => input.removeEventListener("input", onInput));

  let removeProps: (() => void) | undefined;

  const render = () => {
    const { class: className, min, max, disabled, placeholder, required, readOnly, name, id } = current;
    const value = state.get();

    el.className = cn(
      WRAPPER_CLASS,
      disabled && "zen-opacity-50 zen-cursor-not-allowed",
      className,
    );

    // `value` is a PROPERTY; setAttribute("value") only sets the default and
    // stops updating the field once the user types. Skip the write while the
    // field is focused mid-edit so the caret does not jump.
    const display = value === null ? "" : String(value);
    if (document.activeElement !== input && input.value !== display) input.value = display;
    else if (value === null && input.value !== "") input.value = "";

    if (typeof min === "number") input.min = String(min);
    else input.removeAttribute("min");
    if (typeof max === "number") input.max = String(max);
    else input.removeAttribute("max");
    input.step = String(step());

    const atMin = typeof min === "number" && value !== null && value <= min;
    const atMax = typeof max === "number" && value !== null && value >= max;
    input.disabled = Boolean(disabled);
    dec.disabled = Boolean(disabled) || atMin;
    inc.disabled = Boolean(disabled) || atMax;

    if (placeholder !== undefined) input.placeholder = placeholder;
    input.required = Boolean(required);
    input.readOnly = Boolean(readOnly);
    if (name !== undefined) input.name = name;
    else input.removeAttribute("name");
    if (id !== undefined) input.id = id;
    else input.removeAttribute("id");

    // Forward the leftover data-*/aria-* onto the wrapper.
    const rest: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(current)) {
      if (k.startsWith("data-") || k.startsWith("aria-")) rest[k] = v;
    }
    removeProps?.();
    removeProps = applyProps(el, rest);
  };

  render();
  disposer.add(state.subscribe(() => render()));
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      if ("value" in next) state.sync(next.value);
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
