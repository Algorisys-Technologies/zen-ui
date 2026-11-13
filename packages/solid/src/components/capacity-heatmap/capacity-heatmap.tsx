import { type JSX, For, Show, createMemo, splitProps } from "solid-js";
import { capacityGrid, type CapacityCell } from "@algorisys/zen-ui-core/capacity";
import { cn } from "../../lib/cn";
import { useLocale } from "../locale/locale";

/**
 * CapacityHeatmap — booked hours against available hours, resource by period.
 *
 *   <CapacityHeatmap
 *     rows={lines} periods={weeks}
 *     cells={[{ row: "A", period: "w46", booked: 36, available: 40 }, …]}
 *     onCellClick={(row, period) => openDrillDown(row, period)}
 *   />
 *
 * A real table: every cell prints its load and hours, the colour repeats them.
 * The wash deepens with load up to full; over capacity, and work booked where
 * there is no capacity at all (a line shut that week), are drawn as alarms —
 * the second is the worse of the two and the easiest to miss, because a naive
 * percentage would divide by zero or call it free. Totals sum hours, then
 * divide.
 *
 * `onCellClick` makes each cell a button, for a drill-down into the orders
 * behind it.
 */

export type CapacityHeatmapProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  rows: { id: string; label?: string }[];
  periods: { id: string; label?: string }[];
  cells: { row: string; period: string; booked: number; available: number }[];
  /** Where "high" starts. Default 0.85. */
  high?: number;
  /** Names the table. Defaults to "Capacity". */
  label?: string;
  /** Row and column totals. Default true. */
  showTotals?: boolean;
  onCellClick?: (row: string, period: string, cell: CapacityCell) => void;
};

