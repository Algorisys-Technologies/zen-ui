import * as React from "react";
import { cn } from "../../lib/cn";
import { cardVariants } from "../card/card";
import { Icon } from "../icon/icon";
import { Skeleton } from "../skeleton/skeleton";

/**
 * StatCard — a labelled figure, optionally with an icon, a delta and somewhere
 * to go.
 *
 *   <StatCard
 *     label="Completion rate"
 *     value="87%"
 *     color="success"
 *     trend={{ value: "+12%", direction: "up" }}
 *     href="/responses"
 *   />
 *
 * `Card` is a bare surface, so every app rebuilds this on top of it and each
 * copy drifts. The surface here IS Card's — `cardVariants` rather than a
 * second set of class strings — so a change to the card surface reaches this
 * too.
 *
 * `color` tints the icon and the default trend. It maps to `--zen-*` tokens,
 * which is the whole point: the card this replaces computed Bootstrap class
 * names at runtime (`bg-${color}-subtle`), a string no CSS purge can see and
 * no theme can retint.
 *
 * Two things it deliberately does NOT do, both of them the reflex version of
 * this component (see slop.md):
 *
 *   - The icon is bare. No tinted tile, chip or rounded square behind it — an
 *     icon in a coloured box is the single most recognisable machine-made
 *     card, and the mark carries itself with colour and weight.
 *   - No hover lift. An interactive card shifts tone; it does not translate up
 *     and bloom a shadow on every side.
 */

export type StatCardColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";

export interface StatCardTrend {
  value: React.ReactNode;
  direction: "up" | "down" | "flat";
  /**
   * Overrides the direction's default colour. Up is not universally good —
   * churn, cost, error rate and response time all read the other way — so the
   * caller, who knows what the number means, gets the last word.
   */
  color?: StatCardColor;
}

export interface StatCardProps extends Omit<React.HTMLAttributes<HTMLElement>, "onClick"> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Rendered bare, tinted by `color`. Decorative: `label` is the meaning. */
  icon?: React.ReactNode;
  /** Default "neutral" — a statistic is not an alert. */
  color?: StatCardColor;
  trend?: StatCardTrend;
  /** Renders the card as a button. */
  onClick?: () => void;
  /** Renders the card as a link. Takes precedence over onClick. */
  href?: string;
  /** Swaps the figure for a skeleton and marks the card busy. */
  loading?: boolean;
  className?: string;
}

const TEXT: Record<StatCardColor, string> = {
  primary: "zen-text-zen-primary",
  neutral: "zen-text-zen-muted-fg",
  info: "zen-text-zen-info",
  success: "zen-text-zen-success",
  warning: "zen-text-zen-warning",
  error: "zen-text-zen-error",
};

/** The conventional reading, overridable per trend because it is only a convention. */
const TREND_COLOR: Record<StatCardTrend["direction"], StatCardColor> = {
  up: "success",
  down: "error",
  flat: "neutral",
};

// No "flat" glyph in the set; a sideways arrow is the flat one.
const TREND_ICON = { up: "arrow-up", down: "arrow-down", flat: "arrow-right" } as const;

/** The arrow is the only thing carrying direction, so it is named, not hidden. */
const TREND_LABEL = { up: "Trending up", down: "Trending down", flat: "Flat" } as const;

export const StatCard = React.forwardRef<HTMLElement, StatCardProps>(
  (
    { label, value, icon, color = "neutral", trend, onClick, href, loading, className, ...rest },
    ref,
  ) => {
    const interactive = Boolean(href || onClick);

    const classes = cn(
      // The surface is Card's, not a copy of it.
      cardVariants({ variant: "outlined", padding: "md" }),
      "zen-block zen-w-full zen-text-start",
      interactive &&
        "zen-cursor-pointer zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      className,
    );

    const body = (
      <div className="zen-flex zen-items-start zen-justify-between zen-gap-3">
        <div className="zen-flex zen-min-w-0 zen-flex-col zen-gap-1.5">
          <span className="zen-truncate zen-text-sm zen-text-zen-muted-fg">{label}</span>
          {loading ? (
            <Skeleton className="zen-h-7 zen-w-24" />
          ) : (
            <span className="zen-text-2xl zen-font-semibold zen-leading-none zen-text-zen-foreground">
              {value}
            </span>
          )}
          {trend && !loading ? (
            <span
              className={cn(
                "zen-inline-flex zen-items-center zen-gap-1 zen-text-xs",
                TEXT[trend.color ?? TREND_COLOR[trend.direction]],
              )}
            >
              <Icon
                name={TREND_ICON[trend.direction]}
                size={13}
                title={TREND_LABEL[trend.direction]}
              />
              {trend.value}
            </span>
          ) : null}
        </div>
        {icon ? (
          // Bare: no tile, no chip, no rounded square. See the note above.
          <span aria-hidden className={cn("zen-shrink-0", TEXT[color])}>
            {icon}
          </span>
        ) : null}
      </div>
    );

    const shared = { className: classes, "aria-busy": loading || undefined, ...rest };

    if (href) {
      return (
        <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...shared}>
          {body}
        </a>
      );
    }
    if (onClick) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          {...shared}
        >
          {body}
        </button>
      );
    }
    return (
      <div ref={ref as React.Ref<HTMLDivElement>} {...shared}>
        {body}
      </div>
    );
  },
);
StatCard.displayName = "StatCard";
