import { cn } from "../../lib/cn";
import { toNodes, type Child, type ZenComponent } from "../../lib/component";
import { cardVariants } from "../card/card";
import { Skeleton } from "../skeleton/skeleton";
import { Icon } from "../icon/icon";

export type StatCardColor = "primary" | "neutral" | "info" | "success" | "warning" | "error";
export interface StatCardTrend { value: Child; direction: "up" | "down" | "flat" }

export interface StatCardProps {
  label: Child;
  value: Child;
  /** Decorative: `label` is the meaning. */
  icon?: Child;
  color?: StatCardColor;
  trend?: StatCardTrend;
  onClick?: () => void;
  /** Takes precedence over onClick. */
  href?: string;
  loading?: boolean;
  class?: string;
}

const TEXT: Record<StatCardColor, string> = {
  primary: "zen-text-zen-primary", neutral: "zen-text-zen-muted-fg", info: "zen-text-zen-info",
  success: "zen-text-zen-success", warning: "zen-text-zen-warning", error: "zen-text-zen-error",
};
const TREND_COLOR: Record<StatCardTrend["direction"], StatCardColor> = { up: "success", down: "error", flat: "neutral" };
const TREND_ICON = { up: "arrow-up", down: "arrow-down", flat: "arrow-right" } as const;
const TREND_LABEL = { up: "Trending up", down: "Trending down", flat: "Flat" } as const;

export function StatCard(props: StatCardProps): ZenComponent<StatCardProps> {
  let current = { ...props };
  // Element identity depends on interactivity, but it is fixed for the card's life
  // (a stat card does not toggle between a link and a button), so it is chosen once.
  const tag = current.href ? "a" : current.onClick ? "button" : "div";
  const el = document.createElement(tag);

  const render = () => {
    const { label, value, icon, color = "neutral", trend, onClick, href, loading, class: className } = current;
    const interactive = Boolean(href || onClick);
    el.className = cn(
      cardVariants({ variant: "outlined", padding: "md" }),
      "zen-block zen-w-full zen-text-left",
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
      val.className = "zen-text-2xl zen-font-semibold zen-leading-none zen-text-zen-foreground";
      val.append(...toNodes(value));
      col.append(val);
    }

    if (trend && !loading) {
      const t = document.createElement("span");
      t.className = cn("zen-inline-flex zen-items-center zen-gap-1 zen-text-xs zen-font-medium", TEXT[TREND_COLOR[trend.direction]]);
      t.append(Icon({ name: TREND_ICON[trend.direction], size: 14, title: TREND_LABEL[trend.direction] }).el);
      const tv = document.createElement("span");
      tv.append(...toNodes(trend.value));
      t.append(tv);
      col.append(t);
    }
    row.append(col);

    if (icon) {
      const ic = document.createElement("span");
      ic.className = cn("zen-shrink-0", TEXT[color]);
      ic.setAttribute("aria-hidden", "true");
      ic.append(...toNodes(icon));
      row.append(ic);
    }

    el.replaceChildren(row);
    if (onClick && !href) el.onclick = () => onClick();
  };
  render();
  return { el, update(n) { current = { ...current, ...n }; render(); }, destroy() { el.remove(); } };
}
