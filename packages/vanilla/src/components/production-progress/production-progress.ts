import { productionProgress, segmentFill } from "@algorisys/zen-ui-core/production-progress";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * ProductionProgress — a work order's good and scrap against its target.
 *
 *   ProductionProgress({ label: "WO-10042", target: 500, good: 361, scrap: 19 })
 *   // ▓▓▓▓▓▓▓▓▓▓▓▓░░░░  361 of 500 good · 19 scrap · 139 to go
 *
 * Vanilla port; see the React binding for the reasoning. Same API, same output.
 *
 * Scrap is drawn and counted separately: it does not count toward the target.
 * Good past the target is reported ("12 over target"), not clamped away. Work
 * that has started but not yet earned a visible width still gets a 2px sliver.
 * Colour says what parts are, not how far along: good is primary until the
 * order is done, then success; scrap is error.
 *
 * `segments` adds a row of units — cartons, pallets, trays — each full, partly
 * full or empty, for packing where the count that matters is boxes.
 */

export interface ProductionProgressProps extends Omit<BaseProps, "children"> {
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
}

export function ProductionProgress(props: ProductionProgressProps): ZenComponent<ProductionProgressProps> {
  let current: ProductionProgressProps = { ...props };
  const loc = useLocale();
  const el = document.createElement("div");
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const render = () => {
    const { target, good, scrap, label, segments, size, hideText, class: className, ...rest } = current;
    const p = productionProgress({ target, good, scrap });
    const fmt = new Intl.NumberFormat(loc.locale);
    const num = (n: number) => fmt.format(n);

    const parts = [loc.t("productionProgress.goodOfTarget", { good: num(p.good), target: num(p.target) })];
    if (p.scrap > 0) parts.push(loc.t("productionProgress.scrap", { scrap: num(p.scrap) }));
    if (p.over > 0) parts.push(loc.t("productionProgress.over", { over: num(p.over) }));
    else parts.push(p.done ? loc.t("productionProgress.done") : loc.t("productionProgress.remaining", { remaining: num(p.remaining) }));
    const text = parts.join(" · ");

    const fills = segments ? segmentFill(p.good, segments.size, segments.count) : [];
    const segmentText = segments
      ? loc.t("productionProgress.segments", {
          full: num(fills.filter((x) => x >= 1).length),
          count: num(segments.count),
          unit: segments.unit,
        })
      : "";

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", className);
    const children: HTMLElement[] = [];

    if (label) {
      const name = document.createElement("span");
      name.className = "zen-text-sm zen-font-medium zen-text-zen-foreground";
      name.textContent = label;
      children.push(name);
    }

    const bar = document.createElement("div");
    bar.setAttribute("role", "progressbar");
    if (label) bar.setAttribute("aria-label", label);
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(p.target));
    bar.setAttribute("aria-valuenow", String(Math.min(p.good, p.target)));
    const valueText = segments ? [text, segmentText].join(". ") : text;
    bar.setAttribute("aria-valuetext", valueText);
    bar.className = cn(
      "zen-relative zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
      size === "sm" ? "zen-h-1.5" : "zen-h-3",
    );
    if (p.good > 0) {
      const g = document.createElement("div");
      g.setAttribute("data-part", "good");
      g.className = cn("zen-h-full", p.done ? "zen-bg-zen-success" : "zen-bg-zen-primary");
      g.style.width = `${p.goodFraction * 100}%`;
      g.style.minWidth = "2px";
      bar.append(g);
    }
    if (p.scrap > 0) {
      const s = document.createElement("div");
      s.setAttribute("data-part", "scrap");
      s.className = "zen-h-full zen-bg-zen-error";
      s.style.width = `${p.scrapFraction * 100}%`;
      s.style.minWidth = "2px";
      bar.append(s);
    }
    children.push(bar);

    if (!hideText) {
      const counts = document.createElement("span");
      counts.className = "zen-text-sm zen-tabular-nums zen-text-zen-foreground";
      counts.textContent = text;
      children.push(counts);
    }

    if (segments) {
      const wrap = document.createElement("div");
      wrap.className = "zen-flex zen-flex-col zen-gap-1";
      const row = document.createElement("div");
      row.className = "zen-flex zen-flex-wrap zen-gap-1";
      row.setAttribute("aria-hidden", "true");
      for (const fill of fills) {
        const box = document.createElement("span");
        box.setAttribute("data-fill", String(fill));
        box.className = cn(
          "zen-relative zen-h-4 zen-w-4 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-border-solid",
          fill >= 1 ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background",
        );
        if (fill > 0 && fill < 1) {
          const level = document.createElement("span");
          level.className = "zen-absolute zen-inset-x-0 zen-bottom-0 zen-bg-zen-primary";
          level.style.height = `${fill * 100}%`;
          box.append(level);
        }
        row.append(box);
      }
      wrap.append(row);
      if (!hideText) {
        const st = document.createElement("span");
        st.className = "zen-text-xs zen-tabular-nums zen-text-zen-muted-fg";
        st.textContent = segmentText;
        wrap.append(st);
      }
      children.push(wrap);
    }

    el.replaceChildren(...children);
    removeProps?.();
    removeProps = applyProps(el, rest as Record<string, unknown>);
  };

  render();
  disposer.add(() => removeProps?.());

  return {
    el,
    update(next) {
      current = { ...current, ...next };
      render();
    },
    destroy() {
      disposer.dispose();
      el.remove();
    },
  };
}
