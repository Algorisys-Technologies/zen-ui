import * as React from "react";
import {
  colorLabel,
  contrastingInk,
  normalizeHex,
  toColorOption,
  type ColorOption,
} from "@algorisys/zen-ui-core/color";
import { cn } from "../../lib/cn";

/**
 * ColorPalette — a grid of predefined swatches.
 *
 *   <ColorPalette colors={["#3b82f6", "#ef4444"]} onValueChange={setBrand} />
 *   <ColorPalette colors={[{ value: "#3b82f6", label: "Ocean" }]} />
 *
 * Semantically a radiogroup, like Rating and Likert: "pick one of these" is
 * the same question whatever the options look like, so it gets the same
 * keyboard contract — arrows move, Home/End jump.
 *
 * Pass bare hex strings or {value,label}. A bare hex is announced AS its hex,
 * which is why `label` exists: "#3b82f6" tells a listener nothing.
 */

export interface ColorPaletteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  colors: (string | ColorOption)[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (hex: string) => void;
  /** The radiogroup's accessible name. */
  label?: string;
  /** Swatch size. Default "md". */
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
}

const SIZES = { sm: "zen-h-6 zen-w-6", md: "zen-h-8 zen-w-8", lg: "zen-h-10 zen-w-10" } as const;

export const ColorPalette = React.forwardRef<HTMLDivElement, ColorPaletteProps>(
  ({ colors, value: valueProp, defaultValue, onValueChange, label, size = "md", disabled, className, ...props }, ref) => {
    const options = colors.map(toColorOption);
    const [inner, setInner] = React.useState(() => normalizeHex(defaultValue ?? "") ?? "");
    const isControlled = valueProp !== undefined;
    // Normalised before comparing, or "#FFF" and "#ffffff" select two swatches.
    const value = isControlled ? (normalizeHex(valueProp) ?? "") : inner;

    const update = (hex: string) => {
      const next = normalizeHex(hex) ?? hex;
      if (!isControlled) setInner(next);
      onValueChange?.(next);
    };

    const index = options.findIndex((o) => normalizeHex(o.value) === value);

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const last = options.length - 1;
      const go = (i: number) => {
        e.preventDefault();
        update(options[Math.max(0, Math.min(last, i))].value);
      };
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(index < 0 ? 0 : index + 1);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(index < 0 ? 0 : index - 1);
      else if (e.key === "Home") go(0);
      else if (e.key === "End") go(last);
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        className={cn("zen-flex zen-flex-wrap zen-gap-1.5", disabled && "zen-opacity-50", className)}
        {...props}
      >
        {options.map((o, i) => {
          const hex = normalizeHex(o.value) ?? o.value;
          const selected = hex === value;
          return (
            <button
              key={`${hex}-${i}`}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={colorLabel(o)}
              title={colorLabel(o)}
              disabled={disabled}
              tabIndex={selected || (index < 0 && i === 0) ? 0 : -1}
              onClick={() => !disabled && update(o.value)}
              className={cn(
                "zen-inline-flex zen-items-center zen-justify-center zen-rounded-zen-sm",
                "zen-cursor-pointer zen-border zen-border-zen-border zen-p-0 zen-transition-transform",
                "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
                disabled && "zen-cursor-not-allowed",
                SIZES[size],
              )}
              // The swatch IS the colour, so it cannot come from a class — a
              // class per hex is a class UnoCSS never sees and never generates.
              style={{ backgroundColor: hex }}
            >
              {selected ? (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  // Black or white, whichever is readable ON this swatch. A
                  // fixed tick colour disappears at one end of every palette.
                  stroke={contrastingInk(hex)}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  },
);
ColorPalette.displayName = "ColorPalette";
