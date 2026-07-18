import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * NPS — Net Promoter Score input. The canonical "How likely are you to
 * recommend us to a friend?" question rendered as an 0–10 strip with
 * promoter / detractor cues.
 *
 *   const [score, setScore] = useState<number | undefined>();
 *   <NPS value={score} onValueChange={setScore} />
 *
 * Score buckets follow the standard NPS definition:
 *   - 0–6 detractors  → tinted with destructive-soft
 *   - 7–8 passives    → tinted with warning-soft
 *   - 9–10 promoters  → tinted with success-soft
 *
 * The selected score gets the saturated equivalent of its bucket.
 * Below the strip, low/high anchor labels surface the meaning of the
 * extremes (override via `lowLabel` / `highLabel`).
 *
 * Semantically a radiogroup with one radio per integer — full
 * keyboard nav (arrows + Home/End) comes for free.
 */

export interface NPSProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Accessible name for the radiogroup. Default question copy. */
  label?: string;
  /** Anchor label under the leftmost button. Default "Not at all likely". */
  lowLabel?: string;
  /** Anchor label under the rightmost button. Default "Extremely likely". */
  highLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  /** Optional hidden input name for native form submission. */
  name?: string;
  /** Show the score-bucket caption ("You're a Promoter") under the
   *  selection. Default true. */
  showBucket?: boolean;
}

type Bucket = "detractor" | "passive" | "promoter";

const bucketOf = (n: number): Bucket =>
  n <= 6 ? "detractor" : n <= 8 ? "passive" : "promoter";

const bucketLabel: Record<Bucket, string> = {
  detractor: "Detractor",
  passive: "Passive",
  promoter: "Promoter",
};

export const NPS = React.forwardRef<HTMLDivElement, NPSProps>(
  (
    {
      value: valueProp,
      defaultValue,
      onValueChange,
      label = "How likely are you to recommend us?",
      lowLabel = "Not at all likely",
      highLabel = "Extremely likely",
      disabled,
      readOnly,
      className,
      name,
      showBucket = true,
    },
    ref,
  ) => {
    const [inner, setInner] = React.useState<number | undefined>(defaultValue);
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : inner;
    const interactive = !disabled && !readOnly;

    const update = (next: number) => {
      if (!isControlled) setInner(next);
      onValueChange?.(next);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (value === undefined) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        update(Math.min(10, value + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        update(Math.max(0, value - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        update(0);
      } else if (e.key === "End") {
        e.preventDefault();
        update(10);
      }
    };

    const scores = Array.from({ length: 11 }, (_, i) => i);

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label}
        aria-disabled={disabled || undefined}
        aria-readonly={readOnly || undefined}
        onKeyDown={onKeyDown}
        className={cn(
          // flex (not inline-flex) + max-w-full so it fits its container; the
          // 0–10 strip scrolls horizontally on narrow widths instead of clipping
          "zen-flex zen-flex-col zen-gap-2 zen-max-w-full",
          disabled && "zen-opacity-50",
          className,
        )}
      >
        <div className="zen-flex zen-items-center zen-gap-1 zen-overflow-x-auto">
          {scores.map((n) => {
            const selected = value === n;
            const bucket = bucketOf(n);
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`${n}${
                  n === 0 ? " — " + lowLabel : n === 10 ? " — " + highLabel : ""
                }`}
                disabled={disabled}
                tabIndex={selected || (value === undefined && n === 0) ? 0 : -1}
                onClick={() => interactive && update(n)}
                className={cn(
                  "zen-h-9 zen-min-w-9 zen-px-2",
                  "zen-inline-flex zen-items-center zen-justify-center",
                  "zen-text-sm zen-font-medium zen-tabular-nums",
                  "zen-rounded-zen-sm zen-border zen-cursor-pointer zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  /* unselected — soft bucket tint */
                  !selected && [
                    "zen-bg-zen-background",
                    bucket === "detractor" &&
                      "zen-border-zen-error-soft zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft",
                    bucket === "passive" &&
                      "zen-border-zen-warning-soft zen-text-zen-warning-soft-fg hover:zen-bg-zen-warning-soft",
                    bucket === "promoter" &&
                      "zen-border-zen-success-soft zen-text-zen-success-soft-fg hover:zen-bg-zen-success-soft",
                  ],
                  /* selected — saturated bucket fill */
                  selected && [
                    bucket === "detractor" &&
                      "zen-bg-zen-error zen-text-zen-error-fg zen-border-zen-error",
                    bucket === "passive" &&
                      "zen-bg-zen-warning zen-text-zen-warning-fg zen-border-zen-warning",
                    bucket === "promoter" &&
                      "zen-bg-zen-success zen-text-zen-success-fg zen-border-zen-success",
                  ],
                  (disabled || readOnly) && "zen-cursor-default",
                  disabled && "hover:!zen-bg-zen-background",
                )}
              >
                {n}
              </button>
            );
          })}
        </div>
        <div className="zen-flex zen-justify-between zen-text-xs zen-text-zen-muted-fg zen-px-1">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
        {showBucket && value !== undefined ? (
          <p
            className={cn(
              "zen-text-xs zen-mt-1 zen-m-0 zen-font-medium",
              bucketOf(value) === "detractor" && "zen-text-zen-error",
              bucketOf(value) === "passive" && "zen-text-zen-warning-soft-fg",
              bucketOf(value) === "promoter" && "zen-text-zen-success",
            )}
            aria-live="polite"
          >
            {value} · {bucketLabel[bucketOf(value)]}
          </p>
        ) : null}
        {name && value !== undefined ? (
          <input type="hidden" name={name} value={value} />
        ) : null}
      </div>
    );
  },
);
NPS.displayName = "NPS";
