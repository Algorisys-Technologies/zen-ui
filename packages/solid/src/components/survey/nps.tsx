import { createMemo, createSignal, For, Show } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * NPS — Net Promoter Score input. The canonical 0–10 "would you
 * recommend us?" strip with promoter / detractor cues.
 *
 *   const [score, setScore] = createSignal<number | undefined>();
 *   <NPS value={score()} onValueChange={setScore} />
 *
 * Score buckets follow the standard NPS definition:
 *   - 0–6 detractors  → tinted with error-soft
 *   - 7–8 passives    → tinted with warning-soft
 *   - 9–10 promoters  → tinted with success-soft
 *
 * Semantically a radiogroup — keyboard nav (arrows + Home/End) for free.
 */

export interface NPSProps {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  lowLabel?: string;
  highLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  class?: string;
  name?: string;
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

export const NPS = (props: NPSProps) => {
  const isControlled = () => props.value !== undefined;
  const [inner, setInner] = createSignal<number | undefined>(props.defaultValue);
  const value = createMemo<number | undefined>(() =>
    isControlled() ? props.value : inner(),
  );
  const interactive = createMemo(() => !props.disabled && !props.readOnly);
  const showBucket = createMemo(() => props.showBucket ?? true);

  const update = (next: number) => {
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!interactive()) return;
    const v = value();
    if (v === undefined) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      update(Math.min(10, v + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      update(Math.max(0, v - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      update(0);
    } else if (e.key === "End") {
      e.preventDefault();
      update(10);
    }
  };

  const scores = Array.from({ length: 11 }, (_, i) => i);
  const lowLabel = () => props.lowLabel ?? "Not at all likely";
  const highLabel = () => props.highLabel ?? "Extremely likely";

  return (
    <div
      role="radiogroup"
      aria-label={props.label ?? "How likely are you to recommend us?"}
      aria-disabled={props.disabled || undefined}
      aria-readonly={props.readOnly || undefined}
      onKeyDown={onKeyDown}
      class={cn(
        "zen-inline-flex zen-flex-col zen-gap-2",
        props.disabled && "zen-opacity-50",
        props.class,
      )}
    >
      <div class="zen-flex zen-items-center zen-gap-1">
        <For each={scores}>
          {(n) => {
            const selected = createMemo(() => value() === n);
            const bucket = bucketOf(n);
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected()}
                aria-label={`${n}${
                  n === 0
                    ? " — " + lowLabel()
                    : n === 10
                      ? " — " + highLabel()
                      : ""
                }`}
                disabled={props.disabled}
                tabIndex={selected() || (value() === undefined && n === 0) ? 0 : -1}
                onClick={() => interactive() && update(n)}
                class={cn(
                  "zen-h-9 zen-min-w-9 zen-px-2",
                  "zen-inline-flex zen-items-center zen-justify-center",
                  "zen-text-sm zen-font-medium zen-tabular-nums",
                  "zen-rounded-zen-sm zen-border zen-cursor-pointer zen-transition-colors",
                  "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                  // unselected — soft bucket tint
                  !selected() && "zen-bg-zen-background",
                  !selected() &&
                    bucket === "detractor" &&
                    "zen-border-zen-error-soft zen-text-zen-error-soft-fg hover:zen-bg-zen-error-soft",
                  !selected() &&
                    bucket === "passive" &&
                    "zen-border-zen-warning-soft zen-text-zen-warning-soft-fg hover:zen-bg-zen-warning-soft",
                  !selected() &&
                    bucket === "promoter" &&
                    "zen-border-zen-success-soft zen-text-zen-success-soft-fg hover:zen-bg-zen-success-soft",
                  // selected — saturated bucket fill
                  selected() && bucket === "detractor" &&
                    "zen-bg-zen-error zen-text-zen-error-fg zen-border-zen-error",
                  selected() && bucket === "passive" &&
                    "zen-bg-zen-warning zen-text-zen-warning-fg zen-border-zen-warning",
                  selected() && bucket === "promoter" &&
                    "zen-bg-zen-success zen-text-zen-success-fg zen-border-zen-success",
                  (props.disabled || props.readOnly) && "zen-cursor-default",
                  props.disabled && "hover:!zen-bg-zen-background",
                )}
              >
                {n}
              </button>
            );
          }}
        </For>
      </div>
      <div class="zen-flex zen-justify-between zen-text-xs zen-text-zen-muted-fg zen-px-1">
        <span>{lowLabel()}</span>
        <span>{highLabel()}</span>
      </div>
      <Show when={showBucket() && value() !== undefined}>
        {(_) => {
          const v = value() as number;
          return (
            <p
              class={cn(
                "zen-text-xs zen-mt-1 zen-m-0 zen-font-medium",
                bucketOf(v) === "detractor" && "zen-text-zen-error",
                bucketOf(v) === "passive" && "zen-text-zen-warning-soft-fg",
                bucketOf(v) === "promoter" && "zen-text-zen-success",
              )}
              aria-live="polite"
            >
              {v} · {bucketLabel[bucketOf(v)]}
            </p>
          );
        }}
      </Show>
      <Show when={props.name && value() !== undefined}>
        <input type="hidden" name={props.name} value={value()} />
      </Show>
    </div>
  );
};
