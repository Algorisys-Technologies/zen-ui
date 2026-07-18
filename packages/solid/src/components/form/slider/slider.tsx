import { type JSX, createMemo, For, Show, splitProps } from "solid-js";
import { Slider as KSlider } from "@kobalte/core/slider";
import { cn } from "../../../lib/cn";

/**
 * Slider — Solid port built on Kobalte Slider. Supports single-thumb
 * and range (multi-thumb).
 *
 *   <Slider defaultValue={[50]} maxValue={100} step={1} />
 *   <Slider defaultValue={[20, 80]} maxValue={100} step={1} />
 *
 * Kobalte supplies keyboard control (arrows, PgUp/Dn, Home/End), ARIA,
 * RTL and form submission (via name + value).
 *
 *   <Slider defaultValue={[3]} maxValue={5} marks={[{ value: 1, label: "Never" }, …]} />
 *
 * NOTE the bounds are `minValue`/`maxValue` here and `min`/`max` in the React
 * binding — Kobalte's vocabulary against Radix's. That divergence predates
 * `marks` and is not fixed by it.
 */

export interface SliderMark {
  value: number;
  /** Rendered under the tick. A tick with no label is just a tick. */
  label?: JSX.Element;
}

// `onChange` is omitted from the DOM attributes: our Slider reports the new
// number[] value directly, which collides with the DOM's change event.
export type SliderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "onChange"> & {
  value?: number[];
  defaultValue?: number[];
  onChange?: (value: number[]) => void;
  minValue?: number;
  maxValue?: number;
  step?: number;
  minStepsBetweenThumbs?: number;
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  name?: string;
  /**
   * Tick marks along the track, with optional labels.
   *
   * Marks are decoration over the scale, not the scale itself: `step` still
   * decides which values are reachable.
   *
   * Horizontal only — marks are ignored when orientation="vertical", rather
   * than shipping a broken half.
   */
  marks?: SliderMark[];
  class?: string;
};

export const Slider = (props: SliderProps) => {
  const [local, rest] = splitProps(props, [
    "value",
    "defaultValue",
    "onChange",
    "minValue",
    "maxValue",
    "step",
    "minStepsBetweenThumbs",
    "orientation",
    "disabled",
    "name",
    "marks",
    "class",
  ]);
  const thumbs = createMemo(() => {
    const v = local.value ?? local.defaultValue ?? [0];
    return v.map((_, i) => i);
  });

  const showMarks = createMemo(
    () => Boolean(local.marks?.length) && local.orientation !== "vertical",
  );
  const hasLabels = createMemo(() => Boolean(local.marks?.some((m) => m.label !== undefined)));

  /** Where a mark sits along the track, 0–100. */
  const percent = (v: number) => {
    const min = local.minValue ?? 0;
    const max = local.maxValue ?? 100;
    return max === min ? 0 : Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));
  };

  return (
    <KSlider
      {...rest}
      value={local.value}
      defaultValue={local.defaultValue}
      onChange={local.onChange}
      minValue={local.minValue}
      maxValue={local.maxValue}
      step={local.step}
      minStepsBetweenThumbs={local.minStepsBetweenThumbs}
      orientation={local.orientation}
      disabled={local.disabled}
      name={local.name}
      class={cn(
        "zen-relative zen-flex zen-w-full zen-touch-none zen-select-none zen-items-center",
        "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2 data-[orientation=vertical]:zen-flex-col",
        // The marks layer is absolutely positioned, so it reserves no height of
        // its own. Without this the labels sit on top of whatever follows.
        showMarks() && (hasLabels() ? "zen-mb-7" : "zen-mb-3"),
        local.class,
      )}
    >
      <KSlider.Track
        class={cn(
          "zen-relative zen-h-2 zen-w-full zen-grow zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
          "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2",
        )}
      >
        <KSlider.Fill
          class={cn(
            "zen-absolute zen-h-full zen-bg-zen-primary",
            "data-[orientation=vertical]:zen-w-full",
          )}
        />
      </KSlider.Track>
      <For each={thumbs()}>
        {() => (
          <KSlider.Thumb
            class={cn(
              "zen-block zen-h-5 zen-w-5 zen-rounded-zen-full zen-border-2 zen-border-zen-primary zen-bg-zen-background",
              "zen-transition-colors",
              "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
              "data-[disabled]:zen-pointer-events-none data-[disabled]:zen-opacity-50",
            )}
          >
            <KSlider.Input />
          </KSlider.Thumb>
        )}
      </For>
      <Show when={showMarks()}>
        {/* Outside the Track on purpose: the Track is overflow-hidden, so ticks
            at the ends would be sliced in half by their own container.
            pointer-events-none so a tick never eats a click meant for the track. */}
        <span
          aria-hidden="true"
          class="zen-pointer-events-none zen-absolute zen-inset-x-0 zen-top-full zen-mt-1"
        >
          <For each={local.marks}>
            {(m) => (
              <span
                class="zen-absolute zen-flex zen-flex-col zen-items-center zen-gap-1"
                // Computed, so inline: a class per percentage would be a class
                // UnoCSS never sees and never generates.
                style={{ left: `${percent(m.value)}%`, transform: "translateX(-50%)" }}
              >
                <span class="zen-h-1.5 zen-w-px zen-bg-zen-border" />
                <Show when={m.label !== undefined}>
                  <span class="zen-whitespace-nowrap zen-text-xs zen-text-zen-muted-fg">
                    {m.label}
                  </span>
                </Show>
              </span>
            )}
          </For>
        </span>
      </Show>
    </KSlider>
  );
};
