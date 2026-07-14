import { type JSX, splitProps, mergeProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Stack — a minimal flexbox layout primitive.
 *
 * A thin `div` that lays its children out in a row or column with
 * configurable alignment, wrapping, gap and padding. Useful as a generic
 * container / drop-target surface (e.g. in low-code builders) and for everyday
 * form/section layout without hand-writing flex utilities.
 *
 *   <Stack gap={16}>…</Stack>
 *   <Stack direction="row" align="center" justify="between">…</Stack>
 *
 * Solid port of the React binding's Stack. `ref` needs no forwarding here —
 * Solid passes it straight through the props spread onto the root <div>.
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

export type StackProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style"
> & {
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
  class?: string;
  style?: JSX.CSSProperties | string;
  children?: JSX.Element;
};

const len = (v: number | string | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === "number" ? `${v}px` : v;

export const Stack = (rawProps: StackProps) => {
  const props = mergeProps(
    { direction: "column" as const, wrap: false },
    rawProps,
  );
  const [local, rest] = splitProps(props, [
    "class",
    "direction",
    "align",
    "justify",
    "wrap",
    "gap",
    "padding",
    "style",
    "children",
  ]);

  // `gap`/`padding` are author-supplied lengths, so they can only be expressed
  // inline — no utility exists for an arbitrary runtime value. An author-passed
  // `style` still wins, matching React's `{ gap, padding, ...style }` order.
  const style = (): JSX.CSSProperties | string | undefined => {
    const base: JSX.CSSProperties = {};
    const gap = len(local.gap);
    const padding = len(local.padding);
    if (gap !== undefined) base.gap = gap;
    if (padding !== undefined) base.padding = padding;

    const own = local.style;
    if (typeof own === "string") {
      const head = Object.entries(base)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");
      return head ? `${head};${own}` : own;
    }
    if (own) return { ...base, ...own };
    return Object.keys(base).length > 0 ? base : undefined;
  };

  return (
    <div
      class={cn(
        "zen-flex",
        local.direction === "column" ? "zen-flex-col" : "zen-flex-row",
        local.wrap && "zen-flex-wrap",
        local.align && ALIGN[local.align],
        local.justify && JUSTIFY[local.justify],
        local.class,
      )}
      style={style()}
      {...rest}
    >
      {local.children}
    </div>
  );
};
