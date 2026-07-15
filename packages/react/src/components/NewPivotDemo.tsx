import { useState } from "react";
import { PivotWorkbench, PivotGrid } from "./pivot";
import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
import { CodeExample } from "./demo-helpers";
import {
  PIVOT_FIELDS,
  cellSeed,
  dimensionValueAt,
  formatMeasure,
  loadMembers,
  memberCount,
} from "./pivot-demo-data";

const NewPivotDemo: React.FC = () => {
  const [layout, setLayout] = useState<PivotLayout | null>(null);

  // The pivot computes nothing and stores nothing: it hands you a layout and
  // asks for cells by coordinate. Everything below is the CALLER's half of that
  // contract, which is the part worth showing.
  const totalRows = () => {
    if (!layout || layout.rows.length === 0) return 1;
    return layout.rows.reduce((n, key) => n * memberCount(key), 1);
  };
  const totalCols = () => {
    if (!layout) return 1;
    const dims = layout.columns.reduce((n, key) => n * memberCount(key), 1);
    return dims * Math.max(1, layout.values.length);
  };

  const getCell = (row: number, col: number) => {
    if (!layout || layout.values.length === 0) return { value: "" };
    const measure = layout.values[col % layout.values.length];
    return { value: formatMeasure(measure.id, cellSeed(row, col)) };
  };

  const getRowHeader = (row: number, depth: number) => {
    const fieldKey = layout?.rows[depth];
    if (!layout || !fieldKey) return null;
    return { value: dimensionValueAt(fieldKey, row, depth, layout.rows) };
  };

  const getColHeader = (depth: number, col: number) => {
    if (!layout) return null;
    if (depth < layout.columns.length) {
      return {
        value: dimensionValueAt(layout.columns[depth], col, depth, layout.columns, Math.max(1, layout.values.length)),
      };
    }
    // Below the column dimensions sits the measure row: one header per value
    // field, repeating under every column.
    const measure = layout.values[col % Math.max(1, layout.values.length)];
    if (!measure) return { value: "" };
    return { value: PIVOT_FIELDS.find((f) => f.key === measure.id)?.label ?? measure.id };
  };

  return (
    <div className="demo-page">
      <h1>Pivot</h1>
      <p className="lede">
        A drag-and-drop builder for a pivot layout, and a grid that windows in two
        dimensions. The workbench computes nothing and holds no data: you drag
        fields into zones, it hands back a <code>PivotLayout</code>, and your code
        answers <code>getCell(row, col)</code>. That split is what lets the same
        component sit over 50 rows or 50 million.
      </p>

      <section className="demo-section">
        <h2>1. The workbench</h2>
        <CodeExample
          title="Fields in, a layout out"
          description="Drag from Available Fields into Rows, Columns or Values, then press View Data. Or skip the drag entirely: every chip's ⋮ handle opens a menu of zones, which is the keyboard path. The grid is passed as children — the workbench renders it, but never talks to it."
          code={`const [layout, setLayout] = useState<PivotLayout | null>(null);

<PivotWorkbench
  fields={PIVOT_FIELDS}
  loadMembers={loadMembers}          // the filter menus page their options in
  onLayoutApply={setLayout}          // fires on "View Data", not on every drag
  totalRows={totalRows()}
  totalCols={totalCols()}
>
  {layout ? <PivotGrid layout={layout} getCell={getCell} … /> : null}
</PivotWorkbench>`}
        >
          <div className="zen-flex zen-h-[800px] zen-w-full zen-flex-col zen-gap-4">
            <PivotWorkbench
              fields={PIVOT_FIELDS}
              onLayoutApply={setLayout}
              loadMembers={loadMembers}
              totalRows={totalRows()}
              totalCols={totalCols()}
            >
              {layout ? (
                <PivotGrid
                  layout={layout}
                  totalRows={totalRows()}
                  totalCols={totalCols()}
                  rowHeaderDepth={Math.max(1, layout.rows.length)}
                  colHeaderDepth={Math.max(1, layout.columns.length + (layout.values.length > 0 ? 1 : 0))}
                  getCell={getCell}
                  getRowHeader={getRowHeader}
                  getColHeader={getColHeader}
                />
              ) : (
                <div className="zen-flex zen-h-full zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-text-zen-muted-fg">
                  Drag a dimension into Rows and a measure into Values, then press “View Data”.
                </div>
              )}
            </PivotWorkbench>
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. The layout it hands back</h2>
        <CodeExample
          title="Draft, and applied"
          description="Dragging edits a DRAFT the workbench keeps to itself; onLayoutApply fires only when View Data is pressed. That is the same split the List Report makes between the filter bar and the table, and for the same reason: re-querying a pivot on every drag is fine over 48 rows and hostile over 48 million. The value below only moves when you press the button."
          code={`// what onLayoutApply hands you:
{
  rows: ["country", "city"],        // field keys, outermost first
  columns: ["department"],
  values: [{ id: "salary", aggregation: "sum" }],
  filters: { … }
}`}
        >
          <div className="zen-flex zen-flex-col zen-gap-1 zen-text-xs">
            {layout ? (
              <>
                <div>
                  applied →{" "}
                  <code>{JSON.stringify({ rows: layout.rows, columns: layout.columns, values: layout.values })}</code>
                </div>
                <div className="zen-text-zen-muted-fg">
                  which asks for a grid of {totalRows().toLocaleString()} × {totalCols().toLocaleString()} ={" "}
                  {(totalRows() * totalCols()).toLocaleString()} cells — of which the grid will ask you for the few
                  dozen on screen.
                </div>
              </>
            ) : (
              <span className="zen-text-zen-muted-fg">Nothing applied yet — press “View Data”.</span>
            )}
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Answering for the cells</h2>
        <CodeExample
          title="getCell is a coordinate, not a row"
          description="The grid never sees your data. It works out which coordinates are visible and asks for those, so what you return can come from memory, a cache or a request in flight. totalRows/totalCols are the product of each field's member count — that is how a two-dimension pivot reaches millions of cells without anything holding them."
          code={`// the caller's half of the contract:
const getCell = (row, col) => {
  const measure = layout.values[col % layout.values.length];
  return { value: format(measure.id, lookup(row, col)) };
};

const getRowHeader = (row, depth) => ({ value: memberAt(layout.rows[depth], row, depth) });
const getColHeader = (depth, col) => ({ value: memberAt(layout.columns[depth], col, depth) });

// and the size of the thing you are claiming to have:
const totalRows = () => layout.rows.reduce((n, key) => n * memberCount(key), 1);`}
        >
          <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            This demo answers from a hash of the coordinates rather than a table, so the numbers are stable but
            meaningless — nothing here aggregates, and <code>sum</code> and <code>avg</code> return the same figure.
            Swapping in a real backend means changing <code>getCell</code> and nothing else.
          </p>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. The same component, twice</h2>
        <CodeExample
          title="React and Solid share the model, not the renderer"
          description="This binding drags with @dnd-kit and Solid's drags with @thisbeyond/solid-dnd — they share no drag code at all. Every rule about what a drop MEANS lives in @algorisys/zen-ui-core/pivot instead: which zone a field is in, what moving it does, what a screen reader is told. Both demos are then driven by one file, scripts/check-pivot-ui.mjs, so parity is measured rather than hoped for."
          code={`import {
  moveFieldToZone, zoneOf, describeMove,
  type PivotLayout, type PivotMembersRequest,
} from "@algorisys/zen-ui-core/pivot";

// the same call, in either binding:
const next = moveFieldToZone(layout, "country", "rows", { index: 0 });`}
        >
          <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            The model is pinned by <code>bun run check:pivot</code> (60 checks) and the window maths by{" "}
            <code>check:virtual-window</code> — neither needs a browser, because neither is about rendering.
          </p>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewPivotDemo;
