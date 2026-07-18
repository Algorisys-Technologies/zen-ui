import { type JSX, Show, splitProps } from "solid-js";
import { cn } from "../../lib/cn";

/**
 * Page and Bar — Solid binding. Mirrors packages/react/src/components/page/:
 * same props, same class strings. See that file for the rationale.
 */

/* -------------------------------- Page --------------------------------- */

export type PageProps = JSX.HTMLAttributes<HTMLDivElement> & {
  header?: JSX.Element;
  footer?: JSX.Element;
  /** Removes the content padding — for a full-bleed table or map. */
  flush?: boolean;
};

export const Page = (props: PageProps) => {
  const [local, rest] = splitProps(props, ["header", "footer", "flush", "class", "children"]);
  return (
    // `h-full`, not `min-h-full`. min-height is a floor, not a ceiling: a page
    // that grows to fit its content means the content area never scrolls — it
    // just expands — and the overflow lands on whatever ancestor can take it,
    // producing a second scrollbar. That exact bug shipped in the demo shell.
    <div class={cn("zen-flex zen-h-full zen-flex-col zen-overflow-hidden", local.class)} {...rest}>
      <Show when={local.header}>
        <div class="zen-shrink-0">{local.header}</div>
      </Show>
      {/* min-h-0 is what lets a flex child shrink below its content size;
          without it this pane refuses to become the scroller. */}
      <div class={cn("zen-min-h-0 zen-flex-1 zen-overflow-y-auto", !local.flush && "zen-p-4")}>
        {local.children}
      </div>
      <Show when={local.footer}>
        <div class="zen-shrink-0">{local.footer}</div>
      </Show>
    </div>
  );
};

/* --------------------------------- Bar --------------------------------- */

export type BarProps = JSX.HTMLAttributes<HTMLDivElement> & {
  startContent?: JSX.Element;
  /** Centred regardless of how wide start/end are — that is the point of Bar. */
  middleContent?: JSX.Element;
  endContent?: JSX.Element;
  design?: "header" | "subheader" | "footer";
};

const BAR_DESIGN: Record<NonNullable<BarProps["design"]>, string> = {
  header: "zen-border-b zen-border-zen-border zen-bg-zen-background",
  subheader: "zen-border-b zen-border-zen-border zen-bg-zen-muted",
  footer: "zen-border-t zen-border-zen-border zen-bg-zen-background",
};

export const Bar = (props: BarProps) => {
  const [local, rest] = splitProps(props, [
    "startContent",
    "middleContent",
    "endContent",
    "design",
    "class",
  ]);
  return (
    <div
      class={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-px-4 zen-py-2",
        BAR_DESIGN[local.design ?? "header"],
        local.class,
      )}
      {...rest}
    >
      {/* Equal flex-1 on the outer slots keeps middle optically centred when
          start and end differ in width. min-w-0 lets them truncate rather than
          shove the middle off-centre. */}
      <div class="zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-gap-2">
        {local.startContent}
      </div>
      <Show when={local.middleContent}>
        <div class="zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2">
          {local.middleContent}
        </div>
      </Show>
      <div class="zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-justify-end zen-gap-2">
        {local.endContent}
      </div>
    </div>
  );
};
