import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Stack — a minimal flexbox layout primitive.
 *
 * A thin, ref-forwarding `div` that lays its children out in a row or column
 * with configurable alignment, wrapping, gap and padding. Useful as a generic
 * container / drop-target surface (e.g. in low-code builders) and for everyday
 * form/section layout without hand-writing flex utilities.
 *
 *   <Stack gap={16}>…</Stack>
 *   <Stack direction="row" align="center" justify="between">…</Stack>
 */

const ALIGN = {
  start: "zen-items-start",
  center: "zen-items-center",
  end: "zen-items-end",
  stretch: "zen-items-stretch",
} as const;

const JUSTIFY = {
  start: "zen-justify-start",
  center: "zen-justify-center",
  end: "zen-justify-end",
  between: "zen-justify-between",
} as const;

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** main-axis direction (default "column") */
  direction?: "row" | "column";
  /** cross-axis alignment */
  align?: keyof typeof ALIGN;
  /** main-axis distribution */
  justify?: keyof typeof JUSTIFY;
  /** allow children to wrap (rows) */
  wrap?: boolean;
  /** gap between children — number = px, or any CSS length */
  gap?: number | string;
  /** inner padding — number = px, or any CSS length */
  padding?: number | string;
}

const len = (v: number | string | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      className,
      direction = "column",
      align,
      justify,
      wrap = false,
      gap,
      padding,
      style,
      ...props
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "zen-flex",
        direction === "column" ? "zen-flex-col" : "zen-flex-row",
        wrap && "zen-flex-wrap",
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      style={{ gap: len(gap), padding: len(padding), ...style }}
      {...props}
    />
  ),
);
Stack.displayName = "Stack";

export { Stack };
