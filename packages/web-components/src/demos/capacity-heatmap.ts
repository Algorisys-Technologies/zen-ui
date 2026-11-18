import type { CapacityCell } from "@algorisys/zen-ui-vanilla";
import { DemoPage } from "./demo-helpers";

/**
 * CapacityHeatmap — the web-components port, section for section with the
 * vanilla demo. The board is a <zen-capacity-heatmap> with its data set as
 * properties; the drill-down is a `zen-cell-click` listener, which is also what
 * turns the cells into buttons.
 */

const rows = [
  { id: "A", label: "Line A" },
  { id: "B", label: "Line B" },
  { id: "C", label: "Line C" },
  { id: "D", label: "Paint shop" },
];
const periods = ["46", "47", "48", "49", "50"].map((w) => ({ id: w, label: "Week " + w }));
// [line][week] booked hours; capacity 80 h a week, except Line C shut in week 48.
const booked: Record<string, number[]> = { A: [62, 71, 78, 80, 40], B: [55, 88, 94, 70, 30], C: [40, 52, 12, 60, 64], D: [20, 24, 0, 0, 10] };
const cells = rows.flatMap((r) =>
  periods.map((p, i) => ({
    row: r.id,
    period: p.id,
    booked: booked[r.id][i],
    available: r.id === "C" && p.id === "48" ? 0 : r.id === "D" && i >= 2 && i <= 3 ? 0 : 80,
  })),
);

function drillDown(): Node {
  const wrap = document.createElement("div");
  wrap.className = "zen-flex zen-w-full zen-flex-col zen-gap-2";
  const picked = document.createElement("p");
  picked.className = "zen-m-0 zen-text-sm";
  picked.dataset.testid = "picked";
  picked.textContent = "Drill-down: —";
  const heatmap = document.createElement("zen-capacity-heatmap") as HTMLElement & Record<string, unknown>;
  heatmap.dataset.testid = "grid";
  Object.assign(heatmap, { rows, periods, cells });
  heatmap.addEventListener("zen-cell-click", (e) => {
    const [r, p, c] = (e as CustomEvent<[string, string, CapacityCell]>).detail;
    picked.textContent = "Drill-down: " + r + ", week " + p + ": " + c.booked + " of " + c.available + " h (" + c.status + ")";
  });
  wrap.append(heatmap, picked);
  return wrap;
}

export default function CapacityHeatmapDemo(): HTMLElement {
  return DemoPage({
    title: "CapacityHeatmap",
    description:
      "Booked hours against available hours, resource by period. Every cell prints its load and hours; the colour repeats them. Over capacity, and work booked where there is no capacity at all, are drawn as alarms.",
    sections: [
      {
        title: "1. Four lines, five weeks",
        codeTitle: "rows, periods, cells; zen-cell-click for a drill-down",
        codeDescription:
          "Line B is over in weeks 47 and 48. Line C is shut in week 48 but still has 12 hours booked — the worst cell on the board, and the one a naive percentage would divide by zero or call free. The paint shop is closed in weeks 48 and 49 with nothing booked. Totals sum hours, then divide.",
        code: `<zen-capacity-heatmap id="load"></zen-capacity-heatmap>
<script>
  const board = document.getElementById("load");
  board.rows = lines;
  board.periods = weeks;
  board.cells = [{ row: "B", period: "47", booked: 88, available: 80 }, …];
  board.addEventListener("zen-cell-click", (e) => {
    const [row, period] = e.detail;
    openOrders(row, period);
  });
</script>`,
        render: drillDown,
      },
    ],
  });
}
