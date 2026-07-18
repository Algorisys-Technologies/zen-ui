import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "../../../lib/cn";

/**
 * Slider — built on @radix-ui/react-slider. Supports single-thumb and
 * range (multi-thumb). Radix supplies keyboard control (Arrow keys,
 * PgUp/Dn, Home/End), ARIA, RTL, and form submission.
 *
 *   <Slider defaultValue={[50]} max={100} step={1} />
 *   <Slider defaultValue={[20, 80]} max={100} step={1} />
 *   <Slider defaultValue={[3]} max={5} marks={[{ value: 1, label: "Never" }, …]} />
 */

export interface SliderMark {
  value: number;
  /** Rendered under the tick. A tick with no label is just a tick. */
  label?: React.ReactNode;
}

export interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /**
   * Tick marks along the track, with optional labels.
   *
   * Marks are decoration over the scale, not the scale itself: `step` still
   * decides which values are reachable. Marks at values `step` cannot land on
   * would draw a tick the thumb can never sit on.
   *
   * Horizontal only. A vertical slider needs the ticks laid out down the
   * track, and nothing here needed that yet — rather than ship a broken
   * half, marks are ignored when orientation="vertical".
   */
  marks?: SliderMark[];
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, marks, ...props }, ref) => {
  // Determine the number of thumbs from either value or defaultValue.
  const thumbs = (props.value ?? props.defaultValue ?? [0]) as number[];

  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const showMarks = Boolean(marks?.length) && props.orientation !== "vertical";
  const hasLabels = Boolean(marks?.some((m) => m.label !== undefined));

  /** Where a mark sits along the track, 0–100. */
  const percent = (v: number) =>
    max === min ? 0 : Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100));

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "zen-relative zen-flex zen-w-full zen-touch-none zen-select-none zen-items-center",
        "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2 data-[orientation=vertical]:zen-flex-col",
        // The marks layer is absolutely positioned, so it reserves no height of
        // its own. Without this the labels sit on top of whatever follows.
        showMarks && (hasLabels ? "zen-mb-7" : "zen-mb-3"),
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "zen-relative zen-h-2 zen-w-full zen-grow zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
          "data-[orientation=vertical]:zen-h-full data-[orientation=vertical]:zen-w-2",
        )}
      >
        <SliderPrimitive.Range
          className={cn(
            "zen-absolute zen-h-full zen-bg-zen-primary",
            "data-[orientation=vertical]:zen-w-full",
          )}
        />
      </SliderPrimitive.Track>
      {thumbs.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            "zen-block zen-h-5 zen-w-5 zen-rounded-zen-full zen-border-2 zen-border-zen-primary zen-bg-zen-background",
            "zen-transition-colors",
            "focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring focus-visible:zen-ring-offset-2",
            "disabled:zen-pointer-events-none disabled:zen-opacity-50",
          )}
        />
      ))}
      {showMarks ? (
        // Outside the Track on purpose: the Track is overflow-hidden, so ticks
        // at the ends would be sliced in half by their own container.
        // pointer-events-none so a tick never eats a click meant for the track.
        <span
          aria-hidden
          className="zen-pointer-events-none zen-absolute zen-inset-x-0 zen-top-full zen-mt-1"
        >
          {marks!.map((m) => (
            <span
              key={m.value}
              className="zen-absolute zen-flex zen-flex-col zen-items-center zen-gap-1"
              // Computed, so inline: a class per percentage would be a class
              // UnoCSS never sees and never generates.
              style={{ left: `${percent(m.value)}%`, transform: "translateX(-50%)" }}
            >
              <span className="zen-h-1.5 zen-w-px zen-bg-zen-border" />
              {m.label !== undefined ? (
                <span className="zen-whitespace-nowrap zen-text-xs zen-text-zen-muted-fg">
                  {m.label}
                </span>
              ) : null}
            </span>
          ))}
        </span>
      ) : null}
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
