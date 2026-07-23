import { type JSX } from "solid-js";
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
 * second set of class strings.
 *
 * `color` maps to `--zen-*` tokens, never to computed class names.
 *
 * Two things it deliberately does NOT do (see slop.md): the icon is bare, with
 * no tinted tile behind it, and an interactive card shifts tone rather than
 * lifting with a shadow bloom.
 *
 * Mirrors the React binding's API.
 */
export type StatCardColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";
export interface StatCardTrend {
    value: JSX.Element;
    direction: "up" | "down" | "flat";
    /**
     * Overrides the direction's default colour. Up is not universally good —
     * churn, cost, error rate and response time all read the other way — so the
     * caller, who knows what the number means, gets the last word.
     */
    color?: StatCardColor;
}
export interface StatCardProps extends Omit<JSX.HTMLAttributes<HTMLElement>, "onClick" | "ref"> {
    /**
     * Declared here rather than inherited: the root is an <a>, <button> or <div>
     * depending on the props, and JSX.HTMLAttributes<HTMLElement>'s ref does not
     * narrow to any of them. Taking HTMLElement is the honest signature — the
     * caller cannot know which element they will get either.
     */
    ref?: (el: HTMLElement) => void;
    label: JSX.Element;
    value: JSX.Element;
    /** Rendered bare, tinted by `color`. Decorative: `label` is the meaning. */
    icon?: JSX.Element;
    /** Default "neutral" — a statistic is not an alert. */
    color?: StatCardColor;
    trend?: StatCardTrend;
    /** Renders the card as a button. */
    onClick?: () => void;
    /** Renders the card as a link. Takes precedence over onClick. */
    href?: string;
    /** Swaps the figure for a skeleton and marks the card busy. */
    loading?: boolean;
    class?: string;
}
export declare const StatCard: (props: StatCardProps) => JSX.Element;
//# sourceMappingURL=stat-card.d.ts.map