import { capacityGrid, type CapacityCell } from "@algorisys/zen-ui-core/capacity";
import { cn } from "../../lib/cn";
import { applyProps, Disposer, type BaseProps, type ZenComponent } from "../../lib/component";
import { useLocale } from "../locale/locale";

/**
 * CapacityHeatmap — booked hours against available hours, resource by period.
 * The vanilla port of the React reference.
 *
 *   CapacityHeatmap({
 *     rows: lines, periods: weeks,
 *     cells: [{ row: "A", period: "w46", booked: 36, available: 40 }, …],
 *     onCellClick: (row, period) => openDrillDown(row, period),
 *   }).el
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
 *
 * The table holds no state of its own, so `update()` rebuilds it; a cell
 * button that had focus gets it back.
 */

export interface CapacityHeatmapProps extends Omit<BaseProps, "children"> {
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
}

export type CapacityHeatmapHandle = ZenComponent<CapacityHeatmapProps, HTMLDivElement>;

// A wash of the primary colour that deepens with load, capped so dark text
// stays readable on the fullest cell; the alarms use the error tokens.
const wash = (node: HTMLElement, c: CapacityCell) => {
  if (c.status === "over" || c.status === "no-capacity" || c.status === "closed" || c.load === null) return;
  const pct = Math.round(Math.min(1, c.load) * 26);
  node.style.backgroundColor = ["color-mix(in srgb, var(--zen-color-primary) ", pct, "%, var(--zen-color-background))"].join("");
};
// zen-outline-solid, not zen-outline: cn() (tailwind-merge) drops a bare
// `zen-outline` beside `zen-outline-2`, and the alarm outline then has no
// style and draws nothing.
const cellClass = (c: CapacityCell) =>
  cn(
    "zen-flex zen-h-full zen-min-h-14 zen-w-full zen-flex-col zen-justify-center zen-gap-0.5 zen-px-2 zen-py-1.5 zen-text-end zen-tabular-nums",
    c.status === "over" || c.status === "no-capacity"
      ? "zen-bg-zen-error-soft zen-text-zen-error-soft-fg zen-outline-solid zen-outline-2 -zen-outline-offset-2 zen-outline-zen-error"
      : c.status === "closed"
        ? "zen-bg-zen-muted zen-text-zen-foreground" // muted-fg on muted is 4.34:1 in the blue theme
        : "zen-text-zen-foreground",
  );

const node = <K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) => {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
};

