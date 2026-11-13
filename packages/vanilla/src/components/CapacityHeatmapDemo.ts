import { CapacityHeatmap } from "./capacity-heatmap/capacity-heatmap";
import { DemoPage } from "./demo-helpers";

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
  const heatmap = CapacityHeatmap({
    rows,
    periods,
    cells,
    onCellClick: (r, p, c) => {
      picked.textContent = "Drill-down: " + r + ", week " + p + ": " + c.booked + " of " + c.available + " h (" + c.status + ")";
    },
    "data-testid": "grid",
  });
  wrap.append(heatmap.el, picked);
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
        codeTitle: "rows, periods, cells; onCellClick for a drill-down",
        codeDescription:
          "Line B is over in weeks 47 and 48. Line C is shut in week 48 but still has 12 hours booked — the worst cell on the board, and the one a naive percentage would divide by zero or call free. The paint shop is closed in weeks 48 and 49 with nothing booked. Totals sum hours, then divide.",
        code: `CapacityHeatmap({
  rows: lines, periods: weeks,
  cells: [{ row: "B", period: "47", booked: 88, available: 80 }, …],
  onCellClick: (row, period) => openOrders(row, period),
}).el`,
        render: drillDown,
      },
    ],
  });
}
