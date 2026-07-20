import { TreeTable, type TreeTableColumn } from "./tree-table/tree-table";
import { DemoPage } from "./demo-helpers";

/**
 * TreeTableDemo — mirrors the React and Solid TreeTable demos section for
 * section. The engine differs (no TanStack in this binding) but every claim the
 * other demos make is made and shown here too.
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
    id: "eng", name: "Engineering", owner: "A. Okonkwo", headcount: 128, budget: 19_400_000,
    children: [
      {
        id: "eng-plat", name: "Platform", owner: "R. Iyer", headcount: 54, budget: 8_200_000,
        children: [
          { id: "eng-plat-infra", name: "Infrastructure", owner: "M. Sato", headcount: 22, budget: 3_600_000 },
          { id: "eng-plat-data", name: "Data services", owner: "L. Bergström", headcount: 18, budget: 2_900_000 },
          { id: "eng-plat-sec", name: "Security", owner: "K. Adeyemi", headcount: 14, budget: 1_700_000 },
        ],
      },
      {
        id: "eng-prod", name: "Product engineering", owner: "T. Nakamura", headcount: 61, budget: 9_100_000,
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
    id: "gtm", name: "Go to market", owner: "C. Mwangi", headcount: 87, budget: 14_800_000,
    children: [
      {
        id: "gtm-sales", name: "Sales", owner: "E. Rossi", headcount: 52, budget: 9_600_000,
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
    id: "ops", name: "Operations", owner: "B. Sørensen", headcount: 34, budget: 5_200_000,
    children: [
      { id: "ops-fin", name: "Finance", owner: "G. Petrov", headcount: 14, budget: 2_400_000 },
      { id: "ops-ppl", name: "People", owner: "I. Kowalska", headcount: 12, budget: 1_700_000 },
      { id: "ops-leg", name: "Legal", owner: "O. Brennan", headcount: 8, budget: 1_100_000 },
    ],
  },
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const COLUMNS: TreeTableColumn<CostCentre>[] = [
  { accessorKey: "name", header: "Cost centre" },
  { accessorKey: "owner", header: "Owner" },
  { accessorKey: "headcount", header: "Headcount" },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ value }) => {
      const span = document.createElement("span");
      span.className = "zen-tabular-nums";
      span.textContent = money(value as number);
      return span;
    },
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

export default function TreeTableDemo(): HTMLElement {
  const count = document.createElement("p");
  count.className = "zen-m-0 zen-text-sm zen-text-zen-muted-fg";
  count.textContent = "0 selected";

  return DemoPage({
    title: "TreeTable",
    description:
      "A table whose rows nest. The chevron sits inside the first column and indents with depth, so the hierarchy reads down one column rather than across a gutter. Hand-written here — this binding has no table library — but the same API and the same behaviour as the React and Solid bindings.",
    sections: [
      {
        title: "1. Nested data, nothing else",
        codeTitle: "Children come from `row.children` by default",
        codeDescription:
          "Pass the nested array as data and TreeTable finds the children itself — the default accessor reads row.children, which is what nested JSON usually calls it. Point getSubRows somewhere else if your shape differs. A row with no children array is a leaf and gets no chevron.",
        code: `${DATA_SRC}

const table = TreeTable({ data, columns });
document.body.append(table.el);

// a different shape:
TreeTable({ data, columns, getSubRows: (row) => row.departments });`,
        render: () => TreeTable({ data: DATA, columns: COLUMNS, enableExpandAll: false }).el,
      },
      {
        title: "2. Expand all, and starting open",
        codeTitle: "`defaultExpanded` takes `true`",
        codeDescription:
          "The expand-all control is on by default; pass enableExpandAll: false to drop it, as section 1 does. Pass defaultExpanded: true to start with everything open, or an array of ids for a specific set. onExpandedChange reports the open ids after every change.",
        code: `TreeTable({ data, columns, defaultExpanded: true });

// or an explicit set
TreeTable({ data, columns, defaultExpanded: ["eng", "eng-plat"] });

TreeTable({ data, columns, onExpandedChange: (ids) => console.log(ids) });`,
        render: () => TreeTable({ data: DATA, columns: COLUMNS, defaultExpanded: true }).el,
      },
      {
        title: "3. Search keeps the path",
        codeTitle: "A match three levels down brings its ancestors with it",
        codeDescription:
          "Filtering a tree the naive way is worse than not filtering it: APAC matches one row whose parents do not match, so a row-by-row filter drops Go to market and Sales and leaves an orphan with no context. TreeTable filters from the leaves up, so a surviving row always arrives with its full path. Type apac or security and watch the ancestors stay.",
        code: `TreeTable({
  data,
  columns,
  enableGlobalFilter: true,
  globalFilterPlaceholder: "Search cost centres…",
});`,
        render: () =>
          TreeTable({
            data: DATA,
            columns: COLUMNS,
            enableGlobalFilter: true,
            globalFilterPlaceholder: "Search cost centres…",
            defaultExpanded: true,
          }).el,
      },
      {
        title: "4. Selection cascades",
        codeTitle: "Tick a parent, get its subtree",
        codeDescription:
          "Selecting a parent selects everything under it, and a parent with only some of its descendants ticked shows indeterminate rather than checked — the alternative is a checkbox that contradicts the row below it. Set enableSubRowSelection: false if rows should be selectable strictly one at a time.",
        code: `TreeTable({
  data,
  columns,
  enableRowSelection: true,
  onRowSelectionChange: (ids) => console.log(ids.length, "selected"),
});

// parents are headings, not targets:
TreeTable({ data, columns, enableRowSelection: true, enableSubRowSelection: false });`,
        render: () => {
          const wrap = document.createElement("div");
          wrap.className = "zen-flex zen-flex-col zen-gap-2";
          wrap.append(
            count,
            TreeTable({
              data: DATA,
              columns: COLUMNS,
              enableRowSelection: true,
              defaultExpanded: true,
              onRowSelectionChange: (ids) => {
                count.textContent = `${ids.length} selected`;
              },
            }).el,
          );
          return wrap;
        },
      },
      {
        title: "5. Sorting stays inside the family",
        codeTitle: "Siblings reorder; children never leave their parent",
        codeDescription:
          "Sorting by budget sorts each parent's children among themselves — it does not flatten the tree into one ranked list. That is the only sort that can be true of a hierarchy: a child outranking its own parent would have to render somewhere it does not belong. Click Budget or Headcount and watch the levels hold.",
        code: `TreeTable({ data, columns, enableSorting: true });`,
        render: () =>
          TreeTable({ data: DATA, columns: COLUMNS, enableSorting: true, defaultExpanded: true }).el,
      },
      {
        title: "6. Children fetched on first expand",
        codeTitle: "`loadChildren` + `hasChildren`",
        codeDescription: "For trees too big or too remote to send whole. hasChildren is what makes a row openable before it has any children — without it a not-yet-loaded node is indistinguishable from a leaf, gets no chevron, and can never be opened to trigger the load. The chevron becomes a spinner while the fetch is in flight and the control carries aria-busy. Results are cached against the row id, so re-collapsing and re-expanding does not re-fetch.",
        code: `TreeTable({
  data: roots,
  columns,
  getRowId: (row) => row.id,
  hasChildren: (row) => row.childCount > 0,
  loadChildren: (row) => fetch(\`/api/nodes/\${row.id}/children\`).then((r) => r.json()),
  onLoadChildrenError: (err) => console.error(err),
});`,
        render: () =>
          TreeTable({
            data: LAZY_ROOTS,
            columns: COLUMNS,
            getRowId: (r) => r.id,
            hasChildren: () => true,
            loadChildren: fetchChildren,
          }).el,
      },
      {
        title: "7. Virtualization — for a tree you expand all of",
        codeTitle: "`enableVirtualization` needs `maxBodyHeight`",
        codeDescription: "Only visible rows are ever in the DOM, so a large tree sitting collapsed costs nothing and needs none of this. The case that hurts is expanding all of a big one: measured, ~22,600 open rows put 162,000 nodes on the page and took about a second to mount. Turn this on and only the rows near the viewport render. It needs maxBodyHeight — without a bounded scroller there is no window, and it warns rather than silently doing nothing. There is no virtualizer library in this binding, so the window maths is uniform-height: one real row is measured, then the rest is derived.",
        code: `TreeTable({
  data: bigTree,
  columns,
  enableVirtualization: true,
  maxBodyHeight: 360,
  rowEstimatedHeight: 44,
});`,
        render: () =>
          TreeTable({
            data: BIG,
            columns: COLUMNS,
            defaultExpanded: true,
            enableVirtualization: true,
            maxBodyHeight: 360,
          }).el,
      },
      {
        title: "8. Keyboard and screen readers",
        codeTitle: "It is a treegrid, not a table with chevrons",
        codeDescription:
          "The table carries role=treegrid and every row carries aria-level, aria-expanded and its position among its SIBLINGS — not its position on the page, which would tell a screen-reader user nothing about the shape. Focus roves across rows with one tab stop: Up/Down move, forward-arrow opens a closed node then descends, back-arrow closes an open one then climbs to the parent, Home/End jump to the ends. The arrows are direction-aware, so in RTL the roles of Left and Right swap.",
        code: `// nothing to configure — tab into the table and use the arrows.
// RTL is handled: forward/back follow the writing direction, not
// the physical keys.`,
        render: () =>
          TreeTable({
            data: DATA,
            columns: COLUMNS,
            headerVariant: "underline",
            maxBodyHeight: 280,
            stickyHeader: true,
          }).el,
      },
    ],
  });
}
