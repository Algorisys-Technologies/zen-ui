import { type JSX } from "solid-js";
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
export type ProgressColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";
export type ProgressProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "class" | "children" | "aria-valuenow" | "aria-valuemax" | "aria-valuemin" | "aria-valuetext"> & {
    value?: number;
    minValue?: number;
    maxValue?: number;
    size?: ProgressSize;
    color?: ProgressColor;
    class?: string;
    /** When true, Kobalte renders an indeterminate progress bar. */
    indeterminate?: boolean;
};
export declare const Progress: (props: ProgressProps) => JSX.Element;
//# sourceMappingURL=progress.d.ts.map