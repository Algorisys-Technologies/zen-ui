import { Show, createSignal } from "solid-js";
import { PivotWorkbench, PivotGrid } from "./pivot";
import type { PivotLayout } from "@algorisys/zen-ui-core/pivot";
import { DemoPage, DemoSection } from "./demo-helpers";
import {
  PIVOT_FIELDS,
  cellSeed,
  dimensionValueAt,
  formatMeasure,
  loadMembers,
  memberCount,
} from "./pivot-demo-data";

const NewPivotDemo = () => {
  const [layout, setLayout] = createSignal<PivotLayout | null>(null);

  // The pivot computes nothing and stores nothing: it hands you a layout and
  // asks for cells by coordinate. Everything below is the CALLER's half of that
  // contract, which is the part worth showing.
  const totalRows = () => {
    const l = layout();
    if (!l || l.rows.length === 0) return 1;
    return l.rows.reduce((n, key) => n * memberCount(key), 1);
  };

  const totalCols = () => {
    const l = layout();
    if (!l) return 1;
    const dims = l.columns.reduce((n, key) => n * memberCount(key), 1);
    return dims * Math.max(1, l.values.length);
  };

  const getCell = (row: number, col: number) => {
    const l = layout();
    if (!l || l.values.length === 0) return { value: "" };
    const measure = l.values[col % l.values.length];
    return { value: formatMeasure(measure.id, cellSeed(row, col)) };
  };

  const getRowHeader = (row: number, depth: number) => {
    const l = layout();
    const fieldKey = l?.rows[depth];
    if (!l || !fieldKey) return null;
    return { value: dimensionValueAt(fieldKey, row, depth, l.rows) };
  };

  const getColHeader = (depth: number, col: number) => {
    const l = layout();
    if (!l) return null;
    if (depth < l.columns.length) {
      return {
        value: dimensionValueAt(l.columns[depth], col, depth, l.columns, Math.max(1, l.values.length)),
      };
    }
    // Below the column dimensions sits the measure row: one header per value
    // field, repeating under every column.
    const measure = l.values[col % Math.max(1, l.values.length)];
    if (!measure) return { value: "" };
    return { value: PIVOT_FIELDS.find((f) => f.key === measure.id)?.label ?? measure.id };
  };

  return (
    <DemoPage
      title="Pivot"
      description={
        <>
          A drag-and-drop builder for a pivot layout, and a grid that windows in
          two dimensions. The workbench computes nothing and holds no data: you
          drag fields into zones, it hands back a <code>PivotLayout</code>, and
          your code answers <code>getCell(row, col)</code>. That split is what
          lets the same component sit over 50 rows or 50 million.
        </>
      }
    >
      <DemoSection
        title="1. The workbench"
        codeTitle="Fields in, a layout out"
        codeDescription="Drag from Available Fields into Rows, Columns or Values, then press View Data. The grid is passed as children — the workbench renders it, but never talks to it. Every zone takes more than one field; nesting them is what makes it a pivot."
        code={`const [layout, setLayout] = createSignal<PivotLayout | null>(null);

<PivotWorkbench
  fields={PIVOT_FIELDS}
  loadMembers={loadMembers}          // the filter menus page their options in
  onLayoutApply={setLayout}          // fires on "View Data", not on every drag
  totalRows={totalRows()}
  totalCols={totalCols()}
>
  <Show when={layout()}>
    {(l) => <PivotGrid layout={l()} getCell={getCell} … />}
  </Show>
</PivotWorkbench>`}
      >
        <div class="zen-h-[800px] zen-w-full zen-flex zen-flex-col zen-gap-4">
          <PivotWorkbench
            fields={PIVOT_FIELDS}
            onLayoutApply={setLayout}
            loadMembers={loadMembers}
            totalRows={totalRows()}
            totalCols={totalCols()}
          >
            <Show
              when={layout()}
              fallback={
                <div class="zen-flex zen-h-full zen-items-center zen-justify-center zen-rounded-zen-md zen-border zen-border-dashed zen-border-zen-border zen-text-zen-muted-fg">
                  Drag a dimension into Rows and a measure into Values, then press
                  “View Data”.
                </div>
              }
            >
              {(l) => (
                <PivotGrid
                  layout={l()}
                  totalRows={totalRows()}
                  totalCols={totalCols()}
                  rowHeaderDepth={Math.max(1, l().rows.length)}
                  colHeaderDepth={Math.max(1, l().columns.length + (l().values.length > 0 ? 1 : 0))}
                  getCell={getCell}
                  getRowHeader={getRowHeader}
                  getColHeader={getColHeader}
                />
              )}
            </Show>
          </PivotWorkbench>
        </div>
      </DemoSection>

      <DemoSection
        title="2. The layout it hands back"
        codeTitle="Draft, and applied"
        codeDescription="Dragging edits a DRAFT the workbench keeps to itself; onLayoutApply fires only when View Data is pressed. That is the same split the List Report makes between the filter bar and the table, and for the same reason: re-querying a pivot on every drag is fine over 48 rows and hostile over 48 million. The value below only moves when you press the button."
        code={`// what onLayoutApply hands you:
{
  rows: ["country", "city"],        // field keys, outermost first
  columns: ["department"],
  values: [{ id: "salary", aggregation: "sum" }],
  filters: { … }
}`}
      >
        <div class="zen-flex zen-flex-col zen-gap-1 zen-text-xs">
          <Show
            when={layout()}
            fallback={<span class="zen-text-zen-muted-fg">Nothing applied yet — press “View Data”.</span>}
          >
            {(l) => (
              <>
                <div>
                  applied → <code>{JSON.stringify({ rows: l().rows, columns: l().columns, values: l().values })}</code>
                </div>
                <div class="zen-text-zen-muted-fg">
                  which asks for a grid of {totalRows().toLocaleString()} ×{" "}
                  {totalCols().toLocaleString()} ={" "}
                  {(totalRows() * totalCols()).toLocaleString()} cells — of which
                  the grid will ask you for the few dozen on screen.
                </div>
              </>
            )}
          </Show>
        </div>
      </DemoSection>

      <DemoSection
        title="3. Answering for the cells"
        codeTitle="getCell is a coordinate, not a row"
        codeDescription="The grid never sees your data. It works out which coordinates are visible and asks for those, so what you return can come from memory, a cache or a request in flight. totalRows/totalCols are the product of each field's member count — that is how a two-dimension pivot reaches millions of cells without anything holding them."
        code={`// the caller's half of the contract:
const getCell = (row, col) => {
  const measure = layout().values[col % layout().values.length];
  return { value: format(measure.id, lookup(row, col)) };
};

const getRowHeader = (row, depth) => ({ value: memberAt(layout().rows[depth], row, depth) });
const getColHeader = (depth, col) => ({ value: memberAt(layout().columns[depth], col, depth) });

// and the size of the thing you are claiming to have:
const totalRows = () => layout().rows.reduce((n, key) => n * memberCount(key), 1);`}
      >
        <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
          This demo answers from a hash of the coordinates rather than a table, so
          the numbers are stable but meaningless — nothing here aggregates, and{" "}
          <code>sum</code> and <code>avg</code> return the same figure. Swapping in
          a real backend means changing <code>getCell</code> and nothing else.
        </p>
      </DemoSection>
    </DemoPage>
  );
};

export default NewPivotDemo;
