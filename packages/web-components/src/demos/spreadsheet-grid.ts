import { DemoPage } from "./demo-helpers";

const tagged = (testid: string, child: Node, opts: { maxWidth?: string; dir?: string; vars?: Record<string, string> } = {}): HTMLElement => {
  const box = document.createElement("div");
  box.className = "zen-w-full";
  box.setAttribute("data-testid", testid);
  if (opts.maxWidth) box.style.maxWidth = opts.maxWidth;
  if (opts.dir) box.dir = opts.dir;
  for (const [k, v] of Object.entries(opts.vars ?? {})) box.style.setProperty(k, v);
  box.append(child);
  return box;
};

const INVOICE = {
  A1: "Item", B1: "Qty", C1: "Unit", D1: "Total",
  A2: "Pallet racking", B2: 3, C2: 420, D2: "=B2*C2",
  A3: "Forklift hire", B3: 2, C3: 260, D3: "=B3*C3",
  A4: "Handling", B4: 1, C4: 315, D4: "=B4*C4",
  A6: "Subtotal", D6: "=SUM(D2:D4)",
  A7: "VAT 21%", D7: "=D6*0.21",
  A8: "Due", D8: "=D6+D7",
};

function grid(tag: string, attrs: Record<string, string>): HTMLElement {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

export default function SpreadsheetGridDemo(): HTMLElement {
  return DemoPage({
    title: "SpreadsheetGrid / SheetCalculator",
    description:
      "An editable grid of cells with formulas, for a financial or data-analytics assessment: the candidate types =SUM(B2:B9) and sees a number.",
    sections: [
      {
        title: "1. A whole sheet from markup",
        codeTitle: "`cells` is a flat {A1: value} json attribute",
        codeDescription:
          "Not a 2-D array: a sparse sheet is the normal case, the keys are the addresses users actually type, and it serialises to JSON without a shape conversion at both ends — which is what lets this element be seeded entirely from HTML, unlike most of the data-driven ones here where a value is a Node. Editing shows the FORMULA; the cell shows the RESULT.",
        code: `<zen-spreadsheet-grid rows="9" cols="5"
  cells='{"A1":"Item","B1":"Qty","D2":"=B2*C2","D6":"=SUM(D2:D4)"}'>
</zen-spreadsheet-grid>`,
        render: () =>
          grid("zen-spreadsheet-grid", { rows: "9", cols: "5", cells: JSON.stringify(INVOICE) }),
      },
      {
        title: "2. A parser, not `eval`",
        codeTitle: "What it can work out, and what it says when it cannot",
        codeDescription:
          "The evaluator is a recursive-descent parser in core, because a formula is text a candidate types and running it as JavaScript hands them the page. It is small on purpose — arithmetic, references, ranges and eight functions — and honest about its limits: anything it cannot work out renders as #NAME? or #ERROR! rather than a plausible wrong number, which in an assessment is the difference between failing and being failed incorrectly.",
        code: `=SUM(A1:A9)  =AVERAGE(B:B)  =MIN  =MAX  =COUNT  =ROUND  =ABS  =IF
=A1*2+B1/4   =(A1+B1)*C1    <!-- parentheses and precedence -->
=NOPE(A1)    -> #NAME?      <!-- never a guess -->`,
        render: () =>
          grid("zen-spreadsheet-grid", {
            rows: "8",
            cols: "4",
            cells: JSON.stringify({
              A1: 10, A2: 20, A3: 30,
              B1: "=SUM(A1:A3)", B2: "=AVERAGE(A1:A3)", B3: "=MAX(A1:A3)",
              C1: "=(A1+A2)*2", C2: "=ROUND(A2/3, 2)", C3: "=IF(A1>5, 1, 0)",
              D1: "=NOPE(A1)", D2: "=A1/0", D3: "=1+",
            }),
          }),
      },
      {
        title: "3. The formula bar",
        codeTitle: "`<zen-sheet-calculator>`",
        codeDescription:
          "The bar shows the RAW contents of the selected cell, which is the only place a formula is visible without entering edit mode. `summary` takes the right-hand slot for a total or a hint.",
        code: `<zen-sheet-calculator rows="9" cols="5" cells='{…}' summary="Due 2,534.95">
</zen-sheet-calculator>`,
        render: () =>
          grid("zen-sheet-calculator", {
            rows: "9",
            cols: "5",
            cells: JSON.stringify(INVOICE),
            summary: "€ figures are the D column",
          }),
      },
      {
        title: "4. Formats",
        codeTitle: "`formats`, per cell or per column",
        codeDescription:
          "Keyed by address (D2) or by column letter (D), so a whole money column takes one entry. Numbers align right and text left — the alignment IS the type signal in a sheet, and it is what makes a number stored as text visible at a glance.",
        code: `<zen-spreadsheet-grid
  cells='{…}'
  formats='{"D":{"type":"currency","currency":"EUR","decimals":2}}'>
</zen-spreadsheet-grid>`,
        render: () =>
          grid("zen-spreadsheet-grid", {
            rows: "6",
            cols: "4",
            cells: JSON.stringify({
              A1: "Pallet racking", B1: 3, C1: 420, D1: "=B1*C1",
              A2: "Forklift", B2: 2, C2: 260, D2: "=B2*C2",
            }),
            formats: JSON.stringify({
              C: { type: "currency", currency: "EUR", decimals: 2 },
              D: { type: "currency", currency: "EUR", decimals: 2 },
            }),
          }),
      },
      {
        title: "5. Read only, and reading the changes back",
        codeTitle: "`read-only`, and `zen-cells-change`",
        codeDescription:
          "read-only keeps the navigation: arrows, Tab and selection still work, because a read-only sheet is one you are meant to READ and a grid you cannot move around is not that. Only the edit paths are closed. Every commit fires zen-cells-change with the whole new map, and zen-cell-commit with the one address and its evaluated value.",
        code: `<zen-spreadsheet-grid read-only cells='{…}'></zen-spreadsheet-grid>

el.addEventListener("zen-cells-change", (e) => save(e.detail));`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.style.cssText = "display:flex;flex-direction:column;gap:8px;width:100%";
          const said = document.createElement("p");
          said.style.cssText = "margin:0;font-size:13px;color:var(--zen-color-muted-fg)";
          said.textContent = "zen-cell-commit: nothing yet — type into the editable grid above";

          wrap.append(
            grid("zen-spreadsheet-grid", { rows: "5", cols: "4", cells: JSON.stringify(INVOICE), "read-only": "" }),
            said,
          );
          return wrap;
        },
      },
      {
        title: "6. Styling cells",
        codeTitle: "cellClassName",
        codeDescription:
          "Classes for one cell, from its address and its evaluated value: here a negative result in red and bold, and the input column shaded so it reads as the place to type. A function, so it is set as a property.",
        code: `sheet.cellClassName = (ref, v) => [
  typeof v === "number" && v < 0 && "zen-text-zen-error zen-font-semibold",
  ref.startsWith("B") && "zen-bg-zen-primary-soft",
].filter(Boolean).join(" ");`,
        render: () => {
          const sheet = grid("zen-spreadsheet-grid", {
            rows: "4",
            cols: "3",
            "read-only": "",
            cells: JSON.stringify({ A1: "Opening", B1: 120, A2: "Spent", B2: 180, A3: "Balance", B3: "=B1-B2", C3: "=B3*2" }),
          });
          (sheet as unknown as Record<string, unknown>).cellClassName = (ref: string, v: unknown) =>
            [typeof v === "number" && v < 0 && "zen-text-zen-error zen-font-semibold", ref.startsWith("B") && "zen-bg-zen-primary-soft"]
              .filter(Boolean)
              .join(" ");
          return tagged("sheet-styled", sheet);
        },
      },
      {
        title: "7. Density",
        codeTitle: 'density: "compact" | "comfortable" | "touch"',
        codeDescription:
          "compact: 20px cells, more of the sheet on screen. touch: 48px cells to tap into. Opt-in, per component: it does not follow data-density, so a page that already sets that sees nothing move here. comfortable is the default and is the size it always was.",
        code: `<zen-spreadsheet-grid density="compact"></zen-spreadsheet-grid>
<zen-spreadsheet-grid density="touch"></zen-spreadsheet-grid>`,
        render: () => {
          const box = document.createElement("div");
          box.className = "zen-flex zen-flex-wrap zen-gap-6";
          box.append(tagged("sheet-compact", grid("zen-spreadsheet-grid", { rows: "3", cols: "3", "read-only": "", density: "compact", cells: JSON.stringify({ A1: "Qty", B1: 4, A2: "Rate", B2: 12.5, A3: "Total", B3: "=B1*B2" }) })), tagged("sheet-touch", grid("zen-spreadsheet-grid", { rows: "3", cols: "3", "read-only": "", density: "touch", cells: JSON.stringify({ A1: "Qty", B1: 4, A2: "Rate", B2: 12.5, A3: "Total", B3: "=B1*B2" }) })));
          return box;
        },
      },
    ],
  });
}
