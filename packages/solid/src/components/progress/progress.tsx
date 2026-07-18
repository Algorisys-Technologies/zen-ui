import { type JSX, splitProps } from "solid-js";
import { Progress as KProgress } from "@kobalte/core/progress";
import { cn } from "../../lib/cn";

/**
 * Progress — Solid port built on Kobalte's Progress primitive.
 *
 *   <Progress value={67} />              // determinate
 *   <Progress />                         // indeterminate
 *
 * Kobalte supplies the correct ARIA (role="progressbar", aria-valuenow,
 * aria-valuemax) and a data-progress="indeterminate" attribute we can
 * target for styling.
 */

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressColor =
  | "primary"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

// Kobalte's Progress root renders a <div>. `children` is omitted (not
// re-added): this component always renders its own fixed Track/Fill and
// never forwards user children, so accepting the prop would silently drop
// whatever was passed instead of rendering it. The generic ARIA range
// attributes (`aria-valuenow`/`-max`/`-min`/`-text`) are also omitted:
// Kobalte computes and types them as `number` from value/minValue/maxValue,
// narrower than the generic `number | string` on JSX.HTMLAttributes.
export type ProgressProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  | "class"
  | "children"
  | "aria-valuenow"
  | "aria-valuemax"
  | "aria-valuemin"
  | "aria-valuetext"
> & {
  value?: number;
  minValue?: number;
  maxValue?: number;
  size?: ProgressSize;
  color?: ProgressColor;
  class?: string;
  /** When true, Kobalte renders an indeterminate progress bar. */
  indeterminate?: boolean;
};

const TRACK_HEIGHT: Record<ProgressSize, string> = {
  sm: "zen-h-1",
  md: "zen-h-2",
  lg: "zen-h-3",
};
const FILL_BG: Record<ProgressColor, string> = {
  primary: "zen-bg-zen-primary",
  neutral: "zen-bg-zen-neutral",
  info: "zen-bg-zen-info",
  success: "zen-bg-zen-success",
  warning: "zen-bg-zen-warning",
  error: "zen-bg-zen-error",
};

export const Progress = (props: ProgressProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "size",
    "color",
    "value",
    "minValue",
    "maxValue",
    "indeterminate",
  ]);
  return (
    <KProgress
      {...rest}
      value={local.value}
      minValue={local.minValue}
      maxValue={local.maxValue}
      indeterminate={local.indeterminate}
      class={cn(
        "zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
        TRACK_HEIGHT[local.size ?? "md"],
        local.class,
      )}
    >
      <KProgress.Track class="zen-h-full zen-w-full">
        <KProgress.Fill
          class={cn(
            "zen-h-full zen-w-[var(--kb-progress-fill-width)] zen-transition-[width]",
            FILL_BG[local.color ?? "primary"],
          )}
        />
      </KProgress.Track>
    </KProgress>
  );
};