export function CapacityHeatmap(props: CapacityHeatmapProps): CapacityHeatmapHandle {
  let current: CapacityHeatmapProps = { ...props };
  const loc = useLocale();
  const disposer = new Disposer();
  let removeProps: (() => void) | undefined;

  const el = document.createElement("div");
  const overNote = node("p", "zen-m-0 zen-text-sm zen-font-medium zen-text-zen-error");
  overNote.setAttribute("role", "status");
  const scroller = node("div", "zen-w-full zen-overflow-x-auto");

  // One delegated listener: the buttons are rebuilt on update, the table is not torn down per cell.
  // Keyed off the element itself, so the DOM carries nothing React's does not.
  const clickable = new WeakMap<Element, { key: string; fire: () => void }>();
  const onClick = (e: MouseEvent) => {
    const btn = (e.target as Element | null)?.closest("button");
    if (btn) clickable.get(btn)?.fire();
  };
  scroller.addEventListener("click", onClick);
  disposer.add(() => scroller.removeEventListener("click", onClick));

  const render = () => {
    const { class: className, rows, periods, cells, high, label, showTotals, onCellClick, ...rest } = current;
    const grid = capacityGrid({ rows, periods, cells, high });
    const totals = showTotals !== false;
    const num = (n: number) => new Intl.NumberFormat(loc.locale, { maximumFractionDigits: 1 }).format(n);
    const pct = (n: number) => new Intl.NumberFormat(loc.locale, { style: "percent", maximumFractionDigits: 0 }).format(n);

    const headline = (c: CapacityCell) =>
      c.status === "no-capacity" ? loc.t("capacity.noCapacity") : c.status === "closed" ? "—" : pct(c.load as number);
    const sub = (c: CapacityCell) =>
      c.status === "no-capacity"
        ? loc.t("capacity.booked", { booked: num(c.booked) })
        : c.status === "closed"
          ? loc.t("capacity.closed")
          : loc.t("capacity.hours", { booked: num(c.booked), available: num(c.available) });
    const fill = (target: HTMLElement, c: CapacityCell) =>
      target.append(node("span", "zen-text-sm zen-font-semibold", headline(c)), node("span", "zen-text-xs", sub(c)));
    const staticCell = (c: CapacityCell, tdClass = "zen-p-0.5") => {
      const td = node("td", tdClass);
      td.dataset.status = c.status;
      const div = node("div", cellClass(c));
      fill(div, c);
      td.append(div);
      return td;
    };

    // Remember which cell had focus, to hand it back after the rebuild.
    const focused = document.activeElement ? clickable.get(document.activeElement)?.key : undefined;

    el.className = cn("zen-flex zen-w-full zen-flex-col zen-gap-2", className);
    overNote.textContent = loc.t("capacity.overCount", { count: grid.overCount });

    const table = node("table", "zen-w-full zen-border-collapse zen-text-sm");
    table.append(node("caption", "zen-sr-only", label ?? loc.t("capacity.label")));

    const thead = node("thead");
    const headRow = node("tr");
    const colHead = (text: string, cls: string) => {
      const th = node("th", cls, text);
      th.scope = "col";
      return th;
    };
    headRow.append(
      colHead(loc.t("capacity.resource"), "zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-muted-fg"),
      ...periods.map((p) => colHead(p.label ?? p.id, "zen-px-2 zen-py-1.5 zen-text-end zen-font-medium zen-text-zen-muted-fg")),
    );
    if (totals) {
      headRow.append(colHead(loc.t("capacity.total"), "zen-px-2 zen-py-1.5 zen-text-end zen-font-semibold zen-text-zen-foreground"));
    }
    thead.append(headRow);

    const tbody = node("tbody");
    let refocus: HTMLElement | undefined;
    for (const row of rows) {
      const tr = node("tr", "zen-border-0 zen-border-t zen-border-solid zen-border-zen-border");
      const th = node(
        "th",
        "zen-whitespace-nowrap zen-px-2 zen-py-1.5 zen-text-start zen-font-medium zen-text-zen-foreground",
        row.label ?? row.id,
      );
      th.scope = "row";
      tr.append(th);
      for (const p of periods) {
        const c = grid.cells[row.id][p.id];
        const td = node("td", "zen-p-0.5");
        td.dataset.status = c.status;
        const inner = onCellClick
          ? node(
              "button",
              cn(
                cellClass(c),
                "zen-m-0 zen-cursor-pointer zen-rounded-zen-sm zen-border-0 hover:zen-brightness-95 focus-visible:zen-outline-none focus-visible:zen-ring-2 focus-visible:zen-ring-zen-ring",
              ),
            )
          : node("div", cellClass(c));
        wash(inner, c);
        fill(inner, c);
        if (inner instanceof HTMLButtonElement) {
          inner.type = "button";
          const key = JSON.stringify([row.id, p.id]);
          inner.setAttribute(
            "aria-label",
            loc.t("capacity.cell", {
              row: row.label ?? row.id,
              period: p.label ?? p.id,
              value: [headline(c), sub(c)].join(", "),
            }),
          );
          clickable.set(inner, { key, fire: () => current.onCellClick?.(row.id, p.id, c) });
          if (key === focused) refocus = inner;
        }
        td.append(inner);
        tr.append(td);
      }
      if (totals) tr.append(staticCell(grid.rowTotals[row.id], "zen-p-0.5 zen-font-semibold"));
      tbody.append(tr);
    }
    table.append(thead, tbody);

    if (totals) {
      const tfoot = node("tfoot");
      const tr = node("tr", "zen-border-0 zen-border-t-2 zen-border-solid zen-border-zen-border");
      const th = node("th", "zen-px-2 zen-py-1.5 zen-text-start zen-font-semibold zen-text-zen-foreground", loc.t("capacity.total"));
      th.scope = "row";
      tr.append(th, ...periods.map((p) => staticCell(grid.periodTotals[p.id])), staticCell(grid.total));
      tfoot.append(tr);
      table.append(tfoot);
    }

    scroller.replaceChildren(table);
    el.replaceChildren(...(grid.overCount > 0 ? [overNote, scroller] : [scroller]));
    refocus?.focus();

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
