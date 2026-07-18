import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/cn";

/**
 * Progress — built on @radix-ui/react-progress.
 *
 *   <Progress value={67} />              // determinate
 *   <Progress value={null} />            // indeterminate
 *
 * Radix supplies the correct ARIA (role="progressbar", aria-valuenow,
 * aria-valuemax) and a data-state attribute we can target for styling.
 */

export type ProgressSize = "sm" | "md" | "lg";
export type ProgressColor =
  | "primary"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  size?: ProgressSize;
  color?: ProgressColor;
}

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

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size = "md", color = "primary", ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    value={value}
    className={cn(
      "zen-relative zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
      TRACK_HEIGHT[size],
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "zen-h-full zen-w-full zen-flex-1 zen-transition-transform",
        FILL_BG[color],
      )}
      style={{
        transform: `translateX(-${100 - (value ?? 0)}%)`,
      }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
