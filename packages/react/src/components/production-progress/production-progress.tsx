import * as React from "react";
import { productionProgress, segmentFill } from "@algorisys/zen-ui-core/production-progress";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * ProductionProgress — a work order's good and scrap against its target.
 *
 *   <ProductionProgress label="WO-10042" target={500} good={361} scrap={19} />
 *   // ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  361 of 500 good · 19 scrap · 139 to go
 *
 * Scrap is drawn and counted separately: it does not count toward the target,
 * so 440 good with 40 scrap is 60 to go, not 20. Good past the target is
 * reported ("12 over target"), not clamped away. Work that has started but not
 * yet earned a visible width still gets a 2px sliver — "nobody has begun" is
 * what an empty bar means, and 3 of 5,000 is not that.
 *
 * Colour says what parts are, not how far along: good is primary until the
 * order is done, then success; scrap is error. Whether 60% is on time is the
 * schedule's question, not the bar's.
 *
 * `segments` adds a row of units — cartons, pallets, trays — each full, partly
 * full or empty, for packing where the count that matters is boxes.
 */

export type ProductionProgressProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  target: number;
  good: number;
  scrap?: number;
  /** Names the bar, visibly and for assistive tech: the work order, the step. */
  label?: string;
  /** Units the good count fills, e.g. `{ size: 12, count: 42, unit: "cartons" }`. */
  segments?: { size: number; count: number; unit: string };
  size?: "sm" | "md";
  /** Hide the counts line (the label and the bar's accessible text stay). */
  hideText?: boolean;
};

export const ProductionProgress = React.forwardRef<HTMLDivElement, ProductionProgressProps>(
  ({ target, good, scrap, label, segments, size, hideText, className, ...rest }, ref) => {
    const loc = useLocale();
    const p = React.useMemo(() => productionProgress({ target, good, scrap }), [target, good, scrap]);
    const num = (n: number) => new Intl.NumberFormat(loc.locale).format(n);

    const parts = [loc.t("productionProgress.goodOfTarget", { good: num(p.good), target: num(p.target) })];
    if (p.scrap > 0) parts.push(loc.t("productionProgress.scrap", { scrap: num(p.scrap) }));
    if (p.over > 0) parts.push(loc.t("productionProgress.over", { over: num(p.over) }));
    else parts.push(p.done ? loc.t("productionProgress.done") : loc.t("productionProgress.remaining", { remaining: num(p.remaining) }));
    const text = parts.join(" · ");

    const segSize = segments?.size;
    const segCount = segments?.count;
    const fills = React.useMemo(
      () => (segSize !== undefined && segCount !== undefined ? segmentFill(p.good, segSize, segCount) : []),
      [p.good, segSize, segCount],
    );
    const segmentText = segments
      ? loc.t("productionProgress.segments", {
          full: num(fills.filter((x) => x >= 1).length),
          count: num(segments.count),
          unit: segments.unit,
        })
      : "";

    return (
      <div ref={ref} className={cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", className)} {...rest}>
        {label ? <span className="zen-text-sm zen-font-medium zen-text-zen-foreground">{label}</span> : null}
        <div
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={p.target}
          aria-valuenow={Math.min(p.good, p.target)}
          aria-valuetext={segments ? `${text}. ${segmentText}` : text}
          className={cn(
            "zen-relative zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
            size === "sm" ? "zen-h-1.5" : "zen-h-3",
          )}
        >
          {p.good > 0 ? (
            <div
              data-part="good"
              className={cn("zen-h-full", p.done ? "zen-bg-zen-success" : "zen-bg-zen-primary")}
              style={{ width: `${p.goodFraction * 100}%`, minWidth: "2px" }}
            />
          ) : null}
          {p.scrap > 0 ? (
            <div
              data-part="scrap"
              className="zen-h-full zen-bg-zen-error"
              style={{ width: `${p.scrapFraction * 100}%`, minWidth: "2px" }}
            />
          ) : null}
        </div>
        {!hideText ? <span className="zen-text-sm zen-tabular-nums zen-text-zen-foreground">{text}</span> : null}
        {segments ? (
          <div className="zen-flex zen-flex-col zen-gap-1">
            <div className="zen-flex zen-flex-wrap zen-gap-1" aria-hidden="true">
              {fills.map((fill, i) => (
                <span
                  key={i}
                  data-fill={fill}
                  className={cn(
                    "zen-relative zen-h-4 zen-w-4 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-border-solid",
                    fill >= 1 ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background",
                  )}
                >
                  {fill > 0 && fill < 1 ? (
                    <span className="zen-absolute zen-inset-x-0 zen-bottom-0 zen-bg-zen-primary" style={{ height: `${fill * 100}%` }} />
                  ) : null}
                </span>
              ))}
            </div>
            {!hideText ? <span className="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">{segmentText}</span> : null}
          </div>
        ) : null}
      </div>
    );
  },
);
ProductionProgress.displayName = "ProductionProgress";
