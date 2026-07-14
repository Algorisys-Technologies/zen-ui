import { type JSX, createMemo, For, splitProps } from "solid-js";
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
 */

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
    "class",
  ]);
  const thumbs = createMemo(() => {
    const v = local.value ?? local.defaultValue ?? [0];
    return v.map((_, i) => i);
  });
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
    </KSlider>
  );
};
