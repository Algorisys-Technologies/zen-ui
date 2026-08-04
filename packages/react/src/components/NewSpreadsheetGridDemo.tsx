import { useState } from "react";
import { SpreadsheetGrid, SheetCalculator } from "./spreadsheet-grid/spreadsheet-grid";
import type { CellMap } from "./spreadsheet-grid/spreadsheet-grid";
import { CodeExample } from "./demo-helpers";

const BUDGET: CellMap = {
  A1: "Item",
  B1: "Qty",
  C1: "Unit",
  D1: "Total",
  A2: "Freight",
  B2: 3,
  C2: 420,
  D2: "=B2*C2",
  A3: "Handling",
  B3: 2,
  C3: 180,
  D3: "=B3*C3",
  A4: "Storage",
  B4: 5,
  C4: 95,
  D4: "=B4*C4",
  A6: "Subtotal",
  D6: "=SUM(D2:D4)",
  A7: "VAT",
  D7: "=D6*0.21",
  A8: "Due",
  D8: "=D6+D7",
};

const ERRORS: CellMap = {
  A1: "Circular",
  B1: "=B2",
  B2: "=B1",
  A2: "Div by zero",
  B3: "=1/0",
  A3: "Unknown fn",
  B4: "=NOPE(1)",
  A4: "Text in maths",
  B5: "label",
  B6: "=B5+1",
};

const NewSpreadsheetGridDemo: React.FC = () => {
  const [cells, setCells] = useState<CellMap>(BUDGET);
  const [last, setLast] = useState("—");

  return (
    <div className="demo-page">
      <h1>SpreadsheetGrid &amp; SheetCalculator</h1>
      <p className="lede">
        An editable grid with formulas, for a financial or data-analytics
        assessment. The evaluator is a recursive-descent parser in{" "}
        <code>@algorisys/zen-ui-core</code> — <strong>not</strong> <code>eval</code>,
        because a formula is text a candidate types and running it as JavaScript
        hands them the page.
      </p>

      <section className="demo-section">
        <h2>1. Type a formula</h2>
        <CodeExample
          title="Cells are a flat {A1: value} map"
          description="Not a 2-D array: a sparse sheet is the normal case, the keys are the addresses users actually type, and it serialises to JSON with no shape conversion at either end. Click a cell and type; Enter commits and moves down, Tab commits and moves right, Escape abandons the edit. Editing shows the formula, the cell shows the result — a grid that shows the result while you are editing is one you cannot correct a formula in."
          code={`const [cells, setCells] = useState({
  B2: 3, C2: 420,
  D2: "=B2*C2",
  D6: "=SUM(D2:D4)",
});

<SpreadsheetGrid rows={8} cols={4} cells={cells} onCellsChange={setCells} />`}
        >
          <SpreadsheetGrid
            rows={8}
            cols={4}
            cells={cells}
            onCellsChange={setCells}
            formats={{ C: { type: "currency", currency: "EUR" }, D: { type: "currency", currency: "EUR" } }}
            onCellCommit={(ref, raw, value) => setLast(`${ref} = ${String(raw)} → ${String(value)}`)}
          />
          <p style={{ marginTop: 8, fontSize: 12, color: "var(--zen-color-muted-fg)" }}>
            last commit: <code>{last}</code>
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. What it can evaluate</h2>
        <CodeExample
          title="Arithmetic, references, ranges, eight functions"
          description="SUM, AVERAGE, MIN, MAX, COUNT, ROUND, ABS, SQRT — with + - * / ^, parentheses, and A1 references including ranges. It is deliberately small and it is not Excel. Aggregates skip text: a column label sitting inside a range is not an error, it is simply not a number, and erroring on it would make every SUM over a headed column fail."
          code={`=B2*C2          references and arithmetic
=SUM(D2:D4)     a range
=SUM(A1:A3,B1)  ranges and arguments mixed
=ROUND(D6*0.21, 2)
=AVERAGE(B2:B4) skips any text in the range`}
        >
          <SpreadsheetGrid rows={4} cols={4} cells={{ A1: 10, A2: 20, A3: "label", B1: "=SUM(A1:A3)", B2: "=AVERAGE(A1:A3)", B3: "=COUNT(A1:A3)" }} readOnly />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Errors are visible, not plausible</h2>
        <CodeExample
          title="The point of the whole component"
          description="Anything the evaluator cannot work out renders as an error value, never as a number that looks right. In an assessment that is the difference between a candidate failing and a candidate being failed incorrectly. A circular reference in particular is not a wrong answer — left unguarded it is a stack overflow that takes the page down, so it is detected and reported as #CIRCULAR!."
          code={`B1: "=B2", B2: "=B1"  →  #CIRCULAR!
"=1/0"                →  #DIV/0!
"=NOPE(1)"            →  #NAME?
"=label+1"            →  #VALUE!   (never NaN)
"=1+"                 →  #ERROR!`}
        >
          <SpreadsheetGrid rows={6} cols={2} cells={ERRORS} readOnly />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Formats</h2>
        <CodeExample
          title="Per column or per cell"
          description="Currency, percent, or fixed decimals, keyed by address or by column letter. An empty cell formats as empty rather than 0 — a grid of zeros where data has not arrived is indistinguishable from a grid of real zeros. Numbers align right and text left, because in a sheet the alignment IS the type signal."
          code={`<SpreadsheetGrid
  formats={{
    C: { type: "currency", currency: "EUR" },
    D2: { type: "percent", decimals: 1 },
  }}
/>`}
        >
          <SpreadsheetGrid
            rows={3}
            cols={3}
            cells={{ A1: 1234.5, B1: 0.256, C1: 1234.5, A2: "text", B2: 0.5 }}
            formats={{ A: { type: "number", decimals: 2 }, B: { type: "percent", decimals: 1 }, C: { type: "currency", currency: "EUR", locale: "en-IE" } }}
            readOnly
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. SheetCalculator</h2>
        <CodeExample
          title="The grid with a formula bar"
          description="The bar shows the RAW contents of the selected cell, which is the only place a formula is visible without entering edit mode."
          code={`<SheetCalculator cells={cells} onCellsChange={setCells} summary="8 rows" />`}
        >
          <SheetCalculator rows={6} cols={4} cells={cells} onCellsChange={setCells} summary="Q3 freight" />
        </CodeExample>
      </section>
    </div>
  );
};

export default NewSpreadsheetGridDemo;
