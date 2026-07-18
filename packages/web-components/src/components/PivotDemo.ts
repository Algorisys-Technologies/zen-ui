import { DemoPage } from "./demo-helpers";
import {
  PIVOT_FIELDS,
  cellSeed,
  dimensionValueAt,
  formatMeasure,
  loadMembers,
  memberCount,
} from "./pivot-demo-data";

/**
 * Pivot demo — the web-components port. <zen-pivot-workbench> holds no data: you
 * drag fields into zones, it fires `zen-layout-apply` with a PivotLayout, and the
 * caller answers getCell(row, col) on the <zen-pivot-grid> it renders as its
 * child. The grid is created up front (empty until a layout arrives) and its
 * `layout` / size are pushed in on apply, so it never leaves the workbench slot.
 */

interface PivotLayout {
  rows: string[];
  columns: string[];
  values: { id: string; aggregation: string }[];
  filters?: unknown;
}

export default function PivotDemo(): HTMLElement {
  let layout: PivotLayout | null = null;

  const totalRows = (): number => {
    if (!layout || layout.rows.length === 0) return 1;
    return layout.rows.reduce((n, key) => n * memberCount(key), 1);
  };
  const totalCols = (): number => {
    if (!layout) return 1;
    const dims = layout.columns.reduce((n, key) => n * memberCount(key), 1);
    return dims * Math.max(1, layout.values.length);
  };

  const getCell = (row: number, col: number): { value: string } => {
    if (!layout || layout.values.length === 0) return { value: "" };
    const measure = layout.values[col % layout.values.length];
    return { value: formatMeasure(measure.id, cellSeed(row, col)) };
  };

  const getRowHeader = (row: number, depth: number): { value: string } | null => {
    const fieldKey = layout?.rows[depth];
    if (!layout || !fieldKey) return null;
    return { value: dimensionValueAt(fieldKey, row, depth, layout.rows) };
  };

  const getColHeader = (depth: number, col: number): { value: string } | null => {
    if (!layout) return null;
    if (depth < layout.columns.length) {
      return {
        value: dimensionValueAt(
          layout.columns[depth],
          col,
          depth,
          layout.columns,
          Math.max(1, layout.values.length),
        ),
      };
    }
    const measure = layout.values[col % Math.max(1, layout.values.length)];
    if (!measure) return { value: "" };
    return { value: PIVOT_FIELDS.find((f) => f.key === measure.id)?.label ?? measure.id };
  };

  /* section 2 — the applied layout, shown after View Data */
  const status = document.createElement("div");
  status.className = "zen-flex zen-flex-col zen-gap-1 zen-text-xs";
  const renderStatus = (): void => {
    status.replaceChildren();
    if (!layout) {
      const span = document.createElement("span");
      span.className = "zen-text-zen-muted-fg";
      span.textContent = "Nothing applied yet — press “View Data”.";
      status.append(span);
      return;
    }
    const applied = document.createElement("div");
    applied.append(document.createTextNode("applied → "));
    const code = document.createElement("code");
    code.textContent = JSON.stringify({
      rows: layout.rows,
      columns: layout.columns,
      values: layout.values,
    });
    applied.append(code);
    const detail = document.createElement("div");
    detail.className = "zen-text-zen-muted-fg";
    const cells = totalRows() * totalCols();
    detail.textContent = `which asks for a grid of ${totalRows().toLocaleString()} × ${totalCols().toLocaleString()} = ${cells.toLocaleString()} cells — of which the grid will ask you for the few dozen on screen.`;
    status.append(applied, detail);
  };
  renderStatus();

  /* the grid, created empty — its layout arrives on apply. It stays the
     workbench's child throughout, so pushing a layout in updates it in place. */
  const grid = document.createElement("zen-pivot-grid");
  const gset = grid as unknown as Record<string, unknown>;
  gset.getCell = getCell;
  gset.getRowHeader = getRowHeader;
  gset.getColHeader = getColHeader;

  /* section 1 — the workbench + its grid */
  const workbench = document.createElement("zen-pivot-workbench");
  const wset = workbench as unknown as Record<string, unknown>;
  wset.fields = PIVOT_FIELDS;
  wset.loadMembers = loadMembers;
  workbench.setAttribute("total-rows", String(totalRows()));
  workbench.setAttribute("total-cols", String(totalCols()));
  workbench.append(grid);
  workbench.style.flex = "1";
  workbench.style.minHeight = "0";
  workbench.style.display = "block";

  workbench.addEventListener("zen-layout-apply", (e) => {
    const next = (e as CustomEvent).detail as PivotLayout;
    layout = next;
    gset.layout = next;
    grid.setAttribute("total-rows", String(totalRows()));
    grid.setAttribute("total-cols", String(totalCols()));
    grid.setAttribute("row-header-depth", String(Math.max(1, next.rows.length)));
    grid.setAttribute(
      "col-header-depth",
      String(Math.max(1, next.columns.length + (next.values.length > 0 ? 1 : 0))),
    );
    workbench.setAttribute("total-rows", String(totalRows()));
    workbench.setAttribute("total-cols", String(totalCols()));
    renderStatus();
  });

  const workbenchWrap = document.createElement("div");
  workbenchWrap.className = "zen-flex zen-h-[800px] zen-w-full zen-flex-col zen-gap-4";
  workbenchWrap.append(workbench);

  const paragraph = (className: string, text: string): HTMLElement => {
    const p = document.createElement("p");
    p.className = className;
    p.textContent = text;
    return p;
  };

  return DemoPage({
    title: "Pivot",
    description:
      "A drag-and-drop builder for a pivot layout, and a grid that windows in two dimensions. The workbench computes nothing and holds no data: you drag fields into zones, it hands back a PivotLayout, and your code answers getCell(row, col). That split is what lets the same component sit over 50 rows or 50 million.",
    sections: [
      {
        title: "1. The workbench",
        codeTitle: "Fields in, a layout out",
        codeDescription:
          "Drag from Available Fields into Rows, Columns or Values, then press View Data. Or skip the drag entirely: every chip's ⋮ handle opens a menu of zones, which is the keyboard path. The grid is the workbench's child — the workbench renders it, but never talks to it.",
        code: `const grid = document.createElement("zen-pivot-grid");
grid.getCell = getCell;
grid.getRowHeader = getRowHeader;
grid.getColHeader = getColHeader;

const workbench = document.createElement("zen-pivot-workbench");
workbench.fields = PIVOT_FIELDS;
workbench.loadMembers = loadMembers;        // the filter menus page their options in
workbench.append(grid);                     // the grid is a child slot
workbench.addEventListener("zen-layout-apply", (e) => {   // fires on "View Data"
  grid.layout = e.detail;
  grid.setAttribute("total-rows", String(totalRows()));
  grid.setAttribute("total-cols", String(totalCols()));
});
container.append(workbench);`,
        render: () => workbenchWrap,
      },
      {
        title: "2. The layout it hands back",
        codeTitle: "Draft, and applied",
        codeDescription:
          "Dragging edits a DRAFT the workbench keeps to itself; zen-layout-apply fires only when View Data is pressed. That is the same split the List Report makes between the filter bar and the table, and for the same reason: re-querying a pivot on every drag is fine over 48 rows and hostile over 48 million. The value below only moves when you press the button.",
        code: `// what zen-layout-apply hands you (e.detail):
{
  rows: ["country", "city"],        // field keys, outermost first
  columns: ["department"],
  values: [{ id: "salary", aggregation: "sum" }],
  filters: { … }
}`,
        render: () => status,
      },
      {
        title: "3. Answering for the cells",
        codeTitle: "getCell is a coordinate, not a row",
        codeDescription:
          "The grid never sees your data. It works out which coordinates are visible and asks for those, so what you return can come from memory, a cache or a request in flight. totalRows/totalCols are the product of each field's member count — that is how a two-dimension pivot reaches millions of cells without anything holding them.",
        code: `// the caller's half of the contract:
grid.getCell = (row, col) => {
  const measure = layout.values[col % layout.values.length];
  return { value: format(measure.id, lookup(row, col)) };
};

grid.getRowHeader = (row, depth) => ({ value: memberAt(layout.rows[depth], row, depth) });
grid.getColHeader = (depth, col) => ({ value: memberAt(layout.columns[depth], col, depth) });

// and the size of the thing you are claiming to have:
const totalRows = () => layout.rows.reduce((n, key) => n * memberCount(key), 1);`,
        render: () =>
          paragraph(
            "zen-m-0 zen-text-sm zen-text-zen-muted-fg",
            "This demo answers from a hash of the coordinates rather than a table, so the numbers are stable but meaningless — nothing here aggregates, and sum and avg return the same figure. Swapping in a real backend means changing getCell and nothing else.",
          ),
      },
      {
        title: "4. The same component, three times",
        codeTitle: "React, Solid and web-components share the model, not the renderer",
        codeDescription:
          "React drags with @dnd-kit, Solid with @thisbeyond/solid-dnd, and the vanilla core with native HTML5 drag-and-drop — they share no drag code at all. Every rule about what a drop MEANS lives in @algorisys/zen-ui-core/pivot instead: which zone a field is in, what moving it does, what a screen reader is told. The window maths for the filter menus and the grid comes from @algorisys/zen-ui-core/virtual-window.",
        code: `import {
  moveFieldToZone, zoneOf, describeMove,
  type PivotLayout, type PivotMembersRequest,
} from "@algorisys/zen-ui-core/pivot";

// the same call, in every binding:
const next = moveFieldToZone(layout, "country", "rows", { index: 0 });`,
        render: () =>
          paragraph(
            "zen-m-0 zen-text-sm zen-text-zen-muted-fg",
            "The model is pinned by bun run check:pivot and the window maths by check:virtual-window — neither needs a browser, because neither is about rendering.",
          ),
      },
    ],
  });
}
