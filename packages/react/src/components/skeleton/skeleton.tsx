import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Skeleton — shadcn-style. No Radix primitive — just an animated muted
 * box you size with utility classes. Use one per visual block while the
 * real content loads.
 *
 *   <Skeleton className="h-4 w-32" />
 *   <Skeleton className="h-12 w-12 rounded-zen-full" />
 */

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("zen-animate-pulse zen-rounded-zen-md zen-bg-zen-muted", className)}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };
