import * as React from "react";
import { cn } from "../../lib/cn";

/**
 * Page and Bar — the two small structural pieces of the Tier 1 frame
 * (docs/fiori-gap-analysis.md). Neither is clever; both are load-bearing,
 * because everything else in the frame assumes them.
 *
 *   Page — a whole-screen container: header / content / footer, where ONLY the
 *          content scrolls.
 *   Bar  — the three-slot (start / middle / end) row used for headers,
 *          subheaders and footers.
 */

/* -------------------------------- Page --------------------------------- */

export interface PageProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Removes the content padding — for a full-bleed table or map. */
  flush?: boolean;
}

export const Page = React.forwardRef<HTMLDivElement, PageProps>(
  ({ header, footer, flush = false, className, children, ...props }, ref) => (
    // `h-full`, not `min-h-full`. min-height is a floor, not a ceiling: a page
    // that grows to fit its content means the content area never scrolls — it
    // just expands — and the overflow lands on whatever ancestor can take it,
    // producing a second scrollbar and a header that scrolls away. That exact
    // bug shipped in this repo's demo shell.
    <div
      ref={ref}
      className={cn("zen-flex zen-h-full zen-flex-col zen-overflow-hidden", className)}
      {...props}
    >
      {header ? <div className="zen-shrink-0">{header}</div> : null}
      {/* min-h-0 is what lets a flex child actually shrink below its content
          size; without it this pane refuses to become the scroller. */}
      <div className={cn("zen-min-h-0 zen-flex-1 zen-overflow-y-auto", !flush && "zen-p-4")}>
        {children}
      </div>
      {footer ? <div className="zen-shrink-0">{footer}</div> : null}
    </div>
  ),
);
Page.displayName = "Page";

/* --------------------------------- Bar --------------------------------- */

export interface BarProps extends React.HTMLAttributes<HTMLDivElement> {
  startContent?: React.ReactNode;
  /** Centred regardless of how wide start/end are — that is the point of Bar. */
  middleContent?: React.ReactNode;
  endContent?: React.ReactNode;
  design?: "header" | "subheader" | "footer";
}

const BAR_DESIGN: Record<NonNullable<BarProps["design"]>, string> = {
  header: "zen-border-b zen-border-zen-border zen-bg-zen-background",
  subheader: "zen-border-b zen-border-zen-border zen-bg-zen-muted",
  footer: "zen-border-t zen-border-zen-border zen-bg-zen-background",
};

export const Bar = React.forwardRef<HTMLDivElement, BarProps>(
  ({ startContent, middleContent, endContent, design = "header", className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "zen-flex zen-w-full zen-items-center zen-gap-2 zen-px-4 zen-py-2",
        BAR_DESIGN[design],
        className,
      )}
      {...props}
    >
      {/* Equal flex-1 on the outer slots is what keeps middle optically centred
          when start and end differ in width. min-w-0 lets them truncate rather
          than shove the middle off-centre. */}
      <div className="zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-gap-2">
        {startContent}
      </div>
      {middleContent ? (
        <div className="zen-flex zen-min-w-0 zen-shrink-0 zen-items-center zen-gap-2">
          {middleContent}
        </div>
      ) : null}
      <div className="zen-flex zen-min-w-0 zen-flex-1 zen-items-center zen-justify-end zen-gap-2">
        {endContent}
      </div>
    </div>
  ),
);
Bar.displayName = "Bar";
