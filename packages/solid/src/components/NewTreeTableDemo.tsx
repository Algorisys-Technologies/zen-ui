import { createSignal } from "solid-js";
import type { ColumnDef, RowSelectionState } from "@tanstack/solid-table";
import { TreeTable } from "./tree-table/tree-table";
import { DemoPage, DemoSection } from "./demo-helpers";

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
    cell: (ctx) => <span class="zen-tabular-nums">{ctx.getValue<number>()}</span>,
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: (ctx) => <span class="zen-tabular-nums">{money(ctx.getValue<number>())}</span>,
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

/** A deliberately large tree, for the virtualization section only. */
const BIG: CostCentre[] = Array.from({ length: 40 }, (_, a) => ({
  id: `d-${a}`,
  name: `Division ${a + 1}`,
  owner: "A. Owner",
  headcount: 100 + a,
  budget: 5_000_000 + a * 37_000,
  children: Array.from({ length: 30 }, (_, b) => ({
    id: `d-${a}-t-${b}`,
    name: `Team ${a + 1}.${b + 1}`,
    owner: "B. Owner",
    headcount: 10 + b,
    budget: 200_000 + b * 1_100,
  })),
}));

/** Roots only — the children arrive from `loadChildren` on first expand. */
const LAZY_ROOTS: CostCentre[] = [
  { id: "lz-eng", name: "Engineering", owner: "A. Okonkwo", headcount: 128, budget: 19_400_000 },
  { id: "lz-gtm", name: "Go to market", owner: "C. Mwangi", headcount: 87, budget: 14_800_000 },
  { id: "lz-ops", name: "Operations", owner: "B. Sørensen", headcount: 34, budget: 5_200_000 },
];

/** Stands in for a network call. */
const fetchChildren = (row: CostCentre): Promise<CostCentre[]> =>
  new Promise((resolve) =>
    setTimeout(
      () =>
        resolve(
          Array.from({ length: 4 }, (_, i) => ({
            id: `${row.id}-c${i}`,
            name: `${row.name} team ${i + 1}`,
            owner: "Loaded on demand",
            headcount: 8 + i * 3,
            budget: 400_000 + i * 90_000,
          })),
        ),
      700,
    ),
  );

