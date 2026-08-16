import * as React from "react";
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
    /**
     * A line under the value, in the caller's own words — "GRN completed / total",
     * "Prompt + completion". It is NOT a trend: a trend carries a mandatory
     * direction arrow and a semantic colour, which is wrong for a denominator or
     * a definition. Apps that needed this used to rebuild the card on Card, which
     * is the drift this component exists to prevent.
     */
    description?: React.ReactNode;
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
export declare const StatCard: React.ForwardRefExoticComponent<StatCardProps & React.RefAttributes<HTMLElement>>;
//# sourceMappingURL=stat-card.d.ts.map