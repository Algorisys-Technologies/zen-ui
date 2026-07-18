import { type JSX, createMemo, createSignal, For, Show } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Rating — N-star rating input (default 5). Used for feedback
 * collection: "Rate your experience".
 *
 *   const [stars, setStars] = createSignal(0);
 *   <Rating value={stars()} onValueChange={setStars} label="Rate the support agent" />
 *
 * Semantically a radiogroup so screen readers announce "1 of 5",
 * "2 of 5", etc. on arrow-key nav. Hover preview tints stars up to the
 * pointed-at index but doesn't commit until click. Click an
 * already-selected star to clear (disable via `allowClear={false}`).
 *
 * `allowHalf` keeps all of that and doubles the options: each star
 * grows a left and a right hit target, arrows step by 0.5, and the
 * radios announce "2.5 stars". The stars stay whole — it is the
 * options that halve, not the picture.
 *
 * Mirrors the React binding's API.
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
  /** Show "n / max" caption next to the stars. */
  showValue?: boolean;
  /** Star size. Default md (24px). */
  size?: "sm" | "md" | "lg";
  /** Click on the currently-selected star clears it. Default true. */
  allowClear?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  class?: string;
  /** Hidden input for native form submission. */
  name?: string;
}

const SIZES = { sm: 16, md: 24, lg: 32 } as const;
const GAPS = { sm: "gap-0.5", md: "gap-1", lg: "gap-1.5" } as const;

export const Rating = (props: RatingProps) => {
  const max = createMemo(() => props.max ?? 5);
  const size = createMemo(() => props.size ?? "md");
  const allowClear = createMemo(() => props.allowClear ?? true);
  const isControlled = () => props.value !== undefined;

  const [inner, setInner] = createSignal<number>(props.defaultValue ?? 0);
  const value = createMemo(() => (isControlled() ? (props.value as number) : inner()));
  const [hover, setHover] = createSignal<number>(0);

  const display = createMemo(() => hover() || value());
  const interactive = createMemo(() => !props.disabled && !props.readOnly);
  const step = createMemo(() => (props.allowHalf ? 0.5 : 1));

  const update = (next: number) => {
    const clamped = Math.max(0, Math.min(max(), next));
    if (!isControlled()) setInner(clamped);
    props.onValueChange?.(clamped);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!interactive()) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      update(Math.min(max(), value() + step()));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      update(Math.max(0, value() - step()));
    } else if (e.key === "Home") {
      e.preventDefault();
      update(step());
    } else if (e.key === "End") {
      e.preventDefault();
      update(max());
    }
  };

  const stars = createMemo(() => Array.from({ length: max() }, (_, i) => i + 1));

  /** 0, 0.5 or 1 — how much of star `n` is lit. */
  const fillOf = (n: number) => Math.max(0, Math.min(1, display() - (n - 1)));

  const stepLabel = (s: number) => `${s} ${s === 1 ? "star" : "stars"}`;

  /** One option: a transparent hit target laid over its half (or whole) star. */
  const StepButton = (p: { s: number; half?: "left" | "right" }) => (
    <button
      type="button"
      role="radio"
      aria-checked={value() === p.s}
      aria-label={stepLabel(p.s)}
      disabled={props.disabled}
      tabIndex={value() === p.s || (value() === 0 && p.s === step()) ? 0 : -1}
      onClick={() => {
        if (!interactive()) return;
        if (allowClear() && value() === p.s) update(0);
        else update(p.s);
      }}
      onMouseEnter={() => interactive() && setHover(p.s)}
      onMouseLeave={() => interactive() && setHover(0)}
      onFocus={() => interactive() && setHover(0)}
      class={cn(
        "zen-absolute zen-inset-y-0 zen-cursor-pointer zen-border-0 zen-bg-transparent zen-p-0",
        "zen-rounded-zen-sm",
        "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
        (props.disabled || props.readOnly) && "zen-cursor-default",
        p.half === "left" && "zen-left-0 zen-w-1/2",
        p.half === "right" && "zen-right-0 zen-w-1/2",
        !p.half && "zen-inset-x-0",
      )}
    />
  );

  return (
    <div
      role="radiogroup"
      aria-label={props.label}
      aria-disabled={props.disabled || undefined}
      aria-readonly={props.readOnly || undefined}
      onKeyDown={onKeyDown}
      class={cn(
        "zen-inline-flex zen-items-center",
        GAPS[size()],
        props.disabled && "zen-opacity-50 zen-cursor-not-allowed",
        props.class,
      )}
    >
      <For each={stars()}>
        {(n) => (
          // The star is drawn once and the options sit over it, rather than
          // each option drawing half a star: two clipped halves side by side
          // seam visibly down the middle of every star.
          <span class="zen-relative zen-inline-flex zen-p-0.5">
            <StarVisual size={SIZES[size()]} fill={fillOf(n)} />
            <Show when={props.allowHalf} fallback={<StepButton s={n} />}>
              <StepButton s={n - 0.5} half="left" />
              <StepButton s={n} half="right" />
            </Show>
          </span>
        )}
      </For>
      <Show when={props.showValue}>
        <span
          class={cn(
            "zen-ml-1 zen-text-sm zen-font-medium zen-tabular-nums",
            value() > 0 ? "zen-text-zen-foreground" : "zen-text-zen-muted-fg",
          )}
          aria-hidden="true"
        >
          {value() > 0 ? `${value()} / ${max()}` : "—"}
        </span>
      </Show>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={value()} />
      </Show>
    </div>
  );
};

/**
 * A star lit `fill` of the way across (0, 0.5 or 1). The lit copy is clipped
 * over the unlit one, so a half star is one star half-lit rather than two
 * half-stars butted together — those seam down the middle at every size.
 */
const StarVisual = (props: { size: number; fill: number }): JSX.Element => (
  <span
    class="zen-relative zen-inline-block zen-shrink-0 zen-text-zen-border"
    style={{ width: `${props.size}px`, height: `${props.size}px` }}
  >
    <StarIcon size={props.size} filled={false} />
    <Show when={props.fill > 0}>
      <span
        class="zen-absolute zen-inset-y-0 zen-left-0 zen-overflow-hidden zen-text-zen-warning"
        style={{ width: `${props.fill * 100}%` }}
      >
        <StarIcon size={props.size} filled />
      </span>
    </Show>
  </span>
);

const StarIcon = (props: { size: number; filled: boolean }): JSX.Element => (
  <svg
    width={props.size}
    height={props.size}
    viewBox="0 0 24 24"
    fill={props.filled ? "currentColor" : "none"}
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
