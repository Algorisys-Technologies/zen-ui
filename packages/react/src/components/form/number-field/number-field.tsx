import * as React from "react";
import { cn } from "../../../lib/cn";

/**
 * NumberField — shadcn-style. Number input with optional increment /
 * decrement stepper buttons. No Radix primitive needed — Radix has no
 * NumberField yet (slated, but not shipped).
 *
 *   <NumberField value={n} onValueChange={setN} min={0} max={100} step={1} />
 *
 * Forwards a ref to the underlying <input>. Buttons clamp to min/max,
 * disabled state propagates, keyboard arrows on the input still work
 * natively. Pass `step="any"` to disable stepper logic.
 */

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "type" | "onChange"> {
  value?: number | null;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  /** Called with the new numeric value (or null when input is cleared). */
  onValueChange?: (value: number | null) => void;
}

const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  (
    {
      className,
      value,
      defaultValue,
      min,
      max,
      step = 1,
      onValueChange,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = React.useState<number | null>(
      defaultValue ?? null,
    );
    const isControlled = value !== undefined;
    const current = isControlled ? (value as number | null) : internal;

    const update = (next: number | null) => {
      if (!isControlled) setInternal(next);
      onValueChange?.(next);
    };

    const clamp = (n: number) => {
      if (typeof min === "number" && n < min) return min;
      if (typeof max === "number" && n > max) return max;
      return n;
    };

    const dec = () => {
      const base = current ?? min ?? 0;
      update(clamp(base - step));
    };
    const inc = () => {
      const base = current ?? min ?? 0;
      update(clamp(base + step));
    };

    const atMin = typeof min === "number" && current !== null && current <= min;
    const atMax = typeof max === "number" && current !== null && current >= max;

    return (
      <div
        className={cn(
          "zen-inline-flex zen-h-10 zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-bg-zen-background zen-overflow-hidden",
          disabled && "zen-opacity-50 zen-cursor-not-allowed",
          className,
        )}
      >
        <button
          type="button"
          aria-label="Decrement"
          onClick={dec}
          disabled={disabled || atMin}
          className={cn(
            "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
            "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
            "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
          )}
        >
          −
        </button>
        <input
          ref={ref}
          type="number"
          inputMode="decimal"
          value={current ?? ""}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            if (v === "") {
              update(null);
              return;
            }
            const n = Number(v);
            if (Number.isFinite(n)) update(clamp(n));
          }}
          className={cn(
            "zen-min-w-0 zen-flex-1 zen-text-center zen-text-sm zen-bg-transparent",
            "zen-border-x zen-border-zen-border",
            "focus:zen-outline-none focus-visible:zen-bg-zen-primary-soft",
            "disabled:zen-cursor-not-allowed",
            // hide native spinners
            "zen-[appearance:textfield] [&::-webkit-inner-spin-button]:zen-appearance-none [&::-webkit-outer-spin-button]:zen-appearance-none",
          )}
          {...props}
        />
        <button
          type="button"
          aria-label="Increment"
          onClick={inc}
          disabled={disabled || atMax}
          className={cn(
            "zen-px-3 zen-text-base zen-text-zen-foreground zen-bg-transparent",
            "hover:zen-bg-zen-muted disabled:zen-opacity-50 disabled:zen-cursor-not-allowed",
            "focus-visible:zen-outline-none focus-visible:zen-bg-zen-muted",
          )}
        >
          +
        </button>
      </div>
    );
  },
);
NumberField.displayName = "NumberField";

export { NumberField };
