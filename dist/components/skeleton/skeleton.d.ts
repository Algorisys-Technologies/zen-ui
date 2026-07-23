import { type JSX } from "solid-js";
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
export declare const Skeleton: (props: SkeletonProps) => JSX.Element;
//# sourceMappingURL=skeleton.d.ts.map