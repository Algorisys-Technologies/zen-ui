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
        title: "6. Keyboard and screen readers",
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
