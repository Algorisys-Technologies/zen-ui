import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Rating — 5-star (or N-star) rating input. Use for feedback
 * collection: "Rate your experience", "How would you rate this
 * driver?", post-purchase review prompts.
 *
 *   const [stars, setStars] = useState(0);
 *   <Rating value={stars} onValueChange={setStars} label="Rate the support agent" />
 *
 * Semantically a radiogroup (per WAI-ARIA Authoring Practices §
 * "Rating") so screen readers announce "1 of 5", "2 of 5", etc. on
 * arrow-key nav. Hover preview tints stars up to the pointed-at index
 * but doesn't commit until click. Click an already-selected star to
 * clear the rating (skip via `allowClear={false}`).
 */

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars rendered. Default 5. */
  max?: number;
  /** Accessible name for the radiogroup. Required for a11y. */
  label?: string;
  /** Optional caption rendered next to the stars. */
  showValue?: boolean;
  /** Star size. Default md (24px). */
  size?: "sm" | "md" | "lg";
  /** Click on the currently-selected star clears it. Default true. */
  allowClear?: boolean;
  disabled?: boolean;
  /** Render without click handlers — display-only. */
  readOnly?: boolean;
  className?: string;
  /** Name attached to a hidden input so the rating participates in
   *  native form submission. */
  name?: string;
}

const SIZES = { sm: 16, md: 24, lg: 32 } as const;
const GAPS = { sm: "gap-0.5", md: "gap-1", lg: "gap-1.5" } as const;

export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      max = 5,
      label,
      showValue,
      size = "md",
      allowClear = true,
      disabled,
      readOnly,
      className,
      name,
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState<number>(defaultValue ?? 0);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : inner;
    const [hover, setHover] = React.useState<number>(0);

    const display = hover || value;
    const interactive = !disabled && !readOnly;

    const update = (next: number) => {
      const clamped = Math.max(0, Math.min(max, next));
      if (!isControlled) setInner(clamped);
      onValueChange?.(clamped);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        update(Math.min(max, value + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        update(Math.max(0, value - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        update(1);
      } else if (e.key === "End") {
        e.preventDefault();
        update(max);
      }
    };

    const stars = Array.from({ length: max }, (_, i) => i + 1);

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        onKeyDown={onKeyDown}
        className={cn(
          "inline-flex items-center",
          GAPS[size],
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {stars.map((n) => {
          const filled = n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              disabled={disabled}
              tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
              onClick={() => {
                if (!interactive) return;
                if (allowClear && value === n) update(0);
                else update(n);
              }}
              onMouseEnter={() => interactive && setHover(n)}
              onMouseLeave={() => interactive && setHover(0)}
              onFocus={() => interactive && setHover(0)}
              className={cn(
                "bg-transparent border-0 p-0.5 cursor-pointer",
                "rounded-zen-sm transition-colors",
                "text-zen-border",
                filled && "text-zen-warning",
                interactive && "hover:text-zen-warning",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zen-ring",
                (disabled || readOnly) && "cursor-default",
                disabled && "hover:text-zen-border",
              )}
            >
              <StarIcon size={SIZES[size]} filled={filled} />
            </button>
          );
        })}
        {showValue ? (
          <span
            className={cn(
              "ml-1 text-sm font-medium tabular-nums",
              value > 0 ? "text-zen-foreground" : "text-zen-muted-fg",
            )}
            aria-hidden
          >
            {value > 0 ? `${value} / ${max}` : "—"}
          </span>
        ) : null}
        {name ? (
          <input type="hidden" name={name} value={value} />
        ) : null}
      </div>
    );
  },
);
Rating.displayName = "Rating";

const StarIcon: React.FC<{ size: number; filled: boolean }> = ({
  size,
  filled,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
