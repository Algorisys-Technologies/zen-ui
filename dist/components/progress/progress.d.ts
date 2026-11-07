import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
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
export type ProgressColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";
export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
    size?: ProgressSize;
    color?: ProgressColor;
}
declare const Progress: React.ForwardRefExoticComponent<ProgressProps & React.RefAttributes<HTMLDivElement>>;
export { Progress };
//# sourceMappingURL=progress.d.ts.map