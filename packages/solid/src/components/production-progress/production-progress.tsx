import { type JSX, For, Show, createMemo, splitProps } from "solid-js";
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

export type ProductionProgressProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
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

export const ProductionProgress = (props: ProductionProgressProps) => {
  const [local, rest] = splitProps(props, ["target", "good", "scrap", "label", "segments", "size", "hideText", "class"]);
  const loc = useLocale();
  const p = createMemo(() => productionProgress({ target: local.target, good: local.good, scrap: local.scrap }));
  const num = (n: number) => new Intl.NumberFormat(loc.locale()).format(n);

  const text = () => {
    const r = p();
    const parts = [loc.t("productionProgress.goodOfTarget", { good: num(r.good), target: num(r.target) })];
    if (r.scrap > 0) parts.push(loc.t("productionProgress.scrap", { scrap: num(r.scrap) }));
    if (r.over > 0) parts.push(loc.t("productionProgress.over", { over: num(r.over) }));
    else parts.push(r.done ? loc.t("productionProgress.done") : loc.t("productionProgress.remaining", { remaining: num(r.remaining) }));
    return parts.join(" · ");
  };
  const fills = createMemo(() => (local.segments ? segmentFill(p().good, local.segments.size, local.segments.count) : []));
  const segmentText = () => {
    const s = local.segments;
    if (!s) return "";
    return loc.t("productionProgress.segments", { full: num(fills().filter((x) => x >= 1).length), count: num(s.count), unit: s.unit });
  };

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-1.5", local.class)} {...rest}>
      <Show when={local.label}>
        <span class="zen-text-sm zen-font-medium zen-text-zen-foreground">{local.label}</span>
      </Show>
      <div
        role="progressbar"
        aria-label={local.label}
        aria-valuemin={0}
        aria-valuemax={p().target}
        aria-valuenow={Math.min(p().good, p().target)}
        aria-valuetext={local.segments ? `${text()}. ${segmentText()}` : text()}
        class={cn(
          "zen-relative zen-flex zen-w-full zen-overflow-hidden zen-rounded-zen-full zen-bg-zen-muted",
          local.size === "sm" ? "zen-h-1.5" : "zen-h-3",
        )}
      >
        <Show when={p().good > 0}>
          <div
            data-part="good"
            class={cn("zen-h-full", p().done ? "zen-bg-zen-success" : "zen-bg-zen-primary")}
            style={{ width: `${p().goodFraction * 100}%`, "min-width": "2px" }}
          />
        </Show>
        <Show when={p().scrap > 0}>
          <div
            data-part="scrap"
            class="zen-h-full zen-bg-zen-error"
            style={{ width: `${p().scrapFraction * 100}%`, "min-width": "2px" }}
          />
        </Show>
      </div>
      <Show when={!local.hideText}>
        <span class="zen-text-sm zen-tabular-nums zen-text-zen-foreground">{text()}</span>
      </Show>
      <Show when={local.segments}>
        <div class="zen-flex zen-flex-col zen-gap-1">
          <div class="zen-flex zen-flex-wrap zen-gap-1" aria-hidden="true">
            <For each={fills()}>
              {(fill) => (
                <span
                  data-fill={fill}
                  class={cn(
                    "zen-relative zen-h-4 zen-w-4 zen-overflow-hidden zen-rounded-zen-sm zen-border zen-border-solid",
                    fill >= 1 ? "zen-border-zen-primary zen-bg-zen-primary" : "zen-border-zen-border zen-bg-zen-background",
                  )}
                >
                  <Show when={fill > 0 && fill < 1}>
                    <span class="zen-absolute zen-inset-x-0 zen-bottom-0 zen-bg-zen-primary" style={{ height: `${fill * 100}%` }} />
                  </Show>
                </span>
              )}
            </For>
          </div>
          <Show when={!local.hideText}>
            <span class="zen-text-xs zen-tabular-nums zen-text-zen-muted-fg">{segmentText()}</span>
          </Show>
        </div>
      </Show>
    </div>
  );
};