export const CapacityHeatmap = (props: CapacityHeatmapProps) => {
  const [local, rest] = splitProps(props, ["rows", "periods", "cells", "high", "label", "showTotals", "onCellClick", "class"]);
  const loc = useLocale();
  const grid = createMemo(() => capacityGrid({ rows: local.rows, periods: local.periods, cells: local.cells, high: local.high }));
  const totals = () => local.showTotals !== false;
  const num = (n: number) => new Intl.NumberFormat(loc.locale(), { maximumFractionDigits: 1 }).format(n);
  const pct = (n: number) => new Intl.NumberFormat(loc.locale(), { style: "percent", maximumFractionDigits: 0 }).format(n);

  const headline = (c: CapacityCell) =>
    c.status === "no-capacity" ? loc.t("capacity.noCapacity") : c.status === "closed" ? "—" : pct(c.load as number);
  const sub = (c: CapacityCell) =>
    c.status === "no-capacity"
      ? loc.t("capacity.booked", { booked: num(c.booked) })
      : c.status === "closed"
        ? loc.t("capacity.closed")
        : loc.t("capacity.hours", { booked: num(c.booked), available: num(c.available) });

  // A wash of the primary colour that deepens with load, capped so dark text
  // stays readable on the fullest cell; the alarms use the error tokens.
  const style = (c: CapacityCell): JSX.CSSProperties =>
    c.status === "over" || c.status === "no-capacity" || c.status === "closed" || c.load === null
      ? {}
      : { "background-color": `color-mix(in srgb, var(--zen-color-primary) ${Math.round(Math.min(1, c.load) * 26)}%, var(--zen-color-background))` };
  // zen-outline-solid, not zen-outline: cn() (tailwind-merge) drops a bare
  // `zen-outline` beside `zen-outline-2`, and the alarm outline then has no
  // style and draws nothing.
  const cls = (c: CapacityCell) =>
    cn(
      "zen-flex zen-h-full zen-min-h-14 zen-w-full zen-flex-col zen-justify-center zen-gap-0.5 zen-px-2 zen-py-1.5 zen-text-end zen-tabular-nums",
      c.status === "over" || c.status === "no-capacity"
        ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-outline-solid zen-outline-2 -zen-outline-offset-2 zen-outline-zen-error"
        : c.status === "closed"
          ? "zen-bg-zen-muted zen-text-zen-foreground" // muted-fg on muted is 4.34:1 in the blue theme
          : "zen-text-zen-foreground",
    );
  const content = (c: CapacityCell) => (
    <>
      <span class="zen-text-sm zen-font-semibold">{headline(c)}</span>
      <span class="zen-text-xs">{sub(c)}</span>
    </>
  );

  return (
    <div class={cn("zen-flex zen-w-full zen-flex-col zen-gap-2", local.class)} {...rest}>
      <Show when={grid().overCount > 0}>
        <p class="zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error" role="status">
          {loc.t("capacity.overCount", { count: grid().overCount })}
        </p>
      </Show>
      <div class="zen-w-full zen-overflow-x-auto">
        <table class="zen-w-full zen-border-collapse zen-text-sm">
          <caption class="zen-sr-only">{local.label ?? loc.t("capacity.label")}</caption>
          <thead>
            <tr>
              <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg">{loc.t("capacity.resource")}</th>
              <For each={local.periods}>
                {(p) => <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-end zen-font-medium zen-text-zen-muted-fg">{p.label ?? p.id}</th>}
              </For>
              <Show when={totals()}>
                <th scope="col" class="zen-px-2 zen-py-1.5 zen-text-end zen-font-semibold zen-text-zen-foreground">{loc.t("capacity.total")}</th>
              </Show>
            </tr>
          </thead>
          <tbody>
            <For each={local.rows}>
              {(row) => (
                <tr class="zen-border-0 zen-border-t zen-border-solid zen-border-zen-border">
                  <th scope="row" class="zen-whitespace-nowrap zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-foreground">{row.label ?? row.id}</th>
                  <For each={local.periods}>
                    {(p) => {
                      const c = () => grid().cells[row.id][p.id];
                      return (
                        <td class="zen-p-0.5" data-status={c().status}>
                          <Show when={local.onCellClick} fallback={<div class={cls(c())} style={style(c())}>{content(c())}</div>}>
                            {(click) => (
                              <button
                                type="button"
                                class={cn(cls(c()), "zen-m-0 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring")}
                                style={style(c())}
                                aria-label={loc.t("capacity.cell", {
                                  row: row.label ?? row.id,
                                  period: p.label ?? p.id,
                                  value: `${headline(c())}, ${sub(c())}`,
                                })}
                                onClick={() => click()(row.id, p.id, c())}
                              >
                                {content(c())}
                              </button>
                            )}
                          </Show>
                        </td>
                      );
                    }}
                  </For>
                  <Show when={totals()}>
                    <td class="zen-p-0.5 zen-font-semibold" data-status={grid().rowTotals[row.id]?.status}>
                      <div class={cls(grid().rowTotals[row.id])}>{content(grid().rowTotals[row.id])}</div>
                    </td>
                  </Show>
                </tr>
              )}
            </For>
          </tbody>
          <Show when={totals()}>
            <tfoot>
              <tr class="zen-border-0 zen-border-t-2 zen-border-solid zen-border-zen-border">
                <th scope="row" class="zen-px-2 zen-py-1.5 zen-text-start zen-font-semibold zen-text-zen-foreground">{loc.t("capacity.total")}</th>
                <For each={local.periods}>
                  {(p) => (
                    <td class="zen-p-0.5" data-status={grid().periodTotals[p.id]?.status}>
                      <div class={cls(grid().periodTotals[p.id])}>{content(grid().periodTotals[p.id])}</div>
                    </td>
                  )}
                </For>
                <td class="zen-p-0.5" data-status={grid().total.status}>
                  <div class={cls(grid().total)}>{content(grid().total)}</div>
                </td>
              </tr>
            </tfoot>
          </Show>
        </table>
      </div>
    </div>
  );
};
