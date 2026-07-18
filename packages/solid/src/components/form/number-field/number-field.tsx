import { type JSX, createMemo, createSignal, splitProps } from "solid-js";
import { cn } from "../../../lib/cn";

/**
 * NumberField — shadcn-style number input with optional stepper buttons.
 *
 *   <NumberField value={n()} onValueChange={setN} min={0} max={100} />
 *
 * Buttons clamp to min/max, disabled state propagates, native keyboard
 * arrows still work. Pass `step="any"` to disable stepper logic.
 */

export type NumberFieldProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "type" | "onChange" | "onInput"
> & {
  value?: number | null;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Called with the new numeric value (null when input is cleared). */
  onValueChange?: (value: number | null) => void;
};

export const NumberField = (props: NumberFieldProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "value",
    "defaultValue",
    "min",
    "max",
    "step",
    "onValueChange",
    "disabled",
  ]);
  const step = () => local.step ?? 1;
  const isControlled = () => local.value !== undefined;

  const [inner, setInner] = createSignal<number | null>(local.defaultValue ?? null);
  const current = createMemo<number | null>(() =>
    isControlled() ? (local.value as number | null) : inner(),
  );

  const update = (next: number | null) => {
    if (!isControlled()) setInner(next);
    local.onValueChange?.(next);
  };

  const clamp = (n: number) => {
    if (typeof local.min === "number" && n < local.min) return local.min;
    if (typeof local.max === "number" && n > local.max) return local.max;
    return n;
  };

  const dec = () => {
    const base = current() ?? local.min ?? 0;
    update(clamp(base - step()));
  };
  const inc = () => {
    const base = current() ?? local.min ?? 0;
    update(clamp(base + step()));
  };

  const atMin = () =>
    typeof local.min === "number" && current() !== null && (current() as number) <= local.min;
  const atMax = () =>
    typeof local.max === "number" && current() !== null && (current() as number) >= local.max;

  return (
    <div
      class={cn(
        "zen-inline-flex zen-h-10 zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-overflow-hidden",
        local.disabled && "zen-opacity-50 zen-cursor-not-allowed",
        local.class,
      )}
    >
      <button
        type="button"
        aria-label="Decrement"
        onClick={dec}
        disabled={local.disabled || atMin()}
        class={cn(
          "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
          "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
          "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
        )}
      >
        −
      </button>
      <input
        type="number"
        inputMode="decimal"
        value={current() ?? ""}
        min={local.min}
        max={local.max}
        step={step()}
        disabled={local.disabled}
        onInput={(e) => {
          const v = e.currentTarget.value;
          if (v === "") {
            update(null);
            return;
          }
          const n = Number(v);
          if (Number.isFinite(n)) update(clamp(n));
        }}
        class={cn(
          "zen-min-w-0 zen-flex-1 zen-text-center zen-text-sm zen-bg-transparent",
          "zen-border-x zen-border-zen-border",
          "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft",
          "disabled:zen-cursor-not-allowed",
          "zen-[appearance:textfield] [&::-webkit-inner-spin-button]:zen-appearance-none [&::-webkit-outer-spin-button]:zen-appearance-none",
        )}
        {...rest}
      />
      <button
        type="button"
        aria-label="Increment"
        onClick={inc}
        disabled={local.disabled || atMax()}
        class={cn(
          "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
          "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
          "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
        )}
      >
        +
      </button>
    </div>
  );
};