const NewTreeTableDemo = () => {
  const [selection, setSelection] = createSignal<RowSelectionState>({});
  const selectedCount = () => Object.values(selection()).filter(Boolean).length;

  return (
    <DemoPage
      title="TreeTable"
      description={
        <>
          A table whose rows nest. The chevron sits <em>inside</em> the first
          column and indents with depth, so the hierarchy reads down one column
          rather than across a gutter. Built on TanStack Table, like{" "}
          <code>DataTable</code> — but a separate component, because hierarchy
          and grouping cannot share one table.
        </>
      }
    >
      <DemoSection
        title="1. Nested data, nothing else"
        codeTitle="Children come from `row.children` by default"
        codeDescription="Pass the nested array as `data` and TreeTable finds the children itself — the default accessor reads `row.children`, which is what nested JSON usually calls it. Point `getSubRows` somewhere else if your shape differs. A row with no children array is a leaf and gets no chevron, which is why the accessor should return undefined rather than an empty array: `[]` reads as expandable-but-empty and renders a control that does nothing."
        code={`${DATA_SRC}

<TreeTable data={data} columns={columns} />

// a different shape:
<TreeTable data={data} columns={columns}
           getSubRows={(row) => row.departments} />`}
      >
        <TreeTable data={DATA} columns={COLUMNS} enableExpandAll={false} />
      </DemoSection>

      <DemoSection
        title="2. Expand all, and starting open"
        codeTitle="`defaultExpanded` takes `true`"
        codeDescription="The expand-all control is on by default; pass enableExpandAll={false} to drop it, as section 1 does. To start with the tree already open, pass defaultExpanded={true} — that is TanStack's own sentinel for 'every row', so you do not have to enumerate ids you have not generated yet. For a specific set, pass a record: { eng: true, 'eng-plat': true }."
        code={`<TreeTable data={data} columns={columns} defaultExpanded />

// or an explicit set
<TreeTable data={data} columns={columns}
           defaultExpanded={{ eng: true, "eng.0": true }} />

// controlled
const [expanded, setExpanded] = createSignal<ExpandedState>({});
<TreeTable expanded={expanded()} onExpandedChange={setExpanded} … />`}
      >
        <TreeTable data={DATA} columns={COLUMNS} defaultExpanded getRowId={(r) => r.id} />
      </DemoSection>

      <DemoSection
        title="3. Search keeps the path"
        codeTitle="A match three levels down brings its ancestors with it"
        codeDescription="Filtering a tree the naive way is worse than not filtering it: 'APAC' matches one row whose parents do not match, so a row-by-row filter drops Go to market and Sales and leaves an orphan with no context. TreeTable filters from the leaves up, so a surviving row always arrives with its full path. Type 'apac' or 'security' below and watch the ancestors stay."
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
      </DemoSection>

      <DemoSection
        title="4. Selection cascades"
        codeTitle="Tick a parent, get its subtree"
        codeDescription="Selecting a parent selects everything under it, and a parent with only some of its descendants ticked shows indeterminate rather than unchecked — the alternative is a checkbox that contradicts the row below it. Set enableSubRowSelection={false} if rows should be selectable strictly one at a time, which is right when the parent is a heading rather than a thing you can act on."
        code={`const [selection, setSelection] = createSignal<RowSelectionState>({});

<TreeTable
  data={data}
  columns={columns}
  getRowId={(row) => row.id}
  enableRowSelection
  rowSelection={selection()}
  onRowSelectionChange={setSelection}
/>

// parents are headings, not targets:
<TreeTable enableRowSelection enableSubRowSelection={false} … />`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
            {selectedCount()} selected
          </p>
          <TreeTable
            data={DATA}
            columns={COLUMNS}
            getRowId={(r) => r.id}
            enableRowSelection
            rowSelection={selection()}
            onRowSelectionChange={setSelection}
            defaultExpanded
          />
        </div>
      </DemoSection>

      <DemoSection
        title="5. Sorting stays inside the family"
        codeTitle="Siblings reorder; children never leave their parent"
        codeDescription="Sorting by budget sorts each parent's children among themselves — it does not flatten the tree into one ranked list. That is the only sort that can be true of a hierarchy: a child outranking its own parent would have to render somewhere it does not belong. Click Budget or Headcount and watch the levels hold while the order within each changes."
        code={`<TreeTable data={data} columns={columns} enableSorting />

// off entirely
<TreeTable data={data} columns={columns} enableSorting={false} />`}
      >
        <TreeTable data={DATA} columns={COLUMNS} defaultExpanded getRowId={(r) => r.id} />
      </DemoSection>

      <DemoSection
        title="6. Children fetched on first expand"
        codeTitle="`loadChildren` + `hasChildren`"
        codeDescription="For trees too big or too remote to send whole. `hasChildren` is what makes a row openable before it has any children — without it a not-yet-loaded node is indistinguishable from a leaf, gets no chevron, and can never be opened to trigger the load. The chevron becomes a spinner while the fetch is in flight and the row carries aria-busy. Results are cached against the row id, so re-collapsing and re-expanding does not re-fetch; it needs `getRowId` (or an `id` on the row) because an index-path key moves the moment anything above it is sorted or filtered."
        code={`<TreeTable
  data={roots}
  columns={columns}
  getRowId={(row) => row.id}
  hasChildren={(row) => row.childCount > 0}
  loadChildren={(row) => fetch(\`/api/nodes/\${row.id}/children\`).then((r) => r.json())}
  onLoadChildrenError={(err) => toast.error(String(err))}
/>`}
      >
        <TreeTable
          data={LAZY_ROOTS}
          columns={COLUMNS}
          getRowId={(r) => r.id}
          hasChildren={() => true}
          loadChildren={fetchChildren}
        />
      </DemoSection>

      <DemoSection
        title="7. Pagination pages the ROOTS"
        codeTitle="`enablePagination` — `pageSize` counts top-level rows"
        codeDescription="A page carries each root's whole subtree, so pageSize counts roots and a page's rendered row count varies with what is open. That is the only coherent way to page a tree: paging the flattened list cuts through a subtree and strands its children on the next page under no parent at all. Expand a row below and watch the row count change while the page still says the same number of top-level rows."
        code={`<TreeTable
  data={data}
  columns={columns}
  enablePagination
  pageSize={2}
  pageSizeOptions={[2, 5, 10]}
/>`}
      >
        <TreeTable
          data={DATA}
          columns={COLUMNS}
          getRowId={(r) => r.id}
          enablePagination
          pageSize={2}
          pageSizeOptions={[2, 5, 10]}
        />
      </DemoSection>

      <DemoSection
        title="8. Virtualization — for a tree you expand all of"
        codeTitle="`enableVirtualization` needs `maxBodyHeight`"
        codeDescription="Only visible rows are ever in the DOM, so a large tree sitting collapsed costs nothing and needs none of this. The case that hurts is expanding all of a big one: measured, ~22,600 open rows put 162,000 nodes on the page and took about a second to mount. Turn this on and only the rows near the viewport render. It needs maxBodyHeight — without a bounded scroller there is no window, and it warns rather than silently doing nothing. Row heights are estimated then measured, so rowEstimatedHeight only affects the scrollbar before you reach a row."
        code={`<TreeTable
  data={bigTree}
  columns={columns}
  enableVirtualization
  maxBodyHeight={360}
  rowEstimatedHeight={44}
/>`}
      >
        <TreeTable
          data={BIG}
          columns={COLUMNS}
          getRowId={(r) => r.id}
          defaultExpanded
          enableVirtualization
          maxBodyHeight={360}
        />
      </DemoSection>

      <DemoSection
        title="9. Keyboard and screen readers"
        codeTitle="It is a treegrid, not a table with chevrons"
        codeDescription="The table carries role=treegrid and every row carries aria-level, aria-expanded and its position among its SIBLINGS — not its position on the page, which is what a flat row model would report and would tell a screen-reader user nothing about the shape. Focus roves across rows with one tab stop: Up/Down move, forward-arrow opens a closed node then descends, back-arrow closes an open one then climbs to the parent, Home/End jump to the ends. The arrows are direction-aware, so in RTL the roles of Left and Right swap."
        code={`// nothing to configure — tab into the table and use the arrows.
// RTL is handled: forward/back follow the writing direction, not
// the physical keys.`}
      >
        <div class="zen-flex zen-flex-col zen-gap-2">
          <p class="zen-m-0 zen-text-sm zen-text-zen-muted-fg">
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
      </DemoSection>
    </DemoPage>
  );
};

export default NewTreeTableDemo;
