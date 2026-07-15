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
 *
 * `allowHalf` keeps all of that and doubles the options: each star
 * grows a left and a right hit target, arrows step by 0.5, and the
 * radios announce "2.5 stars". The stars stay whole — it is the
 * options that halve, not the picture.
 */

export interface RatingProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Number of stars rendered. Default 5. */
  max?: number;
  /**
   * Allow half-star values (0.5, 1, 1.5 …). Each star becomes two
   * options rather than each half becoming a star.
   */
  allowHalf?: boolean;
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
      allowHalf,
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
    const step = allowHalf ? 0.5 : 1;

    const update = (next: number) => {
      const clamped = Math.max(0, Math.min(max, next));
      if (!isControlled) setInner(clamped);
      onValueChange?.(clamped);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        update(Math.min(max, value + step));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        update(Math.max(0, value - step));
      } else if (e.key === "Home") {
        e.preventDefault();
        update(step);
      } else if (e.key === "End") {
        e.preventDefault();
        update(max);
      }
    };

    const stars = Array.from({ length: max }, (_, i) => i + 1);
    /** The first option, which owns the tab stop when nothing is chosen yet. */
    const firstStep = step;

    /** 0, 0.5 or 1 — how much of star `n` is lit. */
    const fillOf = (n: number) => Math.max(0, Math.min(1, display - (n - 1)));

    const stepLabel = (s: number) => `${s} ${s === 1 ? "star" : "stars"}`;

    /**
     * One option: a transparent hit target laid over its half (or whole) star.
     *
     * A function returning JSX, NOT a nested component. As <StepButton/> this
     * is a fresh component type on every render, so React unmounts and remounts
     * the button whenever hover state changes — mousedown and mouseup then land
     * on different nodes and the click never fires. Half-star clicks silently
     * did nothing.
     */
    const stepButton = (s: number, half?: "left" | "right") => (
      <button
        key={`${s}-${half ?? "whole"}`}
        type="button"
        role="radio"
        aria-checked={value === s}
        aria-label={stepLabel(s)}
        disabled={disabled}
        tabIndex={value === s || (value === 0 && s === firstStep) ? 0 : -1}
        onClick={() => {
          if (!interactive) return;
          if (allowClear && value === s) update(0);
          else update(s);
        }}
        onMouseEnter={() => interactive && setHover(s)}
        onMouseLeave={() => interactive && setHover(0)}
        onFocus={() => interactive && setHover(0)}
        className={cn(
          "zen-absolute zen-inset-y-0 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0",
          "zen-rounded-zen-sm",
          "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
          (disabled || readOnly) && "zen-cursor-default",
          half === "left" && "zen-left-0 zen-w-1/2",
          half === "right" && "zen-right-0 zen-w-1/2",
          !half && "zen-inset-x-0",
        )}
      />
    );

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        onKeyDown={onKeyDown}
        className={cn(
          "zen-inline-flex zen-items-center",
          GAPS[size],
          disabled && "zen-opacity-50 zen-cursor-not-allowed",
          className,
        )}
      >
        {stars.map((n) => (
          // The star is drawn once and the options sit over it, rather than
          // each option drawing half a star: two clipped halves side by side
          // seam visibly down the middle of every star.
          <span key={n} className="zen-relative zen-inline-flex zen-p-0.5">
            <StarVisual size={SIZES[size]} fill={fillOf(n)} />
            {allowHalf ? (
              <>
                {stepButton(n - 0.5, "left")}
                {stepButton(n, "right")}
              </>
            ) : (
              stepButton(n)
            )}
          </span>
        ))}
        {showValue ? (
          <span
            className={cn(
              "zen-ml-1 zen-text-sm zen-font-medium zen-tabular-nums",
              value > 0 ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg",
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

/**
 * A star lit `fill` of the way across (0, 0.5 or 1). The lit copy is clipped
 * over the unlit one, so a half star is one star half-lit rather than two
 * half-stars butted together — those seam down the middle at every size.
 */
const StarVisual: React.FC<{ size: number; fill: number }> = ({ size, fill }) => (
  <span
    className="zen-relative zen-inline-block zen-shrink-0 zen-text-zen-border"
    style={{ width: size, height: size }}
  >
    <StarIcon size={size} filled={false} />
    {fill > 0 ? (
      <span
        className="zen-absolute zen-inset-y-0 zen-left-0 zen-overflow-hidden zen-text-zen-warning"
        style={{ width: `${fill * 100}%` }}
      >
        <StarIcon size={size} filled />
      </span>
    ) : null}
  </span>
);

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
