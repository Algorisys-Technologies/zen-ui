import { CapacityHeatmap, type CapacityHeatmapProps } from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-capacity-heatmap rows='[…]' periods='[…]' cells='[…]'>
 *
 * Data-driven: no slot. `rows`, `periods` and `cells` are json attributes for
 * a board written in HTML and JS properties for anything real. A period is an
 * id and a label, not a date, so unlike <zen-gantt> nothing here needs
 * reviving — the caller decides what a period is and how it reads.
 *
 * `showTotals` is a PROPERTY rather than an attribute: it defaults to TRUE, and
 * an absent boolean attribute coerces to `false` (see lib/define.ts), which
 * would take the totals off every board that did not opt back in.
 *
 * `zen-cell-click` (detail: [row, period, cell]) is the drill-down. The cells
 * become buttons only while something listens for it, as the factory makes
 * them buttons only when `onCellClick` is given — a cell that looks pressable
 * and does nothing is a dead control.
 */
defineZenElement<CapacityHeatmapProps>({
  tag: "zen-capacity-heatmap",
  factory: CapacityHeatmap,
  attrs: {
    rows: "json",
    periods: "json",
    cells: "json",
    high: "number",
    label: "string",
  },
  props: ["rows", "periods", "cells", "showTotals"],
  events: { onCellClick: "zen-cell-click" },
  childrenProp: false,
});
