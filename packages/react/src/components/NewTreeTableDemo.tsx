import * as React from "react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { TreeTable } from "./tree-table/tree-table";
import { CodeExample } from "./demo-helpers";

/**
 * A cost-centre rollup — the shape tree tables actually exist for. Each parent's
 * figures are the sum of its children, which is why the hierarchy has to stay on
 * screen: a number means nothing without the level it sits at.
 */
interface CostCentre {
  id: string;
  name: string;
  owner: string;
  headcount: number;
  budget: number;
  children?: CostCentre[];
}

const DATA: CostCentre[] = [
  {
    id: "eng",
    name: "Engineering",
    owner: "A. Okonkwo",
    headcount: 128,
    budget: 19_400_000,
    children: [
      {
        id: "eng-plat",
        name: "Platform",
        owner: "R. Iyer",
        headcount: 54,
        budget: 8_200_000,
        children: [
          { id: "eng-plat-infra", name: "Infrastructure", owner: "M. Sato", headcount: 22, budget: 3_600_000 },
          { id: "eng-plat-data", name: "Data services", owner: "L. Bergström", headcount: 18, budget: 2_900_000 },
          { id: "eng-plat-sec", name: "Security", owner: "K. Adeyemi", headcount: 14, budget: 1_700_000 },
        ],
      },
      {
        id: "eng-prod",
        name: "Product engineering",
        owner: "T. Nakamura",
        headcount: 61,
        budget: 9_100_000,
        children: [
          { id: "eng-prod-web", name: "Web", owner: "S. Haddad", headcount: 27, budget: 4_000_000 },
          { id: "eng-prod-mob", name: "Mobile", owner: "J. Moreau", headcount: 19, budget: 3_100_000 },
          { id: "eng-prod-int", name: "Integrations", owner: "P. Novák", headcount: 15, budget: 2_000_000 },
        ],
      },
      { id: "eng-qa", name: "Quality", owner: "D. Fernández", headcount: 13, budget: 2_100_000 },
    ],
  },
  {
    id: "gtm",
    name: "Go to market",
    owner: "C. Mwangi",
    headcount: 87,
    budget: 14_800_000,
    children: [
      {
        id: "gtm-sales",
        name: "Sales",
        owner: "E. Rossi",
        headcount: 52,
        budget: 9_600_000,
        children: [
          { id: "gtm-sales-emea", name: "EMEA", owner: "H. Lindqvist", headcount: 21, budget: 4_100_000 },
          { id: "gtm-sales-amer", name: "Americas", owner: "V. Castillo", headcount: 19, budget: 3_500_000 },
          { id: "gtm-sales-apac", name: "APAC", owner: "Y. Tan", headcount: 12, budget: 2_000_000 },
        ],
      },
      { id: "gtm-mkt", name: "Marketing", owner: "N. Abramov", headcount: 23, budget: 3_600_000 },
      { id: "gtm-cs", name: "Customer success", owner: "F. Diallo", headcount: 12, budget: 1_600_000 },
    ],
  },
  {
    id: "ops",
    name: "Operations",
    owner: "B. Sørensen",
    headcount: 34,
    budget: 5_200_000,
    children: [
      { id: "ops-fin", name: "Finance", owner: "G. Petrov", headcount: 14, budget: 2_400_000 },
      { id: "ops-ppl", name: "People", owner: "I. Kowalska", headcount: 12, budget: 1_700_000 },
      { id: "ops-leg", name: "Legal", owner: "O. Brennan", headcount: 8, budget: 1_100_000 },
    ],
  },
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

const COLUMNS: ColumnDef<CostCentre>[] = [
  { accessorKey: "name", header: "Cost centre" },
  { accessorKey: "owner", header: "Owner" },
  {
    accessorKey: "headcount",
    header: "Headcount",
    cell: (ctx) => <span className="zen-tabular-nums">{ctx.getValue<number>()}</span>,
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: (ctx) => <span className="zen-tabular-nums">{money(ctx.getValue<number>())}</span>,
  },
];

const DATA_SRC = `const data = [
  {
    id: "eng", name: "Engineering", owner: "A. Okonkwo",
    headcount: 128, budget: 19_400_000,
    children: [
      { id: "eng-plat", name: "Platform", /* … */ children: [ /* … */ ] },
      { id: "eng-qa",   name: "Quality",  /* … */ },   // no children -> a leaf
    ],
  },
];`;

const NewTreeTableDemo = () => {
  const [selection, setSelection] = React.useState<RowSelectionState>({});
  const selectedCount = Object.values(selection).filter(Boolean).length;

  return (
    <div className="demo-page">
      <h1>TreeTable</h1>
      <p className="lede">
        A table whose rows nest. The chevron sits <em>inside</em> the first
        column and indents with depth, so the hierarchy reads down one column
        rather than across a gutter. Built on TanStack Table, like{" "}
        <code>DataTable</code> — but a separate component, because hierarchy and
        grouping cannot share one table.
      </p>

      <section className="demo-section">
        <h2>1. Nested data, nothing else</h2>
        <CodeExample
          title="Children come from `row.children` by default"
          description="Pass the nested array as data and TreeTable finds the children itself — the default accessor reads row.children, which is what nested JSON usually calls it. Point getSubRows somewhere else if your shape differs. A row with no children array is a leaf and gets no chevron, which is why the accessor should return undefined rather than an empty array: [] reads as expandable-but-empty and renders a control that does nothing."
          code={`${DATA_SRC}

<TreeTable data={data} columns={columns} />

// a different shape:
<TreeTable data={data} columns={columns}
           getSubRows={(row) => row.departments} />`}
        >
          <TreeTable data={DATA} columns={COLUMNS} enableExpandAll={false} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>2. Expand all, and starting open</h2>
        <CodeExample
          title="`defaultExpanded` takes `true`"
          description="The expand-all control is on by default; pass enableExpandAll={false} to drop it, as section 1 does. To start with the tree already open, pass defaultExpanded — that is TanStack's own sentinel for every row, so you do not have to enumerate ids you have not generated yet. For a specific set, pass a record."
          code={`<TreeTable data={data} columns={columns} defaultExpanded />

// or an explicit set
<TreeTable data={data} columns={columns}
           defaultExpanded={{ eng: true, "eng.0": true }} />

// controlled
const [expanded, setExpanded] = useState<ExpandedState>({});
<TreeTable expanded={expanded} onExpandedChange={setExpanded} … />`}
        >
          <TreeTable data={DATA} columns={COLUMNS} defaultExpanded getRowId={(r) => r.id} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>3. Search keeps the path</h2>
        <CodeExample
          title="A match three levels down brings its ancestors with it"
          description="Filtering a tree the naive way is worse than not filtering it: APAC matches one row whose parents do not match, so a row-by-row filter drops Go to market and Sales and leaves an orphan with no context. TreeTable filters from the leaves up, so a surviving row always arrives with its full path. Type apac or security below and watch the ancestors stay."
          code={`<TreeTable
  data={data}
  columns={columns}
  enableGlobalFilter
  globalFilterPlaceholder="Search cost centres…"
/>`}
        >
          <TreeTable
            data={DATA}
            columns={COLUMNS}
            enableGlobalFilter
            globalFilterPlaceholder="Search cost centres…"
            defaultExpanded
            getRowId={(r) => r.id}
          />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>4. Selection cascades</h2>
        <CodeExample
          title="Tick a parent, get its subtree"
          description="Selecting a parent selects everything under it, and a parent with only some of its descendants ticked shows indeterminate rather than checked — the alternative is a checkbox that contradicts the row below it. Set enableSubRowSelection={false} if rows should be selectable strictly one at a time, which is right when the parent is a heading rather than a thing you can act on."
          code={`const [selection, setSelection] = useState<RowSelectionState>({});

<TreeTable
  data={data}
  columns={columns}
  getRowId={(row) => row.id}
  enableRowSelection
  rowSelection={selection}
  onRowSelectionChange={setSelection}
/>

// parents are headings, not targets:
<TreeTable enableRowSelection enableSubRowSelection={false} … />`}
        >
          <div className="zen-flex zen-flex-col zen-gap-2">
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">{selectedCount} selected</p>
            <TreeTable
              data={DATA}
              columns={COLUMNS}
              getRowId={(r) => r.id}
              enableRowSelection
              rowSelection={selection}
              onRowSelectionChange={setSelection}
              defaultExpanded
            />
          </div>
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>5. Sorting stays inside the family</h2>
        <CodeExample
          title="Siblings reorder; children never leave their parent"
          description="Sorting by budget sorts each parent's children among themselves — it does not flatten the tree into one ranked list. That is the only sort that can be true of a hierarchy: a child outranking its own parent would have to render somewhere it does not belong. Click Budget or Headcount and watch the levels hold while the order within each changes."
          code={`<TreeTable data={data} columns={columns} enableSorting />

// off entirely
<TreeTable data={data} columns={columns} enableSorting={false} />`}
        >
          <TreeTable data={DATA} columns={COLUMNS} defaultExpanded getRowId={(r) => r.id} />
        </CodeExample>
      </section>

      <section className="demo-section">
        <h2>6. Keyboard and screen readers</h2>
        <CodeExample
          title="It is a treegrid, not a table with chevrons"
          description="The table carries role=treegrid and every row carries aria-level, aria-expanded and its position among its SIBLINGS — not its position on the page, which is what a flat row model would report and would tell a screen-reader user nothing about the shape. Focus roves across rows with one tab stop: Up/Down move, forward-arrow opens a closed node then descends, back-arrow closes an open one then climbs to the parent, Home/End jump to the ends. The arrows are direction-aware, so in RTL the roles of Left and Right swap."
          code={`// nothing to configure — tab into the table and use the arrows.
// RTL is handled: forward/back follow the writing direction, not
// the physical keys.`}
        >
          <div className="zen-flex zen-flex-col zen-gap-2">
            <p className="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
              Tab into the table below, then use the arrow keys.
            </p>
            <TreeTable
              data={DATA}
              columns={COLUMNS}
              getRowId={(r) => r.id}
              headerVariant="underline"
              maxBodyHeight={280}
              stickyHeader
            />
          </div>
        </CodeExample>
      </section>
    </div>
  );
};

export default NewTreeTableDemo;
