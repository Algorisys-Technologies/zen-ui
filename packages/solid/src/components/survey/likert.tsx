import { type JSX, createMemo, createSignal, For, Match, Show, Switch } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Likert — n-point agree/disagree scale. The third leg of the survey
 * triplet (Rating · NPS · Likert), used for attitudinal questions.
 *
 *   const [answer, setAnswer] = createSignal<string | undefined>();
 *   <Likert
 *     value={answer()}
 *     onValueChange={setAnswer}
 *     question="The onboarding was easy to follow."
 *   />
 *
 * Defaults to a 5-point Strongly disagree → Strongly agree scale.
 * Override `options` for variants (frequency, importance, etc.).
 *
 * Three layouts:
 *   - "segmented" (default) — horizontal connected pill strip.
 *   - "stacked"  — vertical list, radio button + label per row.
 *   - "scale"    — the mark above a radio dot, with optional captions
 *     anchoring the ends. The numeric and emoji shape.
 *
 * The scale length is `options`, never markup — see the React binding.
 *
 * Mirrors the React binding's API.
 */

export interface LikertOption {
  value: string;
  label: string;
  /** Short label used by segmented layout when full label is too long. */
  shortLabel?: string;
  /** Custom mark for the option — an emoji, icon or number. Replaces
   *  the option's visible text in any layout.
   *
   *  A thunk rather than a value: a JSX value prop would be evaluated
   *  eagerly at call time and lose reactivity. React mirrors the same
   *  shape with ReactNode.
   *
   *  The output is aria-hidden and `label` stays the accessible name:
   *  a screen reader announcing "slightly smiling face" instead of
   *  "Neutral" is not the answer the respondent gave. */
  renderOption?: () => JSX.Element;
}

const DEFAULT_OPTIONS: LikertOption[] = [
  { value: "strongly_disagree", label: "Strongly disagree", shortLabel: "SD" },
  { value: "disagree", label: "Disagree", shortLabel: "D" },
  { value: "neutral", label: "Neutral", shortLabel: "N" },
  { value: "agree", label: "Agree", shortLabel: "A" },
  { value: "strongly_agree", label: "Strongly agree", shortLabel: "SA" },
];

export interface LikertProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  question?: string;
  options?: LikertOption[];
  /** "segmented" (default) — connected pill strip, short labels.
   *  "stacked"  — vertical list, full radio + label per row.
   *  "scale"    — mark above a radio dot; numeric and emoji scales. */
  layout?: "segmented" | "stacked" | "scale";
  /** Caption anchoring the low end, e.g. "Strongly disagree". A bare
   *  numeric scale means nothing without its ends named. Rendered by
   *  layout="scale" only; a caption, not the accessible name — that
   *  still comes from `question`. */
  minLabel?: string;
  /** Caption anchoring the high end, e.g. "Strongly agree". */
  maxLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  class?: string;
  name?: string;
}

