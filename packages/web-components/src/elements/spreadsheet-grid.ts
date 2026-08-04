import {
  SpreadsheetGrid,
  SheetCalculator,
  type SpreadsheetGridProps,
  type SheetCalculatorProps,
} from "@algorisys/zen-ui-vanilla";
import { defineZenElement } from "../lib/define";

/**
 * <zen-spreadsheet-grid rows="10" cols="5" cells='{"A1":10,"B1":"=A1*2"}'>
 * <zen-sheet-calculator … >   — the same grid with a formula bar
 *
 * `cells` is json AND a property: a flat {A1: value} map is exactly what JSON
 * expresses well, so a sheet really can be seeded from markup. Values are
 * numbers, strings, or formula strings — no Nodes involved, unlike most of the
 * data-driven elements here.
 *
 * No slot: the grid is its cells.
 */
const shared = {
  attrs: {
    rows: "number",
    cols: "number",
    cells: "json",
    formats: "json",
    "read-only": "boolean",
    "col-width": "string",
  },
  props: ["cells", "formats", "onCellsChange", "onCellCommit"],
  events: { onCellsChange: "zen-cells-change", onCellCommit: "zen-cell-commit" },
  childrenProp: false as const,
} satisfies Partial<Parameters<typeof defineZenElement<SpreadsheetGridProps>>[0]>;

defineZenElement<SpreadsheetGridProps>({
  tag: "zen-spreadsheet-grid",
  factory: SpreadsheetGrid,
  ...shared,
});

defineZenElement<SheetCalculatorProps>({
  tag: "zen-sheet-calculator",
  factory: SheetCalculator,
  ...shared,
  attrs: { ...shared.attrs, summary: "string" },
  props: [...shared.props, "summary"],
});
