import { SpreadsheetGrid, SheetCalculator, type CellMap } from "./spreadsheet-grid/spreadsheet-grid";
import { DemoPage } from "./demo-helpers";

const INVOICE: CellMap = {
  A1: "Item",
  B1: "Qty",
  C1: "Unit",
  D1: "Total",
  A2: "Pallet racking",
  B2: 3,
  C2: 420,
  D2: "=B2*C2",
  A3: "Forklift hire",
  B3: 2,
  C3: 260,
  D3: "=B3*C3",
  A4: "Handling",
  B4: 1,
  C4: 315,
  D4: "=B4*C4",
  A6: "Subtotal",
  D6: "=SUM(D2:D4)",
  A7: "VAT 21%",
  D7: "=D6*0.21",
  A8: "Due",
  D8: "=D6+D7",
};

export default function SpreadsheetGridDemo(): HTMLElement {
  return DemoPage({
    title: "SpreadsheetGrid / SheetCalculator",
    description:
      "An editable grid of cells with formulas, for a financial or data-analytics assessment: the candidate types =SUM(B2:B9) and sees a number.",
    sections: [
      {
        title: "1. Cells and formulas",
        codeTitle: "A flat `{A1: value}` map",
        codeDescription:
          "Not a 2-D array: a sparse sheet is the normal case, the keys are the addresses users actually type, and it serialises to JSON without a shape conversion at both ends. Editing shows the FORMULA; the cell shows the RESULT — a grid that shows the result while you are editing it is one you cannot correct a formula in. Double-click, or press Enter or F2, or just start typing.",
        code: `SpreadsheetGrid({
  rows: 10, cols: 5,
  cells: { A1: "Qty", B1: 3, C1: "=B1*420" },
  onCellsChange: (next) => save(next),
}).el`,
        render: () => {
          let cells = { ...INVOICE };
          const grid = SpreadsheetGrid({
            rows: 9,
            cols: 5,
            cells,
            onCellsChange: (next) => {
              cells = next;
            },
          });
          return grid.el;
        },
      },
      {
        title: "2. A parser, not `eval`",
        codeTitle: "What it can work out, and what it says when it cannot",
        codeDescription:
          "The evaluator is a recursive-descent parser in core, because a formula is text a candidate types and running it as JavaScript hands them the page. It is small on purpose — arithmetic, references, ranges and eight functions — and honest about its limits: anything it cannot work out renders as #NAME? or #ERROR! rather than a plausible wrong number, which in an assessment is the difference between failing and being failed incorrectly.",
        code: `=SUM(A1:A9)  =AVERAGE(B:B)  =MIN  =MAX  =COUNT  =ROUND  =ABS  =IF
=A1*2+B1/4   =(A1+B1)*C1    // parentheses and precedence
=NOPE(A1)    -> #NAME?      // never a guess`,
        render: () =>
          SpreadsheetGrid({
            rows: 8,
            cols: 4,
            cells: {
              A1: 10,
              A2: 20,
              A3: 30,
              B1: "=SUM(A1:A3)",
              B2: "=AVERAGE(A1:A3)",
              B3: "=MAX(A1:A3)",
              C1: "=(A1+A2)*2",
              C2: "=ROUND(A2/3, 2)",
              C3: "=IF(A1>5, 1, 0)",
              D1: "=NOPE(A1)",
              D2: "=A1/0",
              D3: "=1+",
            },
          }).el,
      },
      {
        title: "3. The formula bar",
        codeTitle: "`SheetCalculator`",
        codeDescription:
          "The bar shows the RAW contents of the selected cell, which is the only place a formula is visible without entering edit mode. `summary` takes the right-hand slot for a total or a hint.",
        code: `SheetCalculator({ rows: 10, cols: 5, cells, summary: "Due 2,534.95" }).el`,
        render: () => {
          let cells = { ...INVOICE };
          const sheet = SheetCalculator({
            rows: 9,
            cols: 5,
            cells,
            summary: "€ figures are the D column",
            onCellsChange: (next) => {
              cells = next;
            },
          });
          return sheet.el;
        },
      },
      {
        title: "4. Formats",
        codeTitle: "`formats`, per cell or per column",
        codeDescription:
          "Keyed by address (D2) or by column letter (D), so a whole money column takes one entry. Numbers align right and text left — the alignment IS the type signal in a sheet, and it is what makes a number stored as text visible at a glance.",
        code: `SpreadsheetGrid({
  cells,
  formats: { D: { type: "currency", currency: "EUR", decimals: 2 } },
}).el`,
        render: () =>
          SpreadsheetGrid({
            rows: 6,
            cols: 4,
            cells: { A1: "Pallet racking", B1: 3, C1: 420, D1: "=B1*C1", A2: "Forklift", B2: 2, C2: 260, D2: "=B2*C2" },
            formats: {
              C: { type: "currency", currency: "EUR", decimals: 2 },
              D: { type: "currency", currency: "EUR", decimals: 2 },
            },
          }).el,
      },
      {
        title: "5. Read only",
        codeTitle: "`readOnly` keeps the navigation",
        codeDescription:
          "Arrows, Tab and selection still work — a read-only sheet is one you are meant to READ, and a grid you cannot move around is not that. Only the edit paths are closed.",
        code: `SpreadsheetGrid({ cells, readOnly: true }).el`,
        render: () => SpreadsheetGrid({ rows: 5, cols: 4, cells: INVOICE, readOnly: true }).el,
      },
    ],
  });
}
