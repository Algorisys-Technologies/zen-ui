import { cn } from "../../lib/cn";
import { toNodes, type Child, type ZenComponent } from "../../lib/component";
import { cardVariants } from "../card/card";
import { Skeleton } from "../skeleton/skeleton";
import { Icon } from "../icon/icon";
import { useLocale, type MessageKey } from "../locale/locale";

export type StatCardColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";
export interface StatCardTrend {
  value: Child;
  direction: "up" | "down" | "flat";
  /**
   * Overrides the direction's default colour. Up is not universally good —
   * churn, cost, error rate and response time all read the other way.
   */
  color?: StatCardColor;
}

export interface StatCardProps {
  label: Child;
  value: Child;
  /** Decorative: `label` is the meaning. */
  icon?: Child;
  /**
   * A line under the value, in the caller's own words — "GRN completed / total",
   * "Prompt + completion". It is NOT a trend: a trend carries a mandatory
   * direction arrow and a semantic colour, which is wrong for a denominator or
   * a definition. Apps that needed this used to rebuild the card on Card, which
   * is the drift this component exists to prevent.
   */
  description?: Child;
  color?: StatCardColor;
  trend?: StatCardTrend;
  onClick?: () => void;
  /** Takes precedence over onClick. */
  href?: string;
  loading?: boolean;
  /**
   * A small chart under the figure, across the card: the trend behind a hero
   * figure ("Revenue, trailing 12 months"). A MicroChart, or any element.
   * While `loading` it is a skeleton too.
   */
  chart?: Child;
  /** "lg": the hero of a dashboard row, with a larger figure. Default "md". */
  size?: "md" | "lg";
  class?: string;
}

const TEXT: Record<StatCardColor, string> = {
  primary: "zen-text-zen-primary", neutral: "zen-text-zen-muted-fg", info: "zen-text-zen-info",
  success: "zen-text-zen-success", warning: "zen-text-zen-warning-text", error: "zen-text-zen-error",
};
const TREND_COLOR: Record<StatCardTrend["direction"], StatCardColor> = { up: "success", down: "error", flat: "neutral" };
const TREND_ICON = { up: "arrow-up", down: "arrow-down", flat: "arrow-right" } as const;
const TREND_LABEL: Record<"up" | "down" | "flat", MessageKey> = {
  up: "statCard.trendingUp",
  down: "statCard.trendingDown",
  flat: "statCard.flat",
};

export function StatCard(props: StatCardProps): ZenComponent<StatCardProps> {
  let current = { ...props };
  const loc = useLocale();
  // Element identity depends on interactivity, but it is fixed for the card's life
  // (a stat card does not toggle between a link and a button), so it is chosen once.
  const tag = current.href ? "a" : current.onClick ? "button" : "div";
  const el = document.createElement(tag);

  const render = () => {
    const { label, value, icon, description, color = "neutral", trend, onClick, href, loading, chart, size, class: className } = current;
    const interactive = Boolean(href || onClick);
    el.className = cn(
      cardVariants({ variant: "outlined", padding: "md" }),
      // A linked card would otherwise underline every word in it: zen-ui ships
      // no element reset for <a> (measured: underlined in this demo and without
      // the preflight).
      "zen-block zen-w-full zen-text-start zen-no-underline",
      interactive &&
        "zen-cursor-pointer zen-transition-colors hover:zen-bg-zen-muted focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
      className,
    );
    if (href) (el as HTMLAnchorElement).href = href;
    if (tag === "button") (el as HTMLButtonElement).type = "button";
    if (loading) el.setAttribute("aria-busy", "true"); else el.removeAttribute("aria-busy");

    const row = document.createElement("div");
    row.className = "zen-flex zen-items-start zen-justify-between zen-gap-3";
    const col = document.createElement("div");
    col.className = "zen-flex zen-min-w-0 zen-flex-col zen-gap-1.5";

    const lab = document.createElement("span");
    lab.className = "zen-truncate zen-text-sm zen-text-zen-muted-fg";
    lab.append(...toNodes(label));
    col.append(lab);

    if (loading) {
      col.append(Skeleton({ class: "zen-h-7 zen-w-24" }).el);
    } else {
      const val = document.createElement("span");
      // The size goes FIRST: cn() lets a later font-size class drop an earlier
      // leading-*, and leading-none is what this always drew.
      val.className = cn(
        size === "lg" ? "zen-text-4xl" : "zen-text-2xl",
        "zen-font-semibold zen-leading-none zen-text-zen-foreground",
      );
      val.append(...toNodes(value));
      col.append(val);
    }

    if (trend && !loading) {
      const t = document.createElement("span");
      t.className = cn("zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-font-medium", TEXT[trend.color ?? TREND_COLOR[trend.direction]]);
      t.append(Icon({ name: TREND_ICON[trend.direction], size: 14, title: loc.t(TREND_LABEL[trend.direction]) }).el);
      const tv = document.createElement("span");
      tv.append(...toNodes(trend.value));
      t.append(tv);
      col.append(t);
    }

    if (description && !loading) {
      const d = document.createElement("span");
      d.className = "zen-text-xs zen-text-zen-muted-fg";
      d.append(...toNodes(description));
      col.append(d);
    }
    row.append(col);

    if (icon) {
      const ic = document.createElement("span");
      ic.className = cn("zen-shrink-0", TEXT[color]);
      ic.setAttribute("aria-hidden", "true");
      ic.append(...toNodes(icon));
      row.append(ic);
    }

    // The chart sits under the figure, across the card; nothing at all is
    // rendered without one, so a card that has none is unchanged.
    if (chart) {
      const c = document.createElement("div");
      c.className = "zen-mt-3";
      c.setAttribute("data-stat-chart", "");
      if (loading) c.append(Skeleton({ class: "zen-h-12 zen-w-full" }).el);
      else c.append(...toNodes(chart));
      el.replaceChildren(row, c);
    } else {
      el.replaceChildren(row);
    }
    if (onClick && !href) el.onclick = () => onClick();
  };
  render();
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { el.remove(); } };
}
