import { type JSX, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Skeleton — shadcn-style placeholder. Just an animated muted box you
 * size with utility classes. One per visual block while real content
 * loads.
 *
 *   <Skeleton class="h-4 w-32" />
 *   <Skeleton class="h-12 w-12 rounded-zen-full" />
 */

export type SkeletonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class"> & {
  class?: string;
};

export const Skeleton = (props: SkeletonProps) => {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div class={cn("zen-animate-pulse zen-rounded-zen-md zen-bg-zen-muted", local.class)} {...rest} />
  );
};