export const Likert = (props: LikertProps) => {
  const options = createMemo(() => props.options ?? DEFAULT_OPTIONS);
  const layout = createMemo(() => props.layout ?? "segmented");
  const isControlled = () => props.value !== undefined;
  const [inner, setInner] = createSignal<string | undefined>(props.defaultValue);
  const value = createMemo<string | undefined>(() =>
    isControlled() ? props.value : inner(),
  );
  const interactive = createMemo(() => !props.disabled && !props.readOnly);
  const currentIndex = createMemo(() =>
    options().findIndex((o) => o.value === value()),
  );

  const update = (next: string) => {
    if (!isControlled()) setInner(next);
    props.onValueChange?.(next);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!interactive()) return;
    const idx = currentIndex();
    if (idx < 0) return;
    const forward = layout() === "stacked" ? "ArrowDown" : "ArrowRight";
    const back = layout() === "stacked" ? "ArrowUp" : "ArrowLeft";
    const opts = options();
    if (e.key === forward) {
      e.preventDefault();
      const next = opts[Math.min(opts.length - 1, idx + 1)];
      update(next.value);
    } else if (e.key === back) {
      e.preventDefault();
      const next = opts[Math.max(0, idx - 1)];
      update(next.value);
    } else if (e.key === "Home") {
      e.preventDefault();
      update(opts[0].value);
    } else if (e.key === "End") {
      e.preventDefault();
      update(opts[opts.length - 1].value);
    }
  };

  return (
    <div
      class={cn(
        // Scale spreads its marks with justify-between, which needs free space
        // to distribute — a shrink-wrapped inline-flex root has none, and the
        // marks would bunch up where React's (block-level flex) spread. The
        // other layouts keep the inline-flex they already had.
        layout() === "scale" ? "zen-flex zen-max-w-full" : "zen-inline-flex",
        "zen-flex-col zen-gap-2",
        props.class,
      )}
    >
      <Show when={props.question}>
        <p class="zen-text-sm zen-font-medium zen-text-zen-foreground zen-m-0">{props.question}</p>
      </Show>
      <div
        role="radiogroup"
        aria-label={props.question}
        aria-disabled={props.disabled || undefined}
        aria-readonly={props.readOnly || undefined}
        onKeyDown={onKeyDown}
        class={cn(
          layout() === "segmented" &&
            "zen-inline-flex zen-items-stretch zen-rounded-zen-md zen-border zen-border-zen-border zen-overflow-hidden zen-bg-zen-background",
          layout() === "stacked" && "zen-flex zen-flex-col zen-gap-1",
          // No border or fill: the marks are the affordance, and the ends are
          // named by the captions underneath rather than by a frame.
          layout() === "scale" &&
            "zen-flex zen-max-w-full zen-items-end zen-justify-between zen-gap-1 zen-overflow-x-auto",
          props.disabled && "zen-opacity-50",
        )}
      >
        <For each={options()}>
          {(opt, i) => {
            const selected = createMemo(() => value() === opt.value);
            const isFirst = createMemo(() => i() === 0);
            const isLast = createMemo(() => i() === options().length - 1);

            return (
              // Segmented is the fallback, so it stays the default exactly as
              // it was when this was a two-way Show.
              <Switch
                fallback={
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected()}
                    aria-label={opt.label}
                    disabled={props.disabled}
                    tabIndex={
                      selected() || (currentIndex() < 0 && i() === 0) ? 0 : -1
                    }
                    onClick={() => interactive() && update(opt.value)}
                    title={opt.label}
                    class={cn(
                      "zen-flex-1 zen-min-w-[3.5rem] zen-px-3 zen-py-2",
                      "zen-inline-flex zen-items-center zen-justify-center",
                      "zen-text-xs zen-font-medium",
                      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
                      !isFirst() && "zen-border-l zen-border-zen-border",
                      "zen-text-zen-muted-fg",
                      interactive() && "hover:zen-bg-zen-muted hover:zen-text-zen-foreground",
                      selected() &&
                        "zen-bg-zen-primary zen-text-zen-primary-fg hover:zen-bg-zen-primary hover:zen-text-zen-primary-fg",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-inset",
                      (props.disabled || props.readOnly) && "zen-cursor-default",
                      isFirst() && "zen-rounded-l-zen-md",
                      isLast() && "zen-rounded-r-zen-md",
                    )}
                  >
                    <Show
                      when={opt.renderOption}
                      fallback={
                        <>
                          <span class="zen-hidden md:zen-inline">{opt.label}</span>
                          <span class="md:zen-hidden">{opt.shortLabel ?? opt.label}</span>
                        </>
                      }
                    >
                      {(render) => <span aria-hidden="true">{render()()}</span>}
                    </Show>
                  </button>
                }
              >
                <Match when={layout() === "scale"}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected()}
                    // The mark is decorative; the label is the answer.
                    aria-label={opt.label}
                    disabled={props.disabled}
                    tabIndex={
                      selected() || (currentIndex() < 0 && i() === 0) ? 0 : -1
                    }
                    onClick={() => interactive() && update(opt.value)}
                    title={opt.label}
                    class={cn(
                      "zen-flex zen-flex-1 zen-flex-col zen-items-center zen-gap-1.5",
                      "zen-min-w-[2.5rem] zen-px-1 zen-py-1.5 zen-rounded-zen-sm",
                      "zen-bg-transparent zen-border-0 zen-cursor-pointer zen-transition-colors",
                      interactive() && "hover:zen-bg-zen-muted",
                      "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                      (props.disabled || props.readOnly) && "zen-cursor-default",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      class={cn(
                        "zen-text-base zen-leading-none",
                        selected()
                          ? "zen-text-zen-foreground zen-font-semibold"
                          : "zen-text-zen-muted-fg",
                      )}
                    >
                      <Show when={opt.renderOption} fallback={opt.label}>
                        {(render) => render()()}
                      </Show>
                    </span>
                    <span
                      aria-hidden="true"
                      class={cn(
                        "zen-inline-flex zen-items-center zen-justify-center",
                        "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border",
                        selected()
                          ? "zen-border-zen-primary zen-bg-zen-primary"
                          : "zen-border-zen-border zen-bg-zen-background",
                      )}
                    >
                      <Show when={selected()}>
                        <span class="zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg" />
                      </Show>
                    </span>
                  </button>
                </Match>
                <Match when={layout() === "stacked"}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected()}
                  // Explicit rather than inherited from the text: a
                  // renderOption mark is aria-hidden, which would otherwise
                  // leave this radio with no accessible name at all.
                  aria-label={opt.label}
                  disabled={props.disabled}
                  tabIndex={
                    selected() || (currentIndex() < 0 && i() === 0) ? 0 : -1
                  }
                  onClick={() => interactive() && update(opt.value)}
                  class={cn(
                    "zen-flex zen-items-center zen-gap-2 zen-px-2 zen-py-1.5 zen-rounded-zen-sm",
                    "zen-bg-transparent zen-border-0 zen-text-start zen-text-sm zen-cursor-pointer",
                    "zen-transition-colors",
                    interactive() && "hover:zen-bg-zen-muted",
                    selected() && "zen-bg-zen-primary-soft zen-text-zen-primary-soft-fg",
                    "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
                    (props.disabled || props.readOnly) && "zen-cursor-default",
                  )}
                >
                  <span
                    aria-hidden="true"
                    class={cn(
                      "zen-inline-flex zen-items-center zen-justify-center",
                      "zen-h-4 zen-w-4 zen-rounded-zen-full zen-border",
                      selected()
                        ? "zen-border-zen-primary zen-bg-zen-primary"
                        : "zen-border-zen-border zen-bg-zen-background",
                    )}
                  >
                    <Show when={selected()}>
                      <span class="zen-h-1.5 zen-w-1.5 zen-rounded-zen-full zen-bg-zen-primary-fg" />
                    </Show>
                  </span>
                  <Show when={opt.renderOption} fallback={<span>{opt.label}</span>}>
                    {(render) => <span aria-hidden="true">{render()()}</span>}
                  </Show>
                </button>
                </Match>
              </Switch>
            );
          }}
        </For>
      </div>
      <Show when={layout() === "scale" && (props.minLabel || props.maxLabel)}>
        {/* Captions, not controls: they name the ends of the scale and are
            not themselves answerable. */}
        <div class="zen-flex zen-items-start zen-justify-between zen-gap-4 zen-text-xs zen-text-zen-muted-fg">
          <span>{props.minLabel}</span>
          <span class="zen-text-end">{props.maxLabel}</span>
        </div>
      </Show>
      <Show when={props.name && value() !== undefined}>
        <input type="hidden" name={props.name} value={value()} />
      </Show>
    </div>
  );
};
